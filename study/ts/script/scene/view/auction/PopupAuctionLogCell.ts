const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import CommonListItem from '../../../ui/component/CommonListItem';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Lang } from '../../../lang/Lang';
import { DataConst } from '../../../const/DataConst';
import { Path } from '../../../utils/Path';
import { G_ServerTime } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { stringUtil } from '../../../utils/StringUtil';

@ccclass
export default class PopupAuctionLogCell extends CommonListItem {
    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPayDesc: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _comItemPrice: CommonResourceInfo = null;
    _cellValue: any;

    // onCreate() {
    //     var size = this._resourceNode.getContentSize();
    //     this.node.setContentSize(size.width, size.height);
    // }
    
    updateUI(index, data) {
        this._cellValue = data;
        var passTimeStr = this.getDHMS(data.deal_time);
        this._textTime.string = (passTimeStr);
        var item = data.item;
        var itemParams = TypeConvertHelper.convert(item.type, item.value, item.size);
        if (itemParams == null) {
            return;
        }
        this._textItemName.string = (itemParams.name);
        this._textItemName.node.color = (itemParams.icon_color);

        if (itemParams.cfg.color == 7) {
            UIHelper.enableOutline(this._textItemName, itemParams.icon_color_outline, 2);
        } else {
            UIHelper.disableOutline(this._textItemName);
        }
        this._comItemPrice.setVisible(false);
        this._textPayDesc.string = (Lang.get('auction_log_des' + data.price_type));
        if (data.price_type == 1 || data.price_type == 2) {
            var currPrice = data.price;
            this._comItemPrice.setVisible(true);
            if (data.money_type && data.money_type == 1) {
                this._comItemPrice.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2, currPrice);
            } else {
                this._comItemPrice.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, currPrice);
            }
            this._textPayDesc.node.setAnchorPoint(cc.v2(0, 0.5));
            this._textPayDesc.node.x = (407);
        } else {
            this._textPayDesc.node.setAnchorPoint(cc.v2(0.5, 0.5));
            this._textPayDesc.node.x = (500);
        }
        if (index % 2 == 1) {
            UIHelper.loadTexture(this._imageBG, Path.getCommonImage('img_com_board_list01a'));
        } else if (index % 2 == 0) {
            UIHelper.loadTexture(this._imageBG, Path.getCommonImage('img_com_board_list01b'));
        }
    }
    getDHMS(t) {
        var localdate = new Date(t * 1000);
        var localdate2 = new Date(G_ServerTime.getTime() * 1000);
        if (localdate.getDay() != localdate2.getDay()) {
            return Lang.get('auction_layday_DHMS').format(localdate.getHours(), localdate.getMinutes());
        }
        return Lang.get('auction_today_DHMS').format(localdate.getHours(), localdate.getMinutes());
    }

}