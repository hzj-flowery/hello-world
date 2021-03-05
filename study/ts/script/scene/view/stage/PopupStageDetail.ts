const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import CommonButtonNormal from '../../../ui/component/CommonButtonNormal';
import CommonButtonHighLight from '../../../ui/component/CommonButtonHighLight';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_SceneManager, Colors, G_ConfigLoader, G_Prompt } from '../../../init';
import { StageBaseData } from '../../../data/StageBaseData';
import { Lang } from '../../../lang/Lang';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { DataConst } from '../../../const/DataConst';
import UIHelper from '../../../utils/UIHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DropHelper } from '../../../utils/DropHelper';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { FunctionConst } from '../../../const/FunctionConst';
import VipFunctionIDConst from '../../../const/VipFunctionIDConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import PopupSweep from './PopupSweep';
import { Path } from '../../../utils/Path';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import PopupEmbattle from '../team/PopupEmbattle';
import PopupSiegeCome from './PopupSiegeCome';
import { ReturnConst } from '../../../const/ReturnConst';

@ccclass
export default class PopupStageDetail extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelBase: cc.Node = null;

    @property({ type: CommonButtonNormal, visible: true })
    _btnSweep: CommonButtonNormal = null;

    @property({ type: CommonButtonNormal, visible: true })
    _btnReset: CommonButtonNormal = null;

    @property({ type: CommonButtonHighLight, visible: true })
    _btnFight: CommonButtonHighLight = null;

    @property({ type: CommonListViewLineItem, visible: true })
    _listDrop: CommonListViewLineItem = null;

    @property({ type: cc.Label, visible: true })
    _textCountNum: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textFirstKillName: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnFormation: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _btnClose: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;

    @property({ type: CommonResourceInfo, visible: true })
    _costStamina: CommonResourceInfo = null;

    @property({ type: CommonResourceInfo, visible: true })
    _drop1: CommonResourceInfo = null;

    @property({ type: CommonResourceInfo, visible: true })
    _drop2: CommonResourceInfo = null;

    @property({ type: cc.Node, visible: true })
    _star3BG: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _star3: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _star2BG: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _star2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _star1BG: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _star1: cc.Node = null;

    @property({ type: CommonHeroAvatar, visible: true })
    _ImageHero: CommonHeroAvatar = null;

    @property({ type: cc.Prefab, visible: true })
    _popupSweepPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    _popupEmbattlePrefab: cc.Prefab = null;

    private _stageData: StageBaseData;
    private _stageInfo;
    private _signalExecuteStage;
    private _signalFastExecute;
    private _signalSweepFinish;
    private _signalReset;
    private _signalUseItem;
    private _sweepCount: number;
    private _resetPrice: number;
    private _popupSweep: PopupSweep;
    private _popupSweepSignal;
    private _awardsList: any[];

    public init(stageId) {
        this._stageData = G_UserData.getStage().getStageById(stageId);
        this._stageInfo = this._stageData.getConfigData();
        this._signalExecuteStage = null;
        this._signalFastExecute = null;
        this._signalSweepFinish = null;
        this._signalReset = null;
        this._signalUseItem = null;
        this._sweepCount = 0;
        this._resetPrice = 0;
        this._popupSweep = null;
        this._popupSweepSignal = null;
        this._awardsList = null;
        this._ImageHero.init();
    }

    public onCreate() {
        this._createHeroSpine();
        this._updateDropList();
        this._btnReset.setVisible(false);
        this._btnFight.setString(Lang.get('stage_fight'));
        this._btnReset.setString(Lang.get('stage_reset_word'));
    }

    public onEnter() {
        this._refreshStageDetail();
        this._signalExecuteStage = G_SignalManager.add(SignalConst.EVENT_EXECUTE_STAGE, handler(this, this._onEventExecuteStage));
        this._signalFastExecute = G_SignalManager.add(SignalConst.EVENT_FAST_EXECUTE_STAGE, handler(this, this._onEventFastExecuteStage));
        this._signalSweepFinish = G_SignalManager.add(SignalConst.EVENT_SWEEP_FINISH, handler(this, this._onEventSweepFinish));
        this._signalReset = G_SignalManager.add(SignalConst.EVENT_RESET_STAGE, handler(this, this._onEventReset));
        this._signalUseItem = G_SignalManager.add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(this, this._onEventUseItem));
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
    }

    public checkRebelArmy() {
        var rebel = G_UserData.getStage().getNewRebel();
        if (rebel) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSiegeCome","stage"),(popupSiegeCome:PopupSiegeCome)=>{
                popupSiegeCome.init(rebel);
                popupSiegeCome.open();
            });
            G_UserData.getStage().resetRebel();
        }
    }

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupStageDetail");
    }

    public onExit() {
        this._signalExecuteStage.remove();
        this._signalExecuteStage = null;
        this._signalFastExecute.remove();
        this._signalFastExecute = null;
        this._signalSweepFinish.remove();
        this._signalSweepFinish = null;
        this._signalReset.remove();
        this._signalReset = null;
        this._signalUseItem.remove();
        this._signalUseItem = null;
    }

    private _clearSignal() {
        if (this._popupSweepSignal) {
            this._popupSweepSignal.remove();
            this._popupSweepSignal = null;
        }
    }

    private _refreshStageDetail() {
        this._setStageName();
        this._refreshButtonState();
        this._refreshStar();
        this._refreshFirstKiller();
        this._refreshExpMoney();
    }

    private _refreshButtonState() {
        var executeCnt = this._stageData.getExecute_count();
        this._sweepCount = this._stageInfo.challenge_num - executeCnt;
        this._textCountNum.string = ('' + (this._sweepCount + ('/' + this._stageInfo.challenge_num)));
        var sweepVit = this._sweepCount * this._stageInfo.cost;
        var myVit = G_UserData.getBase().getResValue(DataConst.RES_VIT);
        var sweepVitEnough = true;
        while (myVit < sweepVit) {
            this._sweepCount = this._sweepCount - 1;
            sweepVit = this._sweepCount * this._stageInfo.cost;
            if (this._sweepCount <= 0) {
                sweepVitEnough = false;
            }
        }
        this._btnSweep.setVisible(true);
        this._btnReset.setVisible(false);
        if (this._sweepCount > 10) {
            this._sweepCount = 10;
        } else if (this._sweepCount <= 0 && !sweepVitEnough) {
            this._sweepCount = this._stageInfo.challenge_num - executeCnt;
            if (this._sweepCount > 10) {
                this._sweepCount = 10;
            }
        } else if (this._sweepCount <= 0) {
            this._sweepCount = 0;
            this._btnSweep.setVisible(false);
            this._btnReset.setVisible(true);
        }
        this._btnSweep.setString(Lang.get('stage_fight_ten', { count: this._sweepCount }));
        if (this._stageData.getStar() == 0) {
            this._btnSweep.setVisible(false);
            this._btnReset.setVisible(false);
        }
    }

    private _setStageName() {
        this._textName.string = (this._stageInfo.name);
        this._textName.node.color = (Colors.getColorLight(this._stageInfo.color));
        UIHelper.enableOutline(this._textName, Colors.getColorOutline(this._stageInfo.color), 2);
    }

    private _refreshStar() {
        var starCount = this._stageData.getStar();
        for (let i = 1; i <= 3; i++) {
            (this['_star' + (i + 'BG')] as cc.Node).active = !(i <= starCount);
            (this['_star' + i] as cc.Node).active = (i <= starCount);
        }
    }

    private _refreshFirstKiller() {
        var firstKiller = this._stageData.getKiller();
        if (firstKiller == '') {
            this._textFirstKillName.string = (Lang.get('stage_text_nokiller'));
        } else {
            this._textFirstKillName.string = (firstKiller);
        }
    }

    private _refreshExpMoney() {
        var myLevel = G_UserData.getBase().getLevel();
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var exp = Parameter.get(ParameterIDConst.MISSION_DROP_EXP).content;
        var money = Parameter.get(ParameterIDConst.MISSION_DROP_MONEY).content;
        this._drop1.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_EXP, myLevel * exp * this._stageInfo.cost);
        this._drop2.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, myLevel * money * this._stageInfo.cost);
        this._costStamina.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, this._stageInfo.cost);
        this._costStamina.setTextColorToATypeGreen();
    }

    private _updateDropList() {
        var awards = DropHelper.getStageDrop(this._stageInfo);
        this._listDrop.setListViewSize(450, 100);
        for (let i = 0; i < awards.length; i++) {
            var v = awards[i];
            v.size = 1;
        }
        var chapterConfigInfo = G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAPTER).get(this._stageInfo.chapter_id);
        var privilegeType = chapterConfigInfo.type == 2 ? ReturnConst.PRIVILEGE_ELITE_CHAPTER : ReturnConst.PRIVILEGE_DAILY_STAGE;
        var doubleTimes = G_UserData.getReturnData().getPrivilegeRestTimes(privilegeType);
        this._listDrop.setItemsMargin(20);
        this._listDrop.updateUI(awards, 1, false, true, doubleTimes > 0);
        this._awardsList = awards;
    }

    private _createHeroSpine() {
        this._ImageHero.updateUI(this._stageInfo.res_id);
        this._ImageHero.setBubble(this._stageInfo.talk, null, 2, true);
    }

    public onCloseClick() {
        this.closeWithAction();
    }

    public onFightClick() {
        var bagFull = UserCheck.checkPackFullByAwards(this._awardsList);
        if (bagFull) {
            return;
        }
        var needVit = this._stageInfo.cost;
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit);
        if (!success) {
            return;
        }
        if (this._sweepCount <= 0) {
            this.onResetClick();
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_PAUSE);
        G_SignalManager.dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE);
        G_UserData.getStage().c2sExecuteStage(this._stageInfo.id);
    }

    public onSweepClick() {
        let args: any[] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SWEEP);
        var isOpen = args[0];
        let desc = args[1];
        if (!isOpen) {
            G_Prompt.showTip(desc);
            return;
        }
        var bagFull = UserCheck.checkPackFullByAwards(this._awardsList);
        if (bagFull) {
            return;
        }
        var star = this._stageData.getStar();
        if (star != 3) {
            G_Prompt.showTip(Lang.get('sweep_enable'));
            return;
        }
        var needVit = this._stageInfo.cost * this._sweepCount;
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit);
        if (success) {
            G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_PAUSE);
            G_UserData.getStage().c2sFastExecuteStage(this._stageInfo.id, this._sweepCount);
        }
        return true;
    }

    public onResetClick() {
        var resetCount = this._stageData.getReset_count();
        var timesOut = LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE, resetCount, Lang.get('stage_no_reset_count'));
        if (!timesOut) {
            var vipInfo = G_UserData.getVip().getVipFunctionDataByType(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE);
            var resetLimit = vipInfo.value;
            resetLimit = resetLimit - resetCount;
            this._resetPrice = UserDataHelper.getPriceAdd(100, resetCount + 1);
            UIPopupHelper.popupSystemAlert(Lang.get('stage_tips'),
                Lang.get('stage_reset_warning', { count: this._resetPrice, leftcount: resetLimit }),
                handler(this, this._sendResetMsg), null, function (popupSystemAlert: PopupSystemAlert) {
                    popupSystemAlert.setCheckBoxVisible(false);
                });
        }
        return true;
    }

    private _sendResetMsg() {
        let args: any[] = UserCheck.enoughCash(this._resetPrice);
        var success = args[0];
        let errorFunc = args[1];
        if (success == false) {
            errorFunc();
            return;
        }
        G_UserData.getStage().c2sResetStage(this._stageInfo.id);
    }

    public onFormationClick() {
        var popupEmbattle = cc.instantiate(this._popupEmbattlePrefab).getComponent(PopupEmbattle);
        popupEmbattle.openWithAction();
    }

    public getMaxSweepCount() {
        return this._sweepCount;
    }

    private _onEventFastExecuteStage(eventName, results) {
        this._refreshStageDetail();
        this._refreshPopupSweep();
        this._popupSweep.updateReward(results, this._awardsList);
        this._popupSweep.setStart();
    }

    private _refreshPopupSweep(isReset?) {
        var callback = null;
        var btnString = '';
        if (this._sweepCount == 0) {
            callback = handler(this, this.onResetClick);
            btnString = Lang.get('stage_reset_word');
        } else {
            callback = handler(this, this.onSweepClick);
            btnString = Lang.get('stage_fight_ten', { count: this._sweepCount });
        }
        if (!isReset && !this._popupSweep) {
            this._popupSweep = cc.instantiate(this._popupSweepPrefab).getComponent(PopupSweep);
            this._popupSweep.init(callback);
            this._popupSweepSignal = this._popupSweep.signal.add(handler(this, this._onSweepClose));
            this._popupSweep.openWithAction();
        } else if (this._popupSweep) {
            this._popupSweep.setCallback(callback);
        }
        if (this._popupSweep) {
            this._popupSweep.setBtnResetString(btnString);
        }
    }

    private _onEventSweepFinish(eventName) {
        this.checkRebelArmy();
    }

    private _onSweepClose(event) {
        if (event == 'close') {
            this._popupSweep = null;
            this._clearSignal();
        }
    }

    private _onEventReset() {
        this._refreshStageDetail();
        this._refreshPopupSweep(true);
    }

    private _onEventExecuteStage(eventName, message, isFirstPass) {
        if (isFirstPass) {
            this.close();
        }
    }

    private _onFirstKillClick() {
        var userId = this._stageData.getKillerId();
        if (userId != G_UserData.getBase().getId()) {
            G_UserData.getBase().c2sGetUserBaseInfo(userId);
        }
    }

    private _onEventUseItem() {
        this._refreshButtonState();
        if (this._popupSweep) {
            this._refreshPopupSweep();
        }
    }
}