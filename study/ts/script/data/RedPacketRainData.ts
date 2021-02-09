import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { RedPacketRainConst } from "../const/RedPacketRainConst";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { RedPacketRainUnitData } from "./RedPacketRainUnitData";
import { SimpleUserData } from "./SimpleUserData";
import { table } from "../utils/table";
import { RedPacketRainRankData } from "./RedPacketRainRankData";

export interface RedPacketRainData {
    getActId(): number
    setActId(value: number): void
    getLastActId(): number
    getEmpty_big_num(): number
    setEmpty_big_num(value: number): void
    getLastEmpty_big_num(): number
    getEmpty_small_num(): number
    setEmpty_small_num(value: number): void
    getLastEmpty_small_num(): number
    getRob_big_num(): number
    setRob_big_num(value: number): void
    getLastRob_big_num(): number
    getRob_small_num(): number
    setRob_small_num(value: number): void
    getLastRob_small_num(): number
    getAct_end_time(): number
    setAct_end_time(value: number): void
    getLastAct_end_time(): number
    getAct_start_time(): number
    setAct_start_time(value: number): void
    getLastAct_start_time(): number
}
let schema = {};
schema['actId'] = [
    'number',
    0
];
schema['empty_big_num'] = [
    'number',
    0
];
schema['empty_small_num'] = [
    'number',
    0
];
schema['rob_big_num'] = [
    'number',
    0
];
schema['rob_small_num'] = [
    'number',
    0
];
schema['act_end_time'] = [
    'number',
    0
];
schema['act_start_time'] = [
    'number',
    0
];
export class RedPacketRainData extends BaseData {
    public static schema = schema;

