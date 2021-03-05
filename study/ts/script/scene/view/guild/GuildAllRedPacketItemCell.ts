import ListViewCellBase from "../../../ui/ListViewCellBase";
import { handler } from "../../../utils/handler";
import GuildAllRedPacketItemNode from "./GuildAllRedPacketItemNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildAllRedPacketItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node01: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node02: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node03: cc.Node = null;
    _itemNodeList: any[];
    static readonly LINE_ITEM_NUM: 3;

    //军团所有资源整合
    // public static waitEnterMsg(callback) {
    //     var data: Array<string> = [];
    //     data.push("prefab/guild/GuildAllRedPacketItemCell");
    //     data.push("prefab/guild/GuildAllRedPacketItemNode");
    //     data.push("prefab/guild/GuildLogTimeTitle");
    //     data.push("prefab/common/PopupAlert");
    // }

    initData() {
        this._itemNodeList = [];
    }

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        var nodeList = this._resourceNode.childrenCount;
        for (let k = 0; k < nodeList; k++) {
            var v = nodeList[k];
            var resource = cc.resources.get("prefab/guild/GuildAllRedPacketItemNode");
            var node = cc.instantiate(resource) as cc.Node;
            let commpent = node.getComponent("GuildAllRedPacketItemNode") as GuildAllRedPacketItemNode;
            commpent.setCallBack(handler(this, this._onItemClick));
            v.addChild(node);
            node.active = (false);
            this._itemNodeList[k] = node;
        }
    }
    setContentSize(width: number, height: number) {
        throw new Error("Method not implemented.");
    }
    updateData(index, dataList) {
        var startIndex = index * GuildAllRedPacketItemCell.LINE_ITEM_NUM + 1;
        for (let k = 0; k < this._itemNodeList.length; k++) {
            var v = this._itemNodeList[k];
            var realIndex = startIndex + k - 1;
            if (dataList[realIndex]) {
                v.setVisible(true);
                v.update(dataList[realIndex]);
                v.setTag(realIndex);
            } else {
                v.setVisible(false);
            }
        }
    }
    _onItemClick(sender) {
        var curSelectedPos = sender.getTag();
        // logWarn('GuildAllRedPacketItemCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos - 1);
    }
    getItemNodeByIndex(index) {
        return this._itemNodeList[index];
    }

}