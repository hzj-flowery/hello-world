import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentItemInfo from "./ComponentItemInfo";
import ComponentBase from "./ComponentBase";
import ComponentLine from "./ComponentLine";
import ComponentDamage from "./ComponentDamage";
import ComponentSmallRank from "./ComponentSmallRank";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryRebelEnd extends SummaryBase {

    private _battleData;
    public init(battleData, callback, attackHurt?) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];

        var height = G_ResolutionManager.getDesignHeight();

        let midXPos = 0;
        var componentDamage = new cc.Node("componentDamage").addComponent(ComponentDamage);
        componentDamage.init(attackHurt, cc.v2(midXPos, 265 - height * 0.5))
        list.push(componentDamage);

        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init("txt_sys_reward02", cc.v2(midXPos, 215 - height * 0.5));
        list.push(componentLine);

        var componentItemInfo = new cc.Node("componentItemInfo").addComponent(ComponentItemInfo);
        componentItemInfo.init(battleData.awards[0], cc.v2(midXPos, 150 - height * 0.5));
        list.push(componentItemInfo);
        for (let i in battleData.addAwards) {
            var v = battleData.addAwards[i];
            if (v.award.type == battleData.awards[0].type && v.award.value == battleData.awards[0].value) {
                componentItemInfo.updateCrit(v.index, v.award.size);
            }
        }

        var componentHeight = 30;
        var posY = 150 - componentHeight;
        if (battleData.oldGuildRank != battleData.newGuildRank) {
            var componentSmallRank = new cc.Node("componentSmallRank").addComponent(ComponentSmallRank);
            componentSmallRank.init(cc.v2(midXPos, posY - height * 0.5),
                Lang.get('guild_rank_up'), battleData.oldGuildRank, battleData.newGuildRank);
            list.push(componentSmallRank);
            posY = posY - componentHeight;
        }
        if (battleData.oldRank != battleData.newRank) {
            var componentSmallRank = new cc.Node("componentSmallRank").addComponent(ComponentSmallRank)
            componentSmallRank.init(cc.v2(midXPos, posY - height * 0.5),
                Lang.get('person_rank_up'), battleData.oldRank, battleData.newRank);
            list.push(componentSmallRank);
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