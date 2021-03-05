const { ccclass, property } = cc._decorator;

import { DataConst } from '../../../const/DataConst';
import { SignalConst } from '../../../const/SignalConst';
import { SingleRaceConst } from '../../../const/SingleRaceConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { ReportParser } from '../../../fight/report/ReportParser';
import { G_EffectGfxMgr, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import SingleRaceBattlePlayerNode from './SingleRaceBattlePlayerNode';



@ccclass
export default class SingleRaceBattleLayer extends ViewBase {
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
        type: cc.Label,
        visible: true
    })
    _textOpenTitle: cc.Label = null;
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
        type: SingleRaceBattlePlayerNode,
        visible: true
    })
    _nodePlayerInfo: SingleRaceBattlePlayerNode = null;
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
        type: cc.Label,
        visible: true
    })
    _textMoveTip: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textWaitTip: cc.Label = null;
    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;
    @property(cc.Prefab)
    commonHeroAvatar: cc.Prefab = null;

    _parentView: any;
    _avatars: { 1: {}; 2: {}; };
    _index: number;
    _targetTime: number;
    _canEmbattle: boolean;
    _matchData: any;
    _isMatchFinish: boolean;
    _curWatchPos: number;
    _popupAlert: any;
    _popupAlertSingal: any;
    _curReportId: number;
    _playerInfo: SingleRaceBattlePlayerNode;
    _signalSupportSuccess: any;
    _signalChangeEmbattleSuccess: any;
    _signalEmbattleUpdateSuccess: any;
    _signalSingleRaceUpdatePkInfo: any;
    _signalGetBattleReport: any;
    _userData1: any;
    _userData2: any;
    _scheduleHandler: any;

    _effectNode: cc.Node;
    _isEnable1 = false;
    _isEnable2 = false;

    ctor(parentView) {
        this._parentView = parentView;
        this._buttonBet1.addClickEventListenerEx(handler(this, this._onBetClick1));
        this._buttonBet2.addClickEventListenerEx(handler(this, this._onBetClick2));
    }
    onCreate() {
        this.setSceneSize();
        this.updateSceneId(17);
        this._initData();
        this._initView();
    }
    _initData() {
        this._avatars = {
            [1]: {},
            [2]: {}
        };
        this._index = 0;
        this._targetTime = 0;
        this._canEmbattle = true;
        for (var i = 1; i <= 2; i++) {
            this['_userData' + i] = null;
            this['_userPos' + i] = 0;
        }
        this._matchData = null;
        this._isMatchFinish = false;
        this._curWatchPos = 0;
        this._popupAlert = null;
        this._popupAlertSingal = null;
        this._curReportId = 0;
    }
    _initView() {
        this._commonChat.setDanmuVisible(false);
        this._playerInfo = this._nodePlayerInfo;
        for (var i = 1; i <= 2; i++) {
            this['_panelPlayer' + i].on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this, false);
            this['_panelPlayer' + i].on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this, false);
            this['_panelPlayer' + i].on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this, false);
            this['_panelPlayer' + i].on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this, false);
            this['_buttonBet' + i].setString(Lang.get('camp_bet_btn'));
        }
        this._ImageCountBG.node.active = (false);
    }
    onEnter() {
        this._signalSupportSuccess = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_SUPPORT_SUCCESS, handler(this, this._onEventSupportSuccess));
        this._signalChangeEmbattleSuccess = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_CHANGE_EMBATTLE_SUCCESS, handler(this, this._onEventChangeEmbattleSuccess));
        this._signalEmbattleUpdateSuccess = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_EMBATTlE_UPDATE, handler(this, this._onEventEmbattleUpdateSuccess));
        this._signalSingleRaceUpdatePkInfo = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_UPDATE_PK_INFO_SUCCESS, handler(this, this._onEventRaceUpdatePkInfo));
        this._startCountDown();
    }
    onExit() {
        if (this._popupAlert) {
            this._popupAlert.close();
        }
        this._stopCountDown();
        this.onHide();
        this._effectNode && this._effectNode.removeFromParent();
        this._signalSupportSuccess.remove();
        this._signalSupportSuccess = null;
        this._signalChangeEmbattleSuccess.remove();
        this._signalChangeEmbattleSuccess = null;
        this._signalEmbattleUpdateSuccess.remove();
        this._signalEmbattleUpdateSuccess = null;
        this._signalSingleRaceUpdatePkInfo.remove();
        this._signalSingleRaceUpdatePkInfo = null;
    }
    onShow() {
        this._signalGetBattleReport = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_GET_REPORT, handler(this, this._onEventGetReport));
    }
    onHide() {
        if (this._signalGetBattleReport) {
            this._signalGetBattleReport.remove();
            this._signalGetBattleReport = null;
        }
    }
    updateInfo() {
        this._updateData();
        this._updateView();
        this._updateAvatars();
    }
    _updateData() {
        this._curWatchPos = Number(G_UserData.getSingleRace().getCurWatchPos());
        this._updateUserData();
        this._updateFinishState();
        this._updateMatchData();
        this._updateTime();
    }
    _updateUserData() {
        var preIndex = G_UserData.getSingleRace().getPreIndexOfPosition(this._curWatchPos);
        for (var i = 1; i <= 2; i++) {
            var index = preIndex[i -1];
            this['_userData' + i] = G_UserData.getSingleRace().getUserDataWithPosition(index);
            this['_userPos' + i] = index;
        }
    }
    _updateFinishState() {
        if (this._userData1 && this._userData2) {
            var isMatchEnd = G_UserData.getSingleRace().isMatchEndWithPosition(this._curWatchPos);
            this._isMatchFinish = isMatchEnd;
        } else {
            this._isMatchFinish = true;
        }
    }
    _updateMatchData() {
        this._matchData = G_UserData.getSingleRace().getMatchDataWithPosition(this._curWatchPos);
   //   //assert((this._matchData, stringUtil.format('self._matchData is nil, curWatchPos = %d', [this._curWatchPos]));
    }
    _updateTime() {
        if (this._isMatchFinish) {
            return;
        }
        this._targetTime = G_UserData.getSingleRace().getRound_begin_time();
        var intervalPerRound = SingleRaceConst.getIntervalPerRound();
        var nowTime = G_ServerTime.getTime();
        while (this._targetTime <= nowTime) {
            this._targetTime = this._targetTime + intervalPerRound;
        }
    }
    _updateView() {
        this._updateRound();
        this._updatePlayerInfo();
        this._canEmbattle = true;
        this._updateBet();
        this._updateBetCount();
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
        var effectNode = null;
        if (index >= 1 && index <= 3) {
            effectNode = G_EffectGfxMgr.createPlayGfx(this._nodeCount, 'effect_jingjijishi_' + index, null, true);
        } else if (index == 0) {
            this._canEmbattle = false;
            effectNode = G_EffectGfxMgr.createPlayGfx(this._nodeCount, 'effect_jingjijishi_suoding', null, true);
        }
        effectNode.node.name = ('CountDownEffect');
        this._effectNode = effectNode.node;
    }
    _updateRound() {
        var roundDes = '';
        var titleDes = '';
        if (this._isMatchFinish) {
            titleDes = Lang.get('single_race_match_end');
        } else {
            var round = G_UserData.getSingleRace().getCurMatchIndexByPos(this._curWatchPos);
            roundDes = Lang.get('camp_round', { count: round });
            titleDes = Lang.get('single_race_match_countdown');
        }
        this._textRound.string = (roundDes);
        this._textOpenTitle.string = (titleDes);
    }
    _updatePlayerInfo() {
        this._playerInfo.updateUI(this._curWatchPos);
        this._isEnable1 = this._isEnable2 = false;
        this._textMoveTip.node.active = (false);
        var selfId = G_UserData.getBase().getId();
        if (this._userData1 && this._userData1.getUser_id() == selfId) {
            this._isEnable1 = true;
            this._textMoveTip.node.active = (true);
        } else if (this._userData2 && this._userData2.getUser_id() == selfId) {
            this._isEnable2 = true;
            this._textMoveTip.node.active = (true);
        }
    }
    _updateBet() {
        this._nodeBet1.active = (false);
        this._nodeBet2.active = (false);
        var isSelfEliminated = G_UserData.getSingleRace().isSelfEliminated();
        if (isSelfEliminated == false) {
            return;
        }
        if (!this._userData1 || !this._userData2) {
            return;
        }
        this._nodeBet1.active = (true);
        this._nodeBet2.active = (true);
        if (G_UserData.getSingleRace().isDidSupport()) {
            var betUserId = G_UserData.getSingleRace().getSupport_user_id();
            for (var i = 1; i <= 2; i++) {
                var userId = this['_userData' + i].getUser_id();
                this['_imageBet' + i].node.active = (betUserId == userId);
                this['_buttonBet' + i].node.active = (false);
            }
        } else {
            var matchIndex = G_UserData.getSingleRace().getCurMatchIndexByPos(this._curWatchPos);
            if (matchIndex > 1) {
                this._nodeBet1.active = (false);
                this._nodeBet2.active = (false);
            } else {
                this._nodeBet1.active = (true);
                this._nodeBet2.active = (true);
                for (var i = 1; i <= 2; i++) {
                    this['_imageBet' + i].node.active = (false);
                    this['_buttonBet' + i].node.active = (true);
                }
            }
        }
    }
    _updateBetCount() {
        var supportNums = [
            this._matchData.getAtk_user_support(),
            this._matchData.getDef_user_support()
        ];
        for (var i = 1; i <= 2; i++) {
            var textTip = RichTextExtend.createWithContent(Lang.get('single_race_support_num', { num: supportNums[i-1] }));
        //    var imageSize = this['_imageBetBg' + i].node.getContentSize();
         //   textTip.node.setPosition(cc.v2(imageSize.width / 2, imageSize.height / 2));
            this['_imageBetBg' + i].node.removeAllChildren();
            this['_imageBetBg' + i].node.addChild(textTip.node);
        }
    }
    _updateAvatars() {
        for (var i = 1; i <= 2; i++) {
            this._updateAvatarWithSide(i);
        }
    }
    _updateAvatarWithSide(side) {
        var userData = this['_userData' + side];
        if (userData) {
            var formation = userData.getFormation();
            for (var i in formation) {
                var id = formation[i];
                var index = Number(i) + 1;
                var hero = userData.getHeroDataWithId(id);
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
                    var avatarBaseId = hero.getAvartar_base_id();
                    this._avatars[side][index].updateUI(baseId, null, null, limitLevel, null, null, limitRedLevel);
                    this._avatars[side][index].showAvatarEffect(avatarBaseId > 0);
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
    _setAvatarEmpty(side) {
        for (var i = 1; i <= 6; i++) {
            if (this._avatars[side][i]) {
                this._avatars[side][i].node.active = (false);
            }
        }
    }
    _resetAvatarPos(side) {
        for (var i = 1; i <= 6; i++) {
            if (this._avatars[side][i]) {
                var pos = this['_panelPlayer' + side].getChildByName('ImageKnightPos' + i).getPosition();
                this._avatars[side][i].node.setPosition(cc.v2(pos.x, pos.y));
                this._avatars[side][i].node.zIndex = (i * 10);
            }
        }
        this._showHighLight(null, side);
    }
    _showHighLight(index, side) {
        for (var i = 1; i <= 6; i++) {
            var panel = this['_panelPlayer' + side].getChildByName('ImageKnightPos' + i);
            var image = panel.getChildByName('ImageHighLight');
            if (i == index) {
                image.active = (true);
            } else {
                image.active = (false);
            }
        }
    }
    _getIndexSelected(touch, side) {
        var touchPos = touch.getStartLocation();
        for (var k in this._avatars[side]) {
            var spine = this._avatars[side][k];
            var location = spine.getSpineHero().convertToNodeSpaceAR(touchPos);
            var rect = spine.getSpineHero().getBoundingBox();
            if (rect.contains(location)) {
                return k;
            }
        }
        return null;
    }
    _getIndexMoveOn(touchPos, side) {
        for (var i = 1; i <= 6; i++) {
            var panel = this['_panelPlayer' + side].getChildByName('ImageKnightPos' + i);
            var rect = panel.getBoundingBox();
            if (rect.contains(touchPos)) {
                return i;
            }
        }
        return null;
    }
    _checkMoveHighLight(touchPos, side) {
        if (this._index == 0) {
            return;
        }
        var nowIndex = this._getIndexMoveOn(touchPos, side);
        this._showHighLight(nowIndex, side);
    }
    _moveSpinePos(position, side) {
        var moveNode = this._avatars[side][this._index];
        moveNode.node.setPosition(position);
        moveNode.node.zIndex = (100);
    }
    _moveCanceled(side) {
        this._resetAvatarPos(side);
    }
    _moveEnded(endPos, side) {
        var endIndex = this._getIndexMoveOn(endPos, side);
        if (!endIndex || !this._canEmbattle) {
            this._moveCanceled(side);
            return;
        }
        var embattle = this['_userData' + side].getEmbattle();
        for (var index = 0; index < 6; index++) {
            if (embattle[index] == endIndex) {
                embattle[index] = this._index;
            } else if (embattle[index] == this._index) {
                embattle[index] = endIndex;
            }
        }
        var userId = G_UserData.getBase().getId();
        G_UserData.getSingleRace().c2sSingleRaceChangeEmbattle(userId, embattle);
    }

    _onTouchBegan(touch:cc.Event.EventTouch) {
        var side = touch.target.name == '_panelPlayer1' ? 1 : 2;
        var b = touch.currentTarget.name;
        if (!this['_isEnable' + side]) return;

        var index = this._getIndexSelected(touch, side);
        if (index && this._canEmbattle) {
            this._index = Number(index);
            this._showHighLight(index, side);
            var touchPos = this['_panelPlayer' + side].convertToNodeSpaceAR(touch.getStartLocation());
            this._moveSpinePos(touchPos, side);
        }
        return false;
    }

    _onTouchMoved(touch:cc.Event.EventTouch) {
        var side = touch.target.name == '_panelPlayer1' ? 1 : 2;
        var b = touch.currentTarget.name;
        if (!this['_isEnable' + side]) return;

        if (this._index != 0) {
            var movePos = this['_panelPlayer' + side].convertToNodeSpaceAR(touch.getLocation());
            this._moveSpinePos(movePos, side);
            this._checkMoveHighLight(movePos, side);
        }
    }
    _onTouchEnded(touch:cc.Event.EventTouch) {
        var side = touch.target.name == '_panelPlayer1' ? 1 : 2;
        var b = touch.currentTarget.name;
        if (!this['_isEnable' + side]) return;

        if (this._index != 0) {
            var endPos = this['_panelPlayer' + side].convertToNodeSpaceAR(touch.getLocation());
            this._moveEnded(endPos, side);
            this._index = 0;
        }
    }
    _onTouchCancel(touch:cc.Event.EventTouch) {
        var side = touch.target.name == '_panelPlayer1' ? 1 : 2;
        var b = touch.currentTarget.name;
        if (!this['_isEnable' + side]) return;

        if (this._index != 0) {
            this._moveCanceled(side);
            this._index = 0;
        }
    }

    _onBetClick1() {
        this._onBetClick(1);
    }
    _onBetClick2() {
        this._onBetClick(2);
    }
    _onBetClick(index) {
        var userData = this['_userData' + index];
        var title = Lang.get('camp_bet_alart_title');
        var content = Lang.get('camp_bet_alart', { name: userData.getUser_name() });
        let callback = function() {
            var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, SingleRaceConst.getBidCost());
            if (!success) {
                return;
            }
            var userId = userData.getUser_id();
            G_UserData.getSingleRace().c2sSingleRaceSupport(this._curWatchPos, userId);
        }.bind(this);
        UIPopupHelper.popupSystemAlert(title, content, callback, null, (p) => {
            this._popupAlert = p;
            this._popupAlertSingal = this._popupAlert.signal.add(handler(this, this._onPopupAlertClose));
            this._popupAlert.setCheckBoxVisible(false);
        })

    }
    _onPopupAlertClose(event) {
        if (event == 'close') {
            this._popupAlert = null;
            if (this._popupAlertSingal) {
                this._popupAlertSingal.remove();
                this._popupAlertSingal = null;
            }
        }
    }
    _onEventSupportSuccess(eventName) {
        G_Prompt.showTip(Lang.get('camp_bet_success'));
        this._updateUserData();
        this._updateBet();
    }
    _onEventChangeEmbattleSuccess(eventName) {
        this._updateUserData();
        this._updateAvatars();
    }
    _onEventEmbattleUpdateSuccess(eventName, userData) {
        for (var i = 1; i <= 2; i++) {
            if (this['_userData' + i] && this['_userData' + i].getUser_id() == userData.getUser_id()) {
                this['_userData' + i] = userData;
                this._updateAvatars();
            }
        }
    }
    _onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound) {
        var curReportId = 0;
        for (var i in reports) {
            var report = reports[i];
            var pos = report['position'];
            if (pos == this._curWatchPos) {
                curReportId = report['report_id'];
                break;
            }
        }
        var needUpdate = false;
        for (i in pkInfos) {
            var info = pkInfos[i];
            var pos = info['position'];
            if (pos == this._curWatchPos) {
                needUpdate = true;
                break;
            }
        }
        if (curReportId > 0) {
            G_UserData.getSingleRace().c2sGetBattleReport(curReportId);
            this._curReportId = curReportId;
        } else if (needUpdate || isChangeRound) {
            this._updateData();
            this._updateView();
            this._updateAvatars();
            this._parentView.updateTitle();
        }
    }
    _onEventGetReport(eventName, battleReport, id) {
        function enterFightView() {
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var leftName = reportData.getLeftName();
            var leftOfficer = reportData.getAttackOfficerLevel();
            var rightName = reportData.getRightName();
            var rightOfficer = reportData.getDefenseOfficerLevel();
            var winPos = 1;
            if (!reportData.getIsWin()) {
                winPos = 2;
            }
            var battleData = BattleDataHelper.parseSingleRace(leftName, rightName, leftOfficer, rightOfficer, winPos);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        if (id == this._curReportId) {
            G_SceneManager.registerGetReport(battleReport, function () {
                enterFightView();
            });
        }
    }
}