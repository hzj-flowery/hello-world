const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { assert } from '../../../utils/GlobleFunc';
import { Lang } from '../../../lang/Lang';
import { G_ConfigLoader } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class EventHalfPriceCell extends cc.Component {

    static TOPIMAGERES = [
        "img_iconsign_shangzhen", //上阵
        "img_iconsign_mingjiangce", //名将册
        "img_iconsign_jiban" //羁绊
    ]

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item: CommonIconTemplate = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _topImage: cc.Sprite = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resInfo: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnBuy: CommonButtonLevel1Highlight = null;

    private _index;
    private _callback;
    private _itemId;
    private _itemData;

    setUp(itemId, index, callback){
        this._index = index;
        this._callback = callback;
        this._itemId = itemId;
        this._itemData = G_ConfigLoader.getConfig(ConfigNameConst.SHOP_RANDOM_ITEMS).get(this._itemId);
      //assert((this._callback, 'call back should not be nil!!');

        this._btnBuy.setString(Lang.get('explore_half_buy'));
        this._setItemDetail();
    }

    _setItemDetail() { 
        this._item.initUI(this._itemData.item_type, this._itemData.item_id, this._itemData.item_num);
        this._item.showName(true, null);
        this._resInfo.updateUI(this._itemData.type1, this._itemData.value1, this._itemData.size1);
        this._showTopImage();
    }
    onBuyClick() { 
        this._callback(this._index, this._itemData);
    }
    setHasBuy() { 
        this._btnBuy.setEnabled(false);
        this._btnBuy.setString(Lang.get('explore_half_bought'));
        this._item.setIconDark(true);
    }
    _showTopImage() { 
        var heroID;
        if (this._itemData.item_type == TypeConvertHelper.TYPE_FRAGMENT) {
            var fragmentData = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT).get(this._itemData.item_id);
          //assert((fragmentData != null, 'can not find frament data id = ' + (this._itemData.item_id || 'nil'));
            if (fragmentData.comp_type == TypeConvertHelper.TYPE_HERO) {
                heroID = fragmentData.comp_value;
            }
        } else if (this._itemData.item_type == TypeConvertHelper.TYPE_HERO) {
            heroID = this._itemData.item_id;
        }
        if (!heroID) {
            this._topImage.node.active = false;
            return;
        }
        var [res] = UserDataHelper.getHeroTopImage(heroID);
        if (res) {
            UIHelper.loadTexture(this._topImage, res);
            this._topImage.node.active = true;
        } else {
            this._topImage.node.active = false;
        }
    }

}