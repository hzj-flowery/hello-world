const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { handler } from '../../../utils/handler';
import { G_UserData, Colors, G_SceneManager } from '../../../init';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import { Lang } from '../../../lang/Lang';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import { HorseEquipDataHelper } from '../../../utils/data/HorseEquipDataHelper';
import { TextHelper } from '../../../utils/TextHelper';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import HorseConst from '../../../const/HorseConst';

@ccclass
export default class HorseEquipListCell extends ListViewCellBase {

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
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2_1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2_2: CommonDesValue = null;

    private _equipData1;
    private _equipData2;
    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    updateUI(equipData1, equipData2) {
        this._equipData1 = equipData1;
        this._equipData2 = equipData2;
        let updateCell = (index, equipData) => {
            if (equipData) {
                if (typeof (equipData) != 'object') {
                    return;
                }
                this['_item' + index].setVisible(true);
                var baseId = equipData.getBase_id();
                var name = equipData.getConfig().name;
                this['_item' + index].updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, baseId);
                this['_item' + index].setName(name);
                this['_item' + index].setTouchEnabled(true);
                this['_item' + index].setCallBack(handler(this, this['_onClickIcon' + index]));
                this._showAttrDes(index, equipData);
                var horseId = equipData.getHorse_id();
                if (horseId == 0) {
                    this['_textHeroName' + index].node.active = (false);
                } else {
                    var horseUnitData = G_UserData.getHorse().getUnitDataWithId(horseId);
                    if (horseUnitData && horseUnitData.isInBattle()) {
                        var heroUnitData = HorseDataHelper.getHeroDataWithHorseId(horseId);
                        if (heroUnitData) {
                            var heroBaseId = heroUnitData.getBase_id();
                            var limitLevel = heroUnitData.getLimit_level();
                            var limitRedLevel = heroUnitData.getLimit_rtg();
                            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
                            var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, baseId);
                            this['_textHeroName' + index].node.active = (true);
                            this['_textHeroName' + index].string = (heroParam.name + Lang.get('horse_equip_wear'));
                            this['_textHeroName' + index].node.color = (equipParam.icon_color);
                        } else {
                            this['_textHeroName' + index].node.active = (false);
                        }
                    } else {
                        this['_textHeroName' + index].node.active = (false);
                    }
                }
            } else {
                this['_item' + index].setVisible(false);
            }
        }
        updateCell(1, equipData1);
        updateCell(2, equipData2);
    }

    _showAttrDes(index, data) {
        var info = HorseEquipDataHelper.getHorseEquipAttrInfo(data);
        var showList = [];
        for (let k in info) {
            var v = info[k];
            showList.push({
                id: k,
                value: v
            });
        }
        for (var i = 1; i <= 2; i++) {
            var attrId = null;
            var value = null;
            if (showList[i - 1]) {
                attrId = showList[i - 1].id;
                value = showList[i - 1].value;
            }
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
        G_SceneManager.showScene('horseEquipDetail', this._equipData1, HorseConst.HORSE_EQUIP_RANGE_TYPE_1);
    }

    _onClickIcon2(sender, itemParams) {
        G_SceneManager.showScene('horseEquipDetail', this._equipData2, HorseConst.HORSE_EQUIP_RANGE_TYPE_1);
    }
}