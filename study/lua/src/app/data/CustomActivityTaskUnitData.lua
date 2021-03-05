--@Author:Conley
local BaseData = import(".BaseData")
local CustomActivityConst = require("app.const.CustomActivityConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CustomActivityTaskUnitData = class("CustomActivityTaskUnitData", BaseData)
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

CustomActivityTaskUnitData.schema = schema

function CustomActivityTaskUnitData:ctor(properties)
	CustomActivityTaskUnitData.super.ctor(self, properties)
    self._consumeItems = {}
    self._rewardItems = {}
    self._selectRewardItems = {}
end

-- 清除
function CustomActivityTaskUnitData:clear()
end

-- 重置
function CustomActivityTaskUnitData:reset()
end


function CustomActivityTaskUnitData:initData(data)
     self:setProperties(data)
     self._consumeItems = self:_makeItems(data,"consume_",4)
     self._rewardItems = self:_makeItems(data,"award_",4)
     self._selectRewardItems = self:_makeItems(data,"select_award_",8)

	 logWarn("---------------------- xxx")
	 dump(self._rewardItems)
	 logWarn("---------------------- xxx2")
end

function CustomActivityTaskUnitData:_makeItems(data,keyName,maxNum)
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

--返回类型
function CustomActivityTaskUnitData:getTaskType()
	return self:getQuest_type()
end

--返回Id
function CustomActivityTaskUnitData:getId()
    return self:getQuest_id()
end

--是否有可选奖励
function CustomActivityTaskUnitData:isSelectReward()
	local items = self:getSelectRewardItems()
    return #items > 0
end


function CustomActivityTaskUnitData:getDiscountNum()
	local discount = tonumber(self:getDiscout_id()) or 0
	return discount
end

function CustomActivityTaskUnitData:isDiscountNeedShow(discount)
	return discount > 0 and discount < 10
end

function CustomActivityTaskUnitData:getConsumeItems()
    return self._consumeItems
end

function CustomActivityTaskUnitData:getRewardItems()
    return self._rewardItems
end

function CustomActivityTaskUnitData:getSelectRewardItems()
    return self._selectRewardItems
end

--转换param1成Number值
--@return:转换失败返回0
function CustomActivityTaskUnitData:getParamOneValue()
    return tonumber(self:getParam1()) or 0
end

--返回奖励最大领取次数
function CustomActivityTaskUnitData:getAwardLimit()
	local limit = self:getAward_limit()
	local questType = self:getQuest_type()
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then
		limit = self:getParam2()
	end
	return limit
end

--返回任务进度的最大值
function CustomActivityTaskUnitData:getTaskMaxValue()
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

function CustomActivityTaskUnitData:getTaskValue(actTaskData)
	actTaskData =  actTaskData or  self:getUserTaskData()
	if not actTaskData then--没有进度数据，说明进度还没开始
		return 0
	end
	local questType = self:getQuest_type()
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then--单笔充值
		return  actTaskData:getProgressValue() - actTaskData:getAward_times() --可领取的次数
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE then--限时贩售&物品兑换
		return 0--没有进度数据
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then	
		return  actTaskData:getProgressValue() - actTaskData:getAward_times() --可领取的次数		
	end
	return actTaskData:getProgressValue()
end

--检查全服次数限制
function CustomActivityTaskUnitData:isHasAllServerTimesLimit()
    local limit = self:getServer_limit()
    local currTimes = self:getServer_times()

    --检查次数 全服限制次数类型
    if limit > 0 and currTimes >= limit then
        return true
    end
     return false
end

--检查次数限制
function CustomActivityTaskUnitData:isHasTimesLimit(userTaskData)
	if not userTaskData then
		--服务器没有任务数据，说明此任务还没有进度
		return false
	end
    local limit = self:getAwardLimit()
    local currTimes = userTaskData:getAward_times()
    if limit > 0 and currTimes >= limit then
       return true
    end
    return false
end


--检查任务次数限制
function CustomActivityTaskUnitData:isHasTaskReceiveLimit(actTaskData)
	
	if self:isHasAllServerTimesLimit() then
        return true
    end
    if self:isHasTimesLimit(actTaskData) then
        return true
    end

    return false
end

--任务已经领取
function CustomActivityTaskUnitData:isTaskHasReceive(actTaskData)
    if self:isHasTimesLimit(actTaskData) then
        return true
    end
    return false
end

--此任务是否能满足领取条件
function CustomActivityTaskUnitData:isTaskReachReceiveCondition(actTaskData)
	if not actTaskData then
		--服务器没有任务数据，说明此任务还没有进度
		return false
	end
	local taskMaxValue = self:getTaskMaxValue()

	if self:getTaskValue(actTaskData) >= taskMaxValue then
		
		return true
	end
	return false
end

function CustomActivityTaskUnitData:getDescription()

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
		condition = self:getTaskMaxValue() > 0 and
            Lang.getTxt(taskDes,{num = self:getTaskMaxValue()}) or ""
	end
	return condition
end

function CustomActivityTaskUnitData:getProgressTitle()
    local questType = self:getQuest_type()
	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then
		return Lang.get("customactivity_text_left")
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE then
		return Lang.get("customactivity_text_left")
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
		return Lang.get("customactivity_text_left_times")	
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
		return Lang.get("customactivity_text_buy_left_times")
	end
    return Lang.get("customactivity_text_progress")
end

function CustomActivityTaskUnitData:getButtonTxt()
    local buttonId = self:getButtonId()
    local actType = self:getActType()
    local questType = self:getQuest_type()
    local btnName = nil
    if actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL then
		if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
			local consumeItem = self._consumeItems[1]
			local num = consumeItem.size or 0
			btnName = num
		else
			btnName = Lang.get("customactivity_btn_name_exchange")
		end
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
   		local payId = self:getParam2()
		local VipPay = require("app.config.vip_pay")
		local payCfg = VipPay.get(payId)
		assert(payCfg,"vip_pay not find id "..tostring(payId))
   		btnName = Lang.get("customactivity_btn_name_pay",{value = payCfg.rmb})	
    elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY  then
		if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_GIFT then
			btnName = Lang.get("customactivity_btn_name_receive") 
		else
			btnName = Lang.get("customactivity_btn_name_recharge") 
		end
    else
		btnName = Lang.get("customactivity_btn_name_arr")[buttonId+1]	   
    end
  
   return btnName or Lang.get("customactivity_btn_name_receive")
end

function CustomActivityTaskUnitData:getFunctionId()
    local buttonId = self:getButtonId()

    if buttonId == CustomActivityConst.ACT_BUTTON_TYPE_RECEIVE_GRAY then--领取(灰色，无功能)
        return 0
    elseif buttonId == CustomActivityConst.ACT_BUTTON_TYPE_GO_RECHARGE then--去充值(跳转去充值)
        return FunctionConst.FUNC_RECHARGE
    end
    return 0
end


--@return：当前进度、最大值
function CustomActivityTaskUnitData:getProgressValue()
    local questType = self:getQuest_type()

	local actTaskData =  self:getUserTaskData()

	local value01 =  self:getTaskValue(actTaskData) --当前进度
	local value02 = self:getTaskMaxValue()   --完成所需次数
	local onlyShowMax = false--只显示最大值

	local awardTimes = actTaskData and actTaskData:getAward_times() or 0    --已领取次数

	if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE 
	   or questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
		local value = actTaskData and actTaskData:getProgressValue() or 0
		logWarn("------------------"..value)
		logWarn("------------------"..self:getAwardLimit())
		logWarn("------------------"..awardTimes)
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


function CustomActivityTaskUnitData:getUserTaskData()
	--if self._userDataSource == CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL then
		return G_UserData:getCustomActivity():getActTaskDataById(self:getAct_id(),self:getQuest_id())
	--end
end



function CustomActivityTaskUnitData:getActivityUnitData()
	--if self._userDataSource == CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL then
		return G_UserData:getCustomActivity():getActUnitDataById(self:getAct_id())
	--end
end

function CustomActivityTaskUnitData:getActType()
	local activityData = self:getActivityUnitData()
	if not activityData then
		return 0
	end
	return activityData:getAct_type()
end

function CustomActivityTaskUnitData:getButtonId()
	local activityData = self:getActivityUnitData()
	if not activityData then
		return 0
	end
	return activityData:getButton_id()
end

return CustomActivityTaskUnitData
