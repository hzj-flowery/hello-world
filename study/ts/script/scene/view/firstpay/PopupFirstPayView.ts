const {ccclass, property} = cc._decorator;

import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar'
import PopupBase from '../../../ui/PopupBase';
import UIHelper from '../../../utils/UIHelper';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { handler } from '../../../utils/handler';
import { G_UserData, G_SignalManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { FunctionConst } from '../../../const/FunctionConst';

@ccclass
export default class PopupFirstPayView extends PopupBase {

   @property({
       type: CommonCustomListViewEx,
       visible: true
   })
   _listItemSource: CommonCustomListViewEx = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonClose: cc.Button = null;

   @property({
       type: CommonStoryAvatar,
       visible: true
   })
   _commonStoryAvator: CommonStoryAvatar = null;

   @property(cc.Prefab)
   firstPayItenCell:cc.Prefab = null;

   _signalActivityRechargeAwardGetInfo:any;
   _signalRecvRoleInfo:any;
   _listData:any[];

   public static path:string = 'firstpay/PopupFirstPayView';
    _signalActivityRechargeAwardUpdate: any;

    ctor() {
        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupFirstPayView', '_onBtnClose');
    }
    onCreate() {
        this.ctor();
        this._listItemSource.setTemplate(this.firstPayItenCell);
        this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));
        this._commonStoryAvator.updateUI(302);
        //this._commonStoryAvator.node.setScale(0.8);

        this.setSceneSize();

        var touchPanel = this.node.getChildByName('touchPanel').getComponent(cc.Button);
        UIHelper.addEventListener(this.node, touchPanel, 'PopupFirstPayView', '_onBtnClose');
    }
    _pullData() {
        var hasActivityServerData = G_UserData.getActivityFirstPay().isHasData();
        if (!hasActivityServerData) {
            G_UserData.getActivityFirstPay().pullData();
        }
        return hasActivityServerData;
    }
    onEnter() {
        var hasServerData = this._pullData();
        if (hasServerData) {
            this.refreshData();
        }
        this._signalActivityRechargeAwardUpdate = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE, handler(this, this._onEventActivityRechargeAwardUpdate));
        this._signalActivityRechargeAwardGetInfo = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO, handler(this, this._onEventActivityRechargeAwardGetInfo));
        this._signalRecvRoleInfo = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._onEventRecvRoleInfo));
        //logWarn('PopupFirstPayView ---------------- onEnter');
    }
    onExit() {
        this._signalActivityRechargeAwardUpdate.remove();
        this._signalActivityRechargeAwardUpdate = null;
        this._signalActivityRechargeAwardGetInfo.remove();
        this._signalActivityRechargeAwardGetInfo = null;
        this._signalRecvRoleInfo.remove();
        this._signalRecvRoleInfo = null;
    }
    _onEventActivityRechargeAwardGetInfo(event, id, message) {
        this.refreshData();
    }
    _onEventActivityRechargeAwardUpdate(event, id, message) {
        this.refreshData();
        this._showRewardsPopup(message['rewrad']);
    }
    _onEventRecvRoleInfo(event, id) {
        this.refreshData();
    }
    _showRewardsPopup(awards) {
        if (awards) {
            PopupGetRewards.showRewards(awards);
        }
    }
    _onBtnClose() {
        this.close();
    }
    _onItemUpdate(item, index) {
        if (this._listData[index]) {
            item.updateUI(this._listData[index]);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(lineIndex, index) {
        var itemData = this._listData[index];
        if (!itemData) {
            return;
        }
        var firstPayData = G_UserData.getActivityFirstPay();
        if (firstPayData.canReceive(itemData.id)) {
            var rewards = UserDataHelper.makeRewards(itemData, 3);
            var full = UserCheck.checkPackFullByAwards(rewards);
            if (full) {
                return;
            }
            G_UserData.getActivityFirstPay().c2sActRechargeAward(itemData.id);
        } else if (firstPayData.hasReceive(itemData.id)) {
        } else {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE);
        }
    }
    _updateList() {
        this._listData = G_UserData.getActivityFirstPay().getFirstPayList();
        this._listItemSource.clearAll();
        this._listItemSource.resize(this._listData.length);
        this._listItemSource.setTouchEnabled(false);
    }
    refreshData() {
        this._updateList();
    }
}
