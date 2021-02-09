import { G_SceneManager, G_ServerTime } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonGrainCarAvatar from "../../../ui/component/CommonGrainCarAvatar";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ViewBase from "../../ViewBase";
import GrainCarBar from "./GrainCarBar";
import GrainCarConfigHelper from "./GrainCarConfigHelper";
import PopupGrainCarDetail from "./PopupGrainCarDetail";

var NODE_FLAG_POSITIONX = -82;
var NODE_TITLE_POSITIONX = 35;
var CAR_LAYOUT = [
    {
        flag: cc.v2(-82, 150),
        title: cc.v2(0, 190)
    },
    {
        flag: cc.v2(-82, 150),
        title: cc.v2(0, 190)
    },
    {
        flag: cc.v2(-82, 150),
        title: cc.v2(0, 190)
    }
];
const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupGrainCarDetailAvatar extends ViewBase {

    @property({
        type: GrainCarBar,
        visible: true
    })
    _barArmy: GrainCarBar = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _touchPanel: cc.Node = null;
    @property({
        type: CommonGrainCarAvatar,
        visible: true
    })
    _grainCarAvatar: CommonGrainCarAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlag: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTitle: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _leaveTime: cc.Label = null;

    
    
    private _mineData;
    private _carUnit;
    private _bTouchEnable:boolean;
    private _scheduleTimeHandler;
    ctor(mineData) {
        this._mineData = mineData;
        this._carUnit = null;
        this._bTouchEnable = true;
    }
    onCreate() {
        // this._touchPanel.setSwallowTouches(false);
    }
    onEnter() {
        this._touchPanel.on(cc.Node.EventType.TOUCH_START,handler(this,this._onPanelClick))
    }
    onExit() {
        this._stopTimer();
        this._touchPanel.off(cc.Node.EventType.TOUCH_START,handler(this,this._onPanelClick))
    }
    faceLeft() {
        var level = this._carUnit.getLevel();
        this._grainCarAvatar.turnBack(true);
        this._nodeFlag.x = (-NODE_FLAG_POSITIONX);
        this._nodeTitle.x = (CAR_LAYOUT[level].title.x);
    }
    faceRight() {
        var level = this._carUnit.getLevel();
        this._grainCarAvatar.turnBack(false);
        this._nodeFlag.x = (NODE_FLAG_POSITIONX);
        this._nodeTitle.x = (CAR_LAYOUT[level].title.x);
    }
    updateUI(carUnit) {
        this._carUnit = carUnit;
        var level = carUnit.getLevel();
        this._grainCarAvatar.updateUI(level);
        this._nodeFlag.setPosition(CAR_LAYOUT[level].flag);
        this._nodeTitle.setPosition(CAR_LAYOUT[level].title);
        this._barArmy.updateBarWithCarUnit(carUnit);
        if (carUnit.getStamina() <= 0) {
            this._leaveTime.string = (Lang.get('grain_car_has_broken'));
            this._stopTimer();
            return;
        }
        this._grainCarAvatar.playIdle();
        this._grainCarAvatar.turnBack(true);
    }
    setScale(scale) {
        this._grainCarAvatar.setScale(scale);
    }
    setTouchEnable(bEnable) {
        this._bTouchEnable = bEnable;
    }
    _startTimer() {
        this._stopTimer();
        this._scheduleTimeHandler = handler(this, this._updateTimer);
        this.schedule(this._scheduleTimeHandler, 1);
        this._updateLeaveTime();
    }
    _stopTimer() {
        if (this._scheduleTimeHandler != null) {
            this.unschedule(this._scheduleTimeHandler);
            this._scheduleTimeHandler = null;
        }
    }
    _updateLeaveTime() {
        var carUnit = this._carUnit;
        var leaveTime = carUnit.getLeaveTime();
        this._leaveTime.string = (G_ServerTime.getLeftSecondsString(leaveTime));
        var curTime = G_ServerTime.getTime();
        if (curTime > leaveTime) {
            this._leaveTime.string = (Lang.get('grain_car_has_left'));
        }
    }
    _updateTimer() {
        var startTime = GrainCarConfigHelper.getNextGrainCarStartTime();
        this._leaveTime.string = (G_ServerTime.getLeftSecondsString(startTime));
        this._updateLeaveTime();
    }
    _onPanelClick(sender) {
        if (!this._carUnit) {
            return;
        }
        if (!this._bTouchEnable) {
            return;
        }
        var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (!this._carUnit.isFriendCar()) {
                var popupGrainCarDetail = new PopupGrainCarDetail();
                popupGrainCarDetail.openWithAction();
                G_SceneManager.openPopup(Path.getPrefab("PopupGrainCarDetail","grainCar"),function(pop:PopupGrainCarDetail){
                    pop.ctor(this._carUnit, this._mineData);
                    pop.openWithAction();
                }.bind(this))
            }
        }
    }
};