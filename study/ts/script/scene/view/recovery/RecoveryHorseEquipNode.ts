import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";
import CommonHorseEquipAvatar from "../../../ui/component/CommonHorseEquipAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecoveryHorseEquipNode extends RecoveryRebornNodeBase {
    @property({ type: CommonHorseEquipAvatar, visible: true })
    _fileNodeEquip: CommonHorseEquipAvatar = null;

    public init(index, onClickAdd, onClickDelete) {
        this._fileNode = this._fileNodeEquip;
        super.init(index, onClickAdd, onClickDelete);
    }

    public updateInfo(equipId) {
        equipId != null && this._fileNodeEquip.updateUI(equipId);
        var param = equipId == null ? null : TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, equipId);
        this._updateUI(equipId, param);
    }

    public reset() {
        this._fileNodeEquip.node.setPosition(62.5, 105);
        this._fileNodeEquip.node.setScale(this._initScale);
    }

    public playFlyEffect(target: cc.Node, callback) {
        let worldPos = target.convertToWorldSpaceAR(cc.v2(0, 0));
        let tarPos = this.node.convertToNodeSpaceAR(worldPos);
        this._playFlyEffect1(this._fileNodeEquip.node, tarPos, callback);
    }
}