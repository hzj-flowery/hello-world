local BaseData = require("app.data.BaseData")
local VipData = class("VipData", BaseData)
local VipLevelInfo = require("app.config.vip_level")
local VipFunctionInfo = require("app.config.vip_function")
local VipItemData = require("app.data.VipItemData")
local ParameterIDConst = require("app.const.ParameterIDConst")
local schema = {}
schema["level"] 		= {"number", 0}
schema["exp"] 			= {"number", 0}
VipData.schema = schema

VipData.PARAM_LIME_SHOW_KEY = 175
--

function VipData:c2sGetRecharge()
	local message = {
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetRecharge, message)
end

function VipData:ctor(properties)
	VipData.super.ctor(self, properties)

	self._msgGetVip = G_NetworkManager:add(MessageIDConst.ID_S2C_GetVip, handler(self, self._s2cGetVip))
	self._msgGetVipGift =  G_NetworkManager:add(MessageIDConst.ID_S2C_GetVipReward, handler(self, self._s2cGetVipGift))
	self._msgSyncVipGift = G_NetworkManager:add(MessageIDConst.ID_S2C_SendVipReward, handler(self, self._s2cGetVipGift))
    self._signalRechargeGetInfo = G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventRechargeGetInfo)) 
    self._msgJadeBiExcharge = G_NetworkManager:add(MessageIDConst.ID_S2C_JadeBiExcharge, handler(self, self._s2cJadeBiExcharge))    

	self._vipFuncDataList = nil --vip data数据列表
	self._serverVipRewardList = {} -- 服务器vip奖励数据
	self:_initVipCfg()
	self:_initData()
end

-- 清除
function VipData:clear()
    self._msgGetVip:remove()
    self._msgGetVip = nil
	self._msgSyncVipGift:remove()
	self._msgSyncVipGift =nil
	self._msgGetVipGift:remove()
	self._msgGetVipGift =nil

	self._signalRechargeGetInfo:remove()
    self._signalRechargeGetInfo = nil
    
    if self._msgJadeBiExcharge then
        self._msgJadeBiExcharge:remove()
        self._msgJadeBiExcharge = nil
    end

	self._vipFuncDataList = nil
end

-- 重置
function VipData:reset()
    self:_initVipCfg()
end


--
function VipData:_s2cGetVip(id, message)
	self:setProperties(message.vip)--self:updateData(message.vip)

end

function VipData:_s2cGetVipGift(id, message)
	if message.ret ~= 1 then
		return
	end
	local vipRewardList = rawget(message, "vip_reward") or {}

	self._serverVipRewardList = vipRewardList

	G_SignalManager:dispatch(SignalConst.EVENT_VIP_GET_VIP_GIFT_ITEMS, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_VIP_GIFT)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_RECHARGE)
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_VIP_GIFT)--通知VIP礼包入口按钮刷新
end

function VipData:_onEventRechargeGetInfo(event,id,message)
	--通知VIP礼包入口按钮刷新
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_VIP_GIFT)
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TSHIRT)--通知T恤入口按钮刷新
end


function VipData:_isGiftCanTake(currLevel)
	local playerVipLevel = G_UserData:getVip():getLevel()
	local currVipLevel =  currLevel
	local isRewardTake = self:isVipRewardTake(currVipLevel)

	if playerVipLevel >= currVipLevel and isRewardTake == false then

		return true
	end
	return false
end
function VipData:hasGiftInRightPage(vipLevel)
	if vipLevel == nil or vipLevel <= 0 then
		return false
	end
	local maxVipLv = G_UserData:getVip():getShowMaxLevel()
	if vipLevel > maxVipLv then
		return false
	end
	local pageInfo, currPage = self:getVipDataByLevel(vipLevel)

	if currPage == 0 or currPage > #self._dataList then
		return false
	end


	for i = currPage, #self._dataList do
		local value = self._dataList[i]
		local currVipLevel =  value:getId()
		if self:_isGiftCanTake(currVipLevel) then
			return true
		end
	end
	return false
end

--判定左边的翻页按钮是否还有红点
function VipData:hasGiftInLeftPage(vipLevel)
	if vipLevel == nil or vipLevel < 0 then
		return false
	end
	local pageInfo, currPage = self:getVipDataByLevel(vipLevel)
	if currPage == 0 or currPage > #self._dataList then
		return false
	end
	local playerVipLevel = G_UserData:getVip():getLevel()
	for i = 1, currPage do
		local value = self._dataList[i]
		local currVipLevel =  value:getId()
		if self:_isGiftCanTake(currVipLevel) then
			return true
		end
	end
	return false
end

--是否有vip礼包可购买
function VipData:hasVipGiftCanBuy()

	local playerVipLevel = G_UserData:getVip():getLevel()
	for i, value in ipairs(self._dataList) do
		local currVipLevel =  value:getId()
		if self:_isGiftCanTake(currVipLevel) then
			return true
		end
	end
	return false
end

--vip奖励是否领取
function VipData:isVipRewardTake(vipLevel)
	for i, value in ipairs(self._serverVipRewardList) do
		if value == vipLevel then
			return true
		end
	end
	return false
