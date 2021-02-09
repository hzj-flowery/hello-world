import CarnivalActivityTaskLayer from "./CarnivalActivityTaskLayer";
import { handler } from "../../../utils/handler";
import { CustomActivityConst } from "../../../const/CustomActivityConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CarnivalActivityExchangeLayer extends CarnivalActivityTaskLayer {
    @property(cc.Prefab)
    CarnivalActivityExchangeCell: cc.Prefab = null;
    @property(cc.Prefab)
    CarnivalActivityYuBiExchangeCell: cc.Prefab = null;
    _activityData: any;

    ctor(actType, questType) {
        this._actType = actType;
        this._questType = questType;
    }
    onInitCsb(resource) {
    }
    _initListView(actType, questType) {
        var ItemCell = null;
        if (questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE) {
            ItemCell = this.CarnivalActivityYuBiExchangeCell;
        } else {
            ItemCell = this.CarnivalActivityExchangeCell;
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
