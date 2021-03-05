-- 
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceAwardPoolCell = class("UniverseRaceAwardPoolCell", ListViewCellBase)

local RES_INFO = {
    [1] = {bg = "img_pvp_jjc1", rank = "txt_pvp_jjcn1", color = cc.c3b(0xff, 0x5a, 0x00)},
    [2] = {bg = "img_pvp_jjc2", rank = "txt_pvp_jjcn2", color = cc.c3b(0xc3, 0x13, 0xd7)},
    [3] = {bg = "img_pvp_jjc3", rank = "txt_pvp_jjcn3", color = cc.c3b(0x14, 0x7a, 0xb4)},
}

function UniverseRaceAwardPoolCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceAwardPoolCell", "universeRace"),
		binding = {
			
		}
	}
	UniverseRaceAwardPoolCell.super.ctor(self, resource)
end

function UniverseRaceAwardPoolCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function UniverseRaceAwardPoolCell:update(num, rate, index)
    local info = RES_INFO[index]
    self._imageBg:loadTexture(Path.getPvpUniverseImage(info.bg))
    self._imageRank:loadTexture(Path.getPvpUniverseText(info.rank))
    self._textDesc:setString(Lang.get("universe_race_guess_reward_pot_rate", {rate = rate}))
    self._textDesc:setColor(info.color)
    self._textNum:setString(num)
    self._textNum:setColor(info.color)
end

return UniverseRaceAwardPoolCell