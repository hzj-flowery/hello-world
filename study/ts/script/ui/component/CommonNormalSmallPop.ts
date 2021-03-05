import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonNormalSmallPop extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_bg_all: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    _imageBtnBg: any;
    _imageTitle: any;

    _clickCallBack: Function;

    onLoad() {
        this._textTitle.fontSize -= 2;
        var node = this._image_bg_all.node.getChildByName('ImageBtnBg');
        if (node) {
            this._imageBtnBg = node.getComponent(cc.Sprite);
        }
        node = this._image_bg_all.node.getChildByName('Image_title');
        if (node) {
            this._imageTitle = node.getComponent(cc.Sprite);
        }

        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonNormalSmallPop";// 这个是代码文件名
        clickEventHandler.handler = "_onClick";
        // if(!this._btnClose.clickEvents) this._btnClose.clickEvents = [];
        this._btnClose.clickEvents.push(clickEventHandler);

        //this._moveNodeZorder(this._btnClose.node);
    }
    _moveNodeZorder(node) {
        if (!node) {
            return;
        }
        var container = this.node.getParent();
        //  node.retain();
        var worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));
        var btnNewPos = container.convertToNodeSpace(cc.v2(worldPos));
        node.removeFromParent();
        container.addChild(node);
        node.setScale(this.node.getScale(cc.v2()));
        node.setPosition(btnNewPos);
        //  node.release();
    }

    update(param) {
    }

    addCloseEventListener(callback) {
        if (this._btnClose) {
            this._btnClose.node.active = (true);
            this._clickCallBack = callback;
        }
    }
    _onClick() {
        this._clickCallBack && this._clickCallBack();
    }
    setTitle(s) {
        this._textTitle.string = s;
    }
    hideCloseBtn() {
        if (this._btnClose) {
            this._btnClose.node.active = (false);
        }
    }
    hideBtnBg() {
        if (this._imageBtnBg) {
            this._imageBtnBg.node.active = (false);
        }
    }
    setCloseVisible(v) {
        if (this._btnClose) {
            this._btnClose.node.active = (v);
        }
    }
    moveTitleToTop() {
        if (this._imageTitle == null) {
            let node = this._image_bg_all.node.getChildByName('Image_title');
            if (node) {
                this._imageTitle = node.getComponent(cc.Sprite);
            }
        }
        if (this._imageTitle != null) {
            this._moveNodeZorder(this._imageTitle.node);
        }
    }
    setCloseButtonLocalZOrder(order) {
        if (this._btnClose) {
            this._btnClose.node.zIndex = (order);
        }
    }
    offsetCloseButton(offsetX, offsetY) {
        if (this._btnClose) {
            var posX = this._btnClose.node.x + offsetX;
            var posY = this._btnClose.node.y + offsetY;
            this._btnClose.node.setPosition(cc.v2(posX, posY));
        }
    }
    setTitleSysFont() {
        this._textTitle.fontFamily = (Path.getCommonFont());
    }
    setTitleFontSize(size) {
        this._textTitle.fontSize = (size);
    }
    setTitlePositionX(pos) {
        this._textTitle.node.x = (pos);
    }
}