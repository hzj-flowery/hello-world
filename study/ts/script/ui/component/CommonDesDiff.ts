import { Colors } from "../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonDesDiff extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue2: cc.Label = null;
    _fontSize: number;
    _desColor: any;
    _valueColor1: any;
    _valueColor2: any;
    _space1: number;
    _space2: number;

    constructor() {
        super();
        this._fontSize = 20;
        this._desColor = Colors.BRIGHT_BG_TWO;
        this._valueColor1 = Colors.DARK_BG_ONE;
        this._valueColor2 = Colors.DARK_BG_ONE;
        this._space1 = 40;
        this._space2 = 210;
    }
    updateUI(des, value1, value2) {
        this._textDes.fontSize = (this._fontSize);
        this._textValue1.fontSize = (this._fontSize);
        this._textValue2.fontSize = (this._fontSize);
        this._textDes.node.color = (this._desColor);
        this._textValue1.node.color = (this._valueColor1);
        this._textValue2.node.color = (this._valueColor2);
        this._textValue1.node.x = (this._space1);
        this._textValue2.node.x = (this._space2);
        this._textDes.string = (des);
        this._textValue1.string = (value1);
        this._textValue2.string = (value2);
    }
    setDesColor(color) {
        this._desColor = color;
    }
    setValueColor1(color) {
        this._valueColor1 = color;
    }
    setValueColor2(color) {
        this._valueColor2 = color;
    }
    setFontSize(fontSize) {
        this._fontSize = fontSize;
    }
    setSpace1(width) {
        this._space1 = width;
    }
    setSpace2(width) {
        this._space2 = width;
    }

}