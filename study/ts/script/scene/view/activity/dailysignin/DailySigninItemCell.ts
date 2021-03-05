import ListViewCellBase from "../../../../ui/ListViewCellBase";
import DailySigninItemNode from "./DailySigninItemNode";
import { handler } from "../../../../utils/handler";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DailySigninItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property(cc.Prefab)
    dailySigninItemNode:cc.Prefab = null;


    _itemNodeList: any = {};

    static LINE_ITEM_NUM = 7;

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate(){
        var nodeList = this._resourceNode.children;
        for (var k=1; k<=nodeList.length; k++) {
            var v = nodeList[k-1];
            var dailySigninItemNode = cc.instantiate(this.dailySigninItemNode).getComponent(DailySigninItemNode);//new DailySigninItemNode();
            dailySigninItemNode.setCallBack(handler(this, this._onItemClick));
            v.addChild(dailySigninItemNode.node);
            dailySigninItemNode.node.active = (false);
            this._itemNodeList[k] = dailySigninItemNode;
        }
    }
    updateUI(index, itemLine) {
        var startIndex = index * DailySigninItemCell.LINE_ITEM_NUM + 1;
        for (let k in this._itemNodeList) {
            var v = this._itemNodeList[k];
            var i:number = parseInt(k) - 1;
            if (itemLine[i]) {
                v.node.active = (true);
                v.updateInfo(itemLine[i]);
                v.node.name = (startIndex + parseInt(k) - 1).toString();
            } else {
                v.node.active = (false);
            }
        }
    }
    _onItemClick(sender) {
        var curSelectedPos = parseInt(sender.node.name);
        //logWarn('DailySigninItemCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos);
    }
    getItemNodeByIndex(index) {
        return this._itemNodeList[index];
    }

}
