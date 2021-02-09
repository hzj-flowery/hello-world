import { G_EffectGfxMgr } from "../../init";
import PopupPetDetail from "../../scene/view/pet/PopupPetDetail";
import { PetDataHelper } from "../../utils/data/PetDataHelper";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import PopupBase from "../PopupBase";
import CommonIconBase from "./CommonIconBase";
import CommonStar from "./CommonStar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonPetIcon extends CommonIconBase {

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

    _starRoot: cc.Node;

    private _petId;
    private _effect1: cc.Node;
    private _effect2: cc.Node;

    onLoad() {
        this._type = TypeConvertHelper.TYPE_PET;

        this._nodeEffectDown = this._nodeEffectDown || this.node.getChildByName('NodeEffectDown');
        this._nodeEffectUp = this._nodeEffectUp || this.node.getChildByName('NodeEffectUp');
        this._starRoot = this._starRoot || this.node.getChildByName('starRoot');
        if (this._starRoot) {
            this._starRoot.addComponent(CommonStar);
        }
        super.onLoad();
    }


    public updateUI(value, size) {
        var itemParams = super.updateUI(value, size);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        this.showIconEffect();
    }

    showPetIconInitialStars() {
        var initial_star = this._itemParams.cfg.initial_star
        if (initial_star > 0) {
            this._starRoot.getComponent(CommonStar).setCountAdv(initial_star)
        }
    }

    public setType(type) {
        this._type = type;
    }

    public setId(avatarId) {
        this._petId = avatarId;
    }

    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            PopupBase.loadCommonPrefab('PopupPetDetail', (popup: PopupPetDetail) => {
                popup.ctor(TypeConvertHelper.TYPE_PET, this._itemParams.cfg.id);
                popup.openWithAction();
            });
        }
    }

    public removeLightEffect() {
        if (this._effect1) {
            this._effect1.destroy();
            // this._effect1.runAction(cc.destroySelf());
            this._effect1 = null;
        }
        if (this._effect2) {
            this._effect2.destroy();
            // this._effect2.runAction(cc.destroySelf());
            this._effect2 = null;
        }
    }

    public showIconEffect(scale?) {
        this.removeLightEffect();
        if (this._itemParams == null) {
            return;
        }
        var baseId = this._itemParams.cfg.id;
        var effects: string[] = PetDataHelper.getPetEffectWithBaseId(baseId);
        if (effects == null) {
            return;
        }
        if (effects.length == 1) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName).node;
        }
        if (effects.length == 2) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectDown, effectName).node;
            var effectName2 = effects[1];
            this._effect2 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName2).node;
        }
    }
}