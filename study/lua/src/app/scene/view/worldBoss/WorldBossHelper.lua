--世界boss帮助类

local WorldBossHelper = {}

function WorldBossHelper.getBossInfo()
    local bossId = G_UserData:getWorldBoss():getBoss_id()
    if bossId == nil or bossId == 0 then
        assert(false,"can not get boss info")
    end
    local bossInfo = require("app.config.boss_info").get(bossId)
    assert(bossInfo, "boss_info cfg can not find boss by id "..bossId)

    return bossInfo
end

--显示活动开启时间倒计时
function WorldBossHelper.getOpenTime()
    local isOpen = G_UserData:getWorldBoss():isBossStart()
    if isOpen == false then
        local startTime = G_UserData:getWorldBoss():getStart_time()
        local message = Lang.get("worldboss_no_time")
        if startTime > 0 then
            message = G_ServerTime:getLeftSecondsString(startTime)
        end
        return message
    end
end

function WorldBossHelper.getEndTime()
    local endTime = G_UserData:getWorldBoss():getEnd_time()
    local startTime = G_UserData:getWorldBoss():getStart_time()
    local message = Lang.get("worldboss_no_time")
    if endTime > 0 then
         message = G_ServerTime:getLeftSecondsString(endTime)
    end
    local nowTime = G_ServerTime:getTime()
    local endTime = G_UserData:getWorldBoss():getEnd_time()
    local totalTime = endTime - startTime
    local percent = 100 - math.floor( (nowTime - startTime) / totalTime * 100) 
    --local percent = math.floor(  (nowTime / endTime) * 100 ) 
    return message, percent
end

function WorldBossHelper.getParameterValue(keyIndex)
    local parameter = require("app.config.parameter")
    for i=1, parameter.length() do
        local value = parameter.indexOf(i)
        if value.key == keyIndex then
            return tonumber(value.content)
        end
    end
    assert(false," can't find key index in parameter "..keyIndex)
end

function WorldBossHelper.getBossFightBtnName()
    local fightBossCount = G_UserData:getWorldBoss():getChallenge_boss_cnt()
    local time = G_UserData:getWorldBoss():getChallenge_boss_time() + WorldBossHelper.getParameterValue("challenge_time_interval")

    local leftTime = G_ServerTime:getLeftSeconds(time)
  
    if leftTime > 0 and fightBossCount > 0 then
        local message = G_ServerTime:getLeftSecondsString(time)
        return Lang.get("worldboss_left_time", { time = message} ), false
    else
        return Lang.get("worldboss_btn1", { num = fightBossCount} ), true
    end
    return nil, false
end


function WorldBossHelper.getUserFightBtnName()
    local fightUserCount = G_UserData:getWorldBoss():getChallenge_user_cnt()
    local time = G_UserData:getWorldBoss():getChallenge_user_time() + WorldBossHelper.getParameterValue("rob_time_interval")
    local leftTime = G_ServerTime:getLeftSeconds(time)

    if leftTime > 0 and fightUserCount > 0 then
        local message = G_ServerTime:getLeftSecondsString(time)
        return Lang.get("worldboss_left_time", { time = message} ), false --是否能点击
    else
        return Lang.get("worldboss_btn2", { num = fightUserCount} ), true --是否能点击
    end

    return nil, false
end


function WorldBossHelper.getBubbleContentById(bubbleId)
    local BubbleInfo = require("app.config.bubble")
    local data = BubbleInfo.get(tonumber(bubbleId))
    assert(data, "bubble cfg data can not find by bubbleId "..bubbleId)
    return data.content
end

--获取Boss说话内容
function WorldBossHelper.getBossBubble()
    local bossInfo = WorldBossHelper.getBossInfo()

    local content = bossInfo.boss_bubble
    local idList = string.split(content,"|")

    if #idList > 0 then
        local index = math.random(1, #idList)
        local bubbleId = tonumber(idList[index])
        return WorldBossHelper.getBubbleContentById(bubbleId)
    end
    return ""
end

--检查是否能攻打boss
function WorldBossHelper.checkBossFight()
	local fightBossCount = G_UserData:getWorldBoss():getChallenge_boss_cnt()
	if fightBossCount == 0 then
		G_Prompt:showTip(Lang.get("worldboss_fight_times"))
		return false
	end

    local fightBossCount = G_UserData:getWorldBoss():getChallenge_boss_cnt()
    local time = G_UserData:getWorldBoss():getChallenge_boss_time() + WorldBossHelper.getParameterValue("challenge_time_interval")

    local leftTime = G_ServerTime:getLeftSeconds(time)
    if leftTime > 0 then
        G_Prompt:showTip(Lang.get("worldboss_cd_time"))
        return false
    end
    
    return true
end

--检查是否能抢夺
function WorldBossHelper.checkUserFight()
	local fightUserCount = G_UserData:getWorldBoss():getChallenge_user_cnt()
	if fightUserCount == 0 then
		G_Prompt:showTip(Lang.get("worldboss_fight_times"))
		return false
	end

    local time = G_UserData:getWorldBoss():getChallenge_user_time() + WorldBossHelper.getParameterValue("rob_time_interval")
    local leftTime = G_ServerTime:getLeftSeconds(time)

    if leftTime > 0 then
        G_Prompt:showTip(Lang.get("worldboss_cd_time"))
        return false
    end

    return true
end


function WorldBossHelper.getBossPosition()
    local boss_people_xy = require("app.config.boss_people_xy")
    local configPos = boss_people_xy.get(100)
	assert(configPos,"can not find boss_people_xy by id : "..100)
    return cc.p(configPos.x,configPos.y)
end


--预览的奖励列表
function WorldBossHelper.getPreviewRewards()
  local openServerDayNum = G_UserData:getBase():getOpenServerDayNum()
  logWarn("WorldBossHelper openServerDayNum   "..openServerDayNum)
  local BossAward = require("app.config.boss_award")
  local rewardConfig = nil
  for index = 1,BossAward.length(),1 do
       local config =  BossAward.indexOf(index)
       if openServerDayNum >= config.day_min and openServerDayNum <= config.day_max then
            rewardConfig = config
            break 
       end
  end
  if not rewardConfig and BossAward.length() > 0 then
     rewardConfig =  BossAward.indexOf(BossAward.length())
  end
  local UserDataHelper = require("app.utils.UserDataHelper")
  local rewardList = {}
  if rewardConfig ~= nil then
       rewardList = UserDataHelper.makeRewards(rewardConfig,5)--最多配置5个奖励      
  end   
  local bossInfo = WorldBossHelper.getBossInfo()
  local bossRewardList = UserDataHelper.makePreviewBossRewards(rewardConfig,nil,nil,bossInfo)
  for k,v in ipairs(bossRewardList) do
     table.insert( rewardList,k,v)
  end
  --dump(rewardList)
  return rewardList
end


return WorldBossHelper