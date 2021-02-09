import UIHelper from "../../../utils/UIHelper";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { SignalConst } from "../../../const/SignalConst";
import { G_SignalManager, G_UserData, G_NetworkManager, G_ConfigManager } from "../../../init";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { FunctionConst } from "../../../const/FunctionConst";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupVipGiftPkg extends PopupBase {

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

    @property(cc.Prefab)
    vipGiftPkgItemCell: cc.Prefab = null;


    _signalVipGetVipGiftItems: any;
    _signalRechargeGetInfo: any;
    _listData: any[];
    loadIndex: number = 0;
    scheduleHandler: any;
    selectIndex: number = -1;


    ctor() {
        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupVipGiftPkg', '_onBtnClose');
    }
    onCreate() {
        this.ctor();
        this._listItemSource.setTemplate(this.vipGiftPkgItemCell);
        this._listItemSource.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listItemSource.setCustomCallback(handler(this, this._onItemTouch));

        var Image_2 = this.node.getChildByName('Image_2');
        UIHelper.addClickEventListenerEx(Image_2, handler(this, this._onBtnClose));
        if(!G_ConfigManager.checkCanRecharge()) {
            var Image_1 = this.node.getChildByName('Image_1').getComponent(cc.Sprite);
            UIHelper.loadTexture(Image_1, Path.getText('txt_vip01_tmp'));
        }
        
    }
    onEnter() {
        this._signalVipGetVipGiftItems = G_SignalManager.add(SignalConst.EVENT_VIP_GET_VIP_GIFT_ITEMS, handler(this, this._onEventGetVipGift));
        this._signalRechargeGetInfo = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(this, this._onEventRechargeGetInfo));
        this._updateList();
        this._updateListPos();
        console.log('PopupVipGiftPkg ---------------- onEnter');
    }
    onExit() {
        this._signalVipGetVipGiftItems.remove();
        this._signalVipGetVipGiftItems = null;
        this._signalRechargeGetInfo.remove();
        this._signalRechargeGetInfo = null;
    }
    _onEventGetVipGift(id, message) {
        var awards = message['reward'] || [];
        PopupGetRewards.showRewards(awards);
        //this._updateList();
        this._listItemSource.updateItemByID(this.selectIndex);
        this._updateListPos();
    }
    _onEventRechargeGetInfo(id, message) {

        //  this._updateList();
        this._listItemSource.updateCurItems();
        this._updateListPos();
    }
    _onItemUpdate(item, index) {
        if (this._listData[index]) {
            item.updateUI(this._listData[index]);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(lineIndex, index) {
        var vipItemData = this._listData[index];
        if (!vipItemData) {
            return;
        }
        var vipLevel = vipItemData.getId();
        var playerVipLevel = G_UserData.getVip().getLevel();
        if (playerVipLevel < vipLevel) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE);
            return;
        }
        var config = vipItemData.getInfo();
        var [success, popFunc] = LogicCheckHelper.enoughCash(config.price);
        if (success == true) {
            this.selectIndex = index;
            G_NetworkManager.send(MessageIDConst.ID_C2S_GetVipReward, { vip_level: vipItemData.getId() });
        } else if (popFunc) {
            popFunc();
        }
    }
    _onBtnClose() {
        this.close();
    }
    _updateList() {
        this.loadIndex = 0
        console.log('PopupVipGiftPkg _updateList');
        this._listData = UserDataHelper.getVipGiftPkgList();
        if (this.scheduleHandler) {
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        if (this.loadIndex == 0) {
            this._listItemSource.clearAll();
            this.scheduleHandler = handler(this, this.loadListViewCell);
            this.schedule(this.scheduleHandler, 0.1);
        }
        this.loadListViewCell();
        //this._listItemSource.resize(this._listData.length);
    }
    _updateListPos() {
        console.log('PopupVipGiftPkg _updateListPos');
        // var index = UserDataHelper.findFirstCanReceiveGiftPkgIndex(this._listData);
        // if (!index) {
        //     index = UserDataHelper.findFirstUnReceiveGiftPkgIndex(this._listData);
        // }
        // if (!index) {
        //     index = this._listData.length;
        // }
        // this._listItemSource.setLocation(index);
    }
    loadListViewCell() {
        this.loadIndex++;
        if (this.loadIndex >= this._listData.length) {
            if (this.scheduleHandler) {
                this.unschedule(this.scheduleHandler);
                this.scheduleHandler = null;
            }
            this.loadIndex = this._listData.length;
        }

        this._listItemSource.resize(this.loadIndex, 2, false);
    }

}
