import SummaryLoseBase from "./SummaryLoseBase";
import { G_EffectGfxMgr, Colors } from "../../../init";
import ComponentSmallRank from "./ComponentSmallRank";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryMineLose extends SummaryLoseBase {

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
            var beforeArmy = changeData.myBeginArmy;
            var nowArmy = changeData.myEndArmy;
            if (nowArmy < 0) {
                nowArmy = 0;
            }
            var panelArmy = new cc.Node().addComponent(ComponentSmallRank);
            panelArmy.init(cc.v2(0, 0), Lang.get('fight_end_my_army'), beforeArmy, nowArmy);
            return panelArmy.createRankPanel();
        } else if (effect == 'fail_icon3') {
            var changeData = this._battleData.selfData;
            var beforeTarArmy = changeData.tarBeginArmy;
            var nowTarArmy = changeData.tarEndArmy;
            var beforeInfame = changeData.myBeginInfame;
            var nowInfame = changeData.myEndInfame;
            if (nowTarArmy < 0) {
                nowTarArmy = 0;
            }
            var panelArmy = new cc.Node().addComponent(ComponentSmallRank);
            panelArmy.init(cc.v2(0, 0), Lang.get('fight_end_army'), beforeTarArmy, nowTarArmy);
            var panel = panelArmy.createRankPanel();
            if (Math.abs(nowInfame - beforeInfame) != 0) {
                var panelTired =   new cc.Node().addComponent(ComponentSmallRank);
                panelTired.init(cc.v2(0, 0), Lang.get('fight_end_my_infame'), beforeInfame, nowInfame, null, '0');
                var panelInfame = panelTired.createRankPanel();
                panelInfame.y = (-50);
                panel.addChild(panelInfame);
            }
            return panel;
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