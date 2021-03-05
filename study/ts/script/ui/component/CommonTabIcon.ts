import { Path } from "../../utils/Path";

import { Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTabIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    _isOpen: any;
    _index: any;
    _callback: any;

    onLoad() {
        this._imageRedPoint.node.active = (false);
        var btn: cc.Button = this._panelTouch.addComponent(cc.Button);
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonTabIcon";// 这个是代码文件名
        clickEventHandler.handler = "_onPanelTouch";
        btn.clickEvents.push(clickEventHandler);
    }

    updateUI(txt, isOpen, index) {
        this._isOpen = isOpen;
        this._index = index;
        var res = isOpen ? Path.getUICommon('img_btn_tab01_nml') : Path.getUICommon('img_btn_tab01_dis');
        var color = isOpen ? Colors.TAB_ICON_NORMAL : Colors.TAB_ICON_DISABLE;
        UIHelper.loadTexture(this._imageBg, res);
        this._text.string = (txt);
        this._text.node.color = (color);
    }

    setCallback(callback) {
        this._callback = callback;
    }

    showRedPoint(show) {
        this._imageRedPoint.node.active = (show);
    }

    setSelected(selected) {
        if (!this._isOpen) {
            return;
        }
        var res = selected && Path.getUICommon('img_btn_tab01_down') || Path.getUICommon('img_btn_tab01_nml');
        var color = selected && Colors.TAB_ICON_SELECTED || Colors.TAB_ICON_NORMAL;
        UIHelper.loadTexture(this._imageBg, res);
        this._text.node.color = (color);
    }

    _onPanelTouch(sender, state) {
        this.setSelected(true);
        if (this._callback) {
            this._callback(this._index);
        }
    }

    setVisible(v) {
        this.node.active = v;
    }

}
