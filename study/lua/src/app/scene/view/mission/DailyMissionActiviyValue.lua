
local ViewBase = require("app.ui.ViewBase")
local DailyMissionActiviyValue = class("DailyMissionActiviyValue", ViewBase)

local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")

local LINE_ICON_HEIGHT = 120
local LINE_ICON_WIDTH = 590

DailyMissionActiviyValue.MAX_VALUE = 107
DailyMissionActiviyValue.MAX_ITEM_VALUE = 100 -- 每间隔20活跃领取一个奖励，一共可领取5个
DailyMissionActiviyValue.PERCENT_POS = {
	[1] = {curr = 20, per = 17},
	[2] = {curr = 40, per = 36},
	[3] = {curr = 60, per = 55},
	[4] = {curr = 80, per = 74},
	[5] = {curr = 100, per = 93},
}
function DailyMissionActiviyValue:ctor()
	self._target = nil
	self._textCurActivity = nil --进度条数值
	local resource = {
		file = Path.getCSB("DailyMissionActiviyValue", "mission"),
	}
	DailyMissionActiviyValue.super.ctor(self, resource)
	self._iconList = {}
end

function DailyMissionActiviyValue:onCreate()


	for i=1, 5 do
		self:_updateNodeActivity(i)
	end


end

--
function DailyMissionActiviyValue:updateUI()
	self._activityItemList = G_UserData:getDailyMission():getDailyMissionDatas(true)

	self._activityServerData = G_UserData:getDailyMission():getActivityDatas()

	for i, value in ipairs(self._activityItemList) do
		self:_updateNodeActivity(i, value)
	end

	if self._activityServerData then
		self._textCurActivity:setString(self._activityServerData.value)
		self:setPercentValue(	self._activityServerData.value , DailyMissionActiviyValue.MAX_VALUE)
	else
		self._textCurActivity:setString(0)
		self:setPercentValue(	0 , DailyMissionActiviyValue.MAX_VALUE)
	end

end

--更新活跃值Icon
function DailyMissionActiviyValue:_updateNodeActivity(index, cfg)
	local nodeActivity = self:getSubNodeByName("Node_Activity"..index)
	if nodeActivity == nil or cfg == nil then
		return
	end

	local imageCheck = nodeActivity:getSubNodeByName("Image_check")
	local imageLine = nodeActivity:getSubNodeByName("Image_line")

	imageCheck:setVisible(false)

	local iconNode = nodeActivity:getSubNodeByName("CommonIconNode")
	cc.bind(iconNode, "CommonIconTemplate")
	iconNode:unInitUI()
	iconNode:initUI(cfg.reward_type,cfg.reward_value,cfg.reward_size)
	iconNode:removeLightEffect()
	local currValue = 0
	if self._activityServerData then
		currValue = self._activityServerData.value
	end
	nodeActivity:updateLabel("Text_activity", {text = Lang.get("lang_daily_mission_activity", {num = cfg.require_value})})

	if currValue >= cfg.require_value then
		nodeActivity:updateImageView("Image_arrow", {texture = Path.getUICommon("img_com_arrow02b")})
		imageLine:setVisible(true)
		if cfg.getAward == true then
			iconNode:setIconMask(true)
			imageCheck:setVisible(true)
		else
			--iconNode:setIconSelect(true)
			iconNode:setIconMask(false)
			iconNode:showLightEffect()
		end
	else
		nodeActivity:updateImageView("Image_arrow", {texture = Path.getUICommon("img_com_arrow02")})
		imageLine:setVisible(false)
		iconNode:setIconSelect(false)
		iconNode:setIconMask(false)
	end

	local function onIconClick(sender, iconParams)
		if currValue >= cfg.require_value then
			if cfg.getAward == false then
				G_UserData:getDailyMission():c2sGetDailyTaskAward(cfg.id)
				--G_NetworkManager:send(MessageIDConst.ID_C2S_GetDailyTaskAward, message)
				return
			end
		end
		dump(cfg.reward_value)
		local PopupItemInfo = require("app.ui.PopupItemInfo").new()
		PopupItemInfo:updateUI(cfg.reward_type, cfg.reward_value)
	    PopupItemInfo:openWithAction()
	end

	iconNode:setCallBack(onIconClick)
end


function DailyMissionActiviyValue:setPercentValue(curr, max)
	max = max or DailyMissionActiviyValue.MAX_VALUE

	local progress = self:getSubNodeByName("LoadingBar_vip_progress")

	if curr > 0 then
		local function getCurrPercent(curr)
			for i, value in ipairs(DailyMissionActiviyValue.PERCENT_POS) do
				if value.curr == curr then
					return value.per
				end
			end
			return 0
		end

		local currPer = getCurrPercent(curr)
		if currPer > 0 then
			progress:setPercent(currPer)
			return
		end
	end

	local percent = math.floor( curr / max * 100 )

	progress:setPercent(percent)
end



return DailyMissionActiviyValue
