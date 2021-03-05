const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import CommonHeroStar from '../../../ui/component/CommonHeroStar';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import { Lang } from '../../../lang/Lang';
import { G_UserData, Colors, G_SceneManager } from '../../../init';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { handler } from '../../../utils/handler';
import HorseConst from '../../../const/HorseConst';
import UIHelper from '../../../utils/UIHelper';
import AttributeConst from '../../../const/AttributeConst';
import { TextHelper } from '../../../utils/TextHelper';

@ccclass
export default class HorseListCell extends ListViewCellBase {

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
        type: cc.Label,
        visible: true
    })
    _textHeroName1: cc.Label = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _nodeStar1: CommonHeroStar = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr1_1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr1_2: CommonDesValue = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonUpStar1: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item2: CommonListCellBase = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName2: cc.Label = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _nodeStar2: CommonHeroStar = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2_1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2_2: CommonDesValue = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonUpStar2: CommonButtonLevel1Highlight = null;

    private _horseId1;
    private _horseId2;
    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._buttonUpStar1.setString(Lang.get('horse_btn_advance'));
        this._buttonUpStar2.setString(Lang.get('horse_btn_advance'));
        this._buttonUpStar1.addClickEventListenerEx(handler(this, this._onButtonUpStarClicked1));
        this._buttonUpStar2.addClickEventListenerEx(handler(this, this._onButtonUpStarClicked2));
    }

    updateUI(horseId1, horseId2) {
        this._horseId1 = horseId1;
        this._horseId2 = horseId2;
        let updateCell = (index, horseId) => {
            if (horseId) {
                if (typeof (horseId) != 'number') {
                    return;
                }
                this['_item' + index].setVisible(true);
                var data = G_UserData.getHorse().getUnitDataWithId(horseId);
                var baseId = data.getBase_id();
                var star = data.getStar();
                var name = HorseDataHelper.getHorseName(baseId, star);
                this['_item' + index].updateUI(TypeConvertHelper.TYPE_HORSE, baseId);
                this['_item' + index].setName(name);
                this['_item' + index].setTouchEnabled(true);
                this['_item' + index].setCallBack(handler(this, this['_onClickIcon' + index]));
                this['_item' + index].setEquipBriefVisible(true);
                this['_item' + index].updateEquipBriefBg(data.getConfig().color);
                var equipList = G_UserData.getHorseEquipment().getEquipedEquipListWithHorseId(horseId);
                var stateList = [
                    0,
                    0,
                    0
                ];
                for (let k in equipList) {
                    var equipData = equipList[k];
                    var config = equipData.getConfig();
                    stateList[config.type - 1] = config.color;
                }
                this['_item' + index].updateEquipBriefIcon(stateList);
                this['_nodeStar' + index].setCount(star, HorseConst.HORSE_STAR_MAX);
                this._showAttrDes(index, data);
                var heroUnitData = HorseDataHelper.getHeroDataWithHorseId(data.getId());
                if (heroUnitData) {
                    var heroBaseId = heroUnitData.getBase_id();
                    var limitLevel = heroUnitData.getLimit_level();
                    var limitRedLevel = heroUnitData.getLimit_rtg();
                    var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
                    this['_textHeroName' + index].string = (heroParam.name);
                    this['_textHeroName' + index].node.color = (heroParam.icon_color);
                    UIHelper.updateTextOutline(this['_textHeroName' + index], heroParam);
                    this['_textHeroName' + index].node.active = (true);
                } else {
                    this['_textHeroName' + index].node.active = (false);
                }
            } else {
                this['_item' + index].setVisible(false);
            }
        }
        updateCell(1, horseId1);
        updateCell(2, horseId2);
    }

    _showAttrDes(index, data) {
        var showAttrIds = [
            AttributeConst.ATK,
            AttributeConst.HP
        ];
        var info = HorseDataHelper.getHorseAttrInfo(data);
        for (var i = 1; i <= 2; i++) {
            var attrId = showAttrIds[i - 1];
            var value = info[attrId];
            if (value) {
                var [attrName, attrValue] = TextHelper.getAttrBasicText(attrId, value);
                attrName = TextHelper.expandTextByLen(attrName, 4);
                this['_nodeAttr' + (index + ('_' + i))].updateUI(attrName, '+' + attrValue);
                this['_nodeAttr' + (index + ('_' + i))].setValueColor(Colors.BRIGHT_BG_GREEN);
                this['_nodeAttr' + (index + ('_' + i))].setVisible(true);
            } else {
                this['_nodeAttr' + (index + ('_' + i))].setVisible(false);
            }
        }
    }

    _onButtonUpStarClicked1() {
        this.dispatchCustomCallback(1);
    }

    _onButtonUpStarClicked2() {
        this.dispatchCustomCallback(2);
    }

    _onClickIcon1(sender, itemParams) {
        var horseId = this._horseId1;
        G_SceneManager.showScene('horseDetail', horseId, HorseConst.HORSE_RANGE_TYPE_1);
    }

    _onClickIcon2(sender, itemParams) {
        var horseId = this._horseId2;
        G_SceneManager.showScene('horseDetail', horseId, HorseConst.HORSE_RANGE_TYPE_1);
    }
}