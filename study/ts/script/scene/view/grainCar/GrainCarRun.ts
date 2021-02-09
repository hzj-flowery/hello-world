import { G_UserData } from "../../../init";
import { handler } from "../../../utils/handler";
import ViewBase from "../../ViewBase";
import GrainCarConfigHelper from "./GrainCarConfigHelper";
import GrainCarRouteProgress from "./GrainCarRouteProgress";
import GrainCarRunAvatar from "./GrainCarRunAvatar";
import GrainCarRunHero from "./GrainCarRunHero";

var BG_MOVE_SPEED = 50;
var BG_WIDTH = 1400;
var STATUS_IDLE = 1;
var STATUS_RUN = 2;
var STATUS_WIN = 3;
const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarRun extends ViewBase {

    private _curStatus = 0;
    private _carSpeed: number = BG_MOVE_SPEED;
    private _bgInitPosx1: number;
    private _bgInitPosx2: number;
    private _targetPosX: number;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBg1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBg2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgress: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatar: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRandAvatar1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRandAvatar2: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRandAvatar3: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRandAvatar4: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRandAvatar5: cc.Node = null;

    

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarRunAvatar: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarRunHero: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarRouteProgress: cc.Prefab = null;

   




    private _grainCarRunAvatar: GrainCarRunAvatar;
    private _routeProgress: GrainCarRouteProgress;
    private _scheduleTimeHandler;
    onLoad() {
        super.onLoad();
        this._initMember();
        this.node.name = ('GrainCarRun');
    }
    _initMember() {
        this._carSpeed = BG_MOVE_SPEED;
        this._curStatus = 0;
    }
    onCreate() {
    }
    onEnter() {
        this._initData();
        this._resetBg();
        this._initUI();
        this.schedule(handler(this, this._onUpdateMoveBg), 0);
        this._startTimer();
    }
    onExit() {
        this._stopTimer();
    }
    onShowFinish() {
    }
    _updateData() {
    }
    updateUI(carUnit) {
        this._grainCarRunAvatar.updateUI();
        if (carUnit.getStamina() <= 0) {
            this._grainCarRunAvatar.playDead();
            this._showUsers(false);
        }
    }
    carDead() {
        this._grainCarRunAvatar.playDead();
        this._routeProgress.carDead();
        this._stopTimer();
        this._carSpeed = 0;
        this._showUsers(false);
    }
    carReachTerminal() {
        this._grainCarRunAvatar.playIdle();
        this._routeProgress.carReachTerminal();
        this._stopTimer();
        this._carSpeed = 0;
        this._userPlayWin();
    }
    _initUI() {
        this._initAvatar();
        this._initProgress();
        this._initRandAvatar();
    }
    _initAvatar() {
        this._nodeAvatar.removeAllChildren();
        var grainCarRunAvatar = cc.instantiate(this._GrainCarRunAvatar).getComponent(GrainCarRunAvatar);
        this._nodeAvatar.addChild(grainCarRunAvatar.node);
        grainCarRunAvatar.updateUI();
        grainCarRunAvatar.faceRight();
        grainCarRunAvatar.setScale(1);
        grainCarRunAvatar.setGrainCarScale(0.62,0.82);
        grainCarRunAvatar.setTouchEnable(false);
        this._grainCarRunAvatar = grainCarRunAvatar;
    }
    _resetBg() {
        this._nodeBg1.x = (this._bgInitPosx1);
        this._nodeBg2.x = (this._bgInitPosx2);
    }
    _initProgress() {
        var carUnit = G_UserData.getGrainCar().getGrainCar();
        this._routeProgress = cc.instantiate(this._GrainCarRouteProgress).getComponent(GrainCarRouteProgress);
        this._routeProgress.ctor(carUnit)
        this._nodeProgress.removeAllChildren();
        this._nodeProgress.addChild(this._routeProgress.node);
    }
    _initRandAvatar() {
        var users: any = G_UserData.getGrainCar().getUsers();
        var randList = GrainCarConfigHelper.randDiff(1, 5, users.length);
        console.log("randList-------",randList);
        for (var i = 1; i <= users.length; i++) {
            var index = randList[i-1];
            var simpleUserData = users[i-1];
            if(index<0||index>5)
            {
                continue;
            }
            var avatar = cc.instantiate(this._GrainCarRunHero).getComponent(GrainCarRunHero);
            (this['_nodeRandAvatar' + index] as cc.Node).removeAllChildren();
            (this['_nodeRandAvatar' + index] as cc.Node).addChild(avatar.node);
            avatar.updateAvatar(simpleUserData);
            this['_userAvatar_' + i] = avatar;
        }
    }
    _initData() {
        this._bgInitPosx1 = this._nodeBg1.x;
        this._bgInitPosx2 = this._nodeBg2.x;
        this._targetPosX = this._bgInitPosx1 - BG_WIDTH;
    }
    _startTimer() {
        this._stopTimer();
        this._scheduleTimeHandler = handler(this, this._updateTimer);
        this.schedule(this._scheduleTimeHandler, 1);
        this._updateTimer();
    }
    _stopTimer() {
        if (this._scheduleTimeHandler != null) {
            this.unschedule(this._scheduleTimeHandler);
            this._scheduleTimeHandler = null;
        }
    }
    _updateTimer() {
        var carUnit = G_UserData.getGrainCar().getGrainCar();
        this._routeProgress.updateUI(carUnit);
        if (carUnit.isStop()) {
            this._grainCarRunAvatar.playIdle();
            this._carSpeed = 0;
            this._userPlayIdle();
        } else {
            this._grainCarRunAvatar.playRun();
            this._carSpeed = BG_MOVE_SPEED;
            this._userPlayRun();
        }
        if (carUnit.isReachTerminal()) {
            this._stopTimer();
        }
    }

    _userPlayIdle() {
        if (this._curStatus == STATUS_IDLE) {
            return;
        }
        this._curStatus = STATUS_IDLE;
        var users: any = G_UserData.getGrainCar().getUsers();
        for (var i = 1; i <= users.length; i++) {
            this['_userAvatar_' + i].playIdle();
        }
    }
    _userPlayWin() {
        if (this._curStatus == STATUS_WIN) {
            return;
        }
        this._curStatus = STATUS_WIN;
        var users: any = G_UserData.getGrainCar().getUsers();
        for (var i = 1; i <= users.length; i++) {
            this['_userAvatar_' + i].playWin();
        }
    }
    _userPlayRun() {
        if (this._curStatus == STATUS_RUN) {
            return;
        }
        this._curStatus = STATUS_RUN;
        var users: any = G_UserData.getGrainCar().getUsers();
        for (var i = 1; i <= users.length; i++) {
            this['_userAvatar_' + i].playRun();
        }
    }
    _showUsers(bShow) {
        for (var i = 1; i <= 5; i++) {
            this['_nodeRandAvatar' + i].active = (bShow);
        }
    }
    _onUpdateMoveBg(dt) {
        var moveNode = function (node) {
            var posx = node.x - this._carSpeed * dt;
            node.x = (posx);
        }.bind(this)
        var checkNode = function (node) {
            var posx = node.x;
            if (posx < this._targetPosX) {
                return false;
            } else {
                return true;
            }
        }.bind(this)
        moveNode(this._nodeBg1);
        moveNode(this._nodeBg2);
        if (checkNode(this._nodeBg1) == false) {
            var posx = this._nodeBg2.x + BG_WIDTH;
            this._nodeBg1.x = (posx);
        }
        if (checkNode(this._nodeBg2) == false) {
            var posx = this._nodeBg1.x + BG_WIDTH;
            this._nodeBg2.x = (posx);
        }
    }
};
