const { ccclass, property } = cc._decorator;

import { Lang } from '../../lang/Lang';
import { UserDataHelper } from '../../utils/data/UserDataHelper';
import { handler } from '../../utils/handler';
import { Path } from '../../utils/Path';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import UIActionHelper from '../../utils/UIActionHelper';
import UIHelper from '../../utils/UIHelper';
import { UIPopupHelper } from '../../utils/UIPopupHelper';
import CommonItemIcon from './CommonItemIcon';

@ccclass
export default class CommonMaterialIcon extends cc.Component {


    private static SHIFT_SPEED = {
        1: [
            0.55,
            1
        ],
        2: [
            0.45,
            2
        ],
        3: [
            0.35,
            3
        ],
        4: [
            0.25,
            4
        ]
    };

    @property({
        type: CommonItemIcon,
        visible: true
    })
    _fileNodeIcon: CommonItemIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    _onClick = null;
    _onStepClick = null;
    _onStartCallback = null;
    _onStopCallback = null;
    _itemId = 0;
    _itemValue = 0;
    _count = 0;
    _isEmpty = true;
    _addSprite = null;
    _scheduleHandler;
    _costCount = 0;
    _costCountEveryTime = 1;
    _curShift = 1;
    _loopCount = 0;
    _isShift = false;
    _isDidClick = false;
    _type = TypeConvertHelper.TYPE_ITEM;

    onLoad():void{
       
    }

    setType(type) {
        if (type != this._type) {
            if (TypeConvertHelper.CLASS_NAME[this._type]) {
                var node = this._fileNodeIcon.node;
                node.removeComponent(TypeConvertHelper.CLASS_NAME[this._type]);
                this._type = type;
                this._fileNodeIcon = node.addComponent(TypeConvertHelper.CLASS_NAME[this._type]);
            }
        }
    }
    getType() {
        return this._type;
    }

    showNameBg(isShow) {
        if (this._imageNameBg) {
            this._imageNameBg.node.active = (isShow);
        }
    }
    updateUI(itemId, onClick, onStepClick) {
        this._itemId = itemId;
        this._onClick = onClick;
        this._onStepClick = onStepClick;
        this._fileNodeIcon.updateUI(itemId);
        this._fileNodeIcon.showCount(true);
        if (this._type == TypeConvertHelper.TYPE_ITEM) {
            var param = TypeConvertHelper.convert(this._type, itemId);
            this._itemValue = param.cfg.item_value;
            this._textValue.string = (Lang.get('material_exp_des', { value: this._itemValue }));
            this._textValue.node.color = (param.icon_color);
        }else if (this._type == TypeConvertHelper.TYPE_HERO) {
            var param = TypeConvertHelper.convert(this._type, itemId);
            this._textValue.node.color = (param.icon_color);
            if (param.cfg.color == 7) {
                UIHelper.enableOutline(this._textValue, param.icon_color_outline, 2);
            }
        }
    }
    setName(name) {
        this._textValue.string = (name);
    }
    setNameColor(color) {
        this._textValue.node.color = (color);
    }
    setCostCountEveryTime(count) {
        this._costCountEveryTime = count;
    }
    setIsShift(bool) {
        this._isShift = bool;
    }
    updateCount(count?) {
        if (count != undefined) {
            this._count = count;
        } else {
            this._count = UserDataHelper.getNumByTypeAndValue(this._type, this._itemId);
        }
        this.setCount(this._count);
    }
    setStartCallback(callback) {
        this._onStartCallback = callback;
    }
    setStopCallback(callback) {
        this._onStopCallback = callback;
    }
    // onClickIcon(sender, state) {
    //     if (this._isEmpty && this._costCount == 0) {
    //         // var itemParam = this._fileNodeIcon.getItemParams();
    //         // UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
    //         //     popupItemGuider.updateUI(itemParam.item_type, itemParam.cfg.id);
    //         //     popupItemGuider.setTitle(Lang.get('way_type_get'));
    //         // }.bind(this))
    //     } else {
    //         this._doClick();
    //     }
    // }
    getIsEmpty() {
        return this._isEmpty;
    }
    setCount(count) {
        this._fileNodeIcon.setCount(count);
        this._fileNodeIcon.showCount(count > 0);
        this._isEmpty = count <= 0;
        this._fileNodeIcon.setIconMask(this._isEmpty);
        if (this._isEmpty) {
            if (this._addSprite == null) {
                this._addSprite = UIHelper.newSprite(Path.getUICommon('img_com_btn_add01'));
                this._fileNodeIcon.node.addChild(this._addSprite.node);
                UIActionHelper.playBlinkEffect(this._addSprite.node);
            }
        } else {
            if (this._addSprite) {
                this._addSprite.node.destroy();
                this._addSprite = null;
            }
        }
    }
    getCount() {
        return this._count;
    }
    getItemId() {
        return this._itemId;
    }
    getItemValue() {
        return this._itemValue;
    }
    _doClick() {
        if (this._onClick) {
            var count = this._costCount == 0 && this._costCountEveryTime || this._costCount;
            var item = {
                id: this._itemId,
                num: Math.min(count, this._count)
            };
            var materials = [item];
            this._onClick(materials);
        }
    }
    _startSchedule() {
        if (this._onStartCallback) {
            this._onStartCallback(this._itemId, this._count);
        }
        if (this._scheduleHandler) {
            this.unschedule(this._scheduleHandler);
            this._scheduleHandler = null;
        }
        this._loopCount = 0;
        this._curShift = 1;

        this._scheduleHandler = handler(this,this._stepSchedule)
        this.schedule(this._scheduleHandler, CommonMaterialIcon.SHIFT_SPEED[1][0]);
    }

