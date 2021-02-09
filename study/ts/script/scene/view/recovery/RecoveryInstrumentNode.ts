import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";
import CommonInstrumentAvatar from "../../../ui/component/CommonInstrumentAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecoveryInstrumentNode extends RecoveryRebornNodeBase {
    @property({ type: CommonInstrumentAvatar, visible: true })
    _fileNodeInstrument: CommonInstrumentAvatar = null;

    public init(index, onClickAdd, onClickDelete) {
        this._fileNode = this._fileNodeInstrument;
        super.init(index, onClickAdd, onClickDelete);
    }
    public updateInfo(instrumentId, limitLevel) {
        instrumentId != null && this._fileNodeInstrument.updateUI(instrumentId, limitLevel);
        var param = instrumentId == null ? null : TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId, null, null, limitLevel);
        this._updateUI(instrumentId, param);
    }

    public reset() {
        this._fileNodeInstrument.node.setPosition(this._initPos);
        this._fileNodeInstrument.node.setScale(this._initScale);
    }

    public playFlyEffect(target: cc.Node, callback) {
        let worldPos = target.convertToWorldSpaceAR(cc.v2(0, 0));
        let tarPos = this.node.convertToNodeSpaceAR(worldPos);
        this._playFlyEffect1(this._fileNodeInstrument.node, tarPos, callback);
    }
}