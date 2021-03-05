const { ccclass, property } = cc._decorator;

import { MessageErrorConst } from '../../../const/MessageErrorConst';
import { MessageIDConst } from '../../../const/MessageIDConst';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { SignalConst } from '../../../const/SignalConst';
import { ReportParser } from '../../../fight/report/ReportParser';
import { Colors, G_EffectGfxMgr, G_NetworkManager, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonCountdownAnimation from '../../../ui/component/CommonCountdownAnimation';
import CommonHeroStarBig from '../../../ui/component/CommonHeroStarBig';
import CommonIconTemplate from '../../../ui/component/CommonIconTemplate';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIActionHelper from '../../../utils/UIActionHelper';
import ViewBase from '../../ViewBase';
import { SeasonSportHelper } from '../seasonSport/SeasonSportHelper';
import OtherHeroPickNode from './OtherHeroPickNode';
import OwnHeroPickNode from './OwnHeroPickNode';
import PopupHeroView from './PopupHeroView';
import PopupPetView from './PopupPetView';
import SeasonDanInfoNode from './SeasonDanInfoNode';
import SilkSelectView from './SilkSelectView';

@ccclass
export default class SquadSelectView extends ViewBase {

    @property({ type: cc.Sprite, visible: true })
    _imageHeroOutShade: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeCountAniOwn1: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeCountAniOther1: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeCountAniOwn2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeCountAniOther2: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textWaiting: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textWaitingSecondsOwn: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textWaitingSecondsOther: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textSquadCountTip: cc.Label = null;

    @property({ type: CommonCountdownAnimation, visible: true })
    _countDownAnimation: CommonCountdownAnimation = null;

    @property({ type: cc.Node, visible: true })
    _ownInfoContainer: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _otherInfoContainer: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageMaskOwn: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageMaskOther: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _ownSquadContainer: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _otherSquadContainer: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePetBackGroud: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePet1: cc.Sprite = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodePet1: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAddPet1: cc.Sprite = null;

    @property({ type: CommonHeroStarBig, visible: true })
    _nodeStar1: CommonHeroStarBig = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelectedPet1: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panelPetTouch1: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePet2: cc.Sprite = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodePet2: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAddPet2: cc.Sprite = null;

    @property({ type: CommonHeroStarBig, visible: true })
    _nodeStar2: CommonHeroStarBig = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelectedPet2: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panelPetTouch2: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePet3: cc.Sprite = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodePet3: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAddPet3: cc.Sprite = null;

    @property({ type: CommonHeroStarBig, visible: true })
    _nodeStar3: CommonHeroStarBig = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelectedPet3: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panelPetTouch3: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelPetTouch: cc.Node = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnLock: CommonButtonLevel0Highlight = null;

    @property({ type: cc.Node, visible: true })
    _nodeLockEffect: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelBanPick: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelOwnBan: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeOwnPick1: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeOwnPick2: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeOwnPick3: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeOwnPick4: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnPick1: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnPick2: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnPick3: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnPick4: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panelOtherBan: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeOtherPick1: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeOtherPick2: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeOtherPick3: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeOtherPick4: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherPick1: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherPick2: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherPick3: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOtherPick4: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textSquadDragTip: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _bottomView: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _item1: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textHeroName1: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnSilk1: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected1: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageArrow1: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textSilkName1: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _item2: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textHeroName2: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnSilk2: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected2: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageArrow2: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textSilkName2: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _item3: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textHeroName3: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnSilk3: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected3: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageArrow3: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textSilkName3: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _item4: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textHeroName4: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnSilk4: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected4: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageArrow4: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textSilkName4: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _item5: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textHeroName5: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnSilk5: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected5: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageArrow5: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textSilkName5: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _item6: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textHeroName6: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnSilk6: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected6: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageArrow6: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textSilkName6: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _priorAnimation: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _seasonDanInfoNodePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _ownHeroPickNodePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _otherHeroPickNodePrefab: cc.Prefab = null;

    private _ownDanNode: SeasonDanInfoNode;
    private _otherDanNode: SeasonDanInfoNode;
    private _ownSquadNode: OwnHeroPickNode;
    private _otherSquadNode: OtherHeroPickNode;
    private _popupHeroView: PopupHeroView;
    private _squadAvatarData = [];
    private _seasonPets = [];
    private _bindSilkData = [];
    private _bindPetData = [];
    private _banHeroData = [];
    private _banPetId = 0;
    private _isFightStage = false;
    private _seasonOffLineWait = 0;
    private _curHeroViewTabIndex = 1;
    private _isPopBanPickView = false;
    private _popBanPickIntervel = 0;
    private _isSendBaned = false;
    private _curPetSlot;

    private _signalFightsBanCheck;
    private _signalFightsBanWaiting;
    private _signalHerosPitchSuccess;
    private _signalBindingSilkSucess;
    private _signalForeground;
    private _signalReconnect;
    private _signalFightsOver;
    private _signalFightsFight;
    private _ownSign;
    private _countDownTime;

    public onCreate() {
        this.setSceneSize();
        this._imageHeroOutShade.node.active = false;
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        var isBan = G_UserData.getSeasonSport().isBanPick();
        var show = curRound == 0 && isBan;
        this._panelPetTouch.active = show;
        this._btnLock.setString(Lang.get('season_squad_lock'));
        G_UserData.getSeasonSport().setInSquadSelectView(true);
        this._initBanHeroData();
        this._initBanPetData();
        this._initBindPetData();
        this._initOwnSquadHeroData();
        this._initBindSilkToHeroData();
        this._initSilkBindingData();
        this._initDanInfo();
        this._initSquadInfo();

        this._btnLock.addClickEventListenerEx(handler(this, this._onBtnLock));
    }

    public onEnter() {
        this._signalFightsBanCheck = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_HEROS_BAN, handler(this, this._onEventFightsBanCheck));
        this._signalFightsBanWaiting = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_WAITING_BAN, handler(this, this._onEventFightsBanWaiting));
        this._signalHerosPitchSuccess = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_HEROS_PITCH, handler(this, this._onEventHerosPitchSuccess));
        this._signalBindingSilkSucess = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_BINDINGOK, handler(this, this._onEventBindingSuccess));
        this._signalForeground = G_SignalManager.add(SignalConst.EVENT_MAY_ENTER_FOREGROUND, handler(this, this._onEventForeground));
        this._signalReconnect = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_RECONNECT, handler(this, this._onEventReconnect));
        this._signalFightsOver = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_RECONNECT_OVER, handler(this, this._onEventReconnectWhileOver));
        this._signalFightsFight = G_NetworkManager.add(MessageIDConst.ID_S2C_FightsFight, handler(this, this._s2cFightsFight));
        this._ownSign = G_UserData.getSeasonSport().getPrior();
        this._countDownTime = G_UserData.getSeasonSport().getCurrentRound_EndTime();
        this._seasonPets = G_UserData.getSeasonSport().getSeasonPets();
        this._initPetAdd();
        this._initBaseView();
        this._initBindPetInView();
        this._initSilkGroupName();
        this._updateDanInfo();
        this.schedule(handler(this, this._update), 0.5);
    }

    public onExit() {
        this._signalFightsBanCheck.remove();
        this._signalFightsBanWaiting.remove();
        this._signalHerosPitchSuccess.remove();
        this._signalBindingSilkSucess.remove();
        this._signalForeground.remove();
        this._signalReconnect.remove();
        this._signalFightsOver.remove();
        this._signalFightsFight.remove();
        this._signalFightsBanCheck = null;
        this._signalFightsBanWaiting = null;
        this._signalHerosPitchSuccess = null;
        this._signalBindingSilkSucess = null;
        this._signalForeground = null;
        this._signalReconnect = null;
        this._signalFightsOver = null;
        this._signalFightsFight = null;
        this._nodeCountAniOwn1.stopAllActions();
        this._nodeCountAniOwn2.stopAllActions();
        this._nodeCountAniOther1.stopAllActions();
        this._nodeCountAniOther2.stopAllActions();
        this.unschedule(handler(this, this._update));
        this._initOwnSquadHeroData();
        G_UserData.getSeasonSport().setOwn_SquadInfo(null);
        G_UserData.getSeasonSport().setOther_SquadInfo(null);
        G_UserData.getSeasonSport().setInSquadSelectView(false);
    }

    private _palyProiorAnimation(rootNode, bOwnIsProir, callback) {
        function eventFunction(event) {
            if (event == 'finish') {
                if (callback) {
                    callback();
                }
            }
        }
        var movingFlash = bOwnIsProir && 'moving_wuchabiebuzhen_xianshouleft' || 'moving_wuchabiebuzhen_xianshouright';
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, movingFlash, null, eventFunction, false);
    }

    private _initSquadTime() {
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        if (curRound == SeasonSportHelper.getMaxFightStage()) {
            return;
        }
        var ownDanInfo = G_UserData.getSeasonSport().getOwn_DanInfo();
        var otherDanInfo = G_UserData.getSeasonSport().getOther_DanInfo();
        var bBanPick = G_UserData.getSeasonSport().isBanPick();
        if (bBanPick) {
            this._nodeCountAniOwn1.active = true;
            this._nodeCountAniOther1.active = true;
            this._nodeCountAniOwn2.active = true;
            this._nodeCountAniOther2.active = true;
            this._nodeCountAniOwn2.removeAllChildren();
            this._nodeCountAniOther2.removeAllChildren();
            this._palyOwnAnimation(this._nodeCountAniOwn2, 2);
            this._palyOtherAnimation(this._nodeCountAniOther2, 2);
        } else {
            var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
            this._nodeCountAniOwn1.active = (this._ownSign == parseInt(stageInfo.first));
            this._nodeCountAniOther1.active = (!(this._ownSign == parseInt(stageInfo.first)));
            if (this._ownSign == parseInt(stageInfo.first)) {
                this._nodeCountAniOwn1.removeAllChildren();
                this._palyOwnAnimation(this._nodeCountAniOwn1, 1, handler(this, this._updateSquadTime));
            } else {
                this._nodeCountAniOther1.removeAllChildren();
                this._palyOtherAnimation(this._nodeCountAniOther1, 1, handler(this, this._updateSquadTime));
            }
        }
    }

    private _updateSquadTime(dt?) {
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        if (curRound == SeasonSportHelper.getMaxFightStage()) {
            return;
        }
        var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
        this._nodeCountAniOwn2.active = (this._ownSign == parseInt(stageInfo.first));
        this._nodeCountAniOther2.active = (!(this._ownSign == parseInt(stageInfo.first)));
        if (this._ownSign == parseInt(stageInfo.first)) {
            this._nodeCountAniOwn2.removeAllChildren();
            this._palyOwnAnimation(this._nodeCountAniOwn2, 2);
        } else {
            this._nodeCountAniOther2.removeAllChildren();
            this._palyOtherAnimation(this._nodeCountAniOther2, 2);
        }
    }

    private _palyOwnAnimation(rootNode, state, callback?) {
        function eventFunction(event) {
            if (event == 'finish') {
                if (state == 1 && callback) {
                    callback();
                }
            }
        }
        var movingFlash = state == 1 && 'moving_wuchabiebuzhen_blue1' || 'moving_wuchabiebuzhen_blue2';
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, movingFlash, null, eventFunction, false);
    }

    private _palyOtherAnimation(rootNode, state, callback?) {
        function eventFunction(event) {
            if (event == 'finish') {
                if (state == 1 && callback) {
                    callback();
                }
            }
        }
        var movingFlash = state == 1 && 'moving_wuchabiebuzhen_red1' || 'moving_wuchabiebuzhen_red2';
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, movingFlash, null, eventFunction, false);
    }

    private _popBanPickView() {
        var onSelectTab = function (index) {
            this._curHeroViewTabIndex = index;
        }.bind(this);
        var onCloseCallback = function () {
            this._popupHeroView = null;
            this._panelPetTouch.active = false;
        }.bind(this);
        if (G_UserData.getSeasonSport().getCurrentRound() == 0 && this._popupHeroView == null) {
            G_SceneManager.openPopup(Path.getPrefab("PopupHeroView", "seasonCompetitive"), (popup: PopupHeroView) => {
                this._popupHeroView = popup;
                this._popupHeroView.init(true, this._curHeroViewTabIndex, onSelectTab, handler(this, this._onBanPick));
                this._popupHeroView.setSyncBanHeroData(this._banHeroData);
                this._popupHeroView.setSyncBanPetData(this._banPetId);
                this._popupHeroView.setCloseCallBack(onCloseCallback);
                this._popupHeroView.openWithAction();
            });
        }
    }

    private _onBanPick(tabIndex, baseId) {
        if (tabIndex == 5) {
            let isExistBanPet = (baseId) => {
                if (this._banPetId == baseId) {
                    this._fileNodeOwnPick4.node.active = true;
                    this._fileNodeOwnPick4.unInitUI();
                    this._imageOwnPick4.node.active = true;
                    this._banPetId = 0;
                    return true;
                }
                return false;
            }
            if (isExistBanPet(baseId)) {
                this._popupHeroView.setSyncBanPetData(this._banPetId);
                return;
            }
            this._imageOwnPick4.node.active = false;
            this._fileNodeOwnPick4.node.active = true;
            this._fileNodeOwnPick4.unInitUI();
            this._fileNodeOwnPick4.initUI(TypeConvertHelper.TYPE_PET, baseId);
            this._fileNodeOwnPick4.setIconMask(true);
            this._fileNodeOwnPick4.removeLightEffect();
            this._banPetId = baseId;
            this._popupHeroView.setSyncBanPetData(this._banPetId);
        } else {
            var maxBanHeroNum = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content);
            let isExistBanHero = (baseId) => {
                for (let index = 1; index <= maxBanHeroNum; index++) {
                    if (this._banHeroData[index - 1].heroId == baseId) {
                        let fileNodeOwnPick: CommonIconTemplate = this['_fileNodeOwnPick' + index]
                        fileNodeOwnPick.node.active = true;
                        fileNodeOwnPick.unInitUI();
                        this['_imageOwnPick' + index].node.active = true;
                        this._banHeroData[index - 1].heroId = 0;
                        return true;
                    }
                }
                return false;
            }
            var bExistBanHero = isExistBanHero(baseId);
            if (bExistBanHero) {
                this._popupHeroView.setSyncBanHeroData(this._banHeroData);
                return;
            }
            for (var index = 1; index <= maxBanHeroNum; index++) {
                if (this._banHeroData[index - 1] && this._banHeroData[index - 1].heroId == 0) {
                    this['_imageOwnPick' + index].node.active = false;
                    this['_fileNodeOwnPick' + index].node.active = true;
                    this['_fileNodeOwnPick' + index].unInitUI();
                    this['_fileNodeOwnPick' + index].initUI(TypeConvertHelper.TYPE_HERO, baseId);
                    this['_fileNodeOwnPick' + index].setIconMask(true);
                    this._banHeroData[index - 1].heroId = baseId;
                    this._popupHeroView.setSyncBanHeroData(this._banHeroData);
                    if (SeasonSportHelper.checkSeasonRedHero(baseId)) {
                        var iconBg = Path.getUICommon('frame/img_frame_06');
                        this['_fileNodeOwnPick' + index].loadColorBg(iconBg);
                    }
                    break;
                }
            }
        }
    }

    private _initBanHeroData() {
        var maxBanHeroNum = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content);
        for (var index = 1; index <= maxBanHeroNum; index++) {
            if (!this._banHeroData[index - 1]) {
                this._banHeroData[index - 1] = {};
                this._banHeroData[index - 1].heroId = 0;
                this['_fileNodeOwnPick' + index].node.active = true;
            }
        }
    }

    private _initBanPetData() {
        this._banPetId = 0;
        this._fileNodeOwnPick4.node.active = true;
    }

    private _banFinishMoveAnimation() {
        var moveAction = cc.moveTo(0.1, SeasonSportConst.SEASON_BANHERO_PICKED);
        var callAction = cc.callFunc(() => {
            this._panelOtherBan.active = true;
        });
        var action = cc.sequence(cc.delayTime(0.05), moveAction, callAction);
        this._panelOwnBan.runAction(action);
    }

    private _onEventFightsBanWaiting(id, message) {
        this._textSquadCountTip.string = Lang.get('season_waitingbanpick_forbithero');
    }

    private _onEventReconnect(id, message) {
        if (G_UserData.getSeasonSport().getCurrentRound() <= 1) {
            this._updateReconnectBanPets();
            this._updateReconnectBanHeros();
        }
        this._updateReconnectSquad();
    }

    private _onEventReconnectWhileOver(id, message) {
        G_UserData.getSeasonSport().c2sFightsEntrance();
        G_SceneManager.popScene();
        if (G_UserData.getSeasonSport().isSquadReconnect()) {
            G_SceneManager.showScene('seasonSport');
        }
    }

    private _onEventForeground() {
        G_UserData.getSeasonSport().c2sFightsReconnection();
    }

    private _banCheckPets(banPets) {
        for (let i = 1; i <= banPets.length; i++) {
            var v = banPets[i - 1];
            if (i == 1) {
                if (banPets[i - 1] > 0) {
                    this._imageOwnPick4.node.active = false;
                    this._fileNodeOwnPick4.node.active = true;
                    this._fileNodeOwnPick4.unInitUI();
                    this._fileNodeOwnPick4.initUI(TypeConvertHelper.TYPE_PET, banPets[i - 1]);
                    this._fileNodeOwnPick4.setIconMask(true);
                    this._fileNodeOwnPick4.removeLightEffect();
                    this._banPetId = banPets[0];
                } else {
                    this._banPetId = 0;
                    this._fileNodeOwnPick4.unInitUI();
                    this._imageOwnPick4.node.active = true;
                }
            } else if (i == 2) {
                if (banPets[i - 1] > 0) {
                    this._imageOtherPick4.node.active = false;
                    this._fileNodeOtherPick4.node.active = true;
                    this._fileNodeOtherPick4.unInitUI();
                    this._fileNodeOtherPick4.initUI(TypeConvertHelper.TYPE_PET, banPets[i - 1]);
                    this._fileNodeOtherPick4.setIconMask(true);
                    this._fileNodeOtherPick4.removeLightEffect();
                } else {
                    this._fileNodeOtherPick4.unInitUI();
                    this._imageOtherPick4.node.active = true;
                }
            }
        }
    }

    private _onEventFightsBanCheck(id, message) {
        if (message == null) {
            return;
        }
        this._panelBanPick.active = true;
        this._panelOwnBan.active = true;
        var banPets: any[] = message.pets || [];
        this._banCheckPets(banPets);
        this._updateBindPetInView();
        var otherBanHero: any[] = message.units;
        if (otherBanHero != null && (otherBanHero).length > 0) {
            var maxBanHeroNum = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content);
            for (var index = 1; index <= otherBanHero.length; index++) {
                if (index <= maxBanHeroNum) {
                    if (otherBanHero[index - 1] != null && otherBanHero[index - 1] > 0) {
                        this['_imageOwnPick' + index].node.active = false;
                        this['_fileNodeOwnPick' + index].node.active = true;
                        this['_fileNodeOwnPick' + index].unInitUI();
                        this['_fileNodeOwnPick' + index].initUI(TypeConvertHelper.TYPE_HERO, otherBanHero[index - 1]);
                        this['_fileNodeOwnPick' + index].setIconMask(true);
                        if (SeasonSportHelper.checkSeasonRedHero(otherBanHero[index - 1])) {
                            var iconBg = Path.getUICommon('frame/img_frame_06');
                            this['_fileNodeOwnPick' + index].loadColorBg(iconBg);
                        }
                    } else {
                        if (otherBanHero[index - 1] == 0) {
                            this['_fileNodeOwnPick' + index].unInitUI();
                            this['_imageOwnPick' + index].node.active = true;
                        }
                    }
                } else {
                    var idx = index - maxBanHeroNum;
                    if (otherBanHero[index - 1] != null && otherBanHero[index - 1] > 0) {
                        this['_imageOtherPick' + idx].node.active = false;
                        this['_fileNodeOtherPick' + idx].node.active = true;
                        this['_fileNodeOtherPick' + idx].unInitUI();
                        this['_fileNodeOtherPick' + idx].initUI(TypeConvertHelper.TYPE_HERO, otherBanHero[index - 1]);
                        this['_fileNodeOtherPick' + idx].setIconMask(true);
                        if (SeasonSportHelper.checkSeasonRedHero(otherBanHero[index - 1])) {
                            var iconBg = Path.getUICommon('frame/img_frame_06');
                            this['_fileNodeOtherPick' + idx].loadColorBg(iconBg);
                        }
                    } else {
                        if (otherBanHero[index - 1] == 0) {
                            this['_fileNodeOtherPick' + idx].unInitUI();
                            this['_imageOtherPick' + idx].active = true;
                        }
                    }
                }
            }
        }
        this._banFinishMoveAnimation();
        this._countDownTime = message.round_end_time;
        var stageInfo = SeasonSportHelper.getSquadStageInfo(1);
        if (this._ownSign == parseInt(stageInfo.first)) {
            this._textSquadCountTip.string = Lang.get('season_tip_squadheros', { num: parseInt(stageInfo.number) });
        } else {
            this._textSquadCountTip.string = Lang.get('season_tip_othersquadheros');
        }
        this._updateSquadTime();
        this._textSquadDragTip.string = Lang.get('season_tip_squadnormal');
        this._textSquadDragTip.node.active = (this._ownSign == parseInt(stageInfo.first));
        this._imageMaskOwn.node.active = (!(this._ownSign == parseInt(stageInfo.first)));
        this._imageMaskOther.node.active = (this._ownSign == parseInt(stageInfo.first));
        this._textWaitingSecondsOwn.node.active = (this._ownSign == parseInt(stageInfo.first));
        this._textWaitingSecondsOther.node.active = (!(this._ownSign == parseInt(stageInfo.first)));
        this._updateLockVisible(this._ownSign == parseInt(stageInfo.first));
        this._ownSquadNode.switchAddVisible(!(this._ownSign == parseInt(stageInfo.first)));
    }

    private _sendBanedHero() {
        var banData: any[] = [];
        var maxBanHeroNum = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content);
        for (var index = 1; index <= maxBanHeroNum; index++) {
            if (this._banHeroData[index - 1]) {
                banData.push(this._banHeroData[index - 1].heroId);
            }
        }
        var pets: any[] = [];
        pets.push(this._banPetId);
        G_UserData.getSeasonSport().c2sFightsBan(banData, pets);
    }

    public selectItem(sender: cc.Event.EventTouch) {
        var index = parseInt((sender.target.name as string).replace("_btnSilk", ""));
        if (index <= 0 || index > 6) {
            return;
        }
        for (var slot = 1; slot <= 6; slot++) {
            if (slot == index) {
                if (this['_imageSelected' + index].node.active == false) {
                    var dstPos = SeasonSportConst.SEASON_SILK_BINDPOS[index - 1];
                    G_SceneManager.openPopup(Path.getPrefab("SilkSelectView", "seasonCompetitive"), (silkSelectView: SilkSelectView) => {
                        silkSelectView.init(index, dstPos, handler(this, this._onClickSilkSelect));
                        silkSelectView.open();
                    });
                }
                (this['_imageArrow' + slot].node as cc.Node).angle = this['_imageSelected' + index].node.active ? 0 : 180;
                this['_imageSelected' + slot].node.active = !this['_imageSelected' + index].node.active;
            } else {
                (this['_imageArrow' + slot].node as cc.Node).angle = 0;
                this['_imageSelected' + slot].node.active = false;
            }
        }
    }

    private _onClosePetView() {
        this['_imageSelectedPet' + this._curPetSlot].node.active = false;
    }

    private _onPickPet(baseId) {
        if (this._curPetSlot <= 0 || this._curPetSlot > 3) {
            return;
        }
        let isExistAdded = (baseId) => {
            for (var index = 1; index <= this._bindPetData.length; index++) {
                if (this._bindPetData[index - 1].petId == baseId) {
                    if (this._curPetSlot == index) {
                        return [
                            true,
                            true
                        ];
                    } else {
                        return [
                            true,
                            false
                        ];
                    }
                }
            }
            return [
                false,
                false
            ];
        }
        var [bExistPet, bSameSlot] = isExistAdded(baseId);
        if (bExistPet && !bSameSlot) {
            return;
        }
        for (var index = 1; index <= this._bindPetData.length; index++) {
            if (this._bindPetData[index - 1].petId == baseId) {
                if (this._curPetSlot == index) {
                    this['_fileNodePet' + this._curPetSlot].unInitUI();
                    this['_nodeStar' + this._curPetSlot].node.active = false;
                    this['_imageAddPet' + this._curPetSlot].node.active = true;
                    this._bindPetData[this._curPetSlot - 1].petId = 0;
                }
                return;
            }
        }
        this['_fileNodePet' + this._curPetSlot].unInitUI();
        this['_fileNodePet' + this._curPetSlot].initUI(TypeConvertHelper.TYPE_PET, baseId);
        this['_fileNodePet' + this._curPetSlot].removeLightEffect();
        this['_fileNodePet' + this._curPetSlot].setTouchEnabled(false);
        this['_nodeStar' + this._curPetSlot].node.active = true;
        this['_imageAddPet' + this._curPetSlot].node.active = false;
        this._bindPetData[this._curPetSlot - 1].petId = baseId;
    }

    public onClickAddPet(sender: cc.Event.EventTouch) {
        this._curPetSlot = parseInt((sender.target.name as string).replace("_panelPetTouch", ""));
        for (var index = 1; index <= this._getPetsMaxCount(); index++) {
            this['_imageSelectedPet' + index].node.active = (this._curPetSlot == index);
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupPetView", "seasonCompetitive"), (popupPetView: PopupPetView) => {
            popupPetView.init(handler(this, this._onPickPet), handler(this, this._onClosePetView));
            popupPetView.setCurPetData(this._curPetSlot, this._bindPetData);
            popupPetView.openWithAction();
        });
    }

    private _initPetAdd() {
        var maxPetCounts = this._getPetsMaxCount();
        for (var index = 1; index <= maxPetCounts; index++) {
            this['_nodeStar' + index].setCount(G_UserData.getSeasonSport().getSeasonPetsStar());
            this['_nodeStar' + index].node.active = false;
            this['_imageSelectedPet' + index].node.active = false;
            var selectedFlash = this['_imageSelectedPet' + index].node.getChildByName('flash_effect' + (index).toString() + 1);
            if (selectedFlash == null) {
                for (var effectIndex = 1; effectIndex <= 2; effectIndex++) {
                    var lightEffect = G_EffectGfxMgr.createPlayGfx(this['_imageSelectedPet' + index].node,
                        SeasonSportConst.SEASON_PET_SELECTEDEFFECT[effectIndex - 1]);
                    lightEffect.node.setAnchorPoint(0, 0);
                    lightEffect.node.name = ('flash_effect' + index.toString() + effectIndex.toString());
                    lightEffect.node.setScale(effectIndex == 1 && 0.62 || 0.6);
                    // this['_imageSelectedPet' + index].node.addChild(lightEffect.node);
                    // lightEffect.node.setPosition(this['_imageSelectedPet' + index].node.getContentSize().width * 0.5 - 2,
                    //     this['_imageSelectedPet' + index].node.getContentSize().height * 0.5);
                    lightEffect.node.setPosition(- 2, 0);
                }
            }
            UIActionHelper.playBlinkEffect(this['_imageAddPet' + index].node);
            this['_panelPetTouch' + index].active = true;
            // this['_panelPetTouch' + index].addClickEventListenerEx(handler(this, this._onClickAddPet));
        }
        this['_imagePet3'].node.active = (maxPetCounts > 2);
        if (maxPetCounts == 2) {
            var oriSize = this._imagePetBackGroud.node.getContentSize();
            var offHeight = oriSize.height - SeasonSportConst.SEASON_PET_OFFSETHEIGHT;
            this._imagePetBackGroud.node.setContentSize(oriSize.width, offHeight);
        }
    }

    private _initBaseView() {
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        if (curRound == SeasonSportHelper.getMaxFightStage()) {
            G_SceneManager.popScene();
            return;
        }
        var ownDanInfo = G_UserData.getSeasonSport().getOwn_DanInfo();
        var otherDanInfo = G_UserData.getSeasonSport().getOther_DanInfo();
        var bBanPick = G_UserData.getSeasonSport().isBanPick();
        this._panelBanPick.active = bBanPick;
        if (bBanPick) {
            this._panelOtherBan.active = false;
            this._textWaiting.node.active = false;
            this._textSquadDragTip.node.active = false;
            this._imageMaskOwn.node.active = false;
            this._imageMaskOther.node.active = false;
            this._textWaitingSecondsOwn.node.active = true;
            this._textWaitingSecondsOther.node.active = true;
            this._ownSquadNode.switchAddVisible(true);
            this._textSquadCountTip.string = Lang.get('season_banpick_forbithero');
            this._updateLockVisible(false);
        } else {
            var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
            this._updateLockVisible(this._ownSign == parseInt(stageInfo.first));
            this._ownSquadNode.switchAddVisible(false);
            if (this._ownSign == parseInt(stageInfo.first)) {
                this._textSquadCountTip.string = Lang.get('season_tip_squadheros', { num: parseInt(stageInfo.number) });
                this._textWaitingSecondsOwn.string = G_ServerTime.getLeftSeconds(this._countDownTime).toString();
            } else {
                this._textSquadCountTip.string = Lang.get('season_tip_othersquadheros');
                this._textWaitingSecondsOther.string = G_ServerTime.getLeftSeconds(this._countDownTime).toString();
            }
            this._textSquadDragTip.string = Lang.get('season_tip_squadnormal');
            this._textSquadDragTip.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._imageMaskOwn.node.active = (!(this._ownSign == parseInt(stageInfo.first)));
            this._imageMaskOther.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._textWaitingSecondsOwn.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._textWaitingSecondsOther.node.active = (!(this._ownSign == parseInt(stageInfo.first)));
            this._textWaiting.node.active = false;
            this._textSquadCountTip.node.active = true;
        }
    }

    private _initSilkBindingData() {
        for (var index = 1; index <= 6; index++) {
            // this['_btnSilk' + index].addClickEventListenerEx(handler(this, this._selectItem));
            this['_imageSelected' + index].node.active = false;
        }
    }

    private _getPetsMaxCount() {
        var maxPetCounts = 1;
        var curStage = G_UserData.getSeasonSport().getSeason_Stage();
        if (curStage == SeasonSportConst.SEASON_STAGE_ROOKIE) {
            maxPetCounts = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_ROOKIEPET_COUNTS).content);
        } else if (curStage == SeasonSportConst.SEASON_STAGE_ADVANCED) {
            maxPetCounts = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_ADVANCEDPET_COUNTS).content);
        } else if (curStage == SeasonSportConst.SEASON_STAGE_HIGHT) {
            maxPetCounts = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_HIGHTPET_COUNTS).content);
        }
        return maxPetCounts;
    }

    private _updateBindedPetsUI(index, petId) {
        if (petId == null) {
            return;
        }
        if (petId > 0) {
            this['_fileNodePet' + index].unInitUI();
            this['_fileNodePet' + index].initUI(TypeConvertHelper.TYPE_PET, petId);
            this['_fileNodePet' + index].removeLightEffect();
            this['_fileNodePet' + index].setTouchEnabled(false);
            this['_nodeStar' + index].node.active = true;
            this['_imageAddPet' + index].node.active = false;
        } else {
            this['_fileNodePet' + index].unInitUI();
            this['_nodeStar' + index].node.active = false;
            this['_imageAddPet' + index].node.active = true;
        }
    }

    private _initBindPetInView() {
        if (this._seasonPets == null) {
            return;
        }
        var maxPetCounts = this._getPetsMaxCount();
        for (var index = 1; index <= maxPetCounts; index++) {
            if (this._seasonPets[index - 1] && parseInt(this._seasonPets[index - 1]) > 0) {
                this._updateBindedPetsUI(index, this._seasonPets[index - 1]);
                this._bindPetData[index - 1].petId = this._seasonPets[index - 1];
            } else {
                this._updateBindedPetsUI(index, 0);
            }
        }
    }

    private _updateBanedBindedData() {
        if (this._bindPetData == null) {
            return;
        }
        var banPets = G_UserData.getSeasonSport().getBanPets();
        if (banPets == null || banPets.length <= 0) {
            return;
        }
        for (let i in this._bindPetData) {
            var v = this._bindPetData[i];
            for (let k in banPets) {
                var value = banPets[k];
                if (this._bindPetData[i].petId == value) {
                    this._bindPetData[i].petId = 0;
                }
            }
        }
    }

    private _updateBindPetInView() {
        this._updateBanedBindedData();
        var maxPetCounts = this._getPetsMaxCount();
        for (var index = 1; index <= maxPetCounts; index++) {
            if (this._bindPetData[index - 1] != null) {
                this._updateBindedPetsUI(index, this._bindPetData[index - 1].petId);
            } else {
                this._updateBindedPetsUI(index, 0);
            }
        }
    }

    private _initBindPetData() {
        var maxPetCounts = this._getPetsMaxCount();
        for (var index = 1; index <= maxPetCounts; index++) {
            if (!this._bindPetData[index - 1]) {
                this._bindPetData[index - 1] = {};
                this._bindPetData[index - 1].petId = 0;
            }
        }
    }

    private _initBindSilkToHeroData() {
        for (var index = 1; index <= 6; index++) {
            if (!this._bindSilkData[index - 1]) {
                this._bindSilkData[index - 1] = {};
                this._bindSilkData[index - 1].heroId = 0;
                this._bindSilkData[index - 1].silkIndex = 0;
            }
        }
    }

    private _initOwnSquadHeroData() {
        for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if (!this._squadAvatarData[index - 1]) {
                this._squadAvatarData[index - 1] = {};
            }
            this._squadAvatarData[index - 1].isLock = false;
            this._squadAvatarData[index - 1].heroId = 0;
            this._squadAvatarData[index - 1].state = 0;
            this._squadAvatarData[index - 1].avatar = null;
            this._squadAvatarData[index - 1].isExchange = false;
        }
    }

    private _onEventBindingSuccess() {
        G_UserData.getSeasonSport().c2sFightsFight();
    }

    private _onEventHerosPitchSuccess(id, message) {
        var maxStage = SeasonSportHelper.getMaxFightStage();
        if (message.round < maxStage) {
            this._countDownTime = message.round_end_time;
            var stageInfo = SeasonSportHelper.getSquadStageInfo(message.round);
            if (this._ownSign == parseInt(stageInfo.first)) {
                this._textSquadCountTip.string = Lang.get('season_tip_squadheros', { num: parseInt(stageInfo.number) });
            } else {
                this._textSquadCountTip.string = Lang.get('season_tip_othersquadheros');
            }
            this._updateSquadTime();
            this._textSquadDragTip.string = Lang.get('season_tip_squadnormal');
            this._textSquadDragTip.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._imageMaskOwn.node.active = (!(this._ownSign == parseInt(stageInfo.first)));
            this._imageMaskOther.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._textWaitingSecondsOwn.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._textWaitingSecondsOther.node.active = (!(this._ownSign == parseInt(stageInfo.first)));
            this._ownSquadNode.synchronizeData(null);
            this._ownSquadNode.synchronizeUI(message.own_side, message.own_side_avater);
            this._otherSquadNode.updateUI(message.other_side);
            this._updateLockVisible(this._ownSign == parseInt(stageInfo.first));
            this._ownSquadNode.switchAddVisible(!(this._ownSign == parseInt(stageInfo.first)));
        } else if (message.round == maxStage) {
            this._ownSquadNode.synchronizeData(null);
            this._ownSquadNode.synchronizeUI(message.own_side, message.own_side_avater);
            this._otherSquadNode.updateUI(message.other_side);
            this._textSquadDragTip.node.active = false;
            this._imageMaskOwn.node.active = false;
            this._imageMaskOther.node.active = false;
            this._textWaitingSecondsOwn.node.active = true;
            this._textWaitingSecondsOther.node.active = true;
            this._countDownTime = message.round_end_time;
            var textureList = [
                'img_runway_star',
                'img_runway_star1',
                'img_runway_star2',
                'img_runway_star3'
            ];
            this._countDownAnimation.setTextureList(textureList);
            this._isFightStage = true;
            this._textWaiting.node.active = true;
            this._textSquadCountTip.node.active = false;
            this._updateLockVisible(false);
            this._nodeCountAniOwn1.active = false;
            this._nodeCountAniOther1.active = false;
            this._nodeCountAniOwn2.active = false;
            this._nodeCountAniOther2.active = false;
            this._nodeCountAniOwn2.removeAllChildren();
            this._nodeCountAniOther2.removeAllChildren();
        }
    }

    private _s2cFightsFight(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message == null) {
            return;
        }
        if (message.exception_res != null) {
            if (message.exception_res == 1) {
                G_UserData.getSeasonSport().c2sFightsEntrance();
                G_SceneManager.popScene();
                if (G_UserData.getSeasonSport().isSquadReconnect()) {
                    G_SceneManager.showScene('seasonSport');
                }
                return;
            }
            if (message.exception_res == 2) {
                G_UserData.getSeasonSport().c2sFightsEntrance();
                G_SceneManager.popScene();
                G_UserData.getSeasonSport().setOtherCDOut(true);
                if (G_UserData.getSeasonSport().isSquadReconnect()) {
                    G_SceneManager.showScene('seasonSport');
                }
                return;
            }
            if (message.exception_res == 3 || message.exception_res == 4) {
                G_UserData.getSeasonSport().c2sFightsEntrance();
                G_SceneManager.popScene();
                G_UserData.getSeasonSport().setOwnCDOutAndDropStar(message.exception_res - 2);
                if (G_UserData.getSeasonSport().isSquadReconnect()) {
                    G_SceneManager.showScene('seasonSport');
                }
                return;
            }
        }
        let enterFightView = (message) => {
            var battleReport = G_UserData.getFightReport().getReport();
            if (this._ownSign == 2 && battleReport.is_win != null) {
                battleReport.is_win = !battleReport.is_win;
                this._updateSeasonStar(battleReport.is_win);
            } else if (this._ownSign == 1 && battleReport.is_win != null) {
                battleReport.is_win = battleReport.is_win;
                this._updateSeasonStar(battleReport.is_win);
            }
            var reportData = ReportParser.parse(battleReport);
            var battleData: any = BattleDataHelper.parseSeasonSportData(message, false);
            var ownDanInfo = G_UserData.getSeasonSport().getOwn_DanInfo();
            var otherDanInfo = G_UserData.getSeasonSport().getOther_DanInfo();
            battleData.ownDanInfo = ownDanInfo;
            battleData.otherDanInfo = otherDanInfo;
            battleData.is_win = battleReport.is_win;
            G_SceneManager.popScene();
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        G_SceneManager.registerGetReport(message.battle_report, () => {
            enterFightView(message);
        });
    }

    private _initDanInfo() {
        var ownDanInfoNode = cc.instantiate(this._seasonDanInfoNodePrefab).getComponent(SeasonDanInfoNode);
        this._ownInfoContainer.addChild(ownDanInfoNode.node);
        this._ownDanNode = ownDanInfoNode;
        var otherDanInfoNode = cc.instantiate(this._seasonDanInfoNodePrefab).getComponent(SeasonDanInfoNode);
        this._otherInfoContainer.addChild(otherDanInfoNode.node);
        this._otherDanNode = otherDanInfoNode;
    }

    private _initSquadInfo() {
        var ownHeroPickNode = cc.instantiate(this._ownHeroPickNodePrefab).getComponent(OwnHeroPickNode);
        ownHeroPickNode.init(handler(this, this._onSynChroData), handler(this, this._onMoveOut));
        this._ownSquadContainer.addChild(ownHeroPickNode.node);
        this._ownSquadNode = ownHeroPickNode;
        var otherHeroPickNode = cc.instantiate(this._otherHeroPickNodePrefab).getComponent(OtherHeroPickNode);
        otherHeroPickNode.init();
        this._otherSquadContainer.addChild(otherHeroPickNode.node);
        this._otherSquadNode = otherHeroPickNode;
    }

    private _onClickSilkSelect(index, data) {
        if (data != null) {
            this['_textSilkName' + index].string = '   ' + data.name;
            if (data.pos) {
                this._bindSilkData[index - 1].silkIndex = parseInt(data.pos);
            }
        }
        for (var slot = 1; slot <= 6; slot++) {
            if (slot == index) {
                (this['_imageArrow' + slot].node as cc.Node).angle = this['_imageSelected' + slot].node.active ? 0 : 180;
                this['_imageSelected' + slot].node.active = (!this['_imageSelected' + slot].node.active);
            } else {
                (this['_imageArrow' + slot].node as cc.Node).angle = 0;
                this['_imageSelected' + slot].node.active = false;
            }
        }
    }

    private _searchExchangeData(ownLockData: any[]) {
        var searchData = [];
        for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if (ownLockData[index - 1].isExchange == true) {
                searchData.push(index);
            }
        }
        if ((searchData).length == 2) {
            var temp = this._bindSilkData[searchData[1 - 1] - 1].silkIndex;
            this._bindSilkData[searchData[1 - 1] - 1].silkIndex = this._bindSilkData[searchData[2 - 1] - 1].silkIndex;
            this._bindSilkData[searchData[2 - 1] - 1].silkIndex = temp;
        }
        return searchData;
    }

    private _exchangeBindedSilkAndHero(lockData: any[]) {
        var searchIndex = 0;
        var exchangeData = this._searchExchangeData(lockData);
        for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if (parseInt(lockData[index - 1].heroId) > 0 && lockData[index - 1].isExchange == true) {
                var heroId = lockData[index - 1].heroId;
                if (SeasonSportHelper.isHero(heroId) == false) {
                    heroId = SeasonSportHelper.getTransformCardsHeroId(heroId);
                }
                var [bExist, paramConfig] = SeasonSportHelper.isExistHeroById(heroId);
                if (bExist) {
                    searchIndex = searchIndex + 1;
                    var silkIndex = exchangeData[searchIndex - 1];
                    var addStrngth = '';
                    var curStage = G_UserData.getSeasonSport().getSeason_Stage();
                    if (curStage == SeasonSportConst.SEASON_STAGE_ROOKIE) {
                        addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ROOKIE).content;
                    } else if (curStage == SeasonSportConst.SEASON_STAGE_ADVANCED) {
                        addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ADVANCE).content;
                    } else if (curStage == SeasonSportConst.SEASON_STAGE_HIGHT) {
                        if (SeasonSportHelper._isGoldenHero(heroId)) {
                            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_GOLDEN_RANK).content;
                        } else {
                            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_HIGHT).content;
                        }
                    }
                    var nameStr = paramConfig.name + ('+' + addStrngth);
                    var nameColor = Colors.COLOR_QUALITY[5 - 1];
                    if (SeasonSportHelper.checkSeasonRedHero(heroId)) {
                        nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT);
                    } else if (SeasonSportHelper._isGoldenHero(heroId)) {
                        nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_GOLDENLIMIT);
                        nameStr = paramConfig.name + (Lang.get('season_goldenhero_desc') + addStrngth);
                    }
                    this['_textHeroName' + index].string = nameStr;
                    this['_textHeroName' + index].node.color = nameColor;
                    this._bindSilkData[index - 1].heroId = lockData[index - 1].heroId;
                    var silkGroupInfo = G_UserData.getSeasonSport().getSilkGroupInfo();
                    var silkId = this._bindSilkData[silkIndex - 1].silkIndex;
                    silkId = silkId > 0 && silkId || 1;
                    if (silkGroupInfo[silkId - 1] && silkGroupInfo[silkId - 1].name != '') {
                        this['_textSilkName' + index].string = '   ' + silkGroupInfo[silkId - 1].name;
                    } else {
                        var nameStr = Lang.get('season_silk_group_initname2') + (silkId).toString();
                        this['_textSilkName' + index].string = '   ' + nameStr;
                    }
                }
            } else {
                if (parseInt(lockData[index - 1].heroId) == 0) {
                    if (lockData[index - 1].isExchange) {
                        searchIndex = searchIndex + 1;
                        var silkIndex = exchangeData[searchIndex - 1];
                        this['_textHeroName' + index].string = Lang.get('season_squad_solot', { num: index });
                        this['_textHeroName' + index].node.color = (Colors.SEASON_SILKBINDING_TEXT);
                        this._bindSilkData[index - 1].heroId = 0;
                        var silkGroupInfo = G_UserData.getSeasonSport().getSilkGroupInfo();
                        var silkId = this._bindSilkData[silkIndex - 1].silkIndex;
                        silkId = silkId > 0 && silkId || 1;
                        if (silkGroupInfo[silkId - 1] && silkGroupInfo[silkId - 1].name != '') {
                            this['_textSilkName' + index].string = '   ' + silkGroupInfo[silkId - 1].name;
                        } else {
                            var nameStr = Lang.get('season_silk_group_initname2') + (silkId).toString();
                            this['_textSilkName' + index].string = '   ' + nameStr;
                        }
                    } else {
                        this['_textHeroName' + index].string = Lang.get('season_squad_solot', { num: index });
                        this['_textHeroName' + index].node.color = (Colors.SEASON_SILKBINDING_TEXT);
                        this._bindSilkData[index - 1].heroId = 0;
                        var silkGroupInfo = G_UserData.getSeasonSport().getSilkGroupInfo();
                        if (silkGroupInfo[1] && silkGroupInfo[1 - 1].name != '') {
                            this['_textSilkName' + index].string = '   ' + silkGroupInfo[1 - 1].name;
                        } else {
                            var nameStr = Lang.get('season_silk_group_initname2') + (1).toString();
                            this['_textSilkName' + index].string = '   ' + nameStr;
                        }
                        this._bindSilkData[index - 1].silkIndex = 0;
                    }
                }
            }
        }
    }

    private _onSynChroData(bLock, curOwnLockData: any[], bExchange?) {
        this._squadAvatarData = curOwnLockData;
        if (bLock == true) {
            for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
                if (parseInt(curOwnLockData[index - 1].heroId) > 0 && curOwnLockData[index - 1].isLock == true) {
                    var heroId = curOwnLockData[index - 1].heroId;
                    if (SeasonSportHelper.isHero(heroId) == false) {
                        heroId = SeasonSportHelper.getTransformCardsHeroId(heroId);
                    }
                    var [bExist, paramConfig] = SeasonSportHelper.isExistHeroById(heroId);
                    if (bExist) {
                        var addStrngth = '';
                        var curStage = G_UserData.getSeasonSport().getSeason_Stage();
                        if (curStage == SeasonSportConst.SEASON_STAGE_ROOKIE) {
                            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ROOKIE).content;
                        } else if (curStage == SeasonSportConst.SEASON_STAGE_ADVANCED) {
                            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ADVANCE).content;
                        } else if (curStage == SeasonSportConst.SEASON_STAGE_HIGHT) {
                            if (SeasonSportHelper._isGoldenHero(heroId)) {
                                addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_GOLDEN_RANK).content;
                            } else {
                                addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_HIGHT).content;
                            }
                        }
                        var nameStr = paramConfig.name + ('+' + addStrngth);
                        var nameColor = Colors.COLOR_QUALITY[5 - 1];
                        if (SeasonSportHelper.checkSeasonRedHero(heroId)) {
                            nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT);
                        } else if (SeasonSportHelper._isGoldenHero(heroId)) {
                            nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_GOLDENLIMIT);
                            nameStr = paramConfig.name + (Lang.get('season_goldenhero_desc') + addStrngth);
                        }
                        this['_textHeroName' + index].string = nameStr;
                        this['_textHeroName' + index].node.color = nameColor;
                        this._bindSilkData[index - 1].heroId = curOwnLockData[index - 1].heroId;
                    }
                } else {
                    this['_textHeroName' + index].string = Lang.get('season_squad_solot', { num: index });
                    this['_textHeroName' + index].node.color = (Colors.SEASON_SILKBINDING_TEXT);
                    this._bindSilkData[index - 1].heroId = 0;
                }
            }
        } else {
            if (bExchange) {
                this._exchangeBindedSilkAndHero(curOwnLockData);
            } else {
                this._unExchangeBindedSilkAndHero(curOwnLockData);
            }
            var curRound = G_UserData.getSeasonSport().getCurrentRound();
            var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
            var stageNumber = parseInt(stageInfo.number);
            var selectCount = this._curStageSelectedPickCount();
            this._btnLock.setEnabled(selectCount >= stageNumber || false);
            if (selectCount >= stageNumber) {
                this._nodeLockEffect.active = true;
                this._nodeLockEffect.removeAllChildren();
                G_EffectGfxMgr.createPlayGfx(this._nodeLockEffect, 'effect_anniufaguang_big2');
            } else {
                this._nodeLockEffect.active = false;
            }
        }
    }

    private _unExchangeBindedSilkAndHero(lockData) {
        for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if (parseInt(lockData[index - 1].heroId) > 0 && lockData[index - 1].isLock == false) {
                var heroId = lockData[index - 1].heroId;
                if (SeasonSportHelper.isHero(heroId) == false) {
                    heroId = SeasonSportHelper.getTransformCardsHeroId(heroId);
                }
                var [bExist, paramConfig] = SeasonSportHelper.isExistHeroById(heroId);
                if (bExist) {
                    var addStrngth = '';
                    var curStage = G_UserData.getSeasonSport().getSeason_Stage();
                    if (curStage == SeasonSportConst.SEASON_STAGE_ROOKIE) {
                        addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ROOKIE).content;
                    } else if (curStage == SeasonSportConst.SEASON_STAGE_ADVANCED) {
                        addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ADVANCE).content;
                    } else if (curStage == SeasonSportConst.SEASON_STAGE_HIGHT) {
                        if (SeasonSportHelper._isGoldenHero(heroId)) {
                            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_GOLDEN_RANK).content;
                        } else {
                            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_HIGHT).content;
                        }
                        var nameStr = paramConfig.name + ('+' + addStrngth);
                        if (this._bindSilkData[index - 1].silkIndex == 0) {
                            this._updateBindedInfo(index, lockData[index - 1].heroId);
                        }
                        var nameColor = Colors.COLOR_QUALITY[5 - 1];
                        if (SeasonSportHelper.checkSeasonRedHero(heroId)) {
                            nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT);
                        } else if (SeasonSportHelper._isGoldenHero(heroId)) {
                            nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_GOLDENLIMIT);
                            nameStr = paramConfig.name + (Lang.get('season_goldenhero_desc') + addStrngth);
                        }
                        this['_textHeroName' + index].string = nameStr;
                        this['_textHeroName' + index].node.color = nameColor;
                        this._bindSilkData[index - 1].heroId = lockData[index - 1].heroId;
                    }
                } else {
                    if (parseInt(lockData[index - 1].heroId) == 0) {
                        this['_textHeroName' + index].string = Lang.get('season_squad_solot', { num: index });
                        this['_textHeroName' + index].node.color = (Colors.SEASON_SILKBINDING_TEXT);
                        this._bindSilkData[index - 1].heroId = 0;
                        var silkGroupInfo = G_UserData.getSeasonSport().getSilkGroupInfo();
                        if (silkGroupInfo[1 - 1] && silkGroupInfo[1 - 1].name != '') {
                            this['_textSilkName' + index].string = '   ' + silkGroupInfo[1 - 1].name;
                        } else {
                            var nameStr = Lang.get('season_silk_group_initname2') + (1).toString();
                            this['_textSilkName' + index].string = '   ' + nameStr;
                        }
                        this._bindSilkData[index - 1].silkIndex = 0;
                    }
                }
            }
        }
    }

    private _onMoveOut(bOut) {
        if (bOut) {
            this._btnLock.node.active = false;
            this._textSquadDragTip.string = Lang.get('season_tip_squadout');
            this._imageHeroOutShade.node.active = bOut;
        } else {
            this._textSquadDragTip.string = Lang.get('season_tip_squadnormal');
            var curRound = G_UserData.getSeasonSport().getCurrentRound();
            var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
            this._btnLock.setVisible(this._ownSign == parseInt(stageInfo.first));
            this._textSquadCountTip.string = Lang.get('season_tip_squadheros', { num: parseInt(stageInfo.number) });
            this._imageHeroOutShade.node.active = bOut;
        }
    }

    private _updateReconnectBanHeros() {
        var banHeros = G_UserData.getSeasonSport().getBanHeros();
        if (banHeros == null || !banHeros) {
            return;
        }
        if (G_UserData.getSeasonSport().isBanPick() == false) {
            return;
        }
        G_UserData.getSeasonSport().setBanPick(false);
        this._panelBanPick.active = true;
        this._panelOwnBan.active = true;
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        if (curRound > 0) {
            this._banFinishMoveAnimation();
        }
        var maxBanHeroNum = parseInt(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content);
        for (let index = 1; index <= banHeros.length; index++) {
            var value = banHeros[index - 1];
            if (index <= maxBanHeroNum) {
                if (value > 0) {
                    this['_imageOwnPick' + index].node.active = false;
                    this['_fileNodeOwnPick' + index].node.active = true;
                    this['_fileNodeOwnPick' + index].unInitUI();
                    this['_fileNodeOwnPick' + index].initUI(TypeConvertHelper.TYPE_HERO, value);
                    this['_fileNodeOwnPick' + index].setIconMask(true);
                    this._banHeroData[index - 1].heroId = value;
                    if (SeasonSportHelper.checkSeasonRedHero(value)) {
                        var iconBg = Path.getUICommon('frame/img_frame_06');
                        this['_fileNodeOwnPick' + index].loadColorBg(iconBg);
                    }
                } else {
                    this._banHeroData[index - 1].heroId = 0;
                    this['_fileNodeOwnPick' + index].unInitUI();
                    this['_imageOwnPick' + index].node.active = true;
                }
            } else {
                var idx = index - maxBanHeroNum;
                if (value > 0) {
                    this['_imageOtherPick' + idx].node.active = false;
                    this['_fileNodeOtherPick' + idx].node.active = true;
                    this['_fileNodeOtherPick' + idx].unInitUI();
                    this['_fileNodeOtherPick' + idx].initUI(TypeConvertHelper.TYPE_HERO, value);
                    this['_fileNodeOtherPick' + idx].setIconMask(true);
                    if (SeasonSportHelper.checkSeasonRedHero(value)) {
                        var iconBg = Path.getUICommon('frame/img_frame_06');
                        this['_fileNodeOtherPick' + idx].loadColorBg(iconBg);
                    }
                } else {
                    this['_fileNodeOtherPick' + idx].unInitUI();
                    this['_imageOtherPick' + idx].node.active = true;
                }
            }
        }
    }

    private _updateReconnectBanPets() {
        var banPets = G_UserData.getSeasonSport().getBanPets();
        if (banPets == null || !banPets) {
            return;
        }
        this._banCheckPets(banPets);
        this._updateBindPetInView();
    }

    private _updateReconnectSquad() {
        let synchroData = function (data) {
            this._squadAvatarData = data;
            this._updateReconnectSilk(data);
            this._onSynChroData(true, data);
        }.bind(this);
        var maxStage = SeasonSportHelper.getMaxFightStage();
        if (G_UserData.getSeasonSport().getCurrentRound() < maxStage) {
            this._countDownTime = G_UserData.getSeasonSport().getCurrentRound_EndTime();
            var stageInfo = SeasonSportHelper.getSquadStageInfo(G_UserData.getSeasonSport().getCurrentRound());
            if (this._ownSign == parseInt(stageInfo.first)) {
                this._textSquadCountTip.string = Lang.get('season_tip_squadheros', { num: parseInt(stageInfo.number) });
            } else {
                this._textSquadCountTip.string = Lang.get('season_tip_othersquadheros');
            }
            this._updateSquadTime();
            this._textSquadDragTip.string = Lang.get('season_tip_squadnormal');
            this._textSquadDragTip.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._imageMaskOwn.node.active = (!(this._ownSign == parseInt(stageInfo.first)));
            this._imageMaskOther.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._textWaitingSecondsOwn.node.active = (this._ownSign == parseInt(stageInfo.first));
            this._textWaitingSecondsOther.node.active = (!(this._ownSign == parseInt(stageInfo.first)));
            this._ownSquadNode.synchronizeData(synchroData);
            this._ownSquadNode.synchronizeUI(G_UserData.getSeasonSport().getOwn_SquadInfo(), G_UserData.getSeasonSport().getOwn_SquadType());
            this._otherSquadNode.updateUI(G_UserData.getSeasonSport().getOther_SquadInfo());
            this._updateLockVisible(this._ownSign == parseInt(stageInfo.first));
            this._ownSquadNode.switchAddVisible(!(this._ownSign == parseInt(stageInfo.first)));
        } else if (G_UserData.getSeasonSport().getCurrentRound() == maxStage) {
            this._ownSquadNode.synchronizeData(synchroData);
            this._ownSquadNode.synchronizeUI(G_UserData.getSeasonSport().getOwn_SquadInfo(), G_UserData.getSeasonSport().getOwn_SquadType());
            this._otherSquadNode.updateUI(G_UserData.getSeasonSport().getOther_SquadInfo());
            this._textSquadDragTip.node.active = false;
            this._imageMaskOwn.node.active = false;
            this._imageMaskOther.node.active = false;
            this._textWaitingSecondsOwn.node.active = true;
            this._textWaitingSecondsOther.node.active = true;
            this._countDownTime = G_UserData.getSeasonSport().getCurrentRound();
            var textureList = [
                'img_runway_star.png',
                'img_runway_star1.png',
                'img_runway_star2.png',
                'img_runway_star3.png'
            ];
            this._countDownAnimation.setTextureList(textureList);
            this._isFightStage = true;
            this._textWaiting.node.active = true;
            this._textSquadCountTip.node.active = false;
            this._updateLockVisible(false);
            this._nodeCountAniOwn1.active = false;
            this._nodeCountAniOther1.active = false;
            this._nodeCountAniOwn2.active = false;
            this._nodeCountAniOther2.active = false;
            this._nodeCountAniOwn2.removeAllChildren();
            this._nodeCountAniOther2.removeAllChildren();
        }
    }

    private _updateReconnectSilk(data) {
        if (data == null) {
            return;
        }
        for (let key in data) {
            var value = data[key];
            if (data[key] != null) {
                this._updateBindedInfo(Number(key) + 1, data[key].heroId);
            }
        }
    }

    private _updateDanInfo() {
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        var ownDanInfo: any = G_UserData.getSeasonSport().getOwn_DanInfo();
        var otherDanInfo = G_UserData.getSeasonSport().getOther_DanInfo();
        this._ownDanNode.updateUI(ownDanInfo);
        this._otherDanNode.updateUI(otherDanInfo);
        if (curRound == 0) {
            this._isPopBanPickView = G_UserData.getSeasonSport().isBanPick();
        }
        if (G_UserData.getSeasonSport().isOnGoing()) {
            G_UserData.getSeasonSport().setOnGoing(false);
            this._ownDanNode.updateOwnProir(this._ownSign == 1);
            this._otherDanNode.updateOtherProir(this._ownSign == 2);
            this._updateReconnectBanPets();
            this._updateReconnectBanHeros();
            this._updateReconnectSquad();
        } else {
            this._priorAnimation.removeAllChildren();
            this._palyProiorAnimation(this._priorAnimation, ownDanInfo.isProir, handler(this, this._initSquadTime));
        }
    }

    private _updateLockVisible(bVisible) {
        this._btnLock.node.active = bVisible;
        this._btnLock.setEnabled(false);
        this._nodeLockEffect.active = false;
    }

    private _updateSeasonStar(bWin) {
        var curStar = G_UserData.getSeasonSport().getCurSeason_Star();
        if (bWin) {
            G_UserData.getSeasonSport().setTimeOutCD(2);
            G_UserData.getSeasonSport().setCurSeason_Star(curStar + 1);
        } else {
            if (curStar <= 1) {
                curStar = 1;
            }
            G_UserData.getSeasonSport().setTimeOutCD(1);
            G_UserData.getSeasonSport().setCurSeason_Star(curStar - 1);
        }
    }

    private _sendBindSilkInfo() {
        var data: any[] = [];
        for (let key in this._bindSilkData) {
            var value = this._bindSilkData[key];
            if (this._bindSilkData[key].heroId > 0) {
                var skb: any = {};
                if (this._bindSilkData[key].silkIndex > 0) {
                    skb.idx = this._bindSilkData[key].silkIndex - 1;
                } else {
                    skb.idx = 0;
                }
                skb.unit = this._bindSilkData[key].heroId;
                data.push(skb);
            }
        }
        var petsData = [];
        for (var index = 1; index <= this._bindPetData.length; index++) {
            petsData.push(this._bindPetData[index - 1].petId);
        }
        if (data.length > 0) {
            G_UserData.getSeasonSport().c2sFightsSilkbagBinding(data, petsData);
        }
    }

    private _initSilkGroupName() {
        var silkGroupInfo = G_UserData.getSeasonSport().getSilkGroupInfo();
        for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            var nameStr = null;
            if (silkGroupInfo[1 - 1].name != '' && silkGroupInfo[1 - 1].name != null) {
                nameStr = silkGroupInfo[1 - 1].name;
            } else {
                nameStr = Lang.get('season_silk_group_initname2') + (1).toString();
            }
            this['_textSilkName' + index].string = '   ' + nameStr;
        }
    }

    private _updateBindedInfo(index, heroId) {
        var bindedSilkGroups = G_UserData.getSeasonSport().getBindedSilkGroups();
        var silkGroupInfo = G_UserData.getSeasonSport().getSilkGroupInfo();
        var silkGroupIdx = null;
        for (let key in bindedSilkGroups) {
            var value = bindedSilkGroups[key];
            if (value && value.unit == heroId) {
                silkGroupIdx = value.idx;
                this._bindSilkData[index - 1].silkIndex = value.idx + 1;
                break;
            }
        }
        if (silkGroupIdx == null) {
            this._bindSilkData[index - 1].silkIndex = 0;
            if (silkGroupInfo[1 - 1] && silkGroupInfo[1 - 1].name != '') {
                this['_textSilkName' + index].string = '   ' + silkGroupInfo[1 - 1].name;
            } else {
                let nameStr = Lang.get('season_silk_group_initname2') + (1).toString();
                this['_textSilkName' + index].string = '   ' + nameStr;
            }
            return;
        }
        for (let key in silkGroupInfo) {
            var value = silkGroupInfo[key];
            if (value && value.idx == silkGroupIdx) {
                let nameStr = null;
                if (value.name != '' && value.name != null) {
                    nameStr = value.name;
                } else {
                    nameStr = Lang.get('season_silk_group_initname2') + (silkGroupIdx + 1).toString();
                }
                this['_textSilkName' + index].string = '   ' + nameStr;
                break;
            }
        }
    }

    private _onBtnLock(sender?) {
        var ownSign = G_UserData.getSeasonSport().getPrior();
        var curRound = G_UserData.getSeasonSport().getCurrentRound();
        var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
        if (ownSign != parseInt(stageInfo.first)) {
            G_Prompt.showTip(Lang.get('season_squad_otherround'));
            return;
        }
        var stageNumber = parseInt(stageInfo.number);
        var selectCount = this._curStageSelectedPickCount();
        if (selectCount <= 0) {
            return;
        }
        var data = [];
        if (stageNumber == selectCount) {
            for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
                if (parseInt(this._squadAvatarData[index - 1].heroId) > 0 && this._squadAvatarData[index - 1].isLock == false) {
                    var heroId = this._squadAvatarData[index - 1].heroId;
                    var iAvatar = 0;
                    if (SeasonSportHelper.isHero(heroId) == false) {
                        iAvatar = 1;
                        heroId = SeasonSportHelper.getTransformCardsHeroId(heroId);
                    }
                    var bp = {
                        unit: heroId,
                        pos: index - 1,
                        is_avatar: iAvatar
                    };
                    data.push(bp);
                    this._squadAvatarData[index - 1].isLock = true;
                    this._squadAvatarData[index - 1].isExchange = false;
                }
            }
        } else {
            if (stageNumber > selectCount) {
                G_Prompt.showTip(Lang.get('season_squad_hero_less', { num: stageNumber - selectCount }));
                return;
            }
        }
        this._updateLockVisible(false);
        this._onSynChroData(true, this._squadAvatarData);
        G_UserData.getSeasonSport().c2sFightsBanPick(data);
    }

    private _curStageSelectedPickCount() {
        var selectCount = 0;
        for (var index = 1; index <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT; index++) {
            if (parseInt(this._squadAvatarData[index - 1].heroId) > 0 && this._squadAvatarData[index - 1].isLock == false) {
                selectCount = selectCount + 1;
            }
        }
        return selectCount;
    }

    private _update(dt) {
        if (this._isPopBanPickView) {
            if (this._popBanPickIntervel >= 0.5) {
                this._isPopBanPickView = false;
                this._popBanPickView();
            }
            this._popBanPickIntervel = this._popBanPickIntervel + dt;
        }
        if (0 >= G_ServerTime.getLeftSeconds(this._countDownTime) && G_UserData.getSeasonSport().getCurrentRound() > 0) {
            this._textWaitingSecondsOwn.string = '0';
            this._textWaitingSecondsOther.string = '0';
            var curRound = G_UserData.getSeasonSport().getCurrentRound();
            var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
            var stageNumber = parseInt(stageInfo.number);
            var selectCount = this._curStageSelectedPickCount();
            if (selectCount > 0 && selectCount == stageNumber) {
                this._onBtnLock();
            } else {
                this._seasonOffLineWait = this._seasonOffLineWait + dt;
                if (SeasonSportConst.SEASON_OFFLINE_WAITING <= this._seasonOffLineWait) {
                    G_UserData.getSeasonSport().setSquadOffline(true);
                    G_UserData.getSeasonSport().c2sFightsEntrance();
                    G_SceneManager.popScene();
                    return;
                }
            }
        } else if (0.5 >= G_ServerTime.getLeftSeconds(this._countDownTime) && G_UserData.getSeasonSport().getCurrentRound() == 0) {
            if (!this._isSendBaned) {
                this._isSendBaned = true;
                this._sendBanedHero();
            }
        } else {
            this._seasonOffLineWait = 0;
            this._textWaitingSecondsOwn.string = G_ServerTime.getLeftSeconds(this._countDownTime).toString();
            this._textWaitingSecondsOther.string = G_ServerTime.getLeftSeconds(this._countDownTime).toString();
        }
        if (this._isFightStage) {
            if (3 >= G_ServerTime.getLeftSeconds(this._countDownTime)) {
                this._isFightStage = false;
                this._textWaiting.node.active = false;
                this._imageMaskOwn.node.active = false;
                this._imageMaskOther.node.active = false;
                this._textWaitingSecondsOwn.node.active = false;
                this._textWaitingSecondsOther.node.active = false;
                this._countDownAnimation.playAnimation(4, 1, function () {
                    this._sendBindSilkInfo();
                }.bind(this));
            }
        }
    }
}