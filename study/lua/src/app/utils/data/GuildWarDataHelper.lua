local GuildWarConst = require("app.const.GuildWarConst")

local GuildWarDataHelper = {}

function GuildWarDataHelper.getGuildWarMoveCD()
     local UserDataHelper = require("app.utils.UserDataHelper")
    return UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_MOVE_CD )
end

function GuildWarDataHelper.getGuildWarAtkCD()
     local UserDataHelper = require("app.utils.UserDataHelper")
    return UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_ATK_CD )
end


function GuildWarDataHelper.getGuildWarAtkCD()
     local UserDataHelper = require("app.utils.UserDataHelper")
    return UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_ATK_CD )
end


function GuildWarDataHelper.getGuildWarTotalAtkCD()
     local UserDataHelper = require("app.utils.UserDataHelper")
    return UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_TOTAL_ATK_CD )
end


function GuildWarDataHelper.getGuildWarHp(userData)
     local UserDataHelper = require("app.utils.UserDataHelper")
     local HomelandConst = require("app.const.HomelandConst")
     local hp = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_HP )
     if userData and userData:isHaveBuff(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_10) then
        local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
        local info = HomelandHelp.getTreeBuffConfig(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_10)
        local ratio = HomelandHelp.getRealValueOfBuff(info)
        hp = hp * (1+ratio)
     end
     return hp
end

function GuildWarDataHelper.getGuildWarProclaimCD()
     local UserDataHelper = require("app.utils.UserDataHelper")
     return UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_PROCLAIM_CD )
end

function GuildWarDataHelper.getGuildWarProclaimMax()
     local UserDataHelper = require("app.utils.UserDataHelper")
     return UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_PROCLAIM_MAX )
end

function GuildWarDataHelper.getGuildWarProclaimGuildLv()
     local UserDataHelper = require("app.utils.UserDataHelper")
     return UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_DECLARE_LV )
end



--避免玩家中途退军团
function GuildWarDataHelper.getMyGuildWarGuildId(cityId)
    local user = G_UserData:getGuildWar():getMyWarUser(cityId)
    if not user then
        return 0
    end
    return user:getGuild_id()
end


function GuildWarDataHelper.getOpenDays(id)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local openDayInfoStr = UserDataHelper.getParameter(id)
    local openDayStrArr = string.split(openDayInfoStr, "|") or {}
    local openDays = {}
    for k,v in ipairs(openDayStrArr) do
        local curDay = tonumber(v)
        curDay = curDay + 1
        if curDay > 7 then--和时间格式化规则保持一致
            curDay = curDay-7
        end
        openDays[curDay] = true 
    end
    return openDays
end

function GuildWarDataHelper.decodePoint(str)
    local strArr = string.split(str,"|")
    return tonumber(strArr[1]), tonumber(strArr[2])
end

function GuildWarDataHelper.decodeNums(str)
    local strArr = string.split(str,"|")
    local nums = {}
    for k,v in ipairs(strArr) do
        nums[k] = tonumber(v)
    end
    return nums
end

function GuildWarDataHelper.decodePointSlot(str)
    local strArr = string.split(str,"|")
    return tonumber(strArr[1]), tonumber(strArr[2]),tonumber(strArr[3])
end

function GuildWarDataHelper.decodePointSlotPos(str)
    local strArr = string.split(str,"|")
    return tonumber(strArr[2]),tonumber(strArr[3])
end


function GuildWarDataHelper.decodeMoveData(config)
     local moveArr = string.split(config.move,"|")
     local mvoeTimeArr = string.split(config.move_time,"|")
     local moveDataList = {}
     for k,v in ipairs(moveArr) do
       moveDataList[tonumber(v)] = { tonumber(v)
        ,tonumber(mvoeTimeArr[k])}
     end
     return moveDataList
end

function GuildWarDataHelper.decodeMoveHinderData(config)
     if config.move_hinder == "0" or config.move_hinder == "" then
        return {}
     end
     local moveHinderArr = string.split( config.move_hinder,"|")
     local moveHinderList = {}
     for k,v in ipairs(moveHinderArr) do
        moveHinderList[ tonumber(v)] = true
     end
     return moveHinderList
end

