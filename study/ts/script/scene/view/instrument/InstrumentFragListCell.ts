const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import CommonListItem from '../../../ui/component/CommonListItem';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Lang } from '../../../lang/Lang';
import { Colors } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class InstrumentFragListCell extends ListViewCellBase {

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
    _button1: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button2: CommonButtonSwitchLevel1 = null;

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    updateUI(index, itemLine) {
        for (var i = 1; i <= 2; i++) {
            var item = this['_item' + i];
            item.node.active = (false);
        }
        for (var j in itemLine) {
            var id = itemLine[j];
            this.updateCell(parseFloat(j) + 1, id);
        }
    }

    updateCell(index, data) {
        if (data) {
            if (typeof (data) != 'object') {
                return;
            }
            this['_item' + index].node.active = (true);
            this['_item' + index].updateUI(TypeConvertHelper.TYPE_FRAGMENT, data.getId());
            this['_item' + index].setTouchEnabled(true);
            var myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, data.getId());
            var maxCount = data.getConfig().fragment_num;
            var isEnough = myCount >= maxCount;
            var btnDes = isEnough && Lang.get('fragment_list_cell_btn_compose') || Lang.get('fragment_list_cell_btn_get');
            var colorCount = isEnough && Colors.colorToHexStr(Colors.BRIGHT_BG_GREEN) || Colors.colorToHexStr(Colors.BRIGHT_BG_RED);
            this['_button' + index].setString(btnDes);
            if (isEnough) {
                this['_button' + index].switchToHightLight();
            } else {
                this['_button' + index].switchToNormal();
            }
            this['_button' + index].showRedPoint(isEnough);
            var content = Lang.get('fragment_count_text', {
                count1: myCount,
                color: colorCount,
                count2: maxCount
            });
            var textCount = RichTextExtend.createWithContent(content);
            this['_item' + index].setCountText(textCount.node);
        } else {
            this['_item' + index].node.active = (false);
        }
    }
    onButtonClicked1() {
         this.dispatchCustomCallback(1);
    }
    onButtonClicked2() {
          this.dispatchCustomCallback(2);
    }

}
