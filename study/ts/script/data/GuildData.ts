import { BaseData } from "./BaseData";
import { GuildListData } from "./GuildListData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ServerTime, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { GroupsInviteData } from "./GroupsInviteData";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { GuildTrainData } from "./GuildTrainData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import ParameterIDConst from "../const/ParameterIDConst";
import { GuildConst } from "../const/GuildConst";
import { GuildOpenRedBagUserData } from "./GuildOpenRedBagUserData";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { GuildRedPacketInfoData } from "./GuildRedPacketInfoData";
import { ArraySort } from "../utils/handler";
import { BuyCountIDConst } from "../const/BuyCountIDConst";
import { GuildHelpBaseData } from "./GuildHelpBaseData";
import { FunctionConst } from "../const/FunctionConst";
import { GuildMemberData } from "./GuildMemberData";
import { GuildHelpData } from "./GuildHelpData";
import { GuildSystemNotifyData } from "./GuildSystemNotifyData";
import { GuildUIHelper } from "../scene/view/guild/GuildUIHelper";
import { GuildUserData } from "./GuildUserData";
import { GuildUnitData } from "./GuildUnitData";
import { GuildApplicationData } from "./GuildApplicationData";

export interface GuildData {
    isLastCanSnatchRedPacketHintFlag(): boolean
    setLastCanSnatchRedPacketHintFlag(value: boolean): void
    isLastLastCanSnatchRedPacketHintFlag(): boolean
    isTipInvite(): boolean
    setTipInvite(value: boolean): void
    isLastTipInvite(): boolean
}
let schema = {};
schema['lastCanSnatchRedPacketHintFlag'] = [
    'boolean',
    false
];
schema['tipInvite'] = [
    'boolean',
    true
];
let GUILD_TEAIN_TYPE = {
    m2m: 1,
    m2o: 2,
    o2m: 3
};
export class GuildData extends BaseData {
    public static schema = schema;

    _trainTime;
    _guildListData;
    _userGuildInfo;
    _myGuild;
    _guildMemberList;
    _myMemberData;
    _guildApplicationList;
    _guildNotifyList;
    _myRequestHelp;
    _guildHelpList;
    _guildRedPacketList;
    _guildOnlineGetRedPacketList;
    _guildTrainType;
    _guildTrainDataList;
    _otherGuildTrainList: any[];
    _positionNotifyFlag;
    _trainEndState;
    _inviteTrainList;
    _recvGetUserGuild;
    _recvGetGuildList;
    _recvCreateGuild;
    _recvGuildApplication;
    _recvQueryGuildMall;
    _recvGuildCheckApplication;
    _recvGetGuildApplication;
    _recvGuildLeave;
    _recvGuildDismiss;
    _recvSetGuildMessage;
    _recvGetGuildMember;
    _recvGuildKick;
    _recvLeaderImpeachment;
    _recvGuildTransfer;
    _recvGuildPromote;
    _recvGetGuildSystemNotify;
    _recvGetGuildHelp;
    _recvAppGuildHelp;
    _recvUseGuildHelp;
    _recvSurGuildHelp;
    _recvGuildHelpReward;
    _signalBuyArenaCount;
    _recvGuildChangeState;
    _recvGetGuildRedBagList;
    _recvOpenGuildRedBag;
    _recvPutGuildRedBag;
    _recvGuildRedBagRespondNew;
    _recvGuildRedBagRespondDel;
    _recvGetGuildTaskReward;
    _recvGuildDonate;
    _recvGetGuildDonateReward;
    _recvGetGuildBase;
    _recvGuildChangeName;
    _recvChangeGuildIcon;
    _recvQueryGuildTrain;
    _recvInviteGuildTrainNotify;
    _recvConfirmGuildTrain;
    _recvStartGuildTrainNotify;
    _recvEndGuildTrainNotify;
    _recvEndGuildTrain;
    _recvGuildTrainChange;
    _recvInviteGuildTrainReturn;

    _guildTrainingMemberList;
    _guildTrainingMemberInfo;
    
