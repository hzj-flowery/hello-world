import ViewBase from "../../ViewBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_UserData } from "../../../init";
import { HorseDataHelper } from "../../../utils/data/HorseDataHelper";
import { Lang } from "../../../lang/Lang";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import HorseEquipDetailAttrNode from "./HorseEquipDetailAttrNode";
import HorseEquipDetailBriefNode from "./HorseEquipDetailBriefNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HorseEquipDetailBaseView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTalentBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFrom: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDetailName: cc.Label = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _horseEquipDetailAttrNodePrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _horseEquipDetailBriefNodePrefab: cc.Prefab = null;

    private _nodeEquip;
    private _equipData;
    private _rangeType;

    ctor(equipData, rangeType) {
        this._nodeEquip = null;
        this._equipData = equipData;
        this._rangeType = rangeType;
        this.setSceneSize();
    }

    onCreate() {
        this.setSceneSize();
    }

    onEnter() {
        this._updateInfo();
    }

    onExit() {
    }

    _updateInfo() {
        var equipData = this._equipData;
        var equipBaseId = equipData.getBase_id();
        var configData = equipData.getConfig();
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, equipBaseId);
        var horseId = equipData.getHorse_id();
        if (horseId == 0) {
            this._textFrom.node.active = (false);
            this._imageTalentBg.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            this._imageTalentBg.node.active = (true);
            var horseUnitData = G_UserData.getHorse().getUnitDataWithId(horseId);
            if (horseUnitData && horseUnitData.isInBattle()) {
                var heroBaseId = HorseDataHelper.getHeroBaseIdWithHorseId(horseId);
                if (heroBaseId) {
                    var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
                    this._textFrom.string = (heroParam.name + Lang.get('horse_equip_wear'));
                } else {
                    this._textFrom.node.active = (false);
                    this._imageTalentBg.node.active = (false);
                }
            } else {
                this._imageTalentBg.node.active = (false);
                this._textFrom.node.active = (false);
            }
        }
        this._textName.string = (configData.name);
        this._textName.node.color = (equipParam.icon_color);
        this._textDetailName.string = (configData.name);
        this._textDetailName.node.color = (equipParam.icon_color);
        this._updateListView();
    }

    _updateListView() {
        this._listView.removeAllChildren();
        this._buildAttrModule();
        this._buildBriefModule();
    }

    _buildAttrModule() {
        var item = cc.instantiate(this._horseEquipDetailAttrNodePrefab).getComponent(HorseEquipDetailAttrNode);
        item.ctor(this._equipData, this._rangeType);
        this._listView.pushBackCustomItem(item.node);
    }

    _buildBriefModule() {
        var item = cc.instantiate(this._horseEquipDetailBriefNodePrefab).getComponent(HorseEquipDetailBriefNode)
        item.ctor(this._equipData);
        this._listView.pushBackCustomItem(item.node);
    }
}