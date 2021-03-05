const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonResourceInfoList from '../../../ui/component/CommonResourceInfoList'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Util } from '../../../utils/Util';
import { Path } from '../../../utils/Path';

@ccclass
export default class CrystalChargeShopCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _item1: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _itemIcon1: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemName1: cc.Label = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _costRes11: CommonResourceInfoList = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _costRes12: CommonResourceInfoList = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnBuy1: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _buyDesc1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _discount1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _item2: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _itemIcon2: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemName2: cc.Label = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _costRes21: CommonResourceInfoList = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _costRes22: CommonResourceInfoList = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnBuy2: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _buyDesc2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _discount2: cc.Sprite = null;


    _data1: any;
    _data2: any;


    ctor() {
        UIHelper.addEventListener(this.node, this._btnBuy1._button, 'CrystalChargeShopCell', '_onBtnBuy1');
        UIHelper.addEventListener(this.node, this._btnBuy2._button, 'CrystalChargeShopCell', '_onBtnBuy2');
    }
    onInit() {
        this.ctor();
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._btnBuy1.setString(Lang.get('common_btn_name_confirm'));
        this._btnBuy2.setString(Lang.get('common_btn_name_confirm'));
    }
    updateUI(cellData) {
        for (var index = 1; index<=2; index++) {
            this['_item' + index].node.active = (false);
        }
        let updateItem = function (index, data) {
            if (index == 1) {
                this._data1 = data.data;
            } else if (index == 2) {
                this._data2 = data.data;
            }
            var cfg = data.data.getConfig();
            this['_item' + index].node.active = (true);
            this['_itemIcon' + index].unInitUI();
            this['_itemIcon' + index].initUI(cfg.good_type, cfg.good_value, cfg.good_size);
            var itemParams = this['_itemIcon' + index].getItemParams();
            this['_itemName' + index].string = (itemParams.name);
            this['_itemName' + index].node.color = (itemParams.icon_color);
            if (cfg.discount >= 1 && cfg.discount <= 9) {
                UIHelper.loadTexture(this['_discount' + index], Path.getTextSignet('txt_sys_activity_sale0' + cfg.discount));
                this['_discount' + index].node.active = (true);
            } else {
                this['_discount' + index].node.active = (false);
            }
            var leftBuyCount = data.data.getLeftBuyCount();
            if (leftBuyCount >= 0) {
                this['_buyDesc' + index].node.active = (true);
                if (leftBuyCount > 0) {
                    this['_btnBuy' + index].setEnabled(true);
                    this['_btnBuy' + index].setString(Lang.get('lang_crystal_shop_btn_buy'));
                    this['_buyDesc' + index].string = (Lang.get('lang_crystal_shop_limit', { num: leftBuyCount }));
                } else {
                    this['_btnBuy' + index].setEnabled(false);
                    this['_btnBuy' + index].setString(Lang.get('lang_crystal_shop_btn_already_buy'));
                    this['_buyDesc' + index].string = (Lang.get('lang_crystal_shop_limit_max'));
                }
            } else {
                this['_buyDesc' + index].node.active = (false);
                this['_btnBuy' + index].setEnabled(true);
                this['_btnBuy' + index].setString(Lang.get('lang_crystal_shop_btn_buy'));
            }
            for (var i = 1; i<=2; i++) {
                var costResName = Util.format('_costRes%d%d', index, i);//string.format('_costRes%d%d', index, i);
                if (cfg['price_type_' + i] != 0) {
                    this[costResName].updateUI(cfg['price_type_' + i], cfg['price_value_' + i], cfg['price_size_' + i]);
                    this[costResName].node.active = (true);
                    var canBuy = LogicCheckHelper.enoughValue(cfg['price_type_' + i], cfg['price_value_' + i], cfg['price_size_' + i], false);
                    if (!canBuy) {
                        this[costResName].setTextColorToRed();
                    } else {
                        this[costResName].setTextColorToATypeColor();
                    }
                } else {
                    this[costResName].node.active = (false);
                }
            }
        }.bind(this);
        for (var itemIndex=0; itemIndex < cellData.length; itemIndex++) {
            var itemData = cellData[itemIndex];
            updateItem(itemIndex+1, itemData);
        }
    }
    _onBtnBuy1() {
        if (this._data1) {
            this.dispatchCustomCallback(this._data1);
        }
    }
    _onBtnBuy2() {
        if (this._data2) {
            this.dispatchCustomCallback(this._data2);
        }
    }

}
