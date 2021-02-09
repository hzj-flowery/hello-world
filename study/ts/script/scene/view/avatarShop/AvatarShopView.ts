const {ccclass, property} = cc._decorator;

import { AvatarConst } from '../../../const/AvatarConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import { G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListView from '../../../ui/component/CommonListView';
import CommonTabGroupScrollVertical from '../../../ui/component/CommonTabGroupScrollVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import CommonUI from '../../../ui/component/CommonUI';
import PopupTransformConfirm from '../../../ui/popup/PopupTransformConfirm';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { ShopActiveDataHelper } from '../../../utils/data/ShopActiveDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { table } from '../../../utils/table';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import { CustomActivityUIHelper } from '../customActivity/CustomActivityUIHelper';
import { ShopHelper } from '../shop/ShopHelper';
import PopupAvatarShopBuyConfirm from './PopupAvatarShopBuyConfirm';
import { ShopConst } from '../../../const/ShopConst';




var NUM_EVERY_ROW = 5;

@ccclass
export default class AvatarShopView extends ViewBase {

   @property({
       type: CommonDlgBackground,
       visible: true
   })
   _commonBackground: CommonDlgBackground = null;

   @property({
       type: CommonFullScreen,
       visible: true
   })
   _commonFullScreen: CommonFullScreen = null;

   @property({
       type: CommonTabGroupScrollVertical,
       visible: true
   })
   _tabGroup: CommonTabGroupScrollVertical = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTime: cc.Label = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonTransform: cc.Button = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCost1: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCost1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCost2: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCost2: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _listView: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _pendant: cc.Sprite = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;

   @property({
    type: CommonListView,
    visible: true
})
_tabListView: CommonListView = null;

   
   protected preloadResList = [
    {path:"prefab/avatarShop/AvatarShopCell",type:cc.Prefab}
   ]
   private _selectTabIndex:number = 0;
   private _goodIds:any;
   private _countDownHandler:any;
   private _signalUpdateShopGoods:any;

