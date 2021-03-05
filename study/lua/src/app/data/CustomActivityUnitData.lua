--@Author:Conley
local BaseData = import(".BaseData")
local CustomActivityConst = require("app.const.CustomActivityConst")
local CustomActivityUnitData = class("CustomActivityUnitData", BaseData)
local schema = {}
schema["act_id"] 	= {"number", 0}--活动ID
schema["act_type"] 	= {"number", 0}--活动类型
schema["icon_type"] 	= {"number", 0}--活动图标类型
schema["icon_value"] 	= {"number", 0}--活动图标
schema["icon_type_top_one"] 	= {"number", 0}	--活动图标类型
schema["icon_value_top_one"] 	= {"number", 0}	--活动图标
schema["icon_type_top_two"] 	= {"number", 0}	--活动图标类型
schema["icon_value_top_two"] 	= {"number", 0}	--活动图标
schema["icon_type_top_three"] 	= {"number", 0}	--活动图标类型
schema["icon_value_top_three"] 	= {"number", 0}	--活动图标
schema["title"] 	= {"string", ""}--活动标题
schema["sub_title"] 	= {"string", ""}--小标题
schema["desc"] 	= {"string", ""}--活动描述
schema["detail"] 	= {"string", ""}--活动描述
schema["preview_time"] 	= {"number", 0}--活动预览时间
schema["start_time"] 	= {"number", 0}--活动开始时间
schema["end_time"] 	= {"number", 0}--活动结束时间
schema["award_time"] 	= {"number", 0}--活动奖励领取结束时间

schema["button_id"] 	= {"number", 0}--未达成显示id

schema["min_vip"] 	= {"number", 0}--活动Vip等级限制
schema["max_vip"] 	= {"number", 0}--活动Vip等级限制
schema["min_level"] 	= {"number", 0}--活动用户等级限制
schema["max_level"] 	= {"number", 0}--活动用户等级限制

schema["show_schedule"] 	= {"number", 0}--是否显示进度
schema["batch"] = {"number", 0} -- 批次
schema["sort_num"] = {"number", 0} -- 排序字段

schema["last_act_visible"] = {"boolean", false} -- 缓存活动是否开启 【客户端字段】

CustomActivityUnitData.schema = schema

function CustomActivityUnitData:ctor(properties)
	CustomActivityUnitData.super.ctor(self, properties)
end

-- 清除
function CustomActivityUnitData:clear()
end

-- 重置

function CustomActivityUnitData:reset()
end

function CustomActivityUnitData:initData(data)
    self:setProperties(data)
end

function CustomActivityUnitData:isInTimeRange(minTime,maxTime)
	local time = G_ServerTime:getTime()
	 return time >= minTime and time < maxTime
end


function CustomActivityUnitData:isActInRunTime()
	local time = G_ServerTime:getTime()
	local startTime = self:getStart_time()
	local endTime = self:getEnd_time()
    if startTime == 0 or endTime == 0 or
        time < startTime or time > endTime then
        return false
    end
    return true
end

function CustomActivityUnitData:isActInRewardTime()
	local time = G_ServerTime:getTime()
	local startTime = self:getStart_time()
	local awardTime = self:getAward_time()
    if startTime == 0 or awardTime == 0 or
        time < startTime or time > awardTime then
        return false
    end
    return true
end

function CustomActivityUnitData:isActInPreviewTime()
    return self:isInTimeRange(self:getPreview_time(),self:getStart_time())
end

--检查活动是否在活动时间和领奖时间内
function CustomActivityUnitData:checkActIsInRunRewardTime()
    local time = G_ServerTime:getTime()
	local startTime = self:getStart_time()
	local endTime = self:getEnd_time()
    local awardTime = self:getAward_time()
    --领奖结束时间或活动结束时间为准
    awardTime = endTime > awardTime and endTime or awardTime
    if awardTime > time and startTime <= time then
        return true
    else
        return false
    end
end

--检查基金活动是否在活动时间和领奖时间内
function CustomActivityUnitData:checkActIsInRunFundsRewardTime(finishTime)
    local time = G_ServerTime:getTime()
	local startTime = self:getStart_time()
    --领奖结束时间或活动结束时间为准
    if finishTime > time and startTime <= time then
        return true
    else
        return false
    end
