import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarBar extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _barBg: cc.Sprite = null;
    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barGreen: cc.ProgressBar = null;
    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barRed: cc.ProgressBar = null;
    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barYellow: cc.ProgressBar = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textPercent: cc.Label = null;
    onLoad() {
        this._init();
    }
    _init() {
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
    }
    updateBarWithCarUnit(carUnit) {
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
        var bar = this._barGreen;
        var curStamina = carUnit.getStamina();
        var grainCarConfig = carUnit.getConfig();
        var maxValue = grainCarConfig.stamina;
        if (curStamina > maxValue * 0.25 && curStamina <= 0.75 * maxValue) {
            bar = this._barYellow;
        } else if (curStamina <= 0.25 * maxValue) {
            bar = this._barRed;
        }
        bar.node.active = (true);
        bar.progress = (curStamina / maxValue);
        var strPercent = '' + (curStamina);
        strPercent = strPercent + (' / ' + (maxValue));
        this._textPercent.string = (strPercent);
        var fontColor = Colors.getMinePercentColor(Math.ceil(curStamina / maxValue * 100));
        this._textPercent.node.color = (fontColor.color);
        UIHelper.enableOutline(this._textPercent, fontColor.outlineColor, 2)
    }
    updateBarWithValue(curValue, maxValue) {
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
        var bar = this._barGreen;
        if (curValue > maxValue * 0.25 && curValue <= 0.75 * maxValue) {
            bar = this._barYellow;
        } else if (curValue <= 0.25 * maxValue) {
            bar = this._barRed;
        }
        bar.node.active = (true);
        bar.progress = (curValue / maxValue);
        var strPercent = "" + (curValue);
        strPercent = strPercent + (' / ' + (maxValue));
        this._textPercent.string = (strPercent);
        var fontColor = Colors.getMinePercentColor(Math.ceil(curValue / maxValue * 100));
        this._textPercent.node.color = (fontColor.color);
        UIHelper.enableOutline(this._textPercent, fontColor.outlineColor, 2)
    }
    setSmallMode() {
        this._textPercent.node.active = (false);
        this._barBg.node.scaleY = (0.2);
        this._barGreen.node.scaleY = (0.2);
        this._barYellow.node.scaleY = (0.2);
        this._barRed.node.scaleY = (0.2);
    }
    showPercentText(bShow) {
        this._textPercent.node.active = (bShow);
    }
};