import { CountryBossHelper } from "./CountryBossHelper";
import { handler } from "../../../utils/handler";
import { G_ServerTime } from "../../../init";
import { table } from "../../../utils/table";

const { ccclass, property } = cc._decorator;
@ccclass
export default class StageWidget extends cc.Component {
    _curStage: any;
    _stageChangeCallback: any;
    _curCheckTime: any;
    _times: any[];
    _isTodayOpen: boolean = false;

    public static newIns(parent, callback) {
        var comp = new cc.Node().addComponent(StageWidget);
        comp.ctor(parent, callback);
        return comp;
    }


    ctor(parent, callback) {
        parent.addChild(this.node);
        this._curStage = CountryBossHelper.getStage();
        this._stageChangeCallback = callback;
        this._refreshCheckTime();
        if (CountryBossHelper.isTodayOpen()) {
            this._isTodayOpen = true;
        }
    }
    update() {
        if (!this._isTodayOpen) {
            return;
        }
        if (!this._curCheckTime) {
            return;
        }
        var curTime = G_ServerTime.getTime();
        if (curTime >= this._curCheckTime) {
            this.updateStage();
        }
    }
    updateStage() {
        var oldStage = this._curStage;
        this._curStage = CountryBossHelper.getStage();
        this._refreshCheckTime();
        if (oldStage != this._curStage) {
            this.stageChange();
        }
        return this._curStage;
    }
    stageChange() {
        if (this._stageChangeCallback) {
            this._stageChangeCallback(this._curStage);
        }
    }
    _refreshCheckTime() {
        var newTimes = [];
        var curTime = G_ServerTime.getTime();
        var [stage1BeginTime, stage1EndTime, stage2BeginTime, stage2EndTime, stage3BeginTime, stage3EndTime] = CountryBossHelper.getTimeByStage();
        var timesTables = [
            stage1BeginTime,
            stage2BeginTime,
            stage3BeginTime,
            stage3EndTime + 1
        ];
        for (var k in timesTables) {
            var v = timesTables[k];
            if (curTime < v) {
                newTimes.push(v);
            }
        }
        this._times = newTimes;
        this._curCheckTime = this._times[0];
        this._times.shift();
    }
}