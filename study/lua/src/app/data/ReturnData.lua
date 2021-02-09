local BaseData = require("app.data.BaseData")
local ReturnActivity = require("app.config.return_activity")
local ReturnPrivilege = require("app.config.return_privilege")
local ReturnDiscount = require("app.config.return_discount")
local ReturnGifts = require("app.config.return_gift")
local ReturnConst = require("app.const.ReturnConst")
---------------------------------------------------------------------------------------------------------------------
-- Return数据集

local ReturnData = class("ReturnData", BaseData)

function ReturnData:ctor(properties)
    ReturnData.super.ctor(self, properties)
    
    self._dailyActivityCompleteInfo = {}      -- 每日豪礼
    self._dailyActivityAwardStatus = {}       -- 每日豪礼领奖情况
    self._privilegeUsedInfo = {}              -- 回归特权使用情况
    self._giftActivityCompleteInfo = {}       -- 回归福利活动
    self._discountActivityCompleteInfo = {}   -- 特权礼包

    self._end_time = 0

    self._emergency = true

    self._recharge = 0 -- 累计充值
    self._pay_id = 0 -- 等级直升需要购买的pay_id
    self._level = 0  -- 直升的等级


    self._recvGetReturnData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRegression, handler(self, self._s2cGetReturnInfo))
    self._recvBuyDiscountData = G_NetworkManager:add(MessageIDConst.ID_S2C_RegressionBuyDiscount, handler(self, self._s2cGetBuyDiscountInfo))
    self._recvLevelDirectUp = G_NetworkManager:add(MessageIDConst.ID_S2C_LevelDirect, handler(self, self._s2cLevelDirectUp))
    self._recvAwardsInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_ReceiveAwards, handler(self, self._s2cReceiveAwards))
    self._recvUpdateData = G_NetworkManager:add(MessageIDConst.ID_S2C_RegressionUpdate, handler(self, self._s2cUpdateReturnData))
end

function ReturnData:clear()
    self._recvGetReturnData:remove()
    self._recvGetReturnData = nil
    self._recvBuyDiscountData:remove()
    self._recvBuyDiscountData = nil
    self._recvLevelDirectUp:remove()
    self._recvLevelDirectUp = nil
    self._recvAwardsInfo:remove()
    self._recvAwardsInfo = nil
    self._recvUpdateData:remove()
    self._recvUpdateData = nil
end

function ReturnData:needShowRedPoint()
    local canGetDailyReward = self:canGetDailyActivityReward()
    local canGetDiscountReward = self:canGetDiscountReward()
    local canGetGiftReward = self:canGetGiftReward()

    return canGetDailyReward or canGetDiscountReward or canGetGiftReward
end

function ReturnData:getDailyActivityInfo()
    local info = {}

    dump(self._dailyActivityCompleteInfo)

    dump(self._dailyActivityAwardStatus)

    for k, v in pairs(self._dailyActivityCompleteInfo) do 
        for kk, vv in pairs(self._dailyActivityAwardStatus) do
            if v.id == vv.id then
                table.insert( info, 
                    {   
                        id = v.id, 
                        num = v.num,
                        status = vv.num,
                    } 
                )
            end
        end
    end

    --dump(info)

    local sortFunc = function (a, b)

        local ACanGet = 0
        if a.status == 0 then
            local configInfo = ReturnActivity.get(a.id)
            local maxTimes = configInfo.mission_time
            if a.num >= maxTimes then
                ACanGet = 1
            end
        end

        local BCanGet = 0
        if b.status == 0 then
            local configInfo = ReturnActivity.get(b.id)
            local maxTimes = configInfo.mission_time
            if b.num >= maxTimes then
                BCanGet = 1
            end
        end

        if ACanGet ~= BCanGet then
            return ACanGet > BCanGet
        end

        if a.status ~= b.status then
            if a.status == 1 then
                return false
            end

            if b.status == 1 then
                return true
            end
        end

        return a.id < b.id 
    end

    table.sort( info, sortFunc )

    return info
end

function ReturnData:canGetDailyActivityReward()
    local canGet = false
    local dailyActivityInfo = self:getDailyActivityInfo()

    for k, v in pairs(dailyActivityInfo) do
        local configInfo = ReturnActivity.get(v.id)
        if v.status == 0 and v.num >= configInfo.mission_time then
            canGet = true
            break
        end
    end

    return canGet
