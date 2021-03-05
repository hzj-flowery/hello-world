import ViewBase from "../../ViewBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import TreasureDetailStrengthenNode from "./TreasureDetailStrengthenNode";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";
import TreasureDetailYokeModule from "./TreasureDetailYokeModule";
import TreasureDetailBriefNode from "./TreasureDetailBriefNode";
import TreasureDetailRefineNode from "./TreasureDetailRefineNode";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { FunctionConst } from "../../../const/FunctionConst";
import { TreasureDetailJadeNode } from "../equipmentJade/TreasureDetailJadeNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TreasureDetailBaseView extends ViewBase {

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
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _treasureDetailStrengthenNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _treasureDetailBriefNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _treasureDetailYokeModule: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _treasureDetailJadeModule: cc.Node = null;

    @property(cc.Prefab)
    TreasureDetailRefineNode: cc.Node = null;

    private _treasureData: any;
    _rangeType: number;

    ctor(treasureData, rangeType) {
        this._treasureData = treasureData;
        this._rangeType = rangeType;
    }
    onCreate() {
    }
    onEnter() {
        this._updateInfo();
    }
    onExit() {
    }
    _updateInfo() {
        var treasureData = this._treasureData;
        var treasureBaseId = treasureData.getBase_id();
        var treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId);
        var heroUnitData = UserDataHelper.getHeroDataWithTreasureId(treasureData.getId());
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
        var treasureName = treasureParam.name;
        var rLevel = treasureData.getRefine_level();
        if (rLevel > 0) {
            treasureName = treasureName + ('+' + rLevel);
        }
        this._textName.string = (treasureName);
        this._textName.node.color = (treasureParam.icon_color);
        this._textDetailName.string = (treasureName);
        this._textDetailName.node.color = (treasureParam.icon_color);
        this._textPotential.string = (Lang.get('treasure_detail_txt_potential', { value: treasureParam.potential }));
        this._textPotential.node.color = (treasureParam.icon_color);
        UIHelper.updateTextOutline(this._textPotential, treasureParam);
        this._updateListView();
    }
    _buildAttrModule() {
        var item = cc.instantiate(this._treasureDetailStrengthenNode);
        item.getComponent(TreasureDetailStrengthenNode).ctor(this._treasureData, this._rangeType);
        this._listView.pushBackCustomItem(item);
    }
    _buildRefineModule() {
        var treasureData = this._treasureData;
        var treasureRefine = cc.instantiate(this.TreasureDetailRefineNode).getComponent(TreasureDetailRefineNode);
        treasureRefine.ctor(treasureData, this._rangeType);
        this._listView.pushBackCustomItem(treasureRefine.node);
    }
    _buildYokeModule() {
        var yokeInfo = TreasureDataHelper.getTreasureYokeInfo(this._treasureData.getBase_id());
        if (yokeInfo.length > 0) {
            var treasureId = this._treasureData.getId();
            var item = cc.instantiate(this._treasureDetailYokeModule);
            item.getComponent(TreasureDetailYokeModule).init(yokeInfo, treasureId);
            this._listView.pushBackCustomItem(item);
        }
    }
    _buildBriefModule() {
        var item = cc.instantiate(this._treasureDetailBriefNode);
        item.getComponent(TreasureDetailBriefNode).init(this._treasureData);
        this._listView.pushBackCustomItem(item);
    }
    _buildJadeModule() {
        if (FunctionCheck.funcIsShow(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3)) {
            if (this._treasureData.getJadeSlotNums() > 0) {
                var equipData = this._treasureData;
                var item = cc.instantiate(this._treasureDetailJadeModule);
                item.getComponent(TreasureDetailJadeNode).init(equipData, this._rangeType);
                this._listView.pushBackCustomItem(item);
            }
        }
    }
    _updateListView() {
        this._listView.removeAllChildren();
        if (this._treasureData.isCanTrain()) {
            this._buildAttrModule();
            this._buildRefineModule();
        }
        this._buildJadeModule();
        this._buildYokeModule();
        this._buildBriefModule();
        this._listView.doLayout();
    }
}
