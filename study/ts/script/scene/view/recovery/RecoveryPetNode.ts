import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecoveryPetNode extends RecoveryRebornNodeBase {
    @property({ type: CommonHeroAvatar, visible: true })
    _fileNodePet: CommonHeroAvatar = null;

    @property({ visible: true })
    _isShowShadow: boolean = false;

    public init(index, onClickAdd, onClickDelete) {
        this._fileNode = this._fileNodePet;
        this._fileNodePet.init();
        this._fileNodePet.setConvertType(TypeConvertHelper.TYPE_PET);
        super.init(index, onClickAdd, onClickDelete);
    }

    public updateInfo(petId) {
        this._fileNodePet.showShadow(this._isShowShadow);
        this._fileNodePet.setScale(1.6);
        petId != null && this._fileNodePet.updateUI(petId, "_small");
        var param = petId == null ? null : TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, petId);
        this._updateUI(petId, param);
    }

    public reset() {
        var heroNode = this._fileNodePet.getNodeHero();
        heroNode.setPosition(0, 0);
        heroNode.setScale(1);
        heroNode.active = (true);
    }

    public playFlyEffect(taget, callback) {
        this._playFlyEffect2(this._fileNodePet.getNodeHero(), callback);
    }
}