end


--
function VipData:updateData(data)
	self:backupProperties()
	self:setProperties(data)

	local getOldVipTotalExp = function()
		local totalVip = self:getVipTotalExp(0, self:getLastLevel())
		return   totalVip + self:getLastExp()
	end

	local addExp = self:getCurVipTotalExp() - getOldVipTotalExp()
	logWarn("---------------- "..tostring(addExp))
	G_SignalManager:dispatch(SignalConst.EVENT_VIP_EXP_CHANGE,addExp)
end


function VipData:_initVipCfg()
	self._vipFuncDataList = {}
	local vipCfg = require("app.config.vip_function")
	local len = vipCfg.length()
	for i=1,len do
		local info = vipCfg.indexOf(i)
		self._vipFuncDataList[tostring(info.type).."_"..tostring(info.vip)] = info
	end
end



--根据VIP管理的function id来获取当前的VIP等级的特权条目，见vip_function
--functionType
--isNextLevel 是否取是下一级
function VipData:getVipFunctionDataByType(functionType, isNextLevel)
	if self._vipFuncDataList == nil then
		self:_initVipCfg()
	end

    local vipLevel = self:getLevel()

    if isNextLevel then
        vipLevel = vipLevel + 1   --可能超过最大VIP等级 则会返回nil
    end

    return self._vipFuncDataList[tostring(functionType).."_"..tostring(vipLevel)]
end

-- 根据vip种类和等级 获取vip条目

function VipData:getVipFunctionDataByTypeLevel(functionType, functionLevel )
	
	if self._vipFuncDataList == nil then
		self:_initVipCfg()
	end

    return self._vipFuncDataList[tostring(functionType).."_"..tostring(functionLevel)]
end


function VipData:getVipList()
	return self._dataList
end

--获取最大vip等级
function VipData:getMaxLevel()
    return self._dataList[#self._dataList]:getInfo().level
end

--获取显示最大的VIP等级
function VipData:getShowMaxLevel()
	local Parameter = require("app.config.parameter")
	local limitShowLv = tonumber(Parameter.get(ParameterIDConst.VIP_LEVEL_MAX).content)
	return limitShowLv
end



function VipData:_initData()
	self._dataList = {}

	local count = VipLevelInfo.length()
	for i = 1, count do
		local vipLevelInfo = VipLevelInfo.indexOf(i)
		local vipItemData = VipItemData.new()
		vipItemData:setInfo(vipLevelInfo)
		self._dataList[#self._dataList + 1] = vipItemData
	end
end

function VipData:getVipDataByLevel(vipLevel)
	for i, value in ipairs(self._dataList) do
		if value:getId() == vipLevel then
			return value,i
		end
	end
	return nil,0
end

---获取当前VIP等级，可以使用的功能次数
function VipData:getVipTimesByFuncId(funcId)
	local currentValue = 0
	local maxValue = 0
	local currentVipLv = self:getLevel()
	for i = 1, VipFunctionInfo.length() do
		local vipFuncInfo = VipFunctionInfo.indexOf(i)
		if vipFuncInfo.type == funcId then
			local infoValue = vipFuncInfo.value
			if vipFuncInfo.vip == currentVipLv then
				currentValue = infoValue
			end
			if maxValue < infoValue then
				maxValue = infoValue
			end
		end
	end

	return currentValue, maxValue
end


function VipData:getVipFuncitonInfo(vipLevel)
	vipLevel = vipLevel or G_UserData:getVip():getLevel()
	--获取当前VIP等级的特权信息或者最接近当前VIP等级的特权信息
	local currentInfo = nil
	for i = 1 ,VipFunctionInfo.length() do
		local funcInfo = VipFunctionInfo.indexOf(i)
		if funcInfo.type == funcType then
			if funcInfo.level == vipLevel then
				currentInfo = funcInfo
				break
			end
			if currentInfo == nil then
				currentInfo = funcInfo
			end
		end
	end
	return currentInfo
end

function VipData:getVipTotalExp(minLv,maxLv)
	local exp = 0
	for i, value in ipairs(self._dataList) do
		if value:getId() >= minLv and value:getId() < maxLv then
			local curVipLvInfo = value:getInfo()
			exp = exp + curVipLvInfo.vip_exp
		end
	end
	return exp
end

function VipData:getCurVipTotalExp()
	local totalVip = self:getVipTotalExp(0, self:getLevel())
	return totalVip + self:getExp()
end

----------------------------------------------------------------------------------
function VipData:c2sJadeBiExcharge(jadeNum)
    -- body
    G_NetworkManager:send(MessageIDConst.ID_C2S_JadeBiExcharge, {gold = jadeNum})
end

function VipData:_s2cJadeBiExcharge(id, message)
    -- body
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    if rawget(message, "award") ~= nil then
        local awards = {}
        if not awards[1] then
            awards[1] = {}
        end
        awards[1] = message.award
        G_Prompt:showAwards(awards)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_DIAMOND_EXCHANGE)
end



return VipData
