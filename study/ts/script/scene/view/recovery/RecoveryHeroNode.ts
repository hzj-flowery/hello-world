import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecoveryHeroNode extends RecoveryRebornNodeBase {

    @property({ type: CommonHeroAvatar, visible: true })
    _fileNodeHero: CommonHeroAvatar = null;

    @property({ visible: true })
    _isShowShadow: boolean = false;

    public init(index, onClickAdd, onClickDelete) {
        this._fileNode = this._fileNodeHero;
        this._fileNodeHero.init();
        super.init(index, onClickAdd, onClickDelete);
    }

    public updateInfo(heroId, limitLevel?) {
        this._fileNodeHero.showShadow(this._isShowShadow);
        heroId != null && this._fileNodeHero.updateUI(heroId, null, null, limitLevel);
        var param = heroId == null ? null : TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, null, null, limitLevel);
        this._updateUI(heroId, param);
    }

    public reset() {
        var heroNode = this._fileNodeHero.getNodeHero();
        heroNode.setPosition(0, 0);
        heroNode.setScale(1);
        heroNode.active = (true);
    }

    public playFlyEffect(taget, callback) {
        this._playFlyEffect2(this._fileNodeHero.getNodeHero(), callback);
    }
}