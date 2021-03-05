import RollNoticeHelper from "./RollNoticeHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";

export default class RollNoticeBaseNode extends cc.Component {
    _rollMsg: any;
    // _node: cc.Node;
    initData(rollMsg) {
        this._rollMsg = rollMsg;
        // this.setCascadeOpacityEnabled(true);
        var richTxt = RollNoticeHelper.makeRichMsgFromServerRollMsg(rollMsg, null);
        var richText = RichTextExtend.createWithContent(richTxt[0]);
        // richText.setCascadeOpacityEnabled(true);
        // richText.formatText();
        this.node.addChild(richText.node);
        var richTextSize = richText.node.getContentSize();
        this.node.setContentSize(richTextSize);
        richText.node.setPosition(richTextSize.width * 0.5,4);
    }
    run(containSize) {
        var conSize = this.node.getContentSize();
        var y = 0;
        var targetPos = cc.v2(0 - conSize.width - 50 - containSize.width * 0.5, y);
        var fromPos = cc.v2(containSize.width * 0.5 + 50, y);
        this.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this.node.setPosition(fromPos.x, fromPos.y);
        var duration = Math.abs(targetPos.x - fromPos.x) / 640 * 4;
        var moveAction = cc.moveTo(duration, targetPos);
        this.node.active = (true);

        var callFunc = cc.callFunc(handler(this, this.onFinish));
        this.node.runAction(cc.sequence(moveAction, callFunc));
    }

    onFinish(node) {
        G_SignalManager.dispatch(SignalConst.EVENT_SUBTITLES_RUN_END, this._rollMsg, node);
        this.node.removeFromParent();
    }
}