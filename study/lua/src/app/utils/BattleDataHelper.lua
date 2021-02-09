local BattleDataHelper = {}

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local MonsterTalk = require("app.config.monster_talk")


BattleDataHelper.BATTLE_TYPE_NORMAL_DUNGEON = 1
BattleDataHelper.BATTLE_TYPE_CHALLENGE_DAILY = 2
BattleDataHelper.BATTLE_TYPE_CHALLENGE_TOWER = 3
BattleDataHelper.BATTLE_TYPE_SIEGE = 4 --叛军    --战斗结束
BattleDataHelper.BATTLE_TYPE_ARENA = 5 --竞技场
BattleDataHelper.BATTLE_TYPE_DAILY_BOSS = 6 --章节boss
BattleDataHelper.BATTLE_TYPE_REPORT = 7 --录像数据
BattleDataHelper.BATTLE_TYPE_EXPLORE_REBEL = 8 --洛阳之乱
BattleDataHelper.BATTLE_TYPE_EXPLORE_BOSS = 9 --董卓之乱
BattleDataHelper.BATTLE_TYPE_TERRITORY = 10 --领地攻占
BattleDataHelper.BATTLE_TYPE_TOWER_SURPRISE = 11 --爬塔奇遇  --爬塔结算  --这个估计不要了
BattleDataHelper.BATTLE_TYPE_FRIEND = 12 --好友切磋
BattleDataHelper.BATTLE_TYPE_WORLDBOSS = 13 --世界boss
BattleDataHelper.BATTLE_TYPE_WORLDBOSS_POINT = 14 --抢夺积分
BattleDataHelper.BATTLE_TYPE_TOWER_SUPER = 15 --爬塔精英本
BattleDataHelper.BATTLE_TYPE_FAMOUS = 16 --普通名将副本
BattleDataHelper.BATTLE_TYPE_GENERAL = 17 --名将副本帐篷
BattleDataHelper.BATTLE_TYPE_GUILD_DUNGEON = 18 --军团副本
BattleDataHelper.BATTLE_TYPE_MINE = 19 --矿战
BattleDataHelper.BATTLE_TYPE_REVENGE = 20 --仇人复仇
BattleDataHelper.BATTLE_TYPE_COUNTRY_BOSS = 21 --三国战记 boss
BattleDataHelper.BATTLE_TYPE_COUNTRY_BOSS_INTERCEPT = 22 --三国战记 拦截
BattleDataHelper.BATTLE_TYPE_CAMP_RACE = 23 --阵营战斗
BattleDataHelper.BATTLE_TYPE_GUILD_WAR = 24 --军团战
BattleDataHelper.BATTLE_TYPE_SEASON_FIGHTS = 25 --无差别竞技
BattleDataHelper.BATTLE_TYPE_SINGLE_RACE = 26 --跨服个人竞技
BattleDataHelper.BATTLE_TYPE_GUILD_REPORT = 27 --军团试炼回放
BattleDataHelper.BATTLE_TYPE_UNIVERSE_RACE = 28 --真武战神
BattleDataHelper.BATTLE_TYPE_CROSS_WORLDBOSS = 29 --跨服世界boss
BattleDataHelper.BATTLE_TYPE_CROSS_WORLDBOSS_POINT = 30 --跨服世界boss掠夺玩家

function BattleDataHelper.doParseFunc(typeId, ...)
    return BattleDataHelper.parseFunc[typeId](...)
end

function BattleDataHelper.getTypeName(typeId)
    for key, value in pairs(BattleDataHelper) do
        if string.find(key, "BATTLE_TYPE_") and value == typeId then
            return key
        end
    end
    return ""
end

