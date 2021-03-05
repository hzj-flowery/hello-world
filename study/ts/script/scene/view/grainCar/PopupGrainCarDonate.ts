import { FunctionConst } from "../../../const/FunctionConst";
import { GrainCarConst } from "../../../const/GrainCarConst";
import { GuildConst } from "../../../const/GuildConst";
import { SignalConst } from "../../../const/SignalConst";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import CommonHelp from "../../../ui/component/CommonHelp";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import CommonResourceInfoList from "../../../ui/component/CommonResourceInfoList";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { table } from "../../../utils/table";
import UIHelper from "../../../utils/UIHelper";
import GrainCarConfigHelper from "./GrainCarConfigHelper";
import GrainCarInfoNode from "./GrainCarInfoNode";
import GrainCarRouteProgress from "./GrainCarRouteProgress";
import GrainCarRun from "./GrainCarRun";


const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupGrainCarDonate extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelDonateCount: cc.Label = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;


    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgress: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelAdmin: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelAll: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textExpPercent1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textExpPercent2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _expTitle: cc.Sprite = null;



    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRichText: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMoving: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMaxLevel: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTime: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _titleBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _arrow: cc.Sprite = null;



    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDonate: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRun: cc.Node = null;


    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRouteConfig: cc.Node = null;



    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInfo1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInfo2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _shareMenuRoot: cc.Node = null;



    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBoxAdmin: cc.Toggle = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBoxAll: cc.Toggle = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnAdmin: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnShare: cc.Button = null;

    
    @property({
        type: cc.Button,
        visible: true
    })
    _btnAll: cc.Button = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnDonate: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnLaunch: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnGo2Car: CommonButtonLevel0Highlight = null;


    @property({
        type: cc.Label,
        visible: true
    })
    _donateCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _tips: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenTime: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _titleOpenTime: cc.Label = null;






    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _progressExp: cc.ProgressBar = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _resourceCost: CommonResourceInfoList = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _grainCarInfoNode: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _grainCarRouteProgress: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarRun: cc.Prefab = null;

    


    static TITLE_BG_HEIGHT = 28;
    static LV_UP_EFFECT_OFFSET = 60;
    static TITLE_CONFIG = {
        [GuildConst.GUILD_POSITION_1]: {
            bgWidth: 370,
            time: 37,
            route: -85,
            routeShow: true,
            routeConfig: true,
            terminalShow: false
        },
        [GuildConst.GUILD_POSITION_2]: {
            bgWidth: 370,
            time: 37,
            route: -85,
            routeShow: true,
            routeConfig: true,
            terminalShow: false
        },
        [GuildConst.GUILD_POSITION_3]: {
            bgWidth: 370,
            time: 37,
            route: -85,
            routeShow: true,
            routeConfig: true,
            terminalShow: false
        },
        [GuildConst.GUILD_POSITION_4]: {
            bgWidth: 370,
            time: 37,
            route: -85,
            routeShow: false,
            routeConfig: true,
            terminalShow: false
        }
    }

    private _curCarData;
    private _userPosition;
    private _lastLevel;
    private _signalOnGetGrainCarInfo;
    private _signalOnUpgradeGrainCar;
    private _signalOnGrainCarAuthChanged;
    private _signalOnUpdateGrainCar;
    private _signalOnLaunchGrainCar;
    private _signalOnGrainCarAuthNotify;
    private _signalRedPointUpdate;
    private _carInfoNode1: GrainCarInfoNode;
    private _carInfoNode2: GrainCarInfoNode;
    private _routeProgress: GrainCarRouteProgress;
    private _carRun: GrainCarRun;
    private _scheduleTimeHandler;

    static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            callBack();
        }
        G_UserData.getGrainCar().c2sGetGrainCarInfo();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_GRAIN_CAR_GET_INFO, onMsgCallBack);
        return signal;
    }
    ctor() {
        this.node.name = ('PopupGrainCarDonate');
    }
    onCreate() {
        this._btnDonate.setBtnType(2);
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
        this._initUI();

        UIHelper.enableOutline(this._donateCount,new cc.Color(93,41,7),1); 
        UIHelper.enableOutline(this._textExpPercent1,new cc.Color(73,153,46),2);
        UIHelper.enableOutline(this._textExpPercent2,new cc.Color(73,153,46),2);
        UIHelper.enableOutline(this._labelAdmin,new cc.Color(0,0,0),2)
        UIHelper.enableOutline(this._labelAll,new cc.Color(0,0,0),2);
    }
    onEnter() {
        this._signalOnGetGrainCarInfo = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_GET_INFO, handler(this, this._onGetGrainCarInfo));
        this._signalOnUpgradeGrainCar = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_UPGRADE, handler(this, this._onUpgradeGrainCar));
        this._signalOnGrainCarAuthChanged = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_CHANGE_AUTH, handler(this, this._onGrainCarAuthChanged));
        this._signalOnUpdateGrainCar = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_NOTIFY, handler(this, this._onUpdateGrainCar));
        this._signalOnLaunchGrainCar = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_LAUNCH, handler(this, this._onLaunchGrainCar));
        this._signalOnGrainCarAuthNotify = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_VIEW_NOTIFY, handler(this, this._onGrainCarAuthNotify));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._updateData();
        this._initRoute();
        this._updateUI();
        this._startTimer();
        this._btnDonate.addClickEventListenerEx(handler(this,this._onBtnDonateOnClick));
        this._btnLaunch.addClickEventListenerEx(handler(this,this._onBtnLaunchOnClick));
        
        this._btnAdmin.clickEvents = [];
        var onClick1 = new cc.Component.EventHandler();
        onClick1.target = this.node;
        onClick1.component = "PopupGrainCarDonate";
        onClick1.handler = "_onBtnShareAdminOnClick";
        this._btnAdmin.clickEvents.push(onClick1);
        this._btnAll.clickEvents = [];
        var onClick2 = new cc.Component.EventHandler();
        onClick2.target = this.node;
        onClick2.component = "PopupGrainCarDonate";
        onClick2.handler = "_onBtnShareAllOnClick";
        this._btnAll.clickEvents.push(onClick2);
        this._btnGo2Car.addClickEventListenerEx(handler(this,this._onBtnGo2CarOnClick));
        this._btnShare.clickEvents = [];
        var onClick3 = new cc.Component.EventHandler();
        onClick3.target = this.node;
        onClick3.component = "PopupGrainCarDonate";
        onClick3.handler = "_onBtnShareOnClick";
        this._btnShare.clickEvents.push(onClick3);

    }
    onExit() {
        if (this._signalOnGetGrainCarInfo) {
            this._signalOnGetGrainCarInfo.remove();
            this._signalOnGetGrainCarInfo = null;
        }
        if (this._signalOnUpgradeGrainCar) {
            this._signalOnUpgradeGrainCar.remove();
            this._signalOnUpgradeGrainCar = null;
        }
        if (this._signalOnGrainCarAuthChanged) {
            this._signalOnGrainCarAuthChanged.remove();
            this._signalOnGrainCarAuthChanged = null;
        }
        if (this._signalOnUpdateGrainCar) {
            this._signalOnUpdateGrainCar.remove();
            this._signalOnUpdateGrainCar = null;
        }
        if (this._signalOnLaunchGrainCar) {
            this._signalOnLaunchGrainCar.remove();
            this._signalOnLaunchGrainCar = null;
        }
        if (this._signalOnGrainCarAuthNotify) {
            this._signalOnGrainCarAuthNotify.remove();
            this._signalOnGrainCarAuthNotify = null;
        }
        if (this._signalRedPointUpdate) {
            this._signalRedPointUpdate.remove();
            this._signalRedPointUpdate = null;
        }
        this._stopTimer();
    }
    onShowFinish() {
    }
    _updateData() {
        this._curCarData = G_UserData.getGrainCar().getGrainCar();
        var userInfo = G_UserData.getGuild().getMyMemberData();
        this._userPosition = userInfo.getPosition();
    }
    _initUI() {
        this._commonNodeBk.setTitle(Lang.get('grain_car_donate_title'));
        this._commonHelp.updateUI(FunctionConst.FUNC_GRAIN_CAR);
        this._btnAdmin.node.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = (Lang.get('grain_car_btn_share_title_admin'));
        this._btnAll.node.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = (Lang.get('grain_car_btn_share_title_all'));
        this._btnDonate.setString(Lang.get('grain_car_btn_donate'));
        this._btnLaunch.setString(Lang.get('grain_car_btn_launch'));
        this._btnGo2Car.setString(Lang.get('grain_car_btn_go2Car'));
        this._donateCount.string = (Lang.get('grain_car_donate_tip_at_least', { num: GrainCarConfigHelper.getGrainCarLevelUp() }));
        this._shareMenuRoot.active = (false);
        var boxAdCheck = new cc.Component.EventHandler();
        boxAdCheck.target = this.node;
        boxAdCheck.component = "PopupGrainCarDonate";
        boxAdCheck.handler = "onClickCheckBoxAdmin";
        this._checkBoxAdmin.clickEvents = [];
        this._checkBoxAdmin.clickEvents.push(boxAdCheck);
        var boxAllCheck = new cc.Component.EventHandler();
        boxAllCheck.target = this.node;
        boxAllCheck.component = "PopupGrainCarDonate";
        boxAllCheck.handler = "onClickCheckBoxAll";
        this._checkBoxAll.clickEvents = [];
        this._checkBoxAll.clickEvents.push(boxAllCheck);
        this._labelAdmin.string = (Lang.get('grain_car_btn_share_title_admin'));
        this._labelAll.string = (Lang.get('grain_car_btn_share_title_all'));
        var canDonate = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, 'canDonate');
        var canLaunch = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, 'canLaunch');
        this._btnDonate.showRedPoint(canDonate);
        this._btnLaunch.showRedPoint(canLaunch);
        var [type, value, size] = GrainCarConfigHelper.getGrainCarDonateCost();
        this._resourceCost.updateUI(type, value, size);
        this._resourceCost.setCountColorToWhite();
        var exp = GrainCarConfigHelper.getGrainCarDonateExp();
        var content = Lang.get('grain_car_add_exp', { exp: exp });
        var label = RichTextExtend.createWithContent(content);
        label.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeRichText.addChild(label.node);
        var grainCarInfoNode1 = cc.instantiate(this._grainCarInfoNode).getComponent(GrainCarInfoNode);
        grainCarInfoNode1.setTextType(1);
        this._nodeInfo1.addChild(grainCarInfoNode1.node);
        var nodeInfoPos = this._nodeInfo1.getPosition();
        this._nodeMoving.setPosition(cc.v2(nodeInfoPos.x + PopupGrainCarDonate.LV_UP_EFFECT_OFFSET, nodeInfoPos.y));
        this._carInfoNode1 = grainCarInfoNode1;
        var grainCarInfoNode2 = cc.instantiate(this._grainCarInfoNode).getComponent(GrainCarInfoNode);
        grainCarInfoNode2.setTextType(2);
        grainCarInfoNode2.setRightType();
        this._nodeInfo2.addChild(grainCarInfoNode2.node);
        this._carInfoNode2 = grainCarInfoNode2;
    }
    _initRoute() {
        this._routeProgress = cc.instantiate(this._grainCarRouteProgress).getComponent(GrainCarRouteProgress)
        this._routeProgress.ctor(this._curCarData);
        this._nodeProgress.removeAllChildren();
        this._nodeProgress.addChild(this._routeProgress.node);
        this._routeProgress.updateUIStatic();
        this._routeProgress.showTerminal(false);
        this._lastLevel = this._curCarData.getLevel();
    }
    _updateUI(withAni?) {
        this._updateProgress(withAni);
        this._updateCar();
        this._updateTitle();
        this._updateLaunchBtn();
    }
    _updateCar() {
        var curLevel = this._curCarData.getLevel();
        var countDonate = this._curCarData.getDonate_users();
        this._labelDonateCount.string = (countDonate);
        this._nodeProgress.active = (countDonate >= GrainCarConfigHelper.getGrainCarLevelUp());
        if (curLevel > this._lastLevel) {
            this._playLevelUpEffect();
        }
        if (countDonate == GrainCarConfigHelper.getGrainCarLevelUp()) {
            this._initRoute();
        }
        if (this._curCarData.getLevel() < GrainCarConst.MAX_LEVEL) {
            this._carInfoNode1.updateUI(curLevel);
            this._carInfoNode2.updateUI(curLevel + 1);
            this._nodeMaxLevel.active = (false);
        } else {
            this._carInfoNode1.updateUI(curLevel);
            this._nodeDonate.active = (true);
            this._nodeMaxLevel.active = (false);
            this._expTitle.node.active = (false);
            this._putMiddle();
        }
        this._lastLevel = this._curCarData.getLevel();
    }
    _updateProgress(withAni) {
        var maxExp = this._curCarData.getConfig().exp;
        if (this._curCarData.getLevel() == GrainCarConst.MAX_LEVEL) {
            var config = GrainCarConfigHelper.getGrainCarConfig(GrainCarConst.MAX_LEVEL - 1);
            maxExp = config.exp;
        }
        var curExp = this._curCarData.getExp();
        var percent = curExp / maxExp;
        this._progressExp.progress = (percent);

        if (withAni) {
            var lastValue = parseInt(this._textExpPercent1.string);
            if (curExp != lastValue) {
                // this._textExpPercent2.doScaleAnimation();
                var scal1 = cc.scaleTo(0.2,1.5,1.5);
                var scal2 = cc.scaleTo(0.2,1,1);
                this._textExpPercent2.node.runAction(cc.sequence(scal1,scal2,null))
            }
            this._textExpPercent1.string = (curExp);
        } else {
            this._textExpPercent1.string = (curExp);
        }
        this._textExpPercent2.string = ('/' + maxExp);
    }
    _updateTitle() {
        this._updateAuth();
    }
    _updateAuth() {
        if (this._curCarData.getDonate_users() < GrainCarConfigHelper.getGrainCarLevelUp()) {
            this._nodeRouteConfig.active = (false);
            return;
        }
        var userPosition = this._userPosition;
        if (userPosition == GuildConst.GUILD_POSITION_1 || userPosition == GuildConst.GUILD_POSITION_2 || userPosition == GuildConst.GUILD_POSITION_3) {
            this._updateAuthWithPosition(userPosition);
        } else {
            if (this._curCarData.getAll_view() == 0) {
                this._updateAuthWithPosition(userPosition);
            } else if (this._curCarData.getAll_view() == 1) {
                this._updateAuthWithPosition(GuildConst.GUILD_POSITION_3);
            }
        }
        this._countAd = 0;
        this._countAl = 0;
        this._checkBoxAdmin.isChecked = (this._curCarData.getAll_view() == 0);
        this._checkBoxAll.isChecked = (this._curCarData.getAll_view() == 1);
        
    }
    _updateAuthWithPosition(pos) {
        this._titleBg.node.setContentSize(cc.size(PopupGrainCarDonate.TITLE_CONFIG[pos].bgWidth, PopupGrainCarDonate.TITLE_BG_HEIGHT));
        this._nodeTime.x = (PopupGrainCarDonate.TITLE_CONFIG[pos].time);
        this._nodeRouteConfig.active = (PopupGrainCarDonate.TITLE_CONFIG[pos].routeConfig);
        this._routeProgress.showRouteName(PopupGrainCarDonate.TITLE_CONFIG[pos].routeShow);
        this._nodeProgress.x = (PopupGrainCarDonate.TITLE_CONFIG[pos].route);
        this._routeProgress.showTerminal(PopupGrainCarDonate.TITLE_CONFIG[pos].terminalShow);
    }
    _updateLaunchBtn() {
        if (GrainCarConfigHelper.isInLaunchTime() && this._curCarData.getLevel() > 1 && (this._userPosition == GuildConst.GUILD_POSITION_1 || this._userPosition == GuildConst.GUILD_POSITION_2)) {
            this._showLaunchBtn(true);
            this._nodeDonate.active = (false);
        } else {
            this._showLaunchBtn(false);
        }
    }
    _showLaunchBtn(bShow) {
        this._btnLaunch.node.active = (bShow);
        if(GrainCarConfigHelper.isInLaunchTime())
        {
            this.handleLaunch();
        }
    }
    _updateInActivityTime() {
        if (GrainCarConfigHelper.isInActivityTime()) {
            if (this._curCarData.hasLaunched()) {
                if (!this._carRun) {
                    this._carRun = cc.instantiate(this._GrainCarRun).getComponent(GrainCarRun);
                    this._nodeRun.addChild(this._carRun.node);
                }
                if (this._curCarData.isDead()) {
                    this._carRun.carDead();
                } else if (this._curCarData.hasComplete()) {
                    this._carRun.carReachTerminal();
                }
                this._labelDonateCount.node.active = (false);
                this._donateCount.node.active = (false);
            } else {
                this._putMiddle();
                this._nodeDonate.active = (false);
                this._btnGo2Car.node.active = (false);
                if (this._userPosition == GuildConst.GUILD_POSITION_1 || this._userPosition == GuildConst.GUILD_POSITION_2) {
                    if (GrainCarConfigHelper.isInLaunchTime()) {
                        this._tips.node.active = (false);
                        this._showLaunchBtn(true);
                        if (this._curCarData.getDonate_users() >= GrainCarConfigHelper.getGrainCarLevelUp()) {
                            this._showLaunchBtn(true);
                        } else {
                            this._carInfoNode1.setRuntime(true);
                            this._showLaunchBtn(false);
                        }
                    } else if (GrainCarConfigHelper.isClose()) {
                        this._nodeProgress.active = (false);
                        this._tips.node.active = (true);
                        this._tips.string = (Lang.get('grain_car_has_not_launched'));
                        this._nodeRouteConfig.active = (false);
                    }
                } else {
                    if (GrainCarConfigHelper.isInLaunchTime()) {
                        this._tips.string = (Lang.get('grain_car_cannot_donate_in_activity_time'));
                    } else if (GrainCarConfigHelper.isClose()) {
                        this._tips.string = (Lang.get('grain_car_has_not_launched'));
                        this._nodeProgress.active = (false);
                    }
                    this._showLaunchBtn(false);
                }
            }
        } else {
            this._btnGo2Car.node.active = (false);
            this._tips.node.active = (false);
        }
    }
    _putMiddle() {
        this._nodeInfo1.active = (true);
        this._nodeInfo1.x = (0);
        this._nodeInfo2.active = (false);
        this._arrow.node.active = (false);
        var nodeInfoPos = this._nodeInfo1.getPosition();
        this._nodeMoving.setPosition(cc.v2(nodeInfoPos.x + PopupGrainCarDonate.LV_UP_EFFECT_OFFSET, nodeInfoPos.y));
    }
    _startTimer() {
        this._stopTimer();
        this._scheduleTimeHandler = handler(this, this._updateTimer);
        this.schedule(this._scheduleTimeHandler, 1)
        this._updateTimer();
    }
    _stopTimer() {
        if (this._scheduleTimeHandler != null) {
            this.unschedule(this._scheduleTimeHandler);
            this._scheduleTimeHandler = null;
        }
    }
    _playPrompt() {
        var summary = [];
        var content = Lang.get('grain_car_donate_success');
        var param = {
            content: content,
            flyTime: 0.3,
            anchorPoint: cc.v2(0.5, 0.5),
            startPosition: { y: 100 },
            dstPosition: cc.v2(0, 0),
            finishCallback: function () {
                if (this._curCarData) {
                    this._updateProgress(true);
                    this._updateCar();
                    this._updateTitle();
                    this._updateLaunchBtn();
                }
            }.bind(this)
        };
        table.insert(summary, param);
        // var color = Colors.colorparseInt(Colors.getColor(2));
        // var outlineColor = Colors.colorparseInt(Colors.getColorOutline(2));
        var color = Colors.getColor(2);
        var outlineColor = Colors.getColorOutline(2);
        var exp = GrainCarConfigHelper.getGrainCarDonateExp();
        var contentExp = Lang.get('grain_car_donate_add_exp', {
            exp: exp,
            color: color,
            outlineColor: outlineColor
        });
        var paramExp = {
            content: contentExp,
            flyTime: 0.3,
            anchorPoint: cc.v2(0.5, 0.5),
            startPosition: { y: 100 },
            dstPosition: cc.v2(0, 0),
            finishCallback: function () {
            }
        };
        table.insert(summary, paramExp);
        G_Prompt.showSummary(summary);
    }
    _playLevelUpEffect() {
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeMoving, 'moving_dangao_dangaoshengji', null, eventFunction, true);
    }
    _updateTimer() {
        if (GrainCarConfigHelper.isInActivityTimeFromGenerate()) {
            if (GrainCarConfigHelper.isInLaunchTime()) {
                let endTime: number = GrainCarConfigHelper.getGrainCarEndTimeStamp().getTime();
                this._textOpenTime.string = (G_ServerTime.getLeftSecondsString(endTime/1000));
                this._titleOpenTime.string = (Lang.get('grain_car_donate_title_close'));
            } else if (GrainCarConfigHelper.isClose()) {
                this._textOpenTime.string = (Lang.get('grain_car_is_over'));
            } else {
                let startTime: number = GrainCarConfigHelper.getGrainCarOpenTimeStamp().getTime(); 
                this._textOpenTime.string = (G_ServerTime.getLeftSecondsString(startTime/1000));
                this._titleOpenTime.string = (Lang.get('grain_car_donate_title_open'));
            }
        } else {
            let startTime = GrainCarConfigHelper.getNextGrainCarStartTime();
            this._textOpenTime.string = (G_ServerTime.getLeftSecondsString(startTime));
        }
        this._updateLaunchBtn();
        this._updateInActivityTime();
    }
    _onButtonClose() {
        this.close();
    }
    _onBtnShareOnClick() {
        this._shareMenuRoot.active = (!this._shareMenuRoot.active);
    }
    _onBtnShareAdminOnClick() {
        G_UserData.getGrainCar().c2sChangeGrainCarView(GrainCarConst.AUTH_ADMIN);
        this._shareMenuRoot.active = (false);
    }
    _onBtnShareAllOnClick() {
        G_UserData.getGrainCar().c2sChangeGrainCarView(GrainCarConst.AUTH_ALL);
        this._shareMenuRoot.active = (false);
    }
    private _countAd:number = 0;
    private _countAl:number = 0;
    onClickCheckBoxAdmin(target) {
        if (this._userPosition != GuildConst.GUILD_POSITION_1 && this._userPosition != GuildConst.GUILD_POSITION_2) {
            if(this._countAd>0)
            {
                G_Prompt.showTip(Lang.get('grain_car_no_auth_share'));
            }
            else
            {
                this._countAd++;
            }
            this._checkBoxAdmin.isChecked = (this._curCarData.getAll_view() == 0);
            this._checkBoxAll.isChecked = (this._curCarData.getAll_view() == 1);
            return;
        }
        if(target.isChecked)
        {
            G_UserData.getGrainCar().c2sChangeGrainCarView(GrainCarConst.AUTH_ADMIN);
            this._checkBoxAll.uncheck();
        }
        else
        {
            this._checkBoxAll.isChecked = true;
        }

    }
    onClickCheckBoxAll(target) {
        if (this._userPosition != GuildConst.GUILD_POSITION_1 && this._userPosition != GuildConst.GUILD_POSITION_2) {
            if(this._countAl>0)
            {
                G_Prompt.showTip(Lang.get('grain_car_no_auth_share'));
            }
            else
            {
                this._countAl++;
            }
            this._checkBoxAdmin.isChecked = (this._curCarData.getAll_view() == 0);
            this._checkBoxAll.isChecked = (this._curCarData.getAll_view() == 1);
            return;
        }
        if(target.isChecked)
        {
            G_UserData.getGrainCar().c2sChangeGrainCarView(GrainCarConst.AUTH_ALL);
            this._checkBoxAdmin.uncheck();
        }
        else
        {
            this._checkBoxAdmin.isChecked = true;
        }
    }
    _onGrainCarAuthNotify() {
        G_UserData.getGrainCar().c2sGetGrainCarInfo();
    }
    _onBtnDonateOnClick() {
        G_UserData.getGrainCar().c2sUpgradeGrainCar();
    }
    _onBtnLaunchOnClick() {
        G_UserData.getGrainCar().c2sStartGrainCarMove();
    }
    _onBtnGo2CarOnClick() {
        var runtimeCar = this._curCarData;
        if (!runtimeCar) {
            return;
        }
        var pit1 = runtimeCar.getCurCarPos();
        var sceneName = G_SceneManager.getRunningSceneName();
        if (sceneName == 'mineCraft') {
            G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_GO2MINE, pit1);
        } else {
            G_SceneManager.showScene('mineCraft', pit1);
        }
        this.close();
    }
    _onGetGrainCarInfo() {
        this._updateData();
        this._nodeProgress.removeAllChildren();
        this._routeProgress = cc.instantiate(this._grainCarRouteProgress).getComponent(GrainCarRouteProgress)
        this._routeProgress.ctor(this._curCarData);
        this._nodeProgress.addChild(this._routeProgress.node);
        this._routeProgress.updateUIStatic();
        this._routeProgress.showTerminal(false);
        this._updateTitle();
    }
    _onUpgradeGrainCar() {
        this._updateData();
        this._playPrompt();
    }
    _onGrainCarAuthChanged(id, allView) {
        this._checkBoxAdmin.isChecked = (allView == 0);
        this._checkBoxAll.isChecked = (allView == 1);
    }
    _onUpdateGrainCar() {
        this._updateData();
        if (GrainCarConfigHelper.isInActivityTime()) {
            this._updateInActivityTime();
            if (this._carRun) {
                this._carRun.updateUI(this._curCarData);
            }
        } else {
            this._updateUI(true);
        }
    }
    _onLaunchGrainCar() {
        var startMineId = this._curCarData.getStartMine();
        var sceneName = G_SceneManager.getRunningSceneName();
        if (sceneName == 'mineCraft') {
            G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_GO2MINE, startMineId);
        } else {
            G_SceneManager.showScene('mineCraft', startMineId);
        }
        this.close();
    }
    private handleLaunch():void{
        G_UserData.getGrainCar().c2sAutoLaunch();
    }
    _onEventRedPointUpdate(event, funcId, param) {
        var canDonate = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, 'canDonate');
        var canLaunch = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, 'canLaunch');
        this._btnDonate.showRedPoint(canDonate);
        this._btnLaunch.showRedPoint(canLaunch);
    }
}