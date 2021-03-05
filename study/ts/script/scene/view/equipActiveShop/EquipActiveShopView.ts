const {ccclass, property} = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { ShopActiveDataHelper } from '../../../utils/data/ShopActiveDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { table } from '../../../utils/table';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import { ShopHelper } from '../shop/ShopHelper';
import { ShopConst } from '../../../const/ShopConst';



@ccclass
export default class EquipActiveShopView extends ViewBase {

   @property({
       type: CommonDlgBackground,
       visible: true
   })
   _commonBackground: CommonDlgBackground = null;

   @property({
       type: CommonFullScreen,
       visible: true
   })
   _nodeBg: CommonFullScreen = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

protected preloadResList = [
    {path:"prefab/equipActiveShop/EquipActiveShopCell",type:cc.Prefab}
]


   
   private _selectTabIndex:number;
   private _goodIds:Array<any>;
   private _signalUpdateShopGoods:any;
   onCreate() {
    this.setSceneSize();
    this._selectTabIndex = 1;
    this._goodIds = [];
    var shopCfg = G_UserData.getShops().getShopCfgById(ShopConst.SUIT_SHOP);
    var resList = ShopHelper.getResListByShopCfg(shopCfg);
    if (resList.length <= 0) {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
    } else {
        var len = 3 - resList.length;
        var resTemp = [];
        for(var j in resList)
        resTemp.push(resList[j]);
        for (var i = 1; i <= len; i++) {
            table.insertValueByPos(resTemp,0, {
                type: 0,
                value: 0
            });
        }
        this._topbarBase.updateUIByResList(resTemp);
    }
    this._topbarBase.setImageTitle('txt_sys_com_hongzhuangshangdian');
    this._nodeBg.setTitle(Lang.get('shop_suit_title'));
    // this._nodeBg.hideCloseBtn();
    this._initListView();
}
_initListView() {
    
}
onEnter() {
    this._signalUpdateShopGoods = G_SignalManager.add(SignalConst.EVENT_SHOP_INFO_NTF, handler(this, this._onEventShopUpdate));
    this._updateData();
    this._updateView();
    G_UserData.getShops().c2sGetShopInfo(ShopConst.SUIT_SHOP);
}
onExit() {
    this._signalUpdateShopGoods.remove();
    this._signalUpdateShopGoods = null;
}
_updateData() {
    this._goodIds = [];
    var actUnitData = G_UserData.getCustomActivity().getEquipActivity();
    if (actUnitData) {
        var curBatch = actUnitData.getBatch();
        this._goodIds = G_UserData.getShopActive().getGoodIdsWithShopAndTabIdBySort(ShopConst.SUIT_SHOP, this._selectTabIndex, curBatch);
    }
}
_updateView() {
    var lineCount = Math.ceil(this._goodIds.length / 2);
    var itemTemplate = cc.resources.get("prefab/equipActiveShop/EquipActiveShopCell");
    this._listView.setTemplate(itemTemplate);
    this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
    this._listView.setCustomCallback(handler(this, this._onItemTouch));
    this._listView.resize(lineCount);
}
_onItemUpdate(item, index:number) {
    var index = (index) * 2;
    var data = [];
    if(this._goodIds[index]!=null)
    data.push(this._goodIds[index]);
    if(this._goodIds[index+1]!=null)
    data.push(this._goodIds[index+1]);
    item.updateUI(index,data.length>0?data:null,0);
}
_onItemSelected(index, t) {
    // if (!this._checkFunc()) {
    //     return;
    // }
    // //var index = index * 2 + t;
    // var goodId = this._goodIds[index];
    // var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
    // var info = costInfo[0];
    // if (info) {
    //     var isEnough = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false);
    //     if (isEnough) {
    //         this._doBuy(goodId);
    //         return true;
    //     } else {
    //         UIPopupHelper.popupItemGuider(function(pop:PopupItemGuider){
    //             pop.updateUI(info.type, info.value);
    //         })
    //         return false;
    //     }
    // }
}
_onItemTouch(index, t) {
    if (!this._checkFunc()) {
        return;
    }
    index = index * 2 + t;
    var goodId = this._goodIds[index-1];
    var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
    var info = costInfo[0];
    if (info) {
        var isEnough = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false);
        if (isEnough) {
            this._doBuy(goodId);
            return true;
        } else {
            UIPopupHelper.popupItemGuider(function(pop:PopupItemGuider){
                pop.updateUI(info.type, info.value);
            })
            return false;
        }
    }
}
_doBuy(goodId) {
    var shopId = ShopConst.SUIT_SHOP;
    var buyCount = 1;
    G_UserData.getShops().c2sBuyShopGoods(goodId, shopId, buyCount);
}
_checkFunc() {
    var isVisible = G_UserData.getCustomActivity().isEquipActivityVisible();
    if (isVisible) {
        return true;
    } else {
        G_Prompt.showTip(Lang.get('customactivity_equip_act_end_tip'));
        return false;
    }
}
_onEventShopUpdate(eventName, message) {
    if (message.shop_id != ShopConst.SUIT_SHOP) {
        return;
    }
    this._updateData();
    this._updateView();
}


}