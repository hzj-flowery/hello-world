import SingleRaceReportNode1 from "./SingleRaceReportNode1";

import SingleRaceReportNode2 from "./SingleRaceReportNode2";

import SingleRaceReportNode3 from "./SingleRaceReportNode3";

import SingleRaceReportNode4 from "./SingleRaceReportNode4";

import SingleRaceReportNode5 from "./SingleRaceReportNode5";

import SingleRaceReportNode6 from "./SingleRaceReportNode6";

import SingleRaceReportNode7 from "./SingleRaceReportNode7";

import SingleRaceReportNode8 from "./SingleRaceReportNode8";

import SingleRaceLeftPlayerNode from "./SingleRaceLeftPlayerNode";

import SingleRaceRightPlayerNode from "./SingleRaceRightPlayerNode";

import SingleRaceReportNode9 from "./SingleRaceReportNode9";

import SingleRaceChampionPlayerNode from "./SingleRaceChampionPlayerNode";

import SingleRaceRankNode from "./SingleRaceRankNode";

import { Path } from "../../../utils/Path";

import { SingleRaceConst } from "../../../const/SingleRaceConst";

import SingleRacePlayerNode from "./SingleRacePlayerNode";

import { handler } from "../../../utils/handler";

import SingleRaceReportNode from "./SingleRaceReportNode";

import { G_SignalManager, G_UserData, G_Prompt, G_ResolutionManager } from "../../../init";

import { SignalConst } from "../../../const/SignalConst";

import PopupSingleRaceReplay from "./PopupSingleRaceReplay";

import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";

const { ccclass, property } = cc._decorator;
var SCALE_LARGE = 1;
var SCALE_SMALL = 0.38;

