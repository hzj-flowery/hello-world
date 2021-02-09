import { handler } from "../../utils/handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonRollNumber extends cc.Component {

    currValue;
    txt_temp_value = 0;

    _rollListener;
    stepValue;
    dstValue;

    updateScheduler;

    text: cc.Label;

    onLoad() {
        this.text = this.node.getComponent(cc.Label);
    }

    updateTxtValue(num_value, unit_value?, step?, notAni?) {
        if (!num_value) {
            return;
        }
        step = step || 30;

        function txtRunAction(curr, dst) {
            this.stopUpdateSchedule();
            if (!notAni) {
                this.doScaleAnimation();
            }
            this.stepValue = (dst - curr) / step;
            this.stepValue = this.stepValue > 0 && Math.ceil(this.stepValue) || Math.floor(this.stepValue);
            this.dstValue = dst;
            this.updateScheduler = this.schedule(handler(this, this._updateScheduleFunc), 1 / 30);
        }
        if (this.currValue == null) {
            this.currValue = this._rollListener.getNumberValue()
        } else {
            this.currValue = this.txt_temp_value;
        }
        if (this.currValue != num_value) {
            txtRunAction.apply(this, [this.currValue, num_value]);
        }
        this.txt_temp_value = num_value;
        this._formatNumber(num_value);
    }

    _formatNumber(num) {
        if (this._rollListener && num) {
            this._rollListener.setNumberValue(num)
        }
    }
    
    _updateScheduleFunc() {
        if (this.currValue == null) {
            return;
        }
        this.currValue = this.currValue + this.stepValue;
        if (this.currValue >= this.dstValue && this.stepValue > 0) {
            this.currValue = this.dstValue;
            this.stopUpdateSchedule();
        } else if (this.currValue <= this.dstValue && this.stepValue < 0) {
            this.currValue = this.dstValue;
            this.stopUpdateSchedule();
        }
        this._formatNumber(this.currValue);
    }
    stopUpdateSchedule() {
        if (this.updateScheduler != null) {
            this.unschedule(this.updateScheduler);
        }
        this._formatNumber(this.currValue);
        this.updateScheduler = null;
    }
    doScaleAnimation(duration?) {
        var action1 = cc.scaleTo(duration || 0.2, 1.5);
        var action2 = cc.scaleTo(duration || 0.2, 1);
        var seq = cc.sequence(action1, cc.delayTime(0.1), action2);
        this.node.runAction(seq);
    }
    setRollListener(listener) {
        this._rollListener = listener;
    }

    setString(str) {
        this.text.string = str;
    }
}