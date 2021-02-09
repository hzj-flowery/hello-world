import PopupChooseCellBase from "./PopupChooseCellBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Lang } from "../../lang/Lang";
import UIHelper from "../../utils/UIHelper";
import { RichTextExtend } from "../../extends/RichTextExtend";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseHeroCell extends PopupChooseCellBase {
    @property({
        type: cc.RichText,
        visible: true
    })
    _textDes: cc.RichText = null;

    public updateUI(index: number, data): void {
        if (data == null) {
            this.node.active = false;
            return;
        }
        super.updateUI(index, data, TypeConvertHelper.TYPE_HERO);
        var baseId = data.getBase_id();
        var limitLevel = data.getLimit_level();
        var limitRedLevel = data.getLimit_rtg()
        var commonIcon = this._item.getCommonIcon();
        commonIcon.getIconTemplate().updateUI(baseId, null, limitLevel, limitRedLevel);
        if (data.topImagePath && data.topImagePath != '') {
            commonIcon.setTopImage(data.topImagePath);
        }
        var params = commonIcon.getItemParams();
        var rank = data.getRank_lv();
        var heroName = params.name;
        if (rank > 0) {
            if (params.color == 7 && limitLevel == 0 && params.type != 1) {
                heroName = heroName + (' ' + (Lang.get('goldenhero_train_text') + rank));
            } else {
                heroName = heroName + ('+' + rank);
            }
        }
        if (!data.isPureGoldHero() && params.color == 7) {
           this._item.setName(heroName, params.icon_color, params);
        } else {
            this._item.setName(heroName, params.icon_color);
        }
        this._textDes.node.removeAllChildren();
        if (data.isPureGoldHero()) {
            data.richTextDesc = [];
            data.richTextDesc[0] = Lang.get('reborn_hero_list_rich_text3', { level: rank });
        }
        if (data.richTextDesc&&data.richTextDesc.length>0) {
            var height = this._textDes.node.getContentSize().height;
            for (var i in data.richTextDesc) {
                var desc = data.richTextDesc[i];
                var node = new cc.Node();
                var richWidget = node.addComponent(cc.RichText) as cc.RichText;
                // richWidget.setRichTextWithJson(desc);
                richWidget.maxWidth = 180;
                RichTextExtend.setRichTextWithJson(richWidget, desc);
                richWidget.node.setAnchorPoint(0, 1);
                // richWidget.node.setPosition(0, height - (parseInt(i)) * 25);
                richWidget.node.setPosition(0, - (parseInt(i)) * 25);
                this._textDes.node.addChild(richWidget.node);

            }
            this._textDes.string = " ";
        } else {
            this._textDes.string = (data.textDesc)==""?" ":data.textDesc;
        }
        this._buttonChoose.setString(data.btnDesc);
        if (data.btnIsHightLight == false) {
            this._buttonChoose.switchToNormal();
        } else {
            this._buttonChoose.switchToHightLight();
        }
        this._buttonChoose.setEnabled(data.btnEnable);
        this._buttonChoose.showRedPoint(data.btnShowRP);
    }
}

// import ListViewCellBase from "./ListViewCellBase";
// import { Lang } from "../lang/Lang";
// import CommonButtonSwitchLevel1 from "./component/CommonButtonSwitchLevel1";
// import { TypeConvertHelper } from "../utils/TypeConvertHelper";
// import CommonListCellBase from "./component/CommonListCellBase";
// import CommonListItem from "./component/CommonListItem";
// const {ccclass, property} = cc._decorator;

// @ccclass
// export default class PopupChooseHeroCell extends CommonListItem{

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
//         type: cc.Node,
//         visible: true
//     })
//     _buttonChoose1: CommonButtonSwitchLevel1 = null;

//     @property({
//         type: cc.Node,
//         visible: true
//     })
//     _buttonChoose2: CommonButtonSwitchLevel1 = null;

//     @property({
//         type: cc.RichText,
//         visible: true
//     })
//     _textDes1: cc.RichText = null;

//     @property({
//         type: cc.RichText,
//         visible: true
//     })
//     _textDes2: cc.RichText = null;

