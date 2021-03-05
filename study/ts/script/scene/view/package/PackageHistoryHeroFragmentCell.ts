const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import CommonListItem from '../../../ui/component/CommonListItem';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Lang } from '../../../lang/Lang';
import { Colors } from '../../../init';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1';

@ccclass
export default class PackageHistoryHeroFragmentCell extends CommonListItem {

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
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _buttonGo1: CommonButtonSwitchLevel1 = null;
    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _buttonGo2: CommonButtonSwitchLevel1 = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTop1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTop2: cc.Sprite = null;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        for (let i = 1; i <= 2; i++) {
            this['_buttonGo' + i].addClickEventListenerEx( ()=> {
                this.dispatchCustomCallback(i);
            });
        }
    }
    updateUI(index, itemLine) {
        var data1 = itemLine[0];
        var data2 = itemLine[1];

        this.updateCell(1, data1);
        this.updateCell(2, data2);
    }

     updateCell(index, data) {
        if (data) {
            if (typeof (data) != 'object') {
                return;
            }
            (this['_item' + index] as CommonListCellBase).setVisible(true);
            (this['_item' + index] as CommonListCellBase).updateUI(TypeConvertHelper.TYPE_FRAGMENT, data.getId());
            (this['_item' + index] as CommonListCellBase).setTouchEnabled(true);
            var image = this['_imageTop' + index] as cc.Sprite;
            image.node.active = (false);
            var myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, data.getId());
            var maxCount = data.getConfig().fragment_num;
            var isEnough = myCount >= maxCount;
            var btnDes = isEnough && Lang.get('fragment_list_cell_btn_compose') || Lang.get('fragment_list_cell_btn_get');
            var colorCount = isEnough && Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) || Colors.colorToNumber(Colors.BRIGHT_BG_RED);
            this['_buttonGo' + index].setString(btnDes);
            if (isEnough) {
                this['_buttonGo' + index].switchToHightLight();
            } else {
                this['_buttonGo' + index].switchToNormal();
            }
            this['_buttonGo' + index].showRedPoint(isEnough);
            var content = Lang.get('fragment_count_text', {
                count1: myCount,
                color: colorCount,
                count2: maxCount
            });
            var textCount = RichTextExtend.createWithContent(content);
            (this['_item' + index] as CommonListCellBase).setCountText(textCount.node);
        } else {
            (this['_item' + index] as CommonListCellBase).setVisible(false);
        }
    }
    _onButtonClicked1() {
        this.dispatchCustomCallback(1);
    }
    _onButtonClicked2() {
        this.dispatchCustomCallback(2);
    }
}