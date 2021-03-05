import { SignalConst } from "../../../const/SignalConst";
import EffectGfxMoving from "../../../effect/EffectGfxMoving";
import { Colors, G_EffectGfxMgr, G_ServerTime, G_SignalManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonGrainCarAvatar from "../../../ui/component/CommonGrainCarAvatar";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import GrainCarBar from "./GrainCarBar";
import { GrainCarDataHelper } from "./GrainCarDataHelper";

var NODE_FLAG_POSITIONX = -70;
var NODE_TITLE_POSITIONX = 35;
var CAR_LAYOUT = {
    [1]: {
        flag: cc.v2(-70, 160),
        title: cc.v2(0, 160)
    },
    [2]: {
        flag: cc.v2(-70, 160),
        title: cc.v2(0, 160)
    },
    [3]: {
        flag: cc.v2(-70, 160),
        title: cc.v2(0, 160)
    },
    [4]: {
        flag: cc.v2(-70, 160),
        title: cc.v2(0, 160)
    },
    [5]: {
        flag: cc.v2(-70, 160),
        title: cc.v2(0, 160)
    }
};
const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupGrainCarAvatar extends ViewBase {
    @property({
        type: cc.Label,
        visible: true
    })
    _leaveTime: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _touchPanel: cc.Node = null;

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
        type: cc.Node,
        visible: true
    })
    _nodeAttackCD: cc.Node = null;



    @property({
        type: cc.Label,
        visible: true
    })
    _guildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelAtkCD: cc.Label = null;



    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSword: cc.Node = null;



    @property({
        type: CommonGrainCarAvatar,
        visible: true
    })
    _grainCarAvatar: CommonGrainCarAvatar = null;

    @property({
        type: GrainCarBar,
        visible: true
    })
    _barArmy: GrainCarBar = null;



    private _mineData;
    private _carUnit;
    private _onClickAvatarCallback;
    private _swordEffect: EffectGfxMoving;
    private _scheduleTimeHandler;

    ctor(mineData) {
        this._mineData = mineData;
        this._carUnit = null;
        this._onClickAvatarCallback = null;
    }
    onCreate() {
        // this._touchPanel.setSwallowTouches(false);
        this._touchPanel.on(cc.Node.EventType.TOUCH_START,handler(this,this._onPanelClick));
        this._createSwordEft();
    }
    onEnter() {
        if (this._carUnit) {
            this._startTimer();
        }
    }
    onExit() {
        this._touchPanel.off(cc.Node.EventType.TOUCH_START,handler(this,this._onPanelClick));
        this._stopTimer();
    }
    faceLeft() {
        var level = this._carUnit.getLevel();
        this._grainCarAvatar.turnBack(true);
        this._nodeFlag.x = (-CAR_LAYOUT[level].flag.x);
        this._nodeTitle.x = (-CAR_LAYOUT[level].title.x);
    }
    faceRight() {
        var level = this._carUnit.getLevel();
        this._grainCarAvatar.turnBack(false);
        this._nodeFlag.x = (CAR_LAYOUT[level].flag.x);
        this._nodeTitle.x = (CAR_LAYOUT[level].title.x);
    }
    updateUI(carUnit) {
        this._carUnit = carUnit;
        var level = carUnit.getLevel();
        this._grainCarAvatar.updateUI(level);
        this._nodeFlag.setPosition(CAR_LAYOUT[level].flag);
        this._nodeTitle.setPosition(CAR_LAYOUT[level].title);
        this._guildName.string = (carUnit.getGuild_name() + (Lang.get('grain_car_guild_de') + carUnit.getConfig().name));
        if (GrainCarDataHelper.isMyGuild(carUnit.getGuild_id())) {
            this._guildName.node.color = (Colors.BRIGHT_BG_GREEN);
            UIHelper.enableOutline(this._guildName, Colors.COLOR_QUALITY_OUTLINE[1], 1)
        } else {
            this._guildName.node.color = (Colors.BRIGHT_BG_RED);
            UIHelper.enableOutline(this._guildName, Colors.COLOR_QUALITY_OUTLINE[5], 1);
        }
        this._barArmy.updateBarWithCarUnit(carUnit);
        if (carUnit.getStamina() <= 0) {
            this._leaveTime.string = (Lang.get('grain_car_has_broken'));
            this._stopTimer();
            this._grainCarAvatar.playDead();
            this._nodeSword.active = (false);
            this._nodeAttackCD.active = (false);
            return;
        }
        this._nodeSword.active = (!this._carUnit.isFriendCar());
        this._grainCarAvatar.playIdle();
        this._grainCarAvatar.turnBack(true);
        this._stopTimer();
        this._startTimer();
        this._grainCarAvatar.node.setScale(0.31,0.41);
    }
    setClickCallback(cb) {
        this._onClickAvatarCallback = cb;
    }
    _createSwordEft() {
        this._swordEffect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeSword, 'moving_shuangjian', null, null, false);
    }
    _startTimer() {
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
    _updateLeaveTime() {
        var carUnit = this._carUnit;
        var leaveTime = carUnit.getLeaveTime();
        this._leaveTime.string = (G_ServerTime.getLeftSecondsString(leaveTime));
        var curTime = G_ServerTime.getTime();
        if (curTime > leaveTime) {
            this._leaveTime.string = (Lang.get('grain_car_has_left'));
            this._stopTimer();
        }
    }
    _updateAttackCD() {
        if (this._carUnit.isFriendCar()) {
            this._nodeAttackCD.active = (false);
            this._nodeSword.active = (false);
            return;
        }
        var [canAttack, nextAtkTime] = GrainCarDataHelper.canAttackGrainCar();
        if (canAttack) {
            this._nodeAttackCD.active = (false);
            this._nodeSword.active = (true);
        } else {
            this._nodeAttackCD.active = (true);
            this._nodeSword.active = (false);
            this._labelAtkCD.string = "" + (G_ServerTime.getLeftSeconds(nextAtkTime));
        }
    }
    _updateTimer() {
        this._updateLeaveTime();
        this._updateAttackCD();
    }
    _onPanelClick(sender:cc.Event.EventTouch) {
        if (!this._carUnit) {
            return;
        }
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (!this._carUnit.isFriendCar()) {
                G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_AVATAR_CLICK_IN_MINE, this._carUnit);
            }
        }
    }
};
