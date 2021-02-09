--@Author:Conley
-- 节日狂欢活动也使用了
local BaseData = import(".BaseData")
local CustomActivityConst = require("app.const.CustomActivityConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CommonActivityQuestData = class("CommonActivityQuestData", BaseData)
local DataConst = require("app.const.DataConst")
local schema = {}
schema["quest_id"] 	= {"number", 0}--任务ID
schema["act_id"] 	= {"number", 0}--活动ID
schema["quest_type"] 	= {"number", 0}--任务类型
schema["param1"] 	= {"string", ""}--参数1
schema["param2"] 	= {"number", 0}--参数2
schema["param3"] 	= {"number", 0}--参数3
schema["award_select"] 	= {"number", 0}--奖励道具是否可选[可选奖励数来判断]
schema["award_limit"] 	= {"number", 0}--奖励限制次数[限制次数可能是其他值]
schema["server_limit"] 	= {"number", 0}--奖励全服限制次数
schema["server_times"] 	= {"number", 0}--奖励全服领取次数
schema["quest_des"] 	= {"string", 0}--任务描述
schema["discout_id"] 	= {"string", 0}--折扣标签
schema["sort_num"] 	    = {"number", 0}--排序索引
schema["show_limit_type"] 	    = {"number", 0}--显示限制
schema["show_limit_value"] 	    = {"number", 0}--显示限制

CommonActivityQuestData.schema = schema

function CommonActivityQuestData:ctor(properties)
	CommonActivityQuestData.super.ctor(self, properties)
    self._consumeItems = {}
    self._rewardItems = {}
    self._selectRewardItems = {}
	self._userDataSource = 0

end

-- 清除
function CommonActivityQuestData:clear()
end

-- 重置
function CommonActivityQuestData:reset()
end


function CommonActivityQuestData:initData(data)
     self:setProperties(data)
     self._consumeItems = self:_makeItems(data,"consume_",4)
     self._rewardItems = self:_makeItems(data,"award_",4)
     self._selectRewardItems = self:_makeItems(data,"select_award_",8)
end

function CommonActivityQuestData:_makeItems(data,keyName,maxNum)
    local itemsList = {}
    for k = 1,maxNum ,1 do
        local type = data[keyName.."type"..k]
        if type and type ~= 0 then
            local value = data[keyName.."value"..k]  or 0
            local size = data[keyName.."size"..k]  or 0
            table.insert(itemsList,{type = type,value = value, size  = size})
        end
    end
    return itemsList
end

--是否有可选奖励
function CommonActivityQuestData:isSelectReward()
	local items = self:getSelectRewardItems()
    return #items > 0
end

function CommonActivityQuestData:getDiscountNum()
	local discount = tonumber(self:getDiscout_id()) or 0
	return discount
end

function CommonActivityQuestData:isDiscountNeedShow(discount)
	return discount > 0 and discount < 10
end

function CommonActivityQuestData:getConsumeItems()
    return self._consumeItems
end

function CommonActivityQuestData:getRewardItems()
    return self._rewardItems
end

function CommonActivityQuestData:getSelectRewardItems()
    return self._selectRewardItems
end

--转换param1成Number值
--@return:转换失败返回0
function CommonActivityQuestData:getParamOneValue()
    return tonumber(self:getParam1()) or 0
end

--返回奖励最大领取次数
function CommonActivityQuestData:getAwardLimit()
	local limit = self:getAward_limit()
	local questType = self:getQuest_type()
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then
		limit = self:getParam2()
	end
	return limit
end

--返回任务进度的最大值
function CommonActivityQuestData:getQuestMaxValue()
	local value = self:getParamOneValue()
	local questType = self:getQuest_type()
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_ITEM then
		value = self:getParam3()
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then--单笔充值
		return 1--领取次数>=1任务算完成
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE then--限时贩售&物品兑换
		return 0--没有进度数据
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then	
		return 1
	end
    return value
end

function CommonActivityQuestData:getQuestValue(actUserData)
	if not actUserData then--没有进度数据，说明进度还没开始
		return 0
	end
	local questType = self:getQuest_type()
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then--单笔充值
		return  actUserData:getProgressValue() - actUserData:getAward_times() --可领取的次数
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE then--限时贩售&物品兑换
		return 0--没有进度数据
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then	
		return  actUserData:getProgressValue() - actUserData:getAward_times() --可领取的次数	
	end
	return actUserData:getProgressValue()
end

--检查全服次数限制
function CommonActivityQuestData:checkAllServerTimesLimit()
    local limit = self:getServer_limit()
    local currTimes = self:getServer_times()

    --检查次数 全服限制次数类型
    if limit > 0 and currTimes >= limit then
        return true
    end
     return false
end

--检查次数限制
function CommonActivityQuestData:checkTimesLimit(actUserData)
	if not actUserData then
		return false
	end
    local limit = self:getAwardLimit()
    local currTimes = actUserData:getAward_times()
    if limit > 0 and currTimes >= limit then
       return true
    end
    return false
end

--检查任务次数限制
function CommonActivityQuestData:checkQuestReceiveLimit()
	if self:checkAllServerTimesLimit() then
        return true
    end

	local actUserData = self:getActUserData()
    if  self:checkTimesLimit(actUserData) then
        return true
    end
    return false
end

--任务已经接受
function CommonActivityQuestData:isQuestHasReceive()
	local actUserData = self:getActUserData()
    if  self:checkTimesLimit(actUserData) then--次数已经领完
        return true
    end
    return false
end

--此任务是否能满足领取条件
function CommonActivityQuestData:isQuestReachReceiveCondition()
	local actUserData = self:getActUserData()
	local taskMaxValue = self:getQuestMaxValue()
	if self:getQuestValue(actUserData) >= taskMaxValue then
		return true
	end
	return false
end

function CommonActivityQuestData:getDescription()

	local taskDes = self:getQuest_des()
	local condition = ""
    local questType = self:getQuest_type()
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_ITEM then
		--物品收集[活动期间获取#name##num#个
		local good = TypeConvertHelper.convert(self:getParamOneValue() , self:getParam2(), self:getParam3())
		if good then
            condition = Lang.getTxt(taskDes,{name = good.name,num = good.size})
		end
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_CONSTANT_RECHARGE	then
        condition = Lang.getTxt(taskDes,{num1 = self:getParam1(),num2 = self:getParam2()})
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then
		condition = Lang.getTxt(taskDes,{num = self:getParam1()})
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE then--限时贩售&物品兑换
		--不显示描述
		condition = taskDes
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
		condition = taskDes
	else
		condition = self:getQuestMaxValue() > 0 and
            Lang.getTxt(taskDes,{num = self:getQuestMaxValue()}) or ""
	end
	return condition
end


function CommonActivityQuestData:isNeedShowProgress()
	return true
end

function CommonActivityQuestData:getProgressTitle()
    local questType = self:getQuest_type()
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then
		return Lang.get("customactivity_text_left_times")
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE then
		return Lang.get("customactivity_text_exchange_left_times")
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
		return Lang.get("customactivity_text_buy_left_times")
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
		return Lang.get("customactivity_text_left_times")
	end
    return Lang.get("customactivity_text_progress")
end

function CommonActivityQuestData:getButtonTxt()
    local buttonId = nil--self:getButton_id()
    local actType = self:getActType()
    local questType = self:getQuest_type()
    local btnName = nil
    if questType ==  CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE then
		btnName = Lang.get("customactivity_btn_name_exchange")
	elseif questType ==  CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
		local consumeItem = self._consumeItems[1]
		local num = consumeItem.size or 0
		btnName = num
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
   		local payId = self:getParam2()
		local VipPay = require("app.config.vip_pay")
		local payCfg = VipPay.get(payId)
		assert(payCfg,"vip_pay not find id "..tostring(payId))
   		btnName = Lang.get("customactivity_btn_name_pay",{value = payCfg.rmb})	
    elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY  then
		if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_GIFT or 
		   questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_TOTAL_CONSUME then
			btnName = Lang.get("customactivity_btn_name_receive") 
		else
			btnName = Lang.get("customactivity_btn_name_recharge") 
		end
    end
    return btnName or Lang.get("customactivity_btn_name_receive")
end


--@return：当前进度、最大值
function CommonActivityQuestData:getProgressValue()
    local questType = self:getQuest_type()

	local actUserData =  self:getActUserData()
	local value01 =  self:getQuestValue(actUserData) --当前进度
	local value02 = self:getQuestMaxValue()   --完成所需次数
	local onlyShowMax = false--只显示最大值

	local awardTimes = actUserData and actUserData:getAward_times() or 0    --已领取次数
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE 
	 or questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
		local value = actUserData and actUserData:getProgressValue() or 0
		value01 =  self:getAwardLimit() - awardTimes
		value02 = self:getAwardLimit()
		onlyShowMax = false
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE or 
	  questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
		value01 =  self:getAwardLimit() - awardTimes
		value02 = self:getAwardLimit()
		onlyShowMax = false
	
	end
	value01 =  value01 > value02 and value02 or value01
	return value01,value02,onlyShowMax
end
-- 兼容 节日狂欢活动
function CommonActivityQuestData:setUserDataSource(c)
	self._userDataSource = c
end

function CommonActivityQuestData:getActUserData()
	if self._userDataSource == CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL then
		return G_UserData:getCarnivalActivity():getActUserData(self:getAct_id(), self:getQuest_id())
	end
end

function CommonActivityQuestData:getActivityData()
	if self._userDataSource == CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL then
		return G_UserData:getCarnivalActivity():getActivityDataById(self:getAct_id())
	end
end
--- 后续新添加接口

-- 获取功能未达成 跳转functionID
function CommonActivityQuestData:getQuestNotFinishJumpFunctionID()
	local questType = self:getQuest_type()
	--充值
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_DAILY_RECHARGE or
		questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_TOTAL_RECHARGE  or
		questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE  or
		questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_CONSTANT_RECHARGE then
			return FunctionConst.FUNC_RECHARGE
	else
		return 0
	end
end

function CommonActivityQuestData:isExchageType()
	local activityData = self:getActivityData()
	if not activityData then
		return false
	end
	return activityData:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL
end

function CommonActivityQuestData:getActType()
	local activityData = self:getActivityData()
	if not activityData then
		return nil
	end
	return activityData:getAct_type()
end




function CommonActivityQuestData:isQuestCanReceive()
	local activityData = self:getActivityData()
	if not activityData then
		return false
	end

	if not activityData:checkActIsInReceiveTime() then
		return false
	end
	
	if self:checkQuestReceiveLimit() then
		return false
	end

	if not self:isQuestReachReceiveCondition() then
		return false
	end
	return true
end

--检测兑换类的 是否可以兑换
function CommonActivityQuestData:checkCanExchange(canPopDialog)
	local items = self:getConsumeItems()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local canBuy = true

	for k,v in ipairs(items) do
		if not LogicCheckHelper.enoughValue(v.type,v.value,v.size,canPopDialog) then
			canBuy = false
			break
		end
	end
	-- if not canBuy then
	-- 	G_Prompt:showTip(Lang.get("common_res_not_enough"))
	-- end
	return canBuy
end



function CommonActivityQuestData:isActivityExpired()
	local actData = self:getActivityData()
    if not actData then
        return true
    end
    return not actData:checkActIsVisible()
end

--返回Id
function CommonActivityQuestData:getId()
    return self:getQuest_id()
end

return CommonActivityQuestData

