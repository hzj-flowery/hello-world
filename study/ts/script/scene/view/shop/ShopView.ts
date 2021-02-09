const {ccclass, property} = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonTabGroupScrollVertical from '../../../ui/component/CommonTabGroupScrollVertical'

import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import ViewBase from '../../ViewBase';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData, G_Prompt, G_SceneManager, G_ResolutionManager, G_ConfigManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { ShopHelper } from './ShopHelper';
import { Path } from '../../../utils/Path';
import ShopRandomView from './ShopRandomView';
import ShopFixView from './ShopFixView';
import UIActionHelper from '../../../utils/UIActionHelper';
import CommonTabGroupScrollView from '../../../ui/component/CommonTabGroupScrollView';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { ShopConst } from '../../../const/ShopConst';

@ccclass
export default class ShopView extends ViewBase {

   @property({
       type: CommonDlgBackground,
       visible: true
   })
   _commonBackground: CommonDlgBackground = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelRight: cc.Node = null;

   @property(CommonTabGroupScrollView)
   tabGroup:CommonTabGroupScrollView = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;

   @property(cc.Prefab)
   shopRandomView:cc.Prefab = null;

   @property(cc.Prefab)
   shopFixView:cc.Prefab = null;

   private _selectShopId:number = 1;
   private _selectTabIndex:number = -1;
   private _paramSubId:number;
   private _isFirstEnter:boolean = true;
   private _isNeedPlayRefreshEffect:boolean = false;
   private _isFirstEnterRefreshNotPlayed:boolean = true;
   private _shopView:any;
   private _signalBuyShopGoods:any;
   private _signalUpdateShopGoods:any;
   private _signalRedPointUpdate:any;
   private _signalShopNewRemindUpdate:any;
   private _shopInfoList:any[];
   private _playAnimation;

