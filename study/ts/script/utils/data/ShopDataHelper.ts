import { G_UserData, G_ServerTime, G_ConfigLoader, G_ConfigManager } from "../../init";
import { Lang } from "../../lang/Lang";
import { UserDataHelper } from "./UserDataHelper";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { ArraySort } from "../handler";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { DataConst } from "../../const/DataConst";
import { ShopConst } from "../../const/ShopConst";
import { HomelandConst } from "../../const/HomelandConst";
import { HomelandHelp } from "../../scene/view/homeland/HomelandHelp";

export namespace ShopDataHelper {
    export function getShopBuyTimesDesc  (shopId, shopItemId) {
        let shopMgr = G_UserData.getShops();
        let shopItem = shopMgr.getShopGoodsById(shopId, shopItemId);
        let banType = shopItem.getConfig().num_ban_type;
        if (banType == 2 || banType == 3) {
            let vipTimes = shopItem.getVipBuyTimes();
            let buyCount = shopItem.getBuyCount();
            let strBuyTimes = Lang.get('shop_condition_today_buynum', { num: vipTimes - buyCount });
            return strBuyTimes;
        } else if (banType == 4) {
            let vipTimes = shopItem.getVipBuyTimes();
            let buyCount = shopItem.getBuyCount();
            let strBuyTimes = Lang.get('shop_condition_week_buynum', { num: vipTimes - buyCount });
            return strBuyTimes;
        } else if (banType == 5) {
            let vipTimes = 0;
            let buyCount = 0;
            let paramCfg = shopItem.getConfig();
            if (paramCfg != null) {
                let vipTimes = shopItem.getVipBuyTimes();
                let buyCount = shopItem.getBuyCount();
                let strBuyTimes = '';
                if (shopId == ShopConst.ALL_SERVER_GOLDHERO_SHOP) {
                    strBuyTimes = Lang.get('shop_condition_acticity_buynum', { num: vipTimes - buyCount });
                } else {
                    strBuyTimes = Lang.get('shop_condition_season_buynum', { num: vipTimes - buyCount });
                }
                return strBuyTimes;
            }
            return ' ';
        } else {
            return ' ';
        }
    };
    export function getShopItemCanBuyTimes(shopItem) {
        var vipTimes = shopItem.getVipBuyTimes();
        var buyCount = shopItem.getBuyCount();
        var times = vipTimes - buyCount;
        return times;
    };
    export function getFixShopDiscount  (shopItem) {
        let shopCfg = shopItem.getConfig();
        let buyCount = shopItem.getBuyCount();
        let preSize1 = shopCfg.price1_size_pre;
        let preSize2 = shopCfg.price2_size_pre;
        let priceSize1 = 1;
        if(shopCfg.price1_size != undefined){
            priceSize1 = shopCfg.price1_size;
        }
        let priceSize = getTotalPriceByAdd(shopCfg.price1_add, buyCount, 1, priceSize1);
        priceSize = ShopDataHelper._getPriceWithHomelandBuff(priceSize, shopItem);
        if (preSize1 > 0 && priceSize > 0) {
            let discount1 = Math.floor(priceSize / preSize1 * 10 + 0.5);
            return discount1;
        }
        return 1;
    };

