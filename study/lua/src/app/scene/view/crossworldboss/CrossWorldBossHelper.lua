--跨服军团boss帮助类

local CrossWorldBossHelper = {}

local LogicCheckHelper  = require("app.utils.LogicCheckHelper")

function CrossWorldBossHelper.getBossInfo()
    local bossId = G_UserData:getCrossWorldBoss():getBoss_id()
    if bossId == nil or bossId == 0 then
        --assert(false,"can not get boss info")
        return nil
    end

    local bossInfo = CrossWorldBossHelper.getBossConfigInfo(bossId)
    --assert(bossInfo, "cross_boss_info cfg can not find boss by id "..bossId)

    return bossInfo
end

--显示活动开启时间倒计时
function CrossWorldBossHelper.getOpenTime()
    local isOpen = G_UserData:getCrossWorldBoss():isBossStart()
    if isOpen == false then
        local startTime = G_UserData:getCrossWorldBoss():getStart_time()
        local message = Lang.get("worldboss_no_time")
        if startTime > 0 then
            message = G_ServerTime:getLeftSecondsString(startTime)
        end
        return message
    end
end

function CrossWorldBossHelper.getIsChatOpen(  )
    local isOpenToday = CrossWorldBossHelper.checkIsTodayOpen()
    if not isOpenToday then
        return false
    end

    local isChatOpen = G_UserData:getCrossWorldBoss():isChatOpen()
    if not isChatOpen then
        return false
    end

    local configChatOpenTime = CrossWorldBossHelper.getParameterStr("chat_open_time")
    local configChatCloseTime = CrossWorldBossHelper.getParameterStr("chat_close_time")
    local chatOpenArray = string.split(configChatOpenTime, "|")
    local chatCloseArray = string.split(configChatCloseTime, "|")

    local chatOpenTime = G_ServerTime:getTimestampByHMS(tonumber(chatOpenArray[1]), tonumber(chatOpenArray[2]))
    local chatCloseTime = G_ServerTime:getTimestampByHMS(tonumber(chatCloseArray[1]), tonumber(chatCloseArray[2]))

    local currTime = G_ServerTime:getTime()
    
    if currTime > chatOpenTime and currTime < chatCloseTime then
        return true
    end

    return false
end

function CrossWorldBossHelper.getAvailableTime(  )
    local startTime = G_UserData:getCrossWorldBoss():getStart_time()
    if startTime == 0 then
        startTime = CrossWorldBossHelper.getNextStartEndTime()
    end

    local configAvailabelTime = CrossWorldBossHelper.getParameterStr("enter_available_time")
    local configOpenTime = CrossWorldBossHelper.getParameterStr("day_open_time")
    local availabeArray = string.split(configAvailabelTime, "|")
    local openArray = string.split(configOpenTime, "|")

    local availabelTime = startTime - ((tonumber(openArray[1]) * 3600 + tonumber(openArray[2]) * 60) - (tonumber(availabeArray[1]) * 3600 + tonumber(availabeArray[2]) * 60))

    return availabelTime
end

function CrossWorldBossHelper.getShowTime(  )
    local startTime = G_UserData:getCrossWorldBoss():getStart_time()
    if startTime == 0 then
        return 0
    end

    local configShowTime = CrossWorldBossHelper.getParameterStr("enter_show_time")
    local configOpenTime = CrossWorldBossHelper.getParameterStr("day_open_time")
    local showArray = string.split(configShowTime, "|")
    local openArray = string.split(configOpenTime, "|")

    local showTime = startTime - ((tonumber(openArray[1]) * 3600 + tonumber(openArray[2]) * 60) - (tonumber(showArray[1]) * 3600 + tonumber(showArray[2]) * 60))

    return showTime
end

function CrossWorldBossHelper.getEndTime()
    local endTime = G_UserData:getCrossWorldBoss():getEnd_time()
    local startTime = G_UserData:getCrossWorldBoss():getStart_time()
    local message = Lang.get("worldboss_no_time")
    if endTime > 0 then
         message = G_ServerTime:getLeftSecondsString(endTime)
    end
    local nowTime = G_ServerTime:getTime()
    local endTime = G_UserData:getCrossWorldBoss():getEnd_time()
    local totalTime = endTime - startTime
    local percent = 100 - math.floor( (nowTime - startTime) / totalTime * 100) 
    --local percent = math.floor(  (nowTime / endTime) * 100 ) 
    return message, percent
