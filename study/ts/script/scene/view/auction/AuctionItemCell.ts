const { ccclass, property } = cc._decorator;

import CommonIconTemplateWithBg from '../../../ui/component/CommonIconTemplateWithBg'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import CommonListItem from '../../../ui/component/CommonListItem';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { G_UserData, G_ServerTime, Colors } from '../../../init';
import { Path } from '../../../utils/Path';
import { DataConst } from '../../../const/DataConst';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class AuctionItemCell extends CommonListItem {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemName: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _commonResInfo1: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _commonResInfo2: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _commonAddPrice: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonBuy: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDesc: cc.Sprite = null;

    @property({
        type: CommonIconTemplateWithBg,
        visible: true
    })
    _commonIcon: CommonIconTemplateWithBg = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeDesc: cc.Label = null;

    _intervalTime: number = 0;
    _cellValue: any;

    onLoad() {
        this._commonBuy.addClickEventListenerEx(handler(this, this._onButtonBuy));
        this._commonAddPrice.addClickEventListenerEx(handler(this, this._onButtonAddPrice));

        this._commonAddPrice.setString(Lang.get('auction_item_cell_button1'));
        this._commonBuy.setString(Lang.get('auction_item_cell_button2'));
        this._imageDesc.node.active = (false);
    }
    updateUI(index, data) {
        if (data == null || data.getItem() == null) {
            return;
        }
        var item = data.getItem();
        if (item.type == 0) {
            return;
        }
        this._cellValue = data;
        var itemParams = TypeConvertHelper.convert(item.type, item.value, item.size);
        if (itemParams == null) {
            return;
        }
        var nowBuyer = data.getNow_buyer();
        this._imageDesc.node.active = true;
        if (nowBuyer == G_UserData.getBase().getId()) {
            UIHelper.loadTexture(this._imageDesc, Path.getTextSignet('img_paimai02'));
        } else {
            UIHelper.loadTexture(this._imageDesc, Path.getTextSignet('img_paimai01'));
        }
        this._commonIcon.unInitUI();
        this._commonIcon.initUI(item.type, item.value, item.size);
        this._commonIcon.setImageTemplateVisible(true);
        this._commonIcon.setTouchEnabled(true);
        this._textItemName.string = (itemParams.name);
        this._textItemName.node.color = (itemParams.icon_color);

        if (itemParams.cfg.color == 7) {
            UIHelper.enableOutline(this._textItemName, itemParams.icon_color_outline, 2);
        } else {
            UIHelper.disableOutline(this._textItemName);
        }
        var currPrice = data.getNow_price();
        if (currPrice == 0) {
            currPrice = data.getInit_price();
            this._imageDesc.node.active = false;
        }

        var moneyType = data.getMoney_type();
        var value;
        if (moneyType == 0) {
            value = DataConst.RES_DIAMOND;
        } else {
            value = DataConst.RES_JADE2;
        }

        this._commonResInfo1.updateUI(TypeConvertHelper.TYPE_RESOURCE, value, currPrice);
        this._commonResInfo1.setTextColorToATypeColor();
        var finalPrice = data.getFinal_price();
        this._commonResInfo2.updateUI(TypeConvertHelper.TYPE_RESOURCE, value, finalPrice);
        this._commonResInfo2.setTextColorToATypeColor();
        this._updateCellTime();
    }
    _updateCellTime() {
        var data = this._cellValue;
        var startTime = data.getStart_time();
        var endTime = data.getEnd_time();
        var timeLeft = G_ServerTime.getLeftSeconds(startTime);
        if (timeLeft > 0) {
            var leftTimeStr = G_ServerTime.getLeftSecondsString(startTime);
            this._textTime.string = (leftTimeStr);
            this._textTime.node.color = (Colors.SYSTEM_TARGET);
            this._textTimeDesc.string = (Lang.get('auction_cell1'));
        } else {
            var leftTimeStr = G_ServerTime.getLeftSecondsString(endTime);
            this._textTime.string = (leftTimeStr);
            this._textTime.node.color = (Colors.SYSTEM_TARGET_RED);
            this._textTimeDesc.string = (Lang.get('auction_cell2'));
        }
    }
    update(dt) {
        if (this.node.active == false) {
            return;
        }
        this._intervalTime = this._intervalTime + dt;
        if (this._intervalTime > 1 && this._cellValue) {
            this._updateCellTime();
            this._intervalTime = 0;
        }
    }
    _onButtonBuy(sender) {
        var userId = sender.getTag();
        var itemId = this._cellValue.getId();
        this.dispatchCustomCallback(this._cellValue, 2);
    }
    _onButtonAddPrice(sender) {
        var userId = sender.getTag();
        var itemId = this._cellValue.getId();
        this.dispatchCustomCallback(this._cellValue, 1);
    }

}