    _scheduleFunc() {
        this._stepSchedule();
    }

    _stopSchedule() {
        if (this._onStopCallback) {
            this._onStopCallback();
        }
        if (this._scheduleHandler) {
            this.unschedule(this._scheduleHandler);
        }
        this._scheduleHandler = null;
    }
    _stepSchedule() {
        if (this._onStepClick) {
            var [cotinue,realCostCount,isDo] = this._onStepClick(this._itemId, this._itemValue, this._costCountEveryTime);
            if (cotinue) {
                var costCountEveryTime = this._costCountEveryTime;
                if (realCostCount) {
                    costCountEveryTime = realCostCount;
                }
                this._costCount = this._costCount + costCountEveryTime;
                if (this._isShift) {
                    this._checkShift();
                }
            } else {
                this._stopSchedule();
                if (isDo) {
                    this._doClick();
                    this._isDidClick = true;
                }
            }
        }
    }
    _checkShift() {
        if (this._curShift >= 4) {
            return;
        }
        this._loopCount = this._loopCount + 1;
        var needCount = CommonMaterialIcon.SHIFT_SPEED[this._curShift][1];
        if (this._loopCount >= needCount) {
            this._curShift = this._curShift + 1;
            this._shiftSchedule();
        }
    }
    _shiftSchedule() {
        if (this._scheduleHandler) {
            this.unschedule(this._scheduleHandler);
            this._scheduleHandler = null;
        }
        this._loopCount = 0;
        this._scheduleHandler = handler(this,this._stepSchedule)
        this.schedule(this._scheduleHandler, CommonMaterialIcon.SHIFT_SPEED[this._curShift][0]);
    }


   constructor(){
       super();

       this._onClick = null;
       this._onStepClick = null;
       this._onStartCallback = null;
       this._onStopCallback = null;
       this._itemId = 0;
       this._itemValue = 0;
       this._count = 0;
       this._isEmpty = true;
       this._addSprite = null;
       this._scheduleHandler = null;
       this._costCount = 0;
       this._costCountEveryTime = 1;
       this._curShift = 1;
       this._loopCount = 0;
       this._isShift = false;
       this._isDidClick = false;
       this._type = TypeConvertHelper.TYPE_ITEM;
   }

   _init() {
    //this._panelTouch.setTouchEnabled(true);
    this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onClickIconEnded,this);
    this._panelTouch.on(cc.Node.EventType.TOUCH_CANCEL,this._onClickIconEnded,this);
    this._panelTouch.on(cc.Node.EventType.TOUCH_START,this._onClickIconBegan,this);
    
}

onDisable(){
    this._panelTouch.off(cc.Node.EventType.TOUCH_END,this._onClickIconEnded,this);
    this._panelTouch.off(cc.Node.EventType.TOUCH_CANCEL,this._onClickIconEnded,this);
    this._panelTouch.off(cc.Node.EventType.TOUCH_START,this._onClickIconBegan,this);
}



onEnable():void{
    this._init();
}
_onClickIconEnded(sender:cc.Touch):void{
    this._stopSchedule();
    if (this._isDidClick == false) {
        if (this._isEmpty && this._costCount == 0) {
            var itemParam = this._fileNodeIcon.getItemParams();
            UIPopupHelper.popupItemGuiderByType(itemParam.item_type, itemParam.cfg.id)  
        } else {
            this._doClick();
        }
    }
}
_onClickIconBegan(sender) {
    this._costCount = 0;
    this._isDidClick = false;
    if (!this._isEmpty) {
        this._startSchedule();
    }
    return true;
}









}