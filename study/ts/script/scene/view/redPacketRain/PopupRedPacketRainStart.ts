import PopupBase from "../../../ui/PopupBase";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupRedPacketRainStart extends PopupBase {
    public static path = 'redPacketRain/PopupRedPacketRainStart';
    @property({
        type: cc.Button,
        visible: true
    })
    _buttonStart: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonQuit: cc.Button = null;
    _callbackStart: any;
    _callbackQuit: any;

    ctor(callbackStart, callbackQuit) {
        this._callbackStart = callbackStart;
        this._callbackQuit = callbackQuit;
        UIHelper.addEventListener(this.node, this._buttonStart, 'PopupRedPacketRainStart', '_onClickStart');
        UIHelper.addEventListener(this.node, this._buttonQuit, 'PopupRedPacketRainStart', '_onClickQuit');
    }
    _onClickStart() {
        var ret = true;
        if (this._callbackStart) {
            ret = this._callbackStart();
        }
        if (ret) {
            this.close();
        }
    }
    _onClickQuit() {
        if (this._callbackQuit) {
            this._callbackQuit();
        }
        this.close();
    }
}