import ViewBase from "../../ViewBase";
import { GuildAnswerConst } from "../../../const/GuildAnswerConst";
import { AudioConst } from "../../../const/AudioConst";
import { GuildServerAnswerHelper } from "./GuildServerAnswerHelper";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { G_SignalManager, G_UserData, G_ServerTime, G_EffectGfxMgr, G_AudioManager, G_Prompt } from "../../../init";
import GuildServerAnswerAvatar from "./GuildServerAnswerAvatar";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { Util } from "../../../utils/Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildServerAnswerAvatarLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _leftEffectCenter: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _rightEffectCenter: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    public static EFFECT_MOVING: any = {
        [1]: 'moving_quanfudati_ganning',
        [2]: 'moving_quanfudati_huangyueying',
        [3]: 'moving_quanfudati_lvbu'
    };
    public static EFFECT_SOUND = {
        [1]: AudioConst.SOUND_NEW_ANSWER_KILL1,
        [2]: AudioConst.SOUND_NEW_ANSWER_KILL2,
        [3]: AudioConst.SOUND_NEW_ANSWER_KILL3
    };
    public static EFFECT_OUT_SOUND = {
        [1]: AudioConst.SOUND_NEW_ANSWER_OUT1,
        [2]: AudioConst.SOUND_NEW_ANSWER_OUT2,
        [3]: AudioConst.SOUND_NEW_ANSWER_OUT3
    };
    public static EFFECT_TRUE = 'moving_quanfudati_zhengque';
    public static EFFECT_FALSE = 'moving_quanfudati_cuowu';
    public static SPEED = 500;
    _leftPosMaps: any;
    _rightPosMaps: any;
    _signalEventGuildServerPlayerrUpdate: any;
    _listAvatars: any;
    _showAvatarList: any;
    _curNode: any;
    _effectIndex: number;
    _right_answer: any;


    onCreate() {
        [this._leftPosMaps, this._rightPosMaps] = GuildServerAnswerHelper.getPlayerPointMaps();
        this._leftEffectCenter.zIndex = (500);
        this._rightEffectCenter.zIndex = (500);
        this._listAvatars = [];
        this._showAvatarList = {};
        this._initPlayerAvatars();
    }
    onEnter() {
        this._signalEventGuildServerPlayerrUpdate = G_SignalManager.add(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, handler(this, this._onEventPlayerUpdate));
        this._updateAvatarEx();
    }
    _initPlayerAvatars() {
        var maxKeng = GuildServerAnswerHelper.getServerAnswerMaxKeng();
        for (var i = 0; i < maxKeng; i++) {
            var avatar = Util.getNode("prefab/guildServerAnswer/GuildServerAnswerAvatar", GuildServerAnswerAvatar) as GuildServerAnswerAvatar;
            this._nodeParent.addChild(avatar.node);
            this._listAvatars.push(avatar);
            avatar.hide();
        }
    }
    onExit() {
        this._signalEventGuildServerPlayerrUpdate.remove();
        this._signalEventGuildServerPlayerrUpdate = null;
    }
    _onEventPlayerUpdate(id, message) {
        var flag = message.flag;
        if (flag == 0) {
            this._doMidfield();
        } else if (flag == 1) {
            this._updateAvatarEx();
        }
    }
    enterAllAvatarRun() {
        for (var k in this._listAvatars) {
            var avatar = this._listAvatars[k];
            if (avatar.node.active) {
                avatar.didEnterAction('run');
            }
        }
    }
    enterAllAvatarIdle() {
        for (var k in this._listAvatars) {
            var avatar = this._listAvatars[k];
            if (avatar.node.active) {
                avatar.didEnterAction('idle');
            }
        }
    }
    enterAllAvatarWin() {
        for (var k in this._listAvatars) {
            var avatar = this._listAvatars[k];
            if (avatar.node.active) {
                avatar.didEnterAction('win');
            }
        }
    }
    _findAvatarById(userId) {
        var avatar = this._showAvatarList[userId];
        if (avatar && avatar.node.active) {
            return avatar;
        }
    }
    _getFreeAvatar() {
        for (var k in this._listAvatars) {
            var avatar = this._listAvatars[k];
            if (!avatar.node.active) {
                return avatar;
            }
        }
    }
    _resetRecoveryFlag() {
        for (var k in this._showAvatarList) {
            var v = this._showAvatarList[k];
            if (v) {
                this._showAvatarList[k].setRecoveryFlag(1);
            }
        }
    }
    _recovery() {
        for (var k in this._showAvatarList) {
            var v = this._showAvatarList[k];
            if (v) {
                if (this._showAvatarList[k].getRecoveryFlag() == 1) {
                    this._showAvatarList[k].hide();
                    this._showAvatarList[k] = null;
                }
            }
        }
    }
    _updateAvatarEx() {
        var state = G_UserData.getGuildServerAnswer().getAnswerState();
        if (state == GuildAnswerConst.ANSWER_STATE_INIT || state == GuildAnswerConst.ANSWER_STATE_IDLE) {
            return;
        }
        var list = GuildServerAnswerHelper.getServerAnswerSortPlayers();
        var maxSize = GuildServerAnswerHelper.getServerAnswerMaxKeng();
        if (list[0] && !list[0].isSelf()) {
            maxSize = maxSize - 1;
        }
        var maxCount = Math.min(maxSize, list.length);
        this._resetRecoveryFlag();
        this._updateExitsAvatar(maxCount, list);
        this._recovery();
        this._allocNewAvatar(maxCount, list);
    }
    _updateExitsAvatar(maxCount, list) {
        for (var i = 0; i < maxCount; i++) {
            var data = list[i];
            var avatar = this._findAvatarById(data.getUser_id());
            if (avatar) {
                avatar.setRecoveryFlag(0);
            }
        }
    }
    _allocNewAvatar(maxCount, list) {
        var [leftCount, rightCount] = this._getStartCount(list[0]);
        var state = G_UserData.getGuildServerAnswer().getAnswerState();
        for (var i = 0; i < maxCount; i++) {
            var data = list[i];
            var avatar = this._findAvatarById(data.getUser_id());
            if (!avatar) {
                avatar = this._getFreeAvatar();
                this._showAvatarList[data.getUser_id()] = avatar;
            }
            if (avatar) {
                if (data.getSide() == GuildAnswerConst.LEFT_SIDE) {
                    leftCount = leftCount + 1;
                    var point = this._leftPosMaps[leftCount];
                    avatar.updateAvatar(data, point, state);
                } else {
                    rightCount = rightCount + 1;
                    var point = this._rightPosMaps[rightCount];
                    avatar.updateAvatar(data, point, state);
                }
            }
        }
    }
    _getStartCount(data) {
        var leftCount = 0;
        var rightCount = 0;
        if (data && data.isSelf()) {
            if (data.getSide() == GuildAnswerConst.LEFT_SIDE) {
                leftCount = 0;
                rightCount = 1;
            } else {
                leftCount = 1;
                rightCount = 0;
            }
        } else {
            leftCount = 1;
            rightCount = 1;
        }
        return [
            leftCount,
            rightCount
        ];
    }
    _playKillEffect(node: cc.Node) {
        this._curNode = node;
        var size = this.node.getContentSize();
        node.removeAllChildren();
        node.stopAllActions();
        var serverTime = Math.floor(G_ServerTime.getTime() / 30);
        var effectIndex = serverTime % 3 + 1;
        node.x = (size.width / 2 + 100);
        node.scaleX = -1 * Math.abs(node.scaleX);
        var time = (size.width + 300) / GuildServerAnswerAvatarLayer.SPEED;
        G_AudioManager.playSoundWithId(GuildServerAnswerAvatarLayer.EFFECT_OUT_SOUND[effectIndex]);
        let effect = G_EffectGfxMgr.createPlayMovingGfx(node, GuildServerAnswerAvatarLayer.EFFECT_MOVING[effectIndex], null, null);
        var move = cc.moveTo(time, cc.v2(-200 - size.width / 2, node.y));
        var sequece1 = cc.sequence(move, cc.callFunc(function () {
            effect.stop();
            this._curNode.removeAllChildren();
            this._curNode = null;
            for (let k in this._showAvatarList) {
                var avatar = this._showAvatarList[k];
                if (avatar&&avatar.node.active && avatar.getSide() != this._right_answer && avatar.getWudiTimes() > 0) {
                    avatar.subWudiTimes();
                }
            }
        }.bind(this)));
        this._effectIndex = effectIndex;
        node.runAction(sequece1);
    }
    update(dt) {
        if (this._curNode) {
            this._checkDied();
        }
    }
    _doMidfield() {
        var curQues: any = G_UserData.getGuildServerAnswer().getCurQuestion();
        var right_answer = curQues.getRightAnswer();
        console.log("正确答案----",right_answer);
        var sequece1 = cc.sequence(cc.callFunc(function () {
            //先播放答案特效
            this._playAnswerEffect(right_answer);
        }.bind(this)), cc.delayTime(GuildAnswerConst.EFFECT_TIME), cc.callFunc(function () {
            //再播放
            this._playFaceAction(right_answer);
        }.bind(this)), cc.delayTime(GuildAnswerConst.FACE_TIME), cc.callFunc(function () {
            //杀死特效
            this._killMan(right_answer);
        }.bind(this)));
        this.node.runAction(sequece1);
    }
    _playFaceAction(right_answer) {
        for (var k in this._showAvatarList) {
            var avatar = this._showAvatarList[k];
            if (avatar) {
                avatar.playFace(right_answer);
            }
        }
    }
    _playAnswerEffect(right_answer) {
        var selfUnitData = GuildServerAnswerHelper.getSelfUnitData();
        this._nodeEffect.removeAllChildren();
        var effectFunction = function (key) {
            if (key == 'ziti') {
                var txt = 'txt_answer_02';
                if (selfUnitData.getSide() == right_answer) {
                    txt = 'txt_answer_01';
                }
                var image = (new cc.Node()).addComponent(cc.Sprite) as cc.Sprite;
                UIHelper.loadTexture(image, Path.getGuildAnswerText(txt));
                return image.node;
            }
        }.bind(this);
        if (selfUnitData) {
            if (selfUnitData.getSide() == right_answer) {
                G_AudioManager.playSoundWithId(AudioConst.SOUND_NEW_ANSWER_WIN);
                G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, GuildServerAnswerAvatarLayer.EFFECT_TRUE, effectFunction, function (event) {
                    if (event == 'finish') {
                        G_Prompt.showAwards(GuildServerAnswerHelper.getAnswerAwards(1));
                    }
                }.bind(this), true);
            } else {
                G_AudioManager.playSoundWithId(AudioConst.SOUND_NEW_ANSWER_LOSE);
                G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, GuildServerAnswerAvatarLayer.EFFECT_FALSE, effectFunction, function (event) {
                    if (event == 'finish') {
                        G_Prompt.showAwards(GuildServerAnswerHelper.getAnswerAwards(2));
                        this._removeSelf();
                    }
                }.bind(this), true);
            }
        }
    }

    _removeSelf() {
        var list = G_UserData.getGuildServerAnswer().getGuildServerAnswerPlayerDatas();
        for (let i = 0; i < list.length; i++) {
            var data = list[i];
            if (data.isSelf()) {
                list.splice(i, 1);
                return;
            }
        }
    }

    _killMan(right_answer) {
        this._right_answer = right_answer;
        if (right_answer == GuildAnswerConst.LEFT_SIDE) {
            this._playKillEffect(this._rightEffectCenter);
        } else {
            this._playKillEffect(this._leftEffectCenter);
        }
    }
    //检查是否死
    _checkDied() {
        for (var k in this._showAvatarList) {
            var avatar = this._showAvatarList[k];
            if (avatar) {
                //回答不正确就死
                if (avatar.node.active && avatar.getSide() != this._right_answer) {
                    if (avatar.node.x + 170 > this._curNode.x) {
                        G_AudioManager.playSoundWithId(GuildServerAnswerAvatarLayer.EFFECT_SOUND[this._effectIndex]);
                        avatar.died();
                    }
                }
            }
        }
    }

}