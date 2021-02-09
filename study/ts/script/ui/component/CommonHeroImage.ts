import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Path } from "../../utils/Path";
import CommonUI from "./CommonUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeroImage extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image: cc.Sprite = null;

    _init() {
        this._image.node.addComponent(cc.Layout).affectedByScale = false;
        this._image.node.setScale(0.8);
    }

    updateUI(heroBaseId) {
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        var resCfg = heroParam.res_cfg;
        if (resCfg) {
            var imgPath = Path.getChatRoleRes(resCfg.story_res);
            this._image.addComponent(CommonUI).loadTexture(imgPath);
            this._image.node.active = (true);
        } else {
            this._image.node.active = (false);
        }
    }

}