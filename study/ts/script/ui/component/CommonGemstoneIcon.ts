import CommonIconBase from "./CommonIconBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Colors } from "../../init";
import { ComponentIconHelper } from "./ComponentIconHelper";
import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";
import { PopupPropInfo } from "../PopupPropInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonGemstoneIcon extends CommonIconBase {

    _id;
    _textItemTopNum: any;
    _textLevel: any;
    _imageLevel: any;
    _textRlevel: any;
    constructor() {
        super();
        this._type = TypeConvertHelper.TYPE_GEMSTONE;
    }

    onLoad():void{
        this._type = TypeConvertHelper.TYPE_GEMSTONE;
        super.onLoad();
    }

    setId(id) {
        this._id = id;
    }
    updateUI(value, size?) {
        var itemParams = super.updateUI(value, size);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
    }
    setTopNum(size) {
        if (this._textItemTopNum == null) {
            var params = {
                name: '_textItemTopNum',
                text: 'x' + '0',
                fontSize: 18,
                color: Colors.WHITE_DEFAULT,
                outlineColor: Colors.DEFAULT_OUTLINE_COLOR
            };
            ComponentIconHelper._setPostion(params, 'leftTop');
            var uiWidget = UIHelper.createLabel(params);
            this.appendUI(uiWidget);
            this._textItemTopNum = uiWidget;
        }
        this._textItemTopNum.setString('' + size);
        this._textItemTopNum.setVisible(size > 0);
    }
    setLevel(level) {
        if (this._textLevel == null) {
            var params = {
                name: '_textLevel',
                text: '0',
                fontSize: 20,
                color: Colors.COLOR_QUALITY[1],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[1]
            };
            var label = UIHelper.createLabel(params);
            label.setAnchorPoint(cc.v2(0.5, 0.5));
            label.setPosition(cc.v2(21, 10));
            this._textLevel = label;
        }
        var itemParam = this.getItemParams();
        if (this._imageLevel == null) {
            var params1 = {
                name: '_imageLevel',
                texture: Path.getUICommonFrame('img_iconsmithingbg_0' + itemParam.color)
            };
            var imageBg = UIHelper.createImage(params1);
            imageBg.addChild(this._textLevel);
            imageBg.setAnchorPoint(cc.v2(0, 1));
            imageBg.setPosition(cc.v2(3, 95));
            this._imageLevel = imageBg;
            this.appendUI(imageBg);
        }
        this._textLevel.setString(level);
        this._imageLevel.loadTexture(Path.getUICommonFrame('img_iconsmithingbg_0' + itemParam.color));
        this._imageLevel.setVisible(level > 0);
    }
    setRlevel(rLevel) {
        if (this._textRlevel == null) {
            var params = {
                name: '_textRlevel',
                text: '+' + '0',
                fontSize: 20,
                color: Colors.COLOR_QUALITY[2],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[2]
            };
            var label = UIHelper.createLabel(params);
            label.setAnchorPoint(cc.v2(0.5, 0.5));
            label.setPosition(cc.v2(46, 13));
            this.appendUI(label);
            this._textRlevel = label;
        }
        this._textRlevel.setString('+' + rLevel);
        this._textRlevel.setVisible(rLevel > 0);
    }
    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            var conf = this._itemParams.cfg;
            PopupPropInfo.getIns(PopupPropInfo, (p:PopupPropInfo)=>{
                p.ctor(conf.id);
                p.openWithAction();
            });
        }
    }
}