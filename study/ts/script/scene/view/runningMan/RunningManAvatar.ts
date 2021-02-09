const { ccclass, property } = cc._decorator;

import CommonTalkNode from '../../../ui/component/CommonTalkNode'

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { RunningManConst } from '../../../const/RunningManConst';
import UIHelper from '../../../utils/UIHelper';
import { Colors, G_UserData } from '../../../init';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { RunningManHelp } from './RunningManHelp';

@ccclass
export default class RunningManAvatar extends cc.Component {

    @property({ type: CommonHeroAvatar, visible: true })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({ type: cc.Label, visible: true })
    _avatarName: cc.Label = null;

    @property({ type: CommonTalkNode, visible: true })
    _commonTalk: CommonTalkNode = null;

    @property({ type: cc.Sprite, visible: true })
    _betFlag: cc.Sprite = null;

    private _isOpeningChat;
    private _baseId;
    private _betInfo;
    private _avatarIndex;

    public onLoad() {
        this._commonTalk.node.active = false;
        this._betFlag.node.active = false;
    }

    public onEnable() {
        this._isOpeningChat = false;
        var interval = Math.floor(Math.random() * (RunningManConst.BUBBLE_START_TIME_MAX - RunningManConst.BUBBLE_START_TIME_MIN) + RunningManConst.BUBBLE_START_TIME_MIN);
        var delay = cc.delayTime(interval);
        var sequence = cc.sequence(delay, cc.callFunc(function () {
            this._isOpeningChat = true;
        }.bind(this)));
        this.node.runAction(sequence);
    }

    public onDisable() {
    }

    private _procPlayerInfo(betInfo) {
        var isPlayer = betInfo.isPlayer;
        if (isPlayer == null || isPlayer == 0) {
            return;
        }
        var simpleUser = betInfo.user;
        UIHelper.updateLabel(this._avatarName, {
            text: simpleUser.name,
            color: Colors.getOfficialColor(simpleUser.office_level),
            outlineColor: Colors.getOfficialColorOutline(simpleUser.office_level)
        });
        this._commonHeroAvatar.updateAvatar(simpleUser.playerInfo);
    }

    public updateUI(betInfo) {
        this._commonHeroAvatar.init();
        var isPlayer = betInfo.isPlayer;
        if (isPlayer == 1) {
            this._procPlayerInfo(betInfo);
        } else {
            var typeHeroInfo = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, betInfo.heroId);
            this._commonHeroAvatar.updateUI(betInfo.heroId);
            UIHelper.updateLabel(this._avatarName, {
                text: typeHeroInfo.name,
                color: typeHeroInfo.icon_color,
                outlineColor: typeHeroInfo.icon_color_outline
            });
        }
        this._baseId = betInfo.heroId;
        this._betInfo = betInfo;
        this._avatarIndex = betInfo.roadNum;
        var title = betInfo.user && betInfo.user.title || 0;
        this._commonHeroAvatar.showTitle(betInfo.user.title || 0, "RunningManAvatar");
    }

    public setAvatarScale(scale) {
        this._commonHeroAvatar.setScale(scale);
        this._commonTalk.node.setScale(scale);
    }

    public getHeroId() {
        return this._baseId;
    }

    public playRunning() {
        this._commonHeroAvatar.setAniTimeScale(RunningManConst.RUNNING_ANIMATION_SPEED);
        this._commonHeroAvatar.setAction('run', true);
    }

    public playIdle() {
        this._commonHeroAvatar.setAniTimeScale(1);
        this._commonHeroAvatar.setAction('idle', true);
    }

    private _updateBetFlag() {
        this._betFlag.node.active = false;
        var betNum = G_UserData.getRunningMan().getHeroBetNum(this._baseId);
        if (betNum > 0) {
            this._betFlag.node.active = true;
        }
    }

    public resetAvatar() {
        var avatarInfo = RunningManConst['AVATA_INFO' + this._avatarIndex];
        this.node.stopAllActions();
        this.node.setPosition(avatarInfo.startPos);
        this.setAvatarScale(avatarInfo.scale);
        this._isOpeningChat = true;
    }

    public playRunningAndIdle() {
        if (this._avatarIndex == null) {
            return;
        }
        this._isOpeningChat = false;
        function callback() {
            this._commonHeroAvatar.setAction('idle', true);
            this._isOpeningChat = true;
        }
        var avatarInfo = RunningManConst['AVATA_INFO' + this._avatarIndex];
        var callFuncAction = cc.callFunc(callback.bind(this));
        this.node.setPosition(0, avatarInfo.startPos.y);
        var moveAction = cc.moveTo(RunningManConst.RUNNING_MOVE_ACTION_TIME, avatarInfo.startPos);
        var seq = cc.sequence(moveAction, callFuncAction);
        this._commonHeroAvatar.setAction('run', true);
        this.setAvatarScale(avatarInfo.scale);
        this.node.runAction(seq);
    }

    public playWaitChat() {
        this._updateBetFlag();
        if (this._isOpeningChat == false) {
            return;
        }
        if (this._commonTalk.node.active == true) {
            return;
        }
        var talkText = null;
        if (this._betInfo.isPlayer == 1) {
            talkText = G_UserData.getRunningMan().getPlayerWaitTalkStr(this._betInfo.powerRank);
        } else {
            talkText = G_UserData.getRunningMan().getWaitTalkStr(this._baseId);
        }
        if (talkText == null) {
            return;
        }
        if (talkText == this._commonTalk.getTalkString()) {
            return;
        }
        var avatarInfo = RunningManConst['AVATA_INFO' + this._avatarIndex];
        this._commonTalk.node.setPosition(avatarInfo.chatPos);
        this._commonTalk.node.active = true;
        this._commonTalk.setText(talkText, 200, true);
        var interval = Math.floor(Math.random() * (RunningManConst.BUBBLE_SHOW_TIME_MAX - RunningManConst.BUBBLE_SHOW_TIME_MIN) + RunningManConst.BUBBLE_SHOW_TIME_MIN);
        var delay = cc.delayTime(interval);
        var sequence = cc.sequence(delay, cc.callFunc(function () {
            this._commonTalk.node.active = false;
        }.bind(this)));
        this.node.runAction(sequence);
    }

    public playRuningChat() {
        this._updateBetFlag();
        if (this._isOpeningChat == false) {
            return;
        }
        if (this._commonTalk.node.active == true) {
            return;
        }
        var avatarInfo = RunningManConst['AVATA_INFO' + this._avatarIndex];
        this._commonTalk.node.setPosition(avatarInfo.chatPos);
        var runningRank = RunningManHelp.getRunningRank(this._baseId);
        var talkText = G_UserData.getRunningMan().getRunningTalkStr(runningRank);
        if (talkText == null) {
            return;
        }
        if (talkText == this._commonTalk.getTalkString()) {
            return;
        }
        this._commonTalk.node.active = true;
        this._commonTalk.setText(talkText, 200, true);
        var interval = Math.floor(Math.random() * (RunningManConst.BUBBLE_SHOW_TIME_MAX - RunningManConst.BUBBLE_SHOW_TIME_MIN) + RunningManConst.BUBBLE_SHOW_TIME_MIN);
        var delay = cc.delayTime(interval);
        var sequence = cc.sequence(delay, cc.callFunc(function () {
            this._commonTalk.node.active = false;
        }.bind(this)));
        this.node.runAction(sequence);
    }
}