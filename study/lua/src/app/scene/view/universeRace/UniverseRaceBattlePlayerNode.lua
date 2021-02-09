--
-- Author: Liangxu
-- Date: 2019-10-28
--

local UniverseRaceBattlePlayerNode = class("UniverseRaceBattlePlayerNode") 

function UniverseRaceBattlePlayerNode:ctor(target)
    self._target = target

    for i = 1, 2 do
	    self["_imageFirst"..i] = ccui.Helper:seekNodeByName(self._target, "ImageFirst"..i)
	    self["_nodePower"..i] = ccui.Helper:seekNodeByName(self._target, "NodePower"..i)
	    cc.bind(self["_nodePower"..i], "CommonHeroPower")
	    self["_textServerName"..i] = ccui.Helper:seekNodeByName(self._target, "TextServerName"..i)
	    self["_textPlayerName"..i] = ccui.Helper:seekNodeByName(self._target, "TextPlayerName"..i)
	    self["_textCount"..i] = ccui.Helper:seekNodeByName(self._target, "TextCount"..i)
	    self["_textTip"..i] = ccui.Helper:seekNodeByName(self._target, "TextTip"..i)
    end
end

function UniverseRaceBattlePlayerNode:updateUI(curWatchPos)
	local firstHand = G_UserData:getUniverseRace():getFirstHandPos(curWatchPos)
	local groupReportDatas = G_UserData:getUniverseRace():getGroupReportData(curWatchPos)
	local winNum1 = groupReportDatas and groupReportDatas:getWinNum1() or 0
	local winNum2 = groupReportDatas and groupReportDatas:getWinNum2() or 0
	local winNums = {winNum1, winNum2}
	local prePos = G_UserData:getUniverseRace():getPrePosOfPos(curWatchPos)
	for i = 1, 2 do
		local pos = prePos[i]
		local userData = G_UserData:getUniverseRace():getUserDataWithPosition(pos)
		if userData then
			self["_imageFirst"..i]:setVisible(firstHand == pos)
			self["_nodePower"..i]:updateUI(userData:getPower())
			local serverName = userData:getServer_name()
			self["_textServerName"..i]:setString(serverName)
			self["_textPlayerName"..i]:setString(userData:getUser_name())
			self["_textPlayerName"..i]:setColor(Colors.getOfficialColor(userData:getOfficer_level()))
			self["_textCount"..i]:setString(Lang.get("camp_play_off_win_count", {count = winNums[i]}))
			self["_textCount"..i]:setVisible(true)
			self["_textTip"..i]:setVisible(false)
			self["_nodePower"..i]:setVisible(true)
		else
			self["_imageFirst"..i]:setVisible(false)
			self["_textServerName"..i]:setString("")
			self["_textPlayerName"..i]:setString("")
	    	self["_textPlayerName"..i]:setColor(Colors.getCampGray())
	    	self["_textCount"..i]:setVisible(false)
	    	self["_textTip"..i]:setVisible(true)
	    	self["_nodePower"..i]:setVisible(false)
		end
	end
end

return UniverseRaceBattlePlayerNode