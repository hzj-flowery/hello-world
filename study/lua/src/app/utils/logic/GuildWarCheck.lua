local GuildWarCheck = {}

function GuildWarCheck.guildWarCanProclaim(cityId,popHint)
   
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end

    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    if success then
         local level = GuildWarDataHelper.getGuildWarProclaimGuildLv()
         local guildLevel = G_UserData:getGuild():getMyGuildLevel()
         if guildLevel < level  then
            popFunc = function()
                G_Prompt:showTip(Lang.get("guild_open_tip", {level = level}))
            end  
            success =  false
         end
    end
   


    
    local guildWarCity = G_UserData:getGuildWar():getCityById(cityId)
	if not guildWarCity then
		success = false
    else
        local maxNum = GuildWarDataHelper.getGuildWarProclaimMax()
        if guildWarCity:getDeclare_guild_num() >= maxNum then
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_proclaim_count_limit",{value = 
               maxNum
            })) end
            success = false        
        end
   
	end
 
    if success then
        local guild = G_UserData:getGuild():getMyGuild()
        local lastDeclareTime = guild and guild:getWar_declare_time() or 0 
        local curTime = G_ServerTime:getTime()
        local money =  GuildWarDataHelper.getGuildWarProclaimCD()

        if lastDeclareTime > 0 then
            local LogicCheckHelper = require("app.utils.LogicCheckHelper")
            success, popFunc = LogicCheckHelper.enoughCash(money,false)
        end
 
    end


   
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


function GuildWarCheck.guildWarCheckActTime(popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then  
        popHint = true 
    end

    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local isTodayOpen = GuildWarDataHelper.isTodayOpen()     
    if not isTodayOpen then
        success = false
        popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_not_open")) end
    end

    if success then
        local timeData = GuildWarDataHelper.getGuildWarTimeRegion()
        local curTime = G_ServerTime:getTime()
        if curTime < timeData.startTime or curTime >= timeData.endTime then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_not_open")) end
        elseif curTime >= timeData.startTime and curTime < timeData.time1 then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_in_prepare")) end   
        end
    end
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


function GuildWarCheck.guildWarCheckMoveCD(cityId,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local moveTime = guildWarUser:getMove_time()
    local moveCD = GuildWarDataHelper.getGuildWarMoveCD() 
    local curTime = G_ServerTime:getTime()
    if curTime <= moveTime + moveCD then
         success = false
         popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_in_move_cd")) end   
    end
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


function GuildWarCheck.guildWarCheckRebornCD(cityId,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local rebornTime = guildWarUser:getRelive_time()
    local curTime = G_ServerTime:getTime()
    if curTime <= rebornTime then
         success = false
         popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_in_reborn_cd")) end   
    end
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end



function GuildWarCheck.guildWarCheckAttackCD(cityId,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local challengeTime = guildWarUser:getChallenge_time()
    local challengeCd = guildWarUser:getChallenge_cd()
    local cd = GuildWarDataHelper.getGuildWarAtkCD() 
    local maxCd = GuildWarDataHelper.getGuildWarTotalAtkCD()

	local nextTime = challengeTime + challengeCd
	local countDownTime = nextTime - G_ServerTime:getTime() 
	countDownTime = math.max(countDownTime,0)

    if countDownTime > 0 and challengeCd >= maxCd then
         success = false
         popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_in_attack_cd")) end   
    end
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end

function GuildWarCheck.guildWarCanSeek(cityId,pointId,popHint)
    --非己方出口
    --非己方大本营
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end

    local GuildWarConst = require("app.const.GuildWarConst")
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)

    local cityId = guildWarUser:getCity_id()
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)

    --logWarn(pointId.." GuildWarCheck ")
    local campId = GuildWarDataHelper.getCampPoint(cityId)
    if config.point_type == GuildWarConst.POINT_TYPE_EXIT then
         success = false
         --logWarn(pointId.." GuildWarCheck "..tostring(success))
         popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_seek_exit")) end   
    elseif config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK or 
        config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER then   
        if campId ~= pointId then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_seek_camp")) end   
        end
      
    end

    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end

function GuildWarCheck.guildWarCanShowPoint(cityId,pointId,popHint)
    --非己方出口
    --非己方大本营
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end

    local GuildWarConst = require("app.const.GuildWarConst")
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)

    local cityId = guildWarUser:getCity_id()
    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)

    --logWarn(pointId.." GuildWarCheck ")
    
    if config.point_type == GuildWarConst.POINT_TYPE_EXIT then
        
         success = false
        -- logWarn(pointId.." GuildWarCheck "..tostring(success))
         popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_seek_exit")) end   
    elseif config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK or 
        config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER then   
        --非己方大本营
        local campId = GuildWarDataHelper.getCampPoint(cityId)
        if campId ~= pointId then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_not_my_camp")) end   
        end
    end


    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


function GuildWarCheck.guildWarCheckIsCanMovePoint(cityId,pointId,popHint)
    --非己方出口
    --非己方大本营
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end

    local GuildWarConst = require("app.const.GuildWarConst")
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")


    local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)

    if config.point_type == GuildWarConst.POINT_TYPE_EXIT then
        --非己方出口
        local exitPointId = GuildWarDataHelper.getExitPoint(cityId)
        if exitPointId ~= pointId then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_not_my_exit")) end   
        end
    elseif config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK or 
        config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER then   
        --非己方大本营
        local campId = GuildWarDataHelper.getCampPoint(cityId)
        if campId ~= pointId then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_not_my_camp")) end   
        end
    end


    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


