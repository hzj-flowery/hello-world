import SummaryBase from "./SummaryBase";
import { G_ResolutionManager, G_EffectGfxMgr } from "../../../init";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import ComponentTwoItems from "./ComponentTwoItems";
import ComponentLevel from "./ComponentLevel";
import ComponentLine from "./ComponentLine";
import ComponentDrop from "./ComponentDrop";
import { handler } from "../../../utils/handler";
import ComponentBase from "./ComponentBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SummaryFamousWin extends SummaryBase {

    private _battleData;

    public init(battleData, callback) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;
        
        var itemExp = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_EXP,
            size: this._battleData.exp
        };
        var itemMoney = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD,
            size: this._battleData.money
        };
        var items = [
            itemExp,
            itemMoney
        ];
        var componentTwoItems = new cc.Node("ComponentTwoItems").addComponent(ComponentTwoItems);
        componentTwoItems.init(items, this._battleData.addAwards, cc.v2(midXPos, 250 - height * 0.5));
        list.push(componentTwoItems);
        var componentLevel = new cc.Node("ComponentLevel").addComponent(ComponentLevel);
        componentLevel.init(this._battleData.exp, cc.v2(midXPos, 220 - height * 0.5));
        list.push(componentLevel);
        var componentLine = new cc.Node("ComponentLine").addComponent(ComponentLine)
        componentLine.init('txt_sys_reward01', cc.v2(midXPos, 177 - height * 0.5));
        list.push(componentLine);
        var componentDrop = new cc.Node("ComponentDrop").addComponent(ComponentDrop)
        componentDrop.init(this._battleData.awards, cc.v2(midXPos, 107 - height * 0.5), this._battleData.isDouble);
        list.push(componentDrop);
        super.init(battleData, callback, list, midXPos, true);
    }

    onEnter() {
        super.onEnter();
        this._createAnimation();
    }

    onExit() {
        super.onExit();
    }
    _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, "moving_allwin_win", handler(this, this.playWinText),
            handler(this, this.checkStart), false);
    }
}