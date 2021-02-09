const { ccclass, property } = cc._decorator;

import CommonTopBarItem from './CommonTopBarItem'
import { TopBarStyleConst } from '../../const/TopBarStyleConst';
import { assert } from '../../utils/GlobleFunc';
import { G_SignalManager, G_Prompt, G_ResolutionManager } from '../../init';
import { SignalConst } from '../../const/SignalConst';
import { Slot } from '../../utils/event/Slot';
import { handler } from '../../utils/handler';
import { UserDataHelper } from '../../utils/data/UserDataHelper';
import { PopupGetRewards } from '../PopupGetRewards';
import { ShopConst } from '../../const/ShopConst';
import { Path } from '../../utils/Path';
import CommonUI from './CommonUI';

@ccclass
export default class CommonTopbarItemList extends cc.Component {

    /**[[
        首页特殊	体力	精力	银两	元宝
        通用		  战力	银两	元宝	首页	返回
        副本相关	体力	银两	元宝	首页	返回
        PVP相关	  精力	银两	元宝	首页	返回
        竞技场 	 威望		银两 元宝  首页  返回
        ]]  */

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_1: cc.Sprite = null;

    @property({
        type: CommonTopBarItem,
        visible: true
    })
    _resNode1: CommonTopBarItem = null;

    @property({
        type: CommonTopBarItem,
        visible: true
    })
    _resNode2: CommonTopBarItem = null;

    @property({
        type: CommonTopBarItem,
        visible: true
    })
    _resNode3: CommonTopBarItem = null;

    @property({
        type: CommonTopBarItem,
        visible: true
    })
    _resNode4: CommonTopBarItem = null;


    _topBarStyle;
    _resList;
    _showBackImg: boolean = true;
    _pause = false;
    _signalRecvRecoverInfo: any;
    _signalRecvCurrencysInfo: any;
    _updateItemMsg: Slot;
    _deleteItemMsg: Slot;
    _intertItemMsg: Slot;
    _signalUpdateRoleInfo: Slot;
    _signalBuyShopGoods: Slot;

    _initEnter: boolean = false;

    onLoad() {
        let widget = this.node.getComponent(cc.Widget);
        if (widget) {
            // widget.isAlignLeft = false;
            // widget.isAlignRight = true;
            // widget.right = 100;
        }
        else {
            this.node.x = G_ResolutionManager.getDesignWidth() - 100;
        }
        //this._image_1.node.x += 100;

        this._image_1.node.addComponent(CommonUI).loadTexture(Path.getCommonImage("img_btn_ctrl_resources_bg02"));
        

    }
    onEnable() {
        this._onEnter();
    }
    onDisable() {
        this._onExit();
    }

