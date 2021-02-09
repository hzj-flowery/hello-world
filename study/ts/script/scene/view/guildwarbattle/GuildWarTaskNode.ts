import ListViewCellBase from "../../../ui/ListViewCellBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarTaskNode extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTaskInfo: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;
    _data: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(data, index) {
        this._data = data;
        this._textTaskInfo.string = (data.des);
    }

}