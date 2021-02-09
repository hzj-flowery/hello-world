const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';

@ccclass
export default class PackageHistoryHeroWeaponCell extends CommonListItem {

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
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonGo1: CommonButtonLevel1Highlight = null;
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonGo2: CommonButtonLevel1Highlight = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _desc1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _desc2: cc.Label = null;


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._buttonGo1.setString(Lang.get('hero_awake_equip_btn'));
        this._buttonGo2.setString(Lang.get('hero_awake_equip_btn'));
        for (let i = 1; i <= 2; i++) {
            this['_buttonGo' + i].addClickEventListenerEx( ()=> {
                this.dispatchCustomCallback(i);
            });
        }
    }
    updateUI(index, itemLine) {
        for (var i = 1; i <= 2; i++) {
            var item = this['_item' + i];
            item.setVisible(false);
        }
        for (let i = 1; i <= itemLine.length; i++) {
            var data = itemLine[i - 1];
            this.updateCell(i, data);
        }
    }

    updateCell(index, data) {
        if (data != null) {
            if (typeof (data) != 'object' || data.getId() == 0) {
                this['_item' + index].setVisible(false);
                return;
            }
            var type = TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON;
            var baseId = data.getId();
            var size = data.getNum();
            this['_item' + index].setVisible(true);
            this['_item' + index].updateUI(type, baseId, size);
            this['_buttonGo' + index].setVisible(true);
            this['_desc' + index].string = (data.getConfig().short_description);
        } else {
            this['_item' + index].setVisible(false);
        }
    }

    _onClickButton1() {
        this.dispatchCustomCallback(1);
    }
    _onClickButton2() {
        this.dispatchCustomCallback(2);
    }
    _updateDesc(breakthrougth) {
        var strDescAwake = null, strDescBreak = null;
        if (breakthrougth == 1) {
            strDescAwake = Lang.get('historyherolist_cell_not_awake');
            strDescBreak = Lang.get('historyherolist_cell_not_break');
        } else if (breakthrougth == 2) {
            strDescAwake = Lang.get('historyherolist_cell_awakeup');
            strDescBreak = Lang.get('historyherolist_cell_not_break');
        } else if (breakthrougth == 3) {
            strDescAwake = Lang.get('historyherolist_cell_awakeup');
            strDescBreak = Lang.get('historyherolist_cell_broken');
        }
        return [
            strDescAwake,
            strDescBreak
        ];
    }
}