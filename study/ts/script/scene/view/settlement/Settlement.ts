import { G_SignalManager, G_AudioManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { AudioConst } from "../../../const/AudioConst";
import SummaryBase from "./SummaryBase";
import SummaryNormalWin from "./SummaryNormalWin";
import SummaryLose from "./SummaryLose";
import SummaryExploreBoss from "./SummaryExploreBoss";
import SummaryExploreRebelWin from "./SummaryExploreRebelWin";
import SummaryExploreRebelLose from "./SummaryExploreRebelLose";
import SummaryMineWin from "./SummaryMineWin";
import SummaryMineLose from "./SummaryMineLose";
import SummaryRebelEnd from "./SummaryRebelEnd";
import SummaryTowerWin from "./SummaryTowerWin";
import SummaryTowerLose from "./SummaryTowerLose";
import SummaryDailyWin from "./SummaryDailyWin";
import SummaryDailyLose from "./SummaryDailyLose";
import SummaryWorldBossEnd from "./SummaryWorldBossEnd";
import SummaryWorldBossWin from "./SummaryWorldBossWin";
import SummaryWorldBossLose from "./SummaryWorldBossLose";
import SummaryArenaLose from "./SummaryArenaLose";
import SummaryArenaWin from "./SummaryArenaWin";
import SummaryArenaReport from "./SummaryArenaReport";
import SummaryTerritoryWin from "./SummaryTerritoryWin";
import SummaryTerritoryLose from "./SummaryTerritoryLose";
import SummaryDailyBossWin from "./SummaryDailyBossWin";
import SummaryDailyBossLose from "./SummaryDailyBossLose";
import SummaryTowerSuperWin from "./SummaryTowerSuperWin";
import SummaryTowerSuperLose from "./SummaryTowerSuperLose";
import SummaryFriendWin from "./SummaryFriendWin";
import SummaryRevengeLose from "./SummaryRevengeLose";
import SummaryFamousWin from "./SummaryFamousWin";
import SummaryFamousLose from "./SummaryFamousLose";
import SummarySingleRaceEnd from "./SummarySingleRaceEnd";
import SummarySeasonEnd from "./SummarySeasonEnd";
import SummaryCampRaceEnd from "./SummaryCampRaceEnd";
import SummaryGeneralWin from "./SummaryGeneralWin";
import SummaryGeneralLose from "./SummaryGeneralLose";
import SummaryGuildDungeonWin from "./SummaryGuildDungeonWin";
import SummaryGuildDungeonLose from "./SummaryGuildDungeonLose";
import SummaryCountryBossEnd from "./SummaryCountryBossEnd";
import SummaryCountryBossInterceptWin from "./SummaryCountryBossInterceptWin";
import SummaryCountryBossInterceptLose from "./SummaryCountryBossInterceptLose";
import SummaryGuildWarWin from "./SummaryGuildWarWin";
import SummaryGuildWarLose from "./SummaryGuildWarLose";
import SummaryGuildReportEnd from "./SummaryGuildReportEnd";
import SummaryRevengeWin from "./SummaryRevengeWin";
import { HomelandHelp } from "../homeland/HomelandHelp";
import { HomelandConst } from "../../../const/HomelandConst";

export default class Settlement {

    private exitFight() {
        G_SignalManager.dispatch(SignalConst.EVENT_EXIT_FIGHT);
    }

    public createSettleMent(battleData, isWin, callback, attackHurt, statisticData) {
        battleData.statisticsData = statisticData;
        var functionName = BattleDataHelper.getTypeName(battleData.battleType);
        var strLose = '';
        if (!isWin) {
            strLose = '_LOSE';
        }
        var func: Function = this['_' + (functionName + strLose)];
        var panelSettleMent = null;
        if (func != null && typeof (func) == 'function') {
            panelSettleMent = func.apply(this, [battleData, this.exitFight, attackHurt]);
        } else {
            func = this['_' + functionName];
            panelSettleMent = func.apply(this, [battleData, this.exitFight, attackHurt]);
        }
        return panelSettleMent;
    }

    openSummary(type: typeof SummaryBase, battleData, callback, attackHurt?) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_WIN);
        let summary = new cc.Node((type as any).name).addComponent(type);
        summary.init(battleData, callback, attackHurt);
        summary.open();
    }

    //主线副本结算
    private _BATTLE_TYPE_NORMAL_DUNGEON(battleData, callback) {
        this.openSummary(SummaryNormalWin, battleData, callback);
    }

    //--失败结算
    private _BATTLE_TYPE_NORMAL_DUNGEON_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryLose").addComponent(SummaryLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--每日副本结算
    private _BATTLE_TYPE_CHALLENGE_DAILY(battleData, callback) {
        this.openSummary(SummaryDailyWin, battleData, callback);
    }

    //--每日副本失败
    private _BATTLE_TYPE_CHALLENGE_DAILY_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryDailyLose").addComponent(SummaryDailyLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--爬塔结算
    private _BATTLE_TYPE_CHALLENGE_TOWER(battleData, callback) {
        this.openSummary(SummaryTowerWin, battleData, callback);
    }

    //--爬塔失败
    private _BATTLE_TYPE_CHALLENGE_TOWER_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryTowerLose").addComponent(SummaryTowerLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--叛军结算
    private _BATTLE_TYPE_SIEGE(battleData, callback, attackHurt) {
        this.openSummary(SummaryRebelEnd, battleData, callback, attackHurt);
    }

    //--世界boss
    private _BATTLE_TYPE_WORLDBOSS(battleData, callback) {
        this.openSummary(SummaryWorldBossEnd, battleData, callback);
    }

    //--抢夺成功
    private _BATTLE_TYPE_WORLDBOSS_POINT(battleData, callback) {
        this.openSummary(SummaryWorldBossWin, battleData, callback);
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_13);
    }

    //--抢夺失败
    private _BATTLE_TYPE_WORLDBOSS_POINT_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryWorldBossLose").addComponent(SummaryWorldBossLose);
        summary.init(battleData, callback);
        summary.open();
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_14);
    }

    private _BATTLE_TYPE_CROSS_WORLDBOSS(battleData, callback) {
        this.openSummary(SummaryWorldBossEnd, battleData, callback);
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24);
    }
    private _BATTLE_TYPE_CROSS_WORLDBOSS_POINT = function (battleData, callback) {
        this.openSummary(SummaryWorldBossWin, battleData, callback);
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_13);
    }
    private _BATTLE_TYPE_CROSS_WORLDBOSS_POINT_LOSE = function (battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryWorldBossLose").addComponent(SummaryWorldBossLose);
        summary.init(battleData, callback);
        summary.open();
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_14);
    }

    //--竞技场失败
    private _BATTLE_TYPE_ARENA_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryArenaLose").addComponent(SummaryArenaLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--竞技场胜利
    private _BATTLE_TYPE_ARENA(battleData, callback) {
        this.openSummary(SummaryArenaWin, battleData, callback);
    }

    //--竞技场巅峰对决
    private _BATTLE_TYPE_REPORT(battleData, callback) {
        this.openSummary(SummaryArenaReport, battleData, callback);
    }

    //--董卓之乱
    private _BATTLE_TYPE_EXPLORE_BOSS(battleData, callback, attackHurt) {
        this.openSummary(SummaryExploreBoss, battleData, callback, attackHurt);
    }

    //--洛阳之乱胜利
    private _BATTLE_TYPE_EXPLORE_REBEL(battleData, callback) {
        this.openSummary(SummaryExploreRebelWin, battleData, callback);
    }

    //--洛阳之乱失败
    private _BATTLE_TYPE_EXPLORE_REBEL_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryExploreRebelLose").addComponent(SummaryExploreRebelLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--领地战斗胜利
    private _BATTLE_TYPE_TERRITORY(battleData, callback) {
        this.openSummary(SummaryTerritoryWin, battleData, callback);
    }

    //--领地战斗失败
    private _BATTLE_TYPE_TERRITORY_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryTerritoryLose").addComponent(SummaryTerritoryLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--日常精英本boss胜利
    private _BATTLE_TYPE_DAILY_BOSS(battleData, callback) {
        this.openSummary(SummaryDailyBossWin, battleData, callback);
    }

    //--日常精英本boss失败
    private _BATTLE_TYPE_DAILY_BOSS_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryDailyBossLose").addComponent(SummaryDailyBossLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--好友切磋界面
    private _BATTLE_TYPE_FRIEND(battleData, callback) {
        this.openSummary(SummaryFriendWin, battleData, callback);
    }

    //--好友切磋失败结算
    private _BATTLE_TYPE_FRIEND_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryLose").addComponent(SummaryLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--爬塔精英本结算
    private _BATTLE_TYPE_TOWER_SUPER(battleData, callback) {
        this.openSummary(SummaryTowerSuperWin, battleData, callback);
    }

    //--爬塔精英本失败
    private _BATTLE_TYPE_TOWER_SUPER_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryTowerSuperLose").addComponent(SummaryTowerSuperLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--名将本胜利
    private _BATTLE_TYPE_FAMOUS(battleData, callback) {
        this.openSummary(SummaryFamousWin, battleData, callback);
    }

    //--名将本失败
    private _BATTLE_TYPE_FAMOUS_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryFamousLose").addComponent(SummaryFamousLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--帐篷胜利
    private _BATTLE_TYPE_GENERAL(battleData, callback) {
        this.openSummary(SummaryGeneralWin, battleData, callback);
    }

    //--帐篷失败
    private _BATTLE_TYPE_GENERAL_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryGeneralLose").addComponent(SummaryGeneralLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--军团副本胜利
    private _BATTLE_TYPE_GUILD_DUNGEON(battleData, callback) {
        this.openSummary(SummaryGuildDungeonWin, battleData, callback);
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_7);
    }

    //--军团副本失败
    private _BATTLE_TYPE_GUILD_DUNGEON_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryGuildDungeonLose").addComponent(SummaryGuildDungeonLose);
        summary.init(battleData, callback);
        summary.open();
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_5);
    }

    //--矿战胜利
    private _BATTLE_TYPE_MINE(battleData, callback) {
        this.openSummary(SummaryMineWin, battleData, callback);
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_20);
    }

    //--矿战失败
    private _BATTLE_TYPE_MINE_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryMineLose").addComponent(SummaryMineLose);
        summary.init(battleData, callback);
        summary.open();
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_20);
    }

    //--抢夺成功
    private _BATTLE_TYPE_REVENGE(battleData, callback) {
        this.openSummary(SummaryRevengeWin, battleData, callback);
    }

    //--抢夺失败
    private _BATTLE_TYPE_REVENGE_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryRevengeLose").addComponent(SummaryRevengeLose);
        summary.init(battleData, callback);
        summary.open();
    }

    private _BATTLE_TYPE_CAMP_RACE(battleData, callback) {
        this.openSummary(SummaryCampRaceEnd, battleData, callback);
    }

    //--跨服个人竞技
    private _BATTLE_TYPE_SINGLE_RACE(battleData, callback) {
        this.openSummary(SummarySingleRaceEnd, battleData, callback);
    }

    private  _BATTLE_TYPE_UNIVERSE_RACE(battleData, callback) {
        this.openSummary(SummarySingleRaceEnd, battleData, callback);
    };

    //--三国战记 boss
    private _BATTLE_TYPE_COUNTRY_BOSS(battleData, callback) {
        this.openSummary(SummaryCountryBossEnd, battleData, callback);
        HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_15);
    }

    private _BATTLE_TYPE_COUNTRY_BOSS_INTERCEPT(battleData, callback) {
        this.openSummary(SummaryCountryBossInterceptWin, battleData, callback);
    }

    //--抢夺失败
    private _BATTLE_TYPE_COUNTRY_BOSS_INTERCEPT_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryCountryBossInterceptLose").addComponent(SummaryCountryBossInterceptLose);
        summary.init(battleData, callback);
        summary.open();
    }

    //--军团战胜利
    private _BATTLE_TYPE_GUILD_WAR(battleData, callback) {
        this.openSummary(SummaryGuildWarWin, battleData, callback);
    }

    //--军团战失败
    private _BATTLE_TYPE_GUILD_WAR_LOSE(battleData, callback) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_FAIL);
        var summary = new cc.Node("SummaryGuildWarLose").addComponent(SummaryGuildWarLose);
        summary.init(battleData, callback);
    }

    //--无差别竞技胜利
    private _BATTLE_TYPE_SEASON_FIGHTS(battleData, callback) {
        this.openSummary(SummarySeasonEnd, battleData, callback);
    }

    //--军团试炼回放
    private _BATTLE_TYPE_GUILD_REPORT(battleData, callback) {
        this.openSummary(SummaryGuildReportEnd, battleData, callback);
    };
}