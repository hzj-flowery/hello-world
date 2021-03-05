import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";
import CommonTreasureAvatar from "../../../ui/component/CommonTreasureAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecoveryTreasureNode extends RecoveryRebornNodeBase {
    @property({ type: CommonTreasureAvatar, visible: true })
    _fileNodeTreasure: CommonTreasureAvatar = null;

    public init(index, onClickAdd, onClickDelete) {
        this._fileNode = this._fileNodeTreasure;
        super.init(index, onClickAdd, onClickDelete);
    }

    public updateInfo(treasureId) {
        treasureId != null && this._fileNodeTreasure.updateUI(treasureId);
        var param = treasureId == null ? null : TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureId);
        this._updateUI(treasureId, param);
    }

    public reset() {
        this._fileNodeTreasure.node.setPosition(this._initPos);
        this._fileNodeTreasure.node.setScale(this._initScale);
    }

    public playFlyEffect(target: cc.Node, callback) {
        let worldPos = target.convertToWorldSpaceAR(cc.v2(0, 0));
        let tarPos = this.node.convertToNodeSpaceAR(worldPos);
        this._playFlyEffect1(this._fileNodeTreasure.node, tarPos, callback);
    }
}