function GuildWarDataHelper.decodeRoadConfig(roadConfig)
    local len = 5
    local pointList = {}
    for k =1,len,1 do
        local str = roadConfig["mid_point_"..k]
        if str ~= "" and str ~= "0" then
             pointList[k] = GuildWarDataHelper.decodeNums(str)
        end
    end
   -- dump(pointList)
    local curveConfigList = {}
    for i = 1,#pointList-1,1 do
        local curveData = {}
        curveData[1] =  cc.p(pointList[i][1],pointList[i][2])
        curveData[2] =  cc.p((pointList[i][1] + pointList[i+1][1])/2,(pointList[i][2] + pointList[i+1][2])/2)
        curveData[3] =  cc.p(pointList[i+1][1],pointList[i+1][2])
        curveData[4] =  cc.p(pointList[i+1][1],pointList[i+1][2])
        table.insert( curveConfigList,curveData)
    end
    return curveConfigList
end


function GuildWarDataHelper.getGuildWarBgConfig(id)
    local GuildWarBg =  require("app.config.guild_war_bg")
    local config = GuildWarBg.get(id)
    assert(config,"guild_war_bg can not find id "..tostring(id))
    return config
end


function GuildWarDataHelper.getGuildWarRoadConfig(id)
    local GuildWarRoad =  require("app.config.guild_war_road")
    local config = GuildWarRoad.get(id)
    assert(config,"guild_war_road can not find id "..tostring(id))
    return config
end

function GuildWarDataHelper.getGuildWarCityConfig(id)
    local GuildWarCity =  require("app.config.guild_war_city")
    local config = GuildWarCity.get(id)
    assert(config,"guild_war_city can not find id "..tostring(id))
    return config
end
--[[
function GuildWarDataHelper.getGuildWarConfig(id)
    local GuildWar =  require("app.config.guild_war")
    local config = GuildWar.get(id)
    assert(config,"guild_war can not find id "..tostring(id))
    return config
end
]]

function GuildWarDataHelper.getGuildWarRoadDecodeData(k1,k2)
    local decodeData = G_UserData:getGuildWar():getGuildWarRoadDecodeData(k1,k2)
    if not decodeData then
        local map = G_UserData:getGuildWar():getGuildWarRoadConfigMap()
        local roadConfig = map[k1][k2]
		decodeData = GuildWarDataHelper.decodeRoadConfig(roadConfig)
		G_UserData:getGuildWar():setGuildWarRoadDecodeData(k1,k2,decodeData)
	end
    return decodeData
end

function GuildWarDataHelper.getGuildWarDecodeData(config)
    local moveData = GuildWarDataHelper.decodeMoveData(config)
    local x,y = GuildWarDataHelper.decodePoint(config.click_point)
    local hinderData = GuildWarDataHelper.decodeMoveHinderData(config)

    local standPointData = G_UserData:getGuildWar():getGuildWarStandPointList(config.battlefield_type,config.point_id)
 
 



    local newConfig = 
    {
        id = config.id,    --索引id-int 
        battlefield_type = config.battlefield_type,    --战场类型-int 
        point_id = config.point_id,    --据点id-int 
        point_type = config.point_type,    --据点类型-int 
        move = config.move,    --可移动到的据点-string 
        move_time = config.move_time,    --移动对应据点需要时间，秒-string 
        name = config.name,    --据点名字-string 
        build_hp =  config.build_hp,    --建筑耐久-int 
        move_hinder = config.move_hinder,    --未攻破此建筑前受阻碍的点-string 
        name_pic = config.name_pic,    --据点名字资源-string 
        city_pic = config.city_pic,    --据点图片资源-string 
        city_pic_break = config.city_pic_break,    --击破后资源图片-string 
        x = config.x,    --资源x坐标-int 
        y = config.y,    --资源y坐标-int 
        click_point =  config.click_point,    --点击区域中点-string 
        click_radius =  config.click_radius,    --点击区域半径范围-int 
        hp_x = config.hp_x,
        hp_y = config.hp_y,
    }
    newConfig.moveData = moveData
    newConfig.clickPos = cc.p(x,y)
    newConfig.hinderData = hinderData
    newConfig.standPointData = standPointData or {}
    logWarn("------------------ getGuildWarDecodeData ")
    return newConfig
end

