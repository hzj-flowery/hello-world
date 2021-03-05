import { CakeActivityConst } from "../../../const/CakeActivityConst";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { G_Prompt, G_SceneManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { Util } from "../../../utils/Util";
import PopupCakeGet from "./PopupCakeGet";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeMaterialNode extends cc.Component {
    public static readonly SHIFT_SPEED = {
        [1]: [
            0.4,
            5,
            1
        ],
        [2]: [
            0.34,
            3,
            5
        ],
        [3]: [
            0.27,
            3,
            10
        ],
        [4]: [
            0.2,
            4,
            50
        ]
    };
    public static readonly COLORINFO = {
        [1]: {
            bgRes: 'img_anniversary_frame_03',
            countRes: 'img_anniversary_frame_03b'
        },
        [2]: {
            bgRes: 'img_anniversary_frame_04',
            countRes: 'img_anniversary_frame_04b'
        },
        [3]: {
            bgRes: 'img_anniversary_frame_05',
            countRes: 'img_anniversary_frame_05b'
        }
    };

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDark: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAdd: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCount: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    _target: cc.Node;
    _itemId: any;
    _onClick: any;
    _onStepClick: any;
    _onStartCallback: any;
    _onStopCallback: any;
    _itemValue: any;
    _count: number;
    _isEmpty: boolean;
    _addSprite: any;
    _costCount: number;
    _costCountEveryTime: number;
    _curShift: number;
    _loopCount: number;
    _isShift: boolean;
    _isDidClick: boolean;

    initData(type, onClick, onStepClick) {
        [this._itemId] = CakeActivityDataHelper.getMaterialItemId(type);
        this._onClick = onClick;
        this._onStepClick = onStepClick;
        this._onStartCallback = null;
        this._onStopCallback = null;
        this._itemValue = CakeActivityDataHelper.getMaterialValue(type);
        this._count = 0;
        this._isEmpty = true;
        this._addSprite = null;
        this._costCount = 0;
        this._costCountEveryTime = 1;
        this._curShift = 1;
        this._loopCount = 0;
        this._isShift = true;
        this._isDidClick = false;
        this._initUI();
        this._initColorAndIcon(type);
    }
    _initUI() {
        this._imageIcon.sizeMode = cc.Sprite.SizeMode.RAW;
        // this._imageIcon.addTouchEventListener(handler(this, this._onClickIcon));
        this._imageIcon.node.on(cc.Node.EventType.TOUCH_END, this._onClickIconEnded, this);
        this._imageIcon.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onClickIconEnded, this);
        this._imageIcon.node.on(cc.Node.EventType.TOUCH_START, this._onClickIconBegan, this);
    }
    _initColorAndIcon(type) {
        var info = CakeMaterialNode.COLORINFO[type];
        UIHelper.loadTexture(this._imageBg, Path.getAnniversaryImg(info.bgRes))
        UIHelper.loadTexture(this._imageCount, Path.getAnniversaryImg(info.countRes))
        var icon = CakeActivityDataHelper.getMaterialIconWithId(this._itemId);
        UIHelper.loadTexture(this._imageIcon, icon)
    }
    updateCount() {
        this._count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, this._itemId);
        this.setCount(this._count);
        return this._count;
    }
    setCount(count) {
        this._textCount.string = (count);
        this._isEmpty = count <= 0;
        this._imageDark.node.active = (count == 0);
        this._imageAdd.node.active = (count == 0);
    }
    setStartCallback(callback) {
        this._onStartCallback = callback;
    }
    setStopCallback(callback) {
        this._onStopCallback = callback;
    }

    _onClickIconBegan() {
        this._costCount = 0;
        this._isDidClick = false;
        if (!this._isEmpty) {
            this._startSchedule();
        }
    }

    _onClickIconEnded() {
        this._stopSchedule();
        if (this._isDidClick == false) {
            if (this._isEmpty && this._costCount == 0) {
                if (this._itemId == CakeActivityDataHelper.getMaterialItemId(CakeActivityConst.MATERIAL_TYPE_1)[0]) {
                    G_SceneManager.openPopup("prefab/cakeActivity/PopupCakeGet",(popup:PopupCakeGet)=>{
                        popup.initData(CakeActivityConst.MATERIAL_TYPE_1-1);
                        popup.openWithAction();
                    })
                } else if (this._itemId == CakeActivityDataHelper.getMaterialItemId(CakeActivityConst.MATERIAL_TYPE_2)[0]) {
                    G_SceneManager.openPopup("prefab/cakeActivity/PopupCakeGet",(popup:PopupCakeGet)=>{
                        popup.initData(CakeActivityConst.MATERIAL_TYPE_2-1);
                        popup.openWithAction();
                    })
                } else if (this._itemId == CakeActivityDataHelper.getMaterialItemId(CakeActivityConst.MATERIAL_TYPE_3)[0]) {
                    var name = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, this._itemId).name;
                    // G_Prompt.showTip(Lang.get('cake_activity_fruit_get_tip', { name: name }));
                    //敬请期待
                    G_Prompt.showTip(Lang.get('chat_voice_will_come'));
                }
            } else {
                this._doClick();
            }

        }
    }
    onClickIcon(sender, state) {
        // if (state == ccui.TouchEventType.began) {
        //     this._costCount = 0;
        //     this._isDidClick = false;
        //     if (!this._isEmpty) {
        //         this._startSchedule();
        //     }
        //     return true;
        // } else if (state == ccui.TouchEventType.moved) {
        // } else if (state == ccui.TouchEventType.ended || state == ccui.TouchEventType.canceled) {
        //     this._stopSchedule();
        //     if (this._isDidClick == false) {
        //         if (this._isEmpty && this._costCount == 0) {
        //             if (this._itemId == CakeActivityConst.MATERIAL_ITEM_ID_1) {
        //                 var popup = new (require('PopupCakeGet'))(CakeActivityConst.MATERIAL_TYPE_1);
        //                 popup.openWithAction();
        //             } else if (this._itemId == CakeActivityConst.MATERIAL_ITEM_ID_2) {
        //                 var popup = new (require('PopupCakeGet'))(CakeActivityConst.MATERIAL_TYPE_2);
        //                 popup.openWithAction();
        //             } else if (this._itemId == CakeActivityConst.MATERIAL_ITEM_ID_3) {
        //                 G_Prompt.showTip(Lang.get('cake_activity_fruit_get_tip'));
        //             }
        //         } else {
        //             this._doClick();
        //         }
        //     }
        // }
    }
    _doClick() {
        if (this._onStepClick) {
            this._onStepClick(this._itemId, this._itemValue, this._costCountEveryTime);
        }
    }
    _startSchedule() {
        if (this._onStartCallback) {
            this._onStartCallback(this._itemId, this._count);
        }
        this.unschedule(this._stepSchedule);
        this._loopCount = 0;
        this._curShift = 1;
        this._costCountEveryTime = 1;
        this.schedule(this._stepSchedule, CakeMaterialNode.SHIFT_SPEED[1][0]);
    }
    _stopSchedule() {
        if (this._onStopCallback) {
            this._onStopCallback();
        }
        this.unschedule(this._stepSchedule);
    }
    _stepSchedule() {
        if (this._onStepClick) {
            var res = this._onStepClick(this._itemId, this._itemValue, this._costCountEveryTime);
            var continu = res[0] as boolean;
            var realCostCount = res[1];
            var isDo = res[2];
            if (continu) {
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
        var needCount = CakeMaterialNode.SHIFT_SPEED[this._curShift][1];
        if (this._loopCount >= needCount) {
            this._curShift = this._curShift + 1;
            this._shiftSchedule();
        }
    }
    _shiftSchedule() {
        this.unschedule(this._stepSchedule);
        this._loopCount = 0;
        this._costCountEveryTime = CakeMaterialNode.SHIFT_SPEED[this._curShift][2];
        this.schedule(this._stepSchedule, CakeMaterialNode.SHIFT_SPEED[this._curShift][0]);
    }
}