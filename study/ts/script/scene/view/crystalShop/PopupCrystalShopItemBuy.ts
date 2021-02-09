const {ccclass, property} = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonSelectNumNode from '../../../ui/component/CommonSelectNumNode'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonIconTemplateWithBg from '../../../ui/component/CommonIconTemplateWithBg'

import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop'
import PopupItemUse from '../../../ui/PopupItemUse';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class PopupCrystalShopItemBuy extends PopupItemUse {
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


    _shopItemData: any;

    static path:string = 'crystalShop/PopupCrystalShopItemBuy';


    ctor(title, callback) {
        this._title = title || Lang.get('common_title_buy_item');
        this._callback = callback;
        this._useNum = 1;
    }
    onCreate() {
        super.onCreate();
        this._costResInfo2.setVisible(false);
    }
    onEnter() {
    }
    onExit() {
    }
    _onNumSelect(num) {
        //logDebug('_onNumSelect :' + num);
        this._useNum = num;
        var [price1, type1, value1] = this._getItemPrice(1);
        this.setCostInfo1(type1, value1, price1);
        var [price2, type2, value2] = this._getItemPrice(2);
        if (value2 > 0) {
            this.setCostInfo2(type2, value2, price2);
        }
    }
    _getItemPrice(index) {
        index = index || 1;
        var itemCfg = this._shopItemData.getConfig();
        var itemPriceType = itemCfg[Util.format('price_type_%d', index)];
        if (itemPriceType == 0) {
            return [
                0,
                0,
                0
            ];
        }
        var itemPriceValue = itemCfg[Util.format('price_value_%d', index)];
        var itemPrice = itemCfg[Util.format('price_size_%d', index)];
        itemPrice = itemPrice * this._useNum;
        return [
            itemPrice,
            itemPriceType,
            itemPriceValue
        ];
    }
    _fixMaxLimit() {
        var leftBuyCount = this._shopItemData.getLeftBuyCount();
        var cfg = this._shopItemData.getConfig();
        var max = 99999;
        for (var i = 1; i<=2; i++) {
            if (cfg['price_value_' + i] != 0) {
                var num = UserDataHelper.getNumByTypeAndValue(cfg['price_type_' + i], cfg['price_value_' + i]);
                num = Math.floor(num / cfg['price_size_' + i]);
                if (num < max) {
                    max = num;
                }
            }
        }
        if (leftBuyCount > 0 && leftBuyCount < max) {
            max = leftBuyCount;
        }
        this.setMaxLimit(max);
    }
    updateUI(shopItemData) {
        this._shopItemData = shopItemData;
        var leftBuyCount = shopItemData.getLeftBuyCount();
        var itemCfg = shopItemData.getConfig();
        var itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemCfg.good_type, itemCfg.good_value);
        super.updateUI(itemCfg.good_type, itemCfg.good_value, itemCfg.good_size);
        if (leftBuyCount > 0) {
            this.setTextTips(Lang.get('lang_crystal_shop_buy_limit_final', { num: leftBuyCount }));
        } else {
            this.setTextTips(' ');
        }
        this._fixMaxLimit();
        this.setOwnerCount(itemOwnerNum);
        this._onNumSelect(this._useNum);
    }
    onBtnOk() {
        var isBreak;
        if (this._callback) {
            isBreak = this._callback(this._shopItemData, this._useNum);
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
        this._costResInfo2.setVisible(true);
    }

}
