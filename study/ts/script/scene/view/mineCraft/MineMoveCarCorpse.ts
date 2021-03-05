import CommonGrainCarAvatar from "../../../ui/component/CommonGrainCarAvatar";
import ViewBase from "../../ViewBase";
import GrainCarCorpseName from "../grainCar/GrainCarCorpseName";
const { ccclass, property } = cc._decorator;
@ccclass
export default class MineMoveCarCorpse extends ViewBase {

    @property({
        type: GrainCarCorpseName,
        visible: true
    })
    _corpseName: GrainCarCorpseName = null;

    @property({
        type: CommonGrainCarAvatar,
        visible: true
    })
    _carAvatar: CommonGrainCarAvatar = null;
    
    onLoad() {
        this._carAvatar.onLoad();
    }
    onCreate() {

    }
    onEnter() {
        this._carAvatar.playDead();
    }
    onExit() {
    }
    updateUIWithLevel(level) {
        this._carAvatar.updateUI(level);
    }
    addName(carUnit) {
        this._corpseName.addName(carUnit);
    }
}