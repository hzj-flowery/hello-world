
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceGuessAwardCell = class("UniverseRaceGuessAwardCell", ListViewCellBase)

local IMAGE_TOP_RES = {
	[1] = "img_large_ranking01",
	[2] = "img_large_ranking02",
	[3] = "img_large_ranking03",
}
local IMAGE_COMMON_RES = {
	[0] = "img_com_board_list02a",
	[1] = "img_com_board_list02b",
}
local COLOR_TITLE = {
	[1] = cc.c3b(0xd4, 0x23, 0x00),
	[2] = cc.c3b(0xd6, 0x6f, 0x00),
	[3] = cc.c3b(0xcd, 0x06, 0xff),
	[4] = Colors.NORMAL_BG_ONE,
}

function UniverseRaceGuessAwardCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceGuessAwardCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceGuessAwardCell.super.ctor(self, resource)
end

function UniverseRaceGuessAwardCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	cc.bind(self._awardsListview, "CommonListViewLineItem")
	self._awardsListview:setMaxItemSize(3)
    self._awardsListview:setListViewSize(700, 100)
end

function UniverseRaceGuessAwardCell:update(data, index)
	if index <= 3 then
		self._imageBg:setScale9Enabled(false)
		self._imageBg:loadTexture(Path.getComplexRankUI(IMAGE_TOP_RES[index]))
		self._textCount:setColor(COLOR_TITLE[index])
	else
		self._imageBg:setScale9Enabled(true)
		self._imageBg:setCapInsets(cc.rect(1, 1, 1, 1))
		self._imageBg:loadTexture(Path.getUICommon(IMAGE_COMMON_RES[index%2]))
		self._textCount:setColor(COLOR_TITLE[4])
	end
	local count = data.count
	local awards = data.awards
	self._textCount:setString(Lang.get("universe_race_guess_correct_count", {count = count}))
	self._awardsListview:updateUI(awards, 1)
end

return UniverseRaceGuessAwardCell