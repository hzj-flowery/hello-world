const { ccclass, property } = cc._decorator;
import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonListViewLineItem from "../../../ui/component/CommonListViewLineItem";
import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";
import { handler } from "../../../utils/handler";
import CommonListItem from "../../../ui/component/CommonListItem";
import { Lang } from "../../../lang/Lang";
import { Day7RechargeConst } from "../../../const/Day7RechargeConst";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";

@ccclass
export default class VipGiftPkgItemCell extends CommonListItem {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;
    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _itemList: CommonListViewLineItem = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonReceive: CommonButtonLevel1Highlight = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textProcess: cc.Label = null;


    onCreate() {
        this._buttonReceive.addClickEventListenerEx(handler(this, this._onButtonReceive));
        this._itemList.setListViewSize(536, 98);
        this._itemList.setItemSpacing(6);
        this._itemList._listViewItem.enabled = false;
    }

    updateUI(itemId, data) {
        var info = data.info;
        var curNum = Math.min(data.value, info.task_value_1);

        this._textTitle.string = (info.task_description as string).format(info.task_value_1);
        this._textProcess.string = Lang.get("day7_recharge_process", { curNum: curNum, totalNum: info.task_value_1 });
        var itemList = [];
        for (var i = 1; i <= 4; i++) {
            var iconType = info['type_' + i];
            var iconValue = info['value_' + i];
            var iconSize = info['size_' + i];
            if (iconType > 0 && iconValue > 0 && iconSize > 0) {
                itemList.push({
                    type: iconType,
                    value: iconValue,
                    size: iconSize
                })
            }
        }
        this._itemList.updateUI(itemList);
        if (data.state == Day7RechargeConst.RECEIVE_STATE_3) {
            this._buttonReceive.setVisible(false);
            this._imageReceive.node.active = true;
        } else {
            this._buttonReceive.setVisible(true);
            this._imageReceive.node.active = false;
            this._buttonReceive.setString(info.button_txt);
            if (data.state == Day7RechargeConst.RECEIVE_STATE_1) {
                this._buttonReceive.setEnabled(false);
                this._buttonReceive.showRedPoint(false);
            } else {
                this._buttonReceive.setEnabled(true);
                this._buttonReceive.showRedPoint(true);
            }
        }
    }

    _onButtonReceive() {
        this.dispatchCustomCallback(1)
    }
}