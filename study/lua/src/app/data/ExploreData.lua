local BaseData = require("app.data.BaseData")
local ExploreData = class("ExploreData", BaseData)

local Explore = require("app.config.explore")

local schema = {}
schema["explores"] = {"table", {}}
schema["events"] = {"table", {}}
schema["autoExplore"] = {"number", 0}--0 不开启，1 自动游历，2一键游历 @see ExploreConst
schema["firstPassCity"] = {"number", 0}
ExploreData.schema = schema

function ExploreData:ctor(properties)
    ExploreData.super.ctor(self, properties)
    self:_createEmptyData()
    self._listernerExploreData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetExplore, handler(self, self._s2cGetExplore))
    self._listenerEnterExplore = G_NetworkManager:add(MessageIDConst.ID_S2C_EnterExplore, handler(self, self._s2cEnterExplore))
    self._listenerRollExplore = G_NetworkManager:add(MessageIDConst.ID_S2C_RollExplore, handler(self, self._s2cRollExplore))
    self._listenerDoEvent = G_NetworkManager:add(MessageIDConst.ID_S2C_ExploreDoEvent, handler(self, self._s2cExploreDoEvent))
    self._listenerGetReward = G_NetworkManager:add(MessageIDConst.ID_S2C_ExploreGetReward, handler(self, self._s2cExploreGetReward))
end

function ExploreData:clear()
    self._listernerExploreData:remove()
    self._listernerExploreData = nil
    self._listenerEnterExplore:remove()
    self._listenerEnterExplore = nil
    self._listenerRollExplore:remove()
    self._listenerRollExplore = nil
    self._listenerDoEvent:remove()
    self._listenerDoEvent = nil
    self._listenerGetReward:remove()
    self._listenerGetReward = nil
end

function ExploreData:reset()

end

function ExploreData:getUnFinishEvents()
    local events = self:getEvents()
    local eventList = {}
    local curTime = G_ServerTime:getTime()
    for i, v in pairs(events) do
		if v:getParam() == 0 then
            local endTime = v:getEndTime()
            local leftTime = endTime - curTime
            if endTime ~= 0 then
                if leftTime > 0 then
                    table.insert(eventList, v)
                end
            else
                table.insert(eventList, v)
            end
		end
	end
    return eventList
end

--解决当停留在 游历事件弹框界面 发生了重连 导致 事件没设置答案bug
function ExploreData:setEventParamById(eventId,param)
	local events = self:getEvents()
	for i, v in pairs(events) do
		if v:getEvent_id() == eventId then
			v:setParam(param)
			break
		end
	end
end


-- 获取未完成事件个数
function ExploreData:getUnFinishEventCountByType(type)
    local events = self:getEvents()
    local count = 0
    local curTime = G_ServerTime:getTime()
    for i, v in pairs(events) do
        local curType = v:getEvent_type()
        if curType == type and v:getParam() == 0 then
            local endTime = v:getEndTime()
            local leftTime = endTime - curTime
            if endTime ~= 0 then
                if leftTime > 0 then
                    count = count + 1;
                end
            else
                count = count + 1;
            end
        end
    end
    return count
end

function ExploreData:updateData(data)
end

--建立数据结构，放入表格数据
function ExploreData:_createEmptyData()
    local exploreList = {}
    local length = Explore.length()
    local data = Explore.indexOf(length)
    while data do
        local exploreBaseData = require("app.data.ExploreBaseData").new()
        exploreBaseData:setId(data.id)
        exploreBaseData:setConfigData(data)
        table.insert(exploreList, 1, exploreBaseData)
        data = Explore.get(data.ago_chapter)
    end
    self:setExplores(exploreList)
end

--根据id获取数据
function ExploreData:getExploreById(exploreId)
    local exploreList = self:getExplores()
    for i, v in pairs(exploreList) do
        if v:getId() == exploreId then
            return v
        end
    end
end
--获取 游历通过关卡数目
function ExploreData:getExplorePassCount()
    local exploreList = self:getExplores()
    local count = 0
    for _, v in pairs(exploreList) do
        if v:getPass_count() > 1 then
            count = count + 1
        end
    end
    return count
end

--获得上n章的情况
function ExploreData:isLastPass(exploreId, n)
    local lastTwoIndex = 0     --上两章的index
    local exploreList = self:getExplores()
    for i, v in pairs(exploreList) do
        if v:getId() == exploreId then
            lastTwoIndex = i - n
        end
    end
    if lastTwoIndex < 0 then
        lastTwoIndex = 0
    end
    if lastTwoIndex == 0 then
        return true
    else
        local passCount = exploreList[lastTwoIndex]:getPass_count()
        if passCount > 1 then
            return true
        end
        return false
    end
    return false
end

