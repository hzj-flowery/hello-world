import { TextHelper } from "../../utils/TextHelper";
import UIHelper from "../../utils/UIHelper";

var SPACE_WIDTH = 0;
const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonAttrNode extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue: cc.Label = null;

    updateTxtValue(str) {
        this._textValue.string = str;
    }

    updateValue(attrId, value, space?, nameLen?) {
        if (!attrId || attrId == 0 || !value) {
            this.node.active = (false);
            return;
        }
        var dis = space || SPACE_WIDTH;
        var ret = TextHelper.getAttrBasicPlusText(attrId, value);
        var attrName = ret[0];
        var attrValue = ret[1];
        if (nameLen) {
            attrName = TextHelper.expandTextByLen(attrName, nameLen);
        }
        else {
            nameLen = 0;
        }
        this._textName.string = (attrName + ':');
        this._textValue.string = (attrValue);
        UIHelper.updateLabelSize(this._textName);
        var sizeName = this._textName.node.getContentSize();
        var posValue = sizeName.width + dis + nameLen * this._textName.fontSize / 2;
        this._textValue.node.x = (posValue);
        this.node.active = (true);
    }
    updateView(attrId, value, space?, nameLen?) {
        if (!attrId || attrId == 0 || value == null) {
            this.node.active = (false);
            return;
        }


        var dis = space || SPACE_WIDTH;
        var ret = TextHelper.getAttrBasicPlusText(attrId, value);
        var attrName: string = ret[0];
        var attrValue = ret[1];
        if (nameLen) {
            attrName = TextHelper.expandTextByLen(attrName, nameLen);
        }
        else {
            nameLen = attrName.length - 2;
        }
        this._textName.string = (attrName + ':');
        this._textValue.string = (attrValue);
        this._textName["_updateRenderData"](true);
        var sizeName = this._textName.node.getContentSize();
        var posValue = sizeName.width + dis;
        this._textValue.node.x = (posValue);
        this.node.active = (true);
    }
    setFontSize(fontSize) {
        this._textName.fontSize = (fontSize);
        this._textValue.fontSize = (fontSize);
    }
    setNameColor(color) {
        this._textName.node.color = (color);
    }
    setValueColor(color) {
        this._textValue.node.color = (color);
    }
    alignmentCenter() {
        var size1 = this._textName.node.getContentSize();
        var size2 = this._textValue.node.getContentSize();
        var width = this._textValue.node.x + size2.width;
        var posNameX = 0 - size1.width;
        this._textName.node.x = (posNameX);
        this._textValue.node.x = (0);
    }
    setVisible(visible) {
        this.node.active = visible;
    }

}