function GuildWarDataHelper.getGuildWarConfigMap()
    local configMap = G_UserData:getGuildWar():getGuildWarConfigMap()
    if configMap then
        return configMap
    end

    local configMap = {}
	local GuildWar =  require("app.config.guild_war")
	local len = GuildWar.length()
	for index = 1,len,1 do
		local config = GuildWar.indexOf(index)
        if not configMap[config.battlefield_type] then
             configMap[config.battlefield_type] = {}
        end
        configMap[config.battlefield_type][config.point_id] = GuildWarDataHelper.getGuildWarDecodeData(config)
	end

    G_UserData:getGuildWar():setGuildWarConfigMap(configMap)
    return configMap
end

function GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)
	 local cityConfig = GuildWarDataHelper.getGuildWarCityConfig(cityId)
     local configMap = GuildWarDataHelper.getGuildWarConfigMap()
     local list = configMap[cityConfig.scene]
     if not list then
        return nil
     end
     local config =  list[pointId]
     assert(config,string.format("guild_war can not find cityId %d  id %d ",cityId,pointId))
     return config
end

function GuildWarDataHelper.getPointIdByCityIdPointType(cityId,pointType)
     local cityConfig = GuildWarDataHelper.getGuildWarCityConfig(cityId)
     local configMap = GuildWarDataHelper.getGuildWarConfigMap()
     local list = configMap[cityConfig.scene]
     if not list then
        return nil
     end
    local GuildWarConst = require("app.const.GuildWarConst")
     for k,v in pairs(list) do
         if v.point_type == pointType then
            return v.point_id
         end
     end
     return nil
end


function GuildWarDataHelper.getGuildWarConfigListByCityId(cityId)
     local cityConfig = GuildWarDataHelper.getGuildWarCityConfig(cityId)
     local configMap = GuildWarDataHelper.getGuildWarConfigMap()
     local list = configMap[cityConfig.scene]
     if not list then
        return {}
     end
     return list
end

function GuildWarDataHelper.getGuildWarBuildingConfigListByCityId(cityId)
     local list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId)
    local newList = {}
     for k,v in pairs(list) do
         if v.build_hp > 0 then
             table.insert( newList, v )
         end
     end 
     return newList
end


function GuildWarDataHelper.getGuildWarBuildingList(cityId)
    local list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId)
    local buildList = {}
    for k,v in pairs(list) do
        if v.build_hp > 0 then
            table.insert( buildList,v)
        end
    end
    return buildList
end


function GuildWarDataHelper.getGuildWarTargetList(cityId,buildList)
    local taskList = {}
    for k,v in pairs(buildList) do
        if not taskList[v.point_type] then
            taskList[v.point_type] = {point_type = v.point_type,valid = true}
        end
        if v.point_type ==  GuildWarConst.POINT_TYPE_GATE and taskList[v.point_type].valid then
            local nowWarWatch = G_UserData:getGuildWar():getWarWatchById(cityId, v.point_id)
            local hp = nowWarWatch:getWatch_value()
            if hp <= 0 then
                taskList[v.point_type].valid = false
            end
        end
    end
 

    local newTaskList = {}
    for k,v in pairs(taskList) do
        if v.valid then
            table.insert(newTaskList,v)
        end
    end
    local sortFunc = function(a,b)
        return a.point_type < b.point_type
    end
    table.sort(newTaskList,sortFunc)
    return newTaskList
end

function GuildWarDataHelper.isTodayOpen(zeroTimeSecond)
    local date =  G_ServerTime:getDateObject(nil,zeroTimeSecond)
    local days = GuildWarDataHelper.getOpenDays(G_ParameterIDConst.GUILD_WAR_OPEN_WEEK)
    if days[date.wday] then
        return true
    end
    return false
end

--返回军团战时间数据,{startTime = 开始时间,endTime = 结束时间,time1 = 阶段一结束时间} 
function GuildWarDataHelper.getGuildWarTimeRegion()
    local UserDataHelper = require("app.utils.UserDataHelper")
    local zeroTime = G_ServerTime:secondsFromZero()
    local startTime = zeroTime +  UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_STARTTIME)
    local time1Len =  UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_TIME_1) 
    local time2Len =  UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_TIME_2) 
    local endTime =   startTime + time1Len  + time2Len
         
    --logWarn(startTime.. "------------ "..time1Len.."-- "..time2Len)   
    local time1 = startTime +  UserDataHelper.getParameter(G_ParameterIDConst.GUILD_WAR_TIME_1) 
    local timeRegion = {startTime = startTime,endTime = endTime,time1 = time1}
    return timeRegion
end

