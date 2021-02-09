const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { G_SignalManager, G_UserData } from '../../../init';
import { CommonDetailBaseView } from '../../../ui/component/CommonDetailBaseView';
import { CommonDetailModule } from '../../../ui/component/CommonDetailModule';
import CommonHeroCountry from '../../../ui/component/CommonHeroCountry';
import CommonHeroName from '../../../ui/component/CommonHeroName';
import CommonHeroStar from '../../../ui/component/CommonHeroStar';
import CommonVerticalText from '../../../ui/component/CommonVerticalText';
import ScrollViewExtra from '../../../ui/component/ScrollViewExtra';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import HeroGoldHelper from '../heroGoldTrain/HeroGoldHelper';
import HeroTrainHelper from '../heroTrain/HeroTrainHelper';
import HeroDetailAttrModule from './HeroDetailAttrModule';
import HeroDetailAwakeModule from './HeroDetailAwakeModule';
import HeroDetailBriefModule from './HeroDetailBriefModule';
import HeroDetailJointModule from './HeroDetailJointModule';
import HeroDetailKarmaModule from './HeroDetailKarmaModule';
import HeroDetailSkillModule from './HeroDetailSkillModule';
import HeroDetailTalentModule from './HeroDetailTalentModule';
import HeroDetailWeaponModule from './HeroDetailWeaponModule';
import HeroDetailYokeModule from './HeroDetailYokeModule';
import HeroDetailView from './HeroDetailView';



@ccclass
export default class HeroDetailBaseView extends CommonDetailBaseView {

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

    @property({
        type: CommonHeroCountry,
        visible: true
    })
    _fileNodeCountry: CommonHeroCountry = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _fileNodeStar: CommonHeroStar = null;

    @property({
        type: CommonVerticalText,
        visible: true
    })
    _fileNodeFeature: CommonVerticalText = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName2: CommonHeroName = null;

    // @property({
    //     type: cc.ScrollView,
    //     visible: true
    // })
    // _listView: cc.ScrollView = null;

    //以下预制体需要实例化
    private _heroDetailAttrModule;
    private _heroDetailJointModule;
    private _heroDetailSkillModule;
    private _heroDetailWeaponModule;
    private _heroDetailTalentModule;
    private _heroDetailKarmaModule;
    private _heroDetailYokeModule;
    private _heroDetailAwakeModule;
    private _heroDetailBriefModule;

    private _attrModule: HeroDetailAttrModule;
    private _jointModule: HeroDetailJointModule;
    private _weaponModule: HeroDetailWeaponModule;
    private _talentModule: HeroDetailTalentModule;
    private _karmaModule: HeroDetailKarmaModule;
    private _yokeModule: HeroDetailYokeModule;
    private _awakeModule: HeroDetailAwakeModule;
    private _briefModule: HeroDetailBriefModule;
    _parentView: HeroDetailView;

    constructor() {
        super();
    }

    private _rangeType: number;
    private _heroUnitData: HeroUnitData;
    private _signalHeroKarmaActive;
    public setInitData(heroId, heroBaseId, rangeType, parentView): void {
        if (heroId) {
            this._heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        } else {
            var data = { baseId: heroBaseId };
            this._heroUnitData = G_UserData.getHero().createTempHeroUnitData(data);
        }
        this._rangeType = rangeType;
        this._parentView = parentView;
    }

    onCreate() {
        this.setSceneSize();

        this._heroDetailAttrModule = cc.resources.get(Path.getPrefab("HeroDetailAttrModule", "heroDetail"));
        this._heroDetailJointModule = cc.resources.get(Path.getPrefab("HeroDetailJointModule", "heroDetail"));
        this._heroDetailSkillModule = cc.resources.get(Path.getPrefab("HeroDetailSkillModule", "heroDetail"));
        this._heroDetailWeaponModule = cc.resources.get(Path.getPrefab("HeroDetailWeaponModule", "heroDetail"));
        this._heroDetailTalentModule = cc.resources.get(Path.getPrefab("HeroDetailTalentModule", "heroDetail"));
        this._heroDetailKarmaModule = cc.resources.get(Path.getPrefab("HeroDetailKarmaModule", "heroDetail"));
        this._heroDetailYokeModule = cc.resources.get(Path.getPrefab("HeroDetailYokeModule", "heroDetail"));
        this._heroDetailBriefModule = cc.resources.get(Path.getPrefab("HeroDetailBriefModule", "heroDetail"));
        this._heroDetailAwakeModule = cc.resources.get(Path.getPrefab("HeroDetailAwakeModule", "heroDetail"));

        this._listView.node.addComponent(ScrollViewExtra);
        this._listView.scrollEvents = [];
        this._updateInfo();

    }

    onEnter() {
        this._signalHeroKarmaActive = G_SignalManager.add(SignalConst.EVENT_HERO_KARMA_ACTIVE_SUCCESS, handler(this, this._heroKarmaActiveSuccess));
    }
    onExit() {
        this._signalHeroKarmaActive.remove();
        this._signalHeroKarmaActive = null;
    }

    buildAttrModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        var node1 = cc.instantiate(this._heroDetailAttrModule) as cc.Node;
        this._attrModule = node1.getComponent(HeroDetailAttrModule) as HeroDetailAttrModule;
        this._attrModule.setInitData(heroUnitData, this._rangeType);
        return this._attrModule;
    }

    buildJointModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        var heroBaseId = heroUnitData.getBase_id();
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        if (heroParam.cfg.skill_3_type != 0) {
            var node1 = cc.instantiate(this._heroDetailJointModule);
            this._jointModule = node1.getComponent(HeroDetailJointModule) as HeroDetailJointModule;
            this._jointModule.setInitData(this._heroUnitData);
            return this._jointModule;
        }
    }
    buildSkillModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        var skillIds = [];
        var showSkillIds = AvatarDataHelper.getShowSkillIdsByCheck(heroUnitData);
        for (var i = 1; i <= 3; i++) {
            var skillId = showSkillIds[i];
            if (skillId > 0) {
                skillIds.push(skillId);
            }
        }
        if (skillIds.length > 0) {
            var node2 = cc.instantiate(this._heroDetailSkillModule) as cc.Node;
            var skillModule = node2.getComponent(HeroDetailSkillModule) as HeroDetailSkillModule;
            skillModule.setInitData(skillIds);
            return skillModule;
        }
    }
    buildWeaponModule(): CommonDetailModule {
        var baseId = this._heroUnitData.getConfig().instrument_id;
        if (baseId > 0) {
            var node1 = cc.instantiate(this._heroDetailWeaponModule) as cc.Node;
            this._weaponModule = node1.getComponent(HeroDetailWeaponModule) as HeroDetailWeaponModule;
            this._weaponModule.setInitData(this._heroUnitData);
            return this._weaponModule;
        }
    }
    buildTalentModule(): CommonDetailModule {
        if (this._heroUnitData.isCanBreak()) {
            var node1 = cc.instantiate(this._heroDetailTalentModule) as cc.Node;
            this._talentModule = node1.getComponent(HeroDetailTalentModule) as HeroDetailTalentModule;
            this._talentModule.setInitData(this._heroUnitData);
            return this._talentModule;
        }
    }
    buildKarmaModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        var node1 = cc.instantiate(this._heroDetailKarmaModule) as cc.Node;
        this._karmaModule = node1.getComponent(HeroDetailKarmaModule) as HeroDetailKarmaModule;
        this._karmaModule.setInitData(heroUnitData, this._rangeType);
        return this._karmaModule;
    }
    buildYokeModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        var heroYoke = HeroDataHelper.getHeroYokeInfo(heroUnitData);
        if (heroYoke) {
            var node1 = cc.instantiate(this._heroDetailYokeModule) as cc.Node;
            this._yokeModule = node1.getComponent(HeroDetailYokeModule) as HeroDetailYokeModule;
            this._yokeModule.setInitData(heroYoke);
            return this._yokeModule;
        }
    }

    buildDestinyModule() {
    }
    buildAwakeModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        if (heroUnitData.isCanAwake()) {
            var node1 = cc.instantiate(this._heroDetailAwakeModule) as cc.Node;
            this._awakeModule = node1.getComponent(HeroDetailAwakeModule) as HeroDetailAwakeModule;
            this._awakeModule.setInitData(heroUnitData, this._rangeType);
            return this._awakeModule;
        }
    }
    buildBriefModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        var node1 = cc.instantiate(this._heroDetailBriefModule) as cc.Node;
        this._briefModule = node1.getComponent(HeroDetailBriefModule) as HeroDetailBriefModule
        this._briefModule.setInitData(heroUnitData);
        return this._briefModule;
    }
    _updateInfo() {
        var heroUnitData = this._heroUnitData;
        var heroBaseId = heroUnitData.getBase_id();
        var rank = heroUnitData.getRank_lv();
        var limitLevel = heroUnitData.getLimit_level();
        var limitRedLevel = heroUnitData.getLimit_rtg();
        this._fileNodeHeroName.setName(heroBaseId, rank, limitLevel, null, limitRedLevel);
        this._fileNodeHeroName2.setName(heroBaseId, rank, limitLevel, true, limitRedLevel);
        this._fileNodeCountry.updateUI(heroBaseId);
        this._fileNodeFeature.setString(heroUnitData.getConfig().feature);
        var canAwake = heroUnitData.isCanAwake();
        var isOpen = HeroTrainHelper.checkIsReachAwakeInitLevel(heroUnitData);
        var isGold = HeroGoldHelper.isPureHeroGold(heroUnitData);
        var isShow = canAwake && isOpen && !isGold;
        this._fileNodeStar.node.active = (isShow);
        if (this._parentView) {
            this._parentView._fileNodeStar.node.active = (isShow);
        }
        if (isShow) {
            var awakeLevel = heroUnitData.getAwaken_level();
            var ret = HeroDataHelper.convertAwakeLevel(awakeLevel);
            var star = ret[0];
            var level = ret[1]
            this._fileNodeStar.setStarOrMoon(star);
            if (this._parentView) {
                this._parentView._fileNodeStar.setStarOrMoon(star);
            }
        }
        this._updateListView();

    }
    _updateListView() {
        this._listView.content.removeAllChildren();
        this._sectionInfoes = [
            {
                buildFunc: this.buildAttrModule,
            },
            {
                buildFunc: this.buildJointModule,
            },
            {
                buildFunc: this.buildSkillModule,
            },
            {
                buildFunc: this.buildTalentModule,
            },
            {
                buildFunc: this.buildWeaponModule,
            },
            {
                buildFunc: this.buildKarmaModule,
            },
            {
                buildFunc: this.buildYokeModule,
            },
            {
                buildFunc: this.buildAwakeModule,
            },
            {
                buildFunc: this.buildBriefModule,
            },
        ];

        this.startDraw();
    }

    _heroKarmaActiveSuccess() {
        if (this._karmaModule) {
            this._karmaModule.updateData(this._heroUnitData);
        }
    }
}