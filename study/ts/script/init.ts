import { FakeProgress } from "../../scripts/FakeProgress";
import { Job, JobScheduler } from "../../scripts/InitialJobScheduler";
import { ProgressBarManager } from "../../scripts/ProgressBarManager";
import { GameAgent } from "./agent/GameAgent";
import NativeAgent from "./agent/NativeAgent";
import NativeAgentDevelop from "./agent/NativeAgentDevelop";
import NativeAgentWeChat from "./agent/NativeAgentWeChat";
import { config } from "./config";
import ConfigLoader from "./config/ConfigLoader";
import { initConst } from './const/ConstInit';
import { FunctionConst } from "./const/FunctionConst";
import { UserData } from "./data/UserData";
import AudioManager from "./manager/AudioManager";
import { BulletScreenManager } from "./manager/BulletScreenManager";
import { ConfigManager } from "./manager/ConfigManager";
import { EffectGfxManager } from "./manager/EffectGfxManager";
import { GatewayListManager } from "./manager/GatewayListManager";
import HeroVoiceManager from "./manager/HeroVoiceManager";
import { PreloadManager } from "./manager/PreloadManager";
import RecoverManager from "./manager/RecoverManager";
import { ResolutionManager } from "./manager/ResolutionManager";
import { RoleListManager } from "./manager/RoleListManager";
import { ServerListManager } from "./manager/ServerListManager";
import { ServerTimeManager } from "./manager/ServerTimeManager";
import ServiceManager from "./manager/ServiceManager";
import { SignalManager } from "./manager/SignalManager";
import { SocketManager } from "./manager/SocketManager";
import { SpineManager } from "./manager/SpineManager";
import { StorageManager } from "./manager/StorageManager";
import { NetworkManager } from "./network/NetworkManager";
import { SceneManager } from "./scene/SceneManager";
import { GuildSnatchRedPacketServe } from "./scene/view/guild/GuildSnatchRedPacketServe";
import { MainUIHelper } from "./scene/view/main/MainUIHelper";
import MineNoticeService from "./scene/view/mineCraft/MineNoticeService";
import { PopupHonorTitleHelper } from "./scene/view/playerDetail/PopupHonorTitleHelper";
import RollNoticeService from "./scene/view/rollnotice/RollNoticeService";
import TutorialManager from "./scene/view/tutorial/TutorialManager";
import { TopLevelNode } from "./ui/node/TopLevelNode";
import PromptManager from "./ui/prompt/PromptManager";
import { TouchEffect } from "./ui/TouchEffect";
import { WaitingMask } from "./ui/WaitingMask";
import { Color } from "./utils/Color";
import { AvatarDataHelper } from "./utils/data/AvatarDataHelper";
import { CakeActivityDataHelper } from "./utils/data/CakeActivityDataHelper";
import { EquipDataHelper } from "./utils/data/EquipDataHelper";
import { GuildDataHelper } from "./utils/data/GuildDataHelper";
import { HeroDataHelper } from "./utils/data/HeroDataHelper";
import { InstrumentDataHelper } from "./utils/data/InstrumentDataHelper";
import { PetDataHelper } from "./utils/data/PetDataHelper";
import { UserDataHelper } from "./utils/data/UserDataHelper";
import { LogicCheckHelper } from "./utils/LogicCheckHelper";
// import { PakoHelper } from "./utils/pako/PakoHelper";

export let Colors = Color;

export let G_ConfigLoader: ConfigLoader;

export let G_ResolutionManager: ResolutionManager;

export let G_TopLevelNode: TopLevelNode;

export let G_WaitingMask: WaitingMask;

export let G_TouchEffect: TouchEffect;

export let G_SocketManager: SocketManager;

export let G_SignalManager: SignalManager;

export let G_StorageManager: StorageManager;

export let G_SceneManager: SceneManager;

export let G_ConfigManager: ConfigManager;

export let G_GatewayListManager: GatewayListManager;

export let G_ServerListManager: ServerListManager;

export let G_RoleListManager: RoleListManager;

export let G_NetworkManager: NetworkManager;

export let G_NativeAgent: NativeAgent;

export let G_GameAgent: GameAgent;

export let G_ServerTime: ServerTimeManager;

export let G_UserData: UserData;

export let G_Prompt: PromptManager;

export let G_RecoverMgr: RecoverManager;

export let G_EffectGfxMgr: EffectGfxManager;

export let G_SpineManager: SpineManager;

export let G_AudioManager: AudioManager;

export let G_TutorialManager: TutorialManager;

export let G_RollNoticeService: RollNoticeService;

export let G_ServiceManager: ServiceManager;

// export let G_NotifycationManager: Type;

export let G_BulletScreenManager: BulletScreenManager;
// 
// export let G_VoiceManager: Type;

export let G_HeroVoiceManager: HeroVoiceManager;

export let G_GuildSnatchRedPacketServe: GuildSnatchRedPacketServe;

export let G_MineNoticeService: MineNoticeService;

// export let G_RealNameService: Type;

// export let G_pako: PakoHelper;

export let G_PreloadManager: PreloadManager;
export let G_ProgressBarManager: ProgressBarManager;

let callback: Function;
let target: Object;

export function init(call: Function, callee: Object) {
    callback = call;
    target = callee;
}

function allComplete() {
    if (callback) {
        callback.call(target);
        callback = null;
        target = null;
    }
}

const { ccclass, property } = cc._decorator;
@ccclass
export class Global extends cc.Component {
    @property(TopLevelNode)
    private topLevelNode: TopLevelNode = null;

    @property(WaitingMask)
    private waitingMask: WaitingMask = null;

    @property(TouchEffect)
    private touchEffect: TouchEffect = null;

    @property(SceneManager)
    private sceneManager: SceneManager = null;

