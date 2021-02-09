const { ccclass, property } = cc._decorator;
import PopupItemUse from "./PopupItemUse";
import { Lang } from "../lang/Lang";
import CommonSelectNumNode from "./component/CommonSelectNumNode";
import CommonResourceInfo from "./component/CommonResourceInfo";
import CommonIconTemplate from "./component/CommonIconTemplate";
import CommonNormalSmallPop from "./component/CommonNormalSmallPop";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { G_UserData } from "../init";
import UIHelper from "../utils/UIHelper";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { ShopConst } from "../const/ShopConst";

@ccclass
export class PopupShopItemBuy extends PopupItemUse {
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
    public static path:string = "common/PopupShopItemBuy";

    ctor(title,callback) {
        this._title = title || Lang.get('common_title_buy_item');
        this._callback = callback;
        this._useNum = 1;
    }
    onCreate() {
        super.onCreate();
        this._costResInfo2.node.active = (false);
    }
    _onNumSelect(num) {
        //logDebug('_onNumSelect :' + num);
        var oldNum = this._useNum;
        this._useNum = num;
        var [price1, type1, value1] = this._getItemPrice(1);
        var curNum1 = UserDataHelper.getNumByTypeAndValue(type1, value1);
        var onePrice = Math.floor(price1 / this._useNum);
        var canBuyNum = Math.floor(curNum1 / onePrice);
        if(this._useNum > canBuyNum){
            this._useNum = canBuyNum;
            this._selectNumNode.setAmount(canBuyNum);
            price1 = curNum1;
        }
        var [price2, type2, value2] = this._getItemPrice(2);
        if (value2 > 0) {
            var curNum2 = UserDataHelper.getNumByTypeAndValue(type2, value2);
            var onePrice2 = Math.floor(price2 / this._useNum);
            var canBuyNum2 = Math.floor(curNum2 / onePrice2);
            if(this._useNum > canBuyNum2){
                this._useNum = canBuyNum2;
                this._selectNumNode.setAmount(canBuyNum2);
                price2 = curNum2;
            }
            this.setCostInfo2(type2, value2, price2);
        }
        this.setCostInfo1(type1, value1, price1);
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
    updateUI(shopId,shopItemId) {
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
            if (itemCfg.num_ban_type == 1) {
                this.setTextTips(Lang.get('shop_buy_limit_final', { num: surplus }));
            } else if (itemCfg.num_ban_type == 5) {
                if (shopId == ShopConst.ALL_SERVER_GOLDHERO_SHOP) {
                    this.setTextTips(Lang.get('shop_condition_acticity_buynum', { num: surplus }));
                } else {
                    this.setTextTips(Lang.get('shop_condition_season_buynum', { num: surplus }));
                }
            } else {
                this.setTextTips(Lang.get('shop_buy_limit_day', { num: surplus }));
            }
        } else {
            this.setTextTips(' ');
        }
        this.setOwnerCount(itemOwnerNum);
        this._onNumSelect(this._useNum);
    }
    onBtnOk() {
        var isBreak;
        if (this._callback) {
            isBreak = this._callback(this._itemId, this._useNum);
        }
        if (!isBreak) {
            this.close();
        }
    }
    onBtnCancel(){
        super.onBtnCancel();
    }
    setCostInfo1(costType, costValue, costSize) {
        this._costResInfo1.updateUI(costType, costValue, costSize);
    }
    setCostInfo2(costType, costValue, costSize) {
        this._costResInfo2.updateUI(costType, costValue, costSize);
        this._costResInfo2.node.active = (true);
    }
}
