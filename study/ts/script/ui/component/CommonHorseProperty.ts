const {ccclass, property} = cc._decorator;

import CommonHorseName from './CommonHorseName'

import CommonDetailWindow from './CommonDetailWindow'
import HorseDetailAttrNode from '../../scene/view/horseDetail/HorseDetailAttrNode';
import HorseDetailSkillNode from '../../scene/view/horseDetail/HorseDetailSkillNode';
import HorseDetailRideNode from '../../scene/view/horseDetail/HorseDetailRideNode';
import HorseDetailBriefNode from '../../scene/view/horseDetail/HorseDetailBriefNode';
import CommonCustomListViewEx from './CommonCustomListViewEx';

@ccclass
export default class CommonHorseProperty extends cc.Component {

    @property({
        type: CommonDetailWindow,
        visible: true
    })
    _commonDetailWindow: CommonDetailWindow = null;

    @property({
        type: CommonHorseName,
        visible: true
    })
    _name2: CommonHorseName = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property(cc.Prefab)
    detailAttrNode:cc.Prefab = null;

    @property(cc.Prefab)
    detailSkillNode:cc.Prefab = null;

    @property(cc.Prefab)
    detailRideNode:cc.Prefab = null;

    @property(cc.Prefab)
    detailBriefNode:cc.Prefab = null;

    private _horseData:any;

    _buildAttrModule() {
        var horseData = this._horseData;
        var node = cc.instantiate(this.detailAttrNode);
        var item = node.getComponent(HorseDetailAttrNode);
        item.ctor(horseData);
        this._listView.pushBackCustomItem(item.node);
    }
    _buildSkillModule() {
        var horseData = this._horseData;
        var item = cc.instantiate(this.detailSkillNode).getComponent(HorseDetailSkillNode);
        item.ctor(horseData);
        this._listView.pushBackCustomItem(item.node);
    }
    _buildRideModule() {
        var horseData = this._horseData;
        var item = cc.instantiate(this.detailRideNode).getComponent(HorseDetailRideNode);
        item.ctor(horseData);
        this._listView.pushBackCustomItem(item.node);
    }
    _buildBriefModule() {
        var horseData = this._horseData;
        var item = cc.instantiate(this.detailBriefNode).getComponent(HorseDetailBriefNode);
        item.ctor(horseData);
        this._listView.pushBackCustomItem(item.node);
    }
    _updateListView() {
        this._listView.removeAllChildren();
        this._buildAttrModule();
        this._buildSkillModule();
        this._buildRideModule();
        this._buildBriefModule();
    }
    updateUI(horseData) {
        this._horseData = horseData;
        this._updateListView();
        var horseBaseId = horseData.getBase_id();
        var star = horseData.getStar();
        this._name2.setName(horseBaseId, star);
    }
}
