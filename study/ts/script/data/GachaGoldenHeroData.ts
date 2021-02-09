import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_Prompt, G_ServiceManager, G_ServerTime, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { GachaGoldenHeroConst } from "../const/GachaGoldenHeroConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { FunctionConst } from "../const/FunctionConst";

export interface GachaGoldenHeroData {
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getLastEnd_time(): number
    getShow_time(): number
    setShow_time(value: number): void
    getLastShow_time(): number
    getDrop_id(): number
    setDrop_id(value: number): void
    getLastDrop_id(): number
    getFree_cnt(): number
    setFree_cnt(value: number): void
    getLastFree_cnt(): number
    getFree_cd(): number
    setFree_cd(value: number): void
    getLastFree_cd(): number
    getLuck_draw_num(): number
    setLuck_draw_num(value: number): void
    getLastLuck_draw_num(): number
    isAutoPopupJoy(): boolean
    setAutoPopupJoy(value: boolean): void
    isLastAutoPopupJoy(): boolean
}
let schema = {};
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['show_time'] = [
    'number',
    0
];
schema['drop_id'] = [
    'number',
    0
];
schema['free_cnt'] = [
    'number',
    0
];
schema['free_cd'] = [
    'number',
    0
];
schema['luck_draw_num'] = [
    'number',
    0
];
schema['autoPopupJoy'] = [
    'boolean',
    true
];
export class GachaGoldenHeroData extends BaseData {
    public static schema = schema;

