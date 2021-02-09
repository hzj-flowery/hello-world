const { ccclass, property } = cc._decorator;

import CommonHeroStar from '../../../ui/component/CommonHeroStar'
import { G_SignalManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import { Lang } from '../../../lang/Lang';
import HorseConst from '../../../const/HorseConst';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import HorseDetailAttrNode from './HorseDetailAttrNode';
import HorseDetailSkillNode from './HorseDetailSkillNode';
import HorseDetailRideNode from './HorseDetailRideNode';
import HorseDetailBriefNode from './HorseDetailBriefNode';
import ViewBase from '../../ViewBase';

@ccclass
export default class HorseDetailBaseView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;

    @property({ type: CommonHeroStar, visible: true })
    _nodeStar: CommonHeroStar = null;

    @property({ type: cc.Label, visible: true })
    _textFrom: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textDetailName: cc.Label = null;

    @property({ type: CommonCustomListViewEx, visible: true })
    _listView: CommonCustomListViewEx = null;

    @property({ type: cc.Prefab, visible: true })
    _horseDetailAttrNodePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseDetailBriefNodePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseDetailRideNodePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseDetailSkillNodePrefab: cc.Prefab = null;

    private _lastAttr;
    private _difAttr;
    private _horseData;
    private _rangeType;
    private _recordAttr;
    private _horseEquipItem;

    private _singleHorseEquipAddSuccess;

    private _attrItem:HorseDetailAttrNode;

    ctor(horseData, rangeType, recordAttr, horseEquipItem) {
        this._lastAttr = {};
        this._difAttr = {};
        this._horseData = horseData;
        this._rangeType = rangeType;
        this._recordAttr = recordAttr;
        this._horseEquipItem = horseEquipItem;
    }

    onCreate() {
        this.setSceneSize();
    }

    onEnter() {
        this._singleHorseEquipAddSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_EQUIP_ADD_SUCCESS, handler(this, this._horseEquipAddSuccess));
        this._updateInfo();
    }

    onExit() {
        this._singleHorseEquipAddSuccess.remove();
        this._singleHorseEquipAddSuccess = null;
    }

    _updateInfo() {
        var horseData = this._horseData;
        var horseBaseId = horseData.getBase_id();
        var star = horseData.getStar();
        var horseParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseBaseId);
        var heroBaseId = HorseDataHelper.getHeroBaseIdWithHorseId(horseData.getId());
        if (heroBaseId == null) {
            this._textFrom.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
            this._textFrom.string = (Lang.get('horse_detail_from', { name: heroParam.name }));
        }
        var horseName = HorseDataHelper.getHorseName(horseBaseId, star);
        this._textName.string =(horseName);
        this._textName.node.color = (horseParam.icon_color);
        this._textDetailName.string =(horseName);
        this._textDetailName.node.color = (horseParam.icon_color);
        this._nodeStar.setCount(horseData.getStar(), HorseConst.HORSE_STAR_MAX);
        this._updateListView();
    }

    _updateListView() {
        this._listView.removeAllChildren();
        this._buildAttrModule();
        this._buildSkillModule();
        this._buildRideModule();
        this._buildBriefModule();
    }

    _buildAttrModule() {
        this._attrItem = cc.instantiate(this._horseDetailAttrNodePrefab).getComponent(HorseDetailAttrNode);
        this._attrItem.ctor(this._horseData, this._rangeType, this._recordAttr);
        this._listView.pushBackCustomItem(this._attrItem.node);
    }

    _buildSkillModule() {
        var item = cc.instantiate(this._horseDetailSkillNodePrefab).getComponent(HorseDetailSkillNode);
        item.ctor(this._horseData);
        this._listView.pushBackCustomItem(item.node);
    }

    _buildRideModule() {
        var item = cc.instantiate(this._horseDetailRideNodePrefab).getComponent(HorseDetailRideNode);
        item.ctor(this._horseData);
        this._listView.pushBackCustomItem(item.node);
    }

    _buildBriefModule() {
        var item = cc.instantiate(this._horseDetailBriefNodePrefab).getComponent(HorseDetailBriefNode);
        item.ctor(this._horseData);
        this._listView.pushBackCustomItem(item.node);
    }

    _horseEquipAddSuccess(event, equipPos) {
        this._horseEquipItem.updateHorseEquip(equipPos);
        var attrInfo = HorseDataHelper.getHorseAttrInfo(this._horseData);
        this._recordAttr.updateData(attrInfo);
        this._attrItem.playBaseAttrPromptSummary(this._recordAttr);
    }

    updateHorseEquipDifPrompt() {
        var refresh = false;
        if (!this._horseData.isInBattle()) {
            refresh = true;
        }
        this._attrItem.playBaseAttrPromptSummary(this._recordAttr, refresh);
    }

}