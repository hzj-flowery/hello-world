const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { StageBaseData } from '../../../data/StageBaseData';
import ViewBase from '../../ViewBase';
import { Colors, G_EffectGfxMgr, G_UserData, G_SignalManager, G_SceneManager, G_TutorialManager } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import { Path } from '../../../utils/Path';
import PopupFamousDetail from './PopupFamousDetail';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import ParameterIDConst from '../../../const/ParameterIDConst';
import ChapterCityDropHeroCell from '../chapter/ChapterCityDropHeroCell';
import UIGuideRootNode from '../uiguide/UIGuideRootNode';
import UIGuideConst from '../../../const/UIGuideConst';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { DropHelper } from '../../../utils/DropHelper';

@ccclass
export default class StageNode extends ViewBase {

    @property({ type: CommonHeroAvatar, visible: true })
    _panelAvatar: CommonHeroAvatar = null;

    @property({ type: cc.Node, visible: true })
    _nodeInfo: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageNameBG: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _stageName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _starPanel3: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _starPanel2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _starPanel1: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeSword: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelGet: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelGetBackground: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _listItem: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _chapterCityDropHeroCellPrefab: cc.Prefab = null;

    private static SCALE = 0.8;
    private static STAR_DELAY = 0.3;
    private static STAR_SCALE = 0.7;
    private static TALK_WIDTH = 300;

    private _isShow: boolean;
    private _enterCallback: any;
    private _starEftCount: number;
    private _starEftFinish: number;
    private _dropPanelSize: cc.Size;
    private _dropHeroData: any[];

    private _stageInfo: any;
    private _stageData: StageBaseData;
    private _callback: any;
    private _isFamous: any;
    private _star: any;
    private _isPass: any;
    private _uiGuideRootNode: UIGuideRootNode

    private _starPanel: cc.Node[];

    constructor() {
        super();

        this._isShow = false;
        this._enterCallback = null;
        this._starEftCount = 0;
        this._starEftFinish = 0;
        this._dropPanelSize = null;
        this._dropHeroData = [];

    }

    public setStageNode(stageData: StageBaseData, callback, isFamous: boolean) {
        this._stageInfo = stageData.getConfigData();
        this._stageData = stageData;

        this._callback = callback;
        this._isFamous = isFamous;

        this._star = this._stageData.getStar();

        if (this._stageData.isIs_finished()) {
            this._isPass = true;
            this._isShow = true;
        } else {
            this._isPass = false;
        }
    }

    getStageId() {
        return this._stageInfo.id;
    }

    public onCreate() {
        this.node.name = "stageId_" + this._stageInfo.id;
        this._stageName.string = (this._stageInfo.name);
        this._stageName.node.color = (Colors.getColor(this._stageInfo.color));
        UIHelper.enableOutline(this._stageName, Colors.getColorOutline(this._stageInfo.color), 1);
        var nameWidth = this._stageName.node.getContentSize().width;
        this._imageNameBG.node.setContentSize(nameWidth + 65, 33);
        this._starPanel = [
            this._starPanel1,
            this._starPanel2,
            this._starPanel3
        ];
        this._createUIGuideNode();
        var size = this._panelGet.getContentSize();
        this._dropPanelSize = size;
        this._panelGet.active = (false);

        this._panelAvatar.init();
        this._createHeroSpine();
    }

    public onEnter() {
        if (this._isFamous) {
            for (let i = 0; i < this._starPanel.length; i++) {
                var v = this._starPanel[i];
                v.active = false;
            }
        }
    }

    public onExit() {

    }

    public playEnter(callBack?) {
        this._isShow = true;
        this._enterCallback = callBack;
        this.node.active = this._isShow;
        this._createSwordEft();
        this._nodeInfo.active = false;
        this._nodeSword.active = false;
        this._panelTouch.active = false;
        this._panelAvatar.node.opacity = 0;
        this._panelAvatar.setBubbleVisible(false);
        G_EffectGfxMgr.applySingleGfx(this._panelAvatar.node, 'smoving_guaiwu_jump', handler(this, this._finishAnimCallback), null, null);
        if (G_TutorialManager.isDoingStep() == false) {
            this._uiGuideRootNode.bindUIGuide(UIGuideConst.GUIDE_TYPE_STAGE_ICON, this._stageInfo.id, this._nodeSword);
        }
    }

    private _createUIGuideNode() {
        if (!this._uiGuideRootNode) {
            this._uiGuideRootNode = new cc.Node().addComponent(UIGuideRootNode);
            this.node.addChild(this._uiGuideRootNode.node);
        }
    }

    public isPass() {
        return this._isPass;
    }

    private _finishAnimCallback() {
        this._nodeInfo.active = true;
        this._nodeSword.active = true;
        this._panelTouch.active = true;
        if (G_UserData.getStage().isLastStage(this._stageInfo.id)) {
            this._panelAvatar.turnBubble();
        }
        this._panelAvatar.setBubble(this._stageInfo.talk, null, 2, true, StageNode.TALK_WIDTH);
        if (this._enterCallback) {
            this._enterCallback();
        }
        this._refreshHeroGet();
    }

