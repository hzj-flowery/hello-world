import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";
import CommonHorseAvatar from "../../../ui/component/CommonHorseAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { HorseDataHelper } from "../../../utils/data/HorseDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecoveryHorseNode extends RecoveryRebornNodeBase {
    @property({ type: CommonHorseAvatar, visible: true })
    _fileNodeHorse: CommonHorseAvatar = null;

    public init(index, onClickAdd, onClickDelete) {
        this._fileNode = this._fileNodeHorse;
        super.init(index, onClickAdd, onClickDelete);
    }

    public updateInfo(horseId, star) {
        horseId != null && this._fileNodeHorse.updateUI(horseId);
        var param = horseId == null ? null : TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseId);
        param != null && (param.name = HorseDataHelper.getHorseName(horseId, star));
        this._updateUI(horseId, param);
    }

    public reset() {
        let horseNode = this._fileNodeHorse.getNodeHorse();
        horseNode.setPosition(0, 0);
        horseNode.setScale(1.0);
        horseNode.active = (true);
    }

    public playFlyEffect(target: cc.Node, callback) {
        this._playFlyEffect2(this._fileNodeHorse.getNodeHorse(), callback);
    }
}