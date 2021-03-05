--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕活动军团Icon

local CakePlayerIcon = class("CakeGuildIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

local RES_INFO = {
	[1] = {
		rankRes = "img_ranking_01", 
		textRes = "txt_ranking01",
		color = cc.c3b(0xff, 0xd8, 0x00),
		scale = 0.6,
	},
	[2] = {
		rankRes = "img_ranking_02", 
		textRes = "txt_ranking02",
		color = cc.c3b(0xb6, 0xc8, 0xeb),
		scale = 0.5,
	},
	[3] = {
		rankRes = "img_ranking_03", 
		textRes = "txt_ranking03",
		color = cc.c3b(0xed, 0x8f, 0x50),
		scale = 0.5,
	},
}

function CakePlayerIcon:ctor(target, rank)
	self._target = target

	self._nodeIcon = ccui.Helper:seekNodeByName(self._target, "NodeIcon")
	cc.bind(self._nodeIcon, "CommonHeroIcon")
	self._imageRank = ccui.Helper:seekNodeByName(self._target, "ImageRank")
	self._imageText = ccui.Helper:seekNodeByName(self._target, "ImageText")
	self._textScore = ccui.Helper:seekNodeByName(self._target, "TextScore")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")

	self:_initUI(rank)
end

function CakePlayerIcon:_initUI(rank)
	local info = RES_INFO[rank]
	if info then
		self._imageText:loadTexture(Path.getAnniversaryImg(info.textRes))
		self._textName:setColor(info.color)
		self._imageRank:loadTexture(Path.getTextSignet(info.rankRes))
		self._nodeIcon:setScale(info.scale)
	end
end

function CakePlayerIcon:updateUI(data)
	if data then
		local coverId = data:getCovertIdAndLimitLevel()
		self._nodeIcon:updateUI(coverId)
		self._nodeIcon:updateHeadFrame(data:getHead_frame_id())
		self._nodeIcon:showHeroUnknow(false)
		self._textScore:setString(data:getPoint())
		local strName = data:getName()
		if data:getServer_name() ~= "" then
			local serverName = require("app.utils.TextHelper").cutText(data:getServer_name())
			strName = serverName.."\n"..strName
		end
		self._textName:setString(strName)
	else
		self._nodeIcon:showHeroUnknow(true)
		self._textScore:setString("")
		self._textName:setString(Lang.get("cake_activity_icon_empty"))
	end
end

return CakePlayerIcon