    _actOpenTime: number;
    _actEndTime: number;
    _usrActEndTime: number;
    _packetInfos;
    _packetList: RedPacketRainUnitData[];
    _receivedPacketIds: string[];
    _recvNewRedPacketStartNotify;
    _recvEnterNewRedPacket;
    _recvGetNewRedPacket;
    _recvGetNewRedPacketNotifyMulti;
    _recvGetRedPacketRank: any;
    constructor(properties?) {
        super(properties);
        this._actOpenTime = 0;
        this._actEndTime = 0;
        this._usrActEndTime = 0;
        this._packetInfos = {};
        this._packetList = [];
        this._receivedPacketIds = [];
        this._recvNewRedPacketStartNotify = G_NetworkManager.add(MessageIDConst.ID_S2C_NewRedPacketStartNotify, this._s2cNewRedPacketStartNotify.bind(this));
        this._recvEnterNewRedPacket = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterNewRedPacket, this._s2cEnterNewRedPacket.bind(this));
        this._recvGetNewRedPacket = G_NetworkManager.add(MessageIDConst.ID_S2C_GetNewRedPacket, this._s2cGetNewRedPacket.bind(this));
        this._recvGetNewRedPacketNotifyMulti = G_NetworkManager.add(MessageIDConst.ID_S2C_GetNewRedPacketNotifyMulti, this._s2cGetNewRedPacketNotifyMulti.bind(this));
        this._recvGetRedPacketRank = G_NetworkManager.add(MessageIDConst.ID_S2C_GetRedPacketRank, this._s2cGetRedPacketRank.bind(this))
    }
    public clear() {
        this._recvNewRedPacketStartNotify.remove();
        this._recvNewRedPacketStartNotify = null;
        this._recvEnterNewRedPacket.remove();
        this._recvEnterNewRedPacket = null;
        this._recvGetNewRedPacket.remove();
        this._recvGetNewRedPacket = null;
        this._recvGetNewRedPacketNotifyMulti.remove();
        this._recvGetNewRedPacketNotifyMulti = null;
        this._recvGetRedPacketRank.remove();
        this._recvGetRedPacketRank = null;
    }
    public reset() {
        this._actOpenTime = 0;
        this._actEndTime = 0;
        this._usrActEndTime = 0;
        this._packetInfos = {};
        this._packetList = [];
        this._receivedPacketIds = [];
    }
    public getActOpenTime() {
        return this._actOpenTime;
    }
    public getActEndTime() {
        return this._actEndTime;
    }
    public getUsrActEndTime() {
        return this._usrActEndTime;
    }
    public isPlayed() {
        return this._usrActEndTime > 0;
    }
    public getPacketList() {
        return this._packetList;
    }
    public getUnitDataWithId(id) {
        return this._packetInfos[id];
    }
    public getReceivedPacketData() {
        let bigNum = 0;
        let smallNum = 0;
        let money = 0;
        for (let i in this._receivedPacketIds) {
            let id = this._receivedPacketIds[i];
            let unitData = this.getUnitDataWithId(id);
            let type = unitData.getRedpacket_type();
            if (type == RedPacketRainConst.TYPE_BIG) {
                bigNum = bigNum + 1;
            } else if (type == RedPacketRainConst.TYPE_SMALL) {
                smallNum = smallNum + 1;
            }
            money = money + unitData.getMoney();
        }
        return {
            bigNum: bigNum,
            smallNum: smallNum,
            money: money
        };
    }
    public _s2cNewRedPacketStartNotify(id, message) {
        let actId = message['actId'] || 0;
        let actOpenTime = message['actOpenTime'] || 0;
        let actEndTime = message['actEndTime'] || 0;
        let usrActEndTime = message['usrActEndTime'] || 0;
        this.setActId(actId);
        this._actOpenTime = actOpenTime;
        this._actEndTime = actEndTime;
        this._usrActEndTime = usrActEndTime;
        G_SignalManager.dispatch(SignalConst.EVENT_RED_PACKET_RAIN_START_NOTIFY);
    }
    public c2sEnterNewRedPacket() {
        let actId = this.getActId();
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterNewRedPacket, { actId: actId });
    }
    public _s2cEnterNewRedPacket(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setProperties(message);
        let actEndTime = message['act_end_time'] || 0;
        this._usrActEndTime = actEndTime;
        let redPacketInfo = message['redpacketInfo'] || {};
        this._packetList = [];
        this._packetInfos = {};
        this._receivedPacketIds = [];
        for (let i in redPacketInfo) {
            let info = redPacketInfo[i];
            let id = info['id'];
            info['id'] = String(id);
            let unit = new RedPacketRainUnitData(info);
            this._packetList.push(unit);
            this._packetInfos[unit.getId()] = unit;
        }
        let emptyBigNum = this.getEmpty_big_num();
        let emptySmallNum = this.getEmpty_small_num();
        let robBigNum = this.getRob_big_num();
        let robSmallNum = this.getRob_small_num();
        for (let i = 1; i <= emptyBigNum; i++) {
            let info = {
                id: 'emptyBig_' + i,
                redpacket_type: RedPacketRainConst.TYPE_BIG
            };
            let unit = new RedPacketRainUnitData(info);
            this._packetList.push(unit);
            this._packetInfos[unit.getId()] = unit;
        }
        for (let i = 1; i <= emptySmallNum; i++) {
            let info = {
                id: 'emptySmall_' + i,
                redpacket_type: RedPacketRainConst.TYPE_SMALL
            };
            let unit = new RedPacketRainUnitData(info);
            this._packetList.push(unit);
            this._packetInfos[unit.getId()] = unit;
        }
        for (let i = 1; i <= robBigNum; i++) {
            let info = {
                id: 'robBig_' + i,
                redpacket_type: RedPacketRainConst.TYPE_BIG,
                rob: true
            };
            let unit = new RedPacketRainUnitData(info);
            this._packetList.push(unit);
            this._packetInfos[unit.getId()] = unit;
        }
        for (let i = 1; i <= robSmallNum; i++) {
            let info = {
                id: 'robSmall_' + i,
                redpacket_type: RedPacketRainConst.TYPE_SMALL,
                rob: true
            };
            let unit = new RedPacketRainUnitData(info);
            this._packetList.push(unit);
            this._packetInfos[unit.getId()] = unit;
        }
        let tmp, index;
        for (let i = 0; i < this._packetList.length - 1; i++) {
            index = Math.randInt(i, this._packetList.length - 1);
            if (i != index) {
                tmp = this._packetList[index];
                this._packetList[index] = this._packetList[i];
                this._packetList[i] = tmp;
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_PACKET_RAIN_ENTER_SUCCESS);
    }
    public c2sGetNewRedPacket(redPacketId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetNewRedPacket, { red_bag_id: Number(redPacketId) });
    }
    public _s2cGetNewRedPacket(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            if (message.ret == 10370) {
                G_SignalManager.dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_TIMEOUT);
            }
            return;
        }
        let redBagId = message['red_bag_id'] || 0;
        this._receivedPacketIds.push(String(redBagId));
        G_SignalManager.dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_SUCCESS, String(redBagId));
    }
    public _s2cGetNewRedPacketNotifyMulti(id, message) {
        let messages = message['messages'] || [];
        let records = [];
        for (let i in messages) {
            let message = messages[i];
            let user = message['user'];
            let redPacketInfo = message['red_packet_info'];
            let id = redPacketInfo['id'];
            redPacketInfo['id'] = String(id)
            let simpleUserData = new SimpleUserData(user);
            let unitPacket = new RedPacketRainUnitData(redPacketInfo);
            let record = {
                user: simpleUserData,
                packet: unitPacket
            };
            if (simpleUserData.getUser_id() != G_UserData.getBase().getId()) {
                records.push(record);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_NOTIFY, records);
    }
    public c2sGetRedPacketRank() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetRedPacketRank, {});
    }
    public _s2cGetRedPacketRank(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var rankLists = message['rank_list'] || {};
        var userBigNum = message['user_big_num'] || 0;
        var userSmallNum = message['user_small_num'] || 0;
        var userMoney = message['user_money'] || 0;
        var listInfo = [];
        for (var i in rankLists) {
            var rank = rankLists[i];
            var rankData = new RedPacketRainRankData(rank);
            table.insert(listInfo, rankData);
        }
        var myRank = {
            user_id: G_UserData.getBase().getId(),
            money: userMoney,
            office_level: G_UserData.getBase().getOfficer_level(),
            name: G_UserData.getBase().getName(),
            big_red_packet: userBigNum,
            small_red_packet: userSmallNum
        };
        var myInfo = new RedPacketRainRankData(myRank);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_PACKET_RAIN_GET_RANK, listInfo, myInfo);
    }
}
