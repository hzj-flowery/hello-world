import { AudioConst } from "../../../const/AudioConst";
import { FightSignalManager } from "../../../fight/FightSignalManager";
import { ReportParser } from "../../../fight/report/ReportParser";
import { G_AudioManager, G_ConfigLoader, G_ResolutionManager, G_SceneManager, G_WaitingMask } from "../../../init";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import FightHelper from "../fight/FightHelper";
import FightView from "../fight/FightView";
import HeroShow from "../heroShow/HeroShow";
import { MainUIHelper } from "../main/MainUIHelper";
import PopupStoryChat from "../storyChat/PopupStoryChat";
import BuffManager from "../../../fight/BuffManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FirstFightView extends FightView {

    private static CONFIG = {
        report: 'fake_report_0',
        background: 1,
        showJump: false,
        showBossId: 0,
        battleType: 1,
        chapterId: 100100,
        battleSpeed: 1,
        noStartCG: true
    }
    private _callback;
    private _nodeCloud: cc.Node;

    public preloadRes(callBack: Function, args: any[]) {
        this._callback = args[0];
        this._fightScene.init(FirstFightView.CONFIG.background);
        this._fightEngine.init(this._fightScene);
        this._battleData = {
            stageId: FirstFightView.CONFIG.chapterId,
            battleType: FirstFightView.CONFIG.battleType,
            noStartCG: FirstFightView.CONFIG.noStartCG
        };

        G_ConfigLoader.loadConfig(FirstFightView.CONFIG.report, () => {
            let report = G_ConfigLoader.getConfig(FirstFightView.CONFIG.report).asset;
            this._report = ReportParser.parse(report);
            this._fightEngine.startWithPreload(this._report, this._battleData, callBack, this.getSceneName());
        });
    }

    public onCreate() {
        this.setSceneSize();

        this._totalHurt = 0;
        this._double = FirstFightView.CONFIG.battleSpeed;

        let size = G_ResolutionManager.getDesignCCSize();
        this._fightScene.node.setPosition(0, 0);
        this._fightScene.node.setContentSize(size);
        this._fightSignalManager = FightSignalManager.getFightSignalManager();

        this._fightUI.node.setPosition(0, 0);
        this._fightUI.node.setContentSize(size);
        this._fightUI.setPanelVisible(false);
        this._fightUI.setJumpVisible(true);
        this._fightUI.setJumpStoryVisible(true);
        this._fightUI.setJumpCallback(this._jumpToEnd.bind(this));
        BuffManager.getBuffManager().engine = this._fightEngine;
        this._fightEngine.setStart();

        this._fightHelper = new FightHelper();
        // this._createStartCloud();
    }

    public onEnter() {
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_FIGHT);
        this._fightEngine.changeBattleSpeed(FirstFightView.CONFIG.battleSpeed);
        this._listenerSignal = this._fightSignalManager.addListenerHandler(handler(this, this._onSignalEvent));
    }

    public onExit() {
        this._fightEngine.stop();
        this._fightEngine.clear();
        this._report.clear();

        if (this._listenerSignal) {
            this._listenerSignal.remove();
            this._listenerSignal = null;
        }
    }

    public update(f) {
        if (this._fightStart && this._fightStart.isFinish()) {
            this._fightStart.node.destroy();
            this._fightStart = null;
            this._fightUI.node.active = (true);
        }
    }

    protected showSummary() {
        if (this._callback) {
            this._callback();
            return;
        }
        G_SceneManager.popScene();
    }

    protected _checkHeroShow(waveId) {
        var showId = FirstFightView.CONFIG.showBossId;
        if (showId == 0) {
            this._heroShowEnd(waveId);
            return;
        }
        if (waveId == this._fightEngine.getWaveCount()) {
            let heroShow = new cc.Node("HeroShow").addComponent(HeroShow);
            heroShow.create(showId, function () {
                this._heroShowEnd(waveId);
            }.bind(this), true, false)
            return true;
        }
        return false;
    }

    protected _SIGNAL_CHECK_LEAD() {
        this._fightEngine.startBattle();
        this._fightUI.node.active = true;
    }

    protected _SIGNAL_FINISH_WAVE(waveId) {
        this.showSummary();
    }

    protected _startStoryChat(storyTouch, callback) {
        function jumpFunc() {
            this._fightEngine.jumpToEnd();
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupStoryChat", "storyChat"), (storyChat: PopupStoryChat) => {
            storyChat.updateUI(storyTouch, callback);
            storyChat.open();
            storyChat.setJumpCallback(jumpFunc.bind(this));
        });
    }

    private _createStartCloud() {
        this._nodeCloud = new cc.Node();
        this.node.addChild(this._nodeCloud);
        var config = MainUIHelper.getCurrShowSceneConfig();
        var s = config.load;
        // if (cc.FileUtils.getInstance().isFileExist('channel_login.jpg')) {
        //     s = 'channel_login.jpg';
        // }
        var picBack = UIHelper.newSprite(s).node;
        picBack.setAnchorPoint(0.5, 0.5);
        picBack.setPosition(0, 0);
        this._nodeCloud.addChild(picBack);
        G_WaitingMask.showWaiting(true);
    }

    private _removeStartCloud() {
        this._nodeCloud.destroy();
        G_WaitingMask.showWaiting(false);
    }
}