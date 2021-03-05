import SummaryLoseBase from "./SummaryLoseBase";
import { G_EffectGfxMgr, Colors } from "../../../init";
import ComponentSmallRank from "./ComponentSmallRank";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryGuildWarLose extends SummaryLoseBase {

    private _battleData;
    public init(battleData, callback) {
        super.init(battleData, callback);
        this._battleData = battleData;
    }

    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }

    public onExit() {
        super.onExit();
    }

    private _createActionNode(effect): cc.Node {
        if (effect == 'shibai') {
            return this._createLosePic();
        } else if (effect == 'fail_icon1') {
            var changeData = this._battleData.selfData;
            var beforeVit = changeData.myBeginVit;
            var nowVit = changeData.myEndVit;
            if (nowVit < 0) {
                nowVit = 0;
            }
            var panelVit = new cc.Node().addComponent(ComponentSmallRank);
            panelVit.init(cc.v2(0, 0), Lang.get('fight_end_my_vit'), beforeVit, nowVit);
            return panelVit.createRankPanel();
        } else if (effect == 'fail_icon3') {
            var changeData = this._battleData.selfData;
            var beforeTarVit = changeData.tarBeginVit;
            var nowTarVit = changeData.tarEndVit;
            if (nowTarVit < 0) {
                nowTarVit = 0;
            }
            var panelVit = new cc.Node().addComponent(ComponentSmallRank);
            panelVit.init(cc.v2(0, 0), Lang.get('fight_end_vit'), beforeTarVit, nowTarVit);
            return panelVit.createRankPanel();
        } else if (effect == 'fail_txt_tishengzhanli') {
            return this._createText('fight_mine_end');
        }
    }

    private _createAnimation() {
        function effectFunction(effect) {
            return this._createActionNode(effect);
        }
        function eventFunction(event) {
            if (event == 'finish') {
                this._createContinueNode();
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_kuangfail', effectFunction.bind(this), eventFunction.bind(this), false);
    }
}