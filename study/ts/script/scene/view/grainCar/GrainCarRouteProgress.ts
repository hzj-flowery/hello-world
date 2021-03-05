import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import ViewBase from "../../ViewBase";
import GrainCarRoutePoint from "./GrainCarRoutePoint";

var WIDTH_PIT = 56;
var WIDTH_LABEL = 35;
const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarRouteProgress extends ViewBase{
    
    @property({
        type: cc.Node,
        visible: true
    })
    _pointer: cc.Node = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _progress: cc.ProgressBar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconDead: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconNormal: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelPercent: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelStart: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelEnd: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _progressBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _bg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePoint: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarRoutePoint: cc.Prefab = null;

    
    
    
    
    private _progressBgWidth:number;
    private _routeList:Array<any>;
    private _mineIdPointHashTable:Array<GrainCarRoutePoint>;
    private _carUnit:any;
    ctor(carUnit) {
        this._initMember(carUnit);
        this.node.name = ('GrainCarRouteProgress');
    }
    _initMember(carUnit) {
        this._routeList = [];
        this._mineIdPointHashTable = [];
        this._progressBgWidth = 0;
        this._carUnit = carUnit;
    }
    onCreate() {
    }
    onEnter() {
        this._initData();
        this._initUI();
    }
    onExit() {
    }
    onShowFinish() {
    }
    _initData() {
        this._routeList = this._carUnit.getWholeRoute();
    }
    updateUIStatic() {
        this._pointer.active = (false);
        this._progress.progress = (0);
    }
    updateUI(carUnit) {
        if (carUnit.isReachTerminal()) {
            this.carReachTerminal();
            return;
        }
        this._updatePercent(carUnit);
        this._updatePoints(carUnit);
    }
    carDead() {
        this._iconDead.node.active = (true);
        this._iconNormal.node.active = (false);
        this._labelPercent.string = (Lang.get('grain_car_progress_has_broken'));
        this._labelPercent.node.color = (Colors.BRIGHT_BG_RED);
    }
    carReachTerminal() {
        this._labelPercent.string = ('100%');
        this._pointer.x = (this._progressBgWidth / 2);
        this._progress.progress = (1.0);
        for (let i in this._mineIdPointHashTable) {
            var routePoint = this._mineIdPointHashTable[i];
            routePoint.setReach(true);
        }
    }
    showTerminal(bShow) {
        this._labelStart.node.active = (bShow);
        this._labelEnd.node.active = (bShow);
        var bgHeight = this._bg.node.getContentSize().height;
        if (bShow) {
            this._bg.node.setContentSize(cc.size(this._progressBgWidth + WIDTH_LABEL * 4, bgHeight));
        } else {
            this._bg.node.setContentSize(cc.size(this._progressBgWidth + WIDTH_LABEL, bgHeight));
        }
    }
    showRouteName(bShow) {
        for (let i in this._mineIdPointHashTable) {
            var routePoint = this._mineIdPointHashTable[i];
            routePoint.showRouteName(bShow);
        }
    }
    _initUI() {
        var pitCount = this._routeList.length - 1;
        var progressBgWidth = pitCount * WIDTH_PIT;
        var progressBgHeight = this._progressBg.node.getContentSize().height;
        var progressHeight = this._progress.node.getContentSize().height;
        var bgHeight = this._bg.node.getContentSize().height;
        this._progressBg.node.setContentSize(cc.size(progressBgWidth + 12, progressBgHeight));
        this._progress.node.setContentSize(cc.size(progressBgWidth, progressHeight));
        this._labelStart.node.x = (-progressBgWidth / 2 - WIDTH_LABEL);
        this._labelEnd.node.x = (progressBgWidth / 2 + WIDTH_LABEL);
        this._bg.node.setContentSize(cc.size(progressBgWidth + WIDTH_LABEL * 4, bgHeight));
        this._progressBgWidth = progressBgWidth;
        this._createPits();
    }
    _createPits() {
        var startX = -this._progressBgWidth / 2;
        for (var i = 1; i <= this._routeList.length; i++) {
            var mineId = this._routeList[i-1];
            var routePoint = cc.instantiate(this._GrainCarRoutePoint).getComponent(GrainCarRoutePoint);
            routePoint.ctor(mineId);
            routePoint.setReach(false);
            this._nodePoint.addChild(routePoint.node);
            routePoint.node.x = (startX + (i - 1) * WIDTH_PIT);
            if (i == 1) {
                routePoint.setPointType(GrainCarRoutePoint.POINT_TYPE_START);
            } else if (i == this._routeList.length) {
                routePoint.setPointType(GrainCarRoutePoint.POINT_TYPE_END);
            }
            this._mineIdPointHashTable[mineId] = routePoint;
        }
    }
    _updatePercent(carUnit) {
        if (carUnit.getStamina() > 0) {
            var percent = carUnit.getRoutePercent();
            percent = '%.2f'.format(percent);
            this._labelPercent.string = (percent * 100 + '%');
            var [minePit1, minePit2, percent] = carUnit.getCurCarPos();
            var routePoint = this._mineIdPointHashTable[minePit1];
            var pointerX = routePoint.node.x + percent * WIDTH_PIT;
            this._pointer.x = (pointerX);
            var startX = -this._progressBgWidth / 2;
            var progressPercent = (pointerX - startX) / this._progressBgWidth;
            this._progress.progress = (progressPercent);
        } else {
            var deadMineId = carUnit.getMine_id();
            var routePoint = this._mineIdPointHashTable[deadMineId];
            var pointerX = routePoint.node.x;
            this._pointer.x = (pointerX);
            var startX = -this._progressBgWidth / 2;
            var progressPercent = (pointerX - startX) / this._progressBgWidth;
            this._progress.progress = (progressPercent);
        }
    }
    _updatePoints(carUnit) {
        if (carUnit.getStamina() > 0) {
            var routePassed = carUnit.getRoute_passed();
            for (let i in routePassed) {
                var mineId = routePassed[i];
                this._mineIdPointHashTable[mineId].setReach(true);
            }
        } else {
            var deadMineId = carUnit.getMine_id();
            var reachDead = false;
            for (var i = 0; i < this._routeList.length; i++) {
                var mineId = this._routeList[i];
                this._mineIdPointHashTable[mineId].setReach(!reachDead);
                if (mineId == deadMineId) {
                    reachDead = true;
                }
            }
        }
    }
}