end

function CrossWorldBossHelper.getParameterStr(keyIndex)
    local parameter = require("app.config.cross_boss_parameter")
    for i=1, parameter.length() do
        local value = parameter.indexOf(i)
        if value.key == keyIndex then
            return value.content
        end
    end
    assert(false," can't find key index in parameter "..keyIndex)
end

function CrossWorldBossHelper.getParameterValue(keyIndex)
    local parameter = require("app.config.cross_boss_parameter")
    for i=1, parameter.length() do
        local value = parameter.indexOf(i)
        if value.key == keyIndex then
            return tonumber(value.content)
        end
    end
    assert(false," can't find key index in parameter "..keyIndex)
end

function CrossWorldBossHelper.getSelfIsPoZhaoCamp()
    local bossId = G_UserData:getCrossWorldBoss():getBoss_id()

    if bossId == nil or bossId == 0 then
        return false
    end

    local bossInfo = CrossWorldBossHelper.getBossConfigInfo(bossId)
    local pozhaoCamp = CrossWorldBossHelper.getPozhaoCampByBossId(bossInfo.id)

    local selfCamp = G_UserData:getCrossWorldBoss():getSelf_camp()

    return selfCamp == pozhaoCamp
end

function CrossWorldBossHelper.getBossFightBtnName()
    local time = G_UserData:getCrossWorldBoss():getChallenge_boss_time() + CrossWorldBossHelper.getParameterValue("challenge_time_interval")
    local leftTime = G_ServerTime:getLeftSeconds(time)
  
    if leftTime > 0 then
        local message = G_ServerTime:getLeftMinSecStr(time)
        return Lang.get("worldboss_left_time", { time = message} ), true
    end

    return nil, false
end

function CrossWorldBossHelper.getBossConfigInfo( boss_team_id )
    local bossInfo
    local bossConfigInfo = require("app.config.cross_boss_info")

    for i = 1, bossConfigInfo.length() do
        local info = bossConfigInfo.get(i)
        if info.monster_team_id == boss_team_id then
            bossInfo = info
            break
        end
    end

    return bossInfo
end

function CrossWorldBossHelper.checkIsTodayOpen( time )
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)
    if not isOpen then
        return false
    end

    time = time or G_ServerTime:getTime()
    local curWeekDay = tonumber(os.date("%w", time))
    if curWeekDay == 0 then
        curWeekDay = 7
    end

    local openDays = CrossWorldBossHelper.getParameterStr("week_open_time")
    local openDaysArray = string.split(openDays, "|")
    local isTodayOpen = false

    for k, v in pairs(openDaysArray) do
        if curWeekDay == tonumber(v) then
            isTodayOpen = true
            break
        end
    end

    return isTodayOpen
end

function CrossWorldBossHelper.checkIsTodayOver()
    local currTime = G_ServerTime:getTime()
    local isTodayOpen = CrossWorldBossHelper.checkIsTodayOpen(currTime)

    if not isTodayOpen then
        return true
    end

    local activityStartTimeConfig = CrossWorldBossHelper.getParameterStr("day_open_time")
    local configArray = string.split(activityStartTimeConfig, "|")
    local lastTime = CrossWorldBossHelper.getParameterValue("last_time")

    local serverDivideTimeConfig = CrossWorldBossHelper.getParameterStr("server_divide_time")
    local serverDivideTimeArray = string.split(serverDivideTimeConfig, "|")

    local todayStartTime = G_ServerTime:getTimestampByHMS(tonumber(serverDivideTimeArray[1]), tonumber(serverDivideTimeArray[2]))
    local todayEndTime = G_ServerTime:getTimestampByHMS(tonumber(configArray[1]), tonumber(configArray[2])) + lastTime

    if currTime > todayEndTime or currTime < todayStartTime then
        return true
    end

    return false
end

