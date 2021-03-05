
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceGuessCheckCell = class("UniverseRaceGuessCheckCell", ListViewCellBase)
local UniverseRaceGuessCell = require ("app.scene.view.universeRace.UniverseRaceGuessCell")
local UniverseRaceConst = require("app.const.UniverseRaceConst")

function UniverseRaceGuessCheckCell:ctor(callback, indexInGroup)
    self._callback = callback
    self._indexInGroup = indexInGroup --组内索引

	local resource = {
		file = Path.getCSB("UniverseRaceGuessCheckCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceGuessCheckCell.super.ctor(self, resource)
end

function UniverseRaceGuessCheckCell:onCreate()
	local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    self._base = UniverseRaceGuessCell.new(self._baseCell, handler(self, self._onClickLook), handler(self, self._onClickIcon))
    for i = 1, 2 do
        self["_checkBox"..i]:addEventListener(handler(self, self._onCheckBoxClicked))
        self["_checkBox"..i]:setSwallowTouches(false)
    end
end

function UniverseRaceGuessCheckCell:update(info)
    self._base:update(info)

    local function updateUnit(unit, index)
        self["_checkBox"..index]:setVisible(false)
        self["_imageVoted"..index]:setVisible(false)
        if unit.supportState == UniverseRaceConst.GUESS_STATE_1 then
			self["_checkBox"..index]:setVisible(true)
		elseif unit.supportState == UniverseRaceConst.GUESS_STATE_2 then
            self["_imageVoted"..index]:setVisible(true)
		end
	end

	for i = 1, 2 do
		local unit = info[i]
		updateUnit(unit, i)
	end
end

function UniverseRaceGuessCheckCell:_onClickLook()
    if self._callback then
        self._callback("look", self._indexInGroup)
    end
end

function UniverseRaceGuessCheckCell:_onClickIcon(sideIndex)
    if self._callback then
        self._callback("icon", self._indexInGroup, sideIndex)
    end
end

function UniverseRaceGuessCheckCell:_onCheckBoxClicked(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
    if offsetX < 20 and offsetY < 20  then
        local senderName = sender:getName()
        local sideIndex = tonumber(string.match(senderName, "_checkBox(%d)"))
        local selected = self["_checkBox"..sideIndex]:isSelected()
        if self._callback then
            local ret = self._callback("btn", self._indexInGroup, sideIndex, selected)
            if ret == true then
                self["_checkBox"..sideIndex]:setSelected(selected)
            elseif ret == false then
                self["_checkBox"..sideIndex]:setSelected(not selected)
            elseif ret == "switch" then
                for index = 1, 2 do
                    if index == sideIndex then
                        self["_checkBox"..index]:setSelected(selected)
                    else
                        self["_checkBox"..index]:setSelected(not selected)
                    end
                end
            end
        end
	end
end

return UniverseRaceGuessCheckCell