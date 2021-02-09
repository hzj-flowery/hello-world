import { Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonColorProgress extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBarBG: cc.Sprite = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barGreen: cc.ProgressBar = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barYellow: cc.ProgressBar = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barRed: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPercent: cc.Label = null;

    _init() {
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
    }

    setPercent(percent, showText, needTotal) {
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
        var bar = this._barGreen;
        if (percent > 0.25 && percent <= 0.75) {
            bar = this._barYellow;
        } else if (percent <= 0.25) {
            bar = this._barRed;
        }
        bar.node.active = (true);
        bar.progress = percent;
        this._textPercent.node.active = (showText);
        if (!showText) {
            return;
        }
        var strPercent = Math.floor(percent * 100).toString();
        if (needTotal) {
            strPercent = strPercent + ' / 100';
        }
        this._textPercent.string = (strPercent);
        var fontColor = Colors.getMinePercentColor(percent);
        this._textPercent.node.color = (fontColor.color);
        UIHelper.enableOutline(this._textPercent, fontColor.outlineColor, 2);
    }

}