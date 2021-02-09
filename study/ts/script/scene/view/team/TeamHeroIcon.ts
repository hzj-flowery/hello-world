import { Lang } from "../../../lang/Lang";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import CommonPetIcon from "../../../ui/component/CommonPetIcon";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIActionHelper from "../../../utils/UIActionHelper";
import ViewBase from "../../ViewBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TeamHeroIcon extends ViewBase{
    
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePetBg: cc.Sprite = null;
 
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
    _spriteAdd: cc.Sprite = null;
 
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCommon: cc.Node = null;
 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected: cc.Sprite = null;
 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePetCover: cc.Sprite = null;
 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;
 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;
 
    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    
    private _isPet:boolean;
    private _isOpen:boolean;
    private _value:number;
    private _type:number;
    private _pos:number;
    private _onClick:any;

    private _commonHeroIcon:any;
    private _commonPetIcon:any;

    public setInitData(pos:number,callBack:any,isPet:boolean):void{
          this._pos = pos;
          this._onClick = callBack;
          this._isPet = isPet;
    }
    onCreate() {
        this._commonHeroIcon = cc.resources.get(Path.getCommonPrefab("CommonHeroIcon"));
        this._commonPetIcon = cc.resources.get(Path.getCommonPrefab("CommonPetIcon"));
        this._initData();
        this._initView();
        this._hideAllWidget();
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onPanelTouch,this)
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
        //this._panelTouch.setSwallowTouches(false);
    }
    _hideAllWidget() {
        this._imageLock.node.active = (false);
        this._spriteAdd.node.active = (false);
        this._nodeCommon.removeAllChildren();
        this._imageSelected.node.active = (false);
        this._redPoint.node.active = (false);
        this._imageArrow.node.active = (false);
        this._imagePetBg.node.active = (this._isPet);
        this._imagePetCover.node.active = (this._isPet);
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
        var icon = null;
        if (type == TypeConvertHelper.TYPE_HERO) {   
            icon = (cc.instantiate(this._commonHeroIcon) as cc.Node).getComponent(CommonHeroIcon);
            icon.updateUI(value, null, limitLevel, limitRedLevel);
        } else if (type == TypeConvertHelper.TYPE_PET) {
            icon =(cc.instantiate(this._commonPetIcon) as cc.Node).getComponent(CommonPetIcon);
            icon.updateUI(value);
        }
        if (icon) {
            this._nodeCommon.addChild(icon);
        }
    }
    _onPanelTouch(sender:cc.Touch) {
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
        this._imageArrow.node.active = (visible);
        if (visible) {
            UIActionHelper.playFloatEffect(this._imageArrow.node);
        }
    }
    onlyShow(type, value, limitLevel, limitRedLevel) {
        this._hideAllWidget();
        if (type > 0 && value > 0) {
            this._isOpen = true;
            this._createCommonIcon(type, value, limitLevel, limitRedLevel);
        } else {
            this._isOpen = false;
            this._imageLock.node.active = (true);
           // this._panelTouch.setEnabled(false);
            this._textOpenLevel.node.active = (false);
        }
    }
}