import { BaseData } from "./BaseData";
import { ShopActiveUnitData } from "./ShopActiveUnitData";
import GemstoneConst from "../const/GemstoneConst";
import { G_ConfigLoader, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { ArraySort } from "../utils/handler";
import { ShopActiveDataHelper } from "../utils/data/ShopActiveDataHelper";
import ParameterIDConst from "../const/ParameterIDConst";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { ShopConst } from "../const/ShopConst";

export interface ShopActiveData {
}
let schema = {};
export class ShopActiveData extends BaseData {
    public static schema = schema;
    _goodIdsInShop;
    _shopList;
    constructor(properties?) {
        super(properties);
        this._goodIdsInShop = {};
        this._shopList = {};
        this._formatGoods();
    }
    public clear() {
    }
    public reset() {
        this._goodIdsInShop = {};
        this._shopList = {};
    }
    public _formatGoods() {
        let Config = G_ConfigLoader.getConfig(ConfigNameConst.SHOP_ACTIVE);
        let len = Config.length();
        for (let i = 0; i < len; i++) {
            let info = Config.indexOf(i);
            let shopId = info.shop_id;
            let tab = info.tab;
            if (this._goodIdsInShop[shopId] == null) {
                this._goodIdsInShop[shopId] = {};
            }
            if (this._goodIdsInShop[shopId][tab] == null) {
                this._goodIdsInShop[shopId][tab] = [];
            }
            this._goodIdsInShop[shopId][tab].push(info.id);
            let unitData = new ShopActiveUnitData();
            unitData.setConfig(info);
            this._shopList[info.id] = unitData;
        }
    }
    public _getGoodIdsWithShopId(shopId) {
        let goodIds = this._goodIdsInShop[shopId] || {};
        return goodIds;
    }
    public _getGoodIdsWithShopAndTabId(shopId, tabId) {
        let tempIds = this._getGoodIdsWithShopId(shopId);
        let goodIds = tempIds[tabId] || {};
        return goodIds;
    }
    public getGoodIdsWithShopAndTabIdBySort(shopId, tabId, curBatch) {
        let sortFunc = function (a, b) {
            if (a.boughtSort != b.boughtSort) {
                return a.boughtSort < b.boughtSort;
            } else if (a.order != b.order) {
                return a.order < b.order;
            } else if (a.newSort != b.newSort) {
                return a.newSort > b.newSort;
            } else {
                return a.id < b.id;
            }
        };
        function checkAndSetIsOwn(unitData) {
            unitData.isHave = false;
            if (unitData.getConfig().type == TypeConvertHelper.TYPE_AVATAR) {
                let isHave = G_UserData.getAvatar().isHaveWithBaseId(unitData.getConfig().value);
                unitData.isHave = isHave;
            }
        }
        let goodIds = this._getGoodIdsWithShopAndTabId(shopId, tabId);
        let temp = [];
        for (let i in goodIds) {
            let goodId = goodIds[i];
            let unitData = this.getUnitDataWithId(goodId);
            let batch = unitData.getConfig().batch;
            if (this._checkIsEnoughBatch(shopId, curBatch, batch)) {
                checkAndSetIsOwn(unitData);
                let isBought = unitData.isBought() || unitData.isHave;
                let one = {
                    id: unitData.getConfig().id,
                    boughtSort: isBought && 1 || 0,
                    newSort: unitData.isNew(curBatch) && 1 || 0,
                    order: unitData.getConfig().order
                };
                temp.push(one);
            }
        }
        ArraySort(temp, sortFunc);
        let result = [];
        for (let i in temp) {
            let one = temp[i];
            result.push(one.id);
        }
        return result;
    }
    public _getBatchFilterType(shopId) {
        let filterType = 0;
        if (shopId == ShopConst.LOOKSTAR_SHOP || shopId == ShopConst.HORSE_CONQUER_SHOP || shopId == ShopConst.CAKE_ACTIVE_SHOP) {
            filterType = 1;
        }
        return filterType;
    }
    public _checkIsEnoughBatch(shopId, curBatch, batch) {
        let filterType = this._getBatchFilterType(shopId);
        if (filterType == 1) {
            return curBatch == batch;
        } else {
            return curBatch >= batch;
        }
    }
    public updateShopList(datas) {
        for (let i in datas) {
            let data = datas[i];
            let unitData = this.getUnitDataWithId(data.goods_id);
            unitData.updateData(data);
        }
    }
    public getUnitDataWithId(id) {
        let unitData = this._shopList[id];
        console.assert(unitData, 'shop_active config can not find id = %d');
        return unitData;
    }
    public isShowEquipRedPoint() {
        let goodIds = this._getGoodIdsWithShopAndTabId(ShopConst.SUIT_SHOP, 1) || {};
        let goodId = goodIds[1];
        if (goodId) {
            let cost = ShopActiveDataHelper.getCostInfo(goodId)[1];
            if (cost) {
                let size = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.EQUIP_ACTIVE_RED).content);
                let isEnough = LogicCheckHelper.enoughValue(cost.type, cost.value, size, false);
                if (isEnough) {
                    return true;
                }
            }
        }
        return false;
    }
    public isShowPetRedPoint() {
        let goodIds = this._getGoodIdsWithShopAndTabId(ShopConst.LOOKSTAR_SHOP, 1) || {};
        let goodId = goodIds[0];
        if (goodId) {
            let cost = ShopActiveDataHelper.getCostInfo(goodId)[0];
            if (cost) {
                let size = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.STAR_ACTIVE_RED).content);
                let isEnough = LogicCheckHelper.enoughValue(cost.type, cost.value, size, false);
                if (isEnough) {
                    return true;
                }
            }
        }
        return false;
    }
    public isShowHorseConquerRedPoint() {
        let goodIds = this._getGoodIdsWithShopAndTabId(ShopConst.HORSE_CONQUER_SHOP, 1) || {};
        let goodId = goodIds[0];
        if (goodId) {
            let cost = ShopActiveDataHelper.getCostInfo(goodId)[0];
            if (cost) {
                let size = Number(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.HORSE_CONQUER_ACTIVE_RED).content);
                let isEnough = LogicCheckHelper.enoughValue(cost.type, cost.value, size, false);
                if (isEnough) {
                    return true;
                }
            }
        }
        return false;
    }
}
