const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from './CommonButtonLevel1Highlight'

import CommonResourceInfoList from './CommonResourceInfoList'

import CommonIconTemplate from './CommonIconTemplate'
import { Path } from '../../utils/Path';
import { UserDataHelper } from '../../utils/data/UserDataHelper';
import UIHelper from '../../utils/UIHelper';
import { Colors, G_ConfigLoader, G_UserData } from '../../init';
import { Lang } from '../../lang/Lang';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import { DataConst } from '../../const/DataConst';
import { HeroConst } from '../../const/HeroConst';
import { LogicCheckHelper } from '../../utils/LogicCheckHelper';
import { ConfigNameConst } from '../../const/ConfigNameConst';
import { assert } from '../../utils/GlobleFunc';
import ConfigLoader from '../../config/ConfigLoader';
import { handler } from '../../utils/handler';
import { RichTextExtend } from '../../extends/RichTextExtend';
import { ShopConst } from '../../const/ShopConst';

@ccclass
export default class CommonShopItemCell extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _shop_1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_1: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _iconTemplate: CommonIconTemplate = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _iconTopImage: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_item_name: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_cost: cc.Sprite = null;

   @property({
       type: CommonResourceInfoList,
       visible: true
   })
   _cost_Res1: CommonResourceInfoList = null;

   @property({
       type: CommonResourceInfoList,
       visible: true
   })
   _cost_Res2: CommonResourceInfoList = null;

   @property({
       type: CommonButtonLevel1Highlight,
       visible: true
   })
   _buttonOK: CommonButtonLevel1Highlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_buyed: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_button_desc: cc.Label = null;

   @property({
    type: cc.Label,
    visible: true
})
_text_button_desc_1: cc.Label = null;
@property({
    type: cc.Label,
    visible: true
})
_text_button_desc_2: cc.Label = null;

