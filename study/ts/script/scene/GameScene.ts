import { SignalConst } from "../const/SignalConst";
import { handler } from "../utils/handler";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { DataConst } from "../const/DataConst";
import { G_ResolutionManager, G_SignalManager, G_ConfigLoader, G_SceneManager, G_Prompt, G_UserData, Colors } from "../init";
import ViewBase from "./ViewBase";
import { PopupGetRewards } from "../ui/PopupGetRewards";
import { UIPopupHelper } from "../utils/UIPopupHelper";
import { ReportParser } from "../fight/report/ReportParser";
import { BattleDataHelper } from "../utils/data/BattleDataHelper";
import { FunctionConst } from "../const/FunctionConst";
import { WayFuncDataHelper } from "../utils/data/WayFuncDataHelper";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { Lang } from "../lang/Lang";
import { Path } from "../utils/Path";
import PopupUserBaseInfo from "../ui/popup/PopupUserBaseInfo";
import PopupObtainJadeStone from "./view/equipmentJade/PopupObtainJadeStone";
import { RechargeConst } from "../const/RechargeConst";

const { ccclass, property } = cc._decorator;
@ccclass
export class GameScene extends cc.Component {
    static LEVEL_SUMMARY = 8000;
    static LEVEL_SUBTITLE = 6000;
    static LEVEL_POPUP = 7000;
    static LEVEL_TIPS = 8000;
    static LEVEL_VOICE = 90000;

    @property({
        type: cc.Node,
        visible: true
    })
    private _root: cc.Node = null;
    public get root(): cc.Node {
        return this._root;
    }
    @property({
        type: cc.Node,
        visible: true
    })
    private _popup: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    private _tipsRootNode: cc.Node = null;
    private _voiceLayer: cc.Node;
    private _nodeTextSummary: cc.Node;
    private _subtitleRootNode: cc.Node;

    private _signalUseItemMsg;
    private _signalAuctionBuyerReplace;
    private _signalVipExpChange;
    private _signalRechargeNotice;
    private _signalEnterGraveScene;

    private _signalGetUserBaseInfo;
    private _signalGetUserDetailInfo;
    private _signalPracticePlayer;

    private _disablePopVipChange;

    private _sceneView;


