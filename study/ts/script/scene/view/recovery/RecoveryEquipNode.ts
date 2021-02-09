import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";
import CommonEquipAvatar from "../../../ui/component/CommonEquipAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecoveryEquipNode extends RecoveryRebornNodeBase {
    @property({ type: CommonEquipAvatar, visible: true })
    _fileNodeEquip: CommonEquipAvatar = null;

    public init(index, onClickAdd, onClickDelete) {
        this._fileNode = this._fileNodeEquip;
        super.init(index, onClickAdd, onClickDelete);
    }

    public updateInfo(equipId) {
        equipId != null && this._fileNodeEquip.updateUI(equipId);
        var param = equipId == null ? null : TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipId);
        this._updateUI(equipId, param);
    }

    public reset() {
        this._fileNodeEquip.node.setPosition(this._initPos);
        this._fileNodeEquip.node.setScale(this._initScale);
    }

    public playFlyEffect(target: cc.Node, callback) {
        let worldPos = target.convertToWorldSpaceAR(cc.v2(0, 0));
        let tarPos = this.node.convertToNodeSpaceAR(worldPos);
        this._playFlyEffect1(this._fileNodeEquip.node, tarPos, callback)
    }
}