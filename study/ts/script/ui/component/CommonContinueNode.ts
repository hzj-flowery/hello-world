import { Lang } from "../../lang/Lang";
import { Colors } from "../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonContinueNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _continue_Image: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_continue_desc: cc.Label = null;

    start() {
        this._text_continue_desc.string = Lang.get('common_text_click_continue');
        var fadein = cc.fadeIn(0.5);
        var fadeout = cc.fadeOut(0.5);
        var seq = cc.sequence(fadein, fadeout);
        var repeatAction = cc.repeatForever(seq);
        this.node.runAction(repeatAction);
    }

    public setString(s) {
        this._text_continue_desc.string = s;
        this._text_continue_desc.node.color = Colors.CLICK_SCREEN_CONTINUE;
    }
}