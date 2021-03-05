const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import ViewBase from '../../ViewBase';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_ResolutionManager, G_EffectGfxMgr, G_ConfigLoader, G_UserData, G_SignalManager, G_SceneManager, G_Prompt, G_NetworkManager } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import DailyCity from './DailyCity';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { DropHelper } from '../../../utils/DropHelper';
import { Lang } from '../../../lang/Lang';
import DailyChallenge from './DailyChallenge';
import PopupBoxReward from '../../../ui/popup/PopupBoxReward';
import { MessageIDConst } from '../../../const/MessageIDConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { FunctionConst } from '../../../const/FunctionConst';

@ccclass
export default class DailyChallengeView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPos8: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPos3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPos1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPos2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPos4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPos5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPos6: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelPos7: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topBar: CommonTopbarBase = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _resetBtn: CommonButtonLevel0Highlight = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnSweep: CommonButtonLevel0Highlight = null;
    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnChallenge: CommonButtonLevel0Highlight = null;

    @property(cc.Prefab)
    dailyCity: cc.Prefab = null;

    @property(cc.Label)
    sweep_tip: cc.Label = null;
    @property(cc.Label)
    challenge_tip: cc.Label = null;

    _panelPos: cc.Node[];
    _cities: DailyCity[];
    _signalTopBarPause: any;
    _signalTopBarStart: any;
    _signalCommonZeroNotice: any;
    _nextLayer: number = 0;
    _signalChallenge: any;
    _surprises: any[];
    _nowLayer: number;
    _boxLayer: any;
    _boxState: any;

    private static BOX_STATE_CLOSE = 0
    private static BOX_STATE_OPEN = 1
    private static BOX_STATE_EMPTY = 2
    private _signalRedPointUpdate: import("/Users/mac/youka/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;


    ctor() {
        this._cities = [];
        this._panelPos = [];
        this._signalTopBarPause = null;
        this._signalTopBarStart = null;
        this.node.name = ('DailyChallengeView');
        this.updateSceneId(101);
    }
    onCreate() {
        this.ctor();
        this.setSceneSize();
        this._topBar.setImageTitle('txt_sys_com_rchangfuben');
        this._topBar.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._panelPos = [
            this._panelPos1,
            this._panelPos2,
            this._panelPos3,
            this._panelPos4,
            this._panelPos5,
            this._panelPos6,
            this._panelPos7,
            this._panelPos8
        ];
        for (var idx = 1; idx <= this._panelPos.length; idx++) {
            var val = this._panelPos[idx - 1];
            var city = this.createCityByType(idx);
            val.addChild(city.node);
            this._cities.push(city);
        }

        const level = G_UserData.getBase().getLevel();
        if (level >= 25) {
            this.challenge_tip.node.active = false;
        }
        if (level >= 30) {
            this.sweep_tip.node.active = false;
        }
    }
    _createFarGround() {
        var farGround = this.getEffectLayer(ViewBase.Z_ORDER_FAR_GROUND);
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        var picName = this._sceneData.farground;
        if (picName != '') {
            var pic = UIHelper.newSprite(picName);
            pic.node.setAnchorPoint(cc.v2(0.5, 1));
            farGround.addChild(pic.node);
            pic.node.setPosition(cc.v2(0, height / 2));
        }
        var effectFunction = function (effect) {
            if (effect == 'richang_shenshou') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build8')).node;
            }
        }.bind(this);
        var effectName = this._sceneData.back_eft;
        if (effectName != '') {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(farGround, Path.getFightSceneEffect(effectName), effectFunction, null, false);
            effect.node.setPosition(cc.v2(0, 0));
        }
    }
    _createBackGround() {
        var grdBack = this.getEffectLayer(ViewBase.Z_ORDER_GRD_BACK);
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        var picName = this._sceneData.background;
        if (picName != '') {
            var pic = UIHelper.newSprite(picName);
            pic.node.setAnchorPoint(cc.v2(0.5, 0.5));
            grdBack.addChild(pic.node);
        }
        var effectFunction = function (effect) {
            if (effect == 'richang_jinglianshi') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build4')).node;
            } else if (effect == 'richang_shenbing') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build7')).node;
            } else if (effect == 'richang_baowujinglianshi') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build6')).node;
            } else if (effect == 'richang_gonggao') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('men')).node;
            } else if (effect == 'richang_baowujingyan') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build5')).node;
            } else if (effect == 'richang_wujiangjinyan') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build1')).node;
            } else if (effect == 'richang_yinbi') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build2')).node;
            } else if (effect == 'richang_tupodan') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build3')).node;
            } else if (effect == 'richang_shenshou') {
                return UIHelper.newSprite(Path.getDailyChallengeIcon('build6')).node;
            }
        }.bind(this);
        var effectName = this._sceneData.middle_eft;
        if (effectName != '') {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(grdBack, Path.getFightSceneEffect(effectName), effectFunction, null, false);
            effect.node.setPosition(cc.v2(0, 0));
        }
    }
    enableTopBar(enable) {
        if (enable) {
            this._topBar.resumeUpdate();
        } else {
            this._topBar.pauseUpdate();
        }
    }
    createCityByType(type) {
        var dailyInfo = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_DUNGEON_TYPE).get(type);
        var city = cc.instantiate(this.dailyCity).getComponent(DailyCity);
        city.ctor(dailyInfo);
        return city;
    }
    onEnter() {
        this.enableTopBar(true);
        if (G_UserData.getDailyDungeonData().isExpired() == true) {
            G_UserData.getDailyDungeonData().pullData();
        }
        this._signalTopBarPause = G_SignalManager.add(SignalConst.EVENT_TOPBAR_PAUSE, handler(this, this._onEventTopBarPause));
        this._signalTopBarStart = G_SignalManager.add(SignalConst.EVENT_TOPBAR_START, handler(this, this._onEventTopBarStart));
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(this, this._onEventCommonZeroNotice));
        //this._signalSweep = G_SignalManager.add(SignalConst.EVENT_DAILY_DUNGEON_SWEEP, handler(this, this._onEventSweep));
        this._signalChallenge = G_SignalManager.add(SignalConst.EVENT_DAILY_DUNGEON_CHALLENGE, handler(this, this._onEventChallenge));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        }, 0);
        this._onEventTopBarStart();
        this.refreshRedPoint();
    }
    onExit() {
        this._signalTopBarPause.remove();
        this._signalTopBarPause = null;
        this._signalTopBarStart.remove();
        this._signalTopBarStart = null;
        this._signalCommonZeroNotice.remove();
        this._signalCommonZeroNotice = null;
        this._signalChallenge.remove();
        this._signalChallenge = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
    }
    private refreshRedPoint() {
        var redValue01 = false//RedPointHelper.isModuleReach(FunctionConst.FUNC_DAILY_STAGE_SWEEP);
        this._btnSweep.showRedPoint(redValue01);
        var redValue02 = RedPointHelper.isModuleReach(FunctionConst.FUNC_DAILY_STAGE_SWEEP);//RedPointHelper.isModuleReach(FunctionConst.FUNC_DAILY_STAGE_CHALLENGE);
        this._btnChallenge.showRedPoint(redValue02);
    }
    private _onEventRedPointUpdate(event, funcId, param) {
        this.refreshRedPoint();
    }
    _onEventTopBarPause() {
        this._topBar.pauseUpdate();
    }
    _onEventTopBarStart() {
        this._topBar.resumeUpdate();
    }
    _onEventCommonZeroNotice(event, hour) {
        G_UserData.getDailyDungeonData().pullData();
    }

    // private _onEventSweep(eventName, results) {
    //     G_SceneManager.openPopup(Path.getPrefab("DailySweep", "dailyChallenge"), (dailySweep: DailySweep) => {
    //         dailySweep.init(this._nextLayer, results, handler(this, this._sweepExit));
    //         dailySweep.openWithAction();
    //     })
    // }

    private _onEventChallenge(eventName, results) {
        G_UserData.getDailyDungeonData().pullData();
        G_SceneManager.openPopup(Path.getPrefab("DailyChallenge", "dailyChallenge"), (dailyChallenge: DailyChallenge) => {
            dailyChallenge.init(this._nextLayer, results, handler(this, this._challengeExit));
            dailyChallenge.openWithAction();
        })
    }



    private _challengeExit() {
        for (var idx = 0; idx < this._cities.length; idx++) {
            this._cities[idx]._refreshRedPoint();
        }
        this.refreshRedPoint();
    }
    _checkNewSurprise() {

    }
    _refreshBoxState() {

    }
    _refreshCount() {

    }
    _refreshStage() {

    }

    public onSweepClick() {
        const level = G_UserData.getBase().getLevel();
        if (level < 30) {
            G_Prompt.showTipOnTop('30级开启一键扫荡功能');
            return;
        }
        G_UserData.getDailyDungeonData().sendSweep();

    }

    public onChallengeClick() {
        const level = G_UserData.getBase().getLevel();
        if (level < 25) {
            G_Prompt.showTipOnTop('25级开启自动挑战功能');
            return;
        }
        G_UserData.getDailyDungeonData().sendChallenge();

    }

    public onBoxClick() {
        var [rewards, title, detail] = this._getBoxReward();
        G_SceneManager.openPopup(Path.getPrefab("PopupBoxReward", "common"), (popupBoxReward: PopupBoxReward) => {
            popupBoxReward.init(title, handler(this, this._getBox), true);
            popupBoxReward.updateUI(rewards);
            popupBoxReward.openWithAction();
            if (this._boxState == DailyChallengeView.BOX_STATE_CLOSE || this._boxState == DailyChallengeView.BOX_STATE_OPEN) {
                popupBoxReward.setBtnText(Lang.get('get_box_reward'));
            } else if (this._boxState == DailyChallengeView.BOX_STATE_EMPTY) {
                popupBoxReward.setBtnText(Lang.get('got_star_box'));
                popupBoxReward.setBtnEnable(false);
            }
            popupBoxReward.setDetailText(detail);
        });
    }

    private _getBox() {
        return;
        if (this._nowLayer < this._boxLayer) {
            G_Prompt.showTip(Lang.get('challenge_tower_box_cannot_get', { count: this._boxLayer }));
            return;
        }
        //G_UserData.getDailyDungeonData().openBox(this._boxLayer);
    }

    private _getBoxReward(): any[] {
        var layerId = this._boxLayer;
        var boxId = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE).get(layerId).box_id;
        var rewards: any[] = DropHelper.getDropReward(boxId);
        var title = Lang.get('challenge_tower_box_title');
        var detail = Lang.get('challenge_tower_box_detail', { count: layerId });
        return [
            rewards,
            title,
            detail
        ];
    }

}