end

function ReturnData:getPrivilegeInfo()
    table.sort( self._privilegeUsedInfo, function (a, b) return a.id < b.id end )

    return self._privilegeUsedInfo
end

function ReturnData:canGetDiscountReward()
    local canGet = false

    for k, v in pairs(self._discountActivityCompleteInfo) do
        local configInfo = ReturnDiscount.get(v.id)
        if configInfo.reward_type == 2 then -- 累冲
            if self._recharge >= configInfo.price and v.num == 1 then   -- 已达成，未领取 
                canGet = true
                break
            end
        end
    end

    return canGet
end

function ReturnData:getDiscountInfo()
    -- dump(info)
    local discountInfo = {}
    local showRechargeInfo = nil

    --table.sort( self._discountActivityCompleteInfo, function (a, b) return a.id < b.id end )

    for k, v in pairs(self._discountActivityCompleteInfo) do
        local configInfo = ReturnDiscount.get(v.id)
        if configInfo.reward_type == 2 then -- 累冲
            if self._recharge >= configInfo.show_money then
                table.insert(discountInfo, v)
            end
        else
            table.insert(discountInfo, v)
        end
    end

    --dump(discountInfo)

    local sortFunc = function (a, b)
        if a.num ~= b.num then
            if a.num == 0 then
                return false
            end

            if b.num == 0 then
                return true
            end
        end

        return a.id < b.id 
    end

    table.sort( discountInfo, sortFunc )

    return discountInfo
end

function ReturnData:canGetGiftReward()
    local canGet = false

    for k, v in pairs(self._giftActivityCompleteInfo) do
        if v.num > 0 then
            canGet = true
            break
        end
    end

    return canGet
end

function ReturnData:getGiftsInfo()
    -- dump(info)
    local sortFunc = function (a, b)
        if a.num ~= b.num then
            if a.num == 0 then
                return false
            end

            if b.num == 0 then
                return true
            end
        end
        
        return a.id < b.id 
    end

    table.sort( self._giftActivityCompleteInfo, sortFunc )

    return self._giftActivityCompleteInfo
end

function ReturnData:getEndTime()
    return self._end_time
end

function ReturnData:getIsEmergency( )
    return self._emergency
end

function ReturnData:getRechargeNum()
    return self._recharge
end

function ReturnData:getDirectLevelPayId()
    return self._pay_id
end

function ReturnData:getDirectLevelNum()
    return self._level
end

function ReturnData:isActivityEnd()
    return G_ServerTime:getTime() > self._end_time
end

function ReturnData:getPrivilegeRestTimes(type)
    local isRegression = G_UserData:getBase():isIs_regression()
    if isRegression == false then
        return 0
    end

    local times = 0

    for k, v in pairs(self._privilegeUsedInfo) do
        local configInfo = ReturnPrivilege.get(v.id)
        if configInfo.privilege_type == type then
            times = v.num
            break
        end
    end

    return times
end

function ReturnData:getTowerResetTimes()
    local isRegression = G_UserData:getBase():isIs_regression()
    if isRegression == false then
        return 0
    end

    local times = 0

    for k, v in pairs(self._privilegeUsedInfo) do
        local configInfo = ReturnPrivilege.get(v.id)
        if configInfo.privilege_type == ReturnConst.PRIVILEGE_TOWER then
            times = v.num
            break
        end
    end

    return times
end

function ReturnData:getDailyChallengeResetTimes()
    local isRegression = G_UserData:getBase():isIs_regression()
    if isRegression == false then
        return 0
    end

    local times = 0

    for k, v in pairs(self._privilegeUsedInfo) do
        local configInfo = ReturnPrivilege.get(v.id)
        if configInfo.privilege_type == ReturnConst.PRIVILEGE_DAILY_CHALLANGE then
            times = v.num
            break
        end
    end

    return times
end

--------------------------------------------------------------------------------------------

function ReturnData:c2sGetReturnInfo()
	local message = {
    }
    
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetRegression, message)
end