    export function _getPriceWithHomelandBuff(priceSize, shopItem) {
        var result = priceSize;
        var itemInfo = shopItem.getConfig();
        var itemType = itemInfo.type;
        var itemValue = itemInfo.value;
        var buffBaseId = HomelandConst.getBuffBaseId(itemType, itemValue);
        if (buffBaseId) {
            var [isCanUse,buffData] = HomelandHelp.checkBuffIsCanUse(buffBaseId);
            if (isCanUse) {
                var info = buffData.getConfig();
                var ratio = HomelandHelp.getRealValueOfBuff(info);
                var disPrice = priceSize * (1 - ratio);
                result = disPrice;
            } else {
                result = priceSize;
            }
        } else {
            result = priceSize;
        }
        return result;
    };
    export function getTotalPriceByAdd  (priceAddId, startTimes, buyTimes, srcPrice) {
        if(buyTimes == null){
            buyTimes = 1;
        }
        if (priceAddId > 0) {
            let totalPrice = 0;
            for (let i = 1; i <= buyTimes; i++) {
                let now = i + startTimes;
                totalPrice = totalPrice + getPriceAdd(priceAddId, now);
            }
            return totalPrice;
        } else {
            srcPrice = srcPrice || 0;
            return srcPrice * buyTimes;
        }
        return 0;
    };
    export function getTotalNumByAdd  (priceAddId, startTimes, surplus, totalPrice, srcPrice) {
        if (priceAddId > 0) {
            let currentPrice = 0;
            let currTimes = 0;
            for (let i = 1; i <= surplus; i += 1) {
                let addPrice = getPriceAdd(priceAddId, startTimes + i);
                if (addPrice > 0) {
                    if (currentPrice + addPrice <= totalPrice) {
                        currentPrice = currentPrice + addPrice;
                        currTimes = i;
                    }
                } else {
                    break;
                }
            }
            return currTimes;
        } else {
            return Math.floor(totalPrice / srcPrice);
        }
        return 0;
    };
    export function getFixItemMaxNum  (shopItemData) {
        let surplus = shopItemData.getSurplusTimes();
        let buyTimes = shopItemData.getBuyCount();
        let shopCfg = shopItemData.getConfig();
        let maxNum = 999;
        for (let i = 1; i <= 2; i++) {
            let size = shopCfg['price' + (i + '_size')];
            let type = shopCfg['price' + (i + '_type')];
            let value = shopCfg['price' + (i + '_value')];
            let addId = shopCfg['price' + (i + '_add')];
            if (type > 0) {
                let totolMoney = UserDataHelper.getNumByTypeAndValue(type, value);
                console.warn('  ^^^^^ ' + String(totolMoney));
                let currNum = getTotalNumByAdd(addId, buyTimes, surplus, totolMoney, size);
                console.warn('  ^^^^^ end  ' + currNum);
                if (maxNum > currNum) {
                    maxNum = currNum;
                }
            }
        }
        if (surplus > 0 && maxNum > surplus) {
            maxNum = surplus;
        }
        return maxNum;
    };
    export function getPriceAdd  (priceAddId, buyTimes) {
        let priceConfig = G_UserData.getPriceConfig(priceAddId);
        let priceList = priceConfig.priceList;
        let priceMap = priceConfig.priceMap;
        let maxTime = priceConfig.maxTime;
        let lastCfgData = priceList[priceList.length-1];
        if (buyTimes >= maxTime) {
            return lastCfgData && lastCfgData.price || 0;
        }
        priceConfig = priceMap[buyTimes];
        return priceConfig && priceConfig.price || 0;
    };
    export function getShopType  (shopId) {
        let ShopInfo = G_ConfigLoader.getConfig(ConfigNameConst.SHOP);
        let shopData = ShopInfo.get(shopId);
        return shopData.shop_type;
    };
    export function getShopTab  (entranceType?) {
        if (!entranceType) {
            entranceType = ShopConst.DEFAULT_SHOP_ENTRANCE;
        }
        let shopMgr = G_UserData.getShops();
        let shopList = shopMgr.getShopCfgList();
        let shoptabList = [];
        for (let i in shopList) {
            let value = shopList[i];
            if (LogicCheckHelper.funcIsOpened(value.function_id)[0]) {
                if (value.default_create != 0 && value.shop_entrance == entranceType) {
                    shoptabList.push(value);
                }
            }
        }
        ArraySort(shoptabList, function (item1, item2) {
            if (item1.order != item2.order) {
                return item1.order < item2.order;
            }
        });
        return shoptabList;
    };
    export function getShopIdByTab  (tabIndex) {
        let shopTabList = getShopTab();
        let shopData = shopTabList[tabIndex];
        return shopData.shop_id;
    };
    export function getShopSubTab  (shopId) {
        let shopMgr = G_UserData.getShops();
        let shopData = shopMgr.getShopCfgById(shopId);
        let shoptabList = [];
        let shopTabIndex = [];
        if (shopData == null) {
            return [
                {},
                {}
            ];
        }
        for (let i = 1; i <= 6; i++) {
            let tabName = shopData['tab_name' + i];
            let shopList = shopMgr.getShopGoodsList(shopId, i);
            if (tabName && tabName != '' && shopList.length > 0) {
                if (!G_ConfigManager.checkCanRecharge() && tabName == '商  品') continue;
                shoptabList.push(tabName);
                shopTabIndex.push({
                    name: tabName,
                    subId: i,
                    index: shoptabList.length
                });
            }
        }
        return [
            shoptabList,
            shopTabIndex
        ];
    };
    export function getRandomShopInfo  (shopId) {
        let shopMgr = G_UserData.getShops();
        let shopData = shopMgr.getRandomShopInfo(shopId);
        return shopData;
    };
    export function isFragmentInBattle  (shopItem) {
        let cfgData = shopItem.getConfig();
        if (cfgData.item_type == TypeConvertHelper.TYPE_FRAGMENT) {
            let fragment = TypeConvertHelper.convert(cfgData.item_type, cfgData.item_id);
            if (fragment) {
                if (fragment.cfg.comp_type == 1) {
                    return [
                        G_UserData.getTeam().isInBattleWithBaseId(fragment.cfg.comp_value),
                        1
                    ];
                }
                if (fragment.cfg.comp_type == 4) {
                    return [
                        UserDataHelper.isInBattleHeroWithBaseId(fragment.cfg.comp_value),
                        4
                    ];
                }
            }
        }
        return [false];
    };
    export function isCompleteOrFragmentInBattle(shopItem) {
        var cfgData = shopItem.getConfig();
        var itemInfo = TypeConvertHelper.convert(cfgData.item_type, cfgData.item_id);
        if (cfgData.item_type == TypeConvertHelper.TYPE_FRAGMENT) {
            if (itemInfo) {
                if (itemInfo.cfg.comp_type == 1) {
                    return [
                        G_UserData.getTeam().isInBattleWithBaseId(itemInfo.cfg.comp_value),
                        1
                    ];
                }
                if (itemInfo.cfg.comp_type == 4) {
                    return [
                        UserDataHelper.isInBattleHeroWithBaseId(itemInfo.cfg.comp_value),
                        4
                    ];
                }
            }
        } else if (cfgData.item_type == TypeConvertHelper.TYPE_HERO) {
            if (itemInfo) {
                return [
                    G_UserData.getTeam().isInBattleWithBaseId(itemInfo.cfg.id),
                    1
                ];
            }
        } else if (cfgData.item_type == TypeConvertHelper.TYPE_INSTRUMENT) {
            if (itemInfo) {
                return [
                    UserDataHelper.isInBattleHeroWithBaseId(itemInfo.cfg.id),
                    4
                ];
            }
        }
        return [false];
    };
    export function isHeroInBattle(shopItem) {
        var cfgData = shopItem.getConfig();
        if (cfgData.item_type == TypeConvertHelper.TYPE_HERO) {
            var hero = TypeConvertHelper.convert(cfgData.item_type, cfgData.item_id);
            if (hero) {
                return [
                    G_UserData.getTeam().isInBattleWithBaseId(hero.cfg.id),
                    1
                ];
            }
        }
        return [false];
    };