function CrossWorldBossHelper.getNextStartEndTime (  )
    local currTime = G_ServerTime:getTime()
    local isTodayOpen = CrossWorldBossHelper.checkIsTodayOpen(currTime)
    local deltal = 24 * 60 * 60
    local activityStartTimeConfig = CrossWorldBossHelper.getParameterStr("enter_available_time")
    local configArray = string.split(activityStartTimeConfig, "|")
    local lastTime = CrossWorldBossHelper.getParameterValue("last_time")
    local todayStartTime = G_ServerTime:getTimestampByHMS(tonumber(configArray[1]), tonumber(configArray[2]))
    local todayEndTime = G_ServerTime:getTimestampByHMS(tonumber(configArray[1]), tonumber(configArray[2])) + lastTime


    local nextStartTime, nextEndTime = 0

    if isTodayOpen and currTime < todayStartTime then
        nextStartTime = todayStartTime
        nextEndTime = todayEndTime
    else
        for i = 1, 7 do 
            local isOpen = CrossWorldBossHelper.checkIsTodayOpen(currTime + i * deltal)
            if isOpen then
                nextStartTime = todayStartTime + i * deltal
                nextEndTime = todayEndTime + i * deltal
                break
            end
        end
    end

    return nextStartTime, nextEndTime
end

function CrossWorldBossHelper.checkNeedGetActivityInfo(  )
    local currTime = G_ServerTime:getTime()
    local isTodayOpen = CrossWorldBossHelper.checkIsTodayOpen(currTime)
    
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)
    if not isOpen then
        return false
    end

    local isNeed = false

    local activityStartTimeConfig = CrossWorldBossHelper.getParameterStr("day_open_time")
    local configArray = string.split(activityStartTimeConfig, "|")

    local lastTime = CrossWorldBossHelper.getParameterValue("last_time")

    local serverDivideTimeConfig = CrossWorldBossHelper.getParameterStr("server_divide_time")
    local serverDivideTimeArray = string.split(serverDivideTimeConfig, "|")

    local enterBeginShowTime = G_ServerTime:getTimestampByHMS(tonumber(serverDivideTimeArray[1]), tonumber(serverDivideTimeArray[2]))
    local enterEndShowTime = G_ServerTime:getTimestampByHMS(tonumber(configArray[1]), tonumber(configArray[2])) + lastTime
    local crossBossId = CrossWorldBossHelper.getBossHeroId()

    if currTime >= enterBeginShowTime and currTime < enterEndShowTime and isTodayOpen and crossBossId and crossBossId ~= 0 then
        isNeed = true
    end

    return isNeed
end

function CrossWorldBossHelper.checkShowCrossBoss(  )
    local crossBossId = CrossWorldBossHelper.getBossHeroId()

    if crossBossId == nil or crossBossId == 0 then
        return false
    end

    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS)
    if not isOpen then
        return false
    end

    local currTime = G_ServerTime:getTime()
    
    local isShow = false

    local isTodayOpen = CrossWorldBossHelper.checkIsTodayOpen(currTime)
    local activityStartTimeConfig = CrossWorldBossHelper.getParameterStr("day_open_time")
    local configArray = string.split(activityStartTimeConfig, "|")

    local lastTime = CrossWorldBossHelper.getParameterValue("last_time")

    local serverDivideTimeConfig = CrossWorldBossHelper.getParameterStr("server_divide_time")
    local serverDivideTimeArray = string.split(serverDivideTimeConfig, "|")

    local enterBeginShowTime = G_ServerTime:getTimestampByHMS(tonumber(serverDivideTimeArray[1]), tonumber(serverDivideTimeArray[2]))
    local enterEndShowTime = G_ServerTime:getTimestampByHMS(tonumber(configArray[1]), tonumber(configArray[2])) + lastTime

    local endTime = G_UserData:getCrossWorldBoss():getEnd_time()

    if crossBossId and currTime > enterBeginShowTime and currTime < enterEndShowTime and isTodayOpen and currTime < endTime then
        isShow = true
    end

    return isShow
end

function CrossWorldBossHelper.getBossHeroId()
    local bossId = G_UserData:getCrossWorldBoss():getBoss_id()
    local bossInfo = CrossWorldBossHelper.getBossConfigInfo(bossId)
    
    if bossInfo == nil then
        return nil
    end

    local heroId = bossInfo.hero_id

    return heroId
end


function CrossWorldBossHelper.getUserFightBtnName()
    local time = G_UserData:getCrossWorldBoss():getChallenge_user_time() + CrossWorldBossHelper.getParameterValue("rob_time_interval")
    local leftTime = G_ServerTime:getLeftSeconds(time)

    if leftTime > 0 then
        local message = G_ServerTime:getLeftMinSecStr(time)
        return Lang.get("worldboss_left_time", { time = message} ), true 
    end

    return nil, false
