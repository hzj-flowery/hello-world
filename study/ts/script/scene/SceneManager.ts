const { ccclass, property } = cc._decorator;

import { SignalConst } from "../const/SignalConst";
import { G_EffectGfxMgr, G_SignalManager, G_UserData, G_WaitingMask } from "../init";
import PopupBase from "../ui/PopupBase";
import { Waiting_Show_Type } from "../ui/WaitingMask";
import ResourceLoader from "../utils/resource/ResourceLoader";
import { GameScene } from "./GameScene";
import { RedPetView } from "./view/redPet/RedPetView";
import ViewBase from "./ViewBase";

let Prefab_Class = {
    achievement: 'AchievementView',
    activity: 'ActivityView',
    arena: 'ArenaView',
    auction: 'AuctionView',
    avatar: 'AvatarView',
    avatarBook: 'AvatarBookView',
    avatarShop: 'AvatarShopView',
    avatarTrain: 'AvatarTrainView',
    bout:"BoutView",
    cakeActivity: 'CakeActivityView',
    cakeActivityShop: 'CakeActivityShopView',
    campRace: 'CampRaceView',
    cg: 'CGView',
    challenge: 'ChallengeView',
    chapter: 'ChapterView',
    complexRank: 'ComplexRankView',
    countryboss: 'CountryBossMain',
    countrybossbigboss: 'CountryBossBigBossView',
    countrybosssmallboss: 'CountryBossSmallBossView',
    create: 'CreateViewNew',
    crystalShop: 'CrystalShopView',
    crossWorldBoss:"CrossWorldBossView",
    customActivity: 'CustomActivityView',
    dailyChallenge: 'DailyChallengeView',
    drawCard: 'DrawCardView',
    equipActiveShop: 'EquipActiveShopView',
    equipment: 'EquipmentListView',
    equipmentDetail: 'EquipmentDetailView',
    equipTrain: 'EquipTrainView',
    exploreMain: 'ExploreMainView',
    exploreMap: 'ExploreMapView',
    fight: 'FightView',
    fighttest: 'FightTest',
    firstfight: 'FirstFightView',
    firstpay: 'FirstPayView',
    friend: 'FriendView',
    gachaGoldenHeroChooseZhenyin: 'GachaGoldenHeroChooseZhenyinView',
    gachaDrawGoldHero: 'GachaDrawHeroView',
    gachaGoldHero: 'GachaGoldenHeroView',
    gachaGoldShop: 'GachaGoldShopView',
    groups: 'GroupsView',
    guild: 'GuildMainView',
    guildAnswer: 'GuildAnswerView',
    guildCrossWar: 'GuildCrossWarBattleView',
    guildDungeon: 'GuildDungeonView',
    guildHelp: 'GuildHelpView',
    guildServerAnswer: 'GuildServerAnswerView',
    guildTrain: 'GuildTrainView',
    guildwar: 'GuildWarWorldMapView',
    guildwarbattle: 'GuildWarBattleView',
    handbook: 'HandBookView',
    hero: 'HeroListView',
    heroDetail: 'HeroDetailView',
    heroGoldTrain: 'HeroGoldTrainView',
    heroMerge: 'HeroMerge',
    heroTrain: 'HeroTrainView',
    heroTransform: 'HeroTransformView',
    historyhero: 'HistoryHeroView',
    historyheroTrain: 'HistoryHeroTrainView',
    historyherolist: 'HistoryHeroListView',
    homeland: 'HomelandView',
    homelandFriend: 'HomelandFriendView',
    horse: 'HorseView',
    horseConquerActiveShop: 'HorseConquerActiveShopView',
    horseDetail: 'HorseDetailView',
    horseEquipDetail: 'HorseEquipDetailView',
    horseJudge: 'HorseJudgeView',
    horseList: 'HorseListView',
    horseRace: 'HorseRaceView',
    horseTrain: 'HorseTrainView',
    instrument: 'InstrumentListView',
    instrumentDetail: 'InstrumentDetailView',
    instrumentTrain: 'InstrumentTrainView',
    login: 'LoginView',
    logo: 'LogoView',
    main: 'MainView',
    mineCraft: 'MineCraftView',
    package: 'PackageMainView',
    pet: 'PetListView',
    petActiveShop: 'PetActiveShopView',
    petDetail: 'PetDetailView',
    petHandBook: 'PetHandBookView',
    petMain: 'PetMainView',
    petMerge: 'PetMerge',
    petTrain: 'PetTrainView',
    producer: 'ProducerView',
    qinTomb: 'QinTombBattleView',
    redPet:"RedPetView",
    redPetShop:"RedPetShopView",
    recovery: 'RecoveryView',
    redPacketRain: 'RedPacketRainView',
    runningMan: 'RunningManView',
    seasonCompetitive: 'SquadSelectView',
    seasonShop: 'SeasonShopView',
    seasonSilk: 'SeasonSilkView',
    seasonSport: 'SeasonSportView',
    shop: 'ShopView',
    siege: 'SiegeView',
    silkbag: 'SilkbagView',
    singleRace: 'SingleRaceView',
    stage: 'StageView',
    stronger: 'StrongerView',
    synthesis: 'SynthesisView',
    team: 'TeamView',
    teamSuggest: 'TeamSuggestView',
    territory: 'TerritoryView',
    tower: 'TowerView',
    tactics: 'TacticsView',
    transform: 'TransformView',
    treasure: 'TreasureListView',
    treasureDetail: 'TreasureDetailView',
    treasureTrain: 'TreasureTrainView',
    uicontrol: 'UIControlView',
    vip: 'VipView',
    worldBoss: 'WorldBossView',
    tenJadeAuction: 'TenJadeAuctionView'
}
let Scene_Package = {
    equipTrain: 'equipment',
    equipmentDetail: 'equipment',
    treasureDetail: 'treasure',
    treasureTrain: 'treasure',
    homelandFriend: 'homeland',
    petMain: 'pet',
    petHandBook: 'pet',
    petDetail: 'pet',
    petTrain: 'pet',
    horseConquerActiveShop: 'horse',
    horseDetail: 'horse',
    horseEquipDetail: 'horse',
    horseJudge: 'horse',
    horseList: 'horse',
    horseTrain: 'horse',
    historyheroTrain: 'historyhero',
}

