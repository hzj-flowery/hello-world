const { ccclass, property } = cc._decorator;

import CommonIconTemplate from './CommonIconTemplate'
import UIHelper from '../../utils/UIHelper';
import { handler } from '../../utils/handler';

@ccclass
export default class CommonIconNameNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_root: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon_template: CommonIconTemplate = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _icon_name: cc.Label = null;
    private _callback;

    public showItemBg(show) {
        show = show == null && true || show;
        this._icon_template.setImageTemplateVisible(show);
    }

    public setTouchEnabled(needEnabled) {
        this._icon_template.setTouchEnabled(needEnabled);
    }

    public updateUI(iconType, iconValue, iconCount) {
        this._icon_template.unInitUI();
        this._icon_template.initUI(iconType, iconValue, iconCount);
        this._icon_template.setTouchEnabled(false);
        var type = this._icon_template.getType();
        var itemParams = this._icon_template.getItemParams();
        if (itemParams) {
            this._icon_name.string = (itemParams.name);
            (this._icon_name)["_updateRenderData"](true);
            this._icon_name.node.color = (itemParams.icon_color);
            UIHelper.updateTextOutline(this._icon_name, itemParams);
            if (this._imageNameBg) {
                var width = this._icon_name.node.width;
                if (width > 88) {
                    this._imageNameBg.node.setContentSize(96, 52);
                }
            }
        }
    }

    public getPanelSize() {
        if (this._panel_root) {
            return this._panel_root.getContentSize();
        }
        return null;
    }

    public setItemSelect(needSelect) {
        if (this._icon_template.isInit() == true) {
            this._icon_template.setIconSelect(needSelect);
        }
    }

    public setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }

    public onTouchCallBack() {
        var itemParams = this._icon_template.getItemParams();
        if (this._callback) {
            this._callback(this, itemParams.cfg.id);
        }
    }

    // public getTag() {
    //     return this._target.getTag();
    // }

    public getItemId() {
        if (this._icon_template.isInit()) {
            var itemParams = this._icon_template.getItemParams();
            if (itemParams) {
                return itemParams.cfg.id;
            }
        }
        return 0;
    }

    public updateItemNum(num) {
        if (this._icon_template.isInit()) {
            this._icon_template.setCount(num);
        }
    }
}