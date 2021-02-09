import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { handler } from "../../../utils/handler";
import { DataConst } from "../../../const/DataConst";
import ComponentItemInfo from "./ComponentItemInfo";
import ComponentBase from "./ComponentBase";
import ComponentLevel from "./ComponentLevel";
import ComponentLine from "./ComponentLine";
import ComponentDrop from "./ComponentDrop";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryExploreBoss extends SummaryBase {

    private _battleData;
    public init(battleData, callback) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];
        var height = G_ResolutionManager.getDesignHeight();
        var itemExp = {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_EXP,
            size: this._battleData.exp
        };
        var componentItemInfo = new cc.Node("componentItemInfo").addComponent(ComponentItemInfo);
        componentItemInfo.init(itemExp, cc.v2(0, 250 - height * 0.5))
        list.push(componentItemInfo);
        var componentLevel = new cc.Node("componentLevel").addComponent(ComponentLevel);
        componentLevel.init(this._battleData.exp, cc.v2(0, 230 - height * 0.5));
        list.push(componentLevel);
        if (battleData.awards.length != 0) {
            var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
            componentLine.init('txt_sys_reward02', cc.v2(0, 180 - height * 0.5));
            list.push(componentLine);
            var componentDrop = new cc.Node("componentDrop").addComponent(ComponentDrop);
            componentDrop.init(battleData.awards, cc.v2(0, 100 - height * 0.5));
            list.push(componentDrop);
        }
        super.init(this._battleData, callback, list);
    }
    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }
    public onExit() {
        super.onExit();
    }
    private _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_battleend', null, handler(this, this.checkStart), false);
    }
}