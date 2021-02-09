const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../../ui/component/CommonIconTemplate'

import CommonButtonSwitchLevel1 from '../../../../ui/component/CommonButtonSwitchLevel1'
import ListViewCellBase from '../../../../ui/ListViewCellBase';
import { G_GameAgent, G_ConfigManager, G_ServerTime } from '../../../../init';
import UIHelper from '../../../../utils/UIHelper';
import { Lang } from '../../../../lang/Lang';
import { RichTextExtend } from '../../../../extends/RichTextExtend';
import UIActionHelper from '../../../../utils/UIActionHelper';

@ccclass
export default class LevelGiftItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _alreadyBuy: cc.Sprite = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _btnBuy: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _levelRequireRichNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _goldGetRichNode: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _lock: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_vip: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _levelNum3: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _levelNum2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _levelNum1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _timeCountDown: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _timeCountDownDes: cc.Node = null;


    _data: any;


    ctor() {
        UIHelper.addEventListener(this.node, this._btnBuy._button, 'LevelGiftItemCell', '_onBtnBuy');
    }
    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        this.ctor();
    }
    _lockState() {
        this._lock.node.active = (true);
        this._alreadyBuy.node.active = (false);
        this._timeCountDown.node.active = (false);
        this._timeCountDownDes.active = (false);
        var config = this._data.getConfig();
        var richText = Lang.get('lang_activity_level_gift_level_require', { level: config.unlock_level });
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._levelRequireRichNode.addChild(widget.node);
        var vipConfig = this._data.getVipConfig();
        this._btnBuy.setVisible(true);
        this._btnBuy.setString(Lang.get('lang_activity_level_gift_btn_buy', { value: vipConfig.rmb }));
        this._btnBuy.setEnabled(false);
    }
    _alreadyBuyState() {
        this._lock.node.active = (false);
        this._timeCountDown.node.active = (false);
        this._timeCountDownDes.active = (false);
        this._alreadyBuy.node.active = (true);
        this._timeCountDown.node.active = (false);
        this._btnBuy.setVisible(false);
        this._btnBuy.setEnabled(false);
    }
    _timeoutState() {
        this._lock.node.active = (false);
        this._timeCountDown.node.active = (false);
        this._timeCountDownDes.active = (false);
        this._alreadyBuy.node.active = (false);
        this._btnBuy.setVisible(true);
        this._btnBuy.setEnabled(false);
        this._btnBuy.setString(Lang.get('lang_activity_level_gift_btn_timeout'));
    }
    _countDownState() {
        this._lock.node.active = (false);
        this._alreadyBuy.node.active = (false);
        this._timeCountDown.node.active = (true);
        this._timeCountDownDes.active = (true);
        var action = UIActionHelper.createUpdateAction(function () {
            var [isTimeOut,limitTime] = this._data.isTimeOut();
            if (!isTimeOut) {
                this._timeCountDown.string = (G_ServerTime.getLeftSecondsString(limitTime, '00:00:00'));
            } else {
                this.updateUI(this._data);
            }
        }.bind(this),0.1);
        this._timeCountDown.node.runAction(action);
        var vipConfig = this._data.getVipConfig();
        this._btnBuy.setVisible(true);
        this._btnBuy.setString(Lang.get('lang_activity_level_gift_btn_buy', { value: vipConfig.rmb }));
        this._btnBuy.setEnabled(true);
    }
    updateAppstoreCheckUI(data) {
        if (!data) {
            return;
        }
        this._data = data;
        this._timeCountDown.node.stopAllActions();
        this._levelRequireRichNode.removeAllChildren();
        this._refreshGetGoldInfo();
        var config = this._data.getConfig();
        if (config.unlock_level >= 100) {
            this._levelNum1.string = Math.floor(config.unlock_level % 100 % 10).toString();
            this._levelNum2.string = (Math.floor(config.unlock_level / 10 % 10)).toString();
            this._levelNum3.string = (Math.floor(config.unlock_level / 100)).toString();
            this._levelNum2.node.active = (true);
            this._levelNum3.node.active = (true);
        } else if (config.unlock_level > 10) {
            this._levelNum1.string = Math.floor(config.unlock_level % 10).toString();
            this._levelNum2.string = (Math.floor(config.unlock_level / 10)).toString();
            this._levelNum2.node.active = (true);
        } else {
            this._levelNum1.string = Math.floor(config.unlock_level % 10).toString();
            this._levelNum2.node.active = (false);
        }
        this._icon.unInitUI();
        this._icon.initUI(config.type, config.value, config.size);
        this._icon.setTouchEnabled(true);
        var itemParam = this._icon.getItemParams();
        this._textItemName.string = (itemParam.name);
        this._textItemName.node.color = (itemParam.icon_color);
        if (data.getIs_buy()) {
            this._alreadyBuyState();
        } else {
            this._lock.node.active = (false);
            this._alreadyBuy.node.active = (false);
            this._timeCountDown.node.active = (false);
            this._timeCountDownDes.active = (false);
            var vipConfig = this._data.getVipConfig();
            this._btnBuy.setVisible(true);
            this._btnBuy.setString(Lang.get('lang_activity_level_gift_btn_buy', { value: vipConfig.rmb }));
            this._btnBuy.setEnabled(true);
        }
    }
    updateUI(data) {
        if (G_ConfigManager.isAppstore()) {
            this.updateAppstoreCheckUI(data);
            return;
        }
        if (!data) {
            return;
        }
        this._data = data;
        this._timeCountDown.node.stopAllActions();
        this._levelRequireRichNode.removeAllChildren();
        this._refreshGetGoldInfo();
        var config = this._data.getConfig();
        if (config.unlock_level >= 100) {
            this._levelNum1.string = Math.floor(config.unlock_level % 100 % 10).toString();
            this._levelNum2.string = (Math.floor(config.unlock_level / 10 % 10)).toString();
            this._levelNum3.string = (Math.floor(config.unlock_level / 100)).toString();
            this._levelNum2.node.active = (true);
            this._levelNum3.node.active = (true);
        } else if (config.unlock_level > 10) {
            this._levelNum1.string = Math.floor(config.unlock_level % 10).toString();
            this._levelNum2.string = (Math.floor(config.unlock_level / 10)).toString();
            this._levelNum2.node.active = (true);
            this._levelNum3.node.active = (false);
        } else {
            this._levelNum1.string = Math.floor(config.unlock_level % 10).toString();
            this._levelNum2.node.active = (false);
            this._levelNum3.node.active = (false);
        }
        this._icon.unInitUI();
        this._icon.initUI(config.type, config.value, config.size);
        this._icon.setTouchEnabled(true);
        var itemParam = this._icon.getItemParams();
        this._textItemName.string = (itemParam.name);
        this._textItemName.node.color = (itemParam.icon_color);
        if (data.isReachUnLockLevel()) {
            var [isTimeOut] = data.isTimeOut();
            if (data.getIs_buy()) {
                this._alreadyBuyState();
            } else if (isTimeOut) {
                this._timeoutState();
            } else {
                this._countDownState();
            }
        } else {
            this._lockState();
        }
    }
    _refreshGetGoldInfo() {
        this._goldGetRichNode.removeAllChildren();
        var payCfg = this._data.getVipConfig();
        var richText = Lang.get('lang_activity_level_gift_gold_get_info', { value: payCfg.gold });
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._goldGetRichNode.addChild(widget.node);
    }
    _onBtnBuy() {
        if (G_ConfigManager.isAppstore()) {
            if (this._data.getIs_buy()) {
                return;
            }
        } else {
            if (!this._data.isReachUnLockLevel()) {
                return;
            }
            if (this._data.getIs_buy()) {
                return;
            }
            if (this._data.isTimeOut()[0]) {
                return;
            }
        }
        var payCfg = this._data.getVipConfig();
        G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
    }

}
