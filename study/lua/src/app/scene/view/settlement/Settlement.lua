local Settlement = {}

local BattleDataHelper = require("app.utils.BattleDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local HomelandConst = require("app.const.HomelandConst")

local AudioConst = require("app.const.AudioConst")

function Settlement.exitFight()
    -- G_SceneManager:fightScenePop()
    G_SignalManager:dispatch(SignalConst.EVENT_EXIT_FIGHT)      --做成消息退出机制
end

--战斗信息，是否胜利，升级，点击回掉
function Settlement.createSettleMent(battleData, isWin, callback, attackHurt, statisticData)
    -- G_AudioManager:stopMusic()       --同时停止和播放音效时候会发生问题
    battleData.statisticsData = statisticData
    local functionName = BattleDataHelper.getTypeName(battleData.battleType)
    local strLose = ""
    if not isWin then
        strLose = "_LOSE"
    end
    local func = Settlement["_"..functionName..strLose]
    local panelSettleMent = nil
    if func ~= nil and type(func) == "function" then
        panelSettleMent = func(battleData, Settlement.exitFight, attackHurt)
    else
        func = Settlement["_"..functionName]
        panelSettleMent = func(battleData, Settlement.exitFight, attackHurt)
    end
    return panelSettleMent
end

local function openSummary(type, battleData, callback, attackHurt)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_WIN)
    local str = "app.scene.view.settlement."..type
    local summary = require(str).new(battleData, callback, attackHurt)
    summary:open()
end

--主线副本结算
function Settlement._BATTLE_TYPE_NORMAL_DUNGEON(battleData, callback)
    openSummary("SummaryNormalWin", battleData, callback)
end

--失败结算
function Settlement._BATTLE_TYPE_NORMAL_DUNGEON_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--每日副本结算
function Settlement._BATTLE_TYPE_CHALLENGE_DAILY(battleData, callback)
    openSummary("SummaryDailyWin", battleData, callback)
end

--每日副本失败
function Settlement._BATTLE_TYPE_CHALLENGE_DAILY_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryDailyLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--爬塔结算
function Settlement._BATTLE_TYPE_CHALLENGE_TOWER(battleData, callback)
    openSummary("SummaryTowerWin", battleData, callback)
end

--爬塔失败
function Settlement._BATTLE_TYPE_CHALLENGE_TOWER_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryTowerLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--叛军结算
function Settlement._BATTLE_TYPE_SIEGE(battleData, callback, attackHurt)
    openSummary("SummaryRebelEnd", battleData, callback, attackHurt)
end

--世界boss
function Settlement._BATTLE_TYPE_WORLDBOSS(battleData, callback)
    openSummary("SummaryWorldBossEnd", battleData, callback)
end


--抢夺成功
function Settlement._BATTLE_TYPE_WORLDBOSS_POINT(battleData, callback)
    openSummary("SummaryWorldBossWin", battleData, callback)
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_13) --神树祈福buff
end

--抢夺失败
function Settlement._BATTLE_TYPE_WORLDBOSS_POINT_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryWorldBossLose = require("app.scene.view.settlement.SummaryWorldBossLose")
    local summary = SummaryWorldBossLose.new(battleData, callback)
    summary:open()
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_14) --神树祈福buff
end

--跨服世界boss
function Settlement._BATTLE_TYPE_CROSS_WORLDBOSS(battleData, callback)
    openSummary("SummaryCrossWorldBossEnd", battleData, callback)

    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24) --神树祈福buff
end


--跨服世界boss抢夺成功
function Settlement._BATTLE_TYPE_CROSS_WORLDBOSS_POINT(battleData, callback)
    openSummary("SummaryWorldBossWin", battleData, callback)
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_13) --神树祈福buff
end

--跨服世界boss抢夺失败
function Settlement._BATTLE_TYPE_CROSS_WORLDBOSS_POINT_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryWorldBossLose = require("app.scene.view.settlement.SummaryWorldBossLose")
    local summary = SummaryWorldBossLose.new(battleData, callback)
    summary:open()
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_14) --神树祈福buff
end

--竞技场失败
function Settlement._BATTLE_TYPE_ARENA_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryArenaLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--竞技场胜利
function Settlement._BATTLE_TYPE_ARENA(battleData, callback)
    openSummary("SummaryArenaWin", battleData, callback)
end

--竞技场巅峰对决
function Settlement._BATTLE_TYPE_REPORT(battleData, callback)
    openSummary("SummaryArenaReport", battleData, callback)
end

--董卓之乱
function Settlement._BATTLE_TYPE_EXPLORE_BOSS(battleData, callback, attackHurt)
    openSummary("SummaryExploreBoss", battleData, callback, attackHurt)
end

--洛阳之乱胜利
function Settlement._BATTLE_TYPE_EXPLORE_REBEL(battleData, callback)
    openSummary("SummaryExploreRebelWin", battleData, callback)
end

