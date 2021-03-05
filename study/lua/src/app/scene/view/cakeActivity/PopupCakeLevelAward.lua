--
-- Author: Liangxu
-- Date: 2019-6-25
-- 蛋糕活动等级奖励

local PopupBase = require("app.ui.PopupBase")
local PopupCakeLevelAward = class("PopupCakeLevelAward", PopupBase)
local CakeLevelAwardCell = require("app.scene.view.cakeActivity.CakeLevelAwardCell")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

function PopupCakeLevelAward:ctor(curLevel)
	self._curLevel = curLevel
	local resource = {
		file = Path.getCSB("PopupCakeLevelAward", "cakeActivity"),
		binding = {
			
		}
	}
	PopupCakeLevelAward.super.ctor(self, resource)
end

function PopupCakeLevelAward:onCreate()
	self._datas = {}
	local name = CakeActivityDataHelper.getFoodName()
	self._nodeBg:setTitle(Lang.get("cake_activity_level_award_title", {name = name}))
	self._nodeBg:addCloseEventListener(handler(self, self._onClickClose))
	self._listView:setTemplate(CakeLevelAwardCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupCakeLevelAward:onEnter()
	self._signalGetLevelUpReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_GET_LEVEL_UP_REWARD, handler(self, self._onEventGetLevelUpReward))
	self:_updateList()
end

function PopupCakeLevelAward:onExit()
	self._signalGetLevelUpReward:remove()
    self._signalGetLevelUpReward = nil
end

function PopupCakeLevelAward:_updateList()
	self._datas = CakeActivityDataHelper.getLevelAwardInfo(self._curLevel)
	self._listView:clearAll()
	self._listView:resize(#self._datas)
end

function PopupCakeLevelAward:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._datas[index]
	if data then
		item:update(data, index)
	end
end

function PopupCakeLevelAward:_onItemSelected(item, index)

end

function PopupCakeLevelAward:_onItemTouch(index, t)
	local data = self._datas[index+t]
	if data then
		G_UserData:getCakeActivity():c2sGetGuildCakeUpLvReward(data.level)
	end
end

function PopupCakeLevelAward:_onClickClose()
	self:close()
end

function PopupCakeLevelAward:_onEventGetLevelUpReward(eventName, awards, upRewardId)
	self._datas = CakeActivityDataHelper.getLevelAwardInfo(self._curLevel)
	G_Prompt:showAwards(awards)
	local itemList = self._listView:getItems()
	for i, cell in ipairs(itemList) do
		if cell:getData().level == upRewardId then
			local index = cell:getTag() + 1
			local data = self._datas[index]
			cell:update(data, index)
		end
	end
end

return PopupCakeLevelAward