--城市是否能被宣战
function GuildWarDataHelper.isCityCanBeAttack(beAttackCityId,attackCityId)
    local GuildWarCity =  require("app.config.guild_war_city")
    if attackCityId ~= nil and attackCityId > 0 then
        local config = GuildWarCity.get(attackCityId)
        assert(config,"guild_war_city can not find id "..tostring(attackCityId))
        return config.next_city == beAttackCityId
    end
  
    local config = GuildWarCity.get(beAttackCityId)
    assert(config,"guild_war_city can not find id "..tostring(beAttackCityId))
    return config.proclaim == 0
end

--军团战是否在进行中
function GuildWarDataHelper.isGuildWarInRunning()
    local isTodayOpen = GuildWarDataHelper.isTodayOpen()     
    if not isTodayOpen then
        return false
    end
    local timeData = GuildWarDataHelper.getGuildWarTimeRegion()
    local curTime = G_ServerTime:getTime()
    if curTime >= timeData.startTime and curTime < timeData.endTime then
        return true
    end
    return false
end


function GuildWarDataHelper.getNextOpenDayNum(days)
    local date = G_ServerTime:getDateObject()
    local nextDayNum = 1
    for i = 1, 7 do
        local wDay = date.wday + i
        if wDay > 7 then
            wDay = 1

        end
        if days[wDay] then
            nextDayNum = i
            break
        end
    end
    return nextDayNum
end

function GuildWarDataHelper.getGuildWarNextOpeningTimeRegion()
    local curTime = G_ServerTime:getTime()
    local timeData = GuildWarDataHelper.getGuildWarTimeRegion()
   -- dump(timeData)
    if GuildWarDataHelper.isTodayOpen() then
        if curTime <= timeData.endTime then
            return timeData
        end
    end
    local days = GuildWarDataHelper.getOpenDays(G_ParameterIDConst.GUILD_WAR_OPEN_WEEK)
    local dayNum = GuildWarDataHelper.getNextOpenDayNum(days)
  --  logWarn("GuildWarDataHelper  getGuildWarNextOpeningTimeRegion ------------------- "..dayNum)
    for k,v in pairs(timeData) do
        timeData[k] =  v + dayNum * 24*60*60
    end
    return timeData
end

function GuildWarDataHelper.getGuildWarStatus()
     local GuildWarConst = require("app.const.GuildWarConst")
     local curTime = G_ServerTime:getTime()
     local timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion()
     local status = GuildWarConst.STATUS_CLOSE 
     if curTime >= timeData.startTime and curTime < timeData.time1 then
        status = GuildWarConst.STATUS_STAGE_1 
     elseif curTime >= timeData.time1 and curTime < timeData.endTime then
        status = GuildWarConst.STATUS_STAGE_2 
     end
     return status
end

--本军团占有的军团ID,TODO 优化
function GuildWarDataHelper.getOwnCityId()
     local guildId = G_UserData:getGuild():getMyGuildId()
     if guildId == 0 then
        return nil
     end
     local cityList = G_UserData:getGuildWar():getCityList()
     for k,v in pairs(cityList) do
        if v:getOwn_guild_id() == guildId then
            return v:getCity_id()
        end
     end
     return nil
end


function GuildWarDataHelper.getGuildWarHurtRankList()
    local rankList = G_UserData:getGuildWar():getRankList()
    local newList = {}
    for k,v in ipairs(rankList) do
        table.insert( newList, {unit = v,
            hurt =  v:getHurt() } )
    end
    return newList
end

function GuildWarDataHelper.getMyGuildWarRankData(newList)
    local guildId = G_UserData:getGuild():getMyGuildId()
    for k,v in ipairs(newList) do
        if v.unit:getGuild_id() == guildId then
            return v
        end
    end
    return nil
end

--判断自己是否是防御方
function GuildWarDataHelper.selfIsDefender(cityId)
    local guildId = GuildWarDataHelper.getMyGuildWarGuildId(cityId)
    local defenderGuildId =  G_UserData:getGuildWar():getBattleDefenderGuildId(cityId)
   -- logWarn(string.format("-------------- selfIsDefender  %s %s",tostring(guildId),tostring(defenderGuildId)))
    if not defenderGuildId or defenderGuildId == 0 then
        return false
    end
    if defenderGuildId == guildId then
        return true
    end
    return false
end

function GuildWarDataHelper.getSelfCampType(cityId)
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    return guildWarUser:getPk_type() 
end


