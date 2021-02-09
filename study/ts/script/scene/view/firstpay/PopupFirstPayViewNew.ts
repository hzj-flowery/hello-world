import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { G_ConfigLoader, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import PopupBase from "../../../ui/PopupBase";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { handler } from "../../../utils/handler";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import FirstPayTabIcon from "./FirstPayTabIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupFirstPayViewNew extends PopupBase {

    @property({
        type: cc.Sprite,
        visible: true
    }) _imageRightDes: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imageTopDes: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRope1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRope2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRope3: cc.Sprite = null;

    @property({
        type: FirstPayTabIcon,
        visible: true
    })
    _nodeTabIcon1: FirstPayTabIcon = null;

    @property({
        type: FirstPayTabIcon,
        visible: true
    })
    _nodeTabIcon2: FirstPayTabIcon = null;

    @property({
        type: FirstPayTabIcon,
        visible: true
    })
    _nodeTabIcon3: FirstPayTabIcon = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    }) _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Prefab,
        visible: true
    }) firstPayItemCell: cc.Prefab = null;
    private _selectTabIndex: number;
    private _config: any;
    private _data: any[];
    private _signalActivityRechargeAwardUpdate: any;
    private _signalActivityRechargeAwardGetInfo: any;
    private _signalRecvRoleInfo: any;
    private _listData: any[];

    onEnter() {
        this._getFirstRechargeInfo();

        this._signalActivityRechargeAwardUpdate = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE, handler(this, this._onEventActivityRechargeAwardUpdate));
        this._signalActivityRechargeAwardGetInfo = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO, handler(this, this._onEventActivityRechargeAwardGetInfo));
        this._signalRecvRoleInfo = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._onEventRecvRoleInfo));
    }
    onExit() {
        this._signalActivityRechargeAwardUpdate.remove();
        this._signalActivityRechargeAwardUpdate = null;
        this._signalActivityRechargeAwardGetInfo.remove();
        this._signalActivityRechargeAwardGetInfo = null;
        this._signalRecvRoleInfo.remove();
        this._signalRecvRoleInfo = null;
    }

    onLoad() {
        this._config = this.sortData(G_ConfigLoader.getConfig(ConfigNameConst.FIRST_CHARGE_NEW));
        this._listView.setTemplate(this.firstPayItemCell);
        this._listView.setCallback(handler(this, this._onListItemUpdate));
        this._listView.setCustomCallback(handler(this, this._onItemTouch));
        this._initTab();
    }

    sortData(config) {
        let data = {};
        let indexs = {};
        let index = 0;
        const chargeKey = config._asset.key_map['charge'];
        const idKey = config._asset.key_map['id'];
        config._asset.data.forEach(element => {
            if (!data[element[chargeKey]]) data[element[chargeKey]] = [];
            if (indexs[index] !== element[chargeKey]) {
                index++;
                indexs[index] = element[chargeKey];
            }
            data[element[chargeKey]].push(config.get(element[idKey]));
        });

        return { data, indexs, key_map: config._asset.key_map };
    }


    _initTab() {
        for (var i = 1; i <= 3; i++) {
            const index = this._config.indexs[i];
            var txt = this._config.data[index][0].name;
            var isOpen = true//LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_TREASURE_TRAIN_TYPE' + i])[0];
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
            this['_nodeTabIcon' + i].setCallback(handler(this, this._onClickTabIcon));
        }
        this._onClickTabIcon(1);
    }

    _onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        if (index > 3) {
            return;
        }
        this._selectTabIndex = index;
        const dIndex = this._config.indexs[this._selectTabIndex];
        this._listData = this._config.data[dIndex];

        this.updateTabIcons();
        this._updateView();
    }

    updateTabIcons() {
        this._updateRedPoint();
        this._updateTabIconSelectedState();
    }

    _updateTabIconSelectedState() {
        for (var i = 1; i <= 3; i++) {
            this['_nodeTabIcon' + i].setSelected(i == this._selectTabIndex);
        }
    }

    _updateView() {
        UIHelper.loadTexture(this._imageRightDes, Path.getFirstCharge('title_' + this._config.data[this._config.indexs[this._selectTabIndex]][0].title));
        UIHelper.loadTexture(this._imageTopDes, Path.getFirstCharge('title_' + this._config.data[this._config.indexs[this._selectTabIndex]][0].picture));
        this._updateRedPoint();
        this._listView.resize(this._listData.length);

    }

    checkRedPoint(index) {
        if (index == this._selectTabIndex) {
            this['_nodeTabIcon' + index].showRedPoint(false);
            return;
        }
        const dIndex = this._config.indexs[index];
        const listData = this._config.data[dIndex];
        for (const i in listData) {
            if (G_UserData.getActivityFirstPay().canReceive(listData[i].id)) {
                this['_nodeTabIcon' + index].showRedPoint(true);
                return;
            }
        }

    }

    _updateRedPoint() {
        for (var i = 1; i <= 3; i++) {
            this.checkRedPoint(i);
        }
    }

    _getFirstRechargeInfo() {
        G_UserData.getActivityRechargeAward().c2sActGetFirstRechargeInfo();
    }

    _onListItemUpdate(item, index) {

        if (this._listData[index]) {
            item.updateUI(this._listData[index],
                this._selectTabIndex,
                G_UserData.getActivityRechargeAward()._rechargeTimeData[this._config.indexs[this._selectTabIndex]]);
        }
    }


    _onEventActivityRechargeAwardGetInfo(event, id, message) {
        this._updateView();
    }
    _onEventActivityRechargeAwardUpdate(event, id, message) {
        this._updateView();
        this._showRewardsPopup(message['reward']);
    }
    _onEventRecvRoleInfo(event, id) {
        this._updateView();
    }
    _showRewardsPopup(awards) {
        if (awards) {
            PopupGetRewards.showRewards(awards);
        }
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
            G_UserData.getActivityRechargeAward().c2sActGetFirstRechargeAward(itemData.id);
        } else if (firstPayData.hasReceive(itemData.id)) {
        } else {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE);
        }
    }
}
