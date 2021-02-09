import { TacticsConst } from "../../../const/TacticsConst";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { handler } from "../../../utils/handler";
import { TacticsItem } from "./TacticsItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TacticsItemCell extends ListViewCellBase {
    @property({
        type: cc.Node,
        visible: true
    }) _resourceNode: cc.Node = null;
    @property({
        type: TacticsItem,
        visible: true
    }) _nodeItem1: TacticsItem = null;
    @property({
        type: TacticsItem,
        visible: true
    }) _nodeItem2: TacticsItem = null;
    @property({
        type: TacticsItem,
        visible: true
    }) _nodeItem3: TacticsItem = null;
    @property({
        type: TacticsItem,
        visible: true
    }) _nodeItem4: TacticsItem = null;
    @property({
        type: TacticsItem,
        visible: true
    }) _nodeItem5: TacticsItem = null;

    private _clickCallback: any;

    ctor() {
        this._resourceNode = null;
    }
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        var colNum = TacticsConst.UI_LIST_COL_NUM;
        for (var i = 1; i <= colNum; i++) {
            var node = this['_nodeItem' + i];
            this['_fileItem' + i] = node;
            this['_fileItem' + i].setCallback(handler(this, this._onItemClick));
        }
    }
    updateUI(unitList, index, clickCallback) {
        this._index = index;
        this._clickCallback = clickCallback;
        var colNum = TacticsConst.UI_LIST_COL_NUM;
        for (var i = 1; i <= colNum; i++) {
            var t = index * colNum + i - 1;
            var unitData = unitList[t];
            var item = this['_fileItem' + i];
            if (unitData) {
                item.updateUI(unitData, index, i);
                item.setVisible(true);
            } else {
                item.setVisible(false);
            }
        }
    }
    _onItemClick(index) {
        this._clickCallback(this._index, index);
    }
    updateSelectState(index) {
        var colNum = TacticsConst.UI_LIST_COL_NUM;
        var selItem = null;
        for (var i = 1; i <= colNum; i++) {
            var t = this._index * colNum + i;
            var isSel = t == index;
            var item = this['_fileItem' + i];
            item.setSelected(isSel);
            if (isSel) {
                selItem = item;
            }
        }
        return selItem;
    }
}