function GuildWarCheck.guildWarCanMove(cityId,pointId,ignoreCD,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end
    --是否在攻城时间内
    --移动CD
    --目标点是否能移动（大本营）
    --是否在可移动方向上
    --是否有障碍物

    if not ignoreCD then
        success,popFunc = GuildWarCheck.guildWarCheckActTime(false)
    end
    
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local currPoint = guildWarUser:getCurrPoint()
    local cityId = guildWarUser:getCity_id()

    if success then
        if currPoint <= 0 then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_move_in_run")) end    
        end
    end
    
    if success and (not ignoreCD) then
        success,popFunc = GuildWarCheck.guildWarCheckRebornCD(cityId,false)
    end

    if success and (not ignoreCD) then
        success,popFunc = GuildWarCheck.guildWarCheckMoveCD(cityId,false)
    end

    if success then
        success,popFunc =  GuildWarCheck.guildWarCheckIsCanMovePoint(cityId,pointId,false)
    end

    if success then
       
        local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
        local movePointList = GuildWarDataHelper.findNextMovePointData(cityId,currPoint)
        if not movePointList[pointId] then
           success = false
           popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_not_can_move_point")) end   
        end
    end
    
    if success then
        local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
        local isHasHinder = GuildWarDataHelper.isHasHinder(cityId,currPoint,pointId)
        --logWarn(string.format("guildWarCanMove isHasHinder %d %d %d ",cityId,currPoint,pointId))
        if isHasHinder then
           success = false
           popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_has_hinder")) end   
        end
    end
     
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end

function GuildWarCheck.guildWarCanAttackPoint(cityId,pointId,ignoreCD,popHint)
    --是否在攻城时间内
    --是否在此据点上
    --此据点是否可攻击
    --是否是自己的龙柱
    --是否是自己的城墙
    --攻击CD
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end
    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)

    if not ignoreCD then
         success,popFunc = GuildWarCheck.guildWarCheckActTime(false)
    end


     if success then
        if guildWarUser:getCurrPoint() ~= pointId then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_attack_not_in_point")) end   
        end
    end

     if success then
        local cityId = guildWarUser:getCity_id()
        local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)
        local GuildWarConst = require("app.const.GuildWarConst")
        if config.build_hp <= 0 or GuildWarDataHelper.isWatcherDeath(cityId,pointId) then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_attack_not_building")) end   
        end

    end


    if success then
        local cityId = guildWarUser:getCity_id()
        local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,pointId)
        local isDefender =  GuildWarDataHelper.selfIsDefender(cityId) 
        local GuildWarConst = require("app.const.GuildWarConst")
        if config.point_type == GuildWarConst.POINT_TYPE_CRYSTAL and isDefender then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_attack_self_crystal")) end   
        elseif config.point_type == GuildWarConst.POINT_TYPE_GATE and isDefender then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_attack_self_gate")) end   
        end

    end

 

  
    if success and (not ignoreCD) then
        success,popFunc = GuildWarCheck.guildWarCheckAttackCD(cityId,false)
    end


    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


function GuildWarCheck.guildWarCanAttackUser(cityId,otherGuildWarUser,popHint)
    --是否在攻城时间内
    --是否在相同据点上
    --是否敌对方
    --攻击CD
    --大本营不能互相攻击

    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end

    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local currPoint = guildWarUser:getCurrPoint()

    success,popFunc = GuildWarCheck.guildWarCheckActTime(false)

     if success then
        if  guildWarUser:getGuild_id() == otherGuildWarUser:getGuild_id() then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_attack_same_guild")) end   
        end
    end

    if success then
       
        if currPoint == 0 or guildWarUser:getCurrPoint() ~= otherGuildWarUser:getCurrPoint() then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_attack_not_in_same_point")) end   
        end
    end


     if success then
        success,popFunc = GuildWarCheck.guildWarCheckAttackCD(cityId,false)
    end

    if success and currPoint ~= 0 then
        local GuildWarConst = require("app.const.GuildWarConst")
         local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
        local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,currPoint)
        if config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK then
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_attack_in_camp")) end  
        end
      
    end
    

    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end


function GuildWarCheck.guildWarCanExit(cityId,popHint)
    local success = true
    local popFunc = nil
    if popHint == nil then
        popHint = true
    end
    --是否在攻城时间内
    --是否在大本营
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local GuildWarConst = require("app.const.GuildWarConst")
    success,popFunc = GuildWarCheck.guildWarCheckActTime(false)


    local guildWarUser = G_UserData:getGuildWar():getMyWarUser(cityId)
    local currPoint = guildWarUser:getCurrPoint()

    if success then
        success,popFunc = GuildWarCheck.guildWarCheckRebornCD(cityId,false)
    end


    if currPoint <= 0 then
        success = false
        popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_exit")) end    
    end

    if success and currPoint > 0  then
        local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(guildWarUser:getCity_id(),currPoint)
        if config.point_type ~= GuildWarConst.POINT_TYPE_CAMP_ATTACK and 
            config.point_type ~= GuildWarConst.POINT_TYPE_CAMP_DEFENDER then   
            success = false
            popFunc = function() G_Prompt:showTip(Lang.get("guildwar_tip_cannot_exit")) end    
        end 
    end
       
    if popHint and popFunc then
        popFunc()
    end
    return success,popFunc
end






return GuildWarCheck
