local GuildDungeonConst = require("app.const.GuildDungeonConst")
local GuildDungeonDataHelper = {}

--本军团副本积分排行
function GuildDungeonDataHelper.getMyGuildDungeonRankData()
    --军团名和军团ID赋值
    local myGuild = G_UserData:getGuild():getMyGuild()
    local rankData = G_UserData:getGuildDungeon():getMyGuildRankData()
    rankData:setName(myGuild:getName())
    rankData:setGuild_id(myGuild:getId())
    return rankData
end

--军团副本积分排行
function GuildDungeonDataHelper.getGuildDungeonSortedRankList()
     local dataList = G_UserData:getGuildDungeon():getDungeonRankDataList()
     local list = {}
     for k,v in pairs(dataList) do
        table.insert( list, v )
     end
     local sortFunc = function(obj1,obj2)
        return obj1:getRank() < obj2:getRank()
     end
     table.sort(list,sortFunc)
     return list
end

--军团累计积分
function GuildDungeonDataHelper.getGuildDungeonTotalPoint()
     local dataList = G_UserData:getGuild():getGuildMemberList()
     local point = 0
     for k,v in pairs(dataList) do
        point = point + v:getDungeon_point()
     end
     return point
end

--军团挑战次数
function GuildDungeonDataHelper.getGuildDungeonRemainTotalFightCount()
    --怪物数 * 3 - 战斗记录数
    local UserDataHelper = require("app.utils.UserDataHelper")
    local atkTime = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_STAGE_ATKTIME )
    local dungeonInfoDataList = G_UserData:getGuildDungeon():getDungeonInfoDataList()
    local dungeonRecordDataList = G_UserData:getGuildDungeon():getDungeonRecordDataList()
    local remainTotalFightCount =  GuildDungeonDataHelper.getTableNum(dungeonInfoDataList) * atkTime -
         GuildDungeonDataHelper.getTableNum(dungeonRecordDataList)
    return remainTotalFightCount
end

function GuildDungeonDataHelper.getTableNum(t)
    local count = 0
    for k,v in pairs(t) do
        count = count + 1
    end
    return count
end

--军团副本回放记录(--缺失成员战力排名)
function GuildDungeonDataHelper.getGuildDungeonSortedRecordList()
    local dungeonRecordDataList = G_UserData:getGuildDungeon():getDungeonRecordDataList()
    local list = {}
    for k,v in pairs(dungeonRecordDataList) do
        table.insert( list, v )
    end
    local sortFunc = function(obj1,obj2)
        if obj1:getTime() ~= obj2:getTime() then
            return  obj1:getTime() > obj2:getTime()
        end
        if obj1:getTarget_rank() ~= obj2:getTarget_rank() then
            return  obj1:getTarget_rank() < obj2:getTarget_rank()
        end
        return obj1:getPlayer_id() < obj2:getPlayer_id()
    end
    table.sort(list,sortFunc)
    local newList = {}
    local guildData = G_UserData:getGuild()
    for k,v in ipairs(list) do
        local newValue = { record = v,member = nil}
        newValue.member = guildData:getGuildMemberDataWithId(v:getPlayer_id())--查找出军团成员数据，主要用来查战力排名数据
        table.insert( newList, newValue)
    end
    return newList
end

--军团副本怪物数据
function GuildDungeonDataHelper.getGuildDungeonMonsterList()
    local guildData = G_UserData:getGuild()
    local guildDungeo = G_UserData:getGuildDungeon()
    local dungeonInfoDataList = guildDungeo:getDungeonInfoDataList()
    local list = {}
    for k,v in pairs(dungeonInfoDataList) do
        local newValue = {
            monsterBattleUser = v:getDungeon(), rank = v:getRank(),name = "",
            recordList = guildDungeo:getDungeonRecordDataByRank(v:getRank()),
            memberList = {},
        }
        newValue.name = newValue.monsterBattleUser:getUser():getName()
        for k,v in ipairs(newValue.recordList) do
            newValue.memberList[k] = guildData:getGuildMemberDataWithId(v:getPlayer_id())
        end

        table.insert(list,newValue)
    end
    local sortFunc = function(obj1,obj2)
        return obj1.rank < obj2.rank
    end
    table.sort(list,sortFunc)
    return list
