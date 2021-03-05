import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonSelectNumNode extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    _panel_addInfo: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textBatchUse: cc.Label = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _btnSub10: cc.Button = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _btnSub1: cc.Button = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_amount_bg: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textAmount: cc.Label = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _btnAdd10: cc.Button = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _btnMax: cc.Button = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_1_0: cc.Sprite = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _btnAdd1: cc.Button = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _popupCommonItemUse_1: cc.Sprite = null;
    _maxLimit = 999;
    _seleclCallBack: any;
    _composeCount: number = 0;

    getMaxLimit() {
        return this._maxLimit;
    }
    onLoad() {
        this.updateAmount(0);
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonSelectNumNode";// 这个是代码文件名
        clickEventHandler.handler = "_onSub10";
        this._btnSub10.clickEvents.push(clickEventHandler)

        clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonSelectNumNode";// 这个是代码文件名
        clickEventHandler.handler = "_onSub1";
        this._btnSub1.clickEvents.push(clickEventHandler)

        clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonSelectNumNode";// 这个是代码文件名
        clickEventHandler.handler = "_onAdd10";
        this._btnAdd10.clickEvents.push(clickEventHandler)

        clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonSelectNumNode";// 这个是代码文件名
        clickEventHandler.handler = "_onAdd1";
        this._btnAdd1.clickEvents.push(clickEventHandler)

        clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonSelectNumNode";// 这个是代码文件名
        clickEventHandler.handler = "_onAddMax";
        this._btnMax.clickEvents.push(clickEventHandler)

        this.showButtonMax(false);
    }
    _onSub10() {
        this._callBack(false, 10);
    }
    _onSub1() {
        this._callBack(false, 1);
    }
    _onAdd10() {
        this._callBack(true, 10);
    }
    _onAdd1() {
        this._callBack(true, 1);
    }
    _onAddMax() {
        this._callBack(true, this._maxLimit);
    }
    setMaxLimitEx(max) {
        this._maxLimit = max;
    }

    _callBack(isAdd, num) {
        this.updateAmount(isAdd ? num : -num);
        if (this._seleclCallBack) {
            this._seleclCallBack(this._composeCount, isAdd);
        }
    }

    setCallBack(func) {
        if (func && typeof (func) == 'function') {
            this._seleclCallBack = func;
        }
    }
    setMaxLimit(max) {
        if (max > 999) {
            max = 999;
        }
        this._maxLimit = max || 999;
    }
    updateAmount(num) {
        var addNum = this._composeCount + num;
        this.setAmount(addNum);
    }
    getAmount() {
        return this._composeCount;
    }
    setAmount(num) {
        this._composeCount = num;
        if (this._composeCount >= this._maxLimit) {
            this._composeCount = this._maxLimit;
        }
        if (this._composeCount <= 0) {
            this._composeCount = 1;
        }
        this._textAmount.string = ('' + this._composeCount);
    }
    setTextDesc(desc) {
        if (this._textBatchUse) {
            this._textBatchUse.string = (desc);
            this._textBatchUse.node.active = (true);
        }
    }
    showButtonMax(needShow) {
        if (needShow) {
            this._btnMax.node.active = (true);
            this._btnAdd10.node.active = (false);
        } else {
            this._btnMax.node.active = (false);
            this._btnAdd10.node.active = (true);
        }
    }
    _updateAmount() {
        let callBack = function (isAdd) {
            if (this._seleclCallBack) {
                this._seleclCallBack(this._composeCount, isAdd);
            }
        }.bind(this);
        this._btnSub10.clickEvents = [];
        this._btnAdd10.clickEvents = [];
        this._btnMax.clickEvents = [];

        this._btnSub10.node.on(cc.Node.EventType.TOUCH_START, function () {
            this.updateAmount(-1000);
            callBack(false);
        }.bind(this));
        this._btnAdd10.node.on(cc.Node.EventType.TOUCH_START, function () {
            this.updateAmount(1000);
            callBack(true);
        }.bind(this));
        this._btnMax.node.on(cc.Node.EventType.TOUCH_START, function () {
            this.updateAmount(this._maxLimit);
            callBack(true);
        }.bind(this));
    }
    updateIncrement(num) {
        var iconSub = this._btnSub10.node.getChildByName('Image_1').getComponent(cc.Sprite);
        var iconAdd = this._btnAdd10.node.getChildByName('Image_1').getComponent(cc.Sprite);
        if (iconSub && iconAdd) {
            if (num ==100) {
                UIHelper.loadTexture(iconSub,Path.getUICommon('img_com_btn_minus03'));
                UIHelper.loadTexture(iconAdd,Path.getUICommon('img_com_btn_minus04'));
                this._updateAmount();
            }
            else if(num==1000)
            {
                UIHelper.loadTexture(iconSub,Path.getUICommon('img_com_btn_minus06'));
                UIHelper.loadTexture(iconAdd,Path.getUICommon('img_com_btn_minus05'));
                this._updateAmount();
            }
        }
    }
}