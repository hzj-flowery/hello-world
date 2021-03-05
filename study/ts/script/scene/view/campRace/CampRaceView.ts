const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import ViewBase from '../../ViewBase';
import { G_SignalManager, G_UserData, G_SceneManager, G_EffectGfxMgr } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import CampRaceSignin from './CampRaceSignin';
import CampRacePreMatch from './CampRacePreMatch';
import CampRacePlayOff from './CampRacePlayOff';
import { CampRaceConst } from '../../../const/CampRaceConst';
import { Path } from '../../../utils/Path';
import { FunctionConst } from '../../../const/FunctionConst';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { ReportParser } from '../../../fight/report/ReportParser';
import { AuctionConst } from '../../../const/AuctionConst';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';

var LAYER_INDEX_1 = 1;
var LAYER_INDEX_2 = 2;
var LAYER_INDEX_3 = 3;
var TITLE_IMG = [
    '',  //占位
    'txt_sys_com_zhenyingjingji',
    'txt_sys_com_yusai',
    'txt_sys_com_baqiangsai',
    'txt_sys_com_banjuesai',
    'txt_sys_com_juesai',
    'txt_sys_com_bisaijieshu'
];
@ccclass
export default class CampRaceView extends ViewBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBase: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCamp: cc.Sprite = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    @property(cc.Prefab)
    campRaceSignin: cc.Prefab = null;
    @property(cc.Prefab)
    campRacePreMatch: cc.Prefab = null;
    @property(cc.Prefab)
    campRacePlayOff: cc.Prefab = null;

    _curLayerIndex: number;
    _subLayers: {};
    _signalGetBattleReport: any;
    _signalGetBaseInfo: any;
    _signalUpdateState: any;
    _signalUpdateTitle: any;

    ctor() {
    }
    onCreate() {
        this.setSceneSize();
        this._initData();
        this._initView();
    }
    _initData() {
        this._topbarBase.setImageTitle('txt_sys_com_zhenyingjingji');
        this._topbarBase.setItemListVisible(false);
        this._curLayerIndex = 0;
        this._subLayers = {};
    }
    _initView() {
    }
    onEnter() {
        this._signalGetBattleReport = G_SignalManager.add(SignalConst.EVENT_GET_CAMP_REPORT, handler(this, this._onEventGetReport));
        this._signalGetBaseInfo = G_SignalManager.add(SignalConst.EVENT_GET_CAMP_BASE_INFO, handler(this, this._onEventBaseInfo));
        this._signalUpdateState = G_SignalManager.add(SignalConst.EVENT_CAMP_UPDATE_STATE, handler(this, this._onEventUpdateState));
        this._signalUpdateTitle = G_SignalManager.add(SignalConst.EVENT_CAMP_RACE_UPDATE_TITLE, handler(this, this._refreshTitle));
        this._updateSubLayer();
        this._refreshTitle();
        this._checkIsGetChampion();
    }
    onExit() {
        this._signalGetBattleReport.remove();
        this._signalGetBattleReport = null;
        this._signalGetBaseInfo.remove();
        this._signalGetBaseInfo = null;
        this._signalUpdateState.remove();
        this._signalUpdateState = null;
        this._signalUpdateTitle.remove();
        this._signalUpdateTitle = null;
    }
    _getCurSubLayer() {
        var subLayer = this._subLayers[this._curLayerIndex];
        if (subLayer == null) {
            subLayer = this._createSubLayer(this._curLayerIndex);
        }
        return subLayer;
    }
    _createSubLayer(layerIndex) {
        var subLayer = null;
        if (layerIndex == LAYER_INDEX_1) {
            subLayer = cc.instantiate(this.campRaceSignin).getComponent(CampRaceSignin);
        } else if (layerIndex == LAYER_INDEX_2) {
            subLayer = cc.instantiate(this.campRacePreMatch).getComponent(CampRacePreMatch);
        } else if (layerIndex == LAYER_INDEX_3) {
            subLayer = cc.instantiate(this.campRacePlayOff).getComponent(CampRacePlayOff);
        }
        if (subLayer) {
            this._nodeBase.addChild(subLayer.node);
            this._subLayers[layerIndex] = subLayer;
        }
        return subLayer;
    }
    _getLayerIndex(state) {
        var layerIndex = 0;
        if (state == CampRaceConst.STATE_PRE_OPEN) {
            layerIndex = LAYER_INDEX_1;
        } else if (state == CampRaceConst.STATE_PRE_MATCH) {
            if (!G_UserData.getCampRaceData().isSignUp()) {
                layerIndex = LAYER_INDEX_1;
            } else {
                layerIndex = LAYER_INDEX_2;
            }
        } else if (state == CampRaceConst.STATE_PLAY_OFF) {
            layerIndex = LAYER_INDEX_3;
        }
        return layerIndex;
    }
    _updateSubLayer() {
        var state = G_UserData.getCampRaceData().getStatus();
        var layerIndex = this._getLayerIndex(state);
        this._curLayerIndex = layerIndex;
        for (var k in this._subLayers) {
            var subLayer = this._subLayers[k];
            subLayer.node.active = (false);
            subLayer.onHide();
        }
        var curLayer = this._getCurSubLayer();
        curLayer.node.active = (true);
        curLayer.onShow();
        curLayer.updateInfo();
    }
    _refreshTitle() {
        var smallCamps = [
            -1,  //占位
            8,
            5,
            7,
            6
        ];
        this._topbarBase._panelBK.active = false;
        var state = G_UserData.getCampRaceData().getStatus();
        if (state == CampRaceConst.STATE_PRE_OPEN) {
            this._topbarBase.setImageTitle(TITLE_IMG[1]);
            this._imageCamp.node.active = (false);
        } else if (state == CampRaceConst.STATE_PRE_MATCH) {
            this._topbarBase.setImageTitle(TITLE_IMG[2]);
            this._imageCamp.node.active = (true);
            var showCamp = G_UserData.getCampRaceData().getMyCamp();
            var campSmall = Path.getTextSignet('img_com_camp0' + smallCamps[showCamp]);
            UIHelper.loadTexture(this._imageCamp, campSmall);
        } else if (state == CampRaceConst.STATE_PLAY_OFF) {
            var showCamp = G_UserData.getCampRaceData().findCurWatchCamp();
            var finalStatus = G_UserData.getCampRaceData().getFinalStatusByCamp(showCamp);
            var campSmall = Path.getTextSignet('img_com_camp0' + smallCamps[showCamp]);
            UIHelper.loadTexture(this._imageCamp, campSmall);
            this._imageCamp.node.active = (true);
            if (TITLE_IMG[finalStatus + 2]) {
                this._topbarBase.setImageTitle(TITLE_IMG[finalStatus + 2]);
            } else {
                this._topbarBase._imageTitle.node.active = (false);
            }
        }
    }
    _onEventGetReport(eventName, battleReport) {
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
            var battleData = BattleDataHelper.parseCampRace(leftName, rightName, leftOfficer, rightOfficer, winPos);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        G_SceneManager.registerGetReport(battleReport, function () {
            enterFightView();
        });
    }
    _onEventBaseInfo(eventName) {
        if (this._checkIsIntoPlayOffStatus() == true) {
            this._playPromotedAnim();
        } else {
            this._updateSubLayer();
            this._refreshTitle();
        }
    }
    _onEventUpdateState(eventName, camp) {
        this._refreshTitle();
        this._checkIsAllFinish();
    }
    _onReturnClick() {
        G_SceneManager.popScene();
    }
    _checkIsIntoPlayOffStatus() {
        var state = G_UserData.getCampRaceData().getStatus();
        if (state == CampRaceConst.STATE_PLAY_OFF) {
            var isSignUp = G_UserData.getCampRaceData().isSignUp();
            if (isSignUp) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    _playPromotedAnim() {
        var camp = G_UserData.getCampRaceData().getMyCamp();
        var preRankData = G_UserData.getCampRaceData().getPreRankWithCamp(camp);
        if (preRankData == null) {
            return;
        }
        var myRank = preRankData.getSelf_rank();
        var effectName = '';
        if (myRank <= 8) {
            effectName = 'effect_jingji_chenggongjinji';
        } else {
            effectName = 'effect_jingji_jinjishibai';
        }
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName, function () {
            this._updateSubLayer();
        }.bind(this));
    }
    _checkIsAllFinish() {
        function onBtnGo() {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION);
        }

        var isAllFinish = G_UserData.getCampRaceData().isAllRaceFinish();
        if (isAllFinish) {
            var isAuctionWorldEnd = G_UserData.getAuction().isAuctionShow(AuctionConst.AC_TYPE_ARENA_ID);
            if (isAuctionWorldEnd == false) {
                return;
            }
            var status = G_UserData.getCampRaceData().getStatus();
            if (status == CampRaceConst.STATE_PRE_OPEN) {
                UIPopupHelper.popupSystemAlert(Lang.get('camp_aution_title'), Lang.get('camp_aution_content'), onBtnGo, null, (p: PopupSystemAlert) => {
                    p.setCheckBoxVisible(false);
                    p.showGoButton(Lang.get('worldboss_go_btn2'));
                    p.setCloseVisible(true);
                    p.openWithAction();
                });
            }
        }
    }
    _checkIsGetChampion() {
        if (G_UserData.getCampRaceData().isSelfWinChampion()) {
            this._playGetChampionEffect();
            G_UserData.getCampRaceData().setSelfWinChampion(false);
            return true;
        }
        return false;
    }
    _playGetChampionEffect() {
        var effectName = 'effect_jingji_gongxiduoguan';
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName, null, true);
    }

}