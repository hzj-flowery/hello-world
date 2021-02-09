const { ccclass, property } = cc._decorator;

import HistoryWeaponDetailHeroModule from '../../scene/view/historyhero/HistoryWeaponDetailHeroModule';
import HistoryWeaponDetailHeroNode from '../../scene/view/historyhero/HistoryWeaponDetailHeroNode';
import HistoryWeaponDetailSkillNode from '../../scene/view/historyhero/HistoryWeaponDetailSkillNode';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import CommonCustomListView from './CommonCustomListView';
import CommonDetailWindow from './CommonDetailWindow'

@ccclass
export default class CommonHistoryWeaponProperty extends cc.Component {

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

    @property(HistoryWeaponDetailHeroModule)
    heroModule: HistoryWeaponDetailHeroModule = null;

    @property(HistoryWeaponDetailSkillNode)
    skillNode: HistoryWeaponDetailSkillNode = null;
    _weaponData: any;

    _buildSkillModule() {
        // var historyWeaponDetailSkillNode = cc.instantiate(this.heroModule).getComponent(HistoryWeaponDetailHeroModule);
        this.skillNode.ctor(this._weaponData)
        this._listView.pushBackCustomItem(this.skillNode.node);
    }
    _buildHeroModule() {
        this.heroModule.ctor(this._weaponData);
        this._listView.pushBackCustomItem(this.heroModule.node);
    }
    _updateListView() {
        this._listView.removeAllChildren();
        this._buildSkillModule();
        this._buildHeroModule();
    }
    updateUI(weaponData) {
        this._weaponData = weaponData;
        this._updateListView();
        var weaponId = weaponData.getId();
        this.setName(weaponId);
    }
    setName(weaponId) {
        var weaponParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, weaponId);
        this._name2.string = (weaponParam.name);
        this._name2.node.color = (weaponParam.icon_color);
    }

}