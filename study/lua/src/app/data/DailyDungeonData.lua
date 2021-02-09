local BaseData = require("app.data.BaseData")
local DailyDungeonData = class("DailyDungeonData", BaseData)

local DailyDungeonBaseData = require("app.data.DailyDungeonBaseData")
local DailyDungeon = require("app.config.daily_dungeon")
local DailyDungeonType = require("app.config.daily_dungeon_type")

local schema = {}
schema["dds"] = {"table", {}}
schema["nowType"] = {"number", 0}           --现在进入副本类型
DailyDungeonData.schema = schema

function DailyDungeonData:ctor(properties)
    DailyDungeonData.super.ctor(self, properties)
    self._listenerDailyDungeonData = G_NetworkManager:add(MessageIDConst.ID_S2C_EnterDailyDungeonData, handler(self, self._s2cEnterDailyDungeonData))
    self._listenerFirstEnterDaily = G_NetworkManager:add(MessageIDConst.ID_S2C_FirstEnterDailyDungeon, handler(self, self._s2cFirstEnterDailyDungeon))
    self._listenerExecute = G_NetworkManager:add(MessageIDConst.ID_S2C_ExecuteDailyDungeon, handler(self, self._s2cExecuteDailyDungeon))
end

function DailyDungeonData:clear()
	self._listenerDailyDungeonData:remove()
    self._listenerDailyDungeonData = nil
    self._listenerFirstEnterDaily:remove()
    self._listenerFirstEnterDaily = nil
    self._listenerExecute:remove()
    self._listenerExecute = nil
end

function DailyDungeonData:reset()
	
end

function DailyDungeonData:_s2cEnterDailyDungeonData(id, message)
    self:resetTime()
    local ddDataList = {}
    if message.ret == 1 then
        if rawget(message, "dds") then
            for _, val in pairs(message.dds) do
                local ddData = DailyDungeonBaseData.new(val)
                table.insert(ddDataList, ddData)
            end
            self:setDds(ddDataList)
        end
    end

    G_SignalManager:dispatch(SignalConst.EVENT_DAILY_DUNGEON_ENTER)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_DAILY_STAGE)
end

--获得剩余次数
function DailyDungeonData:getRemainCount(type)
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
        if val:getType() == type then
            return val:getRemain_count()
        end
    end
    return DailyDungeonType.get(type).daily_times
end

function DailyDungeonData:isNeedReset()
    local isNeed = true
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
        if val:getRemain_count() > 0 and self:_isDungeonOpen(val:getType()) then
            isNeed = false
            break
        end
    end

    return isNeed
end

--改变剩余次数byId
function DailyDungeonData:updateRemainCountById(type, remainCount)
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
        if val:getType() == type then
            val:setRemain_count(remainCount)
        end
    end
    self:setDds(ddsList)
end

--改变某一类型的初次进入id
function DailyDungeonData:updateFirstEnter(type, id)
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
        if val:getType() == type then
            val:setFirst_enter_max_id(id)
        end
    end
    self:setDds(ddsList)
end

--获得某一类型初次进入id
function DailyDungeonData:getFirstEnter(type)
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
        if val:getType() == type then
            return val:getFirst_enter_max_id()
        end
    end
    return 0
end

--根据类型获得打到某关卡
function DailyDungeonData:getMaxIdByType(type)
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
        if val:getType() == type then
            return val:getMax_id()
        end
    end
    return 0
end

--是否进入过这个副本
function DailyDungeonData:isDungeonEntered(type, id)
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
        if val:getType() == type then
            return id <= val:getFirst_enter_max_id()
        end
    end
    return false  
end

--更新最大副本
function DailyDungeonData:updateMaxId(type, id)
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
        if val:getType() == type and id > val:getMax_id() then
            val:setMax_id(id)
            break
        end
    end
    self:setDds(ddsList)
end

--发送第一次进入
function DailyDungeonData:c2sFirstEnterDailyDungeon(nextId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_FirstEnterDailyDungeon, 
    {
        id = nextId,
    })
end

