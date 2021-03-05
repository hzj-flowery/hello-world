import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import UIHelper from "../../../utils/UIHelper";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { G_NetworkManager, G_UserData } from "../../../init";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { ComponentIconHelper } from "../../../ui/component/ComponentIconHelper";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonPriceDiscountInfo2 from "../../../ui/component/CommonPriceDiscountInfo2";
import CommonPriceShowInfo2 from "../../../ui/component/CommonPriceShowInfo2";
import ListViewCellBase from "../../../ui/ListViewCellBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VipGiftPkgNode extends cc.Component {

    @property({
        type:CommonCustomListViewEx,
        visible:true

    })
    _listViewItems:CommonCustomListViewEx = null;

    @property({
        type:CommonButtonLevel0Highlight,
        visible:true

    })
    _btnBuyVipGift:CommonButtonLevel0Highlight = null;

    @property({
        type:CommonPriceShowInfo2,
        visible:true

    })
    _textOriginalPrice:CommonPriceShowInfo2 = null;

    @property({
        type:CommonPriceDiscountInfo2,
        visible:true

    })
    _textDiscountPrice:CommonPriceDiscountInfo2 = null;

    @property({
        type:cc.Label,
        visible:true

    })
    _giftPkgName:cc.Label = null;

    _vipItemData:any;

    onLoad() {
        UIHelper.addEventListener(this.node, this._btnBuyVipGift._button, 'VipGiftPkgNode', '_onBuyGiftClick');
    }
    _onBuyGiftClick() {
        //logDebug(' VipPrivilegeView:_onBuyGiftClick() ');
        var config = this._vipItemData.getInfo();
        var [success, popFunc] = LogicCheckHelper.enoughCash(config.price);
        if (success == true) {
            this._sendBuyVipGift();
        } else if (popFunc) {
            popFunc();
        }
    }
    _sendBuyVipGift() {
        if (!this._vipItemData) {
            return;
        }
        var vipLevel = this._vipItemData.getId();
        //dump(vipLevel);
        var message = { vip_level: vipLevel || 0 };
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetVipReward, message);
    }
    updateUI(vipItemData) {
        var vipLevel = vipItemData.getId();
        this._vipItemData = vipItemData;
        this._listViewItems.clearAll();
        this._textDiscountPrice.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, vipItemData.getNewPrice());
        this._textOriginalPrice.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, vipItemData.getVipPrePrice());
        this._textDiscountPrice.showDiscountLine(false);
        this._textOriginalPrice.showDiscountLine(true);
        var privilegeList = vipItemData.getVipPrivilegeList();
        var itemList:any[] = vipItemData.getVipGiftList();
        for (var i=0; i<itemList.length; i++) {
            var itemData = itemList[i];
            var createIcon = ComponentIconHelper.createIcon(itemData.type, itemData.value, itemData.size);
            var widget = new cc.Node();
            widget.setContentSize(cc.size(98, 98));
            widget.addChild(createIcon);
            widget.addComponent(ListViewCellBase);
            createIcon.setPosition(49, 49);
            //createIcon.setTouchEnabled(true);
            //createIcon.showIconEffect();
            this._listViewItems.pushBackCustomItem(widget);
        }
        console.log("VipGiftPkgNode updateUI");
        this._giftPkgName.string = (Lang.get('lang_vip_gift_pkg_name', { num: this._vipItemData.getId() }));
        this._updateVipButtonState();
    }
    _updateVipButtonState() {
        var currVipLevel = this._vipItemData.getId();
        var playerVipLevel = G_UserData.getVip().getLevel();
        this._btnBuyVipGift.showRedPoint(false);
        if (currVipLevel > playerVipLevel) {
            this._btnBuyVipGift.setEnabled(false);
            this._btnBuyVipGift.setString(Lang.get('lang_vip_buy_gift_btn', { level: currVipLevel }));
            return;
        } else {
            if (G_UserData.getVip().isVipRewardTake(currVipLevel)) {
                this._btnBuyVipGift.setEnabled(false);
                this._btnBuyVipGift.setString(Lang.get('lang_vip_privilege_gift_buyed'));
                return;
            }
        }
        this._btnBuyVipGift.setString(Lang.get('lang_buy_gift'));
        this._btnBuyVipGift.setEnabled(true);
        this._btnBuyVipGift.showRedPoint(true);
    }
    
}
