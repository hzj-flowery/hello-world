import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { TerritoryConst } from "../../../const/TerritoryConst";
import { Colors, G_Prompt, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import CommonHelp from "../../../ui/component/CommonHelp";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import PopupTerritoryOneKeyCell from "./PopupTerritoryOneKeyCell";
import { TerritoryHelper } from "./TerritoryHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupTerritoryOneKey extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;
    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;
    @property({
        type: CommonHelp,
        visible: true
    })
    _fileHelp: CommonHelp = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCustom: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _txtNum: cc.Label = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonOk: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    popupTerritoryOneKeyCell: cc.Prefab = null;

    private _listItems: PopupTerritoryOneKeyCell[];
    private _signalTerritoryUpdate: any;
    private _signalTerritorySync: any;
    private _signalTerritoryFight: any;
    private _signalPatrol: any;
    private _signalPatrolAward: any;
    private _signalGetRiotAward: any;
    private _signalRiotHelper: any;
    private _signalTerritoryOneKey: any;
    private _signalUseItemSuccess: any;
    private _signalTerritoryStateUpdate: any;

    ctor() {
        this._commonNodeBk = null;
        this._listView = null;
        this._fileHelp = null;
        this._nodeCustom = null;
        this._txtNum = null;
        this._buttonOk = null;
    }
    onCreate() {
        this._commonNodeBk.setTitle(Lang.get('lang_territory_onekey_title'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnCancel));
        this._buttonOk.setString(Lang.get('lang_territory_onekey_title'));
        this._nodeCustom.active = (false);
        this._fileHelp.updateUI(FunctionConst.FUNC_TERRITORY_ONEKEY_PATROL);
        this._listItems = [];
        for (var i = 1; i <= TerritoryConst.MAX_CITY_SIZE; i++) {
            this._createCell(i);
        }
        //this._listView.doLayout();
    }
    onEnter() {
        this._signalTerritoryUpdate = G_SignalManager.add(SignalConst.EVENT_TERRITORY_UPDATEUI, handler(this, this._onEventUpdate));
        this._signalTerritorySync = G_SignalManager.add(SignalConst.EVENT_TERRITORY_SYNC_SINGLE_INFO, handler(this, this._onEventUpdate));
        this._signalTerritoryFight = G_SignalManager.add(SignalConst.EVENT_TERRITORY_ATTACKTERRITORY, handler(this, this._onEventUpdate));
        this._signalPatrol = G_SignalManager.add(SignalConst.EVENT_TERRITORY_PATROL, handler(this, this._onEventUpdate));
        this._signalPatrolAward = G_SignalManager.add(SignalConst.EVENT_TERRITORY_GETAWARD, handler(this, this._onEventUpdate));
        this._signalGetRiotAward = G_SignalManager.add(SignalConst.EVENT_TERRITORY_GET_RIOT_AWARD, handler(this, this._onEventUpdate));
        this._signalRiotHelper = G_SignalManager.add(SignalConst.EVENT_TERRITORY_FORHELP, handler(this, this._onEventUpdate));
        this._signalTerritoryOneKey = G_SignalManager.add(SignalConst.EVENT_TERRITORY_ONEKEY, handler(this, this._onEventUpdate));
        this._signalUseItemSuccess = G_SignalManager.add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(this, this.updateCost));
        this._signalTerritoryStateUpdate = G_SignalManager.add(SignalConst.EVENT_TERRITORY_STATE_UPDATE, handler(this, this._onEventUpdate));
        G_UserData.getTerritory().resetCurPatrolList();
        this.updateView();
    }
    _onEventUpdate() {
        this.updateView();
    }
    updateView() {
        for (var _ in this._listItems) {
            var cell = this._listItems[_];
            cell.updateUI();
        }
        this.updateCost();
    }
    getCost() {
        var cost = 0;
        for (var i = 1; i <= TerritoryConst.MAX_CITY_SIZE; i++) {
            var cell = this._listItems[i];
            if (cell) {
                cost = cost + cell.getCost();
            }
        }
        return cost;
    }
    updateCost() {
        var cost = this.getCost();
        if (cost > 0) {
            this._nodeCustom.active = (true);
            this._txtNum.string = (cost).toString();
            var color = null;
            var showDialog = false;
            if (LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, cost, showDialog)) {
                color = Colors.BRIGHT_BG_ONE;
            } else {
                color = Colors.RED;
            }
            this._txtNum.node.color = (color);
        } else {
            this._nodeCustom.active = (false);
        }
    }
    _createCell(index) {
        var cell = cc.instantiate(this.popupTerritoryOneKeyCell);
        let ts = cell.getComponent(PopupTerritoryOneKeyCell);
        ts.ctor(index, this);
        this._listItems[index] = ts;
        this._listView.pushBackCustomItem(cell);
    }
    _onBtnCancel() {
        this.close();
    }
    onBtnOk() {
        var idList = [];
        var patrolTypeList = [];
        var heroIdList = [];
        for (var i = 1; i <= TerritoryConst.MAX_CITY_SIZE; i++) {
            var cell = this._listItems[i];
            var [canPatrol, isOk, params] = cell.getOneKeyParam();
            if (canPatrol) {
                if (!isOk) {
                    var info = TerritoryHelper.getTerritoryInfo(i);
                    G_Prompt.showTip(Lang.get('lang_territory_onekey_nohero_tip', { name: info.name }));
                    return;
                }
                table.insert(idList, params.id);
                table.insert(patrolTypeList, params.patrol_type);
                table.insert(heroIdList, params.hero_id);
            }
        }
        if (idList.length == 0) {
            return;
        }
        var cost = this.getCost();
        if (LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, cost) == false) {
            return;
        }
        G_UserData.getTerritory().c2sTerritoryOneKey(idList, patrolTypeList, heroIdList);
    }
    onExit() {
        for (var i = 1; i <= TerritoryConst.MAX_CITY_SIZE; i++) {
            var cell = this._listItems[i];
            if (cell) {
                cell.clear();
            }
        }
        this._signalTerritoryUpdate.remove();
        this._signalTerritoryUpdate = null;
        this._signalTerritorySync.remove();
        this._signalTerritorySync = null;
        this._signalTerritoryFight.remove();
        this._signalTerritoryFight = null;
        this._signalPatrol.remove();
        this._signalPatrol = null;
        this._signalPatrolAward.remove();
        this._signalPatrolAward = null;
        this._signalGetRiotAward.remove();
        this._signalGetRiotAward = null;
        this._signalRiotHelper.remove();
        this._signalRiotHelper = null;
        this._signalTerritoryOneKey.remove();
        this._signalTerritoryOneKey = null;
        this._signalUseItemSuccess.remove();
        this._signalUseItemSuccess = null;
        this._signalTerritoryStateUpdate.remove();
        this._signalTerritoryStateUpdate = null;
    }
}