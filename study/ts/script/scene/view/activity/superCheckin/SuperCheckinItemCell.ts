const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../../ui/ListViewCellBase';
import { SuperCheckinConst } from '../../../../const/SuperCheckinConst';
import { G_UserData } from '../../../../init';
import { handler } from '../../../../utils/handler';
import { Lang } from '../../../../lang/Lang';
import UIHelper from '../../../../utils/UIHelper';

@ccclass
export default class SuperCheckinItemCell extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _cellItem1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _clickIndex1: cc.Node = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item1: CommonIconTemplate = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _selectImage1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _selectText1: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _cellItem2: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _clickIndex2: cc.Node = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item2: CommonIconTemplate = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _selectImage2: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _selectText2: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _cellItem3: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _clickIndex3: cc.Node = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item3: CommonIconTemplate = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _selectImage3: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _selectText3: cc.Label = null;


    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._registerClickEventlistener();
    }
    _registerClickEventlistener() {
        for (var index = 1; index<=SuperCheckinConst.CELLITEM_NUM; index++) {
            var cellItem = this['_cellItem' + index];
            var click = this['_clickIndex' + index];
            if (cellItem && click) {
                cellItem.active = (false);
                //click.addClickEventListenerEx(handler(this, this._selectItem));
                (click as cc.Node).on('touchend', this._selectItem, this, true);
                //click._touchListener.setSwallowTouches(false);
            }
        }
    }
    updateItem(index:number, data, cellIndex:number, isTodayCheckined) {
        this['_cellItem' + index].active = (true);
        this['_clickIndex' + index].name = (index + cellIndex * SuperCheckinConst.CELLITEM_NUM).toString();
       // this['_clickIndex' + index].setTag(index + cellIndex * SuperCheckinConst.CELLITEM_NUM);
        this['_item' + index].unInitUI();
        this['_item' + index].initUI(data.type, data.value, data.size);
        this['_item' + index].setTouchEnabled(isTodayCheckined);
        this['_selectImage' + index].node.active = (data.selected);
        var desc = data.selected && Lang.get('lang_activity_super_checkin_select') || Lang.get('lang_activity_super_checkin_not_select');
        this['_selectText' + index].string = (desc);
    }
    updateUI(cellIndex, cellData:any[]) {
        for (var index = 1; index<=SuperCheckinConst.CELLITEM_NUM; index++) {
            this['_cellItem' + index].active = (false);
        }
        var isTodayCheckined = G_UserData.getActivitySuperCheckin().isTodayCheckin();

        for (let itemIndex=1; itemIndex<=cellData.length; itemIndex++) {
            var itemData = cellData[itemIndex-1];
            this.updateItem(itemIndex, itemData, cellIndex, isTodayCheckined);
        }
    }
    _selectItem(event:cc.Event.EventTouch) {
        var sender = event.target;
        var offsetX = Math.abs(event.getLocation().x - event.getPreviousLocation().x);
        var offsetY = Math.abs(event.getLocation().y - event.getPreviousLocation().y);
        if (SuperCheckinConst.MOVE_OFFSET > offsetX && SuperCheckinConst.MOVE_OFFSET > offsetY) {
            var curSelectedPos = parseInt(sender.name);
            this.dispatchCustomCallback(curSelectedPos);
        }
    }
}
