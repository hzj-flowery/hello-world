import { PackageViewConst } from "../../../const/PackageViewConst";

import { Lang } from "../../../lang/Lang";

import { G_UserData, G_Prompt } from "../../../init";


import { FunctionConst } from "../../../const/FunctionConst"
import { UserBaseData } from "../../../data/UserBaseData";
import { DataConst } from "../../../const/DataConst";
import { stringUtil } from "../../../utils/StringUtil";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { SilkbagData } from "../../../data/SilkbagData";
import { UserCheck } from "../../../utils/logic/UserCheck";
import PopupItemUse from "../../../ui/PopupItemUse";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import PopupSelectReward from "../../../ui/PopupSelectReward";
import PopupSelectRewardTab from "../../../ui/PopupSelectRewardTab";
import PopupSelectRewardTabNum from "../../../ui/PopupSelectRewardTabNum";
import { ObjKeyLength } from "../../../utils/GlobleFunc";
import PopupSelectRewardNum from "../../../ui/PopupSelectRewardNum";
import { ShopConst } from "../../../const/ShopConst";


export var PackageHelper: any = {};


PackageHelper.getTabGroup2TextList = function (index) {
    if (index == PackageViewConst.TAB_ITEM) {
        return [Lang.get('package_tab_btn1')];
    } else if (index == PackageViewConst.TAB_SILKBAG) {
        return [Lang.get('package_tab_btn5')];
    } else {
        return [Lang.get('package_tab_btn2')];
    }
};

PackageHelper.getHistoryHeroSubTab = function (isWeapon) {
    var isHistoryHeroOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)[0];
    var isHistoryHeroWeaponOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)[0];
    var isHistoryHeroFragmentOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HEROPIECE_LIST)[0];
    var tabList = [];
    var tabIndex = [];
    if (!isWeapon) {
        if (isHistoryHeroOpen) {
            var tabName = Lang.get('package_tab_btn10_1');
            tabList.push(tabName);
            tabIndex.push({
                name: tabName,
                subId: tabList.length,
                index: tabList.length
            });
        }
        if (isHistoryHeroFragmentOpen) {
            var tabName = Lang.get('package_tab_btn10_2');
            tabList.push(tabName);
            tabIndex.push({
                name: tabName,
                subId: tabList.length,
                index: tabList.length
            });
        }
    } else {
        if (isHistoryHeroWeaponOpen) {
            var tabName = Lang.get('package_tab_btn11_1');
            tabList.push(tabName);
            tabIndex.push({
                name: tabName,
                subId: tabList.length,
                index: tabList.length
            });
        }
        if (isHistoryHeroFragmentOpen) {
            var tabName = Lang.get('package_tab_btn11_2');
            tabList.push(tabName);
            tabIndex.push({
                name: tabName,
                subId: tabList.length,
                index: tabList.length
            });
        }
    }
    return [
        tabList,
        tabIndex
    ];
};

