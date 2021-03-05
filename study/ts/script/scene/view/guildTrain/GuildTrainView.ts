const { ccclass, property } = cc._decorator;

// import CommonChatMiniNode from '../chat/CommonChatMiniNode'

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_NetworkManager, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import GuildTrainTeamNode from './GuildTrainTeamNode';



@ccclass
export default class GuildTrainView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode6: GuildTrainTeamNode = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode7: GuildTrainTeamNode = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode4: GuildTrainTeamNode = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode1: GuildTrainTeamNode = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode: GuildTrainTeamNode = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode5: GuildTrainTeamNode = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode8: GuildTrainTeamNode = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode3: GuildTrainTeamNode = null;

    @property({
        type: GuildTrainTeamNode,
        visible: true
    })
    _teamNode2: GuildTrainTeamNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode: cc.Node = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _btnRule: CommonHelp = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _progressLabel: cc.Sprite = null;
    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;
    _expGap: number;
    _currentExp: number;
    _myTeamNode: GuildTrainTeamNode;
    _oldOtherTeam: any[];
    _myTeamInfo: any;
    _otherInfo: any;
    _autoEnd: boolean;
    _forceEnd: boolean;
    _countDownHandler: any;
    _totalTime: number;
    _expPromtHandle: void;
    _signalGuildTrainAutoEnd;
    _signalGuildTrainForceEnd;
    _signalGuildTrainUpdate;
    _signalGuildGetNotify;
    _signalDeadNetwork;

    public static waitEnterMsg(callback) {
        cc.resources.load("prefab/guildTrain/GuildTrainTeamNode", cc.Prefab, () => {
            callback();
        })
    }

    onCreate() {
        this._topbarBase.setImageTitle('txt_sys_yanwuchang');
        this._topbarBase.setItemListVisible(false);
        this._topbarBase.hideBG();
        this._topbarBase.setCallBackOnBack(handler(this, this.onButtonBack));
        this._btnRule.updateUI(FunctionConst.FUNC_GUILD_TRAIN);
        this._expGap = parseInt(G_ConfigLoader.getConfig("parameter").get(ParameterIDConst.TRAIN_PERCENT_EXP).content);
        this._currentExp = G_UserData.getBase().getExp();
        G_UserData.getGuild().setTrainEndState(false);
        this._createTeamNode();
        this._createOthersNode();
        this._updateMyTeamView();
        this._updateOthersView();
    }
    _createTeamNode() {
        this._myTeamNode = this._teamNode;
        this._myTeamNode.ctor(this._teamNode);
    }
    _createOthersNode() {
        this._oldOtherTeam = [];
        for (var index = 1; index <= 8; index++) {
            this['_teamNode' + index].ctor(this['_teamNode' + index]);
            this._oldOtherTeam.push(this['_teamNode' + index]);
            this['_teamNode' + index].node.active = true;
        }
    }
    _updateMyTeamView() {
        this._myTeamInfo = G_UserData.getGuild().getMyGuildTrainTeamInfo();
        this._myTeamNode.updateUI(this._myTeamInfo);
    }
    _updateOthersView() {
        this._otherInfo = [];
        this._otherInfo = G_UserData.getGuild().getOtherGuildTrainTeamInfo();
        for (var i = 1; i <= 8; i++) {
            if (this._otherInfo[i - 1] && (this._otherInfo[i - 1].first != null || this._otherInfo[i - 1].second != null)) {
                // this._oldOtherTeam[i - 1].node.active = (true);
                this._updateOthersViewWithIndex(i - 1);
            } else {
                // this._oldOtherTeam[i - 1].node.active = (false);
            }
        }
    }
    _updateOthersViewWithIndex(index) {
        var trainInfo = this._otherInfo[index];
        this._oldOtherTeam[index].updateUI(trainInfo);
    }
    _createEndEffect() {
        function effectFunction(effect) {
            if (effect == 'gongke_txt') {
                var fontColor = Colors.getSmallMineGuild();
                var content = '';
                var trainType = G_UserData.getGuild().getGuildTrainType();
                if (trainType == 1) {
                    content = Lang.get('guild_end_mm_string');
                } else if (trainType == 2) {
                    content = Lang.get('guild_end_mo_string');
                } else if (trainType == 3) {
                    content = Lang.get('guild_end_om_string');
                }
                var label = UIHelper.createLabel({fontSize:40}).getComponent(cc.Label);
                label.string = content;
                label.node.color = (fontColor);
                UIHelper.enableOutline(label,cc.color(255,120,0),2)
                return label.node;
            }
        }
        function eventFunction(event) {
            if (event == 'finish') {
                this.hide();
                UserCheck.isLevelUp(null);
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, 'moving_gongkexiaocheng', effectFunction, eventFunction.bind(this), true);
    }
    hide() {
        if (this._effectNode != null) {
            this._effectNode.active = (false);
        }
    }
    onButtonBack() {
        if (!G_UserData.getGuild().getTrainEndState()) {
            G_Prompt.showTipOnTop(Lang.get('guild_exit_tanin_forbid'));
        } else {
            G_SceneManager.popScene();
        }
    }
    onEnter() {
        this._signalGuildTrainAutoEnd = G_SignalManager.add(SignalConst.EVENT_GUILD_TRAIN_AUTO_END, handler(this, this._onEventGuildTrainAutoEnd));
        this._signalGuildTrainForceEnd = G_SignalManager.add(SignalConst.EVENT_GUILD_TRAIN_FORCE_END, handler(this, this._onEventGuildTrainFroceEnd));
        this._signalGuildTrainUpdate = G_SignalManager.add(SignalConst.EVENT_GUILD_TRAIN_UPDATE, handler(this, this._onEventGuildTrainUpdate));
        this._signalGuildGetNotify = G_SignalManager.add(SignalConst.EVENT_GET_TRAIN_NOTIFY, handler(this, this._onEventGetTrainNotify));
        this._signalDeadNetwork = G_SignalManager.add(SignalConst.EVENT_NETWORK_DEAD, handler(this, this._onDeadNetwork));
        if (!G_UserData.getGuild().getTrainEndState()) {
            this._startTick();
            this._timeTick();
            this._expPromtTick();
        }
        this._commonChat.getPanelDanmu().active = false;
    }
    _onEventGuildTrainAutoEnd(eventId, data) {
        this._autoEnd = true;
        this._endExpPromtTick();
        this._myTeamNode.stopAniAndSound();
        this._createEndEffect();
        this._stopTick();
        if (data != null) {
            var index = 1;
            var trainType = G_UserData.getGuild().getGuildTrainType();
            if (trainType == 2) {
                index = 2;
            } else if (trainType == 3) {
                index = 1;
            }
            var myIndex = 3 - index;
            var lvOld = G_UserData.getBase().getOldPlayerLevel();
            if (data < G_UserData.getGuild().getGuildTrainTotalExp(lvOld, myIndex)) {
                this._myTeamNode.myTeamExit(index);
                var teamName = '';
                if (index == 1) {
                    teamName = this._myTeamInfo.first.getName();
                } else if (index == 2) {
                    teamName = this._myTeamInfo.second.getName();
                }
                G_Prompt.showTipOnTop(Util.format(Lang.get('guild_end_train_by_other'), teamName), null);
            }
        }
    }
    getMyNodeIndex() {
        var index = 1;
        var trainType = G_UserData.getGuild().getGuildTrainType();
        if (trainType == 2) {
            index = 2;
        } else if (trainType == 3) {
            index = 1;
        }
        var myIndex = 3 - index;
        return myIndex;
    }
    _onEventGetTrainNotify(event, message) {
        this._autoEnd = false;
        this._forceEnd = false;
        this._updateMyTeamView();
        this.unschedule(this._countDownHandler);
        this._endExpPromtTick();
        this._startTick();
    }
    _onEventGuildTrainFroceEnd(eventId, message) {
        this._autoEnd = false;
        this._forceEnd = true;
        G_SceneManager.popScene();
        G_UserData.getGuild().c2sQueryGuildMall();
    }
    _onEventGuildTrainUpdate(eventId, message) {
        if (!this._forceEnd) {
            this._updateOthersView();
            var myFirstUid = this._myTeamInfo.first != null && this._myTeamInfo.first.getUser_id() || 0;
            var mySecondUid = this._myTeamInfo.second != null && this._myTeamInfo.second.getUser_id() || 0;
            if (this._autoEnd) {
                for (var k in this._otherInfo) {
                    var v = this._otherInfo[k];
                    var otherFirstUid = v.first != null && v.first.getUser_id() || 1;
                    var otherSecondUid = v.second != null && v.second.getUser_id() || 1;
                    if (otherFirstUid == myFirstUid || myFirstUid == otherSecondUid) {
                        this._myTeamNode.myTeamExit(1);
                    } else if (otherFirstUid == mySecondUid || otherFirstUid == mySecondUid) {
                        this._myTeamNode.myTeamExit(2);
                    }
                }
            }
        }
    }
    _onDeadNetwork() {
        this.endTrainByDeadNet();
        this._stopTick();
        G_Prompt.showTipOnTop(Lang.get('guild_end_by_net'), null);
    }
    endTrainByDeadNet() {
        if (this._autoEnd == false) {
            G_UserData.getGuild().setTrainEndState(true);
            this._autoEnd = true;
            this._endExpPromtTick();
            this._myTeamNode.stopAniAndSound();
        }
    }
    onExit() {
        this.unschedule(this._countDownHandler);
        this._endExpPromtTick();
        this._signalGuildTrainAutoEnd.remove();
        this._signalGuildTrainAutoEnd = null;
        this._signalGuildTrainForceEnd.remove();
        this._signalGuildTrainForceEnd = null;
        this._signalGuildTrainUpdate.remove();
        this._signalGuildTrainUpdate = null;
        this._oldOtherTeam = [];
        this._signalGuildGetNotify.remove();
        this._signalGuildGetNotify = null;
        this._signalDeadNetwork.remove();
        this._signalDeadNetwork = null;
        this._autoEnd = false;
        this._myTeamInfo = null;
    }
    _startTick() {
        this._myTeamNode.setTimeLabelVisible(true);
        this._progressLabel.node.active = (true);
        var trainIime = G_UserData.getGuild().getTrainTime();
        var endTime = trainIime.endTime;
        this._totalTime = endTime - G_ServerTime.getTime();
        this.schedule(this._timeTick, 1);
        this.schedule(this._expPromtTick, this._expGap);
    }
    _expPromtTick() {
        this._myTeamNode.playExpAnimation();
    }
    _endExpPromtTick() {
        this.unschedule(this._expPromtTick);
    }
    _timeTick() {
        if (this._totalTime > 0) {
            if (!G_NetworkManager.isConnected()) {
                this._onDeadNetwork();
            }
            this._totalTime = this._totalTime - 1;
            this._myTeamNode.setTimeLabelString(this._totalTime + 's');
            var userBase = G_UserData.getBase();
            var myIndex = this.getMyNodeIndex();
            this._currentExp = this._currentExp + G_UserData.getGuild().getGuildPercentExpByOneS(userBase.getLevel(), myIndex);
            var roleData = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(userBase.getLevel());
            if (roleData) {
                var value = this._currentExp / roleData.exp;
                if (value > 1) {
                    if (userBase.getLevel() + 1 > this.getMaxLevel()) {
                        value = 1;
                    } else {
                        this._currentExp = this._currentExp - roleData.exp;
                        value = this._currentExp / G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(userBase.getLevel() + 1).exp;
                    }
                }
                var percent = Math.floor(value * 100);
                this._progressLabel.node.getChildByName('text2').getComponent(cc.Label).string = (percent + '%');
            }
        } else {
            this._stopTick();
        }
    }
    getMaxLevel() {
        var paramContent = G_ConfigLoader.getConfig('parameter').get(ParameterIDConst.PLAYER_DETAIL_LEVEL_LIMIT).content;
        var valueList = paramContent.split(',');
        var minDay = 1000000;
        var maxDay = 0;
        var maxLv = 0;
        var maxDlv = 0;
        for (var i in valueList) {
            var value = valueList[i];
            var day = value.split('|')[0];
            var level = value.split('|')[1];
            var currLevel = parseInt(level);
            var currDay = parseInt(day);
            if (currDay > maxDay) {
                maxDay = currDay;
                maxDlv = currLevel;
            }
            if (UserCheck.enoughOpenDay(currDay)) {
                if (currDay < minDay) {
                    minDay = currDay;
                    maxLv = currLevel;
                }
            }
        }
        if (UserCheck.enoughOpenDay(maxDay)) {
            return maxDlv;
        } else {
            return maxLv;
        }
    }
    _stopTick() {
        this.unschedule(this._timeTick);
        this._myTeamNode.setTimeLabelVisible(false);
    }

}