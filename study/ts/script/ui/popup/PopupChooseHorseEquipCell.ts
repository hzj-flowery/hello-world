import PopupChooseCellBase from "./PopupChooseCellBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Lang } from "../../lang/Lang";
import CommonDesValue from "../component/CommonDesValue";
import CommonHeroStarBig from "../component/CommonHeroStarBig";
import { HorseDataHelper } from "../../utils/data/HorseDataHelper";
import HorseConst from "../../const/HorseConst";
import { G_UserData, Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";
import AttributeConst from "../../const/AttributeConst";
import { TextHelper } from "../../utils/TextHelper";
import { HorseEquipDataHelper } from "../../utils/data/HorseEquipDataHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseHorseEquipCell extends PopupChooseCellBase {
    @property({ type: cc.Label, visible: true })
    _textHeroName: cc.Label = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_1: CommonDesValue = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_2: CommonDesValue = null;

    public updateUI(index: number, data): void {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, TypeConvertHelper.TYPE_HORSE_EQUIP);

        var baseId = data.getBase_id();

        var commonIcon = this._item.getCommonIcon();
        var params = commonIcon.getItemParams();

        this._showAttrDes(data);

        if (data.horseId != 0) {
            var horseUnitData = G_UserData.getHorse().getUnitDataWithId(data.horseId);
            if (horseUnitData && horseUnitData.isInBattle()) {
                var heroUnitData = HorseDataHelper.getHeroDataWithHorseId(data.horseId);
                if (heroUnitData) {
                    var heroBaseId = heroUnitData.getBase_id();
                    var limitLevel = heroUnitData.getLimit_level();
                    var limitRedLevel = heroUnitData.getLimit_rtg();
                    var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
                    this._textHeroName.node.active = (true);
                    this._textHeroName.string = (heroParam.name + Lang.get("horse_equip_wear"));
                    this._textHeroName.node.color = (params.icon_color);
                }
                else {
                    this._textHeroName.node.active = (false);
                }
            }
            else {
                this._textHeroName.node.active = (false);
            }
        } else {
            this._textHeroName.node.active = (false);
        }

        this._buttonChoose.setString(data.btnDesc);
        if (data.btnIsHightLight == false) {
            this._buttonChoose.switchToNormal();
        } else {
            this._buttonChoose.switchToHightLight();
        }
        this._buttonChoose.showRedPoint(data.showRP);
    }

    private _showAttrDes(data) {
        var info = HorseEquipDataHelper.getHorseEquipAttrInfo(data);
        let desInfo = TextHelper.getAttrInfoBySort(info);

        let nodesDes: CommonDesValue[] = [this._nodeAttr1_1, this._nodeAttr1_2];
        for (let i = 0; i < nodesDes.length; i++) {
            var one = desInfo[i];
            if (one) {
                var [attrName, attrValue] = TextHelper.getAttrBasicText(one.id, one.value);
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