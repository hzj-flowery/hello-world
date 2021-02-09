const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import { Lang } from '../../../lang/Lang';
import { G_UserData } from '../../../init';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Path } from '../../../utils/Path';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import UIHelper from '../../../utils/UIHelper';
import CommonHistoryHeroIcon from '../../../ui/component/CommonHistoryHeroIcon';

var TOPIMAGERES = ['img_iconsign_shangzhen'];

@ccclass
export default class PackageHistoryHeroCell extends CommonListItem {

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
        type: CommonHistoryHeroIcon,
        visible: true
    })
    _historyIcon1: CommonHistoryHeroIcon = null;
    @property({
        type: CommonHistoryHeroIcon,
        visible: true
    })
    _historyIcon2: CommonHistoryHeroIcon = null;
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
    @property({
        type: cc.Label,
        visible: true
    })
    _equipedName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _equipedName2: cc.Label = null;
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



    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._buttonGo1.setString(Lang.get('common_btn_equip'));
        this._buttonGo2.setString(Lang.get('common_btn_equip'));
        for (let i = 1; i <= 2; i++) {
            this['_buttonGo' + i].addClickEventListenerEx( ()=> {
                this.dispatchCustomCallback(i);
            });
        }
    }
    updateUI(index, itemLine) {
        for (var i = 1; i <= 2; i++) {
            var item = this['_item' + i] as CommonListCellBase;
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
                (this['_item' + index] as CommonListCellBase).setVisible(false);
                return;
            }
            var type = TypeConvertHelper.TYPE_HISTORY_HERO;
            var baseId = 0;
            var size = null;
            this['_buttonGo' + index].setVisible(true);
            baseId = data.getSystem_id();
            var param = TypeConvertHelper.convert(type, baseId, size);
            (this['_item' + index] as CommonListCellBase).setVisible(true);
            (this['_item' + index] as CommonListCellBase).updateUI(type, baseId, size, param);
            (this['_historyIcon' + index] as CommonHistoryHeroIcon).updateUIWithUnitData(data, 1);
            (this['_historyIcon' + index] as CommonHistoryHeroIcon).setRoundType(false);
            this._showTopImage(index, data.getId());
            this['_desc' + index].string = (data.getConfig().short_description);
            var [isOnFormation, pos] = G_UserData.getHistoryHero().isStarEquiped(data.getId());
            var heroParam = this._getEquipedHeroParam(pos);
            if (heroParam) {
                this['_equipedName' + index].string = (heroParam.name);
                this['_equipedName' + index].node.color = (heroParam.icon_color);
                UIHelper.updateTextOutline(this['_equipedName' + index], heroParam);
            } else {
                this['_equipedName' + index].string = ('');
            }
        } else {
            (this['_item' + index] as CommonListCellBase).setVisible(false);
        }
    }

    _onClickButton1() {
        this.dispatchCustomCallback(1);
    }
    _onClickButton2() {
        this.dispatchCustomCallback(2);
    }
    _showTopImage(index, id) {
        var imageTop = this['_imageTop' + index];
        var [isInBattle, _] = G_UserData.getHistoryHero().isStarEquiped(id);
        if (isInBattle) {
           UIHelper.loadTexture( imageTop, Path.getTextSignet(TOPIMAGERES[0]));
            imageTop.node.active = (true);
        } else {
            imageTop.node.active = (false);
        }
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
    _getEquipedHeroParam(pos) {
        if (pos) {
            var curHeroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var curHeroData = G_UserData.getHero().getUnitDataWithId(curHeroId);
            var baseId = curHeroData.getBase_id();
            var limitLevel = curHeroData.getLimit_level();
            var limitRedLevel = curHeroData.getLimit_rtg();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
            return heroParam;
        }
        return null;
    }


}