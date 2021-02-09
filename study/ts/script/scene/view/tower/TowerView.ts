const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_RecoverMgr, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupBoxReward from '../../../ui/popup/PopupBoxReward';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { DropHelper } from '../../../utils/DropHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import TowerAvatarNode from './TowerAvatarNode';
import TowerSweep from './TowerSweep';
import TowerChallenge from './TowerChallenge';
import { UserBaseData } from '../../../data/UserBaseData';

@ccclass
export default class TowerView extends ViewBase {

    @property({ type: cc.Sprite, visible: true })
    _imageBG: cc.Sprite = null;
    @property({ type: CommonTopbarBase, visible: true })
    _topBar: CommonTopbarBase = null;
    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _imageInfoBG: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _textHistoryStar: cc.Label = null;
    @property({ type: cc.Sprite, visible: true })
    _imageHistoryStar: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _textChallengeCount: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textRecoverTitle: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textRecoverTime: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textStar: cc.Label = null;
    @property({ type: cc.Sprite, visible: true })
    _imageHistoryStar_0: cc.Sprite = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnSuperStage: CommonMainMenu = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnShop: CommonMainMenu = null;
    @property({ type: CommonMainMenu, visible: true })
    _btnRank: CommonMainMenu = null;
    @property({ type: CommonHelpBig, visible: true })
    _commonHelpBig: CommonHelpBig = null;
    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnSweep: CommonButtonLevel0Highlight = null;
    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _resetBtn: CommonButtonLevel0Highlight = null;
    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnChallenge: CommonButtonLevel0Highlight = null;
    @property({ type: cc.Node, visible: true })
    _panelBox: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _imageBox: cc.Sprite = null;
    @property({ type: cc.Button, visible: true })
    _btnEvent1: cc.Button = null;
    @property({ type: cc.Button, visible: true })
    _btnEvent2: cc.Button = null;
    @property({ type: cc.Button, visible: true })
    _btnEvent3: cc.Button = null;
    @property({ type: cc.Node, visible: true })
    _heroNode3: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _heroNode2: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _heroNode1: cc.Node = null;
    @property({ type: CommonMiniChat, visible: true })
    _commonChat: CommonMiniChat = null;
    @property({ type: cc.Prefab, visible: true })
    _towerAvatarNodePrefab: cc.Prefab = null;
    @property({ type: cc.Label, visible: true }) _challengeTip1: cc.Label = null;

    private static BOX_STATE_CLOSE = 0
    private static BOX_STATE_OPEN = 1
    private static BOX_STATE_EMPTY = 2
    private static BOX_STATE_NO = 3      //没有宝箱
    private static PAGE_AVATAR_MAX = 3   //一页上有3个人

    private _nodeStages: TowerAvatarNode[] = [];
    private _pageIds: any[] = [];
    private _nowLayer = 0;
    private _nextLayer = 0;
    private _surprises: any[] = [];
    private _lastSurprise: any[] = [];
    private _btnEvents: cc.Button[] = [];
    private _rankClick = false;
    private _boxState;
    private _boxEft: cc.Node;
    private _boxLayer = 0;
    private _signalTowerRank;
    private _signalGetBox;
    private _signalSweep;
    private _signalChallenge;

    private _signalRedPointUpdate;
    private _signalTowerGetInfo;
    private _signalUserLevelUpdate;
    private _signalCommonZeroNotice;

    private _heroNodes: cc.Node[]

