import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ServerTime, G_ConfigLoader, G_ServiceManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { FriendConst } from "../const/FriendConst";
import { ArraySort } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { FriendUnitData } from "./FriendUnitData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { UserCheck } from "../utils/logic/UserCheck";
import { DataConst } from "../const/DataConst";
import { FunctionConst } from "../const/FunctionConst";

export interface FriendData {
    getSuggestRefreshTime(): number
    setSuggestRefreshTime(value: number): void
    getLastSuggestRefreshTime(): number

    getSuggestTempListData(): FriendUnitData[]
    setSuggestTempListData(value: FriendUnitData[]): void
    getLastSuggestTempListData(): FriendUnitData[]
}
let schema = {};
schema['suggestRefreshTime'] = [
    'number',
    0
];
schema['suggestTempListData'] = ['object'];
export class FriendData extends BaseData {
    public static schema = schema;

    _blackList;
    _friendList;
    _datas;
    _isNeedRecord;
    _signalRecvFriendRespond;
    _signalRecvAddFriend;
    _signalRecvGetFriendPresent;
    _signalRecvDelFriend;
    _signalRecvRecommandFriend;
    _signalRecvFriendPresent;
    _signalRecvConfirmAddFriend;
    _signalRecvGetFriendList;
    _signalRecvRecoverInfo;
    _signalCleanData;
    constructor(properties?) {
        super(properties);
        this._blackList = {};
        this._friendList = {};
        this._datas = null;
        this._isNeedRecord = null;
        this._signalRecvFriendRespond = G_NetworkManager.add(MessageIDConst.ID_S2C_FriendRespond, this._s2cFriendRespond.bind(this));
        this._signalRecvAddFriend = G_NetworkManager.add(MessageIDConst.ID_S2C_AddFriend, this._s2cAddFriend.bind(this));
        this._signalRecvGetFriendPresent = G_NetworkManager.add(MessageIDConst.ID_S2C_GetFriendPresent, this._s2cGetFriendPresent.bind(this));
        this._signalRecvDelFriend = G_NetworkManager.add(MessageIDConst.ID_S2C_DelFriend, this._s2cDelFriend.bind(this));
        this._signalRecvRecommandFriend = G_NetworkManager.add(MessageIDConst.ID_S2C_RecommandFriend, this._s2cRecommandFriend.bind(this));
        this._signalRecvFriendPresent = G_NetworkManager.add(MessageIDConst.ID_S2C_FriendPresent, this._s2cFriendPresent.bind(this));
        this._signalRecvConfirmAddFriend = G_NetworkManager.add(MessageIDConst.ID_S2C_ConfirmAddFriend, this._s2cConfirmAddFriend.bind(this));
        this._signalRecvGetFriendList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetFriendList, this._s2cGetFriendList.bind(this));
        this._signalRecvRecoverInfo = G_SignalManager.add(SignalConst.EVENT_RECV_RECOVER_INFO, this._eventRecvRecoverInfo.bind(this));
        this._signalCleanData = G_SignalManager.add(SignalConst.EVENT_CLEAN_DATA_CLOCK, this._eventCleanData.bind(this));
    }
    public clear() {
        this._signalRecvFriendRespond.remove();
        this._signalRecvFriendRespond = null;
        this._signalRecvAddFriend.remove();
        this._signalRecvAddFriend = null;
        this._signalRecvGetFriendPresent.remove();
        this._signalRecvGetFriendPresent = null;
        this._signalRecvDelFriend.remove();
        this._signalRecvDelFriend = null;
        this._signalRecvRecommandFriend.remove();
        this._signalRecvRecommandFriend = null;
        this._signalRecvFriendPresent.remove();
        this._signalRecvFriendPresent = null;
        this._signalRecvConfirmAddFriend.remove();
        this._signalRecvConfirmAddFriend = null;
        this._signalRecvGetFriendList.remove();
        this._signalRecvGetFriendList = null;
        this._signalRecvRecoverInfo.remove();
        this._signalRecvRecoverInfo = null;
        this._signalCleanData.remove();
        this._signalCleanData = null;
    }
    public reset() {
        this._blackList = {};
        this._friendList = {};
        this._datas = null;
        this._isNeedRecord = null;
    }
    public requestFriendData(isForce?) {
        this._isNeedRecord = true;
        if (this._datas) {
            if (isForce) {
                this.c2sGetFriendList();
            }
            return;
        }
        this.c2sGetFriendList();
    }
    public getFriendsData() {
        if (this._datas) {
            let friendList = this._datas.friendList;
            this.sortFriendData(friendList, FriendConst.FRIEND_LIST);
            return friendList;
        }
        return [];
    }
    public getApplyData() {
        if (this._datas) {
            return this._datas.applyList;
        }
        return {};
    }
    public getEnergyData() {
        if (this._datas) {
            let energyLists = [];
            for (let _ in this._datas.friendList) {
                let v = this._datas.friendList[_];
                if (v.isCanGetPresent()) {
                    energyLists.push(v);
                }
            }
            this.sortFriendData(energyLists, FriendConst.FRIEND_ENERGY);
            return energyLists;
        }
        return [];
    }
    public getBlackData() {
        if (this._datas) {
            return this._datas.blackList;
        }
        return {};
    }
    public getPresentNum() {
        if (this._datas) {
            return this._datas.getPresentNum;
        }
        return 0;
    }
    public cleanDatas() {
        this._datas = null;
        this._isNeedRecord = null;
    }
    public _recordDatas(datas) {
        if (this._isNeedRecord) {
            this._datas = datas;
        }
    }
    public _refuseApply(uid) {
        if (uid == null || this._datas == null || this._datas.applyList == null) {
            return;
        }
        if (uid == 0) {
            this._datas.applyList = [];
        } else {
            for (let k = 0;  k < this._datas.applyList.length; k++) {
                let v = this._datas.applyList[k];
                if (v.getId() == uid) {
                    this._datas.applyList.splice(k, 1);
                    break;
                }
            }
        }
    }
    public _updateFriendPresent(ids) {
        if (ids) {
            let friendList = this.getFriendsData();
            for (let _ in ids) {
                let id = ids[_];
                for (let k in friendList) {
                    let v = friendList[k];
                    if (v.getId() == id) {
                        v.setCanGivePresent(false);
                        break;
                    }
                }
            }
        }
    }
    public _updateDeleteFriend(uid) {
        if (uid) {
            let friendList = this.getFriendsData();
            for (let k = 0; k < friendList.length; k++) {
                let v = friendList[k];
                if (v.getId() == uid) {
                    friendList.splice(k, 1);
                    break;
                }
            }
        }
    }
    public _updateDeleteBlack(uid) {
        if (uid) {
            let blackList = this.getBlackData();
            for (let k = 0; k < blackList.length; k++) {
                let v = blackList[k];
                if (v.getId() == uid) {
                    blackList.splice(k, 1);
                    break;
                }
            }
        }
    }
    public _updateGetPresent(ids) {
        if (ids) {
            let getNum = 0;
            let friendList = this.getFriendsData();
            for (let _ in ids) {
                let id = ids[_];
                for (let k in friendList) {
                    let v = friendList[k];
                    if (v.getId() == id) {
                        v.setCanGetPresent(false);
                        getNum = getNum + 1;
                        break;
                    }
                }
            }
            if (this._datas) {
                this._datas.getPresentNum = this._datas.getPresentNum + getNum;
            }
            return getNum;
        }
        return 0;
    }
    public _updateAddBlack(uid) {
        if (uid) {
            let friendList = this.getFriendsData();
            let blackFriend = null;
            for (let k = 0; k < friendList.length; k++) {
                let v = friendList[k];
                if (v.getId() == uid) {
                    friendList.splice(k, 1);
                    blackFriend = v;
                    break;
                }
            }
            if (blackFriend) {
                if (this._datas && this._datas.blackList) {
                    this._datas.blackList.push(blackFriend);
                    this.sortFriendData(this._datas.blackList);
                }
            }
        }
    }
    public _eventRecvRecoverInfo() {
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_FRIEND);
    }
    public _eventCleanData() {
        if (this._datas) {
            for (let _ in this._datas.friendList) {
                let v = this._datas.friendList[_];
                v.setCanGetPresent(false);
                v.setCanGivePresent(true);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS);
    }
    public hasApplyRedPoint() {
        return G_UserData.getRedPoint().isHasFriendApplyRedPoint();
    }
    public hasGetEnergyRedPoint() {
        let redPoint = false;
        let isFull = UserCheck.isResReachMaxLimit(DataConst.RES_SPIRIT);
        if (!isFull) {
            redPoint = G_UserData.getRedPoint().isHasFriendGetEnergyRedPoint();
        }
        return redPoint;
    }
    public isUserIdInBlackList(userID) {
        return this._blackList[userID];
    }
    public isUserIdInFriendList(userID) {
        return this._friendList[userID];
    }
    public _s2cFriendRespond(id, message) {
        this.c2sGetFriendList();
        G_SignalManager.dispatch(SignalConst.EVENT_FRIEND_RESPOND_SUCCESS);
    }
    public c2sAddFriend(name, friend_type) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AddFriend, {
            name: name,
            friend_type: friend_type
        });
    }
    public _s2cAddFriend(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let uid = message['uid'];
        let friend_type = message['friend_type'];
        if (uid && friend_type && friend_type == FriendConst.FRIEND_ADD_BLACK_TYPE) {
            this._blackList[uid] = true;
            this._friendList[uid] = null;
            this._updateAddBlack(uid);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ADD_FRIEND_SUCCESS, message);
    }
    public c2sGetFriendList() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetFriendList, {});
    }
    public sortFriendData(friendDatas, type?) {
        let sortGiveFunc = function (a, b) {
            let aPresent = a.isCanGivePresent();
            let bPresent = b.isCanGivePresent();
            if (aPresent == bPresent) {
                let aGuildName = a.getGuild_name();
                let bGuildName = b.getGuild_name();
                let myGuildName = '';
                let myGuild = G_UserData.getGuild().getMyGuild();
                if (myGuild) {
                    myGuildName = myGuild.getName();
                }
                let isASameGuild = false;
                let isBSameGuidd = false;
                if (myGuildName != '') {
                    isASameGuild = aGuildName == myGuildName;
                    isBSameGuidd = bGuildName == myGuildName;
                }
                if (isASameGuild && !isBSameGuidd) {
                    return true;
                } else if (isBSameGuidd && !isASameGuild) {
                    return false;
                } else {
                    let aOnline = a.getOnline();
                    let bOnline = b.getOnline();
                    if (aOnline == 0 && bOnline != 0) {
                        return true;
                    } else if (aOnline != 0 && bOnline == 0) {
                        return false;
                    } else {
                        let aLevel = a.getLevel();
                        let bLevel = b.getLevel();
                        if (aLevel == bLevel) {
                            let aPower = a.getPower();
                            let bPower = b.getPower();
                            if (aPower == bPower) {
                                return a.getId() < b.getId();
                            } else {
                                return aPower > bPower;
                            }
                        } else {
                            return aLevel > bLevel;
                        }
                    }
                }
            } else {
                if (aPresent) {
                    return true;
                } else {
                    return false;
                }
            }
        };
        let sortGetFunc = function (a, b) {
            let aPresent = a.isCanGetPresent();
            let bPresent = b.isCanGetPresent();
            if (aPresent == bPresent) {
                let aGuildName = a.getGuild_name();
                let bGuildName = b.getGuild_name();
                let myGuildName = '';
                let myGuild = G_UserData.getGuild().getMyGuild();
                if (myGuild) {
                    myGuildName = myGuild.getName();
                }
                let isASameGuild = false;
                let isBSameGuidd = false;
                if (myGuildName != '') {
                    isASameGuild = aGuildName == myGuildName;
                    isBSameGuidd = bGuildName == myGuildName;
                }
                if (isASameGuild && !isBSameGuidd) {
                    return true;
                } else if (isBSameGuidd && !isASameGuild) {
                    return false;
                } else {
                    let aOnline = a.getOnline();
                    let bOnline = b.getOnline();
                    if (aOnline == 0 && bOnline != 0) {
                        return true;
                    } else if (aOnline != 0 && bOnline == 0) {
                        return false;
                    } else {
                        let aLevel = a.getLevel();
                        let bLevel = b.getLevel();
                        if (aLevel == bLevel) {
                            let aPower = a.getPower();
                            let bPower = b.getPower();
                            if (aPower == bPower) {
                                return a.getId() < b.getId();
                            } else {
                                return aPower > bPower;
                            }
                        } else {
                            return aLevel > bLevel;
                        }
                    }
                }
            } else {
                if (aPresent) {
                    return true;
                } else {
                    return false;
                }
            }
        };
        let sortNormalFunc = function (a, b) {
            let aGuildName = a.getGuild_name();
            let bGuildName = b.getGuild_name();
            let myGuildName = '';
            let myGuild = G_UserData.getGuild().getMyGuild();
            if (myGuild) {
                myGuildName = myGuild.getName();
            }
            let isASameGuild = false;
            let isBSameGuidd = false;
            if (myGuildName != '') {
                isASameGuild = aGuildName == myGuildName;
                isBSameGuidd = bGuildName == myGuildName;
            }
            if (isASameGuild && !isBSameGuidd) {
                return true;
            } else if (isBSameGuidd && !isASameGuild) {
                return false;
            } else {
                let aOnline = a.getOnline();
                let bOnline = b.getOnline();
                if (aOnline == 0 && bOnline != 0) {
                    return true;
                } else if (aOnline != 0 && bOnline == 0) {
                    return false;
                } else {
                    let aLevel = a.getLevel();
                    let bLevel = b.getLevel();
                    if (aLevel == bLevel) {
                        let aPower = a.getPower();
                        let bPower = b.getPower();
                        if (aPower == bPower) {
                            return a.getId() < b.getId();
                        } else {
                            return aPower > bPower;
                        }
                    } else {
                        return aLevel > bLevel;
                    }
                }
            }
        };
        if (type == FriendConst.FRIEND_LIST) {
            ArraySort(friendDatas, sortGiveFunc);
        } else if (type == FriendConst.FRIEND_ENERGY) {
            ArraySort(friendDatas, sortGetFunc);
        } else {
            ArraySort(friendDatas, sortNormalFunc);
        }
    }
    public _s2cGetFriendList(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let datas:any = {};
        datas.friendList = [];
        let friend = message['friend'];
        this._friendList = {};
        if (friend) {
            for (let _ in friend) {
                let v = friend[_];
                let friendData = new FriendUnitData();
                friendData.updateData(v);
                datas.friendList.push(friendData);
                this._friendList[v.id] = true;
            }
        }
        datas.blackList = [];
        let blacklist = message['blacklist'];
        this._blackList = {};
        if (blacklist) {
            for (let _ in blacklist) {
                let v = blacklist[_];
                let friendData = new FriendUnitData();
                friendData.updateData(v);
                this._blackList[v.id] = true;
                datas.blackList.push(friendData);
            }
            this.sortFriendData(datas.blackList);
        }
        let friend_req = message['friend_req'];
        datas.applyList = [];
        if (friend_req) {
            for (let _ in friend_req) {
                let v = friend_req[_];
                let friendData = new FriendUnitData();
                friendData.updateData(v);
                datas.applyList.push(friendData);
            }
            this.sortFriendData(datas.applyList);
        }
        let get_present_num = message['get_present_num'];
        datas.getPresentNum = 0;
        if (get_present_num) {
            datas.getPresentNum = get_present_num;
        }
        this._recordDatas(datas);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS, datas);
    }
    public c2sGetFriendPresent(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetFriendPresent, { id: id });
    }
    public _s2cGetFriendPresent(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let ids = message['uid'];
        if (ids) {
            let getPresentNum = this._updateGetPresent(ids);
            G_SignalManager.dispatch(SignalConst.EVENT_GET_FRIEND_PRESENT_SUCCESS, getPresentNum);
        }
    }
    public c2sDelFriend(id, friend_type) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_DelFriend, {
            id: id,
            friend_type: friend_type
        });
    }
    public _s2cDelFriend(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let uid = message['id'];
        let friend_type = message['friend_type'];
        if (uid && friend_type) {
            if (friend_type == FriendConst.FRIEND_DEL_BLACK_TYPE) {
                this._blackList[uid] = null;
                this._updateDeleteBlack(uid);
            } else if (friend_type == FriendConst.FRIEND_DEL_FRIEND_TYPE) {
                this._friendList[uid] = null;
                this._updateDeleteFriend(uid);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DEL_FRIEND_SUCCESS, message);
    }
    public c2sRecommandFriend() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RecommandFriend, {});
    }
    public _s2cRecommandFriend(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let friends = message['friends'];
        let datas = [];
        if (friends) {
            for (let _ in friends) {
                let v = friends[_];
                let friendData = new FriendUnitData();
                friendData.updateData(v);
                datas.push(friendData);
            }
            this.sortFriendData(datas);
        }
        this.setSuggestTempListData(datas);
        let curTime = G_ServerTime.getTime();
        this.setSuggestRefreshTime(curTime);
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let config = Parameter.get(141);
        console.assert(config != null, 'can not find param 141 value');
        let suggestInterval = Number(config.content) || 10;
        var callBack = function () {
            this.setSuggestTempListData(null);
        }.bind(this);
        G_ServiceManager.registerOneAlarmClock('FRIEND_SUGGEST_TEMP_LIST', curTime + suggestInterval + 1, callBack);
        G_SignalManager.dispatch(SignalConst.EVENT_RECOMMAND_FRIEND_SUCCESS, datas);
    }
    public c2sFriendPresent(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FriendPresent, { id: id });
    }
    public _s2cFriendPresent(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let ids = message['id'];
        if (ids) {
            this._updateFriendPresent(ids);
            G_SignalManager.dispatch(SignalConst.EVENT_FRIEND_PRESENT_SUCCESS);
        }
    }
    public c2sConfirmAddFriend(id, accept) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ConfirmAddFriend, {
            id: id,
            accept: accept
        });
    }
    public _s2cConfirmAddFriend(id, message) {
        if (message.ret == 8346) {
            this.c2sGetFriendList();
            return;
        }
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let uid = message['id'];
        let accept = message['accept'];
        if (uid != null) {
            if (accept) {
                this._friendList[uid] = true;
                this.c2sGetFriendList();
            } else {
                this._refuseApply(uid);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CONFIRM_ADD_FRIEND_SUCCESS, message);
    }
}
