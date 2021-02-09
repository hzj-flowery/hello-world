const { ccclass, property } = cc._decorator;

import CommonDetailWindow from './CommonDetailWindow'
import JadeAttrNode from '../../scene/view/equipmentJade/JadeAttrNode';
import JadeSuitEquipmentNode from '../../scene/view/equipmentJade/JadeSuitEquipmentNode';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';

@ccclass
export default class CommonJadeProperty extends cc.Component {

    @property({
        type: CommonDetailWindow,
        visible: true
    })
    _commonDetailWindow: CommonDetailWindow = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _name2: cc.Label = null;

    @property({
        type: JadeSuitEquipmentNode,
        visible: true
    })
    jadeSuitEquipmentNode: JadeSuitEquipmentNode = null;

    @property({
        type: JadeAttrNode,
        visible: true
    })
    jadeAttrNode: JadeAttrNode = null;

    _listViewHeight: number;

    _listView: cc.Node;
    _jadeConfig: any;

    onLoad() {
        this._listView = this._commonDetailWindow._listView;
    }

    _buildAttrModule() {
        this.jadeAttrNode.setJadeData(this._jadeConfig);
        this.jadeAttrNode.node.setPosition(0, -this._listViewHeight);
        this._listViewHeight += this.jadeAttrNode._listView.height;
    }
    _buildSuitEquipments() {
        this.jadeSuitEquipmentNode.setJadeData(this._jadeConfig);
        this.jadeSuitEquipmentNode.node.setPosition(0, -this._listViewHeight);
        this._listViewHeight += this.jadeSuitEquipmentNode._listView.height;
    }
    _updateListView() {
        this._buildAttrModule();
        this._buildSuitEquipments();
    }
    updateUI(jadeConfig) {
        this._listViewHeight = 0;
        this._jadeConfig = jadeConfig;
        this._updateListView();
        this._listView.height = this._listViewHeight;
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_JADE_STONE, jadeConfig.id);
        this._name2.string = (param.name);
        this._name2.node.color = (param.icon_color);
    }

}