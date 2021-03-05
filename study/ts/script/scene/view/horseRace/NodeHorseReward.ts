import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NodeHorseReward extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _textTitle: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textCount: cc.Label = null;
    @property({ type: cc.Sprite, visible: true })
    _imagePerfect: cc.Sprite = null;

    public updateUI(text, count, isPerfect)
    {
        this._textTitle.string = (text);
        this._textCount.string = (count);
        UIHelper.updateLabelSize(this._textCount);
        this._imagePerfect.node.active = (false);
        if (isPerfect) {
            this._imagePerfect.node.active =(true);
            this._imagePerfect.node.x = (this._textCount.node.x + this._textCount.node.getContentSize().width + 20);
        }
    }
}