@ccclass
export class SceneManager extends cc.Component {
    public static readonly EVENT_POP_SCENE = "EVENT_POP_SCENE";
    public static readonly EVENT_PUSH_SCENE = "EVENT_PUSH_SCENE";
    private static readonly MAX_CACHE_SCENE = 1;

    private readonly SCENES: string[] = ['logo', 'login', 'create', 'main'];

    private viewParams: { [key: string]: any } = {};

    private _signalSceneMap: any = {};
    private _signalDialogMap: any = {};
    private _signalPopupMap: any = {};

    private willClear = false;

    private _lockSize = 0;

    private gameScenePrefab: cc.Prefab;
    private nextSceneName: string;

    public init(callback: Function) {
        cc.resources.load('prefab/GameScene', cc.Prefab, (err, prefab: cc.Prefab) => {
            this.gameScenePrefab = prefab;
            callback();
        })
    }

    public getSceneClassName(name: string): string {
        return Prefab_Class[name];
    }

    private getPrefabName(name: string): string {
        return 'prefab/' + (Scene_Package[name] || name) + '/' + Prefab_Class[name];
    }

    public preloadScene(name: string, complete?: () => void, progress?: CCProgress) {
        let prefabName = this.getPrefabName(name);
        ResourceLoader.loadRes(prefabName, cc.Prefab, progress, complete, name);
    }

    private doCreateScene(name: string, params: any[] | null, call: Function, callee: Object) {
        if (this.SCENES.indexOf(name) > -1) {
            call = this.replaceRoot
            callee = this;
        } else {
            var root = this.getRootScene();
            if (root) {
                var rootName = root.node.name;
                if (rootName === 'logo' || rootName === 'login' || rootName === 'create') {
                    call = this.replaceRoot
                    callee = this;
                }
            }
        }

        let prefabName = this.getPrefabName(name);
        ResourceLoader.loadRes(prefabName, cc.Prefab, null, (err, resource: cc.Prefab) => {
            let view = cc.instantiate(resource) as cc.Node;
            view.name = this.getSceneClassName(name);
            let scene = cc.instantiate(this.gameScenePrefab);
            scene.name = name;
            let gameScene = scene.getComponent(GameScene);
            let viewBase = view.getComponent(ViewBase);
            viewBase.setSceneName(name);
            if (viewBase != null) {
                viewBase.preloadRes(() => {
                    this.viewCreationOver(() => {
                        gameScene.addChildToRoot(view);
                        call.call(callee, scene);
                    });
                }, params);
            }
            else {
                this.viewCreationOver(() => {
                    gameScene.addChildToRoot(view);
                    call.call(callee, scene)
                });
            }
        }, name)
    }