    public onCreate() {
        this.setSceneSize();
        this._boxState = TowerView.BOX_STATE_CLOSE;
        this._heroNodes = [this._heroNode1, this._heroNode2, this._heroNode3];

        this._topBar.setImageTitle('txt_sys_com_guoguanzhanjiang');
        this._topBar.updateUI(TopBarStyleConst.STYLE_TOWER);
        this._btnEvents = [
            this._btnEvent1,
            this._btnEvent2,
            this._btnEvent3
        ];
        this._btnShop.updateUI(FunctionConst.FUNC_EQUIP_SHOP);
        this._btnRank.updateUI(FunctionConst.FUNC_TOWER_RANK);
        this._commonHelpBig.updateUI(FunctionConst.FUNC_PVE_TOWER);
        for (let i = 0; i < TowerView.PAGE_AVATAR_MAX; i++) {
            var towerAvatarNode = cc.instantiate(this._towerAvatarNodePrefab).getComponent(TowerAvatarNode);
            towerAvatarNode.init(i);
            this._heroNodes[i].addChild(towerAvatarNode.node);
            this._nodeStages.push(towerAvatarNode);
        }
        this._btnSweep.setString(Lang.get('challenge_tower_sweep'));
        this._btnChallenge.setString(Lang.get('challenge_tower_challenge'));
        this._btnSweep.loadTexture(Path.getUICommon("img_btn_ctrl_large01_nml"), null, null)
        this._btnChallenge.loadTexture(Path.getUICommon("img_btn_ctrl_large02_nml"), null, null)
        var surpriseList = G_UserData.getTowerData().getSurprises();
        for (let i in surpriseList) {
            var v = surpriseList[i];
            this._lastSurprise.push(v.getSurprise_id());
        }
        this._btnSuperStage.updateUI(FunctionConst.FUNC_TOWER_SUPER);

        this._commonChat.setDanmuVisible(false);

        const user_level = G_UserData.getBase().getLevel();
        if (user_level >= 30) {
            this._challengeTip1.node.active = false;
        }
    }

