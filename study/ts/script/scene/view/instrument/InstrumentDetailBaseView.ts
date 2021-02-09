import ViewBase from "../../ViewBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import InstrumentDetailAttrNode from "./InstrumentDetailAttrNode";
import InstrumentDetailYokeNode from "./InstrumentDetailYokeNode";
import InstrumentDetailFeatureNode from "./InstrumentDetailFeatureNode";
import InstrumentDetailTalentNode from "./InstrumentDetailTalentNode";
import InstrumentDetailBriefNode from "./InstrumentDetailBriefNode";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import { InstrumentUnitData } from "../../../data/InstrumentUnitData";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";

const {ccclass, property} = cc._decorator;

@ccclass
export default class InstrumentDetailBaseView extends ViewBase {

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
       type: cc.Label,
       visible: true
   })
   _textFrom: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDetailName: cc.Label = null;


    @property(CommonCustomListViewEx)
    listView: CommonCustomListViewEx = null;

    @property(cc.Prefab)
    instrumentDetailAttrNode:cc.Prefab = null;

    @property(cc.Prefab)
    instrumentDetailYokeNode:cc.Prefab = null;

    @property(cc.Prefab)
    instrumentDetailFeatureNode:cc.Prefab = null;

    @property(cc.Prefab)
    instrumentDetailTalentNode:cc.Prefab = null;

    @property(cc.Prefab)
    instrumentDetailBriefNode:cc.Prefab = null;

   private _instrumentData:InstrumentUnitData;
   private _rangeType:number;

    init(instrumentData,rangeType){
        this._instrumentData = instrumentData;
        this._rangeType = rangeType;
    }

    onCreate(){

    }
    onEnter(){
        this._updateInfo();
    }
    onExit(){

    }

    _updateInfo(){
        var instrumentData = this._instrumentData;
        var instrumentBaseId = instrumentData.getBase_id();
        var limitLevel = instrumentData.getLimit_level();
        var instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentBaseId, null, null, limitLevel);
        var heroBaseId = InstrumentDataHelper.getHeroBaseIdWithInstrumentId(instrumentData.getId());
        if (heroBaseId == null) {
            this._textFrom.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
            this._textFrom.string = (Lang.get('instrument_detail_from', { name: heroParam.name }));
        }
        var instrumentName = instrumentParam.name;
        var level = instrumentData.getLevel();
        if (level > 0) {
            instrumentName = instrumentName + ('+' + level);
        }
        this._textName.string = (instrumentName);
        this._textName.node.color = (instrumentParam.icon_color);
        this._textName.fontSize = (20);
        this._textDetailName.string = (instrumentName);
        this._textDetailName.node.color = (instrumentParam.icon_color);
        this._textDetailName.fontSize = (22);
        UIHelper.updateTextOutline(this._textDetailName, instrumentParam);
        this._updateListView();
    }
    _updateListView(){
        this.listView.removeAllChildren();
        this._buildAttrModule();
        this._buildYokeModule();
        this._buildFeatureModule();
        this._buildTalentModule();
        this._buildBriefModule();
    }
    _buildAttrModule() {
        var item = cc.instantiate(this.instrumentDetailAttrNode);
        item.getComponent(InstrumentDetailAttrNode).init(this._instrumentData,this._rangeType);
        this.listView.pushBackCustomItem(item);
    }
    _buildYokeModule() {
        var item = cc.instantiate(this.instrumentDetailYokeNode);
        item.getComponent(InstrumentDetailYokeNode).init(this._instrumentData);
        this.listView.pushBackCustomItem(item);
    }
    _buildFeatureModule() {
        var item = cc.instantiate(this.instrumentDetailFeatureNode);
        item.getComponent(InstrumentDetailFeatureNode).init(this._instrumentData);
        this.listView.pushBackCustomItem(item);
    }
    _buildTalentModule() {
        var item = cc.instantiate(this.instrumentDetailTalentNode);
        item.getComponent(InstrumentDetailTalentNode).init(this._instrumentData);
        this.listView.pushBackCustomItem(item);
    }
    _buildBriefModule(){
        var item = cc.instantiate(this.instrumentDetailBriefNode);
        item.getComponent(InstrumentDetailBriefNode).init(this._instrumentData);
        this.listView.pushBackCustomItem(item);
    }
}