function BattleDataHelper.initBaseData(data)
    local reportData = G_UserData:getFightReport()
    data.attackName = reportData:getLeftName()
    data.defenseName = reportData:getRightName()
    data.attackPower = reportData:getLeftPower()
    data.defensePower = reportData:getRightPower()
    data.attackBaseId = reportData:getLeftBaseId()
    data.attackOffLevel = reportData:getLeftOfficerLevel()
    data.defenseBaseId = reportData:getRightBaseId()
    data.defenseOffLevel = reportData:getRightOfficerLevel()
    data.firstOrder = reportData:getFirstOrder()
    data.isWin = reportData:isWin()
    return data
end

--处理进入战斗时所附带的信息
local BattleData = {
    money = 0, --游戏币
    exp = 0, --经验
    star = 0, --星数
    awards = {}, --奖励
    chapterRewards = {}, --章节奖励
    addAwards = {}, --附加奖励
    background = {}, --场景资源id
    stageId = 0, --场景id
    alreadyPass = false, --是否已经通关
    battleType = 0, --战斗类型
    needShowJump = false, --是否显示跳过战斗按钮
    showBossId = 0, --需要展示的bossid
    oldRank = 0, --老的排名，
    newRank = 0, --新的排名,
    monsterTeamId = 0, --怪物组id,pve的时候，talk需求知道怪物id
    oldGuildRank = 0, --老的工会排名
    newGuildRank = 0, --新的工会排名
    totalHurt = 0, --战斗伤害
    bgm = 0,
    --用户基本信息
    defenseName = "",
    attackName = "",
    attackPower = 0,
    defensePower = 0,
    attackBaseId = 0,
    attackOffLevel = 0,
    defenseOffLevel = 0,
    defenseBaseId = 0,
    firstOrder = 0,
    isWin = false,
    isDouble = false   -- 是否是双倍奖励
}

local function checkMonsterTalk(battleData, monsterTeamId)
    --检查怪物talk
    battleData.monsterTalk = {}
    battleData.monsterTeamId = monsterTeamId
    local count = MonsterTalk.length()
    for i = 1, count do
        local talkConfig = MonsterTalk.indexOf(i)
        if talkConfig.teamid == monsterTeamId then
            -- print("1112233 monster talk", talkConfig.teamid, talkConfig.id)
            table.insert(battleData.monsterTalk, talkConfig)
        end
    end
end

--章节战斗
function BattleDataHelper.parseNormalDungeonData(message, stageInfo, isFamous, isFirstPass)
    local battleData = clone(BattleData)
    if isFamous then
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_FAMOUS
    else
        battleData.battleType = BattleDataHelper.BATTLE_TYPE_NORMAL_DUNGEON
    end
    battleData.money = message.stage_money
    battleData.exp = message.stage_exp
    battleData.star = message.stage_star
    battleData.bgm = stageInfo.bgm
    local stageId = stageInfo.id

    local background = stageInfo.in_res
    local strArr = string.split(background, "|")
    for k, v in ipairs(strArr) do
        local number = tonumber(v)
        table.insert(battleData.background, number)
    end

    for _, val in pairs(message.awards) do
        local award = {
            type = val.type,
            value = val.value,
            size = val.size
        }
        table.insert(battleData.awards, val)
    end

    for _, val in pairs(message.chapter_awards) do
        local award = {
            type = val.type,
            value = val.value,
            size = val.size
        }
        table.insert(battleData.chapterRewards, val)
    end

    for _, val in pairs(message.add_awards) do
        local addAward = {
            index = val.index,
            award = {
                type = val.award.type,
                value = val.award.value,
                size = val.award.size
            }
        }
        table.insert(battleData.addAwards, addAward)
    end

    checkMonsterTalk(battleData, stageInfo.monster_team_id)
    battleData.monsterTeamId = stageInfo.monster_team_id
    local stageData = G_UserData:getStage():getStageById(stageId)
    battleData.stageId = stageId
    -- battleData.background = background
    battleData.alreadyPass = stageData:isIs_finished()
    if isFirstPass then
        battleData.alreadyPass = false
    end
    if battleData.alreadyPass then
        battleData.needShowJump = true
    else
        battleData.monsterTeamId = stageInfo.monster_team_id
        if G_UserData:getStage():isLastStage(stageId) and battleData.star ~= 0 then
            local chapterData = G_UserData:getStage():getChapterData(stageId)
            chapterData:setShowEnding(true)
            chapterData:setShowRunningMap(true)
        end
    end
    battleData.showBossId = stageData:getConfigData().show_boss
    G_UserData:getStage():setNowFightStage(stageId)

    battleData.isDouble = rawget(message, "is_double") or false
    
    return battleData
