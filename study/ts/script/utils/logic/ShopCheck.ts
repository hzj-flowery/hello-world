import { LogicCheckHelper } from "../LogicCheckHelper";
import { UserDataHelper } from "../data/UserDataHelper";
import { G_UserData, G_Prompt } from "../../init";
import { Lang } from "../../lang/Lang";
import { TypeConvertHelper } from "../TypeConvertHelper";
import PopupBase from "../../ui/PopupBase";
import PopupSystemAlert from "../../ui/PopupSystemAlert";
import { ShopConst } from "../../const/ShopConst";
import { ExploreMapHelper } from "../../scene/view/exploreMap/ExploreMapHelper";

export namespace ShopCheck {
    export function shopFixBtnCheck(shopFixData) {
        var buyCount = shopFixData.getBuyCount();
        var shopFixCfg = shopFixData.getConfig();
        var vipTimes = shopFixData.getVipBuyTimes();
        var checkParams = {
            [1]: {
                funcName: 'shoplevelMin',
                param: shopFixCfg.level_min
            },
            [2]: {
                funcName: 'shoplevelMax',
                param: shopFixCfg.level_max
            },
            [3]: {
                funcName: 'shopEnoughLimit',
                param: [
                    shopFixCfg.limit_type,
                    shopFixCfg.limit_value
                ]
            },
            [4]: {
                funcName: 'shopNumBanType',
                param: [
                    shopFixCfg.num_ban_type,
                    buyCount,
                    vipTimes
                ]
            },
            [5]: {
                funcName: 'shopGoodsLack',
                param: [
                    shopFixCfg.type,
                    shopFixCfg.value
                ]
            }
        };
        var [success, errorMsg, funcName] = LogicCheckHelper.doCheckList(checkParams);
        return [
            success,
            errorMsg,
            funcName
        ];
    };

    export function shoplevelMinExt(levelMin) {
        var currLv = G_UserData.getBase().getLevel();
        if (currLv >= levelMin) {
            return true;
        }
        return [
            false,
            Lang.get('shop_condition_levelmin_ext', { level: levelMin })
        ];
    };

