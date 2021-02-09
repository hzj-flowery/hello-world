
-- Author: nieming
-- Date:2018-04-23 17:38:36
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local SelectQualityNode = class("SelectQualityNode", ViewBase)


function SelectQualityNode:ctor(colorQuality)

	--csb bind var name
	self._checkBox = nil  --CheckBox
	self._selectTitle = nil  --Text
	self._colorQuality = colorQuality
	local resource = {
		file = Path.getCSB("SelectQualityNode", "sell"),

	}
	SelectQualityNode.super.ctor(self, resource)
end

-- Describle：
function SelectQualityNode:onCreate()
	-- self._checkBox:addEventListener(handler(self, self._onCheckBox))
	local color = Colors.COLOR_QUALITY[self._colorQuality]
	if color then
		self._selectTitle:setString(Lang.get("lang_sellfragmentselect_quality_"..self._colorQuality))
		self._selectTitle:setColor(color)
	end
end

-- Describle：
function SelectQualityNode:onEnter()

end

-- Describle：
function SelectQualityNode:onExit()

end

function SelectQualityNode:isSelected()
	return self._checkBox:isSelected()
end

function SelectQualityNode:getColorQuality()
	return self._colorQuality
end

return SelectQualityNode
