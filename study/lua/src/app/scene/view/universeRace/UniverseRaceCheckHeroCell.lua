
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceCheckHeroCell = class("UniverseRaceCheckHeroCell", ListViewCellBase)

function UniverseRaceCheckHeroCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceCheckHeroCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceCheckHeroCell.super.ctor(self, resource)
end

function UniverseRaceCheckHeroCell:onCreate()
	local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    for i = 1, 3 do
        self["_checkBox"..i]:addEventListener(handler(self, self._onCheckBoxClicked))
        self["_checkBox"..i]:setSwallowTouches(false)
    end
end

function UniverseRaceCheckHeroCell:update(data1, data2, data3)
    local function updateUnit(data, index)
        if data then
            self["_item"..index]:setVisible(true)
            self["_nodeIcon"..index]:updateUI(data:getBase_id())
            self["_nodeName"..index]:setName(data:getBase_id())
            local isSelected = data.isSelected == true and true or false
            self["_checkBox"..index]:setSelected(isSelected)
        else
            self["_item"..index]:setVisible(false)
        end
    end
    updateUnit(data1, 1)
    updateUnit(data2, 1)
    updateUnit(data3, 1)
end

function UniverseRaceCheckHeroCell:_onCheckBoxClicked(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
    if offsetX < 20 and offsetY < 20  then
        local senderName = sender:getName()
        local index = string.match(senderName, "_checkBox(%d)")
        local selected = self["_checkBox"..index]:isSelected()
        local ret = self:dispatchCustomCallback(index, not selected)
        if ret then
            self["_checkBox"..index]:setSelected(not selected)
        end
	end
end

return UniverseRaceCheckHeroCell