//     onLoad() {
//         var size = this._resourceNode.getContentSize();
//         this.node.setContentSize(size.width, size.height);
//         for (var i = 1;i<=2;i++) {
//             (this['_textDes' + i] as cc.RichText).lineHeight = 24;
//         }
//     }

//     updateUI(itemId, data):void{
//         this.updateData(data[0],data[1]);
//     }
//     updateData(data1, data2) {
//         var _this = this;
//         var updateCell = function (index, data) {
//             if (data) {
//                 var type = TypeConvertHelper.TYPE_HERO;
//                 var baseId = data.getBase_id();
//                 var limitLevel = data.getLimit_level();
//                 (_this['_item' + index] as CommonListCellBase).node.active = (true);
//                 (_this['_item' + index] as CommonListCellBase).updateUI(type, baseId);
//                 (_this['_item' + index] as CommonListCellBase).setTouchEnabled(true);
//                 var commonIcon = (_this['_item' + index] as CommonListCellBase).getCommonIcon();
//                 commonIcon.getIconTemplate().updateUI(baseId, null, limitLevel);
//                 if (data.topImagePath && data.topImagePath != '') {
//                     commonIcon.setTopImage(data.topImagePath);
//                 }
//                 var params = commonIcon.getItemParams();
//                 var rank = data.getRank_lv();
//                 var heroName = params.name;
//                 if (rank > 0) {
//                     if (params.color == 7 && limitLevel == 0 && params.type != 1) {
//                         heroName = heroName + (' ' + (Lang.get('goldenhero_train_text') + rank));
//                     } else {
//                         heroName = heroName + ('+' + rank);
//                     }
//                 }
//                 (_this['_item' + index] as CommonListCellBase).setName(heroName, params.icon_color);
//                 (_this['_textDes' + index] as cc.RichText).node.removeAllChildren();
//                 if (data.isPureGoldHero()) {
//                     data.richTextDesc = [];
//                     data.richTextDesc[0] = Lang.get('reborn_hero_list_rich_text3', { level: rank });
//                 }
//                 if (data.richTextDesc) {
//                     var height = (_this['_textDes' + index] as cc.RichText).node.getContentSize().height;
//                     for (var i in data.richTextDesc) {
//                         var desc = data.richTextDesc[i];
//                         var node = new cc.Node();
//                         var richWidget =node.addComponent(cc.RichText) as cc.RichText;
//                         // richWidget.setRichTextWithJson(desc);
//                         richWidget.string = desc;
//                         richWidget.node.setAnchorPoint(new cc.Vec2(0, 1));
//                         richWidget.node.setPosition(new cc.Vec2(0, height - (parseInt(i) - 1) * 25));
//                         (_this['_textDes' + index] as cc.RichText).node.addChild(richWidget.node);
//                     }
//                     (_this['_textDes' + index] as cc.RichText).string = ('');
//                 } else {
//                     (_this['_textDes' + index] as cc.RichText).string = (data.textDesc);
//                 }
//                 _this['_buttonChoose' + index].getComponent(CommonButtonSwitchLevel1).setString(data.btnDesc);
//                 if (data.btnIsHightLight == false) {
//                     _this['_buttonChoose' + index].getComponent(CommonButtonSwitchLevel1).switchToNormal();
//                 } else {
//                     _this['_buttonChoose' + index].getComponent(CommonButtonSwitchLevel1).switchToHightLight();
//                 }
//                 _this['_buttonChoose' + index].getComponent(CommonButtonSwitchLevel1).setEnabled(data.btnEnable);
//                 _this['_buttonChoose' + index].getComponent(CommonButtonSwitchLevel1).showRedPoint(data.btnShowRP);
//             } else {
//                 (_this['_item' + index] as CommonListCellBase).node.active =(false);
//             }
//         }.bind(this);
//         updateCell(1, data1);
//         updateCell(2, data2);
//     }
//     onButtonClicked1() {
//         this.dispatchCustomCallback(1);
//     }
//     onButtonClicked2() {
//         this.dispatchCustomCallback(2);
//     }
// }