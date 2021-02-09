import { G_ResolutionManager } from "../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonFullScreen extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCountBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPrefix: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBG: cc.Node = null;

    onLoad() {
        if (this._panelBG) {
            this._panelBG.setContentSize(G_ResolutionManager.getDesignCCSize());
        }
        if (this._textCount) {
            this._textCount.node.active = (false);
        }
        if (this._imageCountBg) {
            this._imageCountBg.node.active = (false);
        }
        if (this._textPrefix) {
            this._textPrefix.node.active = (false);
        }
        this._textTitle.fontSize -= 2;
    }
    setTitle(title:string) {
        if(title.length==2)
        {
            this._textTitle.string = title[0]+"   "+title[1];
        }
        else
        {
            this._textTitle.string = (title);
        }
    }
    setPrefixCountText(txt) {
        if (this._textPrefix) {
            this._textPrefix.string = (txt);
        }
    }
    setPrefixCountColor(color) {
        if (this._textPrefix) {
            this._textPrefix.node.color = (color);
        }
    }
    setCount(count) {
        if (this._textCount) {
            this._textCount.string = (count);
        }
    }
    showCount(show) {
        if (this._imageCountBg) {
            this._imageCountBg.node.active = (false);
        }
        if (this._textCount) {
            this._textCount.node.active = (show);
        }
        if (this._textPrefix) {
            this._textPrefix.node.active = (show);
        }
    }
    setCountColor(color) {
        if (this._textCount) {
            this._textCount.node.color = (color);
        }
    }
    setCountSize(size) {
        if (this._textCount) {
            this._textCount.fontSize = (size);
        }
    }
    showCountPrefix(bShow) {
        if (this._textPrefix) {
            this._textPrefix.node.active = (bShow);
            if (!bShow) {
                this._textCount.node.x = (800);
            }
        }
    }

}