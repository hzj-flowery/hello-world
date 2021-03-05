import ComponentBase from "./ComponentBase";
import { Lang } from "../../../lang/Lang";
import { Colors, G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentLine extends ComponentBase {

    private _textFile: string;

    public init(textFile, position) {
        this._textFile = Lang.get(textFile);
        this.node.setPosition(position);
        super.init();
    }
    public setStart() {
        super.setStart();
        this._playAnim();
    }

    private _createLabel(): cc.Node {
        var fontColor = Colors.getSummaryLineColor();
        var label = UIHelper.createWithTTF(this._textFile, Path.getFontW8(), 24);
        label.node.color = (fontColor);
        return label.node;
    }

    private _playAnim() {
        function effectFunction(effect) {
            if (effect == 'win_txt_diaoluo') {
                return this._createLabel();
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_diaoluojiangli', effectFunction.bind(this),
            handler(this, this.checkEnd), false);
    }
}