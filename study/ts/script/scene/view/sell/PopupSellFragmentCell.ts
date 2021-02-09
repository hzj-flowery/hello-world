const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { assert } from '../../../utils/GlobleFunc';
import { Lang } from '../../../lang/Lang';
import { Colors, G_UserData, G_ConfigLoader } from '../../../init';
import CommonResourceInfoList from '../../../ui/component/CommonResourceInfoList';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { ConfigNameConst } from '../../../const/ConfigNameConst';

@ccclass
export default class PopupSellFragmentCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item1: CommonListCellBase = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item2: CommonListCellBase = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _resInfoVaule1: CommonResourceInfoList = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _resInfoVaule2: CommonResourceInfoList = null;

    @property(cc.Toggle)
    checkBox1: cc.Toggle = null;

    @property(cc.Toggle)
    checkBox2: cc.Toggle = null;

    @property(cc.Node)
    imageTop1: cc.Node = null;

    @property(cc.Node)
    imageTop2: cc.Node = null;



    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        UIHelper.addEventListener(this.node, this.checkBox1, 'PopupSellFragmentCell', '_onBtnCheckBox1');
        UIHelper.addEventListener(this.node, this.checkBox2, 'PopupSellFragmentCell', '_onBtnCheckBox2');
    }

    _updateGemstoneCell(index, data) {
        var id = data.getId();
        var num = data.getNum();
        this['_item' + index].updateUI(TypeConvertHelper.TYPE_GEMSTONE, id, num);
        this['_item' + index].setCountText(null);
        var config = data.getConfig();
        var fragmentId = config.fragment_id;
        var fragmentConfig = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT).get(fragmentId);
      //assert((fragmentConfig != null, 'fragmentConfig == nil');
        var resType = fragmentConfig.recycle_type;
        var resValue = fragmentConfig.recycle_value;
        var resSize = fragmentConfig.recycle_size * fragmentConfig.fragment_num;
        this['_resInfoVaule' + index].updateUI(resType, resValue, resSize);
        this['imageTop' + index].active = (false);
    }
    _updateOfficeSeal(index, data) {
        var id = data.getId();
        var num = data.getNum();
        this['_item' + index].updateUI(TypeConvertHelper.TYPE_ITEM, id, num);
        var config = data.getConfig();
        var resType = config.recycle_type;
        var resValue = config.recycle_value;
        var resSize = config.recycle_size;
        this['_resInfoVaule' + index].updateUI(resType, resValue, resSize);
        this['imageTop' + index].active = (false);
    }
    _updateSilkbag(index, data) {
        var id = data.getBase_id();
        var num = 1;
        this['_item' + index].updateUI(TypeConvertHelper.TYPE_SILKBAG, id, num);
        var config = data.getConfig();
        var resType = config.recycle_type;
        var resValue = config.recycle_value;
        var resSize = config.recycle_size;
        this['_resInfoVaule' + index].updateUI(resType, resValue, resSize);
        this['imageTop' + index].active = (false);
    }
    _updateFragmentCell(index, data) {
        var id = data.getId();
        var num = data.getNum();
        this['_item' + index].updateUI(TypeConvertHelper.TYPE_FRAGMENT, id);
        var config = data.getConfig();
        var colorCount = num >= config.fragment_num? Colors.BRIGHT_BG_GREEN:Colors.BRIGHT_BG_RED;
        var content = Lang.get('fragment_count_text', {
            count1: num,
            color: colorCount,
            count2: config.fragment_num
        });

        var node = new cc.Node();
        let richText = RichTextExtend.createWithContent(content);
        this['_item' + index].setCountText(richText.node);
        var resType = config.recycle_type;
        var resValue = config.recycle_value;
        var resSize = config.recycle_size;
        this['_resInfoVaule' + index].updateUI(resType, resValue, resSize);
        if (config.comp_type == TypeConvertHelper.TYPE_HERO && G_UserData.getKarma().isHaveHero(config.comp_value)) {
            this['imageTop' + index].active = (true);
        }
    }
    _updateJadeCell(index, data) {
        var id = data.getSys_id();
        var num = 1;
        this['_item' + index].updateUI(TypeConvertHelper.TYPE_JADE_STONE, id, num);
        var config = data.getConfig();
        var resType = config.recycle_type;
        var resValue = config.recycle_value;
        var resSize = config.recycle_size;
        this['_resInfoVaule' + index].updateUI(resType, resValue, resSize);
        this['imageTop' + index].active = (false);
    }
    _updateSingleCell(index, data, isSelected) {
        var itemKey = '_item' + index;
        if (!data) {
            this[itemKey].setVisible(false);
            return;
        }
        this[itemKey].setVisible(true);
        var tp = data.getType();
        this['imageTop' + index].active = (false);
        if (tp == TypeConvertHelper.TYPE_GEMSTONE) {
            this._updateGemstoneCell(index, data);
        } else if (tp == TypeConvertHelper.TYPE_FRAGMENT) {
            this._updateFragmentCell(index, data);
        } else if (tp == TypeConvertHelper.TYPE_ITEM) {
            this._updateOfficeSeal(index, data);
        } else if (tp == TypeConvertHelper.TYPE_SILKBAG) {
            this._updateSilkbag(index, data);
        } else if (tp == TypeConvertHelper.TYPE_JADE_STONE) {
            this._updateJadeCell(index, data);
        }
        this['checkBox' + index].isChecked = (isSelected);
    }
    updateUI(data1, data2, isSelected1, isSelected2) {
        this._updateSingleCell(1, data1, isSelected1);
        this._updateSingleCell(2, data2, isSelected2);
    }
    _onBtnCheckBox1() {
        this.dispatchCustomCallback(1);
    }
    _onBtnCheckBox2() {
        this.dispatchCustomCallback(2);
    }
}
