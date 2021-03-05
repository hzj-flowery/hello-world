
-- Author: nieming
-- Date:2018-01-31 16:28:05
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local RankListViewCell = class("RankListViewCell", ListViewCellBase)


function RankListViewCell:ctor()

	--csb bind var name
	self._imageBG = nil  --ImageView
	self._rank = nil  --CommonRankIcon
	self._textName = nil  --Text
	self._textScore = nil  --Text

	local resource = {
		file = Path.getCSB("RankListViewCell", "guildAnswer"),

	}
	RankListViewCell.super.ctor(self, resource)
end

function RankListViewCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)


end

function RankListViewCell:updateRankUI(noImageRank)
	local rank = self._data:getRank()

	if rank <= 3 and rank > 0 then
		self._imageBG:loadTexture(Path.getComplexRankUI("img_answer_ranking0"..rank))
		self._imageBGLight:setVisible(true)
	else
		if rank >= 4 and rank % 2 == 1 then
			-- self._imageBG:loadTexture(Path.getComplexRankUI("img_answer_ranking05"))
			self:updateImageView("_imageBG", {visible = true, texture = Path.getCommonRankUI("img_com_board_list01a") })
		elseif rank >= 4 and rank % 2 == 0 then
			-- self._imageBG:loadTexture(Path.getComplexRankUI("img_answer_ranking04"))
			self:updateImageView("_imageBG", {visible = true, texture = Path.getCommonRankUI("img_com_board_list01b")})
		end

		self._imageBGLight:setVisible(false)
	end
	self._rank:setVisible(true)
	if noImageRank then
		self._rank:setRankType3(rank)
		self._imageBG:setVisible(false)
	else
		self._rank:setRankType4(rank)
		self._imageBG:setVisible(true)
	end
	self._textName:setString(self._data:getName())
	self._textScore:setString(self._data:getPoint())
end

function RankListViewCell:updateUI(data, noImageRank)
	-- body
	if not data then
		return
	end
	self._data = data
	self:updateRankUI(noImageRank)
end

function RankListViewCell:setImageBgVisible(trueOrFalse)
	self._imageBG:setVisible(trueOrFalse)
end

function RankListViewCell:setScoreEmpty()
	self._textScore:setString(Lang.get("lang_guild_answer_rank_empty_score"))
	self._rank:setVisible(false)
end

return RankListViewCell
