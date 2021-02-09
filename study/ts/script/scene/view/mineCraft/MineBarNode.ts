import ParameterIDConst from "../../../const/ParameterIDConst";
import { MineCraftHelper } from "./MineCraftHelper";
import { G_ConfigLoader, Colors } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MineBarNode extends cc.Component {
    
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
        type: cc.Sprite,
        visible: true
    })
    _imageArmyIcon: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPercent: cc.Label = null;
    
    onLoad():void{
        this._init();
    }
    _init() {
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
        this._imageArmyIcon.node.active = (false);
    }
    showIcon(s) {
        this._imageArmyIcon.node.active = (s);
    }
    setPercent(percent, needTotal, isPrivilege) {
        isPrivilege = isPrivilege || false;
        this._barGreen.node.active = (false);
        this._barYellow.node.active = (false);
        this._barRed.node.active = (false);
        var bar = this._barGreen;
        
        var maxValue = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.TROOP_MAX).content);
        if (isPrivilege) {
            var soilderAdd = MineCraftHelper.getParameterContent(ParameterIDConst.MINE_CRAFT_SOILDERADD);
            maxValue = maxValue + soilderAdd;
        }
        if (percent > maxValue * 0.25 && percent <= 0.75 * maxValue) {
            bar = this._barYellow;
        } else if (percent <= 0.25 * maxValue) {
            bar = this._barRed;
        }
        bar.node.active = (true);
        bar.progress = (percent / maxValue);
        var strPercent = percent;
        if (needTotal) {
            strPercent = strPercent + (' / ' + (maxValue));
        }
        this._textPercent.string = (strPercent);
        var fontColor = Colors.getMinePercentColor(Math.ceil(percent / maxValue * 100));
        this._textPercent.node.color = (fontColor.color);
        UIHelper.enableOutline(this._textPercent,fontColor.outlineColor, 2)
    }
}