    @property(NetworkManager)
    private networkManager: NetworkManager = null;

    @property(ConfigLoader)
    private configLoader: ConfigLoader = null;

    @property(PreloadManager)
    private preloadManager: PreloadManager = null;

    @property(ProgressBarManager)
    private progressBarManager: ProgressBarManager = null;

    private scheduler: JobScheduler;

    private inited;
    private static startProgress = 0.5;

    private static tips = [
        {
            text: '游戏资源加载中',
            progress: Global.startProgress + 0.25
        }, {
            text: '音乐音效加载中',
            progress: Global.startProgress + 0.45
        }, {
            text: '与服务器通讯中',
            progress: Global.startProgress + 0.49
        }, {
            text: '正在进入游戏',
            progress: 1
        }]

    public onLoad() {
        this.inited = false;
        G_ProgressBarManager = this.progressBarManager;
        // G_pako = new PakoHelper();
        this.scheduler = new JobScheduler(Global.startProgress, 1);
        this.scheduler.pushJob(this.initConfig, this);
        this.scheduler.pushJob(this.initNetwork, this);
        this.scheduler.pushJob(this.initSceneManager, this);
        this.scheduler.pushJob(this.initPopup, this);
        this.scheduler.pushJob(this.preloadScene, this);
        this.scheduler.onComplete(this.allComplete.bind(this));

        this.scheduler.start();

        this.schedule(this.updateProgress, 1, cc.macro.REPEAT_FOREVER, 0);

        this.progressBarManager.showProgress();
        this.progressBarManager.updateProgress(this.scheduler.progress, Global.tips);
    }

    private updateProgress() {
        let progress = this.scheduler.progress;
        this.progressBarManager.updateProgress(progress, Global.tips);

        if (this.inited && this.sceneManager.getRunningScene()) {
            this.progressBarManager.hideProgress();
            this.unschedule(this.updateProgress);
        }
    }

    private initConfig(job: Job, scheduler: JobScheduler) {
        let fake = this.createFakeProgress(job, 1);
        this.configLoader.init(() => {
            fake.cancel();

            G_ConfigLoader = this.configLoader;
            initConst();
            UserDataHelper.initAllDataHelper();
            LogicCheckHelper.initAllCheckers();

            G_ResolutionManager = new ResolutionManager;

            G_TopLevelNode = this.topLevelNode;
            this.topLevelNode.init();

            G_SceneManager = this.sceneManager;
            G_WaitingMask = this.waitingMask;
            G_WaitingMask.init();
            G_TouchEffect = this.touchEffect;
            G_SocketManager = new SocketManager;
            G_SignalManager = new SignalManager;
            G_StorageManager = new StorageManager;
            G_ConfigManager = new ConfigManager;

            G_GatewayListManager = new GatewayListManager;
            G_ServerListManager = new ServerListManager;
            G_RoleListManager = new RoleListManager;

            G_MineNoticeService = new MineNoticeService();
            scheduler.jobComplete(job);
        })
    }

    private initNetwork(job: Job, scheduler: JobScheduler) {
        let fake = this.createFakeProgress(job, 3)
        G_NetworkManager = this.networkManager;
        G_NetworkManager.init(() => {
            fake.cancel();
            scheduler.jobComplete(job);
        });
    }

    private initSceneManager(job: Job, scheduler: JobScheduler) {
        let fake = this.createFakeProgress(job, 3);
        this.sceneManager.init(() => {
            fake.cancel();

            this.initNativeAgent();
            G_GameAgent = new GameAgent;
            G_ServerTime = new ServerTimeManager;
            G_Prompt = new PromptManager;
            G_EffectGfxMgr = new EffectGfxManager;
            G_SpineManager = new SpineManager;
            G_AudioManager = new AudioManager;
            G_HeroVoiceManager = new HeroVoiceManager;
            G_TutorialManager = new TutorialManager;
            G_ServiceManager = new ServiceManager;
            G_RollNoticeService = new RollNoticeService;
            G_BulletScreenManager = new BulletScreenManager;
            G_GuildSnatchRedPacketServe = new GuildSnatchRedPacketServe;

            G_PreloadManager = this.preloadManager;
            scheduler.jobComplete(job);
        });
    }

    private initPopup(job: Job, scheduler: JobScheduler) {
        PopupHonorTitleHelper.init(() => {
            scheduler.jobComplete(job);
        }, (complete, total) => {
            job.progress = complete / total;
        });
    }

    private preloadScene(job: Job, scheduler: JobScheduler) {
        this.sceneManager.preloadScene('login', () => {
            scheduler.jobComplete(job);
        }, (complete, total) => {
            job.progress = complete / total;
        })
    }

    private allComplete() {
        FunctionConst.init();
        EquipDataHelper.initConfig();
        CakeActivityDataHelper.initConfig();
        GuildDataHelper.initConfig();
        InstrumentDataHelper.initConfig();
        
        AvatarDataHelper.init();
        HeroDataHelper.init();
        PetDataHelper.initConfig();
        MainUIHelper.init();
        
        G_UserData = new UserData;
        G_RecoverMgr = new RecoverManager;

        this.inited = true;

        allComplete();
    }

    private createFakeProgress(job: Job, expected: number) {
        let fake = new FakeProgress();
        fake.run(expected, (progress: number) => {
            job.progress = progress;
        });

        return fake;
    }

    // TODO:
    private initNativeAgent() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            G_NativeAgent = new NativeAgentWeChat();
        }else {
            G_NativeAgent = new NativeAgentDevelop();
        }
    }
}



function a(s: string | string[]): void;
function a(s: number, n: number): void;
function a(s: string, n: string, m: number):void

function a(s: string | string[] | number, n?: string | number, m?:number) {

}