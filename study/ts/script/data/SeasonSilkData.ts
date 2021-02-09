import { G_UserData, G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { BaseData } from "./BaseData";
import { SeasonSilkConst } from "../const/SeasonSilkConst";
import { ArraySort } from "../utils/handler";

export interface SeasonSilkData {
}
let schema = {};
export class SeasonSilkData extends BaseData {
    public static schema = schema;

    _orangeSilkInfo: any[];
    _redSilkInfo:any[];
    _goldSilkInfo:any[];

    constructor(properties?) {
        super(properties);
        this._orangeSilkInfo = [];
        this._redSilkInfo = [];
        this._goldSilkInfo = [];
    }
    public clear() {
    }
    public reset() {
    }
    public getOrangeSilkInfo():any[] {
        return this._orangeSilkInfo;
    }
    public getRedSilkInfo():any[] {
        return this._redSilkInfo;
    }
    public getGoldSilkInfo():any[] {
        return this._goldSilkInfo;
    }
    public initOrangeSilkInfo(stage) {
        this._orangeSilkInfo = [];
        if (stage == null) {
            return;
        }
        let itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.SILKBAG);
        let openServerDay = G_UserData.getBase().getOpenServerDayNum();
        for (let loopi = 0; loopi < itemInfo.length(); loopi++) {
            let itemData = itemInfo.indexOf(loopi);
            let itemColor = itemData.color;
            let figthType = Number(itemData.is_fight);
            if (figthType != 0 && itemColor == SeasonSilkConst.SILK_SCOP_LOWERLIMIT && figthType <= stage) {
                this._orangeSilkInfo = this._orangeSilkInfo || [];
                if (this._orangeSilkInfo == null) {
                    this._orangeSilkInfo = [];
                }
                this._orangeSilkInfo.push({ cfg: itemData });
                ArraySort(this._orangeSilkInfo, function (item1, item2) {
                    if (item1.cfg.order != item2.cfg.order) {
                        return item1.cfg.order < item2.cfg.order;
                    } else {
                        return item1.cfg.id < item2.cfg.id;
                    }
                });
            }
        }
    }
    public initRedSilkInfo(stage) {
        this._redSilkInfo = [];
        if (stage == null) {
            return;
        }
        let itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.SILKBAG);
        let openServerDay = G_UserData.getBase().getOpenServerDayNum();
        for (let loopi = 0; loopi < itemInfo.length(); loopi++) {
            let itemData = itemInfo.indexOf(loopi);
            let itemColor = itemData.color;
            let figthType = Number(itemData.is_fight);
            if (figthType != 0 && itemColor == SeasonSilkConst.SILK_SCOP_REDLIMIT && figthType <= stage) {
                this._redSilkInfo = this._redSilkInfo || [];
                if (this._redSilkInfo == null) {
                    this._redSilkInfo = [];
                }
                this._redSilkInfo.push({ cfg: itemData });
                ArraySort(this._redSilkInfo, function (item1, item2) {
                    if (item1.cfg.order != item2.cfg.order) {
                        return item1.cfg.order < item2.cfg.order;
                    } else {
                        return item1.cfg.id < item2.cfg.id;
                    }
                });
            }
        }
    }
    public initGoldSilkInfo(stage) {
        this._goldSilkInfo = [];
        if (stage == null) {
            return;
        }
        let itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.SILKBAG);
        for (let loopi = 0; loopi < itemInfo.length(); loopi++) {
            let itemData = itemInfo.indexOf(loopi);
            let itemColor = itemData.color;
            let figthType = Number(itemData.is_fight);
            if (figthType != 0 && itemColor == SeasonSilkConst.SILK_SCOP_GOLDLIMIT && figthType <= stage) {
                this._goldSilkInfo = this._goldSilkInfo || [];
                this._goldSilkInfo.push({ cfg: itemData });
                ArraySort(this._goldSilkInfo, function (item1, item2) {
                    if (item1.cfg.order != item2.cfg.order) {
                        return item1.cfg.order < item2.cfg.order;
                    } else {
                        return item1.cfg.id < item2.cfg.id;
                    }
                });
            }
        }
    }
}
