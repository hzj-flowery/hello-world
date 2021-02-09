import PopupChooseCellBase from "./PopupChooseCellBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Lang } from "../../lang/Lang";
import CommonDesValue from "../component/CommonDesValue";
import { FunctionCheck } from "../../utils/logic/FunctionCheck";
import { FunctionConst } from "../../const/FunctionConst";
import UIHelper from "../../utils/UIHelper";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { TextHelper } from "../../utils/TextHelper";
import { Colors } from "../../init";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseEquipCell extends PopupChooseCellBase {
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

    private static R_LEVEL_NORMAL_POSY = 30; // 精炼等级正常时y坐标
    private static R_LEVEL_JADE_POSY = 36; // 精炼等级有玉石槽y坐标

    public updateUI(index: number, data, notSlot): void {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, TypeConvertHelper.TYPE_EQUIPMENT);

        var baseId = data.getBase_id();
        var level = data.getLevel();
        var rank = data.getR_level();

        var commonIcon = this._item.getCommonIcon();
        var params = commonIcon.getItemParams();
        let equipmenticon = commonIcon.getIconTemplate();
        this._textRank.node.y = PopupChooseEquipCell.R_LEVEL_NORMAL_POSY;
        if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0] && !notSlot) {
            if (equipmenticon.updateJadeSlot(data.getJadeSysIds())) {
                this._textRank.node.y = (PopupChooseEquipCell.R_LEVEL_JADE_POSY);
            }
        }
        UIHelper.loadTexture(this._imageLevel, Path.getUICommonFrame('img_iconsmithingbg_0' + params.color));
        this._textLevel.string = (level);
        this._imageLevel.node.active = level > 0;
        this._textRank.string = '+' + rank;
        this._textRank.node.active = rank > 0;

        this._showAttrDes(data);

        var heroBaseId = data.heroBaseId;
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
        var info = UserDataHelper.getEquipAttrInfo(data);
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

// import CommonListCellBase from "../component/CommonListCellBase";
// import CommonDesValue from "../component/CommonDesValue";
// import CommonButtonSwitchLevel1 from "../component/CommonButtonSwitchLevel1";
// import CommonListItem from "../component/CommonListItem";
// import { handler } from "../../utils/handler";
// import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
// import { FunctionConst } from "../../const/FunctionConst";
// import { Path } from "../../utils/Path";
// import UIHelper from "../../utils/UIHelper";
// import { UserDataHelper } from "../../utils/data/UserDataHelper";
// import { TextHelper } from "../../utils/TextHelper";
// import { Colors } from "../../init";
// import { FunctionCheck } from "../../utils/logic/FunctionCheck";
// import { EquipDataHelper } from "../../utils/data/EquipDataHelper";

// const { ccclass, property } = cc._decorator;


// @ccclass
// export default class PopupChooseEquipCell extends CommonListItem {
//     private static R_LEVEL_NORMAL_POSY = 30;
//     private static R_LEVEL_JADE_POSY = 36;

//     @property({
//         type: cc.Node,
//         visible: true
//     })
//     _resourceNode: cc.Node = null;
//     @property({
//         type: CommonListCellBase,
//         visible: true
//     })
//     _item1: CommonListCellBase = null;
//     @property({
//         type: CommonListCellBase,
//         visible: true
//     })
//     _item2: CommonListCellBase = null;
//     @property({
//         type: cc.Sprite,
//         visible: true
//     })
//     _imageLevel1: cc.Sprite = null;
//     @property({
//         type: cc.Label,
//         visible: true
//     })
//     _textLevel1: cc.Label = null;
//     @property({
//         type: cc.Label,
//         visible: true
//     })
//     _textRank1: cc.Label = null;
//     @property({
//         type: cc.Label,
//         visible: true
//     })
//     _textYoke1: cc.Label = null;
//     @property({
//         type: cc.Label,
//         visible: true
//     })
//     _textHeroName1: cc.Label = null;
//     @property({
//         type: CommonDesValue,
//         visible: true
//     })
//     _nodeAttr1_1: CommonDesValue = null;
//     @property({
//         type: CommonDesValue,
//         visible: true
//     })
//     _nodeAttr1_2: CommonDesValue = null;
//     @property({
//         type: CommonButtonSwitchLevel1,
//         visible: true
//     })
//     _buttonChoose1: CommonButtonSwitchLevel1 = null;
//     @property({
//         type: cc.Sprite,
//         visible: true
//     })
//     _imageLevel2: cc.Sprite = null;
//     @property({
//         type: cc.Label,
//         visible: true
//     })
//     _textLevel2: cc.Label = null;
//     @property({
//         type: cc.Label,
//         visible: true
//     })
//     _textRank2: cc.Label = null;
//     @property({
//         type: cc.Label,
//         visible: true
//     })
//     _textYoke2: cc.Label = null;
//     @property({
//         type: cc.Label,
//         visible: true
//     })
//     _textHeroName2: cc.Label = null;
//     @property({
//         type: CommonDesValue,
//         visible: true
//     })
//     _nodeAttr2_1: CommonDesValue = null;
//     @property({
//         type: CommonDesValue,
//         visible: true
//     })
//     _nodeAttr2_2: CommonDesValue = null;
//     @property({
//         type: CommonButtonSwitchLevel1,
//         visible: true
//     })
//     _buttonChoose2: CommonButtonSwitchLevel1 = null;

