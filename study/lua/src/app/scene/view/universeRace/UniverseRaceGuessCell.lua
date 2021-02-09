

local UniverseRaceGuessCell = class("UniverseRaceGuessCell")
local UIHelper = require("yoka.utils.UIHelper")

function UniverseRaceGuessCell:ctor(target, callbackLook, callbackIcon)
	self._target = target
	self._callbackLook = callbackLook
	self._callbackIcon = callbackIcon

	self._buttonLook = ccui.Helper:seekNodeByName(self._target, "ButtonLook")
	self._buttonLook:addClickEventListenerEx(handler(self, self._onButtonLook))
	for i = 1, 2 do
		self["_nodeIcon"..i] = ccui.Helper:seekNodeByName(self._target, "NodeIcon"..i)
		cc.bind(self["_nodeIcon"..i], "CommonHeroIcon")
		self["_nodeIcon"..i]:setCallBack(handler(self, self["_onClickIcon"..i]))
		self["_textServer"..i] = ccui.Helper:seekNodeByName(self._target, "TextServer"..i)
		self["_textName"..i] = ccui.Helper:seekNodeByName(self._target, "TextName"..i)
		self["_textPower"..i] = ccui.Helper:seekNodeByName(self._target, "TextPower"..i)
		self["_textVoteCount"..i] = ccui.Helper:seekNodeByName(self._target, "TextVoteCount"..i)
	end
end

function UniverseRaceGuessCell:update(info)
	local function updateUnit(unit, index)
		local userData = unit.userData
		local covertId, limitLevel, limitRedLevel = userData:getCovertIdAndLimitLevel()
		self["_nodeIcon"..index]:updateUI(covertId, nil, limitLevel, limitRedLevel)
		self["_nodeIcon"..index]:updateHeadFrame(userData:getHead_frame_id())
		self["_textServer"..index]:setString(userData:getServer_name())
		self["_textName"..index]:setString(userData:getUser_name())
		local officialLevel = userData:getOfficer_level()
		self["_textName"..index]:setColor(Colors.getOfficialColor(officialLevel))
		UIHelper.updateTextOfficialOutline(self["_textName"..index], officialLevel)
		self["_textPower"..index]:setString(userData:getPower())
		self["_textVoteCount"..index]:setString(unit.supportNum)
	end

	for i = 1, 2 do
		local unit = info[i]
		self["_unitData"..i] = unit
		updateUnit(unit, i)
	end
end

function UniverseRaceGuessCell:_onClickIcon1()
	if self._callbackIcon then
		self._callbackIcon(1)
	end
end

function UniverseRaceGuessCell:_onClickIcon2()
	if self._callbackIcon then
		self._callbackIcon(2)
	end
end

function UniverseRaceGuessCell:_onButtonLook()
	if self._callbackLook then
		self._callbackLook()
	end
end

return UniverseRaceGuessCell