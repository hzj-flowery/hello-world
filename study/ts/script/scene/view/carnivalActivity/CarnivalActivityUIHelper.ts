import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { G_Prompt } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { table } from "../../../utils/table";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import PopupBase from "../../../ui/PopupBase";
import PopupSelectReward from "../../../ui/PopupSelectReward";
import { assert } from "../../../utils/GlobleFunc";
import PopupAlert from "../../../ui/PopupAlert";
import PopupItemExchange from "../../../ui/PopupItemExchange";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";

interface ICarnivalActivityUIHelper {
    _isSingleGoodExchange(actTaskUnitData): boolean;
    _checkRes(actTaskUnitData): boolean;
    _checkPkgFull(actTaskUnitData, index?): boolean;
    _hasGold(actTaskUnitData): any;
    _showSelectRewarsPopup(actTaskUnitData, sendFunc): void;
    popupExchangeItems(actTaskUnitData, sendFunc): void;
    receiveReward(actTaskUnitData, sendFunc): void;
    _getMaxBuyNum(consumeItems): number;
}
export var CarnivalActivityUIHelper = {} as ICarnivalActivityUIHelper;
CarnivalActivityUIHelper._isSingleGoodExchange = function (actTaskUnitData) {
    var fixRewards = actTaskUnitData.getRewardItems();
    var hasSelectRewards = actTaskUnitData.isSelectReward();
    return actTaskUnitData.isExchageType() && !hasSelectRewards;
};
CarnivalActivityUIHelper._checkRes = function (actTaskUnitData) {
    var items = actTaskUnitData.getConsumeItems();
    //dump(items);
    var canBuy = true;
    for (let k in items) {
        var v = items[k];
        if (v.type == TypeConvertHelper.TYPE_RESOURCE && v.value == DataConst.RES_JADE2) {
            canBuy = canBuy && LogicCheckHelper.enoughValue(v.type, v.value, v.size, true);
            if (!canBuy) {
                return canBuy;
            }
        } else {
            canBuy = canBuy && LogicCheckHelper.enoughValue(v.type, v.value, v.size, false);
            if (!canBuy) {
                G_Prompt.showTip(Lang.get('common_res_not_enough'));
                return canBuy;
            }
        }
    }
    return canBuy;
};
CarnivalActivityUIHelper._checkPkgFull = function (actTaskUnitData, index?) {
    var rewards = actTaskUnitData.getRewardItems();
    var selectRewards = actTaskUnitData.getSelectRewardItems();
    if (selectRewards && selectRewards[index]) {
        var newRewards = [];
        for (let k in rewards) {
            var v = rewards[k];
            table.insert(newRewards, v);
        }
        table.insert(newRewards, selectRewards[index]);
        rewards = newRewards;
    }
    var full = UserCheck.checkPackFullByAwards(rewards);
    return !full;
};
CarnivalActivityUIHelper._hasGold = function (actTaskUnitData) {
    var items = actTaskUnitData.getConsumeItems();
    for (let k in items) {
        var v = items[k];
        if (v.type == TypeConvertHelper.TYPE_RESOURCE || v.value == DataConst.RES_DIAMOND) {
            return v;
        }
    }
    return null;
};
CarnivalActivityUIHelper._showSelectRewarsPopup = function (actTaskUnitData, sendFunc) {
    function callBackFunction(awardItem, index, total) {
        function confirmFunction() {
            if (awardItem == null) {
                G_Prompt.showTip(Lang.get('recruit_choose_first'));
                return true;
            }
            if (!CarnivalActivityUIHelper._checkPkgFull(actTaskUnitData, index)) {
                return;
            }
            var rewardIndex = index + 1;
            if (actTaskUnitData.isActivityExpired()) {
                G_Prompt.showTip(Lang.get('customactivity_tips_already_finish'));
                return;
            }
            sendFunc(actTaskUnitData.getAct_id(), actTaskUnitData.getId(), rewardIndex, null);
        }
        var goldItem = CarnivalActivityUIHelper._hasGold(actTaskUnitData);
        if (goldItem) {
            var hintStr = Lang.get('customactivity_buy_confirm', { count: goldItem.size });
            UIPopupHelper.popupConfirm(hintStr, confirmFunction);
        } else {
            confirmFunction();
        }
    }
    var awardItems = actTaskUnitData.getSelectRewardItems();
    PopupBase.loadCommonPrefab('PopupSelectReward', (popup: PopupSelectReward) => {
        popup.ctor(Lang.get('days7activity_receive_popup'), callBackFunction);
        popup.setTip(Lang.get('days7activity_receive_popup_tip'));
        popup.updateUI(awardItems);
        popup.openWithAction();
    });

};
CarnivalActivityUIHelper._getMaxBuyNum = function (consumeItems) {
    var maxNum = 9999;
    for (var k in consumeItems) {
        var v = consumeItems[k];
        var ownNum = UserDataHelper.getNumByTypeAndValue(v.type, v.value);
        var newMaxNum = Math.floor(ownNum / v.size);
        maxNum = maxNum > newMaxNum && newMaxNum || maxNum;
    }
    return maxNum;
};
CarnivalActivityUIHelper.popupExchangeItems = function (actTaskUnitData, sendFunc) {
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
    function callBackFunction(exchangeItem, consumeItems, buyCount) {
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
        if (actTaskUnitData.isActivityExpired()) {
            G_Prompt.showTip(Lang.get('customactivity_tips_already_finish'));
            return;
        }
        sendFunc(actTaskUnitData.getAct_id(), actTaskUnitData.getId(), null, buyCount);
    }
    var [isFull, leftCount] = LogicCheckHelper.isPackFull(item.type, item.value);
    if (isFull == true) {
        return;
    }
    var maxCanBuyNum = CarnivalActivityUIHelper._getMaxBuyNum(consumeItems);
    surplus = surplus > maxCanBuyNum && maxCanBuyNum || surplus;
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
            PopupBase.loadCommonPrefab('PopupAlert', (popupAlert: PopupAlert) => {
                popupAlert.init(title, content, callbackOK);
                popupAlert.openWithAction();
            });
        } else {
            callBackFunction(item, consumeItems, 1);
        }
        return;
    }
    PopupBase.loadCommonPrefab('PopupItemExchange', (popup: PopupItemExchange) => {
        popup.ctor(Lang.get('common_title_exchange_item'), callBackFunction);
        popup.openWithAction();
        popup.updateUI(item, consumeItems, surplus);
        popup.setMaxLimit(Math.min(surplus, leftCount));

    });
};
CarnivalActivityUIHelper.receiveReward = function (actTaskUnitData, sendFunc) {
    if (!CarnivalActivityUIHelper._checkRes(actTaskUnitData)) {
        return;
    }
    if (CarnivalActivityUIHelper._isSingleGoodExchange(actTaskUnitData)) {
        CarnivalActivityUIHelper.popupExchangeItems(actTaskUnitData, sendFunc);
        return;
    }
    if (actTaskUnitData.isSelectReward()) {
        CarnivalActivityUIHelper._showSelectRewarsPopup(actTaskUnitData, sendFunc);
        return;
    }
    if (CarnivalActivityUIHelper._checkPkgFull(actTaskUnitData)) {
        sendFunc(actTaskUnitData.getAct_id(), actTaskUnitData.getId(), null, null);
    }
};
