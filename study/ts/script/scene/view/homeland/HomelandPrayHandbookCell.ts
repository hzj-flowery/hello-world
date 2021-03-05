const { ccclass, property } = cc._decorator;

import HomelandPrayHandbookNode from './HomelandPrayHandbookNode'
import CommonListItem from '../../../ui/component/CommonListItem';
import ListViewCellBase from '../../../ui/ListViewCellBase';

@ccclass
export default class HomelandPrayHandbookCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: HomelandPrayHandbookNode,
        visible: true
    })
    _node1: HomelandPrayHandbookNode = null;

    @property({
        type: HomelandPrayHandbookNode,
        visible: true
    })
    _node2: HomelandPrayHandbookNode = null;

    @property({
        type: HomelandPrayHandbookNode,
        visible: true
    })
    _node3: HomelandPrayHandbookNode = null;

    @property({
        type: HomelandPrayHandbookNode,
        visible: true
    })
    _node4: HomelandPrayHandbookNode = null;

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(datas) {
        this.updateCell(datas[0], 1);
        this.updateCell(datas[1], 2);
        this.updateCell(datas[2], 3);
        this.updateCell(datas[3], 4);
    }

    updateCell(data, index) {
        if (data) {
            this['_node' + index].node.active = (true);
            this['_node' + index].updateUI(data);
        } else {
            this['_node' + index].node.active = (false);
        }
    }
}