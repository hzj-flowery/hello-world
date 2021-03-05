const { ccclass, property } = cc._decorator;

import CommonDetailWindow from './CommonDetailWindow'
import HorseEquipDetailBriefNode from '../../scene/view/horseEquipDetail/HorseEquipDetailBriefNode';
import HorseEquipDetailAttrNode from '../../scene/view/horseEquipDetail/HorseEquipDetailAttrNode';
import CommonCustomListViewEx from './CommonCustomListViewEx';
import CommonHorseEquipName from './CommonHorseEquipName';

@ccclass
export default class CommonHorseEquipProperty extends cc.Component {

    @property({
        type: CommonDetailWindow,
        visible: true
    })
    _commonDetailWindow: CommonDetailWindow = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: CommonHorseEquipName,
        visible: true
    })
    _name2: CommonHorseEquipName = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _horseEquipDetailBriefNodePrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _horseEquipDetailAttrNodePrefab: cc.Prefab = null;

    private _equipData;

    _buildBriefModule() {
        var equipData = this._equipData;
        var equipDetailBriefNode = cc.instantiate(this._horseEquipDetailBriefNodePrefab).getComponent(HorseEquipDetailBriefNode);
        equipDetailBriefNode.ctor(equipData);
        this._listView.pushBackCustomItem(equipDetailBriefNode.node);
    }
    _buildAttrModule() {
        var equipData = this._equipData;
        var equipDetailStrengthenNode = cc.instantiate(this._horseEquipDetailAttrNodePrefab).getComponent(HorseEquipDetailAttrNode);
        equipDetailStrengthenNode.ctor(equipData);
        this._listView.pushBackCustomItem(equipDetailStrengthenNode.node);
    }
    _updateListView() {
        this._listView.removeAllChildren();
        this._buildAttrModule();
        this._buildBriefModule();
    }
    updateUI(equipData) {
        this._equipData = equipData;
        this._updateListView();
        var equipBaseId = equipData.getBase_id();
        this._name2.setName(equipBaseId);
    }
}