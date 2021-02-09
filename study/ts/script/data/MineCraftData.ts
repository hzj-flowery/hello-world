import { Slot } from "../utils/event/Slot";
import { G_NetworkManager, G_ServerTime, G_UserData, G_ConfigLoader, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { BaseData } from "./BaseData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { MineData } from "./MineData";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import ParameterIDConst from "../const/ParameterIDConst";
import { MineReportData } from "./MineReportData";
import { ArraySort } from "../utils/handler";
import { MineCraftHelper } from "../scene/view/mineCraft/MineCraftHelper";
import { FunctionConst } from "../const/FunctionConst";

export interface MineCraftData {
    getMines(): Object
    setMines(value: Object): void
    getLastMines(): Object
    getSelfMoney(): number
    setSelfMoney(value: number): void
    getLastSelfMoney(): number
    getSelfLastProduceTime(): number
    setSelfLastProduceTime(value: number): void
    getLastSelfLastProduceTime(): number
    getSelfLastTime(): number
    setSelfLastTime(value: number): void
    getLastSelfLastTime(): number
    getSelfMineId(): number
    setSelfMineId(value: number): void
    getLastSelfMineId(): number
    getMineRoads(): Object
    setMineRoads(value: Object): void
    getLastMineRoads(): Object
    getMidPoints(): Object
    setMidPoints(value: Object): void
    getLastMidPoints(): Object
    getMyArmyValue(): number
    setMyArmyValue(value: number): void
    getLastMyArmyValue(): number
    getRoads(): Object
    setRoads(value: Object): void
    getLastRoads(): Object
    getAttackReport(): Object
    setAttackReport(value: Object): void
    getLastAttackReport(): Object
    getKillType(): number
    setKillType(value: number): void
    getLastKillType(): number
    getTargetPos(): number
    setTargetPos(value: number): void
    getLastTargetPos(): number
    getPrivilegeTime(): number
    setPrivilegeTime(value: number): void
    getLastPrivilegeTime(): number
    isReachTimeLimit(): boolean
    setReachTimeLimit(value: boolean): void
    isLastReachTimeLimit(): boolean
    getSelfInfamValue():number
    setSelfInfamValue(value:number):void
    getSelfRefreshTime():number
    setSelfRefreshTime(value:number):void

}

   
let schema = {};
schema['mines'] = [
    'object',
    {}
];
schema['selfMoney'] = [
    'number',
    0
];
schema['selfLastProduceTime'] = [
    'number',
    0
];
schema['selfLastTime'] = [
    'number',
    0
];
schema['selfMineId'] = [
    'number',
    0
];
schema['mineRoads'] = [
    'object',
    {}
];
schema['midPoints'] = [
    'object',
    {}
];
schema['myArmyValue'] = [
    'number',
    0
];
schema['roads'] = [
    'object',
    {}
];
schema['attackReport'] = [
    'object',
    {}
];
schema['killType'] = [
    'number',
    0
];
schema['targetPos'] = [
    'number',
    0
];
schema['privilegeTime'] = [
    'number',
    0
];
schema['reachTimeLimit'] = [
    'boolean',
    false
];
schema['selfInfamValue'] = [
    'number',
    0
];
schema['selfRefreshTime'] = [
    'number',
    0
];
export class MineCraftData extends BaseData {

    public static schema = schema;
    public static REPORT_TYPE_ATTACK = 4;
    public static REPORT_TYPE_DEF = 5;

        _listenerMineWorld: Slot;
        _listenerEnterMine: Slot;
        _listenerSettleMine: Slot;
        _listenerMineRespone: Slot;
        _listenerGetMineMoney: Slot;
        _listenerBattleMine: Slot;
        _listenerGetReport: Slot;
        _listenerFastBattle: Slot;
        _listenerBuyArmy: Slot;
        _listenerMineOwn: Slot;
        _listenerMineMove: Slot;
        _listenerSendMineInfo: Slot;
        _openSecond: number;
        _mineIdIndexMap;
        _graph;
    constructor(properties?) {
        super(properties);
        this._initMineData();
        this._initMineWay();
        this._listenerMineWorld = G_NetworkManager.add(MessageIDConst.ID_S2C_GetMineWorld, this._s2cGetMineWorld.bind(this));
        this._listenerEnterMine = G_NetworkManager.add(MessageIDConst.ID_S2C_EnterMine, this._s2cEnterMine.bind(this));
        this._listenerSettleMine = G_NetworkManager.add(MessageIDConst.ID_S2C_SettleMine, this._s2cSettleMine.bind(this));
        this._listenerMineRespone = G_NetworkManager.add(MessageIDConst.ID_S2C_MineRespond, this._s2cMineRespond.bind(this));
        this._listenerGetMineMoney = G_NetworkManager.add(MessageIDConst.ID_S2C_GetMineMoney, this._s2cGetMineMoney.bind(this));
        this._listenerBattleMine = G_NetworkManager.add(MessageIDConst.ID_S2C_BattleMine, this._s2cBattleMine.bind(this));
        this._listenerGetReport = G_NetworkManager.add(MessageIDConst.ID_S2C_CommonGetReport, this._s2cCommonGetReport.bind(this));
        this._listenerFastBattle = G_NetworkManager.add(MessageIDConst.ID_S2C_BattleMineFast, this._s2cFastBattle.bind(this));
        this._listenerBuyArmy = G_NetworkManager.add(MessageIDConst.ID_S2C_MineBuyArmy, this._s2cBuyArmy.bind(this));
        this._listenerMineOwn = G_NetworkManager.add(MessageIDConst.ID_S2C_SysMineOwn, this._s2cSysMineOwn.bind(this));
        this._listenerMineMove = G_NetworkManager.add(MessageIDConst.ID_S2C_BulletNotice, this._s2cBulletNotice.bind(this));
        this._listenerSendMineInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_SendMineInfo, this._s2cSendMineInfo.bind(this));
        this._openSecond = 0;
        this._mineIdIndexMap = {};
    }
    public clear() {
        this._listenerMineWorld.remove();
        this._listenerMineWorld = null;
        this._listenerEnterMine.remove();
        this._listenerEnterMine = null;
        this._listenerSettleMine.remove();
        this._listenerSettleMine = null;
        this._listenerMineRespone.remove();
        this._listenerMineRespone = null;
        this._listenerGetMineMoney.remove();
        this._listenerGetMineMoney = null;
        this._listenerBattleMine.remove();
        this._listenerBattleMine = null;
        this._listenerGetReport.remove();
        this._listenerGetReport = null;
        this._listenerFastBattle.remove();
        this._listenerFastBattle = null;
        this._listenerBuyArmy.remove();
        this._listenerBuyArmy = null;
        this._listenerMineOwn.remove();
        this._listenerMineOwn = null;
        this._listenerMineMove.remove();
        this._listenerMineMove = null;
        this._listenerSendMineInfo.remove();
        this._listenerSendMineInfo = null;
    }
    public _getFuncOpenTime() {
        let serverOpenTime = G_UserData.getBase().getServer_open_time();
        let date = G_ServerTime.getDateObject(serverOpenTime);
        let fourClock = serverOpenTime - date.getHours() * 3600 - date.getMinutes() * 60 - date.getSeconds() + 4 * 3600;
        let FunctionLevel = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL)
        let config = FunctionLevel.get(FunctionConst.FUNC_MINE_CRAFT);
        console.assert(config, 'config is nil id = ', FunctionConst.FUNC_MINE_CRAFT);
        let mineOpenDays = config.day - 1;
        this._openSecond = fourClock + mineOpenDays * 86400;
    }
    public getOpenTime() {
        if (this._openSecond == 0) {
            this._getFuncOpenTime();
        }
        return this._openSecond;
    }
    public getOpenLeftTime():Array<any> {
        if (this._openSecond == 0) {
            this._getFuncOpenTime();
        }
        let nextTime = 0;
        let nowTime = G_ServerTime.getTime();
        let MineEvent = G_ConfigLoader.getConfig(ConfigNameConst.MINE_EVENT);
        for (let i = 0; i < MineEvent.length(); i++) {
            let config = MineEvent.indexOf(i);
            if (nowTime - this._openSecond < config.start_time) {
                let leftTime = this._openSecond + config.start_time - nowTime;
                return [
                    leftTime,
                    config
                ];
            }
        }
    }
    public reset() {
    }
    public _initMineData() {
        let mineList = {};
        let MinePit = G_ConfigLoader.getConfig(ConfigNameConst.MINE_PIT);
        for (let i = 0; i < MinePit.length(); i++) {
            let config = MinePit.indexOf(i);
            let data = new MineData(config);
            mineList[config.pit_id] = data;
        }
        this.setMines(mineList);
    }
    _initMineWay() {
        let MineWay = G_ConfigLoader.getConfig(ConfigNameConst.MINE_WAY);
        var midPoints = {};
        this._graph = {};
        for (var i = 0; i < MineWay.length(); i++) {
            var way = MineWay.indexOf(i);
            if (!this._graph[way.pit_id]) {
                this._graph[way.pit_id] = {};
            }
            this._graph[way.pit_id][way.move_pit] = 1;
            var midPoint = way.mid_point;
            if (!midPoints[way.pit_id + way.move_pit]) {
                var strArr = midPoint.split('|');
                midPoints[way.pit_id+""+way.move_pit] = cc.v2(parseInt(strArr[0]), parseInt(strArr[1]));
            }
        }
        this.setMidPoints(midPoints);
        var time = G_ServerTime.getTimeByWdayandSecond(3, 12 * 60 * 60);
        var w = G_ServerTime.getWeekdayAndHour(G_ServerTime.getTime());
    }
    getMineGraph() {
        return this._graph;
    }
    public getMineDataById(id) {
        let list = this.getMines();
        return list[id];
    }
    public getMyMineData() {
        return this.getMineDataById(this.getSelfMineId());
    }
    public getMyMineConfig() {
        let data = this.getMineDataById(this.getSelfMineId());
        return data.getConfigData();
    }
    public getMineConfigById(id) {
        let list = this.getMines();
        let data = list[id];
        if (data) {
            return data.getConfigData();
        }
    }
    public c2sGetMineWorld() {
        let message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetMineWorld, message);
    }
    public _s2cGetMineWorld(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSelfMoney(message.self_money);
        this.setSelfLastProduceTime(message.self_last_produce_time);
        this.setSelfLastTime(message.self_last_time);
        this.setSelfMineId(message.self_mine_id);
        this.setMyArmyValue(message.self_army_value);
        this.setSelfInfamValue(message.self_infam_value);
        this.setSelfRefreshTime(message.self_refresh_time);
        this.setPrivilegeTime(message['self_privilege_time'] || 0);
        if (message.hasOwnProperty('mine_info')) {
            for (let _ in message.mine_info) {
                let v = message.mine_info[_];
                let mineData = this.getMineDataById(v.mine_id);
                mineData.setGuildId(v.guild_id);
                mineData.setGuildName(v.guild_name);
                mineData.setUserCnt(v.user_cnt);
                mineData.setOwn(v.is_own);
                mineData.setGuildIcon(v.guild_icon);
                mineData.setMultiple(v.multiple);
                mineData.setStartTime(v.startTime);
                mineData.setEndTime(v.endTime);
            }
        }
        G_UserData.getGrainCar().initCorpse(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_MINE_WORLD);
    }
    public checkTimeLimit() {
        let timeLimit = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MINE_TIME_LIMIT).content);
        let moneyDuringTime = this.getMoneyTime();
        if (moneyDuringTime > timeLimit) {
            if (!this.isReachTimeLimit()) {
                this.setReachTimeLimit(true);
                G_SignalManager.dispatch(SignalConst.EVENT_SEND_MINE_INFO);
            }
            return;
        }
        if (this.isReachTimeLimit()) {
            G_SignalManager.dispatch(SignalConst.EVENT_SEND_MINE_INFO);
        }
        this.setReachTimeLimit(false);
    }
    public _s2cSendMineInfo(id, message) {
        if (message.hasOwnProperty('mine_id')){
            this.setSelfMineId(message.mine_id);
        }
        if (message.hasOwnProperty('self_last_time')){
            this.setSelfLastTime(message.self_last_time);
        }
        this.checkTimeLimit();
    }
    public getMoneyTime() {
        let selfMineId = this.getSelfMineId();
        let lastTime = this.getSelfLastTime();
        if (selfMineId == 0 || lastTime == 0) {
            return 0;
        }
        let duringTime = 0;
        let configData = this.getMineDataById(selfMineId).getConfigData();
        if (configData.pit_type != 2) {
            duringTime = G_ServerTime.getTime() - lastTime;
        }
        return duringTime;
    }
    c2sEnterMine(mineId, pageIndex?) {
        pageIndex = pageIndex || 0;
        var message = {
            mine_id: mineId,
            page: pageIndex
        };
        this._mineIdIndexMap[mineId] = pageIndex;
        G_NetworkManager.send(MessageIDConst.ID_C2S_EnterMine, message);
    }
    _s2cEnterMine(id, message) {
        if (message.ret != 1) {
            return;
        }
        var mineData = this.getMineDataById(message.mine_id);
        var pageIndex = this._mineIdIndexMap[message.mine_id] || 0;
        if (message.is_begin) {
            if (pageIndex == 0) {
                mineData.clearUserList();
            } else {
                mineData.resetUserList();
            }
            mineData.setRequestData(true);
        }
        for (let i in message.mine_users) {
            var user = message.mine_users[i];
            mineData.pushUser(user);
        }
        if (message.is_end) {
            mineData.refreshUser();
            mineData.setRequestData(false);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ENTER_MINE, mineData.getId());
    }
    public c2sSettleMine(mineIdList) {
        let message = { mine_id: mineIdList };
        G_NetworkManager.send(MessageIDConst.ID_C2S_SettleMine, message);
        let selfMineId = this.getSelfMineId();
        mineIdList.unshift(selfMineId);
        this.setRoads(mineIdList);
    }
    public _s2cSettleMine(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            this.setRoads({});
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SETTLE_MINE, message);
    }
    public _processChangeMine(message) {
        if (message.hasOwnProperty('change_world_mine')) {
            for (let i in message.change_world_mine) {
                let v = message.change_world_mine[i];
                let mineData = this.getMineDataById(v.mine_id);
                if (v.hasOwnProperty('guild_id')) {
                    mineData.setGuildId(v.guild_id);
                }
                if (v.hasOwnProperty('guild_name')) {
                    mineData.setGuildName(v.guild_name);
                }
                if (v.hasOwnProperty('user_cnt')) {
                    mineData.setUserCnt(v.user_cnt);
                }
                mineData.setOwn(v.is_own);
                if (v.hasOwnProperty('guild_icon')) {
                    mineData.setGuildIcon(v.guild_icon);
                }
                if (v.hasOwnProperty('startTime')) {
                    mineData.setStartTime(v.startTime);
                }
                if (v.hasOwnProperty('endTime')) {
                    mineData.setEndTime(v.endTime);
                }
            }
        }
    }
    public _processChangeUser(message):Array<number> {
        let oldMineId = null;
        let newMineId = null;
        if (message.hasOwnProperty('replace_mine_user')) {
            for (let i in message.replace_mine_user) {
                let user = message.replace_mine_user[i];
                newMineId = user.mine_id;
                oldMineId = user.old_mine_id;
                if (newMineId == oldMineId) {
                    let mineData = this.getMineDataById(newMineId);
                    mineData.updateUser(user);
                } else {
                    let oldMineData = this.getMineDataById(oldMineId);
                    oldMineData.deleteUser(user.user_id);
                    let newMineData = this.getMineDataById(newMineId);
                    newMineData.newUser(user);
                }
            }
        }
        return [
            oldMineId,
            newMineId
        ];
    }
    public _s2cMineRespond(id, message) {
        this.setSelfMoney(message.self_money);
        this.setSelfLastProduceTime(message.self_last_produce_time);
        this.setSelfLastTime(message.self_last_time);
        this.setSelfMineId(message.self_mine_id);
        this.setMyArmyValue(message.self_army_value);
        this.setSelfInfamValue(message.self_infam_value);
        this.setSelfRefreshTime(message.self_refresh_time);
        this._processChangeMine(message);
        this.setPrivilegeTime(message['self_privilege_time'] || 0);
        let [oldMineId, newMineId] = this._processChangeUser(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_MINE_RESPOND, oldMineId, newMineId);
    }
    public c2sGetMineMoney() {
        let message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetMineMoney, message);
    }
    public _s2cGetMineMoney(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setSelfMoney(message.self_money);
        this.setSelfLastProduceTime(message.self_last_produce_time);
        this.setSelfLastTime(message.self_last_time);
        this.checkTimeLimit();
        G_SignalManager.dispatch(SignalConst.EVENT_GET_MINE_MONEY, message.award);
    }
    public c2sBattleMine(userId) {
        let message = { user_id: userId };
        G_NetworkManager.send(MessageIDConst.ID_C2S_BattleMine, message);
    }
    public _s2cBattleMine(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.hasOwnProperty('tar_reborn_mine')) {
            this.setTargetPos(message.tar_reborn_mine);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_BATTLE_MINE, message.mine_fight, message.tar_mine_user);
    }
    public c2sCommonGetReport() {
        let message = { report_type: MineCraftData.REPORT_TYPE_ATTACK };
        G_NetworkManager.send(MessageIDConst.ID_C2S_CommonGetReport, message);
    }
    public _s2cCommonGetReport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let type = message.report_type;
        let list = [];
        for (let _ in message.mine_reports) {
            let data = message.mine_reports[_];
            let mineReportData = new MineReportData(data);
            list.push(mineReportData);
        }
        ArraySort(list, function (a, b) {
            return a.getReport_id() > b.getReport_id();
        });
        if (type == MineCraftData.REPORT_TYPE_ATTACK) {
            this.setAttackReport(list);
            G_SignalManager.dispatch(SignalConst.EVENT_GET_MINE_ATTACK_REPORT);
        }
    }
    //发起扫荡
    public c2sBattleMineFast(userId, count) {
        let message = {
            user_id: userId,
            num: count
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_BattleMineFast, message);
    }
    //收到扫荡结果
    public _s2cFastBattle(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let reportList = [];
        for (let i in message.mine_fight) {
            let v = message.mine_fight[i];
            let data = new MineReportData();
            data.updateDataFromMineFight(v, message.tar_mine_user);
            reportList.push(data);
        }
        //派发扫荡结果
        G_SignalManager.dispatch(SignalConst.EVENT_FAST_BATTLE, reportList);
    }
    public c2sMineBuyArmy(count) {
        let message = { num: count };
        G_NetworkManager.send(MessageIDConst.ID_C2S_MineBuyArmy, message);
    }
    public _s2cBuyArmy(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_MINE_BUY_ARMY, message.num);
    }
    public _s2cSysMineOwn(id, message) {
        let mineId = message.mine_id;
        let mineData = this.getMineDataById(mineId);
        G_SignalManager.dispatch(SignalConst.EVENT_MINE_GUILD_BOARD, mineData);
    }
    public _s2cBulletNotice(id, message) {
        cc.warn('MineCraftData:_s2cBulletNotice');
        cc.log(message);
        for (let _ in message.content) {
            let data = message.content[_];
            let bulletType = data.sn_type;
            if (bulletType != 3) {
                break;
            }
            let user = data.user;
            cc.log(user);
            if (user.user_id == G_UserData.getBase().getId()) {
                break;
            }
            let oldId = 0;
            let newId = 0;
            for (let i in data.content) {
                let v = data.content[i];
                if (v.key == 'oldmineid') {
                    oldId = Number(v.value);
                } else if (v.key == 'newmineid') {
                    newId = Number(v.value);
                }
            }
            G_SignalManager.dispatch(SignalConst.EVENT_MINE_NOTICE, user, oldId, newId);
        }
    }
    public isMineHasUser(mineId):boolean {
        let mineData = this.getMineDataById(mineId);
        return mineData.hasUsers();
    }
    public clearAllMineUser():void {
        let list = this.getMines();
        for (let i in list) {
            let v = list[i];
            v.clearUsers();
        }
    }
    public isSelfPrivilege():boolean {
        let leftSec = G_ServerTime.getLeftSeconds(G_UserData.getMineCraftData().getPrivilegeTime());
        if (leftSec && leftSec > 0) {
            return true;
        }
        return false;
    }
    public isPrivilegeRedPoint():boolean {
        let payCfg = MineCraftHelper.getPrivilegeVipCfg();
        let cardData = G_UserData.getActivityMonthCard().getMonthCardDataById(payCfg.id);
        if (cardData && cardData.getRemainDay() > 0) {
            return cardData.isCanReceive();
        }
        return false;
    }
    isExistPeaceMine() {
        var list = this.getMines();
        for (let i in list) {
            var v = list[i];
            if (v.isPeace()) {
                return [
                    true,
                    v
                ];
            }
        }
        return [
            false,
            null
        ];
    }
}
