import PopupBase from "../../../ui/PopupBase";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Colors } from "../../../init";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";
import InstrumentConst from "../../../const/InstrumentConst";
import InstrumentLimitDetailAttrNode from "./InstrumentLimitDetailAttrNode";
import InstrumentLimitDetailTalentNode from "./InstrumentLimitDetailTalentNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupInstrumentLimitDetail extends PopupBase{
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

    public static path:string = 'instrument/PopupInstrumentLimitDetail';
    _instrumentUnitData: any;


    ctor(instrumentUnitData) {
        this._instrumentUnitData = instrumentUnitData;
        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupInstrumentLimitDetail', '_onButtonClose');
    }
    onCreate() {
        this._textTitle.string = (Lang.get('limit_break_title'));
    }
    onEnter() {
        var baseId = this._instrumentUnitData.getBase_id();

        var limitLevel = this._instrumentUnitData.getLimit_level();
        var param = null;
        var param2 = null;
        if (limitLevel < this._instrumentUnitData.getMaxLimitLevel() && this._instrumentUnitData.getLimitFuncOpened()) {
            param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel);
            param2 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel + 1);
        } else {
            param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel - 1);
            param2 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel);
        }
        this._textName1.string = (param.name);
        this._textName2.string = (param2.name);
        this._textName1.node.color = (param.icon_color);
        this._textName2.node.color = (param2.icon_color);
        UIHelper.updateTextOutline(this._textName1, param);
        UIHelper.updateTextOutline(this._textName2, param2);

        this._updateList();
    }
    onExit() {
    }
    _updateList() {
        this._listView.removeAllChildren();
        var module1 = this._buildAttrModule();
        var module2 = this._buildTalentModule();
        this._listView.pushBackCustomItem(module1.node);
        this._listView.pushBackCustomItem(module2.node);
        this._listView.doLayout();
    }
    _buildAttrModule() {
        var instrumentUnitData = this._instrumentUnitData;
        var info = this._instrumentUnitData.getConfig();

        var limitLevel = this._instrumentUnitData.getLimit_level();
        var nextLimitLevel = limitLevel;
        var templateId1 = this._instrumentUnitData.getAdvacneTemplateId();
        var curRankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, limitLevel);
        var level = curRankInfo.level;
        if (limitLevel < this._instrumentUnitData.getMaxLimitLevel() && this._instrumentUnitData.getLimitFuncOpened()) {
            nextLimitLevel = limitLevel + 1;
        } else {
            var preRankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, limitLevel - 1);
            level = preRankInfo.level;
            templateId1 = preRankInfo.rank_size;
        }
        var rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, nextLimitLevel);
        var templateId2 = rankInfo.rank_size;

        var attrModule = cc.instantiate(this.detailAttrNode).getComponent(InstrumentLimitDetailAttrNode);
        attrModule.ctor(level, templateId1, templateId2);
        return attrModule;
    }
    _buildTalentModule() {
        var instrumentUnitData = this._instrumentUnitData;
        var info = this._instrumentUnitData.getConfig();
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var nextLimitLevel = limitLevel;
        var templateId1 = this._instrumentUnitData.getAdvacneTemplateId();
        if (limitLevel < this._instrumentUnitData.getMaxLimitLevel() && this._instrumentUnitData.getLimitFuncOpened()) {
            nextLimitLevel = limitLevel + 1;
        } else {
            var preRankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, limitLevel - 1);
            templateId1 = preRankInfo.rank_size;
        }
        var rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, nextLimitLevel);
        var templateId2 = rankInfo.rank_size;
        var talentModule = cc.instantiate(this.detailTalentNode).getComponent(InstrumentLimitDetailTalentNode);
        talentModule.ctor(instrumentUnitData, templateId1, templateId2);
        return talentModule;
    }
    _onButtonClose() {
        this.close();
    }
}