@ccclass
export default class SingleRaceMapNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMap: cc.Node = null;

    @property({
        type: SingleRaceReportNode1,
        visible: true
    })
    _nodeReport33: SingleRaceReportNode1 = null;

    @property({
        type: SingleRaceReportNode1,
        visible: true
    })
    _nodeReport34: SingleRaceReportNode1 = null;

    @property({
        type: SingleRaceReportNode1,
        visible: true
    })
    _nodeReport35: SingleRaceReportNode1 = null;

    @property({
        type: SingleRaceReportNode1,
        visible: true
    })
    _nodeReport36: SingleRaceReportNode1 = null;

    @property({
        type: SingleRaceReportNode1,
        visible: true
    })
    _nodeReport37: SingleRaceReportNode1 = null;

    @property({
        type: SingleRaceReportNode1,
        visible: true
    })
    _nodeReport38: SingleRaceReportNode1 = null;

    @property({
        type: SingleRaceReportNode1,
        visible: true
    })
    _nodeReport39: SingleRaceReportNode1 = null;

    @property({
        type: SingleRaceReportNode1,
        visible: true
    })
    _nodeReport40: SingleRaceReportNode1 = null;

    @property({
        type: SingleRaceReportNode2,
        visible: true
    })
    _nodeReport41: SingleRaceReportNode2 = null;

    @property({
        type: SingleRaceReportNode2,
        visible: true
    })
    _nodeReport42: SingleRaceReportNode2 = null;

    @property({
        type: SingleRaceReportNode2,
        visible: true
    })
    _nodeReport43: SingleRaceReportNode2 = null;

    @property({
        type: SingleRaceReportNode2,
        visible: true
    })
    _nodeReport44: SingleRaceReportNode2 = null;

    @property({
        type: SingleRaceReportNode2,
        visible: true
    })
    _nodeReport45: SingleRaceReportNode2 = null;

    @property({
        type: SingleRaceReportNode2,
        visible: true
    })
    _nodeReport46: SingleRaceReportNode2 = null;

    @property({
        type: SingleRaceReportNode2,
        visible: true
    })
    _nodeReport47: SingleRaceReportNode2 = null;

    @property({
        type: SingleRaceReportNode2,
        visible: true
    })
    _nodeReport48: SingleRaceReportNode2 = null;

    @property({
        type: SingleRaceReportNode3,
        visible: true
    })
    _nodeReport49: SingleRaceReportNode3 = null;

    @property({
        type: SingleRaceReportNode3,
        visible: true
    })
    _nodeReport50: SingleRaceReportNode3 = null;

    @property({
        type: SingleRaceReportNode3,
        visible: true
    })
    _nodeReport51: SingleRaceReportNode3 = null;

    @property({
        type: SingleRaceReportNode3,
        visible: true
    })
    _nodeReport52: SingleRaceReportNode3 = null;

    @property({
        type: SingleRaceReportNode4,
        visible: true
    })
    _nodeReport53: SingleRaceReportNode4 = null;

    @property({
        type: SingleRaceReportNode4,
        visible: true
    })
    _nodeReport54: SingleRaceReportNode4 = null;

    @property({
        type: SingleRaceReportNode4,
        visible: true
    })
    _nodeReport55: SingleRaceReportNode4 = null;

    @property({
        type: SingleRaceReportNode4,
        visible: true
    })
    _nodeReport56: SingleRaceReportNode4 = null;

    @property({
        type: SingleRaceReportNode5,
        visible: true
    })
    _nodeReport57: SingleRaceReportNode5 = null;

    @property({
        type: SingleRaceReportNode5,
        visible: true
    })
    _nodeReport58: SingleRaceReportNode5 = null;

    @property({
        type: SingleRaceReportNode6,
        visible: true
    })
    _nodeReport59: SingleRaceReportNode6 = null;

    @property({
        type: SingleRaceReportNode6,
        visible: true
    })
    _nodeReport60: SingleRaceReportNode6 = null;

    @property({
        type: SingleRaceReportNode7,
        visible: true
    })
    _nodeReport61: SingleRaceReportNode7 = null;

    @property({
        type: SingleRaceReportNode8,
        visible: true
    })
    _nodeReport62: SingleRaceReportNode8 = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer1: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer2: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer3: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer4: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer5: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer6: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer7: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer8: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer9: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer10: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer11: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer12: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer13: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer14: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer15: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer16: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer17: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer18: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer19: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer20: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer21: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer22: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer23: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer24: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer25: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer26: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer27: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer28: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer29: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer30: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer31: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer32: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer33: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer34: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer35: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer36: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer37: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer38: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer39: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer40: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer41: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer42: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer43: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer44: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer45: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer46: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer47: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer48: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer49: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer50: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer51: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer52: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer53: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer54: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer55: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer56: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer57: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer58: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer59: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer60: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceLeftPlayerNode,
        visible: true
    })
    _nodePlayer61: SingleRaceLeftPlayerNode = null;

    @property({
        type: SingleRaceRightPlayerNode,
        visible: true
    })
    _nodePlayer62: SingleRaceRightPlayerNode = null;

    @property({
        type: SingleRaceReportNode9,
        visible: true
    })
    _nodeReport63: SingleRaceReportNode9 = null;

    @property({
        type: SingleRaceChampionPlayerNode,
        visible: true
    })
    _nodePlayer63: SingleRaceChampionPlayerNode = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    @property({
        type: SingleRaceRankNode,
        visible: true
    })
    _rank: SingleRaceRankNode = null;

    @property({ type: cc.Prefab, visible: true })
    _heroNode: cc.Prefab = null;

    _parentView: any;
    _scrollView: any;
    _curState: any;
    _curScale: any;
    _lastClickTime: number;
    _lastClickPos: cc.Vec2;
    _signalSingleRaceUpdatePkInfo: any;
    _signalSingleRaceStatusChange: any;
    _signalSingleRaceGetPkInfoSuccess: any;
    _signalGetSingleRacePositionInfo: any;

    ctor(parentView) {
        this._parentView = parentView;
        this._scrollView = parentView._scrollView;
        this._curState = parentView._curState;
    }
    onLoad() {
        this._initData();
        this._initView();
    }
    _initData() {
        if (this._curState == SingleRaceConst.MAP_STATE_LARGE) {
            this._curScale = SCALE_LARGE;
        } else {
            this._curScale = SCALE_SMALL;
        }
        this._lastClickTime = 0;
        this._lastClickPos = cc.v2(0, 0);
    }
    _initView() {
        var size = this._getSize();
        this._scrollView.content.setContentSize(size);
        this.node.setScale(this._curScale);
        for (var i = 1; i <= 63; i++) {
            this['_nodePlayer' + i].ctor(i, handler(this, this._onClickPlayer), this._heroNode);
            this['_player' + i] = this['_nodePlayer' + i];
        }
        for (var i = 33; i <= 63; i++) {
            this['_nodeReport' + i].ctor(i, handler(this, this._onLookClick));
            this['_report' + i] = this['_nodeReport' + i];
        }
        //  this._panelTouch.getComponent(cc.BlockInputEvents).enabled = false;
        UIHelper.addEventListenerToNode(this.node, this._panelTouch, 'SingleRaceMapNode', '_onClickPanelTouch')
       // this._panelTouch.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this, false);
    }

    onEnable() {
        this._signalSingleRaceUpdatePkInfo = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_UPDATE_PK_INFO_SUCCESS, handler(this, this._onEventRaceUpdatePkInfo));
        this._signalSingleRaceStatusChange = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_STATUS_CHANGE, handler(this, this._onEventRaceStatusChange));
        this._signalSingleRaceGetPkInfoSuccess = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_GET_PK_INFO_SUCCESS, handler(this, this._onEventSingleRaceGetPkInfoSuccess));
        this._updateData();
        this._updateView();
    }
    onDisable() {
        this._signalSingleRaceUpdatePkInfo.remove();
        this._signalSingleRaceUpdatePkInfo = null;
        this._signalSingleRaceStatusChange.remove();
        this._signalSingleRaceStatusChange = null;
        this._signalSingleRaceGetPkInfoSuccess.remove();
        this._signalSingleRaceGetPkInfoSuccess = null;
    }
    onShow() {
        this._signalGetSingleRacePositionInfo = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_GET_POSITION_INFO, handler(this, this._onEventGetSingleRacePositionInfo));
    }
    onHide() {
        if (this._signalGetSingleRacePositionInfo) {
            this._signalGetSingleRacePositionInfo.remove();
            this._signalGetSingleRacePositionInfo = null;
        }
    }

    onDestroy() {
        this.onHide();
    }
    _updateData() {
    }
    _updateView() {
        this._updatePlayers();
        this._updateReports();
        this._updateFontSize();
        this._updateRankScale();
        this._rank.updateUI();
    }
    _updatePlayers() {
        var finalPos = G_UserData.getSingleRace().getSelfFinalPos();
        var tbPos = G_UserData.getSingleRace().getSameServerPlayerFinalPos();
        var isSameServer = function (filterPos, pos) {
            for (var k in filterPos) {
                var v = filterPos[k];
                if (v == pos) {
                    return true;
                }
            }
            return false;
        };
        for (let i = 1; i <= 63; i++) {
            let userData = G_UserData.getSingleRace().getUserDataWithPosition(i);
            let state = G_UserData.getSingleRace().getResultStateWithPosition(i);
            this.scheduleOnce(()=>{
                this['_player' + i].updateUI(userData, state);
            }, i *0.04);

          
            this['_player' + i].removeEffect();
            if (i == finalPos) {
                this['_player' + i].showEffect('effect_touxiangziji');
            } else if (isSameServer(tbPos, i)) {
                this['_player' + i].showEffect('effect_taozhuang_orange');
            }
            this['_player' + i].setSelfModule(i == finalPos);
        }
    }
    _updateReports() {
        for (let i = 33; i <= 63; i++) {
            this.scheduleOnce(()=>{
                this['_report' + i].updateUI();
            }, i *0.02);
        }
    }
    _onLookClick(pos, state) {
        if (state == SingleRaceConst.MATCH_STATE_ING) {
            G_UserData.getSingleRace().setCurWatchPos(pos);
            G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_SWITCH_LAYER, SingleRaceConst.LAYER_STATE_BATTLE);
        } else if (state == SingleRaceConst.MATCH_STATE_AFTER) {
            var replays = G_UserData.getSingleRace().getReportData(pos);
            if (replays) {
                PopupSingleRaceReplay.getIns(PopupSingleRaceReplay, (p: PopupSingleRaceReplay) => {
                    p.ctor(replays);
                    p.openWithAction();
                })
            } else {
                G_Prompt.showTip(Lang.get('single_race_reports_empty_tip'));
            }
        }
    }
    _onClickPlayer(userId, pos, power) {
        var userDetailData = G_UserData.getSingleRace().getUserDetailInfoWithId(userId);
        if (userDetailData) {
            this._popupUserDetail(userDetailData, power);
        } else {
            G_UserData.getSingleRace().c2sGetSingleRacePositionInfo(pos);
        }
    }
    _popupUserDetail(userDetailData, power) {
        UIPopupHelper.popupUserDetailInfor(userDetailData, power);
    }
    _onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound) {
        if (reports.length > 0 || isChangeRound) {
            this._updateData();
            this._updateView();
        }
        if (isChangeRound) {
            this._parentView.updateProcessTitle();
            this._parentView.playRoundEffect();
            if (G_UserData.getSingleRace().getNow_round() == 1 && G_UserData.getSingleRace().isSelfEliminated() == false) {
                var racePos = G_UserData.getSingleRace().findSelfRacePos();
                G_UserData.getSingleRace().setCurWatchPos(racePos);
                G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_SWITCH_LAYER, SingleRaceConst.LAYER_STATE_BATTLE);
            }
        }
    }
    _onEventRaceStatusChange(eventName, status) {
        if (status == SingleRaceConst.RACE_STATE_ING) {
            G_UserData.getSingleRace().c2sGetSingleRacePkInfo();
            this._parentView.playFire();
            this._parentView.updateGuessRedPoint();
        }
    }
    _onEventSingleRaceGetPkInfoSuccess() {
        this._updateData();
        this._updateView();
        this._rank.updateUI();
    }
    _onEventGetSingleRacePositionInfo(eventName, userData, userDetailData) {
        if (this._popupUserDetail) {
            var power = userData.getPower();
            this._popupUserDetail(userDetailData, power);
        }
    }
    changeScale(state, transAnchorPoint) {
        this._curState = state;
        if (state == SingleRaceConst.MAP_STATE_LARGE) {
            this._changeBigger(transAnchorPoint);
        } else if (state == SingleRaceConst.MAP_STATE_SMALL) {
            this._changeSmaller(transAnchorPoint);
        }
    }
    _changeBigger(transAnchorPoint) {
        if (transAnchorPoint == null) {
            transAnchorPoint = this._getDefaultAnchorPoint();
        }
        this._curScale = SCALE_LARGE;
        this._scrollView.stopAutoScroll();
        this._updateFontSize();

        var size = this._getSize();
        this._scrollView.content.setContentSize(size);
        var posY = -transAnchorPoint.y * size.height;
        var posX = -transAnchorPoint.x * (size.width - 1136);

        // var srcAnchorPoint = this._panelMap.getAnchorPoint();
        // var pos = this.node.getPosition();
        // this._panelMap.setAnchorPoint(transAnchorPoint);
        // var transPos = cc.v2(pos.x * transAnchorPoint.x / srcAnchorPoint.x, pos.y * transAnchorPoint.y / srcAnchorPoint.y);
        // var size = this._getSize();
        // this._scrollView.content.setContentSize(size);
        // var tarPos = cc.v2(transPos.x * SCALE_LARGE / SCALE_SMALL, transPos.y * SCALE_LARGE / SCALE_SMALL);
        // this.node.setPosition(tarPos);
        this._scrollView.content.runAction(cc.moveTo(0.3, posX, posY));
        var scaleTo = cc.scaleTo(0.3, this._curScale);
        this.node.runAction(scaleTo);
        this._updateRankScale();
    }

    _changeSmaller(transAnchorPoint) {
        if (transAnchorPoint == null) {
            transAnchorPoint = this._getDefaultAnchorPoint();
        }
        this._curScale = SCALE_SMALL;
        this._scrollView.stopAutoScroll();
        this._updateFontSize();
        // var srcAnchorPoint = this._panelMap.getAnchorPoint();
        // var pos = this.node.getPosition()
        // this._panelMap.setAnchorPoint(transAnchorPoint);
        // var transPos = cc.v2(pos.x * transAnchorPoint.x / srcAnchorPoint.x, pos.y * transAnchorPoint.y / srcAnchorPoint.y);
        var size = this._getSize();
        this._scrollView.content.setContentSize(size);
        // var tarPos = cc.v2(transPos.x * SCALE_SMALL / SCALE_LARGE, transPos.y * SCALE_SMALL / SCALE_LARGE);
        // this.node.setPosition(tarPos);
        this._scrollView.content.runAction(cc.moveTo(0.3, cc.v2(0, 0)));
        var scaleTo = cc.scaleTo(0.3, this._curScale);
        var func = cc.callFunc(function () {
            // this._panelMap.setAnchorPoint(cc.v2(0.5, 0.5));
            // var size = this._getSize();
            // this.node.setPosition(cc.v2(size.width / 2, size.height / 2));
        }.bind(this));
        var seq = cc.sequence(scaleTo, func);
        this.node.runAction(seq);
        this._updateRankScale();
    }
    _updateFontSize() {
        if (this._curScale == SCALE_LARGE) {
            for (var i = 1; i <= 63; i++) {
                this['_player' + i].fontSizeSmaller();
            }
            for (var i = 33; i <= 63; i++) {
                this['_report' + i].fontSizeSmaller();
            }
        } else if (this._curScale == SCALE_SMALL) {
            for (var i = 1; i <= 63; i++) {
                this['_player' + i].fontSizeBigger();
            }
            for (var i = 33; i <= 63; i++) {
                this['_report' + i].fontSizeBigger();
            }
        }
    }
    _updateRankScale() {
        if (this._curScale == SCALE_LARGE) {
            this._rank.node.setScale(1);
        } else if (this._curScale == SCALE_SMALL) {
            this._rank.node.setScale(2.3);
        }
    }
    _getSize() {
        var size = this._panelMap.getContentSize();
        if (this._curScale == SCALE_SMALL) {
            return cc.size(1136, 592);
        } else {
            var width = Math.ceil(size.width * this._curScale);
            var height = Math.ceil(size.height * this._curScale);
            return cc.size(width, height);
        }
    }
    _getDefaultAnchorPoint() {
        var worldPos = cc.v2(G_ResolutionManager.getDesignWidth() * 0.5, G_ResolutionManager.getDesignHeight() * 0.5);
        var focusPos = G_UserData.getSingleRace().getCurFocusPos();
        if (focusPos > 0) {
            worldPos = this['_nodePlayer' + focusPos].node.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        var anchorPoint = this._getAnchorPoint(worldPos);
        return anchorPoint;
    }
    _getAnchorPoint(worldPos) {
        var pos = this._panelTouch.convertToNodeSpace(worldPos);
        var size = this._panelMap.getContentSize();
        var anchorPoint = cc.v2(pos.x / size.width - 0.5, pos.y / size.height - 0.5);
        return anchorPoint;
    }
    _onTouchBegan(touch, event) {
        if (this._isDoubleClick(touch)) {
            var transAnchorPoint = this._getAnchorPoint(touch.getLocation());
            if (this._curState == SingleRaceConst.MAP_STATE_SMALL) {
                this.changeScale(SingleRaceConst.MAP_STATE_LARGE, transAnchorPoint);
            } else {
                this.changeScale(SingleRaceConst.MAP_STATE_SMALL, transAnchorPoint);
            }
            this._parentView.updateInfo(this._curState);
        }
    }

    _onClickPanelTouch(e:cc.Event.EventMouse) {
        if (this._isDoubleClick(e)) {
            var transAnchorPoint = this._getAnchorPoint(e.getLocation());
            if (this._curState == SingleRaceConst.MAP_STATE_SMALL) {
                this.changeScale(SingleRaceConst.MAP_STATE_LARGE, transAnchorPoint);
            } else {
                this.changeScale(SingleRaceConst.MAP_STATE_SMALL, transAnchorPoint);
            }
            this._parentView.updateInfo(this._curState);
        }
    }

    _isDoubleClick(touch) {
        var curTime = new Date().getTime();
        var diffTime = curTime - this._lastClickTime;
        this._lastClickTime = curTime;
        var curPos = touch.getLocation();
        var diffX = Math.abs(curPos.x - this._lastClickPos.x);
        var diffY = Math.abs(curPos.y - this._lastClickPos.y);
        this._lastClickPos = curPos;
        if (diffTime < 300 && diffX < 20 && diffY < 20) {
            return true;
        } else {
            return false;
        }
    }
}