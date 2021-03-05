import CommonIconBase from "./CommonIconBase";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import PopupJadeDetail from "../../scene/view/equipmentJade/PopupJadeDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonJadeIcon extends CommonIconBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectDown: cc.Node = null;


    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectUp: cc.Node = null;

    _textItemTopNum = null;
    _equipId = null;
    _sysId = 0;
    _type = TypeConvertHelper.TYPE_JADE_STONE;
    _effect1 = null;
    _effect2 = null;

    private _isClick:boolean = true;

    constructor() {
        super();
        this._type = TypeConvertHelper.TYPE_JADE_STONE;
    }

    onLoad() {
        super.onLoad();
        this._nodeEffectDown = this._nodeEffectDown || this.node.getChildByName('NodeEffectDown');
        this._nodeEffectUp = this._nodeEffectUp || this.node.getChildByName('NodeEffectUp');
    }

    setSysId(sysId) {
        this._sysId = sysId;
    }

    updateUI(value, size?) {
        this._sysId = value;
        var itemParams = super.updateUI(value, size);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        this.showIconEffect();
    }

    public setTouchEnabled(st):void{
        this._isClick = st;
        super.setTouchEnabled(st);
    }

    _onTouchCallBack(sender, state) {

        if(!this._isClick)return;
        if (this._callback) {
            this._callback(this._target, this._itemParams);
        }
        else {
            PopupJadeDetail.getIns(PopupJadeDetail, (p: PopupJadeDetail) => {
                p.ctor(TypeConvertHelper.TYPE_JADE_STONE, this._itemParams.cfg.id);
                p.openWithAction();
            })
        }
    }
    setIconScale(scale) {
        this._imageIcon.node.setScale(scale);
    }
    removeLightEffect() {
    }
    showIconEffect(scale?) {
    }

}