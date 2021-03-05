import PopupBase from "../../../ui/PopupBase";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import TreasureLimitDetailStrNode from "./TreasureLimitDetailStrNode";
import TreasureLimitDetailRefineNode from "./TreasureLimitDetailRefineNode";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupTreasureLimitDetail extends PopupBase{

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
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;
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

    @property(cc.Prefab)
    detailAttrNode:cc.Prefab = null;

    @property(cc.Prefab)
    detailTalentNode:cc.Prefab = null;

    public static path:string = 'treasure/PopupTreasureLimitDetail';

    _treasureUnitData: any;
    ctor(treasureUnitData) {
        this._treasureUnitData = treasureUnitData;
        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupTreasureLimitDetail', '_onButtonClose');
    }
    onCreate() {
        this._textTitle.string = (Lang.get('limit_break_title'));
    }
    onEnter() {
        var baseId1 = this._treasureUnitData.getBase_id();
        var baseId2 = TreasureDataHelper.getTreasureConfig(baseId1).limit_up_id;
        if (baseId2 == 0) {
            baseId2 = baseId1;
        }
        var param1 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, baseId1);
        var param2 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, baseId2);
        this._textName1.string = (param1.name);
        this._textName2.string = (param2.name);
        this._textName1.node.color = (param1.icon_color);
        this._textName2.node.color = (param2.icon_color);
        this._updateList();
    }
    onExit() {
    }
    _updateList() {
        this._listView.removeAllChildren();
        var module1 = this._buildStrAttrModule();
        var module2 = this._buildRefineAttrModule();
        this._listView.pushBackCustomItem(module1);
        this._listView.pushBackCustomItem(module2);
        this._listView.doLayout();
    }
    _buildStrAttrModule() {
        var attrModule = cc.instantiate(this.detailAttrNode).getComponent(TreasureLimitDetailStrNode);
        attrModule.ctor(this._treasureUnitData);
        return attrModule.node;
    }
    _buildRefineAttrModule() {
        var talentModule = cc.instantiate(this.detailTalentNode).getComponent(TreasureLimitDetailRefineNode);
        talentModule.ctor(this._treasureUnitData);
        return talentModule.node;
    }
    _onButtonClose() {
        this.close();
    }
}
