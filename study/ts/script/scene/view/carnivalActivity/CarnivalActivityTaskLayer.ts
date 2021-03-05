import ViewBase from "../../ViewBase";
import { G_Prompt, G_UserData, G_ConfigLoader, G_GameAgent } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { CustomActivityConst } from "../../../const/CustomActivityConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";
import { table } from "../../../utils/table";
import { UserCheck } from "../../../utils/logic/UserCheck";
import PopupBase from "../../../ui/PopupBase";
import PopupSelectReward from "../../../ui/PopupSelectReward";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import CarnivalActivityTaskCell from "./CarnivalActivityTaskCell";
import { handler } from "../../../utils/handler";
import { CarnivalActivityUIHelper } from "./CarnivalActivityUIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CarnivalActivityTaskLayer extends ViewBase {

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property(cc.Prefab)
    CarnivalActivityTaskCell: cc.Prefab = null;

    _actType: any;
    _curQuests: any;
    _questType: any;


    ctor(actType, questType) {
        this._actType = actType;
        this._questType = questType;
    }

    onCreate() {
        this._initListView(this._actType, this._questType);
    }
    onEnter() {

    }
    onExit() {

    }
    _initListView(actType, questType) {
        this._listView.setTemplate(this.CarnivalActivityTaskCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    _onListViewItemUpdate(item, index) {
        if (item) {
            item.updateInfo(this._curQuests[index]);
        }
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, params) {
        var clickIndex = index + 1;
        var data = this._curQuests[clickIndex - 1];
        if (!data) {
            return;
        }
        var actData = data.actUnitData;
        if (!actData.isActValid()) {
            G_Prompt.showTip(Lang.get('lang_carnival_activity_award_end'));
            return;
        }
        var questData = data.actTaskUnitData;
        var canReceive = questData.isQuestCanReceive();
        var hasReceive = questData.isQuestHasReceive();
        var reachReceiveCondition = questData.isQuestReachReceiveCondition();
        var hasLimit = questData.checkQuestReceiveLimit();
        var timeLimit = !actData.checkActIsInReceiveTime();
        var functionId = questData.getQuestNotFinishJumpFunctionID();
        if (canReceive) {
            var sendFunc = function (actId, questId, awardId, awardNum) {
                G_UserData.getCarnivalActivity().c2sGetCarnivalActivityAward(actId, questId, awardId, awardNum);
            };
            CarnivalActivityUIHelper.receiveReward(questData, sendFunc);
        } else if (hasReceive) {
        } else if (hasLimit || timeLimit) {
        } else {
            if (functionId != 0) {
                WayFuncDataHelper.gotoModuleByFuncId(functionId);
            } else if (questData.getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
                var payId = questData.getParam2();
                var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
                var payCfg = VipPay.get(payId);
                //assert((payCfg, 'vip_pay not find id ' + (payId));
                G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
            }
        }
    }
    _checkPkgFull(questData, index) {
        var rewards = questData.getRewardItems();
        var selectRewards = questData.getSelectRewardItems();
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
    }
    _showSelectRewarsPopup(questData) {
        function callBackFunction(awardItem, index) {
            if (awardItem == null) {
                G_Prompt.showTip(Lang.get('common_choose_item'));
                return true;
            }
            if (!this._checkPkgFull(questData, index)) {
                return;
            }
            var rewardIndex = index;
            G_UserData.getCarnivalActivity().c2sGetCarnivalActivityAward(questData.getAct_id(), questData.getQuest_id(), rewardIndex, null);
            return false;
        }
        var awardItems = questData.getSelectRewardItems();
        PopupBase.loadCommonPrefab('PopupSelectReward', (popup: PopupSelectReward) => {
            popup.ctor(Lang.get('days7activity_receive_popup'), callBackFunction);
            popup.setTip(Lang.get('days7activity_receive_popup_tip'));
            popup.updateUI(awardItems);
            popup.openWithAction();
        });
    }
    refreshView(activityData, resetListData) {
        this._curQuests = activityData.getShowQuests();
        //logWarn('----------------------- II');
        //logWarn(this._curQuests);
        //logWarn('----------------------- II2');
        this._listView.stopAutoScroll();
        this._listView.resize(this._curQuests.length);
        //this._listView.scrollToTop();
    }

}
