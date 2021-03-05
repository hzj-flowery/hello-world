
-- Author: nieming
-- Date:2018-02-16 16:17:13
-- Describle：

local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
-- local ViewBase = require("app.ui.ViewBase")
local BetaAppointmentView = class("BetaAppointmentView", ActivitySubView)
local ParameterConfig = require("app.config.parameter")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
function BetaAppointmentView:ctor()

	--csb bind var name
	self._actTitle = nil  --CommonFullScreen
	self._awardsParent1 = nil
	self._awardsParent2 = nil
	local resource = {
		file = Path.getCSB("BetaAppointmentView", "activity/betaAppointment"),
		binding = {
			_btnOrder = {
				events = {{event = "touch", method = "_onBtnOrder"}}
			},
		},

	}
	BetaAppointmentView.super.ctor(self, resource)
end

function BetaAppointmentView:_updateAwards(parentNode, awards, isNeedAddSecret)
	parentNode:removeAllChildren()
	local iconWidth = 86
	local curWidth = 0
	for k, v in ipairs(awards) do
		local icon = ComponentIconHelper.createIcon(v.type,v.value,v.size)
		icon:setTouchEnabled(true)
		icon:setScale(0.8)
		parentNode:addChild(icon)
		icon:setPositionX(curWidth)
		curWidth = curWidth + iconWidth
	end
	if isNeedAddSecret then
		self:_addSecretAward(parentNode, curWidth)
	end
end

--添加一个神秘奖励 策划说 不要污染item表  我恨策划 （一个悲伤的故事）
function BetaAppointmentView:_addSecretAward(parentNode, posx)
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local itemValue = 1
	local icon = ComponentIconHelper.createIcon(TypeConvertHelper.TYPE_ITEM, itemValue)
	icon:loadIcon(Path.getActivityRes("secretIcon"))
	icon:setPositionX(posx)
	icon:setTouchEnabled(true)
	icon:setScale(0.8)
	parentNode:addChild(icon)
	icon:setCallBack(function()
		local PopupItemInfo = require("app.ui.PopupItemInfo").new()
		PopupItemInfo:updateUI(TypeConvertHelper.TYPE_ITEM, itemValue)
		PopupItemInfo:setSecretUI()
		PopupItemInfo:openWithAction()
	end)
end

function BetaAppointmentView:_getAwards(id)
	local config = ParameterConfig.get(id)
	assert(config ~= nil, "can not find parameter id = "..(id or nil))
	local awardsString = config.content
	local awardsStringArr = string.split(config.content, ",")
	local awards = {}
	for k, v in ipairs(awardsStringArr) do
		local awardStr = string.split(v, "|")
		if #awardStr == 3 then
			local award = {
				type = tonumber(awardStr[1]),
				value = tonumber(awardStr[2]),
				size = tonumber(awardStr[3]),
			}
			table.insert(awards, award)
		end
	end
	return awards
end


function BetaAppointmentView:_getRequireLevel()
	local config = ParameterConfig.get(157)
	assert(config ~= nil, "can not find parameter id = 157")
	local level = tonumber(config.content) or 0
	return level
end
-- Describle：
function BetaAppointmentView:onCreate()
	local awards1 = self:_getAwards(155)
	local awards2 = self:_getAwards(156)
	self:_updateAwards(self._awardsParent1, awards1)
	self:_updateAwards(self._awardsParent2, awards2, true)

end

function BetaAppointmentView:_refreshBtnState()
	local isAlreadyOrder = G_UserData:getBase():getOrder_state()
	if isAlreadyOrder ~= 0 then
		self._alreadyOrder:setVisible(true)
		self._btnOrder:setVisible(false)
	else
		self._alreadyOrder:setVisible(false)
		self._btnOrder:setVisible(true)
		local curLevel = G_UserData:getBase():getLevel()
		local requireLevel = self:_getRequireLevel()
		if requireLevel > curLevel then
			self._btnOrder:setString(Lang.get("lang_activity_beta_appointment_btn_level", {level = requireLevel}))
		else
			self._btnOrder:setString(Lang.get("lang_activity_beta_appointment_btn"))
		end
	end
end

function BetaAppointmentView:_onBtnOrder()
	local curLevel = G_UserData:getBase():getLevel()
	local requireLevel = self:_getRequireLevel()

	if requireLevel > curLevel then
		G_Prompt:showTip(Lang.get("lang_activity_beta_appointment_btn_level", {level = requireLevel}))
		return
	end

	local PopupInput = require("app.ui.PopupInput")
	local popup = PopupInput.new(function(name)
		local length = string.len(name)
		local num = tonumber(name)
		if  length == 11 and num then
			G_UserData:getActivityBetaAppointment():c2sCommonPhoneOrder(name)
		else
			G_Prompt:showTip(Lang.get("lang_activity_beta_appointment_phone_error"))
			return true
		end
	end,nil, Lang.get("lang_activity_beta_appointment_phone_title"), Lang.get("lang_activity_beta_appointment_phone_tips"),
	 Lang.get("lang_activity_beta_appointment_phone_tips"),Lang.get("lang_activity_beta_appointment_phone_placeholder"),
	 11,Lang.get("lang_activity_beta_appointment_phone_error"))
	popup:setBtnOkName(Lang.get("lang_activity_beta_appointment_phone_ok"))

	popup:openWithAction()

end

function BetaAppointmentView:_onEventGetAwards(event, awards)
	G_Prompt:showTip(Lang.get("lang_activity_beta_appointment_success"), function()
		if awards then
			G_Prompt:showAwards(awards)
		end
	end)
	self:_refreshBtnState()
end

-- Describle：
function BetaAppointmentView:onEnter()
	self:_refreshBtnState()
	self._signalGetReward = G_SignalManager:add(SignalConst.EVENT_COMMON_PHONE_ORDER_SUCCESS, handler(self, self._onEventGetAwards))
end

-- Describle：
function BetaAppointmentView:onExit()
	self._signalGetReward:remove()
	self._signalGetReward = nil
end

return BetaAppointmentView
