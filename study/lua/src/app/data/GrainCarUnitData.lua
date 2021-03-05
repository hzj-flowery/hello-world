-- Description: 粮车数据
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-06

local BaseData = require("app.data.BaseData")
local GrainCarUnitData = class("GrainCarUnitData", BaseData)
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 

local schema = {}
schema["id"]					= {"number", 0} --粮车configId 就是等级 ————贝贝
schema["level"]					= {"number", 0} --粮车configId 就是等级 ————贝贝
schema["exp"]					= {"number", 0} --经验
schema["stamina"] 				= {"number", 0} --耐久度
schema["start_time"]			= {"number", 0} --开始移动的时间
schema["end_time"]				= {"number", 0} --位移结束的时间（开始存的是未被摧毁最终结束时间）
schema["all_view"]				= {"number", 0} --军团所有人可见 (0:管理 1:所有人)
schema["guild_id"]				= {"number", 0} --军团id
schema["guild_name"]		    = {"string", 0} --军团名字
schema["donate_users"]			= {"number", 0} --军团捐献的人次
schema["config"]            	= {"table", {}} --配置表信息
schema["destory_guild_name"]    = {"table", {}} --伤害我方粮车的军团名列表
schema["grainRoads"]            = {"table", {}} --路线信息
schema["route"]                 = {"table", {}} --完整路线
schema["road_id"]               = {"number", 0} --路线id
schema["route_point"]           = {"table", {}} --后续路径点（客户端算）
schema["route_passed"]          = {"table", {}} --已经经过的路径点
schema["mine_id"]               = {"number", 0} --死亡点


GrainCarUnitData.schema = schema


function GrainCarUnitData:ctor(properties)
	GrainCarUnitData.super.ctor(self, properties)
end

function GrainCarUnitData:clear()
end

function GrainCarUnitData:reset()
end

function GrainCarUnitData:initData(msg)
    self:setProperties(msg)
    self:setLevel(msg.id)
    local config = require("app.config.graincar").get(msg.id)
    assert(config, "graincar can't find base_id = " .. tostring(msg.id))
    self:setConfig(config)
end

function GrainCarUnitData:updateData(data)
    self:setProperties(data)
    self:setLevel(data.id)
    local config = require("app.config.graincar").get(data.id)
    assert(config, "graincar can't find base_id = " .. tostring(data.id))
    self:setConfig(config)
end

function GrainCarUnitData:insertData(data)
end

function GrainCarUnitData:deleteData(data)
end

function GrainCarUnitData:createRouteWithRoadId(roadId)
    if roadId and roadId > 0 then
        self:setRoad_id(roadId)
        local routeList = GrainCarConfigHelper.getRouteWithId(roadId)
        self:setRoute_point(routeList)
    end
end

function GrainCarUnitData:setGrainRoads(road)
    self.grainRoads_ = road
	self:_initPassedRouteList()
end

--是否在某个mine_id里停留
function GrainCarUnitData:isInMine(mineId)
    local roads = self:getGrainRoads()
    if #roads < 1 then
        return false
    end
    local curRoad = roads[1]
    local curTime = G_ServerTime:getTime()
    if curRoad:getMine_id() == mineId and 
        curTime >= curRoad:getEnter_time() - 1 and
        curTime < curRoad:getLeave_time() then
        return true
    end
    return false
end

--获取当前矿id（路上也算）
function GrainCarUnitData:getCurPit()
    local roads = self:getGrainRoads()
    if #roads < 1 then
        return nil
    end
    local curRoad = roads[1]
    local minePit1 = curRoad:getMine_id()
    return minePit1
end

--获取路线百分比
--return minePit1, minePit2, percent
function GrainCarUnitData:getCurCarPos()
    local roads = self:getGrainRoads()
    if #roads < 1 then
        return nil
    end
    local curRoad = roads[1]
    local minePit1 = curRoad:getMine_id()
    local minePit2 = curRoad:getNext_mine_id()
    local percent = 0
    local interval = self:getConfig().moving --GrainCarConfigHelper.getGrainCarMoveTime()
    local curMSTime = G_ServerTime:getMSTime()
    if curMSTime < curRoad:getLeave_time() * 1000 then
        percent = 0 
    elseif curMSTime > curRoad:getLeave_time() * 1000 + interval * 1000 then
        percent = 1
    else
        percent = (curMSTime - curRoad:getLeave_time() * 1000) / (interval * 1000)
    end
    return minePit1, minePit2, percent
