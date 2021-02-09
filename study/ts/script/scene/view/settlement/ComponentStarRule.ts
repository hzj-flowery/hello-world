import ComponentBase from "./ComponentBase";
import { Colors, G_EffectGfxMgr } from "../../../init";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentStarRule extends ComponentBase {

    private _star: number;

    public init(star, position) {
        this._star = star;
        this.node.setPosition(position);
        super.init();
    }

    public setStart() {
        super.setStart();
        this._playAnim();
    }

    private _createFontLabel(): cc.Node {
        var fontColor = Colors.getSummaryStarColor();
        var str = Lang.get('settlement_star_rule')[this._star - 1];
        var label = UIHelper.createWithTTF(str, Path.getCommonFont(), 20);
        label.node.color = (fontColor);
        return label.node;
    }
    private _playAnim() {
        function effectFunction(effect) {
            if (effect == 'pingjia') {
                var label = this._createFontLabel();
                return label;
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_pingjia', effectFunction.bind(this),
            handler(this, this.checkEnd), false);
    }
}