@property({
    type: cc.Label,
    visible: true
})
_text_button_desc_3: cc.Label = null;



   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_discount: cc.Sprite = null;
   

   @property({
       type: cc.Label,
       visible: true
   })
   _bitmapFontLabel_discount: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _node_fragment: cc.Node = null;

   private _callBack:any;
   private _seasonOffsetY:number;
   private _isInit:boolean = false;
   private _itemID:number = 0;
   private _textFragment:cc.RichText;

   public _costRes1PosY:number;
   public _textItemNamePosY:number;
   public _resCanBuy1:boolean;

   setItemID(id){
       this._itemID = id;
   }
   getItemID():number{
       return this._itemID;
   }

   setVisible(visible){
       this.node.active = visible;
   }
    onLoad() {
        UIHelper.addEventListener(this.node,this._buttonOK._button,'CommonShopItemCell','_onButtonClick');
        this._costRes1PosY = this._cost_Res1.node.y;
        this._textItemNamePosY = this._text_item_name.node.y;
        this._resCanBuy1 = false;
        if(this._isInit==false)
        this._text_button_desc.string = "";
    }
    _init() {
        this._isInit = true;
        this._iconTopImage.node.active = (false);
        this._image_cost.node.active = (false);
        this._bitmapFontLabel_discount.node.active = (false);
        this._image_discount.node.active = (false);
        this._image_buyed.node.active = (false);
        this._seasonOffsetY = this._text_button_desc.node.y;
    }
    updateUI(shopItem, isShowOutLineColor,tabIndex) {
        if(!this._isInit){
            this._init();
        }
        this._node_fragment.removeAllChildren();
        this._textFragment = new cc.Node("_textFragment").addComponent(cc.RichText);
        this._node_fragment.addChild(this._textFragment.node);
        this._textFragment.node.setAnchorPoint(cc.v2(0, 0.5));
        this._node_fragment.active = (false);
        this.showIconTop(false);

        this._text_button_desc.node.active = (true);
        if(this._text_button_desc_1)
        this._text_button_desc_1.node.active = (false);
        if(this._text_button_desc_2)
        this._text_button_desc_2.node.active = (false);
        if(this._text_button_desc_3)
        this._text_button_desc_3.node.active = (false);

        var shopCfg = shopItem.getConfig();
        var configType = shopItem.getConfigType();
        if (configType == 'fix') {
            this._updateFixCell(shopItem, isShowOutLineColor,tabIndex);
            this._updateFixButton(shopItem);
            this._updateFixDiscount(shopItem);
        } else {
            this._updateRandomCell(shopItem);
            this._updateRandomBtn(shopItem);
        }
    }
    _updateFixDiscount(shopItem) {
        var discount = UserDataHelper.getFixShopDiscount(shopItem);
        if (discount > 1 && discount < 10) {
            this._image_discount.node.active = (true);
            UIHelper.loadTexture(this._image_discount,Path.getDiscountImg(discount));
        } else {
            this._image_discount.node.active =(false);
        }
    }
    updateDiscount(discount) {
        if (discount > 1 && discount < 10) {
            UIHelper.loadTexture(this._image_discount,Path.getDiscountImg(discount));
            this._image_discount.node.active =(true);
        } else {
            this._image_discount.node.active =(false);
        }
    }
    hardCode(shopItem) {
        if (shopItem.getShopId() == ShopConst.EQUIP_SHOP || shopItem.getShopId() == ShopConst.AWAKE_SHOP) {
            this._text_button_desc.node.setPosition(cc.v2(439, this._text_button_desc.node.y));
            this._text_button_desc.node.setAnchorPoint(cc.v2(1, 0.5));
        } else if (shopItem.getShopId() == ShopConst.SEASOON_SHOP) {
           this._text_button_desc.node.setPosition(118, this._seasonOffsetY - 28);
            this._text_button_desc.node.setAnchorPoint(cc.v2(0, 0.5));
        } else {
            this._text_button_desc.node.setPosition(cc.v2(385, this._text_button_desc.node.y));
            this._text_button_desc.node.setAnchorPoint(cc.v2(0.5, 0.5));
        }
    }
    _updateFixButton(shopItem) {
        var [success , errorMsgs, funcNames] = LogicCheckHelper.shopFixBtnCheckExt(shopItem);
        if (funcNames[0] == 'shopNumBanType') {
            this._buttonOK.setString(Lang.get('shop_btn_buyed'));
        } else {
            this._buttonOK.setString(Lang.get('shop_btn_buy'));
            var fixData = shopItem.getConfig();
            var type = fixData['price1_type'];
            var value = fixData['price1_value'];
            var size = fixData['price1_size'];
            var priceAdd = fixData['price1_add'];
            if (type == ShopConst.NORMAL_SHOP_SUB_MONEY) {
                var payCfg = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY).get(value);
                var money = payCfg.rmb;
                this._buttonOK.setString(Lang.get('common_rmb', { num: money }));
            }
            this._processBtnDes(this._buttonOK, fixData);
        }
        this._buttonOK.setVisible(true);
        this._image_buyed.node.active = (false);
        if (success == false) {
            this._buttonOK.setEnabled(false);
            this._setItemLimitDes(errorMsgs[0], funcNames[0]);
            this._text_button_desc.string = (errorMsgs[0]);
            this.hardCode(shopItem);
            var banType = shopItem.getConfig().num_ban_type;
            if (funcNames[0] == 'shopNumBanType' && banType == 1) {
                this._buttonOK.setVisible(false);
                this._image_buyed.node.active = (true);
            } else if (funcNames[0] == 'shopGoodsLack') {
                this._buttonOK.setVisible(false);
                this._image_buyed.node.active = (true);
            }
        } else {
            this._buttonOK.setEnabled(true);
            var strBuyTimes = UserDataHelper.getShopBuyTimesDesc(shopItem.getShopId(), shopItem.getGoodId());
            this._text_button_desc.string = (strBuyTimes);
            this.hardCode(shopItem);
        }
    }
    _updateFixCell(shopItem,isShow,tabIndex?) {
        var fixData = shopItem.getConfig();
        this._iconTemplate.unInitUI();
        this._iconTemplate.initUI(fixData.type, fixData.value, fixData.size);
        this._iconTemplate.setTouchEnabled(true);
        var itemParams = this._iconTemplate.getItemParams();
        if (itemParams == null) {
            return;
        }
        var buyCount = shopItem.getBuyCount();
        for (var i = 1; i<=2; i++) {
            var type = fixData['price' + (i + '_type')];
            var value = fixData['price' + (i + '_value')];
            var size = fixData['price' + (i + '_size')];
            var priceAdd = fixData['price' + (i + '_add')];
            var priceSize = UserDataHelper.getTotalPriceByAdd(priceAdd, buyCount, 1, size);
            if (type && type > 0 && type != ShopConst.NORMAL_SHOP_SUB_MONEY) {
                this['_cost_Res' + i].updateUI(type, value, priceSize);
                this['_cost_Res' + i].setVisible(true);
            } else {
                this['_cost_Res' + i].setVisible(false);
            }
            var canBuy = LogicCheckHelper.enoughValue(type, value, priceSize, false);
            if (!canBuy) {
                this['_cost_Res' + i].setTextColorToRed();
            } else {
                this['_cost_Res' + i].setTextColorToATypeColor();
            }
            if (type == ShopConst.NORMAL_SHOP_SUB_MONEY && this._image_cost.node.active) {
                this._image_cost.node.active = (false);
            }
        }
        this._updateName(itemParams, isShow);
        this._shopRightCorner(fixData.type, fixData.value, false);
        this._buttonOK.setString(Lang.get('shop_btn_buy'));
        this._processBtnDes(this._buttonOK, fixData);
        this._buttonOK.showRedPoint(false);
        var checkType = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        };
        var redPoint = G_UserData.getShops().isFixShopItemDataCanBuy(shopItem, checkType);
        this._buttonOK.showRedPoint(redPoint);
    }
    _updateRandomBtn(shopItem) {
        var success = LogicCheckHelper.shopRandomBtnCheck(shopItem);
        if (success == false) {
            this._buttonOK.setEnabled(false);
            this._buttonOK.setString(Lang.get('shop_btn_buyed'));
            this._text_button_desc.string = (' ');
        } else {
            this._buttonOK.setEnabled(true);
            this._buttonOK.setString(Lang.get('shop_btn_buy'));
            this._text_button_desc.string = (' ');
        }
        var text_button_desc = this._text_button_desc;
        function hardCode() {
            if (shopItem.getShopId() == ShopConst.INSTRUMENT_SHOP) {
                var randomData = shopItem.getConfig();
                if (randomData.item_type == TypeConvertHelper.TYPE_INSTRUMENT) {
                    var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, randomData.item_id);
                    text_button_desc.string = (Lang.get('shop_instrument_belong_to_des', { name: param.hero }));
                } else if (randomData.item_type == TypeConvertHelper.TYPE_FRAGMENT) {
                    var info = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT).get(randomData.item_id);
                  //assert((info, 'fragment config can not find id = %d', randomData.item_id);
                    var instrumentId = info.comp_value;
                    var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId);
                    text_button_desc.string = (Lang.get('shop_instrument_belong_to_des', { name: param.hero }));
                }
            }
        }
        hardCode();
    }
    _updateRandomCell(shopItem) {
        var randomData = shopItem.getConfig();
        this._iconTemplate.unInitUI();
        this._iconTemplate.initUI(randomData.item_type, randomData.item_id, randomData.item_num);
        this._iconTemplate.setTouchEnabled(true);
        var itemParams = this._iconTemplate.getItemParams();
        if (itemParams == null) {
            return;
        }
        for (var i = 1; i<=2; i++) {
            var type = randomData['type' + i];
            var value = randomData['value' + i];
            var size = randomData['size' + i];
            if (type && type > 0) {
                this['_cost_Res' + i].updateUI(type, value, size);
                this['_cost_Res' + i].setVisible(true);
            } else {
                this['_cost_Res' + i].setVisible(false);
            }
            var canBuy = LogicCheckHelper.enoughValue(type, value, size, false);
            if (!canBuy) {
                this['_cost_Res' + i].setTextColorToRed();
            } else {
                this['_cost_Res' + i].setTextColorToATypeColor();
            }
        }
        this._updateName(itemParams);
        this._shopRightCorner(randomData.item_type, randomData.item_id, true);
        this._buttonOK.setString(Lang.get('shop_btn_buy'));
    }
    _updateName(itemParams, isOutLineColor?) {
        this._text_item_name.string = (itemParams.name);
        UIHelper.updateLabelSize(this._text_item_name);
        this._text_item_name.node.color = (itemParams.icon_color);
        if (isOutLineColor) {
            UIHelper.enableOutline(this._text_item_name,itemParams.icon_color_outline);
        }
    }
    showIconTop(needShow) {
        if (needShow == null) {
            needShow = false;
        }
        this._iconTopImage.node.active = (needShow);
    }
    _onButtonClick(sender) {
        ////logWarn('CommonShopItemCell:_onButtonClick');
        if (this._callBack && typeof(this._callBack) == 'function') {
            this._callBack(this);
        }
    }
    setCallBack(callback) {
        this._callBack = callback;
    }
    _shopRightCorner(type, value, isRandom) {
        var itemParams = TypeConvertHelper.convert(type, value);
        if (type == TypeConvertHelper.TYPE_INSTRUMENT) {
            ////logWarn('CommonShopItemCell:_shopRightCorner');
            if (isRandom == true) {
                this._shopLightEffect();
            }
            if (this._shopItemInBattle(value)) {
                return;
            }
        }
        if (type == TypeConvertHelper.TYPE_HERO) {
            if (isRandom == true && itemParams.cfg.type != HeroConst.HERO_EXP_TYPE) {
                this._shopLightEffect();
            }
            if (this._showHeroTopImage(value)) {
                return;
            }
        } else if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            this._showFragmentNum(type, value);
            if (itemParams.cfg.comp_type == 1) {
                if (this._showHeroTopImage(itemParams.cfg.comp_value)) {
                    return;
                }
            }
            if (itemParams.cfg.comp_type == 4) {
                if (this._shopItemInBattle(itemParams.cfg.comp_value)) {
                    return;
                }
            }
            if (itemParams.cfg.comp_type == 3) {
                if (itemParams.cfg.color == 5) {
                    if (this._showTreasureTopImage(itemParams.cfg.comp_value)) {
                        return;
                    }
                }
            }
        } else if (type == TypeConvertHelper.TYPE_ITEM && value == DataConst.ITEM_COMMON_INSTRUMENT1 || value == DataConst.ITEM_COMMON_INSTRUMENT2) {
            if (isRandom == true) {
                this._shopLightEffect();
            }
        }
    }
    _shopLightEffect() {
        this._iconTemplate.removeLightEffect();
        //this._iconTemplate.showLightEffect();
    }
    _showHeroTopImage(heroId) {
        var res = UserDataHelper.getHeroTopImage(heroId) as any[];
        if (res && res.length > 0) {
            UIHelper.loadTexture(this._iconTopImage,res[0]);
            this._iconTopImage.node.active = (true);
            return true;
        }
        return false;
    }
    _showTreasureTopImage(treasureId) {
        var res = UserDataHelper.getTreasureTopImage(treasureId);
        if (res) {
            UIHelper.loadTexture(this._iconTopImage,res[0]);
            this._iconTopImage.node.active = (true);
            return true;
        }
        return false;
    }
    _shopItemInBattle(baseId) {
        var needShow = UserDataHelper.isInBattleHeroWithBaseId(baseId);
        if (needShow) {
            var res = Path.getTextSignet('img_iconsign_shangzhen');
            UIHelper.loadTexture(this._iconTopImage,res);
            this._iconTopImage.node.active = (true);
        }
        return needShow;
    }
    _showFragmentNum(type, value) {
        var itemParams = TypeConvertHelper.convert(type, value);
        var num = UserDataHelper.getNumByTypeAndValue(type, value);
        var textContent = this._text_item_name.node.getContentSize();
        var txtX = this._text_item_name.node.x;
        let txtY=this._text_item_name.node.y;
        this._node_fragment.active = (true);
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
        RichTextExtend.setRichTextWithJson(this._textFragment,richText);
        this._node_fragment.setPosition(txtX + textContent.width + 4, txtY);
    }
    _processBtnDes(btn, configInfo) {
        if (configInfo.button != '') {
            btn.setString(configInfo.button);
        }
    }
    _setItemLimitDes(errorMsgs:any, funcNames:string) {
        var num = errorMsgs.length;
        if (num == 0) {
            this._text_button_desc.node.active = (false);
            this.setLableVisile(this._text_button_desc_3, false);
            return;
        } else if (num == 1) {
            this._text_button_desc.node.active = (true);
            this.setLableVisile(this._text_button_desc_1, false);
            this.setLableVisile(this._text_button_desc_2, false);
            this.setLableVisile(this._text_button_desc_3, false);
            if (funcNames['shopNumBanType'] || funcNames['shopGoodsLack']) {
                this._text_button_desc.string = (errorMsgs[0]);
            } else {
                this._text_button_desc.string = (errorMsgs[0] + Lang.get('shop_condition_ext'));
            }
        } else if (num == 2) {
            this._text_button_desc.node.active = (false);
            this.setLableVisile(this._text_button_desc_1, true);
            this.setLableVisile(this._text_button_desc_2, true);
            this.setLableVisile(this._text_button_desc_3, true);
            if (funcNames['shopNumBanType'] || funcNames['shopGoodsLack']) {
                this._text_button_desc.node.active = (true);
                this.setLableVisile(this._text_button_desc_1, false);
                this.setLableVisile(this._text_button_desc_2, false);
                this.setLableVisile(this._text_button_desc_3, false);
                this._text_button_desc.string = (errorMsgs[0]);
            } else {
                if (this._text_button_desc_1) {
                    this._text_button_desc_1.string = (errorMsgs[0]);
                }
                if ( this._text_button_desc_2) {
                    this._text_button_desc_2.string = (errorMsgs[1]);
                }
            }
        }
    }

    setLableVisile(lable, flag) {
        if (lable) {
            lable.node.active = flag;
        }
    }
}
