const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonButtonBack extends cc.Component {

    private _button: cc.Button;
    private _callback: Function;

    onLoad() {
        this._button = this.node.getChildByName("Button").getComponent(cc.Button);
        this._button.node.setAnchorPoint(0.5,0.5);
        this._button.node.setPosition(90, -32);
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "CommonButtonBack";
        clickEventHandler.handler = "onButtonClick";
        this._button.clickEvents = [];
        this._button.clickEvents.push(clickEventHandler);
    }

    public addClickEventListenerEx(callback: Function) {
        this._callback = callback;
    }

    public onButtonClick() {
        this._callback();
    }
}
