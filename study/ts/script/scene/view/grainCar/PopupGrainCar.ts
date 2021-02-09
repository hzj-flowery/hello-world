import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { DataConst } from "../../../const/DataConst";
import { HomelandConst } from "../../../const/HomelandConst";
import ParameterIDConst, { G_ParameterIDConst } from "../../../const/ParameterIDConst";
import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import PopupBase from "../../../ui/PopupBase";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { assert } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import warringHurtHP from "../guildCrossWar/warringHurtHP";
import { HomelandHelp } from "../homeland/HomelandHelp";
import { MineCraftHelper } from "../mineCraft/MineCraftHelper";
import GrainCarAttackLeftPanel from "./GrainCarAttackLeftPanel";
import GrainCarAttackRightPanel from "./GrainCarAttackRightPanel";
import GrainCarConfigHelper from "./GrainCarConfigHelper";
import { GrainCarDataHelper } from "./GrainCarDataHelper";
import GrainCarScroll from "./GrainCarScroll";
import PopupGrainCarGuildSelector from "./PopupGrainCarGuildSelector";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupGrainCar extends PopupBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMatchSuccess: cc.Sprite = null;

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _moveResource: CommonResourceInfo = null;



    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _btnMoveIn: CommonButtonLevel2Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSelector: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _centerNode: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarAttackLeftPanel: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarAttackRightPanel: cc.Prefab = null;

    

    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarScroll: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _PopupGrainCarGuildSelector: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _warringHurtHP: cc.Prefab = null;

    
    static waitEnterMsg(callBack, mineData) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getMineCraftData().c2sEnterMine(mineData[0]);
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_ENTER_MINE, onMsgCallBack);
        return signal;
    }

    private _mineData;

    private _signalSettleMine;
    private _signalBattleMine;
    private _signalMineRespond;
    private _singalFastBattle;
    private _signalGrainCarNotify;
    private _signalGrainCarAttack;
    private _signalGrainCarClick;
    private _signalGrainCarMoveNotify;

    private _foodCost: number;
    private _moveGold: number;
    private _moveRoads: Array<number>;
    private _scroll: GrainCarScroll;
    private _guildSelector: PopupGrainCarGuildSelector;
    private _curAtkCarUnit;
    private _awards;
    private _hurt;

    ctor(data) {
        console.log("--------",data);
        this._initMember(data);

        this.node.name = ('PopupGrainCar');
    }
    onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
        this._commonNodeBk.setTitle(this._mineData.getConfigData().pit_name);
        this._updateData();
        this._initUI();
        this._btnMoveIn.addClickEventListenerEx(handler(this,this._onBtnMoveInClick));
    }
    onEnter() {
        this._signalSettleMine = G_SignalManager.add(SignalConst.EVENT_SETTLE_MINE, handler(this, this._onSettleMine));
        this._signalBattleMine = G_SignalManager.add(SignalConst.EVENT_BATTLE_MINE, handler(this, this._onEventBattleMine));
        this._signalMineRespond = G_SignalManager.add(SignalConst.EVENT_GET_MINE_RESPOND, handler(this, this._onEventMineRespond));
        this._singalFastBattle = G_SignalManager.add(SignalConst.EVENT_FAST_BATTLE, handler(this, this._onFastBattle));
        this._signalGrainCarNotify = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_NOTIFY, handler(this, this._onEventGrainCarNotify));
        this._signalGrainCarAttack = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_ATTACK, handler(this, this._onEventGrainCarAttack));
        this._signalGrainCarClick = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_AVATAR_CLICK_IN_MINE, handler(this, this._onEventGrainCarClicked));
        this._signalGrainCarMoveNotify = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_MOVE_NOTIFY, handler(this, this._onEventMoveCarNotify));
        this._refreshRoadCost();
    }
    onExit() {
        this._signalSettleMine.remove();
        this._signalSettleMine = null;
        this._signalBattleMine.remove();
        this._signalBattleMine = null;
        this._signalMineRespond.remove();
        this._signalMineRespond = null;
        this._singalFastBattle.remove();
        this._singalFastBattle = null;
        this._signalGrainCarNotify.remove();
        this._signalGrainCarNotify = null;
        this._signalGrainCarAttack.remove();
        this._signalGrainCarAttack = null;
        this._signalGrainCarClick.remove();
        this._signalGrainCarClick = null;
        this._signalGrainCarMoveNotify.remove();
        this._signalGrainCarMoveNotify = null;
    }
    onShowFinish() {
    }
    _initMember(data) {
        this._mineData = data;
        this._scroll = null;
        this._guildSelector = null;
    }
    _updateData() {
    }
    _initUI() {
        this._btnMoveIn.setString(Lang.get('mine_move_in'));
        this._imageMatchSuccess.node.active = (false);
        this._initScrollView();
    }
    _initScrollView() {
        this._scroll = cc.instantiate(this._GrainCarScroll).getComponent(GrainCarScroll);
        this._scroll.ctor(this._mineData);
        this._scroll.node.setPosition(this._commonNodeBk.node.width/2,this._commonNodeBk.node.height/2);
        this._commonNodeBk.node.addChild(this._scroll.node);
    }
    _initGuildSelector() {
        this._guildSelector = cc.instantiate(this._PopupGrainCarGuildSelector).getComponent(PopupGrainCarGuildSelector)
        this._guildSelector.ctor(this._mineData.getId());
        this._guildSelector.setSelectorCallback(handler(this, this._onSelectorCallback));
        this._nodeSelector.removeAllChildren();
        this._nodeSelector.addChild(this._guildSelector.node);
    }
    _refreshRoadCost() {
        var selfMineId = G_UserData.getMineCraftData().getSelfMineId();
        if (this._mineData.getId() == selfMineId) {
            this._moveResource.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD, 0);
            this._moveResource.setTextColor(Colors.getMineStateColor(1));
            this._btnMoveIn.setEnabled(false);
            return;
        }
        this._moveRoads = MineCraftHelper.getRoad2(selfMineId, this._mineData.getId());
        var parameterContent = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.FOOD_PER_MOVE);
        assert(parameterContent, 'not id, ' + ParameterIDConst.FOOD_PER_MOVE);
        this._foodCost = this._moveRoads.length * (parameterContent.content);
        var [isCanUse, buffData] = HomelandHelp.checkBuffIsCanUse(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_17);
        if (isCanUse) {
            var restCount = buffData.getRestCount();
            var costCount = Math.max(this._moveRoads.length - restCount, 0);
            this._foodCost = costCount * parseInt(parameterContent.content);
        }
        this._moveResource.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD, this._foodCost);
        var myFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD);
        if (myFood < this._foodCost) {
            this._moveResource.setTextColor(Colors.getMineStateColor(3));
        } else {
            this._moveResource.setTextColor(Colors.getMineStateColor(1));
        }
    }
    _moveInGold() {
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, this._moveGold);
        if (!success) {
            return;
        }
        G_UserData.getMineCraftData().c2sSettleMine(this._moveRoads);
        this.closeWithAction();
    }
    _getBuyString() {
        var maxValue = parseInt((G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER)).get(G_ParameterIDConst.TROOP_MAX).content);
        if (G_UserData.getMineCraftData().isSelfPrivilege()) {
            var soilderAdd = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD);
            maxValue = maxValue + soilderAdd;
        }
        var str = '';
        var [food, money, needFood] = MineCraftHelper.getBuyArmyDetail();
        if (food && money) {
            str = Lang.get('mine_not_50_army', {
                count1: food,
                count2: money,
                count3: maxValue
            });
        } else if (food) {
            str = Lang.get('mine_not_50_army_food', {
                count: food,
                count1: maxValue
            });
        } else if (money) {
            str = Lang.get('mine_not_50_army_gold', {
                count: money,
                count1: maxValue
            });
        }
        return [
            str,
            money,
            needFood
        ];
    }
    _buyArmy(count, money) {
        if (money) {
            var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, money);
            if (!success) {
                return;
            }
        }
        G_UserData.getMineCraftData().c2sMineBuyArmy(count);
    }
    _playAttackAnimation(awards, hurt, army, desc_army) {
        this._imageMatchSuccess.node.active = (true);
        this._imageMatchSuccess.node.opacity = (230);
        this._commonNodeBk.setCloseVisible(false);
        var effectFunction = function (effect):cc.Node {
            if (effect == 'wanjia1') {
                var node1:GrainCarAttackLeftPanel = cc.instantiate(this._GrainCarAttackLeftPanel).getComponent(GrainCarAttackLeftPanel);
                node1.updateUI(army);
                return node1.node;
            } else if (effect == 'wanjia2') {
                var node2:GrainCarAttackRightPanel = cc.instantiate(this._GrainCarAttackRightPanel).getComponent(GrainCarAttackRightPanel);
                node2.updateUI(this._curAtkCarUnit);
                return node2.node;
            } else if (effect == 'hit1') {
                var node:warringHurtHP = cc.instantiate(this._warringHurtHP).getComponent(warringHurtHP);
                node.updateUI(-1 * desc_army);
                return node.node;
            } else if (effect == 'hit2') {
                var node:warringHurtHP =  cc.instantiate(this._warringHurtHP).getComponent(warringHurtHP);
                node.updateUI(-1 * hurt);
                return node.node;
            }
        }.bind(this)
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._imageMatchSuccess.node.active = (false);
                this._commonNodeBk.setCloseVisible(true);
                var name = this._curAtkCarUnit.getConfig().name;
                G_Prompt.showAwards(awards);

                this.node.active = false;
                this.scheduleOnce(function(){
                    this.node.active = true;
                },0.1)
            }
        }.bind(this);
        
        this._centerNode.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._centerNode, 'moving_kuafujuntuanzhan', effectFunction, eventFunction, false);
    }
    _onButtonClose() {
        this.close();
    }
    _onSelectorCallback(guildId) {
        this._guildSelector.close();
        this._scroll.scroll2Guild(guildId);
    }
    _onBtnMoveInClick() {
        var selfMineId = G_UserData.getMineCraftData().getSelfMineId();
        var myArmy = G_UserData.getMineCraftData().getMyArmyValue();
        if (myArmy < MineCraftHelper.ARMY_TO_LEAVE && G_UserData.getMineCraftData().getMyMineConfig().pit_type == MineCraftHelper.TYPE_MAIN_CITY) {
            var [strBuy, money, needFood] = this._getBuyString();
            G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popupSystemAlert: PopupSystemAlert) => {
                popupSystemAlert.setup(Lang.get('mine_not_army_title'), strBuy,()=>{
                    this._buyArmy(needFood, money);
                });
                popupSystemAlert.setCheckBoxVisible(false);
                popupSystemAlert.openWithAction();
            });

            return;
        }
        var nowFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD);
        if (nowFood < this._foodCost) {
            var title = Lang.get('mine_no_food');
            var goldToFood = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MINE_GOLD_TO_FOOD).content);
            this._moveGold = goldToFood * (this._foodCost - nowFood);
            var strContent = Lang.get('mine_run_gold', {
                count: this._foodCost - nowFood,
                countmoney: this._moveGold
            });
            G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popupSystemAlert: PopupSystemAlert) => {
                popupSystemAlert.setup(title, strContent,  handler(this, this._moveInGold));
                popupSystemAlert.setCheckBoxVisible(false);
                popupSystemAlert.openWithAction();
            });

        } else {
            G_UserData.getMineCraftData().c2sSettleMine(this._moveRoads);
            this.closeWithAction();
        }
    }
    _onSettleMine() {
        G_Prompt.showTip(Lang.get('mine_food_cost_count', { count: this._foodCost }));
    }
    _onEventMineRespond(eventName, oldMineId, newMineId) {
        this._mineData = G_UserData.getMineCraftData().getMineDataById(this._mineData.getId());
        if (oldMineId == this._mineData.getId() || newMineId == this._mineData.getId()) {
            this._scroll.updateLayout();
        }
    }
    _onEventBattleMine(eventName, message) {
        var myEndArmy = message.self_begin_army - message.self_red_army;
        if (myEndArmy <= 0) {
            this.close();
            return;
        }
    }
    _onFastBattle() {
        if (G_UserData.getMineCraftData().getSelfMineId() != this._mineData.getId()) {
            this.closeWithAction();
            return;
        }
        this._scroll.updateLayout();
    }
    _onEventGrainCarNotify(eventName, carUnit) {
        if (carUnit && carUnit.isInMine(this._mineData.getId())) {
            this._scroll.updateCar(carUnit);
        }
    }
    _onEventGrainCarAttack(event, awards, hurt, army, desc_army) {
        this._hurt = hurt;
        this._awards = awards;
        this._playAttackAnimation(awards, hurt, army, desc_army);
        this._scroll.updateLayout();
    }
    _onEventGrainCarClicked(eventName, carUnit) {
        this._curAtkCarUnit = carUnit;
        if (this._mineData.getId() != G_UserData.getMineCraftData().getSelfMineId()) {
            G_Prompt.showTip(Lang.get('mine_diff_mine'));
            return;
        }
        if (carUnit.getStamina() <= 0) {
            G_Prompt.showTip(Lang.get('grain_car_has_broken'));
            return;
        }
        if (G_UserData.getMineCraftData().getMyArmyValue() < GrainCarConfigHelper.getGrainCarAttackLose()) {
            G_Prompt.showTip(Lang.get('grain_car_not_enough_army'));
            return;
        }
        if (!carUnit.isInMine(this._mineData.getId())) {
            G_Prompt.showTip(Lang.get('grain_car_has_left'));
            this._scroll.updateLayout();
            return;
        }
        var [canAttack, nextAtkTime] = GrainCarDataHelper.canAttackGrainCar();
        if (!canAttack) {
            G_Prompt.showTip(Lang.get('grain_car_attack_CD'));
            return;
        }
        this._scroll.setAtkFocusedGuild(carUnit.getGuild_id());
        G_UserData.getGrainCar().c2sAttackGrainCar(carUnit.getGuild_id(), this._mineData.getId());
    }
    _onEventMoveCarNotify(eventName, newCarUnit) {
        var curPit = newCarUnit.getCurPit();
        if (curPit == this._mineData.getId()) {
            this._scroll.updateLayout();
        }
    }
}