import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_UserData, G_ServerTime } from "../../../init";
import { DataConst } from "../../../const/DataConst";
import { TenJadeAuctionConfigHelper } from "./TenJadeAuctionConfigHelper";
import { TenJadeAuctionConst } from "../../../const/TenJadeAuctionConst";
import UIHelper from "../../../utils/UIHelper";
import CommonIconTemplateWithBg from "../../../ui/component/CommonIconTemplateWithBg";
import CommonListItem from "../../../ui/component/CommonListItem";

const { ccclass, property } = cc._decorator;
var PRICE_COLOR = {
    normal: cc.color(177, 83, 22),
    forcus: cc.color(255, 255, 255),
    outline: cc.color(210, 71, 35)
};
var TIME_COLOR = {
    normal: cc.color(221, 78, 21),
    forcus: cc.color(147, 7, 0)
};

@ccclass
export default class TenJadeAuctionCell extends CommonListItem {
    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _imageDesc: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _selectedBg: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _textPrice: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textTime: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textItemName: cc.Label = null;
    @property({ type: CommonIconTemplateWithBg, visible: true })
    _commonIcon: CommonIconTemplateWithBg = null;
    @property({ type: cc.Sprite, visible: true })
    _iconFocus: cc.Sprite = null;


    _data: any;
    _viewData: any;
    _intervalTime: any = 0;
    _index:number;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this.schedule(handler(this, this._updateTime), 1);
        this._imageDesc.node.active = (false);
    }
    onEnter() {
    }
    onExit() {
        this.unscheduleAllCallbacks();
    }
    setSelected(bSelected) {
        this._selectedBg.node.active = (bSelected);
        var item = this._data.getItem();
        if (item.type == 0) {
            return;
        }
        var itemParams = TypeConvertHelper.convert(item.type, item.value, item.size);
        if (bSelected) {
            this._textPrice.node.color = (PRICE_COLOR.forcus);
            this._textTime.node.color = (TIME_COLOR.forcus);
            UIHelper.enableOutline(this._textPrice, PRICE_COLOR.outline, 1);
            if (itemParams && itemParams.cfg.color == 6) {
                UIHelper.enableOutline(this._textItemName, cc.color(112, 3, 0), 2);
            }
        } else {
            UIHelper.disableOutline(this._textPrice);
            this._textPrice.node.color = (PRICE_COLOR.normal);
            this._textTime.node.color = (TIME_COLOR.normal);
            if (itemParams && itemParams.cfg.color == 6) {
                UIHelper.disableOutline(this._textItemName);
            }
        }
    }
    updateUI(index, data) {
        this._index = index;
        this._data = data.unitData;
        this._viewData = data.viewData;
        var data = this._data;
        if (data == null || data.getItem() == null) {
            return;
        }
        var item = data.getItem();
        if (item.type == 0) {
            return;
        }
        var itemParams = TypeConvertHelper.convert(item.type, item.value, item.size);
        if (itemParams == null) {
            return;
        }
        var nowBuyer = data.getNow_buyer();
        this._imageDesc.node.active = (nowBuyer == G_UserData.getBase().getId());
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
            this._imageDesc.node.active = (false);
        }
        var moneyType = data.getMoney_type();
        var value;
        if (moneyType == 0) {
            value = DataConst.RES_DIAMOND;
        } else {
            value = DataConst.RES_JADE2;
        }
        this._textPrice.string = (currPrice);
        this._updateFocus();
        this._updateSelected();
        var finalPrice = data.getFinal_price();
        this._updateCellTime();
    }
    _updateFocus() {
        if (this._data.getFocused() == 1) {
            this._focused();
        } else {
            this._notFocused();
        }
    }
    _updateSelected() {
        this.setSelected(this._viewData.selected == 1);
    }
    _focused() {
        this._iconFocus.node.active = (true);
    }
    _notFocused() {
        this._iconFocus.node.active = (false);
    }
    _updateCellTime() {
        var data = this._data;
        var startTime = data.getStart_time();
        var endTime = data.getEnd_time();
        var curTime = G_ServerTime.getTime();
        var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
        if (phase == TenJadeAuctionConst.PHASE_SHOW) {
            this._textTime.string = ('');
        } else if (phase == TenJadeAuctionConst.PHASE_ITEM_SHOW) {
            var startTime = G_UserData.getTenJadeAuction().getCurAuctionStartTime();
            var countDown = TenJadeAuctionConfigHelper.getCountDown();
            this._textTime.string = (G_ServerTime.getLeftMinSecStr(startTime + countDown));
        } else {
            var timeLeft = G_ServerTime.getLeftSeconds(startTime);
            if (timeLeft > 0) {
                var leftTimeStr = G_ServerTime.getLeftMinSecStr(startTime);
                this._textTime.string = (leftTimeStr);
            } else {
                var leftTimeStr = G_ServerTime.getLeftMinSecStr(endTime);
                this._textTime.string = (leftTimeStr);
            }
        }
    }
    _updateTime(dt) {
        if (this.node.active == false) {
            return;
        }
        this._intervalTime = this._intervalTime + dt;
        if (this._intervalTime > 1 && this._data) {
            this._updateCellTime();
            this._intervalTime = 0;
        }
    }
    onAddFocusTouched(sender, event) {
        var curAuctionInfo = G_UserData.getTenJadeAuction().getCurAuctionInfo();
        G_UserData.getTenJadeAuction().c2sCrossAuctionAddFocus(curAuctionInfo.getAuction_id(), this._data.getId(), this._data.getFocused() == 1 ? 0 : 1);
        this._updateFocus();
    }
    onItemTouched(sender, event) {
        this._customCallback(this._index, this, this._data, 1);
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}