end

--获取全程路线百分比(活着有效)
function GrainCarUnitData:getRoutePercent()
    local curTime = G_ServerTime:getTime()
    return (curTime - self:getStart_time()) / (self:getEnd_time() - self:getStart_time())
end

--获取起点矿
function GrainCarUnitData:getStartMine()
    local roads = self:getRoute()
    if #roads < 1 then
        return nil
    end
    local curRoad = roads[1]
    local minePit = curRoad:getMine_id()
    return minePit
end

--是否停留状态
function GrainCarUnitData:isStop()
    local roads = self:getGrainRoads()
    if #roads < 1 then
        return nil
    end
    local curRoad = roads[1]
    return G_ServerTime:getTime() < curRoad:getLeave_time() or curRoad:getLeave_time() == 0
end

--是否在路上
function GrainCarUnitData:isOnWay()
    local _, _, percent = self:getCurCarPos()
    return percent > 0 and percent < 1
end

--是否已经到终点
function GrainCarUnitData:isReachTerminal()
    local roads = self:getGrainRoads()
    if #roads < 1 and self:getStamina() > 0 then
        return true
    end
    local curRoad = roads[1]
    if curRoad:getNext_mine_id() == 0 and self:getStamina() > 0 then
        return true
    end
    return false
    -- local _, pit2, percent = self:getCurCarPos()
    -- local mineData = G_UserData:getMineCraftData():getMineDataById(pit2):getConfigData()
    -- return mineData.pit_type == 2 and percent == 1
end

--获取出站时间
function GrainCarUnitData:getLeaveTime()
    local roads = self:getGrainRoads()
    local curRoad = roads[1]
    local leaveTime = curRoad:getLeave_time()
    return leaveTime
end

--是否是友军粮车
function GrainCarUnitData:isFriendCar()
    local guildId = G_UserData:getGuild():getMyGuildId()
    return self:getGuild_id() == guildId
end

--是否已经发车
function GrainCarUnitData:hasLaunched()
    return self:getStart_time() > 0
end

--是否在活跃中 （没死且没跑完全程）
function GrainCarUnitData:isActive()
    local curTime = G_ServerTime:getTime()
    return curTime > self:getStart_time() and 
            curTime < self:getEnd_time() and 
            self:getStamina() > 0
end

--是否已经死亡
function GrainCarUnitData:isDead()
    return self:getStamina() <= 0
end

--是否已经跑完全程
function GrainCarUnitData:hasComplete()
    local curTime = G_ServerTime:getTime()
    return curTime >= self:getEnd_time() and self:getStamina() > 0
end

--获取接下来的路径点 包括当前点
--{1,2,3,4,5,6,7,8,9} 当前为5，则返回{5,6,7,8,9}
function GrainCarUnitData:getNextRouteList()
    local routeList = self:getRoute_point()
    local i = 1
    local curPit = self:getCurPit()
	while i < #routeList do
        local pit = routeList[i]
		if curPit ~= pit then
			table.remove(routeList, i)
            i = i - 1
        else
            break
		end
		i = i + 1
    end
    return routeList
end

--初始化已经经过的路径点，包括当前点
--{1,2,3,4,5,6,7,8,9} 当前为5，则返回{1,2,3,4,5}
function GrainCarUnitData:_initPassedRouteList()
    local routePassed = {}
    local routeList = self:getWholeRoute()
    local i = 1
    local curPit = self:getCurPit()
	while i < #routeList do
        local pit = routeList[i]
        table.insert(routePassed, pit)
		if curPit == pit then
            break
		end
		i = i + 1
    end
    self:setRoute_passed(routePassed)
end

--获取完整路线
function GrainCarUnitData:getWholeRoute()
    if self:getRoad_id() > 0 then
        return GrainCarConfigHelper.getRouteWithId(self:getRoad_id())
    else
        local routeList = {}
        local roadList = self:getRoute()
        for i = 1, #roadList do
            local road = roadList[i]
            local minePit = road:getMine_id()
            table.insert(routeList, minePit)
        end
        return routeList
    end
end


return GrainCarUnitData