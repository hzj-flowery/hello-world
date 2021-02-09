import { UIPopupHelper } from "../../utils/UIPopupHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHelp extends cc.Component {

    @property({
        type: cc.Button,
        visible: true
    })
    _button: cc.Button = null;

    private _functionId;
    private _langName;
    private _clickCallback: Function;
    private _param;
    onLoad() {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "CommonHelp";
        clickEventHandler.handler = "_onClickIntro";

        this._param = null;
        this._button.clickEvents = [];
        this._button.clickEvents.push(clickEventHandler);
    }

    public addClickEventListenerEx(func) {
        this._clickCallback = func;
    }

    updateUI(functionId,param?) {
        this._functionId = functionId;
        this._param = param;
    }
    updateLangName(langName) {
        this._langName = langName;
    }
    _onClickIntro() {
        if (this._clickCallback != null) {
            this._clickCallback();
            return;
        }
        if (this._functionId) {
            UIPopupHelper.popupHelpInfo(this._functionId,this._param);
        } else if (this._langName) {
            UIPopupHelper.popupHelpInfoByLangName(this._langName);
        }
    }

}