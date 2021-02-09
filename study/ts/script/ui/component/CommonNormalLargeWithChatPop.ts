import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonNormalLargeWithChatPop extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_bg_all: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _button_close: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_title: cc.Label = null;

    _clickCallBack: Function;

    onLoad() {
        this._text_title.fontSize -= 2;
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonNormalSmallPop";// 这个是代码文件名
        clickEventHandler.handler = "_onClick";
        // if(!this._button_close.clickEvents) this._button_close.clickEvents = [];
        this._button_close.clickEvents.push(clickEventHandler);

        //this._moveNodeZorder(this._button_close.node);
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
        if (this._button_close) {
            this._button_close.node.active = (true);
            this._clickCallBack = callback;
        }
    }
    _onClick() {
        this._clickCallBack && this._clickCallBack();
    }
    setTitle(s) {
        this._text_title.string = s;
    }
    hideCloseBtn() {
        if (this._button_close) {
            this._button_close.node.active = (false);
        }
    }
    setCloseVisible(v) {
        if (this._button_close) {
            this._button_close.node.active = (v);
        }
    }
    setCloseButtonLocalZOrder(order) {
        if (this._button_close) {
            this._button_close.node.zIndex = (order);
        }
    }
    offsetCloseButton(offsetX, offsetY) {
        if (this._button_close) {
            var posX = this._button_close.node.x + offsetX;
            var posY = this._button_close.node.y + offsetY;
            this._button_close.node.setPosition(cc.v2(posX, posY));
        }
    }
    setTitleSysFont() {
        this._text_title.fontFamily = (Path.getCommonFont());
    }
    setTitleFontSize(size) {
        this._text_title.fontSize = (size);
    }
    setTitlePositionX(pos) {
        this._text_title.node.x = (pos);
    }

}