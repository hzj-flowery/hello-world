local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceGuessRankCell = class("UniverseRaceGuessRankCell", ListViewCellBase)
local UIHelper = require("yoka.utils.UIHelper")

local IMAGE_COMMON_RES = {
	[0] = "img_com_board_list02a",
	[1] = "img_com_board_list02b",
}

function UniverseRaceGuessRankCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceGuessRankCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceGuessRankCell.super.ctor(self, resource)
end

function UniverseRaceGuessRankCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function UniverseRaceGuessRankCell:update(data, index)
	self._imageBg:setScale9Enabled(true)
	self._imageBg:setCapInsets(cc.rect(1, 1, 1, 1))
	self._imageBg:loadTexture(Path.getUICommon(IMAGE_COMMON_RES[index%2]))
	self._nodeRank:setRankType2(index)
	local serverName = require("app.utils.TextHelper").cutText(data:getServer_name(), 5)
	self._textServer:setString(serverName)
	self._textName:setString(data:getUser_name())
	local officialLevel = data:getOfficer_lv()
	self._textName:setColor(Colors.getOfficialColor(officialLevel))
	UIHelper.updateTextOfficialOutline(self._textName, officialLevel)
	self._textCount:setString(data:getSource())
end

return UniverseRaceGuessRankCell