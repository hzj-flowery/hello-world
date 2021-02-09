const {ccclass, property} = cc._decorator;

import CommonHeroName from './CommonHeroName'

import CommonDetailWindow from './CommonDetailWindow'
import CommonCustomListView from './CommonCustomListView';
import { G_UserData } from '../../init';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import PetDetailAttrModule from '../../scene/view/pet/PetDetailAttrModule';
import { UserDataHelper } from '../../utils/data/UserDataHelper';
import PetDetailSkillModule from '../../scene/view/pet/PetDetailSkillModule';
import PetDetailTalentModule from '../../scene/view/pet/PetDetailTalentModule';
import PetDetailBriefModule from '../../scene/view/pet/PetDetailBriefModule';

@ccclass
export default class CommonPetProperty extends cc.Component {

    @property({
        type: CommonDetailWindow,
        visible: true
    })
    _commonDetailWindow: CommonDetailWindow = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _name2: CommonHeroName = null;

    @property(CommonCustomListView)
    listView:CommonCustomListView = null;

    @property(cc.Prefab)
    detailAttrModule:cc.Prefab = null;

    @property(cc.Node)
    detailSkillModule:cc.Node = null;

    @property(cc.Node)
    talentModule:cc.Node = null;

    @property(cc.Node)
    briefModule:cc.Node = null;

    private _petUnitData:any;
    private _rangeType:any;
    private _attrModule:PetDetailAttrModule;
    private _skillModule:PetDetailSkillModule;
    private _talentModule:PetDetailTalentModule;
    private _briefModule:PetDetailBriefModule;

    private MODULE_KEY = [
        '_attrModule',
        '_skillModule',
        '_talentModule',
        '_briefModule'
    ];

    onLoad(){
        this._init();
    }

    _init() {
        this._name2.setConvertType(TypeConvertHelper.TYPE_PET);
    }

    buildAttrModule() {
        var petUnitData = this._petUnitData;
        var node = cc.instantiate(this.detailAttrModule);
        this._attrModule = node.getComponent(PetDetailAttrModule);
        this._attrModule.ctor(petUnitData, this._rangeType);
        this._attrModule.onCreate();
        this.listView.pushBackCustomItem(this._attrModule.node);
    }
    buildSkillModule() {
        var petUnitData = this._petUnitData;
        var star = 0;
        if (petUnitData.getConfig().potential_before > 0) {
            star = 1;
        }else {
            star = petUnitData.getInitial_star();
        }
        var skillIds = [];
        var petStarConfig = UserDataHelper.getPetStarConfig(petUnitData.getBase_id(), star);
        for (var i = 1; i<=2; i++) {
            var skillId = petStarConfig['skill' + i];
            if (skillId != 0) {
                skillIds.push(skillId);
            }
        }
        if (skillIds.length > 0) {
            var node = cc.instantiate(this.detailSkillModule);
            this._skillModule = node.getComponent(PetDetailSkillModule);
            this._skillModule.ctor(skillIds, false, petUnitData.getBase_id(), star);
            this._skillModule.onCreate();
            this.listView.pushBackCustomItem(this._skillModule.node);
        }
    }
    buildTalentModule() {
        var petUnitData = this._petUnitData;
        var node = cc.instantiate(this.talentModule);
        this._talentModule = node.getComponent(PetDetailTalentModule);
        this._talentModule.ctor(petUnitData);
        // this._talentModule = new PetDetailTalentModule(petUnitData);
        this.listView.pushBackCustomItem(this._talentModule.node);
    }
    buildBriefModule() {
        var petUnitData = this._petUnitData;
        var node = cc.instantiate(this.briefModule);
        this._briefModule = node.getComponent(PetDetailBriefModule);
        this._briefModule.ctor(petUnitData);
        // this._briefModule = new PetDetailBriefModule(petUnitData);
        this.listView.pushBackCustomItem(this._briefModule.node);
    }
    _resetModules() {
        for (let i=0; i<this.MODULE_KEY.length; i++) {
            var key = this.MODULE_KEY[i];
            this[key] = null;
        }
    }
    _updateListView() {
        this.listView.removeAllChildren();
        this._resetModules();
        this.buildAttrModule();
        this.buildSkillModule();
        this.buildTalentModule();
        this.buildBriefModule();
    }
    updateUI(petId, petBaseId, rangeType?) {
        var star = 0;
        if (petId) {
            this._petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
            star = this._petUnitData.getStar();
        } else {
            var data = { baseId: petBaseId };
            this._petUnitData = G_UserData.getPet().createTempPetUnitData(data);
        }
        this._rangeType = rangeType;
        var moduleKey = this._getModuleKey();
        this._updateListView();
        var [offset, isInBottom] = this._getLocationIndex(moduleKey);
        if (isInBottom) {
            this.listView.scrollToBottom();
        } else {
            this.listView.scrollToOffset(cc.v2(0,(offset as number)));
        }
        this._name2.setName(this._petUnitData.getBase_id(), star);
    }
    _getModuleKey() {
        var offset:cc.Vec2 = this.listView.getScrollOffset();
        var posY = offset.y;
        var targetHeight = this.listView.node.getContentSize().height - posY;
        var modules = [];
        for (var i=0; i<this.MODULE_KEY.length; i++) {
            var key = this.MODULE_KEY[i];
            if (this[key]) {
                modules.push(key);
            }
        }
        var height = 0;
        var index = 1;
        for (var i = modules.length; i>=1; i--) {
            var key1 = modules[i-1];
            height = height + this[key1].node.getContentSize().height;
            if (height > targetHeight) {
                index = i;
                break;
            }
        }
        var moduleKey = modules[index-1];
        return moduleKey;
    }
    _getLocationIndex(moduleKey) {
        var index = 0;
        var isInBottom = false;
        var modules = [];
        for (let i in this.MODULE_KEY) {
            var key = this.MODULE_KEY[i];
            if (this[key]) {
                modules.push(key);
            }
        }
        for (let i=0; i<modules.length; i++) {
            var key1 = modules[i];
            if (key1 == moduleKey) {
                index = Math.max(0, i);
                break;
            }
        }
        var height = 0;
        for (var i = modules.length-1; i >= index; i--) {
            var key2 = modules[i];
            height = height + this[key2].node.getContentSize().height;
        }
        var targetHeight:number = this.listView.node.getContentSize().height - height;
        if (height < this.listView.node.getContentSize().height) {
            isInBottom = true;
        }
        return [
            targetHeight,
            isInBottom
        ];
    }

}
