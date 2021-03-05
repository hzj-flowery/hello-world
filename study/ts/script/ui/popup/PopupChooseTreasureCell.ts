import PopupChooseCellBase from "./PopupChooseCellBase";
import CommonDesValue from "../component/CommonDesValue";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { TextHelper } from "../../utils/TextHelper";
import { Colors } from "../../init";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseTreasureCell extends PopupChooseCellBase {
    @property({ type: cc.Sprite, visible: true })
    _imageLevel: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _textLevel: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textRank: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textYoke: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textHeroName: cc.Label = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_1: CommonDesValue = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_2: CommonDesValue = null;
    @property({ type: CommonDesValue, visible: true })
    _nodeAttr1_3: CommonDesValue = null;

    public updateUI(index: number, data): void {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, TypeConvertHelper.TYPE_TREASURE);

        var baseId = data.getBase_id();
        var level = data.getLevel();
        var rank = data.getRefine_level();

        var commonIcon = this._item.getCommonIcon();
        var params = commonIcon.getItemParams();
        UIHelper.loadTexture(this._imageLevel, Path.getUICommonFrame('img_iconsmithingbg_0' + params.color));
        this._textLevel.string = (level);
        this._imageLevel.node.active = level > 0;
        this._textRank.string = '+' + rank;
        this._textRank.node.active = rank > 0;

        this._showAttrDes(data);

        var heroBaseId = data.heroBaseId;
        if (heroBaseId instanceof Array) {
            heroBaseId = heroBaseId[0]
        }
        if (heroBaseId) {
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
            this._textHeroName.string = (heroParam.name);
            this._textHeroName.node.color = (heroParam.icon_color);
            this._textHeroName.node.active = (true);
            UIHelper.updateTextOutline(this._textHeroName, heroParam);
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

        if (data.isYoke) {
            this._textYoke.node.x = 120 + this._item.getNameSizeWidth();
            this._textYoke.node.active = true;
        }
        else {
            this._textYoke.node.active = false;
        }
    }

    private _showAttrDes(data) {
        var info = UserDataHelper.getTreasureAttrInfo(data);
        let desInfo = TextHelper.getAttrInfoBySort(info);

        let nodesDes: CommonDesValue[] = [this._nodeAttr1_1, this._nodeAttr1_2, this._nodeAttr1_3];
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