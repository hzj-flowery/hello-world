--
-- Author: Liangxu
-- Date: 2019-6-25
-- 蛋糕活动等级奖励Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local CakeLevelAwardCell = class("CakeLevelAwardCell", ListViewCellBase)
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
local CakeActivityConst = require("app.const.CakeActivityConst")

function CakeLevelAwardCell:ctor()
	local resource = {
		file = Path.getCSB("CakeLevelAwardCell", "cakeActivity"),
		binding = {
			_button = {
				events = {{event = "touch", method = "_onClick"}}
			},
		}
	}
	CakeLevelAwardCell.super.ctor(self, resource)
end

function CakeLevelAwardCell:onCreate()
	self._data = nil
	self._state = 0
	local size = self._panelBg:getContentSize()
	self:setContentSize(size.width, size.height)
end

function CakeLevelAwardCell:update(data, index)
	self._data = data
	local awards = data.awards
	local strLevel = Lang.get("cake_activity_level_award_level_text", {level = data.level}) 
	local state = data.state

	self._imageBg:setVisible(index%2 == 0)
	for i = 1, 4 do
		local award = awards[i]
		if award then
			self["_icon"..i]:setVisible(true)
			self["_icon"..i]:unInitUI()
			self["_icon"..i]:initUI(award.type, award.value, award.size)
		else
			self["_icon"..i]:setVisible(false)
		end
	end

	self._textLevel:setString(strLevel)

	self._button:setVisible(false)
	self._imageReceived:setVisible(false)
	if state == CakeActivityConst.AWARD_STATE_1 then
		self._button:setVisible(true)
		self._button:setString("")
		self._button:switchToNormal()
		self._imageLock:setVisible(true)
	elseif state == CakeActivityConst.AWARD_STATE_2 then
		self._button:setVisible(true)
		self._button:setString(Lang.get("common_receive"))
		self._button:switchToHightLight()
		self._imageLock:setVisible(false)
	elseif state == CakeActivityConst.AWARD_STATE_3 then
		self._imageReceived:setVisible(true)
	end
end

function CakeLevelAwardCell:_onClick()
	self:dispatchCustomCallback(1)
end

function CakeLevelAwardCell:getData()
	return self._data
end

return CakeLevelAwardCell