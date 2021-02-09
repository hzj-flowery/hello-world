const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import { G_UserData, Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { ItemsData } from '../../../data/ItemsData';
import { handler } from '../../../utils/handler';

@ccclass
export default class PackageItemCell extends CommonListItem {

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
        type: cc.Sprite,
        visible: true
    })
    Image_1: cc.Node = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCount1: CommonDesValue = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes1: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _buttonReplace1: CommonButtonSwitchLevel1 = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_2: cc.Node = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCount2: CommonDesValue = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes2: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _buttonReplace2: CommonButtonSwitchLevel1 = null;


    onLoad() {
        for (var i = 1; i <= 2; i++) {
            var item = this['_item' + i];
            var button = this['_buttonReplace' + i];
            if (item && button) {
                item.node.active = false;
                button.addClickEventListenerEx(handler(this, this._onBtnClick.bind(this,i)))
            }
        }
    }

    updateUI(index, itemLine) {
        for (var i = 1; i <= 2; i++) {
            var item = this['_item' + i];
            item.node.active = (false);
        }

        for (var j in itemLine) {
            var item = itemLine[j];
            this.updateItemCell(parseFloat(j) + 1, item);
        }
    }


    updateItemCell(i, item) {
        var type = item.getType();
        var value = item.getId();
        var size = item.getNum();
        if (this['_item' + i]) {
            this['_item' + i].updateUI(type, value, size);
            this['_item' + i].node.active = (true);
            this['_item' + i].tag = (i + this.itemID * 2);
        }
        if (type == TypeConvertHelper.TYPE_ITEM) {
            this['_nodeCount' + i].node.active = false;
            this['_textDes' + i].node.active = true;
            var itemConfig = item.getConfig();
            if (itemConfig) {
                this['_textDes' + i].string = (itemConfig.bag_description);
                this['_textDes' + i].lineHeight = 20;
            }
            var button = this['_buttonReplace' + i];
            if (button) {
                if (itemConfig.button_type == 0) {
                    button.node.active = false;
                } else {
                    var showRedPoint = G_UserData.getItems().hasRedPointByItemID(item.getId());
                    button.node.active = true;
                    button.switchToNormal();
                    button.setString(itemConfig.button_txt);
                    button.setButtonTag(i + this.itemID * 2);
                    button.showRedPoint(showRedPoint);
                }
            }
        } else if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            this['_nodeCount' + i].node.active = true;
            this['_textDes' + i].node.active = false;
            var fragmentNum = item.getConfig().fragment_num;
            var isEnough = size >= fragmentNum;
            this['_nodeCount' + i].updateUI(Lang.get('hero_list_cell_frag_des'), size, fragmentNum);
            var btnDes = isEnough && Lang.get('fragment_list_cell_btn_compose') || Lang.get('fragment_list_cell_btn_get');
            this['_buttonReplace' + i].setString(btnDes);
            this['_buttonReplace' + i].setButtonTag(i + this.itemID * 2);
            this['_buttonReplace' + i].showRedPoint(isEnough);
            if (isEnough) {
                this['_buttonReplace' + i].switchToHightLight();
                this['_nodeCount' + i].setValueColor(Colors.BRIGHT_BG_GREEN);
                this['_nodeCount' + i].setMaxColor(Colors.BRIGHT_BG_GREEN);
            } else {
                this['_buttonReplace' + i].switchToNormal();
                this['_nodeCount' + i].setValueColor(Colors.BRIGHT_BG_ONE);
                this['_nodeCount' + i].setMaxColor(Colors.BRIGHT_BG_ONE);
            }
        }
    }
    _onBtnClick(pos) {
         this.dispatchCustomCallback(pos);
    }
    updateItemNum(id, num) {
        for (var i = 1; i <= 2; i++) {
            var itemInfo = this['_item' + i];
            if (itemInfo && itemInfo.getIconId() == id) {
                itemInfo.setIconCount(num);
                return true;
            }
        }
        return false;
    }
}