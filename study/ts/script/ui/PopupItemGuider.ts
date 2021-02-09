const { ccclass, property } = cc._decorator;

import CommonDesValue from './component/CommonDesValue'

import CommonIconTemplate from './component/CommonIconTemplate'

import CommonNormalMidPop from './component/CommonNormalMidPop'
import PopupBase from './PopupBase';
import { handler } from '../utils/handler';
import { assert } from '../utils/GlobleFunc';
import UIHelper from '../utils/UIHelper';
import { Lang } from '../lang/Lang';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { G_ConfigLoader, Colors, G_UserData, G_Prompt, G_SignalManager, G_SceneManager } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { TypeConvertHelper } from '../utils/TypeConvertHelper';
import { WayFuncDataHelper } from '../utils/data/WayFuncDataHelper';
import PopupItemGuiderCell from './PopupItemGuiderCell';
import { Util } from '../utils/Util';
import { LogicCheckHelper } from '../utils/LogicCheckHelper';
import VipFunctionIDConst from '../const/VipFunctionIDConst';
import { UserCheck } from '../utils/logic/UserCheck';
import { UIPopupHelper } from '../utils/UIPopupHelper';
import PopupSystemAlert from './PopupSystemAlert';
import { FunctionConst } from '../const/FunctionConst';
import { DataConst } from '../const/DataConst';
import { SignalConst } from '../const/SignalConst';
import { DropHelper } from '../utils/DropHelper';
import { Path } from '../utils/Path';
import PopupSweep from '../scene/view/stage/PopupSweep';
import PopupSiegeCome from '../scene/view/stage/PopupSiegeCome';
import { Slot } from '../utils/event/Slot';

@ccclass
export default class PopupItemGuider extends PopupBase {

    static preLoadRes = [
        'prefab/common/PopupItemGuiderCell'
    ];

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _iconTemplate: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemName: cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitleOwn: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnNum: cc.Label = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeOwnNum: CommonDesValue = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _fileNodeEmpty: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _popupItemGuiderCellPrefab: cc.Prefab = null;

    private _title;
    private _itemType;
    private _itemValue;
    private _scrollViewSize;

    private _guiderList: any[];
    private _cells:PopupItemGuiderCell[];

    protected _isClickOtherClose = true;
    _currStageData: any;
    _resetPrice: any;
    _currStageCfgInfo: any;
    _sweepCount: any;
    _awardsList: any;
    _signalFastExecute: Slot;
    _signalSweepFinish: Slot;
    _signalReset: Slot;
    private _popupSweep: PopupSweep;

    protected preloadResList = [
        { path: Path.getPrefab("PopupSweep", "stage"), type: cc.Prefab },
    ];
    _popupSweepPrefab: any;
    _popupSweepSignal: Slot;

    onCreate() {
        this._popupSweepPrefab = cc.resources.get(Path.getPrefab("PopupSweep", "stage"));
    }

    setTitle(title) {
        this._title = title;
    }

    updateUI(itemType, itemValue) {
        this._itemType = itemType;
        this._itemValue = itemValue;
    }

    start() {
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        if (!this._title) this._title = Lang.get('way_type_get');
        this._commonNodeBk.setTitle(this._title);
        this._nodeOwnNum.setFontSize(20);
        this._scrollViewSize = this._scrollView.node.getContentSize();

        if (this._itemType && this._itemValue) {
            this._refreshView();
        }
    }

    onEnter() {
        this._signalFastExecute = G_SignalManager.add(SignalConst.EVENT_FAST_EXECUTE_STAGE, handler(this, this._onEventFastExecuteStage));
        this._signalSweepFinish = G_SignalManager.add(SignalConst.EVENT_SWEEP_FINISH, handler(this, this._onEventSweepFinish));
        this._signalReset = G_SignalManager.add(SignalConst.EVENT_RESET_STAGE, handler(this, this._onEventReset));
    }

    onExit() {
        this._signalFastExecute.remove();
        this._signalFastExecute = null;
        this._signalReset.remove();
        this._signalReset = null;
        this._signalSweepFinish.remove();
        this._signalSweepFinish = null;
    }