    export function shopEnoughLimitExt (limitType, limitValue):Array<any> {
        if (limitType == 0) {
            return [true,null];
        }
        if (limitType == ShopConst.LIMIT_TYPE_STAR) {
            var maxStar = G_UserData.getTowerData().getMax_star();
            if (maxStar >= limitValue) {
                return [true,null];
            }
            return [
                false,
                Lang.get('shop_condition_towner_star_ext', { num: limitValue })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_AREA) {
            var maxRank = G_UserData.getArenaData().getArenaMaxRank();
            if (maxRank <= limitValue) {
                return [true,null];
            }
            return [
                false,
                Lang.get('shop_condition_arena_rank_ext', { num: limitValue })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_GROUP_LEVEL) {
            var level = G_UserData.getGuild().getMyGuildLevel();
            if (level >= limitValue) {
                return [true,null];
            }
            return [
                false,
                Lang.get('shop_condition_group_level_ext', { num: limitValue })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_HARD_ELITE) {
            var exploreNum = G_UserData.getChapter().getElitePassCount();
            if (exploreNum >= limitValue) {
                return [true,null];
            }
            return [
                false,
                Lang.get('shop_condition_elite_star', { num: limitValue })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_EXPLORE) {
            var exploreNum = G_UserData.getExplore().getExplorePassCount();
            if (exploreNum >= limitValue) {
                return [true,null];
            }
            var name = ExploreMapHelper.getExploreNameById(limitValue);
            return [
                false,
                Lang.get('shop_condition_explore_ext', { name: name })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_TREE) {
            var treeLevel = G_UserData.getHomeland().getMainTreeLevel();
            if (treeLevel >= limitValue) {
                return [true,null];
            }
            return [
                false,
                Lang.get('shop_condition_tree_level_ext', { num: Lang.get('homeland_main_tree_level' + limitValue) })
            ];
        }
    };


    export function shopFixBtnCheckExt (shopFixData) {
        var buyCount = shopFixData.getBuyCount();
        var shopFixCfg = shopFixData.getConfig();
        var vipTimes = shopFixData.getVipBuyTimes();
        var checkParams = {
            [1]: {
                funcName: 'shoplevelMinExt',
                param: shopFixCfg.level_min
            },
            [2]: {
                funcName: 'shoplevelMax',
                param: shopFixCfg.level_max
            },
            [3]: {
                funcName: 'shopEnoughLimitExt',
                param: [
                    shopFixCfg.limit_type,
                    shopFixCfg.limit_value
                ]
            },
            [4]: {
                funcName: 'shopNumBanType',
                param: [
                    shopFixCfg.num_ban_type,
                    buyCount,
                    vipTimes
                ]
            },
            [5]: {
                funcName: 'shopGoodsLack',
                param: [
                    shopFixCfg.type,
                    shopFixCfg.value
                ]
            }
        };
        var [success, errorMsgs, funcNames] = LogicCheckHelper.doCheckListExt(checkParams,null);
        return [
            success,
            errorMsgs,
            funcNames
        ];
    };
    export function shopFixBuyCheck(shopFixData, buyTimes, showErrorDlg, calculatedPrice1, calculatedPrice2): any[] {
        if (shopFixData == null) {
            return [false, null, null];
        }
        buyTimes = buyTimes || 1;
        if (showErrorDlg == null) {
            showErrorDlg = true;
        }
        var buyCount = shopFixData.getBuyCount();
        var shopFixCfg = shopFixData.getConfig();
        var vipTimes = shopFixData.getVipBuyTimes();
        var itemPrice1 = UserDataHelper.getTotalPriceByAdd(shopFixCfg.price1_add, buyCount, buyTimes, shopFixCfg.price1_size);
        var itemPrice2 = UserDataHelper.getTotalPriceByAdd(shopFixCfg.price2_add, buyCount, buyTimes, shopFixCfg.price2_size);
        if (calculatedPrice1) {
            itemPrice1 = calculatedPrice1;
        }
        if (calculatedPrice2) {
            itemPrice2 = calculatedPrice2;
        }
        var checkParams = {
            [1]: {
                funcName: 'enoughValue',
                param: [
                    shopFixCfg.price1_type,
                    shopFixCfg.price1_value,
                    itemPrice1,
                    showErrorDlg
                ]
            },
            [2]: {
                funcName: 'enoughValue',
                param: [
                    shopFixCfg.price2_type,
                    shopFixCfg.price2_value,
                    itemPrice2,
                    showErrorDlg
                ]
            }
        };
        var [success, errorMsg, funcName] = LogicCheckHelper.doCheckList(checkParams);
        return [
            success,
            errorMsg,
            funcName
        ];
    };
    export function shopRandomBtnCheck(shopRandomData) {
        var buyCount = shopRandomData.getBuyCount();
        var shopRandomCfg = shopRandomData.getConfig();
        if (buyCount > 0) {
            return false;
        }
        return true;
    };
    export function shopRandomBuyCheck(shopRandomData) {
        var buyCount = shopRandomData.getBuyCount();
        var shopRandomCfg = shopRandomData.getConfig();
        if (buyCount > 0) {
            return [false];
        }
        var checkParams = {
            [1]: {
                funcName: 'enoughValue',
                param: [
                    shopRandomCfg.type1,
                    shopRandomCfg.value1,
                    shopRandomCfg.size1
                ]
            },
            [2]: {
                funcName: 'enoughValue',
                param: [
                    shopRandomCfg.type2,
                    shopRandomCfg.value2,
                    shopRandomCfg.size2
                ]
            }
        };
        let [success, errorMsg, funcName] = LogicCheckHelper.doCheckList(checkParams);
        return [
            success,
            errorMsg,
            funcName
        ];
    };
    export function shoplevelShow(levelShow) {
        var currLv = G_UserData.getBase().getLevel();
        if (currLv >= levelShow) {
            return true;
        }
        return [
            false,
            Lang.get('shop_condition_levelShow', { level: levelShow })
        ];
    };
    export function shoplevelMin(levelMin) {
        var currLv = G_UserData.getBase().getLevel();
        if (currLv >= levelMin) {
            return true;
        }
        return [
            false,
            Lang.get('shop_condition_levelmin', { level: levelMin })
        ];
    };
    export function shoplevelMax(levelMax) {
        var currLv = G_UserData.getBase().getLevel();
        if (currLv <= levelMax) {
            return true;
        }
        return [
            false,
            Lang.get('shop_condition_levelmax')
        ];
    };

    //elitePassCount?, explorePassCount?  性能优化，外层如果有for循环的, 先在外层计算然后传进来
    export function shopEnoughLimit(limitType, limitValue, elitePassCount?, explorePassCount?) {
        if (limitType == 0) {
            return [true];
        }
        if (limitType == ShopConst.LIMIT_TYPE_STAR) {
            var maxStar = G_UserData.getTowerData().getMax_star();
            if (maxStar >= limitValue) {
                return [true];
            }
            return [
                false,
                Lang.get('shop_condition_towner_star', { num: limitValue })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_AREA) {
            var maxRank = G_UserData.getArenaData().getArenaMaxRank();
            if (maxRank <= limitValue) {
                return [true];
            }
            return [
                false,
                Lang.get('shop_condition_arena_rank', { num: limitValue })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_GROUP_LEVEL) {
            var level = G_UserData.getGuild().getMyGuildLevel();
            if (level >= limitValue) {
                return [true];
            }
            return [
                false,
                Lang.get('shop_condition_group_level', { num: limitValue })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_HARD_ELITE) {
            var exploreNum = elitePassCount || G_UserData.getChapter().getElitePassCount();
            if (exploreNum >= limitValue) {
                return [true];
            }
            return [
                false,
                Lang.get('shop_condition_elite_star', { num: limitValue })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_EXPLORE) {
             exploreNum = explorePassCount || G_UserData.getExplore().getExplorePassCount();
            if (exploreNum >= limitValue) {
                return true;
            }
            var name = ExploreMapHelper.getExploreNameById(limitValue);
            return [
                false,
                Lang.get('shop_condition_explore', { name: name })
            ];
        }
        if (limitType == ShopConst.LIMIT_TYPE_TREE) {
            var treeLevel = G_UserData.getHomeland().getMainTreeLevel();
            if (treeLevel >= limitValue) {
                return true;
            }
            return [
                false,
                Lang.get('shop_condition_tree_level', { num: Lang.get('homeland_main_tree_level' + limitValue) })
            ];
        }

        return [false];
    };

    export function shopNumBanType(banType, buyCount, vipTimes) {
        if (banType == 1) {
            if (buyCount >= 1) {
                return [
                    false,
                    Lang.get('shop_condition_buyonce')
                ];
            }
        }
        if (banType == 2 || banType == 3 || banType == 4 || banType == 5) {
            if (buyCount >= vipTimes) {
                return [
                    false,
                    Lang.get('shop_condition_buymax')
                ];
            }
            return true;
        }
        return true;
    };
    export function shopGoodsLack(type, value) {
        if (type == TypeConvertHelper.TYPE_AVATAR) {
            var isHave = G_UserData.getAvatar().isHaveWithBaseId(value);
            var isLack = !isHave;
            return [
                isLack,
                Lang.get('shop_condition_buyonce')
            ];
        }
        return true;
    };
    export function shopHeroInBattle(shopId, callback, refreshType) {
        var shopDataList = {};
        var shopInfo = G_UserData.getShops().getRandomShopInfo(shopId);
        function callBackFunction() {
            if (callback && typeof callback == 'function') {
                callback(refreshType);
            }
        }
        for (let i in shopInfo.goodList) {
            var value = shopInfo.goodList[i];
            var [popupDlg, compType] = UserDataHelper.isCompleteOrFragmentInBattle(value);
            if (popupDlg && value.getBuyCount() == 0) {
                if (compType == 1) {
                    if (UserDataHelper.getPopModuleShow('shopHeroInBattle') == true) {
                        callBackFunction();
                        return true;
                    }
                    var buyHeroAlert = Lang.get('shop_buy_hero_alert');
                    PopupBase.loadCommonPrefab('PopupSystemAlert', (popup: PopupSystemAlert) => {
                        popup.setup(Lang.get('common_title_notice'), buyHeroAlert, callBackFunction);
                        popup.openWithAction();
                        popup.setModuleName('shopHeroInBattle');
                    });
                }
                if (compType == 4) {
                    if (UserDataHelper.getPopModuleShow('shopInstrumentInBattle') == true) {
                        callBackFunction();
                        return true;
                    }
                    var buyInstrumentAlert = Lang.get('shop_buy_instrument_alert');
                    PopupBase.loadCommonPrefab('PopupSystemAlert', (popup: PopupSystemAlert) => {
                        popup.setup(Lang.get('common_title_notice'), buyInstrumentAlert, callBackFunction);
                        popup.openWithAction();
                        popup.setModuleName('shopInstrumentInBattle');
                    });
                }
                return true;
            }
        }
        return false;
    };
    export function shopIsFreeRefresh(shopId, callback) {
        var shopData = G_UserData.getShops().getRandomShopInfo(shopId);
        if (shopData.freeCnt > 0) {
            if (ShopCheck.shopHeroInBattle(shopId, callback, ShopConst.REFRESH_TYPE_FREE) == false) {
                if (callback && typeof callback == 'function') {
                    callback(ShopConst.REFRESH_TYPE_FREE);
                }
            }
            return true;
        }
        return false;
    };
    export function shopHasRefreshToken(shopId, callback) {
        var shopData = G_UserData.getShops().getRandomShopInfo(shopId);
        var tokenNum = UserDataHelper.getShopRefreshToken();
        if (shopData.cfg.is_cost == 1) {
            if (tokenNum > 0) {
                if (ShopCheck.shopHeroInBattle(shopId, callback, ShopConst.REFRESH_TYPE_TOKEN) == false) {
                    if (callback && typeof callback == 'function') {
                        callback(ShopConst.REFRESH_TYPE_TOKEN);
                    }
                }
                return true;
            }
        }
        return false;
    };
    export function shopHasRefreshCost(shopId, callback) {
        var shopData = G_UserData.getShops().getRandomShopInfo(shopId);
        var [success] = LogicCheckHelper.doCheck('enoughValue', {
            param: [
                shopData.costType,
                shopData.costValue,
                shopData.costSize
            ]
        });
        if (success == true) {
            if (ShopCheck.shopHeroInBattle(shopId, callback, ShopConst.REFRESH_TYPE_RES) == false) {
                if (callback && typeof callback == 'function') {
                    callback(ShopConst.REFRESH_TYPE_RES);
                }
                return true;
            }
        }
        return false;
    };
    export function shopRefreshBtnCheck(shopId, callback) {
        if (ShopCheck.shopIsFreeRefresh(shopId, callback) == true) {
            return true;
        }
        var shopData = G_UserData.getShops().getRandomShopInfo(shopId);
        if (shopData.surplusTimes <= 0) {
            G_Prompt.showTip('剩余次数不足');
            return false;
        }
        if (ShopCheck.shopHasRefreshToken(shopId, callback) == true) {
            return true;
        }
        if (ShopCheck.shopHasRefreshCost(shopId, callback) == true) {
            return true;
        }
        return false;
    };
    export function shopCheckShopBuyRes(itemType, itemValue, onlyShowTips) {
        var shopItemData = G_UserData.getShops().getFixShopGoodsByResId(ShopConst.NORMAL_SHOP, itemType, itemValue);
        if (shopItemData == null) {
            G_Prompt.showTip(Lang.get('common_popup_shop_buy_not_open'));
            return false;
        } else if (shopItemData == false) {
            G_Prompt.showTip(Lang.get('common_popup_shop_buy_not_item'));
            return false;
        }
        var [success01, errorMsg, funcName] = ShopCheck.shopFixBtnCheck(shopItemData);
        if (success01 == false) {
            var cfg = shopItemData.getConfig();
            if (funcName == 'shopNumBanType' && shopItemData.isCanAddTimesByVip()) {
                var timesOut = LogicCheckHelper.vipTimesOutCheck(cfg.num_ban_value, shopItemData.getBuyCount(), Lang.get('shop_condition_buymax'), onlyShowTips);
            } else if (errorMsg) {
                G_Prompt.showTip(errorMsg);
            }
            return false;
        }
        return true;
    };
}
