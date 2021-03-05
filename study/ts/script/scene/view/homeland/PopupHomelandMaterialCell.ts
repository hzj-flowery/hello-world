import { HomelandHelp } from "./HomelandHelp";

import { Lang } from "../../../lang/Lang";

import { Colors } from "../../../init";

import PopupHomelandMaterialCellLine from "./PopupHomelandMaterialCellLine";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import { UserCheck } from "../../../utils/logic/UserCheck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupHomelandMaterialCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBk2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBk: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTreeName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPrayCount: cc.Label = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _lineList: CommonCustomListView = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    popupHomelandMaterialCellLine: cc.Prefab = null;

    _data: any;
    ctor(data) {
        this._data = data;
        this.onCreate();
    }
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._updateData();
        this._imageTitle.node.active = (true);
    }
    _updateData() {
        if (this._data == null) {
            return;
        }
        this._lineList.removeAllChildren();
        var treeLevel = this._data.id;
        if (treeLevel == null || treeLevel == 0) {
            treeLevel = 1;
        }
        var [mainTreeData] = HomelandHelp.getMainTreeCfg({ treeLevel: treeLevel });
        var treeName = mainTreeData.name + Lang.get('homeland_main_tree_level' + treeLevel);
        this._textTreeName.string = (treeName);
        this._textTreeName.node.color = (Colors.getHomelandColor(treeLevel));
        this._textTreeName.node.active = (true);
        var info = HomelandHelp.getTreeInfoConfig(treeLevel);
        var strPrayCount = '';
        if (UserCheck.enoughLevel(info.breaktext_level)) {
            strPrayCount = info.breaktext;
        }
        this._textPrayCount.string = (strPrayCount);
        for (var i in this._data.list) {
            var value = this._data.list[i];
            var itemLine = cc.instantiate(this.popupHomelandMaterialCellLine);
            itemLine.getComponent(PopupHomelandMaterialCellLine).ctor(value);
            this._lineList.pushBackCustomItem(itemLine);
        }
        //  this._lineList.doLayout();
        var containSize = this._lineList.getInnerContainerSize();
        this._lineList.setContentSize(containSize);
        var srcSize = this._resourceNode.getContentSize();
        var changeSize = cc.size(srcSize.width, containSize.height + 44);
        this._resourceNode.setContentSize(changeSize);
        this._imageBk.node.setContentSize(changeSize);
        this._imageBk2.node.setContentSize(changeSize);
        this.node.setContentSize(changeSize);
        this._imageTitle.node.active = (true);
        this._imageTitle.node.setAnchorPoint(cc.v2(0, 0));
        this._imageTitle.node.y = (changeSize.height - 46);
    }

}