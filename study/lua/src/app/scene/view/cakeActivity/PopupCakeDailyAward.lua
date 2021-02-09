--
-- Author: Liangxu
-- Date: 2019-6-21
-- 蛋糕活动每日奖励

local PopupBase = require("app.ui.PopupBase")
local PopupCakeDailyAward = class("PopupCakeDailyAward", PopupBase)
local CakeDailyAwardCell = require("app.scene.view.cakeActivity.CakeDailyAwardCell")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

function PopupCakeDailyAward:ctor(parentView)
	self._parentView = parentView
	local resource = {
		file = Path.getCSB("PopupCakeDailyAward", "cakeActivity"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			},
		}
	}
	PopupCakeDailyAward.super.ctor(self, resource)
end

function PopupCakeDailyAward:onCreate()
	self._datas = {}
	self._listView:setTemplate(CakeDailyAwardCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupCakeDailyAward:onEnter()
	self._signalGetDailyReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_GET_DAILY_REWARD, handler(self, self._onEventGetDailyReward))
	self._signalEnterSuccess = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS, handler(self, self._onEventEnterSuccess))
	self:_updateList()
end

function PopupCakeDailyAward:onExit()
	self._signalGetDailyReward:remove()
	self._signalGetDailyReward = nil
	self._signalEnterSuccess:remove()
    self._signalEnterSuccess = nil
end

function PopupCakeDailyAward:_updateList()
	self._datas = CakeActivityDataHelper.getDailyAwardInfo()
	self._listView:clearAll()
	self._listView:resize(#self._datas)
end

function PopupCakeDailyAward:_onItemUpdate(item, index)
	local data = self._datas[index + 1]
	if data then
		item:update(data)
	end
end

function PopupCakeDailyAward:_onItemSelected(item, index)

end

function PopupCakeDailyAward:_onItemTouch(index, t)
	local data = self._datas[index+t]
	if data then
		G_UserData:getCakeActivity():c2sGetGuildCakeLoginReward(data.day)
	end
end

function PopupCakeDailyAward:_onClickClose()
	self:close()
end

function PopupCakeDailyAward:_onEventGetDailyReward(eventName, awards)
	G_Prompt:showAwards(awards)
	self:_updateList()
	if self._parentView then
		self._parentView:updateDailyBtnRp()
	end
end

function PopupCakeDailyAward:_onEventEnterSuccess(eventName)
	self:_updateList()
end

return PopupCakeDailyAward