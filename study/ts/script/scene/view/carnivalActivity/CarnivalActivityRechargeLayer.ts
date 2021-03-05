import CarnivalActivityTaskLayer from "./CarnivalActivityTaskLayer";
import { handler } from "../../../utils/handler";
import { CustomActivityConst } from "../../../const/CustomActivityConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CarnivalActivityRechargeLayer extends CarnivalActivityTaskLayer {

    @property(cc.Prefab)
    actRechargeItemCell:cc.Prefab = null;
    @property(cc.Prefab)
    actiRechargeTaskCell:cc.Prefab = null;

    _activityData: any;


    onCreate() {
    }
    _initListView(actType?, questType?) {
        var ItemCell = null;
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE) {
            ItemCell = this.actRechargeItemCell;
        } else if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM) {
            ItemCell = this.actRechargeItemCell;
        } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
            ItemCell = this.actiRechargeTaskCell;
        } else {
            ItemCell = this.CarnivalActivityTaskCell;
        }
        this._listView.setTemplate(ItemCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    refreshView(activityData, resetListData) {
        this._activityData = activityData;
        this._initListView(this._activityData.getAct_type(), this._activityData.getQuest_type());
        this._curQuests = activityData.getShowQuests();
        this._listView.stopAutoScroll();
        this._listView.resize(this._curQuests.length);
        this._listView.scrollToTop();
    }
}