end

--每日挑战
function BattleDataHelper.parseChallengeDailyData(message, configData)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_CHALLENGE_DAILY
    table.insert(battleData.background, configData.battle_background)
    -- battleData.background = configData.battle_background
    local type = configData.type
    local maxId = G_UserData:getDailyDungeonData():getMaxIdByType(type)
    if maxId >= configData.id then
        battleData.needShowJump = true
    end
    for _, val in pairs(message.awards) do
        local award = {
            type = val.type,
            value = val.value,
            size = val.size
        }
        table.insert(battleData.awards, val)
    end
    return battleData
end

--爬塔挑战
function BattleDataHelper.parseChallengeTowerData(message, layerConfig, star)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_CHALLENGE_TOWER
    table.insert(battleData.background, layerConfig.in_res)

    local layerId = layerConfig.id
    local historyStar = G_UserData:getTowerData():getHistoryStarByLayer(layerId)
    battleData.monsterTeamId = layerConfig["monster_team_id_" .. star]
    battleData.star = star
    if historyStar >= battleData.star then
        battleData.needShowJump = true
    end
    for _, val in pairs(message.total_award) do
        local award = {
            type = val.type,
            value = val.value,
            size = val.size
        }
        table.insert(battleData.awards, val)
    end
    for _, val in pairs(message.add_award) do
        local addAward = {
            index = val.index,
            award = {
                type = val.award.type,
                value = val.award.value,
                size = val.award.size
            }
        }
        table.insert(battleData.addAwards, addAward)
    end
    return battleData
end

--爬塔精英挑战
function BattleDataHelper.parseChallengeSuperTowerData(message, layerConfig, pass)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_TOWER_SUPER
    table.insert(battleData.background, layerConfig.in_res)
    local layerId = layerConfig.id
    battleData.monsterTeamId = layerConfig["monster_team"]
    battleData.star = 3

    battleData.needShowJump = pass --#message.first_reward <= 0
    logWarn("------------------" .. tostring(pass))
    for _, val in pairs(message.reward) do
        local award = {
            type = val.type,
            value = val.value,
            size = val.size
        }
        table.insert(battleData.awards, award)
    end
    --[[
    -- 首次奖励战斗结束返回挑战界面时会展示
    for k, val in pairs(message.first_reward) do
        local award = {
            type = val.type,
            value = val.value,
            size = val.size,
        }
        table.insert(battleData.awards, award)
    end
    ]]
    return battleData
end