end

--检查等级和VIP等级是否达到Activity解锁条件
--返回是否解锁
function CustomActivityUnitData:checkActIsUnlock()
    local userVipLevel = G_UserData:getVip():getLevel()
    local userUserLevel = G_UserData:getBase():getLevel()


    local minVip = self:getMin_vip()
    local maxVip = self:getMax_vip()
    local minLevel = self:getMin_level()
    local maxLevel = self:getMax_level()

    --用户VIP等级达到要求
    local reachActVipLevel = (minVip == 0 or (minVip > 0 and userVipLevel >= minVip))
    reachActVipLevel = reachActVipLevel and (maxVip == 0 or (maxVip > 0 and userVipLevel <= maxVip))


    local reachActUserLevel = (minLevel == 0 or (minLevel > 0 and userUserLevel >= minLevel))
    reachActUserLevel = reachActUserLevel and (maxLevel == 0 or (maxLevel > 0 and userUserLevel <= maxLevel))

     return reachActVipLevel and reachActUserLevel
end


--检查活动是否可见
function CustomActivityUnitData:checkActIsVisible()
    local reachActVipLevel = self:checkActIsUnlock()
    if not reachActVipLevel then
        return false
    end
    return  self:isActInPreviewTime() or
        self:checkActIsInRunRewardTime()
end

-- @Role    检查基金活动是否可见
function CustomActivityUnitData:checkFundsActIsVisible(rewardedFinishTime)
    local reachActVipLevel = self:checkActIsUnlock()
    if not reachActVipLevel then
        return false
    end
    return  self:isActInPreviewTime() or
        self:checkActIsInRunFundsRewardTime(rewardedFinishTime)
end


--判断活动是否是兑换类型
function CustomActivityUnitData:isExchangeAct()
    return self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL
end


--判断活动是否是变身卡活动
function CustomActivityUnitData:isAvatarAct()
    return self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR
end

--判断活动是否是装备活动
function CustomActivityUnitData:isEquipAct()
    return self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP
end

--判断活动是否是神兽活动
function CustomActivityUnitData:isPetAct()
    return self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET
end

--判断活动是否是驯马活动
function CustomActivityUnitData:isHorseConquerAct()
    return self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER
end

--判断活动是否是VIP推送礼包活动
function CustomActivityUnitData:isVipRecommendGiftAct()
    return self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT
end

--判断活动是否是相马活动
function CustomActivityUnitData:isHorseJudgeAct()
    return self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE
end

--判断活动是否是基金活动
function CustomActivityUnitData:isFundsJudgeAct()
    return self:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS
end

function CustomActivityUnitData:getButtonTxt()
   local buttonId = self:getButton_id()
   local actType = self:getAct_type()
   local btnName = nil
   if actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL then
        btnName = Lang.get("customactivity_btn_name_exchange")
   else
        btnName = Lang.get("customactivity_btn_name_arr")[buttonId+1]
   end
   return btnName or Lang.get("customactivity_btn_name_receive")
end

function CustomActivityUnitData:getFunctionId()
    local FunctionConst = require("app.const.FunctionConst")
    local buttonId = self:getButton_id()

    if buttonId == CustomActivityConst.ACT_BUTTON_TYPE_RECEIVE_GRAY then--领取(灰色，无功能)
        return 0
    elseif buttonId == CustomActivityConst.ACT_BUTTON_TYPE_GO_RECHARGE then--去充值(跳转去充值)
        return FunctionConst.FUNC_RECHARGE
    end
    return 0
end

function CustomActivityUnitData:getTopBarItems()
    local items = {}
    local item01 = self:getIcon_type_top_one()
    local item02 = self:getIcon_type_top_two()
    local item03 = self:getIcon_type_top_three()
    if  item01 ~= 0 then
        table.insert( items, {type = item01,value = self:getIcon_value_top_one()} )
    end
    if item02 ~= 0 then
        table.insert( items, {type = item02,value = self:getIcon_value_top_two()} )
    end
    if item03 ~= 0 then
        table.insert( items, {type = item03,value = self:getIcon_value_top_three()} )
    end
    for i = #items+1,4,1 do
        table.insert( items, 1 ,{type = 0,value = 0})
    end
    return items
end

return CustomActivityUnitData