function ReturnData:_s2cGetReturnInfo(id, message)
    if message.ret ~= 1 then
		return
    end
    
    dump(message)

    self._dailyActivityCompleteInfo = rawget(message, "activities") or {}
    self._dailyActivityAwardStatus = rawget(message, "activities_rewarded") or {}
    self._discountActivityCompleteInfo = rawget(message, "discount") or {}
    self._giftActivityCompleteInfo = rawget(message, "gifts") or {}
    self._privilegeUsedInfo = rawget(message, "privilege") or {}
    self._end_time = rawget(message, "end_time") or 0
    
    if rawget(message, "emergency") then
        self._emergency = rawget(message, "emergency")
    else
        self._emergency = true
    end

    self._recharge = rawget(message, "recharge") or 0
    self._pay_id = rawget(message, "pay_id") or 0

    self._level = rawget(message, "level") or 0

    --if self._emergency == true then
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RETURN)
    --end

    G_UserData:getRedPoint():resetRedPointTableByIndex(26)

    G_SignalManager:dispatch(SignalConst.EVENT_RETURN_ACTIVITY_INFO)
end

function ReturnData:_s2cGetBuyDiscountInfo(id, message)
    if message.ret ~= 1 then
		return
    end
    
    --dump(message)

    local awards = rawget(message, "awards") or {}
    local state = rawget(message, "state") or {}

    for k, v in pairs(self._discountActivityCompleteInfo) do 
        if v.id == state.id then
            v.num = state.num
            break
        end
    end

    G_SignalManager:dispatch(SignalConst.EVENT_RETURN_SHOW_REWARD, awards)
end

function ReturnData:c2sLevelDirectUp()
	local message = {
    }
    
	G_NetworkManager:send(MessageIDConst.ID_C2S_LevelDirect, message)
end

function ReturnData:_s2cLevelDirectUp(id, message)
    if message.ret ~= 1 then
		return
    end

    self._pay_id = rawget(message, "pay_id") or 0
    self._level = rawget(message, "level") or 0

    G_SignalManager:dispatch(SignalConst.EVENT_RETURN_LEVEL_DIRECT_UP)
end

function ReturnData:c2sReceiveAwards(receiveType, activityId, rewardIndex)
	local message = {
        receive_type = receiveType,
        id = activityId,
        index = rewardIndex or 0,
    }
    
	G_NetworkManager:send(MessageIDConst.ID_C2S_ReceiveAwards, message)
end

function ReturnData:_s2cUpdateReturnData(id, message)

    local privilegeInfo = rawget(message, "privilege")
    if privilegeInfo then
        for k, v in pairs(self._privilegeUsedInfo) do 
            if v.id == privilegeInfo.id then
                v.num = privilegeInfo.num
                break
            end
        end
    end

    G_SignalManager:dispatch(SignalConst.EVENT_RETURN_UPDATE)
end

function ReturnData:_s2cReceiveAwards(id, message)
    if message.ret ~= 1 then
		return
    end

    --dump(message)

    local awards = rawget(message, "awards") or {}
    local state = rawget(message, "state") or {}
    local receive_type = rawget(message, "receive_type") or -1
    local id = rawget(message, "id") or -1

    local function setRewardInfo(key, value)
        
    end

    -- receive_type 0 -活动完成奖励 1- 福利奖励 2- 重置任务 3- 累充奖励领取
    if receive_type == 0 then
        for k, v in pairs(self._dailyActivityAwardStatus) do 
            if v.id == state.id then
                v.num = state.num
                break
            end
        end
    elseif receive_type == 1 then
        for k, v in pairs(self._giftActivityCompleteInfo) do 
            if v.id == state.id then
                v.num = state.num
                break
            end
        end
    elseif receive_type == 2 then
        for k, v in pairs(self._privilegeUsedInfo) do 
            if v.id == state.id then
                v.num = state.num
                break
            end
        end

        local configInfo = ReturnPrivilege.get(state.id)
        if configInfo.privilege_type == 1 or configInfo.privilege_type == 2 then
            G_SignalManager:dispatch(SignalConst.EVENT_RETURN_RESET_TIMES)
        end
    elseif receive_type == 3 then
        for k, v in pairs(self._discountActivityCompleteInfo) do 
            if v.id == state.id then
                v.num = state.num
                break
            end
        end
    end

    G_SignalManager:dispatch(SignalConst.EVENT_RETURN_SHOW_REWARD, awards)
end

return ReturnData