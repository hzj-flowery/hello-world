import { HomelandHelp } from "./HomelandHelp";

import { Path } from "../../../utils/Path";

import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import PopupHomelandUpAttrNode from "./PopupHomelandUpAttrNode";

const { ccclass, property } = cc._decorator;

var OFFSET_MID = 120;
@ccclass
export default class PopupHomelandUpSubCell extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    PanelCommon: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    Node_treeTitle: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_tree: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_bk: cc.Sprite = null;


    _moveTimes: number = 0;
    _cfgData: any;
    onLoad() {
        // var size = this._resourceNode.getContentSize();
        // this.setContentSize(size.width, size.height);
        for (var i = 1; i <= 5; i++) {
            var panelAttr = this.PanelCommon.getChildByName('FileNode_attr' + i);
            panelAttr.active = (false);
        }
    }
    updateUI(cfgData, cfgDataNext) {
        this._cfgData = cfgData;
        var treeData = {
            treeLevel: cfgData.level,
            treeId: cfgData.type
        };
        HomelandHelp.updateNodeTreeTitle(this.PanelCommon, treeData);
        UIHelper.loadTexture(this.Image_tree, Path.getHomelandUI(cfgData.detail_draw));
        // var color = Colors.LIST_TEXT;
        // if (isCurrent == false) {
        //     color = Colors.BRIGHT_BG_GREEN;
        // }
        var valueList = this.getValueList(cfgData);
        for (var index in valueList) {
            var value = valueList[index];
            this._updateAttr(index, value.name, value.value);
        }
        if (cfgDataNext) {
            var nextValueList = HomelandHelp.getSubLevelAttrList(cfgDataNext.type, cfgDataNext.level);
            for (index in nextValueList) {
                var value = nextValueList[index];
                this._updateNodeNext(index, '+' + value.value);
            }
        } else {
        }
    }
    getValueList(cfgData) {
        var retList = {};
        for (var i = 1; i <= cfgData.level; i++) {
            var valueList = HomelandHelp.getSubLevelAttrList(cfgData.type, i);
            for (var j in valueList) {
                var value = valueList[j];
                var data = retList[j] || {
                    name: '',
                    value: 0
                };
                data.value = data.value + value.value;
                data.name = value.name;
                retList[j] = data;
            }
        }
        return retList;
    }
    _updateAttr(index, name, value) {
        var panelAttr = this.PanelCommon.getChildByName('FileNode_attr' + index);
        if (panelAttr == null) {
            return;
        }
        panelAttr.active = (true);
        var comp = panelAttr.getComponent(PopupHomelandUpAttrNode);
        comp.updateLabel('Text_name', { text: name });
        comp.updateLabel('Text_value', {
            text: value,
            color: Colors.NUMBER_WHITE
        });
        comp.Node_up.active = (false);
    }
    _updateNodeNext(index, diff) {
        var panelAttr = this.PanelCommon.getChildByName('FileNode_attr' + index);
        if (panelAttr == null) {
            return;
        }
        panelAttr.active = (true);
        var comp = panelAttr.getComponent(PopupHomelandUpAttrNode);
        comp.Node_next.active = (true);
        comp.TextAddValue.string = (diff);
        comp.TextAddValue.node.color = (Colors.NUMBER_GREEN);
    }
    moveAttrToMid() {
        if (this._moveTimes == 0) {
            for (var i = 1; i <= 5; i++) {
                var panelAttr = this.PanelCommon.getChildByName('FileNode_attr' + i);
                panelAttr.x = (panelAttr.x + OFFSET_MID);
            }
            this._moveTimes = this._moveTimes + 1;
        }
    }
}