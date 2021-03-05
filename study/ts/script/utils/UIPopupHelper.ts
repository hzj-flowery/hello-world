import { ConfigNameConst } from "../const/ConfigNameConst";
import { DataConst } from "../const/DataConst";
import { FunctionConst } from "../const/FunctionConst";
import { Colors, G_ConfigLoader, G_ConfigManager, G_GameAgent, G_Prompt, G_SceneManager, G_TutorialManager, G_UserData } from "../init";
import { Lang } from "../lang/Lang";
import PopupArenaReport from "../scene/view/arena/PopupArenaReport";
import PopupArenaSweep from "../scene/view/arena/PopupArenaSweep";
import PopupRankUpReward from "../scene/view/arena/PopupRankUpReward";
import PopupAvatarDetail from "../scene/view/avatar/PopupAvatarDetail";
import PopupAvatarShopBuyConfirm from "../scene/view/avatarShop/PopupAvatarShopBuyConfirm";
import PopupHeroDetail from "../scene/view/heroDetail/PopupHeroDetail";
import PopupRecoveryPreview from "../scene/view/recovery/PopupRecoveryPreview";
import PopupSellFragment from "../scene/view/sell/PopupSellFragment";
import PopupActiveShopItemBuy from "../ui/popup/PopupActiveShopItemBuy";
import PopupChooseHero from "../ui/popup/PopupChooseHero";
import PopupChooseInstrument from "../ui/popup/PopupChooseInstrument";
import PopupItemBuyUse from "../ui/popup/PopupItemBuyUse";
import PopupSkillDes from "../ui/popup/PopupSkillDes";
import PopupTransformConfirm from "../ui/popup/PopupTransformConfirm";
import PopupUserDetailInfo from "../ui/popup/PopupUserDetailInfo";
import PopupUserJadeDes from "../ui/popup/PopupUserJadeDes";
import PopupAlert from "../ui/PopupAlert";
import PopupBase from "../ui/PopupBase";
import PopupBatchUse from "../ui/PopupBatchUse";
import PopupBuyOnce from "../ui/PopupBuyOnce";
import { PopupHelpInfo } from "../ui/PopupHelpInfo";
import PopupItemBuy from "../ui/PopupItemBuy";
import PopupItemExchange from "../ui/PopupItemExchange";
import PopupItemGuider from "../ui/PopupItemGuider";
import { PopupShopItemBuy } from "../ui/PopupShopItemBuy";
import PopupSystemAlert from "../ui/PopupSystemAlert";
import { ShopActiveDataHelper } from "./data/ShopActiveDataHelper";
import { UserDataHelper } from "./data/UserDataHelper";
import { WayFuncDataHelper } from "./data/WayFuncDataHelper";
import { UserCheck } from "./logic/UserCheck";
import { LogicCheckHelper } from "./LogicCheckHelper";
import { Path } from "./Path";
import { RichTextHelper } from "./RichTextHelper";
import { table } from "./table";
import { TypeConvertHelper } from "./TypeConvertHelper";
import { Util } from "./Util";
import TutorialManager from "../scene/view/tutorial/TutorialManager";
import { TutorialHelper } from "../scene/view/tutorial/TutorialHelper";
import { ShopConst } from "../const/ShopConst";
import { assert, unpack } from "./GlobleFunc";
import UIHelper from "./UIHelper";

