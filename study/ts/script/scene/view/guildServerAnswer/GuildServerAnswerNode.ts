const { ccclass, property } = cc._decorator;

import CommonCountdown from '../../../ui/component/CommonCountdown'

import CommonCountdownAnimation from '../../../ui/component/CommonCountdownAnimation'
import { Colors, G_SignalManager, G_UserData, G_AudioManager, G_Prompt, G_ServerTime } from '../../../init';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import { GuildAnswerConst } from '../../../const/GuildAnswerConst';
import { AudioConst } from '../../../const/AudioConst';
import { GuildServerAnswerHelper } from './GuildServerAnswerHelper';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';

@ccclass
export default class GuildServerAnswerNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnTrue: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTrueNums: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnFalse: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFalseNums: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _answerText: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _playingImage: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textExamination: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _specialNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _specialTime: cc.Label = null;

    @property({
        type: CommonCountdownAnimation,
        visible: true
    })
    _countDown: CommonCountdownAnimation = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _waveImage: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTips: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _diedTips: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _textQuesNo: cc.Sprite = null;

    @property({
        type: CommonCountdown,
        visible: true
    })
    _openCountDown: CommonCountdown = null;

    public static readonly FLOAT_HEIGHT = 80;
    public static readonly MAX_TIME = 10;
    _signalEventGuildServerUpdatePlayerNums: any;
    _state: any;
    _startTimer: any;
    _deltTime: any = 0;
    _timeOffset: number;


    onCreate() {
        this._answerText.string = ('');
        this._waveImage.sizeMode = cc.Sprite.SizeMode.RAW;
        this._diedTips.sizeMode = cc.Sprite.SizeMode.RAW;
        this._textQuesNo.sizeMode = cc.Sprite.SizeMode.RAW;
        this._textExamination.string = ('');
        this._specialNode.active = (false);
        this._textQuesNo.node.active = (false);
        this._countDown.node.active = (false);
        var textureList = [
            'img_runway_star.png',
            'img_runway_star1.png',
            'img_runway_star2.png',
            'img_runway_star3.png'
        ];
        this._countDown.setTextureList(textureList);
        this._openCountDown.setCountdownLableParam({
            color: Colors.DARK_BG_THREE,
            outlineColor: Colors.BRIGHT_BG_OUT_LINE_TWO
        });
        this._openCountDown.setCountdownTimeParam({
            color: Colors.BRIGHT_BG_RED,
            outlineColor: Colors.BRIGHT_BG_OUT_LINE_TWO
        });
    }
    onEnter() {
        this._signalEventGuildServerUpdatePlayerNums = G_SignalManager.add(SignalConst.EVENT_GUILD_NEW_ANSWER_UPDATE_PLAYER_NUMS, handler(this, this._onEventUpdatePlayerNums));
        // this.scheduleUpdateWithPriorityLua(handler(this, this._update), 0);
        this._onEventUpdatePlayerNums();
    }
    onExit() {
        this._state = null;
        this._signalEventGuildServerUpdatePlayerNums.remove();
        this._signalEventGuildServerUpdatePlayerNums = null;
    }
    update(dt) {
        if (this._startTimer) {
            this._deltTime = this._deltTime + dt;
            if (this._deltTime >= 1) {
                this._deltTime = 0;
                this._timeTick();
            }
        }
    }
    _onEventUpdatePlayerNums() {
        var trueNums = 0;
        var falseNums = 0;
        var playerList = G_UserData.getGuildServerAnswer().getGuildServerAnswerPlayerDatas();
        for (var k in playerList) {
            var v = playerList[k];
            if (v.getSide() == GuildAnswerConst.LEFT_SIDE) {
                trueNums = trueNums + 1;
            } else {
                falseNums = falseNums + 1;
            }
        }
        this._textTrueNums.string = (trueNums + "");
        this._textFalseNums.string = (falseNums + "");
    }
    _timeTick() {
        if (this._totalTime() >= 0) {
            var state = G_UserData.getGuildServerAnswer().getAnswerState();
            if (state == GuildAnswerConst.ANSWER_STATE_PLAYING || state == GuildAnswerConst.ANSWER_STATE_RESTING) {
                this._setTextCount();
                if (this._totalTime() == 0) {
                    this._setButtonVisible(false);
                }
            } else {
                this._setEffectCoundDown();
            }
        } else {
            this._startTimer = false;
        }
    }
    _setEffectCoundDown() {
        this._specialNode.active = (true);
        this._textCountDown.node.active = (false);
        var state = G_UserData.getGuildServerAnswer().getAnswerState();
        if (this._totalTime() <= 3 && state == GuildAnswerConst.ANSWER_STATE_READY) {
            if (this._totalTime() == 3) {
                this._waveImage.node.active = (false);
                this._specialTime.node.active = (false);
                G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_RACE_COUNT);
                this._countDown.node.active = (true);
                this._countDown.playAnimation(4, 1, null);
            }
        } else {
            this._specialTime.node.active = (true);
            this._specialTime.string = (this._totalTime() + "");
        }
    }
    _setTextCount() {
        this._textCountDown.node.active = (true);
        this._specialNode.active = (false);
        this._countDown.node.active = (false);
        var timeTxt = this._totalTime();
        this._textCountDown.string = (timeTxt) + "";
    }
    onBtnTrue() {
        if (this._state != GuildAnswerConst.ANSWER_STATE_PLAYING) {
            return;
        }
        this._clickSound();
        if (!GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess()) {
            G_Prompt.showTip(Lang.get('guild_server_answer_taotai'));
            return;
        }
        G_UserData.getGuildServerAnswer().c2sGuildAnswerChange(GuildAnswerConst.LEFT_SIDE);
        this._btnTrue.interactable = (false);
        this._btnFalse.interactable = (true);
    }
    onBtnFalse() {
        if (this._state != GuildAnswerConst.ANSWER_STATE_PLAYING) {
            return;
        }
        this._clickSound();
        if (!GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess()) {
            G_Prompt.showTip(Lang.get('guild_server_answer_taotai'));
            return;
        }
        G_UserData.getGuildServerAnswer().c2sGuildAnswerChange(GuildAnswerConst.RIGHT_SIDE);
        this._btnTrue.interactable = (true);
        this._btnFalse.interactable = (false);
    }
    _clickSound() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_BUTTON);
    }
    _updateExamiationInfo() {
        var curQues:any = G_UserData.getGuildServerAnswer().getCurQuestion();
        var des = curQues.getQuestionDes();
        var parts = des.split('_');
        if(parts.length==1)
        {
            this._textExamination.string = (parts[0] || '');
        }
        else
        {
            var index = parseInt(parts[0]);
            var realDes = parts[index+1];
            this._textExamination.string = (realDes || '');
        }
        return curQues.getRightAnswer();
    }
    _playQuesNoFloatAction(callback) {
        var visibleNo = GuildServerAnswerHelper.getCurrentVisibleQuesNo();
        this._textQuesNo.node.active = (true);
        var posx = this._textQuesNo.node.getPosition().x;
        var posy = this._textQuesNo.node.getPosition().y;
        let str = "";
        if (visibleNo >= 0 && visibleNo < 10) {
            str = "0" + visibleNo;
        }
        else {
            str = visibleNo.toString();
        }
        UIHelper.loadTexture(this._textQuesNo, Path.getGuildAnswerText('txt_answer_n' + str));
        this._textQuesNo.node.setScale(0.1);
        var fade = cc.scaleTo(0.5, 1);
        var delayTime = cc.delayTime(1);
        var move = cc.moveBy(0.5, cc.v2(0, GuildServerAnswerNode.FLOAT_HEIGHT));
        var sequence = cc.sequence(fade, delayTime, move, cc.callFunc(function () {
            this._textQuesNo.node.active = (false);
            this._textQuesNo.node.setScale(1);
            this._textQuesNo.node.setPosition(cc.v2(posx, posy));
            if (callback) {
                callback();
            }
        }.bind(this)));
        this._textQuesNo.node.runAction(sequence);
    }
    _set_ANSWER_STATE_PLAYING(args) {
        args._textExamination.string = ('');
        args._textCountDown.string = ('');
        args._playingImage.node.active = (true);
        args._startTimer = false;
        var callback = function () {
            args._startTimer = true;
            args._timeOffset = -1;
            args._timeTick();
            args._updateExamiationInfo();
            var isInAnswer = GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess();
            args._setButtonVisible(true && isInAnswer);
        }.bind(args);
        if (args._state) {
            args._playQuesNoFloatAction(callback);
        } else {
            callback();
        }
    }
    _set_ANSWER_STATE_RESTING(args) {
        args._textCountDown.string = ('');
        args._playingImage.node.active = (true);
        args._startTimer = false;
        args._setButtonVisible(false);
        args._updateExamiationInfo();
    }
    _set_ANSWER_STATE_IDLE(args) {
        args._openCountDown.node.active = (true);
        args._openCountDown.startCountDown(Lang.get('country_boss_countdown_label5'), GuildServerAnswerHelper.getNextOpenTime(), null, null);
        args._setButtonVisible(false);
    }
    _set_ANSWER_STATE_INIT(args) {
        args._set_ANSWER_STATE_IDLE(args);
    }
    _set_ANSWER_STATE_READY(args) {
        if (G_UserData.getGuildServerAnswer().getReadySucess() == 0) {
            G_UserData.getGuildServerAnswer().c2sEnterNewGuildAnswer();
        }
        args._waveImage.node.active = (true);
        args._timeOffset = -1;
        var wave = GuildServerAnswerHelper.getCurWaves();
        UIHelper.loadTexture(args._waveImage, Path.getGuildAnswerText('txt_answer_wave_' + wave));
        args._setButtonVisible(false);
    }
    _setButtonVisible(enbaled) {
        this._btnTrue.node.active = (enbaled);
        this._btnFalse.node.active = (enbaled);
        this._btnTrue.enabled = (true);
        this._btnFalse.enabled = (true);
    }
    updateUI(state) {
        this._preState(state);
        var stateFunc = this['_set_' + state].bind(this);
        if (stateFunc) {
            stateFunc(this);
        }
        this._state = state;
    }
    _preState(state) {
        this._updateTick(state);
        this._updateTips(state);
        this._imageSelected.node.active = (false);
        this._playingImage.node.active = (false);
        this._waveImage.node.active = (false);
        this._openCountDown.node.active = (false);
        this._timeOffset = 0;
    }
    _updateTips(state) {
        var show = !GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess();
        show = show && ((state == GuildAnswerConst.ANSWER_STATE_PLAYING) || (state == GuildAnswerConst.ANSWER_STATE_RESTING));
        this._imageTips.node.active = (show);
        var waves = GuildServerAnswerHelper.getCurWaves();
        var resId = 'txt_answer_04';
        if (waves >= GuildServerAnswerHelper.getMaxWaves()) {
            resId = 'txt_answer_03';
        }
        UIHelper.loadTexture(this._diedTips, Path.getGuildAnswerText(resId));
    }
    _updateTick(state) {
        this._startTimer = false;
        if (state == GuildAnswerConst.ANSWER_STATE_IDLE || state == GuildAnswerConst.ANSWER_STATE_INIT) {
            return;
        }
        if (this._totalTime() > 0) {
            this._timeTick();
            this._startTimer = true;
        } else {
            this._textCountDown.string = ('');
        }
    }
    _totalTime() {
        var curTime = G_ServerTime.getTime();
        var endTime = G_UserData.getGuildServerAnswer().getStateEndTime();
        return endTime - curTime + this._timeOffset;
    }

}