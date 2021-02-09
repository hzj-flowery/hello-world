const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TerritoryConst } from '../../../const/TerritoryConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { ReportParser } from '../../../fight/report/ReportParser';
import { G_EffectGfxMgr, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { DropHelper } from '../../../utils/DropHelper';
import { Slot } from '../../../utils/event/Slot';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Path } from '../../../utils/Path';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import PopupTerritoryOneKey from './PopupTerritoryOneKey';
import PopupTerritoryRiotInfo from './PopupTerritoryRiotInfo';
import TerritoryCityNode from './TerritoryCityNode';


@ccclass
export default class TerritoryView extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollCityView: cc.ScrollView = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnReport: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnTakeAll: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnOneKey: CommonMainMenu = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnHelper: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;


    public static readonly MAX_CITY_SIZE = 6;
    _territoryCityNode: any[];
    _isFirstEnter: boolean;
    private static _isPopRiotInfo: boolean = false;
    _signalTerritoryUpdate: any;
    _signalTerritorySync: any;
    _signalTerritoryFight: any;
    _signalPatrol: any;
    _signalPatrolAward: any;
    _signalGetRiotAward: any;
    _signalRiotHelper: any;
    _signalRedPointUpdate: any;
    private _signalTerritoryOneKey: Slot;
    private _signalTerritoryStateUpdate: Slot;


    public static waitEnterMsg(callBack, isPopRiotInfo) {
        TerritoryView._isPopRiotInfo = isPopRiotInfo[0];
        function onMsgCallBack(message) {
            var data: Array<string> = [];
            data.push("prefab/territory/TerritoryCityNode");
            data.push("prefab/territory/PopupTerritoryPatrol");
            data.push("prefab/territory/PopupTerritoryRiotHelp");
            data.push("prefab/territory/PopupTerritoryRiotHelpCell");
            data.push("prefab/territory/PopupTerritoryRiotInfo");
            data.push("prefab/territory/PopupTerritoryRiotInfoCell");
            data.push("prefab/common/CommonIconTemplate");
            data.push("prefab/common/PopupItemInfo");
            data.push("prefab/common/PopupAlert");
            data.push("prefab/common/PopupBoxReward");
            data.push("prefab/common/PopupSystemAlert");


            cc.resources.load(data, (err, data) => {
                callBack();
            });
        }
        G_UserData.getTerritory().c2sGetTerritory();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_TERRITORY_UPDATEUI, onMsgCallBack);
        return signal;
    }

    initData() {
        this._territoryCityNode = [];
        this._isFirstEnter = true;
    }
    onCreate() {
        this.initData();
        this._imageBG.node.setScale(0.76);
        this._topbarBase.setImageTitle('txt_sys_com_lingdixunluo');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._btnReport.updateUI(FunctionConst.FUNC_RIOT_INFO);
        //this._btnTakeAll.updateUI(FunctionConst.FUNC_TERRITORY_GET_ALL);
        this._btnHelper.node.active = (false);
        this._nodeEffect.active = (false);
        //this._btnTakeAll.node.active = (false);
        this._btnOneKey.updateUI(FunctionConst.FUNC_TERRITORY_ONEKEY_PATROL);
        this._btnOneKey.node.active = (false);
        this._btnOneKey.stopFuncGfx();
    }
    showUI(needShow) {
        for (var i in this._territoryCityNode) {
            var node = this._territoryCityNode[i];
            node.getComponent(TerritoryCityNode).showUI(needShow);
        }
    }
    updateUI() {
        if (this._territoryCityNode.length == 0) {
            for (var i = 1; i <= TerritoryConst.MAX_CITY_SIZE; i++) {
                var scrollNode = this._scrollCityView.content.getChildByName('Node_' + i);
                if (scrollNode) {
                    scrollNode.removeAllChildren();

                    var resource = cc.resources.get("prefab/territory/TerritoryCityNode") as cc.Prefab;
                    var node1 = cc.instantiate(resource);
                    let cell = node1.getComponent(TerritoryCityNode);
                    this._territoryCityNode[i] = node1;
                    scrollNode.addChild(node1);
                    cell.updateUI(i);
                }
            }
        } else {
            for (var i = 1; i <= this._territoryCityNode.length; i++) {
                var node = this._territoryCityNode[i];
                if (node) {
                    node.getComponent(TerritoryCityNode).updateUI(i);
                }
            }
        }
        this._updateButtonOneKeyGfx();
    }
    playEnterEffect() {
        let ispopup = TerritoryView._isPopRiotInfo as boolean;
        TerritoryView._isPopRiotInfo = false;
        var onEnterFinish = function () {
            this.showUI(true);
            this._nodeEffect.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_lingdihuomiao');
            G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_lingdidaoguang');
            this._nodeEffect.active = (true);
            if (ispopup) {
                let popup: PopupTerritoryRiotInfo = Util.getNode("prefab/territory/PopupTerritoryRiotInfo", PopupTerritoryRiotInfo);
                popup.openWithAction();
            }
        }.bind(this);
        if (G_UserData.getTerritory().isFirstEnter() == true) {
            this._imageBG.node.setScale(0.76);
            this._imageBG.node.stopAllActions();
            this.showUI(false);
            this._nodeEffect.active = (false);
            var scaleTo = cc.scaleTo(1, 1);
            var callfunc = cc.callFunc(onEnterFinish);
            var seq = cc.sequence(scaleTo, callfunc);
            this._imageBG.node.runAction(seq);
            G_UserData.getTerritory().setFirstEnter();
        } else {
            this._imageBG.node.setScale(1);
            onEnterFinish();
        }
    }
    onEnter() {
        this._signalTerritoryUpdate = G_SignalManager.add(SignalConst.EVENT_TERRITORY_UPDATEUI, handler(this, this._onEventTerritoryUpdate));
        this._signalTerritorySync = G_SignalManager.add(SignalConst.EVENT_TERRITORY_SYNC_SINGLE_INFO, handler(this, this._onEventTerritoryUpdate));
        this._signalTerritoryFight = G_SignalManager.add(SignalConst.EVENT_TERRITORY_ATTACKTERRITORY, handler(this, this._onEventTerritoryFight));
        this._signalPatrol = G_SignalManager.add(SignalConst.EVENT_TERRITORY_PATROL, handler(this, this._onEventPatrol));
        this._signalPatrolAward = G_SignalManager.add(SignalConst.EVENT_TERRITORY_GETAWARD, handler(this, this._onEventPartolAward));
        this._signalGetRiotAward = G_SignalManager.add(SignalConst.EVENT_TERRITORY_GET_RIOT_AWARD, handler(this, this._onEventGetRiotAward));
        this._signalRiotHelper = G_SignalManager.add(SignalConst.EVENT_TERRITORY_FORHELP, handler(this, this._onEventRiotHelper));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalTerritoryOneKey = G_SignalManager.add(SignalConst.EVENT_TERRITORY_ONEKEY, handler(this, this._onEventTerritoryOneKey));
        this._signalTerritoryStateUpdate = G_SignalManager.add(SignalConst.EVENT_TERRITORY_STATE_UPDATE, handler(this, this._onEventTerritoryStateUpdate));
        var isOpenAll = G_UserData.getTerritory().isOpenAllTerritories();
        var isVisible = FunctionCheck.funcIsShow(FunctionConst.FUNC_TERRITORY_GET_ALL);
        this._btnTakeAll.node.active = (isOpenAll || isVisible);
        var isVisible2 = FunctionCheck.funcIsShow(FunctionConst.FUNC_TERRITORY_ONEKEY_PATROL);
        this._btnOneKey.node.active = (isOpenAll && isVisible2);
        if (!this._btnTakeAll.node.active && this._btnOneKey.node.active) {
            this._btnOneKey.node.y = (405);
        } else {
            this._btnOneKey.node.y = (312);
        }
        this.updateUI();
        this.playEnterEffect();
        this._onEventRedPointUpdate();
        if (G_UserData.getTerritory().isExpired() == true) {
            G_UserData.getTerritory().c2sGetTerritory();
        }


        var isVisible = FunctionCheck.funcIsShow(FunctionConst.FUNC_TERRITORY_GET_ALL);
        this._btnTakeAll.node.active = (isVisible);
        this._btnTakeAll.updateUI(FunctionConst.FUNC_TERRITORY_GET_ALL);
    }
    onExit() {
        this._signalTerritoryUpdate.remove();
        this._signalTerritoryUpdate = null;
        this._signalTerritorySync.remove();
        this._signalTerritorySync = null;
        this._signalTerritoryFight.remove();
        this._signalTerritoryFight = null;
        this._signalPatrolAward.remove();
        this._signalPatrolAward = null;
        this._signalGetRiotAward.remove();
        this._signalGetRiotAward = null;
        this._signalPatrol.remove();
        this._signalPatrol = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalRiotHelper.remove();
        this._signalRiotHelper = null;
        this._signalTerritoryOneKey.remove();
        this._signalTerritoryOneKey = null;
        this._signalTerritoryStateUpdate.remove();
        this._signalTerritoryStateUpdate = null;
    }
    onBtnReport() {
        if (TerritoryView._isPopRiotInfo) {
            return;
        }
        let popup: PopupTerritoryRiotInfo = Util.getNode("prefab/territory/PopupTerritoryRiotInfo", PopupTerritoryRiotInfo);
        popup.openWithAction();
    }
    onBtnTakeAll() {
        G_UserData.getTerritory().c2sGetAllPatrolAward();
    }
    onBtnOneKey() {
        G_SceneManager.openPopup(Path.getPrefab("PopupTerritoryOneKey", "territory"), (popup: PopupTerritoryOneKey) => {
            popup.openWithAction();
        });
    }
    _onBtnHelper() {
    }
    _onEventRedPointUpdate(id?, message?) {
        var redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PVE_TERRITORY, 'riotRP');
        var redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PVE_TERRITORY, 'friendRP');
        var updateRedPoint = function (node, value) {
            node.showRedPoint(value);
        }.bind(this);
        updateRedPoint(this._btnReport, redValue1);
        if (G_UserData.getTerritory().isHavePatrolAward() == false) {
            this.schedule(() => {
                this._btnTakeAll.loadCustomIcon(Path.getCommonIcon('common', 'baoxiang_jubaopeng_kong'));
                this._btnTakeAll.stopFuncGfx();
            }, 0.1);
        }
    }
    _updateButtonOneKeyGfx() {
        if (G_UserData.getTerritory().isHavePatrolTerritory()) {
            this._btnOneKey.playFuncGfx();
        } else {
            this._btnOneKey.stopFuncGfx();
        }
    }
    _onEventTerritoryUpdate(id, message) {
        // logWarn('TerritoryView:_onEventTerritoryUpdate');
        this.updateUI();
    }
    _onEventTerritoryFight(id, message) {
        var battleReport = message['battle_report'];
        if (battleReport) {
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseTerritoryBattleData(message, 1);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
    }
    _onEventPartolAward(id, message) {
        this.updateUI();
        var awards = message['awards'] || [];
        var otherAwards = message['other_awards'] || [];
        var callBackExtraReward = function () {
            if (otherAwards.length > 0) {
                var merageAwards = DropHelper.merageAwardList(otherAwards);
                // var PopupGetRewards = new (require('PopupGetRewards'))();
                PopupGetRewards.showRewards(merageAwards);
            }
        }.bind(this);
        if (awards.length == 0 && otherAwards.length > 0) {
            callBackExtraReward();
            return;
        }
        if (awards.length > 0) {
            if (otherAwards.length > 0) {
                for (let j in otherAwards) {
                    awards.push(otherAwards[j]);
                }
            }
            var merageAwards = DropHelper.merageAwardList(awards);
            // var PopupGetRewards = new (require('PopupGetRewards'))(callBackExtraReward);
            PopupGetRewards.showRewards(merageAwards, callBackExtraReward);
        }
    }
    _onEventGetRiotAward(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.updateUI();
        var awards = message['awards'] || [];
        if (awards.length > 0) {
            var merageAwards = DropHelper.merageAwardList(awards);
            PopupGetRewards.showRewards(merageAwards);
        }
    }
    _onEventPatrol(id, message) {
        var awards = message['awards'] || [];
        if (awards.length > 0) {
            G_Prompt.showAwards(awards);
        }
        UserCheck.isLevelUp(null);
        this.updateUI();
    }
    _onEventTerritoryOneKey(id, message) {
        this.updateUI();
    }
    _onEventTerritoryStateUpdate(id, message) {
        this.updateUI();
    }
    _onEventRiotHelper(id, message) {
        this.updateUI();
    }

}