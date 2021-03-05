import { AudioConst } from "../../../const/AudioConst";
import { HorseRaceConst } from "../../../const/HorseRaceConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_AudioManager, G_SignalManager } from "../../../init";
import { HeroSpineNode } from "../../../ui/node/HeroSpineNode";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import AvatarState from "../../../utils/state/AvatarState";
import AvatarStateMachine from "../../../utils/state/AvatarStateMachine";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HorseRaceAvatar extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _nodeSpine: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelBox: cc.Node = null;

    private _spineHero: HeroSpineNode;
    private _stateStart;
    private _stateRun;
    private _stateJump;
    private _stateJump2;
    private _stateGameOver;
    private _stateStartAction;
    private _stateWin;
    private _stateMachine;

    private _listenerJump;
    private _listenerStart;
    private _listenerStartAction;

    private _position: cc.Vec2;
    private _framePositionX;
    private _runSoundTime;
    private _speedY;
    private _gForce;
    private _startGame;
    private _endGame;
    private _sendMsg;
    private _win;
    private _waitTime;
    private _timeDispatchX;
    private _distance;
    private _getPoint;
    private _nowFloorY;
    private _speedX;
    private _positionLastX;

    private gravity = -2800
    private jumpSpeed = 750
    private speed = 700
    private boxSize = cc.size(40, 200)
    private gameOverTime = 0.5        //失败后延时出结算
    private gameWinTime = 1           //胜利吼延时出结算

    public init()
    {
        this._position = cc.v2(0, 0);
        this._startGame = false;
        this._endGame = false;
        this._win = false;
        this._speedY = 0;
        this._speedX = this.speed;
        this._gForce = this.gravity;
        this._nowFloorY = 0;
        this._getPoint = 0;
        this._timeDispatchX = 0;
        this._waitTime = 0;
        this._sendMsg = false;
        this._distance = 0;
        this._framePositionX = 0;
        this._positionLastX = 0;
        this._runSoundTime = 0;
    }

    onCreate() {
        this._createStates();
        this._spineHero = HeroSpineNode.create();
        this._nodeSpine.addChild(this._spineHero.node);
        var resJson = Path.getSpine('8001');
        this._spineHero.setAsset(resJson);
        this._spineHero.setAnimation('run', true);
        this.resizeBox();
        this._stateMachine = new AvatarStateMachine(this._stateStart, handler(this, this._stateChanged));
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_RUN);
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_JUMP);
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_DIE);
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_WIN);
    }

    public onEnter() {
        this._listenerJump = G_SignalManager.add(SignalConst.EVENT_HORSE_JUMP, handler(this, this._onEventJump));
        this._listenerStart = G_SignalManager.add(SignalConst.EVENT_HORSE_RACE_START, handler(this, this._onEventStart));
        this._listenerStartAction = G_SignalManager.add(SignalConst.EVENT_HORSE_START_ACTION, handler(this, this._onEventStartAction));
    }

    public onExit() {
        this._listenerJump.remove();
        this._listenerJump = null;
        this._listenerStart.remove();
        this._listenerStart = null;
        this._listenerStartAction.remove();
        this._listenerStartAction = null;
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_RUN);
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_JUMP);
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_DIE);
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_WIN);
    }

    private _createStates() {
        this._stateStart = new AvatarState('stateStart');
        this._stateStart.setDidEnter(handler(this, this._didEnterStart));
        this._stateRun = new AvatarState('stateRun');
        this._stateRun.setDidEnter(handler(this, this._didEnterRun));
        this._stateJump = new AvatarState('stateJump');
        this._stateJump.setDidEnter(handler(this, this._didEnterJump));
        this._stateJump2 = new AvatarState('stateJump2');
        this._stateJump2.setDidEnter(handler(this, this._didEnterJump2));
        this._stateGameOver = new AvatarState('stateGameOver');
        this._stateGameOver.setDidEnter(handler(this, this._didEnterGameOver));
        this._stateStartAction = new AvatarState('stateStartAction');
        this._stateStartAction.setDidEnter(handler(this, this._didEnterStartAction));
        this._stateWin = new AvatarState('stateWin');
        this._stateWin.setDidEnter(handler(this, this._didEnterWin));
    }

    public setStartPos(position) {
        this._position = position;
        this._framePositionX = position.x;
        this.node.setPosition(position);
    }

    private _stateChanged(curState, nextState) {
    }

    private _didEnterStart() {
        this._spineHero.setAnimation('idle', true);
    }

    private _didEnterRun() {
        this._runSoundTime = 1;
        this._spineHero.setAnimation('run', true);
    }

    private _didEnterJump() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_JUMP);
        this._spineHero.setAnimation('jump', true);
        this._speedY = this.jumpSpeed;
        this._position.y = this._position.y + 1;
    }

    private _didEnterJump2() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_JUMP);
        this._spineHero.setAnimation('jump2', true);
        this._speedY = this.jumpSpeed;
    }

    private _didEnterGameOver() {
        this._spineHero.setAnimation('hit');
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_DIE);
    }

    private _didEnterStartAction() {
        this._spineHero.setAnimation('start');
    }

    private _didEnterWin() {
        this._spineHero.setAnimation('win', true);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_WIN);
    }

    public updateAvatar(f, blocks) {
        this._gForce = this.gravity * f;
        this._stateMachine.update(f);
        if (this._startGame && !this._endGame) {
            this._moveAhead(f);
            var block = this._getBlockAround(blocks);
            this._updateBlockAround(block);
            this._updatePosY(f);
            this.updateDispatch(f);
        }
        if (this._endGame && !this._sendMsg) {
            var time = this.gameOverTime;
            if (this._win) {
                time = this.gameWinTime;
            }
            if (this._waitTime >= time) {
                G_SignalManager.dispatch(SignalConst.EVENT_HORSE_GAME_OVER, this._distance, this._getPoint);
                this._sendMsg = true;
            }
            this._waitTime = this._waitTime + f;
        }
        if (this._stateMachine.getCurState() == this._stateRun) {
            if (this._runSoundTime + f > 0.5) {
                G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_RUN);
                this._runSoundTime = 0;
            }
            this._runSoundTime = this._runSoundTime + f;
        }
        this._updateFrame(f);
    }

    public updateDispatch(f) {
        this._timeDispatchX = this._timeDispatchX + f;
        if (this._timeDispatchX >= 0.5) {
            G_SignalManager.dispatch(SignalConst.EVENT_HORSE_MOVE_X, this._distance);
        }
    }

    public resizeBox() {
        this._panelBox.setContentSize(this.boxSize);
    }

    public updateForce(f) {
    }

    private _judgeBlock(block): any[] {
        var box = {
            x: this._position.x - 2 * this.boxSize.width,
            // x: this._position.x - this.boxSize.width / 2,
            y: this._position.y,
            width: this.boxSize.width,
            height: this.boxSize.height
        };
        var blockBox = {
            x: block.mapPos.x,
            y: block.mapPos.y,
            width: block.width,
            height: block.height
        };
        if (box.x > blockBox.x + blockBox.width) {
            return [false, null];
        } else if (box.x + box.width < blockBox.x) {
            return [false, null];
        } else if (box.y > blockBox.y + blockBox.height) {
            return [false, null];
        } else if (box.y + box.height < blockBox.y) {
            return [false, null];
        }
        return [
            true,
            block
        ];
    }

    private _getBlockAround(blocks) {
        this._nowFloorY = 0;
        var aroundBlocks = [];
        var posX = this._position.x;
        for (let i in blocks) {
            var v = blocks[i];
            if (v.mapPos.x > posX - 1500 && v.mapPos.x < posX + 100) {
                var block = v;
                aroundBlocks.push(block);
                if (block.type == HorseRaceConst.BLOCK_TYPE_MAP && this._position.x >= block.mapPos.x && this._position.x <= block.mapPos.x + block.width) {
                    this._nowFloorY = block.mapPos.y + block.height;
                }
            }
        }
        return aroundBlocks;
    }

    private _moveAhead(f) {
        this._speedX = this.speed * f;
        this._position.x = this._position.x + this._speedX;
        this._distance = this._distance + this._speedX;
        this._positionLastX = this._position.x;
    }

    private _updateFrame(f) {
        if (this._framePositionX != this._position.x) {
            this._framePositionX = this._positionLastX + (this._position.x - this._positionLastX) * f;
            this.node.x = (this._framePositionX);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HORSE_RACE_POSX, this._framePositionX);
    }

    private _updateBlockAround(blocks) {
        for (let i in blocks) {
            var v = blocks[i];
            var [isTouch, block] = this._judgeBlock(v);
            if (isTouch) {
                this._updateTouchBlock(block);
            }
        }
    }

    private _updateTouchBlock(block) {
        if (block.type == HorseRaceConst.BLOCK_TYPE_MAP) {
            if (this._position.y >= block.mapPos.y + block.height - 1) {
                this._gForce = 0;
                this._speedY = 0;
                this._position.y = block.mapPos.y + block.height;
                if (this._stateMachine.getCurState() == this._stateJump || this._stateMachine.getCurState() == this._stateJump2) {
                    this._stateMachine.changeState(this._stateRun);
                }
                if (this._win) {
                    this._speedX = 0;
                    this._endGame = true;
                    this._stateMachine.changeState(this._stateWin);
                }
            } else {
                this._gameOver();
            }
        } else if (block.type == HorseRaceConst.BLOCK_TYPE_OBSTRUCTION) {
            this._gameOver();
        } else if (block.type == HorseRaceConst.BLOCK_TYPE_REWARD) {
            this._getReward(block);
        } else if (block.type == HorseRaceConst.BLOCK_TYPE_FINAL) {
            this._checkWin();
        }
    }

    private _gameOver() {
        this._speedX = 0;
        this._endGame = true;
        this._stateMachine.changeState(this._stateGameOver);
    }

    private _getReward(block) {
        if (!block.isGet) {
            this._getPoint = this._getPoint + block.point;
            G_SignalManager.dispatch(SignalConst.EVENT_HORSE_GET_POINT, this._getPoint, block);
            block.isGet = true;
        }
    }

    private _updatePosY(f) {
        var distance = this._speedY * f;
        var nextY = this._position.y + distance;
        if (this._position.y > this._nowFloorY && nextY < this._nowFloorY) {
            this._position.y = this._nowFloorY;
        } else {
            this._position.y = nextY;
        }
        this.node.y = (this._position.y);
        this._speedY = this._speedY + this._gForce;
        if (this._position.y < 40) {
            this._gameOver();
        }
    }

    private _onEventJump() {
        if (this._stateMachine.getCurState() == this._stateJump) {
            this._stateMachine.changeState(this._stateJump2);
        } else if (this._stateMachine.getCurState() == this._stateRun) {
            this._stateMachine.changeState(this._stateJump);
        }
    }

    private _onEventStart() {
        this._startGame = true;
        this._stateMachine.changeState(this._stateRun);
    }

    private _onEventStartAction() {
        this._stateMachine.changeState(this._stateStartAction);
    }

    private _checkWin() {
        this._win = true;
    }
}