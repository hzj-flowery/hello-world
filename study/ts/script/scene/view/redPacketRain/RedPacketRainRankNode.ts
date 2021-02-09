const { ccclass, property } = cc._decorator;

import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import CommonListView from '../../../ui/component/CommonListView';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import { handler } from '../../../utils/handler';
import RedPacketRainRankCell from './RedPacketRainRankCell';
import ViewBase from '../../ViewBase';
import ListViewCellBase from '../../../ui/ListViewCellBase';

@ccclass
export default class RedPacketRainRankNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _nodeBg: CommonNormalMidPop = null;
    _callback: any;
    _listInfo: any[];
    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;
    _myCell: cc.Node;
    @property({
        type: cc.Prefab
    }) redPacketRainRankCell: cc.Prefab = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMyInfo: cc.Node = null;

    ctor(callback) {
        this._callback = callback;
    }
    onCreate() {
        this._listInfo = [];
        this._nodeBg.addCloseEventListener(handler(this, this._onCloseClick));
        this._nodeBg.setTitle(Lang.get('red_packet_rain_rank_title'));
        this._listView.setTemplate(this.redPacketRainRankCell);
        this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listView.setCustomCallback(handler(this, this._onItemTouch));
        this._myCell = cc.instantiate(this.redPacketRainRankCell)
        this._nodeMyInfo.addChild(this._myCell);
        this._myCell.setPosition(cc.v2(0, 0))
        this._nodeBg.node.active = (false);
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(listInfo, myInfo) {
        this._nodeBg.node.active = (true);
        this._listInfo = listInfo;
        this._listView.clearAll();
        this._listView.resize(this._listInfo.length);
        this._updateMyInfo(myInfo);
    }
    _updateList() {
    }
    _onItemUpdate(item, index) {
        var index = index;
        var data = this._listInfo[index];
        if (data) {
            item.updateData(data, index);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
    }
    _updateMyInfo(myInfo) {
        var rank = 0;
        var myUserId = G_UserData.getBase().getId();
        for (let i = 0; i < this._listInfo.length; i++) {
            const info = this._listInfo[i];
            if (info.getUser_id() == myUserId) {
                rank = i;
                break;
            }
        }
        this._myCell.getComponent(RedPacketRainRankCell).updateData(myInfo, rank, true);
    }
    _onCloseClick() {
        if (this._callback) {
            this._callback();
        }
    }
    setBlackBgVisible(visible) {
        this._panelBg.active = (visible);
    }
}