const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from './CommonButtonLevel1Highlight'

import CommonResourceInfoList from './CommonResourceInfoList'

import CommonIconTemplate from './CommonIconTemplate'
import CommonShopItemCell from './CommonShopItemCell';
import { UserDataHelper } from '../../utils/data/UserDataHelper';
import UIHelper from '../../utils/UIHelper';
import { Path } from '../../utils/Path';
import { LogicCheckHelper } from '../../utils/LogicCheckHelper';
import { Lang } from '../../lang/Lang';
import { G_ConfigLoader, G_UserData, G_EffectGfxMgr } from '../../init';
import { ConfigNameConst } from '../../const/ConfigNameConst';
import { ShopHelper } from '../../scene/view/shop/ShopHelper';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import { DataConst } from '../../const/DataConst';
import { ShopConst } from '../../const/ShopConst';

@ccclass
export default class CommonShopItemCell2 extends CommonShopItemCell {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_newRemind: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textItemTimes: cc.Label = null;

     static NEW_REMIND_EFFECT = 'effect_xinpin_faguang';
     static NEW_REMIND_EFFECT_POS = cc.v2(64, 0);


    
    onLoad() {
        super.onLoad();
        this._image_newRemind.node.active = (false);
    }
    updateBackgroundImge(status) {
    }
    _updateFixDiscount(shopItem) {
        var discount = UserDataHelper.getFixShopDiscount(shopItem);
        if (discount > 1 && discount < 10) {
            UIHelper.loadTexture(this._image_discount, Path.getDiscountImg(discount));
            this._image_discount.node.active = (true);
        } else {
            this._image_discount.node.active = (false);
        }
    }
    // _updateFixButton(shopItem) {
    //     var [success, errorMsg, funcName] = LogicCheckHelper.shopFixBtnCheck(shopItem);
    //     var fixData = shopItem.getConfig();
    //     var type = fixData['price1_type'];
    //     var value = fixData['price1_value'];
    //     var size = fixData['price1_size'];
    //     var priceAdd = fixData['price1_add'];
    //     if (funcName == 'shopNumBanType') {
    //         this._buttonOK.setString(Lang.get('shop_btn_buyed'));
    //     } else {
    //         this._buttonOK.setString(Lang.get('shop_btn_buy'));
    //         if (type == ShopConst.NORMAL_SHOP_SUB_MONEY) {
    //             var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);//require('app.config.vip_pay');
    //             var payCfg = VipPay.get(value);
    //             var money = payCfg.rmb;
    //             this._buttonOK.setString(Lang.get('common_rmb', { num: money }));
    //         }
    //     }
    //     this._buttonOK.node.active = (true);
    //     this._image_buyed.node.active = (false);
    //     if (success == false) {
    //         this._buttonOK.setEnabled(false);
    //         this._text_button_desc.string = (errorMsg);
    //         this._setItemLimitDes(errorMsg, funcName);
    //         var banType = shopItem.getConfig().num_ban_type;
    //         if (funcName == 'shopNumBanType' && banType == 1) {
    //             this._buttonOK.node.active = (false);
    //             this._image_buyed.node.active = (true);
    //         } else if (funcName == 'shopGoodsLack') {
    //             this._buttonOK.node.active = (false);
    //             this._image_buyed.node.active = (true);
    //         }
    //     } else {
    //         this._buttonOK.setEnabled(true);
    //         var strBuyTimes = UserDataHelper.getShopBuyTimesDesc(shopItem.getShopId(), shopItem.getGoodId());
    //         this._text_button_desc.string = (strBuyTimes);
    //     }
    //     if (type == ShopConst.NORMAL_SHOP_SUB_MONEY) {
    //         var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);//require('app.config.vip_pay');
    //         var payCfg = VipPay.get(value);
    //         var money = payCfg.gold;
    //         this._text_button_desc.string = (Lang.get('common_go_cost', { num: money }));
    //     }
    // }

