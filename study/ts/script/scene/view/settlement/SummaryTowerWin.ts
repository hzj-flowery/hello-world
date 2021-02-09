import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentLine from "./ComponentLine";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import ComponentItemInfo from "./ComponentItemInfo";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryTowerWin extends SummaryBase {

    public init(battleData, callback) {
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;

        var midXPos = SummaryBase.NORMAL_FIX_X;

        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init("txt_sys_reward02", cc.v2(midXPos, 253 - height * 0.5));
        list.push(componentLine);

        var itemMoney = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD,
            size: 0
        };
        var itemIron = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_JADE,
            size: 0
        };
        for (let i in battleData.awards) {
            var v = battleData.awards[i];
            if (v.type == itemMoney.type && v.value == itemMoney.value) {
                itemMoney.size = itemMoney.size + v.size;
            } else if (v.type == itemIron.type && v.value == itemIron.value) {
                itemIron.size = itemIron.size + v.size;
            }
        }
        var componentItemInfo1 = new cc.Node("componentItemInfo1").addComponent(ComponentItemInfo);
        componentItemInfo1.init(itemMoney, cc.v2(midXPos, 185 - height * 0.5));
        list.push(componentItemInfo1);

        var componentItemInfo2 = new cc.Node("componentItemInfo2").addComponent(ComponentItemInfo);
        componentItemInfo2.init(itemIron, cc.v2(midXPos, 150 - height * 0.5));
        list.push(componentItemInfo2);

        for (let i in battleData.addAwards) {
            var v = battleData.addAwards[i];
            if (v.award.type == itemMoney.type && v.award.value == itemMoney.value) {
                componentItemInfo1.updateCrit(v.index, v.award.size);
            } else if (v.award.type == itemIron.type && v.award.value == itemIron.value) {
                componentItemInfo2.updateCrit(v.index, v.award.size);
            }
        }
        super.init(battleData, callback, list, midXPos, true);
    }
    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }
    public onExit() {
        super.onExit();
    }
    private _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_allwin_win', handler(this, this.playWinText), handler(this, this.checkStart), false);
    }
}