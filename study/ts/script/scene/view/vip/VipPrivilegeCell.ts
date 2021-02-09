import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";
import { RichTextHelper } from "../../../utils/RichTextHelper";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VipPrivilegeCell extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTitle: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDesc: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _richNode: cc.Node = null;


    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(textTitle, textDesc, isRed) {
        this._textTitle.string = (Lang.get('lang_vip_privilege_title', { title: textTitle }));
        (this._textTitle as any)._updateRenderData(true);
        this._textDesc.string = (textDesc);
        this._textDesc.node.x = (this._textTitle.node.x + this._textTitle.node.getContentSize().width);
        var descColor:cc.Color = null;
        if (isRed && isRed == true) {
            this._textTitle.node.color = (Colors.NORMAL_BG_ONE);
            this._textDesc.node.color = (Colors.NORMAL_BG_ONE);
            descColor = Colors.NORMAL_BG_ONE;
        }
        this._richNode.x = (this._textTitle.node.x + this._textTitle.node.getContentSize().width);
        this._richNode.removeAllChildren();
        var subTitles = RichTextHelper.parse2SubTitleExtend(textDesc, true);
        var titleColor = descColor || Colors.BRIGHT_BG_GREEN;
        var elementColor = descColor || Colors.NORMAL_BG_ONE;
        let curPosx = 0;
        for(var i=0; i<subTitles.length; i++){
            let item = subTitles[i];
            let label = UIHelper.createLabel().getComponent(cc.Label);
            if(item.type == "msg"){
                label.string = item.content;
                label.node.color = elementColor;
            }else if(item.type == "replace"){
                let result = (item.content as string).replace(/#/g, '');
                label.string = result;
                label.node.color = titleColor;
            }
            label.verticalAlign = cc.Label.VerticalAlign.CENTER;
            label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            label.node.setAnchorPoint(0,0.5);
            label.fontSize = 22;
            label.node.x = curPosx;
            this._richNode.addChild(label.node);
            (label as any)._updateRenderData(true);
            curPosx += label.node.width;
        }
        
        // subTitles = RichTextHelper.fillSubTitleUseColor(subTitles, [
        //     null,
        //     '#'+titleColor.toHEX("#rrggbb"),
        //     null
        // ]);
        // var elementColor = descColor || Colors.NORMAL_BG_ONE;
        // var richElementList = RichTextHelper.convertSubTitleToRichMsgArr({
        //     textColor: '#'+elementColor.toHEX("#rrggbb"),
        //     fontSize: 22
        // }, subTitles);
        // var richStr = JSON.stringify(richElementList);//json.encode(richElementList);
        // var labelText = RichTextExtend.createWithContent(richStr);
        // labelText.node.setAnchorPoint(cc.v2(0, 0.5));
        //labelText.node.setCascadeOpacityEnabled(true);
        //this._richNode.addChild(labelText.node);
    }

}
