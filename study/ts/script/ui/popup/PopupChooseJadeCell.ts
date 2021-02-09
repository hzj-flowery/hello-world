import CommonListItem from "../component/CommonListItem";

import CommonListCellBase from "../component/CommonListCellBase";

import CommonButtonSwitchLevel1 from "../component/CommonButtonSwitchLevel1";

import CommonDesValue from "../component/CommonDesValue";

import { handler } from "../../utils/handler";

import { TypeConvertHelper } from "../../utils/TypeConvertHelper";

import { Lang } from "../../lang/Lang";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseJadeCell extends CommonListItem {

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
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button1: CommonButtonSwitchLevel1 = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_2: cc.Node = null;
    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _button2: CommonButtonSwitchLevel1 = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName2: cc.Label = null
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2: CommonDesValue = null;

    _isChange: any;

    onLoad() {
        this._button1.addClickEventListenerEx(handler(this, this._onClickButton1));
        this._button2.addClickEventListenerEx(handler(this, this._onClickButton2));
    }
    _onClickButton1() {
        this.dispatchCustomCallback(1);
   }
   _onClickButton2() {
       this.dispatchCustomCallback(2);
   }

    updateUI(index, itemLine) {
        this._isChange = itemLine[2];
        for (var i = 1; i <= 2; i++) {
            this.updateCell(i, itemLine[i - 1]);
        }
    }

    updateCell(index, data) {
        if (data) {
            if (data.showRP == true) {
                this['_button' + index].showRedPoint(true);
            } else {
                this['_button' + index].showRedPoint(false);
            }
            this['_item' + index].node.active = (true);
            var baseId = data.getSys_id();
            this['_item' + index].updateUI(TypeConvertHelper.TYPE_JADE_STONE, baseId);
            this['_item' + index].setTouchEnabled(true);
            var icon = this['_item' + index].getCommonIcon();
            var params = icon.getItemParams();
            this._showAttrDes(index, data);
            var heroUnitData = data.getEquipHeroBaseData();
            if (heroUnitData) {
                var heroBaseId = heroUnitData.getBase_id();
                var limitLevel = heroUnitData.getLimit_level();
                var limitRedLevel = heroUnitData.getLimit_rtg();
                var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
                this['_textHeroName' + index].setString(heroParam.name);
                this['_textHeroName' + index].setColor(heroParam.icon_color);
                this['_textHeroName' + index].node.active = (true);
                UIHelper.updateTextOutline(this['_textHeroName' + index], heroParam);
            } else {
                this['_textHeroName' + index].node.active = (false);
            }
            if (data.isInEquipment()) {
                this['_button' + index].setString(Lang.get('equipment_choose_jade_cell_btn1'));
                this['_button' + index].switchToNormal();
            } else {
                var text = Lang.get('equipment_choose_jade_cell_btn2');
                if (this._isChange) {
                    text = Lang.get('equipment_choose_jade_cell_btn4');
                }
                this['_button' + index].setString(text);
                this['_button' + index].switchToHightLight();
            }
        } else {
            this['_item' + index].node.active = (false);
        }
    }

    _showAttrDes(index, data) {
        var desInfo = data.getConfig().profile;
        this['_nodeAttr' + index].updateUI(desInfo, '', null, 5);
        //todo
      //  this['_nodeAttr' + index].updateUI('', '', null, 5);
        //     this['_nodeAttr' + index].setValueToRichText(desInfo, 160);
    }
}