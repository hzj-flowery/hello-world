import { G_EffectGfxMgr, G_UserData, G_ConfigLoader } from "../../../init";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { Path } from "../../../utils/Path";
import ComponentBase from "./ComponentBase";
import PanelExp from "./PanelExp";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { stringUtil } from "../../../utils/StringUtil";
import { unpack } from "../../../utils/GlobleFunc";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentLevel extends ComponentBase {

    private static LEVEL_SPEED = 5
    private static WAIT_TIME = 0.2

    private _getExp;
    private _targetLevel: number;
    private _targetExp: number;
    private _targetPercent: number;
    private _lastLevel: number;
    private _lastExp: number;

    private _lastPercent: number;
    private _isLevelUp: boolean;
    private _panelExp: PanelExp;
    private _isChangeLevel;
    private _nowPercent;
    private _startExp;
    private _waitExpTime;
    _curMaxLevel: any;

    public init(getExp, position) {
        this._getExp = getExp;
        this._targetLevel = G_UserData.getBase().getLevel();
        this._targetExp = G_UserData.getBase().getExp();
        this._targetPercent = Math.floor(this._targetExp / HeroDataHelper.getUserLevelUpExp() * 100);
        this._lastLevel = 0;
        this._lastExp = 0;
        let args: any[] = G_UserData.getBase().isLevelUp();
        var isLevelUp = args[0];
        let lastLevel = args[1];
        if (!isLevelUp) {
            this._lastLevel = this._targetLevel;
            this._lastExp = this._targetExp - getExp;
        } else {
            this._lastLevel = lastLevel;
            this._targetPercent = this._targetPercent + 100;
            this._lastExp = HeroDataHelper.getUserLevelUpExp(this._lastLevel) - (getExp - this._targetExp);
        }
        if (this._lastExp < 0) {
            this._lastExp = 0;
        }
        this._lastPercent = Math.floor(this._lastExp / HeroDataHelper.getUserLevelUpExp(this._lastLevel) * 100);
        this._isLevelUp = isLevelUp;
        this._isChangeLevel = false;
        this._nowPercent = this._lastPercent;
        this._panelExp = null;
        this._startExp = false;
        this._waitExpTime = 0;
        this._curMaxLevel = this._getCurMaxLevel();
        this.node.setPosition(position);
        super.init();
    }

    public setStart() {
        this._createExpAnim();
        super.setStart();
    }

    public setUpdate(f) {
        if (this._startExp) {
            this._nowPercent = this._nowPercent + ComponentLevel.LEVEL_SPEED;
            var t = this._nowPercent / this._targetPercent;
            t = t > 1 && 1 || t;
            if (this._nowPercent > this._targetPercent) {
                this._nowPercent = this._targetPercent;
            }
            var showPercent = this._nowPercent;
            if (showPercent >= 100) {
                if (!this._isChangeLevel) {
                    var bgPercent = this._targetPercent - 100;
                    this._panelExp.setExpPercentBG(bgPercent);
                    this._panelExp.setLevel(this._targetLevel);
                    this._isChangeLevel = true;
                }
                showPercent = showPercent - 100;
            }
            this._setProgressPercent(showPercent);
            this._updateLevelText();
            if (t == 1) {
                this.onFinish();
            }
        } else {
            if (this.isStart() && this._panelExp) {
                this._waitExpTime = this._waitExpTime + f;
                if (this._waitExpTime >= ComponentLevel.WAIT_TIME) {
                    this._startExp = true;
                }
            }
        }
    }

    public onFinish() {
        this._panelExp.setTextExpPercent1(this._targetExp.toString());
        super.onFinish();
    }

    private _updateLevelText() {
        var lastLevelExp = 0;
        if (!this._isChangeLevel) {
            lastLevelExp = HeroDataHelper.getUserLevelUpExp(this._lastLevel);
            this._panelExp.setTextExpPercent2('/' + lastLevelExp);
        } else {
            lastLevelExp = HeroDataHelper.getUserLevelUpExp();
            this._panelExp.setTextExpPercent2('/' + lastLevelExp);
        }
        var expPercent = this._nowPercent;
        if (expPercent >= 100) {
            expPercent = expPercent - 100;
        }
        var nowExp = Math.floor(lastLevelExp * expPercent / 100);
        this._panelExp.setTextExpPercent1(nowExp.toString());
    }

    private _createCsbNode(): cc.Node {

        let expNode: cc.Node = new cc.Node();
        cc.resources.load(Path.getPrefab('PanelExp', 'settlement'), cc.Prefab, function (err, res) {
            this._panelExp = cc.instantiate(res).getComponent(PanelExp);
            expNode.addChild(this._panelExp.node);
            this._panelExp.setLevel(this._lastLevel);
            this._panelExp.setExpPercent(this._lastPercent);
            var bgPercent = this._targetPercent;
            if (bgPercent > 100) {
                bgPercent = 100;
            }
            this._panelExp.setExpPercentBG(bgPercent);
            var percent = Math.floor(this._lastPercent);
            this._panelExp.setExpPercent(percent);
            this._updateLevelText();
        }.bind(this));
        return expNode;
    }

    private _createExpAnim() {
        function effectFunction(effect) {
            if (effect == 'win_dengji') {
                return this._createCsbNode();
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_level', effectFunction.bind(this), null, false);
    }

    _getCurMaxLevel() {
        var nowDay = G_UserData.getBase().getOpenServerDayNum();
        var paramContent = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.PLAYER_DETAIL_LEVEL_LIMIT).content;
        var valueList = stringUtil.split(paramContent, ',');
        for (var i in valueList) {
            var value = valueList[i];
            var [day, level] = stringUtil.split(value, '|');
            var currLevel = Number(level);
            var currDay = Number(day);
            if (UserCheck.enoughOpenDay(currDay)) {
                return currLevel;
            }
        }
    }
    _setProgressPercent(percent) {
        var lastLevelExp = 0;
        if (!this._isChangeLevel) {
            lastLevelExp = UserDataHelper.getUserLevelUpExp(this._lastLevel);
        } else {
            lastLevelExp = UserDataHelper.getUserLevelUpExp();
        }
        if (this._targetLevel >= this._curMaxLevel) {
            if (this._targetExp >= lastLevelExp) {
                this._panelExp.setExpPercent(100);
            } else {
                this._panelExp.setExpPercent(percent);
            }
        } else {
            this._panelExp.setExpPercent(percent);
        }
    }
}