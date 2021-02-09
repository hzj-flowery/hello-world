const { ccclass, property } = cc._decorator;

import CommonDetailWindow from './CommonDetailWindow'
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import CommonCustomListView from './CommonCustomListView';
import { TreasureDataHelper } from '../../utils/data/TreasureDataHelper';
import TreasureDetailBriefNode from '../../scene/view/treasureDetail/TreasureDetailBriefNode';
import TreasureDetailYokeModule from '../../scene/view/treasureDetail/TreasureDetailYokeModule';
import TreasureDetailStrengthenNode from '../../scene/view/treasureDetail/TreasureDetailStrengthenNode';

@ccclass
export default class CommonTreasureProperty extends cc.Component {

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
        type: cc.Node,
        visible: true
    })
    _treasureDetailStrengthenNode:cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _treasureDetailBriefNode:cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _treasureDetailYokeModule:cc.Node = null;

    _treasureData;
    _rangeType;

    _init() {
        // this._listView.setScrollBarEnabled(false);
    }

    _buildAttrModule() {
        var item = cc.instantiate(this._treasureDetailStrengthenNode);
        item.getComponent(TreasureDetailStrengthenNode).ctor(this._treasureData, this._rangeType);
        this._listView.pushBackCustomItem(item);
    }
    _buildYokeModule() {
        var yokeInfo = TreasureDataHelper.getTreasureYokeInfo(this._treasureData.getBase_id());
        if (yokeInfo.length > 0) {
            var treasureId = this._treasureData.getId();
            var width = 402;

            var item = cc.instantiate(this._treasureDetailYokeModule);
            item.getComponent(TreasureDetailYokeModule).init(yokeInfo, treasureId, width);
            this._listView.pushBackCustomItem(item);
        }
    }
    _buildBriefModule() {
        var item = cc.instantiate(this._treasureDetailBriefNode);
        item.getComponent(TreasureDetailBriefNode).init(this._treasureData);
        this._listView.pushBackCustomItem(item);
    }
    _updateListView() {
        this._listView.removeAllChildren();
        if (this._treasureData.isCanTrain()) {
            this._buildAttrModule();
        }
        this._buildYokeModule();
        this._buildBriefModule();
    }
    updateUI(treasureData) {
        this._treasureData = treasureData;
        this._updateListView();
        var treasureBaseId = treasureData.getBase_id();
        var rLevel = treasureData.getRefine_level();
        this.setName(treasureBaseId, rLevel);
    }
    setName(treasureBaseId, rLevel) {
        var treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId);
        var treasureName = treasureParam.name;
        if (rLevel && rLevel > 0) {
            treasureName = treasureName + ('+' + rLevel);
        }
        this._name2.string = (treasureName);
        this._name2.node.color = (treasureParam.icon_color);
    }

}
