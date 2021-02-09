
-- Author: nieming
-- Date:2018-05-09 10:39:42
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local RankUnitCell = class("RankUnitCell", ListViewCellBase)


function RankUnitCell:ctor()

	--csb bind var name
	self._imageBg = nil  --ImageView
	self._imageRank = nil  --ImageView
	self._textGuildName = nil  --Text
	self._textHurt = nil  --Text
	self._textRank = nil  --Text

	local resource = {
		file = Path.getCSB("RankUnitCell", "countryboss"),

	}
	RankUnitCell.super.ctor(self, resource)
end

function RankUnitCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

end

function RankUnitCell:updateUI(data, index)
	-- body
	if not data then
		return
	end
	if index and index % 2 == 0 then
        -- self._imageBg:setVisible(true)
        self._imageBg:loadTexture(Path.getUICommon("img_com_board_list01b"))
        self._imageBg:setContentSize(cc.size(248,44))
	-- else
	-- 	self._imageBg:setVisible(false)
	end
	
	local hurtRate = data:getHurt_rate()
	if not index and hurtRate == 0 then
		self._textHurt:setString(Lang.get("country_boss_my_rank_empty"))
	else
		self._textHurt:setString(string.format("%s%%", hurtRate/10.0))
	end

	local rank = data:getRank()
	if rank >= 1 and rank <= 3 then
		self._imageRank:loadTexture(Path.getArenaUI("img_qizhi0"..rank))
		self._imageRank:setContentSize(cc.size(30,40))
		self._textRank:setVisible(false)
		self._imageRank:setVisible(true)
		self._textGuildName:setColor(Colors["COUNTRY_BOSS_RANK_COLOR"..rank])
		self._textHurt:setColor(Colors["COUNTRY_BOSS_RANK_COLOR"..rank])

	elseif rank == 0 then
		self._imageRank:setVisible(false)
		self._textRank:setVisible(false)

		self._textGuildName:setColor(Colors.BRIGHT_BG_ONE)
		self._textHurt:setColor(Colors.BRIGHT_BG_ONE)
	else
		self._textRank:setVisible(true)
		self._textRank:setString(rank)
		self._imageRank:setVisible(true)
		self._imageRank:loadTexture(Path.getArenaUI("img_qizhi04"))
		self._imageRank:setContentSize(cc.size(30,40))
		self._textGuildName:setColor(Colors.BRIGHT_BG_ONE)
		self._textHurt:setColor(Colors.BRIGHT_BG_ONE)
	end

	--dump(data)

	self._textGuildName:setString(data:getGuild_name())
end

return RankUnitCell
