const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import { HomelandConst } from '../../../const/HomelandConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonUI from '../../../ui/component/CommonUI';
import PopupBase from '../../../ui/PopupBase';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { assert } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { HomelandHelp } from '../homeland/HomelandHelp';
import { MineCraftHelper } from './MineCraftHelper';
import PopupMineNode from './PopupMineNode';



@ccclass
export default class PopupMine extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _popBG: CommonNormalLargePop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePeaceEffect: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageState: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMineOutput: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMineUp: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMineDown: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMineOutputState: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageOutput: cc.Sprite = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resourceOutput: CommonResourceInfo = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDouble: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeOutput: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageUp: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDown: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOutputState: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInfo1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textInfo1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInfo2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textInfo2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInfo3: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textInfo3: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnPageNext: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnPagePrev: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPageNum: cc.Label = null;

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
    _nodeBase: cc.Node = null;
    public static waitEnterMsg(callBack, mineData) {
        var onMsgCallBack = function (id, message) {
            callBack();
        }
        G_UserData.getMineCraftData().c2sEnterMine(mineData[0]);
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_ENTER_MINE, onMsgCallBack);
    }

    private _data: any;
    private _config: any;
    private _page: any;
    private _mineUsers: Array<any>;
    private _foodCost: number;
    private _moveGold: number;
    private _signalEnterMine;
    private _signalSettleMine;
    private _signalBattleMine;
    private _signalGetMineWorld;
    private _signalMineRespond;
    private _singalFastBattle;

    private _popupMineNodePrefab: any;

    private _reportData: any;
    private _index: any;
    private _moveRoads: Array<number>;
    private _signalGrainCarMoveNotify;
    private _dataIndex: number;
    public static MINE_FIX = 0;     //每个矿的基准x坐标0点
    public static MINE_SPACE = 220;
    public static POS_LINE_Y =
        [
            400, 260, 120
        ];
    public static MINE_COUNT_LINE = 3;       //每行3个

    protected preloadResList = [
        { path: Path.getPrefab("PopupMineNode", "mineCraft"), type: cc.Prefab }
    ]


    public setInitData(data: any): void {
        this._data = data;
        this._config = data.getConfigData();
        this._page = null;
        this._mineUsers = [];
        this._signalEnterMine = null;
        this._signalSettleMine = null;
        this._signalBattleMine = null;
        this._signalGetMineWorld = null;
        this._signalMineRespond = null;
        this._singalFastBattle = null;
        this._foodCost = 0;
        this._dataIndex = 0;
    }



    onCreate() {
        this._popupMineNodePrefab = cc.resources.get(Path.getPrefab("PopupMineNode", "mineCraft"));
        this._popBG.addCloseEventListener(handler(this, this.closeWithAction));
        this._popBG.setTitle(this._config.pit_name);
        var background = Path.getBackground(this._config.pit_bg);
        this._imageBG.node.addComponent(CommonUI).loadTexture(background);
        this._createMineNode();
        this._btnMoveIn.setString(Lang.get('mine_move_in'));
        this._btnMoveIn.addClickEventListenerEx(handler(this, this.onBtnMoveInClick));
        for (var i = 1; i <= 3; i++) {
            (this['_imageInfo' + i] as cc.Sprite).node.zIndex = (1);
        }
        if (this._config.pit_type == MineCraftHelper.TYPE_MAIN_CITY) {
            this._imageOutput.node.active = (false);
        }
        // this._imageState.ignoreContentAdaptWithSize(true);
        this._updatePeaceNode();
    }
    onEnter() {
        this._signalEnterMine = G_SignalManager.add(SignalConst.EVENT_ENTER_MINE, handler(this, this._enterMine));
        this._signalSettleMine = G_SignalManager.add(SignalConst.EVENT_SETTLE_MINE, handler(this, this._settleMine));
        this._signalBattleMine = G_SignalManager.add(SignalConst.EVENT_BATTLE_MINE, handler(this, this._onEventBattleMine));
        this._signalGetMineWorld = G_SignalManager.add(SignalConst.EVENT_GET_MINE_WORLD, handler(this, this._onEventGetMineWorld));
        this._signalMineRespond = G_SignalManager.add(SignalConst.EVENT_GET_MINE_RESPOND, handler(this, this._onEventMineRespond));
        this._singalFastBattle = G_SignalManager.add(SignalConst.EVENT_FAST_BATTLE, handler(this, this._onFastBattle));
        this._signalGrainCarMoveNotify = G_SignalManager.add(SignalConst.EVENT_GRAIN_CAR_MOVE_NOTIFY, handler(this, this._onEventGrainCarMoveNotify));
        var showPage = this._getMyPage() || 1;
        this._refreshUserPage(showPage);
        this._refreshData();
        this._refreshRoadCost();
        if (this._data.getMultiple() > 1) {
            var doubleId = this._data.getMultiple();
            var pic = Path.getMineDoubleImg(doubleId - 1);
            this._imageDouble.node.active = (true);
            this._imageDouble.node.addComponent(CommonUI).loadTexture(pic);
        } else {
            this._imageDouble.node.active = (false);
        }
    }
    onExit() {
        this._signalEnterMine.remove();
        this._signalEnterMine = null;
        this._signalSettleMine.remove();
        this._signalSettleMine = null;
        this._signalBattleMine.remove();
        this._signalBattleMine = null;
        this._signalGetMineWorld.remove();
        this._signalGetMineWorld = null;
        this._signalMineRespond.remove();
        this._signalMineRespond = null;
        this._singalFastBattle.remove();
        this._singalFastBattle = null;
        this._signalGrainCarMoveNotify.remove();
        this._signalGrainCarMoveNotify = null;
    }
    //后退
    private onPagePrevClick() {
        this._page = this._page - 1;
        this._refreshUserPage();
    }
    //前进
    private onPageNextClick() {
        this._page = this._page + 1;
        this._refreshUserPage();
    }
    _getBuyString() {

        var maxValue = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.TROOP_MAX).content);
        if (G_UserData.getMineCraftData().isSelfPrivilege()) {
            var soilderAdd = MineCraftHelper.getParameterContent(ParameterIDConst.MINE_CRAFT_SOILDERADD);
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
            var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, money);
            if (!success) {
                return;
            }
        }
        G_UserData.getMineCraftData().c2sMineBuyArmy(count);
    }
    _onBtnClose() {
        this.closeWithAction();
    }
    //迁入
    private onBtnMoveInClick() {
        var myMineId = G_UserData.getMineCraftData().getSelfMineId();
        if (myMineId == this._data.getId()) {
            G_Prompt.showTip(Lang.get('mine_already_in'));
            return;
        }
        var myArmy = G_UserData.getMineCraftData().getMyArmyValue();
        if (myArmy < MineCraftHelper.ARMY_TO_LEAVE && G_UserData.getMineCraftData().getMyMineConfig().pit_type == MineCraftHelper.TYPE_MAIN_CITY) {
            var [strBuy, money, needFood] = this._getBuyString();
            UIPopupHelper.popupSystemAlert(Lang.get('mine_not_army_title'), strBuy, function () {
                this._buyArmy(needFood, money);
            }.bind(this), null, function (popupSystemAlert: any) {
                popupSystemAlert.setCheckBoxVisible(false);
            })
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
            strContent = JSON.parse(strContent);
            // let strContent1 = JSON.stringify(strContent);
            UIPopupHelper.popupSystemAlert(title, strContent, handler(this, this._moveInGold), null, function (popupSystemAlert: PopupSystemAlert) {
                popupSystemAlert._btnCancel.setBtnType(2);
                popupSystemAlert.setCheckBoxVisible(false);
            })
        } else {
            G_UserData.getMineCraftData().c2sSettleMine(this._moveRoads);
            this.closeWithAction();
        }
    }
    _moveInGold() {
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, this._moveGold);
        if (!success) {
            return;
        }
        G_UserData.getMineCraftData().c2sSettleMine(this._moveRoads);
        this.closeWithAction();
    }
    _createMineNode() {
        for (var i = 1; i <= PopupMine.POS_LINE_Y.length; i++) {
            for (var j = 1; j <= PopupMine.MINE_COUNT_LINE; j++) {
                var popupMineNode = (cc.instantiate(this._popupMineNodePrefab) as cc.Node).getComponent(PopupMineNode);
                popupMineNode.setInitData(this._data)
                this._nodeBase.addChild(popupMineNode.node);
                var posX = this._config['position_x_' + i] + PopupMine.MINE_FIX + PopupMine.MINE_SPACE * (j - 1);
                var posY = PopupMine.POS_LINE_Y[i - 1];
                popupMineNode.node.setPosition(new cc.Vec2(posX, posY));
                this._mineUsers.push(popupMineNode);
            }
        }
    }
    _refreshUserPage(page?) {
        if (page) {
            this._page = page;
        }
        var [curTotalPageCount, totalPageCount] = this._getTotalPage();
        if (this._page > totalPageCount) {
            this._page = totalPageCount;
        }
        var userList = this._data.getUsers();
        var [beginCount, pageUserCount] = this._getPageBegin(this._page);
        var needGet = false;
        if (this._page == curTotalPageCount && userList.length % pageUserCount > 0) {
            needGet = true;
        }
        if (this._page > curTotalPageCount) {
            needGet = true;
            if (userList.length % pageUserCount > 0) {
                this._page = Math.max(0, this._page - 1);
            }
        }
        if (this._page == totalPageCount) {
            needGet = false;
        }
        if (needGet) {
            if (!this._data.isRequestData()) {
                this._dataIndex = this._dataIndex + 1;
                G_UserData.getMineCraftData().c2sEnterMine(this._data.getId(), this._dataIndex);
            }
            return;
        }
        var mineCount = 1;
        for (var i = beginCount; i <= beginCount + pageUserCount - 1; i++) {
            var user = userList[i - 1];
            this._mineUsers[mineCount-1].refreshUserData(user);
            mineCount = mineCount + 1;
        }
        this._btnPagePrev.node.active = (true);
        this._btnPageNext.node.active = (true);
        if (this._page == 1) {
            this._btnPagePrev.node.active = (false);
        }
        if (this._page == totalPageCount) {
            this._btnPageNext.node.active = (false);
        }
        this._textPageNum.string = (this._page + ('/' + totalPageCount));
    }
    _getTotalPage() {
        var pageUserCount = PopupMine.MINE_COUNT_LINE * PopupMine.POS_LINE_Y.length;
        var curTotalPageCount = Math.ceil(this._data.getUsers().length / pageUserCount);
        var totalPageCount = curTotalPageCount;
        if (this._config.pit_type != MineCraftHelper.TYPE_MAIN_CITY) {
            totalPageCount = Math.ceil(this._data.getUserCnt() / pageUserCount);
        }
        if (curTotalPageCount == 0) {
            curTotalPageCount = 1;
        }
        if (totalPageCount == 0) {
            totalPageCount = 1;
        }
        return [
            curTotalPageCount,
            totalPageCount
        ];
    }
    _getMyPage() {
        return 1;
    }
    _getPageBegin(pageCount) {
        var pageUserCount = PopupMine.MINE_COUNT_LINE * PopupMine.POS_LINE_Y.length;
        return [
            (pageCount - 1) * pageUserCount + 1,
            pageUserCount
        ];
    }
    _enterMine() {
        this._refreshUserPage();
        this._refreshData();
    }
    _settleMine() {
        G_Prompt.showTip(Lang.get('mine_food_cost_count', { count: this._foodCost }));
    }
    _refreshData() {
        for (var i = 1; i <= 3; i++) {
            this['_imageInfo' + i].node.active = (false);
        }
        var [change, add, onlyAdd, minus, outputDay, strOutputDay, des] = MineCraftHelper.getOutputDetail(this._data.getId());
        this._resourceOutput.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, strOutputDay);
        this._resourceOutput.setTextCountSize(MineCraftHelper.RESOURCE_FONT_SIZE);
        this._resourceOutput.setTextColor(Colors.getMineStateColor(1));
        this._refreshGuildState();
        this._updateMineInfo(add, onlyAdd, minus, des);
        this._updateStateNode(change);
        this._updateMineState(change);
        this._updatePeaceNode();
        if (this._config.pit_type == MineCraftHelper.TYPE_MAIN_CITY) {
            this._imageInfo1.node.active = (true);
            this._imageInfo2.node.active = (false);
            this._imageInfo3.node.active = (false);
            this._textInfo1.string = (Lang.get('mine_no_output'));
            this._textInfo1.node.color = (Colors.getMineInfoColor(1));
        }
    }
    _refreshGuildState() {
        var myGuildId = G_UserData.getGuild().getMyGuildId();
        var guildId = this._data.getGuildId();
        if (guildId != 0) {
            this._textGuildName.string = (this._data.getGuildName());
            if (myGuildId != guildId) {
                this._textGuildName.node.color = (Colors.getMineGuildColor(2));
            } else {
                this._textGuildName.node.color = (Colors.getMineGuildColor(1));
            }
        } else {
            this._textGuildName.node.color = (Colors.getMineGuildColor(1));
            this._textGuildName.string = (Lang.get('mine_no_guild'));
        }
        if (this._data.isOwn()) {
            this._imageState.node.active = (true);
            this._imageState.node.addComponent(CommonUI).loadTexture(Path.getMineNodeTxt('img_mine_occupy02'));
        } else if (this._data.getGuildId() != 0) {
            this._imageState.node.active = (true);
            this._imageState.node.addComponent(CommonUI).loadTexture(Path.getMineNodeTxt('img_mine_occupy01'));
        } else {
            this._imageState.node.active = (false);
        }
        var iconX = this._textGuildName.node.x - this._textGuildName.node.getContentSize().width / 2 - 10;
        this._imageState.node.x = (iconX);
    }
    _updateMineInfo(add, addOnly, minus, des) {
        for (var i = 1; i <= 3; i++) {
            this['_imageInfo' + i].node.active = (true);
        }
        if (!this._data.isMyGuildMine()) {
            add = 0;
            addOnly = 0;
        }
        var titleIndex = 1;
        if (add == 0) {

            var parameterContent = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MINE_OUTPUT_ADD);
            //assert((parameterContent, 'not id, ' + ParameterIDConst.MINE_OUTPUT_ADD);
            var showAdd = parseInt(parameterContent.content) / 10;
            this._textInfo1.string = (Lang.get('mine_guild_state_show', { count: showAdd }));
            this._textInfo1.node.color = (Colors.getMineInfoColor(4));
        } else {
            this._textInfo1.string = (Lang.get('mine_same_guild', { count: add }));
            this._textInfo1.node.color = (Colors.getMineInfoColor(1));
        }
        if (addOnly == 0) {
            var parameterContent = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MINE_ONLY_GUILD);
            //assert((parameterContent, 'not id, ' + ParameterIDConst.MINE_ONLY_GUILD);
            var showAdd = parseInt(parameterContent.content) / 10;
            this._textInfo2.string = (Lang.get('mine_own_state_show', { count: showAdd }));
            this._textInfo2.node.color = (Colors.getMineInfoColor(4));
        } else {
            this._textInfo2.string = (Lang.get('mine_only_guild', { count: addOnly }));
            this._textInfo2.node.color = (Colors.getMineInfoColor(1));
        }
        this._imageInfo3.node.active = (false);
        if (minus != 0) {
            this._textInfo3.string = (Lang.get('mine_state', {
                state: des,
                count: minus
            }));
            this._textInfo3.node.color = (Colors.getMineInfoColor(3));
            this._imageInfo3.node.active = (true);
        }
    }
    _updateStateNode(finalCount) {
        if (!this._data.isMyGuildMine()) {
            this._nodeOutput.active = (false);
            return;
        }
        this._textOutputState.string = ('(  ' + (finalCount + '%)'));
        var posX = this._resourceOutput.node.x + this._resourceOutput.getContentWidth();
        this._nodeOutput.x = (posX);
        this._imageDown.node.active = (false);
        this._imageUp.node.active = (false);
        if (finalCount < 0) {
            this._nodeOutput.active = (true);
            this._imageDown.node.active = (true);
            this._imageDown.node.x = (this._textOutputState.node.x);
            this._textOutputState.node.color = (Colors.getMineInfoColor(3));
        } else if (finalCount > 0) {
            this._nodeOutput.active = (true);
            this._imageUp.node.active = (true);
            this._imageUp.node.x = (this._textOutputState.node.x);
            this._textOutputState.node.color = (Colors.getMineInfoColor(1));
        } else {
            this._nodeOutput.active = (false);
        }
    }
    _updateMineState(finalCount) {
        this._textMineOutputState.string = ('(  ' + (finalCount + '%)'));
        var posX = this._textGuildName.node.x + this._textGuildName.node.getContentSize().width / 2;
        this._nodeMineOutput.x = (posX);
        this._imageMineDown.node.active = (false);
        this._imageMineUp.node.active = (false);
        if (finalCount < 0) {
            this._nodeMineOutput.active = (true);
            this._imageMineDown.node.active = (true);
            this._imageMineDown.node.x = (this._textMineOutputState.node.x);
            this._textMineOutputState.node.color = (Colors.getMineInfoColor(3));
        } else if (finalCount > 0) {
            this._nodeMineOutput.active = (true);
            this._imageMineUp.node.active = (true);
            this._imageMineUp.node.x = (this._textMineOutputState.node.x);
            this._textMineOutputState.node.color = (Colors.getMineInfoColor(1));
        } else {
            this._nodeMineOutput.active = (false);
        }
    }
    _refreshRoadCost() {
        var selfMineId = G_UserData.getMineCraftData().getSelfMineId();
        if (this._data.getId() == selfMineId) {
            this._moveResource.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD, 0);
            this._moveResource.setTextColor(Colors.getMineStateColor(1));
            this._btnMoveIn.setEnabled(false);
            return;
        }
        this._moveRoads = MineCraftHelper.getRoad2(selfMineId, this._data.getId());
        var parameterContent = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.FOOD_PER_MOVE);
        assert(parameterContent, 'not id, ' + ParameterIDConst.FOOD_PER_MOVE);
        this._foodCost = this._moveRoads.length * parseInt(parameterContent.content);
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
    _onEventBattleMine(eventName, message) {
        var myEndArmy = message.self_begin_army - message.self_red_army;
        if (myEndArmy <= 0) {
            this.close();
        }
    }
    _onEventGetMineWorld() {
        this._refreshData();
    }



    _onEventMineRespond(eventName, oldMineId, newMineId) {
        this._data = G_UserData.getMineCraftData().getMineDataById(this._data.getId());
        this._refreshUserPage();
        this._refreshData();
    }
    //收到扫荡结果
    _onFastBattle() {
        if (G_UserData.getMineCraftData().getSelfMineId() != this._data.getId()) {
            this.closeWithAction();
        }

    }
    _updatePeaceNode() {
        this._nodePeaceEffect.removeAllChildren();
        if (!this._data.isPeace()) {
            return;
        }
        function effectFunction(effect) {
            return new cc.Node();
        }
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodePeaceEffect, 'moving_kuangzhan_hepingqizi', effectFunction, eventFunction, false);
    }
    _onEventGrainCarMoveNotify(eventName, carUnit) {
        if (carUnit.isInMine(this._data.getId())) {
            this._openGrainCarDialog();
        }
    }
    _openGrainCarDialog() {
        this.closeWithAction();
        G_SignalManager.dispatch(SignalConst.EVENT_GRAIN_CAR_CAR_INTO_MINE, this._data);
    }

}