   setInitData(index) {
    this._selectTabIndex = index || 0;
}
onCreate() {
    this.setSceneSize();
    this._goodIds = {};
    this._countDownHandler = null;
    var shopCfg = G_UserData.getShops().getShopCfgById(ShopConst.AVATAR_SHOP);
    var resList = ShopHelper.getResListByShopCfg(shopCfg);
    if (resList.length <= 0) {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
    } else {
        var tempResList:any[] = [];
        for(var j =1;j<=resList.length;j++)
        {
            tempResList.push(resList[j-1]);
        }
        this._topbarBase.updateUIByResList(tempResList, true);
    }
    this._topbarBase.setImageTitle('txt_sys_com_shangdian');
    this._commonFullScreen.setTitle(Lang.get('shop_avatar_title'));
    
}
_initTabGroup() {
    
    var tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.AVATAR_SHOP);
    var param = {
        callback: handler(this, this._onTabSelect),
        textList: tabNameList
    };
    this._tabGroup.recreateTabs(param);
}
onEnter() {

    this._initTabGroup();
    var btnEffect = (new cc.Node).addComponent(EffectGfxNode).setEffectName('effect_youxiangtishi');
    var size = this._buttonTransform.node.getContentSize();
    btnEffect.node.setPosition(new cc.Vec2(size.width / 2, size.height / 2));
    btnEffect.play();
    this._buttonTransform.node.addChild(btnEffect.node);

    this._signalUpdateShopGoods = G_SignalManager.add(SignalConst.EVENT_SHOP_INFO_NTF, handler(this, this._onEventShopUpdate));
    this._tabGroup.setTabIndex(this._selectTabIndex);
    this._startCountDown();
    G_UserData.getShops().c2sGetShopInfo(ShopConst.AVATAR_SHOP);
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
}
_onEventShopUpdate(eventName, message) {
    if (message.shop_id != ShopConst.AVATAR_SHOP) {
        return;
    }
    this._updateData();
    this._updateView();
}
_updateData() {
    var actUnitData = G_UserData.getCustomActivity().getAvatarActivity();
    if (actUnitData) {
        var curBatch = actUnitData.getBatch();
        this._goodIds = G_UserData.getShopActive().getGoodIdsWithShopAndTabIdBySort(ShopConst.AVATAR_SHOP, this._selectTabIndex+1, curBatch);
    }
}
_initTransform() {
    var info = ShopActiveDataHelper.getShopActiveConfig(AvatarConst.SHOP_SPECIAL_ID_1);
    var costInfo = ShopActiveDataHelper.getCostInfo(AvatarConst.SHOP_SPECIAL_ID_1);
    var cost = costInfo[0];
    var itemParam1 = TypeConvertHelper.convert(cost.type, cost.value);
    var itemParam2 = TypeConvertHelper.convert(info.type, info.value);
    this._textCost1.string = (cost.size);
    this._imageCost1.node.addComponent(CommonUI).loadTexture(itemParam1.res_mini);
    this._textCost2.string = (info.size);
    this._imageCost2.node.addComponent(CommonUI).loadTexture(itemParam2.res_mini);
}
_updateView() {
    var count = Math.ceil(this._goodIds.length / NUM_EVERY_ROW);
    if(this._tabListView.isHasLoaded()==false)
    {
        this._tabListView.spawnCount = 6;
    this._tabListView.init(cc.instantiate(cc.resources.get(Path.getPrefab("AvatarShopCell","avatarShop"))), handler(this, this._onItemUpdate), handler(this, this._onItemSelected),handler(this, this._onItemTouch));
    this._tabListView.setData(count);
    }
    else
    {
        this._tabListView.setData(count,0,true,true);
    }
}
_onItemUpdate(item:CommonListItem, index:number) {
    var index1 = index * NUM_EVERY_ROW;
    var datas = [];
    for (var i = 1; i <= NUM_EVERY_ROW; i++) {
        var goodId = this._goodIds[index1+i-1];
        if (goodId) {
            table.insert(datas, goodId);
        }
    }
    item.updateItem(index,datas.length>0?datas:null,0);

}
_onItemSelected(index, t) {
    if (!this._checkFunc()) {
        return;
    }
    var index = index * NUM_EVERY_ROW + t;
    var goodId = this._goodIds[index-1];
    G_SceneManager.openPopup(Path.getPrefab("PopupAvatarShopBuyConfirm","avatarShop"),function(pop:PopupAvatarShopBuyConfirm){
        pop.setInitData(goodId, handler(this, this._callbackOnConfirm))
        pop.openWithAction();
    }.bind(this));
}
_onItemTouch(index, t) {
    
}
_callbackOnConfirm(goodId, index) {
    if (!this._checkFunc()) {
        return;
    }
    var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
    var info = costInfo[index-1];
    if (info) {
        var isEnough = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false);
        if (isEnough) {
            this._doBuy(goodId, index);
            return true;
        } else {
            UIPopupHelper.popupItemGuider(function(popupItemGuider: PopupItemGuider){
                popupItemGuider.updateUI(info.type, info.value);
            })
            return false;
        }
    }
    return false;
}
_doBuy(goodId, buyType) {
    var shopId = ShopConst.AVATAR_SHOP;
    var buyCount = 1;
    G_UserData.getShops().c2sBuyShopGoods(goodId, shopId, buyCount, buyType);
}
_startCountDown() {
    this._stopCountDown();
    this._countDownHandler = handler(this, this._onCountDown);
    this.schedule(this._countDownHandler, 1);
    this._onCountDown();
}
_stopCountDown() {
    if (this._countDownHandler) {
        this.unschedule(this._countDownHandler);
        this._countDownHandler = null;
    }
}
_onCountDown() {
    var actUnitData = G_UserData.getCustomActivity().getAvatarActivity();
    if (actUnitData && actUnitData.isActInRunTime()) {
        var timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
        this._textTime.string = (timeStr);
    } else {
        this._stopCountDown();
    }
}
private onClickButtonTransform() {
    var datas = [];
    var ids = [
        AvatarConst.SHOP_SPECIAL_ID_2,
        AvatarConst.SHOP_SPECIAL_ID_1
    ];
    var curBatch = AvatarDataHelper.getCurAvatarBatch();
    for (var i in ids) {
        var id = ids[i];
        var info = ShopActiveDataHelper.getShopActiveConfig(id);
        if (curBatch >= info.batch) {
            var costInfo = ShopActiveDataHelper.getCostInfo(id);
            var cost = costInfo[0];
            var data1 = cost;
            var data2 = {
                type: info.type,
                value: info.value,
                size: info.size
            };
            var shopId = ShopConst.AVATAR_SHOP;
            var data = {
                data1: data1,
                data2: data2,
                shopId: shopId,
                goodId: id
            };
            table.insert(datas, data);
        }
    }
    G_SceneManager.openPopup(Path.getCommonPrefab("PopupTransformConfirm"),function(pop:PopupTransformConfirm){
        pop.setInitData(handler(this, this._checkFunc));
            pop.openWithAction();
            pop.updateUI(datas);
    }.bind(this));
}
_checkFunc() {
    var isVisible = G_UserData.getCustomActivity().isAvatarActivityVisible();
    if (isVisible) {
        return true;
    } else {
        G_Prompt.showTip(Lang.get('customactivity_avatar_act_end_tip'));
        return false;
    }
}


}