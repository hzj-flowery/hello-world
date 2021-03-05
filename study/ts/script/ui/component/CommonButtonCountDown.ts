import CommonButton from "./CommonButton";
import { G_ServerTime } from "../../init";
import UIActionHelper from "../../utils/UIActionHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonButtonCountDown extends CommonButton {

    @property({
        type: cc.Label,
        visible: true
    })
    _countdownTime: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _timeNode: cc.Node = null;

    private _endTime;
    private _endCallback;
    private _formatTimeFunc;

    startCountDown(endTime, endCallback, timeFormatFunc) {
        this._timeNode.active = (false);
        this._endTime = endTime;
        this._endCallback = endCallback;
        this._formatTimeFunc = timeFormatFunc;
        if (!this._formatTimeFunc) {
            this._formatTimeFunc = this._defaultFormatTime;
        }
        this._countdownTime.node.active = (true);
        this._countdownTime.node.stopAllActions();
        this._countdownTime.string = (this._formatTimeFunc(this._endTime));
        var curTime = G_ServerTime.getTime();
        if (curTime <= this._endTime) {
            var action = UIActionHelper.createUpdateAction(function () {
                this._timeUpdae();
            }.bind(this), 0.5);
            this._countdownTime.node.runAction(action);
        } else {
            this._CallEnd();
        }
    }

    private _defaultFormatTime(time) {
        return G_ServerTime.getLeftSecondsString(time, '00:00:00');
    }

    private _timeUpdae() {
        var curTime = G_ServerTime.getTime();
        if (curTime > this._endTime) {
            this._countdownTime.node.stopAllActions();
            this._CallEnd();
        } else {
            this._countdownTime.string = (this._formatTimeFunc(this._endTime));
        }
    }

    private _CallEnd() {
        if (this._endCallback) {
            this._endCallback();
        }
    }
}