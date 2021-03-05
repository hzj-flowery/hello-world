const { ccclass, property } = cc._decorator;

import CommonShopItemCell from '../../../ui/component/CommonShopItemCell'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { G_UserData, G_ServerTime, Colors } from '../../../init';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { ShopActiveDataHelper } from '../../../utils/data/ShopActiveDataHelper';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { handler } from '../../../utils/handler';

@ccclass
export default class GoldHeroShopItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonShopItemCell,
        visible: true
    })
    _item1: CommonShopItemCell = null;

    @property({
        type: CommonShopItemCell,
        visible: true
    })
    _item2: CommonShopItemCell = null;

    _data1: any;
    _data2: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._item1.setCallBack(handler(this, this.onClickButton1));
        this._item2.setCallBack(handler(this, this.onClickButton2));
    }

    updateUI(goodId1, goodId2,isExchange) {
        var updateNode = function (index, goodId,isExchange) {
            if (goodId) {
                this['_item' + index].node.active = (true);
                this['_item' + index].showIconTop();
                var data = G_UserData.getShopActive().getUnitDataWithId(goodId);
                this['_data' + index] = data;
                var info = data.getConfig();
                var param = TypeConvertHelper.convert(info.type, info.value);
                var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
                var isBought = data.isBought();
                var strButton = '';
                if (isExchange) {
                    strButton = Lang.get('shop_btn_exchange');
                } else {
                    strButton = isBought && Lang.get('shop_btn_buyed') || Lang.get('shop_btn_buy');
                }

                this['_item' + index]['_iconTemplate'].unInitUI();
                this['_item' + index]['_iconTemplate'].initUI(info.type, info.value, info.size);
                this['_item' + index]['_iconTemplate'].setTouchEnabled(true);
                this['_item' + index]['_text_item_name'].string = (param.name);
                this['_item' + index]['_text_item_name'].node.color = (param.icon_color);
                UIHelper.updateTextOutline(this['_item' + index]['_text_item_name'], param);
                if (info.type == TypeConvertHelper.TYPE_FRAGMENT) {
                    this._showFragmentNum(info.type, info.value, index);
                }
                for (var i = 1; i <= 2; i++) {
                    var cost = costInfo[i - 1];
                    if (cost) {
                        this['_item' + index]['_cost_Res' + i].node.active = (true);
                        this['_item' + index]['_cost_Res' + i].updateUI(cost.type, cost.value, cost.size);
                    } else {
                        this['_item' + index]['_cost_Res' + i].node.active = (false);
                    }
                }
                this['_item' + index]['_buttonOK'].setString(strButton);
                this._updateBtnEnable(index);
                this._updateDes(index);
                this._updateDiscount(info.discount, index);
            } else {
                this['_data' + index] = null;
                this['_item' + index].node.active = (false);
            }
        }.bind(this);
        updateNode(1, goodId1,isExchange);
        updateNode(2, goodId2,isExchange);
    }
    _updateBtnEnable(index) {
        var data = this['_data' + index];
        if (data) {
            var isBought = data.isBought();
            var isCanBuy = true;
            if (data.getConfig().limit_type == 1) {
                var startTime = G_UserData.getCakeActivity().getActivityStartTime();
                var targetTime = startTime + data.getConfig().limit_value;
                isCanBuy = data.isCanBuy({ limitTime: targetTime });
            }
            var enableBuy = !isBought && isCanBuy;
            this['_item' + index]['_buttonOK'].setEnabled(enableBuy);
        }
    }
    _updateDes(index) {
        var startTime = G_UserData.getCakeActivity().getActivityStartTime();
        var data = this['_data' + index];
        if (data) {
            if (data.getConfig().limit_type == 1) {
                var targetTime = startTime + data.getConfig().limit_value;
                var countDown = targetTime - G_ServerTime.getTime();
                if (countDown > 0) {
                    var timeString = G_ServerTime.getLeftDHMSFormatEx(targetTime);
                    this['_item' + index]['_text_button_desc'].string = (Lang.get('cake_activity_shop_buy_countdown_des', { time: timeString }));
                } else {
                    this._updateBtnEnable(index);
                    this._updateRestCount(index);
                }
            } else {
                this._updateRestCount(index);
            }
        } else {
            this['_item' + index]['_text_button_desc'].string = ('');
        }
    }
    _updateRestCount(index) {
        var data = this['_data' + index];
        var restCount = data.getRestCount();
        var des = '';
        if (data.getConfig().num_ban_type != 0) {
            if (restCount > 0) {
                des = Lang.get('cake_activity_shop_buy_count_limit_des', { count: restCount });
            } else {
                des = Lang.get('cake_activity_shop_buy_reach_limit_des');
            }
        }
        this['_item' + index]['_text_button_desc'].string = (des);
    }
    updateDes() {
        for (var i = 1; i <= 2; i++) {
            this._updateDes(i);
        }
    }
    _showFragmentNum(type, value, index) {
        this['_nodeFragment' + index].removeAllChildren();
        var itemParams = TypeConvertHelper.convert(type, value);
        var num = UserDataHelper.getNumByTypeAndValue(type, value);
        var textContent = this['_item' + index]['_text_item_name'].getVirtualRendererSize();
        var txtX = this['_item' + index]['_text_item_name'].node.getPosition().x;
        var txtY = this['_item' + index]['_text_item_name'].node.getPosition().y;
        this['_item' + index]['_nodeFragment'].active = (true);
        var richTextColor = Colors.BRIGHT_BG_TWO;
        if (num >= itemParams.cfg.fragment_num) {
            richTextColor = Colors.BRIGHT_BG_GREEN;
        } else {
            richTextColor = Colors.BRIGHT_BG_RED;
        }
        var richText = Lang.get('shop_fragment_limit', {
            num: num,
            color: Colors.colorToNumber(richTextColor),
            max: itemParams.cfg.fragment_num
        });
        var textFragment = RichTextExtend.createWithContent(richText);
        this['_item' + index]['_nodeFragment'].addChild(textFragment.node);
        textFragment.node.setAnchorPoint(cc.v2(0, 0.5));
        this['_item' + index]['_nodeFragment'].setPosition(txtX + textContent.width + 4, txtY);
    }
    _updateDiscount(discount, index) {
        if (discount > 0 && discount < 10) {
            UIHelper.loadTexture(this['_item' + index]['_image_discount'], Path.getDiscountImg(discount));
            this['_item' + index]['_image_discount'].node.active = (true);
        } else {
            this['_item' + index]['_image_discount'].node.active = (false);
        }
    }
    onClickButton1() {
        this.dispatchCustomCallback(1);
    }
    onClickButton2() {
        this.dispatchCustomCallback(2);
    }
}