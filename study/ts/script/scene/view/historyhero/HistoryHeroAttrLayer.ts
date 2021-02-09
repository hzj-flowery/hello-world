import { HistoryHeroConst } from "../../../const/HistoryHeroConst";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import CommonDetailWindow from "../../../ui/component/CommonDetailWindow";
import { HistoryHeroDataHelper } from "../../../utils/data/HistoryHeroDataHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import HistoryHeroDetailAttrModule from "./HistoryHeroDetailAttrModule";
import HistoryHeroDetailAwakenModule from "./HistoryHeroDetailAwakenModule";
import HistoryHeroDetailDescModule from "./HistoryHeroDetailDescModule";
import HistoryHeroDetailSkillModule from "./HistoryHeroDetailSkillModule";
import HistoryHeroDetailWeaponModule from "./HistoryHeroDetailWeaponModule";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroAttrLayer extends cc.Component {
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

    @property(HistoryHeroDetailAttrModule)
    attrModule: HistoryHeroDetailAttrModule = null;
    @property(HistoryHeroDetailSkillModule)
    skillModule: HistoryHeroDetailSkillModule = null;

    @property(HistoryHeroDetailWeaponModule)
    weaponModule: HistoryHeroDetailWeaponModule = null;

    @property(HistoryHeroDetailAwakenModule)
    awakenModule: HistoryHeroDetailAwakenModule = null;

    @property(HistoryHeroDetailDescModule)
    descModule: HistoryHeroDetailDescModule = null;
    _weaponData: any;


    onEnter() {
    }
    onExit() {
    }
    updateUI(data) {
        if (data == null) {
            return;
        }
        this._listView.removeAllChildren();
        this._updateAttrModule(data.getSystem_id(), data.getBreak_through());
        this._updateSkillDesc(data.getSystem_id(), data.getBreak_through());
        this._updateWeapon(data.getSystem_id());
        this._updateAwaken(data.getSystem_id());
        this._updateDesc(data.getSystem_id());
    }
    updateUIForNoraml(systemId) {
        if (systemId == null) {
            return;
        }
        this._listView.removeAllChildren();
        this._updateAttrModule(systemId, 1);
        this._updateSkillDesc(systemId, 1);
        this._updateWeapon(systemId);
        this._updateAwaken(systemId);
        this._updateDesc(systemId);
    }
    _updateAttrModule(baseId, breakthrough) {
        var stepCfg = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(baseId, breakthrough);
        if (stepCfg == null) {
            return;
        }
        this.attrModule.updateUI(stepCfg);
        this._listView.pushBackCustomItem(this.attrModule.node);
    }
    _updateSkillDesc(baseId, breakthrough) {
        var skilist = HistoryHeroDataHelper.getHistoricalSkills(baseId);
        if (skilist.length > 0) {
            this.skillModule.ctor(skilist, breakthrough);
            this._listView.pushBackCustomItem(this.skillModule.node);
        }
    }
    _updateWeapon(baseId) {
        this.weaponModule.ctor(baseId);
        this._listView.pushBackCustomItem(this.weaponModule.node);
    }
    _updateAwaken(baseId) {
        var heroInfoCfg = HistoryHeroDataHelper.getHistoryHeroInfo(baseId);
        if (heroInfoCfg.color == HistoryHeroConst.QUALITY_ORANGE) {
            this.awakenModule.node.active = true;
            var costList = HistoryHeroDataHelper.getHistoricalAwakenCostList(baseId);
            this.awakenModule.ctor(costList);
            this._listView.pushBackCustomItem(this.awakenModule.node);
        }
    }
    _updateDesc(baseId) {
        var historyHeroInfo = HistoryHeroDataHelper.getHistoryHeroInfo(baseId);
        this.descModule.ctor(historyHeroInfo);
        this._listView.pushBackCustomItem(this.descModule.node);
    }

    setName(heroBaseId) {
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO, heroBaseId);
        this._name2.string = (heroParam.name);
        this._name2.node.color = (heroParam.icon_color);
    }

}