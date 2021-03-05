const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import ViewBase from '../../ViewBase';
import { GuildAnswerConst } from '../../../const/GuildAnswerConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { GuildServerAnswerHelper } from './GuildServerAnswerHelper';
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import CommonUI from '../../../ui/component/CommonUI';
import { G_ConfigLoader, G_UserData } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SpineNode } from '../../../ui/node/SpineNode';

@ccclass
export default class GuildServerAnswerAvatar extends ViewBase {

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _guildName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFace: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _buffEffectNode: cc.Node = null;
    _isFirst: boolean;
    _user_id: any;
    //玩家的答案
    _side: any;
    _state: any;
    _canMove: any;
    _queuePos: any = [];

    public static readonly SPEED = 600;
    public static readonly FLY_SPEED = 800;
    public static readonly FLY_HEIGHT = 500;
    public static readonly TYPE_MOVE = 1;
    public static readonly TYPE_SET = 2;
    _actionName: any;
    _startPlayFly: any;
    _targetRotate: number;
    _bezierPos1: cc.Vec2;
    _bezierPos2: cc.Vec2;
    _bezierPos3: cc.Vec2;
    _bezierTime: number;
    _wudiTimes:number;
    _isInWudiBuff:boolean;
    _curBezierTime: number;
    _flyActionMoveEndCallBack: any;
    _recoveryFlag: number;