export class UIPopupHelper {
    //UI 弹出框帮助类
    //根据box id 物品列表
    //[groupId] = { [1] = {type,value,size}, [2] = {type, value,size}}
    static getBoxItemList(boxId, itemId?) {
        function getBoxItemData(key, goodList, boxData) {
            for (var i = 1; i <= 4; i++) {
                var _type = boxData['type_' + i];
                if (_type > 0) {
                    var value = boxData['value_' + i];
                    var size = boxData['size_' + i];
                    var good = {
                        type: _type,
                        value: value,
                        size: size,
                        boxId: boxData.id,
                        index: i,
                        itemId: itemId
                    };
                    goodList['key' + key] = goodList['key' + key] || [];
                    goodList['key' + key].push(good);
                }
            }
        }
        let BoxConfig = G_ConfigLoader.getConfig(ConfigNameConst.BOX);
        var boxLen = BoxConfig.length();
        var boxList = {};
        var goodList = {};
        for (var i = 0; i < boxLen; i++) {
            var boxData = BoxConfig.indexOf(i);
            if (boxData.item_id == boxId) {
                boxList['key' + boxData.group] = boxList['key' + boxData.group] || [];
                boxList['key' + boxData.group].push(boxData);
                getBoxItemData(boxData.group, goodList, boxData);
            }
        }
        return [
            goodList,
            boxList
        ];
    }
    //弹出合成碎片界面
    static popupMerageFragment(fragmentId) {
        var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        var config = itemParam.cfg;
        var itemType = config.comp_type;
        var mergeSize = Math.floor(itemNum / config.fragment_num);
        var result = UserCheck.isPackFull(config.comp_type, config.comp_value);
        var isFull = result[0];
        let leftCount = result[1];
        if (isFull) {
            return;
        }
        function callBackFunction(itemId, count) {
            var merageItem = {
                id: fragmentId,
                num: count || 1
            };
            G_UserData.getFragments().c2sSyntheticFragments(fragmentId, count);
            //logWarn('confirm PopupBuyOnce item id is id: ' + (itemId + ('  count: ' + count)));
            return false;
        }
        if (mergeSize > 1) {
            PopupBatchUse.getIns(PopupBatchUse, (p: PopupBatchUse) => {
                p.ctor(Lang.get('common_title_fragment_merage'), callBackFunction);
                p.updateUI(config.id);
                p.setMaxLimit(mergeSize);
                var maxLimit = Math.min(mergeSize, leftCount as number);
                p.setOwnerCount(maxLimit);
                p.openWithAction();
            });
        } else {
            callBackFunction(fragmentId, 1);
        }
    }
    //售卖碎片界面
    static popupSellFragment(sellType) {
        cc.resources.load([
            'prefab/sell/PopupSellFragment'
        ], cc.Prefab, (err, resource) => {
            var popup: PopupSellFragment = Util.getNode('prefab/sell/PopupSellFragment', PopupSellFragment);
            popup.ctor(sellType);
            popup.openWithAction();
        });
    }
    //固定商店物品购买
    static popupFixShopBuyItem(shopItemData, shopFucConst?) {
        shopFucConst = shopFucConst || shopItemData.getGoodId();
        var surplus = shopItemData.getSurplusTimes();
        var itemCfg = shopItemData.getConfig();
        if (shopItemData.getConfigType() == 'fix') {
            let callBackFunction = function (itemId?, buyCount?) {
                if (LogicCheckHelper.shopFixBuyCheck(shopItemData, buyCount, true)[0] == false) {
                    return;
                }
                G_UserData.getShops().c2sBuyShopGoods(shopItemData.getGoodId(), shopItemData.getShopId(), buyCount);
            }
            var [isFull, leftCount] = LogicCheckHelper.isPackFull(itemCfg.type, itemCfg.value);
            if (isFull == true) {
                return;
            }
            var itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemCfg.type, itemCfg.value);
            var maxLimit = UserDataHelper.getFixItemMaxNum(shopItemData);
            // leftCount = typeof (leftCount);
            if (leftCount > 0) {
                maxLimit = Math.min(maxLimit, leftCount);
            }
            if (maxLimit == 0) {
                maxLimit = 1;
            }
            if (surplus == 1) {
                callBackFunction();
                return;
            }
            if (surplus > 0) {
                PopupBase.loadCommonPrefab('PopupShopItemBuy', (popup: PopupShopItemBuy) => {
                    popup.setMaxLimit(maxLimit);
                    popup.ctor(Lang.get('shop_pop_title'), callBackFunction);
                    popup.openWithAction();
                    popup.updateUI(shopItemData.getShopId(), shopItemData.getGoodId());
                });
            } else {
                if (shopItemData.getGoodId() == ShopConst.SHOP_FIX_LIMIT_RICE || shopItemData.getGoodId() == ShopConst.SHOP_FIX_LIMIT_ATKCMD) {
                    var limitNum = UserDataHelper.checkResourceLimit(itemCfg.value);
                    maxLimit = itemOwnerNum >= limitNum && 0 || Math.ceil((limitNum - itemOwnerNum) / itemCfg.size);
                }

                PopupBase.loadCommonPrefab('PopupItemBuy', (popup: PopupItemBuy) => {
                    popup.ctor(Lang.get('shop_pop_title'), callBackFunction);
                    popup.setShopConst(shopFucConst);
                    popup.setMaxLimit(maxLimit);
                    popup.openWithAction();
                    popup.updateUI(shopItemData.getShopId(), shopItemData.getGoodId());
                });
            }
        }
    }

    //变身卡详情
    static popupAvatarDetail(type, id) {
        cc.resources.load([
            'prefab/avatar/PopupAvatarDetail',
            "prefab/common/CommonDetailTitleWithBg"
        ], cc.Prefab, () => {
            var pop: PopupAvatarDetail = Util.getNode('prefab/avatar/PopupAvatarDetail', PopupAvatarDetail);
            pop.ctor(type, id);
            pop.openWithAction();
        });



    }
    //随即商店购买物品
    static popupRandomShopBuyItem(shopItemData) {
        var callBackFunction = function (itemId, buyCount) {
            G_UserData.getShops().c2sBuyShopGoods(shopItemData.getGoodNo(), shopItemData.getShopId(), buyCount);
        }.bind(this);
        if (shopItemData.getConfigType() == 'random') {
            if (UserDataHelper.getPopModuleShow('randomShopBuy') == true) {
                callBackFunction();
                return;
            }
            var randomCfg = shopItemData.getConfig();
            var [isFull, leftCount] = LogicCheckHelper.isPackFull(randomCfg.item_type, randomCfg.item_id);
            if (isFull == true) {
                return;
            }
            if (randomCfg.value1 == DataConst.RES_DIAMOND) {
                PopupBase.loadCommonPrefab('PopupBuyOnce', (popup: PopupBuyOnce) => {
                    popup.ctor(Lang.get('shop_pop_title'), callBackFunction);
                    popup.updateUI(randomCfg.item_type, randomCfg.item_id, randomCfg.item_num);
                    popup.openWithAction();
                    popup.setModuleName('randomShopBuy');
                    popup.setCostInfo(randomCfg.type1, randomCfg.value1, randomCfg.size1);
                });
            } else {
                callBackFunction();
            }
        }
    }


    static popupSuperChargeActivity() {
        if (G_UserData.getRechargeActivity().state == 1 || G_UserData.getBase().getOpenServerDayNum() > 7 || !G_ConfigManager.checkCanRecharge()) {
            return;
        }
        if (UserDataHelper.getPopModuleShow('super_charge') == true) {
            return;
        }
        if (G_TutorialManager._isPause == true) {
            G_SceneManager.openPopup('prefab/superCharge/PopupSuperChargeActivity', (popup) => {
                UserDataHelper.setPopModuleShow('super_charge', true);
                // popup.setModuleName('super_charge');
                popup.openWithAction();
            })
        }
    }

    //技能描述
    static popupSkillDes(node: cc.Node, skillId, baseId, startLevel): void {
        PopupBase.loadCommonPrefab("PopupSkillDes", function (pop: PopupSkillDes) {
            pop.setNotCreateShade(true);
            pop.setInitData(node, skillId, baseId, startLevel);
            pop.openWithAction();
        })
    }
    //活动商店购买物品
    static popupActiveShopBuyItem(goodId, callback) {
        var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
        var isEnough = true;
        var lackInfo = null;
        for (var i in costInfo) {
            var info = costInfo[i];
            var isOk = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false);
            if (!isOk) {
                isEnough = false;
                lackInfo = info;
                break;
            }
        }
        if (isEnough) {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupActiveShopItemBuy"), function (pop: PopupActiveShopItemBuy) {
                pop.setInitData(goodId, callback, Lang.get("common_title_buy_confirm"))
                pop.openWithAction();
            })
        } else {
            if (lackInfo) {
                UIPopupHelper.popupItemGuider(function (popup: PopupItemGuider) {
                    popup.updateUI(lackInfo.type, lackInfo.value);
                })
            }
        }
    }
    //副本次数不足弹框
    static popupResetTimesNoEnough(funcType, vipLevel?) {
        var vipCfg = G_UserData.getVip().getVipFunctionDataByType(funcType, vipLevel);
        function popFunc() {
            function onBtnOk() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE);
            }
            function onBtnCancel() {
            }
            var richList: any[] = [];
            // TODO:RichText
            richList.push(RichTextHelper.getRichMsgListForHashText(vipCfg.hint1, Colors.BRIGHT_BG_GREEN, Colors.COLOR_POPUP_DESC_NORMAL, 22));
            richList.push(RichTextHelper.getRichMsgListForHashText(vipCfg.hint2, Colors.BRIGHT_BG_GREEN, Colors.COLOR_POPUP_DESC_NORMAL, 22));
            PopupAlert.loadCommonPrefab("PopupAlert", (popupAlert: PopupAlert) => {
                popupAlert.init(vipCfg.title, '', onBtnOk, onBtnCancel);
                popupAlert.addRichTextList(richList);
                popupAlert.setOKBtn(Lang.get('common_vip_func_btn2'));
                popupAlert.openWithAction();
            });
        }

        return popFunc();
    }
    //跳转到某个场景
    static gotoScene(cellValue, params, needNum) { }
    //用户确认对话框
    static popupConfirm(hintStr, callBackOk) {
        // todo
        PopupBase.loadCommonPrefab('PopupAlert', (popup: PopupAlert) => {
            popup.init(null, hintStr, callBackOk);
            popup.openWithAction();
        });
        //callBackOk && callBackOk();
    }
    static popupNoticeDialog(hintStr, callBackExit) { }
    //弹出每日签到重签窗口
    static popupResigninUI() { }
    //碎片使用弹框，
    //1.检查碎片是否可以合成
    //2.不能合成则弹出获取界面
    static popupFragmentDlg(itemId) {
        var itemType = TypeConvertHelper.TYPE_FRAGMENT

        var canMerage = UserDataHelper.isFragmentCanMerage(itemId)[0]
        if (canMerage == true) {
            UIPopupHelper.popupMerageFragment(itemId)
        } else {
            UIPopupHelper.popupItemGuiderByType(itemType, itemId, Lang.get("way_type_get"))
        }
    }

    //点击Icon弹出详情框
    static popupIconDetail(type, value) {

        if (type == TypeConvertHelper.TYPE_HERO) {
            cc.resources.load([
                "prefab/common/CommonStoryAvatar",
                'prefab/common/CommonHeroAvatar',
                'prefab/heroDetail/HeroDetailSkillCell',
                'prefab/heroDetail/PopupHeroDetail',
                "prefab/heroDetail/HeroDetailAttrModule",
                "prefab/heroDetail/HeroDetailJointModule",
                "prefab/heroDetail/HeroDetailSkillModule",
                "prefab/heroDetail/HeroDetailWeaponModule",
                "prefab/heroDetail/HeroDetailTalentModule",
                "prefab/heroDetail/HeroDetailKarmaModule",
                "prefab/heroDetail/HeroDetailYokeModule",
                "prefab/heroDetail/HeroDetailAwakeModule",
                "prefab/heroDetail/HeroDetailBriefModule",
                "prefab/common/CommonDetailTitleWithBg",
                "prefab/common/CommonButtonLevel2Highlight",
                "prefab/heroDetail/HeroDetailDynamicModule"
            ], cc.Prefab, (err, resource) => {
                var itemParams = TypeConvertHelper.convert(type, value);
                if (itemParams.cfg.type == 3) {
                    this.popupItemGuiderByType(TypeConvertHelper.TYPE_HERO, itemParams.cfg.id);
                }
                else {
                    var popupHeroDetail: PopupHeroDetail = Util.getNode('prefab/heroDetail/PopupHeroDetail', PopupHeroDetail);
                    popupHeroDetail.initData(TypeConvertHelper.TYPE_HERO, itemParams.cfg.id)
                    popupHeroDetail.openWithAction();
                }
            });
        }

    }
    //点击Icon弹出详情框
    static popupHeroDetail(callBack) {
        cc.resources.load([
            "prefab/common/CommonStoryAvatar",
            'prefab/common/CommonHeroAvatar',
            'prefab/heroDetail/HeroDetailSkillCell',
            'prefab/heroDetail/PopupHeroDetail',
            "prefab/heroDetail/HeroDetailAttrModule",
            "prefab/heroDetail/HeroDetailJointModule",
            "prefab/heroDetail/HeroDetailSkillModule",
            "prefab/heroDetail/HeroDetailWeaponModule",
            "prefab/heroDetail/HeroDetailTalentModule",
            "prefab/heroDetail/HeroDetailKarmaModule",
            "prefab/heroDetail/HeroDetailYokeModule",
            "prefab/heroDetail/HeroDetailAwakeModule",
            "prefab/heroDetail/HeroDetailBriefModule",
            "prefab/common/CommonDetailTitleWithBg",
            "prefab/common/CommonButtonLevel2Highlight",
            "prefab/heroDetail/HeroDetailDynamicModule"
        ], cc.Prefab, (err, resource) => {
            var popupHeroDetail: PopupHeroDetail = Util.getNode('prefab/heroDetail/PopupHeroDetail', PopupHeroDetail);
            callBack && callBack(popupHeroDetail);
        });
    }
    static popupIndulgeDialog(callBackExit) { }
    static popupInputAccountActivationCode(okCallBack, cancelCallback) { }
    static popupQuestionDialog(callBack) { }
    static popupShopBuyRes(itemType, itemValue) {
        var shopData = G_UserData.getShops();
        var shopItemData = shopData.getFixShopGoodsByResId(ShopConst.NORMAL_SHOP, itemType, itemValue);
        if (shopItemData == null) {
            G_Prompt.showTip(Lang.get('common_popup_shop_buy_not_open'));
            return true;
        } else if (shopItemData == false) {
            G_Prompt.showTip(Lang.get('common_popup_shop_buy_not_item'));
            return true;
        }
        var [success01, errorMsg, funcName] = LogicCheckHelper.shopFixBtnCheck(shopItemData);
        if (success01 == false) {
            var cfg = shopItemData.getConfig();
            if (funcName == 'shopNumBanType' && shopItemData.isCanAddTimesByVip()) {
                var timesOut = LogicCheckHelper.vipTimesOutCheck(cfg.num_ban_value, shopItemData.getBuyCount(), Lang.get('shop_condition_buymax'));
            } else if (errorMsg) {
                G_Prompt.showTip(errorMsg);
            }
            return true;
        }
        UIPopupHelper.popupFixShopBuyItem(shopItemData);
        return true;
    }

    static popupRecoveryPreview(data, type, callBack): void {
        cc.resources.load(Path.getPrefab("PopupRecoveryPreview", "recovery"), cc.Prefab, function (err, res) {
            if (err != null || res == null) {
                return;
            }
            var pop = cc.instantiate(res).getComponent(PopupRecoveryPreview);
            pop.init(data, type, callBack);
            pop.openWithAction();
        }.bind(this));
    }

    //弹出选择宠物界面
    static popupChoosePet(type, callBack, title): void {

    }
    //弹出元宝不足弹框
    static popupVIPNoEnough() {
        let callBackOk = function () {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE);
        }
        PopupBase.loadCommonPrefab('PopupAlert', (popup: PopupAlert) => {
            popup.init(Lang.get('common_vip_not_enough_title'), Lang.get('common_vip_not_enough'), callBackOk);
            popup.setOKBtn(Lang.get('common_goto_recharge'));
            popup.openWithAction();
        });
    }
    static popupHelpInfo(funtionId, param?) {
        this.loadAndPopupHelpInfo((popupHelpInfo: PopupHelpInfo) => {
            popupHelpInfo.updateByFunctionId(funtionId, param);
            popupHelpInfo.setClickOtherClose(true);
        });
    }
    static popupHelpInfoByLangName(langName) {
        this.loadAndPopupHelpInfo((popupHelpInfo: PopupHelpInfo) => {
            popupHelpInfo.updateByLangName(langName);
            popupHelpInfo.setClickOtherClose(true);
        });
    }

    private static loadAndPopupHelpInfo(callback: Function): void {
        PopupBase.loadCommonPrefab('PopupHelpInfo', (popupHelpInfo: PopupHelpInfo) => {
            callback && callback(popupHelpInfo);
            popupHelpInfo.openWithAction();
        });
    }

    static popupItemBuyAndUse(itemType, itemValue) {
        var popDialogCallback = function () {
            if (G_TutorialManager.isDoingStep() == true) {
                return;
            }
            // cc.error("越过教程 直接判断-------G_TutorialManager.isDoingStep() == true");
            PopupBase.loadCommonPrefab('PopupItemBuyUse', (popupItemBuyUse: PopupItemBuyUse) => {
                // callback && callback(popupHelpInfo);
                popupItemBuyUse.updateUI(itemType, itemValue);
                popupItemBuyUse.openWithAction();
            });
        }
        var itemNum = UserDataHelper.getNumByTypeAndValue(itemType, itemValue);
        if (itemNum > 0) {
            popDialogCallback();
            return;
        }
        var success = LogicCheckHelper.shopCheckShopBuyRes(itemType, itemValue);
        if (!success) {
            return;
        }
        popDialogCallback();

    }
    //单个确定按钮对话框
    static popupOkDialog(title, content, callback, okStr) {
        okStr = okStr || Lang.get("common_retry");
        title = title || Lang.get("common_system");

        G_SceneManager.openPopup(Path.getPrefab("PopupAlert", "common"), (popup: PopupAlert) => {
            popup.init(title, content, callback, null, null);
            popup.onlyShowOkButton()
            popup.setCloseVisible(false)
            popup.setClickOtherClose(false)
            popup.setOKBtn(okStr)
            popup.openWithAction()
        });

    }
    //灰度测试提示弹框
    static showGrayTestDialog(dlgType, clientV, serverV, callback) { }
    //断线对话框
    static showOfflineDialog(content, isHideReconnect?, callback?) {
        isHideReconnect = isHideReconnect || true;
        var okStr = Lang.get('common_relogin');
        var cancelStr = Lang.get('common_reconnect');
        function okCallback() {
            G_GameAgent.returnToLogin();
            var runningSceneName = G_SceneManager.getRunningScene().getName();
            if (runningSceneName == 'login') {
                return false;
            }
            return false;
        }
        function cancelCallback() {
            G_GameAgent.checkAndLoginGame();
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupAlert", "common"), (popup: PopupAlert) => {
            popup.init(Lang.get('common_system'), content, callback || okCallback, cancelCallback, null);
            if (isHideReconnect) {
                popup.onlyShowOkButton();
            }
            popup.name = ('offlineDialog');
            popup.setCloseVisible(false);
            popup.setClickOtherClose(false);
            popup.setBtnStr(okStr, cancelStr);
            popup.openToOfflineLevel();
        })
    }
    //活动批量兑换
    static popupExchangeItems(actTaskUnitData) {
        var [value01, value02, onlyShowMax] = actTaskUnitData.getProgressValue();
        var consumeItems = actTaskUnitData.getConsumeItems();
        var fixRewards = actTaskUnitData.getRewardItems();
        var selectRewards = actTaskUnitData.getSelectRewardItems();
        var surplus = value01;
        var item = fixRewards[0];
        //assert((item, 'can not find exchange gain item');
        if (surplus < 0) {
            return;
        }
        var callBackFunction = function (exchangeItem, consumeItems, buyCount) {
            var newConsumeItems = [];
            for (var k in consumeItems) {
                var v = consumeItems[k];
                table.insert(newConsumeItems, {
                    type: v.type,
                    value: v.value,
                    size: v.size * buyCount
                });
            }
            if (LogicCheckHelper.enoughValueList(newConsumeItems, false) == false) {
                G_Prompt.showTip(Lang.get('common_res_not_enough'));
                return;
            }
            if (G_UserData.getCustomActivity().isActivityExpiredById(actTaskUnitData.getAct_id())) {
                G_Prompt.showTip(Lang.get('customactivity_tips_already_finish'));
                return;
            }
            G_UserData.getCustomActivity().c2sGetCustomActivityAward(actTaskUnitData.getAct_id(), actTaskUnitData.getId(), null, buyCount);
        }
        var [isFull, _] = LogicCheckHelper.isPackFull(item.type, item.value);
        if (isFull == true) {
            return;
        }
        if (surplus == 1 || surplus > 1 && fixRewards.length > 1) {
            var callbackOK = function () {
                callBackFunction(item, consumeItems, 1);
            }
            var hasYuanBaoCost = function (): boolean {
                for (var i in consumeItems) {
                    var value = consumeItems[i];
                    if (value.type == TypeConvertHelper.TYPE_RESOURCE && value.value == DataConst.RES_DIAMOND) {
                        return true;
                    }
                }
                return false;
            }
            if (hasYuanBaoCost()) {
                var title = Lang.get('custom_spentyuanbao_title');
                var content = Lang.get('custom_spentyuanbao_content', { num: consumeItems[0].size });
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupAlert"), function (pop: PopupAlert) {
                    pop.init(title, content, callbackOK);
                    pop.openWithAction();
                })
            } else {
                callBackFunction(item, consumeItems, 1);
            }
            return;
        }
        var maxValue = surplus;
        if (maxValue != 0) {
            for (var i in consumeItems) {
                var v = consumeItems[i];
                var itemNum = UserDataHelper.getNumByTypeAndValue(v.type, v.value);
                maxValue = Math.min(maxValue, itemNum);
            }
        }
        if (maxValue == 0) {
            G_Prompt.showTip(Lang.get('common_res_not_enough'));
            return;
        }
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemExchange"), function (pop: PopupItemExchange) {
            pop.ctor(Lang.get('common_title_exchange_item'), callBackFunction);
            pop.openWithAction();
            pop.updateUI(item, consumeItems, surplus);
            pop.setMaxLimit(maxValue);

        })
    }

    static popupExchangeItemsExt(actTaskUnitData) {
        var [value01, value02, onlyShowMax] = actTaskUnitData.getProgressValue();
        var consumeItems = actTaskUnitData.getConsumeItems();
        var fixRewards = actTaskUnitData.getRewardItems();
        var selectRewards = actTaskUnitData.getSelectRewardItems();
        var surplus = value01;
        var item = fixRewards[0];
        assert(item, 'can not find exchange gain item');
        if (surplus < 0) {
            return;
        }
        var callBackFunction = function (exchangeItem, consumeItems, buyCount) {
            var newConsumeItems = [];
            for (let k in consumeItems) {
                var v = consumeItems[k];
                table.insert(newConsumeItems, {
                    type: v.type,
                    value: v.value,
                    size: v.size * buyCount
                });
            }
            if (LogicCheckHelper.enoughValueList(newConsumeItems, false) == false) {
                G_Prompt.showTip(Lang.get('common_res_not_enough'));
                return;
            }
            if (G_UserData.getCustomActivity().isActivityExpiredById(actTaskUnitData.getAct_id())) {
                G_Prompt.showTip(Lang.get('customactivity_tips_already_finish'));
                return;
            }
            G_UserData.getCustomActivity().c2sGetCustomActivityAward(actTaskUnitData.getAct_id(), actTaskUnitData.getId(), null, buyCount);
        }
        var [isFull] = LogicCheckHelper.isPackFull(item.type, item.value);
        if (isFull == true) {
            return;
        }
        if (surplus == 1 || surplus > 1 && fixRewards.length > 1) {
            var callbackOK = function () {
                callBackFunction(item, consumeItems, 1);
            }
            var hasYuanBaoCost = function () {
                for (let i in consumeItems) {
                    var value = consumeItems[i];
                    if (value.type == TypeConvertHelper.TYPE_RESOURCE && value.value == DataConst.RES_DIAMOND) {
                        return true;
                    }
                }
                return false;
            }
            if (hasYuanBaoCost()) {
                var title = Lang.get('custom_spentyuanbao_title');
                var content = Lang.get('custom_spentyuanbao_content', { num: consumeItems[0].size });
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupAlert"), function (pop: PopupAlert) {
                    pop.init(title, content, callbackOK);
                    pop.openWithAction();
                })
            } else {
                callBackFunction(item, consumeItems, 1);
            }
            return;
        }
        var maxValue = surplus;
        if (maxValue != 0) {
            for (let i in consumeItems) {
                var v = consumeItems[i];
                var canBuyNum = Math.floor(UserDataHelper.getNumByTypeAndValue(v.type, v.value) / v.size);
                maxValue = Math.min(maxValue, canBuyNum);
            }
        }
        if (maxValue == 0) {
            G_Prompt.showTip(Lang.get('common_res_not_enough'));
            return;
        }

        G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemExchange"), function (pop: PopupItemExchange) {
            pop.ctor(Lang.get('common_title_exchange_item'), callBackFunction);
            pop.openWithAction();
            pop.updateUI(item, consumeItems, surplus);
            pop.setMaxLimit(maxValue);

        })
    };

    static popupCommentGuide() { }
    static popupSecretKeyInput(successCallBack, cancelCallback) {
        G_SceneManager.openPopup('prefab/common/PopupInputSecretKey', (popup) => {
            popup.ctor(successCallBack, cancelCallback);
            popup.openWithAction();
        });
    }

    static popupItemGuider(callback) {
        G_SceneManager.openPopup('prefab/common/PopupItemGuider', (popupItemGuider: PopupItemGuider) => {
            callback && callback(popupItemGuider);
            popupItemGuider.openWithAction();
        });
    }

    static popupAvatarShopBuyConfirm(goodId, callback): void {
        cc.resources.load([
            'prefab/avatarShop/PopupAvatarShopBuyConfirm',
        ], cc.Prefab, () => {
            var pop: PopupAvatarShopBuyConfirm = Util.getNode('prefab/avatarShop/PopupAvatarShopBuyConfirm', PopupAvatarShopBuyConfirm);
            pop.setInitData(goodId, callback)
            pop.openWithAction();
        });
    }

    static popupTransformConfirm(datas, checkCallBack): void {
        cc.resources.load([
            'prefab/common/PopupTransformConfirm',
            "prefab/common/PopupTransformConfirmCell"
        ], cc.Prefab, () => {
            var pop: PopupTransformConfirm = Util.getNode('prefab/common/PopupTransformConfirm', PopupTransformConfirm);
            pop.setInitData(checkCallBack);
            pop.openWithAction();
            pop.updateUI(datas);
        });
    }

    static popupChooseInstrument(callback) {
        PopupBase.loadCommonPrefab('PopupChooseInstrument', (popup: PopupChooseInstrument) => {
            callback && callback(popup);
        });
    }

    static popupItemGuiderByType(itemType, itemValue, title = null) {
        UIPopupHelper.popupItemGuider((popupItemGuider: PopupItemGuider) => {
            if (title != null) {
                popupItemGuider.setTitle(title);
            }
            popupItemGuider.updateUI(itemType, itemValue);
        });
    }

    /**
     * 
     * @param title 
     * @param content 
     * @param callbackOK 确定回调
     * @param callbackCancel 取消回调
     * @param onLoadCallback 返回PopupSystemAlert
     */
    static popupSystemAlert(title, content, callbackOK, callbackCancel, onLoadCallback = null) {
        cc.resources.load([
            'prefab/common/PopupSystemAlert'
        ], cc.Prefab, () => {
            var popupSystemAlert: PopupSystemAlert = Util.getNode('prefab/common/PopupSystemAlert', PopupSystemAlert);
            popupSystemAlert.setup(title, content, callbackOK, callbackCancel);
            onLoadCallback && onLoadCallback(popupSystemAlert);
            popupSystemAlert.openWithAction();
        });
    }

    /**
     * 
     * @param title 
     * @param content 
     * @param callbackOK 确定回调
     * @param callbackCancel 取消回调
     * @param onLoadCallback 返回PopupSystemAlert
     */
    static popupAlert(title, content, callbackOK, callbackCancel, onLoadCallback = null) {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupAlert"), function (pop: PopupAlert) {
            pop.init(title, content, callbackOK, callbackCancel);
            onLoadCallback && onLoadCallback(pop);
            pop.openWithAction();
        });
    }
    /**
    * 
    * @param title 
    * @param content 
    * @param callbackOK 确定回调
    * @param callbackCancel 取消回调
    * @param onLoadCallback 返回PopupSystemAlert
    */
    static popupMineUser(title, content, callbackOK, callbackCancel, onLoadCallback = null) {

    }

    static popupUserBaseInfo(message: any): void {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupUserBaseInfo"), (popupUserBaseInfo) => {
            popupUserBaseInfo.openWithAction();
            popupUserBaseInfo.updateUI(message);
        })
    }

    static popupUserDetailInfor(message: any, power?): void {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupUserDetailInfo"), function (pop: PopupUserDetailInfo) {
            pop.setInitData(message, power);
            pop.openWithAction();
        }.bind(this));
    }

    static popupUserJadeDes(pv: cc.Component, data: any): void {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupUserJadeDes"), function (pop: PopupUserJadeDes) {
            pop.setinitData(pv, data);
            pop.open();
        });

    }

    /**
     * 
     * @param type 
     * @param callBack 
     * @param pos 
     * @param title 
     */
    static popupChooseHero(type, callBack, pos, title = Lang.get("hero_replace_title")): void {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupChooseHero"), function (pop: PopupChooseHero) {
            pop.setTitle(title)
            pop.updateUI(type, callBack, pos)
            pop.openWithAction();
        });
    }

    static popupArenaSweep(dataList, dataResult): void {
        G_SceneManager.openPopup(Path.getPrefab("PopupArenaSweep", "arena"), function (pop: PopupArenaSweep) {
            pop.setInitData(dataList, dataResult);
            pop.open();
        });
    }

    static popupRankUpReward(data, callBack): void {
        G_SceneManager.openPopup(Path.getPrefab("PopupRankUpReward", "arena"), function (pop: PopupRankUpReward) {
            pop.setInitData(data, callBack);
            pop.openWithAction();
        });
    }
    static popupArenaReport(): void {
        G_SceneManager.openPopup(Path.getPrefab("PopupArenaReport", "arena"), function (pop: PopupArenaReport) {
            pop.open();
        });
    }

    static popupCommonView(classType, onLoadCallback: Function) {
        if (!classType['PrefabPath']) {
            //assert((classType + ' need PrefabPath:string!!!');
            return;
        }
        var prefabPath = classType.PrefabPath;
        cc.resources.load([
            prefabPath
        ], cc.Prefab, () => {
            var popup: any = Util.getNode(prefabPath, classType);
            onLoadCallback(popup);
        });
    }

    static popupCostYubiTip(params, callback: Function, ...param) {
        var MODULE_INFO = {
            ['COST_YUBI_MODULE_NAME_1']: {
                itemName: [Lang.get('cost_yubi_item_name_1')],
                todo: Lang.get('cost_yubi_todo_1')
            },
            ['COST_YUBI_MODULE_NAME_2']: {
                itemName: [Lang.get('cost_yubi_item_name_2')],
                todo: Lang.get('cost_yubi_todo_2')
            },
            ['COST_YUBI_MODULE_NAME_3']: {
                itemName: [Lang.get('cost_yubi_item_name_3')],
                todo: Lang.get('cost_yubi_todo_3')
            },
            ['COST_YUBI_MODULE_NAME_4']: {
                itemName: [Lang.get('cost_yubi_item_name_4')],
                todo: Lang.get('cost_yubi_todo_4')
            },
            ['COST_YUBI_MODULE_NAME_5']: {
                itemName: [Lang.get('cost_yubi_item_name_5')],
                todo: Lang.get('cost_yubi_todo_5')
            },
            ['COST_YUBI_MODULE_NAME_6']: {
                itemName: [
                    Lang.get('cost_yubi_item_name_6'),
                    Lang.get('cost_yubi_item_name_6_2')
                ],
                todo: Lang.get('cost_yubi_todo_6')
            },
            ['COST_YUBI_MODULE_NAME_7']: {
                itemName: [Lang.get('cost_yubi_item_name_7')],
                todo: Lang.get('cost_yubi_todo_7')
            },
            ['COST_YUBI_MODULE_NAME_8']: {
                itemName: [Lang.get('cost_yubi_item_name_8')],
                todo: Lang.get('cost_yubi_todo_8')
            },
            ['COST_YUBI_MODULE_NAME_9']: {
                itemName: [Lang.get('cost_yubi_item_name_9')],
                todo: Lang.get('cost_yubi_todo_9')
            },
            ['COST_YUBI_MODULE_NAME_10']: {
                itemName: [Lang.get('cost_yubi_item_name_10')],
                todo: Lang.get('cost_yubi_todo_10')
            },
            ['COST_YUBI_MODULE_NAME_11']: {
                itemName: [Lang.get('cost_yubi_item_name_11')],
                todo: Lang.get('cost_yubi_todo_11')
            }
        };
        var moduleName = params.moduleName;
        var yubiCount = params.yubiCount;
        var itemCount = params.itemCount;
        var itemNameIndex = params.itemNameIndex || 0;
        var noyubiTip = params.noyubitip || null;
        var tipType = params.tipType || null;
        var callbackParams = param;
        var callbackOk = function () {
            callback.apply(null,callbackParams);
        };
        var noTip = UserDataHelper.getPopModuleShow(moduleName);
        if (noTip || yubiCount == null) {
            callbackOk();
            return;
        }
        var info = MODULE_INFO[moduleName];
        assert(info, "COST_YUBI_MODULE_INFO\'s moduleName is wrong = %s".format(moduleName));
        var content = '';
        if (noyubiTip) {
            content = Lang.get('common_cost_noyubi_tip' + noyubiTip);
        } else if (tipType) {
            content = Lang.get('common_cost_yubi_tip' + tipType, {
                yubiCount: yubiCount,
                itemCount: itemCount,
                itemName: info.itemName[itemNameIndex],
                todo: info.todo
            });
        } else {
            content = Lang.get('common_cost_yubi_tip', {
                yubiCount: yubiCount,
                itemCount: itemCount,
                itemName: info.itemName[itemNameIndex],
                todo: info.todo
            });
        }
        UIPopupHelper.popupSystemAlert(null, content, callbackOk, null, function (popup: PopupSystemAlert) {
            popup.setModuleName(moduleName);
        })
    }
}
