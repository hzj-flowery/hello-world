import { G_ServerTime } from "../../../init";
import UIActionHelper from "../../../utils/UIActionHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FightBtn extends cc.Component {
    _textImage: cc.Sprite;
    _timeLabel: cc.Label;
    _getEndTimeFunc: any;
    _timeLabelBg: cc.Sprite;
    _canAttackTime: any;

    public static newIns(textImage, timeLabel, getEndTimeFunc, timeLabelBg) {
        var comp = new cc.Node().addComponent(FightBtn);
        comp.ctor(textImage, timeLabel, getEndTimeFunc, timeLabelBg);
        return comp;
    }

    ctor(textImage, timeLabel, getEndTimeFunc, timeLabelBg) {
        this._textImage = textImage;
        this._timeLabel = timeLabel;
        this._getEndTimeFunc = getEndTimeFunc;
        this._timeLabelBg = timeLabelBg;
    }
    update() {
        this._canAttackTime = this._getEndTimeFunc();
        var curTime = G_ServerTime.getTime();
        if (curTime <= this._canAttackTime) {
            this._startCd();
            this._timeLabel.string = (G_ServerTime.getLeftSecondsString(this._canAttackTime, '00:00:00'));
            var action = UIActionHelper.createUpdateAction(function () {
                this._cdUpdate();
            }.bind(this), 0.5);
            this._timeLabel.node.runAction(action);
        } else {
            this._stopCd();
        }
    }
    _stopCd() {
        this._timeLabel.node.stopAllActions();
        this._timeLabel.node.active = (false);
        this._textImage.node.y = (27);
        if (this._timeLabelBg) {
            this._timeLabelBg.node.active = (false);
        }
    }
    _startCd() {
        this._timeLabel.node.stopAllActions();
        this._timeLabel.node.active = (true);
        this._textImage.node.y = (14 + 27);
        if (this._timeLabelBg) {
            this._timeLabelBg.node.active = (true);
        }
    }
    _cdUpdate() {
        var curTime = G_ServerTime.getTime();
        if (curTime > this._canAttackTime) {
            this._stopCd();
        } else {
            this._timeLabel.string = (G_ServerTime.getLeftSecondsString(this._canAttackTime, '00:00:00'));
        }
    }
    canFight() {
        var curTime = G_ServerTime.getTime();
        var canAttackTime = this._getEndTimeFunc();
        if (curTime > canAttackTime) {
            return true;
        }
        return false;
    }
}