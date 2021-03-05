import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ConfigLoader, G_ServerTime, G_ServiceManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { ArraySort } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { RunningManConst } from "../const/RunningManConst";
import { SignalConst } from "../const/SignalConst";
import { RunningManUnitData } from "./RunningManUnitData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { unpack } from "../utils/GlobleFunc";
import { RunningManHelp } from "../scene/view/runningMan/RunningManHelp";
import GemstoneConst from "../const/GemstoneConst";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { FunctionConst } from "../const/FunctionConst";
import GrainCarConfigHelper from "../scene/view/grainCar/GrainCarConfigHelper";

export interface RunningManData {
    getUser_bet(): any[]
    setUser_bet(value: any[]): void
    getLastUser_bet(): any[]
    getBet_info(): any[]
    setBet_info(value: any[]): void
    getLastBet_info(): any[]
    getWin_hero(): number
    setWin_hero(value: number): void
    getLastWin_hero(): number
    getMatch_info(): any[]
    setMatch_info(value: any[]): void
    getLastMatch_info(): any[]
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getLastEnd_time(): number
    getBet_end(): number
    setBet_end(value: number): void
    getLastBet_end(): number
    getMatch_start(): number
    setMatch_start(value: number): void
    getLastMatch_start(): number
    getMatch_end(): number
    setMatch_end(value: number): void
    getLastMatch_end(): number
    getOpen_times(): number
    setOpen_times(value: number): void
    getLastOpen_times(): number
    getHistroy(): Object
    setHistroy(value: Object): void
    getLastHistroy(): Object
}
let schema = {};
schema['user_bet'] = [
    'object',
    0
];
schema['bet_info'] = [
    'object',
    {}
];
schema['win_hero'] = [
    'number',
    0
];
schema['match_info'] = [
    'object',
    {}
];
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['bet_end'] = [
    'number',
    0
];
schema['match_start'] = [
    'number',
    0
];
schema['match_end'] = [
    'number',
    0
];
schema['open_times'] = [
    'number',
    0
];
schema['histroy'] = [
    'object',
    {}
];
let LINEAR_OFFSET = 0.5;
export class RunningManData extends BaseData {
    public static schema = schema;

    _waitTalkList;
    _playerTalkList;
    _runningTalkList;
    _signalRecvPlayHorseInfo;
    _signalRecvPlayHorseResult;
    _signalRecvPlayHorseBet;
    _signalPlayHorseBetNotice;

    _lastMatchInfo;

