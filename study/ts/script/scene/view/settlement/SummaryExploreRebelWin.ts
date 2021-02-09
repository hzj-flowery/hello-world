import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import { DataConst } from "../../../const/DataConst";
import ComponentItemInfo from "./ComponentItemInfo";
import ComponentBase from "./ComponentBase";
import ComponentLevel from "./ComponentLevel";
import ComponentLine from "./ComponentLine";
import ComponentDrop from "./ComponentDrop";
import { SignalConst } from "../../../const/SignalConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryExploreRebelWin extends SummaryBase {

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
        var componentItemInfo = new cc.Node("componentItemInfo").addComponent(ComponentItemInfo);
        componentItemInfo.init(itemExp, cc.v2(midXPos - 40, 240 - height * 0.5))
        list.push(componentItemInfo);
        var componentLevel = new cc.Node("componentLevel").addComponent(ComponentLevel);
        componentLevel.init(this._battleData.exp, cc.v2(midXPos, 220 - height * 0.5));
        list.push(componentLevel);
        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init('txt_sys_reward02', cc.v2(midXPos, 177 - height * 0.5));
        list.push(componentLine);
        var componentDrop = new cc.Node("componentDrop").addComponent(ComponentDrop);
        componentDrop.init(battleData.awards, cc.v2(midXPos, 107 - height * 0.5));
        list.push(componentDrop);
        super.init(this._battleData, callback, list, midXPos, true);
    }
    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }
    public onExit() {
        super.onExit();
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
    }
    private _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_allwin_win', handler(this, this.playWinText), handler(this, this.checkStart), false);
    }
}