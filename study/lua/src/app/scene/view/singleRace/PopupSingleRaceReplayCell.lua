
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupSingleRaceReplayCell = class("PopupSingleRaceReplayCell", ListViewCellBase)
local SingleRaceReplayVSNode = require("app.scene.view.singleRace.SingleRaceReplayVSNode")

function PopupSingleRaceReplayCell:ctor()
	local resource = {
		file = Path.getCSB("PopupSingleRaceReplayCell", "singleRace"),
		binding = {
			
		}
	}
	PopupSingleRaceReplayCell.super.ctor(self, resource)
end

function PopupSingleRaceReplayCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._vsNode = SingleRaceReplayVSNode.new(self._nodeVS, handler(self, self._onClick))
end

function PopupSingleRaceReplayCell:update(replay, round, isLast)
	self._vsNode:updateUI(replay, round, isLast)
end

function PopupSingleRaceReplayCell:_onClick(reportId)
	self:dispatchCustomCallback(reportId)
end

return PopupSingleRaceReplayCell