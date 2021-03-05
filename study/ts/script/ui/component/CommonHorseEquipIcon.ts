import { G_SceneManager } from "../../init";
import PopupHorseEquipDetail from "../../scene/view/horseEquipDetail/PopupHorseEquipDetail";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import CommonIconBase from "./CommonIconBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHorseEquipIcon extends CommonIconBase {

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

    private _effect1: cc.Node;
    private _effect2: cc.Node;

    onLoad() {
        this._type = TypeConvertHelper.TYPE_HORSE_EQUIP;
        this._effect1 = null;
        this._effect2 = null;

        this._nodeEffectDown = this._nodeEffectDown || this.node.getChildByName('NodeEffectDown');
        this._nodeEffectUp = this._nodeEffectUp || this.node.getChildByName('NodeEffectUp');

        super.onLoad();
    }


    public updateUI(value, size?) {
        var itemParams = super.updateUI(value, size);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        this.showIconEffect();
        return itemParams;
    }

    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            G_SceneManager.openPopup(Path.getPrefab("PopupHorseEquipDetail","horseEquipDetail"),(popup:PopupHorseEquipDetail)=>{
                popup.init(TypeConvertHelper.TYPE_HORSE_EQUIP, this._itemParams.cfg.id);
                popup.openWithAction();
            });
        }
    }

    public removeLightEffect() {
        if (this._effect1) {
            this._effect1.runAction(cc.destroySelf());
            this._effect1 = null;
        }
        if (this._effect2) {
            this._effect2.runAction(cc.destroySelf());
            this._effect2 = null;
        }
    }

    public showIconEffect(scale?) {
        this.removeLightEffect();
    }
}