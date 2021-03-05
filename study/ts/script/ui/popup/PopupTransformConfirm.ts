import { SignalConst } from "../../const/SignalConst";
import { G_SignalManager, G_UserData } from "../../init";
import { Lang } from "../../lang/Lang";
import { handler } from "../../utils/handler";
import { LogicCheckHelper } from "../../utils/LogicCheckHelper";
import { Path } from "../../utils/Path";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import CommonListView from "../component/CommonListView";
import CommonNormalMiniPop3 from "../component/CommonNormalMiniPop3";
import PopupBase from "../PopupBase";
import PopupItemGuider from "../PopupItemGuider";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupTransformConfirm extends PopupBase{
    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: CommonNormalMiniPop3,
        visible: true
    })
    _popupBg: CommonNormalMiniPop3 = null;

    protected preloadResList = [
        {path:"prefab/common/PopupTransformConfirmCell",type:cc.Prefab}
    ]
    private _checkFunc:any;
    private _signalBuyShopGoods:any;
    private _datas:any;
    setInitData(checkFunc) {
        this._checkFunc = checkFunc;
    }
    onCreate() {
        this._popupBg.setTitle(Lang.get('common_transform_confirm_title'));
        this._popupBg.hideBtnBg();
        this._popupBg.addCloseEventListener(handler(this, this._onClose));
        
    }
    onEnter() {
        this._signalBuyShopGoods = G_SignalManager.add(SignalConst.EVENT_BUY_ITEM, handler(this, this._onEventBuyItem));
    }
    onExit() {
        this._signalBuyShopGoods.remove();
        this._signalBuyShopGoods = null;
    }
    updateUI(datas) {
        this._datas = datas;
        this._listView.spawnCount = datas.length;
        this._listView.init(cc.instantiate(cc.resources.get(Path.getCommonPrefab("PopupTransformConfirmCell"))),handler(this, this._onItemUpdate), handler(this, this._onItemSelected),handler(this, this._onItemTouch))
        this._listView.setData(datas.length);
        this._listView.scrollView.enabled = this._datas.length>2;
    }
    _onItemUpdate(item, index) {
        var data = this._datas[index];
        if (data) {
            item.updateItem(index,[data]);
        }
        else
        {
            item.updateItem(index,null); 
        }
    }
    _onItemSelected(index, t) {
        var index = index + t;
        var data = this._datas[index-1];
        if (this._checkFunc) {
            var ok = this._checkFunc();
            if (!ok) {
                return;
            }
        }
        var info = data.data1;
        var isEnough = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false);
        if (!isEnough) {
            UIPopupHelper.popupItemGuider(function(popup:PopupItemGuider){
                popup.updateUI(info.type, info.value);
            })
            return;
        }
        G_UserData.getShops().c2sBuyShopGoods(data.goodId, data.shopId, 1);
    }
    _onItemTouch(index, t) {
        var index = index + t;
        var data = this._datas[index];
        if (this._checkFunc) {
            var ok = this._checkFunc();
            if (!ok) {
                return;
            }
        }
        var info = data.data1;
        var isEnough = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false);
        if (!isEnough) {
            UIPopupHelper.popupItemGuider(function(popup:PopupItemGuider){
                popup.updateUI(info.type, info.value);
            })
            return;
        }
        G_UserData.getShops().c2sBuyShopGoods(data.goodId, data.shopId, 1);
    }
    _onEventBuyItem() {
        this.close();
    }
    _onClose() {
        this.close();
    }
}