
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceGuessMultipleCell = class("UniverseRaceGuessMultipleCell", ListViewCellBase)
local UniverseRaceGuessCheckCell = require("app.scene.view.universeRace.UniverseRaceGuessCheckCell")

function UniverseRaceGuessMultipleCell:ctor(group, data, callback)
	self._group = group
	self._data = data
	self._callback = callback

	local resource = {
		file = Path.getCSB("UniverseRaceGuessMultipleCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceGuessMultipleCell.super.ctor(self, resource)
end

function UniverseRaceGuessMultipleCell:onCreate()
	self._rows = 0
	local width = 0
	local height = 0
	for index, info in ipairs(self._data) do
		local item = UniverseRaceGuessCheckCell.new(handler(self, self._onClick), index)
		width = item:getContentSize().width
		item:update(info)
		height = height + item:getContentSize().height
		self._listView:pushBackCustomItem(item)
		self._rows = self._rows + 1
	end
	local size = cc.size(width, height)
	self._listView:setContentSize(size)
	self._listView:setSwallowTouches(false)
	self._imageFrame:setContentSize(size)
	self:setContentSize(size)
end

function UniverseRaceGuessMultipleCell:onEnter()
	
end

function UniverseRaceGuessMultipleCell:onExit()

end

function UniverseRaceGuessMultipleCell:getRows()
	return self._rows
end

function UniverseRaceGuessMultipleCell:_onClick(key, indexInGroup, sideIndex, selected)
	if self._callback then
		local ret = self._callback(self._group, key, indexInGroup, sideIndex, selected)
		return ret
	end
end

return UniverseRaceGuessMultipleCell