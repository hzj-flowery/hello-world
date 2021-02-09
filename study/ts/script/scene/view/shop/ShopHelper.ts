import { table } from "../../../utils/table";
import { G_UserData, G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { assert } from "../../../utils/GlobleFunc";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { ShopConst } from "../../../const/ShopConst";

export class ShopHelper {
    public static readonly SHOP_COMMODITY_TAB_INDEX = 2;
    static getItemWidgetByPos(listView, pos) {
        var itemList = listView.getItems();
        for (let i in itemList) {
            var item = itemList[i];
            var itemWidget = item.findItemByPos(pos);
            if (itemWidget) {
                return itemWidget;
            }
        }
        return null;
    }
    static getItemDataByPos(itemList, pos) {
        if (pos > 0 && pos <= itemList.length) {
            return itemList[pos];
        }
        return null;
    };
    static getRefreshSecList(shopInfo) {
        if (shopInfo == null) {
            //assert((null, 'shopInfo can\'t be nil');
        }
        var tList = [];
        var list = [];
        if (shopInfo.refresh_time1 != '0:00:00') {
            tList = shopInfo.refresh_time1.split(':');
            list[list.length + 1] = parseInt(tList[1]) * 3600 + parseInt(tList[2]) * 60 + parseInt(tList[3]);
        }
        if (shopInfo.refresh_time2 != '0:00:00') {
            tList = shopInfo.refresh_time2.split(':');
            list[list.length + 1] = parseInt(tList[1]) * 3600 + parseInt(tList[2]) * 60 + parseInt(tList[3]);
        }
        if (shopInfo.refresh_time3 != '0:00:00') {
            tList = shopInfo.refresh_time3.split(':');
            list[list.length + 1] = parseInt(tList[1]) * 3600 + parseInt(tList[2]) * 60 + parseInt(tList[3]);
        }
        if (shopInfo.refresh_time4 != '0:00:00') {
            tList = shopInfo.refresh_time4.split(':');
            list[list.length + 1] = parseInt(tList[1]) * 3600 + parseInt(tList[2]) * 60 + parseInt(tList[3]);
        }
        return list;
    };
    static getResListByShopCfg(shopCfg) {
        var resList = [];
        if (shopCfg.price1_type > 0 && shopCfg.price1_value > 0) {
            resList.push({
                type: shopCfg.price1_type,
                value: shopCfg.price1_value
            });
        }
        if (shopCfg.price2_type > 0 && shopCfg.price2_value > 0) {
            resList.push({
                type: shopCfg.price2_type,
                value: shopCfg.price2_value
            });
        }
        if (shopCfg.price3_type > 0 && shopCfg.price3_value > 0) {
            resList.push({
                type: shopCfg.price3_type,
                value: shopCfg.price3_value
            });
        }
        if (shopCfg.price4_type > 0 && shopCfg.price4_value > 0) {
            resList.push({
                type: shopCfg.price4_type,
                value: shopCfg.price4_value
            });
        }
        return resList;
    };
    static convertSubIdToIndex(shopId, subId) {
        var [shopList, shopTabIndex] = UserDataHelper.getShopSubTab(shopId);
        for (let i in shopTabIndex) {
            var value = shopTabIndex[i];
            if (value.subId == subId) {
                return value.index;
            }
        }
        return 1;
    };
    static convertSubIndexToSubId(shopId, subIndex) {

        var [shopList, shopTabIndex] = UserDataHelper.getShopSubTab(shopId);
        var tabName = shopList[subIndex];
        for (let i in shopTabIndex) {
            var value = shopTabIndex[i];
            if (value.name == tabName) {
                return value.subId;
            }
        }
        return 1;
    };
    static getShopIndexById(shopId) {

        var shopInfoList = UserDataHelper.getShopTab();
        for (let i in shopInfoList) {
            var shopInfo = shopInfoList[i];
            if (shopInfo.shop_id == shopId) {
                return i;
            }
        }
        return 1;
    };
    static getTabTypeByTab(shopId, tabIndex) {
        var shopIndex = ShopHelper.getShopIndexById(shopId) || 1;
        //var index = (tabIndex != undefined) | 0;
        var shopInfoList = UserDataHelper.getShopTab();
        var tab_types = shopInfoList[shopIndex].tab_type || '';
        var tabTypes = tab_types.split('|') || {};
        if (tabTypes.length > tabIndex) {
            return parseInt(tabTypes[tabIndex]) || ShopConst.TABL_TYPE_DEFAULT;
        }
        return ShopConst.TABL_TYPE_DEFAULT;
    };
    static isHaveNewRemindShop(subTabIndex?) {
        var shopMgr = G_UserData.getShops();
        var shopId = ShopConst.NORMAL_SHOP;
        if (subTabIndex == null) {
            for (var subTidx = 2; subTidx <= 3; subTidx++) {
                var itemList = shopMgr.getShopGoodsList(shopId, subTidx);
                for (var i in itemList) {
                    var shopItem = itemList[i];
                    if (shopItem.getConfig().new_remind == 1 && ShopHelper.isNeedNewRemind(shopItem.getGoodId(), subTidx)) {
                        return true;
                    }
                }
            }
            return false;
        }
        var itemList = shopMgr.getShopGoodsList(shopId, subTabIndex);
        for (i in itemList) {
            var shopItem = itemList[i];
            if (shopItem.getConfig().new_remind == 1 && ShopHelper.isNeedNewRemind(shopItem.getGoodId(), subTabIndex)) {
                return true;
            }
        }
        return false;
    };

    static isNeedNewRemind(id, subTabIndex?): boolean {
        var UserSettingData = G_UserData.getUserSetting();
        if (subTabIndex == null) {
            for (var i = 2; i <= 3; i++) {
                var data = UserSettingData.getSettingValue('shopnNewRemind' + (G_UserData.getBase().getId() + i)) || {};
                if (data && table.nums(data) > 0) {
                    for (var i = 1; i <= data.length; i++) {
                        if (data[i] == id) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        var data = UserSettingData.getSettingValue('shopnNewRemind' + (G_UserData.getBase().getId() + subTabIndex)) || {};
        if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (data[i] == id) {
                    return false;
                }
            }
        }
        return true;
    };

    static saveNewRemindShop(itemList, subTabIndex) {
        var UserSettingData = G_UserData.getUserSetting();
        var data = [];
        for (var k in itemList) {
            var shopItem = itemList[k];
            if (shopItem.getConfig().new_remind == 1) {
                data.push(shopItem.getGoodId());
            }
        }
        UserSettingData.setSettingValue('shopnNewRemind' + (G_UserData.getBase().getId() + subTabIndex), data);
        G_SignalManager.dispatch(SignalConst.EVENT_SHOP_NEW_REMIND_UPDATE);
    };
}