    _guildSetAutoJion:any;
    _guildSetWEQQAddress:any
    _memberListIsDirt: boolean;
    constructor(properties?) {
        super(properties);
        this._guildListData = new GuildListData();
        this._userGuildInfo = null;
        this._myGuild = null;
        this._guildMemberList = {};
        this._myMemberData = null;
        this._guildApplicationList = {};
        this._guildNotifyList = {};
        this._myRequestHelp = null;
        this._guildHelpList = {};
        this._guildRedPacketList = {};
        this._guildOnlineGetRedPacketList = [];
        this._guildTrainType = 1;
        this._guildTrainDataList = {};
        this._otherGuildTrainList = [];
        this._initOtherGuildTrainList();
        this._positionNotifyFlag = false;
        this._trainEndState = true;
        this._inviteTrainList = {};
        this._recvGetUserGuild = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserGuild, this._s2cGetUserGuild.bind(this));
        this._recvGetGuildList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildList, this._s2cGetGuildList.bind(this));
        this._recvCreateGuild = G_NetworkManager.add(MessageIDConst.ID_S2C_CreateGuild, this._s2cCreateGuild.bind(this));
        this._recvGuildApplication = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildApplication, this._s2cGuildApplication.bind(this));
        this._recvQueryGuildMall = G_NetworkManager.add(MessageIDConst.ID_S2C_QueryGuildMall, this._s2cQueryGuildMall.bind(this));
        this._recvGuildCheckApplication = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildCheckApplication, this._s2cGuildCheckApplication.bind(this));
        this._recvGetGuildApplication = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildApplication, this._s2cGetGuildApplication.bind(this));
        this._recvGuildLeave = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildLeave, this._s2cGuildLeave.bind(this));
        this._recvGuildDismiss = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildDismiss, this._s2cGuildDismiss.bind(this));
        this._recvSetGuildMessage = G_NetworkManager.add(MessageIDConst.ID_S2C_SetGuildMessage, this._s2cSetGuildMessage.bind(this));
        this._recvGetGuildMember = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildMember, this._s2cGetGuildMember.bind(this));
        this._recvGuildKick = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildKick, this._s2cGuildKick.bind(this));
        this._recvLeaderImpeachment = G_NetworkManager.add(MessageIDConst.ID_S2C_LeaderImpeachment, this._s2cLeaderImpeachment.bind(this));
        this._recvGuildTransfer = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildTransfer, this._s2cGuildTransfer.bind(this));
        this._recvGuildPromote = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildPromote, this._s2cGuildPromote.bind(this));
        this._recvGetGuildSystemNotify = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildSystemNotify, this._s2cGetGuildSystemNotify.bind(this));
        this._recvGetGuildHelp = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildHelp, this._s2cGetGuildHelp.bind(this));
        this._recvAppGuildHelp = G_NetworkManager.add(MessageIDConst.ID_S2C_AppGuildHelp, this._s2cAppGuildHelp.bind(this));
        this._recvUseGuildHelp = G_NetworkManager.add(MessageIDConst.ID_S2C_UseGuildHelp, this._s2cUseGuildHelp.bind(this));
        this._recvSurGuildHelp = G_NetworkManager.add(MessageIDConst.ID_S2C_SurGuildHelp, this._s2cSurGuildHelp.bind(this));
        this._recvGuildHelpReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildHelpReward, this._s2cGuildHelpReward.bind(this));
        this._signalBuyArenaCount = G_NetworkManager.add(MessageIDConst.ID_S2C_BuyCommonCount, this._s2cBuyCommonCount.bind(this));
        this._recvGuildChangeState = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildChangeState, this._s2cGuildChangeState.bind(this));
        this._recvGetGuildRedBagList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildRedBagList, this._s2cGetGuildRedBagList.bind(this));
        this._recvOpenGuildRedBag = G_NetworkManager.add(MessageIDConst.ID_S2C_OpenGuildRedBag, this._s2cOpenGuildRedBag.bind(this));
        this._recvPutGuildRedBag = G_NetworkManager.add(MessageIDConst.ID_S2C_PutGuildRedBag, this._s2cPutGuildRedBag.bind(this));
        this._recvGuildRedBagRespondNew = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildRedBagRespondNew, this._s2cGuildRedBagRespondNew.bind(this));
        this._recvGuildRedBagRespondDel = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildRedBagRespondDel, this._s2cGuildRedBagRespondDel.bind(this));
        this._recvGetGuildTaskReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildTaskReward, this._s2cGetGuildTaskReward.bind(this));
        this._recvGuildDonate = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildDonate, this._s2cGuildDonate.bind(this));
        this._recvGetGuildDonateReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildDonateReward, this._s2cGetGuildDonateReward.bind(this));
        this._recvGetGuildBase = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGuildBase, this._s2cGetGuildBase.bind(this));
        this._recvGuildChangeName = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildChangeName, this._s2cGuildChangeName.bind(this));
        this._recvChangeGuildIcon = G_NetworkManager.add(MessageIDConst.ID_S2C_ChangeGuildIcon, this._s2cChangeGuildIcon.bind(this));
        this._recvQueryGuildTrain = G_NetworkManager.add(MessageIDConst.ID_S2C_QueryGuildTrain, this._s2cQueryGuildTrain.bind(this));
        this._recvInviteGuildTrainNotify = G_NetworkManager.add(MessageIDConst.ID_S2C_InviteGuildTrainNotify, this._s2cInviteGuildTrainNotify.bind(this));
        this._recvConfirmGuildTrain = G_NetworkManager.add(MessageIDConst.ID_S2C_ConfirmGuildTrain, this._s2cConfirmGuildTrain.bind(this));
        this._recvStartGuildTrainNotify = G_NetworkManager.add(MessageIDConst.ID_S2C_StartGuildTrainNotify, this._s2cStartGuildTrainNotify.bind(this));
        this._recvEndGuildTrainNotify = G_NetworkManager.add(MessageIDConst.ID_S2C_EndGuildTrainNotify, this._s2cEndGuildTrainNotify.bind(this));
        this._recvEndGuildTrain = G_NetworkManager.add(MessageIDConst.ID_S2C_EndGuildTrain, this._s2cEndGuildTrain.bind(this));
        this._recvGuildTrainChange = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildTrainChange, this._s2cGuildTrainChange.bind(this));
        this._recvInviteGuildTrainReturn = G_NetworkManager.add(MessageIDConst.ID_S2C_InviteGuildTrainReturn, this._s2cInviteGuildTrainReturn.bind(this));
        this._guildSetAutoJion = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildSetAutoJion,this._s2cGuildSetAutoJion.bind(this));
        this._guildSetWEQQAddress = G_NetworkManager.add(MessageIDConst.ID_S2C_GuildSetAddress,this._s2c_GuildSetAddress.bind(this))       
    }
    public clear() {
        this._recvGetUserGuild.remove();
        this._recvGetUserGuild = null;
        this._recvGetGuildList.remove();
        this._recvGetGuildList = null;
        this._recvCreateGuild.remove();
        this._recvCreateGuild = null;
        this._recvQueryGuildMall.remove();
        this._recvQueryGuildMall = null;
        this._recvGuildApplication.remove();
        this._recvGuildApplication = null;
        this._recvGuildCheckApplication.remove();
        this._recvGuildCheckApplication = null;
        this._recvGetGuildApplication.remove();
        this._recvGetGuildApplication = null;
        this._recvGuildLeave.remove();
        this._recvGuildLeave = null;
        this._recvSetGuildMessage.remove();
        this._recvSetGuildMessage = null;
        this._recvGetGuildMember.remove();
        this._recvGetGuildMember = null;
        this._recvGuildDismiss.remove();
        this._recvGuildDismiss = null;
        this._recvGuildKick.remove();
        this._recvGuildKick = null;
        this._recvLeaderImpeachment.remove();
        this._recvLeaderImpeachment = null;
        this._recvGuildTransfer.remove();
        this._recvGuildTransfer = null;
        this._recvGuildPromote.remove();
        this._recvGuildPromote = null;
        this._recvGetGuildSystemNotify.remove();
        this._recvGetGuildSystemNotify = null;
        this._recvGetGuildHelp.remove();
        this._recvGetGuildHelp = null;
        this._recvAppGuildHelp.remove();
        this._recvAppGuildHelp = null;
        this._recvUseGuildHelp.remove();
        this._recvUseGuildHelp = null;
        this._recvSurGuildHelp.remove();
        this._recvSurGuildHelp = null;
        this._recvGuildHelpReward.remove();
        this._recvGuildHelpReward = null;
        this._signalBuyArenaCount.remove();
        this._signalBuyArenaCount = null;
        this._recvGuildChangeState.remove();
        this._recvGuildChangeState = null;
        this._recvGetGuildRedBagList.remove();
        this._recvGetGuildRedBagList = null;
        this._recvOpenGuildRedBag.remove();
        this._recvOpenGuildRedBag = null;
        this._recvPutGuildRedBag.remove();
        this._recvPutGuildRedBag = null;
        this._recvGuildRedBagRespondNew.remove();
        this._recvGuildRedBagRespondNew = null;
        this._recvGuildRedBagRespondDel.remove();
        this._recvGuildRedBagRespondDel = null;
        this._recvGetGuildTaskReward.remove();
        this._recvGetGuildTaskReward = null;
        this._recvGuildDonate.remove();
        this._recvGuildDonate = null;
        this._recvGetGuildDonateReward.remove();
        this._recvGetGuildDonateReward = null;
        this._recvGetGuildBase.remove();
        this._recvGetGuildBase = null;
        this._recvGuildChangeName.remove();
        this._recvGuildChangeName = null;
        this._recvChangeGuildIcon.remove();
        this._recvChangeGuildIcon = null;
        this._recvQueryGuildTrain.remove();
        this._recvQueryGuildTrain = null;
        this._recvInviteGuildTrainNotify.remove();
        this._recvInviteGuildTrainNotify = null;
        this._recvConfirmGuildTrain.remove();
        this._recvConfirmGuildTrain = null;
        this._recvStartGuildTrainNotify.remove();
        this._recvStartGuildTrainNotify = null;
        this._recvEndGuildTrainNotify.remove();
        this._recvEndGuildTrainNotify = null;
        this._recvEndGuildTrain.remove();
        this._recvEndGuildTrain = null;
        this._recvGuildTrainChange.remove();
        this._recvGuildTrainChange = null;
        this._recvInviteGuildTrainReturn.remove();
        this._guildSetAutoJion.remove();
        this._guildSetAutoJion = null;
        this._guildSetWEQQAddress.remove();
        this._guildSetWEQQAddress = null;
        this._recvInviteGuildTrainReturn = null;
    }
    public reset() {
        this._guildListData = new GuildListData();
        this._userGuildInfo = null;
        this._myGuild = null;
        this._guildMemberList = {};
        this._myMemberData = null;
        this._guildApplicationList = {};
        this._guildNotifyList = {};
        this._myRequestHelp = null;
        this._guildHelpList = {};
        this._trainEndState = false;
        this._guildTrainingMemberList = {};
        this._guildTrainingMemberInfo = {};
        this._guildRedPacketList = {};
        this._guildOnlineGetRedPacketList = [];
        this._inviteTrainList = {};
        G_SignalManager.dispatch(SignalConst.EVENT_TRAIN_DATA_CLEAR);
    }
    public c2sQueryGuildTrain(_user) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_QueryGuildTrain, { user_id: _user });
        if (G_UserData.getBase().getId() != _user) {
            this._inviteTrainList[_user] = _user;
        }
    }
    public removeInviteMemberWithId(id) {
        if (this._inviteTrainList[id] != null) {
            this._inviteTrainList[id] = null;
        }
    }
    public getInviteTrainListById(id) {
        if (this._inviteTrainList[id] != null) {
            return this._inviteTrainList[id];
        }
        return null;
    }
    public _s2cQueryGuildTrain(id, message) {
        if (message.ret == MessageErrorConst.RET_OK) {
            if (message.hasOwnProperty('userId') && message.userId != G_UserData.getBase().getId()) {
                GuildUIHelper.getS2CQueryGuildTrain();
                if (G_UserData.getBase().getLevel() < this.getGuildMemberDataWithId(message.userId).getLevel()) {
                    this._guildTrainType = GUILD_TEAIN_TYPE.o2m;
                } else {
                    this._guildTrainType = GUILD_TEAIN_TYPE.m2o;
                }
            } else {
                this._guildTrainType = GUILD_TEAIN_TYPE.m2m;
            }
        } else if (message.ret == MessageErrorConst.RET_GUILD_TRAIN_TRAINING) {
            this.removeInviteMemberWithId(message.userId);
            G_SignalManager.dispatch(SignalConst.EVENT_TRAIN_INVITE_TIME_OUT);
        }
    }
    public _s2cInviteGuildTrainNotify(id, message) {
        if (G_UserData.getBase().getLevel() < message.level) {
            this._guildTrainType = GUILD_TEAIN_TYPE.o2m;
        } else {
            this._guildTrainType = GUILD_TEAIN_TYPE.m2o;
        }
        let userData = new GuildTrainData(message);
        let currTime = G_ServerTime.getTime();
        userData.setInviteEndTime(currTime + 10);
        userData.startCountDown();
        GuildUIHelper.pushGuildTeamApply(userData);
    }
    public _s2cEndGuildTrainNotify(id, message) {
        this.setTrainEndState(true);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_TRAIN_AUTO_END, message.totalExp);
    }
    public c2sEndGuildTrain() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_EndGuildTrain, {});
    }
    public _s2cEndGuildTrain(id, message) {
        this.setTrainEndState(true);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_TRAIN_FORCE_END);
    }
    public _s2cGuildTrainChange(id, message) {
        if (message.hasOwnProperty('users')) {
            this._setGuildTrainDataList(message.users);
        } else {
            this._guildTrainDataList = {};
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_TRAIN_UPDATE);
    }
    public c2sConfirmGuildTrain(_user, _accept) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ConfirmGuildTrain, {
            userId: _user,
            accept: _accept
        });
    }
    public getGuildTrainType() {
        return this._guildTrainType;
    }
    public getGuildTrainTotalExp(level, index) {
        let Training = G_ConfigLoader.getConfig(ConfigNameConst.TRAINING);
        let length = Training.length();
        for (let i = 0; i < length; i += 1) {
            let cfg = Training.indexOf(i);
            if (cfg.role_lv == level) {
                if (this._guildTrainType == GUILD_TEAIN_TYPE.m2m) {
                    return cfg.exp_3;
                } else if (index == 1) {
                    return cfg.exp_1;
                } else if (index == 2) {
                    return cfg.exp_2;
                }
            }
        }
    }
    public getGuildPercentExp(level, index) {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let percentExp = 0;
        if (level != null) {
            let totalExp = this.getGuildTrainTotalExp(level, index);
            let totalTime = Number(Parameter.get(ParameterIDConst.TRAIN_LIMIT_TIME).content);
            let expGap = Number(Parameter.get(ParameterIDConst.TRAIN_PERCENT_EXP).content);
            let times = Math.ceil(totalTime / expGap);
            percentExp = Math.floor(totalExp / times);
        }
        return percentExp;
    }
    public getGuildPercentExpByOneS(level, index) {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let percentExp = 0;
        if (level != null) {
            let totalExp = this.getGuildTrainTotalExp(level, index);
            let totalTime = Number(Parameter.get(ParameterIDConst.TRAIN_LIMIT_TIME).content);
            percentExp = Math.floor(totalExp / totalTime);
        }
        return percentExp;
    }
    public setTrainEndState(state) {
        this._trainEndState = state;
    }
    public getTrainEndState() {
        return this._trainEndState;
    }
    public _s2cConfirmGuildTrain(id, message) {
    }
    public _s2cInviteGuildTrainReturn(id, message) {
        this.removeInviteMemberWithId(message.uid);
        if (message['accept'] == false) {
            GuildUIHelper.getConfirmGuildTrain(message.name);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TRAIN_INVITE_TIME_OUT);
    }
    public _s2cStartGuildTrainNotify(id, message) {
        this._setGuildTrainDataList(message.users);
        this._setTrainTime(message);
        this.setTrainEndState(false);
        GuildUIHelper.getS2CStartGuildTrainNotify();
    }
    public _initOtherGuildTrainList() {
        this._otherGuildTrainList = [];
        for (let i = 1; i <= 8; i++) {
            this._otherGuildTrainList.push({});
        }
    }
    public _setGuildTrainDataList(userData) {
        this._guildTrainDataList = [];
        for (let k in userData) {
            let v = userData[k];
            let temp: any = {};
            if (v.hasOwnProperty('user') && v.hasOwnProperty('tar_user')) {
                let firstData = new GuildTrainData(v.user);
                let secondData = new GuildTrainData(v.tar_user);
                if (firstData.getLevel() >= secondData.getLevel()) {
                    temp.first = firstData;
                    temp.second = secondData;
                } else {
                    temp.first = secondData;
                    temp.second = firstData;
                }
            } else if (v.hasOwnProperty('user') == false && v.hasOwnProperty('tar_user')) {
                temp.first = new GuildTrainData(v.tar_user);
                temp.second = null;
            } else if (v.hasOwnProperty('user') && v.hasOwnProperty('tar_user') == false) {
                temp.first = new GuildTrainData(v.user);
                temp.second = null;
            }
            this._guildTrainDataList.push(temp);
        }
    }
    public getMyGuildTrainTeamInfo() {
        let myTeamInfo: any = {};
        for (let k in this._guildTrainDataList) {
            let v = this._guildTrainDataList[k];
            if (v.hasOwnProperty('first') && v.first && v.first.getUser_id() == G_UserData.getBase().getId() || v.hasOwnProperty('second') && v.second && v.second.getUser_id() == G_UserData.getBase().getId()) {
                myTeamInfo.first = v.first;
                myTeamInfo.second = v.second;
            }
        }
        return myTeamInfo;
    }
    public getOtherGuildTrainTeamInfo() {
        let tmpOther = [];
        for (let k in this._guildTrainDataList) {
            let v = this._guildTrainDataList[k];
            let myId = G_UserData.getBase().getId();
            if (!(v.hasOwnProperty('first') && v.first && v.first.getUser_id() == myId || v.hasOwnProperty('second') && v.second && v.second.getUser_id() == myId)) {
                let temp: any = {};
                temp.first = v.first;
                temp.second = v.second;
                tmpOther.push(temp);
                if (this.isOtherTrainListHaveTeam(this._otherGuildTrainList, temp) == false) {
                    for (let i = 1; i <= 8; i++) {
                        if (this.isEmptyTeam(this._otherGuildTrainList[i])) {
                            this._otherGuildTrainList[i] = temp;
                            break;
                        }
                    }
                }
            }
        }
        for (let j = 1; j <= 8; j++) {
            if (this.isEmptyTeam(this._otherGuildTrainList[j]) == false) {
                if (this.isOtherTrainListHaveTeam(tmpOther, this._otherGuildTrainList[j]) == false) {
                    this._otherGuildTrainList[j] = {};
                }
            }
        }
        if (tmpOther.length == 0) {
            this._initOtherGuildTrainList();
        }
        return this._otherGuildTrainList;
    }
    public isTheSameTeam(t1, t2) {
        if (t1 != null && t2 != null) {
            if (t1.hasOwnProperty('first') && t2.hasOwnProperty('first') && t1.hasOwnProperty('second') && t2.hasOwnProperty('second')) {
                if (t1.first.getUser_id() == t2.first.getUser_id() && t1.second.getUser_id() == t2.second.getUser_id()) {
                    return true;
                }
            }
            if (t1.hasOwnProperty('first') && t2.hasOwnProperty('first') && t1.hasOwnProperty('second') == false && t2.hasOwnProperty('second') == false) {
                if (t1.first.getUser_id() == t2.first.getUser_id()) {
                    return true;
                }
            }
            if (t1.hasOwnProperty('first') == false && t2.hasOwnProperty('first') == false && t1.hasOwnProperty('second') && t2.hasOwnProperty('second')) {
                if (t1.second.getUser_id() == t2.second.getUser_id()) {
                    return true;
                }
            }
        }
        return false;
    }
    public isEmptyTeam(v) {
        if (v == null || v.first == null && v.second == null) {
            return true;
        }
        return false;
    }
    public isOtherTrainListHaveTeam(table, v) {
        for (let i = 0; i < table.length; i++) {
            if (this.isTheSameTeam(table[i], v)) {
                return true;
            }
        }
        return false;
    }
    public _setTrainTime(message) {
        this._trainTime = {};
        this._trainTime.startTime = message.starttime;
        this._trainTime.endTime = message.endtime;
    }
    public getTrainTime() {
        return this._trainTime;
    }
    public c2sGetUserGuild() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserGuild, {});
    }
    public _s2cGetUserGuild(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.resetTime();
        this._userGuildInfo = null;
        let userGuildInfo = message['user_guild'];
        if (userGuildInfo) {
            this._userGuildInfo = new GuildUserData(userGuildInfo);
            if (!this.isInGuild()) {
                this._doKick(G_UserData.getBase().getId());
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARMY_GROUP);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_GET_USER_GUILD);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE, 0);
    }
    public _doKick(uid) {
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_KICK_NOTICE, uid);
        if (uid == G_UserData.getBase().getId()) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE, 0);
        }
    }
    public getUserGuildInfo() {
        return this._userGuildInfo;
    }
    public isInGuild() {
        if (this._userGuildInfo == null) {
            return false;
        }
        let guildId = this._userGuildInfo.getGuild_id();
        return guildId != 0;
    }
    public c2sGetGuildList(num) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildList, { num: num });
    }
    public _s2cGetGuildList(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.num == 1) {
            this._guildListData = new GuildListData();
        }
        if (this._guildListData) {
            this._guildListData.addNewPage(message);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_GET_LIST);
    }
    public getGuildListData() {
        return this._guildListData;
    }
    public _createMyGuidData(guild) {
        let unitData = new GuildUnitData(guild);
        unitData.initTaskData(guild);
        this._myGuild = unitData;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARMY_GROUP);
    }
    public c2sCreateGuild(guildName) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CreateGuild, { guild_name: guildName });
    }
    public _s2cCreateGuild(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let guild = message['guild'];
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CREATE_SUCCESS);
    }
    public c2sQueryGuildMall() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_QueryGuildMall, {});
    }
    public _s2cQueryGuildMall(id, message) {
        cc.log(message, '军团', 6);
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let guild = message['guild'];
        this._createMyGuidData(guild);
        let members = message['members'] || {};
        this.updateMemberList(members);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_QUERY_MALL);
        if (this._positionNotifyFlag) {
            this._positionNotifyFlag = false;
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE);
        }
    }
    public getMyGuild() {
        return this._myGuild;
    }
    public getMyGuildLevel() {
        if (!this.isInGuild()) {
            return 0;
        }
        let level = 0;
        if (this._myGuild) {
            level = Math.max(level, this._myGuild.getLevel());
        }
        return level;
    }
    public getMyGuildExp() {
        if (!this.isInGuild()) {
            return 0;
        }
        let exp = 0;
        if (this._myGuild) {
            exp = Math.max(exp, this._myGuild.getExp());
        }
        return exp;
    }
    public getMyGuildId() {
        if (!this.isInGuild()) {
            return 0;
        }
        return this._userGuildInfo.getGuild_id();
    }
    public c2sGuildApplication(guildId, op) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildApplication, {
            guild_id: guildId,
            op: op
        });
    }
    public _s2cGuildApplication(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            if (message.ret == MessageErrorConst.RET_GUILD_NOT_FOUND_APPLICATION) {
                this.c2sGetGuildApplication();
            }
            return;
        }
        let guildId = message['guild_id'] || 0;
        let op = message['op'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_APPLY_SUCCESS, guildId, op);
    }
    public c2sGuildCheckApplication(applicationId, op) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildCheckApplication, {
            application_id: applicationId,
            op: op
        });
    }
    public _s2cGuildCheckApplication(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let op = message['op'] || 0;
        let applicationId = message['application_id'] || 0;
        G_UserData.getGuild().deleteApplicationDataWithId(applicationId);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CHECK_APPLICATION_SUCCESS, op, applicationId);
    }
    public c2sGuildSetAddress(address_type,address):void{
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildSetAddress, {
            address_type:address_type,
            address:address
         });
    }
    public _s2c_GuildSetAddress(id,message):void{
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var data:any = {};
        data.address_type = message.address_type;
        data.address = message.address;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SET_WE_QQ_ADDRESS, data);
    }
    public c2sGuildSetAutoJion(power,auto):void{
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildSetAutoJion, {
           power:power,
           auto:auto
        });
    }
    public _s2cGuildSetAutoJion(id,message){
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var data:any = {};
        data.power = message.power;
        data.auto = message.auto;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SET_AUTO_JION, data);
    }
    public c2sGetGuildApplication() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildApplication, {});
    }
    public _s2cGetGuildApplication(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._guildApplicationList = {};
        let applications = message['applications'] || {};
        for (let i in applications) {
            let data = applications[i];
            this._setGuildApplicationData(data);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_GET_APPLICATION, applications);
    }
    public _setGuildApplicationData(data) {
        this._guildApplicationList['k_' + String(data.uid)] = null;
        let unitData = new GuildApplicationData(data);
        this._guildApplicationList['k_' + String(data.uid)] = unitData;
    }
    public getGuildApplicationListBySort() {
        let result = [];
        for (let k in this._guildApplicationList) {
            let data = this._guildApplicationList[k];
            result.push(data);
        }
        return result;
    }
    public deleteApplicationDataWithId(applicationId) {
        if (applicationId == null) {
            return;
        }
        if (applicationId == 0) {
            this._guildApplicationList = {};
        } else {
            this._guildApplicationList['k_' + String(applicationId)] = null;
        }
    }
    public c2sGuildDismiss() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildDismiss, {});
    }
    public _s2cGuildDismiss(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._userGuildInfo.setGuild_id(0);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARMY_GROUP);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_DISMISS_SUCCESS);
    }
    public c2sGuildLeave() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildLeave, {});
    }
    public _s2cGuildLeave(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_LEAVE_SUCCESS);
    }
    public c2sSetGuildMessage(content, type) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SetGuildMessage, {
            content: content,
            type: type
        });
    }
    public _s2cSetGuildMessage(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let type = message['type'] || 0;
        let content = message['content'] || '';
        if (type == GuildConst.GUILD_MESSAGE_TYPE_1) {
            G_UserData.getGuild().getMyGuild().setAnnouncement(content);
        } else if (type == GuildConst.GUILD_MESSAGE_TYPE_2) {
            G_UserData.getGuild().getMyGuild().setDeclaration(content);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SET_MESSAGE_SUCCESS, type);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE);
    }
    public c2sGetGuildMember() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildMember, {});
    }
    public _s2cGetGuildMember(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let members = message['members'] || {};
        this.updateMemberList(members);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_GET_MEMBER_LIST);
    }
    public updateMemberList(members) {
        this._guildMemberList = {};
        for (let i in members) {
            let data = members[i];
            this._setGuildMemberData(data);
        }
    }
    public updateGuildMemberData(data) {
        this._setGuildMemberData(data);
    }
    public _setGuildMemberData(data) {
        this._guildMemberList['k_' + data.uid] = null;
        let unitData = new GuildMemberData(data);
        this._guildMemberList['k_' + data.uid] = unitData;
        let userId = G_UserData.getBase().getId();
        if (userId == data.uid) {
            this._myMemberData = unitData;
        }
        this._memberListIsDirt = true;
    }
    public getGuildMemberList() {
        this._arrangeGuildMemberList();
        return this._guildMemberList;
    }
    public _arrangeGuildMemberList() {
        if (!this._memberListIsDirt) {
            return;
        }
        this._memberListIsDirt = false;
        let result = [];
        for (let k in this._guildMemberList) {
            let unit = this._guildMemberList[k];
            result.push(unit);
        }
        let sortFunc = function (obj1, obj2) {
            if (obj1.getPower() != obj2.getPower()) {
                return obj1.getPower() > obj2.getPower();
            }
            return obj1.getUid() < obj2.getUid();
        };
        ArraySort(result, sortFunc);
        for (let k in result) {
            let unit = result[k];
            // cc.warn(' ddd----------  ' + k);
            unit.setRankPower(k);
        }
    }
    public getMyMemberData() {
        // this._arrangeGuildMemberList();
        return this._myMemberData;
    }
    public getGuildMemberListBySort() {
        this._arrangeGuildMemberList();
        let result = [];
        function sortFun(a, b) {
            let selfA = a.isSelf() && 1 || 0;
            let selfB = b.isSelf() && 1 || 0;
            if (selfA != selfB) {
                return selfA > selfB;
            }
            if (a.getPosition() != b.getPosition()) {
                return a.getPosition() < b.getPosition();
            }
            let onlineA = a.isOnline() && 1 || 0;
            let onlineB = b.isOnline() && 1 || 0;
            if (onlineA != onlineB) {
                return onlineA > onlineB;
            }
            return a.getOffline() > b.getOffline();
        }
        for (let k in this._guildMemberList) {
            let unit = this._guildMemberList[k];
            result.push(unit);
        }
        ArraySort(result, sortFun);
        return result;
    }
    public getGuildMemberDataWithId(id) {
        if (id != 0) {
            this._arrangeGuildMemberList();
            let unitData = this._guildMemberList['k_' + String(id)];
            return unitData;
        }
        return null;
    }
    public getGuildMemberCount() {
        let count = 0;
        for (let k in this._guildMemberList) {
            let v = this._guildMemberList[k];
            count = count + 1;
        }
        return count;
    }
    public getElderCount() {
        let count = 0;
        for (let k in this._guildMemberList) {
            let data = this._guildMemberList[k];
            if (data.getPosition() == GuildConst.GUILD_POSITION_3) {
                count = count + 1;
            }
        }
        return count;
    }
    public getMateCount() {
        let count = 0;
        for (let k in this._guildMemberList) {
            let data = this._guildMemberList[k];
            if (data.getPosition() == GuildConst.GUILD_POSITION_2) {
                count = count + 1;
            }
        }
        return count;
    }
    public c2sGuildKick(uid) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildKick, { uid: uid });
    }
    public _s2cGuildKick(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let uid = message['uid'] || null;
        this._doKick(uid);
    }
    public c2sLeaderImpeachment() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_LeaderImpeachment, {});
    }
    public _s2cLeaderImpeachment(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_IMPEACHMENT_LEADER_SUCCESS);
    }
    public c2sGuildTransfer(uid) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildTransfer, { uid: uid });
    }
    public _s2cGuildTransfer(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let uid = message['uid'] || 0;
        let data = this.getGuildMemberDataWithId(uid);
        let oldPosition = data.getPosition();
        data.setPosition(GuildConst.GUILD_POSITION_1);
        this._myMemberData.setPosition(oldPosition);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_TRANSFER_LEADER_SUCCESS, uid);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE);
    }
    public c2sGuildPromote(uid, op) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildPromote, {
            uid: uid,
            op: op
        });
    }
    public _s2cGuildPromote(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let uid = message['uid'] || 0;
        let op = message['op'] || 0;
        let data = this.getGuildMemberDataWithId(uid);
        data.setPosition(op);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, uid, op);
    }
    public c2sGetGuildSystemNotify() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildSystemNotify, {});
    }
    public _s2cGetGuildSystemNotify(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._guildNotifyList = [];
        let notifyDatas = message['notify'] || {};
        for (let i in notifyDatas) {
            let data = notifyDatas[i];
            this._setGuildSystemNotifyData(data);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_GET_SYSTEM_NOTIFY);
    }
    public _setGuildSystemNotifyData(data) {
        let unitData = new GuildSystemNotifyData(data);
        this._guildNotifyList.push(unitData);
    }
    public getSystemNotifyData() {
        return this._guildNotifyList;
    }
    public c2sGetGuildHelp() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildHelp, {});
    }
    public _s2cGetGuildHelp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._myRequestHelp = new GuildHelpData();
        this._guildHelpList = {};
        let members = message['members'] || {};
        for (let i in members) {
            let data = members[i];
            this._setGuildHelpData(data);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_GET_HELP_LIST_SUCCESS);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARMY_GROUP);
    }
    public _s2cBuyCommonCount(id, message) {
        if (message.ret != 1) {
            return;
        }
        let funcId = message.id;
        if (funcId == BuyCountIDConst.GUILD_HELP) {
            let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
            userGuildInfo.setAsk_help_cnt(message.cnt);
            userGuildInfo.setAsk_help_buy(message.buy_cnt);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_COMMON_COUNT_CHANGE, funcId);
    }
    public _setGuildHelpData(data) {
        let member = data['member'];
        let memberData = new GuildMemberData(member);
        let uid = memberData.getUid();
        let userId = G_UserData.getBase().getId();
        if (uid == userId) {
            let unitData = new GuildHelpData();
            unitData.setMember(memberData);
            let helpBaseTable = {};
            let helpBases = data['help_base'] || {};
            for (let i in helpBases) {
                let helpBase = helpBases[i];
                let helpBaseData = new GuildHelpBaseData(helpBase);
                let helpNo = helpBaseData.getHelp_no();
                helpBaseTable['k_' + helpNo] = helpBaseData;
            }
            unitData.setHelp_base(helpBaseTable);
            this._myRequestHelp = unitData;
        } else {
            let helpBases = data['help_base'] || {};
            for (let i in helpBases) {
                let helpBase = helpBases[i];
                let unitData = new GuildHelpData();
                unitData.setMember(memberData);
                let helpBaseData = new GuildHelpBaseData(helpBase);
                unitData.setHelp_base(helpBaseData);
                let uid = memberData.getUid();
                let helpNo = helpBaseData.getHelp_no();
                if (this._guildHelpList[uid] == null) {
                    this._guildHelpList[uid] = {};
                }
                if (this._guildHelpList[uid][helpNo] == null) {
                    this._guildHelpList[uid][helpNo] = unitData;
                }
            }
        }
    }
    public getGuildHelpListBySort() {
        function sortFun(a, b) {
            let timeA = a.getHelp_base().getTime();
            let timeB = b.getHelp_base().getTime();
            if (timeA && timeB) {
                return timeA < timeB;
            }
            else {
                return false;
            }
        }
        let result = [];
        for (let k in this._guildHelpList) {
            let member = this._guildHelpList[k];
            for (let j in member) {
                let unit = member[j];
                if (unit) {
                    result.push(unit);
                }
            }
        }
        ArraySort(result, sortFun);
        return result;
    }
    public getMyRequestHelp() {
        return this._myRequestHelp;
    }
    public getMyRequestHelpBaseDataWithPos(pos) {
        let helpBases = this._myRequestHelp.getHelp_base();
        return helpBases['k_' + pos];
    }
    public c2sAppGuildHelp(helpNo, helpId) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_AppGuildHelp, {
            helpNo: helpNo,
            helpId: helpId
        });
    }
    public _s2cAppGuildHelp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let helpNo = message['helpNo'];
        let helpId = message['helpId'];
        let helpBase = message['help_base'];
        let helpBaseData = new GuildHelpBaseData(helpBase);
        this._myRequestHelp.getHelp_base()['k_' + helpNo] = helpBaseData;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_APP_HELP_SUCCESS);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ARMY_GROUP);
    }
    public c2sUseGuildHelp(helpNo) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_UseGuildHelp, { helpNo: helpNo });
    }
    public _s2cUseGuildHelp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let helpNo = message['helpNo'];
        let helpBase = message['help_base'];
        let award = message['award'] || {};
        let helpBaseData = new GuildHelpBaseData(helpBase);
        this._myRequestHelp.getHelp_base()['k_' + helpNo] = helpBaseData;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_RECEIVE_HELP_SUCCESS, award);
    }
    public c2sSurGuildHelp(uid, helpNo) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_SurGuildHelp, {
            uid: uid,
            helpNo: helpNo
        });
    }
    public _s2cSurGuildHelp(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            if (message.ret == MessageErrorConst.RET_GUILD_HELP_LIMIT) {
                this.c2sGetGuildHelp();
            }
            return;
        }
        let uid = message['uid'];
        let helpNo = message['helpNo'];
        let helpBase = message['help_base'];
        let award = message['award'] || {};
        let helpBaseData = new GuildHelpBaseData(helpBase);
        let limitMax = helpBaseData.getLimit_max();
        let alreadyHelp = helpBaseData.getAlready_help();
        if (alreadyHelp == limitMax) {
            this._guildHelpList[uid][helpNo] = null;
        } else {
            this._guildHelpList[uid][helpNo].setHelp_base(helpBaseData);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SUR_HELP_SUCCESS, award);
    }
    public c2sGuildHelpReward() {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildHelpReward, {});
    }
    public _s2cGuildHelpReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let award = message['award'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_RECEIVE_HELP_REWARD_SUCCESS, award);
    }
    public c2sBuyCommonCount() {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_BuyCommonCount, { id: BuyCountIDConst.GUILD_HELP });
    }
    public _s2cGuildChangeState(id, message) {
        let stateId = message.state_id;
        if (stateId == 1) {
            G_UserData.getGuild().c2sQueryGuildMall();
            this._positionNotifyFlag = true;
        }
    }
    public pullData() {
        cc.warn(' -------------- pullData');
        this.c2sGetGuildBase();
        this.c2sGetGuildHelp();
        this.c2sGetUserGuild();
    }
    public hasAddGuildRedPoint() {
        return !this.isInGuild();
    }
    public hasGiveHelpRedPoint() {
        if (!this.isInGuild()) {
            return false;
        }
        let count = G_UserData.getGuild().getUserGuildInfo().getAsk_help_cnt();
        let buyCount = G_UserData.getGuild().getUserGuildInfo().getAsk_help_buy();
        let showFreeCount = count > 0 && buyCount <= 0;
        return showFreeCount;
    }
    public hasHelpRewardRedPoint() {
        if (!this.isInGuild()) {
            return false;
        }
        let count = G_UserData.getGuild().getUserGuildInfo().getFinish_help_cnt();
        let totalCount = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.GUILD_RECOURSE_TIMES_ID).content);
        let isReceived = G_UserData.getGuild().getUserGuildInfo().getGet_help_reward() != 0;
        if (!isReceived && count >= totalCount) {
            return true;
        }
        return false;
    }
    public hasCanContributionRedPoint() {
        if (!this.isInGuild()) {
            return false;
        }
        let donate = this.getUserGuildInfo().getDonate();
        if (donate == 0) {
            return true;
        }
        return false;
    }
    public getMyRedPacketList() {
        let list = [];
        for (let k in this._guildRedPacketList) {
            let v = this._guildRedPacketList[k];
            if (v.getUser_id() == G_UserData.getBase().getId()) {
                list.push(v);
            }
        }
        let orderValues = {
            [GuildConst.GUILD_RED_PACKET_NO_SEND]: 1,
            [GuildConst.GUILD_RED_PACKET_NO_RECEIVE]: 2,
            [GuildConst.GUILD_RED_PACKET_RECEIVED]: 3
        };
        let sortFunc = function (obj1, obj2) {
            if (obj1.getRed_bag_state() != obj2.getRed_bag_state()) {
                return orderValues[obj1.getRed_bag_state()] < orderValues[obj2.getRed_bag_state()];
            }
            if (obj1.getConfig().index != obj2.getConfig().index) {
                return obj1.getConfig().index < obj2.getConfig().index;
            }
            return obj1.getId() < obj2.getId();
        };
        ArraySort(list, sortFunc);
        return list;
    }
    public getAllGuildRedPacketList() {
        let list = [];
        for (let k in this._guildRedPacketList) {
            let v = this._guildRedPacketList[k];
            list.push(v);
        }
        let orderValues = {
            [GuildConst.GUILD_RED_PACKET_NO_SEND]: 2,
            [GuildConst.GUILD_RED_PACKET_NO_RECEIVE]: 1,
            [GuildConst.GUILD_RED_PACKET_RECEIVED]: 3
        };
        let sortFunc = function (obj1, obj2) {
            if (obj1.getRed_bag_state() != obj2.getRed_bag_state()) {
                return orderValues[obj1.getRed_bag_state()] < orderValues[obj2.getRed_bag_state()];
            }
            if (obj1.getRed_bag_state() == GuildConst.GUILD_RED_PACKET_NO_SEND) {
                if (obj1.getUser_id() == G_UserData.getBase().getId() && obj2.getUser_id() == G_UserData.getBase().getId()) {
                } else if (obj1.getUser_id() == G_UserData.getBase().getId() || obj2.getUser_id() == G_UserData.getBase().getId()) {
                    return obj1.getUser_id() == G_UserData.getBase().getId();
                }
            }
            if (obj1.getConfig().index != obj2.getConfig().index) {
                return obj1.getConfig().index < obj2.getConfig().index;
            }
            return obj1.getId() < obj2.getId();
        };
        ArraySort(list, sortFunc);
        return list;
    }
    public getCurrSnatchRedPacket() {
        let inGuild = this.isInGuild();
        let list = [];
        for (let k in this._guildOnlineGetRedPacketList) {
            let v = this._guildOnlineGetRedPacketList[k];
            let redPacketData = this._guildRedPacketList[k];
            if (redPacketData && redPacketData.getRed_bag_state() == GuildConst.GUILD_RED_PACKET_NO_RECEIVE) {
                let type = redPacketData.getConfig().type;
                if (inGuild || GuildConst.RED_PACKET_TYPE_OF_NOT_GUILDS[type]) {
                    list.push(redPacketData);
                }
            }
        }
        let sortFunc = function (obj1, obj2) {
            return obj1.getId() > obj2.getId();
        };
        ArraySort(list, sortFunc);
        return list[0];
    }
    public isCanGiveRedPacket(redPacketId) {
        if (!this.isInGuild()) {
            return false;
        }
        let redPacketUnitData = this._getRedPacketUnitData(redPacketId);
        if (redPacketUnitData && redPacketUnitData.getRed_bag_state() == GuildConst.GUILD_RED_PACKET_NO_SEND && redPacketUnitData.isSelfRedPacket()) {
            return true;
        }
        return false;
    }
    public _getRedPacketUnitData(id) {
        let redPacketData = this._guildRedPacketList[id];
        return redPacketData;
    }
    public _createRedPacketInfoData(v) {
        let data = new GuildRedPacketInfoData(v);
        this._guildRedPacketList[v.id] = data;
        return data;
    }
    public _deleteRedPacketInfoData(id) {
        let redPacketData = this._guildRedPacketList[id];
        if (redPacketData) {
            redPacketData.setRed_bag_state(GuildConst.GUILD_RED_PACKET_INVALID);
        }
        this._guildRedPacketList[id] = null;
        return redPacketData;
    }
    public c2sGetGuildRedBagList(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildRedBagList, {});
    }
    public _s2cGetGuildRedBagList(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._guildRedPacketList = {};
        let redBagList = message['red_bag_list'] || {};
        for (let k in redBagList) {
            let v = redBagList[k];
            this._createRedPacketInfoData(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_RED_PACKET_GET_LIST, this._guildRedPacketList);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE, 0);
    }
    public c2sOpenGuildRedBag(id) {
        let num = UserDataHelper.getCanSnatchRedPacketNum();
        if (num <= 1) {
            this.setLastCanSnatchRedPacketHintFlag(true);
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_OpenGuildRedBag, { id: id });
    }
    public c2sSeeGuildRedBag(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_OpenGuildRedBag, { id: id });
    }
    public _s2cOpenGuildRedBag(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let myRedBagUser = null;
        let openRedBagUserList = [];
        let redPacketData = this._guildRedPacketList[message.id];
        let redBagList = message['red_bag_list'] || {};
        for (let k in redBagList) {
            let v = redBagList[k];
            let data = new GuildOpenRedBagUserData(v);
            openRedBagUserList.push(data);
            if (data.getUser_id() == G_UserData.getBase().getId()) {
                myRedBagUser = data;
            }
        }
        let snatchSuccess = false;
        if (myRedBagUser) {
            if (redPacketData) {
                if (redPacketData.getRed_bag_state() == GuildConst.GUILD_RED_PACKET_NO_RECEIVE) {
                    snatchSuccess = true;
                }
                redPacketData.setRed_bag_state(GuildConst.GUILD_RED_PACKET_RECEIVED);
            }
        } else {
            if (redPacketData) {
                redPacketData.setRed_bag_state(GuildConst.GUILD_RED_PACKET_RECEIVED);
            }
        }
        if (redPacketData) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_RED_PACKET_OPEN_NOTICE, redPacketData, openRedBagUserList, snatchSuccess);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE, 0);
    }
    public c2sPutGuildRedBag(id, multiple) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PutGuildRedBag, {
            id: id,
            multiple: multiple || 1
        });
    }
    public _s2cPutGuildRedBag(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
    }
    public _s2cGuildRedBagRespondNew(id, message) {
        if (!G_UserData.isFlush()) {
            return;
        }
        let redPacketData = this._createRedPacketInfoData(message.new_bag);
        this._guildOnlineGetRedPacketList[redPacketData.getId()] = true;
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_RED_PACKET_SEND, redPacketData);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE, 0);
    }
    public _s2cGuildRedBagRespondDel(id, message) {
        if (!G_UserData.isFlush()) {
            return;
        }
        let redPacketData = this._deleteRedPacketInfoData(message.id);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_RED_PACKET_DELETE, redPacketData);
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE, 0);
    }
    public c2sGetGuildTaskReward(box_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildTaskReward, { box_id: box_id });
    }
    public _s2cGetGuildTaskReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.hasOwnProperty('box_id')) {
            let userGuildInfo = G_UserData.getGuild().getUserGuildInfo();
            userGuildInfo.setBoxReceived(message.box_id);
        }
        let rewards = message['rewards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_BOX_REWARD, rewards);
    }
    public c2sGuildDonate(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildDonate, { id: id });
    }
    public _s2cGuildDonate(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let rewards = message['award'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CONTRIBUTION, rewards);
    }
    public c2sGetGuildDonateReward(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildDonateReward, { id: id });
    }
    public _s2cGetGuildDonateReward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let rewards = message['award'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_CONTRIBUTION_BOX_REWARD, rewards);
    }
    public c2sGetGuildBase() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGuildBase, {});
    }
    public _s2cGetGuildBase(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let myMember = message['self_member'];
        if (myMember && this._guildMemberList['k_' + String(myMember.uid)] == null) {
            this._setGuildMemberData(myMember);
        }
        let guild = message['guild'];
        if (guild) {
            this._createMyGuidData(guild);
        }
    }
    public c2sGuildChangeName(name) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GuildChangeName, { name: name });
    }
    public _s2cGuildChangeName(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_NAME_CHANGE);
    }
    public c2sChangeGuildIcon(iconId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeGuildIcon, { icon_id: iconId });
    }
    public _s2cChangeGuildIcon(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_FLAG_CHANGE);
    }
}
