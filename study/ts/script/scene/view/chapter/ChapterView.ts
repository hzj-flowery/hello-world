import { AudioConst } from "../../../const/AudioConst";
import ChapterConst from "../../../const/ChapterConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { ChapterData } from "../../../data/ChapterData";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { Colors, G_AudioManager, G_EffectGfxMgr, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { EffectGfxData, EffectGfxType } from "../../../manager/EffectGfxManager";
import CommonNextFunctionOpen from "../../../ui/component/CommonNextFunctionOpen";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { handler } from "../../../utils/handler";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import ChapterBox from "./ChapterBox";
import ChapterCity from "./ChapterCity";
import ChapterGeneralIcon from "./ChapterGeneralIcon";
import ChapterMapCell from "./ChapterMapCell";
import ChapterRunMapNode from "./ChapterRunMapNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChapterView extends ViewBase {

    @property({ type: cc.ScrollView, visible: true })
    _scrollBG: cc.ScrollView = null;

    @property({ type: cc.Node, visible: true })
    _checkType1: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _checkType2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _checkType3: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _chapterBoxParent: cc.Node = null;

    @property({ type: ChapterBox, visible: true })
    _chapterBox: ChapterBox = null;

    @property({ type: CommonNextFunctionOpen, visible: true })
    _nextFunctionOpen: CommonNextFunctionOpen = null;

    @property({ type: cc.Node, visible: true })
    _nodeEliteEffect: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _btnBoss: cc.Button = null;

    @property({ type: cc.Node, visible: true })
    _nodeFamous: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textFamousCount: cc.Label = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;

    private static BG_COUNT = 4;
    private static REFRESH_DIS = 150;
    private static SCREEN_WIDTH_FIX = 250;
    private static TYPE_NORMAL = 1;
    private static TYPE_HIGHLIGHT = 2;
    private static TYPE_DISABLE = 3;
    private static TOTAL_TYPE = 3;
    private static ZORDER_CITY = 2000;
    private static MAP_WIDTH = 1136;

    private _totalWidth: number;
    private _mapChapterCnt: number;
    private _bgType: number;
    private _lastChapterID: number;
    private _maps: ChapterMapCell[];
    private _chapters: any;
    private _generals: ChapterGeneralIcon[];
    private _chapterPool: ChapterCity[];
    private _pageType: number;
    private _needJump: boolean;
    private _lastMapX: number;
    private _isResizeScrollView: boolean;
    private _openState: any;
    private _mapIndex: number;
    private _showPassLevelAnim: boolean;
    private _lastStartPos: number;

    private _showBossEffect;

    private _signalActDailyBoss;
    private _signalChapterInfoGet;
    private _signalCommonZeroNotice;
    private _chapterBoxSignal;
    private _signalRedPointUpdate;

    private chapterData: ChapterData;

    private _chapterCityPrefab: cc.Prefab;
    private _chapterMapCellPrefab: cc.Prefab;
    private _chapterGeneralIcon: cc.Prefab;

    protected preloadResList = [
        { path: Path.getPrefab("ChapterCity", "chapter"), type: cc.Prefab },
        { path: Path.getPrefab("ChapterMapCell", "chapter"), type: cc.Prefab },
        { path: Path.getPrefab("ChapterGeneralIcon", "chapter"), type: cc.Prefab },
        { path: Path.getChapterBG(1), type: cc.SpriteFrame },
        { path: Path.getChapterBG(2), type: cc.SpriteFrame },
        { path: Path.getChapterBG(3), type: cc.SpriteFrame },
        { path: Path.getChapterBG(4), type: cc.SpriteFrame },
    ];

    protected preloadEffectList: EffectGfxData[] = [
        { name: "moving_shuangjian", type: EffectGfxType.MovingGfx }
    ];

    public preloadRes(callBack: Function, params) {
        let chapterData = G_UserData.getChapter();
        var openChapterList = chapterData.getOpenChapter(ChapterConst.CHAPTER_TYPE_NORMAL);

        let loadCount: number = 0;
        for (let i = openChapterList.length - 1; i >= 0; i--) {
            if (loadCount > 3) {
                break;
            }
            this.preloadEffectList.push(
                {
                    name: openChapterList[i].getConfigData().island_eff, type: EffectGfxType.MovingGfx
                });
            loadCount++;
        }

        super.preloadRes(callBack, params);
    }

    protected onCreate() {
        // console.log("chapter create");
        this.setSceneSize();
        this.chapterData = G_UserData.getChapter();

        this._chapterCityPrefab = cc.resources.get(Path.getPrefab("ChapterCity", "chapter"));
        this._chapterMapCellPrefab = cc.resources.get(Path.getPrefab("ChapterMapCell", "chapter"));
        this._chapterGeneralIcon = cc.resources.get(Path.getPrefab("ChapterGeneralIcon", "chapter"));

        this._totalWidth = 0;
        this._mapChapterCnt = 0;
        this._bgType = 0;
        this._lastChapterID = 0;
        this._maps = [];
        this._chapters = {};
        this._generals = [];
        this._chapterPool = [];
        this._pageType = ChapterConst.CHAPTER_TYPE_NORMAL;
        this._signalActDailyBoss = null;
        this._needJump = false;
        this._lastMapX = 0;
        this._isResizeScrollView = false;
        this._openState = {};
        this._openState[ChapterConst.CHAPTER_TYPE_NORMAL] = true;
        this._openState[ChapterConst.CHAPTER_TYPE_ELITE] = false;
        this._openState[ChapterConst.CHAPTER_TYPE_FAMOUS] = false;
        this._mapIndex = 1;
        this._showPassLevelAnim = false;


        this._scrollBG.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._scrollBG.node.x = -G_ResolutionManager.getDesignWidth() / 2;
        this._scrollBG.horizontalScrollBar = null;

        this._chapterBox.node.active = ChapterConst.CHAPTER_TYPE_NORMAL == this._pageType

        this._createCityNode();
        this._createAllMaps();
        if (this._pageType == ChapterConst.CHAPTER_TYPE_NORMAL) {
            this._createNormalMap();
        } else if (this._pageType == ChapterConst.CHAPTER_TYPE_ELITE) {
            this._createEliteMap();
        } else if (this._pageType == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            this._createFamousMap();
        }
    }

    protected onEnter() {
        // TODO
        // G_AudioManager.playMusicWithId(AudioConst.MUSIC_PVE);
        if (this.chapterData.isExpired()) {
            this.chapterData.c2sGetChapterList();
        }
        this._signalActDailyBoss = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_DAILY_BOSS, handler(this, this._onEventDailyBoss));
        this._signalChapterInfoGet = G_SignalManager.add(SignalConst.EVENT_CHAPTER_INFO_GET, handler(this, this._onEventChapterInfoGet));
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(this, this._onEventCommonZeroNotice));
        this._chapterBoxSignal = G_SignalManager.add(SignalConst.EVENT_GET_PERIOD_BOX_AWARD_SUCCESS, handler(this, this._getChapterBoxAward));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._refreshUsedNode();
        this._checkNewChapter();
        this._checkFamousUI();
        this._refreshGeneral();
        this._refreshTypeTitle();
        this._refreshRedPoint();
        if (this._chapterBox) {
            this._chapterBox.updateUI();
        }
        this._nextFunctionOpen.updateUI();
        this._nodeEliteEffect.active = false;

        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        }, 0);
    }

    protected onExit() {
        this._scrollBG.stopAutoScroll();
        this._signalActDailyBoss.remove();
        this._signalActDailyBoss = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._chapterBoxSignal.remove();
        this._chapterBoxSignal = null;
        this._signalChapterInfoGet.remove();
        this._signalChapterInfoGet = null;
        this._signalCommonZeroNotice.remove();
        this._signalCommonZeroNotice = null;
    }

    protected onCleanup() {
    }

    private _createCityNode() {
        var resList = this.chapterData.getResList();
        for (var i = 0; i < resList.length; i++) {
            var chapterNode = cc.instantiate(this._chapterCityPrefab);
            let chapterCity: ChapterCity = chapterNode.getComponent(ChapterCity);
            chapterCity.setEffectName(resList[i]);
            this._scrollBG.content.addChild(chapterNode, ChapterView.ZORDER_CITY + i);
            this._chapterPool.push(chapterCity);
            chapterNode.active = false;
        }
    }

    private _createAllMaps() {
        for (var i = 0; i < ChapterView.BG_COUNT; i++) {
            var mapCellNode = cc.instantiate(this._chapterMapCellPrefab);
            var mapCell: ChapterMapCell = mapCellNode.getComponent(ChapterMapCell);
            mapCell.setMapIndex(i + 1);
            this._scrollBG.content.addChild(mapCellNode);
            mapCellNode.setAnchorPoint(0, 0.5);
            mapCellNode.active = true;
            mapCellNode.setPosition(i * ChapterView.MAP_WIDTH, 0);
            this._maps.push(mapCell);
        }
        this._lastStartPos = 1;
    }

    private _checkFamousUI() {
        if (this._pageType == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            var count = this.chapterData.getFamousLeftCount();
            this._textFamousCount.string = count.toString();
        }
    }

    private _onEventChapterInfoGet(event) {
        this._refreshUsedNode();
        this._checkChapterBoss();
    }

    private _onEventCommonZeroNotice(event, hour) {
        this.chapterData.pullData();
    }

    private _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_NEW_STAGE) {
            this._refreshRedPoint();
        }
    }

    private _getChapterBoxAward(event, awards) {
        if (awards) {
            PopupGetRewards.showRewards(awards);
        }
        if (this._chapterBox) {
            this._chapterBox.updateUI();
        }
        this._refreshRedPoint();
    }

    private _refreshRedPoint() {
        for (var type = 1; type <= ChapterView.TOTAL_TYPE; type++) {
            var redPoint = false;
            if (type == ChapterConst.CHAPTER_TYPE_ELITE) {
                redPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_ELITE_CHAPTER);
            } else {
                redPoint = this.chapterData.hasRedPointForExplore(type);
            }
            (this['_checkType' + type] as cc.Node).getChildByName('_imageRedPoint').active = (redPoint);
        }
    }

    private _refreshTypeTitle() {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_ELITE_CHAPTER)[0];
        if (isOpen) {
            this._openState[ChapterConst.CHAPTER_TYPE_ELITE] = true;
        }
        isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_FAMOUS_CHAPTER)[0];
        if (isOpen) {
            this._openState[ChapterConst.CHAPTER_TYPE_FAMOUS] = true;
        }
        for (var type = 1; type <= ChapterView.TOTAL_TYPE; type++) {
            if (!this._openState[type]) {
                this._refreshSelectType(type, false, true);

            } else {
                this._refreshSelectType(type, this._pageType == type, false);
            }
        }
        this._topbarBase.setTitle(Lang.get('chapter_type')[this._pageType - 1]);
    }

    private _refreshSelectType(type: number, isSelect: boolean, isLock: boolean, ) {
        let checkType: cc.Node = this['_checkType' + type];
        checkType.getChildByName("_imageLock").active = isLock;
        checkType.getChildByName("_imageNormal").active = !isSelect && !isLock;
        checkType.getChildByName("_imageDisable").active = !isSelect && isLock;
        checkType.getChildByName("_imageSelect").active = isSelect && !isLock;
        let textType: cc.Label = checkType.getChildByName("_textType").getComponent(cc.Label);
        let colorType: number = isSelect ? ChapterView.TYPE_HIGHLIGHT :
            (isLock ? ChapterView.TYPE_DISABLE : ChapterView.TYPE_NORMAL);
        textType.node.color = Colors.getChapterTypeColor(colorType);
        UIHelper.enableOutline(textType, Colors.getChapterTypeOutline(colorType), 2);
        textType.fontSize = 26;
    }

    private _clearMap() {

        for (let i = 0; i < this._chapterPool.length; i++) {
            var v = this._chapterPool[i];
            v.unUse();
        }
        this._totalWidth = 0;
        this._mapChapterCnt = 0;
        this._bgType = 0;
        this._lastChapterID = 0;
        this._chapters = {};
        this._mapIndex = 1;
        this._lastMapX = 0;
        this._scrollBG.content.x = 0;
    }

    private _refreshMap() {
        var openChapterList = this.chapterData.getOpenChapter(this._pageType);
        var lastChapter = openChapterList[openChapterList.length - 1];
        this._mapChapterCnt = openChapterList.length;
        var lastX = lastChapter.getConfigData().island_x;
        this._lastChapterID = lastChapter.getId();
        this._resizeScrollView(lastX);
        if (this._needJump) {
            // this._scrollBG.scrollToPercentHorizontal(100);
            this._refreshChapterPool();
            // this._refreshCityNode();
            this._jumpMap(lastX);
            this._needJump = false;
        }
        this._refreshCityNode();
    }

    private _refreshUsedNode() {
        var openChapterList = this.chapterData.getOpenChapter(this._pageType);
        var lastChapter = openChapterList[openChapterList.length - 1];
        for (let i = 0; i < this._chapterPool.length; i++) {
            var v = this._chapterPool[i];
            if (!v.canUse()) {
                v.refreshUI();
                if (v.getChapterId() == lastChapter.getId()) {
                    v.showSword(true);
                } else {
                    v.showSword(false);
                }
            }
        }
    }

    private _checkNewChapter() {
        var newChapter = false;
        var openChapterList = this.chapterData.getOpenChapter(this._pageType);
        if (this._lastChapterID != openChapterList[openChapterList.length - 1].getId()) {
            var curConfig = openChapterList[openChapterList.length - 1].getConfigData();
            var curChapterIcon = this._getChapterNode(curConfig);
            if (curChapterIcon) {
                curChapterIcon.setData(openChapterList[openChapterList.length - 1]);
                newChapter = true;
                this._lastMapX = 0;
                this._lastChapterID = openChapterList[openChapterList.length - 1].getId();
            }
        }
        if (newChapter) {
            var lastChapter = openChapterList[openChapterList.length - 1];
            var beforeChapter = openChapterList[openChapterList.length - 2];
            var lastX = lastChapter.getConfigData().island_x;
            this._resizeScrollView(lastX);
            this._jumpMap(lastX);
            var beforeNode = this._getChapterNodeById(beforeChapter.getId());
            var node = this._getChapterNodeById(lastChapter.getId());
            if (beforeNode && node) {
                this.startRumMapAnim(beforeNode, node);
            }
        }
    }

    private _isInView(cityPosX) {
        var posX = -this._scrollBG.content.position.x;
        let diffPosX: number = cityPosX - posX;
        // console.log("_isInView:", posX, cityPosX, diffPosX);
        if (diffPosX > -ChapterView.SCREEN_WIDTH_FIX && diffPosX < (G_ResolutionManager.getDesignWidth() + ChapterView.SCREEN_WIDTH_FIX)) {
            return true;
        }
        return false;
    }

    private _refreshChapterPool() {
        for (let i = 0; i < this._chapterPool.length; i++) {
            var v = this._chapterPool[i];
            var positionX = v.node.position.x;
            if (!v.canUse() && !this._isInView(positionX)) {
                v.unUse();
            }
        }
    }

    private _getChapterNode(chapterConfig): ChapterCity {
        var effectName = chapterConfig.island_eff;
        for (let i = 0; i < this._chapterPool.length; i++) {
            var v = this._chapterPool[i];
            if (v.canUse() && v.getEffectName() == effectName) {
                return v;
            }
        }

        var chapterNode = cc.instantiate(this._chapterCityPrefab);
        let chapterCity = chapterNode.getComponent(ChapterCity);
        chapterCity.setEffectName(effectName);
        this._scrollBG.content.addChild(chapterNode, ChapterView.ZORDER_CITY);
        this._chapterPool.push(chapterCity);
        chapterNode.active = false;

        return chapterCity;
    }

    private _getChapterNodeById(chapterId): ChapterCity {
        for (let i = 0; i < this._chapterPool.length; i++) {
            var v = this._chapterPool[i];
            if (!v.canUse() && v.getChapterId() == chapterId) {
                return v;
            }
        }
    }

    private _refreshCityNode() {
        var openChapterList = this.chapterData.getOpenChapter(this._pageType);
        var lastChapter = openChapterList[openChapterList.length - 1];

        for (let i = 0; i < openChapterList.length; i++) {
            var data = openChapterList[i];
            if (this._isInView(data.getConfigData().island_x) && !this._isChapterInMap(data.getId())) {
                var chapterIcon = this._getChapterNode(data.getConfigData());
                if (chapterIcon) {
                    chapterIcon.setData(data);
                    if (data.getId() == lastChapter.getId()) {
                        chapterIcon.showSword(true);
                    } else {
                        chapterIcon.showSword(false);
                    }
                }
            }
        }
    }

    private _isChapterInMap(chapterId) {
        for (let i = 0; i < this._chapterPool.length; i++) {
            var v = this._chapterPool[i];
            if (v.getChapterId() == chapterId) {
                return true;
            }
        }
        return false;
    }

    public moveLayerTouch(sender: cc.ScrollView, event) {
        if (event == cc.ScrollView.EventType.SCROLLING) {
            var pos = sender.content.position;
            if (Math.abs(pos.x - this._lastMapX) > ChapterView.REFRESH_DIS) {
                this._refreshChapterPool();
                this._refreshCityNode();
                this._lastMapX = pos.x;
            }
            this._updateMap(pos.x);
        }
    }

    private _createNormalMap() {
        this._clearMap();
        this._needJump = true;
        this._refreshMap();
        this._nodeFamous.active = false;
        this._showGeneral(false);
        this._hideEliteBoss();
    }

    private _createEliteMap() {
        this._clearMap();
        this._needJump = true;
        this._refreshMap();
        this._nodeFamous.active = false;
        this._showGeneral(false);
        this._checkChapterBoss();
    }

    private _createFamousMap() {
        this._clearMap();
        this._needJump = true;
        this._refreshMap();
        this._nodeFamous.active = true;
        this._checkFamousUI();
        this._refreshGeneral();
        this._hideEliteBoss();
    }

    private _jumpMap(lastX) {
        var moveX = -lastX + G_ResolutionManager.getDesignWidth() * 0.5;
        if (moveX > 0) {
            moveX = 0;
        }
        var containerSize = this._scrollBG.content.getContentSize();
        var minX = containerSize.width - G_ResolutionManager.getDesignWidth();
        moveX = Math.max(moveX, -minX);
        // this._scrollBG.scrollToRight(0, false);
        this._scrollBG.content.x = -(minX);
        this._updateMap(moveX);
    }

    private _resizeScrollView(iconPosX) {
        var newW = iconPosX + G_ResolutionManager.getDesignWidth() * 0.5;
        newW = Math.max(newW, G_ResolutionManager.getDesignWidth());
        this._scrollBG.content.setContentSize(newW, G_ResolutionManager.getDesignHeight());
    }

    private reOrderMaps() {
        for (let i = 0; i < this._maps.length; i++) {
            var v = this._maps[i];
            v.node.zIndex = this._maps.length - i;
        }
    }

    private _onEventDailyBoss(eventName, ret) {
        this._refreshUsedNode();
        this._checkChapterBoss();
    }

    public onBossClick() {
        var bossChapters = this.chapterData.getBossChapters();
        if (bossChapters.length != 0) {
            G_SceneManager.openPopup('prefab/chapter/PopupBossCome', (popup) => {
                popup.init(bossChapters);
                popup.open();
            });
        }
    }

    private _checkChapterBoss() {
        if (this._pageType != ChapterConst.CHAPTER_TYPE_ELITE) {
            this._hideEliteBoss();
            return;
        }
        var bossChapters = this.chapterData.getBossChapters();
        var hasAliveBoss = false;

        for (let i = 0; i < bossChapters.length; i++) {
            var v = bossChapters[i];
            if (v.getBossState() == 0) {
                hasAliveBoss = true;
                break;
            }
        }

        if (hasAliveBoss) {
            if (this.chapterData.isShowBossPage()) {
                this.chapterData.setShowBossPage(false);
                this._playEliteBossEnter();
            } else {
                this._playEliteBoss();
            }
        } else {
            this._hideEliteBoss();
        }
    }

    private _onReturnClick() {
        // G_SceneManager.popScene();
    }

    public onTypeClick(sender) {
        var changeType = 0;
        for (var type = 1; type <= ChapterView.TOTAL_TYPE; type++) {
            if (sender.target.name == this['_checkType' + type].name) {
                changeType = type;
                break;
            }
        }
        if (this._openState[changeType] && this._pageType != changeType) {
            this._pageType = changeType;
            if (this._pageType == ChapterConst.CHAPTER_TYPE_NORMAL) {
                this._createNormalMap();
            } else if (this._pageType == ChapterConst.CHAPTER_TYPE_ELITE) {
                this._createEliteMap();
            } else if (this._pageType == ChapterConst.CHAPTER_TYPE_FAMOUS) {
                this._createFamousMap();
            }
            if (this._chapterBox) {
                this._chapterBox.setChapterBoxVisible(this._pageType == ChapterConst.CHAPTER_TYPE_NORMAL);
            }
        }
        this._refreshTypeTitle();
    }

    private startRumMapAnim(chapterBefore: ChapterCity, chapterAfter: ChapterCity) {
        this._panelTouch.active = true;
        chapterBefore.startPassAnim();
        chapterAfter.startNewChapterAnim(handler(this, this.onRunMapAnimComplete));
        G_AudioManager.playSoundWithId(AudioConst.SOUND_ISLANG_OPEN);
        var posX1 = chapterBefore.node.x;
        var posY1 = chapterBefore.node.y;
        var posX2 = chapterAfter.node.x;
        var posY2 = chapterAfter.node.y;
        posY1 = posY1 + 150 - 45;
        posY2 = posY2 + 150 - 45;
        var offset_x = 130;
        var offset_y = offset_x * (posY2 - posY1) / (posX2 - posX1);
        var chapterRunMap = new cc.Node().addComponent(ChapterRunMapNode);
        this._scrollBG.content.addChild(chapterRunMap.node, ChapterView.ZORDER_CITY);
        chapterRunMap.run(cc.v2(posX1 + offset_x, posY1 + offset_y), cc.v2(posX2, posY2));
    }

    public isPlayingPassLevelAnim() {
        return this._showPassLevelAnim;
    }

    private onRunMapAnimComplete() {
        this._showPassLevelAnim = false;
        this._panelTouch.active = false;
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'ChapterView:onRunMapAnimComplete');
    }

    private _playEliteBossEnter() {
        this._nodeEliteEffect.removeAllChildren();
        this._nodeEliteEffect.active = true;
        function eventFunction(event) {
            if (event == 'finish') {
                this._playEliteBoss();
            }
        }
        G_EffectGfxMgr.createPlayGfx(this._nodeEliteEffect, 'effect_jingying_qimataofa', eventFunction.bind(this), true);
    }

    private _playEliteBoss() {
        if (this._showBossEffect) {
            this._nodeEliteEffect.active = true;
            this._btnBoss.node.active = true;
            return;
        }
        this._nodeEliteEffect.active = true;

        this._showBossEffect = G_EffectGfxMgr.createPlayGfx(this._nodeEliteEffect, 'effect_jingying_taofahuo');
        this._btnBoss.node.active = true;
    }

    private _hideEliteBoss() {
        this._nodeEliteEffect.active = false;
        this._btnBoss.node.active = false;
    }

    private _refreshGeneral() {
        if (this._pageType != ChapterConst.CHAPTER_TYPE_FAMOUS) {
            return;
        }
        this._showGeneral(true);
        var generalList = this.chapterData.getOpenGeneralIds();
        for (let i = 0; i < generalList.length; i++) {
            var data = generalList[i];
            var hasCity = false;
            for (let j = 0; j < this._generals.length; j++) {
                let city = this._generals[j];
                if (city.getId() == data.getId()) {
                    city.refresh();
                    hasCity = true;
                    break;
                }

            }

            if (!hasCity) {
                let city = cc.instantiate(this._chapterGeneralIcon).getComponent(ChapterGeneralIcon);
                city.init(data);
                this._scrollBG.content.addChild(city.node, ChapterView.ZORDER_CITY);
                this._generals.push(city);
            }
        }
    }

    private _showGeneral(s) {
        for (let i = 0; i < this._generals.length; i++) {
            var v = this._generals[i];
            v.node.active = (s);
        }
    }

    private _updateMap(posX) {
        var offsetMid = -posX;
        var cellCount = Math.floor(offsetMid / ChapterView.MAP_WIDTH) + 1;

        var midIndex = cellCount % 4;

        this._maps[midIndex].node.x = cellCount * ChapterView.MAP_WIDTH;

        var leftIndex = midIndex - 1;
        leftIndex = leftIndex < 0 ? this._maps.length - 1 : leftIndex;
        this._maps[leftIndex].node.x = (cellCount - 1) * ChapterView.MAP_WIDTH;

        var rightIndex = midIndex + 1;
        rightIndex = rightIndex >= this._maps.length ? 0 : rightIndex;
        this._maps[rightIndex].node.x = (cellCount + 1) * ChapterView.MAP_WIDTH;
    }
}