    _refreshView() {
        this._cells = [];
        var itemType = this._itemType;
        var itemValue = this._itemValue;
        //assert((itemValue, 'PopupItemGuider\'s itemId can\'t be empty!!!');
        this._iconTemplate.unInitUI();
        this._iconTemplate.initUI(itemType, itemValue);
        this._iconTemplate.setTouchEnabled(false);
        var itemParams = this._iconTemplate.getItemParams();
        this._itemName.string = (itemParams.name);
        this._itemName.node.color = (itemParams.icon_color);
        UIHelper.updateTextOutline(this._itemName, itemParams);
        if (itemParams.description) {
            this._itemDesc.string = (itemParams.description);
        } else {
            this._itemDesc.string = (' ');
        }
        // var desRender = this._itemDesc.getVirtualRenderer();
        // desRender.setWidth(415);
        this._itemDesc.node.width = 415;
        UIHelper.updateLabelSize(this._itemDesc);
        var desSize = this._itemDesc.node.getContentSize();
        if (desSize.height < this._scrollViewSize.height) {
            desSize.height = this._scrollViewSize.height;
        }
        this._itemDesc.node.y = -this._itemDesc.node.height;
        this._itemDesc.node.setContentSize(desSize);
        this._scrollView.content.setContentSize(desSize);
        this._scrollView.scrollToTop();
        var guiderList = WayFuncDataHelper.getGuiderList(itemType, itemValue);
        var info = G_ConfigLoader.getConfig(ConfigNameConst.WAY_TYPE).get(itemType, itemValue);
        // assert(info, string.format('way_type can\'t find type = %d and value = %d', itemType, itemValue));
        if (info.num_type == 1) {
            var itemNum = UserDataHelper.getNumByTypeAndValue(itemType, itemValue);
            this._textOwnNum.string = ('' + itemNum);
            this._nodeOwnNum.node.active = true;
            if (itemParams.fragment_id) {
                var fragmentNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, itemParams.fragment_id);
                var fragmentParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, itemParams.fragment_id);
                var maxCount = fragmentParams.cfg.fragment_num;
                var isEnough = fragmentNum >= maxCount;
                this._nodeOwnNum.updateUI(Lang.get('common_curr_have_fragment'), fragmentNum, maxCount, 0);
                this._nodeOwnNum.setValueColor(isEnough && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_RED);
                this._nodeOwnNum.setMaxColor(Colors.BRIGHT_BG_ONE);
                this._nodeOwnNum.setDesColor(Colors.BRIGHT_BG_TWO);
            } else {
                this._nodeOwnNum.updateUI(Lang.get('common_curr_have'), itemNum, null, 0);
                this._nodeOwnNum.setValueColor(Colors.BRIGHT_BG_GREEN);
                this._nodeOwnNum.setDesColor(Colors.BRIGHT_BG_TWO);
            }
        } else {
            this._nodeOwnNum.node.active = false;
        }
        this._guiderList = guiderList;
        for (let i = 0; i < this._guiderList.length; i++) {
            this._addItem(i);

        }
        this._listItemSource.content.height = (110 + 2) * this._guiderList.length;
        if (this._listItemSource.node.height > this._listItemSource.content.height)
            this._listItemSource.content.height = this._listItemSource.node.height;
        this._fileNodeEmpty.active = (this._guiderList.length <= 0);
    }
    _doResetSweep() {
        var resetCount = this._currStageData.getReset_count();
        var timesOut = LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE, resetCount, Lang.get('stage_no_reset_count'));
        if (!timesOut) {
            var vipInfo = G_UserData.getVip().getVipFunctionDataByType(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE);
            var resetLimit = vipInfo.value;
            resetLimit = resetLimit - resetCount;
            this._resetPrice = UserDataHelper.getPriceAdd(100, resetCount + 1);

            UIPopupHelper.popupSystemAlert(Lang.get('stage_tips'),
                Lang.get('stage_reset_warning', { count: this._resetPrice, leftcount: resetLimit }),
                handler(this, this._sendResetMsg), null, function (popupSystemAlert: PopupSystemAlert) {
                    popupSystemAlert.setCheckBoxVisible(false);
                });
        }
        return true;
    }
    _sendResetMsg() {
        var [success, errorFunc] = UserCheck.enoughCash(this._resetPrice);
        if (success == false) {
            errorFunc();
            return;
        }
        G_UserData.getStage().c2sResetStage(this._currStageCfgInfo.id);
    }

    _doSweep() {
        var [isOpen, desc] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SWEEP);
        if (!isOpen) {
            G_Prompt.showTip(desc);
            return;
        }
        var bagFull = LogicCheckHelper.checkPackFullByAwards(this._awardsList);
        if (bagFull) {
            return;
        }
        var star = this._currStageData.getStar();
        if (star != 3) {
            G_Prompt.showTip(Lang.get('sweep_enable'));
            return;
        }
        var needVit = this._currStageCfgInfo.cost * this._sweepCount;
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit);
        if (success) {
            G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_PAUSE);
            G_UserData.getStage().c2sFastExecuteStage(this._currStageCfgInfo.id, this._sweepCount);
        }
        return true;
    }
    _getSweepCount() {
        var executeCnt = this._currStageData.getExecute_count();
        var sweepCount = this._currStageCfgInfo.challenge_num - executeCnt;
        var sweepVit = sweepCount * this._currStageCfgInfo.cost;
        var myVit = G_UserData.getBase().getResValue(DataConst.RES_VIT);
        var sweepVitEnough = true;
        while (myVit < sweepVit) {
            sweepCount = sweepCount - 1;
            sweepVit = sweepCount * this._currStageCfgInfo.cost;
            if (sweepCount <= 0) {
                sweepVitEnough = false;
            }
        }
        if (sweepCount > 10) {
            sweepCount = 10;
        } else if (sweepCount <= 0 && !sweepVitEnough) {
            sweepCount = this._currStageCfgInfo.challenge_num - executeCnt;
            if (sweepCount > 10) {
                sweepCount = 10;
            }
        } else if (sweepCount <= 0) {
            sweepCount = 0;
        }
        return sweepCount;
    }

    _addItem(index: number): void {
        // var cell: PopupItemGuiderCell = Util.getNode('prefab/common/PopupItemGuiderCell', PopupItemGuiderCell);
        var cell: PopupItemGuiderCell = cc.instantiate(this._popupItemGuiderCellPrefab).getComponent(PopupItemGuiderCell);
        cell.setClickCallback(this._onClickItem.bind(this));
        cell.updateUI(index, this._guiderList[index]);
        this._cells.push(cell);
        this._listItemSource.content.addChild(cell.node);
    }

    _udpateItems() {
        for (let i = 0; i < this._guiderList.length; i++) {
            this._cells[i].updateUI(i, this._guiderList[i]);
        }
    }


    _onClickItem(cellData) {
        var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SUPER_SWEEP)[0];
        if (cellData.type == 1 && isOpen) {
            this._currStageData = cellData.stageData;
            this._currStageCfgInfo = cellData.stageCfgInfo;
            var star = this._currStageData.getStar();
            if (star == 3) {
                this._sweepCount = this._getSweepCount();
                var awards = DropHelper.getStageDrop(this._currStageCfgInfo);
                this._awardsList = awards;
                if (this._sweepCount > 0) {
                    this._doSweep();
                } else {
                    this._doResetSweep();
                }
            } else {
                WayFuncDataHelper.gotoModule(cellData.cfg);
            }
        } else {
            WayFuncDataHelper.gotoModule(cellData.cfg);
        }
    }

    _onEventReset() {
        this._refreshPopupSweep(true);
        this._udpateItems();
    }
    _refreshPopupSweep(isReset?) {
        var callback = null;
        var btnString = '';
        this._sweepCount = this._getSweepCount();
        if (this._sweepCount == 0) {
            callback = handler(this, this._doResetSweep);
            btnString = Lang.get('stage_reset_word');
        } else {
            callback = handler(this, this._doSweep);
            btnString = Lang.get('stage_fight_ten', { count: this._sweepCount });
        }
        if (!isReset && !this._popupSweep) {
            this._popupSweep = cc.instantiate(this._popupSweepPrefab).getComponent(PopupSweep);
            this._popupSweep.init(callback);
            this._popupSweepSignal = this._popupSweep.signal.add(handler(this, this._onSweepClose));
            this._popupSweep.openWithAction();
        } else if (this._popupSweep) {
            this._popupSweep.setCallback(callback);
        }
        if (this._popupSweep) {
            this._popupSweep.setBtnResetString(btnString);
        }
    }
    _onSweepClose(event) {
        if (event == 'close') {
            this._popupSweep = null;
            this._clearSignal();
        }
    }
    _clearSignal() {
        if (this._popupSweepSignal) {
            this._popupSweepSignal.remove();
            this._popupSweepSignal = null;
        }
    }
    _onEventFastExecuteStage(eventName, results) {
        this._refreshPopupSweep();
        this._popupSweep.updateReward(results, this._awardsList);
        this._popupSweep.setStart();
        this._udpateItems();
    }
    _onEventSweepFinish(eventName) {
        this.checkRebelArmy();
    }
    checkRebelArmy() {
        var rebel = G_UserData.getStage().getNewRebel();
        if (rebel) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSiegeCome", "stage"), (popupSiegeCome: PopupSiegeCome) => {
                popupSiegeCome.init(rebel);
                popupSiegeCome.open();
            });
            G_UserData.getStage().resetRebel();
        }
    }

    onBtnCancel() {
        this.closeWithAction();
    }
}