    public onEnter() {
        if (G_UserData.getTowerData().isExpired() == true) {
            G_UserData.getTowerData().c2sGetTower();
        }
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_PVP);
        this._refreshStage();
        this._refreshCount();
        this._refreshBoxState();
        this.schedule(handler(this, this._update), 1);
        this._signalTowerRank = G_SignalManager.add(SignalConst.EVENT_TOWER_RANK, handler(this, this._onEventTowerRank));
        this._signalGetBox = G_SignalManager.add(SignalConst.EVENT_TOWER_GET_BOX, handler(this, this._onEventGetBox));
        this._signalSweep = G_SignalManager.add(SignalConst.EVENT_TOWER_SWEEP, handler(this, this._onEventSweep));
        this._signalChallenge = G_SignalManager.add(SignalConst.EVENT_TOWER_CHALLENGE, handler(this, this._onEventChallenge));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalTowerGetInfo = G_SignalManager.add(SignalConst.EVENT_TOWER_GET_INFO, handler(this, this._onEventTowerGetInfo));
        this._signalUserLevelUpdate = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, handler(this, this._onEventUserLevelUpdate));
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(this, this._onEventCommonZeroNotice));
        var surpriseList = G_UserData.getTowerData().getSurprises();
        this._surprises = [];
        for (let i in surpriseList) {
            var v = surpriseList[i];
            if (!v.isWin()) {
                this._surprises.push(v.getSurprise_id());
            }
        }
        this._checkNewSurprise();
        this.refreshRedPoint();
        var canShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TOWER_SWEEP);
        this._btnSweep.setVisible(canShow);
        var canShow1 = true//LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TOWER_CHALLENGE);
        this._btnChallenge.setVisible(canShow1);
        this._refreshMenuBtns();
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "TowerView");
        }, 0);
    }

    public onExit() {
        this.unschedule(handler(this, this._update))
        this._signalTowerRank.remove();
        this._signalTowerRank = null;
        this._signalGetBox.remove();
        this._signalGetBox = null;
        this._signalSweep.remove();
        this._signalSweep = null;
        this._signalChallenge.remove();
        this._signalChallenge = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalTowerGetInfo.remove();
        this._signalTowerGetInfo = null;
        this._signalUserLevelUpdate.remove();
        this._signalUserLevelUpdate = null;
        this._signalCommonZeroNotice.remove();
        this._signalCommonZeroNotice = null;
    }

    private refreshRedPoint() {
        var red = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'equipShop');
        this._btnShop.showRedPoint(red);
        var redValue02 = RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_SUPER);
        this._btnSuperStage.showRedPoint(redValue02);
        var redValue03 = RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_SWEEP);
        this._btnSweep.showRedPoint(redValue03);
        var redValue04 = false//RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_CHALLENGE);
        this._btnChallenge.showRedPoint(redValue04);
    }

    private _onEventCommonZeroNotice(event, hour) {
        G_UserData.getTowerData().pullData();
    }

    private _onEventTowerGetInfo(event) {
        this._refreshStage();
        this._refreshBoxState();
    }

    private _onEventRedPointUpdate(event, funcId, param) {
        if (!funcId || funcId == FunctionConst.FUNC_SHOP_SCENE || funcId == FunctionConst.FUNC_TOWER_SUPER || funcId == FunctionConst.FUNC_PVE_TOWER) {
            this.refreshRedPoint();
        }
    }

    private _sweepExit() {
        this._refreshStage();
        this._refreshCount();
        this._refreshBoxState();
        var surpriseList = G_UserData.getTowerData().getSurprises();
        this._surprises = [];
        for (let i in surpriseList) {
            var v = surpriseList[i];
            if (!v.isWin()) {
                this._surprises.push(v.getSurprise_id());
            }
        }
        this._checkNewSurprise();
    }

    private _challengeExit() {
        this._refreshStage();
        this._refreshCount();
        this._refreshBoxState();
        var surpriseList = G_UserData.getTowerData().getSurprises();
        this._surprises = [];
        for (let i in surpriseList) {
            var v = surpriseList[i];
            if (!v.isWin()) {
                this._surprises.push(v.getSurprise_id());
            }
        }
        this._checkNewSurprise();
    }

    private _checkNewSurprise() {
        var nowSurprise = G_UserData.getTowerData().getSurprises();
        var lastNewId = null;
        for (let i in nowSurprise) {
            var v = nowSurprise[i];
            var id = v.getSurprise_id();
            var isNew = true;
            for (let j in this._lastSurprise) {
                var vv = this._lastSurprise[j];
                if (vv == id) {
                    isNew = false;
                    break;
                }
            }
            if (isNew) {
                this._lastSurprise.push(id);
                lastNewId = id;
            }
        }
        if (lastNewId) {
            this._openSurprise(lastNewId);
        }
    }

    private _refreshSurprises() {
        for (let i = 0; i < 3; i++) {
            this._btnEvents[i].node.active = (false);
        }
        let EquipBoss = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_BOSS);
        let HeroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
        for (let i in this._surprises) {
            var v = this._surprises[i];
            var heroResId = EquipBoss.get(v).res;
            var icon = HeroRes.get(heroResId).icon;
            var image = Path.getCommonIcon('hero', icon);
            UIHelper.loadTexture(this._btnEvents[i].node.getComponent(cc.Sprite), image);
            this._btnEvents[i].node.active = (true);
        }
    }

    private _update(f) {
        this._refreshCount();
    }

    private _refreshCount() {
        var baseMgr = G_UserData.getBase();
        var towerCount = baseMgr.getResValue(DataConst.RES_TOWER_COUNT);
        this._textChallengeCount.string = (towerCount);
        var TowerData = G_UserData.getTowerData();
        var star = TowerData.getMax_star();
        var nowStar = TowerData.getNow_star();
        this._textHistoryStar.string = (star).toString();
        this._textStar.string = (nowStar).toString();
        var recoverUnit = G_RecoverMgr.getRecoverUnit(3);
        var maxCount = recoverUnit.getMaxLimit();
        var remainTime = recoverUnit.getRemainCount();
        var min = Math.floor(remainTime / 60);
        var second = remainTime % 60;
        var timeString = Lang.get('challenge_tower_remain_min', { count: min }) + Lang.get('challenge_tower_remain_second', { count: second });
        if (min == 0) {
            timeString = Lang.get('challenge_tower_remain_second', { count: second });
        }
        if (maxCount == towerCount) {
            this._textRecoverTitle.node.active = (false);
        } else {
            this._textRecoverTitle.node.active = (true);
            this._textRecoverTime.string = (timeString);
        }
    }

    private _refreshStageNode(idx) {
        var layerId = this._pageIds[idx];
        var layerConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE).get(layerId);
        var layerData = G_UserData.getTowerData().getLayerByIndex(layerId);
        if (idx == 0) {
            this.updateSceneId(layerConfig.map);
        }
        var towerAvatar = this._nodeStages[idx];
        towerAvatar.refresh(layerData, layerConfig, this._nextLayer);
    }

    private _checkLastStageVisible() {
        if (this._nextLayer == this._pageIds[this._pageIds.length - 1]) {
            this._nodeStages[this._nodeStages.length - 1].node.active = (true);
        } else {
            this._nodeStages[this._nodeStages.length - 1].node.active = (false);
        }
    }

    private _refreshStage() {
        var TowerData = G_UserData.getTowerData();
        this._nowLayer = TowerData.getNow_layer();
        this._pageIds = this._getShowPage();
        for (let i in this._pageIds) {
            var v = this._pageIds[i];
            this._refreshStageNode(i);
        }
    }

    private _getShowPage() {
        var group = 0;
        var nowLayerConfig = null;
        let EquipStage = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE);
        if (this._nowLayer != 0) {
            nowLayerConfig = EquipStage.get(this._nowLayer);
            //assert((nowLayerConfig, 'tower id is wrong,' + this._nowLayer);
        }
        if (this._nowLayer == 0) {
            this._nextLayer = EquipStage.indexOf(0).id;
        } else if (nowLayerConfig.box_id != 0 && !G_UserData.getTowerData().getLayerByIndex(this._nowLayer).isReceive_box()) {
            this._nextLayer = this._nowLayer;
        } else {
            this._nextLayer = EquipStage.get(this._nowLayer).next_id;
        }
        if (this._nextLayer == 0) {
            this._nextLayer = nowLayerConfig.id;
        }
        group = EquipStage.get(this._nextLayer).group;
        var layerCount = EquipStage.length();
        var layerIds = [];
        for (let i = 0; i < layerCount; i++) {
            if (EquipStage.indexOf(i).group == group) {
                var layerData = EquipStage.indexOf(i);
                layerIds.push(layerData.id);
            }
        }
        layerIds.sort(function (a, b) {
            return a - b;
        });
        return layerIds;
    }

    public onSweepClick() {
        var [isOpened, errMsg] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TOWER_SWEEP);
        if (isOpened == false) {
            if (errMsg) {
                G_Prompt.showTip(errMsg);
            }
            return;
        }
        if (this._nowLayer != 0) {
            var nowLayerConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE).get(this._nowLayer);
            //assert((nowLayerConfig, 'tower id is wrong,' + this._nowLayer);
            if (nowLayerConfig.box_id != 0 && !G_UserData.getTowerData().getLayerByIndex(this._nowLayer).isReceive_box()) {
                this._nextLayer = this._nowLayer;
                this.onBoxClick();
                return;
            }
        }
        var layerData = G_UserData.getTowerData().getLayerByIndex(this._nextLayer);
        if (!layerData || layerData.getStar() < 3) {
            G_Prompt.showTip(Lang.get('challenge_tower_cannot_sweep'));
        } else {
            G_UserData.getTowerData().sendSweep();
        }
    }
    private sweepForChallenge: boolean = false;
    private sweepForChallengeData: any = [];
    public onChallengeClick() {
        var baseMgr = G_UserData.getBase();
        var towerCount = baseMgr.getResValue(DataConst.RES_TOWER_COUNT);
        if (towerCount <= 0) {
            G_Prompt.showTip('挑战次数不足');
            return;
        }
        if (this._nowLayer != 0) {
            var nowLayerConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE).get(this._nowLayer);
            //assert((nowLayerConfig, 'tower id is wrong,' + this._nowLayer);
            if (nowLayerConfig.box_id != 0 && !G_UserData.getTowerData().getLayerByIndex(this._nowLayer).isReceive_box()) {
                this._nextLayer = this._nowLayer;
                this.onBoxClick();
                return;
            }
        }
        var layerData = G_UserData.getTowerData().getLayerByIndex(this._nextLayer);
        if (!layerData || layerData.getStar() < 3) {
        } else {
            this.sweepForChallenge = true;
            G_UserData.getTowerData().sendSweep();
        }
        G_UserData.getTowerData().sendChallenge();
    }

    private _onEventGetBox(eventName, rewards) {
        this._refreshStage();
        this._refreshBoxState();
        PopupGetRewards.showRewards(rewards);
    }

    private _onEventTowerRank() {
        if (this._rankClick) {
            G_SceneManager.openPopup(Path.getPrefab("PopupTowerRank", "tower"));
        }
        this._rankClick = false;
    }

    private _onEventSweep(eventName, results) {
        if (this.sweepForChallenge) {
            this.sweepForChallengeData = results;
            this.sweepForChallenge = false;
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("TowerSweep", "tower"), (towerSweep: TowerSweep) => {
            towerSweep.init(this._nextLayer, results, handler(this, this._sweepExit));
            towerSweep.openWithAction();
        })
    }

    private _onEventChallenge(eventName, results) {
        var results2 = this.sweepForChallengeData.concat(results);
        this.sweepForChallengeData = [];
        G_SceneManager.openPopup(Path.getPrefab("TowerChallenge", "tower"), (towerChallenge: TowerChallenge) => {
            towerChallenge.init(this._nextLayer, results2, handler(this, this._challengeExit));
            towerChallenge.openWithAction();
        })
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

    public onBoxClick() {
        var [rewards, title, detail] = this._getBoxReward();
        G_SceneManager.openPopup(Path.getPrefab("PopupBoxReward", "common"), (popupBoxReward: PopupBoxReward) => {
            popupBoxReward.init(title, handler(this, this._getBox), true);
            popupBoxReward.updateUI(rewards);
            popupBoxReward.openWithAction();
            if (this._boxState == TowerView.BOX_STATE_CLOSE || this._boxState == TowerView.BOX_STATE_OPEN) {
                popupBoxReward.setBtnText(Lang.get('get_box_reward'));
            } else if (this._boxState == TowerView.BOX_STATE_EMPTY) {
                popupBoxReward.setBtnText(Lang.get('got_star_box'));
                popupBoxReward.setBtnEnable(false);
            }
            popupBoxReward.setDetailText(detail);
        });
    }

    private _getBox() {
        if (this._nowLayer < this._boxLayer) {
            G_Prompt.showTip(Lang.get('challenge_tower_box_cannot_get', { count: this._boxLayer }));
            return;
        }
        G_UserData.getTowerData().openBox(this._boxLayer);
    }

    public onRankClick() {
        this._rankClick = true;
        G_UserData.getTowerRankData().c2sGetTowerStarRank();
    }

    public onShopClick() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_EQUIP_SHOP);
    }

    private _refreshBoxState() {
        this._boxLayer = 0;
        for (let i in this._pageIds) {
            var v = this._pageIds[i];
            var layer = v;
            var layerConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE).get(layer);
            if (layerConfig.box_id != 0) {
                this._boxLayer = layer;
                if (this._boxLayer <= this._nowLayer) {
                    var layerData = G_UserData.getTowerData().getLayerByIndex(layer);
                    if (layerData.isReceive_box()) {
                        this._boxState = TowerView.BOX_STATE_EMPTY;
                    } else {
                        this._boxState = TowerView.BOX_STATE_OPEN;
                    }
                } else {
                    this._boxState = TowerView.BOX_STATE_CLOSE;
                }
                break;
            }
        }
        if (this._boxEft) {
            this._boxEft.destroy();
            this._boxEft = null;
        }
        if (this._boxState == TowerView.BOX_STATE_CLOSE) {
            UIHelper.loadTexture(this._imageBox, Path.getChapterBox('img_mapbox_guan'));
            this._imageBox.node.active = (true);
        } else if (this._boxState == TowerView.BOX_STATE_EMPTY) {
            UIHelper.loadTexture(this._imageBox, Path.getChapterBox('img_mapbox_kong'));
            this._imageBox.node.active = (true);
        } else if (this._boxState == TowerView.BOX_STATE_OPEN) {
            this._imageBox.node.active = (false);
            var effect = G_EffectGfxMgr.createPlayMovingGfx(this._panelBox, 'moving_boxjump', null, null, false);
            var size = this._panelBox.getContentSize();
            effect.node.setPosition(size.width * 0.5, size.height * 0.5);
            this._boxEft = effect.node;
        }
    }

    private _openSurprise(id) {
        // var PopupSurprise = new (require('PopupTowerSurprise'))(id);
        // PopupSurprise.openWithAction();
    }

    public onEventClick(sender: cc.Event) {
        for (let i in this._btnEvents) {
            var v = this._btnEvents[i].node;
            if (v == sender.target) {
                this._openSurprise(this._surprises[i]);
            }
        }
    }

    public onSuperStageClick(sender) {
        G_SceneManager.openPopup(Path.getPrefab("PopupTowerSuperStage", "tower"));
    }

    private _onEventUserLevelUpdate(event, param) {
        this._refreshMenuBtns();
    }

    private _refreshMenuBtns() {
        var visible = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TOWER_SUPER);
        this._btnSuperStage.node.active = (visible);
    }
}