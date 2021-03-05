import UIHelper from "../../../utils/UIHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelDamage extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _textCount: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeText: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textDamage: cc.Label = null;

    private _richText;
    private _richTextParams;

    public updateUI(damage, richText, _richTextParams) {
        this._textCount.string = damage;
        this._richText = richText;
        this._richTextParams = _richTextParams;
        this._updateRichText();
    }

    private _updateRichText() {
        if (this._richText == null) {
            return;
        }
        this._nodeText.removeAllChildren();
        if (this._richTextParams) {
            var widget = UIHelper.createMultiAutoCenterRichText(this._richText, this._richTextParams.defaultColor, this._richTextParams.fontSize, this._richTextParams.YGap, this._richTextParams.alignment, this._richTextParams.widthLimit);
            widget.setAnchorPoint(0.5, 0.5);
            this._nodeText.addChild(widget);
        } else {
            var widget = RichTextExtend.createWithContent(this._richText).node;
            widget.setAnchorPoint(0.5, 0.5);
            this._nodeText.addChild(widget);
        }
        this._nodeText.active = (true);
        this._textCount.node.active = (false);
        this._textDamage.node.active = (false);
    }
}