end

function GuildDungeonDataHelper.getGuildDungeonMonsterData(dungeonRank)
    local guildData = G_UserData:getGuild()
    local guildDungeo = G_UserData:getGuildDungeon()
    local dungeonInfo = guildDungeo:getDungeonInfoDataByRank(dungeonRank)
    if not dungeonInfo then
        return
    end
    local newValue = {
        monsterBattleUser = dungeonInfo:getDungeon(), rank = dungeonRank,name = "",
        recordList = guildDungeo:getDungeonRecordDataByRank(dungeonRank),
        memberList = {},
    }
    newValue.name = newValue.monsterBattleUser:getUser():getName()
    for k,v in ipairs(newValue.recordList) do
        newValue.memberList[k] = guildData:getGuildMemberDataWithId(v:getPlayer_id())
    end
    return newValue
end

--军团副本成员数据
function GuildDungeonDataHelper.getGuildDungeonMemberList()
   local memberList =  G_UserData:getGuild():getGuildMemberList()
   local guildDungeo =  G_UserData:getGuildDungeon()
   local list = {}
   for k,v in pairs(memberList) do
        local newValue = {
            member = v, rank = v:getRankPower(),
            recordList = guildDungeo:getDungeonRecordDataByPlayerId(v:getUid())
        }
        table.insert( list,newValue)
   end


    local sortFunc = function(obj1,obj2)
        return obj1.rank < obj2.rank
    end
    table.sort(list,sortFunc)
    return list
end

function GuildDungeonDataHelper.hasGuildDungeonMonsterData()
    local guildDungeo =  G_UserData:getGuildDungeon()
    local list = guildDungeo:getDungeonInfoDataList()
    return GuildDungeonDataHelper.getTableNum(list) > 0
end


--预览的奖励列表
function GuildDungeonDataHelper.getGuildDungeonPreviewRewards()
  local openServerDayNum = G_UserData:getBase():getOpenServerDayNum()
  local GuildStageAward = require("app.config.guild_stage_award")
  local rewardConfig = nil
  for index = 1,GuildStageAward.length(),1 do
       local config =  GuildStageAward.indexOf(index)
       if openServerDayNum >= config.day_min and openServerDayNum <= config.day_max then
            rewardConfig = config
            break
       end
  end
  if not rewardConfig then
     rewardConfig =  GuildStageAward.indexOf(GuildStageAward.length())
  end
  local TypeConvertHelper = require("app.utils.TypeConvertHelper")
  local rewardList = {}
  if rewardConfig ~= nil then
       local UserDataHelper = require("app.utils.UserDataHelper")
       rewardList = UserDataHelper.makeRewards(rewardConfig,GuildDungeonConst.AUCTION_REWARD_NUM)--最多配置9个奖励
  end
  return rewardList
end

function GuildDungeonDataHelper.getGuildDungeonTalk(monsterBattleUser)
    local fightPowerRatio = monsterBattleUser:getUser():getPower() * 1000 /  G_UserData:getBase():getPower()
    local showConfig = nil
    local GuildStageTalk = require("app.config.guild_stage_talk")
    for index = 1,GuildStageTalk.length(),1 do
       local config =  GuildStageTalk.indexOf(index)
       if fightPowerRatio >= config.combat_min  then
            showConfig = config
            break
       end
    end
    local talkNum = 5--对话数量
    local talkIndex = math.random(1,talkNum)
    return showConfig["talk"..talkIndex]
end

