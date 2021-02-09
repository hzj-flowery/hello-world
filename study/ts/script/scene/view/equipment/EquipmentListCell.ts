const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import CommonListItem from '../../../ui/component/CommonListItem';
import { G_UserData, Colors } from '../../../init';
import { EquipmentData } from '../../../data/EquipmentData';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { FunctionConst } from '../../../const/FunctionConst';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { TextHelper } from '../../../utils/TextHelper';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import { Lang } from '../../../lang/Lang';
import { EquipDataHelper } from '../../../utils/data/EquipDataHelper';
import { handler } from '../../../utils/handler';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class EquipmentListCell extends CommonListItem {

    private static R_LEVEL_NORMAL_POSY = 30;
    private static R_LEVEL_JADE_POSY = 36;

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
    _imageLevel1: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRank1: cc.Label = null;
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
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen1: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLevel2: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel2: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRank2: cc.Label = null;
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
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen2: CommonButtonLevel1Highlight = null;

    onLoad() {
        this._buttonStrengthen1.setString(Lang.get("equipment_btn_strengthen"));
        this._buttonStrengthen2.setString(Lang.get("equipment_btn_strengthen"));
        this._buttonStrengthen1.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked1));
        this._buttonStrengthen2.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked2));
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

    updateCell(index, equipId) {
        if (typeof (equipId) != 'number') {
            return;
        }
        this['_item' + index].node.active = true;
        var data = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
        var baseId = data.getBase_id();
        var level = data.getLevel();
        var rank = data.getR_level();
        this['_item' + index].updateUI(TypeConvertHelper.TYPE_EQUIPMENT, baseId);
        this['_item' + index].setTouchEnabled(true);
        var icon = this['_item' + index].getCommonIcon();
        icon.getIconTemplate().setId(equipId);
        var equipmenticon = icon.getIconTemplate();
        this['_textRank' + index].node.y = (EquipmentListCell.R_LEVEL_NORMAL_POSY);
        if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0]) {
            var convertHeroBaseId = EquipDataHelper.getHeroBaseIdWithEquipId(equipId)[1];
            if (equipmenticon.updateJadeSlot(data.getJadeSysIds(), convertHeroBaseId)) {
                this['_textRank' + index].node.y = (EquipmentListCell.R_LEVEL_JADE_POSY);
            }
        }
        var params = icon.getItemParams();
        UIHelper.loadTexture(this['_imageLevel' + index], Path.getUICommonFrame('img_iconsmithingbg_0' + params.color));
        this['_textLevel' + index].string = (level);
        this['_textLevel' + index].node.color = (Colors.getNumberColor(params.color));
        UIHelper.enableOutline(this['_textLevel' + index], Colors.getNumberColorOutline(params.color));
        this['_imageLevel' + index].node.active = (level > 0);
        this['_textRank' + index].string = ('+' + rank);
        this['_textRank' + index].node.active = (rank > 0);
        this._showAttrDes(index, data);
        var heroUnitData = UserDataHelper.getHeroDataWithEquipId(data.getId());
        if (heroUnitData) {
            let baseId = heroUnitData.getBase_id();
            var limitLevel = heroUnitData.getLimit_level();
            var limitRedLevel = heroUnitData.getLimit_rtg();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
            this['_textHeroName' + index].string = (heroParam.name);
            this['_textHeroName' + index].node.color = (heroParam.icon_color);
            UIHelper.updateTextOutline(this['_textHeroName' + index], heroParam);
            this['_textHeroName' + index].node.active = (true);
        } else {
            this['_textHeroName' + index].node.active = (false);
        }
    }


    _showAttrDes(index, data) {
        var info = EquipDataHelper.getEquipAttrInfo(data);
        var desInfo = TextHelper.getAttrInfoBySort(info);
        for (var i = 1; i <= 2; i++) {
            var one = desInfo[i - 1];
            if (one) {
                var arr = TextHelper.getAttrBasicText(one.id, one.value);
                var attrName = arr[0], attrValue = arr[1];
                attrName = TextHelper.expandTextByLen(attrName, 4);
                this['_nodeAttr' + (index + ('_' + i))].updateUI(attrName, '+' + attrValue);
                this['_nodeAttr' + (index + ('_' + i))].setValueColor(Colors.BRIGHT_BG_GREEN);
                this['_nodeAttr' + (index + ('_' + i))].node.active = (true);
            } else {
                this['_nodeAttr' + (index + ('_' + i))].node.active = (false);
            }
        }
    }

    _onButtonStrengthenClicked1() {
        this.dispatchCustomCallback(0)
    }

    _onButtonStrengthenClicked2() {
        this.dispatchCustomCallback(1)
    }
}