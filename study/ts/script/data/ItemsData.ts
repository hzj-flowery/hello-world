import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { DataConst } from "../const/DataConst";
import { UserBaseData } from "./UserBaseData";
import { FunctionConst } from "../const/FunctionConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";


/*---------------------------------ItemBaseData------------------------------------------- */

interface ItemBaseData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getNum(): number
    setNum(value: number): void
    getLastNum(): number
    getType(): number
    setType(value: number): void
    getLastType(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
}
var schema = {};
schema['id'] = [
    'number',
    0
];
schema['num'] = [
    'number',
    0
];
schema['type'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];

class ItemBaseData extends BaseData {
    public static schema = schema;
    initData(data) {
        this.setId(data.id);
        this.setNum(data.num);
        this.setType(TypeConvertHelper.TYPE_ITEM);
        var info = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(data.id);
        console.assert(info, 'ItemInfo can\'t find id = ' + (data.id));
        this.setConfig(info);
    }
}
//-------------------------------end -----------------------------------/

export class ItemsData extends BaseData {
    private _itemList: any;
    private _s2cGetItemsData;
    private _s2cUseItemData;

    constructor() {
        super()
        this._itemList = {};
        this._s2cGetItemsData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetItem, this._s2cGetItem.bind(this));
        this._s2cUseItemData = G_NetworkManager.add(MessageIDConst.ID_S2C_UseItem, this._s2cUseItem.bind(this));
    }

    c2sUseItem(id, amount, target, idx, boxId?) {
        if (amount <= 0) {
            amount = 1;
        }
        var useItem = {
            id: id,
            amount: amount,
            target: target || 0,
            idx: idx || 0,
            box_id: boxId
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_UseItem, useItem);
    }

    _setItemData(propData) {
        this._itemList['k_' + (propData.id)] = null;
        if (G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(propData.id)) {
            var baseData = new ItemBaseData();
            baseData.initData(propData);
            this._itemList['k_' + (propData.id)] = baseData;
        }
    }

    _s2cGetItem(id, message) {
        this._itemList = {};
        var itemList = message.items || {};
        for (var i in itemList) {
            var value = itemList[i];
            this._setItemData(value);
        }
    }

    _s2cUseItem(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVNET_USE_ITEM_SUCCESS, message);
    }

    clear() {
        this._s2cGetItemsData.remove();
        this._s2cGetItemsData = null;
        this._s2cUseItemData.remove();
        this._s2cUseItemData = null;
    }

    reset() {
        this._itemList = {};
    }

    getItemByID(id) {
        if (this._itemList == null) {
            return null;
        }
        return this._itemList['k_' + (id)];
    }

    getItemNum(id) {
        if (this._itemList == null) {
            return 0;
        }
        var item = this.getItemByID(id);
        if (item) {
            return item.getNum();
        }
        return 0;
    }

    _packItemsInfoForPack() {
        var filter = function (info) {
            if (info.item_type == DataConst.ITEM_GOLD_KEY || info.item_type == DataConst.ITEM_GOLD_BOX) {
                return false;
            }
            return true;
        }
        var items = this._itemList;
        var list = [];
        for (var k in items) {
            var value = items[k];
            if (value && filter(value.getConfig())) {
                list.push(value);
            }
        }
        return list;
    }

    hasRedPointByItemID(itemId) {
        var itemData = this.getItemByID(itemId);
        if (!itemData) {
            return false;
        }
        var playerLevel = G_UserData.getBase().getLevel();
        if (playerLevel < itemData.getConfig().level_limit) {
            return false;
        }
        if (itemData.getConfig().if_add == 1) {
            return true;
        }
        if (itemData.getConfig().id == 21) {
            if (this.hasPairItemList([
                20,
                21
            ]) == true) {
                return true;
            }
        }
        if (itemData.getConfig().id == 154) {
            if (this.hasPairItemList([
                154,
                155,
                156
            ]) == true) {
                return true;
            }
        }
        return false;
    }

    hasPairItemList(itemList) {
        var hasMatchTable: any = {};
        hasMatchTable = {
            keyList: itemList,
            mathValue: {}
        };
        function mathItemId(matchId) {
            for (var i in hasMatchTable.keyList) {
                var value = hasMatchTable.keyList[i];
                if (value == matchId) {
                    hasMatchTable.mathValue[value] = true;
                }
            }
            var currSize = hasMatchTable.keyList.length;
            for (let i in hasMatchTable.mathValue) {
                var value = hasMatchTable.mathValue[i];
                currSize = currSize - 1;
            }
            if (currSize == 0) {
                return true;
            }
            return false;
        }
        var tempList = this._packItemsInfoForPack();
        for (var i in tempList) {
            var item = tempList[i];
            if (mathItemId(item.getConfig().id) == true) {
                return true;
            }
        }
        return false;
    }

    hasRedPoint(itemId?) {
        var tempList = this._packItemsInfoForPack();
        var playerLevel = G_UserData.getBase().getLevel();
        for (var i in tempList) {
            var item = tempList[i];
            if (item.getConfig().if_add == 1 && playerLevel >= item.getConfig().level_limit) {
                return true;
            }
        }
        var retValue1 = this.hasRedPointByItemID(21);
        var retValue2 = this.hasRedPointByItemID(154);
        return retValue1 || retValue2;
    }

    getItemsData() {
        var tempList: any[] = this._packItemsInfoForPack();
        tempList.sort((a, b) => {
            var qa = a.getConfig().color, qb = b.getConfig().color;
            var id_a = a.getConfig().item_sorting, id_b = b.getConfig().item_sorting;
            var itemId_a = a.getConfig().id, itemId_b = b.getConfig().id;
            if (id_a != id_b) {
                return id_a - id_b;
            }
            if (qa != qb) {
                return qb -qa;
            }
            return itemId_a - itemId_b;
        });
        return tempList;
    }

    getItemSellData() {
        var items = this._itemList;
        var list = [];
        for (var k in items) {
            var value = items[k];
            if (value) {
                var cfg = value.getConfig();
                if (cfg.recycle_value && cfg.recycle_value > 0) {
                    list.push(value);
                }
            }
        }
        list.sort(function (a, b) {
            var aConfig = a.getConfig();
            var bConfig = b.getConfig();
            if (aConfig.sell_order == bConfig.sell_order) {
                if (aConfig.color == bConfig.color) {
                    return a.getId() - b.getId();
                } else {
                    return aConfig.color - bConfig.color;
                }
            } else {
                return aConfig.sell_order - bConfig.sell_order;
            }
        });
        return list;
    }

    updateData(itemList) {
        if (itemList == null || typeof (itemList) != 'object') {
            return;
        }
        if (this._itemList == null) {
            return;
        }
        for (var i = 0; i < itemList.length; i++) {
            this._setItemData(itemList[i]);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ITEM_BAG);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_OFFICIAL);
    }

    insertData(itemList) {
        if (itemList == null || typeof (itemList) != 'object') {
            return;
        }
        if (this._itemList == null) {
            return;
        }
        for (var i = 0; i < itemList.length; i++) {
            this._setItemData(itemList[i]);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ITEM_BAG);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HERO_TRAIN_TYPE2, itemList);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, itemList);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, itemList);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, itemList);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_OFFICIAL);
    }

    deleteData(itemList) {
        if (itemList == null || typeof (itemList) != 'object') {
            return;
        }
        if (this._itemList == null) {
            return;
        }
        for (var i = 0; i < itemList.length; i++) {
            var id = itemList[i];
            this._itemList['k_' + (id)] = null;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ITEM_BAG);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_OFFICIAL);
    }
}
