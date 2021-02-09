import PopupBase from "../PopupBase";
import CommonNormalMidPop from "../component/CommonNormalMidPop";
import CommonButtonLevel0Normal from "../component/CommonButtonLevel0Normal";
import CommonButtonLevel0Highlight from "../component/CommonButtonLevel0Highlight";
import CommonResourceInfo from "../component/CommonResourceInfo";
import CommonIconTemplate from "../component/CommonIconTemplate";
import { handler } from "../../utils/handler";
import { Lang } from "../../lang/Lang";
import { G_UserData, G_SignalManager, G_Prompt } from "../../init";
import { DataConst } from "../../const/DataConst";
import { assert } from "../../utils/GlobleFunc";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { SignalConst } from "../../const/SignalConst";
import { LogicCheckHelper } from "../../utils/LogicCheckHelper";
import CommonNormalMiniPop from "../component/CommonNormalMiniPop";
import { ShopConst } from "../../const/ShopConst";
const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupItemBuyUse extends PopupBase{

    @property({ type: CommonNormalMiniPop, visible: true })
    _commonNodeBk: CommonNormalMiniPop = null;

    @property({ type: cc.Label, visible: true })
    _itemName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _itemDesc: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _itemOwnerCount: cc.Label = null;


    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnBuy: CommonButtonLevel0Normal= null;


    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnUse: CommonButtonLevel0Highlight= null;

    @property({ type: CommonResourceInfo, visible: true })
    _buyCostResInfo: CommonResourceInfo= null;

    @property({ type: cc.Label, visible: true })
    _itemOwnerDesc: cc.Label= null;

    @property({ type: CommonIconTemplate, visible: true })
    _itemIcon: CommonIconTemplate= null;



   private _callback:any;
   private _itemType:number;
   private _itemId:number;
   private _shopItemData:any;
   private _maxUserNum:number;
   private _itemNum:number;
   private _signalBuyShopGoods:any;
   private _signalUseItemMsg:any;

   setInitData(callback) {
        this._callback = callback;
        // this._itemType = null;
        // this._itemId = null;
        // this._shopItemData = null;
        // this._maxUserNum = 0;
        // this._itemNum = 0;
        // this._itemName = null;
        // this._itemDesc = null;
        // this._itemIcon = null;
        // this._itemOwnerDesc = null;
        // this._itemOwnerCount = null;
        // this._buyCostResInfo = null;
        // var resource = {
        //     file: Path.getCSB('PopupItemBuyUse', 'common'),
        //     binding: {
        //         _btnBuy: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onBtnBuy'
        //                 }]
        //         }
        //         _btnUse: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onBtnUse'
        //                 }]
        //         }
        //     }
        // };
    }
    onCreate() {
        this.setClickOtherClose(true);
        this._btnBuy.setString(Lang.get('common_btn_buy'));
        this._btnUse.setString(Lang.get('common_btn_use'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnClose));
        this._commonNodeBk.hideBtnBg();
        this._btnBuy.addClickEventListenerEx(handler(this,this._onBtnBuy));
        this._btnUse.addClickEventListenerEx(handler(this,this._onBtnUse));
    }
    updateUI(itemType, itemId) {
        this._itemId = itemId;
        this._itemType = itemType;
        this._shopItemData = G_UserData.getShops().getFixShopGoodsByResId(ShopConst.NORMAL_SHOP, this._itemType, this._itemId);
        this._itemIcon.unInitUI();
        this._itemIcon.initUI(itemType, itemId);
        this._itemIcon.setTouchEnabled(false);
        this._itemIcon.setImageTemplateVisible(true);
        var itemParams = this._itemIcon.getItemParams();
        this._itemName.string = (itemParams.name);
        this._itemName.node.color = (itemParams.icon_color);
        this._itemDesc.string = (itemParams.cfg.description);
        var resName = DataConst.getItemName(itemId);
        var title = Lang.get('common_item_buy_use_titles')[resName];
      //assert((title, 'PopupItemBuyUse not find title itemId:' + (itemId));
        this._commonNodeBk.setTitle(title);
        var itemNum = UserDataHelper.getNumByTypeAndValue(itemType, itemId);
        this.setOwnerCount(itemNum);
        var maxValue = UserDataHelper.getResItemMaxUseNum(itemId);
        this._maxUserNum = Math.min(maxValue, itemNum);
        this._itemNum = itemNum;
        var canUse = this._maxUserNum != -1;
        if (!this._shopItemData) {
            this._btnBuy.setString(Lang.get('common_btn_buy'));
            this._btnBuy.setEnabled(false);
            this._buyCostResInfo.node.active = (false);
        } else {
            var remainCount = this._shopItemData.getVipBuyTimes() - this._shopItemData.getBuyCount();
            this._btnBuy.setEnabled(true);
            this._btnBuy.setString(Lang.get('common_item_buy_use_times_hint', { value: remainCount }));
            var [price1, type1, value1] = this._getItemPrice(1, 1);
            this._buyCostResInfo.updateUI(type1, value1, price1);
            this._buyCostResInfo.node.active = (true);
        }
    }
    _getItemPrice(index, useNum) {
        index = index || 1;
        var shopItemData = this._shopItemData;
        var itemCfg = shopItemData.getConfig();
        var buyCount = shopItemData.getBuyCount();
        var itemPrice = itemCfg[cc.js.formatStr('price%d_size', index)];
        var itemPriceAdd = itemCfg[cc.js.formatStr('price%d_add', index)];
        var itemPriceValue = itemCfg[cc.js.formatStr('price%d_value', index)];
        var itemPriceType = itemCfg[cc.js.formatStr('price%d_type', index)];
        if (itemPriceAdd > 0) {
            itemPrice = UserDataHelper.getTotalPriceByAdd(itemPriceAdd, buyCount, useNum);
        } else {
            itemPrice = itemPrice * useNum;
        }
        return [
            itemPrice,
            itemPriceType,
            itemPriceValue
        ];
    }
    setOwnerCount(count) {
        this._itemOwnerCount.string = ('' + count);
    }
    onEnter() {
        this._signalBuyShopGoods = G_SignalManager.add(SignalConst.EVENT_BUY_ITEM, handler(this, this._onEventBuyItem));
        this._signalUseItemMsg = G_SignalManager.add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(this, this._onEventUseItem));
    }
    onExit() {
        this._signalBuyShopGoods.remove();
        this._signalBuyShopGoods = null;
        this._signalUseItemMsg.remove();
        this._signalUseItemMsg = null;
    }
    _onEventBuyItem(eventName) {
        this.updateUI(this._itemType, this._itemId);
    }
    _onEventUseItem(eventName) {
        this.updateUI(this._itemType, this._itemId);
    }
    _onBtnBuy() {
        if (!this._checkShopBuyRes(this._itemType, this._itemId)) {
            return;
        }
        var [isFull, leftCount] = LogicCheckHelper.isPackFull(this._itemType, this._itemId);
        if (isFull == true) {
            return;
        }
        var callBackFunction = function () {
            var shopItemData = this._shopItemData;
            if (LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, false)[0] == false) {
                G_Prompt.showTip(Lang.get('common_diamond_not_enough_tip'));
                return;
            }
            G_UserData.getShops().c2sBuyShopGoods(shopItemData.getGoodId(), shopItemData.getShopId(), 1);
        }.bind(this)
        callBackFunction();
    }
    _checkShopBuyRes(itemType, itemValue) {
        var success = LogicCheckHelper.shopCheckShopBuyRes(itemType, itemValue, true);
        return success;
    }
    _onBtnUse() {
        if (this._itemNum <= 0) {
            if (this._itemId == DataConst.ITEM_VIT) {
                G_Prompt.showTip(Lang.get('common_use_vit_no_have'));
            }
            if (this._itemId == DataConst.ITEM_SPIRIT) {
                G_Prompt.showTip(Lang.get('common_use_spirit_no_have'));
            }
            // if (this._itemId == DataConst.ITEM_ARMY_FOOD) {
            //     G_Prompt.showTip(Lang.get('common_use_armyfood_no_have'));
            // }
            return;
        }
        if (this._maxUserNum == -1) {
            G_Prompt.showTip(Lang.get('common_item_not_use'));
            return;
        }
        if (this._maxUserNum == 0) {
            if (this._itemId == DataConst.ITEM_VIT) {
                G_Prompt.showTip(Lang.get('common_use_vit_max'));
            }
            if (this._itemId == DataConst.ITEM_SPIRIT) {
                G_Prompt.showTip(Lang.get('common_use_spirit_max'));
            }
            // if (this._itemId == DataConst.ITEM_ARMY_FOOD) {
            //     G_Prompt.showTip(Lang.get('common_use_armyfood_max'));
            // }
            return;
        }
        G_UserData.getItems().c2sUseItem(this._itemId, 1, 0, 0);
        cc.warn('confirm PopupBuyOnce item id is id: ' + (this._itemId + '  count: 1'));
    }
    _onBtnClose() {
        if (this._callback) {
            this._callback(this._itemId);
        }
        this.close();
    }
}