    onCreate() {
        this._imageFace.node.active = (false);
        this._wudiTimes = 0;
        this._isInWudiBuff = false;
    }
    updateAvatar(data, point, state) {
        if (!data) {
            return;
        }
        console.log("updateAvatar: 人物名称：" + this._heroName.string);
        if (this.node.active) {
            if (state == GuildAnswerConst.ANSWER_STATE_PLAYING || state == GuildAnswerConst.ANSWER_STATE_RESTING) {
                this.moveTo(cc.v2(point.x, point.y), null);
            } else {
                this.setPosTo(cc.v2(point.x, point.y));
            }
            this._updateBaseData(data);
        } else {
            this.node.active = (true);
            this._updateBaseData(data);
            this._reborn(data, state, point);
        }
        this.node.zIndex = (500 - point.y);
        this._updateState(state, point);
        this._isFirst = false;
        this._wudiTimes = data.getSecurity_times();
        this._showBuffEffect(this._wudiTimes > 0);
    }
    getWudiTimes() {
        return this._wudiTimes;
    }
    subWudiTimes() {
        this._wudiTimes = this._wudiTimes - 1;
        var list = G_UserData.getGuildServerAnswer().getGuildServerAnswerPlayerDatas();
        for (let k in list) {
            var v = list[k];
            if (v.getUser_id() == this._user_id) {
                v.setSecurity_times(this._wudiTimes);
                break;
            }
        }
        this._showBuffEffect(this._wudiTimes > 0);
    }
    private _buffEffect:SpineNode;
    _showBuffEffect(isShow) {
        if (isShow == false) {
            if (this._buffEffect) {
                this._buffEffect.node.active = (false);
            }
            return;
        }
        if (this._buffEffect == null) {
            
            var buffEffectName = G_ConfigLoader.getConfig(ConfigNameConst.TREE_BUFF).get(4).avatar_effect;
            new cc.Node().addComponent(SpineNode);
            this._buffEffect = SpineNode.create(0.5);
            this._buffEffectNode.addChild(this._buffEffect.node);
            this._buffEffect.setAsset(Path.getFightEffectSpine(buffEffectName));
            this._buffEffect.setAnimation('effect');
            this._buffEffect.setScale(1.5);
        }
        this._buffEffect.node.active = (isShow);
    }
    _reborn(data, state, point) {
        this._updateUI(data);
        if (state == GuildAnswerConst.ANSWER_STATE_PLAYING && !this._isFirst) {
            this._readyEnterScene(point, 0.5);
        } else {
            this.setPosTo(cc.v2(point.x, point.y));
        }
    }
    //更新玩家的答案
    _updateBaseData(data) {
        this._user_id = data.getUser_id();
        this._side = data.getSide();
    }
    //获取玩家的答案
    getSide() {
        console.log("玩家答案----",this._side);
        return this._side;
    }
    _updateState(state, point) {
        if (this._state == state) {
            return;
        }
        this._state = state;
        if (state == GuildAnswerConst.ANSWER_STATE_READY) {
            this._readyEnterScene(point);
        } else {
            this._setAction();
        }
    }
    _setAction() {
        if (!this._canMove) {
            return;
        }
        if (this._state == GuildAnswerConst.ANSWER_STATE_PLAYING || this._state == GuildAnswerConst.ANSWER_STATE_RESTING) {
            this.didEnterAction('run');
        } else {
            this.didEnterAction('idle');
        }
    }
    _readyEnterScene(point, appFate?) {
        var appFateEx = appFate || 0;
        this.setPosTo(cc.v2(point.x - 1000, point.y));
        this.moveTo(cc.v2(point.x, point.y), this.getRandomFate() + appFateEx);
    }
    getRandomFate() {
        var fate = Math.floor(Math.random() * (70 - 30)) + 30;;
        return fate / 100;
    }
    _updateUI(data) {
        var serverData = {
            ['base_id']: data.getBase_id(),
            ['avatar_base_id']: data.getAvatar_base_id()
        };
        var [_, avatarData] = UserDataHelper.convertAvatarId(serverData);
        this._commonHeroAvatar.updateAvatar(avatarData, null, null, function () {
            this._setAction();
        }.bind(this));
        this._updateName(data);
    }
    _updateName(data) {
        var [color, colorOutline] = GuildServerAnswerHelper.getNameColor(data);
        this._guildName.string = (data.getGuild_name());
        this._heroName.string = (data.getName());
        this._guildName.node.color = (color);
        this._heroName.node.color = (color);
        UIHelper.enableOutline(this._guildName, colorOutline, 1);
        UIHelper.enableOutline(this._heroName, colorOutline, 1);
    }
    setPosTo(pos) {
        var info = this._queuePos[this._queuePos.length - 1];
        if (info && info.type == GuildServerAnswerAvatar.TYPE_SET) {
            info.pos = pos;
        } else {
            var moveInfo: any = {};
            moveInfo.pos = pos;
            moveInfo.type = GuildServerAnswerAvatar.TYPE_SET;
            this._queuePos.push(moveInfo);
        }
    }
    moveTo(pos, fate) {
        var moveInfo: any = {};
        moveInfo.pos = pos;
        moveInfo.fate = fate || 1;
        moveInfo.type = GuildServerAnswerAvatar.TYPE_MOVE;
        this._queuePos.push(moveInfo);
    }
    _moveToEx(moveInfo) {
        if (!this._canMove) {
            return;
        }
        var pos = moveInfo.pos;
        var fate = moveInfo.fate;
        var curPos = cc.v2(this.node.x, this.node.y);
        this._canMove = false;
        this.didEnterAction('run');
        var distance = this._distance(curPos, pos);
        var time = distance / (GuildServerAnswerAvatar.SPEED * fate);
        var move = cc.moveTo(time, pos);
        var sequece = cc.sequence(move, cc.callFunc(function () {
            this._canMove = true;
            this._setAction();
        }.bind(this)));
        this.node.runAction(sequece);
    }
    _distance(pos1, pos2) {
        var value1 = (pos1.x - pos2.x) * (pos1.x - pos2.x);
        var value2 = (pos1.y - pos2.y) * (pos1.y - pos2.y);
        return Math.sqrt(value1 + value2);
    }
    didEnterAction(actionName, shadow?) {
        if (this._actionName == actionName) {
            return;
        }
        var isShadow = true;
        if (typeof (shadow) == 'boolean') {
            isShadow = shadow;
        }
        this._actionName = actionName;
        this._commonHeroAvatar.setAction(actionName, true);
        this._commonHeroAvatar.showShadow(isShadow);
    }
    onEnter() {
        this._isFirst = true;
    }
    onExit() {
    }
    getId() {
        return this._user_id;
    }
    died(callback) {
        if (this._wudiTimes > 0) {
            return;
        }
        this.didEnterAction('hitfly', false);
        this._startFlyAction(callback);
    }
    _startFlyAction(callback) {
        if (this._startPlayFly) {
            return;
        }
        var p1x = this.node.getPosition().x;
        var p1y = this.node.getPosition().y;
        var distance = Math.floor(Math.random() * (750 - 680)) + 680;
        var p1 = cc.v2(p1x, p1y);
        var p2 = cc.v2(0, 0);
        var p3 = cc.v2(0, p1.y);
        p3.x = p1.x - distance;
        p2.x = p1.x - distance / 2.5;
        p2.y = p1.y + GuildServerAnswerAvatar.FLY_HEIGHT;
        this._targetRotate = -30;
        this._bezierPos1 = p1;
        this._bezierPos2 = p2;
        this._bezierPos3 = p3;
        this._bezierTime = distance / GuildServerAnswerAvatar.FLY_SPEED;
        this._curBezierTime = 0;
        this._startPlayFly = true;
        this._flyActionMoveEndCallBack = callback;
        this.node.angle = (0);
    }
    _flyCurveFunc(t) {
        return 1 - (t * 0.5 - 0.5) * (t * 0.5 + 3 * t * 0.5 - 2);
    }
    _getBezierPos(t) {
        var k1 = (1 - t) * (1 - t);
        var k2 = 2 * t * (1 - t);
        var k3 = t * t;
        var x = k1 * this._bezierPos1.x + k2 * this._bezierPos2.x + k3 * this._bezierPos3.x;
        var y = k1 * this._bezierPos1.y + k2 * this._bezierPos2.y + k3 * this._bezierPos3.y;
        return cc.v2(x, y);
    }
    _flyUpdate(t) {
        if (this._startPlayFly) {
            this._curBezierTime = this._curBezierTime + t;
            var percent = this._curBezierTime / this._bezierTime;
            if (percent >= 1) {
                percent = 1;
            }
            var t1 = this._flyCurveFunc(percent);
            var pos = this._getBezierPos(t1);
            this.node.setPosition(pos);
            if (Math.abs(pos.x) < Math.abs(this._bezierPos2.x)) {
                var rPercent = Math.abs((pos.x - this._bezierPos1.x) / (this._bezierPos2.x - this._bezierPos1.x));
                this.node.angle = (this._targetRotate * rPercent);
            }
            if (percent == 1) {
                this._startPlayFly = false;
                this.node.angle = (0);
                if (this._flyActionMoveEndCallBack) {
                    this._flyActionMoveEndCallBack(this);
                }
                this.hide();
            }
        }
    }
    hide() {
        console.log("Hide: 人物名称 = " + this._heroName.string);
        this.node.active = (false);
        this.node.stopAllActions();
        this._user_id = 0;
        this._side = 0;
        this._queuePos = [];
        this._canMove = true;
        this._recoveryFlag = 0;
        this._state = null;
    }
    update(dt) {
        this._moveUpdate(dt);
        this._flyUpdate(dt);
    }
    _moveUpdate(dt) {
        if (this._canMove && this._queuePos.length > 0) {
            var info = this._queuePos[0];
            if (info.type == GuildServerAnswerAvatar.TYPE_MOVE) {
                this._moveToEx(info);
            } else {
                this.node.setPosition(info.pos);
            }
            this._queuePos.shift();
        }
    }
    setRecoveryFlag(flag) {
        this._recoveryFlag = flag;
    }
    getRecoveryFlag() {
        return this._recoveryFlag;
    }
    playFace(right_answer) {
        var radio = Math.random();
        if (radio < GuildAnswerConst.FACE_RADIO) {
            this._setFace(right_answer);
        }
    }
    _setFace(right_answer) {
        var face = 0;
        if (this._side == right_answer) {
            var index = Math.floor(Math.random() * (GuildAnswerConst.TRUE_FACE.length));
            face = GuildAnswerConst.TRUE_FACE[index];
        } else {
            var index = Math.floor(Math.random() * (GuildAnswerConst.TRUE_FACE.length));
            face = GuildAnswerConst.FALSE_FACE[index];
        }
        this._imageFace.node.addComponent(CommonUI).loadTexture(Path.getChatFaceRes(face));
        this._imageFace.node.active = (true);
        var sequece = cc.sequence(cc.delayTime(GuildAnswerConst.FACE_TIME), cc.callFunc(function () {
            this._imageFace.node.active = (false);
        }.bind(this)));
        this._imageFace.node.runAction(sequece);
    }

}