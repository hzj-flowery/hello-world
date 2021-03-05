const {ccclass, property} = cc._decorator;

import CommonFullScreenTitle from '../../../ui/component/CommonFullScreenTitle'

import VipGiftPkgNode from './VipGiftPkgNode'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonLargeVipNode from '../../../ui/component/CommonLargeVipNode'

import CommonVipNode from '../../../ui/component/CommonVipNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import CommonFullScreenTitleNoBg from '../../../ui/component/CommonFullScreenTitleNoBg';
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_ConfigLoader, G_SceneManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import { FunctionConst } from '../../../const/FunctionConst';
import VipRechargeView from './VipRechargeView';
import { assert } from '../../../utils/GlobleFunc';
import VipPrivilegeView from './VipPrivilegeView';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import CommonPageView from '../../../ui/component/CommonPageView';
import UIHelper from '../../../utils/UIHelper';
import CommonProgressNode from '../../../ui/component/CommonProgressNode';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import CommonPageViewEx from '../../../ui/component/CommonPageViewEx';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import CommonTabIcon from '../../../ui/component/CommonTabIcon';
import { DataConst } from '../../../const/DataConst';

enum VipView{
    TAB_INDEX_JADE = 1,
    TAB_INDEX_PRIVILEGE = 2
}

@ccclass
export default class PopupVip extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _popBase: CommonNormalLargePop = null;

    @property({
        type: CommonVipNode,
        visible: true
    })
    _nextVipValue: CommonVipNode = null;

    @property({
        type: CommonLargeVipNode,
        visible: true
    })
    _commonVipNode: CommonLargeVipNode = null;

    @property({
        type: CommonProgressNode,
        visible: true
    })
    _commonProgressNode: CommonProgressNode = null;


    @property({
        type: cc.Node,
        visible: true
    })
    _nodeView: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _jadeView: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePageView: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _btnLeftRedPoint: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _btnRightRedPoint: cc.Sprite = null;

    @property({
        type: VipGiftPkgNode,
        visible: true
    })
    _vipGiftPkg: VipGiftPkgNode = null;

    @property({
        type: CommonFullScreenTitleNoBg,
        visible: true
    })
    _comomPop: CommonFullScreenTitleNoBg = null;

    @property({
        type: CommonPageViewEx,
        visible: true
    })
    _privilegePageView: CommonPageViewEx = null;

    @property(cc.Node)
    pageView:cc.Node = null;

    @property(cc.Button)
    btnTurnLeft:cc.Button = null;

    @property(cc.Button)
    btnTurnRight:cc.Button = null;

    @property(cc.ProgressBar)
    progressBar:cc.ProgressBar = null;

    @property(cc.Prefab)
    vipRechargeView:cc.Prefab = null;

    @property(cc.Prefab)
    vipPrivilegeView:cc.Prefab = null;

    @property(cc.Node)
    Node_level_not_full:cc.Node = null;

    @property(cc.Label)
    Text_next_gold_value_1:cc.Label = null;

    @property(cc.Label)
    Text_next_gold_value_2:cc.Label = null;

    @property(cc.Label)
    Text_next_gold_value_3:cc.Label = null;

    @property(cc.Label)
    Text_level_full:cc.Label = null;

    @property(cc.Label)
    TextProgress:cc.Label = null;

    @property(cc.Node)
    templetTest:cc.Node = null;
    
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
        type: cc.Sprite,
        visible: true
    })
    _imageRopeTail: cc.Sprite = null;
    
    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon1: CommonTabIcon = null;
    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon2: CommonTabIcon = null;
    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon3: CommonTabIcon = null;

    
    


    _tabIndex:number;
    _roundEffectList: any;
    _vipList: any[];
    _getVipGift: any;
    _signalRedPointChange: any;
    _signalRechargeGetInfo: any;
    
    _rechargeView: VipRechargeView;
    _jadeNodeView:VipRechargeView;
    _maxVipShowLevel: number;

    _privilegeView:boolean;
    _curPageItem:any;
    currentPage:number = 0;

    ctor(initTabIndex?, roundEffectList?) {
        this._tabIndex = initTabIndex || VipView.TAB_INDEX_JADE;
        this._selectTabIndex = this._tabIndex;
        this._roundEffectList = roundEffectList;
        this._vipList = [];
    }
    onCreate() {
        var tabIndex = G_SceneManager.getViewArgs("PopupVip")[1];
        this.ctor(tabIndex);
        this._popBase.setTitle(Lang.get('lang_vip_recharge_btn'));
        this._popBase.addCloseEventListener(handler(this, this.onBtnCancel));
        var panelNode = this.node.getChildByName('touchPanel');
        var panelBtn = panelNode.addComponent(cc.Button);
        UIHelper.addEventListener(this.node, panelBtn, 'PopupVip', 'onBtnCancel');
        this._initTab();
    }
    onEnter() {
        this._initView();
        this._getVipGift = G_SignalManager.add(SignalConst.EVENT_VIP_GET_VIP_GIFT_ITEMS, handler(this, this._onEventGetVipGift));
        this._signalRedPointChange = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointChange));
        this._signalRechargeGetInfo = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(this, this._onEventRechargeGetInfo));
    }
    onExit() {
        this._privilegeView = false;
        this._rechargeView = null;
        this._getVipGift.remove();
        this._getVipGift = null;
        this._signalRedPointChange.remove();
        this._signalRedPointChange = null;
        this._signalRechargeGetInfo.remove();
        this._signalRechargeGetInfo = null;
    }
   //kaishi----------------------------------------------------------------------------
   private _isOpenJade:boolean = false;//是否开启玉璧
   private _selectTabIndex:number = 1;//当前选中的索引
   private _tabNum:number = 0;//页签的数目
    _initTab() {
        this._isOpenJade = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)[0];
        this._imageRope3.node.active = (false);
        this._nodeTabIcon3.node.active = (false);
        this._imageRopeTail.node.y = 300;
        this._tabNum = 2;
        for (var i = 1; i <= this._tabNum; i++) {
            var nameStr = Lang.get('vip_tab_' + i), idx = i;
            this['_nodeTabIcon' + i].updateUI(nameStr, true, idx);
            this['_nodeTabIcon' + i].setCallback(handler(this, this._onClickTabIcon));
        }
        this._updateTabSelected();
    }
    _onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this._tabIndex = index;
        this._updateTabSelected();
        this.updateView();
       if (index == VipView.TAB_INDEX_PRIVILEGE) {
            this._switch2Privilege();
        } else if (index == VipView.TAB_INDEX_JADE) {
            this._switch2Jade();
        }
    }
    _updateTabSelected() {
        for (var i = 1; i <= this._tabNum; i++) {
            var idx = i;
            if (!this._isOpenJade) {
                idx = i + 1;
            }
            this['_nodeTabIcon' + i].setSelected(idx == this._selectTabIndex);
        }
    }
    //切换到玉璧充值
    _switch2Jade() {
        //参考
        // if (this._jadeNodeView == null) {
        //     this._jadeNodeView = new VipRechargeView(this, DataConst.RES_JADE2, this._roundEffectList);
        //     this._jadeView.addChild(this._jadeNodeView.node);
        // }
        if (this._jadeNodeView == null) {
            this._jadeNodeView = cc.instantiate(this.vipRechargeView).getComponent(VipRechargeView);
            this._jadeNodeView.ctor(this,DataConst.RES_JADE2);
            this._jadeView.addChild(this._jadeNodeView.node);
        }

        this._nodePageView.active = (false);
        this._nodeView.active = (false);
        this._jadeView.active = (true);
        this._nodeTabIcon2.showRedPoint(false);
        this._popBase.setTitle(Lang.get('lang_vip_recharge_btn'));
    }
    //-------------------------------------------------------------------------------------------------

    onShowFinish() {
        G_UserData.getVip().c2sGetRecharge();
    }
    onBtnCancel() {
        this.close();
    }
    _onEventRechargeGetInfo(id, message) {
        if (this._tabIndex == VipView.TAB_INDEX_PRIVILEGE) {
            this._switch2Privilege();
        }
    }
    _onEventRedPointChange(id, funcId) {
        if (funcId == FunctionConst.FUNC_VIP_GIFT) {
            this.updateLeftBtnRedPoint();
        }
    }
    updateLeftBtnRedPoint() {
        var currLevel = this.currentPage;
        var showRedPoint = G_UserData.getVip().hasGiftInLeftPage(currLevel - 1);
        this._btnLeftRedPoint.node.active = (showRedPoint);
        showRedPoint = G_UserData.getVip().hasGiftInRightPage(currLevel + 1);
        this._btnRightRedPoint.node.active = (showRedPoint);
    }
    _onEventGetVipGift(id, message) {
        if (this._tabIndex != VipView.TAB_INDEX_PRIVILEGE) {
            return;
        }
        if (message.ret != 1) {
            return;
        }
        var awards = message['reward'] || [];
        PopupGetRewards.showRewards(awards);
        var currLevel = this.currentPage;
        //var [vipData] = G_UserData.getVip().getVipDataByLevel(currLevel);
        // var itemList = this._privilegePageView.getItems();
        // for(var i=0; i<itemList.length; i++){
        //     let currentPage = itemList[i];
        //     let itemLevel = (currentPage as ListViewCellBase).getIdx() + 1;
        //     if(currentPage && itemLevel == currLevel){
        //         currentPage.getComponent(VipPrivilegeView).updateUI(vipData);
        //         break;
        //     }
        // }
        this._refreshVipGiftPkg(currLevel);
    }
    _initView() {
        UIHelper.addEventListener(this.node, this.btnTurnLeft, 'PopupVip', 'onBtnTurnLeft');
        UIHelper.addEventListener(this.node, this.btnTurnRight, 'PopupVip', 'onBtnTurnRight');
        // this._nodePageView.updateButton('Button_turn_left', function () {
        //     var currentPage = this._privilegePageView.getCurrentPageIndex();
        //     if (currentPage > 0) {
        //         this._privilegePageView.scrollToPageEx(currentPage - 1);
        //     }
        // });
        // this._nodePageView.updateButton('Button_turn_right', function () {
        //     var currentPage = this._privilegePageView.getCurrentPageIndex();
        //     var pageSize = this._privilegePageView.getPageSize();
        //     if (currentPage + 1 < pageSize) {
        //         this._privilegePageView.scrollToPageEx(currentPage + 1);
        //     }
        // });
        this._nodeView.active = (false);
        this._nodePageView.active = (this._selectTabIndex == VipView.TAB_INDEX_PRIVILEGE);
        this._jadeView.active = (this._selectTabIndex == VipView.TAB_INDEX_JADE);
        if (this._selectTabIndex == VipView.TAB_INDEX_PRIVILEGE) {
            this._switch2Privilege();
        } else if (this._selectTabIndex == VipView.TAB_INDEX_JADE) {
            this._switch2Jade();
        }
        this.updateView();
        this._updateRedPoint();

    }
    _updateRedPoint() {
        var redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_RECHARGE);
        this._nodeTabIcon1.showRedPoint(false);
        this._nodeTabIcon2.showRedPoint(redValue);
    }

    onBtnTurnLeft(){
        var currentPage = this.currentPage;
        if (currentPage > 0) {
            //this._privilegePageView.scrollToPage(currentPage - 1, 0);
            this.currentPage--;
            this.updateItem(this._curPageItem, currentPage-1);
            this._refreshVipGiftPkg();
        }
    }
    onBtnTurnRight(){
        var currentPage = this.currentPage;
        var pageSize = this._vipList.length;
        if (currentPage + 1 < pageSize) {
            this.currentPage++;
            //this._privilegePageView.scrollToPage(currentPage + 1, 0);
            this.updateItem(this._curPageItem,currentPage+1);
            this._refreshVipGiftPkg();
        }
    }
    _initPrivilegeView() {

    }
    updateView() {
        var VipLevelInfo =  G_ConfigLoader.getConfig(ConfigNameConst.VIP_LEVEL);
        var maxVipLv = G_UserData.getVip().getShowMaxLevel();
        var currentVipLv = G_UserData.getVip().getLevel();
        var currentVipExp = G_UserData.getVip().getExp();
        var nextVipLv = currentVipLv == maxVipLv && maxVipLv || currentVipLv + 1;
        var curVipLvInfo = G_UserData.getVip().getVipDataByLevel(currentVipLv)[0].getInfo();
        var imageVip =  this._nextVipValue;
        var nextGoldValueText1 = this.Text_next_gold_value_1;
        var nextGoldValueText2 = this.Text_next_gold_value_2;
        var nextGoldValueText3 = this.Text_next_gold_value_3;
        var totalWidth = 0;
        if (maxVipLv != currentVipLv) {
            this.Node_level_not_full.active = (true);
            this._nextVipValue.setString(Lang.get('lang_vip_value', { num: nextVipLv }));
            var expDesc = (currentVipExp) + ('/' + (curVipLvInfo.vip_exp));
            this.TextProgress.string = expDesc;
            this.TextProgress.node.active = true;
            this._commonVipNode.setVip(currentVipLv);
            this.Text_level_full.string = Lang.get('lang_level_full');
            this.Text_level_full.node.active = false;
            nextGoldValueText1.string = (Lang.get('lang_vip_next_level_title_1'));
            nextGoldValueText2.string = ""+(curVipLvInfo.vip_exp - currentVipExp);
            nextGoldValueText3.string = (Lang.get('lang_vip_next_level_title_4'));
            // if (this._isOpenJade && this._selectTabIndex != 1) {
            //     nextGoldValueText3.string = (Lang.get('lang_vip_next_level_title_5'));
            // }
            // if (this._isOpenJade && this._selectTabIndex == 2) {
            //     nextGoldValueText3.string = (Lang.get('lang_vip_next_level_title_3'));
            // }
            this.scheduleOnce(()=>{
                nextGoldValueText3.node.x = (nextGoldValueText2.node.x + nextGoldValueText2.node.getContentSize().width + 4);
                totalWidth = totalWidth + nextGoldValueText1.node.getContentSize().width + nextGoldValueText2.node.getContentSize().width + nextGoldValueText3.node.getContentSize().width;
                imageVip.node.x = (nextGoldValueText1.node.x + totalWidth + 8);
                this.progressBar.progress = (currentVipExp >= curVipLvInfo.vip_exp && 1 || currentVipExp / curVipLvInfo.vip_exp);
                this._commonProgressNode.showLightLine(true, currentVipExp, curVipLvInfo.vip_exp);
            })
            return;
        } else {
            this.Node_level_not_full.active = (false);
            this._commonVipNode.setVip(currentVipLv);
            this.Text_level_full.string = Lang.get('lang_level_full');
            this.Text_level_full.node.active = true;
            this.TextProgress.string = (currentVipExp).toString();
            this.TextProgress.node.active = true;
        }
        imageVip.node.x = (nextGoldValueText1.node.x + totalWidth + 8);
        this.progressBar.progress = (currentVipExp >= curVipLvInfo.vip_exp && 1 || currentVipExp / curVipLvInfo.vip_exp * 1);
        this._commonProgressNode.showLightLine(true, currentVipExp, curVipLvInfo.vip_exp);
    }
    getSubNodeByName(arg0: string) {
        throw new Error("Method not implemented.");
    }
    switch2Recharge() {
        if (this._rechargeView == null) {
            this._rechargeView = cc.instantiate(this.vipRechargeView).getComponent(VipRechargeView);
            this._rechargeView.ctor(this,DataConst.RES_DIAMOND);
            this._nodeView.addChild(this._rechargeView.node);
        }
        this._nodePageView.active = (false);
        this._nodeView.active = (true);
        this._jadeView.active = false;
        this._popBase.setTitle(Lang.get('lang_vip_recharge_btn'));
    }
    _switch2Privilege() {
        var oldVipNum = this._vipList.length;
        this._vipList = UserDataHelper.getVipGiftPkgList() || [];
        this._maxVipShowLevel = this._vipList[this._vipList.length-1].getId();
        if (this._vipList.length == 0) {
          //assert((false);
        }
        var colors = [
            {r:40,g:40,b:255},
            {r:255,g:0,b:0},
            {r:0,g:174,b:174},
            {r:255,g:149,b:202},
            {r:255,g:211,b:6},
            {r:159,g:77,b:149},
        ];
        if (!this._curPageItem) {
            this._curPageItem = cc.instantiate(this.vipPrivilegeView).getComponent(VipPrivilegeView);
            this.pageView.addChild(this._curPageItem.node);
            this._privilegeView = true;

        }
        this._scrollToVipLevel();
        this._nodePageView.active = (true);
        this._nodeView.active = (false);
        this._jadeView.active = false;
        var redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_RECHARGE);
        this._nodeTabIcon2.showRedPoint(redValue);
        this._popBase.setTitle(Lang.get('lang_vip_privilege_btn'));
    }
    updateItem(item, i) {
        item.updateUI(this._vipList[i]);
    }
    _onPageViewEvent(sender, eventType) {
       
    }
    _refreshVipGiftPkg(pageIndex?) {
        var currLevel = pageIndex || this.currentPage;
        var [vipData] = G_UserData.getVip().getVipDataByLevel(currLevel);
        if (this._vipGiftPkg) {
            this._vipGiftPkg.updateUI(vipData);
        }
        var maxVipLv = this._maxVipShowLevel || G_UserData.getVip().getShowMaxLevel();
        this.btnTurnLeft.node.active = (currLevel != 0);
        this.btnTurnRight.node.active = (currLevel < maxVipLv);
        this.updateLeftBtnRedPoint();
    }
    _scrollToVipLevel() {
        var vipLevel = G_UserData.getVip().getLevel();
        this.currentPage = vipLevel;
        this.updateItem(this._curPageItem, vipLevel);
        this._refreshVipGiftPkg(vipLevel);
    }
    _onClose() {
        this.removeFromParent();
    }
    removeFromParent() {
        throw new Error("Method not implemented.");
    }

}
