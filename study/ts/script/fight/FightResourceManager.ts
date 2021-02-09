import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_AudioManager, G_ConfigLoader, G_SpineManager, G_UserData } from "../init";
import { BattleDataHelper } from "../utils/data/BattleDataHelper";
import { PrioritySignal } from "../utils/event/PrioritySignal";
import { Path } from "../utils/Path";
import ResourceLoader from "../utils/resource/ResourceLoader";
import { ReportData } from "./report/ReportData";
import { assert } from "../utils/GlobleFunc";
import { HeroConst } from "../const/HeroConst";
import { FightConfig } from "./FightConfig";

export class FightResourceManager {
    private sceneName: string;

    public signalFinish: PrioritySignal;
    private _report: ReportData;
    private _battleData: any;

    private _soundList: string[]
    private _loadedNum: number;
    private _loadSpines: string[];
    private _loadSkillJsons: { [key: string]: any };

    private _otherResTypeArray: typeof cc.Asset[] = [cc.SpriteFrame, cc.SpriteAtlas, cc.LabelAtlas, cc.Prefab];
    private _loadOtherResArray: { [key: number]: string[] } =
        {
            0: [
                Path.getTextBattle("zhuangtai_teshu_b_01shanbi"),
                Path.getTextBattle("txt_battle_crit"),
                Path.getTextBattle("txt_battle_heal"),
                Path.getTextBattle("gedang"),
                Path.getTextBattle("zhuangtai_teshu_b_01wudi"),
                Path.getTextBattle("zhuangtai_teshu_b_01xishou"),
                Path.getTextBattle("zhuangtai_teshu_b_01xinsheng"),
                Path.getTextBattle("txt_taoyuanjieyi"),
                Path.getTextBattle("txt_fentan"),
            ],
            1: [
                Path.getBattleDir() + "num_battle_crit",
                Path.getBattleDir() + "num_battle_hit",
                Path.getBattleDir() + "num_battle_heal",
            ],
            2: [
                Path.getBattleFontLableAtlas('buff_01shuzi'),
                Path.getBattleFontLableAtlas('buff_02shuzi')
            ],
            3 : []
        }

    private static _instance: FightResourceManager = null;
    _hisLoads: any[];
    _count: any;

    public static get instance(): FightResourceManager {
        if (this._instance == null) {
            this._instance = new FightResourceManager();
        }
        return this._instance;
    }

    constructor() {
        this.signalFinish = new PrioritySignal('string');
    }

    public getHeroSpineData(spineName: string): sp.SkeletonData {
        return G_SpineManager.getSpine(Path.getSpine(spineName))
    }

    public getEffectSpineData(spineName: string): sp.SkeletonData {
        return G_SpineManager.getSpine(Path.getFightEffectSpine(spineName));
    }

    public getSkillJson(skillName: string): any {
        return this._loadSkillJsons[skillName];
    }

    public preloadResByReport(report: ReportData, battleData: any, sceneName: string) {

        this._report = report;
        this._battleData = battleData;

        this._loadedNum = 0;
        this._loadSpines = [];
        this._loadSkillJsons = [];
        this._soundList = [];
        this._hisLoads = [];

        this._setWaveRes();

        this._setSkillRes();

        this._setEffectBuffRes();

        this._setStoryChatRes();

        this._startPreload(sceneName);
    }

