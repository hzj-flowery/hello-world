local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceGuessSingleCell = class("UniverseRaceGuessSingleCell", ListViewCellBase)
local UniverseRaceGuessCell = require ("app.scene.view.universeRace.UniverseRaceGuessCell")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function UniverseRaceGuessSingleCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceGuessSingleCell", "universeRace"),
		binding = {
			_buttonVote1 = {
				events = {{event = "touch", method = "_onButtonVoteClicked1"}}
            },
            _buttonVote2 = {
				events = {{event = "touch", method = "_onButtonVoteClicked2"}}
			},
		}
	}
	UniverseRaceGuessSingleCell.super.ctor(self, resource)
end

function UniverseRaceGuessSingleCell:onCreate()
	local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
	self._base = UniverseRaceGuessCell.new(self._baseCell, handler(self, self._onClickLook), handler(self, self._onClickIcon))
	for index = 1, 2 do
		self["_buttonVote"..index]:setString("")
		
	end
end

function UniverseRaceGuessSingleCell:update(info, costInfo)
    self._base:update(info)

    local function updateUnit(unit, index)
		self["_buttonVote"..index]:setVisible(false)
		self["_nodeCost"..index]:updateUI(costInfo.type, costInfo.value, costInfo.size)
		self["_imageVoted"..index]:setVisible(false)
		if unit.supportState == UniverseRaceConst.GUESS_STATE_1 then
			self["_buttonVote"..index]:setVisible(true)
			self["_buttonVote"..index]:setEnabled(true)
		elseif unit.supportState == UniverseRaceConst.GUESS_STATE_2 then
			self["_imageVoted"..index]:setVisible(true)
		elseif unit.supportState == UniverseRaceConst.GUESS_STATE_3 then
			self["_buttonVote"..index]:setVisible(true)
			self["_buttonVote"..index]:setEnabled(false)
		end
	end

	for i = 1, 2 do
		local unit = info[i]
		self["_unitData"..i] = unit
		updateUnit(unit, i)
	end
end

function UniverseRaceGuessSingleCell:_onClickLook()
    self:dispatchCustomCallback("look", 1)
end

function UniverseRaceGuessSingleCell:_onClickIcon(index)
    self:dispatchCustomCallback("icon", index)
end

function UniverseRaceGuessSingleCell:_onButtonVoteClicked1()
	self:dispatchCustomCallback("btn", 1)
end

function UniverseRaceGuessSingleCell:_onButtonVoteClicked2()
	self:dispatchCustomCallback("btn", 2)
end

return UniverseRaceGuessSingleCell