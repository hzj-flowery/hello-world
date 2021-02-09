const { ccclass, property } = cc._decorator;
import ViewBase from "../../ViewBase";
import { G_UserData, G_SignalManager, G_Prompt } from "../../../init";
import { ShopHelper } from "../shop/ShopHelper";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import { clone } from "../../../utils/GlobleFunc";
import CommonFullScreen from "../../../ui/component/CommonFullScreen";
import CommonTabGroup from "../../../ui/component/CommonTabGroup";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";
import { SignalConst } from "../../../const/SignalConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { CakeActivityConst } from "../../../const/CakeActivityConst";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";
import { ShopActiveDataHelper } from "../../../utils/data/ShopActiveDataHelper";
import { Util } from "../../../utils/Util";
import GoldHeroShopItemCell from "./CakeActivityShopCell";
import { ShopConst } from "../../../const/ShopConst";

@ccclass
export default class CakeActivityShopView extends ViewBase {
    _selectTabIndex: number = -1;
    _goodIds: any[];

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _tabGroup: CommonTabGroup = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    _signalUpdateShopGoods: any;

    onCreate() {
        this._selectTabIndex = -1;
        this._goodIds = [];
        var shopCfg = G_UserData.getShops().getShopCfgById(ShopConst.CAKE_ACTIVE_SHOP);
        var resList = ShopHelper.getResListByShopCfg(shopCfg);
        if (resList.length <= 0) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        } else {
            var len = 3 - resList.length;
            var resTemp: Array<any> = clone(resList);
            for (var i = 0; i < len; i++) {
                resTemp.unshift({
                    type: 0,
                    value: 0
                });
            }
            this._topbarBase.updateUIByResList(resTemp);
        }
        this._topbarBase.setImageTitle('txt_sys_zhounianqingshangdian');
        this._commonFullScreen.setTitle(Lang.get('shop_cake_activity_title'));
        this._initTabGroup();
    }
    _initTabGroup() {
        var tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.CAKE_ACTIVE_SHOP);
        var param = {
            isVertical: 2,
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._tabGroup.recreateTabs(param);
        if (this._selectTabIndex == -1) {
            this._onTabSelect(0, null);
        }
    }
    onEnter() {
        this._signalUpdateShopGoods = G_SignalManager.add(SignalConst.EVENT_SHOP_INFO_NTF, handler(this, this._onEventShopUpdate));
        this._updateData();
        this._updateView();
        G_UserData.getShops().c2sGetShopInfo(ShopConst.CAKE_ACTIVE_SHOP);
        this._startCountDown();
    }
    onExit() {
        this._stopCountDown();
        this._signalUpdateShopGoods.remove();
        this._signalUpdateShopGoods = null;
    }
    _onTabSelect(index, sender) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this._updateData();
        this._updateView();
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_CAKE_ACTIVITY_SHOP, { index: (index+1) });
        this._tabGroup.setRedPointByTabIndex(index, false);
    }
    _updateRedPoint() {
        var count = this._tabGroup.getTabCount();
        for (var i = 1; i <= count; i++) {
            var isShow = G_UserData.getCakeActivity().isShowShopRedPointWithIndex(i);
            this._tabGroup.setRedPointByTabIndex(i, isShow);
        }
    }
    _startCountDown() {
        this._stopCountDown();
        this.schedule(this._updateCountDown, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        this.unschedule(this._updateCountDown);
    }
    _updateCountDown() {
        let listChildren = this._listView.content.children;
        for (let i = 0; i < listChildren.length; i++) {
            (listChildren[i].getComponent(GoldHeroShopItemCell) as GoldHeroShopItemCell).updateDes();
        }
    }
    _updateData() {
        this._goodIds = [];
        var curBatch = G_UserData.getCakeActivity().getBatchId();
        this._goodIds = G_UserData.getShopActive().getGoodIdsWithShopAndTabIdBySort(ShopConst.CAKE_ACTIVE_SHOP, this._selectTabIndex + 1, curBatch);
        this._listView.content.removeAllChildren();
        this._listView.content.height = 450;
        for (let i = 0; i < this._goodIds.length; i += 2) {
            let cell = Util.getNode("prefab/cakeActivityShop/CakeActivityShopCell", GoldHeroShopItemCell) as GoldHeroShopItemCell;
            cell.setIdx(Math.floor(i / 2));
            cell.setCustomCallback(handler(this, this._onItemTouch));
            var isExchange = this._selectTabIndex == 4;
            cell.updateUI(this._goodIds[i], this._goodIds[i + 1],isExchange);
            this._listView.content.addChild(cell.node);
            cell.node.x = 0;
            cell.node.y = (-Math.floor(i / 2) - 1) * 120;
            if (Math.abs(cell.node.y) > 450) {
                this._listView.content.height = Math.abs(cell.node.y);
            }
        }
        this._updateRedPoint();
    }
    _updateView() {
        this._updateData();
    }
    _onItemUpdate(item, index) {
        // var index = index * 2;
        // item.update(this._goodIds[index + 1], this._goodIds[index + 2]);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        if (!this._checkFunc()) {
            return;
        }
        var index1 = index * 2 + t - 1;
        var goodId = this._goodIds[index1];
        UIPopupHelper.popupActiveShopBuyItem(goodId, handler(this, this._doBuy));
    }
    _doBuy(goodId, buyCount) {
        var shopId = ShopConst.CAKE_ACTIVE_SHOP;
        G_UserData.getShops().c2sBuyShopGoods(goodId, shopId, buyCount);
    }
    _checkFunc() {
        var actStage = CakeActivityDataHelper.getActStage()[0];
        if (actStage == CakeActivityConst.ACT_STAGE_0) {
            G_Prompt.showTip(Lang.get('cake_activity_act_end_tip'));
            return false;
        } else {
            return true;
        }
    }
    _onEventShopUpdate(eventName, message) {
        if (message.shop_id != ShopConst.CAKE_ACTIVE_SHOP) {
            return;
        }
        this._updateData();
        this._updateView();
        this._updateRedPoint();
    }
}