    private _setWaveRes() {
        let waves = this._report.getWaves();
        let Hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        let HeroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
        let Pet = G_ConfigLoader.getConfig(ConfigNameConst.PET);
        let HistoricalHero = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO);
        var starIds = [];
        for (let i = 0; i < waves.length; i++) {
            let vWave = waves[i];
            starIds = starIds.concat(vWave.starIds);
            let units = vWave.getUnits();
            for (let j = 0; j < units.length; j++) {
                var vUnit = units[j];
                var heroInfo = Hero.get(vUnit.configId);
                var heroRes; 
                if (vUnit.limitRedLevel && vUnit.limitRedLevel >= HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL) {
                    heroRes = HeroRes.get(heroInfo.limit_red_res_id);
                } else if (vUnit.limitLevel && vUnit.limitLevel >= HeroConst.HERO_LIMIT_RED_MAX_LEVEL) {
                    heroRes = HeroRes.get(heroInfo.limit_res_id);
                } else {
                    heroRes = HeroRes.get(heroInfo.res_id);
                }
                for(var k = 0; k <  vUnit.showMark.length; k++) {
                    this._addSpineLoad(Path.getFightEffectSpine(FightConfig.MARK[k]))
                }
             
                this._addSpineLoad(Path.getSpine(heroRes.fight_res));
                this._addSpineLoad(Path.getSpine(heroRes.fight_res + "_fore_effect"));
                this._addSpineLoad(Path.getSpine(heroRes.fight_res + "_back_effect"));
            }

            let pets = vWave.getPets();
            for (let j = 0; j < pets.length; j++) {
                var vPet = pets[j];
                var petInfo = Pet.get(vPet.configId);
                var petRes = HeroRes.get(petInfo.res_id);
                this._addSpineLoad(Path.getSpine(petRes.fight_res));
                this._addSpineLoad(Path.getSpine(petRes.fight_res + "_fore_effect"));
                this._addSpineLoad(Path.getSpine(petRes.fight_res + "_back_effect"));
            }

            // let stars = vWave.getBattleStar();

            // for (let j = 0; j < stars.length; j++) {
            //     var vStar = stars[j];
            //     var starData = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO).get(vStar.baseId);
            //     var heroRes = HeroRes.get(starData.res_id);
            //     if (heroRes.story_res_spine != 0) {
            //         this._addSpineLoad(Path.getSpine(heroRes.story_res_spine));
            //     }
            // }
        }
        for (var _ in starIds) {
            var id = starIds[_];
            var data = HistoricalHero.get(id);
            assert(data, 'wrong history hero id = ' + id);
            var res = HeroRes.get(data.res_id);
            assert(res, 'wrong Hero res id = ' + data.res_id);
            if (res.story_res_spine != 0) {
                this._addHisLoad(Path.getSpine(res.story_res_spine));
            }
            var heroData = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO_STEP).get(id, 1);
            this.addBuffRes([heroData.skill_effectid]);
        }
        if (starIds.length > 0) {
            this._addOtherResLoad(Path.getCommonPrefab("CommonStoryAvatar"), cc.Prefab);
        }
        // xingcai
        if (this._battleData.stageId == 100101 && !this._battleData.alreadyPass) {
            let heroInfo = Hero.get(216);
            let heroRes = HeroRes.get(heroInfo.res_id);
            this._addSpineLoad(Path.getSpine(heroRes.fight_res));
            this._addSpineLoad(Path.getSpine(heroRes.fight_res + "_fore_effect"));
            this._addSpineLoad(Path.getSpine(heroRes.fight_res + "_back_effect"));
        }
    }

    private _setSkillRes() {
        var skillIds = this._report.getSkillIds();
        let HeroSkillActive = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE);
        let HeroSkillPlay = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY);
        for (let i = 0; i < skillIds.length; i++) {
            var v = skillIds[i];
            var skillInfo = HeroSkillActive.get(v);
            var skillPlay = HeroSkillPlay.get(skillInfo.skill_show_id);
            if (skillPlay.atk_action != 0) {
                this._addSkillJsonLoad(Path.getAttackerAction(skillPlay.atk_action));

                this._addSkillJsonLoad(Path.getSceneAction(skillPlay.atk_action));

                this._addSkillJsonLoad(Path.getTargetAction(skillPlay.atk_action));
                this._addSkillJsonLoad(Path.getTargetAction(skillPlay.atk_action, 1));
                this._addSkillJsonLoad(Path.getTargetAction(skillPlay.atk_action, 2));
                this._addSkillJsonLoad(Path.getTargetAction(skillPlay.atk_action, 3));
                this._addSkillJsonLoad(Path.getTargetAction(skillPlay.atk_action, 4));
                this._addSkillJsonLoad(Path.getTargetAction(skillPlay.atk_action, 5));
                this._addSkillJsonLoad(Path.getTargetAction(skillPlay.atk_action, 6));
            }

            if (skillPlay.bullet_res_id != 0) {
                this._addSpineLoad(Path.getFightEffectSpine(skillPlay.bullet_res_id));
            }

            if (skillPlay.battle_voice != '0') {
                var soundPath = Path.getSkillVoice(skillPlay.battle_voice);
                this._soundList.push(soundPath);
                G_AudioManager.preLoadSound(soundPath);
                // Engine.getEngine().pushSound(soundPath);
            }

        }

        this._addSkillJsonLoad(Path.getTargetAction("damage"));
        this._addSkillJsonLoad(Path.getTargetAction("dying"));
        this._addSkillJsonLoad(Path.getTargetAction("idle"));

    }

    private _setEffectBuffRes() {
        let waveData = this._report.getWaves();
        for (let i = 0; i < waveData.length; i++) {
            let roundData = waveData[i].getRounds();
            for (let j = 0; j < roundData.length; j++) {
                let attacks = roundData[j].attacks;
                for (let k = 0; k < attacks.length; k++) {
                    this.addBuffRes(attacks[k].angers);
                    this.addBuffRes(attacks[k].battleEffects);
                    this.addBuffRes(attacks[k].addBuffs);
                    this.addBuffRes(attacks[k].delBuffs);
                    this.addBuffRes(attacks[k].delBuffsBefore);
                    this.addBuffRes(attacks[k].delBuffsMiddle);
                }
            }
        }
    }

     addBuffRes(buff) {
        let HeroSkillEffect = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT);
        for (let i = 0; i < buff.length; i++) {
            var heroSkillEffect = HeroSkillEffect.get(buff[i].configId || buff[i]);
            let buffRes = heroSkillEffect.buff_res;
            let buffFrontEffect = heroSkillEffect.buff_front_effect;
            let buffTweenPic = heroSkillEffect.buff_tween_pic;
            if (buffRes != null && buffRes != "") {
                // console.log("[FightResourceManager] _setEffectBuffRes", buffRes);
                this._addSpineLoad(Path.getFightEffectSpine(buffRes));
            }
            if (buffFrontEffect != null && buffFrontEffect != "") {
                // console.log("[FightResourceManager] _setEffectBuffRes", buffFrontEffect);
                this._addSpineLoad(Path.getFightEffectSpine(buffFrontEffect));
            }
            if (buffTweenPic != null && buffTweenPic != "") {
                // console.log("[FightResourceManager] _setEffectBuffRes", buffTweenPic);
                this._addOtherResLoad(Path.getBuffText(buffTweenPic), cc.SpriteFrame);
            }
        }
    }

    private _setStoryChatRes() {
        let battleType = this._battleData.battleType;
        if (battleType == BattleDataHelper.BATTLE_TYPE_NORMAL_DUNGEON ||
            battleType == BattleDataHelper.BATTLE_TYPE_FAMOUS ||
            battleType == BattleDataHelper.BATTLE_TYPE_GENERAL) {
            return;
        }

        if (this._battleData.alreadyPass) {
            return;
        }

        let stageId: number = this._battleData.stageId;
        let storyTouchId: number = null;
        let StoryTouch = G_ConfigLoader.getConfig(ConfigNameConst.STORY_TOUCH);
        let count = StoryTouch.length();
        for (let i = 0; i < count; i++) {
            var touch = StoryTouch.indexOf(i);
            if (touch.control_value1 == stageId) {
                storyTouchId = touch.story_touch;
            }
        }
        if (storyTouchId == null) {
            return;
        }

        let storyChatList: any[] = []
        let StoryChat = G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAT);
        count = StoryChat.length();
        for (let i = 0; i < count; i++) {
            let touch = StoryChat.indexOf(i);
            if (touch.story_touch == storyTouchId) {
                storyChatList.push(touch);
            }
        }
        let myHeroId: number = G_UserData.getHero().getRoleBaseId();
        let storyResId: number[] = [];
        for (let i = 0; i < storyChatList.length; i++) {
            let touch = storyChatList[i];
            let sound = touch.common_sound;
            if (myHeroId) {
                if (G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(myHeroId).gender == 2) {
                    sound = touch.common_sound2;
                }
            }
            var soundPath = Path.getSkillVoice(sound);
            G_AudioManager.preLoadSound(soundPath);
            this._soundList.push(soundPath);
            if (touch.story_res1 != 1 && touch.story_res1 != 0) {
                storyResId.push(touch.story_res1);
            }
            if (touch.story_res2 != 1 && touch.story_res2 != 0) {
                storyResId.push(touch.story_res2);
            }
            storyResId.push(myHeroId);
        }

        let Hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        let HeroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
        for (let i = 0; i < storyResId.length; i++) {
            var heroData = Hero.get(storyResId[i]);
            if (!heroData) {
                continue;
            }
            var resId = heroData.res_id;
            var resData = HeroRes.get(resId);
            var spineId = resData.story_res_spine;
            if (spineId == 0) {
                continue;
            }
            // this._addSpineLoad(Path.getStorySpine(spineId));
            this._addOtherResLoad(Path.getStorySpine(spineId), cc.SpriteFrame);
        }
    }

    _addHisLoad(path) {
        if (this._hisLoads.indexOf(path) <= -1) {
            this._hisLoads.push(path);
            this._count = this._count + 1;
        }
    }

    private _addSkillJsonLoad(path: string) {
        this._loadSkillJsons[path] = null;
    }

    private _addSpineLoad(path) {
        if (this._loadSpines.indexOf(path) <= -1) {
            this._loadSpines.push(path);
        }
    }

    private _addOtherResLoad(path: string, type: typeof cc.Asset) {
        let typeIndex = this._otherResTypeArray.indexOf(type);
        if (this._loadOtherResArray[typeIndex].indexOf(path) <= -1) {
            this._loadOtherResArray[typeIndex].push(path);
        }
    }

    private _startPreload(name: string) {
        this.sceneName = name;
        ResourceLoader.loadRes(Object.keys(this._loadSkillJsons), cc.JsonAsset, null, this._loadSkillJsonComplete.bind(this), name)
    }

    public addActionLaterLoad(url, cb: Function) {
        ResourceLoader.loadRes(url, cc.JsonAsset, null, (err, assets: cc.JsonAsset) => {
            this._loadSkillJsons[Path.getFightAction(assets.name)] = assets.json;
            cb && cb();
        }, name)
    }

    private _loadSkillJsonComplete(err, assets: cc.JsonAsset[]) {
        for (let i = 0; i < assets.length; i++) {
            let res = assets[i];
            let data = res.json;
            this._loadSkillJsons[Path.getFightAction(res.name)] = data;
            for (let j = 0; j < data.layers.length; j++) {
                let layer = data.layers[j];
                if (layer.name == 'body') {
                } else if (layer.name == 'shadow') {
                } else if (layer.name == 'body_2') {
                } else {
                    this._addSpineLoad(Path.getFightEffectSpine(layer.name));
                }
            }
            for (let i in data.events) {
                let eventList = data.events[i];
                for (let k in eventList) {
                    let event = eventList[k];
                    if (event.type == 'sound') {
                        // console.log("222:", event.value1);
                        let soundPath = Path.getFightSound(event.value1);
                        this._soundList.push(soundPath);
                        G_AudioManager.preLoadSound(soundPath);
                    }
                }
            }
        }

        this._loadSpineData();
    }

    private _loadSpineData() {
        ResourceLoader.loadRes(this._loadSpines.concat(this._hisLoads), sp.SkeletonData, null, this._loadSpineDataComplete.bind(this), this.sceneName);
    }

    private _loadSpineDataComplete() {
        this._loadOtherRes();
    }

    private _loadOtherRes() {
        this._loadedNum = 0;
        // for (const key in this._loadOtherResArray) {
        //     for (let i = 0; i < this._loadOtherResArray[key].length; i++) {
        //         console.log("_loadOtherRes:", this._loadOtherResArray[key][i]);
        //     }
        // }
        for (const key in this._loadOtherResArray) {
            ResourceLoader.loadRes(this._loadOtherResArray[key], this._otherResTypeArray[parseInt(key)], null, this._loadOtherResComplete.bind(this), this.sceneName);
        }
    }

    private _loadOtherResComplete(err, res) {
        this._loadedNum++;
        if (this._loadedNum >= this._otherResTypeArray.length) {
            this.sceneName = null
            this.signalFinish.dispatch();
        }
    }
}