const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Lang } from '../../../lang/Lang';
import { Colors } from '../../../init';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1';
import { handler } from '../../../utils/handler';

@ccclass
export default class HorseEquipFragListCell extends ListViewCellBase {

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
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button1: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item2: CommonListCellBase = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button2: CommonButtonSwitchLevel1 = null;

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._button1.addClickEventListenerEx(handler(this,this._onButtonClicked1));
        this._button2.addClickEventListenerEx(handler(this,this._onButtonClicked2));
    }

    updateUI(data1, data2) {
        let updateCell = (index, data) => {
            if (data) {
                if (typeof (data) != 'object') {
                    return;
                }
                (this['_item' + index] as CommonListCellBase).setVisible(true);
                (this['_item' + index] as CommonListCellBase).updateUI(TypeConvertHelper.TYPE_FRAGMENT, data.getId());
                (this['_item' + index] as CommonListCellBase).setTouchEnabled(true);
                var myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, data.getId());
                var maxCount = data.getConfig().fragment_num;
                var isEnough = myCount >= maxCount;
                var btnDes = isEnough && Lang.get('fragment_list_cell_btn_compose') || Lang.get('fragment_list_cell_btn_get');
                var colorCount = isEnough && Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) || Colors.colorToNumber(Colors.BRIGHT_BG_RED);
                (this['_button' + index] as CommonButtonSwitchLevel1).setString(btnDes);
                if (isEnough) {
                    (this['_button' + index] as CommonButtonSwitchLevel1).switchToHightLight();
                } else {
                    (this['_button' + index] as CommonButtonSwitchLevel1).switchToNormal();
                }
                (this['_button' + index] as CommonButtonSwitchLevel1).showRedPoint(isEnough);
                var content = Lang.get('fragment_count_text', {
                    count1: myCount,
                    color: colorCount,
                    count2: maxCount
                });
               // var textCount = RichTextExtend.createWithContent(content).node;
                (this['_item' + index] as CommonListCellBase).setCountTextContent(content);
            } else {
                (this['_item' + index] as CommonListCellBase).setVisible(false);
            }
        }
        updateCell(1, data1);
        updateCell(2, data2);
    }

    _onButtonClicked1() {
        this.dispatchCustomCallback(1);
    }

    _onButtonClicked2() {
        this.dispatchCustomCallback(2);
    }
}