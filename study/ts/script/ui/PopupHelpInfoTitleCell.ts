import { Util } from "../utils/Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupHelpInfoTitleCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;

    updateUI(msg) {
        var resourceNodeSize = this._resourceNode.getContentSize();
        this._text.node.width = 616;
        this._text.string = (msg);
        Util.updatelabelRenderData(this._text);
        var size = this._text.node.getContentSize();
        this.node.setContentSize(resourceNodeSize.width, size.height);
        this._resourceNode.y = size.height - resourceNodeSize.height;
    }

}