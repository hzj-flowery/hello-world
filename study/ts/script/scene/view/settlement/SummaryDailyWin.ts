import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager} from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentLine from "./ComponentLine";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import ComponentItemInfo from "./ComponentItemInfo";
import { DropHelper } from "../../../utils/DropHelper";
import ComponentDrop from "./ComponentDrop";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryDailyWin extends SummaryBase {

    public init(battleData, callback) {
        var reward = DropHelper.merageAwardList(battleData.awards);
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;
        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init('txt_sys_reward02', cc.v2(midXPos, 253 - height * 0.5));
        list.push(componentLine);
        if (reward.length == 1 && reward[0].type == TypeConvertHelper.TYPE_RESOURCE) {
            var componentItemInfo = new cc.Node("componentItemInfo").addComponent(ComponentItemInfo);
            componentItemInfo.init(reward[0], cc.v2(midXPos, 170 - height * 0.5));
            list.push(componentItemInfo);
        } else {
            var componentDrop = new cc.Node("componentDrop").addComponent(ComponentDrop);
            componentDrop.init(reward, cc.v2(midXPos, 183 - height * 0.5));
            list.push(componentDrop);
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