--洛阳之乱失败
function Settlement._BATTLE_TYPE_EXPLORE_REBEL_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryExploreRebelLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--领地战斗胜利
function Settlement._BATTLE_TYPE_TERRITORY(battleData, callback)
    openSummary("SummaryTerritoryWin", battleData, callback)
end

--领地战斗失败
function Settlement._BATTLE_TYPE_TERRITORY_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryTerritoryLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--日常精英本boss胜利
function Settlement._BATTLE_TYPE_DAILY_BOSS(battleData, callback)
    openSummary("SummaryDailyBossWin", battleData, callback)
end

--日常精英本boss失败
function Settlement._BATTLE_TYPE_DAILY_BOSS_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryDailyBossLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--好友切磋界面
function Settlement._BATTLE_TYPE_FRIEND(battleData, callback)
    openSummary("SummaryFriendWin", battleData, callback)
end


--好友切磋失败结算
function Settlement._BATTLE_TYPE_FRIEND_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--爬塔精英本结算
function Settlement._BATTLE_TYPE_TOWER_SUPER(battleData, callback)
    openSummary("SummaryTowerSuperWin", battleData, callback)
end

--爬塔精英本失败
function Settlement._BATTLE_TYPE_TOWER_SUPER_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryTowerSuperLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--名将本胜利
function Settlement._BATTLE_TYPE_FAMOUS(battleData, callback)
    openSummary("SummaryFamousWin", battleData, callback)
end

--名将本失败
function Settlement._BATTLE_TYPE_FAMOUS_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryFamousLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--帐篷胜利
function Settlement._BATTLE_TYPE_GENERAL(battleData, callback)
    openSummary("SummaryGeneralWin", battleData, callback)
end

--帐篷失败
function Settlement._BATTLE_TYPE_GENERAL_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryGeneralLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--军团副本胜利
function Settlement._BATTLE_TYPE_GUILD_DUNGEON(battleData, callback)
    openSummary("SummaryGuildDungeonWin", battleData, callback)
    
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_7) --神树祈福buff
end

--军团副本失败
function Settlement._BATTLE_TYPE_GUILD_DUNGEON_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryGuildDungeonLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
    
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_5) --神树祈福buff
end

--矿战胜利
function Settlement._BATTLE_TYPE_MINE(battleData, callback)
    openSummary("SummaryMineWin", battleData, callback)
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_20) --神树祈福buff
end

--矿战失败
function Settlement._BATTLE_TYPE_MINE_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryMineLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_20) --神树祈福buff
end


--抢夺成功
function Settlement._BATTLE_TYPE_REVENGE(battleData, callback)
    openSummary("SummaryRevengeWin", battleData, callback)
end

--抢夺失败
function Settlement._BATTLE_TYPE_REVENGE_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryWorldBossLose = require("app.scene.view.settlement.SummaryRevengeLose")
    local summary = SummaryWorldBossLose.new(battleData, callback)
    summary:open()
end

--
function Settlement._BATTLE_TYPE_CAMP_RACE(battleData, callback)
    openSummary("SummaryCampRaceEnd", battleData, callback)
end

--跨服个人竞技
function Settlement._BATTLE_TYPE_SINGLE_RACE(battleData, callback)
    openSummary("SummarySingleRaceEnd", battleData, callback)
end

--真武战神
function Settlement._BATTLE_TYPE_UNIVERSE_RACE(battleData, callback)
    openSummary("SummaryUniverseRaceEnd", battleData, callback)
end

--三国战记 boss
function Settlement._BATTLE_TYPE_COUNTRY_BOSS(battleData, callback)
    openSummary("SummaryCountryBossEnd", battleData, callback)
    HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_15) --神树祈福buff
end


function Settlement._BATTLE_TYPE_COUNTRY_BOSS_INTERCEPT(battleData, callback)
    openSummary("SummaryCountryBossInterceptWin", battleData, callback)
end

--抢夺失败
function Settlement._BATTLE_TYPE_COUNTRY_BOSS_INTERCEPT_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryWorldBossLose = require("app.scene.view.settlement.SummaryCountryBossInterceptLose")
    local summary = SummaryWorldBossLose.new(battleData, callback)
    summary:open()
end

--军团战胜利
function Settlement._BATTLE_TYPE_GUILD_WAR(battleData, callback)
    openSummary("SummaryGuildWarWin", battleData, callback)
end

--军团战失败
function Settlement._BATTLE_TYPE_GUILD_WAR_LOSE(battleData, callback)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_FAIL)
    local SummaryLose = require("app.scene.view.settlement.SummaryGuildWarLose")
    local summary = SummaryLose.new(battleData, callback)
    summary:open()
end

--无差别竞技胜利
function Settlement._BATTLE_TYPE_SEASON_FIGHTS(battleData, callback)
    openSummary("SummarySeasonEnd", battleData, callback)
end

--军团试炼回放
function Settlement._BATTLE_TYPE_GUILD_REPORT(battleData, callback)
    openSummary("SummaryGuildReportEnd", battleData, callback)
end


return Settlement
