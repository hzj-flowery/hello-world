const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import { Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonListItem from '../../../ui/component/CommonListItem';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { handler } from '../../../utils/handler';

@ccclass
export default class PackageGemstoneCell extends CommonListItem {

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
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr11: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr12: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr13: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr14: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr21: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr22: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr23: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr24: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCount1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCount2: CommonDesValue = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _btnFragment1: CommonButtonSwitchLevel1 = null;
    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _btnFragment2: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _fragmentInfo1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _fragmentInfo2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _gemstonePropInfo1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _gemstonePropInfo2: cc.Node = null;

    _cellIndex;

    onLoad() {
        this._nodeAttr11.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeAttr12.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeAttr13.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeAttr14.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeAttr21.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeAttr22.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeAttr23.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._nodeAttr24.setValueColor(Colors.BRIGHT_BG_GREEN);
        this._fragmentInfo1.active = false;
        this._fragmentInfo2.active = false;
        this._gemstonePropInfo1.active = false;
        this._gemstonePropInfo2.active = false;

        this._btnFragment1.addClickEventListenerEx(handler(this, this._onBtnClick, 1));
        this._btnFragment2.addClickEventListenerEx(handler(this, this._onBtnClick, 2));
    }

    _onBtnClick(pos) {
        this.dispatchCustomCallback(pos);
   }

    _updateGemStoneAttr(keyName, id) {
        var attrInfo = HeroDataHelper.getGemstoneAttr(id);
        var desInfo = TextHelper.getAttrInfoBySort(attrInfo);
        for (var i = 1; i <= 4; i++) {
            var one = desInfo[i-1];
            if (one) {
                var ret = TextHelper.getAttrBasicText(one.id, one.value);
                var attrName = ret[0], attrValue = ret[1];
                this[keyName + i].updateUI(attrName, '+' + attrValue);
                this[keyName + i].node.active = true;
            } else {
                this[keyName + i].node.active = false;
            }
        }
    }

    _updateSingleCell(index, data) {
        var itemKey = '_item' + index;
        if (!data) {
            this[itemKey].node.active = false;
            return;
        }
        var tp = data.getType();
        var id = data.getId();
        var num = data.getNum();
        var gemstoneKey = '_gemstonePropInfo' + index;
        var fragmentKey = '_fragmentInfo' + index;
        var attrName = '_nodeAttr' + index;
        var fragmentCountKey = '_nodeCount' + index;
        var btnFragmentKey = '_btnFragment' + index;
        this[itemKey].node.active = true;
        if (tp == TypeConvertHelper.TYPE_FRAGMENT) {
            this[itemKey].updateUI(tp, id);
            this[gemstoneKey].active = false;
            this[fragmentKey].active = true;
            var fragmentNum = data.getConfig().fragment_num;
            var isEnough = num >= fragmentNum;
            this[fragmentCountKey].updateUI(Lang.get('hero_list_cell_frag_des'), num, fragmentNum);
            var btnDes = isEnough && Lang.get('fragment_list_cell_btn_compose') || Lang.get('fragment_list_cell_btn_get');
            this[btnFragmentKey].setString(btnDes);
            if (isEnough) {
                this[btnFragmentKey].switchToHightLight();
                this[fragmentCountKey].setValueColor(Colors.BRIGHT_BG_GREEN);
                this[fragmentCountKey].setMaxColor(Colors.BRIGHT_BG_GREEN);
            } else {
                this[btnFragmentKey].switchToNormal();
                this[fragmentCountKey].setValueColor(Colors.BRIGHT_BG_ONE);
                this[fragmentCountKey].setMaxColor(Colors.BRIGHT_BG_ONE);
            }
        } else if (tp == TypeConvertHelper.TYPE_GEMSTONE) {
            this[itemKey].updateUI(tp, id, num);
            this[gemstoneKey].active = true;
            this[fragmentKey].active = false;
            this._updateGemStoneAttr(attrName, id);
        }
    }

    updateUI(index, itemLine) {
        this._cellIndex = index;
        this._updateSingleCell(1, itemLine[0]);
        this._updateSingleCell(2, itemLine[1]);
    }
}