import PopupChooseCellBase from "./PopupChooseCellBase";
import CommonDesValue from "../component/CommonDesValue";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import PopupChooseEquipCell from "./PopupChooseEquipCell";
import { FunctionCheck } from "../../utils/logic/FunctionCheck";
import { FunctionConst } from "../../const/FunctionConst";
import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { TextHelper } from "../../utils/TextHelper";
import { Colors } from "../../init";
import AttributeConst from "../../const/AttributeConst";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseInstrumentCell extends PopupChooseCellBase {
    @property({ type: cc.Label, visible: true })
    _textRank: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textHeroName: cc.Label = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_1: CommonDesValue = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_2: CommonDesValue = null;

    public updateUI(index: number, data, notSlot): void {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, TypeConvertHelper.TYPE_INSTRUMENT);

        var baseId = data.getBase_id();
        var level = data.getLevel();
        var limitLevel = data.getLimit_level();

        var commonIcon = this._item.getCommonIcon();
        commonIcon.getIconTemplate().updateUI(baseId, null, limitLevel);
        var params = commonIcon.getItemParams();
        this._item.setName(params.name, params.icon_color, params);

        this._textRank.string = '+' + level;
        this._textRank.node.active = level > 0;

        this._showAttrDes(data);

        var heroBaseId = data.heroBaseId;
        var limitLevel = data.limitLevel;
        var limitRedLevel = data.limitRedLevel;
        if (heroBaseId) {
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
            this._textHeroName.string = (heroParam.name);
            this._textHeroName.node.color = (heroParam.icon_color);
            this._textHeroName.node.active = (true);
            UIHelper.enableOutline(this._textHeroName, heroParam.icon_color_outline, 2);
        } else {
            this._textHeroName.node.active = (false);
        }

        this._buttonChoose.setString(data.btnDesc);
        this._buttonChoose.switchToNormal();
        this._buttonChoose.showRedPoint(data.showRP);
    }

    private _showAttrDes(data) {
        let showAttrIds = [AttributeConst.ATK, AttributeConst.HP] //需要显示的2种属性
        var info = UserDataHelper.getInstrumentAttrInfo(data);

        let nodesDes: CommonDesValue[] = [this._nodeAttr1_1, this._nodeAttr1_2];
        for (let i = 0; i < nodesDes.length; i++) {
            let attrId = showAttrIds[i]
            let value = info[attrId]
            if (value) {
                var [attrName, attrValue] = TextHelper.getAttrBasicText(attrId, value);
                attrName = TextHelper.expandTextByLen(attrName, 4);
                nodesDes[i].updateUI(attrName, '+' + attrValue, null, 5);
                nodesDes[i].setValueColor(Colors.BRIGHT_BG_GREEN);
                nodesDes[i].setVisible(true);
            } else {
                nodesDes[i].setVisible(false);
            }
        }
    }
}
