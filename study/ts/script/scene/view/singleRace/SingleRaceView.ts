import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";

import CommonHelp from "../../../ui/component/CommonHelp";

import { G_SignalManager, G_UserData, G_ResolutionManager, G_SceneManager, G_AudioManager } from "../../../init";

import { SignalConst } from "../../../const/SignalConst";

import { Path } from "../../../utils/Path";

import { handler } from "../../../utils/handler";

import { FunctionConst } from "../../../const/FunctionConst";

import { SingleRaceConst } from "../../../const/SingleRaceConst";

import { assert } from "../../../utils/GlobleFunc";

import SingleRaceMapLayer from "./SingleRaceMapLayer";

import SingleRaceBattleLayer from "./SingleRaceBattleLayer";

import SingleRaceChampionLayer from "./SingleRaceChampionLayer";

import { Lang } from "../../../lang/Lang";

import { AudioConst } from "../../../const/AudioConst";
import ViewBase from "../../ViewBase";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { stringUtil } from "../../../utils/StringUtil";
import PopupBase from "../../../ui/PopupBase";

const { ccclass, property } = cc._decorator;


@ccclass
export default class SingleRaceView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSub: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _nodeHelp: CommonHelp = null;

    @property(cc.Prefab)
    singleRaceMapLayer: cc.Prefab = null;
    @property(cc.Prefab)
    singleRaceBattleLayer: cc.Prefab = null;
    @property(cc.Prefab)
    singleRaceChampionLayer: cc.Prefab = null;

    _subLayers: {};
    _curState: number;
    _signalSwitchLayer: any;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            callBack();
        }
        var msgReg = G_SignalManager.addOnce(SignalConst.EVENT_SINGLE_RACE_GET_PK_INFO_SUCCESS, onMsgCallBack);
        G_UserData.getSingleRace().c2sGetSingleRacePkInfo();
    }
    onCreate() {
        this.setSceneSize();
        this._subLayers = {};
        this._curState = 0;
        this._nodeHelp.updateUI(FunctionConst.FUNC_SINGLE_RACE);
    }

    start() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setItemListVisible(false);
        this._topbarBase.hideBG();
        this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
    }

    onCleanup() {
        G_UserData.getSingleRace().setCurWatchPos(0);
    }
    onEnter() {
        this._signalSwitchLayer = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_SWITCH_LAYER, handler(this, this._onEventSwitchLayer));
        this._updateData();
        this._updateView();
    }
    onExit() {
        this._signalSwitchLayer.remove();
        this._signalSwitchLayer = null;
    }
    _setCallback() {
        if (this._curState == SingleRaceConst.LAYER_STATE_BATTLE) {
            this._curState = SingleRaceConst.LAYER_STATE_MAP;
            this._updateView();
        } else {
            G_SceneManager.popScene();
        }
    }
    _updateData() {
        var popup = G_SceneManager.getRunningScene().getPopupByName('PopupSingleRaceReplay');
        if (popup) {
            this._curState = SingleRaceConst.LAYER_STATE_MAP;
            return;
        }
        var raceState = G_UserData.getSingleRace().getStatus();
        if (raceState == SingleRaceConst.RACE_STATE_PRE) {
            this._curState = SingleRaceConst.LAYER_STATE_MAP;
        } else if (raceState == SingleRaceConst.RACE_STATE_ING) {
            if (G_UserData.getSingleRace().isSelfEliminated() == false) {
                var racePos = G_UserData.getSingleRace().findSelfRacePos();
                G_UserData.getSingleRace().setCurWatchPos(racePos);
                this._curState = SingleRaceConst.LAYER_STATE_BATTLE;
            } else if (G_UserData.getSingleRace().getCurWatchPos() > 0) {
                this._curState = SingleRaceConst.LAYER_STATE_BATTLE;
            } else {
                this._curState = SingleRaceConst.LAYER_STATE_MAP;
            }
        } else if (raceState == SingleRaceConst.RACE_STATE_FINISH) {
            this._curState = SingleRaceConst.LAYER_STATE_CHAMPION;
        } else {
          //assert((false, ('SingleRaceView raceState is wrong = %d').format(raceState));
        }
    }
    _updateView() {
        this._checkGuessPopup();
        var layer = this._subLayers[this._curState];
        if (layer == null) {
            if (this._curState == SingleRaceConst.LAYER_STATE_MAP) {
                layer = cc.instantiate(this.singleRaceMapLayer).getComponent(SingleRaceMapLayer);
            } else if (this._curState == SingleRaceConst.LAYER_STATE_BATTLE) {
                layer = cc.instantiate(this.singleRaceBattleLayer).getComponent(SingleRaceBattleLayer);
                layer.ctor(this);
            } else if (this._curState == SingleRaceConst.LAYER_STATE_CHAMPION) {
                layer = cc.instantiate(this.singleRaceChampionLayer).getComponent(SingleRaceChampionLayer);
            }
            if (layer) {
                this._nodeSub.addChild(layer.node);
                this._subLayers[this._curState] = layer;
            }
        }
        for (var state in this._subLayers) {
            var subLayer = this._subLayers[state];
            subLayer.node.active = (false);
            subLayer.onHide();
        }
        layer.node.active = (true);
        layer.onShow();
        layer.updateInfo();
        this.updateTitle();
        this._updateBGM();
        this._nodeHelp.node.active = (this._curState != SingleRaceConst.LAYER_STATE_BATTLE);
    }
    updateTitle() {
        var str = '';
        if (this._curState == SingleRaceConst.LAYER_STATE_BATTLE) {
            var nowRound = G_UserData.getSingleRace().getNow_round();
            str = Lang.get('single_race_round_title')[nowRound -1] || '';
        } else {
            str = Lang.get('single_race_title');
        }
        this._topbarBase.setTitle(str, 30, cc.color(255, 175, 0), cc.color(80, 37, 9, 255));
    }
    _updateBGM() {
        if (this._curState == SingleRaceConst.LAYER_STATE_MAP) {
            G_AudioManager.playMusicWithId(AudioConst.SOUND_SINGLE_BGM_32);
        } else if (this._curState == SingleRaceConst.LAYER_STATE_BATTLE) {
            G_AudioManager.playMusicWithId(AudioConst.SOUND_SINGLE_BGM_32);
        } else if (this._curState == SingleRaceConst.LAYER_STATE_CHAMPION) {
            G_AudioManager.stopMusic(true);
            G_AudioManager.playSoundWithId(AudioConst.SOUND_SINGLE_BGM_WINNER);
        }
    }
    _onEventSwitchLayer(eventName, layerState) {
        this._curState = layerState;
        this._updateView();
    }
    _checkGuessPopup() {
        var popup = G_SceneManager.getRunningScene().getPopupByName('PopupSingleRaceGuess');
        if (popup) {
            popup.getComponent(PopupBase).close();
        }
    }
}