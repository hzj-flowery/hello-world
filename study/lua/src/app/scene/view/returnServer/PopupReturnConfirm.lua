---------------------------------------------------------------------
-- Created by: liangxu
-- Date: 2020-02-19 11:09:05
-- 回归服确认弹框
---------------------------------------------------------------------
local PopupBase = require("app.ui.PopupBase")
local PopupReturnConfirm = class("PopupReturnConfirm", PopupBase)
local UserDataHelper = require("app.utils.UserDataHelper")

function PopupReturnConfirm:ctor()
	local resource = {
		file = Path.getCSB("PopupReturnConfirm", "returnServer"),
		binding = {
			_btnCancel = {
				events = {{event = "touch", method = "_onClickCancel"}}
			},
			_btnOK = {
				events = {{event = "touch", method = "_onClickOk"}}
			}
		}
	}
	PopupReturnConfirm.super.ctor(self, resource, false)
end

--
function PopupReturnConfirm:onCreate()
	self._btnOK:setString(Lang.get("return_server_confirm_btn_ok"))

	local serverName = G_GameAgent:getLoginServer():getName()
	self._textServer:setString(serverName)
	
	self:_updateView()
end

--
function PopupReturnConfirm:onEnter()
	self._signalCheckInSuccess = G_SignalManager:add(SignalConst.EVENT_RETURN_CHECK_IN_SUCCESS, handler(self, self._onEventCheckInSuccess))
end

function PopupReturnConfirm:onExit()
	self._signalCheckInSuccess:remove()
	self._signalCheckInSuccess = nil
end

function PopupReturnConfirm:_updateView()
	local isCan = G_GameAgent:isCanReturnServer()
	local curLevel = G_UserData:getBase():getLevel()
	local tempLevel = UserDataHelper.getParameter(G_ParameterIDConst.BACK_CONFIRM_LV)
	if isCan then
		self._node1:setVisible(true)
		self._node2:setVisible(false)
		self._btnOK:setVisible(true)
		if curLevel >= tempLevel then
			self._btnCancel:setString(Lang.get("return_server_confirm_btn_relogin"))
		else
			self._btnCancel:setString(Lang.get("return_server_confirm_btn_cancel"))
		end
	else
		self._node1:setVisible(false)
		self._node2:setVisible(true)
		self._btnOK:setVisible(false)
		self._btnCancel:setString(Lang.get("common_btn_sure"))
		self._btnCancel:setPositionX(342)
	end
end

--
function PopupReturnConfirm:_onClickOk()
	G_UserData:getBase():c2sCheckIn()
end

function PopupReturnConfirm:_onClickCancel()
	local curLevel = G_UserData:getBase():getLevel()
	local tempLevel = UserDataHelper.getParameter(G_ParameterIDConst.BACK_CONFIRM_LV)
	local returnSvr = G_UserData:getBase():getReturnSvr()
	if curLevel >= tempLevel and (returnSvr == nil) then -- 达到限制等级，且还没确认回归，强制返回登录界面
		G_GameAgent:returnToLogin()
	else
		self:close()
	end
end

function PopupReturnConfirm:_onEventCheckInSuccess()
	G_Prompt:showTip(Lang.get("return_server_comeback_welcome"))
	self:close()
end

return PopupReturnConfirm