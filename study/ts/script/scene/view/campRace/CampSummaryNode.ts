import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
const { ccclass, property } = cc._decorator;
@ccclass
export default class CampSummaryNode extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRank: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRankOld: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRankNew: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodePoint: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textPointChange: cc.Label = null;


    showRank(old, neww) {
        this._nodeRank.active = (true);
        this._nodePoint.active = (false);
        this._textRankOld.string = (old);
        this._textRankNew.string = (neww);
        if (neww < old) {
            this._textRankNew.node.color = (Colors.getCampGreen());
        } else if (neww > old) {
            this._textRankNew.node.color = (Colors.getCampRed());
        }
        UIHelper.updateLabelSize(this._textRankOld);
        var size1 = this._textRankOld.node.getContentSize();
        var size2 = this._imageArrow.node.getContentSize();
        this._imageArrow.node.x = (size1.width + 10);
        this._textRankNew.node.x = (size1.width + size2.width);
    }
    showPoint(now, change) {
        this._nodeRank.active = (false);
        this._nodePoint.active = (true);
        this._textPoint.string = (now);
        if (change < 0) {
            this._textPointChange.string = ('\uFF08' + (change + '\uFF09'));
            this._textPointChange.node.color = (Colors.getCampRed());
        } else {
            this._textPointChange.string = ('\uFF08+' + (change + '\uFF09'));
            this._textPointChange.node.color = (Colors.getCampGreen());
        }
        UIHelper.updateLabelSize(this._textPoint);
        var size1 = this._textPoint.node.getContentSize();
        this._textPointChange.node.x = (size1.width);
    }
}