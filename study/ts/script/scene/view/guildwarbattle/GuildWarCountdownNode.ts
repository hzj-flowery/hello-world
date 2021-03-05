import ViewBase from "../../ViewBase";
import { G_ServerTime, G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarCountdownNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNum: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNum1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNum2: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode: cc.Node = null;
    _num1X: number;
    _num2X: number;
    _time: number;


    ctor() {
        this._num1X = 0;
        this._num2X = 0;
        this._time = 0;
    }
    onCreate() {
        this._num1X = this._imageNum1.node.x;
        this._num2X = this._imageNum2.node.x;
    }
    onEnter() {
        var curTime = G_ServerTime.getTime();
        if (this._time > curTime) {
            this.startCountdown(this._time);
        }
    }
    onExit() {
        this.stopCountdown();
    }
    startCountdown(time) {
        this._time = time;
        this.schedule(this._onRefreshTick, 1);
        this._onRefreshTick(null);
    }
    stopCountdown() {
        this.unschedule(this._onRefreshTick);
    }
    _onRefreshTick(dt) {
        var curTime = G_ServerTime.getTime();
        var second = this._time - curTime;
        this._refreshTime(second);
        if (second <= 0) {
            this.stopCountdown();
            var eventFunction = function (event) {
                if (event == 'finish') {
                    this.node.active = (false);
                }
            }.bind(this);
            this._effectNode.removeAllChildren();
            var gfxEffect = G_EffectGfxMgr.createPlayGfx(this._effectNode, 'effect_zhandou_duijue', eventFunction, true);
        }
    }
    _refreshTime(num) {
        if (num <= 0) {
            this._textNum.node.active = (false);
            this._imageBg.node.active = (false);
        } else if (num <= 3) {
            this._effectNode.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._effectNode, 'effect_jingjijishi_' + num, /* eventFunction */null, true);
            this._imageBg.node.active = (false);
            this._textNum.node.active = (false);
        } else {
            this._imageBg.node.active = (true);
            this._textNum.node.active = (true);
            this._textNum.string = ((num + ""));
        }
    }

}