    // _updateFixCell(shopItem, isShowOutLineColor,tabIndex) {
    //     var fixData = shopItem.getConfig();
    //     this._iconTemplate.unInitUI();
    //     this._iconTemplate.initUI(fixData.type, fixData.value, fixData.size);
    //     this._iconTemplate.setTouchEnabled(true);
    //     var itemParams = this._iconTemplate.getItemParams();
    //     if (itemParams == null) {
    //         return;
    //     }
    //     var buyCount = shopItem.getBuyCount();
    //     for (var i = 1; i <= 2; i++) {
    //         let type = fixData['price' + (i + '_type')];
    //         let value = fixData['price' + (i + '_value')];
    //         let size = fixData['price' + (i + '_size')];
    //         let priceAdd = fixData['price' + (i + '_add')];
    //         let priceSize = UserDataHelper.getTotalPriceByAdd(priceAdd, buyCount, 1, size);
    //         if (type && type > 0 && type != ShopConst.NORMAL_SHOP_SUB_MONEY) {
    //             this['_cost_Res' + i].updateUI(type, value, priceSize);
    //             this['_cost_Res' + i].node.active = (true);
    //         } else {
    //             this['_cost_Res' + i].node.active = (false);
    //         }
    //         let canBuy = LogicCheckHelper.enoughValue(type, value, priceSize, false);
    //         if (!canBuy) {
    //             this['_cost_Res' + i].setTextColorToRed();
    //         } else {
    //             this['_cost_Res' + i].setTextColorToATypeColor();
    //         }
    //         if (type == ShopConst.NORMAL_SHOP_SUB_MONEY && this._image_cost.node.active) {
    //             this._image_cost.node.active = (false);
    //         }
    //     }

    //     var times = UserDataHelper.getShopItemCanBuyTimes(shopItem);
    //     if (fixData.num_ban_type != 0) {
    //         this._text_item_name.node.y = (this._textItemNamePosY);
    //         this._textItemTimes.node.active = (true);
    //         if (times > 0) {
    //             this._textItemTimes.string = (Lang.get('shop_times_tip', { times: times }));
    //         } else {
    //             this._textItemTimes.string = (Lang.get('shop_times_end_tip'));
    //         }
    //     } else {
    //         this._text_item_name.node.y = (this._textItemNamePosY - 10);
    //         this._textItemTimes.node.active = (false);
    //     }

    //     this._updateName(itemParams);
    //     this._shopRightCorner(fixData.type, fixData.value, false);
    //     this._buttonOK.setString(Lang.get('shop_btn_buy'));
    //     if (this._cost_Res1.isVisible()) {
    //                 this._buttonOK.setString('');
    //                 this._cost_Res1.node.y = (this._costRes1PosY - 40);
    //             } else {
    //                 this._buttonOK.setString(Lang.get('shop_btn_buy'));
    //             }

    //     this._updateNewRemind(fixData);
    //     this._buttonOK.showRedPoint(false);
    //     let buttonOK = this._buttonOK;
    //     var hardCodeRedPoint = function () {
    //         var checkType = {
    //             type: TypeConvertHelper.TYPE_RESOURCE,
    //             value: DataConst.RES_GOLD
    //         };
    //         var redPoint = G_UserData.getShops().isFixShopItemDataCanBuy(shopItem, checkType);
    //         buttonOK.showRedPoint(redPoint);
    //     }
    //     hardCodeRedPoint();
    //     if (typeof(tabIndex) && tabIndex == 3) {
    //         this._text_button_desc.node.active = (false);
    //     }
    // }
    // _updateNewRemind(fixData) {
    //     this._image_newRemind.node.removeAllChildren();
    //     if (fixData.new_remind == 1) {
    //         this._image_newRemind.node.active = (ShopHelper.isNeedNewRemind(fixData.id));
    //         //G_EffectGfxMgr.createPlayGfx(this._image_newRemind, CommonShopItemCell2.NEW_REMIND_EFFECT, null, null, CommonShopItemCell2.NEW_REMIND_EFFECT_POS);
    //     } else {
    //         this._image_newRemind.node.active = (false);
    //     }
    // }