//     onLoad() {
//         this._buttonChoose1.addClickEventListenerEx(handler(this, this._onButtonClicked1));
//         this._buttonChoose2.addClickEventListenerEx(handler(this, this._onButtonClicked2));
//     }

//     updateUI(index, itemLine) {
//         for (var i = 1; i <= 2; i++) {
//             this.updateCell(i, itemLine[i - 1]);
//             var item = this['_item' + i];
//         }
//     }

//     updateCell(index, data) {
//         if (data) {
//             this['_item' + index].node.active = (true);
//             var baseId = data.getBase_id();
//             var level = data.getLevel();
//             var rank = data.getR_level();
//             this['_item' + index].updateUI(TypeConvertHelper.TYPE_EQUIPMENT, baseId);
//             this['_item' + index].setTouchEnabled(true);
//             var icon = this['_item' + index].getCommonIcon();
//             var params = icon.getItemParams();
//             var equipmenticon = icon.getIconTemplate();
//             this['_textRank' + index].node.y = (PopupChooseEquipCell.R_LEVEL_NORMAL_POSY);
//             if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0]) {
//                 if (equipmenticon.updateJadeSlot(data.getJadeSysIds())) {
//                     this['_textRank' + index].node.y = (PopupChooseEquipCell.R_LEVEL_JADE_POSY);
//                 }
//             }

//             UIHelper.loadTexture(this['_imageLevel' + index], Path.getUICommonFrame('img_iconsmithingbg_0' + params.color));
//             this['_textLevel' + index].string = (level);
//             this['_imageLevel' + index].node.active = (level > 0);
//             this['_textRank' + index].string = ('+' + rank);
//             this['_textRank' + index].node.active = (rank > 0);
//             this._showAttrDes(index, data);
//              var heroBaseId = data.heroBaseId;
//             if (heroBaseId) {
//                 var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
//                 this['_textHeroName' + index].string = (heroParam.name);
//                 this['_textHeroName' + index].node.color = (heroParam.icon_color);
//                 this['_textHeroName' + index].node.active = (true);
//                 UIHelper.updateTextOutline(this['_textHeroName' + index], heroParam);
//             } else {
//                 this['_textHeroName' + index].node.active = (false);
//             }
//             this['_buttonChoose' + index].setString (data.btnDesc);
//             if (data.btnIsHightLight == false) {
//                 this['_buttonChoose' + index].switchToNormal();
//             } else {
//                 this['_buttonChoose' + index].switchToHightLight();
//             }
//             if (data.showRP == true) {
//                 this['_buttonChoose' + index].showRedPoint(true);
//             } else {
//                 this['_buttonChoose' + index].showRedPoint(false);
//             }
//             if (data.isYoke) {
//                 var width = this['_item' + index].getNameSizeWidth();
//                 this['_textYoke' + index].node.x = (120 + width);
//                 this['_textYoke' + index].node.active = (true);
//             } else {
//                 this['_textYoke' + index].node.active = (false);
//             }
//         } else {
//             this['_item' + index].node.active = (false);
//         }
//     }

//     _showAttrDes(index, data) {
//         var info = EquipDataHelper.getEquipAttrInfo(data);
//         var desInfo = TextHelper.getAttrInfoBySort(info);
//         for (var i = 1; i <= 2; i++) {
//             var one = desInfo[i];
//             if (one) {
//                 var [attrName, attrValue] = TextHelper.getAttrBasicText(one.id, one.value)
//                 attrName = TextHelper.expandTextByLen(attrName, 4);
//                 this['_nodeAttr' + (index + ('_' + i))].updateUI(attrName, '+' + attrValue, null, 5);
//                 this['_nodeAttr' + (index + ('_' + i))].setValueColor(Colors.BRIGHT_BG_GREEN);
//                 this['_nodeAttr' + (index + ('_' + i))].setVisible(true);
//             } else {
//                 this['_nodeAttr' + (index + ('_' + i))].setVisible(false);
//             }
//         }
//     }
//     _onButtonClicked1() {
//         this.dispatchCustomCallback(1);
//     }
//     _onButtonClicked2() {
//         this.dispatchCustomCallback(2);
//     }

// }