import PopupBase from "../../../ui/PopupBase";
import { G_SignalManager, G_UserData, G_Prompt } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";
import { Util } from "../../../utils/Util";
import CakeDailyAwardCell from "./CakeDailyAwardCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupCakeDailyAward extends PopupBase {

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;
    _parentView: any;
    _datas: any[];
    _signalGetDailyReward: any;
    _signalEnterSuccess:any;

    initData(parentView) {
        this._parentView = parentView;
    }
    onCreate() {
        this._datas = [];
    }
    onEnter() {
        this._signalGetDailyReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_GET_DAILY_REWARD, handler(this, this._onEventGetDailyReward));
        this._signalEnterSuccess = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS, handler(this, this._onEventEnterSuccess));
        this._updateList();
    }
    onExit() {
        this._signalGetDailyReward.remove();
        this._signalGetDailyReward = null;
        this._signalEnterSuccess.remove();
        this._signalEnterSuccess = null;
    }
    _updateList() {
        this._datas = CakeActivityDataHelper.getDailyAwardInfo();
        this._listView.content.removeAllChildren();
        for (let i = 0; i < this._datas.length; i++) {
            let cell = Util.getNode("prefab/cakeActivity/CakeDailyAwardCell", CakeDailyAwardCell) as CakeDailyAwardCell;
            this._listView.content.addChild(cell.node);
            cell.updateUI(this._datas[i]);
            cell.setIdx(i);
            cell.setCustomCallback(handler(this, this._onItemTouch));
            cell.node.y = (i + 1) * (-130) + i * 3;
            cell.node.x = 0;
        }
    }
    _onItemUpdate(item, index) {
        var data = this._datas[index + 1];
        if (data) {
            item.update(data);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index) {
        var data = this._datas[index];
        if (data) {
            G_UserData.getCakeActivity().c2sGetGuildCakeLoginReward(data.day);
        }
    }
    onClickClose() {
        this.close();
    }
    _onEventGetDailyReward(eventName, awards) {
        G_Prompt.showAwards(awards);
        this._updateList();
        if (this._parentView) {
            this._parentView.updateDailyBtnRp();
        }
    }
    _onEventEnterSuccess(eventName) {
        this._updateList();
    }

}