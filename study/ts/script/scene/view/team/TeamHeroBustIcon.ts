import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { Lang } from "../../../lang/Lang";
import UIActionHelper from "../../../utils/UIActionHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CommonUI from "../../../ui/component/CommonUI";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeamHeroBustIcon extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCommon: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenLevel: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    private _type: number;
    private _value: number;
    private _isOpen: boolean;
    private _pos: cc.Vec2;
    private _onClick: any;

    public setInitData(pos, click?): void {
        this._pos = pos;
        this._onClick = click;
    }
    onCreate() {
        this._initData();
        this._initView();
        this._hideAllWidget();
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, this._onPanelTouch, this)
    }
    onEnter() {
    }
    onExit() {
    }
    _initData() {
        this._type = 0;
        this._value = 0;
        this._isOpen = false;
    }
    _initView() {
        // this._panelTouch.setSwallowTouches(false);
    }
    _hideAllWidget() {
        this._imageLock.node.active = (false);
        this._spriteAdd.node.active = (false);
        this._nodeCommon.removeAllChildren();
        this._imageSelected.node.active = (false);
        this._redPoint.node.active = (false);
        this._imageIcon.node.active = (false);
    }
    updateIcon(type, value, funcId, limitLevel, limitRedLevel) {
        this._hideAllWidget();
        var ret = FunctionCheck.funcIsOpened(funcId);
        var isOpen = ret[0];
        var comment = ret[1];
        var info = ret[2];
        this._type = type;
        this._value = value;
        this._isOpen = isOpen;
        if (!isOpen) {
            this._imageLock.node.active = (true);
            var level = Lang.get('team_txt_unlock_position', { level: info.level });
            this._textOpenLevel.string = (level);
            return;
        }
        if (type > 0 && value > 0) {
            this._createCommonIcon(type, value, limitLevel, limitRedLevel);
        } else {
            this._spriteAdd.node.active = (true);
            UIActionHelper.playBlinkEffect(this._spriteAdd.node);
        }
    }
    _createCommonIcon(type, value, limitLevel, limitRedLevel) {
        var itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, value, null, null, limitLevel, limitRedLevel);
        if (itemParams.bustIconBg != null) {
            this.loadColorBg(itemParams.bustIconBg);
        }
        if (itemParams.bustIcon != null) {
            this.loadIcon(itemParams.bustIcon);
        }
    }
    _onPanelTouch(sender: cc.Touch) {
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            if (this._onClick) {
                this._onClick(this._pos);
            }
        }
    }
    setSelected(selected) {
        this._imageSelected.node.active = (selected);
    }
    showRedPoint(visible) {
        this._redPoint.node.active = (visible);
    }
    showImageArrow(visible) {
        // var UIActionHelper = require('UIActionHelper');
    }
    onlyShow(type, value, limitLevel, limitRedLevel) {
        this._hideAllWidget();
        if (type > 0 && value > 0) {
            this._isOpen = true;
            this._createCommonIcon(type, value, limitLevel, limitRedLevel);
        } else {
            this._isOpen = false;
            this._imageLock.node.active = (true);
            //this._panelTouch.setEnabled(false);
            this._textOpenLevel.node.active = (false);
        }
    }
    loadIcon(res) {
        this._imageIcon.node.active = (true);
        this._imageIcon.node.addComponent(CommonUI).loadTexture(res);
    }
    loadColorBg(res, opacity?) {
        this._imageBg.node.active = (true);
        this._imageBg.node.opacity = (opacity || 255);
        this._imageBg.node.addComponent(CommonUI).loadTexture(res);
    }

}