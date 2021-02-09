
local UniverseRaceGuessResultCell = class("UniverseRaceGuessResultCell")
local UIHelper = require("yoka.utils.UIHelper")

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
	[1] = cc.c3b(0xff, 0x00, 0x00),
	[2] = cc.c3b(0xff, 0x72, 0x00),
	[3] = cc.c3b(0xdb, 0x4e, 0xf0),
	[4] = Colors.NORMAL_BG_ONE,
}

function UniverseRaceGuessResultCell:ctor(target)
	self._target = target
	self._resourceNode = ccui.Helper:seekNodeByName(self._target, "ResourceNode")
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._textRound = ccui.Helper:seekNodeByName(self._target, "TextRound")
	for i = 1, 2 do
		self["_nodeIcon"..i] = ccui.Helper:seekNodeByName(self._target, "NodeIcon"..i)
		cc.bind(self["_nodeIcon"..i], "CommonHeroIcon")
		self["_imageResult"..i] = ccui.Helper:seekNodeByName(self._target, "ImageResult"..i)
		self["_textServer"..i] = ccui.Helper:seekNodeByName(self._target, "TextServer"..i)
		self["_textName"..i] = ccui.Helper:seekNodeByName(self._target, "TextName"..i)
		self["_textVoteCount"..i] = ccui.Helper:seekNodeByName(self._target, "TextVoteCount"..i)
	end
end

function UniverseRaceGuessResultCell:update(info, index)
	local function updateUnit(unit, index)
		local userData = unit.userData
		local isWin = unit.isWin
		local supportNum = unit.supportNum
		local covertId, limitLevel, limitRedLevel = userData:getCovertIdAndLimitLevel()
		self["_nodeIcon"..index]:updateUI(covertId, nil, limitLevel, limitRedLevel)
		self["_nodeIcon"..index]:updateHeadFrame(userData:getHead_frame_id())
		local resName = isWin and "txt_com_battle_win" or "txt_com_battle_lose"
		self["_imageResult"..index]:loadTexture(Path.getBattleFont(resName))
		local serverName = require("app.utils.TextHelper").cutText(userData:getServer_name(), 5)
		self["_textServer"..index]:setString(serverName)
		self["_textName"..index]:setString(userData:getUser_name())
		local officialLevel = userData:getOfficer_level()
		self["_textName"..index]:setColor(Colors.getOfficialColor(officialLevel))
		UIHelper.updateTextOfficialOutline(self["_textName"..index], officialLevel)
		self["_textVoteCount"..index]:setString(supportNum)
	end

	if index <= 3 then
		self._imageBg:loadTexture(Path.getComplexRankUI(IMAGE_TOP_RES[index]))
		self._imageBg:setScale9Enabled(false)
		self._textRound:setColor(COLOR_TITLE[index])
	else
		self._imageBg:loadTexture(Path.getUICommon(IMAGE_COMMON_RES[index%2]))
		self._imageBg:setScale9Enabled(true)
		self._imageBg:setCapInsets(cc.rect(1, 1, 1, 1))
		self._textRound:setColor(COLOR_TITLE[4])
	end
	
	local round = info.round
	self._textRound:setString(Lang.get("universe_race_round_des2")[round])
	for i = 1, 2 do
		local unit = info.datas[i]
		updateUnit(unit, i)
	end
end

function UniverseRaceGuessResultCell:getSize()
	local size = self._resourceNode:getContentSize()
	return size
end

return UniverseRaceGuessResultCell