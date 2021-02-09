import ViewBase from "../../ViewBase";
import { handler } from "../../../utils/handler";
import { G_ServerTime } from "../../../init";
import { Util } from "../../../utils/Util";

const { ccclass, property } = cc._decorator;
@ccclass
export default class UIGuideNode extends ViewBase {

    private _uiGuideUnitData;
    private _startTime;
    private _endTime;
    public init(uiGuideUnitData) {
        this._uiGuideUnitData = uiGuideUnitData;
        this._startTime = 0;
        this._endTime = 0;
    }

    public onCreate() {
    }

    public onEnter() {
        var cfg = this._uiGuideUnitData.getConfig();
        var hasCdTime = cfg.cd_min > 0;
        if (hasCdTime) {
            this._startRefreshHandler();
            this._startTime = 0;
            this._endTime = 0;
            this._resetCD();
            this._visibleChildren(false);
        }
    }

    public onExit() {
        this._endRefreshHandler();
    }

    private _startRefreshHandler() {
        this.schedule(handler(this, this._onRefreshTick), 1);
    }

    private _endRefreshHandler() {
        this.unschedule(handler(this, this._onRefreshTick));
    }

    private _isGuideVisible() {
        var time = G_ServerTime.getTime();
        if (time >= this._startTime && time <= this._endTime) {
            return true;
        } else {
            return false;
        }
    }

    private _resetCD() {
        var time = G_ServerTime.getTime();
        var cfg = this._uiGuideUnitData.getConfig();
        if (time > this._endTime) {
            this._startTime = time + Util.getRandomInt(cfg.cd_min, cfg.cd_max);
            this._endTime = this._startTime + Util.getRandomInt(cfg.time_min, cfg.time_max);
        }
    }

    private _onRefreshTick(dt) {
        var visible = this._isGuideVisible();
        this._visibleChildren(visible);
        this._resetCD();
    }

    private _visibleChildren(visible) {
        var children = this.node.children
        for (let k in children) {
            var v = children[k];
            v.active = (visible);
        }
    }
}