function ExploreData:c2sGetExplore()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetExplore, {})
end
--获取服务器消息
function ExploreData:_s2cGetExplore(id, message)
    if message.ret ~= 1 then
        return
    end
    local isBegin = rawget(message, "is_begin")
    local isEnd = rawget(message, "is_end")

    if rawget(message, "explores") then
        for _, data in pairs(message.explores) do
            -- local singleExplore = self:getExploreById(data.id)
            -- singleExplore:updateData(data)
            self:updateSingleData(data)
        end
    end

    if isBegin then
        self:setEvents({})
    end
    if rawget(message, "event_to_do") then
        for _, data in pairs(message.event_to_do) do
            local exploreEventData = require("app.data.ExploreEventData").new()
            exploreEventData:updateData(data)
            local eventList = self:getEvents()
            eventList[exploreEventData:getEvent_id()] = exploreEventData
            self:setEvents(eventList)
        end
    end
    -- self:setEvents(eventList)
    --数据过期的 4点不重置数据
    -- if self:isExpired() then
    --     G_SignalManager:dispatch(SignalConst.EVENT_EXPLORE_EVENT_EXPIRED)
    -- end
    -- self:resetTime()
end

function ExploreData:getPassCount( exploreId)
    if exploreId == 0 then
        return 0
    end
    local singleExplore = self:getExploreById(exploreId)
    assert(singleExplore, "wrong exploreId "..exploreId)
    local passCount = singleExplore:getPass_count()
    return passCount
    -- body
end
--是否通关
function ExploreData:isExplorePass(exploreId)
    if exploreId == 0 then
        return true
    end
    local singleExplore = self:getExploreById(exploreId)
    assert(singleExplore, "wrong exploreId "..exploreId)
    local passCount = singleExplore:getPass_count()
    if passCount > 1 then
        return true
    end
    return false
end

-- 判断 游历第一次引导 水镜学堂 两台机器互踢 导致引导卡住bug
-- 手动 判断  是否需要跳过引导
function ExploreData:isCanRunFirstExploreTutorial()
    local ExploreConst = require("app.const.ExploreConst")
    local isFind = false
    local events = self:getEvents()
	for i, v in pairs(events) do
		if v:getEvent_id() == ExploreConst.EVENT_TYPE_ANSWER and v:getParam() == 0 then
            isFind = true
			break
		end
	end

    local isFirstNotPass = false
    local footIndex = 0
    local singleExplore = self:getExploreById(1)
    if singleExplore then
        local passCount = singleExplore:getPass_count()
        if passCount <= 1 then
            isFirstNotPass = true
        end
        footIndex = singleExplore:getFoot_index()
    end

    if isFirstNotPass then
        if footIndex == 0 and not isFind then
            return true
        elseif footIndex == 3 and isFind then
            return true
        end
    end
    return false
end


--更新具体关卡数据
function ExploreData:updateSingleData(data)
    local singleData = self:getExploreById(data.id)
    singleData:updateData(data)
end

--根据id获得事件
function ExploreData:getEventById(eventId)
    local eventList = self:getEvents()
    return eventList[eventId]
end

--跟新事件
function ExploreData:updateEvent(data)
    local eventData = self:getEventById(data.event_id)
    if eventData then
        eventData:updateData(data)
    else
        local eventList = self:getEvents()
        local exploreEventData = require("app.data.ExploreEventData").new()
        exploreEventData:updateData(data)
        eventList[exploreEventData:getEvent_id()] = exploreEventData
        self:setEvents(eventList)
    end
end

--检查没完成事件个数
function ExploreData:checkUnfinishedEvent()
    local count = 0
    local eventList = self:getEvents()
    for i, v in pairs(eventList) do
        if v:getParam() == 0 then
            count = count + 1
        end
    end
    return count
end

--发送进入大富翁消息
function ExploreData:c2sEnterExplore(exploreId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_EnterExplore, {id = exploreId})
end

--收到进入大富翁消息
function ExploreData:_s2cEnterExplore(id, message)
	if message.ret ~= 1 then
		return
	end
	if rawget(message, "explore") then
		self:updateSingleData(message.explore)
	end
    G_SignalManager:dispatch(SignalConst.EVENT_EXPLORE_ENTER, message.explore.id)
end

--发送至骰子
function ExploreData:c2sRollExplore(exploreId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_RollExplore, {id = exploreId})
end

--收到骰子消息
function ExploreData:_s2cRollExplore(id, message)
    if message.ret ~= 1 then
        return
    end
    if rawget(message, "explore") then
        -- self:getExploreById(message.explore.id):updateData(message.explore)
        self:updateSingleData(message.explore)
    end
    if rawget(message, "event") then
        self:updateEvent(message.event)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_EXPLORE_ROLL, message)
end

--发送处理event消息
function ExploreData:c2sExploreDoEvent(eventId, value)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ExploreDoEvent,
        {
            id = eventId,
            value1 = value,
        })
end

--收到处理event消息
function ExploreData:_s2cExploreDoEvent(id, message)
	if message.ret ~= 1 then
		return
	end

	local eventData = self:getEventById(message.id)
	eventData:updateDataByMessage(message)

	G_SignalManager:dispatch(SignalConst.EVENT_EXPLORE_DO_EVENT, message)
end

--领取宝箱
function ExploreData:c2sExploreGetReward(exploreId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ExploreGetReward,
        {
            id = exploreId,
        })
end

--收到领取宝箱
function ExploreData:_s2cExploreGetReward(id, message)
    if message.ret ~= 1 then
        return
    end
    self:updateSingleData(message.explore)
    G_SignalManager:dispatch(SignalConst.EVENT_EXPLORE_GET_REWARD,message.explore)
end



return ExploreData
