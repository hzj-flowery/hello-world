import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { HomelandHelp } from "./HomelandHelp";
import { Colors } from "../../../init";
import PopupHomelandUpAttrNode from "./PopupHomelandUpAttrNode";
import PopupHomelandBreakUpAttrNode from "./PopupHomelandBreakUpAttrNode";

const { ccclass, property } = cc._decorator;
var OFFSET_X = 50;
var OFFSET_Y = 60;
var OFFSET_MID = 120;

@ccclass
export default class PopupHomelandUpMainCell extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    PanelCommon: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    Node_break_attr: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    Node_1: cc.Node = null;
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

    _hasOnLoaded: boolean = false;
    onLoad() {
        // var size = this._resourceNode.getContentSize();
        // this.setContentSize(size.width, size.height);
        if (this._hasOnLoaded) {
            return;
        }
        this._hasOnLoaded = true;
        this.Node_break_attr.active = (false);
        for (var i = 1; i <= 6; i++) {
            var panelAttr = this.Node_1.getChildByName('FileNode_attr' + i);
            panelAttr.active = (false);
        }
    }
    updateUI(cfgData, cfgDataNext) {
        this._cfgData = cfgData;
        UIHelper.loadTexture(this.Image_tree, Path.getHomelandUI(cfgData.up_resource));
        var treeData = {
            treeLevel: cfgData.id,
            treeId: 0
        };
        HomelandHelp.updateNodeTreeTitle(this.PanelCommon, treeData);
        var valueList = this.getValueList(cfgData);
        for (var index in valueList) {
            var value = valueList[index];
            this._updateAttr(index, value.name, value.value);
        }
        if (cfgDataNext) {
            var nextValueList = HomelandHelp.getMainLevelAttrList(cfgDataNext.id);
            for (index in nextValueList) {
                var value = nextValueList[index];
                this._updateNodeNext(parseFloat(index) + 1, '+' + value.value);
            }
        } else {
        }
    }
    getValueList(cfgData) {
        var retList = {};
        for (var i = 1; i <= cfgData.id; i++) {
            var valueList = HomelandHelp.getMainLevelAttrList(i);
            var k = 1;
            for (var j in valueList) {
                var value = valueList[j];
                var data = retList[k] || {
                    name: '',
                    value: 0
                };
                data.value = data.value + value.value;
                data.name = value.name;
                retList[k] = data;
                k++;
            }
        }
        return retList;
    }
    _updateAttr(index, name, value) {
        var panelAttr = this.Node_1.getChildByName('FileNode_attr' + index);
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
        var Node_next = comp.Node_next;
        Node_next.active = (false);
    }
    _updateNodeNext(index, diff) {
        var panelAttr = this.Node_1.getChildByName('FileNode_attr' + index);
        if (panelAttr == null) {
            return;
        }
        panelAttr.active = (true);
        var comp = panelAttr.getComponent(PopupHomelandUpAttrNode);
        var Node_next = comp.Node_next;
        Node_next.active = (true);
        var TextAddValue = comp.TextAddValue;
        TextAddValue.string = (diff);
        TextAddValue.node.color = (Colors.NUMBER_GREEN);
    }
    _updateBreakAttr(index, name, value) {
        var panelAttrOld = this.Node_1.getChildByName('FileNode_attr' + index);
        panelAttrOld.active = (false);
        var panelAttr = this.Node_break_attr.getChildByName('FileNode_break_attr' + index);
        var comp = panelAttr.getComponent(PopupHomelandBreakUpAttrNode);
        comp.updateLabel('Text_name', { text: name });
        comp.updateLabel('Text_value', {
            text: value,
            color: Colors.NUMBER_WHITE
        });
        comp.Node_up.active = (false);
    }
    _updateNextBreakAttr(index, nextValue, addValue) {
        var panelAttrOld = this.Node_1.getChildByName('FileNode_attr' + index);
        panelAttrOld.active = (false);
        var panelAttr = this.Node_break_attr.getChildByName('FileNode_break_attr' + index);
        var comp = panelAttr.getComponent(PopupHomelandBreakUpAttrNode);
        comp.updateLabel('Text_name', { visible: false });
        comp.updateLabel('Text_value', { visible: false });
        comp.Node_up.active = (true);
        comp.updateLabel('Text_next_value', { text: nextValue });
        comp.updateLabel('Text_add_value', { text: addValue });
    }
    moveAttrToMid() {
        if (this._moveTimes == 0) {
            for (var i = 1; i <= 6; i++) {
                var panelAttr = this.Node_1.getChildByName('FileNode_attr' + i);
                panelAttr.x = (panelAttr.x + OFFSET_MID);
            }
            this._moveTimes = this._moveTimes + 1;
        }
    }
    updateBreakUI(cfgData) {
        this.Node_break_attr.active = (true);
        this.Node_treeTitle.x = (this.Node_treeTitle.x + OFFSET_X);
        this.Node_treeTitle.y = (this.Node_treeTitle.y - OFFSET_Y);
        this.Image_bk.node.setScale(0.6);
        UIHelper.loadTexture(this.Image_tree, Path.getHomelandUI(cfgData.up_resource));
        var treeData = {
            treeLevel: cfgData.id,
            treeId: 0
        };
        HomelandHelp.updateNodeTreeTitle(this.PanelCommon, treeData);
        var valueList = this.getValueList(cfgData);
        for (var index in valueList) {
            var value = valueList[index];
            this._updateBreakAttr(index, value.name, value.value);
        }
    }
    updateNextBreakUI(cfgData, nextCfgData) {
        this.Node_break_attr.active = (true);
        this.Node_treeTitle.x = (this.Node_treeTitle.x + OFFSET_X);
        this.Node_treeTitle.y = (this.Node_treeTitle.y - OFFSET_Y);
        this.Image_bk.node.setScale(0.6);
        var nextValueList = this.getValueList(nextCfgData);
        var valueList = this.getValueList(cfgData);
        for (var index in nextValueList) {
            var value = nextValueList[index];
            var diff = value.value - valueList[index].value;
            this._updateNextBreakAttr(index, value.value, diff);
        }
        UIHelper.loadTexture(this.Image_tree, Path.getHomelandUI(nextCfgData.up_resource));
        var treeData = {
            treeLevel: nextCfgData.id,
            treeId: 0
        };
        HomelandHelp.updateNodeTreeTitle(this.PanelCommon, treeData);
    }
}