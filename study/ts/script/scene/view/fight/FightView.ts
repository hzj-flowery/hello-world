import { AudioConst } from "../../../const/AudioConst";
import { SignalConst } from "../../../const/SignalConst";
import { StoryChatConst } from "../../../const/StoryChatConst";
import BuffManager from "../../../fight/BuffManager";
import { FightConfig } from "../../../fight/FightConfig";
import FightEngine from "../../../fight/FightEngine";
import { FightSignalManager } from "../../../fight/FightSignalManager";
import { FightSignalConst } from "../../../fight/FightSignConst";
import { ReportData } from "../../../fight/report/ReportData";
import { StatisticsTotal } from "../../../fight/report/StatisticsTotal";
import FightScene from "../../../fight/scene/FightScene";
import { G_AudioManager, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager } from "../../../init";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { ResourceData } from "../../../utils/resource/ResourceLoader";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import HeroShow from "../heroShow/HeroShow";
import Settlement from "../settlement/Settlement";
import PopupStoryChat from "../storyChat/PopupStoryChat";
import FightEnd from "./FightEnd";
import FightHelper from "./FightHelper";
import FightStart from "./FightStart";
import FightUI from "./FightUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FightView extends ViewBase {

   @property({ type: FightScene, visible: true })
   _fightScene: FightScene = null;

   @property({ type: FightEngine, visible: true })
   _fightEngine: FightEngine = null;

   @property({ type: FightUI, visible: true })
   _fightUI: FightUI = null;

   protected _report: ReportData;
   protected _battleData;
   protected _fightHelper: FightHelper;
   private _statisticsData: StatisticsTotal;

   protected _fightSignalManager: FightSignalManager;

   protected _fightStart: FightStart;
   private _fightEnd: FightEnd;

   private _dropCount: number;
   protected _totalHurt: number;
   protected _double: number;

   private _isJumpEnd: boolean;
   private _hasSlowAction: boolean;
   private _hasNotice: boolean;

   private _signalExitFight;
   private _signalReplay;
   protected _listenerSignal;

   protected preloadResList: ResourceData[] = [
      { type: cc.Prefab, path: Path.getPrefab("PopupStoryChat", "storyChat") }
   ];
   private _isPopStageView: any;

   public preloadRes(callBack: Function, params?) {
      this._report = params[0];
      this._battleData = params[1];
      if (params.length >= 3 && params[2] != null) {
         this._battleData = BattleDataHelper.initBaseData(this._battleData);
      }
      this._isPopStageView = params[3];
      this._fightHelper = new FightHelper();
      this._fightHelper.processData(this._battleData, this._report);

      this._statisticsData = this._report.getStatisticsTotal();

      this._fightScene.init(this._battleData.background[0]);
      this._fightEngine.init(this._fightScene);

      super.preloadRes(() => {
         this._fightEngine.startWithPreload(this._report, this._battleData, callBack, this.getSceneName());
      }, params);
   }

   protected onCreate() {

      this.setSceneSize();

      this._fightStart = null;
      this._fightEnd = null;
      this._dropCount = 0;
      this._totalHurt = 0;
      this._double = 1;

      this._isJumpEnd = false;
      this._signalReplay = null;

      var size = G_ResolutionManager.getDesignCCSize();
      this.node.setContentSize(size);

      this._fightScene.node.setPosition(0, 0);
      this._fightScene.node.setContentSize(size);

      this._fightUI.updateCanJump();
      this._fightUI.node.setPosition(0, 0);
      this._fightUI.node.setContentSize(size);
      this._fightUI.node.active = false;
      this._fightUI.setJumpVisible(this._battleData.needShowJump);
      this._fightUI.setJumpCallback(this._jumpToEnd.bind(this));
      BuffManager.getBuffManager().engine = this._fightEngine;
      this._fightEngine.setStart();
      // this._fightEngine.init(this._fightScene);
      // this._fightEngine.startWithPreload(this._report, this._battleData);
      this._fightSignalManager = FightSignalManager.getFightSignalManager();

      this._hasNotice = false;


      let args: any[] = this._fightHelper.checkMonsterTalk(this._battleData.monsterTeamId, this._battleData.star);
      let isTalk: boolean = args[0];
      let isLoseTalk: boolean = args[1];
      let talkConfig: boolean = args[2];
      if (isTalk) {
         if (isLoseTalk) {
            this._fightEngine.addLoseTalk(talkConfig);
         }
         else {
            this._fightEngine.addMonsterTalk(talkConfig);
         }
      }
   }

   protected onEnter() {
      if (!this._battleData.ignoreBgm) {
         if (this._battleData.bgm && this._battleData.bgm > 0) {
            G_AudioManager.playMusicWithId(this._battleData.bgm);
         } else {
            G_AudioManager.playMusicWithId(AudioConst.MUSIC_FIGHT);
         }
      }
      G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);
      G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "FightView");

      this._signalReplay = G_SignalManager.add(SignalConst.EVENT_BATTLE_REPLAY, handler(this, this._replayBattle));
      this._listenerSignal = this._fightSignalManager.addListenerHandler(handler(this, this._onSignalEvent));

      this._initSpeed();
      this._signalExitFight = G_SignalManager.add(SignalConst.EVENT_EXIT_FIGHT, handler(this, this._onExitFight));
   }

   protected onExit() {

      this._fightEngine.stop();
      this._fightEngine.clear();

      this._report.clear();

      if (this._listenerSignal) {
         this._listenerSignal.remove();
         this._listenerSignal = null;
      }
      G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
      this._setSpeed(1);

      this._signalExitFight.remove();
      this._signalExitFight = null;
      this._signalReplay.remove();
      this._signalReplay = null;
   }

   protected onCleanup() {
   }

   _resetFightSignal() {
      if (this._fightSignalManager) {
          this._fightSignalManager.clear();
          this._fightSignalManager = null;
      }
      this._fightSignalManager = FightSignalManager.getFightSignalManager();
      if (this._listenerSignal) {
          this._listenerSignal.remove();
          this._listenerSignal = null;
      }
      this._listenerSignal = this._fightSignalManager.addListenerHandler(handler(this, this._onSignalEvent));
  }

   private _replayBattle() {
      this._fightEngine.stop();
      this._fightEngine.clear();

      this._isJumpEnd = false;
      this._fightStart.node.destroy();
      this._fightStart = null;

      this._fightScene.node.removeAllChildren();
      this._fightScene.init(this._battleData.background[0])

      this._fightUI.node.active = false;
      this._fightUI.hideTotalHurt();
      this._fightUI.setJumpVisible(true);

      this._fightEngine.init(this._fightScene);
      this._fightEngine.startWithPreload(this._report, this._battleData, () => {
         this._fightEngine.setStart();
      }, this.getSceneName());
      // this._fightEngine.startWithPreload(this._report, this._battleData);
      this._resetFightSignal();
      this._initSpeed();
   }

   protected _jumpToEnd() {
      this._fightEngine.jumpToEnd();
   }

   private _onExitFight() {
      G_SceneManager.fightScenePop();
      if (this._isPopStageView) {
         G_SceneManager.popScene();
     }
   }

   update(dt: number) {
   }

   private _initSpeed() {
      let args: any[] = this._fightHelper.getFightSpeed();
      let double = args[0]
      let showUI = args[1];
      this._changeSpeed(double);
      this._fightUI.setSpeedCallback(handler(this, this._changeSpeedClick));
      this._fightUI.setSpeedVisible(showUI);
   }

   private _changeSpeed(targetSpeed, isManual?) {
      this._double = targetSpeed;
      var speed = FightConfig['SPEED_DOUBLE_' + this._double];
      this._setSpeed(speed);
      this._fightUI.refreshSpeed(this._double);
      if (isManual) {
         this._fightHelper.writeSpeedFile(this._double, isManual);
      }
   }

   private _setSpeed(speed: number) {
      this._fightEngine.changeBattleSpeed(speed);
   }

   private _changeSpeedClick(speed?: number) {
      if (speed != null) {
         this._setSpeed(speed);
         return;
      }
      let args: any[] = this._fightHelper.checkNextSpeed(this._double);
      let ret = args[0];
      let nextSpeed = args[1];
      let errMsg = args[2];
      if (ret) {
         this._changeSpeed(nextSpeed, true);
      } else {
         if (this._hasNotice) {
            this._changeSpeed(nextSpeed, true);
            this._hasNotice = false;
         } else {
            G_Prompt.showTip(errMsg);
            this._hasNotice = true;
         }
      }
   }

   protected showSummary() {
      G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'FightView:showSummary');
      G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_START, "FightView");
      this._fightUI.closeChatUI();
      this._fightUI.node.active = false;
      var isWin = this._report.getIsWin();
      var totalHurt = this._report.getAttack_hurt();
      if (this._battleData.totalHurt != 0) {
         totalHurt = this._battleData.totalHurt;
      }

      var settlement = new Settlement();
      var panelSettlement = settlement.createSettleMent(this._battleData, isWin, null, totalHurt, this._statisticsData);
      //如果是flash，结算的话不会返回这个panel，以下代码是针对老结算的
      if (panelSettlement) {

      }
   }

   protected _startStoryChat(storyTouch, callback) {
      G_SceneManager.openPopup(Path.getPrefab("PopupStoryChat", "storyChat"), (storyChatView: PopupStoryChat) => {
         storyChatView.updateUI(storyTouch, callback);
         storyChatView.open();
      });
   }

   private _xingcaiIn() {
      function firstChat() {
         var xingcaiTalk = 91105;
         this._startStoryChat(xingcaiTalk, handler(this, this.showSummary));
      }
      this._fightEngine.createNewUnit(106, 216, 'win', firstChat.bind(this));
   }

   private _checkStoryChat(checkType, waveId, heroId, callback?) {
      waveId = this._fightEngine.getWaveId();
      if (!this._fightHelper.checkIsChatType(this._battleData.battleType)) {
         this._dispatchStoryChatEnd(checkType);
         return;
      }
      if (this._battleData.alreadyPass) {
         this._dispatchStoryChatEnd(checkType);
         return;
      }
      let args: any[] = this._fightHelper.checkStoryChat(this._fightEngine, checkType, waveId, this._battleData.stageId, this._report.getIsWin(), heroId);
      let isPause: boolean = args[0];
      var storyTouch = args[1];
      if (isPause) {
         this._fightEngine.pause();
      }
      if (storyTouch) {
         this._startStoryChat(storyTouch, function () {
            this._dispatchStoryChatEnd(checkType, waveId);
         }.bind(this));
         return;
      }
      this._dispatchStoryChatEnd(checkType, waveId);
   }

   private _dispatchStoryChatEnd(checkType, waveId?, touch?) {
      if (checkType == StoryChatConst.TYPE_BEFORE_FIGHT) {
         this._fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_STORY_OPEN_CHAT_END);
      } else {
         this._fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_UNIT_CHAT_END, checkType, waveId);
      }
   }

   protected _checkHeroShow(waveId) {
      if (!this._battleData.alreadyPass && this._battleData.showBossId != 0 && waveId == this._fightEngine.getWaveCount()) {
         let heroShow = new cc.Node("HeroShow").addComponent(HeroShow);
         // this.node.addChild(heroShow.node);
         heroShow.create(this._battleData.showBossId, function () {
            this._heroShowEnd(waveId);
         }.bind(this), true, false)

      } else {
         this._heroShowEnd(waveId);
      }
   }

   protected _heroShowEnd(waveId) {
      this._fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_SHOW_HERO_END, waveId);
   }

   private _nextWave() {
      this._fightEngine.setupWave();
      this._isJumpEnd = false;
   }

   private _showStartCG() {
      if (this._battleData.noStartCG) {
         this._fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_CHECK_LEAD);
      } else {
         this._fightStart = new cc.Node("_fightStart").addComponent(FightStart);
         this._fightStart.init(this._battleData, FightConfig['SPEED_DOUBLE_' + this._double]);
         this.node.addChild(this._fightStart.node);
      }
   }

   private showEndCG(callback) {
      this._fightEnd = new cc.Node("_fightEnd").addComponent(FightEnd);
      this._fightEnd.init(callback);
      this.node.addChild(this._fightEnd.node);
   }

   protected _onSignalEvent(s, ...args) {
      var funcName = null;
      for (const key in FightSignalConst) {
         var value = FightSignalConst[key];
         if (key.indexOf("SIGNAL_") > -1 && value == s) {
            funcName = '_' + key;
         }
      }
      // console.log("_onSignalEvent:", funcName);
      if (funcName) {
         var func: Function = this[funcName];
         if (func) {
            func.apply(this, args);
         }
      }
   }

   private _SIGNAL_START_WAVE(waveId) {
      this._hasSlowAction = false;
      this._checkHeroShow(waveId);
   }

   private _SIGNAL_SHOW_HERO_END(waveId) {
      this._checkStoryChat(StoryChatConst.TYPE_BEFORE_FIGHT, waveId, 0);
   }

   private _SIGNAL_STORY_OPEN_CHAT_END() {
      this._showStartCG();
   }


   protected _SIGNAL_CHECK_LEAD() {
      function dispatchLeadEnd() {
         this._fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_SPEED_ANIM_END);
      }

      var lead = this._fightHelper.checkSpeedLead();
      if (!lead) {
         dispatchLeadEnd.apply(this);
         return;
      }

      function eventFunc(event) {
         if (event == 'fei') {
            this._playFlySpeed(lead);
         } else if (event == 'finish') {
            dispatchLeadEnd.apply(this);
         }
      }
      var effectName = '';
      if (lead == 2) {
         effectName = 'moving_zhandoujiasu';
      } else if (lead == 3) {
         effectName = 'moving_zhandoujiasu2';
      } else if (lead == 4) {
         effectName = 'moving_zhandoujiasu3';
      }
      var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, effectName, null, eventFunc.bind(this), true);
      effect.node.setPosition(0, 0);
      this._fightHelper.writeSpeedLead(lead);
   }

   private _SIGNAL_SPEED_ANIM_END() {
      this._startBattle();
      this._fightUI.node.active = true;
   }

   private _SIGNAL_ATTACK_CHECK_CHAT() {
      var round = this._fightEngine.getBattleRound();
      var attackId = this._fightEngine.getAttackConfigId();
      this._checkStoryChat(StoryChatConst.TYPE_START_ATTACK, round, attackId);
   }

   private _SIGNAL_START_ATTACK() {
      this._totalHurt = 0;
   }

   private _SIGNAL_UNIT_CHAT_END(checkType) {
      var waveId = this._fightEngine.getWaveId();
      if (checkType == StoryChatConst.TYPE_START_ATTACK) {
         this._fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_START_ATTACK);
      } else if (StoryChatConst.TYPE_MONSTER_DIE == checkType) {
         this._fightEngine.setStart();
      } else if (checkType == StoryChatConst.TYPE_WIN) {
         if (this._report.getIsWin()) {
            if (waveId == 2 && this._battleData.stageId == 100101 && !this._battleData.alreadyPass) {
               this._xingcaiIn();
               return;
            }
         }
         var totalWave = this._fightEngine.getWaveCount();
         if (waveId < totalWave) {
            this._nextWave();
         } else {
            if (this._report.getIsWin()) {
               this.showSummary();
            }
         }
      }
   }

   private _SIGNAL_ROUND_START() {
      this._fightUI.updateRound(this._fightEngine.getBattleRound(), this._fightEngine.getMaxRound());
   }

   private _SIGNAL_HURT_VALUE(value) {
      this._totalHurt = this._totalHurt + value;
      var damageType = -1;
      if (this._totalHurt > 0) {
         damageType = 1;
      }
      this._fightUI.updateTotalHurt(this._totalHurt, damageType);
   }

   private _SIGNAL_DO_FINAL_SLOW() {
      this._fightUI.node.active = false;
      this._hasSlowAction = true;
   }

   private _SIGNAL_ATTACK_FINISH() {
      this._fightUI.hideTotalHurt();
   }

   private _SIGNAL_IN_COMBINE() {
   }

   private _SIGNAL_OUT_COMBINE() {
   }

   private _SIGNAL_DROP_ITEM() {
      this._dropCount = this._dropCount + 1;
      this._fightUI.setItemCount(this._dropCount);
   }

   private _SIGNAL_RUN_MAP_FINISH() {
      var mapIndex = this._fightEngine.getWaveId();
      this._fightScene.changeBG(this._battleData.background[mapIndex - 1]);
   }

   protected _SIGNAL_FINISH_WAVE(waveId) {
      BuffManager.getBuffManager().clearAllBuff();
      waveId = this._fightEngine.getWaveId();
      this._checkStoryChat(StoryChatConst.TYPE_WIN, waveId, 0);
   }

   private _SIGNAL_PLAY_COMBINE_FLASH(flash) {
      function eventFunc(event) {
         if (event == 'finish') {
            this._fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_COMBINE_SHOW_END);
         }
      }
      G_EffectGfxMgr.createPlayMovingGfx(this.node, flash, null, eventFunc, true);
   }

   private _SIGNAL_UNIT_DIE(unitId) {
      this._checkStoryChat(StoryChatConst.TYPE_MONSTER_DIE, 0, unitId);
   }

   private _SIGNAL_JUMP_TALK(callback, heroId) {
      this._checkStoryChat(StoryChatConst.TYPE_ENTER_STAGE, 0, heroId, callback);
   }

   private _SIGNAL_SHOW_ENDCG() {
      function checkLastChat() {
         this._checkStoryChat(StoryChatConst.TYPE_WIN, 0, 0);
      }
      if (this._report.getIsWin()) {
         this.showEndCG(checkLastChat.bind(this));
      }
   }

   private _SIGNAL_JUMP_WAVE() {
      this._isJumpEnd = true;
      if (!this._report.getIsWin()) {
         this._fightEngine.checkMosterEndTalk();
      }
   }

   private _SIGNAL_PLAY_PET_SKILL(camp, anim, petId, color) {
      if (anim != '') {
         this._fightUI.playSkillAnim(camp, anim, petId, color);
      }
   }

   protected _SIGNAL_FIGHT_END() {
      if (this._isJumpEnd) {
         if (this._report.getIsWin()) {
            var waveId = this._fightEngine.getWaveId();
            this._checkStoryChat(StoryChatConst.TYPE_WIN, waveId, 0);
         } else {
            this.showSummary();
         }
      } else {
         if (!this._report.getIsWin()) {
            this.showSummary();
            this._fightEngine.checkMosterEndTalk();
         } else {
            if (!this._hasSlowAction) {
               this.showSummary();
            }
         }
      }
   }

   private _SIGNAL_HISTORY_SHOW(hisCamp, hisId, skillShowId, stageId) {
      this._fightUI.playHistoryAnim(hisCamp, hisId, skillShowId, stageId);
   }

   private _startBattle() {
      this._fightEngine.startBattle();
      this._fightUI.node.active = true;
   }

   private _playFlySpeed(speed) {
      var pic = Path.getBattleRes('btn_battle_acc0' + speed);
      var spriteSpeed = UIHelper.newSprite(pic);
      this.node.addChild(spriteSpeed.node);
      spriteSpeed.node.setPosition(0, 0);
      var flyTime = 0.5;
      var action1 = cc.moveTo(flyTime, 0, 0);
      var action2 = cc.fadeOut(flyTime);
      var action3 = cc.scaleTo(flyTime, 0.2);
      var actionSpawn = cc.spawn(action1, action2, action3);
      var action4 = cc.destroySelf();
      var action = cc.sequence(actionSpawn, action4);
      spriteSpeed.node.runAction(action);
   }
}