end


function CrossWorldBossHelper.getBubbleContentById(bubbleId)
    local BubbleInfo = require("app.config.bubble")
    local data = BubbleInfo.get(tonumber(bubbleId))
    assert(data, "bubble cfg data can not find by bubbleId "..bubbleId)
    return data.content
end

--获取Boss说话内容
function CrossWorldBossHelper.getBossBubble()
    local bossInfo = CrossWorldBossHelper.getBossInfo()

    local content = bossInfo.boss_bubble
    local idList = string.split(content,"|")

    if #idList > 0 then
        local index = math.random(1, #idList)
        local bubbleId = tonumber(idList[index])
        return CrossWorldBossHelper.getBubbleContentById(bubbleId)
    end
    return ""
end

--检查是否能攻打boss
function CrossWorldBossHelper.checkBossFight()
    local time = G_UserData:getCrossWorldBoss():getChallenge_boss_time() + CrossWorldBossHelper.getParameterValue("challenge_time_interval")
    local leftTime = G_ServerTime:getLeftSeconds(time)

    if leftTime > 0 then
        G_Prompt:showTip(Lang.get("crossworldboss_boss_cd_time"))
        return false
    end
    
    return true
end

--检查是否能抢夺
function CrossWorldBossHelper.checkUserFight()
    local time = G_UserData:getCrossWorldBoss():getChallenge_user_time() + CrossWorldBossHelper.getParameterValue("rob_time_interval")
    local leftTime = G_ServerTime:getLeftSeconds(time)

    if leftTime > 0 then
        G_Prompt:showTip(Lang.get("crossworldboss_user_cd_time"))
        return false
    end

    return true
end

function CrossWorldBossHelper.getCampIconPathById( id )
    local path = Path.getTextSignet("img_cross_boss_camp0"..id)
    assert(path,"can not find camp by id : " .. id)

    return path
end

function CrossWorldBossHelper.getPozhaoCampByBossId( bossId )
    local bossInfo = require("app.config.cross_boss_info").get(bossId)
    assert(bossInfo, "cross_boss_info cfg can not find boss by id "..bossId)

    return tonumber(bossInfo.camp_1)
end


function CrossWorldBossHelper.getBossPosition()
    local boss_people_xy = require("app.config.boss_people_xy")
    local configPos = boss_people_xy.get(100)
	assert(configPos,"can not find boss_people_xy by id : "..100)
    return cc.p(configPos.x,configPos.y)
end


--预览的奖励列表
function CrossWorldBossHelper.getPreviewRewards()
  local openServerDayNum = G_UserData:getBase():getOpenServerDayNum()
  logWarn("CrossWorldBossHelper openServerDayNum   "..openServerDayNum)
  local BossAward = require("app.config.cross_boss_reward_view")
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
        rewardList = UserDataHelper.makeRewards(rewardConfig,6)--最多配置6个奖励      
  end   
  local bossInfo = CrossWorldBossHelper.getBossInfo()

  if bossInfo then
    local bossRewardList = UserDataHelper.makePreviewCrossBossRewards(rewardConfig,nil,nil,bossInfo)
    for k,v in ipairs(bossRewardList) do
        table.insert( rewardList,k,v)
    end
  end
  --dump(rewardList)
  return rewardList
end

function CrossWorldBossHelper.getAllBossPreviewRewards()
    local openServerDayNum = G_UserData:getBase():getOpenServerDayNum()
    logWarn("CrossWorldBossHelper openServerDayNum   "..openServerDayNum)
    local BossAward = require("app.config.cross_boss_reward_view")
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
         rewardList = UserDataHelper.makeRewards(rewardConfig,6)--最多配置6个奖励      
    end   

    local bossConfigInfo = require("app.config.cross_boss_info")

    local temp = {}

    for i = 1, bossConfigInfo.length() do
        local info = bossConfigInfo.get(i)
        local bossRewardList = UserDataHelper.makePreviewCrossBossRewards(rewardConfig,nil,nil,info)
        for k,v in ipairs(bossRewardList) do
           table.insert( temp,k,v)
        end
    end

    table.sort( temp, function (a, b)
        return a.type > b.type
    end )

    for k, v in pairs(temp) do
        table.insert( rewardList,k,v)
    end
    --dump(rewardList)
    return rewardList
  end


return CrossWorldBossHelper