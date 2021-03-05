-- Description: 军团选择器cell
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-11
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupGrainCarGuildSelectorCell = class("PopupGrainCarGuildSelectorCell", ListViewCellBase)
local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")


function PopupGrainCarGuildSelectorCell:ctor()
	local resource = {
		file = Path.getCSB("PopupGrainCarGuildSelectorCell", "grainCar"),
		binding = {
			_touchPanel = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	PopupGrainCarGuildSelectorCell.super.ctor(self, resource)
end

function PopupGrainCarGuildSelectorCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

--{id, name, data}
function PopupGrainCarGuildSelectorCell:update(data)
	self._data = data
	
	self._guildName:setString(data.name)

	local isMyGuild = GrainCarDataHelper.isMyGuild(data.id)
	self._guildName:setColor(isMyGuild and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_RED)
end

function PopupGrainCarGuildSelectorCell:_onPanelClick()
	self:dispatchCustomCallback(self._data)
end

return PopupGrainCarGuildSelectorCell
