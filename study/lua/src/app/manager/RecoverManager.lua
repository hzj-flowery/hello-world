
-- RecoverManager.lua

--[[
	自动回复数据单元
	指的是某个固定数据的自动回复数据单元
]]

local SchedulerHelper = require "app.utils.SchedulerHelper"

local recoverCfg = require("app.config.recover")

local RecoverUnit = class("RecoverUnit")

local PrioritySignal = require("yoka.event.PrioritySignal")

local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

RecoverUnit.UNIT_VIT    = { id = DataConst.RES_VIT, resId = DataConst.RES_VIT } --体力回复
RecoverUnit.UNIT_SPIRIT = { id = DataConst.RES_SPIRIT, resId = DataConst.RES_SPIRIT }  --精力回复
RecoverUnit.UNIT_TOWER_COUNT = { id = DataConst.RES_TOWER_COUNT, resId = DataConst.RES_TOWER_COUNT }    --爬塔次数回复
RecoverUnit.UNIT_TOKEN = { id = DataConst.RES_TOKEN, resId = DataConst.RES_TOKEN }  --剿匪令牌
RecoverUnit.UNIT_ARMY_FOOD = {id = DataConst.RES_ARMY_FOOD, resId = DataConst.RES_ARMY_FOOD }        --兵粮 
RecoverUnit.UNIT_MINE_TOKEN = {id = DataConst.RES_MINE_TOKEN, resId = DataConst.RES_MINE_TOKEN}     --矿战战斗令牌

function RecoverUnit:ctor( recoverType )
	-- 回复数据时长，即多久回复一次
    self._resId     = recoverType.resId
    self._unitId    = recoverType.id

    self._unitInfo = recoverCfg.get(self._unitId)
    assert(self._unitInfo, "app.cfg.recover can't find unit by id "..self._unitId)
    
    local remainTime = UserDataHelper.getRefreshTime(self._resId) - G_ServerTime:getTime()
	self._recoverTime = self._unitInfo.recover_time
    -- 总剩余时间
    self._remainTime = remainTime
    logWarn("RecoverUnit:ctor remainTime : "..remainTime)
	-- 计时器handler
	self._scheduleHandler = nil

    self._count = 0
	-- 开始计时
	self:_start()
end

function RecoverUnit:_start()
  -- 计数器直接去取余
    local currValue = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, self._resId)

    if currValue >= self._unitInfo.time_limit then
        return
    end
    
    -- 开始计时
	self._scheduleHandler = SchedulerHelper.newSchedule(function()
        local recoverTime = self._unitInfo.recover_time
        local remainTime = UserDataHelper.getRefreshTime(self._resId) - G_ServerTime:getTime()
        --出现负数时，客户端数值累积会非常快
        if remainTime < 0 then
            return
        end
        self._count = ( recoverTime - (remainTime % recoverTime)) % recoverTime + 1
        --logWarn( string.format( "RecoverUnit:SchedulerHelper() _count: %d  recoverTime: %d" , self._count , recoverTime ))
  
		if  remainTime % recoverTime == 0 then

            self:_onRecover()
            --记录客户端刷新日志
            local senderToServerTalbe  = {
                recoverTime = UserDataHelper.getRefreshTime(self._resId),
                serverTime = G_ServerTime:getTime(),
                currResId  = self._resId,
                currValue = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, self._resId),
                needAddValue = remainTime % recoverTime,
            }
           -- G_UserData:c2sClientLog(senderToServerTalbe)
		end
    end, 1)
end

function RecoverUnit:_onRecover()

    --获取原始值
    local recoverTime = self._unitInfo.recover_time
    local remainTime = UserDataHelper.getRefreshTime(self._resId) - G_ServerTime:getTime()

    local currValue = UserDataHelper.getServerRecoverNum(self._resId)
    -- 累积添加值 = 总值 - 时间流逝值 - 服务器原值
    local addValue =  self._unitInfo.time_limit - math.ceil( remainTime / recoverTime ) - currValue
    -- 最终累积值 = 原值 + 累积添加值
    currValue = currValue + addValue
    
    if currValue <= self._unitInfo.time_limit then       
        UserDataHelper.updateRecorverNum(self._resId, currValue)
    end
   

    --抛出事件
    G_SignalManager:dispatch(SignalConst.EVENT_RECV_RECOVER_INFO,"From RecoverManager")
    
    logWarn( string.format( "RecoverUnit:_onRecover() resId: %d  currValue: %d" , self._resId, currValue ))
    if currValue >= self._unitInfo.time_limit then
        self:stop()
    end
end

function RecoverUnit:stop()
	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
	end
	self._scheduleHandler = nil
end

function RecoverUnit:isRunning()
	return checkbool(self._scheduleHandler)
end

--[[
    返回当前单位内剩余时间
    比如6分钟为一单位，已经走了3分钟，则返回剩余3分钟
    @return 返回剩余时间，单位秒
]]

function RecoverUnit:getRemainCount()
    local count = self._count or 0
    return self._unitInfo.recover_time - count
end

function RecoverUnit:getMaxLimit()
    return self._unitInfo.time_limit
end

function RecoverUnit:getResId()
    return self._resId
end

function RecoverUnit:getConfig()
    return self._unitInfo
end
--[[
	自动回复管理类
	主要管理一些自动回复的数据的管理，比如体力，精力，降妖令等
]]

local RecoverManager = class("RecoverManager")
RecoverManager.INDEX_VIT = 1
RecoverManager.INDEX_SPIRIT = 2
RecoverManager.INDEX_TOWER_COUNT = 3
RecoverManager.INDEX_TOKEN = 4

function RecoverManager:ctor()

	-- 每个回复单元数据
	self._recoverUnits = {
	}

	-- 监听user数据更新
    self._signalRecvRecoverInfo = G_SignalManager:add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(self, self._onUserDataUpdate))
    --self._signalUserDataUpdate = G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO,    handler(self, self._onUserDataUpdate))

    self:reset()
end


function RecoverManager:clear()
	for i=1, #self._recoverUnits do
		local recoverUnit = self._recoverUnits[i]
		recoverUnit:stop()
	end
	self._recoverUnits = {}
end


function RecoverManager:reset()
    -- 先清除原来的值
    self:clear()

    -- 体力，精力，爬塔次数，剿匪令牌
    self._recoverUnits[1] = RecoverUnit.new(RecoverUnit.UNIT_VIT )
    self._recoverUnits[2] = RecoverUnit.new(RecoverUnit.UNIT_SPIRIT )
    self._recoverUnits[3] = RecoverUnit.new(RecoverUnit.UNIT_TOWER_COUNT )
    self._recoverUnits[4] = RecoverUnit.new(RecoverUnit.UNIT_TOKEN)
    self._recoverUnits[5] = RecoverUnit.new(RecoverUnit.UNIT_ARMY_FOOD)
    self._recoverUnits[6] = RecoverUnit.new(RecoverUnit.UNIT_MINE_TOKEN)
end

--获取某个类型的回复数据
function RecoverManager:getRecoverUnit(index)
    return self._recoverUnits[index]
end


--获取回复上限
function RecoverManager:getRecoverLimitByResId(resId)
    for i, unit in pairs(self._recoverUnits) do
        if unit:getResId() == resId then
            return unit:getMaxLimit()
        end
    end
    return 0
end

-- user数据更新
function RecoverManager:_onUserDataUpdate(_, param)

    -- 屏蔽掉我自己发的

	if param == "From RecoverManager" then return end

    
	-- 重置数据
	self:reset()

end

return RecoverManager