const { ccclass, property } = cc._decorator;

import CommonEquipName from './CommonEquipName'

import CommonDetailWindow from './CommonDetailWindow'
import EquipDetailStrengthenNode from '../../scene/view/equipmentDetail/EquipDetailStrengthenNode';
import EquipDetailRefineNode from '../../scene/view/equipmentDetail/EquipDetailRefineNode';
import EquipDetailBriefNode from '../../scene/view/equipmentDetail/EquipDetailBriefNode';
import EquipDetailSuitNode from '../../scene/view/equipmentDetail/EquipDetailSuitNode';
// import EquipDetailSuitNode from '../../scene/view/equipment/EquipDetailSuitNode';

@ccclass
export default class CommonEquipProperty extends cc.Component {

    @property({
        type: CommonDetailWindow,
        visible: true
    })
    _commonDetailWindow: CommonDetailWindow = null;

    @property({
        type: CommonEquipName,
        visible: true
    })
    _name2: CommonEquipName = null;
    @property({
        type: EquipDetailStrengthenNode,
        visible: true
    })
    equipDetailStrengthenNode: EquipDetailStrengthenNode = null;

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
        type: EquipDetailSuitNode,
        visible: true
    })
    equipDetailSuitNode: EquipDetailSuitNode = null;
    _equipData: any;
    _listViewHeight: number;

    _listView: cc.Node;

    onLoad() {
        this._listView = this._commonDetailWindow._listView;
    }


    _buildAttrModule() {
        this.equipDetailStrengthenNode.setEquipData(this._equipData);
        this.equipDetailStrengthenNode.node.setPosition(0, this._listViewHeight);
        this._listViewHeight += this.equipDetailStrengthenNode._listView.height;
    }
    _buildSuitModule() {
        var equipData = this._equipData;
        var suitId = equipData.getConfig().suit_id;
        if (suitId > 0) {
            this.equipDetailSuitNode.node.active = true;
            this.equipDetailSuitNode.setEquipData(this._equipData);
            this.equipDetailSuitNode.setIconMask(false);
            this._listViewHeight += this.equipDetailSuitNode.node.height;
            this.equipDetailSuitNode.node.setPosition(0, -this._listViewHeight);
        } else {
            this.equipDetailSuitNode.node.active = false;
        }
    }
    _buildRefineModule() {
        this.equipDetailRefineNode.setEquipData(this._equipData);
        this.equipDetailRefineNode.node.setPosition(0, -this._listViewHeight);
        this._listViewHeight += this.equipDetailRefineNode._listView.height;
    }
    _buildBriefModule() {
        this.equipDetailBriefNode.setEquipData(this._equipData);
        this.equipDetailBriefNode.node.setPosition(0, -this._listViewHeight);
        this._listViewHeight += this.equipDetailBriefNode._listView.height;
    }
    _updateListView() {
        this._listViewHeight = 0;
        this._buildAttrModule();
        this._buildSuitModule();
        this._buildRefineModule();
        this._buildBriefModule();
        this._listView.height = this._listViewHeight;
    }
    updateUI(equipData) {
        this._equipData = equipData;
        this._updateListView();
        var equipBaseId = equipData.getBase_id();
        var rLevel = equipData.getR_level();
        this._name2.setName(equipBaseId, rLevel);
    }

}