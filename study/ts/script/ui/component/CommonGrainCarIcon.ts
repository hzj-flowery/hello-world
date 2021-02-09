import GrainCarConfigHelper from "../../scene/view/grainCar/GrainCarConfigHelper";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import CommonIconBase from "./CommonIconBase";
import CommonUI from "./CommonUI";


const { ccclass, property } = cc._decorator;


@ccclass
export default class CommonGrainCarIcon extends CommonIconBase{
    onLoad() {
        this._type = TypeConvertHelper.TYPE_HERO;
        super.onLoad();
    }
    
    updateUI(carUnit) {
        var config = GrainCarConfigHelper.getGrainCarConfig(carUnit.getLevel());
        this._imageIcon.node.addComponent(CommonUI).loadTexture(Path.getCommonIcon('hero', config.icon));
        var iconBg = Path.getUICommon('frame/img_frame_0' + carUnit.getConfig().color);
        this.loadColorBg(iconBg);
    }
}