    ctor(shopId?, tabIndex?) {
        this._selectShopId = shopId || 1;
        this._paramSubId = tabIndex;
        this._isFirstEnter = true;
        this._isNeedPlayRefreshEffect = false;
        this._isFirstEnterRefreshNotPlayed = true;
        this._shopView = {};
    }
    onCreate() {

        var shopId = null, tabIndex = null;
        var params = G_SceneManager.getViewArgs('shop');
        if(params){
            if(params.length > 0){
                shopId = params[0];
            }
            if(params.length > 1){
                tabIndex = params[1];
            }
        }
        this.ctor(shopId, tabIndex);
        
        //this._panelRight.setCascadeOpacityEnabled(true);
        this._shopInfoList = UserDataHelper.getShopTab();
        var tabNameList = [];
        for (let i=0; i<this._shopInfoList.length;i++) {
            var value = this._shopInfoList[i];
            if (value.default_create != 0) {
                tabNameList.push(G_ConfigManager.checkCanRecharge() ? value.shop_name : value.shop_name_ios);
            }
        }
        var param = {
            //rootNode: this._scrollViewTab,
            containerStyle: 2,
            callback: handler(this, this._onTabSelect1),
            customCheckClick:handler(this,this.customCheckClick),
            textList: tabNameList
        };
        this.tabGroup.recreateTabs(param);
        
    }
    private customCheckClick(index:number):boolean{
        var shopId = this.getShopIdByTab(index);
        if (shopId == ShopConst.GUILD_SHOP) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild == false) {
                G_Prompt.showTip(Lang.get('lang_guild_shop_no_open'));
                return false;
            }
        }
        return true;
    }
    updateRes(resList) {
        if (resList.length <= 0) {
            var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)[0];
            var topbarConst = isOpen && TopBarStyleConst.STYLE_COMMON2 || TopBarStyleConst.STYLE_COMMON;
            this._topbarBase.updateUI(topbarConst);
        } else {
            this._topbarBase.updateUIByResList(resList);
        }
    }
    onEnter() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        G_ConfigManager.checkCanRecharge() && this._topbarBase.setImageTitle('txt_sys_com_shangdian');
        this._signalBuyShopGoods = G_SignalManager.add(SignalConst.EVENT_BUY_ITEM, handler(this, this._onEventBuyItem));
        this._signalUpdateShopGoods = G_SignalManager.add(SignalConst.EVENT_SHOP_INFO_NTF, handler(this, this._onEventShopUpdate));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalShopNewRemindUpdate = G_SignalManager.add(SignalConst.EVENT_SHOP_NEW_REMIND_UPDATE, handler(this, this._onEventNewRemindUpdate));
        this._onEventRedPointUpdate();
        var selectTabIndex = 0;
        if (this._selectShopId > 0) {
            var index = this.getShopIndexById(this._selectShopId);
            this.tabGroup.setTabIndex(index);
            selectTabIndex = index;
        } else {
           this.tabGroup.setTabIndex(0);
        }
        //this._onTabSelect1(selectTabIndex, null);
        //this.refreshView();
        if (this._paramSubId && this._selectTabIndex >= 0) {
            var chooseView = this.getShopView(this._selectTabIndex);
            if (chooseView && chooseView.setTabIndex) {
                var index1 = ShopHelper.convertSubIdToIndex(this._selectShopId, this._paramSubId);
                chooseView.setTabIndex(index1);
            }
            this._paramSubId = null;
        }
        if (this._isFirstEnter) {
            // UIActionHelper.playEnterShopSceneEffect({
            //     startCallback: function () {
            //     },
            //     listViewPlayCallback: function () {
            //     },
            //     topBar: this._topbarBase,
            //     tabGroup: this._tabGroup1,
            //     rightNodes: [
            //         this._panelRight,
            //         //view._pendant
            //     ],
            //     attachNode: this.node
            // });
            this._isFirstEnter = null;
        }
    }
    onExit() {
        this._signalBuyShopGoods.remove();
        this._signalBuyShopGoods = null;
        this._signalUpdateShopGoods.remove();
        this._signalUpdateShopGoods = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalShopNewRemindUpdate.remove();
        this._signalShopNewRemindUpdate = null;
    }
    getShopView(index, tabIndex?):any {
        var shopView = this._shopView[index];
        if (shopView == null) {
            var tabIndex = tabIndex || 1;
            // dump('-------------------------------- index: ' + index);
            // dump('-------------------------------- tabIndex: ' + tabIndex);
            var shopId = this.getShopIdByTab(index) || this._selectShopId;
            if (UserDataHelper.getShopType(shopId) == ShopConst.SHOP_TYPE_FIX) {
                //shopView = new ShopFixView(this, shopId);
                var shopViewNode = cc.instantiate(this.shopFixView);
                shopView = (shopViewNode as cc.Node).getComponent(ShopFixView);
                (shopView as ShopFixView).ctor(shopId);
                this._panelRight.addChild(shopViewNode);
            } else {
                //shopView = new ShopRandomView(this, shopId);
                var shopViewNode = cc.instantiate(this.shopRandomView);
                shopView = (shopViewNode as cc.Node).getComponent(ShopRandomView);
                (shopView as ShopRandomView).ctor(shopId);
                this._panelRight.addChild(shopViewNode);
            }
            //shopView.setCascadeOpacityEnabled(true);
            this._shopView[index] = shopView;
        }
        return shopView;
    }
    getShopIndexById(shopId) {
        for (let i=0; i<this._shopInfoList.length;i++) {
            var shopInfo = this._shopInfoList[i];
            if (shopInfo.shop_id == shopId) {
                return i;
            }
        }
        return 0;
    }
    getShopIdByTab(index) {
        return this._shopInfoList[index].shop_id;
    }
    _onTabSelect1(index, sender) {
        // if (this._selectTabIndex == index) {
        //     return;
        // }
        var shopId = this.getShopIdByTab(index);
        if (shopId == null) {
            return;
        }
        if (shopId == ShopConst.GUILD_SHOP) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild == false) {
                G_Prompt.showTip(Lang.get('lang_guild_shop_no_open'));
                return false;
            }
        }
        this._selectTabIndex = index;
        this._selectShopId = shopId;
        for(let i in this._shopView) {
            var view = this._shopView[i];
            view.node.active = (false);
        }
        var chooseView = this.getShopView(this._selectTabIndex);
        if (chooseView) {
            (chooseView as any).setListViewParentVisible(false);
        }
        var chooseView = this.getShopView(index);
        chooseView.node.active = (true);
        var shopCfg = G_UserData.getShops().getShopCfgById(shopId);
        var resList = ShopHelper.getResListByShopCfg(shopCfg);
        this.updateRes(resList);
        if (shopId == ShopConst.EQUIP_SHOP) {
            this.updateSubTabRedPoint();
        }
        if (shopId == ShopConst.NORMAL_SHOP) {
            this._updateSubViewNewRemind();
        }
        this._updateNewRemind();
        this._playAnimation = true;
        G_UserData.getShops().c2sGetShopInfo(shopId);
    }
    refreshView() {
        console.log("ShopView refreshView");
        var chooseView = this.getShopView(this._selectTabIndex);
        (chooseView as any).refreshView();
    }
    _onEventBuyItem(eventName, message) {
        var chooseView = this.getShopView(this._selectTabIndex);
        if (chooseView && chooseView.updateBuyItem) {
            chooseView.updateBuyItem();
        }
        this.scheduleOnce(()=>{
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'ShopView buy Item');
        },0);
    }
    _onEventShopUpdate(eventName, message) {
        
        this.refreshView();
        var chooseView = this.getShopView(this._selectTabIndex);
        if (chooseView) {
            (chooseView as any).setListViewParentVisible(true);
        }
        if (this._playAnimation) {
            var chooseView = this.getShopView(this._selectTabIndex);
            if (chooseView) {
                chooseView.playEnterEffect();
            }
            this._playAnimation = false;
        }
    }
    updateSubTabRedPoint() {
        var tabIndex = this.getShopIndexById(ShopConst.EQUIP_SHOP);
        if (this._selectTabIndex == tabIndex) {
            var chooseView = this.getShopView(tabIndex);
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'equipShop');
            chooseView.setRedPointByTabIndex(ShopConst.EQUIP_SHOP_SUB_AWARD, redValue);
        }
        tabIndex = this.getShopIndexById(ShopConst.ARENA_SHOP);
        if (this._selectTabIndex == tabIndex) {
            var chooseView = this.getShopView(tabIndex);
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'arenaShop1');
            chooseView.setRedPointByTabIndex(ShopConst.ARENA_SHOP_SUB_ITEM, redValue);
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'arenaShop2');
            chooseView.setRedPointByTabIndex(ShopConst.ARENA_SHOP_SUB_AWARD, redValue);
        }
        tabIndex = this.getShopIndexById(ShopConst.GUILD_SHOP);
        if (this._selectTabIndex == tabIndex) {
            var chooseView = this.getShopView(tabIndex);
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'guildShop');
            chooseView.setRedPointByTabIndex(ShopConst.GUILD_SHOP_SUB_ITEM1, redValue);
        }
    }
    _updateSubViewNewRemind() {
        var tabIndex = this.getShopIndexById(ShopConst.NORMAL_SHOP);
        if (this._selectTabIndex == tabIndex) {
            var chooseView = this.getShopView(tabIndex);
            var redValue = ShopHelper.isHaveNewRemindShop(2);
            chooseView.setImageTipByTabIndex(ShopConst.GUILD_SHOP_SUB_ITEM1, redValue, null, Path.getTextSignet('txt_sg_new02'));
            redValue = ShopHelper.isHaveNewRemindShop(3);
            chooseView.setImageTipByTabIndex(ShopConst.GUILD_SHOP_SUB_ITEM3, redValue, null, Path.getTextSignet('txt_sg_new02'));
        }
    }

    _updateNewRemind() {
        // var index = this.getShopIndexById(ShopConst.NORMAL_SHOP);
        // if (this._selectTabIndex == index) {
        //     this._tabGroup1.setImageTipByTabIndex(index, false, null, Path.getTextSignet('txt_sg_new02'));
        // } else {
        //     var redValue = ShopHelper.isHaveNewRemindShop();
        //     this._tabGroup1.setImageTipByTabIndex(index, redValue, null, Path.getTextSignet('txt_sg_new02'));
        // }
    }
    _onEventNewRemindUpdate() {
        this._updateNewRemind();
        this._updateSubViewNewRemind();
    }
    _onEventRedPointUpdate() {
        var index = this.getShopIndexById(ShopConst.HERO_SHOP);
        if (index >= 0) {
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'heroShop');
            this.tabGroup.setRedPointByTabIndex(index, redValue);
        }
        var equipIndex = this.getShopIndexById(ShopConst.EQUIP_SHOP);
        if (equipIndex >= 0) {
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'equipShop');
            this.tabGroup.setRedPointByTabIndex(equipIndex, redValue);
            this.updateSubTabRedPoint();
        }
        var tabIndex = this.getShopIndexById(ShopConst.ARENA_SHOP);
        if (tabIndex >= 0) {
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'arenaShop');
            this.tabGroup.setRedPointByTabIndex(tabIndex, redValue);
            this.updateSubTabRedPoint();
        }
        tabIndex = this.getShopIndexById(ShopConst.GUILD_SHOP);
        if (tabIndex >= 0) {
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'guildShop');
            this.tabGroup.setRedPointByTabIndex(tabIndex, redValue);
            this.updateSubTabRedPoint();
        }
        var petIndex = this.getShopIndexById(ShopConst.PET_SHOP);
        if (petIndex >= 0) {
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'petShop');
            this.tabGroup.setRedPointByTabIndex(petIndex, redValue);
            this.updateSubTabRedPoint();
        }
    }
}
