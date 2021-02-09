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

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseHorseCell extends PopupChooseCellBase {
    // @property({ type: CommonHeroStarBig, visible: true })
    // _nodeStar: CommonHeroStarBig = null;
    @property({ type: cc.Label, visible: true })
    _textHeroName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textTip: cc.Label = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_1: CommonDesValue = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_2: CommonDesValue = null;


    public updateUI(index: number, data): void {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, TypeConvertHelper.TYPE_HORSE);

        var baseId = data.getBase_id();
        var star = data.getStar();
        var name = HorseDataHelper.getHorseName(baseId, star);

        this._item.setName(name);
        this._item.setEquipBriefVisible(true);
        this._item.updateEquipBriefBg(data.getConfig().color);
        // this._nodeStar.setCount(star, HorseConst.HORSE_STAR_MAX);

        let equipList: any[] = G_UserData.getHorseEquipment().getEquipedEquipListWithHorseId(data.getId())
        let stateList = [0, 0, 0]
        for (let i = 0; i < equipList.length; i++) {
            let config = equipList[i].getConfig();
            stateList[config.type - 1] = config.color;
        }
        this._item.updateEquipBriefIcon(stateList)

        this._showAttrDes(data);

        var heroBaseId = data.heroBaseId;
        var limitLevel = data.limitLevel;
        var limitRedLevel = data.limitRedLevel;
        if (heroBaseId) {
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
            this._textHeroName.string = (heroParam.name);
            this._textHeroName.node.color = (heroParam.icon_color);
            UIHelper.enableOutline(this._textHeroName, heroParam.icon_color_outline, 2);
            this._textHeroName.node.active = (true);
        } else {
            this._textHeroName.node.active = (false);
        }

        if (data.strSuit) {
            this._buttonChoose.setVisible(false);
            this._textTip.node.active = true;
            this._textTip.string = Lang.get("horse_suit_ride_tip", { type: data.strSuit });
        }
        else {
            this._textTip.node.active = false;
            this._buttonChoose.setVisible(true);
            this._buttonChoose.setString(data.btnDesc);
            this._buttonChoose.switchToNormal();
        }
    }

    private _showAttrDes(data) {
        let showAttrIds = [AttributeConst.ATK, AttributeConst.HP] //需要显示的2种属性
        var info = HorseDataHelper.getHorseAttrInfo(data);

        let nodesDes: CommonDesValue[] = [this._nodeAttr1_1, this._nodeAttr1_2];
        for (let i = 0; i < nodesDes.length; i++) {
            let attrId = showAttrIds[i]
            let value = info[attrId]
            if (value) {
                var [attrName, attrValue] = TextHelper.getAttrBasicText(attrId, value);
                attrName = TextHelper.expandTextByLen(attrName, 4);
                nodesDes[i].updateUI(attrName, '+' + attrValue);
                nodesDes[i].setValueColor(Colors.BRIGHT_BG_GREEN);
                nodesDes[i].setVisible(true);
            } else {
                nodesDes[i].setVisible(false);
            }
        }
    }
}