import SummaryLoseBase from "./SummaryLoseBase";
import { G_EffectGfxMgr, Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryLose extends SummaryLoseBase {

    private _battleData;

    public init(battleData, callback) {
        this._battleData = battleData;
        super.init(battleData, callback);
        this.setNotCreateShade(true);
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
            var text = Lang.get('txt_sys_promote01');
            var fontColor = Colors.getSummaryLineColor();
            var label = UIHelper.createWithTTF(text, Path.getFontW8(), 24);
            label.node.color = (fontColor);
            return label.node;
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
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_fail_1', effectFunction.bind(this), eventFunction.bind(this), false);
    }
}