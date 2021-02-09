import { G_SceneManager, init } from "./init";
import ALDStatistics from "./utils/ALDStatistics";
import ResourceLoader from "./utils/resource/ResourceLoader";

const { ccclass, property } = cc._decorator;
@ccclass
export default class App extends cc.Component {

    _startTims;
    onLoad() {
        ResourceLoader.init();
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let wx = window['wx'] as any;
            wx.setKeepScreenOn({
                keepScreenOn: true
            });
            wx.onMemoryWarning(ResourceLoader.onMemoryWarning.bind(ResourceLoader))
        }
        cc.game.setFrameRate(30);
        cc.game.addPersistRootNode(this.node);
        cc.assetManager.downloader.maxRetryCount = 3;

        ALDStatistics.instance.aldSendEvent('开始加载登录', null, true);
        this._startTims = Date.now();

        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLaunch, this)
        init(this.run, this);
    }

    private onSceneLaunch() {
        cc.director.getScheduler().enableForTarget(ResourceLoader);
    }

    private run() {
        // console.log('run scene: login')

        var costSecond = Math.ceil((Date.now() - this._startTims) / 1000);
        ALDStatistics.instance.initGuidData();
        ALDStatistics.instance.aldSendEvent('加载登录完成', { 'time': costSecond }, true, true);
        G_SceneManager.showScene("login");
    }
}
