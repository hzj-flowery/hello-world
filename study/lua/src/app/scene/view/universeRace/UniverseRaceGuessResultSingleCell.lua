
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceGuessResultSingleCell = class("UniverseRaceGuessResultSingleCell", ListViewCellBase)
local UniverseRaceGuessResultCell = require("app.scene.view.universeRace.UniverseRaceGuessResultCell")

function UniverseRaceGuessResultSingleCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceGuessResultSingleCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceGuessResultSingleCell.super.ctor(self, resource)
end

function UniverseRaceGuessResultSingleCell:onCreate()
	local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    self._base = UniverseRaceGuessResultCell.new(self._baseCell)
end

function UniverseRaceGuessResultSingleCell:update(info, index)
    self._base:update(info, index)

    local isCorrect = info.isCorrect
	local resName = isCorrect and "img_answer_02" or "img_answer_02b"
	self._imageGuessResult:loadTexture(Path.getAnswerImg(resName))
end

return UniverseRaceGuessResultSingleCell