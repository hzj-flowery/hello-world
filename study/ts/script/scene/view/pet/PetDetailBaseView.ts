const { ccclass, property } = cc._decorator;

import CommonHeroStar from '../../../ui/component/CommonHeroStar'

import CommonHeroName from '../../../ui/component/CommonHeroName'
import { G_UserData, G_ResolutionManager } from '../../../init';
import { Path } from '../../../utils/Path';
import PetDetailAttrModule from './PetDetailAttrModule';
import PetDetailStarModule from './PetDetailStarModule';
import PetDetailSkillModule from './PetDetailSkillModule';
import PetDetailTalentModule from './PetDetailTalentModule';
import PetDetailBriefModule from './PetDetailBriefModule';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonCustomListView from '../../../ui/component/CommonCustomListView';
import { PetDataHelper } from '../../../utils/data/PetDataHelper';
import ViewBase from '../../ViewBase';

@ccclass
export default class PetDetailBaseView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName: CommonHeroName = null;

    @property(cc.Node)
    Panel_5: cc.Node = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _fileNodeStar: CommonHeroStar = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName2: CommonHeroName = null;
    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;
    @property(cc.Prefab)
    detailAttrModule: cc.Prefab = null;

    @property(cc.Node)
    detailSkillModule: cc.Node = null;

    @property(cc.Node)
    talentModule: cc.Node = null;

    @property(cc.Node)
    briefModule: cc.Node = null;

    _petUnitData: any;
    _rangeType: any;
    private _attrModule: PetDetailAttrModule;
    public get attrModule(): PetDetailAttrModule {
        return this._attrModule;
    }
    private _talentModule: PetDetailTalentModule;
    private _briefModule: PetDetailBriefModule;


    ctor(petId, petBaseId, rangeType) {
        if (petId) {
            this._petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
        } else {
            var data = { baseId: petBaseId };
            this._petUnitData = G_UserData.getPet().createTempPetUnitData(data);
        }
        this._rangeType = rangeType;
    }
    onCreate() {
        this._updateInfo();
        this.setSceneSize(null, false);
    }

    onEnter() {
    }

    onExit() {
    }

    buildAttrModule() {
        var petUnitData = this._petUnitData;
        this._attrModule = cc.instantiate(this.detailAttrModule).getComponent(PetDetailAttrModule);
        this._attrModule.ctor(petUnitData, this._rangeType);
        this._attrModule.showButton(true);
        this._listView.pushBackCustomItem(this._attrModule.node);
    }
    // buildStarModule() {
    //     var petUnitData = this._petUnitData;
    //     this._starModule = cc.instantiate(this.starModule).getComponent(PetDetailStarModule);
    //     this._starModule.ctor(petUnitData, this._rangeType);
    //     this._listView.pushBackCustomItem(_starModule);
    // }
    buildSkillModule() {
        var petUnitData = this._petUnitData;
        var rank = petUnitData.getStar();
        var showSkillIds = PetDataHelper.getPetSkillIds(petUnitData.getBase_id(), rank);
        if (showSkillIds.length > 0) {
            var skillModule = cc.instantiate(this.detailSkillModule).getComponent(PetDetailSkillModule);
            skillModule.ctor(showSkillIds, true, petUnitData.getBase_id(), rank);
            skillModule.onCreate();
            this._listView.pushBackCustomItem(skillModule.node);
        }
    }
    buildTalentModule() {
        var petUnitData = this._petUnitData;
        if (petUnitData.isCanBreak()) {
            this._talentModule = cc.instantiate(this.talentModule).getComponent(PetDetailTalentModule);
            this._talentModule.ctor(petUnitData);
            this._listView.pushBackCustomItem(this._talentModule.node);
        }
    }
    buildBriefModule() {
        var petUnitData = this._petUnitData;
        this._briefModule = cc.instantiate(this.briefModule).getComponent(PetDetailBriefModule);
        this._briefModule.ctor(petUnitData);
        this._listView.pushBackCustomItem(this._briefModule.node);
    }
    _updateInfo() {
        var petUnitData = this._petUnitData;
        var petBaseId = petUnitData.getBase_id();
        this._fileNodeHeroName.setConvertType(TypeConvertHelper.TYPE_PET);
        this._fileNodeHeroName2.setConvertType(TypeConvertHelper.TYPE_PET);
        this._fileNodeHeroName.setName(petBaseId, 0);
        this._fileNodeHeroName2.setName(petBaseId, 0);
        this._fileNodeStar.setCount(petUnitData.getStar());
        this._updateListView();
    }
    _updateListView() {
        this._listView.removeAllChildren();
        this.buildAttrModule();
        this.buildSkillModule();
        this.buildTalentModule();
        this.buildBriefModule();
        //   this._listView.doLayout();
    }
}