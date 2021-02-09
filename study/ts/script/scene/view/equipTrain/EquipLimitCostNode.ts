import HeroLimitCostNode from "../heroTrain/HeroLimitCostNode";
import { EquipTrainHelper } from "./EquipTrainHelper";
import { Path } from "../../../utils/Path";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class EquipLimitCostNode extends HeroLimitCostNode {

    changeImageName() {
        var resIds = EquipTrainHelper.getLimitUpCostNameResIds();
        UIHelper.loadTexture(this._imageName, Path.getTextLimit(resIds[this._costKey]));
    }
    _check() {
        this._isShowCount = true;
    }
    playSMoving() {
        var smoving = LimitCostConst.RES_NAME[this._costKey].smoving[1];
        if (this._costKey == LimitCostConst.LIMIT_COST_KEY_2) {
            smoving = 'smoving_tujiehuansanjiao';
        }
        let pos = this.node.getPosition();
        G_EffectGfxMgr.applySingleGfx(this.node, smoving,  ()=> {
            this.node.active = false;
            this.node.setPosition(pos);
        });
    }
    _calPercent(limitLevel, curCount) {
        var info = EquipTrainHelper.getLimitUpCostInfo();
        var size = info['size_' + this._costKey] || 0;
        var percent = Math.floor(curCount / size * 100);
        return [
            Math.min(percent, 100),
            size
        ];
    }
    
    initImageFront() {
    }

    setImageFront(id) {
        UIHelper.loadTexture(this._imageFront, Path.getLimitImg(id));
    }
    setPositionY(y) {
        this._initPos.y = y;
    }

    updateUI(limitLevel, curCount) {
        this.addMask();
        this._updateCommonUI(limitLevel, curCount);
    }
}