    private doWaitEnterMsg(name: string, script, params: any[] | null, call: () => void, signalMap): boolean {
        if (script) {
            if (typeof script.waitEnterMsg === 'function') {
                let waitEnterMsg = script.waitEnterMsg;
                let signal = waitEnterMsg(() => {
                    let signal = signalMap[name];
                    if (signal != null) {
                        signal.remove();
                        delete signalMap[name];
                    }
                    else {
                        delete signalMap[name];
                    }
                    call();
                }, params);
                if (signal == false) {
                    return false;
                }
                if (signal != null) {
                    signalMap[name] = signal;
                }

            } else {
                call();
            }
            return true;
        } else {
            return null;
        }
    }

    private createScene(name: string, params: any[] | null, call: Function, callee: Object) {
        this.nextSceneName = name;
        this.createView(name, params, () => {
            this.doCreateScene(name, params, call, callee);
        })
    }

    private createView(name: string, params: any[] | null, callback: () => void) {
        if (this.getRunningScene() && name != 'firstfight') {
            this.showWaiting(true);
        }
        name = this.getClassNameWithPrefab(name);
        this.viewParams[name] = params;

        let script = cc.js.getClassByName(Prefab_Class[name] || this.getClassNameWithPrefab(name)) as any;
        let msg = this.doWaitEnterMsg(name, script, params, callback, this._signalSceneMap);
        if (msg == null) {
            console.error('wrong view name', name);
            this.cancelViewCreation();
        }
        else if (msg == false) {
            this.cancelViewCreation();
        }
    }

    private cancelViewCreation() {
        this.showWaiting(false);
    }

    private viewCreationOver(callback?: Function) {
        G_WaitingMask.updateProgress(1);
        this.scheduleOnce(() => {
            this.showWaiting(false);
            callback && callback();
        })
    }

    public showScene(sceneName?: string, ...params) {
        this.createScene(sceneName, params, this.pushScene, this);
    }

    private getClassNameWithPrefab(prefab: string) {
        let i = prefab.lastIndexOf('/');
        if (i > 0) {
            prefab = prefab.slice(i + 1);
        }

        i = prefab.lastIndexOf('.');
        if (i > 0) {
            prefab = prefab.slice(0, i);
        }

        return prefab;
    }

    public showDialog(name: string, callBack?: Function, ...params) {
        this.createView(name, params, () => {
            this.doCreatePopup(name, params, callBack, this)
        })
    }

    private doCreatePopup(name: string, params: any[] | null, call: Function, callee: Object) {
        cc.resources.load(name, cc.Prefab, (err, res: cc.Prefab) => {
            let popup = cc.instantiate(res);
            popup.name = this.getClassNameWithPrefab(name);
            let popupBase = popup.getComponent(PopupBase);
            if (popupBase != null) {
                popupBase.prefab = res;
                popupBase.preloadRes(() => {
                    if (call != null) {
                        call.call(callee, popupBase);
                    } else {
                        popupBase.openWithAction();
                    }

                    this.viewCreationOver();
                }, params);
            }
            else {
                this.viewCreationOver();
            }
        })
    }

    public openPopup(name: string, callback?: (popup) => void, ...params) {
        this.createView(name, params, () => {
            this.doCreatePopup(name, params, callback, this);
        })
    }

    public getViewArgs(name?: string) {
        name = name || this.getRunningSceneName();
        return this.viewParams[name];
    }

    private pushScene(scene: cc.Node) {
        if (this.islocked()) {
            this._replaceScene(scene)
        } else {
            if (this.node.childrenCount > 0) {
                this.node.children[this.node.childrenCount - 1].active = false;
            }
            this.node.addChild(scene);
        }

        this.nextSceneName = null;
    }

    public popToRootScene() {
        let count = this.node.childrenCount;
        if (count > 1) {
            this.popSceneByTimes(count - 1);
        }

    }

