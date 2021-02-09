-- Author: nieming
-- Date:2018-01-31 16:28:05
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildServerAnswerRankCell = class("GuildServerAnswerRankCell", ListViewCellBase)

local SELF_COLOR = cc.c3b(0x66, 0xe5, 0x00)
local DETAULT_COLOR = cc.c3b(0xff, 0xff, 0xff)
local RANK_COLOR = {
	[1] = cc.c3b(0xff, 0x19, 0x19),
	[2] = cc.c3b(0xff, 0xc6, 0x19),
	[3] = cc.c3b(0xff, 0x00, 0xff)
}

function GuildServerAnswerRankCell:ctor()
	--csb bind var name
	self._imageBg = nil --ImageView
	self._imageRank = nil
	self._textName = nil --Text
	self._textScore = nil --Text
	self._textRank = nil

	local resource = {
		file = Path.getCSB("GuildServerAnswerRankCell", "guildServerAnswer")
	}
	GuildServerAnswerRankCell.super.ctor(self, resource)
end

function GuildServerAnswerRankCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function GuildServerAnswerRankCell:updateRankUI(isSelf)
	local rank = self._data:getRank()
	if rank <= 3 and rank > 0 then
		self._imageRank:loadTexture(Path.getArenaUI("img_qizhi0" .. rank))
		self._textRank:setVisible(false)
	else
		self._imageRank:loadTexture(Path.getArenaUI("img_qizhi04"))
		self._textRank:setString(rank)
		self._textRank:setVisible(true)
	end
	if isSelf then
		self._textName:setColor(SELF_COLOR)
		self._textScore:setColor(SELF_COLOR)
	else
		self._textName:setColor(RANK_COLOR[rank] or DETAULT_COLOR)
		self._textScore:setColor(DETAULT_COLOR)
	end
	self._textName:setString(self._data:getName())
	self._textScore:setString(self._data:getPoint())
end

function GuildServerAnswerRankCell:updateUI(data, isSelf)
	-- body
	if not data then
		return
	end
	self._data = data
	self:updateRankUI(isSelf)
end

function GuildServerAnswerRankCell:setImageBg(res)
	self._imageBg:loadTexture(res)
end

function GuildServerAnswerRankCell:setImageVisible(visible)
	self._imageBg:setVisible(visible)
end

return GuildServerAnswerRankCell
