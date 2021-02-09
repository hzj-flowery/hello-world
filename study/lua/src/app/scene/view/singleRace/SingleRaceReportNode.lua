--
-- Author: Liangxu
-- Date: 2018-11-26
-- 跨服个人竞技战斗战报Node

local SingleRaceReportNode = class("SingleRaceReportNode")
local SingleRaceConst = require("app.const.SingleRaceConst")

function SingleRaceReportNode:ctor(target, pos, callback)
    self._target = target
    self._pos = pos
    self._callback = callback
    self._state = 0

    self._imageLine1 = ccui.Helper:seekNodeByName(self._target, "ImageLine1")
    self._imageLine2 = ccui.Helper:seekNodeByName(self._target, "ImageLine2")
    self._imageLookBg = ccui.Helper:seekNodeByName(self._target, "ImageLookBg")
    self._imageLookBg:addClickEventListenerEx(handler(self, self._onClick))
    self._imageLookSign = ccui.Helper:seekNodeByName(self._target, "ImageLookSign")
    self._textWinNum1 = ccui.Helper:seekNodeByName(self._target, "TextWinNum1")
    self._textWinNum2 = ccui.Helper:seekNodeByName(self._target, "TextWinNum2")
end

function SingleRaceReportNode:updateUI()
	self._imageLine1:setVisible(false)
	self._imageLine2:setVisible(false)

	local winNum1, winNum2 = G_UserData:getSingleRace():getWinNumWithPosition(self._pos)
	local state = SingleRaceConst.MATCH_STATE_BEFORE
	if G_UserData:getSingleRace():getStatus() == SingleRaceConst.RACE_STATE_FINISH then --整个活动已结束
		state = SingleRaceConst.MATCH_STATE_AFTER
	else
		state = G_UserData:getSingleRace():getReportStateWithPosition(self._pos)
	end
	self._state = state
	local preIndex = G_UserData:getSingleRace():getPreIndexOfPosition(self._pos)
	local userData1 = G_UserData:getSingleRace():getUserDataWithPosition(preIndex[1])
	local userData2 = G_UserData:getSingleRace():getUserDataWithPosition(preIndex[2])

	if state == SingleRaceConst.MATCH_STATE_BEFORE then
		self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c2"))
		self._imageLookBg:setTouchEnabled(false)
		self._textWinNum1:setString("")
		self._textWinNum2:setString("")
	elseif state == SingleRaceConst.MATCH_STATE_ING then
		if userData1 or userData2 then
			self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c1"))
			self._imageLookBg:setTouchEnabled(true)
		else
			self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c3"))
			self._imageLookBg:setTouchEnabled(false)
		end
		local num1 = userData1 and userData2 and winNum1 or ""
		local num2 = userData1 and userData2 and winNum2 or ""
		self._textWinNum1:setString(num1)
		self._textWinNum2:setString(num2)
	elseif state == SingleRaceConst.MATCH_STATE_AFTER then
		if userData1 or userData2 then
			self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c"))
			self._imageLookBg:setTouchEnabled(true)
		else
			self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c2"))
			self._imageLookBg:setTouchEnabled(false)
		end
		local num1 = userData1 and userData2 and winNum1 or ""
		local num2 = userData1 and userData2 and winNum2 or ""
		self._textWinNum1:setString(num1)
		self._textWinNum2:setString(num2)

		local tempMatchData = G_UserData:getSingleRace():getMatchDataWithPosition(self._pos)
		if tempMatchData then
			local matchData1 = G_UserData:getSingleRace():getMatchDataWithPosition(preIndex[1])
			local matchData2 = G_UserData:getSingleRace():getMatchDataWithPosition(preIndex[2])
			local tempUserId = tempMatchData:getUser_id()
			local userId1 = matchData1 and matchData1:getUser_id() or 0
			local userId2 = matchData2 and matchData2:getUser_id() or 0
			self._imageLine1:setVisible(userId1 > 0 and tempUserId == userId1)
			self._imageLine2:setVisible(userId2 > 0 and tempUserId == userId2)
		end
	end
end

function SingleRaceReportNode:_onClick()
	if self._callback then
		self._callback(self._pos, self._state)
	end
end

function SingleRaceReportNode:fontSizeBigger()
	self._textWinNum1:setFontSize(48)
	self._textWinNum2:setFontSize(48)
end

function SingleRaceReportNode:fontSizeSmaller()
	self._textWinNum1:setFontSize(24)
	self._textWinNum2:setFontSize(24)
end

return SingleRaceReportNode