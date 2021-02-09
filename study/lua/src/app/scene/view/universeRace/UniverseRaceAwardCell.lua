
-- 
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceAwardCell = class("UniverseRaceAwardCell", ListViewCellBase)

local IMAGE_RES = {
    [1] = {txt = "txt_ranking01", icon = "icon_ranking01"},
    [2] = {txt = "txt_ranking02", icon = "icon_ranking02"},
}

local IMAGE_TOP_RES = {
	[1] = "img_large_ranking01",
	[2] = "img_large_ranking02",
	[3] = "img_large_ranking03",
}
local IMAGE_COMMON_RES = {
	[0] = "img_com_board_list01a",
	[1] = "img_com_board_list01b",
}
local COLOR_TITLE = {
	[3] = cc.c3b(0xcd, 0x06, 0xff),
}

function UniverseRaceAwardCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceAwardCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceAwardCell.super.ctor(self, resource)
end

function UniverseRaceAwardCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	cc.bind(self._awardsListview, "CommonListViewLineItem")
	self._awardsListview:setMaxItemSize(5)
    self._awardsListview:setListViewSize(700, 100)
end

function UniverseRaceAwardCell:update(data, index)
	if index <= 3 then
		self._imageBg:setScale9Enabled(false)
        self._imageBg:loadTexture(Path.getComplexRankUI(IMAGE_TOP_RES[index]))
	else
		self._imageBg:setScale9Enabled(true)
		self._imageBg:setCapInsets(cc.rect(1, 1, 1, 1))
		self._imageBg:loadTexture(Path.getUICommon(IMAGE_COMMON_RES[index%2]))
    end
    if index <= 2 then
        self._nodeRank:setVisible(true)
        self._textRank:setVisible(false)
        self._imageRankBg:loadTexture(Path.getComplexRankUI(IMAGE_RES[index].icon))
        self._imageRank:loadTexture(Path.getComplexRankUI(IMAGE_RES[index].txt))
    else
        self._nodeRank:setVisible(false)
        self._textRank:setVisible(true)
        self._textRank:setColor(COLOR_TITLE[index] or Colors.NORMAL_BG_ONE)
        self._textRank:setString(data.txt)
    end
	
	local awards = data.awards
	self._awardsListview:updateUI(awards, 1)
end

return UniverseRaceAwardCell