    constructor(properties?) {
        super(properties);
        this._signalRecvPlayHorseInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_PlayHorseInfo, this._s2cPlayHorseInfo.bind(this));
        this._signalRecvPlayHorseResult = G_NetworkManager.add(MessageIDConst.ID_S2C_PlayHorseResult, this._s2cPlayHorseResult.bind(this));
        this._signalRecvPlayHorseBet = G_NetworkManager.add(MessageIDConst.ID_S2C_PlayHorseBet, this._s2cPlayHorseBet.bind(this));
        this._signalPlayHorseBetNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_PlayHorseBetNotice, this._s2cPlayHorseBetNotice.bind(this));
    }
    public clear() {
        this._signalRecvPlayHorseInfo.remove();
        this._signalRecvPlayHorseInfo = null;
        this._signalRecvPlayHorseResult.remove();
        this._signalRecvPlayHorseResult = null;
        this._signalRecvPlayHorseBet.remove();
        this._signalRecvPlayHorseBet = null;
        this._signalPlayHorseBetNotice.remove();
        this._signalPlayHorseBetNotice = null;
    }
    public reset() {
    }
    public c2sPlayHorseInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PlayHorseInfo, {});
    }
    public getHeroBetNum(heroId) {
        let betTable = this.getUser_bet();
        if (betTable.length > 0) {
            for (let i in betTable) {
                let value = betTable[i];
                if (value.hero_id == heroId) {
                    return value.bet_num;
                }
            }
        }
        return 0;
    }
    public _updateBetInfoEx(message) {
        let user_bet = message['user_bet'];
        this.setUser_bet([]);
        if (user_bet) {
            this.setUser_bet(user_bet);
        }
        let bet_info = message['bet_info'];
        if (bet_info) {
            for (let i in bet_info) {
                let value = bet_info[i];
                let betInfo = this.getBetInfo(value.hero_id);
                if (betInfo) {
                    betInfo.heroWinRate = value.hero_win_rate;
                    betInfo.heroBetRate = value.hero_bet_rate;
                    betInfo.heroOdds = value.hero_odds;
                    betInfo.roadNum = value.road_num;
                    this.setBetInfo(betInfo);
                }
            }
        }
    }
    public _updateBetInfo(message) {
        let user_bet = message['user_bet'];
        this.setUser_bet([]);
        if (user_bet) {
            this.setUser_bet(user_bet);
        }
        let bet_info = message['bet_info'];
        this.setBet_info([]);
        if (bet_info) {
            let tempList = [];
            for (let i in bet_info) {
                let value = bet_info[i];
                let temp: any = {};
                temp.heroId = value.hero_id;
                temp.heroWinRate = value.hero_win_rate;
                temp.heroBetRate = value.hero_bet_rate;
                temp.heroOdds = value.hero_odds;
                temp.roadNum = value.road_num;
                temp.isPlayer = value['is_palyer'] || 0;
                temp.powerRank = value.power_rank;
                temp.user = this._converUserBaseInfo(value.user);
                tempList.push(temp);
            }
            ArraySort(tempList, function (item1, item2) {
                return item1.roadNum < item2.roadNum;
            });
            // cc.log(tempList);
            // cc.warn('_updateBetInfo');
            this.setBet_info(tempList);
        }
    }
    public _converUserBaseInfo(userInfo) {
        let retTable: any = {};
        if (userInfo == null) {
            return retTable;
        }
        let [baseId, userTable] = UserDataHelper.convertAvatarId(userInfo);
        retTable.playerInfo = userTable;
        retTable.user_id = userInfo.user_id;
        retTable.avatar_id = userInfo.avatar_id;
        retTable.avatar_base_id = userInfo.avatar_base_id;
        retTable.base_id = userInfo.base_id;
        retTable.office_level = userInfo.office_level;
        retTable.name = userInfo.name;
        retTable.title = userInfo.title;
        retTable.head_frame_id = userInfo.head_frame_id;
        return retTable;
    }
    public _s2cPlayHorseInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._updateBetInfo(message);
        let start_time = message['start_time'] || 0;
        this.setStart_time(start_time);
        let end_time = message['end_time'] || 0;
        this.setEnd_time(end_time);
        let bet_end = message['bet_end'] || 0;
        this.setBet_end(bet_end);
        this._registerAlarmClock(message.bet_end, message.end_time);
        let match_start = message['match_start'] || 0;
        this.setMatch_start(match_start);
        let match_end = message['match_end'] || 0;
        this.setMatch_end(match_end);
        let open_times = message['open_times'] || 0;
        this.setOpen_times(open_times);
        this._lastMatchInfo = [];
        let lastMatchInfo = message['last_match_info'];
        if (lastMatchInfo) {
            let tempTable = [];
            for (let i in lastMatchInfo) {
                let value = lastMatchInfo[i];
                let info: any = {};
                info.heroId = value.hero_id;
                info.time = value.use_time / 10;
                info.heroOdds = value.odds;
                info.isPlayer = value.is_player;
                info.user = this._converUserBaseInfo(value.user);
                tempTable.push(info);
            }
            ArraySort(tempTable, function (itemSort1, itemSort2) {
                return itemSort1.time < itemSort2.time;
            });
            this._lastMatchInfo = tempTable;
        }
        let histroy = message['histroy'];
        if (histroy) {
            this.setHistroy(histroy);
        }
        let state = RunningManHelp.getRunningState();
        if (state <= RunningManConst.RUNNING_STATE_BET) {
            this.setWin_hero(0);
            this.setMatch_info([]);
        }
        if (state == RunningManConst.RUNNING_STATE_END || state == RunningManConst.RUNNING_STATE_RUNNING_END) {
            this.resetTalkList();
        }
        var grainCarStartTime = message['grain_car_st_time'] || 0;
        var grainCarInterval = (GrainCarConfigHelper.getGrainCarEndTimeStamp().getTime() - GrainCarConfigHelper.getGrainCarOpenTimeStamp().getTime())/1000;
        let subResult = Math.abs(start_time - grainCarStartTime);
        if (grainCarStartTime > 0 && subResult <= grainCarInterval) {
            this.setStart_time(0);
            this.setMatch_end(0);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_PLAY_HORSE_INFO_SUCCESS);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RUNNING_MAN);
    }
    public getLastMatchInfo() {
        return this._lastMatchInfo;
    }
    public c2sPlayHorseResult() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PlayHorseResult, {});
    }
    public _s2cPlayHorseResult(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setWin_hero(0);
        let win_hero = message['win_hero'];
        if (win_hero) {
            this.setWin_hero(win_hero);
        }
        this.setMatch_info([]);
        let match_info = message['match_info'];
        if (match_info) {
            let tempList = [];
            for (let i in match_info) {
                let value = match_info[i];
                let temp = new RunningManUnitData(value);
                let betInfo = this.getBetInfo(temp.getHero_id());
                if (betInfo) {
                    temp.setRoad_num(betInfo.roadNum);
                    temp.setRank(value.rank);
                    tempList.push(temp);
                }
            }
            ArraySort(tempList, function (item1, item2) {
                return item1.getRoad_num() < item2.getRoad_num();
            });
            this.setMatch_info(tempList);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_PLAY_HORSE_RESULT_SUCCESS);
    }
    public c2sPlayHorseBet(hero_id, num) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PlayHorseBet, {
            hero_id: hero_id,
            num: num
        });
    }
    public _s2cPlayHorseBetNotice(id, message) {
        let updateBet = function (value) {
            let heroId = value['hero'];
            let bet_rate = value['bet_rate'];
            if (heroId && bet_rate) {
                let betInfoList = this.getBet_info();
                if (betInfoList && betInfoList.length > 0) {
                    for (let i in betInfoList) {
                        let value = betInfoList[i];
                        if (value.heroId == heroId) {
                            betInfoList[i].heroBetRate = bet_rate;
                        }
                    }
                }
            }
        }.bind(this);
        let bet_info = message['bet_info'] || {};
        if (bet_info.length > 0) {
            for (let i in bet_info) {
                let value = bet_info[i];
                updateBet(value);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_PLAY_HORSE_BET_NOTICE);
    }
    public _s2cPlayHorseBet(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._updateBetInfoEx(message);
        G_SignalManager.dispatch(SignalConst.EVENT_PLAY_HORSE_BET_SUCCESS);
    }
    public getRunningUnit(heroId) {
        let list = this.getMatch_info();
        if (list && list.length > 0) {
            for (let i in list) {
                let value = list[i];
                if (value.getHero_id() == heroId) {
                    return value;
                }
            }
            console.assert(false, 'can\'t find heroId [%d] in RunningManData Match_info table');
        }
        return null;
    }
    public resumeRunning() {
        let list = this.getMatch_info();
        if (list && list.length > 0) {
            for (let i in list) {
                let value = list[i];
                value.resumeRunning();
            }
        }
    }
    public getBetInfo(heroId) {
        let betInfo = this.getBet_info();
        if (betInfo && betInfo.length > 0) {
            for (let i in betInfo) {
                let value = betInfo[i];
                if (value.heroId == heroId) {
                    return value;
                }
            }
        }
        return null;
    }
    public setBetInfo(info) {
        let betInfo = this.getBet_info();
        for (let i in betInfo) {
            let value = betInfo[i];
            if (value.heroId == info.heroId) {
                betInfo[i] = info;
                break;
            }
        }
        this.setBet_info(betInfo);
    }
    public getMaxDistance() {
        let maxDistance = 0;
        let play_horse_info = G_ConfigLoader.getConfig(ConfigNameConst.PLAY_HORSE_INFO);
        let partNumber = play_horse_info.get(1).part_number;
        let lineSeq = partNumber.split('|');
        for (let i in lineSeq) {
            let value = lineSeq[i];
            maxDistance = Number(value) + maxDistance;
        }
        return maxDistance;
    }
    public getRunningCostValue() {
        let play_horse_info = G_ConfigLoader.getConfig(ConfigNameConst.PLAY_HORSE_INFO);
        let costType = play_horse_info.get(1).type;
        let costValue = play_horse_info.get(1).value;
        let costSize = play_horse_info.get(1).size;
        let support_max = play_horse_info.get(1).support_max;
        let player_max = play_horse_info.get(1).people_max;
        costValue = {
            type: costType,
            value: costValue,
            size: costSize,
            playerMax: player_max,
            limitMax: support_max
        };
        return costValue;
    }
    public getRunningEndTime() {
        let startTime = this.getMatch_start();
        let list = this.getMatch_info();
        let maxTime = 0;
        if (list.length > 0) {
            for (let i in list) {
                let value = list[i];
                maxTime = Math.max(maxTime, value.getRunningTime());
            }
        }
        return startTime + maxTime;
    }
    public getRunningTime() {
        let currTime = G_ServerTime.getTime()
        let misTime = G_ServerTime.getTimeElapsed();
        let startTime = this.getMatch_start();
        let runningTime = 0;
        let runningEndTime = this.getMatch_end();
        if (misTime >= startTime && misTime <= runningEndTime) {
            return misTime - startTime;
        }
        return 0;
    }
    public _registerAlarmClock(betEnd, endTime) {
        if (!endTime) {
            return;
        }
        let curTime = G_ServerTime.getTime();
        if (curTime <= endTime) {
            G_ServiceManager.registerOneAlarmClock('RUNNING_MAN_GET_NEXT', endTime + 1, () => {
                let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RUNNING_MAN)[0];
                if (isOpen) {
                    this.c2sPlayHorseInfo();
                }
            });
        }
        if (!betEnd) {
            return;
        }
        curTime = G_ServerTime.getTime();
        if (curTime <= betEnd) {
            G_ServiceManager.registerOneAlarmClock('RUNNING_MAN_BET_END', betEnd + 1, () => {
                let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RUNNING_MAN)[0];
                if (isOpen) {
                    G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RUNNING_MAN);
                }
            });
        }
    }
    public resetTalkList() {
        this._waitTalkList = null;
        this._runningTalkList = null;
        this._playerTalkList = null;
        if (this._waitTalkList == null) {
            this._waitTalkList = this._makeWaitTalkList();
        }
        if (this._playerTalkList == null) {
            this._playerTalkList = this._makePlayerTalkList();
        }
        if (this._runningTalkList == null) {
            this._runningTalkList = this._makeRunningTalkList();
        }
    }
    public getWaitTalkStr(heroId) {
        if (this._waitTalkList == null) {
            this._waitTalkList = this._makeWaitTalkList();
        }
        let leftTime = G_ServerTime.getLeftSeconds(this.getMatch_start());
        let listData = this._waitTalkList['k' + heroId];
        if (listData) {
            for (let i in listData) {
                let value = listData[i];
                if (leftTime <= value.showTime && leftTime >= value.minTime) {
                    return value.content;
                }
            }
        }
        return null;
    }
    public getPlayerWaitTalkStr(rank) {
        if (this._playerTalkList == null) {
            this._playerTalkList = this._makePlayerTalkList();
        }
        let leftTime = G_ServerTime.getLeftSeconds(this.getMatch_start());
        let listData = this._playerTalkList['k' + rank];
        if (listData) {
            for (let i in listData) {
                let value = listData[i];
                if (leftTime <= value.showTime && leftTime >= value.minTime) {
                    return value.content;
                }
            }
        }
        return null;
    }
    public getRunningTalkStr(rank) {
        if (this._runningTalkList == null) {
            this._runningTalkList = this._makeRunningTalkList();
        }
        let time = this.getRunningTime();
        let listData = this._runningTalkList['k' + rank];
        if (listData) {
            for (let i in listData) {
                let value = listData[i];
                if (time >= value.showTime && time <= value.maxTime && value.needShow) {
                    return value.content;
                }
            }
        }
        return null;
    }
    public _makePlayerTalkList() {
        function makeList(data) {
            let retList = [];
            let stringList = data.bubble_time.split('|');
            for (let i in stringList) {
                let value = stringList[i];
                let minList = value.split(',');
                let min = minList[0];
                let max = minList[1];
                let showTime = Math.randInt(Number(min), Number(max));
                let index = Math.randInt(1, 4);
                let talkStr = data['text_' + index];
                retList.push({
                    showTime: showTime,
                    content: talkStr,
                    minTime: Number(min),
                    maxTime: Number(max)
                });
            }
            return retList;
        }
        let retList = {};
        let play_horse_player = G_ConfigLoader.getConfig(ConfigNameConst.PLAY_HORSE_PLAYER)
        for (let i = 0; i < play_horse_player.length(); i++) {
            let data = play_horse_player.indexOf(i);
            let list = makeList(data);
            retList['k' + data.rank] = list;
        }
        return retList;
    }
    public _makeWaitTalkList() {
        function makeList(data) {
            let retList = [];
            let stringList = data.bubble_time.split('|');
            for (let i in stringList) {
                let value = stringList[i];
                let minList = value.split(',');
                let [min, max] = unpack(value.split(','));
                let showTime = Math.randInt(Number(min), Number(max));
                let index = Math.randInt(1, 4);
                let talkStr = data['text_' + index];
                retList.push({
                    showTime: showTime,
                    content: talkStr,
                    minTime: Number(min),
                    maxTime: Number(max)
                });
            }
            return retList;
        }
        let retList = {};
        let play_horse_hero = G_ConfigLoader.getConfig(ConfigNameConst.PLAY_HORSE_HERO)
        for (let i = 0; i < play_horse_hero.length(); i++) {
            let data = play_horse_hero.indexOf(i);
            let list = makeList(data);
            retList['k' + data.hero_id] = list;
        }
        return retList;
    }
    public _makeRunningTalkList() {
        function makeList(data) {
            let retList = [];
            let stringList = data.bubble_time.split('|');
            let percentList = data.probability.split('|');
            for (let i = 0; i < stringList.length; i++) {
                let value = stringList[i];
                let [min, max] = value.split(',');
                let showTime = Math.randInt(Number(min), Number(max));
                let startIndex = (i) * 4 + 1;
                let index = Math.randInt(startIndex, startIndex + 3);
                let talkStr = data['text_' + index];
                let percent = Number(percentList[i]);
                let rand = Math.randInt(1, 1000);
                retList.push({
                    showTime: showTime,
                    minTime: Number(min),
                    maxTime: Number(max),
                    needShow: rand <= percent,
                    content: talkStr,
                    percent: percent
                });
            }
            return retList;
        }
        let retList = {};
        let play_horse_bubble = G_ConfigLoader.getConfig(ConfigNameConst.PLAY_HORSE_BUBBLE);
        for (let i = 0; i < play_horse_bubble.length(); i++) {
            let data = play_horse_bubble.indexOf(i);
            let list = makeList(data);
            retList['k' + data.rank] = list;
        }
        return retList;
    }
    public hasRedPoint() {
        let state = RunningManHelp.getRunningState();
        if (state == RunningManConst.RUNNING_STATE_BET) {
            let betTable = this.getUser_bet();
            if (betTable && betTable.length > 0) {
                return false;
            }
            return true;
        }
        return false;
    }
}
