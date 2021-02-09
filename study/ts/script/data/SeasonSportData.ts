import { BaseData } from "./BaseData";
import { G_NetworkManager, G_ServiceManager, G_ServerTime, G_SignalManager, G_UserData, G_SceneManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { ArraySort } from "../utils/handler";
import { SeasonSportHelper } from "../scene/view/seasonSport/SeasonSportHelper";
import { SeasonSportConst } from "../const/SeasonSportConst";
import { bit } from "../utils/bit";
import { FunctionConst } from "../const/FunctionConst";

export interface SeasonSportData {
    getCurSeason(): number
    setCurSeason(value: number): void
    getLastCurSeason(): number
    getSeason_Stage(): number
    setSeason_Stage(value: number): void
    getLastSeason_Stage(): number
    isInHerit(): boolean
    setInHerit(value: boolean): void
    isLastInHerit(): boolean
    getSeasonStartTime(): number
    setSeasonStartTime(value: number): void
    getLastSeasonStartTime(): number
    getSeasonEndTime(): number
    setSeasonEndTime(value: number): void
    getLastSeasonEndTime(): number
    getLastSeason_Star(): number
    setLastSeason_Star(value: number): void
    getLastLastSeason_Star(): number
    getCurSeason_Star(): number
    setCurSeason_Star(value: number): void
    getLastCurSeason_Star(): number
    getServerId(): number
    setServerId(value: number): void
    getLastServerId(): number
    getPrior(): number
    setPrior(value: number): void
    getLastPrior(): number
    getSuspendTime(): number
    setSuspendTime(value: number): void
    getLastSuspendTime(): number
    getSilkGroupInfo(): any[]
    setSilkGroupInfo(value: any[]): void
    getLastSilkGroupInfo(): any[]
    isReceivedRewards(): boolean
    setReceivedRewards(value: boolean): void
    isLastReceivedRewards(): boolean
    getBindedSilkGroups(): Object
    setBindedSilkGroups(value: Object): void
    getLastBindedSilkGroups(): Object
    isOnGoing(): boolean
    setOnGoing(value: boolean): void
    isLastOnGoing(): boolean
    getSeason_Fight_Num(): number
    setSeason_Fight_Num(value: number): void
    getLastSeason_Fight_Num(): number
    getSeason_Win_Num(): number
    setSeason_Win_Num(value: number): void
    getLastSeason_Win_Num(): number
    getOwnRank(): number
    setOwnRank(value: number): void
    getLastOwnRank(): number
    getOwnFightCount(): number
    setOwnFightCount(value: number): void
    getLastOwnFightCount(): number
    getOwnWinCount(): number
    setOwnWinCount(value: number): void
    getLastOwnWinCount(): number
    getOwnFightReport(): any[]
    setOwnFightReport(value: any[]): void
    getLastOwnFightReport(): any[]
    getOwn_DanInfo(): Object
    setOwn_DanInfo(value: Object): void
    getLastOwn_DanInfo(): Object
    getOther_DanInfo(): Object
    setOther_DanInfo(value: Object): void
    getLastOther_DanInfo(): Object
    getCurrentRound(): number
    setCurrentRound(value: number): void
    getLastCurrentRound(): number
    getCurrentRound_EndTime(): number
    setCurrentRound_EndTime(value: number): void
    getLastCurrentRound_EndTime(): number
    getOwn_SquadInfo(): any[]
    setOwn_SquadInfo(value: any[]): void
    getLastOwn_SquadInfo(): Object
    getOwn_SquadType(): any[]
    setOwn_SquadType(value: any[]): void
    getLastOwn_SquadType(): Object
    getOther_SquadInfo(): any[]
    setOther_SquadInfo(value: any[]): void
    getLastOther_SquadInfo(): Object
    getTimeOutCD(): number
    setTimeOutCD(value: number): void
    getLastTimeOutCD(): number
    isSquadOffline(): boolean
    setSquadOffline(value: boolean): void
    isLastSquadOffline(): boolean
    isSquadReconnect(): boolean
    setSquadReconnect(value: boolean): void
    isLastSquadReconnect(): boolean
    isInSquadSelectView(): boolean
    setInSquadSelectView(value: boolean): void
    isLastInSquadSelectView(): boolean
    getDailyFightReward(): any[]
    setDailyFightReward(value: Object): void
    getLastDailyFightReward(): Object
    getDailyWinReward(): any[]
    setDailyWinReward(value: Object): void
    getLastDailyWinReward(): Object
    getFightNum(): number
    setFightNum(value: number): void
    getLastFightNum(): number
    getWinNum(): number
    setWinNum(value: number): void
    getLastWinNum(): number
    getSeasonPets(): any[]
    setSeasonPets(value: any[]): void
    getLastSeasonPets(): Object
    getSeasonPetsStar(): number
    setSeasonPetsStar(value: number): void
    getLastSeasonPetsStar(): number
    getBanHeros(): any[]
    setBanHeros(value: any[]): void
    getLastBanHeros(): Object
    getBanPets(): any[]
    setBanPets(value: any[]): void
    getLastBanPets(): Object
    isBanPick(): boolean
    setBanPick(value: boolean): void
    isLastBanPick(): boolean
    isPlayReport(): boolean
    setPlayReport(value: boolean): void
    isLastPlayReport(): boolean
}
let schema = {};
schema['curSeason'] = [
    'number',
    0
];
schema['season_Stage'] = [
    'number',
    0
];
schema['inHerit'] = [
    'boolean',
    false
];
schema['seasonStartTime'] = [
    'number',
    0
];
schema['seasonEndTime'] = [
    'number',
    0
];
schema['lastSeason_Star'] = [
    'number',
    0
];
schema['curSeason_Star'] = [
    'number',
    0
];
schema['serverId'] = [
    'number',
    0
];
schema['prior'] = [
    'number',
    0
];
schema['suspendTime'] = [
    'number',
    0
];
schema['silkGroupInfo'] = [
    'object',
    {}
];
schema['receivedRewards'] = [
    'boolean',
    false
];
schema['bindedSilkGroups'] = [
    'object',
    {}
];
schema['onGoing'] = [
    'boolean',
    false
];
schema['season_Fight_Num'] = [
    'number',
    0
];
schema['season_Win_Num'] = [
    'number',
    0
];
schema['ownRank'] = [
    'number',
    0
];
schema['ownFightCount'] = [
    'number',
    0
];
schema['ownWinCount'] = [
    'number',
    0
];
schema['ownFightReport'] = [
    'object',
    {}
];
schema['own_DanInfo'] = [
    'object',
    {}
];
schema['other_DanInfo'] = [
    'object',
    {}
];
schema['currentRound'] = [
    'number',
    0
];
schema['currentRound_EndTime'] = [
    'number',
    0
];
schema['own_SquadInfo'] = [
    'object',
    {}
];
schema['own_SquadType'] = [
    'object',
    {}
];
schema['other_SquadInfo'] = [
    'object',
    {}
];
schema['timeOutCD'] = [
    'number',
    0
];
schema['squadOffline'] = [
    'boolean',
    false
];
schema['squadReconnect'] = [
    'boolean',
    false
];
schema['inSquadSelectView'] = [
    'boolean',
    false
];
schema['dailyFightReward'] = [
    'object',
    {}
];
schema['dailyWinReward'] = [
    'object',
    {}
];
schema['fightNum'] = [
    'number',
    0
];
schema['winNum'] = [
    'number',
    0
];
schema['seasonPets'] = [
    'object',
    {}
];
schema['seasonPetsStar'] = [
    'number',
    0
];
schema['banHeros'] = [
    'object',
    {}
];
schema['banPets'] = [
    'object',
    {}
];
schema['banPick'] = [
    'boolean',
    false
];
schema['playReport'] = [
    'boolean',
    false
];
export class SeasonSportData extends BaseData {

    public static schema = schema;
    _heroListInfo;
    _orangeHeroListInfo;
    _redHeroListInfo;
    _freeOpenSilkGroup;
    _transformCards;
    _petListInfo;
    _isInSeasonSilkView;
    _isModifySilkGroupName;
    _isCancelMatch;
    _isMatchSuccess;
    _isOtherCDOut;
    _ownCDOutAndDropStar;
    _fightInfo;
    _fightsEntrance;
    _fightsLadder;
    _fightsBonus;
    _fightsInitiate;
    _fightsCancel;
    _fightsReport;
    _playReport;
    _fightsBan;
    _fightsBanCheck;
    _fightsBanPick;
    _fightsReconnect;
    _fightsSilkbagBinding;
    _fightsSilkbagSetting;
    _fightsMatchedOpponent;
    _goldenHeroListInfo: {};


    constructor(properties?) {
        super(properties);
        this._heroListInfo = {};
        this._orangeHeroListInfo = {};
        this._redHeroListInfo = {};
        this._goldenHeroListInfo = {};
        this._freeOpenSilkGroup = [];
        this._transformCards = [];
        this._petListInfo = {};
        this._isInSeasonSilkView = false;
        this._isModifySilkGroupName = false;
        this._isCancelMatch = true;
        this._isMatchSuccess = false;
        this._isOtherCDOut = false;
        this._ownCDOutAndDropStar = 0;
        this._fightInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetFightInfo, this._s2cFightInfo.bind(this));
        this._fightsEntrance = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsEntrance, this._s2cFightsEntrance.bind(this));
        this._fightsLadder = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsLadder, this._s2cFightsLadder.bind(this));
        this._fightsBonus = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsBonus, this._s2cFightsBonus.bind(this));
        this._fightsInitiate = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsInitiate, this._s2cFightsInitiate.bind(this));
        this._fightsCancel = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsCancel, this._s2cFightsCancel.bind(this));
        this._fightsReport = G_NetworkManager.add(MessageIDConst.ID_S2C_CommonGetReport, this._s2cFightsReport.bind(this));
        this._playReport = G_NetworkManager.add(MessageIDConst.ID_S2C_GetBattleReport, this._s2cPlayFightsReport.bind(this));
        this._fightsBan = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsBan, this._s2cFightsBan.bind(this));
        this._fightsBanCheck = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsBanCheck, this._s2cFightsBanCheck.bind(this));
        this._fightsBanPick = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsBanPick, this._s2cFightsBanPick.bind(this));
        this._fightsReconnect = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsReconnection, this._s2cFightsReconnection.bind(this));
        this._fightsSilkbagBinding = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsSilkbagBinding, this._s2FightsSilkbagBinding.bind(this));
        this._fightsSilkbagSetting = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsSilkbagSetting, this._s2cFightsSilkbagSetting.bind(this));
        this._fightsMatchedOpponent = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsMatchedOpponent, this._s2cFightsMatchedOpponent.bind(this));
    }
    public clear() {
        this._fightInfo.remove();
        this._fightsEntrance.remove();
        this._fightsLadder.remove();
        this._fightsBonus.remove();
        this._fightsInitiate.remove();
        this._fightsCancel.remove();
        this._fightsBan.remove();
        this._fightsBanCheck.remove();
        this._fightsBanPick.remove();
        this._fightsReport.remove();
        this._playReport.remove();
        this._fightsReconnect.remove();
        this._fightsSilkbagBinding.remove();
        this._fightsSilkbagSetting.remove();
        this._fightsMatchedOpponent.remove();
        this._fightInfo = null;
        this._fightsEntrance = null;
        this._fightsLadder = null;
        this._fightsBonus = null;
        this._fightsInitiate = null;
        this._fightsCancel = null;
        this._fightsBan = null;
        this._fightsBanCheck = null;
        this._fightsBanPick = null;
        this._fightsReport = null;
        this._playReport = null;
        this._fightsReconnect = null;
        this._fightsSilkbagBinding = null;
        this._fightsSilkbagSetting = null;
        this._fightsMatchedOpponent = null;
    }
    public reset() {
    }
    public _s2cFightInfo(id, message) {
        this.setSeasonStartTime(message.season_start);
        this.setSeasonEndTime(message.season_end);
        if (G_ServerTime.getTime() == this.getSeasonEndTime()) {
            G_ServiceManager.registerOneAlarmClock('SeasonMainBtn3', message.season_end, function () {
                G_NetworkManager.send(MessageIDConst.ID_C2S_GetFightInfo, {});
            });
        } else if (G_ServerTime.getTime() < this.getSeasonStartTime()) {
            G_ServiceManager.registerOneAlarmClock('SeasonMainBtn1', message.season_start, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT);
                G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_START);
            });
        } else if (G_ServerTime.getTime() < this.getSeasonEndTime()) {
            G_ServiceManager.registerOneAlarmClock('SeasonMainBtn2', message.season_end + 1, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT);
                G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_END);
            });
        }
    }
    public c2sFightsEntrance() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsEntrance, {});
    }
    public _s2cFightsEntrance(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._isMatchSuccess = false;
        this._freeOpenSilkGroup = SeasonSportHelper.getFreeDan();
        G_UserData.getSeasonSilk().initOrangeSilkInfo(message.group);
        G_UserData.getSeasonSilk().initRedSilkInfo(message.group);
        G_UserData.getSeasonSilk().initGoldSilkInfo(message.group);
        this._ownCDOutAndDropStar = message['reduce_star'] != null && message.reduce_star || 0;
        if (this.isSquadReconnect() == false) {
            this.setTimeOutCD(0);
        }
        this.setServerId(message.sid);
        this.setInHerit(message.is_inherit || false);
        this.setLastSeason_Star(message.history_star != 0 && message.history_star || 1);
        if (typeof message.history_star == 'object') {
            this.setLastSeason_Star(1);
        }
        this.setCurSeason_Star(message.now_star > 0 && message.now_star || 1);
        this.setSeason_Stage(message.group);
        this.setSuspendTime(message.no_entry_end_time || 0);
        this.setSilkGroupInfo(message.silkbag_config);
        this.setSeasonEndTime(message.season_end_time);
        this.setCurSeason(message.season);
        this.setBindedSilkGroups(message.unit_silkbag_binding);
        this.setReceivedRewards(message.is_history_bonus_recved == 0 && true || false);
        this.setOnGoing(message.be_ongoing);
        let dailyFight = bit.tobits(message.daily_fight_reward);
        let dailyWin = bit.tobits(message.daily_win_reward);
        this.setDailyFightReward(dailyFight);
        this.setDailyWinReward(dailyWin);
        this.setFightNum(message.fight_num);
        this.setWinNum(message.win_num);
        this.setSeason_Fight_Num(message.season_fight_num);
        this.setSeason_Win_Num(message.season_win_num);
        this.setSeasonPets(message['pets']);
        ArraySort(this.getSilkGroupInfo(), function (item1, item2) {
            return item1.idx < item2.idx;
        });
        if (message.group == SeasonSportConst.SEASON_STAGE_ROOKIE) {
            this.setSeasonPetsStar(Number(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_PET_ROOKIE_STARMAX).content));
        } else if (message.group == SeasonSportConst.SEASON_STAGE_ADVANCED) {
            this.setSeasonPetsStar(Number(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_PET_ADVANC_STARMAX).content));
        } else if (message.group == SeasonSportConst.SEASON_STAGE_HIGHT) {
            this.setSeasonPetsStar(Number(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_PET_HIGHT_STARMAX).content));
        }
        this._orangeHeroListInfo = SeasonSportHelper.getOrangeHeroList(message.group);
        this._redHeroListInfo = SeasonSportHelper.getRedHeroList(message.group);
        this._goldenHeroListInfo = SeasonSportHelper.getGoldenHeroList(message.group);
        this._heroListInfo = SeasonSportHelper.getHeroList(message.group);
        this._transformCards = SeasonSportHelper.getTransformCards(message.group);
        this._petListInfo = SeasonSportHelper.getPetList();
        if (this.isOnGoing()) {
            this.setSquadReconnect(true);
            this.c2sFightsReconnection();
        } else {
            this.setSquadReconnect(false);
            G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, message);
        }
    }
    public c2sFightsReconnection() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsReconnection, {});
    }
    public _s2cFightsReconnection(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_RECONNECT_OVER, message);
            return;
        }
        this._isMatchSuccess = true;
        let maxStage = SeasonSportHelper.getMaxFightStage();
        let ownDanInfo = {
            isOwn: true,
            baseId: G_UserData.getBase().getPlayerBaseId(),
            sid: G_UserData.getBase().getServer_name(),
            star: this.getCurSeason_Star(),
            name: G_UserData.getBase().getName(),
            isProir: message.is_first == 1 && true || false,
            officialLevel: G_UserData.getBase().getOfficialLevel()
        };
        this.setOwn_DanInfo(ownDanInfo);
        let otherDanInfo = {
            isOwn: false,
            sid: message.sname,
            name: message.uname,
            star: message.star,
            isProir: message.is_first == 2 && true || false,
            officialLevel: message.title
        };
        // var round = message['round'] || 0;

        this.setOnGoing(true);
        this.setOther_DanInfo(otherDanInfo);
        this.setCurrentRound(message.round > maxStage && maxStage || message.round);
        this.setCurrentRound_EndTime(message.round_end_time);
        this.setOwn_SquadInfo(message.own_side);
        this.setOwn_SquadType(message.own_side_avater);
        this.setOther_SquadInfo(message.other_side);
        this.setBanHeros(message['ban_units']);
        this.setBanPets(message['ban_pets']);
        this.setPrior(message.is_first);
        this.setSquadOffline(false);
        this.setBanPick(false);
        let banNeedStar = Number(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NEEDSTAR).content);
        if (!(ownDanInfo.star < banNeedStar && otherDanInfo.star < banNeedStar)) {
            this.setBanPick(true);
        }
        if (this.isInSquadSelectView() == false) {
            G_SceneManager.showScene('seasonCompetitive');
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_RECONNECT, message);
    }
    public c2sFightsSilkbagSetting(groupPos, groupName, groupsSilks) {
        let silkbag_config = {
            idx: groupPos,
            name: groupName,
            silkbag: groupsSilks || []
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsSilkbagSetting, { silkbag_config: silkbag_config });
    }
    public _s2cFightsSilkbagSetting(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_SILKEQUIP_SUCCESS, message);
    }
    public c2sFightsLadder() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsLadder, {});
    }
    public _s2cFightsLadder(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setCurSeason_Star(message.star > 0 && message.star || 1);
        this.setOwnRank(message.rank || 0);
        this.setOwnFightCount(message.fight_count || 0);
        this.setOwnWinCount(message.win_count || 0);
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_RANK, message);
    }
    public c2sFightsBonus(type, idx) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsBonus, {
            bonus_type: type,
            idx: idx
        });
    }
    public _s2cFightsBonus(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_UserData.getSeasonSport().setReceivedRewards(message.reward_state == 0 || false);
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_REWARDS, message);
    }
    public c2sFightsInitiate() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsInitiate, {});
    }
    public _s2cFightsInitiate(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_MATCHING, message);
    }
    public _s2cFightsMatchedOpponent(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            if (message.ret == MessageErrorConst.RET_FIGHTS_MATCH_TIMEOUT) {
                G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_MATCH_TIMEOUT, message);
            }
            return;
        }
        this._isMatchSuccess = true;
        this.setCurSeason_Star(message.own_star > 0 && message.own_star || 1);
        let ownDanInfo = {
            isOwn: true,
            baseId: G_UserData.getBase().getPlayerBaseId(),
            sid: G_UserData.getBase().getServer_name(),
            star: message.own_star,
            name: G_UserData.getBase().getName(),
            isProir: message.is_first == 1,
            officialLevel: G_UserData.getBase().getOfficialLevel(),
            head_frame_id: G_UserData.getBase().getHead_frame_id()
        };
        this.setOwn_DanInfo(ownDanInfo);
        let otherDanInfo = {
            isOwn: false,
            sid: message.sname,
            name: message.uname,
            star: message.star,
            baseId: message.base_id,
            avatarId: message.avatar_base_id,
            isProir: message.is_first == 2,
            officialLevel: message.title,
            head_frame_id: message['head_icon_id']
        };
        this.setOther_DanInfo(otherDanInfo);
        this.setCurrentRound(1);
        this.setPrior(message.is_first);
        this.setCurrentRound_EndTime(message.round_end_time);
        this.setSquadOffline(false);
        this.setBanPick(false);
        this.setBanHeros(null);
        this.setBanPets(null);
        let banNeedStar = Number(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NEEDSTAR).content);
        if (!(ownDanInfo.star < banNeedStar && otherDanInfo.star < banNeedStar)) {
            this.setCurrentRound(0);
            this.setBanPick(true);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_FIGHT_MATCH, message);
    }
    public c2sFightsCancel() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsCancel, {});
    }
    public _s2cFightsCancel(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setCancelMatch(true);
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_CANCEL_MATCH, message);
    }
    public c2sFightsSilkbagBinding(data, pets) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsSilkbagBinding, {
            skb: data,
            pets: pets
        });
    }
    public _s2FightsSilkbagBinding(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_BINDINGOK);
    }
    public c2sFightsBan(data, pets) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsBan, {
            units: data,
            pets: pets
        });
    }
    public _s2cFightsBan(id, message) {
        this.setBanPick(false);
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_WAITING_BAN, message);
    }
    public _s2cFightsBanCheck(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setBanPick(false);
        this.setCurrentRound(1);
        this.setBanHeros(message['units']);
        this.setBanPets(message['pets']);
        this.setCurrentRound_EndTime(message.round_end_time);
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_HEROS_BAN, message);
    }
    public c2sFightsBanPick(data) {
        console.log("c2sFightsBanPick", data);
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsBanPick, { bp: data });
    }
    public _s2cFightsBanPick(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            console.log("_s2cFightsBanPick err");
            return;
        }
        let maxStage = SeasonSportHelper.getMaxFightStage();
        this.setCurrentRound(message.round > maxStage && maxStage || message.round);
        this.setCurrentRound_EndTime(message.round_end_time);
        this.setOwn_SquadInfo(message.own_side);
        this.setOwn_SquadType(message.own_side_avater);
        this.setOther_SquadInfo(message.other_side);
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_HEROS_PITCH, message);
    }
    public c2sFightsFight() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FightsFight, {});
    }
    public c2scFightsReport() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CommonGetReport, { report_type: 6 });
    }
    public _s2cFightsReport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message['report_type'] != 6) {
            return;
        }
        this.setOwnFightReport(message.fights_reports);
        ArraySort(this.getOwnFightReport(), function (item1, item2) {
            return item1.report_time > item2.report_time;
        });
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_OWNFIGHTREPORT, message);
    }
    public c2scPlayFightsReport(reportId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetBattleReport, { id: reportId });
    }
    public _s2cPlayFightsReport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_PLAYFIGHTREPORT, message);
    }
    public setInSeasonSilkView(bIn) {
        this._isInSeasonSilkView = bIn;
    }
    public getInSeasonSilkView() {
        return this._isInSeasonSilkView;
    }
    public setModifySilkGroupName(bModify) {
        this._isModifySilkGroupName = bModify;
    }
    public getModifySilkGroupName() {
        return this._isModifySilkGroupName;
    }
    public setCancelMatch(bCancel) {
        this._isCancelMatch = bCancel;
    }
    public getCancelMatch() {
        return this._isCancelMatch;
    }
    public setMatchSuccess(bSuccess) {
        this._isMatchSuccess = bSuccess;
    }
    public getMatchSuccess() {
        return this._isMatchSuccess;
    }
    public setOwnCDOutAndDropStar(bCDOutAndDropStar) {
        this._ownCDOutAndDropStar = bCDOutAndDropStar;
    }
    public getOwnCDOutAndDropStar() {
        return this._ownCDOutAndDropStar;
    }
    public setOtherCDOut(bOtherCDOut) {
        this._isOtherCDOut = bOtherCDOut;
    }
    public getOtherCDOut() {
        return this._isOtherCDOut;
    }
    public getFreeOpenSilkGroup(): any[] {
        return this._freeOpenSilkGroup;
    }
    public getOrangeHeroListInfo() {
        return this._orangeHeroListInfo;
    }
    public getRedHeroListInfo() {
        return this._redHeroListInfo;
    }
    public getHeroListInfo() {
        return this._heroListInfo;
    }
    getGoldenHeroListInfo () {
        return this._goldenHeroListInfo;
    }
    public getTransformCardHeros(): any[] {
        return this._transformCards;
    }
    public getPetListInfo(): any[] {
        return this._petListInfo;
    }
}
