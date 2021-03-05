const { ccclass, property } = cc._decorator;

import ReplayVSNode from '../campRace/ReplayVSNode'
import SingleRaceReplayVSNode from './SingleRaceReplayVSNode';
import CommonListItem from '../../../ui/component/CommonListItem';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupSingleRaceReplayCell extends CommonListItem {
    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;
    @property({
        type: SingleRaceReplayVSNode,
        visible: true
    })
    _nodeVS: SingleRaceReplayVSNode = null;
    onCreate() {
        this.node.setContentSize(this._resourceNode.getContentSize());
        this._nodeVS.init(handler(this, this._onClick));
    }
    updateUI(itemId, data) {
        this._nodeVS.updateUI(data[0], data[1], data[2]);
    }
    _onClick(reportId) {
        this.dispatchCustomCallback(reportId);
    }
}