function GuildWarDataHelper.findNextMovePointData(cityId,pointId)
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)
    if not config then
        return {}
    end
    local decodeMoveData = config.moveData--GuildWarDataHelper.decodeMoveData(config)
    return decodeMoveData
end



function GuildWarDataHelper.isHasHinder(cityId,pointId,dstPointId)
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)
    if not config then
        return false
    end
    local campType = GuildWarDataHelper.getSelfCampType(cityId)
    if campType == GuildWarConst.CAMP_TYPE_DEFENDER then
        return false
    end
    local hinderData = config.hinderData-- GuildWarDataHelper.decodeMoveHinderData(config)
    if hinderData[dstPointId] then
         local watcher = G_UserData:getGuildWar():getWarWatchById(cityId,pointId) 
         if  watcher and watcher:getWatch_value() > 0 then
            return true
         end
    end
    return false
end

function GuildWarDataHelper.isWatcherDeath(cityId,pointId)
    local watcher = G_UserData:getGuildWar():getWarWatchById(cityId,pointId) 
    if  watcher and watcher:getWatch_value() <= 0 then
         return true
    end
    return false
end

function GuildWarDataHelper.findShowMoveSignPointList(cityId,pointId)
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)
    if not config then
        return {}
    end
    local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
    local decodeMoveData = config.moveData --GuildWarDataHelper.decodeMoveData(config)
    local list = {}

    for k,v in pairs(decodeMoveData) do
        local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,k)
        local success = GuildWarCheck.guildWarCanShowPoint(cityId,k,false)

       -- logWarn("findShowMoveSignPointList --------------------- "..k.."  "..tostring(success))
        if (not GuildWarDataHelper.isHasHinder(cityId,pointId,k) ) and success == true  then 
          --  logWarn("findShowMoveSignPointList POINT_TYPE_EXIT  "..k)
            table.insert(list,{cityId = cityId,pointId = k })
        end
    end
   
    return list
end


--优化,预先计算好
function GuildWarDataHelper.calculatePopulation(cityId,pointId)
    --local list = G_UserData:getGuildWar():getSameGuildWarUserList(cityId,pointId,false)
    --local list2 = G_UserData:getGuildWar():getOtherGuildWarUserList(cityId,pointId,false)
    --return #list,#list2
    local a,b = G_UserData:getGuildWar():getPopulation(cityId,pointId)
    return a,b
end

function GuildWarDataHelper.makePointSlotMap(cityId)
    local list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId)
    local map = {}
    for k,v1 in pairs(list) do
        local pointId = k
        map[pointId] = {}
        for i,v2 in pairs(v1.standPointData) do
            map[pointId][i] = {}
            for j,v3 in pairs(v2) do
                if v3.is_show == 1 and j ~= GuildWarConst.SELF_SLOT_INDEX  then --索引1是自己的位置
                    map[pointId][i][j] = true
                end
            end
        end
    end
    dump(map)
    return map
end

function GuildWarDataHelper.getStandPointNum(cityId,pointId,faceIndex)
    logWarn(cityId.."-----------"..pointId.."----------"..faceIndex)
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,
        pointId)
    local standPointList =  config.standPointData[faceIndex]
    return #standPointList
end

function GuildWarDataHelper.getSlotPosition(cityId,pointId,faceIndex,slotIndex)
    -- slotIndex 1 读取自己位置
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,
        pointId)
        
   local standPoint =  config.standPointData[faceIndex][slotIndex]
   local  x,y = standPoint.point_x,standPoint.point_y
    return x,y
end


function GuildWarDataHelper.getCurveConfigList(cityId,startPointId,endPointId,faceIndex,slotIndex)
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,
        startPointId)

    logWarn(startPointId.."--------"..faceIndex.."----------- "..slotIndex)
    local standPoint =  config.standPointData[faceIndex][slotIndex]
    local pathId = standPoint.road_id

    local roadConfig = G_UserData:getGuildWar():getGuildWarRoadConfig(pathId,endPointId)
    local decodeData = GuildWarDataHelper.getGuildWarRoadDecodeData(pathId,endPointId)

    return decodeData
end

function GuildWarDataHelper.getPathRunTime(cityId,startPointId,endPointId)
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,
        startPointId)
    --logWarn(string.format("getPathRunTime %d %d %d",cityId,startPointId,endPointId))
    local moveDataList = config.moveData --GuildWarDataHelper.decodeMoveData(config)
    local moveData = moveDataList[endPointId]
    local runTime = moveData[2]
    return runTime
