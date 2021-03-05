import SummaryLoseBase from "./SummaryLoseBase";
import { G_EffectGfxMgr, Colors } from "../../../init";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryGeneralLose extends SummaryLoseBase {

    public init(battleData, callback) {
        super.init(battleData, callback);
    }

    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }

    public onExit() {
        super.onExit();
    }

    private _createActionNode(effect): cc.Node {
        if (effect == 'fail_txt_tishengzhanli') {
            return this._createText();
        } else if (effect == 'fail_icon1') {
            return this._createLoseNode(1);
        } else if (effect == 'fail_icon2') {
            return this._createLoseNode(2);
        } else if (effect == 'fail_icon3') {
            return this._createLoseNode(3);
        } else if (effect == 'fail_icon4') {
            return this._createLoseNode(4);
        } else if (effect == 'shibai') {
            return this._createLosePic();
        }
    }

    private _createAnimation() {
        function effectFunction(effect: string) {
            return this._createActionNode(effect);
        }
        function eventFunction(event) {
            if (event == 'finish') {
                this._createContinueNode();
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_allfail', effectFunction.bind(this), eventFunction.bind(this), false);
    }
}