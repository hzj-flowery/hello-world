const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import ViewBase from '../../ViewBase';
import { assert } from '../../../utils/GlobleFunc';
import { UserCheck } from '../../../utils/logic/UserCheck';
import UIHelper from '../../../utils/UIHelper';
import { ComponentIconHelper } from '../../../ui/component/ComponentIconHelper';
import { Path } from '../../../utils/Path';
import { Lang } from '../../../lang/Lang';
import { G_UserData } from '../../../init';
import { table } from '../../../utils/table';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import CommonIconBase from '../../../ui/component/CommonIconBase';

@ccclass
export default class Day7ActivityDiscountView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _itemParent: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _oldResIcon: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _oldPrice: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _newResIcon: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _newPrice: cc.Label = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnBuy: CommonButtonLevel0Highlight = null;


    static MAX_WIDTH = 384;
    static ITEM_GAP = 128;


    _data: any;


    onCreate() {
        UIHelper.addEventListener(this.node, this._btnBuy._button, 'Day7ActivityDiscountView', '_onBtnBuy');
    }
    onEnter(){

    }
    onExit(){

    }
    _createItem(tp, value, size) {
        var item = (ComponentIconHelper.createIcon(tp, value, size) as cc.Node).getComponent(CommonIconBase);
        item.showName(true, 98);
        item.setNameFontSize(20);
        item.addBgImageForName(Path.getUICommon('img_com_andi_wenzi'), 100, 6);
        item.setTouchEnabled(true);
        return item;
    }
    refreshDiscountView(data) {
      //assert((data != null, 'refreshDiscountView data is nil');
        this._data = data;
        this._newPrice.string = (data.gold_price);
        this._oldPrice.string = (data.show_price);
        this._itemParent.removeAllChildren();
        var items:Array<CommonIconBase> = [];
        for (var i = 1; i<=4; i++) {
            if (data['type_' + i] != 0 && data['value_' + i] != 0 && data['size_' + i] != 0) {
                var item = this._createItem(data['type_' + i], data['value_' + i], data['size_' + i]);
                table.insert(items, item);
            }
        }
        var itemNum = items.length;
        var left = (Day7ActivityDiscountView.MAX_WIDTH - (itemNum - 1) * Day7ActivityDiscountView.ITEM_GAP) / 2;
        for (let k=1; k<=items.length; k++) {
            var v = items[k-1];
            this._itemParent.addChild(v.node);
            v.node.x = (left + (k - 1) * Day7ActivityDiscountView.ITEM_GAP);
        }
        this._btnBuy.setString(Lang.get('days7activity_btn_buy'));
        var reachBuyCondition = G_UserData.getDay7Activity().isShopDiscountReachBuyCondition(data.id);
        var canBuy = G_UserData.getDay7Activity().isShopDiscountCanBuy(data.id);
        if (reachBuyCondition) {
            if (canBuy) {
                this._btnBuy.setEnabled(true);
            } else {
                this._btnBuy.setString(Lang.get('days7activity_btn_already_buy'));
                this._btnBuy.setEnabled(false);
            }
        } else {
            this._btnBuy.setEnabled(false);
        }
    }
    _onBtnBuy(sender) {
        if (!this._data) {
            return;
        }
        var data = this._data;
      //assert((data, 'Day7ActivityView buy null discount item ');
        var [isFull] = UserCheck.isPackFull(data.type_1, data.value_1);
        if (isFull) {
            return;
        }
        var [success, popFunc] = LogicCheckHelper.enoughCash(data.gold_price);
        if (success) {
            G_UserData.getDay7Activity().c2sSevenDaysShop(data.id);
        } else {
            popFunc();
        }
    }

}