    public popToRootAndReplaceScene(name: string, ...params) {
        if (this.getRootScene().getName() == 'main') {
            if (name == 'main') {
                if (this.node.childrenCount == 1) {
                    G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'main');
                } else {
                    this.popToRootScene();
                }
            } else {
                let scene = this.node.children[this.node.childrenCount - 1]
                while (scene.name != name && scene.name != 'main') {
                    this.doPopScene();
                    scene = this.node.children[this.node.childrenCount - 1];
                }
                if (this.node.childrenCount == 1) {
                    this.showScene(name, params);
                } else {
                    scene.active = true;
                }
            }
        } else {
            this.createScene(name, params, this.replaceRoot, this);
        }
    }

    public replaceScene(name: string, ...params) {
        this.createScene(name, params, this._replaceScene, this);
    }

    private _replaceScene(scene: cc.Node) {
        this.doPopScene();
        this.pushScene(scene);
    }

    public popScene() {
        var count = this.node.childrenCount;
        if (count > 1) {
            this.doPopScene();
            count = this.node.childrenCount;
            let scene = this.node.children[count - 1];
            if (scene) {
                scene.active = true;
            }
            return;
        }

        let scene = this.getRunningScene();
        if (scene && scene.getName() == "login") {
            return;
        }

        console.log('no running scene, show main')
        this.popToRootScene();
        this.replaceScene("main");
    }

    private doPopScene() {
        let count = this.node.childrenCount;
        if (count <= 0) {
            return;
        }

        let scene = this.node.children[count - 1];
        this.node.removeChild(scene);//  scene.destroy()下一帧才会removeChild
        if (scene.name != this.nextSceneName) {
            delete this.viewParams[scene.name];
        }
        scene.destroy();
        let name = scene.name;
        cc.director.once(cc.Director.EVENT_AFTER_UPDATE, () => {
            this._delayClearCache(name);
        }, this)
    }

    private showWaiting(isShow) {
        G_WaitingMask.showWaiting(isShow, Waiting_Show_Type.LOAD_RES);
    }

    //服务器返回错误消息时，清理信号
    public clearWaitEnterSignal() {
        this.cancelViewCreation();
        this._signalSceneMap = this._clearSignal(this._signalSceneMap);
        this._signalDialogMap = this._clearSignal(this._signalDialogMap);
        this._signalPopupMap = this._clearSignal(this._signalPopupMap);
    }

    private _clearSignal(signalMap) {
        for (const key in signalMap) {
            if (signalMap[key]) {
                signalMap[key].remove();
            }
        }
        signalMap = {};
        return signalMap;
    }

    public popSceneByTimes(times?: number) {
        if (times <= 0) {
            return;
        }

        for (var i = 0; i < times; i++) {
            this.doPopScene();
        }

        let count = this.node.childrenCount;
        let scene = this.node.children[count - 1]
        if (scene) {
            scene.active = true;
        }
    }

    public backToMain(...params) {
        this.popToRootAndReplaceScene('main', ...params);
    }

    private replaceRoot(scene: cc.Node) {
        this.popSceneByTimes(this.node.childrenCount);
        this.pushScene(scene);
    }

    public fightScenePop() {
        if (this.node.childrenCount > 1) {
            this.popScene();
        }
    }

    public getRootScene(): GameScene {
        var children = this.node.children;
        return children && children[0] && children[0].getComponent(GameScene);
    }

    public getTopScene(): GameScene {
        return this.getRunningScene();
    }

    public getRunningScene(): GameScene {
        var count = this.node.childrenCount;
        if (count < 1) {
            return;
        }

        return this.node.children[count - 1].getComponent(GameScene);
    }

    public getRunningSceneRootNode(): cc.Node {
        var count = this.node.childrenCount;
        if (count < 1) {
            return null;
        }
        return this.node.children[count - 1].getComponent(GameScene).root;
    }

    public getRunningSceneName(): string {
        var scene = this.getRunningScene();
        if (scene) {
            return scene.getName();
        }

        //没有场景返回loading
        return "_loading"
    }

    private _delayClearCache(name: string) {
        if (this.nextSceneName == name) {
            return;
        }

        let cnt = this.getSceneCount(name);
        if (cnt > 0) {
            return;
        }

        G_EffectGfxMgr.clearCache(name);
        ResourceLoader.releaseSceneRef(name);
    }

    private islocked(): boolean {
        if (this._lockSize && this._lockSize === this.node.childrenCount) {
            return true;
        }

        return false;
    }

    public lockScene() {
        if (this._lockSize > 0) {
            return false;
        }

        this._lockSize = this.node.childrenCount + SceneManager.MAX_CACHE_SCENE;
    }

    public unlockScene() {
        if (this._lockSize === 0) {
            return;
        }

        this._lockSize = 0;
    }

    public onDestroy() {
        // this.gameScenePrefab.removeReference(this);
    }

    registerGetReport(reportId, callBack) {
        G_SignalManager.addOnce(SignalConst.EVENT_ENTER_FIGHT_SCENE, callBack);
        G_UserData.getFightReport().c2sGetNormalBattleReport(reportId);
    }

    public getSceneCount(name: string) {
        let scenes = this.node.children;
        let cnt = 0;
        for (let i = 0; i < scenes.length; i++) {
            if (scenes[i].name == name) {
                cnt++;
            }
        }

        return cnt;
    }
}
