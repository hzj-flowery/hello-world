
import { G_ServerTime, G_Prompt, G_UserData, G_ConfigLoader } from "../../../init";
import { handler } from "../../../utils/handler";
import EventHalfPriceCell from "./EventHalfPriceCell";
import { Util } from "../../../utils/Util";
import { Lang } from "../../../lang/Lang";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { ExploreData } from "../../../data/ExploreData";
import { ExploreEventData } from "../../../data/ExploreEventData";
import { ConfigNameConst } from "../../../const/ConfigNameConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EventHalfPriceNode extends cc.Component {

    static ITEM_COUNT = 3;

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _countDownNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _leftTimeLabel: cc.Label = null;

    private _eventData: ExploreEventData;
    private _configData;
    private _itemIds: any[];
    private _cells: EventHalfPriceCell[];
    private _buyIndex;

    setUp(eventData) {
        this._eventData = eventData;
        this._configData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(eventData.getEvent_type());
        this._itemIds = [
            eventData.getValue1(),
            eventData.getValue2(),
            eventData.getValue3()
        ];
        this._cells = [];

        this._setItem();
        this._refreshButton();
        this.schedule(handler(this, this._onTimer), 0.5, cc.macro.REPEAT_FOREVER);
        this._setTalk();
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');
    }
    onDestroy() {
        this.unschedule(this._onTimer);
    }
    _setItem() {
        for (var i in this._itemIds) {
            var v = this._itemIds[i];
            var index: number = parseInt(i) + 1;
            var eventHalfPriceCell: EventHalfPriceCell = Util.getNode('prefab/exploreMap/EventHalfPriceCell', EventHalfPriceCell);
            eventHalfPriceCell.setUp(v, index, handler(this, this._buyItem));
            this['_node' + index].addChild(eventHalfPriceCell.node);
            this._cells.push(eventHalfPriceCell);
        }
    }
    //刷新按钮
    _refreshButton() {
        if (this._eventData.getValue4() == 1) {
            this._cells[0].setHasBuy();
        }
        if (this._eventData.getValue5() == 1) {
            this._cells[1].setHasBuy();
        }
        if (this._eventData.getValue6() == 1) {
            this._cells[2].setHasBuy();
        }
    }
    //设置说话
    _setTalk() { }
    //购买物品
    _buyItem(buyIndex, data) {
        var endTime = this._eventData.getEndTime();
        var curTime = G_ServerTime.getTime();
        if (curTime > endTime) {
            G_Prompt.showTip(Lang.get('explore_event_time_over'));
            return;
        }
        this._buyIndex = buyIndex;
        var success = UserCheck.enoughValue(data.type1, data.value1, data.size1);
        if (success) {
            G_UserData.getExplore().c2sExploreDoEvent(this._eventData.getEvent_id(), this._buyIndex);
        }
    }
    //处理事件
    doEvent() { 
        var eventData: ExploreEventData = G_UserData.getExplore().getEventById(this._eventData.getEvent_id());
        if (!eventData) return;
        this._eventData = eventData;
        if (this._buyIndex == 1) {
            eventData.setValue4(1);
        } else if (this._buyIndex == 2) {
            eventData.setValue5(1);
        } else if (this._buyIndex == 3) {
            eventData.setValue6(1);
        }
        if (eventData.getValue4() == 1 && eventData.getValue5() == 1 && eventData.getValue6() == 1) {
            eventData.setParam(1);
        }
        this._cells[this._buyIndex - 1].setHasBuy();
    }
    _onTimer() { 
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');
    }

}