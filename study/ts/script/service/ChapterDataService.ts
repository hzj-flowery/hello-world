import { BaseService } from "./BaseService";
import { Slot } from "../utils/event/Slot";
import { G_SignalManager, G_ServerTime, G_ServiceManager, G_SceneManager, G_UserData } from "../init";
import { SignalConst } from "../const/SignalConst";
import ParameterIDConst from "../const/ParameterIDConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { FunctionConst } from "../const/FunctionConst";

export class ChapterDataService extends BaseService {
    public _signalCommonZeroNotice: Slot;
    
    constructor() {
        super()
        this.start();
    }
    public initData() {
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, this._onEventCommonZeroNotice.bind(this));
        let bossTime = G_ServerTime.secondsFromZero() + UserDataHelper.getParameter(ParameterIDConst.DAILY_BOSS_TIME);
        G_ServiceManager.registerOneAlarmClock('DAILY_BOSS_TIME', bossTime, function () {
            this._requestBossInvadeData();
            G_SignalManager.dispatch(SignalConst.EVENT_CHAPTER_BOSS_INVADE_NOTICE);
        }.bind(this));
    }
    public tick() {
    }
    public clear() {
        G_ServiceManager.DeleteOneAlarmClock('DAILY_BOSS_TIME');
        if (this._signalCommonZeroNotice) {
            this._signalCommonZeroNotice.remove();
            this._signalCommonZeroNotice = null;
        }
    }
    public _requestBossInvadeData() {
        console.warn('ChapterDataService DAILY_BOSS_TIME ');
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'main' && runningSceneName != 'chapter' && runningSceneName != 'stage') {
            return;
        }
        console.warn('ChapterDataService requestBossInvadeData ' + runningSceneName);
        let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ELITE_CHAPTER)[0];
        if (!isOpen) {
            return;
        }
        G_UserData.getChapter().c2sGetActDailyBoss();
    }
    public _onEventCommonZeroNotice(event, hour) {
        this._requestBossInvadeData();
        G_SignalManager.dispatch(SignalConst.EVENT_CHAPTER_BOSS_INVADE_NOTICE);
    }
}
