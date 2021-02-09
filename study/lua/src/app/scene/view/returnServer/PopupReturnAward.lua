---------------------------------------------------------------------
-- Created by: liangxu
-- Date: 2020-02-18 14:35:06
-- 回归服-返利弹框
---------------------------------------------------------------------
local PopupBase = require("app.ui.PopupBase")
local PopupReturnAward = class("PopupReturnAward", PopupBase)
local PopupReturnAwardCell = require("app.scene.view.returnServer.PopupReturnAwardCell")
local ReturnServerDataHelper = require("app.utils.data.ReturnServerDataHelper")

function PopupReturnAward:ctor()
	local resource = {
		file = Path.getCSB("PopupReturnAward", "returnServer"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			},	
		}
	}
	PopupReturnAward.super.ctor(self, resource)
end

function PopupReturnAward:onCreate()
	self._listView:setTemplate(PopupReturnAwardCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupReturnAward:onEnter()
	self._signalRecvBonusSuccess = G_SignalManager:add(SignalConst.EVENT_RETURN_RECV_BONUS_SUCCESS, handler(self, self._onEventRecvBonusSuccess))
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:setVipChangeTipDisable(true)
	self:_updateInfo()
	self:_updateList()
end

function PopupReturnAward:onExit()
	self._signalRecvBonusSuccess:remove()
	self._signalRecvBonusSuccess = nil
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:setVipChangeTipDisable(false)
end

function PopupReturnAward:_updateInfo()
	local vipMax, goldMax = G_UserData:getBase():getReturnAward()
	self._textMoney:setString(goldMax)
	self._textExp:setString(vipMax)
	
	local posX1 = self._textMoney:getPositionX()
	local width1 = self._textMoney:getContentSize().width
	local posX2 = posX1 + width1 - 4
	self._imageMoney:setPositionX(posX2)
	local width2 = self._imageMoney:getContentSize().width
	local posX3 = posX2 + width2 - 5
	self._textExp:setPositionX(posX3)
	local width3 = self._textExp:getContentSize().width
	local posX4 = posX3 + width3 - 4
	self._imageExp:setPositionX(posX4)
end

function PopupReturnAward:_updateList()
	self._listDatas = ReturnServerDataHelper.getReturnAwardList()
	self._listView:clearAll()
	self._listView:resize(#self._listDatas)
end

function PopupReturnAward:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._listDatas[index]
	if data then
		item:update(data)
	end
end

function PopupReturnAward:_onItemSelected(item, index)

end

function PopupReturnAward:_onItemTouch(index)
	local index = index + 1
	local data = self._listDatas[index]
	G_UserData:getBase():c2sRecvBonus(data.id)
end

function PopupReturnAward:_onEventRecvBonusSuccess(eventName, id, awards)
	self:_updateList()
	G_Prompt:showAwards(awards)
end

function PopupReturnAward:_onClickClose()
	self:close()
end

return PopupReturnAward