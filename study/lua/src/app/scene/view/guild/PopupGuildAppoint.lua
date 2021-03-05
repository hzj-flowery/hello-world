--
-- Author: Liangxu
-- Date: 2017-06-26 17:23:23
-- 军团任命弹框
local PopupBase = require("app.ui.PopupBase")
local PopupGuildAppoint = class("PopupGuildAppoint", PopupBase)
local GuildConst = require("app.const.GuildConst")
local PopupSystemAlert = require("app.ui.PopupSystemAlert")
local UserDataHelper = require("app.utils.UserDataHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
function PopupGuildAppoint:ctor(uid, position)
	self._uid = uid
	self._position = position

	local resource = {
		file = Path.getCSB("PopupGuildAppoint", "guild"),
		binding = {

		}
	}
	PopupGuildAppoint.super.ctor(self, resource)
end

function PopupGuildAppoint:onCreate()
	self._panelBg:setTitle(Lang.get("guild_title_appoint"))
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))
	self._textDes:setString(Lang.get("guild_appoint_desc"))
end

function PopupGuildAppoint:onEnter()
	self._signalTransferLeaderSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_TRANSFER_LEADER_SUCCESS, handler(self, self._onEventGuildTransferLeaderSuccess))
	self._signalGuildPromoteSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, handler(self, self._onEventGuildPromoteSuccess))

	self:_updateButtonState()
end

function PopupGuildAppoint:onExit()
	self._signalTransferLeaderSuccess:remove()
	self._signalTransferLeaderSuccess = nil
	self._signalGuildPromoteSuccess:remove()
	self._signalGuildPromoteSuccess = nil
end

function PopupGuildAppoint:_updateButtonState()
	local btnCount = 0
	if self._position == GuildConst.GUILD_POSITION_2 then
		self._button1:setString(Lang.get("guild_btn_transfer_leader"))
		self._button1:addClickEventListenerEx(handler(self, self._onTransferLeader))
		self._button2:setString(Lang.get("guild_btn_recall"))
		self._button2:addClickEventListenerEx(handler(self, self._onRecall))
		btnCount = 2
	elseif self._position == GuildConst.GUILD_POSITION_3 then
		self._button1:setString(Lang.get("guild_btn_transfer_leader"))
		self._button1:addClickEventListenerEx(handler(self, self._onTransferLeader))
		self._button2:setString(Lang.get("guild_btn_appoint_mate"))
		self._button2:addClickEventListenerEx(handler(self, self._onAppointMate))
		self._button3:setString(Lang.get("guild_btn_recall"))
		self._button3:addClickEventListenerEx(handler(self, self._onRecall))
		btnCount = 3
	elseif self._position == GuildConst.GUILD_POSITION_4 then
		self._button1:setString(Lang.get("guild_btn_transfer_leader"))
		self._button1:addClickEventListenerEx(handler(self, self._onTransferLeader))
		self._button2:setString(Lang.get("guild_btn_appoint_mate"))
		self._button2:addClickEventListenerEx(handler(self, self._onAppointMate))
		self._button3:setString(Lang.get("guild_btn_appoint_elder"))
		self._button3:addClickEventListenerEx(handler(self, self._onAppointElder))
		btnCount = 3
	else
		logError(string.format("Guild's position is Wrong = %d", self._position))
	end

	if btnCount == 2 then
		self._button1:setVisible(true)
		self._button2:setVisible(true)
		self._button3:setVisible(false)
		self._button1:setPositionX(-95)
		self._button2:setPositionX(95)
	elseif btnCount == 3 then
		self._button1:setVisible(true)
		self._button2:setVisible(true)
		self._button3:setVisible(true)
		self._button1:setPositionX(-156)
		self._button2:setPositionX(0)
		self._button3:setPositionX(156)
	end
end

function PopupGuildAppoint:_onClickClose()
	self:close()
end

--移交团长
function PopupGuildAppoint:_onTransferLeader()
	local content = Lang.get("guild_appoint_confirm_leader_des")
	local title = Lang.get("guild_appoint_confirm_title")
	local function callbackOK()
		G_UserData:getGuild():c2sGuildTransfer(self._uid)
	end

	local popup = PopupSystemAlert.new(title, content, callbackOK)
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
end

--任命副团长
function PopupGuildAppoint:_onAppointMate()
	local content = Lang.get("guild_appoint_confirm_mate_des")
	local title = Lang.get("guild_appoint_confirm_title")
	local function callbackOK()
		local count = G_UserData:getGuild():getMateCount()
		if count >= UserDataHelper.getParameter(ParameterIDConst.GUILD_DEPUTY_NUM_ID) then
			G_Prompt:showTip(Lang.get("guild_tip_mate_max"))
			return
		end
		G_UserData:getGuild():c2sGuildPromote(self._uid, GuildConst.GUILD_POSITION_2)
	end

	local popup = PopupSystemAlert.new(title, content, callbackOK)
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
end

--任命长老
function PopupGuildAppoint:_onAppointElder()
	local content = Lang.get("guild_appoint_confirm_elder_des")
	local title = Lang.get("guild_appoint_confirm_title")
	local function callbackOK()
		local count = G_UserData:getGuild():getElderCount()
		if count >= UserDataHelper.getParameter(ParameterIDConst.GUILD_ELDER_NUM_ID)  then
			G_Prompt:showTip(Lang.get("guild_tip_elder_max"))
			return
		end
		G_UserData:getGuild():c2sGuildPromote(self._uid, GuildConst.GUILD_POSITION_3)
	end

	local popup = PopupSystemAlert.new(title, content, callbackOK)
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
end

--罢免职务
function PopupGuildAppoint:_onRecall()
	local content = Lang.get("guild_appoint_confirm_recall_des")
	local title = Lang.get("guild_appoint_confirm_title")
	local function callbackOK()
		G_UserData:getGuild():c2sGuildPromote(self._uid, GuildConst.GUILD_POSITION_4)
	end

	local popup = PopupSystemAlert.new(title, content, callbackOK)
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
end

function PopupGuildAppoint:_onEventGuildTransferLeaderSuccess(eventName, uid)
	G_Prompt:showTip(Lang.get("guild_tip_transfer_leader_success"))
	self:close()
end

function PopupGuildAppoint:_onEventGuildPromoteSuccess(eventName, uid, op)
	if op == GuildConst.GUILD_POSITION_4 then
		G_Prompt:showTip(Lang.get("guild_tip_recall_success"))
	else
		local positionName = UserDataHelper.getGuildDutiesName(op)
		G_Prompt:showTip(Lang.get("guild_tip_promote_success", {position = positionName}))
	end
	self:close()
end

return PopupGuildAppoint