const {ccclass, property} = cc._decorator;

import CommonDetailWindow from './CommonDetailWindow'
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import UIHelper from '../../utils/UIHelper';
import InstrumentDetailAttrNode from '../../scene/view/instrument/InstrumentDetailAttrNode';
import InstrumentDetailYokeNode from '../../scene/view/instrument/InstrumentDetailYokeNode';
import CommonCustomListView from './CommonCustomListView';
import InstrumentDetailFeatureNode from '../../scene/view/instrument/InstrumentDetailFeatureNode';
import InstrumentDetailTalentNode from '../../scene/view/instrument/InstrumentDetailTalentNode';
import InstrumentDetailBriefNode from '../../scene/view/instrument/InstrumentDetailBriefNode';

@ccclass
export default class CommonInstrumentProperty extends cc.Component {

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
        type: CommonCustomListView,
        visible: true
    })
   _listView: CommonCustomListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
   _InstrumentDetailAttrNode:cc.Prefab = null;

   @property({
        type: cc.Prefab,
        visible: true
    })
    _InstrumentDetailYokeNode:cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _InstrumentDetailFeatureNode:cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _InstrumentDetailTalentNode:cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _InstrumentDetailBriefNode:cc.Prefab = null;


   private _instrumentData:any;
   private _rangeType:number = 1;

    updateUI(instrumentData) {
        this._instrumentData = instrumentData;
        this._updateListView();
        this.setName(instrumentData.getBase_id(), instrumentData.getLevel());
    }

    _buildAttrModule() {
        // var item = new InstrumentDetailAttrNode(this._instrumentData, this._rangeType);
        // this._listView.pushBackCustomItem(item);

        var item = cc.instantiate(this._InstrumentDetailAttrNode);
        item.getComponent(InstrumentDetailAttrNode).init(this._instrumentData,this._rangeType);
        this._listView.pushBackCustomItem(item);
    }
    _buildYokeModule() {
        // var item = new InstrumentDetailYokeNode(this._instrumentData);
        // this._listView.pushBackCustomItem(item);

        var item = cc.instantiate(this._InstrumentDetailYokeNode);
        item.getComponent(InstrumentDetailYokeNode).init(this._instrumentData);
        this._listView.pushBackCustomItem(item);
    }
    _buildFeatureModule() {
        // var item = new InstrumentDetailFeatureNode(this._instrumentData);
        // this._listView.pushBackCustomItem(item);

        var item = cc.instantiate(this._InstrumentDetailFeatureNode);
        item.getComponent(InstrumentDetailFeatureNode).init(this._instrumentData);
        this._listView.pushBackCustomItem(item);
    }
    _buildTalentModule() {
        // var item = new InstrumentDetailTalentNode(this._instrumentData);
        // this._listView.pushBackCustomItem(item);

        var item = cc.instantiate(this._InstrumentDetailTalentNode);
        item.getComponent(InstrumentDetailTalentNode).init(this._instrumentData);
        this._listView.pushBackCustomItem(item);
    }
    _buildBriefModule() {
        // var item = new InstrumentDetailBriefNode(this._instrumentData);
        // this._listView.pushBackCustomItem(item);

        var item = cc.instantiate(this._InstrumentDetailBriefNode);
        item.getComponent(InstrumentDetailBriefNode).init(this._instrumentData);
        this._listView.pushBackCustomItem(item);
    }

    _updateListView() {
        this._listView.removeAllChildren();
        this._buildAttrModule();
        this._buildYokeModule();
        this._buildFeatureModule();
        this._buildTalentModule();
        this._buildBriefModule();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
    }
    setName(instrumentId, rank) {
        var instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId);
        var instrumentName = instrumentParam.name;
        if (rank && rank > 0) {
            instrumentName = instrumentName + ('+' + rank);
        }
        this._name2.string = instrumentName;
        this._name2.node.color = instrumentParam.icon_color;
        UIHelper.updateTextOutline(this._name2, instrumentParam);
    }
}