function GuildDungeonDataHelper.getGuildDungeonStartTimeAndEndTime()
    local UserDataHelper = require("app.utils.UserDataHelper")
    local stageOpenTime = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_STAGE_OPENTIME )
    local openTimes = string.split(stageOpenTime,"|")
	local zeroTime = G_ServerTime:secondsFromZero()
    local startTime = tonumber(openTimes[1]) + zeroTime
    local endTime = tonumber(openTimes[2]) + zeroTime
    return startTime,endTime
end

function GuildDungeonDataHelper.isGuildDungenoInAttackTime()
    local UserDataHelper = require("app.utils.UserDataHelper")
    local stageOpenTime = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_STAGE_OPENTIME )
    local openTimes = string.split(stageOpenTime,"|")
    local startTime = tonumber(openTimes[1])
    local endTime = tonumber(openTimes[2])
    local time = G_ServerTime:getTodaySeconds()
   -- logWarn(" GuildDungeonDataHelper.isGuildDungenoInAttackTime----------------"..tostring(time))
    if time < startTime or time > endTime then
        return false,startTime,endTime
    end
    return true,startTime,endTime
end

function GuildDungeonDataHelper.getGuildDungenoOpenTimeHintText()
    local inAttackTime,startTime,endTime = GuildDungeonDataHelper.isGuildDungenoInAttackTime()
    if not inAttackTime then
        return Lang.get("guilddungeon_tips_not_open_as_time",{starttime = math.floor(startTime/3600),endtime = math.floor(endTime/3600) })
    end
    return nil
end

function GuildDungeonDataHelper.getGuildDungenoFightCount()
    local UserDataHelper = require("app.utils.UserDataHelper")
    local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
    local count = userGuildInfo:getDungeon_cnt()
    local atkTime = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_STAGE_ATKTIME )
    return math.max(0,atkTime-count)
end

--是否需要显示拍卖对话框
function GuildDungeonDataHelper.guildDungeonNeedShopAutionDlg()
    local oldEndTime = G_UserData:getGuildDungeon():getAutionDlgTime()
    local isCurrOpen,startTimeToday,endTimeToday = GuildDungeonDataHelper.isGuildDungenoInAttackTime()
    local endTime = endTimeToday + G_ServerTime:secondsFromZero()
    --活动未结束不会弹框
    if isCurrOpen == true then
        --存下当前活动时间
        --G_UserData:getGuildDungeon():saveAutionDlgTime(G_ServerTime:getTime())
        logWarn(" GuildDungeonDataHelper:needShopPromptDlg is open  ret false")
        return false
    end
    if oldEndTime == 0 then
        G_UserData:getGuildDungeon():saveAutionDlgTime(endTime)
        logWarn(" GuildDungeonDataHelper:needShopPromptDlg  oldEndTime = 0 ret true")
        return true
    end
    --老的结束时间小于当前结束时间
    if oldEndTime < endTime then
        --弹出界面，并存下当前时间，下次就不会再弹出界面了
        G_UserData:getGuildDungeon():saveAutionDlgTime(endTime)
        logWarn(" GuildDungeonDataHelper:needShopPromptDlg  oldEndTime < endTime ret true")
        return true
    end

    dump(oldEndTime)
    dump(endTime)
    return false
end

--军团获得的声望
function GuildDungeonDataHelper.getGuildDungenoGetPrestige()
     local rankData = G_UserData:getGuildDungeon():getMyGuildRankData()
     local GuildStageRankReward = require("app.config.guild_stage_rank_reward")
     local config = GuildStageRankReward.get(rankData:getPoint())
     assert(config, "guild_stage_rank_reward cannot find id "..tostring(rankData:getPoint()))
     local classNum =  5--奖励阶段数
     local rank = rankData:getRank()
     for index = 1,classNum,1 do
         if rank >= config["legion_rank_min_"..index] and
            rank <= config["legion_rank_max_"..index] then
            return config["experience_"..index]
         end
     end
     return 0
end


return GuildDungeonDataHelper
