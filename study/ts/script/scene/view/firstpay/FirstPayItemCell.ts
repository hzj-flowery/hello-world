const {ccclass, property} = cc._decorator;

import CommonButtonSwitchLevel0 from '../../../ui/component/CommonButtonSwitchLevel0'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class FirstPayItemCell extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item01: CommonIconTemplate = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item02: CommonIconTemplate = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item03: CommonIconTemplate = null;

   @property({
       type: CommonButtonSwitchLevel0,
       visible: true
   })
   _buttonReceive: CommonButtonSwitchLevel0 = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageReceive: cc.Sprite = null;

   _items:any[];
   _data:any;

    ctor() {
        this._items = [];
        UIHelper.addEventListener(this.node, this._buttonReceive._button, 'FirstPayItemCell', '_onItemClick');
    }
    onCreate() {
        this.ctor();
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width + this._resourceNode.x, size.height + this._resourceNode.y);
        this._buttonReceive.switchToNormal();
        this._items = [
            this._item01,
            this._item02,
            this._item03
        ];
    }
    _onItemClick(event:cc.Event, customEventData) {
        var sender = event.target;
        //if (state == ccui.TouchEventType.ended || !state) {
            // var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
            // var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
            // if (moveOffsetX < 20 && moveOffsetY < 20) {
                var curSelectedPos = this.getIdx();
                //logWarn('FirstPayItenCell:_onIconClicked  ' + curSelectedPos);
                this.dispatchCustomCallback(curSelectedPos);
            //}
        //}
    }
    _updateButtonState() {
        this._buttonReceive.setEnabled(true);
        var firstPayData = G_UserData.getActivityFirstPay();
        if (firstPayData.canReceive(this._data.id)) {
            this._imageReceive.node.active = (false);
            this._buttonReceive.setVisible(true);
            this._buttonReceive.setString(Lang.get('lang_buy_gift'));
            this._buttonReceive.switchToNormal();
        } else if (firstPayData.hasReceive(this._data.id)) {
            this._imageReceive.node.active = (true);
            this._buttonReceive.setVisible(false);
        } else {
            this._imageReceive.node.active = (false);
            this._buttonReceive.setVisible(true);
            this._buttonReceive.setString(Lang.get('lang_vip_gift_pkg_go_recharge'));
            this._buttonReceive.switchToHightLight();
        }
    }
    updateUI(data) {
        this._data = data;
        this._updateButtonState();
        var itemList = UserDataHelper.makeRewards(data, 3);
        for (let i in this._items) {
            var item = this._items[i];
            var itemData = itemList[i];
            if (itemData) {
                item.node.active = (true);
                item.unInitUI();
                item.initUI(itemData.type, itemData.value, itemData.size);
                item.setTouchEnabled(true);
                item.showIconEffect();
            } else {
                item.node.active = (false);
            }
        }
    }

}
