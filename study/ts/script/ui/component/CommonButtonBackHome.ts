const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonButtonBackHome extends cc.Component {

    private _button: cc.Button;
    private _callback: Function;

    public init() {
        this._button = this.node.getChildByName("Button").getComponent(cc.Button);

        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "CommonButtonBackHome";
        clickEventHandler.handler = "onButtonClick";
        this._button.clickEvents.push(clickEventHandler);
    }

    public addClickEventListenerEx(callback: Function) {
        this._callback = callback;
    }

    public onButtonClick() {
        this._callback();
    }

}