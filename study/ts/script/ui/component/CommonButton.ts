import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButton extends cc.Component {

    @property({
        type: cc.Button,
        visible: true
    })
    _button: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    _callBack: Function;
    _delay = 0;

   

    onLoad() {

    }

   

    private onClick(event, customEventData) {
        if (this._callBack) {
            if (this._delay > 0) {
                this.scheduleOnce(() => {
                    this._callBack(this);
                }, this._delay);
                this._delay = 0;
            } else {
                this._callBack(this);
            }
        }
    }

    addClickEventListenerExDelay(callback, delay) {
        this.addClickEventListenerEx(callback, delay);
    }
    addClickEventListenerEx(callback, delay = 0) {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonButton";// 这个是代码文件名
        clickEventHandler.handler = "onClick";
        this._button.clickEvents = [];
        this._button.clickEvents.push(clickEventHandler);

        this._callBack = callback;
        this._delay = delay;
    }
    addTouchEventListenerEx(callback, swallow) {
        this.addClickEventListenerEx(callback);
        if (swallow != null) {
            this.setSwallowTouches(swallow);
        }
    }
    setSwallowTouches(swallow) {
        this._button.node.getComponent(cc.BlockInputEvents).enabled = swallow;
    }
    setString(s) {
        this._text.string = (s);
    }
    setFontSize(size) {
        this._text.fontSize = (size);
    }
    showRedPoint(v) {
        this._redPoint.node.active = (v);
    }
    isEnabled() {
        return this._button.enabled;
    }
    setEnabled(e) {
        this._button.interactable = (e);
    }
    setTouchEnabled(e) {
        this._button.enabled = (e);
    }
    setWidth(width) {
        var height = this._button.node.getContentSize().height;
        this._button.node.setContentSize(width, height);
    }
    setButtonTag(tag) {
        this._button['tag'] = (tag);
    }
    getTag(){
        return this._button["tag"];
    }
    setButtonName(name) {
        this._button.node.name = (name);
    }
    loadTexture(normalImg, selectImg, disableImg) {
        UIHelper.loadBtnTexture(this._button, normalImg, selectImg, disableImg);
    }
    getDesc() {
        return this._text;
    }
    setTxtVisible(s) {
        if (s) {
            // print('bShow ====== true');
        } else {
            //  print('bShow ====== false');
        }
        this._text.node.active = (s);
    }

    setVisible(v) {
        this.node.active = v;
    }

}