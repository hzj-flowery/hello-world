import { CountryBossConst } from "../../../const/CountryBossConst";
import { SignalConst } from "../../../const/SignalConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { ReportParser } from "../../../fight/report/ReportParser";
import { Colors, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCountdown from "../../../ui/component/CommonCountdown";
import CommonMiniChat from "../../../ui/component/CommonMiniChat";
import CommonStoryAvatar from "../../../ui/component/CommonStoryAvatar";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import AwardNode from "../countryboss/AwardNode";
import BloodNode from "../countryboss/BloodNode";
import { CountryBossHelper } from "../countryboss/CountryBossHelper";
import FightBtn from "../countryboss/FightBtn";
import RankNode from "../countryboss/RankNode";
import StageWidget from "../countryboss/StageWidget";












const { ccclass, property } = cc._decorator;



@ccclass
export default class CountryBossSmallBossView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _bgLayout: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonStoryAvatar,
        visible: true
    })
    _heroAvatar: CommonStoryAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBlood: cc.Node = null;

    @property({
        type: CommonCountdown,
        visible: true
    })
    _commonCountDown: CommonCountdown = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _rankParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeReward: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnFight: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _fightTextImage: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _InterceptCountdownBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _fightCountdown: cc.Label = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _meetingPopParent: cc.Node = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;

    @property({ type: cc.Prefab, visible: true })
    bloodNode: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    rankNode: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    awardNode: cc.Prefab = null;

    _bossId: any;
    _cd: any;
    _battleBackgroundId: any;
    _recordBossDieState: any;
    _signalFightBoss: any;
    _signalSyncBoss: any;
    _signalRecvFlushData: any;
    _signalEnter: any;
    _signalForeground: any;
    _bloodWidget: any;
    _rankWidget: any;
    _awardWidget: any;
    _fightWidget: any;
    _stageWidget: any;



    ctor(bossId) {
        this._bossId = bossId;
        var cfg = CountryBossHelper.getBossConfigById(this._bossId);
        this._cd = CountryBossHelper.getStage1AttackCd();
        this._battleBackgroundId = cfg.battle_scene;
        UIHelper.addEventListener(this.node, this._btnFight, 'CountryBossSmallBossView', '_onBtnFight');
        this.setSceneSize();
        this.updateSceneId(this._battleBackgroundId);

    }
    onCreate() {
        var params = G_SceneManager.getViewArgs('countrybosssmallboss');
        this.ctor(params[0]);
        this._makeBackGroundBottom();
        this._initWidget();
        var cfg = CountryBossHelper.getBossConfigById(this._bossId);
        this._heroAvatar.updateUI(cfg.hero_id);
        this._heroAvatar.node.setScale(0.8);
        this._recordBossDieState = this._isCurBossDie();
        this._commonChat.setDanmuVisible(false);
    }

    start() {
        this._topbarBase.setImageTitle('txt_sys_com_sanguozhanji');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true);
        this._topbarBase.hideBG();
    }

    onEnter() {
        this._signalFightBoss = G_SignalManager.add(SignalConst.EVENT_ATTACK_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventBattle));
        this._signalSyncBoss = G_SignalManager.add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventSyncBoss));
        this._signalRecvFlushData = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(this, this._onEventRecvFlushData));
        this._signalEnter = G_SignalManager.add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventEnter));
        this._signalForeground = G_SignalManager.add(SignalConst.EVENT_MAY_ENTER_FOREGROUND, handler(this, this._onEventForeground));
        this._refreshView();
    }
    onExit() {
        this._signalFightBoss.remove();
        this._signalFightBoss = null;
        this._signalSyncBoss.remove();
        this._signalSyncBoss = null;
        this._signalRecvFlushData.remove();
        this._signalRecvFlushData = null;
        this._signalEnter.remove();
        this._signalEnter = null;
        this._signalForeground.remove();
        this._signalForeground = null;
    }
    _initWidget() {
        this._bloodWidget = cc.instantiate(this.bloodNode).getComponent(BloodNode);
        this._bloodWidget.ctor(this._bossId);
        this._nodeBlood.addChild(this._bloodWidget.node);

        this._rankWidget = cc.instantiate(this.rankNode).getComponent(RankNode);
        this._rankWidget.ctor(this._bossId);
        this._rankParentNode.addChild(this._rankWidget.node);

        this._awardWidget = cc.instantiate(this.awardNode).getComponent(AwardNode);
        this._awardWidget.ctor(this._bossId);
        this._nodeReward.addChild(this._awardWidget.node);

        this._fightWidget = FightBtn.newIns(this._fightTextImage, this._fightCountdown, function () {
            return this._cd + G_UserData.getCountryBoss().getChallenge_boss_time1();
        }.bind(this), this._InterceptCountdownBg);

        this._stageWidget = StageWidget.newIns(this.node, handler(this, this._onStageChangeCallback));
        this._commonCountDown.setCountdownLableParam({
            color: Colors.DARK_BG_THREE,
            outlineColor: Colors.BRIGHT_BG_OUT_LINE_TWO
        });
        this._commonCountDown.setEndLabelParam({
            color: Colors.DARK_BG_THREE,
            outlineColor: Colors.BRIGHT_BG_OUT_LINE_TWO
        });
        this._commonCountDown.setCountdownTimeParam({
            color: Colors.BRIGHT_BG_RED,
            outlineColor: Colors.BRIGHT_BG_OUT_LINE_TWO
        });
    }
    _isCurBossDie() {
        var bossData = G_UserData.getCountryBoss().getBossDataById(this._bossId);
        if (!bossData) {
            return;
        }
        return bossData.isBossDie();
    }
    _onBtnFight() {
        var bossData = G_UserData.getCountryBoss().getBossDataById(this._bossId);
        if (!bossData) {
            return;
        }
        if (bossData.isBossDie()) {
            G_Prompt.showTip(CountryBossHelper.getKillTip(this._bossId));
            return;
        }
        if (CountryBossHelper.getStage() != CountryBossConst.STAGE1) {
            G_Prompt.showTip(Lang.get('country_boss_fight_time_end'));
            return;
        }
        if (!this._fightWidget.canFight()) {
            G_Prompt.showTip(Lang.get('country_boss_fight_cd'));
            return;
        }
        G_UserData.getCountryBoss().c2sAttackCountryBoss(this._bossId);
    }
    _onEventBattle(event, message) {
        if (message == null) {
            return;
        }
        var battleReport = message['report'];
        if (battleReport == null) {
            return;
        }
        var reportData = ReportParser.parse(battleReport);
        var battleData = BattleDataHelper.parseCountryBoss(message, this._battleBackgroundId);
        G_SceneManager.showScene('fight', reportData, battleData);
    }
    _upadteStage() {
        var curStage = this._stageWidget.updateStage();
        this._btnFight.node.active = (false);
        if (curStage == CountryBossConst.STAGE1) {
            var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE1);
            this._commonCountDown.startCountDown(Lang.get('country_boss_countdown_label1'), endTime);
            this._btnFight.node.active = (true);
        } else if (curStage == CountryBossConst.STAGE2) {
            var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE2);
            this._commonCountDown.startCountDown(Lang.get('country_boss_countdown_label2'), endTime);
        } else if (curStage == CountryBossConst.STAGE3) {
            var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3);
            this._commonCountDown.startCountDown(Lang.get('country_boss_countdown_label3'), endTime);
        } else {
            this._commonCountDown.setEndLabelString(Lang.get('country_boss_countdown_label4'));
        }
    }
    _onStageChangeCallback(curStage) {
        if (curStage != CountryBossConst.STAGE1) {
            G_SceneManager.popScene();
            return;
        }
        this._refreshView();
    }
    _onEventSyncBoss() {
        this._refreshView();
    }
    _onEventEnter() {
        this._refreshView();
    }
    _refreshView() {
        this._fightWidget.update();
        this._bloodWidget.updateUI();
        this._rankWidget.updateUI();
        this._gotoOtherCity();
        this._upadteStage();
    }
    _gotoOtherCity() {
        function onBtnGo() {
            G_SceneManager.popScene();
        }
        var oldIsBossDie = this._recordBossDieState;
        this._recordBossDieState = this._isCurBossDie();
        if (oldIsBossDie == false && this._recordBossDieState == true) {
            var cfg = CountryBossHelper.getBossConfigById(this._bossId);
            UIPopupHelper.popupSystemAlert(Lang.get('country_boss_goto_fight_big_boss_title'), null, onBtnGo, null, (p: PopupSystemAlert) => {
                var content = Lang.get('country_boss_goto_fight_other_samll_boss', { name: cfg.name });
                p.setContentWithRichTextType3(content, Colors.BRIGHT_BG_TWO, 22, 10);
                p.setCheckBoxVisible(false);
                p.showGoButton(Lang.get('country_boss_goto_fight_btn_name'));
                p.setCloseVisible(true);
                p.openWithAction();
            })
        }
    }
    _onEventRecvFlushData() {
        G_UserData.getCountryBoss().c2sEnterCountryBoss();
    }
    _onEventForeground() {
        G_UserData.getCountryBoss().c2sEnterCountryBoss();
    }
}