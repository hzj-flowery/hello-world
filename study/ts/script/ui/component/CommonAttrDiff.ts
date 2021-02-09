import { Lang } from "../../lang/Lang";
import { Colors } from "../../init";
import { TextHelper } from "../../utils/TextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonAttrDiff extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCurValue: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNextValue: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageUpArrow: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAddValue: cc.Label = null;

    updateValue(attrId, curValue, nextValue, nameLen) {
        if (attrId == null || curValue == null) {
            return;
        }
        var arr = TextHelper.getAttrBasicPlusText(attrId, curValue);
        var name = arr[0], value1 = arr[1];
        if (nameLen) {
            name = TextHelper.expandTextByLen(name, nameLen);
        }
        this._textName.string = (name + '\uFF1A');
        this._textCurValue.string = (value1);
        if (nextValue == null) {
            this._textNextValue.string = (Lang.get('equipment_strengthen_max_level'));
            this._textNextValue.node.color = (Colors.BRIGHT_BG_GREEN);
            this._imageUpArrow.node.active = (false);
            this._textAddValue.string = ('');
            return;
        }
        var [tmp1, value2] = TextHelper.getAttrBasicPlusText(attrId, nextValue);
        var [tmp2, value3] = TextHelper.getAttrBasicPlusText(attrId, nextValue - curValue);
        this._textNextValue.string = (value2);
        this._textNextValue.node.color = (Colors.BRIGHT_BG_ONE);
        this._imageUpArrow.node.active = (true);
        this._textAddValue.string = (value3);
    }
    updateInfo(attrId, curValue, nextValue, nameLen) {
        return this.updateValue(attrId, curValue, nextValue, nameLen);
        // if (attrId == null || curValue == null) {
        //     return;
        // }
        // var name = TextHelper.getAttrBasicText(attrId, curValue), value1;
        // if (nameLen) {
        //     name = TextHelper.expandTextByLen(name, nameLen);
        // }
        // this._textName.string = (name + '\uFF1A');
        // this._textCurValue.string = (value1);
        // if (nextValue == null) {
        //     this._textNextValue.string = (Lang.get('equipment_strengthen_max_level'));
        //     this._textNextValue.node.color = (Colors.BRIGHT_BG_GREEN);
        //     this._imageUpArrow.node.active = (false);
        //     this._textAddValue.string = ('');
        //     return;
        // }
        // var _ = TextHelper.getAttrBasicText(attrId, nextValue), value2;
        // var _ = TextHelper.getAttrBasicText(attrId, nextValue - curValue), value3;
        // this._textNextValue.string = (value2);
        // this._textNextValue.node.color = (Colors.BRIGHT_BG_ONE);
        // this._imageUpArrow.node.active = (true);
        // this._textAddValue.string = (value3);
    }
    setNameColor(color) {
        if (color == null) {
            return;
        }
        this._textName.node.color = (color);
    }
    setCurValueColor(color) {
        if (color == null) {
            return;
        }
        this._textCurValue.node.color = (color);
    }
    setNextValueColor(color) {
        if (color == null) {
            return;
        }
        this._textNextValue.node.color = (color);
    }
    setAddValueColor(color) {
        if (color == null) {
            return;
        }
        this._textAddValue.node.color = (color);
    }
    showArrow(visible) {
        this._imageUpArrow.node.active = (visible);
    }
    showDiffValue(visible) {
        this._textAddValue.node.active = (visible);
    }
    setVisible(visible) {
        this.node.active = visible;
    }
}