    //-----------
    _updateFixButton(shopItem) {
        var [success, errorMsg, funcName] = LogicCheckHelper.shopFixBtnCheck(shopItem);
        var fixData = shopItem.getConfig();
        var type = fixData['price1_type'];
        var value = fixData['price1_value'];
        var size = fixData['price1_size'];
        var priceAdd = fixData['price1_add'];
        this._buttonOK.setString(Lang.get('shop_btn_buy'));
        if (type == ShopConst.NORMAL_SHOP_SUB_MONEY) {
            var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
            var payCfg = VipPay.get(value);
            var money = payCfg.rmb;
            this._buttonOK.setString(Lang.get('common_rmb', { num: money }));
        }
        if (type != ShopConst.NORMAL_SHOP_SUB_MONEY) {
            this._buttonOK.setString('');
        }
        this._buttonOK.setVisible(true);
        this._image_buyed.node.active = (false);
        if (success == false) {
            this._buttonOK.setEnabled(false);
            this._cost_Res1.setGray();
            this._text_button_desc.string = (errorMsg);
            
            var banType = shopItem.getConfig().num_ban_type;
            if (funcName == 'shopNumBanType' && banType == 1) {
                this._buttonOK.setVisible(false);
                this._image_buyed.node.active = (true);
            } else if (funcName == 'shopGoodsLack') {
                this._buttonOK.setVisible(false);
                this._image_buyed.node.active = (true);
            }
        } else {
            this._buttonOK.setEnabled(true);
            this._cost_Res1.resetFromGray();
            if (!this._resCanBuy1) {
                this._cost_Res1.setTextColorToRed();
            } else {
                this._cost_Res1.setTextColorToATypeColor();
            }
            var strBuyTimes = UserDataHelper.getShopBuyTimesDesc(shopItem.getShopId(), shopItem.getGoodId());
            this._text_button_desc.string = (strBuyTimes);
        }
        if (type == ShopConst.NORMAL_SHOP_SUB_MONEY) {
            var VipPay =G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
            var payCfg = VipPay.get(value);
            var money = payCfg.gold;
            this._text_button_desc.string = (Lang.get('common_go_cost', { num: money }));
        }
    }
    _updateFixCell(shopItem, isShowOutLineColor, tabIndex) {
        var fixData = shopItem.getConfig();
        this._iconTemplate.unInitUI();
        this._iconTemplate.initUI(fixData.type, fixData.value, fixData.size);
        this._iconTemplate.setTouchEnabled(true);
        var itemParams = this._iconTemplate.getItemParams();
        if (itemParams == null) {
            return;
        }
        var buyCount = shopItem.getBuyCount();
        for (var i = 1; i <= 2; i++) {
            var type = fixData['price' + (i + '_type')];
            var value = fixData['price' + (i + '_value')];
            var size = fixData['price' + (i + '_size')];
            var priceAdd = fixData['price' + (i + '_add')];
            var priceSize = UserDataHelper.getTotalPriceByAdd(priceAdd, buyCount, 1, size);
            if (type && type > 0 && type != ShopConst.NORMAL_SHOP_SUB_MONEY) {
                (this['_cost_Res' + i] as CommonResourceInfoList).updateUI(type, value, priceSize);
                this['_cost_Res' + i].node.active = (true);
            } else {
                this['_cost_Res' + i].node.active = (false);
            }
            var canBuy = LogicCheckHelper.enoughValue(type, value, priceSize, false);
            this['_resCanBuy' + i] = canBuy;
            if (!canBuy) {
                (this['_cost_Res' + i] as CommonResourceInfoList).setTextColorToRed();
            } else {
                (this['_cost_Res' + i] as CommonResourceInfoList).setTextColorToATypeColor();
            }
            if (type == ShopConst.NORMAL_SHOP_SUB_MONEY && this._image_cost.node) {
                this._image_cost.node.active = (false);
            }
        }
        var times = UserDataHelper.getShopItemCanBuyTimes(shopItem);
        if (fixData.num_ban_type != 0) {
            this._text_item_name.node.y = (this._textItemNamePosY);
            this._textItemTimes.node.active = (true);
            if (times > 0) {
                this._textItemTimes.string = (Lang.get('shop_times_tip', { times: times }));
            } else {
                this._textItemTimes.string = (Lang.get('shop_times_end_tip'));
            }
        } else {
            this._text_item_name.node.y = (this._textItemNamePosY - 10);
            this._textItemTimes.node.active = (false);
        }
        this._updateName(itemParams);
        this._shopRightCorner(fixData.type, fixData.value, false);
        if (this._cost_Res1.isVisible()) {
            this._buttonOK.setString('');
            this._cost_Res1.node.y = (this._costRes1PosY - 40);
        } else {
            this._buttonOK.setString(Lang.get('shop_btn_buy'));
        }
        this._updateNewRemind(fixData);
        this._buttonOK.showRedPoint(false);
        var hardCodeRedPoint = function () {
            var checkType = {
                type: TypeConvertHelper.TYPE_RESOURCE,
                value: DataConst.RES_GOLD
            };
            var redPoint = G_UserData.getShops().isFixShopItemDataCanBuy(shopItem, checkType);
            this._buttonOK.showRedPoint(redPoint);
        }.bind(this);
        hardCodeRedPoint();
        if (typeof(tabIndex) && tabIndex == 2) {
            this._text_button_desc.node.active = (false);
        }
    }
    _updateNewRemind(fixData) {
        this._image_newRemind.node.removeAllChildren();
        if (fixData.new_remind == 1) {
            this._image_newRemind.node.active = (ShopHelper.isNeedNewRemind(fixData.id));
            G_EffectGfxMgr.createPlayGfx(this._image_newRemind.node, CommonShopItemCell2.NEW_REMIND_EFFECT, null, null, CommonShopItemCell2.NEW_REMIND_EFFECT_POS);
        } else {
            this._image_newRemind.node.active = (false);
        }
    }

}