end

--获取出口点,TODO 此判断只在攻击时间内才有效
function GuildWarDataHelper.getExitPoint(cityId)
    logWarn("getExitPoint---------------  "..tostring(cityId))
    local ownCityId = GuildWarDataHelper.getOwnCityId()
    if not ownCityId then
        return nil
    end
    local campId = GuildWarDataHelper.getCampPoint(cityId)
    local pointId = 0
    if campId then
        local config =  GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,campId)
        local moveDataList = config.moveData-- GuildWarDataHelper.decodeMoveData(config)
        for k,v in pairs(moveDataList) do
            local subConfig =  GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,k)
            if subConfig.point_type == GuildWarConst.POINT_TYPE_EXIT  then
                pointId = k
                break
            end
        end
    end
    --自己占有的城
     print("getExitPoint---------------xx  ",tostring(pointId)," ",tostring(campId))
    if pointId ~= 0 then 
       return pointId
    end   
    return nil
end

--获取大本营,TODO 此判断只在攻击时间内才有效
function GuildWarDataHelper.getCampPoint(cityId)
    local guildWarUserData =  G_UserData:getGuildWar():getMyWarUser(cityId)
    local bornPointId = guildWarUserData:getBorn_point_id()
  --  local isDefender = guildWarUserData:getPk_type() == GuildWarConst.CAMP_TYPE_DEFENDER
    local pointId = bornPointId
    if pointId ~= 0 then 
       return pointId
    end   
    return nil
end

function GuildWarDataHelper.getPreCityId(cityId,birth_id)
    --logWarn("-----------getPreCityId "..cityId.." "..birth_id)
    local config = GuildWarDataHelper.getGuildWarCityConfig(cityId)
    local canAttackCityList = string.split(config.from_city, "|") or {}
    dump(canAttackCityList)
    for k,v in ipairs(canAttackCityList) do
        local fromCityId = tonumber(v)
        if fromCityId and fromCityId ~= 0 then
            local fromCityConfig = GuildWarDataHelper.getGuildWarCityConfig(fromCityId)
       -- logWarn( string.format("-----------getPreCityId xx %d %d %d ",fromCityConfig.next_city,fromCityConfig.scene_birth_id,birth_id))
            if fromCityConfig.next_city == cityId and fromCityConfig.scene_birth_id == birth_id then
                return fromCityId
            end
        end
    end
    return nil
end

function GuildWarDataHelper.getGuildWarSeekPointList(cityId)
     local list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId)
     if not list then
        return {}
     end
     local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
     local newList = {}
     local campId = GuildWarDataHelper.getCampPoint(cityId)
     for k,config in pairs(list) do
        
        if config.point_type == GuildWarConst.POINT_TYPE_EXIT then
            
        elseif config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK or 
            config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER then   
            --非己方大本营
            if campId == config.point_id then
                table.insert( newList,config )
            end
        else
            table.insert( newList,config )
        end


     end
     return newList
end

function GuildWarDataHelper.getGuildWarCampList(cityId)
    local list = GuildWarDataHelper.getGuildWarConfigListByCityId(cityId)
     if not list then
        return {}
     end
     local newList = {}
     for k,config in pairs(list) do
        if config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK or 
            config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER then   
             table.insert( newList,config )
        end
     end
     return newList
end

function GuildWarDataHelper.getBattleResultState(cityId)
    local guildWarUserData = G_UserData:getGuildWar():getMyWarUser(cityId)
    local isDefender = guildWarUserData:getPk_type() == GuildWarConst.CAMP_TYPE_DEFENDER
    local guildId = G_UserData:getGuildWar():getBattleDefenderGuildId(cityId)
    if isDefender then
       
        if guildWarUserData:getGuild_id() == guildId and guildId ~= 0 then--防守成功
            return GuildWarConst.BATTLE_RESULT_DEFENDER_SUCCESS ,cityId
        else--防守失败
             local ownCityId = GuildWarDataHelper.getOwnCityId()
            if ownCityId then
                return GuildWarConst.BATTLE_RESULT_ATTACK_SUCCESS,ownCityId
            end
            return GuildWarConst.BATTLE_RESULT_DEFENDER_FAIL,cityId
        end
    else
        if guildWarUserData:getGuild_id() == guildId and guildId ~= 0 then--攻战成功
             return GuildWarConst.BATTLE_RESULT_ATTACK_SUCCESS,cityId
        else--攻战失败
             local ownCityId = GuildWarDataHelper.getOwnCityId()
             if ownCityId then
                return GuildWarConst.BATTLE_RESULT_DEFENDER_SUCCESS,ownCityId
             end
             return GuildWarConst.BATTLE_RESULT_ATTACK_FAIL ,cityId
        end  
    end
     return GuildWarConst.BATTLE_RESULT_ATTACK_FAIL,cityId 