PackageHelper.getPackageTabList = function () {
    var isSilkbagOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SILKBAG)[0];
    var isHaveSilkbag = G_UserData.getSilkbag().isHaveSilkbag();
    var isWakenOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)[0];
    var isJadeOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0];
    var isBagMerge = UserDataHelper.isEnoughBagMergeLevel()[0];
    var textList = [Lang.get('package_tab_btn1')];
    var tabFuncList = [PackageViewConst.TAB_ITEM];

    //debug
    //强制隐藏这两个功能
    //该功能还没做 等以后做了再打开
    var isHistoryHeroOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)[0];
    var isHistoryHeroWeaponOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)[0];

    if (isSilkbagOpen || isHaveSilkbag) {
        textList.push(Lang.get('package_tab_btn5'))
        tabFuncList.push(PackageViewConst.TAB_SILKBAG)
    }
    if (isJadeOpen) {
        textList.push(Lang.get('package_tab_btn9'))
        tabFuncList.push(PackageViewConst.TAB_JADESTONE)
    }
    if (isBagMerge) {
        textList.push(Lang.get('package_tab_btn6'))
        tabFuncList.push(PackageViewConst.TAB_EQUIPMENT)
        textList.push(Lang.get('package_tab_btn7'))
        tabFuncList.push(PackageViewConst.TAB_TREASURE)
        textList.push(Lang.get('package_tab_btn8'))
        tabFuncList.push(PackageViewConst.TAB_INSTRUMENT)
    }
    if (isWakenOpen) {
        textList.push(Lang.get('package_tab_btn2'))
        tabFuncList.push(PackageViewConst.TAB_GEMSTONE)
    }
    if (isHistoryHeroOpen) {
        textList.push(Lang.get('package_tab_btn10'));
        tabFuncList.push(PackageViewConst.TAB_HISTORYHERO);
    }
    if (isHistoryHeroWeaponOpen) {
        textList.push(Lang.get('package_tab_btn11'));
        tabFuncList.push(PackageViewConst.TAB_HISTORYHERO_WEAPON);
    }
    return [
        textList,
        tabFuncList
    ];
};
PackageHelper.getPackageAwarkTabIndx = function () {
    var tabList = PackageHelper.getPackageTabList()[0];
    for (var i in tabList) {
        var value = tabList[i];
        if (value == Lang.get('package_tab_btn2')) {
            return i;
        }
    }
    return 1;
};
PackageHelper.getPackTabIndex = function (tabId) {
    var funcList = PackageHelper.getPackageTabList()[1];
    for (var i in funcList) {
        var value = funcList[i];
        if (value == tabId) {
            return i;
        }
    }
    return null;
};
PackageHelper.popupUseItem = function (itemId, oneItemAlsoShow) {
    var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
    var itemConfig = itemParam.cfg;
    var data = UserCheck.isPackFull(TypeConvertHelper.TYPE_ITEM, itemId);
    var isFull = data[0], leftCount = data[1];
    if (isFull == true) {
        return;
    }
    if (G_UserData.getBase().getLevel() < itemConfig.level_limit) {
        G_Prompt.showTip(Lang.get('package_item_use_level_limit', {
            level: itemConfig.level_limit,
            itemName: itemConfig.name
        }));
        return;
    }
    var tableFunc = PackageHelper.getItemFuncTable(itemConfig.item_type);
    if (tableFunc) {
        tableFunc.useFunc({
            'itemConfig': itemConfig,
            'itemId': itemId,
            'leftCount': leftCount,
            'oneItemAlsoShow': oneItemAlsoShow
        });
    }
};
PackageHelper.usePreCheck = function (itemConfig) {
    var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemConfig.id);
    var maxValue = UserDataHelper.getResItemMaxUseNum(itemConfig.id);
    if (maxValue == -1) {
        maxValue = itemNum;
    }
    maxValue = Math.min(maxValue, itemNum);
    if (maxValue <= 0) {
        if (itemConfig.item_type == 8) {
            var showBuyDlg = function () {
                var shopItemData = G_UserData.getShops().getFixShopGoodsByResId(ShopConst.NORMAL_SHOP, TypeConvertHelper.TYPE_ITEM, parseFloat(itemConfig.key_value));
                UIPopupHelper.popupFixShopBuyItem(shopItemData);
            }
            G_Prompt.showTipDelay(itemConfig.tips, showBuyDlg, 0.4);
        } else if (itemConfig.item_type == 9) {
            G_Prompt.showTip(itemConfig.tips);
        } else if (itemConfig.item_type == 14) {
            G_Prompt.showTip(itemConfig.tips);
        } else {
            G_Prompt.showTip(Lang.get('common_use_res_max'));
        }
        return [false];
    }
    return [
        true,
        maxValue
    ];
};
PackageHelper._useItemType = function (itemId, leftCount, oneItemAlsoShow) {
    var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
    var itemConfig = itemParam.cfg;
    var callBackFunction = function (itemId, count) {
        G_UserData.getItems().c2sUseItem(itemId, count, 0, 0);
        console.warn('confirm PopupBuyOnce item id is id: ' + (itemId + ('  count: ' + count)));
        return false;
    }
    var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemConfig.id);
    if ((itemNum > 1 || oneItemAlsoShow == true) && itemConfig.use_type != 1) {
        var [result, maxValue] = PackageHelper.usePreCheck(itemConfig);
        if (result == false) {
            return;
        }
        PopupItemUse.getIns(PopupItemUse, (p: PopupItemUse) => {
            p.ctor(Lang.get("popup_item_use"), callBackFunction)
            p.updateUI(TypeConvertHelper.TYPE_ITEM, itemConfig.id);
            p.setMaxLimit(maxValue);
            if (DataConst.JADE_STONE_BOX[itemConfig.id]) {
                p.setTextTips(Lang.get('max_open_jade_stone_nums'));
            } else {
                p.setTextTips(itemConfig.description);
            }
            p.setOwnerCount(itemNum);
            p.openWithAction();
        })
        return;
    } else {
        if (PackageHelper.usePreCheck(itemConfig) == false) {
            return;
        }
        callBackFunction(itemConfig.id, 1);
    }
};
var funcBoostItem = function (params) {
    PackageHelper._useItemType(params.itemId, params.leftCount, params.oneItemAlsoShow);
};
var funcBoxItem = function (params) {
    var boxId = params.itemConfig.item_value;
    var showNumSelect = params.itemConfig.backup_value != '1' && true || false;
    var [itemList] = UIPopupHelper.getBoxItemList(boxId, params.itemId);
    function callBackFunction(awardItem, index, total) {
        // dump(awardItem);
        // dump(total);
        if (awardItem == null) {
            G_Prompt.showTip(Lang.get('common_choose_item'));
            return true;
        }
        G_UserData.getItems().c2sUseItem(awardItem.itemId, total || 1, 0, awardItem.index, awardItem.boxId);
        return false;
    }
    var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, params.itemConfig.id);
    var itemListSize = ObjKeyLength(itemList);
    if (itemListSize == 1) {
        var awardItem = null;
        for (var i in itemList) {
            var awards = itemList[i];
            awardItem = awards;
        }
        var maxValue = Math.min(itemNum, params.leftCount);
        if (itemNum == 1) {
            PopupSelectReward.getIns(PopupSelectReward, (p: PopupSelectReward) => {
                p.ctor(Lang.get('popup_title_select_reward'), callBackFunction);
                p.updateUI(awardItem);
                p.openWithAction();
            });
        } else {
            PopupSelectRewardNum.getIns(PopupSelectRewardNum, (p: PopupSelectRewardNum) => {
                p.ctor(Lang.get('popup_title_select_reward'), callBackFunction);
                p.updateUI(awardItem);
                p.setMaxLimit(maxValue);
                p.openWithAction();
            });
        }
    } else if (itemListSize > 1) {
        var maxValue = Math.min(itemNum, params.leftCount);
        if (itemNum == 1) {
            PopupSelectRewardTab.getIns(PopupSelectRewardTab, (p: PopupSelectRewardTab) => {
                p.ctor(Lang.get('popup_title_select_reward'), callBackFunction);
                p.updateUI(itemList);
                p.openWithAction();
            });
        } else {
            PopupSelectRewardTab.getIns(PopupSelectRewardTabNum, (p: PopupSelectRewardTabNum) => {
                p.ctor(Lang.get('popup_title_select_reward'), callBackFunction);
                p.updateUI(itemList);
                p.setMaxLimit(maxValue);
                if (!showNumSelect) {
                    p.hideNumSelect();
                }
                p.openWithAction();
            });
        }
    }
};
var funcGoToItem = function (params) {
    WayFuncDataHelper.gotoModuleByFuncId(params.itemConfig.function_id);
};
var funcTokenItem = function (params) {
    function callBackFunction(itemId, count) {
        G_UserData.getItems().c2sUseItem(itemId, count, 0, 0);
        return false;
    }
    var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, params.itemConfig.id);
    if (itemNum > 1) {   //|| oneItemAlsoShow == true
        var maxValue = UserDataHelper.getResItemMaxUseNum(params.itemConfig.id);
        if (maxValue == -1) {
            maxValue = itemNum;
        }
        maxValue = Math.min(maxValue, itemNum);
        if (maxValue <= 0) {
            G_Prompt.showTip(Lang.get('common_use_res_max'));
            return;
        }
        PopupItemUse.getIns(PopupItemUse, (p: PopupItemUse) => {
            p.ctor(Lang.get('popup_item_use'), callBackFunction)
            p.updateUI(TypeConvertHelper.TYPE_ITEM, params.itemConfig.id);
            p.setMaxLimit(maxValue);
            p.setTextTips(params.itemConfig.description);
            p.setOwnerCount(itemNum);
            p.openWithAction();
        })

    } else {
        callBackFunction(params.itemConfig.id, 1);
    }
};
PackageHelper._ITEM_TYPE_DROP = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper._ITEM_TYPE_BOX = {
    useFunc: function (params) {
        funcBoxItem(params);
    }
};
PackageHelper._ITEM_TYPE_TOKEN = {
    useFunc: function (params) {
        funcGoToItem(params);
    }
};
PackageHelper._ITEM_TYPE_REFINED_STONE = {
    useFunc: function (params) {
        funcGoToItem(params);
    }
};
PackageHelper._ITEM_TYPE_DEMON = {
    useFunc: function (params) {
        funcTokenItem(params);
    }
};
PackageHelper._ITEM_TYPE_WUJIANG_UPGRADE = {
    useFunc: function (params) {
        funcGoToItem(params);
    }
};
PackageHelper._ITEM_TYPE_BAOWU_UPGARDE = {
    useFunc: function (params) {
        funcGoToItem(params);
    }
};
PackageHelper._ITEM_TYPE_GOLD_BOX = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper._ITEM_TYPE_QINTMOB = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper._ITEM_TYPE_GOD_BEAST_UPGRADE = {
    useFunc: function (params) {
        funcGoToItem(params);
    }
};
PackageHelper._ITEM_TYPE_RECHARGE = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper._ITEM_TYPE_ACTIVE_VIP_ICON = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper._ITEM_TYPE_QINTOMB_ADDTIME = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper._ITEM_TYPE_SHISHEN_BOX = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper._ITEM_TYPE_HOMELAND_BUFF = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper._ITEM_TYPE_GRAIN_BOX = {
    useFunc: function (params) {
        funcBoostItem(params);
    }
};
PackageHelper.getItemFuncTable = function (itemtype) {
    var funcName = PackageViewConst.getItemTypeName(itemtype);
    var retFunc = PackageHelper['_' + funcName];
    if (retFunc != null && typeof (retFunc) == 'object') {
        return retFunc;
    }
    return null;
};