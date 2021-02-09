import { G_ServerTime } from "../../init";
import UIActionHelper from "../../utils/UIActionHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonCountdown extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _countdownLabel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _countDownTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _endLabel: cc.Label = null;

    public static EXPORTED_METHODS = [
        'startCountDown',
        'enableEndLable',
        'setEndLabelString',
        'setGap',
        'setCountdownLableParam',
        'setCountdownTimeParam',
        'setEndLabelParam',
        'getTotalWidth',
        'setCountdownLabel'
    ];
    _enableEndLabel: boolean = false;
    _gap: number = 5;
    _endTime: any;
    _endCallback: any;
    _formatTimeFunc: any;

    static _defaultFormatTime(time) {
        return G_ServerTime.getLeftSecondsString(time, '00:00:00');

    }
    _layout() {
        this._countDownTime["_updateRenderData"](true);
        this._countdownLabel["_updateRenderData"](true);
        var totalWidth = this._countDownTime.node.getContentSize().width;
        if (this._countdownLabel.node.active) {
            totalWidth = totalWidth + this._countdownLabel.node.getContentSize().width + this._gap;
            this._countdownLabel.node.x = (-1 * totalWidth / 2);
        }
        this._countDownTime.node.x = (totalWidth / 2);
    }
    setGap(gap) {
        this._gap = gap;
    }
    startCountDown(lableStr, endTime, endCallback?, timeFormatFunc?) {
        this._endTime = endTime;
        this._endCallback = endCallback;
        this._formatTimeFunc = timeFormatFunc;
        if (!this._formatTimeFunc) {
            this._formatTimeFunc = CommonCountdown._defaultFormatTime;
        }
        if (lableStr && lableStr != '') {
            this._countdownLabel.node.active = (true);
            this._countdownLabel.string = (lableStr);
        } else {
            this._countdownLabel.node.active = (false);
        }
        this._endLabel.node.active = (false);
        this._countDownTime.node.active = (true);
        this._countDownTime.node.stopAllActions();
        this._countDownTime.string = (this._formatTimeFunc(this._endTime));
        this._layout();
        var curTime = G_ServerTime.getTime();
        if (curTime <= this._endTime) {
            var action = UIActionHelper.createUpdateAction(function () {
                this._timeUpdae();
            }.bind(this), 0.5);
            this._countDownTime.node.runAction(action);
        } else {
            this._CallEnd();
        }
    }
    _timeUpdae() {
        var curTime = G_ServerTime.getTime();
        if (curTime > this._endTime) {
            this._countDownTime.node.stopAllActions();
            this._CallEnd();
        } else {
            this._countDownTime.string = (this._formatTimeFunc(this._endTime));
        }
    }
    _CallEnd() {
        if (this._enableEndLabel) {
            this._countDownTime.node.active = (false);
            this._countdownLabel.node.active = (false);
            this._endLabel.node.active = (true);
        }
        if (this._endCallback) {
            this._endCallback();
        }
    }
    enableEndLable(str) {
        if (str && str != '') {
            this._endLabel.string = (str);
            this._enableEndLabel = true;
        } else {
            this._enableEndLabel = false;
        }
    }
    setEndLabelString(str) {
        this._countDownTime.node.active = (false);
        this._countdownLabel.node.active = (false);
        this._endLabel.node.active = (true);
        this._endLabel.string = (str);
    }
    _updateTextParam(node: cc.Label, params: any) {
        // dump(params);
        if (typeof (params) == 'string' || typeof (params) == 'number') {
            node.string = (params) + "";
            return node;
        }
        if (params.fontSize) {
            node.fontSize = (params.fontSize);
        }
        if (params.color) {
            node.node.color = (params.color);
        }
        if (params.outlineColor != null) {
            UIHelper.enableOutline(node, params.outlineColor, params.outlineSize || 2);
        }
        if (params.visible != null) {
            node.node.active = ((params.visible));
        }
        if (params.text != null) {
            node.string = (params.text);
        }
    }
    setCountdownLableParam(param) {
        this._updateTextParam(this._countdownLabel, param);
    }
    setCountdownTimeParam(param) {
        this._updateTextParam(this._countDownTime, param);
    }
    setEndLabelParam(param) {
        this._updateTextParam(this._endLabel, param);
    }
    getTotalWidth() {
        var width = this._countdownLabel.node.getContentSize().width + this._countDownTime.node.getContentSize().width;
        return width;
    }

}