import { RichTextExtend } from "../../../extends/RichTextExtend";
import { HomelandConst } from "../../../const/HomelandConst";
import { Lang } from "../../../lang/Lang";
import { HomelandHelp } from "./HomelandHelp";
import { Colors } from "../../../init";
import { stringUtil } from "../../../utils/StringUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomelandPrayHandbookNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _nodeDes: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _imageEmpty: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageBg: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _textColor: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textTime: cc.Label = null;

    updateUI(data) {
        if (data.isHave) {
            this._imageEmpty.node.active = (false);
            this._imageBg.node.active = (true);
            var info = data.cfg;
            this._textColor.string = (info.color_text);
            this._textName.string = (info.name);
            var strTime = '';
            if (info.type == HomelandConst.TREE_BUFF_TYPE_3) {
                strTime = Lang.get('homeland_buff_duration');
            }
            this._textTime.string = (strTime);
            var template = stringUtil.gsub(info.description, '#%w+#', '$c103_%1$');
            var value = HomelandHelp.getValueOfBuff(info.value, info.equation);
            var times = HomelandHelp.getTimesOfBuff(info.times, info.type);
            var formatStr = Lang.getTxt(template, {
                value: value,
                times: times
            });
            var params = {
                defaultColor: Colors.NORMAL_BG_ONE,
                defaultSize: 20
            };
            var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
            richText.node.setAnchorPoint(cc.v2(0, 1));
            richText.maxWidth = 200;
            this._nodeDes.removeAllChildren();
            this._nodeDes.addChild(richText.node);
        } else {
            this._imageEmpty.node.active = (true);
            this._imageBg.node.active = (false);
        }
    }
}