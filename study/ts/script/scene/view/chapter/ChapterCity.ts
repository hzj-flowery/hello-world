import ChapterConst from "../../../const/ChapterConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FunctionConst } from "../../../const/FunctionConst";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { SignalConst } from "../../../const/SignalConst";
import { ChapterBaseData } from "../../../data/ChapterBaseData";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import UIGuideRootNode from "../uiguide/UIGuideRootNode";
import ChapterCityDropHeroCell from "./ChapterCityDropHeroCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChapterCity extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _nodeBgEffect: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelCity: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _btnCity: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _starBg: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _starCount: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeStatic: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _numberBG: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _number: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _closeBG: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _closeText: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _panelBoss: cc.Node = null;

    @property({ type: CommonHeroIcon, visible: true })
    _bossIcon: CommonHeroIcon = null;

    @property({ type: cc.Label, visible: true })
    _bossName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _bossCome: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageKill: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageRedPoint: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panelGet: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelGetBackground: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _listItem: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeSword: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _chapterNameBg: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _chapterName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeStatic2: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _chapterCityDropHeroCellPrefab: cc.Prefab = null;

    private _chapterData: ChapterBaseData;
    private _beforeData;
    private _configData;
    private _isBossAlive
    private _isOpen
    private _isFinish
    private _dropPanelSize;
    private _dropHeroData
    private _isNeedRefresh;
    private _swordEffect: cc.Node;
    private _initEffectName
    private _canUse;
    private _effect;
    private _flagSpine: cc.Node;
    private _uiGuideRootNode: UIGuideRootNode;

    private _signalRedPointUpdate;

    constructor() {
        super();
        this._chapterData = null;
        this._beforeData = null;
        this._configData = null;
        this._isBossAlive = false;
        this._isOpen = true;
        this._isFinish = false;
        this._dropPanelSize = null;
        this._dropHeroData = {};
        this._isNeedRefresh = false;
        this._swordEffect = null;
        this._canUse = true;
        this._effect = null;
    }

    public setEffectName(initEffectName: string) {
        this._initEffectName = initEffectName;
    }

    protected onCreate() {
        this._showConditionText(false);
        this._createUIGuideRootNode();

        this._panelBoss.on(cc.Node.EventType.TOUCH_END, handler(this, this._onBossClick));
    }

    public onEnter() {
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
    }

    public onExit() {
        if (this._signalRedPointUpdate) {
            this._signalRedPointUpdate.remove();
            this._signalRedPointUpdate = null;
        }
    }

    public playCityEffect() {
        if (this._initEffectName != null && this._effect == null) {
            this._effect = G_EffectGfxMgr.createPlayMovingGfx(this._panelCity, this._initEffectName);
        }
    }


    public setData(chapterData: ChapterBaseData) {
        this._chapterData = chapterData;
        this._configData = chapterData.getConfigData();
        this.node.name = 'ChapterCity' + this._configData.id;
        this.node.setPosition(this._configData.island_x, this._configData.island_y);
        this._createNode();
        this._use();
    }

    private _createNode() {
        this._uiGuideRootNode.unbindAllUIGuide();
        this._refreshInfo();
        this._refreshHeroGet();
        this._refreshFinishState();
        this._refreshBossInfo();
        this._refreshRedPoint();
        this._refreshLevelLimit();
    }

    public refreshUI() {
        this._refreshFinishState();
        this._refreshBossInfo();
        this._refreshRedPoint();
        this._refreshLevelLimit();
    }

    private _refreshEffect() {
        if (!this._effect) {
            this._effect = G_EffectGfxMgr.createPlayMovingGfx(this._panelCity, this._configData.island_eff, null, null, false);
        }
    }

    private _refreshInfo() {
        this._number.string = this._configData.chapter;
        this._chapterName.string = this._configData.name;

        UIHelper.loadTexture(this._chapterNameBg, Path.getChapterNameIcon(this._configData.title));
        if (this._configData.type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            this._starBg.node.active = false;
            this._numberBG.node.active = false;
        } else {
            this._starBg.node.active = true;
            this._numberBG.node.active = true;
        }
    }

    public _refreshHeroGet() {
        var level = UserDataHelper.getParameter(ParameterIDConst.STAGE_SHOW_HERO);
        if (G_UserData.getBase().getLevel() < level) {
            this._panelGet.active = false;
            return;
        }
        this._dropPanelSize = cc.size(40, 78);
        var dropHeroDatas = this._chapterData.getDropHintDatas();
        if (this._isDropDataSame(this._dropHeroData, dropHeroDatas)) {
            this._panelGet.active = (this._dropHeroData.length > 0);
            return;
        }
        this._dropHeroData = dropHeroDatas;
        this._listItem.removeAllChildren();
        // this._listItem.setContentSize(cc.size(59, 71));
        let sizeWidth: number = 0;
        for (let i = 0; i < dropHeroDatas.length; i++) {
            var data = dropHeroDatas[i];
            var cell = cc.instantiate(this._chapterCityDropHeroCellPrefab).getComponent(ChapterCityDropHeroCell);
            cell.updateUI(data.type, data.value, data.size);
            this._listItem.addChild(cell.node);
            sizeWidth += cell.node.width;
        }

        if (dropHeroDatas.length <= 0) {
            this._panelGet.active = false;
            return;
        }
        this._panelGet.active = true;
        sizeWidth += (this._listItem.childrenCount - 1) * 10;
        // this._listItem.doLayout();
        // var size = this._listItem.getInnerContainer().getContentSize();
        // this._listItem.setContentSize(size);
        this._panelGet.setContentSize(this._dropPanelSize.width + sizeWidth, this._dropPanelSize.height);
        this._panelGetBackground.width = this._panelGet.width;
        this._panelGetBackground.x = this._panelGet.width / 2;
    }

    public _refreshFinishState() {
        let args: any[] = this._chapterData.getChapterFinishState();
        var isFinish = args[0];
        var getStar = args[1];
        var totalStar = args[2];
        this._showFlag(getStar >= totalStar);
        this._starCount.string = '' + (getStar + ('/' + totalStar));
    }

    public canUse() {
        return this._canUse;
    }

    private _use() {
        this._canUse = false;
        this.node.active = true;
        this.playCityEffect();
    }

    public unUse() {
        this._canUse = true;
        this.node.active = false;
        this._chapterData = null;
        this._configData = null;
    }

    public getChapterId() {
        if (this._configData) {
            return this._configData.id;
        }
        return null;
    }

    public goToStage() {
        var success = G_UserData.getBase().getLevel() >= this._configData.need_level;
        if (!success) {
            G_Prompt.showTip(Lang.get('chapter_open_level_condition', { level: this._configData.need_level }));
            return;
        }
        G_SceneManager.showScene('stage', this._chapterData.getId());
    }

    public onButtonChapterClick(sender: cc.Event.EventTouch) {
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            this.goToStage();
        }
    }

    public _createUIGuideRootNode() {
        if (!this._uiGuideRootNode) {
            this._uiGuideRootNode = new cc.Node().addComponent(UIGuideRootNode);
            this.node.addChild(this._uiGuideRootNode.node);
        }
    }

    public _showFlag(visible) {
        if (visible && !this._flagSpine) {
            this._createFlagSpine();
        }
        if (this._flagSpine) {
            this._flagSpine.active = (visible);
        }
    }

    public _createFlagSpine() {
        if (this._flagSpine) {
            this._flagSpine.destroy();
            this._flagSpine = null;
        }
        var node = G_EffectGfxMgr.createPlayMovingGfx(this._nodeStatic2, 'moving_fudaowancheng_qizi', null, null, false);
        this._flagSpine = node.node;
    }

    public _refreshBossInfo() {
        var bossid = this._chapterData.getBossId();
        var bossState = this._chapterData.getBossState();
        if (bossid != 0) {
            var bossData = G_ConfigLoader.getConfig(ConfigNameConst.STORY_ESSENCE_BOSS).get(bossid);
            this._refreshBossPanel(bossData);
            if (bossState == 1) {
                this._imageKill.node.active = true;
            } else {
                this._imageKill.node.active = false;
                this._isBossAlive = true;
            }
        } else {
            this._panelBoss.active = false;
        }
    }

    private _refreshBossPanel(bossData) {
        this._bossName.string = (bossData.name);
        this._bossName.node.color = Colors.getColor(bossData.color);
        UIHelper.enableOutline(this._bossName, Colors.getColorOutline(bossData.color), 2);
        this._bossIcon.updateUI(bossData.res_id);
        this._bossIcon.setQuality(bossData.color);
        this._panelBoss.active = true;
    }

    private _createSwordEft() {
        this._swordEffect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeSword, 'moving_shuangjian', null, null, false).node;
    }

    public showSword(s) {
        var show = G_UserData.getBase().getLevel() >= this._configData.need_level;
        show = (s && show);
        if (this._swordEffect == null && show) {
            this._createSwordEft();
        }
        if (this._swordEffect != null) {
            this._swordEffect.active = show;
        }
    }

    private _isDropDataSame(dropHeroData, newDropHeroData) {
        if (dropHeroData.length != newDropHeroData.length) {
            return false;
        }

        for (let i = 0; i < dropHeroData.length; i++) {
            var v = dropHeroData[i];
            var v2 = newDropHeroData[i];
            if (v.type != v2.type || v.value != v2.value) {
                return false;
            }

        }
        return true;
    }

    private _onBossClick(sender) {
        var offsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var offsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (offsetX < 20 && offsetY < 20) {
            if (this._isBossAlive) {
                G_SceneManager.showScene('stage', this._chapterData.getId(), 0, true);
            }
        }
    }

    private _refreshRedPoint() {
        var redPoint = G_UserData.getChapter().hasRedPointForChapter(this._chapterData.getId());
        this._imageRedPoint.node.active = (redPoint);
        if (redPoint) {
            UIActionHelper.playSkewFloatEffect(this._imageRedPoint.node);
        } else {
            this._imageRedPoint.node.stopAllActions();
        }
    }

    private _onEventRedPointUpdate(event, funcId, param) {
        if (!this.canUse() && funcId == FunctionConst.FUNC_NEW_STAGE) {
            this._refreshRedPoint();
        }
    }

    public startPassAnim() {
        this._nodeStatic2.active = false;
        function eventFunction(event, frameIndex, movingNode) {
            if (event == 'chaqi') {
                let args: any[] = this._chapterData.getChapterFinishState();
                var isFinish = args[0];
                var getStar = args[1];
                var totalStar = args[2];
                if (getStar >= totalStar) {
                    G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_fudao_qiziluoxia', null, null, true);
                }
            } else if (event == 'qizi') {
                this._nodeStatic2.active = true;
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_fudaowancheng', null, eventFunction.bind(this), true);
    }

    public startNewChapterAnim(callback) {
        this._closeUI(false);
        function effectFunction(effect) {
            if (effect == 'smoving_fudao_zhangjiezi') {
                this._starBg.node.active = true;
                if (this._configData.type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
                    this._starBg.node.active = false;
                    this._numberBG.node.active = false;
                }
                this._chapterNameBg.node.active = true;
                G_EffectGfxMgr.applySingleGfx(this._starBg.node, effect, null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._chapterNameBg.node, effect, null, null, null);
            } else if (effect == 'smoving_fudao_jianzhu') {
                this._panelCity.active = true;
                G_EffectGfxMgr.applySingleGfx(this._panelCity, effect, null, null, null);
            }
            return new cc.Node();
        }
        function eventFunction(event, frameIndex, movingNode) {
            if (event == 'shuangjian') {
                this.showSword(true);
            } else if (event == 'finish') {
                this._closeUI(true);
                if (callback) {
                    callback();
                }
            } else if (event == 'yan') {
                G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgEffect, 'moving_fudaokaiqi_yan', null, null, true);
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_fudaokaiqi', effectFunction.bind(this), eventFunction.bind(this), true);
    }

    private _closeUI(visible) {
        this.showSword(visible);
        this._nodeStatic.active = (visible);
        this._starBg.node.active = (visible);
        this._chapterNameBg.node.active = (visible);
        this._panelCity.active = (visible);
        if (this._configData.type == ChapterConst.CHAPTER_TYPE_FAMOUS) {
            this._starBg.node.active = false;
            this._numberBG.node.active = false;
        }
    }

    public getEffectName() {
        return this._initEffectName;
    }

    public _refreshLevelLimit() {
        var show = G_UserData.getBase().getLevel() < this._configData.need_level;
        this._showConditionText(show, Lang.get('chapter_open_level_condition', { level: this._configData.need_level }));
    }

    public _showConditionText(visible, txt?) {
        this._closeBG.node.active = (visible);
        if (visible) {
            this._closeText.string = (txt);
        }
    }
}