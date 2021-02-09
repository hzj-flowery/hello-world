
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceGuessResultMultipleNode = class("UniverseRaceGuessResultMultipleNode", ViewBase)
local UniverseRaceGuessResultMultipleCell = require("app.scene.view.universeRace.UniverseRaceGuessResultMultipleCell")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")

function UniverseRaceGuessResultMultipleNode:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceGuessResultMultipleNode", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	UniverseRaceGuessResultMultipleNode.super.ctor(self, resource)
end

function UniverseRaceGuessResultMultipleNode:onCreate()
	self._isShow = false
end

function UniverseRaceGuessResultMultipleNode:onEnter()
    
end

function UniverseRaceGuessResultMultipleNode:onExit()
    
end

function UniverseRaceGuessResultMultipleNode:setShow(show)
	self._isShow = show
end

function UniverseRaceGuessResultMultipleNode:updateInfo()
	local listData, totalNum, correctNum = UniverseRaceDataHelper.getMultipleGuessResultList()
	self:_updateCount(totalNum, correctNum)
	self:_updateList(listData)
end

function UniverseRaceGuessResultMultipleNode:_updateCount(totalNum, correctNum)
	self._textGuessCount:setString(correctNum.."/"..totalNum)
end

function UniverseRaceGuessResultMultipleNode:_updateList(listData)
	self._listView:removeAllChildren()
	
	for i, data in ipairs(listData) do
        local item = UniverseRaceGuessResultMultipleCell.new(data)
		self._listView:pushBackCustomItem(item)
	end
end

return UniverseRaceGuessResultMultipleNode