    public refreshStageNode() {
        if (this._stageData.isIs_finished()) {
            this._uiGuideRootNode.unbindAllUIGuide();
            this._nodeSword.removeAllChildren();
        }
        this.node.active = (this._isShow);
        this._refreshStar();
        if (this._stageData.isIs_finished()) {
            this._panelAvatar.setBubbleVisible(false);
        }
        var height = this._panelAvatar.getHeight();
        this._nodeInfo.y = height * StageNode.SCALE;
        this._refreshHeroGet();
    }

    private _refreshStar() {
        var star = this._stageData.getStar();
        var needEft = false;
        if (star > this._star) {
            needEft = true;
            this._star = star;
        }
        if (needEft) {
            this._setStarCount(0);
            this._playStarEft();
            return;
        }
        this._setStarCount(star);
    }

    private _setStarCount(count) {
        for (let i = 0; i < this._starPanel.length; i++) {
            var v = this._starPanel[i];
            var starNode = v.getChildByName('Star');
            if (i < count) {
                starNode.active = true;
            } else {
                starNode.active = false;
            }
        }
    }

    private _createSwordEft() {
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeSword, 'moving_shuangjian', null, null, false);
    }

    private _createHeroSpine() {
        this._panelAvatar.updateUI(this._stageInfo.res_id);
        this._panelAvatar.setTouchEnabled(false);
        this._panelAvatar.setScale(StageNode.SCALE);
        this._panelAvatar.turnBack();
        this._panelAvatar.moveTalkToTop();
    }

    public onPanelClick(sender) {
        if (this._stageInfo.id >= 100202 && this._stageData.getStar() == 0) {
            this.onFightClick();
        }else {
            this.showStageDetail();
        }
    }

    public onFightClick() {
        var awards = DropHelper.getStageDrop(this._stageInfo);
        var bagFull = UserCheck.checkPackFullByAwards(awards);
        if (bagFull) {
            return;
        }
        var needVit = this._stageInfo.cost;
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit);
        if (!success) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_PAUSE);
        G_SignalManager.dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE);
        G_UserData.getStage().c2sExecuteStage(this._stageInfo.id);
    }


    public showStageDetail() {
        if (this._isFamous) {
            G_SceneManager.openPopup(Path.getPrefab("PopupFamousDetail", "stage"), (popupFamous: PopupFamousDetail) => {
                popupFamous.init(this._stageInfo.id);
                popupFamous.open();
            });
        } else {
            this._callback(this._stageInfo.id);
        }
    }

    public getPanelTouch() {
        return this._panelTouch;
    }

    private _playStarEft() {
        var star = this._stageData.getStar();
        this._starEftCount = star;
        this._starEftFinish = 0;
        for (let i = 0; i < star; i++) {
            var starPanel = this._starPanel[i];
            var delayTime = StageNode.STAR_DELAY * (i);
            this._playSingleStarEft(starPanel, delayTime);
        }
    }

    private _playSingleStarEft(node: cc.Node, delayTimme) {
        function eventFunction(event) {
            if (event == 'finish') {
                this._starEftFinish = this._starEftFinish + 1;
                if (this._starEftFinish >= this._starEftCount) {
                    G_SignalManager.dispatch(SignalConst.EVENT_STAR_EFFECT_END);
                }
            }
        }
        function funcStar() {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_xiaoxingxing', null, eventFunction.bind(this), false);
            var nodeSize = node.getContentSize();
            // effect.node.setPosition(nodeSize.width * 0.5, nodeSize.height * 0.5);
            effect.node.setPosition(0, 0);
            effect.node.setScale(StageNode.STAR_SCALE);
        }
        if (node.active) {
            var action1 = cc.delayTime(delayTimme);
            var action2 = cc.callFunc(function () {
                funcStar.apply(this);
            }.bind(this));
            var action = cc.sequence(action1, action2);
            node.runAction(action);
        }
        else {
            this.scheduleOnce(() => {
                this._starEftFinish = this._starEftFinish + 1;
                if (this._starEftFinish >= this._starEftCount) {
                    G_SignalManager.dispatch(SignalConst.EVENT_STAR_EFFECT_END);
                }
            }, delayTimme);
        }
    }

    private _isDropDataSame(dropHeroData: any[], newDropHeroData: any[]) {
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

    private _refreshHeroGet() {
        if (G_UserData.getBase().getLevel() < UserDataHelper.getParameter(ParameterIDConst.STAGE_SHOW_HERO)) {
            this._panelGet.active = false;
            return;
        }
        var dropHeroDatas = this._stageData.getDropHintDatas();
        if (this._isDropDataSame(this._dropHeroData, dropHeroDatas)) {
            this._panelGet.active = this._dropHeroData.length > 0;
            return;
        }
        this._dropHeroData = dropHeroDatas;
        this._listItem.removeAllChildren();
        let sizeWidth: number = 0;
        for (let i in dropHeroDatas) {
            var data = dropHeroDatas[i];
            var cell = cc.instantiate(this._chapterCityDropHeroCellPrefab).getComponent(ChapterCityDropHeroCell);
            cell.updateUI(data.type, data.value, data.size);
            this._listItem.addChild(cell.node);
            cell.node.x = sizeWidth;
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
}