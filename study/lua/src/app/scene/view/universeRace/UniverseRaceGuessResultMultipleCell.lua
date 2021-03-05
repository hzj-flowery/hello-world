
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceGuessResultMultipleCell = class("UniverseRaceGuessResultMultipleCell", ListViewCellBase)
local UniverseRaceGuessResultCell = require("app.scene.view.universeRace.UniverseRaceGuessResultCell")
local CSHelper = require("yoka.utils.CSHelper")

function UniverseRaceGuessResultMultipleCell:ctor(data)
    self._data = data
	local resource = {
		file = Path.getCSB("UniverseRaceGuessResultMultipleCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceGuessResultMultipleCell.super.ctor(self, resource)
end

function UniverseRaceGuessResultMultipleCell:onCreate()
	local width = 0
    local height = 0
    local index = 0
    for i, info in ipairs(self._data) do
        local node = CSHelper.loadResourceNode(Path.getCSB("UniverseRaceGuessResultCell", "universeRace"))
        local nodeInfo = UniverseRaceGuessResultCell.new(node)
        index = index + 1
		nodeInfo:update(info, index)
        local size = nodeInfo:getSize()
        local widget = ccui.Widget:create()
        widget:setContentSize(size)
        widget:addChild(node)
		width = size.width
		height = height + size.height
		self._listView:pushBackCustomItem(widget)
    end
    local size = cc.size(width, height)
    self._listView:setContentSize(size)
    self._listView:setSwallowTouches(false)
    self._imageFrame:setContentSize(size)
    self:setContentSize(size)

    local imageGuessResult = ccui.ImageView:create()
    local isCorrect = self._data.isCorrect
	local resName = isCorrect and "img_answer_02" or "img_answer_02b"
    imageGuessResult:loadTexture(Path.getAnswerImg(resName))
    imageGuessResult:setPosition(cc.p(897, height/2))
    self._imageFrame:addChild(imageGuessResult)
end

function UniverseRaceGuessResultMultipleCell:onEnter()
	
end

function UniverseRaceGuessResultMultipleCell:onExit()

end

return UniverseRaceGuessResultMultipleCell