--第一次进入消息
function DailyDungeonData:_s2cFirstEnterDailyDungeon(id, message)
	if message.ret == 1 then
		local firstEnterId = message.id
		self:updateFirstEnter(self:getNowType(), firstEnterId)
        
        G_SignalManager:dispatch(SignalConst.EVENT_DAILY_DUNGEON_FIRSTENTER, firstEnterId)
	end
end

--发送攻打 opType 1:挑战 2:扫荡
function DailyDungeonData:c2sExecuteDailyDungeon(stageId,opType)
    if self:isExpired() == true then
		self:pullData()
		return 
	end
    G_NetworkManager:send(MessageIDConst.ID_C2S_ExecuteDailyDungeon, 
    {
        id = stageId,
        op_type = opType,
    })
end

function DailyDungeonData:c2sEnterDailyDungeonData()
    G_NetworkManager:send(MessageIDConst.ID_C2S_EnterDailyDungeonData, {})
end

function DailyDungeonData:pullData()
    self:c2sEnterDailyDungeonData()
end 

--攻打消息回执
function DailyDungeonData:_s2cExecuteDailyDungeon(id, message)
	if message.ret ~= 1 then
		return
	end
  
    local nowType = self:getNowType()
	self:updateRemainCountById(nowType, message.remain_count)
	local isPass = message.is_pass
	local stageId = message.id
    local maxId = self:getMaxIdByType(nowType)
	if isPass and stageId >= maxId then
		self:updateMaxId(nowType, stageId)
	end
    G_SignalManager:dispatch(SignalConst.EVENT_DAILY_DUNGEON_EXECUTE , message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_DAILY_STAGE)
end

function DailyDungeonData:hasRedPoint()
    return self:_hasRemainCountRedPoint()
end

function DailyDungeonData:_hasRemainCountRedPoint()
    local ddsList = self:getDds()
    for _, val in pairs(ddsList) do
         local showRedPoint =  self:dungeonIsHasRemainCountRedPoint(val:getType())
         if showRedPoint then
            return true
         end
    end
    return false
end

function DailyDungeonData:dungeonIsHasRemainCountRedPoint(type)
    return  self:_isDungeonOpen(type) and self:_isLevelEnough(type) and self:getRemainCount(type) > 0
end

function DailyDungeonData:_getFirstOpenLevel(type)
    local DailyDungeonCount = DailyDungeon.length()
	for i = 1, DailyDungeonCount do
		local info = DailyDungeon.indexOf(i)
		if info.type == type and info.pre_id == 0 then
            return info.level
		end
    end
end

function DailyDungeonData:_isDungeonOpen(type)
    --如果是当天等级到了，直接开放
    
    local firstLevel = self:_getFirstOpenLevel(type)
    local todayLevel = G_UserData:getBase():getToday_init_level()
    local nowLevel = G_UserData:getBase():getLevel()
    if todayLevel < firstLevel and nowLevel >= firstLevel then
        return true
    end

    

    local dailyInfo = DailyDungeonType.get(type)
    assert(dailyInfo,"daily_dungeon_type not find id "..type)
    local openDays = {}
	for i = 1,string.len(dailyInfo.week_open_queue) do
		openDays[i] = string.byte(dailyInfo.week_open_queue,i) == 49
	end
    local TimeConst = require("app.const.TimeConst")
	local data = G_ServerTime:getDateObject(nil,TimeConst.RESET_TIME_SECOND)
	return openDays[data.wday]
end

function DailyDungeonData:_isLevelEnough(type)
    local dailyInfo = DailyDungeonType.get(type)
    assert(dailyInfo,"daily_dungeon_type not find id "..type)
    local myLevel = G_UserData:getBase():getLevel()
	local dailyDungeonCount = DailyDungeon.length()
    local firstLevel = 0
	for i = 1, dailyDungeonCount do
		local info = DailyDungeon.indexOf(i)
		if info.type == dailyInfo.id and info.pre_id == 0 then
            firstLevel = info.level
            break
		end
	end
    return myLevel >= firstLevel
end


return DailyDungeonData