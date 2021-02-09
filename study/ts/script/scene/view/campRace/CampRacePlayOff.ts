import { CampRaceConst } from "../../../const/CampRaceConst";
import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_EffectGfxMgr, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import CommonMainMenu from "../../../ui/component/CommonMainMenu";
import CommonMiniChat from "../../../ui/component/CommonMiniChat";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";
import { handler } from "../../../utils/handler";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import { CampRaceHelper } from "./CampRaceHelper";
import CampRacePlayerInfoNode from "./CampRacePlayerInfoNode";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CampRacePlayOff extends ViewBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMid: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRound: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCount: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _ImageCountBG: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;
    @property({
        type: CampRacePlayerInfoNode,
        visible: true
    })
    _nodePlayerInfo1: CampRacePlayerInfoNode = null;
    @property({
        type: CampRacePlayerInfoNode,
        visible: true
    })
    _nodePlayerInfo2: CampRacePlayerInfoNode = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelPlayer1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelPlayer2: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBet1: cc.Node = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonBet1: CommonButtonLevel0Highlight = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBet1: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBetBg1: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBet2: cc.Node = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonBet2: CommonButtonLevel0Highlight = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBet2: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBetBg2: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;
    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnBest8: CommonMainMenu = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textChampionTip: cc.Label = null;
    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;
    @property(cc.Prefab)
    commonHeroAvatar: cc.Prefab = null;

    _playerData1: any;
    _playerData2: any;
    _avatars: { 1: {}; 2: {}; };
    _index: number;
    _targetTime: number;
    _timeOfPerRound: any;
    _canEmbattle: boolean;
    _popupCampMap: any;
    _signalGetLastRank: any;
    _signalGetCampRaceFormation: any;
    _signalUpdateCampRaceFormation: any;
    _signalAddBattleReport: any;
    _signalUpdateState: any;
    _signalCampBetSuccess: any;
    _signalCampUpdateBet: any;
    _camp: any;
    _scheduleHandler: any;
    _popupCampMapSignal: any;

    _isEnable = false;
    _isLoadingCampMap:  boolean = false;

    onCreate() {
        this.updateSceneId(2);
        this.setSceneSize();
        this._btnBest8.addClickEventListenerEx(handler(this, this._onBest8Click));
        this._buttonBet1.addClickEventListenerEx(handler(this, this._onBetClick1));
        this._buttonBet2.addClickEventListenerEx(handler(this, this._onBetClick2));
        this._initData();
        this._initView();
        this._commonChat.setDanmuVisible(false);
    }
    _initData() {
        this._playerData1 = null;
        this._playerData2 = null;
        this._avatars = {
            [1]: {},
            [2]: {}
        };
        this._index = 0;
        this._targetTime = 0;
        this._timeOfPerRound = CampRaceHelper.getGameTime(CampRaceConst.STATE_PLAY_OFF);
        this._canEmbattle = true;
    }
    _initView() {
        for (var i = 1; i <= 2; i++) {
            this['_playerInfoPanel' + i] = this['_nodePlayerInfo' + i];
            this['_playerInfoPanel' + i].ctor(i);
            this['_nodePlayerInfo' + i].node.active = (false);
        }

        this._isEnable = false;
        this._panelPlayer1.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this, false);
        this._panelPlayer1.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this, false);
        this._panelPlayer1.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this, false);
        this._panelPlayer1.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this, false);


        for (var i = 1; i <= 2; i++) {
            this['_buttonBet' + i].setString(Lang.get('camp_bet_btn'));
            var textTip = RichTextExtend.createWithContent(Lang.get('camp_bet_win_award', { count: CampRaceHelper.getBetReward() }));
          //  var imageSize = this['_imageBetBg' + i].node.getContentSize();
         //   textTip.node.setPosition(cc.v2(imageSize.width / 2, imageSize.height / 2));
            this['_imageBetBg' + i].node.addChild(textTip.node);
        }
        this._ImageCountBG.node.active = (false);
        this._btnBest8.updateUI(FunctionConst.FUNC_CAMP_RACE_DATE);
        this._popupCampMap = null;
    }
    onEnter() {
        this._signalGetLastRank = G_SignalManager.add(SignalConst.EVENT_GET_LAST_RANK, handler(this, this._onEventGetLastRank));
        this._signalGetCampRaceFormation = G_SignalManager.add(SignalConst.EVENT_GET_CAMP_RACE_FORMATION, handler(this, this._onEventGetFormation));
        this._signalUpdateCampRaceFormation = G_SignalManager.add(SignalConst.EVENT_UPDATE_CAMP_RACE_FORMATION, handler(this, this._onEventUpdateFormation));
        this._signalAddBattleReport = G_SignalManager.add(SignalConst.EVENT_ADD_RACE_BATTLE_REPORT, handler(this, this._onEventAddBattleReport));
        this._signalUpdateState = G_SignalManager.add(SignalConst.EVENT_CAMP_UPDATE_STATE, handler(this, this._onEventUpdateState));
        this._signalCampBetSuccess = G_SignalManager.add(SignalConst.EVENT_CAMP_BET_SUCCESS, handler(this, this._onEventCampBetSuccess));
        this._signalCampUpdateBet = G_SignalManager.add(SignalConst.EVENT_CAMP_UPDATE_BET, handler(this, this._onEventCampUpdateBet));
    }

    onExit() {
        this._stopCountDown();
        this._signalGetLastRank.remove();
        this._signalGetLastRank = null;
        this._signalGetCampRaceFormation.remove();
        this._signalGetCampRaceFormation = null;
        this._signalUpdateCampRaceFormation.remove();
        this._signalUpdateCampRaceFormation = null;
        this._signalAddBattleReport.remove();
        this._signalAddBattleReport = null;
        this._signalUpdateState.remove();
        this._signalUpdateState = null;
        this._signalCampBetSuccess.remove();
        this._signalCampBetSuccess = null;
        this._signalCampUpdateBet.remove();
        this._signalCampUpdateBet = null;
    }
    onShow() {
        this._canEmbattle = true;
        this._panelDesign.active = (true);
        this._startCountDown();
    }
    onHide() {
        this._stopCountDown();
    }

    onDestroy() {
   
    }
    updateInfo() {
        this._camp = G_UserData.getCampRaceData().findCurWatchCamp();
        G_UserData.getCampRaceData().c2sGetCampRaceLastRank(this._camp);
    }
    _onEventGetLastRank(eventName, camp) {
        if (this._popupCampMap) {
            return;
        }
        if (G_UserData.getCampRaceData().getStatus() != CampRaceConst.STATE_PLAY_OFF) {
            return;
        }
        if (G_UserData.getCampRaceData().getFinalStatusByCamp(camp) == CampRaceConst.PLAY_OFF_ROUND_ALL) {
            this._openPopupMap();
            return;
        }
        var curWatchUserId = G_UserData.getCampRaceData().findWatchUserIdWithCamp(camp);
        G_UserData.getCampRaceData().setCurWatchUserId(curWatchUserId);
        G_UserData.getCampRaceData().c2sGetCampRaceFormation(camp, curWatchUserId);
    }
    _onEventGetFormation(eventName, camp) {
        this._camp = camp;
        this._updateData();
        this._updateView();
        G_SignalManager.dispatch(SignalConst.EVENT_CAMP_RACE_UPDATE_TITLE);
    }
    _onEventUpdateFormation(eventName, camp, index) {
        if (this._camp != camp) {
            return;
        }
        [this._playerData1, this._playerData2] = G_UserData.getCampRaceData().getCurMatchPlayersWithCamp(this._camp);
        this._updateAvatarWithSide(index);
    }
    _updateData() {
        [this._playerData1, this._playerData2] = G_UserData.getCampRaceData().getCurMatchPlayersWithCamp(this._camp);
        if (this._playerData1 && this._playerData1.getWin_num() >= 2) {
            this._playerData2 = null;
        } else if (this._playerData2 && this._playerData2.getWin_num() >= 2) {
            this._playerData1 = null;
        }
        var startTime = G_UserData.getCampRaceData().getCurMatchStartTimeWithCamp(this._camp);
        this._targetTime = startTime + this._timeOfPerRound;
    }
    _updateView() {
        this._textChampionTip.node.active = (false);
        this._panelDesign.active = (true);
        this._updateRound();
        this._refreshPlayerInfo();
        this._canEmbattle = true;
        this._updateAvatars();
        this._updateBet();
    }
    _startCountDown() {
        this._stopCountDown();
        this._scheduleHandler = handler(this, this._updateCountDown);
        this.schedule(this._scheduleHandler, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        if (this._scheduleHandler != null) {
            this.unschedule(this._scheduleHandler);
            this._scheduleHandler = null;
        }
    }
    _updateRound() {
        var round = G_UserData.getCampRaceData().getCurMatchRoundWithCamp(this._camp);
        this._textRound.string = (Lang.get('camp_round', { count: round }));
    }
    _updateAvatars() {
        for (var i = 1; i <= 2; i++) {
            this._updateAvatarWithSide(i);
        }
    }
    _updateAvatarWithSide(side) {
        var playerData = this['_playerData' + side];
        if (playerData) {
            var formation = playerData.getFormation();
            console.log('playoff formatiion : ', formation);
            for (var i in formation) {
                var id = formation[i];
                var index = Number(i) + 1;
                var hero = playerData.getHeroDataById(id);
                if (hero) {
                    if (!this._avatars[side][index]) {
                        var avatar = cc.instantiate(this.commonHeroAvatar).getComponent(CommonHeroAvatar);
                        avatar.init();
                        avatar.setTouchEnabled(false);
                        this['_panelPlayer' + side].addChild(avatar.node, Number(index) * 10);
                        this._avatars[side][index] = avatar;
                    }
                    var baseId = hero.getCoverId();
                    var limitLevel = hero.getLimitLevel();
                    var limitRedLevel = hero.getLimitRedLevel()
                    this._avatars[side][index].updateUI(baseId, null, null, limitLevel, null, null, limitRedLevel);
                    this._avatars[side][index].node.active = (true);
                } else {
                    if (this._avatars[side][index]) {
                        this._avatars[side][index].node.active = (false);
                    }
                }
            }
            this._resetAvatarPos(side);
        } else {
            this._setAvatarEmpty(side);
        }
    }
    _setAvatarEmpty(index) {
        for (var i = 1; i <= 6; i++) {
            if (this._avatars[index][i]) {
                this._avatars[index][i].node.active = (false);
            }
        }
    }
    _resetAvatarPos(pos) {
        for (var i = 1; i <= 6; i++) {
            if (this._avatars[pos][i]) {
                var p = this['_panelPlayer' + pos].getChildByName('ImageKnightPos' + i).getPosition();
                this._avatars[pos][i].node.setPosition(cc.v2(p.x, p.y));
                this._avatars[pos][i].node.zIndex = (i * 10);
            }
        }
        this._showHighLight(null);
    }
    _refreshPlayerInfo() {
        for (var i = 1; i <= 2; i++) {
            var playerData = this['_playerData' + i];
            this['_playerInfoPanel' + i].updateUI(playerData);
            this['_nodePlayerInfo' + i].node.active = (true);
        }
        if (this._playerData1 && this._playerData1.getUid() == G_UserData.getBase().getId()) {
            this._isEnable = true;
            this._textTip.node.active = (true);
        } else {
            this._isEnable = false;
            this._textTip.node.active = (false);
        }
    }
    _showHighLight(index) {
        for (var i = 1; i <= 6; i++) {
            var panel = this._panelPlayer1.getChildByName('ImageKnightPos' + i);
            var image = panel.getChildByName('ImageHighLight');
            if (i == index) {
                image.active = (true);
            } else {
                image.active = (false);
            }
        }
    }
    _getIndexSelected(touch) {
        var touchPos = touch.getStartLocation();
        for (var k in this._avatars[1]) {
            var spine = this._avatars[1][k];
            var location = spine.getSpineHero().convertToNodeSpaceAR(touchPos);
            var rect = spine.getSpineHero().getBoundingBox();
            if (rect.contains(location)) {
                return k;
            }
        }
        return null;
    }
    _getIndexMoveOn(touchPos) {
        for (var i = 1; i <= 6; i++) {
            var panel = this._panelPlayer1.getChildByName('ImageKnightPos' + i);
            var rect = panel.getBoundingBox();
            if (rect.contains(touchPos)) {
                return i;
            }
        }
        return null;
    }
    _checkMoveHighLight(touchPos) {
        if (this._index == 0) {
            return;
        }
        var nowIndex = this._getIndexMoveOn(touchPos);
        this._showHighLight(nowIndex);
    }
    _moveSpinePos(position) {
        var moveNode = this._avatars[1][this._index];
        moveNode.node.setPosition(position);
        moveNode.node.zIndex = (100);
    }
    _moveCanceled() {
        this._resetAvatarPos(1);
    }
    _moveEnded(endPos) {
        var endIndex = this._getIndexMoveOn(endPos);
        if (!endIndex || !this._canEmbattle) {
            this._moveCanceled();
            return;
        }
        var embattle = G_UserData.getTeam().getEmbattle();
        for (var index = 0; index < 6; index++) {
            if (embattle[index] == endIndex) {
                embattle[index] = this._index;
            } else if (embattle[index] == this._index) {
                embattle[index] = endIndex;
            }
        }
        G_UserData.getTeam().c2sChangeEmbattle(embattle);
    }
    _recvReport(report) {
        var player = this._playerData1;
        if (!player) {
            return;
        }
        var userPos = player.getPosition(this._camp);
        if (report.getCamp() != this._camp) {
            return;
        }
        if (userPos == report.getPos1() || userPos == report.getPos2()) {
            G_UserData.getCampRaceData().c2sGetBattleReport(report.getReport_id());
            if (this._popupCampMap) {
                this._popupCampMap.close();
            }
        }
    }
    _onTouchBegan(touch, event) {
        if (!this._isEnable) return;
        var index = this._getIndexSelected(touch);
        if (index && this._canEmbattle) {
            this._index = Number(index);
            this._showHighLight(index);
            var touchPos = this._panelPlayer1.convertToNodeSpaceAR(touch.getStartLocation());
            this._moveSpinePos(touchPos);
            return true;
        }
        return false;
    }
    _onTouchMoved(touch, event) {
        if (!this._isEnable) return;
        if (this._index != 0) {
            var movePos = this._panelPlayer1.convertToNodeSpaceAR(touch.getLocation());
            this._moveSpinePos(movePos);
            this._checkMoveHighLight(movePos);
        }
    }
    _onTouchEnded(touch, event) {
        if (!this._isEnable) return;
        if (this._index != 0) {
            var endPos = this._panelPlayer1.convertToNodeSpaceAR(touch.getLocation());
            this._moveEnded(endPos);
            this._index = 0;
        }
    }
    _onTouchCancel(touch, event) {
        if (!this._isEnable) return;
        if (this._index != 0) {
            this._moveCanceled();
            this._index = 0;
        }
    }

    _updateCountDown() {
        var countDownTime = this._targetTime - G_ServerTime.getTime() - 1;
        if (countDownTime >= 0) {
            var timeString = G_ServerTime.secToString(countDownTime);
            if (countDownTime == 0) {
                timeString = '';
            }
            this._textCount.string = (timeString);
            this._textCount.node.active = (true);
            this._ImageCountBG.node.active = (true);
            if (countDownTime <= 3) {
                this._ImageCountBG.node.active = (false);
                this._playCountDownEffect(countDownTime);
                this._textCount.node.active = (false);
            }
        }
    }
    _playCountDownEffect(countDownTime) {
        var index = countDownTime;
        if (index >= 1 && index <= 3) {
            G_EffectGfxMgr.createPlayGfx(this._nodeCount, 'effect_jingjijishi_' + index, null, true);
        } else if (index == 0) {
            this._canEmbattle = false;
            G_EffectGfxMgr.createPlayGfx(this._nodeCount, 'effect_jingjijishi_suoding', null, true);
        }
    }
    _updateBet() {
        this._nodeBet1.active = (false);
        this._nodeBet2.active = (false);
        var isMatching = G_UserData.getCampRaceData().isMatching();
        if (isMatching) {
            return;
        }
        if (!G_UserData.getCampRaceData().isCanBetWithCamp(this._camp)) {
            return;
        }
        if (!this._playerData1 || !this._playerData2) {
            return;
        }
        this._nodeBet1.active = (true);
        this._nodeBet2.active = (true);
        if (G_UserData.getCampRaceData().isHaveBet()) {
            var betPos = G_UserData.getCampRaceData().getBetPosWithCamp(this._camp);
            for (var i = 1; i <= 2; i++) {
                var player = this['_playerData' + i];
                var userPos = player.getPosition(this._camp);
                this['_imageBet' + i].node.active = (userPos == betPos);
                this['_buttonBet' + i].node.active = (false);
                this['_imageBetBg' + i].node.active = (false);
            }
        } else {
            var curStatus = G_UserData.getCampRaceData().getCurStatusWithCamp(this._camp);
            if (curStatus && curStatus.getRound() > 1) {
                this._nodeBet1.active = (false);
                this._nodeBet2.active = (false);
            } else {
                this._nodeBet1.active = (true);
                this._nodeBet2.active = (true);
                for (var i = 1; i <= 2; i++) {
                    this['_imageBet' + i].node.active = (false);
                    this['_buttonBet' + i].node.active = (true);
                    this['_imageBetBg' + i].node.active = (true);
                }
            }
        }
    }
    _onBest8Click() {
        this._openPopupMap();
    }
    _onBetClick1() {
        this._onBetClick(1);
    }
    _onBetClick2() {
        this._onBetClick(2);
    }
    _onBetClick(index) {
        var player = this['_playerData' + index];
        var userPos = player.getPosition(this._camp);
        var title = Lang.get('camp_bet_alart_title');
        var content = Lang.get('camp_bet_alart', { name: player.getName() });
        let callback = function () {
            var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, CampRaceHelper.getBetGold());
            if (!success) {
                return;
            }
            G_UserData.getCampRaceData().c2sCampRaceBet(this._camp, userPos);
        }.bind(this);
        UIPopupHelper.popupSystemAlert(title, content, callback, null, (popup) => {
            popup.setCheckBoxVisible(false);
        })
    }
    _openPopupMap() {
        if (this._popupCampMap == null && !this._isLoadingCampMap) {
            this._isLoadingCampMap = true;
            G_SceneManager.showDialog('prefab/campRace/PopupCampMap', function (popupView) {
                this._popupCampMap = popupView;
                this._isLoadingCampMap = false;
                this._popupCampMapSignal = this._popupCampMap.signal.add(handler(this, this._onPopupCampMapClose));
                this._panelDesign.active = (false);
                popupView.openWithAction();
            }.bind(this), this._camp);
        }
    }
    _onPopupCampMapClose(event) {
        if (event == 'close') {
            this._popupCampMap = null;
            if (this._popupCampMapSignal) {
                this._popupCampMapSignal.remove();
                this._popupCampMapSignal = null;
            }
            if (G_UserData.getCampRaceData().getFinalStatusByCamp(this._camp) == CampRaceConst.PLAY_OFF_ROUND_ALL) {
                this._textChampionTip.node.active = (true);
                this._panelDesign.active = (false);
            } else {
                this._textChampionTip.node.active = (false);
                this._panelDesign.active = (true);
            }
        }
    }
    _onEventAddBattleReport(eventName, report) {
        this._canEmbattle = true;
        this._recvReport(report);
    }
    _openPopupAlert() {
        UIPopupHelper.popupSystemAlert(Lang.get('camp_lose_title'), Lang.get('camp_lose_content'), null, null, (popup: PopupSystemAlert) => {
            popup.showGoButton(Lang.get('fight_kill_comfirm'));
            popup.setCheckBoxVisible(false);
        })
    }
    _onEventUpdateState(eventName, camp) {
        if (this._camp != camp) {
            return;
        }
        var curStatus = G_UserData.getCampRaceData().getCurStatusWithCamp(this._camp);
        if (curStatus) {
            if (curStatus.isChangeFinalStatus()) {
                this._camp = G_UserData.getCampRaceData().findCurWatchCamp();
                console.log('sent get last rank  ---- ', this._camp);
                G_UserData.getCampRaceData().c2sGetCampRaceLastRank(this._camp);
            }
        }
    }
    _onEventCampBetSuccess(eventName) {
        G_Prompt.showTip(Lang.get('camp_bet_success'));
    }
    _onEventCampUpdateBet(eventName) {
        this._updateBet();
    }
}