    export function getShopHeroInBattle  (shopId) {
        let shopDataList = [];
        let shopInfo = G_UserData.getShops().getRandomShopInfo(shopId);
        for (let i in shopInfo.goodList) {
            let value = shopInfo.goodList[i];
            if (isFragmentInBattle(value) && value.getBuyCount() == 0) {
                shopDataList.push(value);
            }
        }
        return shopDataList;
    };
    export function getShopRefreshToken  () {
        let token = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_REFRESH_TOKEN);
        return token;
    };
    export function getShopLeaveRefreshSec  (shopId) {
        let shopInfo = UserDataHelper.getRandomShopInfo(shopId);
        let sec = -1;
        let refreshTime = shopInfo.cfg.free_times_time;
        let nowTime = G_ServerTime.getTime();
        let lastTime = shopInfo.freeCntTime;
        sec = refreshTime - (nowTime - lastTime);
        return [
            sec,
            refreshTime
        ];
    };
    export function getShopRecoverMaxRefreshCountTime  (shopId) {
        if (!G_UserData.getShops().isShopOpened(shopId)) {
            return [
                0,
                false,
                0
            ];
        }
        let playerLevel = G_UserData.getBase().getLevel();
        if (playerLevel <= 10) {
            return [
                0,
                false,
                0
            ];
        }
        let shopInfo = UserDataHelper.getRandomShopInfo(shopId);
        if (!shopInfo) {
            return [
                0,
                false,
                0
            ];
        }
        let refreshTime = shopInfo.cfg.free_times_time;
        let nowTime = G_ServerTime.getTime();
        let lastTime = shopInfo.freeCntTime;
        let num = shopInfo.freeCntTotal - shopInfo.freeCnt;
        let recoverTime = num * refreshTime + lastTime;
        return [
            recoverTime,
            recoverTime <= nowTime,
            refreshTime
        ];
    };

};