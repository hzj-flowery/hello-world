
const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonDesValue extends cc.Component {

    private readonly SPACE_WIDTH = 0;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMax: cc.Label = null;

    _textRichValue: cc.RichText;

    updateUI(des, value, max?, space?) {
        var dis = space || this.SPACE_WIDTH;
        this._textDes.string = (des);
        this._textValue.string = (value);
        this._textDes['_updateRenderData'](true);
        var sizeDes = this._textDes.node.getContentSize();
        var posValue = sizeDes.width + dis;
        this._textValue.node.x = (posValue);
        this._textValue['_updateRenderData'](true);
        var sizeValue = this._textValue.node.getContentSize();
        var posMax = posValue + sizeValue.width;
        this._textMax.node.x = (posMax);
        if (max) {
            this._textMax.string = ('/' + max);
            this._textMax.node.active = true;
        } else {
            this._textMax.node.active = false;
        }
    }
    setDesColor(color) {
        if (color == null) {
            return;
        }
        this._textDes.node.color = (color);
    }
    setValueColor(color) {
        if (color == null) {
            return;
        }
        this._textValue.node.color = (color);
    }
    setMaxColor(color) {
        if (color == null) {
            return;
        }
        this._textMax.node.color = (color);
    }
    setMaxValue(txt) {
        this._textMax.string = (txt);
    }
    setValueToRichText(value, width) {
        if (this._textRichValue) {
            this._textRichValue.node.destroy();
            this._textRichValue = null;
        }
        var x = this._textValue.node.x, y = this._textValue.node.y;

        var node_textRichValue: cc.Node = new cc.Node;
        node_textRichValue.color = this._textValue.node.color;
        this._textRichValue = node_textRichValue.addComponent(cc.RichText);
        this._textRichValue.maxWidth = width;
        this._textRichValue.fontSize = this._textRichValue.lineHeight = this._textValue.fontSize;
        node_textRichValue.setAnchorPoint(0, 1);
        this._textRichValue.string = value;
        this.node.addChild(node_textRichValue);
        node_textRichValue.setPosition(x, y + 11.5);
        this._textValue.node.active = false;
        return this._textRichValue.node.height;
    }
    setFontSize(fontSize) {
        this._textDes.fontSize = (fontSize);
        this._textValue.fontSize = (fontSize);
        this._textMax.fontSize = (fontSize);
    }

    setVisible(v) {
        this.node.active = v;
    }
}