end

function GuildWarDataHelper.isUserInCamp()
    local user = G_UserData:getGuildWar():getNewestMyWarUser()
    if not user then
        return false
    end
    --local campId = GuildWarDataHelper.getCampPoint(user:getCity_id())
    if user:getCurrPoint() == user:getBorn_point_id() then
        return true
    end
    return false 
end

function GuildWarDataHelper.getCurrBattleCityId()
	--local curTime = G_ServerTime:getTime()
    local timeRegion = GuildWarDataHelper.getGuildWarTimeRegion()
    local requestInfo = G_UserData:getGuildWar():getCityRequestInfo()
	if requestInfo.cityId then
        if requestInfo.time < timeRegion.startTime  or 
            requestInfo.time >= timeRegion.endTime then
            return nil
        end
		return requestInfo.cityId 
	end
	return nil
end

--预览的奖励列表
function GuildWarDataHelper.getGuildWarPreviewRewards()
  local openServerDayNum = G_UserData:getBase():getOpenServerDayNum()
  local GuildWarAward = require("app.config.guild_war_award")
  local rewardConfig = nil
  for index = 1,GuildWarAward.length(),1 do
       local config =  GuildWarAward.indexOf(index)
       if openServerDayNum >= config.day_min and openServerDayNum <= config.day_max then
            rewardConfig = config
            break
       end
  end
  if not rewardConfig then
     rewardConfig =  GuildWarAward.indexOf(GuildWarAward.length())
  end
  local TypeConvertHelper = require("app.utils.TypeConvertHelper")
  local rewardList = {}
  if rewardConfig ~= nil then
       local UserDataHelper = require("app.utils.UserDataHelper")
       rewardList = UserDataHelper.makeRewards(rewardConfig,GuildWarConst.AUCTION_REWARD_NUM)--最多配置9个奖励
  end
  return rewardList
end

function GuildWarDataHelper.getGuildWarExitCityId(cityId)
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local currCityId = guildWarUser:getCity_id()
    local isDefender = guildWarUser:getPk_type() == GuildWarConst.CAMP_TYPE_DEFENDER
    local bornPointId = guildWarUser:getBorn_point_id()
    local nextCityId = nil
    if isDefender then--去进攻
        local config = GuildWarDataHelper.getGuildWarCityConfig(currCityId)
        nextCityId = config.next_city
    else--去防守
        nextCityId = GuildWarDataHelper.getPreCityId(currCityId,bornPointId)  
    end
    return nextCityId
end

function GuildWarDataHelper.guildHasDeclare()
    local guild = G_UserData:getGuild():getMyGuild()
    local lastDeclareTime = guild and guild:getWar_declare_time() or 0 
    if lastDeclareTime > 0 then
        return true
    end
    return false
end


function GuildWarDataHelper.isLivingBuilding(cityId,pointId)
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)
	if config.build_hp > 0 then
		local nowWarWatch = G_UserData:getGuildWar():getWarWatchById(cityId,config.point_id)
		local maxHp = config.build_hp
		local hp = maxHp
		if  nowWarWatch then
			hp = nowWarWatch:getWatch_value() 
		end
		return hp > 0
	end
	
	return false
end

function GuildWarDataHelper.isNeedAttackBuild(cityId,pointId)
    local isDefender = GuildWarDataHelper.selfIsDefender(cityId)
    local canAttack = GuildWarDataHelper.isLivingBuilding(cityId,pointId) and not isDefender
    return  canAttack
end

function GuildWarDataHelper.getRecordConfigByMerit(merit)
    local GuildWarMerit = require("app.config.guild_war_merit")
    for k = GuildWarMerit.length(),1,-1 do
        local config = GuildWarMerit.indexOf(k)
        if merit >= config.merit_min  then
            return config
        end        
    end
    return nil
end




return GuildWarDataHelper

