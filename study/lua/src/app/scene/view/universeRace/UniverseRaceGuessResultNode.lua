local ViewBase = require("app.ui.ViewBase")
local UniverseRaceGuessResultNode = class("UniverseRaceGuessResultNode", ViewBase)
local UniverseRaceGuessResultSingleCell = require("app.scene.view.universeRace.UniverseRaceGuessResultSingleCell")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")

function UniverseRaceGuessResultNode:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceGuessResultNode", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	UniverseRaceGuessResultNode.super.ctor(self, resource)
end

function UniverseRaceGuessResultNode:onCreate()
	self._isShow = false
end

function UniverseRaceGuessResultNode:onEnter()
    
end

function UniverseRaceGuessResultNode:onExit()
    
end

function UniverseRaceGuessResultNode:setShow(show)
	self._isShow = show
end

function UniverseRaceGuessResultNode:updateInfo()
	local listData, totalNum, correctNum = UniverseRaceDataHelper.getSingleGuessResultList()
	self:_updateCount(totalNum, correctNum)
	self:_updateList(listData)
end

function UniverseRaceGuessResultNode:_updateCount(totalNum, correctNum)
	self._textGuessCount:setString(correctNum.."/"..totalNum)
end

function UniverseRaceGuessResultNode:_updateList(listData)
	self._listView:removeAllChildren()
	
	for i, data in ipairs(listData) do
		local item = nil
		if data.isLine == true then
			item = ccui.ImageView:create()
			item:loadTexture(Path.getUICommon("img_com_board_list01c"))
			item:setContentSize(944, 2)
			item:setAnchorPoint(cc.p(0, 0))
		else
			item = UniverseRaceGuessResultSingleCell.new()
			item:update(data, i)
		end
		
		self._listView:pushBackCustomItem(item)
	end
end

return UniverseRaceGuessResultNode