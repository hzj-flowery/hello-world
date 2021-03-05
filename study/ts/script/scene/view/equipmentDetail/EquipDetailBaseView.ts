import EquipDetailStrengthenNode from "../equipmentDetail/EquipDetailStrengthenNode";
import EquipConst from "../../../const/EquipConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Lang } from "../../../lang/Lang";
import EquipDetailSuitNode from "./EquipDetailSuitNode";
import { FunctionConst } from "../../../const/FunctionConst";
import { EquipDataHelper } from "../../../utils/data/EquipDataHelper";
import EquipDetailRefineNode from "../equipmentDetail/EquipDetailRefineNode";
import EquipDetailBriefNode from "../equipmentDetail/EquipDetailBriefNode";
import EquipDetailJadeNode from "../equipmentJade/EquipDetailJadeNode";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { EquipTrainHelper } from "../equipTrain/EquipTrainHelper";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipDetailBaseView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFrom: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPotential: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDetailName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;

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

    @property({
        type: EquipDetailJadeNode,
        visible: true
    })
    equipDetailJadeNode: EquipDetailJadeNode = null;


    _equipData: any;
    _rangeType: any;

    _listViewHeight: number;

    protected onCreate() {
        this.setSceneSize();
    }
    protected onEnter() {
    }
    protected onExit() {
    }

    setEquipData(equipData, rangeType?) {
        this._equipData = equipData;
        this._rangeType = rangeType || EquipConst.EQUIP_RANGE_TYPE_1;

        this._updateInfo();
    }
    _updateInfo() {
        var equipData = this._equipData;
        var equipBaseId = equipData.getBase_id();
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId);
        var equipName = equipParam.name;
        var rLevel = equipData.getR_level();
        if (rLevel > 0) {
            equipName = equipName + ('+' + rLevel);
        }
        this._textName.string = (equipName);
        this._textName.node.color = (equipParam.icon_color);
        this._textDetailName.string = (equipName);
        this._textDetailName.fontSize = (22);
        this._textDetailName.node.color = (equipParam.icon_color);
        UIHelper.updateTextOutline(this._textDetailName, equipParam);
        var heroUnitData = UserDataHelper.getHeroDataWithEquipId(equipData.getId());
        if (heroUnitData == null) {
            this._textFrom.node.active = (false);
        } else {
            var baseId = heroUnitData.getBase_id();
            var limitLevel = heroUnitData.getLimit_level();
            var limitRedLevel = heroUnitData.getLimit_rtg();
            this._textFrom.node.active = (true);
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
            this._textFrom.string = (Lang.get('treasure_detail_from', { name: heroParam.name }));
        }
        this._textPotential.string = (Lang.get('equipment_detail_txt_potential', { value: equipParam.potential }));
        this._textPotential.node.color = (equipParam.icon_color);
        UIHelper.enableOutline(this._textPotential, equipParam.icon_color_outline, 2);

        this._updateListView();
    }
    _buildAttrModule() {
        this.equipDetailStrengthenNode.setEquipData(this._equipData, this._rangeType);
        this.equipDetailStrengthenNode.node.setPosition(0, this._listViewHeight);
        this._listViewHeight += this.equipDetailStrengthenNode._listView.height;
    }
    _buildSuitModule() {
        var equipData = this._equipData;
        var suitId = equipData.getConfig().suit_id;
        if (suitId > 0 && equipData.isInBattle()) {
            this.equipDetailSuitNode.node.active = true;
            this.equipDetailSuitNode.setEquipData(this._equipData, true);
            this._listViewHeight += this.equipDetailSuitNode.node.height;
            this.equipDetailSuitNode.node.setPosition(0, -this._listViewHeight);
        } else {
            this.equipDetailSuitNode.node.active = false;
        }
    }
    _buildRefineModule() {
        this.equipDetailRefineNode.setEquipData(this._equipData, this._rangeType);
        this.equipDetailRefineNode.node.setPosition(0, -this._listViewHeight);
        this._listViewHeight += this.equipDetailRefineNode._listView.height;
    }
    _buildBriefModule() {
        this.equipDetailBriefNode.setEquipData(this._equipData);
        this.equipDetailBriefNode.node.setPosition(0,-this._listViewHeight);
        this._listViewHeight += this.equipDetailBriefNode._listView.height;
    }
    _buildJadeModule() {
        if (FunctionCheck.funcIsShow(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)) {
            if (EquipTrainHelper.canLimitUp(this._equipData.getBase_id())) {
                this.equipDetailJadeNode.node.active = true;
                this.equipDetailJadeNode.setEquipData(this._equipData, this._rangeType);
                this.equipDetailJadeNode.node.setPosition(0, -this._listViewHeight);
                this._listViewHeight += this.equipDetailJadeNode._listView.height;
                return;
            }
        }
        this.equipDetailJadeNode.node.active = false;
    }
    _updateListView() {
        this._listViewHeight = 0;
        this._buildAttrModule();
        this._buildSuitModule();
        this._buildRefineModule();
        this._buildJadeModule();
        this._buildBriefModule();
        this._listView.height = this._listViewHeight;
    }
}