    onLoad() {
        this._popup.zIndex = GameScene.LEVEL_POPUP;
        this._tipsRootNode.zIndex = GameScene.LEVEL_TIPS;

        this._resizeNode(this._root);
        this._resizeNode(this._popup);
        this._resizeNode(this._tipsRootNode);
        this._resizeNode(this._voiceLayer);

        // console.warn(' Enter ' + this.getName());
        G_SignalManager.dispatch(SignalConst.EVENT_CHANGE_SCENE, true, this.getName());

        if (this.getName() == 'main') {   //全局场景事件只加在main场景上,避免重复
            this._signalUseItemMsg = G_SignalManager.add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(this, this._onEventUseItem));
            this._signalAuctionBuyerReplace = G_SignalManager.add(SignalConst.EVENT_AUCTION_BUYER_REPLACE, handler(this, this._onEventAuctionBuyerReplace));
            this._signalVipExpChange = G_SignalManager.add(SignalConst.EVENT_VIP_EXP_CHANGE, handler(this, this._onEventVipExpChange));
            this._signalRechargeNotice = G_SignalManager.add(SignalConst.EVENT_RECHARGE_NOTICE, handler(this, this._onEventRechargeNotice));
            this._signalEnterGraveScene = G_SignalManager.add(SignalConst.EVENT_GRAVE_ENTER_SCENE, handler(this, this._onEventEnterGraveScene));
        }
    }

    start() {
        // console.warn(' onEnterTransitionFinish ' + this.getName());
        G_SignalManager.dispatch(SignalConst.EVENT_SCENE_TRANSITION, true, this.getName());
    }
    onDestroy() {
        // console.warn(' onExitTransitionStart ' + this.getName());
        G_SignalManager.dispatch(SignalConst.EVENT_SCENE_TRANSITION, false, this.getName());
        // console.warn(' Exit  ' + this.getName());
        this._clearEvent();
        G_SignalManager.dispatch(SignalConst.EVENT_CHANGE_SCENE, false, this.getName());
        if (this.getName() == 'main') {
            this._signalUseItemMsg.remove();
            this._signalUseItemMsg = null;
            this._signalAuctionBuyerReplace.remove();
            this._signalAuctionBuyerReplace = null;
            this._signalVipExpChange.remove();
            this._signalVipExpChange = null;
            this._signalEnterGraveScene.remove();
            this._signalEnterGraveScene = null;
            this._signalRechargeNotice.remove();
            this._signalRechargeNotice = null;
        }
    }
    addAccelerationEvent(callback, target) {
        // this.setAccelerometerEnabled(true);
        // var listerner = cc.EventListenerAcceleration.create(callback);
        // this.getEventDispatcher().addEventListenerWithSceneGraphPriority(listerner, target);
    }
    getName() {
        return this.node.name;
    }
    addChildToRoot(node: cc.Node) {
        this._root.addChild(node);
        this._sceneView = node;
    }
    addChildToPopup(node: cc.Node) {
        // console.warn('==================addChildToPopup: ' + (node.__cname || ''));
        // node.setPosition(G_ResolutionManager.getDesignCCPoint());
        node.removeFromParent();
        this._popup.addChild(node);
    }
    getPopupByName(name) {
        return this._popup.getChildByName(name);
    }
    getPopupNode() {
        return this._popup;
    }
    addTips(node) {
        // console.warn('==================addTips: ' + (node.__cname || ''));
        // node.setPosition(G_ResolutionManager.getDesignCCPoint());
        this._tipsRootNode.addChild(node);
    }
    removeAllTips() {
        this._tipsRootNode.removeAllChildren();
    }
    addChildToVoiceLayer(node) {
        // console.warn('==================addChildToVoiceLayer: ' + (node.__cname || ''));
        if (!this._voiceLayer) {
            this._voiceLayer = new cc.Node('voiceLayer');
            this._nodeTextSummary.setContentSize(G_ResolutionManager.getDesignCCSize());
            this._nodeTextSummary.setAnchorPoint(0.5, 0.5);
            this.node.addChild(this._voiceLayer, GameScene.LEVEL_VOICE);
        }
        node.setPosition(G_ResolutionManager.getDesignCCPoint());
        this._voiceLayer.addChild(node);
    }
    clearVoiceLayer() {
        this._voiceLayer.removeAllChildren();
    }
    getVoiceViewByName(name) {
        return this._voiceLayer.getChildByName(name);
    }
    addTextSummary(child: cc.Node, tag?) {
        if (this._nodeTextSummary == null) {
            this._nodeTextSummary = new cc.Node('nodeTextSummary');
            // this._nodeTextSummary.setContentSize(G_ResolutionManager.getDesignCCSize());
            this._nodeTextSummary.setAnchorPoint(0.5, 0.5);
            // if (this.isRunning()) {
            this.node.addChild(this._nodeTextSummary, GameScene.LEVEL_SUMMARY);
            // this.sortAllChildren();
            // } else {
            //     this._nodeTextSummary.retain();
            //     cc.Director.getInstance().getActionManager().addAction(cc.CallFunc.create(function () {
            //         this.addChild(this._nodeTextSummary, GameScene.LEVEL_SUMMARY);
            //         this._nodeTextSummary.release();
            //         this.sortAllChildren();
            //     }), this, false);
            // }
        }
        return this._nodeTextSummary.addChild(child, 0, tag);
    }
    clearTextSummary() {
        if (this._nodeTextSummary != null) {
            this._nodeTextSummary.removeAllChildren(true);
        }
    }
    addToSubtitleLayer(child, tag) {
        if (!this._subtitleRootNode) {
            this._subtitleRootNode = new cc.Node('subtitleRootNode');
            this._subtitleRootNode.setContentSize(G_ResolutionManager.getDesignCCSize());
            this._subtitleRootNode.setAnchorPoint(0.5, 0.5);
            //  if (this.isRunning()) {
            this._root.addChild(this._subtitleRootNode, GameScene.LEVEL_SUBTITLE);
            //     this.sortAllChildren();
            // } else {
            //     this._subtitleRootNode.retain();
            //     cc.Director.getInstance().getActionManager().addAction(cc.CallFunc.create(function () {
            //         this.addChild(this._subtitleRootNode, GameScene.LEVEL_SUBTITLE);
            //         this._subtitleRootNode.release();
            //         this.sortAllChildren();
            //     }), this, false);
            // }
        }
        return this._subtitleRootNode.addChild(child, 0, tag || 0);
    }
    isRootScene() {
        let clazz = cc.js.getClassByName(G_SceneManager.getSceneClassName(this.node.name));
        if (clazz) {
            let instance = this.node.getComponent(clazz);
            if (instance && instance.isRootScene) {
                return instance.isRootScene();
            }
        }
        return false;
    }
    getSceneView() {
        let clazz = cc.js.getClassByName(G_SceneManager.getSceneClassName(this.node.name));
        if (clazz) {
            return this._sceneView.getComponent(clazz);
        }
    }
    _clearEvent() {
        if (this._signalGetUserBaseInfo) {
            this._signalGetUserBaseInfo.remove();
            this._signalGetUserBaseInfo = null;
        }
        if (this._signalGetUserDetailInfo) {
            this._signalGetUserDetailInfo.remove();
            this._signalGetUserDetailInfo = null;
        }
        if (this._signalPracticePlayer) {
            this._signalPracticePlayer.remove();
            this._signalPracticePlayer = null;
        }
    }
    onDisable(){
        this._clearEvent();
    }
    addGetUserBaseInfoEvent() {
        this._clearEvent();
        this._signalGetUserBaseInfo = G_SignalManager.add(SignalConst.EVENT_GET_USER_BASE_INFO, handler(this, this._onEventGetUserBaseInfo));
        this._signalGetUserDetailInfo = G_SignalManager.add(SignalConst.EVENT_GET_USER_DETAIL_INFO, handler(this, this._onEventGetUserDetailInfo));
        this._signalPracticePlayer = G_SignalManager.add(SignalConst.EVENT_PRACTICE_PLAYER, handler(this, this._onEventPracticePlayer));
    }
    _onEventUseItem(id, message) {
        var itemId = message['id'] || 0;
        var awards = message['awards'] || {};
        var itemInfo = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(itemId);
        if (DataConst.JADE_STONE_BOX[itemId]) {
            PopupObtainJadeStone.getIns(PopupObtainJadeStone, (p)=> {
                p.ctor(itemId, awards);
                p.openWithAction();
            })
            return;
        }
        if (itemId > 0) {
            if (itemInfo.reward_type == 0) {
                G_Prompt.showTip(itemInfo.tips);
            } else {
                if (awards && awards.length > 0) {
                    PopupGetRewards.showRewards(awards);
                }
            }
        }
    }
    _onEventGetUserBaseInfo(id, message) {
        if (message == null) {
            return;
        }
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupUserBaseInfo"), function (pop: PopupUserBaseInfo) {
            pop.openWithAction();
            pop.setClickOtherClose(true);
            pop.updateUI(message);
        })


    }
    _onEventGetUserDetailInfo(id, message) {
        if (message == null) {
            return;
        }
        // var PopupUserDetailInfo = require('PopupUserDetailInfo');
        // var popup = new PopupUserDetailInfo(message);

        UIPopupHelper.popupUserDetailInfor(message);

        // popup.setName('PopupUserDetailInfo');
        // popup.openWithAction();
    }
    _onEventPracticePlayer(id, message) {
        if (message == null) {
            return;
        }
        G_SceneManager.registerGetReport(message.battle_report, function () {
            this._enterFightView();
        }.bind(this));
    }
    _enterFightView() {
        var battleReport = G_UserData.getFightReport().getReport();
        var reportData = ReportParser.parse(battleReport);
        var battleData = BattleDataHelper.parseFriendFight();
        G_SceneManager.showScene('fight', reportData, battleData, true);
    }
    _onEventAuctionBuyerReplace(id, message) {
        var itemAward = message['item'];
        if (itemAward == null) {
            return;
        }
        var itemParams = TypeConvertHelper.convert(itemAward.type, itemAward.value, itemAward.size);
        if (itemParams == null) {
            return;
        }
        var moneyType = message['money_type'] || 0;
        var moneyParams;
        if (moneyType == 1) {
            moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        } else {
            moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND);
        }
        var richText1 = Lang.get('auction_buyer_replace', {
            itemName: itemParams.name,
            itemColor: Colors.colorToNumber(itemParams.icon_color),
            outlineColor: Colors.colorToNumber(itemParams.icon_color_outline),
            itemNum: itemParams.size,
            resName: moneyParams.name
        });
        G_Prompt.showTip(richText1);
    }
    setVipChangeTipDisable(enable) {
        if (enable) {
            this._disablePopVipChange = true;
        } else {
            this._disablePopVipChange = false;
        }
    }
    _onEventVipExpChange(event, addExp) {
        if (this._disablePopVipChange) {
            return;
        }
        console.log(' ActivityView xxxx xxe ' + (addExp));
        var awards = [{
            size: addExp,
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_VIP
        }];
        G_Prompt.showAwards(awards);
    }
    // _onEventRechargeNotice(event, id, message) {
    //     var gold = message['gold'] || 0;
    //     if (gold > 0) {
    //         var awards = [{
    //             type: TypeConvertHelper.TYPE_RESOURCE,
    //             value: DataConst.RES_DIAMOND,
    //             size: gold
    //         }];
    //        G_Prompt.showAwards(awards);
    //     }
    // }
    _onEventRechargeNotice(event, id, message) {
        var searchResourceType = function (productId) {
            var VipPayInfo = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
            for (var i = 0; i < VipPayInfo.length(); i++) {
                var rechargeInfo = VipPayInfo.indexOf(i);
                if ((rechargeInfo["product_id"]==productId) && rechargeInfo.card_type == RechargeConst.VIP_PAY_TYPE_JADE) {
                    return DataConst.RES_JADE2;
                }
            }
            return DataConst.RES_DIAMOND;
        }
        var gold = message['gold'] || 0;
        if (gold > 0) {
            var value = searchResourceType(message['product_id']);
            var awards = [{
                    type: TypeConvertHelper.TYPE_RESOURCE,
                    value: value,
                    size: gold
                }];
            G_Prompt.showAwards(awards);
        }
    }

    _onEventEnterGraveScene() {
        // console.warn('GameScene:_onEventEnterGraveScene');
        if (this.getName() != 'fight') {
            var funcId = FunctionConst.FUNC_MAUSOLEUM;
            WayFuncDataHelper.gotoModuleByFuncId(funcId);
        }
    }

    _resizeNode(node: cc.Node) {
        if (node != null) {
            node.setContentSize(G_ResolutionManager.getDesignCCSize());
            node.setPosition(0, 0);
            node.setAnchorPoint(0.5, 0.5);
        }

    }
}