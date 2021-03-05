--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕活动军团Icon

local CakeGuildIcon = class("CakeGuildIcon")
local UTF8 = require("app.utils.UTF8")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

local RES_INFO = {
	[1] = {
		bgRes = "img_guild_ranking01", 
		rankRes = "img_ranking_01", 
		textRes = "txt_ranking01", 
		color = cc.c3b(0xff, 0xfc, 0xb1), 
		outlineColor = cc.c4b(0xff, 0x98, 0x04, 0xff),
		color2 = cc.c3b(0xff, 0xd8, 0x00),
		scale = 1.0,
	},
	[2] = {
		bgRes = "img_guild_ranking02", 
		rankRes = "img_ranking_02", 
		textRes = "txt_ranking02", 
		color = cc.c3b(0xd6, 0xe4, 0xff), 
		outlineColor = cc.c4b(0x62, 0x6e, 0x9f, 0xff),
		color2 = cc.c3b(0xb6, 0xc8, 0xeb),
		scale = 0.9,
	},
	[3] = {
		bgRes = "img_guild_ranking03", 
		rankRes = "img_ranking_03", 
		textRes = "txt_ranking03", 
		color = cc.c3b(0xff, 0xd7, 0xb6), 
		outlineColor = cc.c4b(0xb9, 0x58, 0x3a, 0xff),
		color2 = cc.c3b(0xed, 0x8f, 0x50),
		scale = 0.9,
	},
}

function CakeGuildIcon:ctor(target, rank)
	self._target = target

	self._imageIcon = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
	self._textGuildName = ccui.Helper:seekNodeByName(self._target, "TextGuildName")
	self._imageText = ccui.Helper:seekNodeByName(self._target, "ImageText")
	self._textScore = ccui.Helper:seekNodeByName(self._target, "TextScore")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._imageRank = ccui.Helper:seekNodeByName(self._target, "ImageRank")

	self:_initUI(rank)
end

function CakeGuildIcon:_initUI(rank)
	local info = RES_INFO[rank]
	if info then
		self._imageIcon:loadTexture(Path.getAnniversaryImg(info.bgRes))
		self._textGuildName:setColor(info.color)
		self._textGuildName:enableOutline(info.outlineColor, 2)
		self._imageText:loadTexture(Path.getAnniversaryImg(info.textRes))
		self._textName:setColor(info.color2)
		self._imageRank:loadTexture(Path.getTextSignet(info.rankRes))
		self._imageIcon:setScale(info.scale)
	end
end

function CakeGuildIcon:updateUI(data)
	if data then
		local guildName = UTF8.utf8sub(data:getGuild_name(), 1, 2)
		self._textGuildName:setString(guildName)
		self._textScore:setString(Lang.get("cake_activity_cake_level", {level = data:getCake_level()}))
		local strName = data:getGuild_name()
		if data:getServer_name() ~= "" then
			local serverName = require("app.utils.TextHelper").cutText(data:getServer_name())
			strName = serverName.."\n"..strName
		end
		self._textName:setString(strName)
	else
		self._textGuildName:setString("")
		self._textScore:setString("")
		self._textName:setString(Lang.get("cake_activity_icon_empty"))
	end
end

return CakeGuildIcon