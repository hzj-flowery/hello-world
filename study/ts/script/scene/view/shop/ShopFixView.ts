const { ccclass, property } = cc._decorator;

import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon'

import CommonFullScreen from '../../../ui/component/CommonFullScreen'
import ViewBase from '../../ViewBase';
import { ShopHelper } from './ShopHelper';
import { handler } from '../../../utils/handler';
import { G_UserData, G_ConfigLoader, G_GameAgent, G_SignalManager, G_ConfigManager } from '../../../init';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { SignalConst } from '../../../const/SignalConst';
import CommonShopResourceInfo from '../../../ui/component/CommonShopResourceInfo';
import TabScrollView from '../../../utils/TabScrollView';
import CommonCustomListView from '../../../ui/component/CommonCustomListView';
import CommonScrollView from '../../../ui/component/CommonScrollView';
import { assert } from '../../../utils/GlobleFunc';
import ShopViewItemCell from './ShopViewItemCell';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import CommonTabGroupScrollView from '../../../ui/component/CommonTabGroupScrollView';
import { Util } from '../../../utils/Util';
import { ShopConst } from '../../../const/ShopConst';

@ccclass
export default class ShopFixView extends ViewBase {

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: CommonTabGroupHorizon,
        visible: true
    })
    _tabGroup2: CommonTabGroupHorizon = null;

    @property(CommonTabGroupScrollView)
    tabGroup: CommonTabGroupScrollView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg2: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listViewParent: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listViewTab: CommonCustomListViewEx = null;

    @property(CommonShopResourceInfo)
    shopRes1: CommonShopResourceInfo = null;

    @property(CommonShopResourceInfo)
    shopRes2: CommonShopResourceInfo = null;

    @property(cc.Prefab)
    shopViewItemCell: cc.Prefab = null;

    @property(cc.Prefab)
    shopViewItemCell2: cc.Prefab = null;

    private _itemList: any[];
    private _shopId: number;
    private _selectItemPos: number;
    private _selectSubTabIndex: number;
    private _callBackFunc: any;
    private _isFirstCreate: boolean;
    private _scrollViewParam: any;
    private _subSelectTimes: number;
    private _enterEventTimes: number;

    // private _tabListView: any;

    loadIndex:number = 0;
    scheduleHandler:any;
    tabType:number = 0;
    selectIndex:number = -1;

    private _signalCurrencyChange:any;
    private _ccAlertEnable:boolean = false;
    ctor(shopId, callback?) {
        this._itemList = [];
        this._shopId = shopId;
        this._selectItemPos = 1;
        this._selectSubTabIndex = -1;
        this._callBackFunc = callback || null;
        this._isFirstCreate = true;
        this._ccAlertEnable = false;
        this.node.name = ('ShopFixView');
    }
    onCreate() {
        var tabType = ShopHelper.getTabTypeByTab(this._shopId, 1);
        if (tabType == 1) {
          //assert(("ShopFixView onCreate tabType == ShopConst.TABL_TYPE_NEW");
        }
        let template;
        if (tabType == ShopConst.TABL_TYPE_DEFAULT) {
            template = this.shopViewItemCell;
        } else {
            template = this.shopViewItemCell2;
        }
        this._scrollViewParam = {
            template: template,//ShopConst.SHOP_FIX_VIEW_CELL[tabType],
            updateFunc: handler(this, this._onItemUpdate),
            selectFunc: handler(this, this._onItemSelected),
            touchFunc: handler(this, this._onItemTouch)
        };
        //this._tabListView = new TabScrollView(this._listViewTab, this._scrollViewParam);
        var shopCfg = G_UserData.getShops().getShopCfgById(this._shopId);
        this._commonFullScreen.setTitle(G_ConfigManager.checkCanRecharge() ? shopCfg.shop_name : shopCfg.shop_name_ios);
        this._subSelectTimes = 0;
        this._initTab();
    }
    onEnter() {
        this._enterEventTimes = 0;
        this._signalCurrencyChange = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(this, this.onEventCurrencyChange));
    }
    onExit() {
        this._signalCurrencyChange.remove();
        this._signalCurrencyChange = null;

        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
    }
    onEventCurrencyChange(eventName, message) {
        if (this._ccAlertEnable) {
            this.refreshView();
        }
    }
    _initTab() {
        var shopId = this._shopId;
        var [textList] = UserDataHelper.getShopSubTab(shopId);
        var param2 = {
            callback: handler(this, this._onTabSelect2),
            isVertical: 2,
            offset: -2,
            textList: textList
        };
        this.tabGroup.recreateTabs(param2);
        //this.tabGroup.setTabIndex(0);
    }
    _updateCurrencyChangeAlert() {
        var alert = false;
        for (var i in this._itemList) {
            var v = this._itemList[i];
            var item = v.getConfig();
            for (var j = 1; j != 2; j++) {
                var type = item['price' + (j + '_type')];
                var value = item['price' + (j + '_value')];
                if (type == 5 && (value == 1 || value == 33)) {
                    alert = true;
                    break;
                }
            }
            if (alert) {
                break;
            }
        }
        this._ccAlertEnable = alert;
    }
    getSubIndex() {
        return this._selectSubTabIndex;
    }

    setRedPointByTabIndex(index, redValue) {
        this.tabGroup.setRedPointByTabIndex(index - 1, redValue);
    }
    setImageTipByTabIndex(index, redValue, posPercent, texture) {
        //this.tabGroup.setImageTipByTabIndex(index, redValue, posPercent, texture);
    }
    setCallBack(callback) {
        this._callBackFunc = callback;
    }
    _onTabSelect2(index, sender) {
        if (this._selectSubTabIndex == index) {
            return;
        }
        var lastIndex = this._selectSubTabIndex;
        this._selectSubTabIndex = index;
        
        if (this._selectSubTabIndex >= 0) {
            this.refreshView();
        }

        var tabType = ShopHelper.getTabTypeByTab(this._shopId, this._selectSubTabIndex);
        if (tabType == ShopConst.TABL_TYPE_NEW) {
            ShopHelper.saveNewRemindShop(this._getSelectItemList(),index);
            this._imageBg2.node.active = (false);
        } else {
            this._imageBg2.node.active = (false);
        }
    }
    setTabIndex(index) {
        this.tabGroup.setTabIndex(index - 1);
    }
    _getSelectItemList() {
        var selectItemList = this._itemList;
        return selectItemList;
    }
    _onItemTouch(index, itemPos) {
        var lineIndex = index;
        var shopItemData = this._getItemDataByPos(itemPos);
        if (shopItemData == null) {
            return;
        }
        var fixData = shopItemData.getConfig();
        var type = fixData['price1_type'];
        var value = fixData['price1_value'];
        var size = fixData['price1_size'];
        var itemId = fixData['value'];
        if (type == ShopConst.NORMAL_SHOP_SUB_MONEY) {
            var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);//require('app.config.vip_pay');
            var Item = G_ConfigLoader.getConfig(ConfigNameConst.ITEM);//require('app.config.item');

            var payCfg = VipPay.get(value);
            var itemCfg = Item.get(itemId);
            G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, itemCfg.name, itemCfg.name);
            return;
        }
        var [success, erroMsg, funcName] = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true);
        if (success == false) {
            return;
        }
        this.selectIndex = index;
        UIPopupHelper.popupFixShopBuyItem(shopItemData);
    }
    _onItemSelected(item, index) {
    }
    _onItemUpdate(item, index) {
        var tabType = ShopHelper.getTabTypeByTab(this._shopId, this._selectSubTabIndex);
        var item_count = ShopConst.SHOP_FIX_VEWI_CELL_ITEM_COUNT[tabType];
        var startIndex = index * item_count;
        //logWarn('ShopFixView:_onItemUpdate  startIndex :: ' + (startIndex + ('       index :: ' + index)));
        var itemList = this._getSelectItemList();
        if (this._itemList && this._itemList.length > 0) {
            var itemLine = [];
            for (var i = 0; i < item_count; i++) {
                var itemData = this._itemList[startIndex + i];
                if (itemData) {
                    itemLine.push(itemData);
                }
            }
            item.updateUI(index, itemLine, this._selectSubTabIndex);
        }
    }
    refreshView(needAnimation?) {
        this.loadIndex = 0;
        this._itemList = [];
        var shopMgr = G_UserData.getShops();
        var shopId = this._shopId;
        var subIndex = ShopHelper.convertSubIndexToSubId(shopId, this._selectSubTabIndex);
        var itemList = shopMgr.getShopGoodsList(shopId, subIndex);
        this._itemList = itemList;
        this._updateCurrencyChangeAlert();
        var tabType = ShopHelper.getTabTypeByTab(this._shopId, this._selectSubTabIndex);
        if (tabType == ShopConst.TABL_TYPE_DEFAULT) {//ShopConst.SHOP_FIX_VIEW_CELL[tabType];
            this._scrollViewParam.template = this.shopViewItemCell;
        } else {
            this._scrollViewParam.template = this.shopViewItemCell2;
        }

        var item_count = ShopConst.SHOP_FIX_VEWI_CELL_ITEM_COUNT[tabType];
        var lineCount = Math.ceil(itemList.length / item_count);
        this.tabType = tabType;

        console.log("ShopFixView refreshView");
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        if(this.loadIndex == 0){
            this._listViewTab.setTemplate(this._scrollViewParam.template);
            this._listViewTab.setCallback(handler(this, this._onItemUpdate));
            this._listViewTab.setCustomCallback(handler(this, this._onItemTouch));
    
            this.scheduleHandler = handler(this,this.loadListViewCell);
            this.schedule(this.scheduleHandler, 0.1);
        }
        this.loadListViewCell();

    }
    updateBuyItem(){
        if(this.selectIndex >= 0){
            this._listViewTab.updateItemByID(this.selectIndex);
            this.selectIndex = -1;
        }
    }
    loadListViewCell(){
        var item_count = ShopConst.SHOP_FIX_VEWI_CELL_ITEM_COUNT[this.tabType];
        var lineCount = Math.ceil(this._itemList.length / item_count);
        this.loadIndex++;
        if(this.loadIndex >= lineCount){
            if(this.scheduleHandler){
                this.unschedule(this.scheduleHandler);
                this.scheduleHandler = null;
            }
            if (this._subSelectTimes >= 1) {
                this.playSubRefreshEffect();
            }
            this._subSelectTimes = this._subSelectTimes + 1;
            this.loadIndex = lineCount;
        }
        
        this._listViewTab.resize(this.loadIndex, 2, false);
    }
    findCellItem(cellRow, cellCol) {
        // var listView = this._tabListView.getListView(this._selectSubTabIndex);
        // var ShopViewItemCell = listView.getSubNodeByName('ShopViewItemCell' + cellRow);
        // var shopItemCell = listView.getSubNodeByName('_itemInfo' + cellCol);
        // return shopItemCell;
        var ShopViewItemCell = this._listViewTab.content.getChildByName('ShopViewItemCell' + cellRow);
        var shopItemCell = Util.getSubNodeByName(ShopViewItemCell, '_itemInfo' + cellCol);
        return shopItemCell;
    }
    _getItemDataByPos(pos) {
        var itemList = this._itemList;
        if (pos > 0 && pos <= itemList.length) {
            return itemList[pos - 1];
        }
        return null;
    }
    _updateShopRes() {
        var shopCfg = G_UserData.getShops().getShopCfgById(this._shopId);
        var size1 = UserDataHelper.getNumByTypeAndValue(shopCfg.price1_type, shopCfg.price1_value);
        this.shopRes1.node.active = (false);
        if (shopCfg.price1_type > 0) {
            this.shopRes1.updateUI(shopCfg.price1_type, shopCfg.price1_value, size1);
            this.shopRes1.node.active = (true);
        }
        if (shopCfg.price2_type > 0 && shopCfg.price2_value > 0) {
            var size2 = UserDataHelper.getNumByTypeAndValue(shopCfg.price2_type, shopCfg.price2_value);
            this.shopRes2.updateUI(shopCfg.price2_type, shopCfg.price2_value, size2);
            this.shopRes2.node.active = (true);
        } else {
            this.shopRes2.node.active = (false);
        }
    }
    playSubRefreshEffect() {
        // var listView = this._listViewTab;
        // if (listView) {
        //     let postEvent = function(){
        //         G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'playSubRefreshEffect');
        //     }.bind(this);
        //     listView.playEnterEffect(postEvent);
        // }
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'playSubRefreshEffect');
    }
    playEnterEffect() {
        // var listView = this._listViewTab;
        // if (listView) {
        //     let postEvent = function(){
        //         if (this._enterEventTimes == 0) {
        //             G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'playEnterEffect');
        //             this._enterEventTimes = this._enterEventTimes + 1;
        //         }
        //     }.bind(this);
        //     listView.playEnterEffect(postEvent);
        // }
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'playEnterEffect');
    }
    setListViewParentVisible(trueOrFalse) {
        this._listViewParent.active = (trueOrFalse);
    }
    getAndResetPlayRefeshEffectTag() {
        return false;
    }

}