--剿匪战斗
function BattleDataHelper.parseSiegeBattleData(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_SIEGE
    table.insert(battleData.background, background)
    -- battleData.background = background
    battleData.needShowJump = true
    if rawget(message, "reward") then
        for _, val in pairs(message.reward) do
            local award = {
                type = val.type,
                value = val.value,
                size = val.size
            }
            table.insert(battleData.awards, val)
        end
    end
    if rawget(message, "add_rewards") then
        for _, val in pairs(message.add_rewards) do
            local addAward = {
                index = val.index,
                award = {
                    type = val.award.type,
                    value = val.award.value,
                    size = val.award.size
                }
            }
            table.insert(battleData.addAwards, addAward)
        end
    end
    battleData.oldRank = message.user_begin_rank
    battleData.newRank = message.user_end_rank
    battleData.oldGuildRank = message.guild_begin_rank
    battleData.newGuildRank = message.guild_end_rank
    battleData.totalHurt = message.once_hurt
    return battleData
end

--[[

    //对应BattleReport修改
message BattleReport {
	repeated BattleWave waves = 1;    //每波战斗信息
	optional uint32 pk_type = 2;      //战斗类型 1 pve 2 pvp
	optional bool is_win = 3;         //整场战斗的输赢
	repeated uint32 skill_ids = 4;    //战斗使用的技能，用于整场战斗加载
	optional string attack_name = 5;  //攻击方姓名
	optional string defense_name = 6;  //防守方姓名
	optional uint32 attack_officer_level = 7; // 攻击方官衔
	optional uint32 defense_officer_level = 8; // 受击方官衔
	optional uint32 max_round_num = 9; //最大回合数
}

]]
--解析竞技场数据
function BattleDataHelper.parseArenaData(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_ARENA

    battleData.needShowJump = true
    -- battleData.background = 1
    table.insert(battleData.background, 1)
    battleData.defenseName = message.battle_report.defense_name
    battleData.attackName = message.battle_report.attack_name
    battleData.oldRank = rawget(message, "old_rank") or 0
    battleData.newRank = rawget(message, "new_rank") or 0
    battleData.attackPower = rawget(message.battle_report, "attack_power")
    battleData.defensePower = rawget(message.battle_report, "defense_power")
    battleData.attackBaseId = rawget(message.battle_report, "attack_base_id")
    battleData.attackOffLevel = rawget(message.battle_report, "attack_officer_level")
    battleData.defenseOffLevel = rawget(message.battle_report, "defense_officer_level")
    battleData.defenseBaseId = rawget(message.battle_report, "defense_base_id")
    battleData.firstOrder = rawget(message.battle_report, "first_order") -- 谁先手 1 攻击方先手 2 防守方先手

    battleData.result = rawget(message, "result") or true
    -- battleData.turnoverRewards = rawget(message, "turnover_rewards") or {}
    if rawget(message, "rewards") then
        for _, val in pairs(message.rewards) do
            local award = {
                type = val.type,
                value = val.value,
                size = val.size
            }
            table.insert(battleData.awards, val)
        end
    end
    if rawget(message, "add_rewards") then
        for _, val in pairs(message.add_rewards) do
            local addAward = {
                index = val.index,
                award = {
                    type = val.award.type,
                    value = val.award.value,
                    size = val.award.size
                }
            }
            table.insert(battleData.addAwards, addAward)
        end
    end
    return battleData
end

function BattleDataHelper.parseFriendFight()
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_FRIEND
    -- battleData.attackOffLevel = rawget(message, "attack_officer_level")
    -- battleData.defenseOffLevel = rawget(message, "defense_officer_level")
    -- battleData.defenseName = rawget(message,"defense_name")
    -- battleData.attackName  =  rawget(message, "attack_name")

    battleData.needShowJump = true
    table.insert(battleData.background, 1)
    return battleData
end

function BattleDataHelper.parseWorldBossFight(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_WORLDBOSS
    battleData.point = rawget(message, "point")
    --积分
    battleData.hurt = rawget(message, "hurt")
    --造成伤害
    battleData.needShowJump = true
    battleData.awards = {}
    if rawget(message, "award") then
        for _, val in pairs(message.award) do
            local award = {
                type = val.type,
                value = val.value,
                size = val.size
            }
            table.insert(battleData.awards, val)
        end
    end

    table.insert(battleData.background, 1)
    return battleData
end

function BattleDataHelper.parseCrossWorldBossPoint(message, isCharge)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_CROSS_WORLDBOSS_POINT
    battleData.point = rawget(message, "point")
    --积分
    battleData.needShowJump = true

    local AudioConst = require("app.const.AudioConst")

    battleData.ignoreBgm = true
    --battleData.bgm = isCharge and AudioConst.SOUND_CROSS_CHARGE_STATE_BG or AudioConst.SOUND_CROSS_NORMAL_STATE_BG

    local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")
    local normalSceneId = CrossWorldBossHelper.getParameterValue("battle_scene_1")
    local chargeSceneId = CrossWorldBossHelper.getParameterValue("battle_scene_2")

    table.insert(battleData.background, isCharge == true and chargeSceneId or normalSceneId)

    return battleData
end

function BattleDataHelper.parseCrossWorldBossFight(message, isCharge)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_CROSS_WORLDBOSS
    battleData.point = rawget(message, "point")
    --积分
    battleData.hurt = rawget(message, "hurt")
    --造成伤害
    battleData.needShowJump = true
    battleData.awards = {}
    if rawget(message, "award") then
        for _, val in pairs(message.award) do
            local award = {
                type = val.type,
                value = val.value,
                size = val.size
            }
            table.insert(battleData.awards, val)
        end
    end

    local AudioConst = require("app.const.AudioConst")

    battleData.ignoreBgm = true
    --battleData.bgm = isCharge and AudioConst.SOUND_CROSS_CHARGE_STATE_BG or AudioConst.SOUND_CROSS_NORMAL_STATE_BG

    local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")
    local normalSceneId = CrossWorldBossHelper.getParameterValue("battle_scene_1")
    local chargeSceneId = CrossWorldBossHelper.getParameterValue("battle_scene_2")

    table.insert(battleData.background, isCharge == true and chargeSceneId or normalSceneId)

    return battleData
end

function BattleDataHelper.parseWorldBossPoint(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_WORLDBOSS_POINT
    battleData.point = rawget(message, "point")
    --积分
    battleData.needShowJump = true

    table.insert(battleData.background, 1)
    return battleData
end

--章节boss
function BattleDataHelper.parseDailyBossData(message, background, needSkipFight)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_DAILY_BOSS
    if needSkipFight then
        battleData.needShowJump = needSkipFight
    end
    table.insert(battleData.background, background)
    -- battleData.background = background
    battleData.money = message.silver
    battleData.exp = message.exp
    if rawget(message, "awards") then
        for _, val in pairs(message.awards) do
            local award = {
                type = val.type,
                value = val.value,
                size = val.size
            }
            table.insert(battleData.awards, val)
        end
    end
    return battleData
end

--领地数据
function BattleDataHelper.parseTerritoryBattleData(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_TERRITORY

    battleData.money = 0
    --message.territory_money
    battleData.exp = rawget(message, "exp") or 0

    battleData.needShowJump = true
    -- battleData.background = 1
    table.insert(battleData.background, 1)

    if rawget(message, "awards") then
        for _, val in pairs(message.awards) do
            local award = {
                type = val.type,
                value = val.value,
                size = val.size
            }
            table.insert(battleData.awards, val)
        end
    end
    return battleData
end

--解析录像数据
function BattleDataHelper.parseBattleReportData(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_REPORT
    -- battleData.background = 1
    table.insert(battleData.background, 1)
    battleData.needShowJump = true
    battleData.attackName = message.attack.user.name
    battleData.defenseName = message.defense.user.name
    battleData.attackLevel = message.attack.user.officer_level
    battleData.attackRank = message.attack_rank
    battleData.defenseRank = message.defense_rank
    battleData.defenseLevel = message.defense.user.officer_level
    battleData.isWin = true

    return battleData
end

--解析录像数据
function BattleDataHelper.parseGuildDungeonBattleReportData(message, leftName, leftOfficer, rightName, rightOfficer, isWin)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_GUILD_REPORT
    -- battleData.background = 1
    table.insert(battleData.background, 1)
    
    -- battleData.is_win = rawget(message, "is_win") or false
    -- battleData.needShowJump = true
    -- if battleData.is_win then
    --     battleData.attackOffLevel = rawget(message, "attack_officer_level") or 0
    --     battleData.defenseOffLevel = rawget(message, "defense_officer_level") or 0
    --     battleData.defenseName = rawget(message, "defense_name")
    --     battleData.attackName = rawget(message, "attack_name")
    --     battleData.attackLevel = rawget(message, "attack_officer_level") or 0
    --     battleData.defenseLevel = rawget(message, "defense_officer_level") or 0
    -- else
        battleData.attackOffLevel = leftOfficer
        battleData.defenseOffLevel = leftOfficer
        battleData.defenseName = rightName
        battleData.attackName = leftName
        battleData.attackLevel = leftOfficer
        battleData.defenseLevel = rightOfficer
        battleData.isWin = isWin
        battleData.needShowJump = true
    -- end


    return battleData
end

--解析洛阳之乱数据
function BattleDataHelper.parseExploreRebelBattleData(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_EXPLORE_REBEL
    battleData.needShowJump = true
    table.insert(battleData.background, background)
    -- battleData.background = background
    if rawget(message, "awards") then
        for _, val in pairs(message.awards) do
            if val.type == TypeConvertHelper.TYPE_RESOURCE and val.value == DataConst.RES_EXP then
                battleData.exp = val.size
            elseif val.type == TypeConvertHelper.TYPE_RESOURCE and val.value == DataConst.RES_GOLD then
                battleData.money = val.size
            else
                local award = {
                    type = val.type,
                    value = val.value,
                    size = val.size
                }
                table.insert(battleData.awards, val)
            end
        end
    end
    return battleData
end

--解析董卓之乱
function BattleDataHelper.parseExploreBossBattleData(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_EXPLORE_BOSS
    table.insert(battleData.background, background)
    battleData.needShowJump = true
    -- battleData.background = background
    if rawget(message, "awards") then
        for _, val in pairs(message.awards) do
            if val.type == TypeConvertHelper.TYPE_RESOURCE and val.value == DataConst.RES_EXP then
                battleData.exp = val.size
            elseif val.type == TypeConvertHelper.TYPE_RESOURCE and val.value == DataConst.RES_GOLD then
                battleData.money = val.size
            else
                local award = {
                    type = val.type,
                    value = val.value,
                    size = val.size
                }
                table.insert(battleData.awards, val)
            end
        end
    end
    return battleData
end

--解析爬塔奇遇
function BattleDataHelper.parseTowerSurprise(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_TOWER_SURPRISE
    table.insert(battleData.background, background)
    -- battleData.background = background
    battleData.needShowJump = true
    if rawget(message, "reward") then
        for _, val in pairs(message.reward) do
            if val.type == TypeConvertHelper.TYPE_RESOURCE and val.value == DataConst.RES_GOLD then
                battleData.money = val.size
            else
                local award = {
                    type = val.type,
                    value = val.value,
                    size = val.size
                }
                table.insert(battleData.awards, val)
            end
        end
    end
    return battleData
end

--名将本
function BattleDataHelper.parseFamousDungeon(message, stageData)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_GENERAL

    local configData = stageData:getConfigData()
    local background = configData.in_res
    local strArr = string.split(background, "|")
    for k, v in ipairs(strArr) do
        local number = tonumber(v)
        table.insert(battleData.background, number)
    end

    battleData.needShowJump = false

    for _, val in pairs(message.awards) do
        local award = {
            type = val.type,
            value = val.value,
            size = val.size
        }
        table.insert(battleData.awards, val)
    end

    battleData.isDouble = rawget(message, "is_double") or false

    return battleData
end

--军团副本
function BattleDataHelper.parseGuildDungeon(message, atkName, atkLevel, defName, defOfficer)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_GUILD_DUNGEON
    table.insert(battleData.background, 1)

    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_DUNGEON_SKIP)
    battleData.needShowJump = isOpen
    for _, val in pairs(message.rewards) do
        local award = {
            type = val.type,
            value = val.value,
            size = val.size
        }
        table.insert(battleData.awards, award)
    end

    return battleData
end

--矿战
function BattleDataHelper.parseMineBattle(mineUser, background, selfData)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_MINE
    local strArr = string.split(background, "|")
    for k, v in ipairs(strArr) do
        local number = tonumber(v)
        table.insert(battleData.background, number)
    end

    battleData.defenseOffLevel = mineUser.officer_level
    battleData.defenseName = mineUser.user_name
    battleData.needShowJump = true

    battleData.selfData = selfData
    return battleData
end

--军团战
function BattleDataHelper.parseGuildWar(message, attackUser, defenderUser)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_GUILD_WAR
    table.insert(battleData.background, 1)
    battleData.needShowJump = true

    battleData.defenseOffLevel = defenderUser:getOfficer_level()
    battleData.defenseName = defenderUser:getUser_name()

    battleData.is_win = rawget(message.report, "is_win") or false

    local selfData = nil

    logWarn("BattleDataHelper ------------  " .. tostring(battleData.is_win))
    if battleData.is_win then --自己 体力减一敌方体力未0
        selfData = {
            myBeginVit = attackUser:getWar_value(),
            myEndVit = attackUser:getWar_value() - 1,
            tarBeginVit = defenderUser:getWar_value(),
            tarEndVit = 0
        }
    else --自己 体力减一敌方体力不变
        selfData = {
            myBeginVit = attackUser:getWar_value(),
            myEndVit = 0,
            tarBeginVit = defenderUser:getWar_value(),
            tarEndVit = defenderUser:getWar_value() - 1
        }
    end

    battleData.selfData = selfData

    return battleData
end

--复仇
function BattleDataHelper.parseEnemyRevenge(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_REVENGE
    battleData.awards = rawget(message, "awards") or {}
    --积分
    battleData.needShowJump = true

    table.insert(battleData.background, 1)
    return battleData
end

--阵营竞技
function BattleDataHelper.parseCampRace(leftName, rightName, leftOfficer, rightOfficer, winPos)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_CAMP_RACE

    battleData.needShowJump = true

    battleData.leftName = leftName
    battleData.rightName = rightName
    battleData.leftOfficer = leftOfficer
    battleData.rightOfficer = rightOfficer
    battleData.winPos = winPos

    table.insert(battleData.background, 1)
    return battleData
end

--跨服个人竞技
function BattleDataHelper.parseSingleRace(leftName, rightName, leftOfficer, rightOfficer, winPos)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_SINGLE_RACE

    battleData.needShowJump = true

    battleData.leftName = leftName
    battleData.rightName = rightName
    battleData.leftOfficer = leftOfficer
    battleData.rightOfficer = rightOfficer
    battleData.winPos = winPos

    table.insert(battleData.background, 17)
    return battleData
end

--真武战神
function BattleDataHelper.parseUniverseRace(leftName, rightName, leftOfficer, rightOfficer, winPos)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_UNIVERSE_RACE

    battleData.needShowJump = true

    battleData.leftName = leftName
    battleData.rightName = rightName
    battleData.leftOfficer = leftOfficer
    battleData.rightOfficer = rightOfficer
    battleData.winPos = winPos

    table.insert(battleData.background, 2)
    return battleData
end

--三国战记 boss
function BattleDataHelper.parseCountryBoss(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_COUNTRY_BOSS
    battleData.hurt = rawget(message, "hurt") or 0
    --积分
    battleData.needShowJump = true

    table.insert(battleData.background, background)
    return battleData
end

--三国战记 拦截
function BattleDataHelper.parseCountryBossIntercept(message, background)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_COUNTRY_BOSS_INTERCEPT
    battleData.needShowJump = true
    table.insert(battleData.background, background)
    return battleData
end

-- 无差别竞技(PvP)
function BattleDataHelper.parseSeasonSportData(message, bJump)
    local battleData = clone(BattleData)
    battleData.battleType = BattleDataHelper.BATTLE_TYPE_SEASON_FIGHTS
    battleData.needShowJump = bJump
    table.insert(battleData.background, 1)
    return battleData
end

return BattleDataHelper
