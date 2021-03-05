import { AudioConst } from "../../../const/AudioConst";
import ChapterConst from "../../../const/ChapterConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { MovieConst } from "../../../const/MovieConst";
import { SignalConst } from "../../../const/SignalConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { ChapterBaseData } from "../../../data/ChapterBaseData";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { ReportParser } from "../../../fight/report/ReportParser";
import { Colors, G_AudioManager, G_ConfigLoader, G_ConfigManager, G_EffectGfxMgr, G_GameAgent, G_ResolutionManager, G_SceneManager, G_ServerListManager, G_SignalManager, G_TutorialManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonMainMenu from "../../../ui/component/CommonMainMenu";
import CommonNextFunctionOpen from "../../../ui/component/CommonNextFunctionOpen";
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupBoxReward from "../../../ui/popup/PopupBoxReward";
import PopupMovieText from "../../../ui/popup/PopupMovieText";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { DropHelper } from "../../../utils/DropHelper";
import { handler } from "../../../utils/handler";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { Path } from "../../../utils/Path";
import { ResourceData } from "../../../utils/resource/ResourceLoader";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import PopupStoryChat from "../storyChat/PopupStoryChat";
import PopupBossDetail from "./PopupBossDetail";
import PopupSiegeCome from "./PopupSiegeCome";
import PopupStageDetail from "./PopupStageDetail";
import PopupStageReward from "./PopupStageReward";
import PopupStarRank from "./PopupStarRank";
import StageBossNode from "./StageBossNode";
import StageNode from "./StageNode";
import StageScene from "./StageScene";
import { ReturnConst } from "../../../const/ReturnConst";

const { ccclass, property } = cc._decorator;
@ccclass
export default class StageView extends ViewBase {

   @property({ type: cc.ScrollView, visible: true })
   _scrollBG: cc.ScrollView = null;

   @property({ type: CommonMainMenu, visible: true })
   _btnFormation: CommonMainMenu = null;

   @property({ type: CommonMainMenu, visible: true })
   _btnStarRank: CommonMainMenu = null;

   @property({ type: cc.Node, visible: true })
   _starBoxNode: cc.Node = null;

   @property({ type: cc.Node, visible: true })
   _starBG: cc.Node = null;

   @property({ type: cc.ProgressBar, visible: true })
   _starBar: cc.ProgressBar = null;

   @property({ type: cc.Label, visible: true })
   _starTotal: cc.Label = null;

   @property({ type: cc.Button, visible: true })
   _btnStarBox1: cc.Button = null;

   @property({ type: cc.Label, visible: true })
   _starText1: cc.Label = null;

   @property({ type: cc.Button, visible: true })
   _btnStarBox2: cc.Button = null;

   @property({ type: cc.Label, visible: true })
   _starText2: cc.Label = null;

   @property({ type: cc.Button, visible: true })
   _btnStarBox3: cc.Button = null;

   @property({ type: cc.Label, visible: true })
   _starText3: cc.Label = null;

   @property({ type: CommonMainMenu, visible: true })
   _btnSiege: CommonMainMenu = null;

   @property({ type: cc.Node, visible: true })
   _nodeBossRoot: cc.Node = null;

   @property({ type: CommonMainMenu, visible: true })
   _btnBoss: CommonMainMenu = null;

   @property({ type: cc.Button, visible: true })
   _btnPassBox: cc.Button = null;

   @property({ type: CommonTopbarBase, visible: true })
   _topBar: CommonTopbarBase = null;

   @property({ type: cc.Node, visible: true })
   _nextFunctionOpenParent: cc.Node = null;

   @property({ type: CommonNextFunctionOpen, visible: true })
   _nextFunctionOpen: CommonNextFunctionOpen = null;

   @property({ type: cc.Node, visible: true })
   _nodeFamous: cc.Node = null;

   @property({ type: cc.Label, visible: true })
   _textFamousCount: cc.Label = null;

   @property({ type: cc.Node, visible: true })
   _panelFamousStory: cc.Node = null;

   @property({ type: cc.Node, visible: true })
   _imageFamousStory: cc.Node = null;

   @property({ type: cc.Node, visible: true })
   _imageFamousStoryOpen: cc.Node = null;

   @property({ type: cc.Label, visible: true })
   _textFamousStory: cc.Label = null;

   private static JUMP_MAP_TIME = 0.2

   private _chapterData: ChapterBaseData;
   private _chapterInfo: any;
   private _stageId: number;
   private _lastStageID: number;
   private _showBoss: boolean;
   private _stageList: StageNode[];
   private _boxInfo: any;
   private _getStar: number;
   private _stageBox: cc.Node[];
   private _scene: StageScene;

   private _signalChapterBox;
   private _signalStageBox;
   private _signalSiegeInfo;
   private _signalStarEftFinish;
   private _signalGetAllAward;
   private _signalTopBarPause;
   private _signalTopBarStart;
   private _signalExecuteStage;
   private _signalLevelup;
   private _signalCommonZeroNotice;
   private _signalChapterInfoGet;
   private _signalActDailyBoss;

   private _starBoxEft: { [key: number]: cc.Node };
   private _starRedpoint: { [key: number]: cc.Node };
   private _nodeBoss: StageBossNode;
   private _isFirstEnter: boolean;
   private _hasNewBox: boolean;
   private _popupStageReward: PopupStageReward;
   private _popupStageRewardSignal;
   private _firstReward: any[];
   private _isFamousStroyOpen;

   private stageNodePrefab: cc.Prefab;
   private stageBossNodePrefab: cc.Prefab;

   protected preloadResList: ResourceData[] = [
      { path: Path.getPrefab("StageNode", "stage"), type: cc.Prefab },
      { path: Path.getPrefab("StageBossNode", "stage"), type: cc.Prefab },
      { path: Path.getPrefab("PopupStageDetail", "stage"), type: cc.Prefab },
      { path: Path.getPrefab("PopupMovieText", "common"), type: cc.Prefab },
      { path: Path.getPrefab("PopupBoxReward", "common"), type: cc.Prefab },
      { path: Path.getPrefab("PopupGetRewards", "common"), type: cc.Prefab }
   ];

   private _fakeReports = [
      ConfigNameConst.FAKE_REPORT_1_1,
      ConfigNameConst.FAKE_REPORT_1_2,
      ConfigNameConst.FAKE_REPORT_3_1,
      ConfigNameConst.FAKE_REPORT_3_2,
      ConfigNameConst.FAKE_REPORT_5_1,
      ConfigNameConst.FAKE_REPORT_5_2,
      ConfigNameConst.FAKE_REPORT_26_1,
      ConfigNameConst.FAKE_REPORT_26_2,
   ]
   _isPopStageView: any;

   private stageIdIs_100201: boolean = false;

   public preloadRes(callBack: Function, args: any[]) {
      var chapterId = args[0] || G_UserData.getChapter().getLastOpenChapterId();
      this._chapterData = G_UserData.getChapter().getGlobalChapterById(chapterId);
      this._chapterInfo = this._chapterData.getConfigData();
      this._stageId = args[1] || null;
      this._showBoss = args[2] || null;
      this._isPopStageView = args[3] || false;

      let sceneInfo = G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAPTER_SCENE).get(this._chapterInfo.background);
      let picPath = sceneInfo.background;
      let [picBack, picMid, picFront] = Path.getStageMapPath(picPath);
      this.preloadResList.push({ path: picBack, type: cc.SpriteFrame });
      this.preloadResList.push({ path: picMid, type: cc.SpriteFrame });
      this.preloadResList.push({ path: picFront, type: cc.SpriteFrame });

      G_ConfigLoader.loadConifgArray(this._fakeReports, () => {
         super.preloadRes(callBack);
      });
   }

   constructor() {
      super();
      this._lastStageID = 0;
      this._stageList = [];
      this._boxInfo = {};
      this._getStar = 0;
      this._stageBox = [];
      this._starBoxEft = {};
      this._starRedpoint = {};
      this._isFirstEnter = true;
      this._hasNewBox = false;
      this._isFamousStroyOpen = true;
   }

   public onCreate() {
      this.setSceneSize();

      var chapterName;
      if (this._chapterInfo.chapter == '') {
         chapterName = this._chapterInfo.name;
      } else {
         chapterName = this._chapterInfo.chapter + (' ' + this._chapterInfo.name);
      }

      this._topBar.updateUI(TopBarStyleConst.STYLE_PVE);
      this._topBar.setTitle(chapterName, 40, Colors.DARK_BG_THREE, Colors.DARK_BG_OUTLINE);

      this.stageNodePrefab = cc.resources.get(Path.getPrefab("StageNode", "stage"), cc.Prefab);
      this.stageBossNodePrefab = cc.resources.get(Path.getPrefab("StageBossNode", "stage"), cc.Prefab);

      this._setBtnBossVisible(false);
      this._createScene();
      this._createStageNodes();
      this._createBoxInfo();
      this._setBtnSiegeVisible(false);
      this._btnFormation.updateUI(FunctionConst.FUNC_TEAM, null, 'txt_main_enter_group2');
      this._btnStarRank.updateUI(FunctionConst.FUNC_STORY_STAR_RANK);
      this._btnSiege.updateUI(FunctionConst.FUNC_PVE_SIEGE);
      this._btnSiege.addClickEventListenerEx(handler(this, this.onSiegeClick));
      var isPassBoxVisible = this._chapterData.getPreward() == 0;
      this._btnPassBox.node.active = (isPassBoxVisible);
      this._doLayoutTopButton();
      this._nodeFamous.active = false;
      this._imageFamousStory.active = !this._isFamousStroyOpen;
      this._imageFamousStoryOpen.active = this._isFamousStroyOpen;

      this._btnFormation.addClickEventListenerEx(handler(this, this.onTeamClick));
      this._btnStarRank.addClickEventListenerEx(handler(this, this.onStarRankClick));
   }

   public onEnter() {
      if (G_UserData.getChapter().isExpired()) {
         G_UserData.getChapter().pullData();
      }
      G_AudioManager.playMusicWithId(AudioConst.MUSIC_PVE);
      // this._topBar.resumeUpdate();
      this._signalChapterBox = G_SignalManager.add(SignalConst.EVENT_CHAPTER_BOX, handler(this, this._onEventChapterBox));
      this._signalStageBox = G_SignalManager.add(SignalConst.EVENT_CHAPTER_STAGE_BOX, handler(this, this._onEventStageBox));
      this._signalSiegeInfo = G_SignalManager.add(SignalConst.EVENT_REBEL_ARMY, handler(this, this._onEventSiegeInfo));
      this._signalStarEftFinish = G_SignalManager.add(SignalConst.EVENT_STAR_EFFECT_END, handler(this, this._onStarEftFinish));
      this._signalGetAllAward = G_SignalManager.add(SignalConst.EVENT_GET_ALL_BOX, handler(this, this._onGetAllAward));
      this._signalTopBarPause = G_SignalManager.add(SignalConst.EVENT_TOPBAR_PAUSE, handler(this, this._onEventTopBarPause));
      this._signalTopBarStart = G_SignalManager.add(SignalConst.EVENT_TOPBAR_START, handler(this, this._onEventTopBarStart));
      this._signalExecuteStage = G_SignalManager.add(SignalConst.EVENT_EXECUTE_STAGE, handler(this, this._onEventExecuteStage));
      this._signalLevelup = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onEventLevelUp));
      this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(this, this._onEventCommonZeroNotice));
      this._signalChapterInfoGet = G_SignalManager.add(SignalConst.EVENT_CHAPTER_INFO_GET, handler(this, this._onEventChapterInfoGet));
      this._signalActDailyBoss = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_DAILY_BOSS, handler(this, this._onEventDailyBoss));
      this._hasNewBox = false;
      this._refreshBoxState();
      var isShowEnd = this._checkChapterEnd();
      if (!isShowEnd) {
         this._topBar.resumeUpdate();
         this._refreshBossBtn();
         this._refreshSiegeBtn();
         this._refreshView();
         this._refreshRedPoint();
         this._checkRebel();
         this._checkFamousUI();
      } else {
         G_UserData.getStage().resetRebel();
      }
      if (this._stageId && this._stageId != 0) {
         this._enterStageById(this._stageId);
         this._stageId = null;
      }
      if (this._showBoss) {
         this._openChapterBoss();
         this._showBoss = false;
      }
      this._checkFirstEnter();
      this._nextFunctionOpen.updateUI();
      this._isFirstEnter = false;
      this._showFirstReward();
      const userId = G_UserData.getBase().getId();
      const _100201 = cc.sys.localStorage.getItem(userId + 'firstPay')
      if (this.stageIdIs_100201 && !_100201 && G_ConfigManager.checkCanRecharge()) {
         const openTime = G_UserData.getBase().getServer_open_time()
         const end_time = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(2015).content;
         if (openTime >= end_time) {
            G_SceneManager.openPopup('prefab/firstpay/PopupFirstPayViewNew', (popup) => {
               popup.openWithAction();
            })
         }
         this.stageIdIs_100201 = false;
         cc.sys.localStorage.setItem(userId + 'firstPay', 1);
      }
   }

   public onExit() {
      this._signalExecuteStage.remove();
      this._signalExecuteStage = null;
      this._signalChapterBox.remove();
      this._signalChapterBox = null;
      this._signalStageBox.remove();
      this._signalStageBox = null;
      this._signalSiegeInfo.remove();
      this._signalSiegeInfo = null;
      this._signalStarEftFinish.remove();
      this._signalStarEftFinish = null;
      this._signalGetAllAward.remove();
      this._signalGetAllAward = null;
      this._signalTopBarPause.remove();
      this._signalTopBarPause = null;
      this._signalTopBarStart.remove();
      this._signalTopBarStart = null;
      this._signalLevelup.remove();
      this._signalLevelup = null;
      this._signalChapterInfoGet.remove();
      this._signalChapterInfoGet = null;
      this._signalCommonZeroNotice.remove();
      this._signalCommonZeroNotice = null;
      this._signalActDailyBoss.remove();
      this._signalActDailyBoss = null;
   }

   private _onEventChapterInfoGet(event) {
   }

   private _onEventDailyBoss(eventName, ret) {
      this._refreshBossBtn();
   }

   private _onEventCommonZeroNotice(event, hour) {
      G_UserData.getChapter().pullData();
   }

   private _checkFamousUI() {
      if (this._chapterInfo.type != ChapterConst.CHAPTER_TYPE_FAMOUS) {
         this._nodeFamous.active = false;
         return;
      }
      this._btnStarRank.node.active = false;
      this._starBoxNode.active = false;
      this._nodeFamous.active = true;
      var count = G_UserData.getChapter().getFamousLeftCount();
      this._textFamousCount.string = count.toString();
      this._textFamousStory.string = (this._chapterInfo.subtitle);
   }

   private _onEventLevelUp() {
      this._nextFunctionOpen.updateUI();
   }

   private _openStageBox() {
      if (this._hasNewBox) {
         this._popupStageReward = new cc.Node("popupStageReward").addComponent(PopupStageReward);
         this._popupStageReward.init(this._chapterData, this._getStar, handler(this, this._openMovieText));
         this._popupStageRewardSignal = this._popupStageReward.signal.add(handler(this, this._onStageRewardClose));
         this._popupStageReward.open();

      } else {
         this._openMovieText();
      }
      this._showAllUI(false);
   }

   private _openMovieText() {
      var configData = this._chapterInfo;
      if (configData.type == 1) {
         let prefab: cc.Prefab = cc.resources.get(Path.getCommonPrefab("PopupMovieText"), cc.Prefab);
         if (prefab == null) {
            return;
         }
         let popupMovieText: PopupMovieText = cc.instantiate(prefab).getComponent(PopupMovieText);
         popupMovieText.node.name = "PopupMovieText";
         popupMovieText.init(MovieConst.TYPE_CHAPTER_END, function () {
            if (G_TutorialManager.isDoingStep() == false) {
               G_SceneManager.popScene();
            }
         });
         popupMovieText.showUI(configData.chapter, configData.name, configData.subtitle);
         // G_SceneManager.openPopup(Path.getCommonPrefab("PopupMovieText"), (popupMovieText: PopupMovieText) => {
         //    popupMovieText.init(MovieConst.TYPE_CHAPTER_END, function () {
         //       if (G_TutorialManager.isDoingStep() == false) {
         //          G_SceneManager.popScene();
         //       }
         //    });
         //    popupMovieText.showUI(configData.chapter, configData.name, configData.subtitle);
         // });
         this._chapterData.setShowEnding(false);
      } else {
         this._chapterData.setShowEnding(false);
         if (G_TutorialManager.isDoingStep() == false) {
            G_SceneManager.popScene();
         }
      }
   }

   private _refreshRedPoint() {
      var hasPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_TEAM);
      this._btnFormation.showRedPoint(hasPoint);
   }

   private _checkFirstEnter() {
      function postEvent() {
         G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "StageView");
      }
      function sendTutorialStepEvent() {
         this._checkStartChat(postEvent.bind(this));
      }
      if (!this._chapterData.isHas_entered()) {
         G_UserData.getChapter().c2sFirstEnterChapter(this._chapterInfo.id);
         G_SceneManager.openPopup(Path.getCommonPrefab("PopupMovieText"), (popupMovieText: PopupMovieText) => {
            popupMovieText.init(MovieConst.TYPE_CHAPTER_START, sendTutorialStepEvent.bind(this));
            popupMovieText.showUI(this._chapterInfo.chapter, this._chapterInfo.name);
         });
      } else {
         this.scheduleOnce(() => {
            postEvent();
         }, 0);
      }
   }

   private _checkChapterEnd() {
      if (this._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
         return false;
      }
      var needShow = this._chapterData.isShowEnding();
      if (needShow) {
         this._openStageBox();
      }
      return needShow;
   }

   private _checkRebel() {
      var rebel = G_UserData.getStage().getNewRebel();
      if (rebel) {
         G_SceneManager.openPopup(Path.getPrefab("PopupSiegeCome", "stage"), (popupSiegeCome: PopupSiegeCome) => {
            popupSiegeCome.init(rebel);
            popupSiegeCome.openWithAction();
         });
         G_UserData.getStage().resetRebel();
      }
   }

   private _createScene() {
      this._scene = new cc.Node("StageScene").addComponent(StageScene);
      this._scene.setScene(this._chapterInfo.background);
      this._scrollBG.content.addChild(this._scene.node);

      var size = this._scene.getSize();
      this._scrollBG.content.setContentSize(size.width, size.height);
   }

   public moveLayerTouch() {
      var posX = this._scrollBG.content.position.x;
      posX += G_ResolutionManager.getDesignWidth() * 0.5;
      this._scene.onMoveEvent(posX);
   }

   private _createStageNodes() {
      var type = this._chapterInfo.type;
      var stageIdList = this._chapterData.getStageIdList();
      for (var i = 0; i < stageIdList.length; i++) {
         var stageData = G_UserData.getStage().getStageById(stageIdList[i]);

         var stageNode = cc.instantiate(this.stageNodePrefab).getComponent(StageNode);
         stageNode.setStageNode(stageData, handler(this, this._enterStageById), type == ChapterConst.CHAPTER_TYPE_FAMOUS);
         this._stageList.push(stageNode);
         var configData = stageData.getConfigData();
         this._scene.addStageNode(stageNode.node);
         stageNode.node.setPosition(configData.res_x, configData.res_y);

         if (configData.box_id != 0) {
            this._createBox(configData);
         }
      }
   }

   private _createBox(data) {
      var stageId = data.id;

      var panelBox = new cc.Node();
      panelBox.name = 'ImageBox_' + stageId;
      panelBox.setContentSize(90, 90);
      panelBox.setAnchorPoint(0.5, 0);
      panelBox.setPosition(data.box_x, data.box_y);

      this._stageBox.push(panelBox);

      let panelButton: cc.Button = panelBox.addComponent(cc.Button);
      let clickEventHandler = new cc.Component.EventHandler();
      clickEventHandler.target = this.node;
      clickEventHandler.component = "StageView";
      clickEventHandler.handler = "onBoxTouch";
      panelButton.clickEvents.push(clickEventHandler);
      var texture = Path.getCommonIcon('common', 'img_mapbox_guan');
      this._refreshBoxImg(panelBox, texture);
      this._scene.addStageBox(panelBox);
   }

   private _createBoxInfo() {
      this._starText1.string = (this._chapterInfo.copperbox_star);
      this._starText2.string = (this._chapterInfo.silverbox_star);
      this._starText3.string = (this._chapterInfo.goldbox_star);
      this._starTotal.string = ('' + (this._getStar + ('/' + this._chapterInfo.goldbox_star)));
   }

   public onBoxTouch(sender: cc.Event.EventTouch) {
      var stageID = parseInt((sender.target as cc.Node).name.replace("ImageBox_", ""));
      this.setBoxTouch(stageID);
   }

   public setBoxTouch(stageID) {
      var stageData = G_UserData.getStage().getStageById(stageID);
      var data = stageData.getConfigData();
      var detail = Lang.get('get_box_detail', { name: data.name });
      var boxid = data.box_id;
      this._boxInfo.type = 'stage';
      this._boxInfo.id = stageID;
      this._boxInfo.get = false;
      this._boxInfo.canGet = false;
      if (stageData) {
         var isPass = stageData.isIs_finished();
         if (isPass) {
            this._boxInfo.canGet = true;
         }
         var isget = stageData.isReceive_box();
         if (isget) {
            this._boxInfo.get = true;
         }
      }
      this._showBoxReward(boxid, detail);
   }

   private _showBoxReward(boxid, boxDetail, sender?, star?) {
      var boxInfo = G_ConfigLoader.getConfig(ConfigNameConst.STORY_BOX).get(boxid);
      var rewards = [];
      for (var i = 1; i <= 10; i++) {
         var nameType = 'type_' + i;
         var nameValue = 'value_' + i;
         var nameSize = 'size_' + i;
         if (boxInfo[nameType] != 0) {
            var item = {
               type: boxInfo[nameType],
               value: boxInfo[nameValue],
               size: boxInfo[nameSize]
            };
            rewards.push(item);
         }
      }
      var strLabel = '';
      if (this._boxInfo.type == 'star') {
         strLabel = Lang.get('stage_star_box');
      } else if (this._boxInfo.type == 'stage') {
         strLabel = Lang.get('stage_box');
      } else if (this._boxInfo.type == 'passBox') {
         strLabel = Lang.get('stage_pass_box');
      }

      G_SceneManager.openPopup(Path.getPrefab("PopupBoxReward", "common"), (popupBoxReward: PopupBoxReward) => {
         popupBoxReward.init(strLabel, handler(this, this._onGetBoxClick), false, false);
         popupBoxReward.updateUI(rewards);
         popupBoxReward.openWithAction();
         popupBoxReward.setBtnText(Lang.get('get_box_reward'));
         if (star) {
            popupBoxReward.setChapterDesc(star);
         } else {
            if (this._boxInfo.type == 'passBox') {
               var richText = RichTextExtend.createWithContent(boxDetail);
               popupBoxReward.addRichTextDetail(richText.node);
               popupBoxReward.setDetailTextVisible(false);
            } else {
               popupBoxReward.setDetailText(boxDetail);
            }
         }
         if (this._boxInfo.get) {
            popupBoxReward.setBtnText(Lang.get('got_star_box'));
            popupBoxReward.setBtnEnable(false);
         } else {
            if (!this._boxInfo.canGet) {
               popupBoxReward.setBtnEnable(false);
            }
         }
      });
   }

   private _refreshBoxImg(node, image) {
      node.removeAllChildren(true);
      var boxTex = UIHelper.newSprite(image).node;
      boxTex.setAnchorPoint(0.5, 0.5);
      node.addChild(boxTex);
      var size = node.getContentSize();
      boxTex.setPosition(0, size.height * 0.5);
   }

   private _refreshBossBtn() {
      if (this._chapterData.getBossId() != 0 && this._chapterData.getBossState() == 0) {
         this._setBtnBossVisible(true);
      } else {
         this._setBtnBossVisible(false);
      }
   }

   private _refreshSiegeBtn() {
      var configData = this._chapterInfo;
      if (configData.type == 3) {
         this._setBtnSiegeVisible(false);
         return;
      }
      if (!FunctionCheck.funcIsOpened(FunctionConst.FUNC_PVE_SIEGE)[0]) {
         this._setBtnSiegeVisible(false);
      } else if (G_UserData.getSiegeData().isHasEnemy() || G_UserData.getRedPoint().isRebelArmy()) {
         this._setBtnSiegeVisible(true);
      } else {
         this._setBtnSiegeVisible(false);
      }
   }

   private _refreshView() {
      var posNode = this._refreshStageNode();
      var posBox = this._refreshStageBoxState();
      if (this._isFirstEnter) {
         this._jumpStageMap(posNode);
      }
   }

   private _enterStageById(stageId) {
      var StoryStage = G_ConfigLoader.getConfig(ConfigNameConst.STORY_STAGE);
      var stageInfo = StoryStage.get(stageId);
      this._jumpStageMap(stageInfo.res_x);
      G_SceneManager.openPopup(Path.getPrefab("PopupStageDetail", "stage"), (popStageDetail: PopupStageDetail) => {
         popStageDetail.init(stageId);
         popStageDetail.openWithAction();
      });
   }

   public jumpToStagePos(stageId) {
      var stageData = G_UserData.getStage().getStageById(stageId);
      var config = stageData.getConfigData();
      if (config.box_id != 0) {
         var isget = stageData.isReceive_box();
         if (isget) {
            this._jumpStageMap(config.res_x);
         } else {
            this._jumpStageMap(config.box_x);
         }
      } else {
         this._jumpStageMap(config.res_x);
      }
   }

   private _refreshStageNode() {
      var jumpPos = 0;
      var hasJump = false;

      for (let i = 0; i < this._stageList.length; i++) {
         var v = this._stageList[i];
         v.refreshStageNode();
         if (v.node.active) {
            jumpPos = v.node.position.x;
         } else if (!v.node.active && this._isFirstEnter && !hasJump) {
            v.playEnter();
            jumpPos = v.node.position.x;
            hasJump = true;
         }

      }
      return jumpPos;
   }

   private _jumpStageMap(posX, moveTime?) {
      var disWidth = G_ResolutionManager.getDesignWidth();
      var width = this._scene.getSize().width;
      if (posX < disWidth * 0.5) {
         posX = 0;
      } else if (posX > width - disWidth * 0.5) {
         posX = disWidth - width;
      } else {
         posX = disWidth * 0.5 - posX;
      }
      let contentPosX = posX - disWidth * 0.5;
      if (moveTime) {
         var posY = this._scrollBG.content.position.y;
         var action = cc.moveTo(moveTime, contentPosX, posY);
         this._scrollBG.content.runAction(action);
      } else {
         this._scrollBG.content.x = contentPosX;
      }
      this._scene.onMoveEvent(posX);
   }

   private _onEventSiegeInfo() {
      if (G_UserData.getSiegeData().isHasEnemy() || G_UserData.getRedPoint().isRebelArmy()) {
         this._setBtnSiegeVisible(true);
      } else {
         this._setBtnSiegeVisible(false);
      }
   }

   private _refreshStarBar() {
      var percent = 0;
      if (this._getStar <= this._chapterInfo.copperbox_star) {
         if (this._chapterInfo.copperbox_star == 0) {
            percent = 0;
         }
         else {
            percent = Math.floor(0.33 * this._getStar / this._chapterInfo.copperbox_star * 100);
         }
      } else if (this._getStar <= this._chapterInfo.silverbox_star) {
         percent = Math.floor(0.66 * this._getStar / this._chapterInfo.silverbox_star * 100);
      } else {
         percent = Math.floor(this._getStar / this._chapterInfo.goldbox_star * 100);
      }
      this._starBar.progress = percent / 100;
   }

   private _createBoxEffect(index) {
      if (this._starBoxEft[index] || this._starRedpoint[index]) {
         return;
      }
      var baseNode: cc.Node;
      if (index == 4) {
         baseNode = this._btnPassBox.node;
      } else {
         baseNode = this['_btnStarBox' + index].node;
      }
      if (!baseNode) {
         return;
      }
      var effect = G_EffectGfxMgr.createPlayMovingGfx(baseNode, 'moving_boxflash', null, null, false);
      this._starBoxEft[index] = effect.node;
      var redPoint = UIHelper.newSprite(Path.getUICommon('img_redpoint')).node;
      baseNode.addChild(redPoint);
      redPoint.setPosition(30, 16);
      this._starRedpoint[index] = redPoint;
   }

   private _removeBoxFlash(index) {
      if (this._starBoxEft[index]) {
         this._starBoxEft[index].destroy();
         this._starBoxEft[index] = null;
      }
      if (this._starRedpoint[index]) {
         this._starRedpoint[index].destroy();
         this._starRedpoint[index] = null;
      }
   }

   private _refreshBoxState() {
      this._getStar = 0;
      var stageList: any[] = this._chapterData.getStageIdList();
      for (let i = 0; i < stageList.length; i++) {
         var val = stageList[i];
         var stageData = G_UserData.getStage().getStageById(val);
         if (stageData) {
            this._getStar = this._getStar + stageData.getStar();
         }
      }

      var star = this._getStar;
      this._starTotal.string = ('' + (this._getStar + ('/' + this._chapterInfo.goldbox_star)));
      if (this._chapterData.getPreward() != 0) {
         this._removeBoxFlash(4);
         UIHelper.loadTexture(this._btnPassBox.getComponent(cc.Sprite), Path.getChapterBox('btn_common_box6_3'))
      } else {
         if (this._chapterData.isLastStagePass()) {
            UIHelper.loadTexture(this._btnPassBox.getComponent(cc.Sprite), Path.getChapterBox('btn_common_box6_2'))
            this._createBoxEffect(4);
            this._hasNewBox = true;
         }
      }
      if (this._chapterInfo.copperbox_star == 0) {
         this._btnStarBox1.node.active = false;
      } else {
         if (star >= this._chapterInfo.copperbox_star) {
            if (this._chapterData.getBreward() == 0) {
               UIHelper.loadTexture(this._btnStarBox1.getComponent(cc.Sprite), Path.getChapterBox('baoxiangtong_kai'))
               this._createBoxEffect(1);
               this._hasNewBox = true;
            } else {
               UIHelper.loadTexture(this._btnStarBox1.getComponent(cc.Sprite), Path.getChapterBox('baoxiangtong_kong'))
               this._removeBoxFlash(1);
            }
         }
      }
      if (star >= this._chapterInfo.silverbox_star) {
         if (this._chapterData.getSreward() == 0) {
            UIHelper.loadTexture(this._btnStarBox2.getComponent(cc.Sprite), Path.getChapterBox('baoxiangyin_kai'))
            this._createBoxEffect(2);
            this._hasNewBox = true;
         } else {
            UIHelper.loadTexture(this._btnStarBox2.getComponent(cc.Sprite), Path.getChapterBox('baoxiangyin_kong'))
            this._removeBoxFlash(2);
         }
      }
      if (star >= this._chapterInfo.goldbox_star) {
         if (this._chapterData.getGreward() == 0) {
            UIHelper.loadTexture(this._btnStarBox3.getComponent(cc.Sprite), Path.getChapterBox('baoxiangjin_kai'))
            this._createBoxEffect(3);
            this._hasNewBox = true;
         } else {
            UIHelper.loadTexture(this._btnStarBox3.getComponent(cc.Sprite), Path.getChapterBox('baoxiangjin_kong'))
            this._removeBoxFlash(3);
         }
      }
      this._refreshStarBar();
   }

   private _checkStartChat(postEvent) {
      let StoryTouch = G_ConfigLoader.getConfig(ConfigNameConst.STORY_TOUCH);
      var count = StoryTouch.length();
      for (let i = 0; i < count; i++) {
         var touch = StoryTouch.indexOf(i);
         if (touch.control_type == PopupStoryChat.TYPE_CHAPTER_START && touch.control_value1 == this._chapterInfo.id) {
            cc.resources.load(Path.getPrefab("PopupStoryChat", "storyChat"), cc.Prefab, function (err, res) {
               if (err != null || res == null) {
                  return;
               }
               let storyChat: PopupStoryChat = cc.instantiate(res).getComponent(PopupStoryChat);
               storyChat.updateUI(touch.story_touch, function () {
                  storyChat.node.destroy();
                  postEvent();
               });
               this.node.addChild(storyChat.node);
            }.bind(this));
            return;
         }
      }
      postEvent();
   }

   private _refreshStageBoxState() {
      var boxPos = 0;
      for (let i = 0; i < this._stageBox.length; i++) {
         var v = this._stageBox[i];
         var stageID = parseInt(v.name.split('ImageBox_')[1]);
         var stageData = G_UserData.getStage().getStageById(stageID);
         if (stageData) {
            var isPass = stageData.isIs_finished();
            var isget = stageData.isReceive_box();
            if (isPass) {
               if (isget) {
                  var texture = Path.getCommonIcon('common', 'img_mapbox_kong');
                  this._refreshBoxImg(v, texture);
               } else {
                  this._createStageBoxEffect(v);
                  this._hasNewBox = true;
                  if (boxPos == 0) {
                     boxPos = v.position.x;
                  }
               }
            }
         }

      }
      return boxPos;
   }

   private _createStageBoxEffect(baseNode: cc.Node) {
      if (!baseNode) {
         return;
      }
      baseNode.removeAllChildren(true);
      var effect = G_EffectGfxMgr.createPlayMovingGfx(baseNode, 'moving_boxjump', null, null, false);
      var size = baseNode.getContentSize();
      // effect.node.setPosition(size.width * 0.5, size.height * 0.5);
      effect.node.setPosition(0, size.height * 0.5);
   }

   public onBox1Touch() {
      var boxId = this._chapterInfo.copperbox_drop_id;
      this._boxInfo.type = 'star';
      this._boxInfo.id = 1;
      var detail = Lang.get('get_star_box_detail2', {
         count: this._chapterInfo.copperbox_star,
         urlIcon: Path.getUICommon('img_lit_stars02')
      });
      var chapterData = this._chapterData;
      if (chapterData.getBreward() == 0) {
         this._boxInfo.get = false;
      } else {
         this._boxInfo.get = true;
      }
      if (this._getStar >= this._chapterInfo.copperbox_star) {
         this._boxInfo.canGet = true;
      } else {
         this._boxInfo.canGet = false;
      }
      var star = this._chapterInfo.copperbox_star;
      this._showBoxReward(boxId, detail, null, star);
   }

   public onBox2Touch() {
      var boxId = this._chapterInfo.silverbox_drop_id;
      this._boxInfo.type = 'star';
      this._boxInfo.id = 2;
      var detail = Lang.get('get_star_box_detail2', {
         count: this._chapterInfo.silverbox_star,
         urlIcon: Path.getUICommon('img_lit_stars02')
      });
      var chapterData = this._chapterData;
      if (chapterData.getSreward() == 0) {
         this._boxInfo.get = false;
      } else {
         this._boxInfo.get = true;
      }
      if (this._getStar >= this._chapterInfo.silverbox_star) {
         this._boxInfo.canGet = true;
      } else {
         this._boxInfo.canGet = false;
      }
      var star = this._chapterInfo.silverbox_star;
      this._showBoxReward(boxId, detail, null, star);
   }

   public onBox3Touch() {
      var boxId = this._chapterInfo.goldbox_drop_id;
      this._boxInfo.type = 'star';
      this._boxInfo.id = 3;
      var detail = Lang.get('get_star_box_detail2', {
         count: this._chapterInfo.goldbox_star,
         urlIcon: Path.getUICommon('img_lit_stars02')
      });
      var chapterData = this._chapterData;
      if (chapterData.getGreward() == 0) {
         this._boxInfo.get = false;
      } else {
         this._boxInfo.get = true;
      }
      if (this._getStar >= this._chapterInfo.goldbox_star) {
         this._boxInfo.canGet = true;
      } else {
         this._boxInfo.canGet = false;
      }
      var star = this._chapterInfo.goldbox_star;
      this._showBoxReward(boxId, detail, null, star);
   }

   public onPassBoxTouch() {
      var boxId = this._chapterInfo.chapterbox_drop_id;
      this._boxInfo.type = 'passBox';
      this._boxInfo.id = 4;
      var stageIdList = this._chapterData.getStageIdList();
      var lastStageID = stageIdList[stageIdList.length - 1];
      var StoryStage = G_ConfigLoader.getConfig(ConfigNameConst.STORY_STAGE);
      var lastStageInfo = StoryStage.get(lastStageID);
      var qColor = Colors.getColor(lastStageInfo.color);
      var detail = Lang.get('stage_pass_box_detail', {
         name: lastStageInfo.name,
         color: Colors.colorToNumber(qColor)
      });
      var chapterData = this._chapterData;
      if (chapterData.getPreward() == 0) {
         this._boxInfo.get = false;
      } else {
         this._boxInfo.get = true;
      }
      if (chapterData.isLastStagePass()) {
         this._boxInfo.canGet = true;
      } else {
         this._boxInfo.canGet = false;
      }
      this._showBoxReward(boxId, detail, null, null);
   }

   private _onGetBoxClick() {
      if (this._boxInfo.type == 'star') {
         G_UserData.getChapter().c2sFinishChapterBoxRwd(this._chapterInfo.id, this._boxInfo.id);
      } else if (this._boxInfo.type == 'passBox') {
         G_UserData.getChapter().c2sFinishChapterBoxRwd(this._chapterInfo.id, this._boxInfo.id);
      } else if (this._boxInfo.type == 'stage') {
         G_UserData.getChapter().c2sReceiveStageBox(this._boxInfo.id);
      }
   }

   private _onEventStageBox(eventName, stageId) {
      this._refreshStageBoxState();
      var stageData = G_UserData.getStage().getStageById(stageId);
      var boxid = stageData.getConfigData().box_id;
      var boxInfo = G_ConfigLoader.getConfig(ConfigNameConst.STORY_BOX).get(boxid);
      var rewards = [];
      for (var i = 1; i <= 10; i++) {
         var nameType = 'type_' + i;
         var nameValue = 'value_' + i;
         var nameSize = 'size_' + i;
         if (boxInfo[nameType] != 0) {
            var item = {
               type: boxInfo[nameType],
               value: boxInfo[nameValue],
               size: boxInfo[nameSize]
            };
            rewards.push(item);
         }
      }
      PopupGetRewards.popupReward(rewards, null, null, null, null, null);
      if (this._popupStageReward) {
         this._popupStageReward.onBoxGet();
      }
   }

   private _onEventChapterBox(eventName, rewards, boxType) {
      this._refreshBoxState();
      PopupGetRewards.popupReward(rewards, null, null, null, null, null);
      if (this._popupStageReward) {
         this._popupStageReward.onBoxGet();
      }
   }

   private _onGetAllAward(eventName, rewards) {
      PopupGetRewards.popupReward(rewards, null, null, handler(this, this._openMovieText), null, () => {
         if (this._popupStageReward) {
            this._popupStageReward.close();
            this._popupStageReward = null;
         }
      });

      this._refreshBoxState();
      this._refreshStageBoxState();
   }

   public onTeamClick() {
      G_SceneManager.showScene('team');
   }

   public onStarRankClick() {
      G_SceneManager.openPopup(Path.getPrefab("PopupStarRank", "stage"), (popup: PopupStarRank) => {
         popup.init(this._chapterInfo.type);
         popup.openWithAction();
      }, this._chapterInfo.type)
   }

   public onSiegeClick() {
      G_SceneManager.showScene('siege');
   }

   private _onBossClick() {
      this._openChapterBoss();
   }

   private _openChapterBoss() {
      var bossId = this._chapterData.getBossId();
      var bossState = this._chapterData.getBossState();
      if (bossState == 0) {
         var bossData = G_ConfigLoader.getConfig(ConfigNameConst.STORY_ESSENCE_BOSS).get(bossId);
         var showBoss = this._showBoss;

         G_SceneManager.openPopup(Path.getPrefab("PopupBossDetail", "stage"), (popupBossDetail: PopupBossDetail) => {
            popupBossDetail.init(this._chapterInfo.type, this._chapterInfo.id, bossData, showBoss, this._isPopStageView);
            popupBossDetail.openWithAction();
         });
      }
   }

   private _onStarEftFinish() {
      var fightStageId = G_UserData.getStage().getNowFightStage();
      if (fightStageId == 0) {
         return;
      }
      var stageData = G_UserData.getStage().getStageById(fightStageId);
      if (!stageData.isIs_finished()) {
         return;
      }
      var nextStageNode: StageNode = null;
      for (let i = 0; i < this._stageList.length; i++) {
         let v: StageNode = this._stageList[i];
         if (v.getStageId() == fightStageId && !v.isPass()) {
            nextStageNode = this._stageList[i + 1];
         }

      }
      if (nextStageNode) {
         nextStageNode.playEnter(function () {
            this._jumpStageMap(nextStageNode.node.x, StageView.JUMP_MAP_TIME);
         }.bind(this));
      }
   }

   private _onStageRewardClose(event) {
      console.log("_onStageRewardClose", event);
      if (event == 'close') {
         this._popupStageReward = null;
         this._popupStageRewardSignal.remove();
         this._popupStageRewardSignal = null;
      }
   }

   private _onEventTopBarPause() {
      this._topBar.pauseUpdate();
   }

   private _onEventTopBarStart() {
      this._topBar.resumeUpdate();
   }

   private _showAllUI(s) {
      for (let i = 0; i < this._stageList.length; i++) {
         let v = this._stageList[i];
         v.node.active = s;
      }

      for (let i = 0; i < this._stageBox.length; i++) {
         let v = this._stageBox[i];
         v.active = (s);
      }
      this._btnFormation.node.active = (s);
      this._btnStarRank.node.active = (s);
      this._starBoxNode.active = s;
      this._setBtnSiegeVisible(s);
      this._setBtnBossVisible(s);
      this._topBar.node.active = s;
      this._btnPassBox.node.active = s;
      this._nextFunctionOpenParent.active = s;
   }

   private _onEventExecuteStage(eventName, message, isFirstPass, stageId) {
      // console.log("_onEventExecuteStage");

      G_SignalManager.addOnce(SignalConst.EVENT_ENTER_FIGHT_SCENE, handler(this, this._enterFightView, message, isFirstPass, stageId));
      G_UserData.getFightReport().c2sGetNormalBattleReport(message.battle_report)
   }

   private _enterFightView(args: any[]) {
      let message: any = args[0];
      let isFirstPass: any = args[1];
      let stageId: any = args[2];

      let stageData = G_UserData.getStage().getStageById(stageId)
      let stageInfo = stageData.getConfigData();
      let isFamousChapter: boolean = this._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS;

      let battleReport = G_UserData.getFightReport().getReport();
      let reportData = null;

      if (isFirstPass) {
         if (stageInfo.false_report != "") {
            let baseId = G_UserData.getHero().getRoleBaseId()
            let gender = 1
            if (baseId > 10) {
               gender = 2
            }
            let report = G_ConfigLoader.getConfig(stageInfo.false_report + "_" + gender).asset;
            reportData = ReportParser.parse(report, true)
         }
         else {
            reportData = ReportParser.parse(battleReport)
         }
         if (isFamousChapter) {
            this._firstReward = DropHelper.getDropReward(stageInfo.first_drop);
         }
      }
      else {
         reportData = ReportParser.parse(battleReport)
      }

      let battleData = BattleDataHelper.parseNormalDungeonData(message, stageInfo, isFamousChapter, isFirstPass)
      if (stageId == 100201) {
         this.stageIdIs_100201 = true;
      }
      G_SceneManager.showScene('fight', reportData, battleData);
   }

   private _setBtnSiegeVisible(isVisible) {
      this._btnSiege.node.active = (isVisible);
      this._doLayoutTopButton();
   }

   private _setBtnBossVisible(isVisible) {
      if (!this._nodeBoss) {
         this._nodeBoss = cc.instantiate(this.stageBossNodePrefab).getComponent(StageBossNode);
         this._nodeBoss.setCustomCallback(handler(this, this._onBossClick));
         this._nodeBossRoot.addChild(this._nodeBoss.node);
      }
      this._nodeBoss.refreshBossInfo(this._chapterData);
      this._nodeBossRoot.active = isVisible;
      this._doLayoutTopButton();
   }

   private _doLayoutTopButton() {
      var posStart = -105;
      var startIndex = 0;
      var gap = 90;
      if (this._btnPassBox.node.active) {
         this._btnPassBox.node.x = posStart - gap * startIndex;
         startIndex = startIndex + 1;
      }
      if (this._btnSiege.node.active) {
         this._btnSiege.node.x = (posStart - gap * startIndex);
         startIndex = startIndex + 1;
      }
      if (this._nodeBossRoot.active) {
         this._nodeBossRoot.x = posStart - gap * startIndex;
         startIndex = startIndex + 1;
      }
   }

   private _showFirstReward() {
      if (!this._firstReward) {
         return;
      }
      this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
         var doubleTimes = 0;
         if (this._chapterInfo.type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            doubleTimes = G_UserData.getReturnData().getPrivilegeRestTimes(ReturnConst.PRIVILEGE_FAMOUS_CHAPTER);
         }
         PopupGetRewards.popupReward(this._firstReward, null, null, null, null, null, doubleTimes > 0);
         this._firstReward = null;
      }.bind(this))));
   }

   public onPanelStoryClick() {
      if (this._isFamousStroyOpen) {
         this._imageFamousStory.active = true;
         this._imageFamousStoryOpen.active = false;
         this._isFamousStroyOpen = false;
      } else {
         this._imageFamousStory.active = false;
         this._imageFamousStoryOpen.active = true;
         this._isFamousStroyOpen = true;
      }
   }

}