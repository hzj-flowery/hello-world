import HeroLimitCostNode from "../heroTrain/HeroLimitCostNode";
import { Path } from "../../../utils/Path";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { PetTrainHelper } from "../petTrain/PetTrainHelper";
import CommonUI from "../../../ui/component/CommonUI";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PetLimitCostNode extends HeroLimitCostNode {

    _check() {
        if (this._costKey == LimitCostConst.LIMIT_COST_KEY_3 || this._costKey == LimitCostConst.LIMIT_COST_KEY_4) {
            this._isShowCount = true;
        } else {
            this._isShowCount = false;
        }
    }
    _calPercent(limitLevel, curCount) {
        var costInfo = PetTrainHelper.getCurLimitCostInfo();
        var size = costInfo['size_' + this._costKey];
        var percent = Math.floor(curCount / size * 100);
        return [
            Math.min(percent, 100),
            size
        ];
    }

    changeImageName() {
        this._imageName.node.addComponent(CommonUI).loadTexture(Path.getTextLimit(LimitCostConst.RES_NAME[this._costKey].imageName + (this._costKey <= 2 ? 'e' : 'b')));
    }

    initImageFront() {
        this._initImageFront("img_limit_shenshou01" + this._costKey, LimitCostConst.RES_NAME[this._costKey].imageFront[this._index - 1]);
        this._imageButtom.node.setContentSize(86, 86);
        this._imageButtom.node.setPosition(0, 0);
    }
}
