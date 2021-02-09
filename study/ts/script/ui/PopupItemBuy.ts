const {ccclass, property} = cc._decorator;

import CommonResourceInfo from './component/CommonResourceInfo'

import CommonSelectNumNode from './component/CommonSelectNumNode'

import CommonButtonLevel0Normal from './component/CommonButtonLevel0Normal'

import CommonButtonLevel0Highlight from './component/CommonButtonLevel0Highlight'

import CommonIconTemplate from './component/CommonIconTemplate'

import CommonNormalSmallPop from './component/CommonNormalSmallPop'
import PopupItemUse from './PopupItemUse';
import { Lang } from '../lang/Lang';
import UIHelper from '../utils/UIHelper';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { G_UserData } from '../init';

@ccclass
export default class PopupItemBuy extends PopupItemUse {

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _costResInfo1: CommonResourceInfo = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _costResInfo2: CommonResourceInfo = null;

   private _shopItemData:any;

   public static path:string = "common/PopupItemBuy";

    ctor(title, callback?) {
        this._title = title || Lang.get('common_title_buy_item');
        this._callback = callback;
        this._useNum = 1;
    }
    onCreate() {
        super.onCreate();
        this._costResInfo2.node.active = (false);
    }
    onEnter() {
        super.onEnter();
    }
    onExit() {
    }
    _onNumSelect(num, add?){
        add = add || false;
        //logDebug('_onNumSelect :' + num);
        this._useNum = num;
        var [price1, type1, value1] = this._getItemPrice(1);
        this.setCostInfo1(type1, value1, price1);
        var [price2, type2, value2] = this._getItemPrice(2);
        if (value2 > 0) {
            this.setCostInfo2(type2, value2, price2);
        }
        if (add && this.checkSlectNum(false)) {
            return;
        }
    }
    _getItemPrice(index) {
        index = index || 1;
        var itemCfg = this._shopItemData.getConfig();
        var buyCount = this._shopItemData.getBuyCount();
        var itemPrice = itemCfg[('price%d_size' as any).format(index)];
        var itemPriceAdd = itemCfg[('price%d_add' as any).format(index)];
        var itemPriceValue = itemCfg[('price%d_value' as any).format(index)];
        var itemPriceType = itemCfg[('price%d_type' as any).format(index)];
        if (itemPriceAdd > 0) {
            itemPrice = UserDataHelper.getTotalPriceByAdd(itemPriceAdd, buyCount, this._useNum);
        } else {
            itemPrice = itemPrice * this._useNum;
        }
        return [
            itemPrice,
            itemPriceType,
            itemPriceValue
        ];
    }
    updateUI(shopId, shopItemId) {
        var shopMgr = G_UserData.getShops();
        var shopItemData = shopMgr.getShopGoodsById(shopId, shopItemId);
        if (!shopItemData) {
            return;
        }
        this._shopItemData = shopItemData;
        var surplus = shopItemData.getSurplusTimes();
        var itemCfg = shopItemData.getConfig();
        var itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemCfg.type, itemCfg.value);
        super.updateUI(itemCfg.type, itemCfg.value, itemCfg.size);
        if (surplus > 0) {
            this.setMaxLimit(surplus);
        } else {
        }
        this.setOwnerCount(itemOwnerNum);
        this._onNumSelect(this._useNum);
    }
    onBtnOk() {
        if (!this.checkSlectNum(true)) {
            return;
        }
        var isBreak;
        if (this._callback) {
            isBreak = this._callback(this._itemId, this._useNum);
        }
        if (!isBreak) {
            this.close();
        }
    }
    setCostInfo1(costType, costValue, costSize) {
        this._costResInfo1.updateUI(costType, costValue, costSize);
    }
    setCostInfo2(costType, costValue, costSize) {
        this._costResInfo2.updateUI(costType, costValue, costSize);
        this._costResInfo2.node.active = (true);
    }
    setShopConst(shopType) {
        super.setShopConst(shopType);
    }

}