const { ccclass, property } = cc._decorator;

import { HeroUnitData } from '../../data/HeroUnitData';
import { G_UserData } from '../../init';
import HeroDetailAttrModule from '../../scene/view/heroDetail/HeroDetailAttrModule';
import HeroDetailAwakeModule from '../../scene/view/heroDetail/HeroDetailAwakeModule';
import HeroDetailBriefModule from '../../scene/view/heroDetail/HeroDetailBriefModule';
import HeroDetailJointModule from '../../scene/view/heroDetail/HeroDetailJointModule';
import HeroDetailKarmaModule from '../../scene/view/heroDetail/HeroDetailKarmaModule';
import HeroDetailSkillModule from '../../scene/view/heroDetail/HeroDetailSkillModule';
import HeroDetailTalentModule from '../../scene/view/heroDetail/HeroDetailTalentModule';
import HeroDetailWeaponModule from '../../scene/view/heroDetail/HeroDetailWeaponModule';
import HeroDetailYokeModule from '../../scene/view/heroDetail/HeroDetailYokeModule';
import { AvatarDataHelper } from '../../utils/data/AvatarDataHelper';
import { HeroDataHelper } from '../../utils/data/HeroDataHelper';
import { Path } from '../../utils/Path';
import { TypeConvertHelper } from '../../utils/TypeConvertHelper';
import { CommonDetailBaseView } from './CommonDetailBaseView';
import { CommonDetailModule } from './CommonDetailModule';
import CommonDetailWindow from './CommonDetailWindow';
import CommonHeroName from './CommonHeroName';



var MODULE_KEY = [
    '_jointModule',
    '_skillModule',
    '_talentModule',
    '_weaponModule',
    '_karmaModule',
    '_yokeModule',
    '_awakeModule',
    '_briefModule'
];
@ccclass
export default class CommonHeroProperty extends CommonDetailBaseView {

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

    @property({
        type: CommonHeroName,
        visible: true
    })
    _heroName2: CommonHeroName = null;

    private _heroUnitData: HeroUnitData;
    private _limitLevel: number;
    private _rangeType: number;

    private _modules: Array<any> = [];

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
    _limitRedLevel: any;

    onCreate(): void {
        this._heroDetailAttrModule = cc.resources.get(Path.getPrefab("HeroDetailAttrModule", "heroDetail"));
        this._heroDetailJointModule = cc.resources.get(Path.getPrefab("HeroDetailJointModule", "heroDetail"));
        this._heroDetailSkillModule = cc.resources.get(Path.getPrefab("HeroDetailSkillModule", "heroDetail"));
        this._heroDetailWeaponModule = cc.resources.get(Path.getPrefab("HeroDetailWeaponModule", "heroDetail"));
        this._heroDetailTalentModule = cc.resources.get(Path.getPrefab("HeroDetailTalentModule", "heroDetail"));
        this._heroDetailKarmaModule = cc.resources.get(Path.getPrefab("HeroDetailKarmaModule", "heroDetail"));
        this._heroDetailYokeModule = cc.resources.get(Path.getPrefab("HeroDetailYokeModule", "heroDetail"));
        this._heroDetailBriefModule = cc.resources.get(Path.getPrefab("HeroDetailBriefModule", "heroDetail"));
        this._heroDetailAwakeModule = cc.resources.get(Path.getPrefab("HeroDetailAwakeModule", "heroDetail"));
    }

    public onEnter() {

    }

    public onExit() {

    }

    /**
     *  
        
     */


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
            this._jointModule.setInitData(heroUnitData, true);
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

    buildTalentModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        if (heroUnitData.isCanBreak()) {
            var node1 = cc.instantiate(this._heroDetailTalentModule) as cc.Node;
            this._talentModule = node1.getComponent(HeroDetailTalentModule) as HeroDetailTalentModule;
            this._talentModule.setInitData(heroUnitData, null, this._limitLevel, null, null, this._limitRedLevel);
            return this._talentModule;
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

    buildKarmaModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        var node1 = cc.instantiate(this._heroDetailKarmaModule) as cc.Node;
        var isRedOrGold = (this._limitLevel && this._limitLevel > 0) || heroUnitData.getConfig().color >= 6 || (this._limitRedLevel && this._limitRedLevel > 0);
        this._karmaModule = node1.getComponent(HeroDetailKarmaModule) as HeroDetailKarmaModule;
        this._karmaModule.setInitData(heroUnitData, null, isRedOrGold);
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
        if (this._heroUnitData.isPureGoldHero()) {
            return;
        }
        var heroUnitData = this._heroUnitData;
        if (heroUnitData.isCanAwake()) {
            var node1 = cc.instantiate(this._heroDetailAwakeModule) as cc.Node;
            this._awakeModule = node1.getComponent(HeroDetailAwakeModule) as HeroDetailAwakeModule;
            this._awakeModule.setInitData(heroUnitData, this._rangeType);
            return this._awakeModule
        }
    }
    buildBriefModule(): CommonDetailModule {
        var heroUnitData = this._heroUnitData;
        var node1 = cc.instantiate(this._heroDetailBriefModule) as cc.Node;
        this._briefModule = node1.getComponent(HeroDetailBriefModule) as HeroDetailBriefModule
        this._briefModule.setInitData(heroUnitData);

        return this._briefModule;
    }
    _resetModules() {
        this._modules = [];
        for (var i in MODULE_KEY) {
            var key = MODULE_KEY[i];
            this[key] = null;
        }
    }
    _updateListView() {
        this._listView.content.removeAllChildren();
        this._resetModules();
        this._sectionInfoes = [
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
        // this.buildBriefModule();
        // if (!this._heroUnitData.isPureGoldHero()) {
        //     this.buildAwakeModule();
        // }
        // this.buildYokeModule();
        // this.buildKarmaModule();
        // this.buildWeaponModule();
        // this.buildTalentModule();
        // this.buildSkillModule();
        // this.buildJointModule();
    }
    updateUI(heroId, heroBaseId, rangeType, limitLevel, limitRedLevel) {
        var rank = 0;
        if (heroId) {
            this._heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            rank = this._heroUnitData.getRank_lv();
        } else {
            var data = { baseId: heroBaseId };
            this._heroUnitData = G_UserData.getHero().createTempHeroUnitData(data);
        }
        this._rangeType = rangeType;
        this._limitLevel = limitLevel;
        this._limitRedLevel = limitRedLevel;
        var moduleKey = this._getModuleKey();
        this._updateListView();
        var ret = this._getLocationIndex(moduleKey);
        var index = ret[0]
        var isInBottom = ret[1];
        if (isInBottom) {
            this._listView.scrollToTop();
        } else {
            // this._listView.jumpToItem(index, new cc.Vec2(0, 1), new cc.Vec2(0, 1));
            // this._listView.scrollTo()
        }
        this._heroName2.setName(this._heroUnitData.getBase_id(), rank, limitLevel, null, limitRedLevel);
    }
    _getModuleKey() {
        var offset = this._listView.getContentPosition();
        var posY = offset.y;
        var targetHeight = 0 - posY + this._listView.content.getContentSize().height / 2;
        var modules = [];
        for (var i in MODULE_KEY) {
            var key = MODULE_KEY[i];
            if (this[key]) {
                modules.push(key);
            }
        }
        var height = 0;
        var index = 1;
        for (var j = modules.length - 1; j >= 0; j--) {
            var key1 = modules[j];
            height = height + this[key1].node.getContentSize().height;
            if (height > targetHeight) {
                index = j;
                break;
            }
        }
        var moduleKey = modules[index];
        return moduleKey;
    }
    _getLocationIndex(moduleKey): Array<any> {
        var index = 0;
        var isInBottom = false;
        var modules = [];
        for (var i in MODULE_KEY) {
            var key = MODULE_KEY[i];
            if (this[key]) {
                modules.push(key);
            }
        }
        for (i in modules) {
            var key1 = modules[i];
            if (key1 == moduleKey) {
                index = Math.max(0, parseInt(i) - 1);
                break;
            }
        }
        var height = 0;
        for (var j = modules.length - 1; j >= index; j--) {
            var key1 = modules[j];
            height = height + this[key1].node.getContentSize().height;
        }
        if (height < this._listView.content.getContentSize().height) {
            isInBottom = true;
        }
        return [
            index,
            isInBottom
        ];
    }

}