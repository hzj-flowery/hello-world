import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_Prompt, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonNormalSmallPop from "../../../ui/component/CommonNormalSmallPop";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import GrainCarBar from "./GrainCarBar";
import GrainCarConfigHelper from "./GrainCarConfigHelper";
import { GrainCarDataHelper } from "./GrainCarDataHelper";
import PopupGrainCarDetailAvatar from "./PopupGrainCarDetailAvatar";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupGrainCarDetail extends PopupBase {

    @property({
        type: GrainCarBar,
        visible: true
    })
    _barArmy: GrainCarBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textLeave: cc.Label = null;

    

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatar: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnFight: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonNormalSmallPop,
        visible: true
    })
    _popBG: CommonNormalSmallPop = null;
    
    @property({
        type: cc.Prefab,
        visible: true
    })
    _PopupGrainCarDetailAvatar: cc.Prefab = null;
    
    

    static SCALE_AVATAR = 0.8;
    private _signalGrainCarAttack;
    private _signalGrainCarNotify;
    private _mineData;
    private _carUnit;
    private _scheduleTimeHandler;
    ctor(carUnit, mineData) {
        this._mineData = mineData;
        this._carUnit = carUnit;
        this.node.name =  ('PopupGrainCarDetail');
    }
    onCreate() {
        this._initUI();
    }
    onEnter() {
        this._updateUI();
        this._startTimer();
        this._signalGrainCarAttack = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_ATTACK, handler(this, this._onEventGrainCarAttack));
        this._signalGrainCarNotify = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_NOTIFY, handler(this, this._onEventGrainCarNotify));
        this._btnFight.addClickEventListenerEx(handler(this,this._onFightClick));
    }
    onExit() {
        this._stopTimer();
        if (this._signalGrainCarAttack) {
            this._signalGrainCarAttack.remove();
            this._signalGrainCarAttack = null;
        }
        if (this._signalGrainCarNotify) {
            this._signalGrainCarNotify.remove();
            this._signalGrainCarNotify = null;
        }
    }
    _initUI() {
        if (!this._carUnit.isInMine(this._mineData.getId())) {
            this.closeWithAction();
            G_Prompt.showTip(Lang.get('grain_car_has_left'));
            return;
        }
        this._popBG.addCloseEventListener(handler(this, this.closeWithAction));
        this._popBG.setTitle(Lang.get('grain_car_attack'));
        var sameGuild = false;
        var myGuildId = G_UserData.getGuild().getMyGuildId();
        if (this._carUnit.getGuild_id() != 0 && myGuildId == this._carUnit.getGuild_id()) {
            sameGuild = true;
        }
        this._btnFight.setVisible(!sameGuild);
        this._btnFight.setString(Lang.get('mine_fight'));
        this._updateAvatar();
        this._textGuildName.string = (this._carUnit.getGuild_name());
        this._textGuildName.node.color = (Colors.getMineGuildColor(2));
    }
    _updateData() {
        this._carUnit = G_UserData.getGrainCar().getGrainCarWithGuildId(this._carUnit.getGuild_id());
    }
    _updateUI() {
        if (this._carUnit.isInMine(this._mineData.getId())) {
            this._barArmy.updateBarWithCarUnit(this._carUnit);
        } else {
            this.closeWithAction();
        }
    }
    _updateAvatar() {
        this._nodeAvatar.removeAllChildren();
        var popupGrainCarAvatar = cc.instantiate(this._PopupGrainCarDetailAvatar).getComponent(PopupGrainCarDetailAvatar)
        popupGrainCarAvatar.ctor(this._mineData);
        this._nodeAvatar.addChild(popupGrainCarAvatar.node);
        popupGrainCarAvatar.updateUI(this._carUnit);
        popupGrainCarAvatar.faceLeft();
        popupGrainCarAvatar.setScale(2);
        popupGrainCarAvatar.setTouchEnable(false);
    }
    _updateBtn() {
        var data = GrainCarDataHelper.canAttackGrainCar();
        var canAttack = data[0];
        var nextAtkTime = data[1];
        if (canAttack) {
            this._btnFight.setEnabled(true);
            this._btnFight.setString(Lang.get('grain_car_attack_btn'));
        } else {
            this._btnFight.setEnabled(false);
            this._btnFight.setString(G_ServerTime.getLeftSeconds(nextAtkTime as number) + Lang.get('grain_car_second'));
        }
    }
    _startTimer() {
        this._stopTimer();
        this._scheduleTimeHandler = handler(this, this._updateTimer);
        this.schedule(this._scheduleTimeHandler, 1);
        this._updateBtn();
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
        if (carUnit.getStamina() <= 0) {
            this._textLeave.string = (Lang.get('grain_car_has_broken'));
            return;
        }
        var leaveTime = carUnit.getLeaveTime();
        this._textLeave.string = (G_ServerTime.getLeftSecondsString(leaveTime));
        var curTime = G_ServerTime.getTime();
        if (curTime > leaveTime) {
            this._textLeave.string = (Lang.get('grain_car_has_left'));
        }
    }
    _updateTimer() {
        this._updateBtn();
        this._updateLeaveTime();
    }
    _onFightClick() {
        if (this._mineData.getId() != G_UserData.getMineCraftData().getSelfMineId()) {
            G_Prompt.showTip(Lang.get('mine_diff_mine'));
            return;
        }
        if (this._carUnit.getStamina() <= 0) {
            G_Prompt.showTip(Lang.get('grain_car_has_broken'));
            return;
        }
        this._btnFight.setEnabled(false);
        G_UserData.getGrainCar().c2sAttackGrainCar(this._carUnit.getGuild_id(), this._mineData.getId());
    }
    _onEventGrainCarAttack(event, awards) {
        this._updateData();
        this._updateBtn();
        this._updateAvatar();
        var name = this._carUnit.getConfig().name;
        var hurt = GrainCarConfigHelper.getGrainCarAttackHurt();
        G_Prompt.showTip(Lang.get('grain_car_attack_success', {
            name: name,
            hurt: hurt
        }));
        G_Prompt.showAwards(awards);
    }
    _onEventGrainCarNotify() {
        this._updateData();
        this._updateAvatar();
    }
}