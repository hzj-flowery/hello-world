const {ccclass, property} = cc._decorator;

import CommonVipNode from '../../../ui/component/CommonVipNode'

import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1'

import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { G_UserData, Colors, G_ConfigManager } from '../../../init';

@ccclass
export default class VipGiftPkgItemCell extends ListViewCellBase {

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
       type: cc.Node,
       visible: true
   })
   _nodeCondition: cc.Node = null;

   @property({
       type: CommonButtonSwitchLevel1,
       visible: true
   })
   _buttonReceive: CommonButtonSwitchLevel1 = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageReceive: cc.Sprite = null;

   @property({
       type: CommonVipNode,
       visible: true
   })
   _vipNode: CommonVipNode = null;
   
    _vipItemData: any;


    ctor() {
        UIHelper.addEventListener(this.node, this._buttonReceive._button, 'VipGiftPkgItemCell', '_onItemClick');
    }
    onInit(){
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        this.ctor();
        this._buttonReceive.switchToNormal();
        this._buttonReceive.setString(Lang.get('lang_activity_fund_receive'));
        this._itemList.setListViewSize(536, 98);
        this._itemList.setItemSpacing(6);
        this._itemList._listViewItem.enabled = false;
    }
    _onItemClick(sender, state) {

        // var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        // var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        // if (moveOffsetX < 20 && moveOffsetY < 20) {
            var curSelectedPos = this.getIdx();
            //logWarn('VipGiftPkgItemCell:_onIconClicked  ' + curSelectedPos);
            this.dispatchCustomCallback(curSelectedPos);
        //}
    }
    _createConditionRichText(richText) {
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._nodeCondition.removeAllChildren();
        this._nodeCondition.addChild(widget.node);
    }
    updateUI(vipItemData) {
        this._vipItemData = vipItemData;
        var vipLevel:number = vipItemData.getId();
        this._vipNode.setString(vipLevel.toString());
        this._updateVipButtonState();
        var itemList = vipItemData.getVipGiftList();
        this._itemList.updateUI(itemList, 1);
        var currentVipExp = G_UserData.getVip().getExp();
        var currentVipTotalExp = G_UserData.getVip().getCurVipTotalExp();
        var max = G_UserData.getVip().getVipTotalExp(0, vipLevel);
        var exp = Math.min(currentVipTotalExp, max);
        var richText = Lang.get('lang_vip_gift_pkg_progress', {
            progress: Math.floor(exp / 10),
            max: Math.floor(max / 10),
            titleColor: Colors.colorToNumber(exp < max && Colors.BRIGHT_BG_TWO || Colors.BRIGHT_BG_GREEN),
            progressColor: Colors.colorToNumber(Colors.BRIGHT_BG_GREEN),
            maxColor: Colors.colorToNumber(exp < max && Colors.BRIGHT_BG_TWO || Colors.BRIGHT_BG_GREEN)
        });
        if (G_ConfigManager.checkCanRecharge()) {
            this._createConditionRichText(richText);
        }
    }
    _updateVipButtonState() {
        var currVipLevel = this._vipItemData.getId();
        var playerVipLevel = G_UserData.getVip().getLevel();
        if (currVipLevel > playerVipLevel) {
            this._nodeCondition.active = (true);
            this._imageReceive.node.active = (false);
            this._buttonReceive.setVisible(true);
            if (!G_ConfigManager.checkCanRecharge()) {
                this._buttonReceive.setString('未达成');
            }else {
                this._buttonReceive.setString(Lang.get('lang_vip_gift_pkg_go_recharge'));
            }
            this._buttonReceive.switchToHightLight();
            return;
        } else {
            if (G_UserData.getVip().isVipRewardTake(currVipLevel)) {
                this._nodeCondition.active = (false);
                this._imageReceive.node.active = (true);
                this._buttonReceive.setVisible(false);
                return;
            }
        }
        this._nodeCondition.active = (true);
        this._imageReceive.node.active = (false);
        this._buttonReceive.setVisible(true);
        this._buttonReceive.setString(Lang.get('lang_buy_gift'));
        this._buttonReceive.switchToNormal();
    }
}
