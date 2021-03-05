const {ccclass, property} = cc._decorator;

import CommonResourceInfoRefresh from '../../../ui/component/CommonResourceInfoRefresh'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonShopResourceInfo from '../../../ui/component/CommonShopResourceInfo'

import CommonFullScreen from '../../../ui/component/CommonFullScreen'
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { G_UserData, G_SignalManager, Colors, G_ConfigManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import UIHelper from '../../../utils/UIHelper';
import { SignalConst } from '../../../const/SignalConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import CommonCustomListView from '../../../ui/component/CommonCustomListView';
import ShopViewItemCell from './ShopViewItemCell';
import ViewBase from '../../ViewBase';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { ShopConst } from '../../../const/ShopConst';

@ccclass
export default class ShopRandomView extends ViewBase {

   @property({
       type: CommonFullScreen,
       visible: true
   })
   _commonFullScreen: CommonFullScreen = null;

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

   @property({
       type: CommonShopResourceInfo,
       visible: true
   })
   _shopRes2: CommonShopResourceInfo = null;

   @property({
       type: CommonShopResourceInfo,
       visible: true
   })
   _shopRes1: CommonShopResourceInfo = null;

   @property({
       type: CommonButtonLevel0Normal,
       visible: true
   })
   _btnRefresh: CommonButtonLevel0Normal = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textFreeCount: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textHaveCount: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textNextRefresh: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRefreshDesc: cc.Label = null;

   @property({
       type: CommonResourceInfoRefresh,
       visible: true
   })
   _resRefreshCost: CommonResourceInfoRefresh = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _textFreeCountFullImage: cc.Sprite = null;

   @property(cc.Prefab)
   shopViewItemCell:cc.Prefab = null;

   private _isNeedPlayRefeshEffect:boolean;
   private _itemList:any[];
   private _shopId:number;
   private _signalRedPointUpdate:any;
   private _signalCurrencyChange:any;
   private _countDownHandler:any;
   private _leaveSec2Refresh:any;
   private _ccAlertEnable:boolean= false;

   loadIndex:number = 0;
   scheduleHandler:any;
   selectIndex:number = -1;

    ctor(shopId) {
        this._itemList = [];
        this._shopId = shopId;
        UIHelper.addEventListener(this.node,this._btnRefresh._button,'ShopRandomView','_onButtonRefresh');
        this._ccAlertEnable = false;
    }
    onCreate() {
        // var item = cc.instantiate(this.shopViewItemCell);
        // var comp = item.getComponent(ShopViewItemCell);
        // comp.setCustomCallback(handler(this, this._onItemTouch));
        this._listViewTab.setTemplate(this.shopViewItemCell);
        this._listViewTab.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listViewTab.setCustomCallback(handler(this, this._onItemTouch));
        // this._listViewTab.setTouchEnabled(false);
        this._btnRefresh.setString(Lang.get('shop_btn_refresh'));
        this._textRefreshDesc.node.active = (false);
        var shopCfg = G_UserData.getShops().getShopCfgById(this._shopId);
        this._commonFullScreen.setTitle(G_ConfigManager.checkCanRecharge() ? shopCfg.shop_name : shopCfg.shop_name_ios);
    }
    _onClickRes1() {
    }
    _onClickRes2() {
    }
    onEnter() {
        this._refreshRedPoint();
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalCurrencyChange = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(this, this._onEventCurrencyChange));
    }
    onExit() {
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalCurrencyChange.remove();
        this._signalCurrencyChange = null;
        this._stopCountDown();
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
    }
    _onEventCurrencyChange(eventName, message) {
        if (this._ccAlertEnable) {
            this.refreshView();
        }
    }

    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_SHOP_SCENE) {
            this._refreshRedPoint();
        }
    }
    _refreshRedPoint() {
        if (this._shopId == ShopConst.HERO_SHOP) {

            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'heroShop');
            this._btnRefresh.showRedPoint(redValue);
        }
        if (this._shopId == ShopConst.PET_SHOP) {

            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'petShop');
            this._btnRefresh.showRedPoint(redValue);
        }
        if(this._shopId == ShopConst.INSTRUMENT_SHOP){
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'instrumentShop');
            this._btnRefresh.showRedPoint(redValue);
        }
    }
    _onButtonRefresh() {
        var view = this;
        function sendCall(refreshType) {
            //logWarn('_onButtonRefresh   ' + refreshType);
            G_UserData.getShops().c2sShopRefresh(view._shopId, refreshType);
            view._isNeedPlayRefeshEffect = true;
        }
        LogicCheckHelper.shopRefreshBtnCheck(this._shopId, sendCall);
    }
    _getSelectItemList() {
        var selectItemList = this._itemList;
        return selectItemList;
    }
    _onItemTouch(index, itemPos) {
        var lineIndex = index;
        var shopItemData = this._getItemDataByPos(itemPos);
        if (LogicCheckHelper.shopRandomBuyCheck(shopItemData)[0] == false) {
            return;
        }
        UIPopupHelper.popupRandomShopBuyItem(shopItemData);
        this.selectIndex = index;
    }
    _updateCurrencyChangeAlert() {
        var alert = false;
        for (var i in this._itemList) {
            var v = this._itemList[i];
            var item = v.getConfig();
            for (var j = 1; j <= 2; j++) {
                var type = item['type' + j];
                var value = item['value' + j];
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
    _onItemSelected(item, index) {
    }
    _onItemUpdate(item, index) {
        var startIndex = index * 2 + 1;
        //logWarn('ShopRandomView:_onItemUpdate  ' + startIndex);
        var endIndex = startIndex + 1;
        var itemLine = [];
        var itemList = this._getSelectItemList();
        if (itemList && itemList.length > 0) {
            for (var i = startIndex; i<=endIndex; i++) {
                var itemData = itemList[i-1];
                if (itemData) {
                    itemLine.push(itemData);
                }
            }
            item.updateUI(index, itemLine);
        }
    }
    updateBuyItem(){
        if(this.selectIndex >= 0){
            this._listViewTab.updateItemByID(this.selectIndex);
            this.selectIndex = -1;
        }
    }
    refreshView() {
        this._itemList = [];
        var shopMgr = G_UserData.getShops();
        var shopId = this._shopId;
        var itemList = shopMgr.getShopGoodsList(shopId);
        if (itemList.length == 0) {
            return;
        }
        this._itemList = itemList;
        this._updateCurrencyChangeAlert();
        var lineCount = Math.ceil(itemList.length / 2);
        lineCount = lineCount || 1;
        //this._listViewTab.resize(lineCount);
        this._listViewTab.removeAllChildren();
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        console.log("ShopRandomView refreshView");
        if(this.loadIndex == 0){
            this.scheduleHandler = handler(this,this.loadListViewCell);
            this.schedule(this.scheduleHandler, 0.1);
        }
        this.loadListViewCell();
        this._updateShopText();
        this._startCountDown();
        if (this._isNeedPlayRefeshEffect == true) {
            this.playEnterEffect();
            this._isNeedPlayRefeshEffect = false;
        }
    }
    loadListViewCell(){
        var lineCount = Math.ceil(this._itemList.length / 2);
        lineCount = lineCount || 1;
        this.loadIndex++;
        if(this.loadIndex >= lineCount){
            if(this.scheduleHandler){
                this.unschedule(this.scheduleHandler);
                this.scheduleHandler = null;
            }
            this.loadIndex = lineCount;
        }
        
        this._listViewTab.resize(this.loadIndex, 2, false);
    }
    _getItemDataByPos(pos) {
        var itemList = this._itemList;
        if (pos > 0 && pos <= itemList.length) {
            return itemList[pos-1];
        }
        return null;
    }
    _updateShopRes() {
        var shopCfg = G_UserData.getShops().getShopCfgById(this._shopId);
        var size1 = UserDataHelper.getNumByTypeAndValue(shopCfg.price1_type, shopCfg.price1_value);
        this._shopRes1.node.active = (false);
        if (shopCfg.price1_type > 0) {
           this._shopRes1.updateUI(shopCfg.price1_type, shopCfg.price1_value, size1);
            this._shopRes1.node.active = (true);
        }
        if (shopCfg.price2_type > 0 && shopCfg.price2_value > 0) {
            var size2 = UserDataHelper.getNumByTypeAndValue(shopCfg.price2_type, shopCfg.price2_value);
            this._shopRes2.updateUI(shopCfg.price2_type, shopCfg.price2_value, size2);
            this._shopRes2.node.active = (true);
        } else {
            this._shopRes2.node.active = (false);
        }
    }
    _updateShopText(){
        var shopInfo = UserDataHelper.getRandomShopInfo(this._shopId);
        var token = UserDataHelper.getShopRefreshToken();
        this._textFreeCount.string = (shopInfo.freeCnt + ('/' + shopInfo.freeCntTotal));
        this._textHaveCount.string = (shopInfo.surplusTimes + ('/' + shopInfo.refreshCntTotal));
        if (shopInfo.freeCnt > 0) {
            this._resRefreshCost.node.active = (false);
            return;
        } else {
            this._resRefreshCost.node.active = (true);
        }
        if (token > 0) {
            this._resRefreshCost.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_REFRESH_TOKEN);
            this._resRefreshCost.setCount('1' + ('/' + token));
            this._resRefreshCost.setTextColorToDTypeColor();
            this._resRefreshCost.showResName(true, Lang.get('shop_random_refresh1'));
            this._resRefreshCost.alignToRightForRandomShop();
        } else {
            this._resRefreshCost.updateUI(shopInfo.costType, shopInfo.costValue);
            //var itemNum = UserDataHelper.getNumByTypeAndValue(shopInfo.costType, shopInfo.costValue);
            this._resRefreshCost.setCount(shopInfo.costSize);
            this._resRefreshCost.setTextColorToDTypeColor();
            this._resRefreshCost.showResName(true, Lang.get('shop_random_refresh2'));
            this._resRefreshCost.alignToRightForRandomShop();
        }
    }
    _startCountDown() {
        var shopData = G_UserData.getShops().getRandomShopInfo(this._shopId);
        if (shopData.freeCnt == shopData.freeCntTotal) {
            this._textNextRefresh.node.active = (false);
            this._textFreeCountFullImage.node.active = (true);
            return;
        }
        this._textNextRefresh.node.active = (true);
        this._textFreeCountFullImage.node.active = (false);

        if (this._shopId == null || this._shopId == 0) {
            return;
        }
        if (this._countDownHandler != null) {
            return;
        }
        this._leaveSec2Refresh = UserDataHelper.getShopLeaveRefreshSec(this._shopId)[0];
        this._countDownHandler = handler(this, this._onCountDown);
        this.schedule(this._countDownHandler,1);
        this._onCountDown(0);
    }
    _onCountDown(dt) {
        this._leaveSec2Refresh = this._leaveSec2Refresh - dt;
        if (this._leaveSec2Refresh <= 0) {
            this._leaveSec2Refresh = 0;
            this._stopCountDown();
            G_UserData.getShops().c2sGetShopInfo(this._shopId);
        }

        var strTimeFormat = UIHelper.fromatHHMMSS(this._leaveSec2Refresh);
        this._textNextRefresh.string = (strTimeFormat);
        this._textNextRefresh.node.color = (Colors.DARK_BG_RED);
    }
    _stopCountDown() {

        if (this._countDownHandler != null) {
            this.unschedule(this._countDownHandler);
            this._countDownHandler = null;
        }
    }
    playEnterEffect() {
        //this._listViewTab.playEnterEffect(handler(this, this.playEnterEffectEndCallBack));
        this.playEnterEffectEndCallBack();
    }
    setListViewParentVisible(trueOrFalse) {
        this._listViewParent.active = (trueOrFalse);
    }
    playEnterEffectEndCallBack() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    }

}
