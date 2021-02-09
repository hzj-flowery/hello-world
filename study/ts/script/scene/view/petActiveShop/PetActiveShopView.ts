
import { SignalConst } from "../../../const/SignalConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { G_Prompt, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonDlgBackground from "../../../ui/component/CommonDlgBackground";
import CommonFullScreen from "../../../ui/component/CommonFullScreen";
import CommonListItem from "../../../ui/component/CommonListItem";
import CommonListView from "../../../ui/component/CommonListView";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import { ShopHelper } from "../shop/ShopHelper";
import { ShopConst } from "../../../const/ShopConst";
const { ccclass, property } = cc._decorator;
@ccclass
export default class PetActiveShopView extends ViewBase{
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
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;
    protected preloadResList = [
        {path:"prefab/petActiveShop/PetActiveShopCell",type:cc.Prefab}
    ]

    
    
    private _selectTabIndex:number;
    private _goodIds:any;
    private _signalUpdateShopGoods:any;

    onCreate() {
        this.setSceneSize();
        this._selectTabIndex = 1;
        this._goodIds = {};
        var shopCfg = G_UserData.getShops().getShopCfgById(ShopConst.LOOKSTAR_SHOP);
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
        this._topbarBase.setImageTitle('txt_sys_com_stargazing');
        this._nodeBg.setTitle(Lang.get('shop_pet_title'));
        // this._nodeBg.hideCloseBtn();
        this._initListView();
    }
    _initListView() {
       
    }
    onEnter() {
        this._signalUpdateShopGoods = G_SignalManager.add(SignalConst.EVENT_SHOP_INFO_NTF, handler(this, this._onEventShopUpdate));
        this._updateData();
        this._updateView();
        G_UserData.getShops().c2sGetShopInfo(ShopConst.LOOKSTAR_SHOP);
    }
    onExit() {
        this._signalUpdateShopGoods.remove();
        this._signalUpdateShopGoods = null;
    }
    _updateData() {
        this._goodIds = {};
        var actUnitData = G_UserData.getCustomActivity().getPetActivity();
        if (actUnitData) {
            var curBatch = actUnitData.getBatch();
            this._goodIds = G_UserData.getShopActive().getGoodIdsWithShopAndTabIdBySort(ShopConst.LOOKSTAR_SHOP, this._selectTabIndex, curBatch);
        }
    }
    _updateView() {
        var lineCount = Math.ceil(this._goodIds.length / 2);
        this._listView.spawnCount = 6;
        this._listView.init(cc.instantiate(cc.resources.get(Path.getPrefab("PetActiveShopCell","petActiveShop"))),handler(this, this._onItemUpdate), handler(this, this._onItemSelected),handler(this, this._onItemTouch));
        this._listView.setData(lineCount);
        this._listView.scrollView.scrollToTop();
    }
    _onItemUpdate(item:CommonListItem, indexT:number) {
        var index = indexT * 2;
        var data:Array<any> = [];
        if(this._goodIds[index])
        data.push(this._goodIds[index]);
        if(this._goodIds[index+1])
        data.push(this._goodIds[index+1])
        item.updateItem(indexT,data.length>0?data:null,0);
    }
    _onItemSelected(index, t) {
        if (!this._checkFunc()) {
            return;
        }
        var index = index * 2 + t;
        var goodId = this._goodIds[index-1];
        UIPopupHelper.popupActiveShopBuyItem(goodId, handler(this, this._doBuy));
    }
    _onItemTouch() {
        
    }
    _doBuy(goodId, buyCount) {
        var shopId = ShopConst.LOOKSTAR_SHOP;
        G_UserData.getShops().c2sBuyShopGoods(goodId, shopId, buyCount);
    }
    _checkFunc() {
        var isVisible = G_UserData.getCustomActivity().isPetActivityVisible();
        if (isVisible) {
            return true;
        } else {
            G_Prompt.showTip(Lang.get('customactivity_pet_act_end_tip'));
            return false;
        }
    }
    _onEventShopUpdate(eventName, message) {
        if (message.shop_id != ShopConst.LOOKSTAR_SHOP) {
            return;
        }
        this._updateData();
        this._updateView();
    }
}