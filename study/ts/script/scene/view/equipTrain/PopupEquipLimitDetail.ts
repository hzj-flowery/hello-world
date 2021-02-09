import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import PopupBase from "../../../ui/PopupBase";
import { clone2 } from "../../../utils/GlobleFunc";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import EquipDetailBriefNode from "../equipmentDetail/EquipDetailBriefNode";
import EquipDetailRefineNode from "../equipmentDetail/EquipDetailRefineNode";
import EquipDetailStrengthenNode from "../equipmentDetail/EquipDetailStrengthenNode";
import EquipDetailSuitNode from "../equipmentDetail/EquipDetailSuitNode";
import { EquipTrainHelper } from "./EquipTrainHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupEquipLimitDetail extends PopupBase {
    public static path = 'equipment/PopupEquipLimitDetail';
    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: EquipDetailStrengthenNode,
        visible: true
    })
    equipDetailStrengthenNode: EquipDetailStrengthenNode = null;
    @property({
        type: EquipDetailSuitNode,
        visible: true
    })
    equipDetailSuitNode: EquipDetailSuitNode = null;
    @property({
        type: EquipDetailRefineNode,
        visible: true
    })
    equipDetailRefineNode: EquipDetailRefineNode = null;
    @property({
        type: EquipDetailBriefNode,
        visible: true
    })
    equipDetailBriefNode: EquipDetailBriefNode = null;

    @property({
        type: EquipDetailStrengthenNode,
        visible: true
    })
    equipDetailStrengthenNode2: EquipDetailStrengthenNode = null;
    @property({
        type: EquipDetailSuitNode,
        visible: true
    })
    equipDetailSuitNode2: EquipDetailSuitNode = null;
    @property({
        type: EquipDetailRefineNode,
        visible: true
    })
    equipDetailRefineNode2: EquipDetailRefineNode = null;
    @property({
        type: EquipDetailBriefNode,
        visible: true
    })
    equipDetailBriefNode2: EquipDetailBriefNode = null;


    _equipUnitData: any;

    ctor(equipUnitData) {
        this._equipUnitData = equipUnitData;
        this._isClickOtherClose = true;
    }
    onCreate() {
    }
    start() {
        var config = this._equipUnitData.getConfig();
        var configAfter = EquipTrainHelper.getConfigByBaseId(config.potential_after);
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, config.id);
        var paramAfter = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, configAfter.id);
        this._textName1.string = (config.name);
        this._textName2.string = (configAfter.name);
        this._textName1.node.color = (Colors.getColor(config.color));
        this._textName2.node.color = (Colors.getColor(configAfter.color));
        this._textTitle.string = (Lang.get('limit_break_title'));
        UIHelper.updateTextOutline(this._textName1, param);
        UIHelper.updateTextOutline(this._textName2, paramAfter);
        this._updateList();
    }
    onExit() {
    }
    _updateList() {
        this._listView.removeAllChildren();
        var module1 = this._buildAttrModule();
        var module2 = this._buildSuitModule();
        var module3 = this._buildRefineModule();
        var module4 = this._buildDescribeModule();
        this._listView.pushBackCustomItem(module1);
        this._listView.pushBackCustomItem(module2);
        this._listView.pushBackCustomItem(module3);
        this._listView.pushBackCustomItem(module4);
        //  this._listView.doLayout();
    }
    _copyEquipData(object) {
        function _copy(object) {
            if (typeof (object) != 'object') {
                return object;
            }
            var new_table = {};
            for (var index in object) {
                var value = object[index];
                new_table[index] = _copy(value);
            }
            return new_table;
        }
        return clone2(object);
       // return _copy(object);
    }
    _buildAttrModule() {
        var equipData = this._equipUnitData;
        var widget = new cc.Node();
        widget.setAnchorPoint(cc.v2(0, 0));
        var equipDetailStrengthenNode = this.equipDetailStrengthenNode;
        equipDetailStrengthenNode.node.parent = widget;
        equipDetailStrengthenNode.setEquipData(equipData, null, true);
        equipDetailStrengthenNode.node.setAnchorPoint(cc.v2(0, 0));
        equipDetailStrengthenNode.node.setPosition(7, equipDetailStrengthenNode.node.height);
        var equipDataAfter = this._copyEquipData(equipData);
        var after_id = equipData.getConfig().potential_after;
        equipDataAfter.setBase_id(after_id);
        equipDataAfter.setConfig(EquipTrainHelper.getConfigByBaseId(after_id));
        var equipDetailStrengthenNode2 = this.equipDetailStrengthenNode2;
        equipDetailStrengthenNode2.node.parent = widget;
        equipDetailStrengthenNode2.setEquipData(equipDataAfter, null, true);
        equipDetailStrengthenNode2.node.setAnchorPoint(cc.v2(0, 0));
        var size = equipDetailStrengthenNode.node.getContentSize();
        equipDetailStrengthenNode2.node.setPosition(size.width + 123, equipDetailStrengthenNode.node.height);
        widget.setContentSize(cc.size(940, size.height));
        return widget;
    }
    _buildSuitModule() {
        var widget = new cc.Node();
        widget.setAnchorPoint(cc.v2(0, 0));
        var config = this._equipUnitData.getConfig();
        var suitId = config.suit_id;
        var equipDetailSuitNode = this.equipDetailSuitNode;
        equipDetailSuitNode.node.parent = widget;
        equipDetailSuitNode.setEquipData(this._equipUnitData, false, true);
        equipDetailSuitNode.setIconMask(false);
        equipDetailSuitNode.node.setAnchorPoint(cc.v2(0, 0));
        equipDetailSuitNode.node.setPosition(7, 0);
        var equipDataAfter = this._copyEquipData(this._equipUnitData);
        var after_id = this._equipUnitData.getConfig().potential_after;
        equipDataAfter.setBase_id(after_id);
        equipDataAfter.setConfig(EquipTrainHelper.getConfigByBaseId(after_id));
        var equipDetailSuitNode2 = this.equipDetailSuitNode2;
        equipDetailSuitNode2.node.parent = widget;
        equipDetailSuitNode2.setEquipData(equipDataAfter, false, true);
        equipDetailSuitNode2.setIconMask(false);
        equipDetailSuitNode2.node.setAnchorPoint(cc.v2(0, 0));
        var size = equipDetailSuitNode.node.getContentSize();
        equipDetailSuitNode2.node.setPosition(size.width + 123, 0);
        widget.setContentSize(cc.size(858, size.height));
        return widget;
    }
    _buildRefineModule() {
        var equipData = this._equipUnitData;
        var widget = new cc.Node();
        widget.setAnchorPoint(cc.v2(0, 0));
        var equipDetailRefineNode = this.equipDetailRefineNode;
        equipDetailRefineNode.node.parent = widget;
        equipDetailRefineNode.setEquipData(equipData, null, true);
        equipDetailRefineNode.node.setAnchorPoint(cc.v2(0, 0));
        equipDetailRefineNode.node.setPosition(7, equipDetailRefineNode.node.height);
        var equipDataAfter = this._copyEquipData(equipData);
        var after_id = equipData.getConfig().potential_after;
        equipDataAfter.setBase_id(after_id);
        equipDataAfter.setConfig(EquipTrainHelper.getConfigByBaseId(after_id));
        var equipDetailRefineNode2 = this.equipDetailRefineNode2;
        equipDetailRefineNode2.node.parent = widget;
        equipDetailRefineNode2.setEquipData(equipDataAfter, null, true);
        equipDetailRefineNode2.node.setAnchorPoint(cc.v2(0, 0));
        var size = equipDetailRefineNode.node.getContentSize();
        equipDetailRefineNode2.node.setPosition(size.width + 123, equipDetailRefineNode2.node.height);
        widget.setContentSize(cc.size(858, size.height));
        return widget;
    }
    _buildDescribeModule() {
        var equipData = this._equipUnitData;
        var widget = new cc.Node();
        widget.setAnchorPoint(cc.v2(0, 0));
        var equipDetailBriefNode = this.equipDetailBriefNode;
        equipDetailBriefNode.node.parent = widget;
        equipDetailBriefNode.setEquipData(equipData);
        equipDetailBriefNode.node.setAnchorPoint(cc.v2(0, 0));
        equipDetailBriefNode.node.setPosition(7, equipDetailBriefNode.node.height);
        var equipDataAfter = this._copyEquipData(equipData);
        var after_id = equipData.getConfig().potential_after;
        equipDataAfter.setBase_id(after_id);
        equipDataAfter.setConfig(EquipTrainHelper.getConfigByBaseId(after_id));
        var equipDetailBriefNode2 = this.equipDetailBriefNode2;
        equipDetailBriefNode2.node.parent = widget;
        equipDetailBriefNode2.setEquipData(equipDataAfter);
        equipDetailBriefNode2.node.setAnchorPoint(cc.v2(0, 0));
        var size = equipDetailBriefNode.node.getContentSize();
        var size1 = equipDetailBriefNode2.node.getContentSize();
        var height = 0;
        if (size.height > size1.height) {
            height = size.height;
            equipDetailBriefNode2.node.y = height;  //(math.abs(size.height - size1.height));
        } else {
            height = size1.height;
            //equipDetailBriefNode.setPositionY(math.abs(size.height - size1.height));
        }
        equipDetailBriefNode2.node.y = height;
        equipDetailBriefNode2.node.x = (size.width + 123);
        widget.setContentSize(cc.size(858, height));
        return widget;
    }
    onButtonClose() {
        this.close();
    }

}