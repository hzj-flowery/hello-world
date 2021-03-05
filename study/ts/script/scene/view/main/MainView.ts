const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_AudioManager, G_ConfigLoader, G_NativeAgent, G_SignalManager, G_UserData } from '../../../init';
import CommonTopbarItemList from '../../../ui/component/CommonTopbarItemList';
import ALDStatistics from '../../../utils/ALDStatistics';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { Path } from '../../../utils/Path';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import MainAvatorsNode from './MainAvatorsNode';
import MainMenuLayer from './MainMenuLayer';
import { MainUIHelper } from './MainUIHelper';

@ccclass
export default class MainView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _nodeMenu: cc.Node = null;

    @property({
        type: MainMenuLayer,
        visible: true
    })
    mainMenuLayer: MainMenuLayer = null;

    @property({
        type: CommonTopbarItemList,
        visible: true
    })
    _topBarList: CommonTopbarItemList = null;

    @property({
        type: MainAvatorsNode,
        visible: true
    })
    mainAvatorsNode: MainAvatorsNode = null;

    public static DELAY_MUSIC_TIME = 2 // 音乐延迟时间

    private _currSceneId: number;
    private _signalActDinnerResignin;
    _startTims;
    private _isSend: boolean = false;
    protected preloadResList = [
        { path: Path.getPrefab("CommonMainMenu", "common"), type: cc.Prefab },
        { path: Path.getMainDir() + "img_main_powernum", type: cc.SpriteAtlas },
    ];

    public preloadRes(callBack: Function, params) {
        this._startTims = Date.now();
        ALDStatistics.instance.aldSendEvent('开始加载主界面');
        var currSceneId = MainUIHelper.getCurrShowSceneId();
        this.addPreloadSceneRes(currSceneId);
        super.preloadRes(callBack, params);
    }

    protected onCreate() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            zm.sendEvent('100002', '进入游戏', G_NativeAgent.getPlatformId().toString());
        }
        this.setSceneSize();
        // if (this._topBarList) {
        //     this._topBarList.updateUI(TopBarStyleConst.STYLE_MAIN, false);
        // }
        G_UserData.getMilitaryMasterPlan().c2sSuperLevelGiftInfor();
        G_UserData.getWorldBoss().c2sGetWorldBossVoteInfo();
        G_UserData.getCrossWorldBoss().c2sGetCrossWorldBossVoteInfo();
        G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
    }

    protected onEnter() {
        var costSecond = Math.ceil((Date.now() - this._startTims) / 1000);
        if (this._isSend == false) {
            ALDStatistics.instance.aldSendEvent('加载完成进入主界面', { 'time': costSecond }, false, true);
            this._isSend = true;
        }
        if (this._topBarList) {
            var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)[0];
            var topbarConst = isOpen && TopBarStyleConst.STYLE_MAIN2 || TopBarStyleConst.STYLE_MAIN;
            this._topBarList.updateUI(topbarConst, false);
        }
        this._initMusic();

        let mainAvatorsObj: cc.Node = this.getEffectLayer(ViewBase.Z_ORDER_GRD_BACK + 1);
        if (mainAvatorsObj.getChildByName("MainAvatorsNode") == null) {
            this.mainAvatorsNode.node.removeFromParent();
            mainAvatorsObj.addChild(this.mainAvatorsNode.node);
        }

        this._signalActDinnerResignin = G_SignalManager.add(SignalConst.EVENT_ACT_DINNER_RESIGNIN, handler(this, this._onSignalActDinnerResignin));

        var currSceneId = MainUIHelper.getCurrShowSceneId();
        if (this._currSceneId != currSceneId) {
            this._currSceneId = currSceneId;
            this.updateSceneId(currSceneId);
        }
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        }, 0);

        //sb ykl
        UIPopupHelper.popupSuperChargeActivity();
    }

    protected onExit() {
        this._signalActDinnerResignin.remove();
        this._signalActDinnerResignin = null;
    }

    private _initMusic() {
        var system_sound = G_ConfigLoader.getConfig(ConfigNameConst.SYSTEM_SOUND);
        var sound_info1 = system_sound.get(AudioConst.MUSIC_CITY);
        var sound_info2 = system_sound.get(AudioConst.MUSIC_BGM_NEW_CITY);
        if (sound_info1 && sound_info2) {
            var delay1 = cc.delayTime(sound_info1.time + MainView.DELAY_MUSIC_TIME);
            var delay2 = cc.delayTime(sound_info2.time + MainView.DELAY_MUSIC_TIME);
            var sequence = cc.sequence(cc.callFunc(function () {
                G_AudioManager.playMusicWithId(AudioConst.MUSIC_CITY);
            }), delay1, cc.callFunc(function () {
                G_AudioManager.playMusicWithId(AudioConst.MUSIC_BGM_NEW_CITY);
            }), delay2);
            var action = cc.repeatForever(sequence);
            this.node.runAction(action);
        }
    }

    private _onSignalActDinnerResignin(eventName, miss) {
        this._refreshResignVit(miss);
    }

    private _refreshResignVit(miss) {
    }

    public isRootScene() {
        return true;
    }

}