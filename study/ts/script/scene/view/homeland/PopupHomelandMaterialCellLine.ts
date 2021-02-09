import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { HomelandHelp } from "./HomelandHelp";
import PopupHomelandMaterialIcon from "./PopupHomelandMaterialIcon";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupHomelandMaterialCellLine extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBk: cc.Sprite = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _itemList: CommonCustomListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTree: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_tree: cc.Sprite = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    popupHomelandMaterialIcon: cc.Prefab = null;


    _data: any;

    ctor(data) {
        this._data = data;
        this.onCreate();
    }
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._updateData();
    }
    _updateNodeTitle() {
        var cfgData = this._data.cfg;
        var nodeTree = this._nodeTree;
        UIHelper.loadTexture(this.Image_tree, Path.getHomelandUI(cfgData.detail_draw));
        var treeData = {
            treeLevel: cfgData.level,
            treeId: cfgData.type
        };
        HomelandHelp.updateNodeTreeTitle(nodeTree, treeData);
    }
    _updateData() {
        if (this._data == null) {
            return;
        }
        this._updateNodeTitle();
        var iconSize = 150;
        for (var i in this._data.list) {
            var value = this._data.list[i];
            var itemIcon = cc.instantiate(this.popupHomelandMaterialIcon);
            itemIcon.getComponent(PopupHomelandMaterialIcon).ctor(value, i);
            iconSize = itemIcon.getContentSize().width + 2;
            this._itemList.pushBackCustomItem(itemIcon);
        }
        var totalSize = iconSize * this._data.list.length;
        //  this._itemList.doLayout();
        if (totalSize > 764) {
            this._itemList.node.setContentSize(cc.size(764, 113));
            //  this._itemList.setTouchEnabled(true);
        } else {
            this._itemList.node.setContentSize(cc.size(totalSize, 113));
            // this._itemList.setTouchEnabled(false);
        }
    }

}