import { G_ConfigLoader, G_UserData } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { UserDataHelper } from "./UserDataHelper";
import { ShopConst } from "../../const/ShopConst";

export namespace ShopActiveDataHelper {
    export function getShopActiveConfig(id) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.SHOP_ACTIVE).get(id);
        console.assert(info, 'shop_active config can not find id = %d');
        return info;
    };
    export function getCostInfo(id) {
        let result = [];
        let info = ShopActiveDataHelper.getShopActiveConfig(id);
        for (let i = 1; i <= 2; i++) {
            let type = info['and_price' + (i + '_type')];
            let value = info['and_price' + (i + '_value')];
            let size = info['and_price' + (i + '_size')];
            if (type > 0 && value > 0 && size > 0) {
                let data = {
                    type: type,
                    value: value,
                    size: size,
                    priceType: ShopConst.PRICE_TYPE_AND
                };
                result.push(data);
            }
        }
        for (let i = 1; i <= 2; i++) {
            let type = info['or_price' + (i + '_type')];
            let value = info['or_price' + (i + '_value')];
            let size = info['or_price' + (i + '_size')];
            if (type > 0 && value > 0 && size > 0) {
                let data = {
                    type: type,
                    value: value,
                    size: size,
                    priceType: ShopConst.PRICE_TYPE_OR
                };
                result.push(data);
            }
        }
        return result;
    };
    export function checkCostEnough(data: any[]) {
        //TODO:
        // let formula = '';
        // for (let i = 0; i < data.length; i++) {
        //     let unit = data[i];
        //     let type = unit.type;
        //     let value = unit.value;
        //     if (i == 1) {
        //         formula = formula + value;
        //     } else {
        //         if (type == ShopConst.PRICE_TYPE_AND) {
        //             formula = formula + (' and ' + value);
        //         } else if (type == ShopConst.PRICE_TYPE_OR) {
        //             formula = formula + (' or ' + value);
        //         }
        //     }
        // }
        // let func = loadstring('return ' + formula);
        // let result = func();
        // return result;
    };
    export function getShopSubTab(shopId) {
        let shopMgr = G_UserData.getShops();
        let shopData = shopMgr.getShopCfgById(shopId);
        let shoptabList = [];
        if (shopData == null) {
            return [];
        }
        for (let i = 1; i <= 6; i++) {
            let tabName = shopData['tab_name' + i];
            if (tabName && tabName != '') {
                shoptabList.push(tabName);
            }
        }
        return shoptabList;
    };
    export function getMaxLimit(goodId) {
        let maxNum = 9999;
        let costInfo = ShopActiveDataHelper.getCostInfo(goodId);
        for (let i in costInfo) {
            let info = costInfo[i];
            let myCount = UserDataHelper.getNumByTypeAndValue(info.type, info.value);
            let limit = Math.floor(myCount / info.size);
            if (maxNum > limit) {
                maxNum = limit;
            }
        }
        let data = G_UserData.getShopActive().getUnitDataWithId(goodId);
        let restCount = data.getRestCount();
        if (restCount && maxNum > restCount) {
            maxNum = restCount;
        }
        return maxNum;
    };
};