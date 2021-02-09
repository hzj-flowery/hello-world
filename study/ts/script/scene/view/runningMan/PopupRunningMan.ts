const { ccclass, property } = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import PopupBase from '../../../ui/PopupBase';
import { G_SignalManager, G_UserData, G_SceneManager, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import ListView from '../recovery/ListView';
import PopupRunningManCell from './PopupRunningManCell';
import { RunningManHelp } from './RunningManHelp';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { RunningManConst } from '../../../const/RunningManConst';
import { Path } from '../../../utils/Path';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import PopupItemUse from '../../../ui/PopupItemUse';

@ccclass
export default class PopupRunningMan extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelBase: cc.Node = null;

    @property({ type: CommonNormalLargePop, visible: true })
    _commonBk: CommonNormalLargePop = null;

    @property({ type: ListView, visible: true })
    _listItemSource: ListView = null;

    @property({ type: CommonEmptyListNode, visible: true })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({ type: cc.Sprite, visible: true })
    _titleBG: cc.Sprite = null;

    @property({ type: cc.Prefab, visible: true })
    _runningManCellPrefab: cc.Prefab = null;


    private _signalPlayHorseBetSuccess;
    private _signalPlayHorseBetNotice;
    private _dataList: any[];
    public onCreate() {
        this._commonBk.setTitle(Lang.get('runningman_popup_dlg_title'));
        this._initListItemSource();
        this._commonBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this.setClickOtherClose(true);
    }

    public onEnter() {
        this._signalPlayHorseBetSuccess = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_BET_SUCCESS, handler(this, this._onEventPlayHorseBetSuccess));
        this._signalPlayHorseBetNotice = G_SignalManager.add(SignalConst.EVENT_PLAY_HORSE_BET_NOTICE, handler(this, this._onEventPlayHorseBetSuccess));
    }

    public onExit() {
        this._signalPlayHorseBetSuccess.remove();
        this._signalPlayHorseBetSuccess = null;
        this._signalPlayHorseBetNotice.remove();
        this._signalPlayHorseBetNotice = null;
    }

    public onBtnCancel() {
        this.close();
    }

    private _onEventPlayHorseBetSuccess(id, message) {
        this._dataList = G_UserData.getRunningMan().getBet_info();
        this._listItemSource.resize(this._dataList.length);
    }

    private _initListItemSource() {
        this._listItemSource.setTemplate(this._runningManCellPrefab);
        this._listItemSource.setCallback(handler(this, this._onListItemSourceItemUpdate));
        this._dataList = G_UserData.getRunningMan().getBet_info();
        if (this._dataList) {
            this._listItemSource.resize(this._dataList.length);
            this._nodeEmpty.node.active = false;
        }
    }

    private _onListItemSourceItemUpdate(node: cc.Node, index) {
        let item: PopupRunningManCell = node.getComponent(PopupRunningManCell);
        var data = this._dataList[index];
        if (data) {
            item.setCustomCallback(handler(this, this._onListItemSourceItemTouch))
            item.updateUI(data, index);
        }
    }

    private _onListItemSourceItemSelected(item, index) {
    }

    private _onListItemSourceItemTouch(index) {
        var currState = RunningManHelp.getRunningState();
        var costValue = G_UserData.getRunningMan().getRunningCostValue();
        var heroId = this._dataList[index].heroId;
        var betNum = G_UserData.getRunningMan().getHeroBetNum(heroId);
        function callBackFunction(itemId, selectNum) {
            var itemNum = UserDataHelper.getNumByTypeAndValue(costValue.type, costValue.value);
            if (selectNum > 0 && selectNum <= itemNum) {
                G_UserData.getRunningMan().c2sPlayHorseBet(heroId, selectNum);
            }
        }
        if (currState == RunningManConst.RUNNING_STATE_BET) {
            if (heroId) {
                var itemNum = UserDataHelper.getNumByTypeAndValue(costValue.type, costValue.value);
                if (itemNum == 0) {
                    G_SceneManager.openPopup(Path.getPrefab("PopupItemGuider", "common"), (popupItemGuider: PopupItemGuider) => {
                        popupItemGuider.setTitle(Lang.get('way_type_get'));
                        popupItemGuider.updateUI(costValue.type, costValue.value);
                        popupItemGuider.openWithAction();
                    });
                    return;
                }
                var limitMax = costValue.limitMax - betNum;
                var maxNum = itemNum;
                if (itemNum > limitMax) {
                    maxNum = limitMax;
                }
                if (maxNum == 0) {
                    G_Prompt.showTip(Lang.get('runningman_running_man_no2'));
                    return;
                }
                var tipString = Lang.get('runningman_dlg_tips', { num: maxNum });
                if (betNum == 0) {
                    tipString = Lang.get('runningman_dlg_tips_one', { num: maxNum });
                }

                G_SceneManager.openPopup(Path.getPrefab("PopupItemUse", "common"), (popupItemUse: PopupItemUse) => {
                    popupItemUse.ctor(Lang.get('runningman_dlg_title'), callBackFunction);
                    popupItemUse.updateUI(costValue.type, costValue.value);
                    popupItemUse.setMaxLimit(maxNum);
                    popupItemUse.setTextTips(tipString);
                    popupItemUse.setOwnerCount(itemNum);
                    popupItemUse.openWithAction();
                });
            }
        } else {
            this._dataList = G_UserData.getRunningMan().getBet_info();
            this._listItemSource.resize(this._dataList.length);
            G_Prompt.showTip(Lang.get('runningman_tip2'));
        }
    }
}