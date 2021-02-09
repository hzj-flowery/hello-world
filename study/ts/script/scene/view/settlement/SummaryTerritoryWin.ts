import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentLine from "./ComponentLine";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import ComponentTwoItems from "./ComponentTwoItems";
import ComponentLevel from "./ComponentLevel";
import ComponentDrop from "./ComponentDrop";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryTerritoryWin extends SummaryBase {

    public init(battleData, callback) {
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;

        if (battleData.exp > 0) {
            var itemExp = {
                type: TypeConvertHelper.TYPE_RESOURCE,
                value: DataConst.RES_EXP,
                size: battleData.exp
            };
            var itemMoney = {
                type: TypeConvertHelper.TYPE_RESOURCE,
                value: DataConst.RES_GOLD,
                size: battleData.money
            };
            var items = [
                itemExp,
                itemMoney
            ];
            var componentTwoItems =new cc.Node("componentTwoItems").addComponent(ComponentTwoItems);
            componentTwoItems.init(items, battleData.addAwards, cc.v2(midXPos, 250 - height * 0.5), true);
            list.push(componentTwoItems);
            var componentLevel = new cc.Node("componentLevel").addComponent(ComponentLevel);
            componentLevel.init(battleData.exp, cc.v2(midXPos, 220 - height * 0.5));
            list.push(componentLevel);
        }
        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init('txt_sys_reward02', cc.v2(midXPos, 177 - height * 0.5));
        list.push(componentLine);
        var componentDrop = new cc.Node("componentDrop").addComponent(ComponentDrop);
        componentDrop.init(battleData.awards, cc.v2(midXPos, 107 - height * 0.5));
        list.push(componentDrop);

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