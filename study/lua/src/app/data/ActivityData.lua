--管理各种福利活动
--@Author:Conley

local BaseData = require("app.data.BaseData")
local CommonConst = require("app.const.CommonConst")
local ActivityConst = require("app.const.ActivityConst")
local ActAdmin = require("app.config.act_admin")
local ActivityData = class("ActivityData", BaseData)

local schema = {}
schema["lastSelectTabIndex"]  	= {"number", 0}--保存活动页面上次选中的标签索引
schema["lastSelectActId"] 	= {"number",0}--保存活动页面上次选中活动ID
ActivityData.schema = schema

function ActivityData:ctor(properties)
	ActivityData.super.ctor(self, properties)
end

-- 清除
function ActivityData:clear()
end

-- 重置
function ActivityData:reset()
	self:setLastSelectTabIndex(0)
	self:setLastSelectActId(0)
end

--通过ID返回相应活动数据
function ActivityData:getActivityDataById(activityId)
	if activityId == ActivityConst.ACT_ID_MONTHLY_CARD then--月卡
		return G_UserData:getActivityMonthCard()
	elseif activityId == ActivityConst.ACT_ID_SIGNIN then--签到
		return G_UserData:getActivityDailySignin()
	elseif activityId == ActivityConst.ACT_ID_DINNER then--宴会
		return G_UserData:getActivityDinner()
	elseif activityId == ActivityConst.ACT_ID_OPEN_SERVER_FUND then--基金
		return G_UserData:getActivityOpenServerFund()
	elseif activityId == ActivityConst.ACT_ID_LUXURY_GIFT_PKG then--超级礼包
		return G_UserData:getActivityLuxuryGiftPkg()
	elseif activityId == ActivityConst.ACT_ID_WEEKLY_GIFT_PKG then--周礼包
		return G_UserData:getActivityWeeklyGiftPkg()
	elseif activityId == ActivityConst.ACT_ID_MONEY_TREE then--摇钱树
		return G_UserData:getActivityMoneyTree()
	elseif activityId == ActivityConst.ACT_ID_LEVEL_GIFT_PKG then--摇钱树
		return G_UserData:getActivityLevelGiftPkg()
	elseif activityId == ActivityConst.ACT_ID_RECHARGE_REBATE then--充值返利
		return G_UserData:getRechargeRebate()
	elseif activityId == ActivityConst.ACT_ID_BETA_APPOINTMENT then--公告预约
		return G_UserData:getActivityBetaAppointment()
	elseif activityId == ActivityConst.ACT_ID_RESROUCE_BACK then -- 资源找回
		return G_UserData:getActivityResourceBack()
	elseif  activityId == ActivityConst.ACT_ID_SUPER_CHECKIN then -- 五谷丰登
		return  G_UserData:getActivitySuperCheckin()
	elseif activityId > ActivityConst.ACT_ID_OPEN_SERVER_FUND  then	--基金1,2,3,4,5,6
		return G_UserData:getActivityOpenServerFund()

	end
	return nil
end

--返回开启的活动数据列表
--@return:排好序
function ActivityData:getOpenActivityDataList()
	return nil
end

--返回开启活动的配置列表
function ActivityData:_createOpenActCfgListFromConfig()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local cfgList = {}
	local length = ActAdmin.length()

	local actOpenCheckFunc = function(cfg)
		return cfg.is_work == CommonConst.TRUE_VALUE and
			( cfg.function_id  == 0 and true or FunctionCheck.funcIsOpened(cfg.function_id ) )
	end

	local appstoreVerifyFilterFunc = function(cfg)
		if G_ConfigManager:isAppstore()  then
			if cfg.show_control == ActivityConst.SHOW_ONLY_IN_NORMAL then
				return false
			end
		else
			if cfg.show_control == ActivityConst.SHOW_ONLY_IN_APPSTORE then
				return false
			end
		end
		return true
	end

	for i = 1,length,1 do
		local cfg = ActAdmin.indexOf(i)
		if actOpenCheckFunc(cfg) then
			if ActivityConst.ACT_ID_LEVEL_GIFT_PKG == cfg.id then
				local datas = G_UserData:getActivityLevelGiftPkg():getListViewData()
				if G_ConfigManager:isAppstore() then
					--送审版本中  取消全部领取完不显示的功能
					if appstoreVerifyFilterFunc(cfg) then
						table.insert(cfgList,cfg)
					end
				else
					if #datas > 0 then
						if appstoreVerifyFilterFunc(cfg) then
							table.insert(cfgList,cfg)
						end
					end
				end
			else
				if appstoreVerifyFilterFunc(cfg) then
					table.insert(cfgList,cfg)
				end

			end
		end
	end
	table.sort(cfgList, function(act1, act2)
		return act1.order < act2.order

	end)

	return cfgList
end

function ActivityData:getOpenActivityCfgList()
	return self:_createOpenActCfgListFromConfig()
end

function ActivityData:hasActivityData(activityId)
	local activityData = self:getActivityDataById(activityId)
	if not activityData then
		return false
	end
	return activityData:getBaseActivityData():isHasData()
end

--通过ID，拉取对应活动服务器数据
function ActivityData:pullActivityData(activityId)
	local activityData = self:getActivityDataById(activityId)
	if not activityData then
		return
	end
	if activityData.pullData and type(activityData.pullData) == 'function' then
		activityData:pullData()
	end

end

function ActivityData:hasRedPoint()
	local actCfg = self:getOpenActivityCfgList()
	for k,v in ipairs(actCfg) do
		local actData = self:getActivityDataById(v.id)
		local red =  actData:hasRedPoint()
		if red then
			return true
		end
	end
	return false
end

function ActivityData:hasRedPointForSubAct(actId)
	local actData = self:getActivityDataById(actId)
	if actId > ActivityConst.ACT_ID_OPEN_SERVER_FUND then	 --基金1,2,3,4,5,6
		local UserDataHelper = require("app.utils.UserDataHelper")
		return actData:hasRedPointByFundGroup(UserDataHelper.getFundGroupByFundActivityId(actId))
	end
	return actData:hasRedPoint()
end

return ActivityData
