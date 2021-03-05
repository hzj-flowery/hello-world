const { ccclass, property } = cc._decorator;

import CommonIconTemplate from './component/CommonIconTemplate'
import ListViewCellBase from './ListViewCellBase';
import UIHelper from '../utils/UIHelper';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { TypeConvertHelper } from '../utils/TypeConvertHelper';

@ccclass
export default class PopupSelectRewardItemCell extends ListViewCellBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconBg: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _iconTemplate: CommonIconTemplate = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTop: cc.Sprite = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox: cc.Toggle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemName: cc.Label = null;
    _callBack: any;

    ctor(index, callBack) {
        this._callBack = callBack;
        this._index = parseFloat(index);

        var contentSize = this._iconBg.node.getContentSize();
        this.node.setContentSize(contentSize);
        this.setCheck(false);
        this._imageTop.node.active = (false);
    }
    onCreate() {
        // var contentSize = this._iconBg.node.getContentSize();
        // this.node.setContentSize(contentSize);
        // this.setCheck(false);
        // this._imageTop.node.active = (false);
    }
    onCheckClick() {
        if (this._callBack && typeof (this._callBack) == 'function') {
            this._callBack(this._index, this.node);
        }
    }
    setCheck(bool) {
        bool = bool || false;
        this._checkBox.checkMark.node.active = (bool);
    }
    showCheck(show) {
        if (show == null) {
            show = true;
        }
        this._checkBox.node.active = (show);
    }
    setCallBack() {
    }
    updateUI(type, value, size) {
        this._iconTemplate.unInitUI();
        this._iconTemplate.initUI(type, value, size);
        this._imageTop.node.active = (false);
        var itemParam = this._iconTemplate.getItemParams();
        this._itemName.string = (itemParam.name);
        this._itemName.node.color = (itemParam.icon_color);
        UIHelper.updateTextOutline(this._itemName, itemParam);
        this._iconTemplate.setTouchEnabled(true);
        if (type == TypeConvertHelper.TYPE_HERO) {
            this._showHeroTopImage(value);
        }
        if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            if (itemParam.cfg.comp_type == 1) {
                this._showHeroTopImage(itemParam.cfg.comp_value);
            }
        }
    }
    _showHeroTopImage(heroId) {
        var res = UserDataHelper.getHeroTopImage(heroId)[0];
        if (res) {
            UIHelper.loadTexture(this._imageTop, res);
            this._imageTop.node.active = (true);
            return true;
        }
        return false;
    }
    onEnter() {
    }
    onExit() {
    }

}