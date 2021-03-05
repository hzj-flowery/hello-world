import { handler } from "../utils/handler";

// import { handler } from "../utils/handler";

export default class LabelExtend extends cc.Component{
    private _isPercent;
    private currValue;
    private txt_temp_value;
    private stepValue;
    private dstValue;
    updateTxtValue(num_value) {
        if (!num_value || num_value == '') {
            return;
        }
        this._isPercent = false;
        if (typeof(num_value) == 'string' && num_value.indexOf('%') >= 0) {
            num_value = num_value.substr(0, num_value.length-1);
            this._isPercent = true;
        }
        var value = parseInt(num_value);
        if (this.currValue == null) {
            var cur_value = this.label.string;
            if (this._isPercent) {
                cur_value = num_value.substr(0, num_value.length-1);
            }
            this.currValue = parseInt(cur_value);
        } else {
            this.currValue = this.txt_temp_value;
        }
        if (this.currValue != value) {
            this.txtRunAction(this.currValue, value);
        }
        this.txt_temp_value = value;
        this._formatNumber(num_value);
    }

    private _label;
    private get label(): cc.Label{
        if(!this._label) this._label = this.node.getComponent(cc.Label);
        return this._label;
    }

    txtRunAction(curr, dst) {
        this.stopUpdateSchedule();
        var step = 30;
        this.stepValue = (dst - curr) / step;
        this.stepValue = this.stepValue > 0 && Math.ceil(this.stepValue) || Math.floor(this.stepValue);
        this.dstValue = dst;
        this.schedule(this._updateScheduleFunc, 1 / 30);
    }

    _formatNumber(num) {
        var format = (parseInt(num)).toString();
        this.label.string = (format + (this._isPercent && '%' || ''));
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

    stopUpdateSchedule(){
        this.unschedule(this._updateScheduleFunc);
        this._formatNumber(this.currValue);
    }

    doScaleAnimation(duration) {
        var action1 = cc.scaleTo(duration || 0.2, 1.5);
        var action2 = cc.scaleTo(duration || 0.2, 1);
        var seq = cc.sequence(action1, cc.delayTime(0.1), action2);
        this.node.runAction(seq);
    }

    onDestroy(){
        this.unschedule(this._updateScheduleFunc);
    }

    onLoad(){
        this._label = this.node.getComponent(cc.Label);
    }

    getNumberValue(){
        return parseInt(this._label.string);
    }

    setNumberValue(value){
        this._label.string = value;
    }
}