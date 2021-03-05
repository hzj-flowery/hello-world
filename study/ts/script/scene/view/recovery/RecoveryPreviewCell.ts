const { ccclass, property } = cc._decorator;

import CommonIconNameNode from '../../../ui/component/CommonIconNameNode'

@ccclass
export default class RecoveryPreviewCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonIconNameNode,
        visible: true
    })
    _itemInfo: CommonIconNameNode = null;

    public updateUI(data) {
        if (data) {
            this._itemInfo.node.active = true;
            this._itemInfo.updateUI(data.type, data.value, data.size);
        }
        else {
            this._itemInfo.node.active = false;
        }
    }
}