    _goldenJoyDraw;
    _goldenHeroGroup;
    _goldenRankCfg;
    _prizeLists;
    _ownRank;
    _msgFlushGacha;
    _msgGachaEntry;
    _msgGachaLadder;
    _msgGachaExit;
    _msgGachaNotify;
    _msgLuckDrawList;
    _msgRechargeReward;
    _goldenHeroZhenyinGroup;
    constructor(properties?) {
        super(properties);
        this._initGroupHeroId();
        this._initGoldenHeroRank();
        this._initGoldenJoyDraw();
        this._prizeLists = {};
        this._ownRank = {};
        this._msgFlushGacha = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGacha, this._s2cFlushGacha.bind(this));
        this._msgGachaEntry = G_NetworkManager.add(MessageIDConst.ID_S2C_GachaEntry, this._s2cGachaEntry.bind(this));
        this._msgGachaLadder = G_NetworkManager.add(MessageIDConst.ID_S2C_GetGachaLadder, this._s2cGachaLadder.bind(this));
        this._msgGachaExit = G_NetworkManager.add(MessageIDConst.ID_S2C_GachaExit, this._s2cGachaExit.bind(this));
        this._msgGachaNotify = G_NetworkManager.add(MessageIDConst.ID_S2C_GachaNotify, this._s2cGachaNotify.bind(this));
        this._msgLuckDrawList = G_NetworkManager.add(MessageIDConst.ID_S2C_GachaLuckDrawList, this._s2cGachaLuckDrawList.bind(this));
        this._msgRechargeReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GachaRechrageReward, this._s2cGachaRechargeReward.bind(this));
    }
    public clear() {
        this._msgFlushGacha.remove();
        this._msgFlushGacha = null;
        this._msgGachaEntry.remove();
        this._msgGachaEntry = null;
        this._msgGachaLadder.remove();
        this._msgGachaLadder = null;
        this._msgGachaExit.remove();
        this._msgGachaExit = null;
        this._msgGachaNotify.remove();
        this._msgGachaNotify = null;
        this._msgLuckDrawList.remove();
        this._msgLuckDrawList = null;
        this._msgRechargeReward.remove();
        this._msgRechargeReward = null;
    }
    public reset() {
    }
    public c2sGachaEntry() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GachaEntry, {});
    }
    public _s2cGachaEntry(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let freeCnt = 5;
        if(message.free_cnt != undefined){
            freeCnt = message.free_cnt;
        }
        freeCnt = 5 - freeCnt;
        this.setDrop_id(message['drop_id'] || 1101);
        this.setFree_cnt(freeCnt);
        var free_cd = 0;
        if(message.free_cd != undefined){
            free_cd = message.free_cd;
        }
        this.setFree_cd(free_cd);
        var luck_draw_num = 0;
        if(message.luck_draw_num != undefined){
            luck_draw_num = message.luck_draw_num;
        }
        this.setLuck_draw_num(luck_draw_num);
        this._prizeLists = message['prize_lists'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_ENTRY, message);
    }
    public c2sGacha(gachaType, poolType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_Gacha, {
            gacha_type: gachaType,
            pool_type: poolType
        });
    }
    public c2sGachaExit() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GachaExit, {});
    }
    public _s2cGachaExit(id, message) {
    }
    public c2sGachaLadder(type) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetGachaLadder, { ladder_type: type });
    }
    public _s2cGachaLadder(id, message) {
        let ladders = message['ladders'] || {};
        if (message.ladder_type == 1) {
            if (!this._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK + 1]) {
                this._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK + 1] = {};
            }
            this._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK + 1] = {
                rank: message['own_rank'] || 0,
                point: message.point
            };
        } else if (message.ladder_type == 0) {
            if (!this._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK + 2]) {
                this._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK + 2] = {};
            }
            this._ownRank[GachaGoldenHeroConst.FLAG_OWNRANK + 2] = {
                rank: message['own_rank'] || 0,
                point: message.point
            };
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_JOYRANK, message);
    }
    public  _initGroupHeroId() {
        this._goldenHeroGroup = [];
        this._goldenHeroZhenyinGroup = [];
        var heroIds = {};
        var paramConfig = G_ConfigLoader.getConfig(ConfigNameConst.GOLDENHERO_RECRUIT);
        var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        for (var i = 0; i < paramConfig.length(); i++) {
            var data = paramConfig.indexOf(i);
            var newHeroId = data.hero;
            var heroConfigInfo = heroConfig.get(newHeroId);
            for (let k in this._goldenHeroGroup) {
                var v = this._goldenHeroGroup[k];
                if (v == data.hero) {
                    newHeroId = 0;
                }
            }
            if (newHeroId && !(parseInt(newHeroId)==0)) {
                this._goldenHeroGroup.push(newHeroId);
                if (heroConfigInfo) {
                    var country = heroConfigInfo.country;
                    this._goldenHeroZhenyinGroup[country] = this._goldenHeroZhenyinGroup[country] || [];
                    this._goldenHeroZhenyinGroup[country].push(newHeroId);
                }
            }
        }
    }
    public _s2cGachaNotify(id, message) {
    }
    public _s2cGachaLuckDrawList(id, message) {
        this._prizeLists = message['lists'] || {};
        this.setDrop_id(message['drop_id'] || 1101);
        G_SignalManager.dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_LUCKLIST);
    }
    public _s2cGachaRechargeReward(id, message) {
        if (message.hasOwnProperty('awards')) {
            G_Prompt.showAwards(message.awards);
            G_SignalManager.dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_UPDATEITEM);
        }
    }
    _s2cFlushGacha(id, message) {
        this.setStart_time(message['start_time'] || 0);
        this.setEnd_time(message['end_time'] || 0);
        this.setShow_time(message['show_end_time'] || 0);
        if (G_ServerTime.getTime() >= this.getStart_time() && G_ServerTime.getTime() <= this.getShow_time()) {
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GACHA_GOLDENHERO);
            G_ServiceManager.registerOneAlarmClock('gachaend', message.show_end_time + 1, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GACHA_GOLDENHERO);
            });
        } else if (G_ServerTime.getLeftSeconds(this.getStart_time()) > 0) {
            G_ServiceManager.registerOneAlarmClock('gachastart', message.start_time + 1, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GACHA_GOLDENHERO);
            });
        }
    }
    public getGoldenHeroRankCfg() {
        return this._goldenRankCfg;
    }
    public getGoldHeroGroupId() {
        return this._goldenHeroGroup;
    }
    public getGoldenJoyDraw() {
        return this._goldenJoyDraw;
    }
    public getPrizeLists() {
        return this._prizeLists;
    }
    public getGoldHeroGroupIdByCountry(country) {
        return this._goldenHeroZhenyinGroup[country] || [];
    }
    public getOwnRankData() {
        return this._ownRank;
    }
    public _initGoldenHeroRank() {
        this._goldenRankCfg = {};
        let paramConfig = G_ConfigLoader.getConfig(ConfigNameConst.GOLDENHERO_RANK);
        for (let i = 0; i < paramConfig.length(); i++) {
            let data = paramConfig.indexOf(i);
            if (!this._goldenRankCfg[data.rank_type]) {
                this._goldenRankCfg[data.rank_type] = [];
            }
            this._goldenRankCfg[data.rank_type].push(data);
        }
    }
    public _initGoldenJoyDraw() {
        this._goldenJoyDraw = {};
        let joyIndex = 0;
        let paramConfig = G_ConfigLoader.getConfig(ConfigNameConst.GOLDENHERO_DRAW);
        for (let i = 0; i < paramConfig.length(); i++) {
            let data = paramConfig.indexOf(i);
            if (data.time == 0) {
                joyIndex = joyIndex + 1;
                this._goldenJoyDraw[joyIndex] = [];
            }
            this._goldenJoyDraw[joyIndex].push(data);
        }
    }
}