    updateUI(topBarStyle, showPanelBlue) {
        if (topBarStyle == null) {
            return;
        }
        this._topBarStyle = topBarStyle;
        this._resList = TopBarStyleConst.getStyleValue(this._topBarStyle);
        console.assert(this._resList, 'TopBarStyleConst.getStyleValue return nil topBarStyle is error id:  ' + this._topBarStyle);
        this._showBackImg = true;
        if (showPanelBlue) {
            this._showBackImg = false;
        }
        this._updateUI(this._resList);
    }
    updateUIByResList(resList) {
        if (!resList) {
            return;
        }
        var data = {};
        for (var j = 1; j <= resList.length; j++) {
            data[j] = resList[j - 1];
        }
        this._resList = data;
        this._updateUI(this._resList);
    }
    _updateUI(resList) {
        for (var j = 1; j <= 4; j++) {
            var resNode = this['_resNode' + j];
            resNode.node.active = (false);
        }
        function filter(value) {
            if (value.type == 0) {
                return true;
            }
            return false;
        }
        var showCount = 0;
        if (resList) {
            var keyArr = Object.keys(resList);
            for (var i in resList) {
                var value = resList[i];
                var index = parseFloat(i) + (4 - keyArr.length);
                var resNode = this['_resNode' + index];
                if (filter(value) == false) {
                    // TODO:
                    resNode.node.active = (true);
                    resNode.updateUI(value.type, value.value);
                    resNode.showPanelBlue(!this._showBackImg);
                    showCount = showCount + 1;
                }
            }
        }
        if (showCount == 0) {
            this._image_1.node.active = (false);
        } else {
            this._image_1.node.active = (this._showBackImg);
        }
    }
    _updateData() {
        // console.warn('CommonTopbarItemList:_updateData()');
        if (this._resList) {
            this._updateUI(this._resList);
        }
    }
    _onEnter() {
        if (this._initEnter) {
            return;
        }
        if (this._pause) {
            this._updateData();
            return;
        }
        this._initEnter = true;
        if (this._signalRecvRecoverInfo) {
            this._signalRecvRecoverInfo.remove();
            this._signalRecvRecoverInfo = null;
        }
        if (this._signalRecvCurrencysInfo) {
            this._signalRecvCurrencysInfo.remove();
            this._signalRecvCurrencysInfo = null;
        }
        this._signalRecvRecoverInfo = G_SignalManager.add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(this, this._updateData));
        this._signalRecvCurrencysInfo = G_SignalManager.add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(this, this._updateData));
        this._updateItemMsg = G_SignalManager.add(SignalConst.EVENT_ITEM_OP_UPDATE, handler(this, this._updateData));
        this._deleteItemMsg = G_SignalManager.add(SignalConst.EVENT_ITEM_OP_DELETE, handler(this, this._updateData));
        this._intertItemMsg = G_SignalManager.add(SignalConst.EVENT_ITEM_OP_INSERT, handler(this, this._updateData));
        this._signalUpdateRoleInfo = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._updateData));
        this._signalBuyShopGoods = G_SignalManager.add(SignalConst.EVENT_BUY_ITEM, handler(this, this._onEventBuyItem));
        this._updateData();
        // console.warn('CommonTopbarItemList:onEnter()');
    }
    _onExit() {
        this._initEnter = false;
        if (this._signalRecvRecoverInfo) {
            this._signalRecvRecoverInfo.remove();
            this._signalRecvRecoverInfo = null;
        }
        if (this._signalRecvCurrencysInfo) {
            this._signalRecvCurrencysInfo.remove();
            this._signalRecvCurrencysInfo = null;
        }
        if (this._updateItemMsg) {
            this._updateItemMsg.remove();
            this._updateItemMsg = null;
        }
        if (this._deleteItemMsg) {
            this._deleteItemMsg.remove();
            this._deleteItemMsg = null;
        }
        if (this._intertItemMsg) {
            this._intertItemMsg.remove();
            this._intertItemMsg = null;
        }
        if (this._signalBuyShopGoods) {
            this._signalBuyShopGoods.remove();
            this._signalBuyShopGoods = null;
        }
        if (this._signalUpdateRoleInfo) {
            this._signalUpdateRoleInfo.remove();
            this._signalUpdateRoleInfo = null;
        }
        // console.warn('CommonTopbarItemList:onExit()');
    }
    _onEventBuyItem(eventName, message) {
        var awards = message['awards'];
        if (awards) {
            var shopId = message['shop_id'];
            var shopType = UserDataHelper.getShopType(shopId);
            if (shopType == ShopConst.SHOP_TYPE_ACTIVE || shopId == ShopConst.SEASOON_SHOP) {
                PopupGetRewards.showRewards(awards);
            } else {
                G_Prompt.showAwards(awards);
            }
        }
    }
    pauseUpdate() {
        // console.log("pauseUpdate");
        this._pause = true;
        this._onExit();
    }
    resumeUpdate() {
        // console.log("resumeUpdate");
        if (this._pause) {
            this._pause = false;
            this._onEnter();
        }
    }

}