
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceGuessMultipleNode = class("UniverseRaceGuessMultipleNode", ViewBase)
local UniverseRaceGuessMultipleCell = require("app.scene.view.universeRace.UniverseRaceGuessMultipleCell")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UserCheck = require("app.utils.logic.UserCheck")
local UniverseRaceConst = require("app.const.UniverseRaceConst")

function UniverseRaceGuessMultipleNode:ctor(callback)
	self._callback = callback
	local resource = {
		file = Path.getCSB("UniverseRaceGuessMultipleNode", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonSupport = {
				events = {{event = "touch", method = "_onButtonSupport"}}
			},
		},
	}
	UniverseRaceGuessMultipleNode.super.ctor(self, resource)
end

function UniverseRaceGuessMultipleNode:onCreate()
	self._isShow = false
	self._listData = {}
	self._guessCount = 0 --串联竞猜的场数
	self._costInfo = nil --消耗信息
	self._selectedList = {}
	self._buttonSupport:setString(Lang.get("universe_race_guess_support_btn"))
	local count = G_UserData:getBase():getResValue(DataConst.RES_GUESS)
	self._nodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GUESS, count)
end

function UniverseRaceGuessMultipleNode:onEnter()
	self._signalUniverseRaceUpdatePkInfo = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_UPDATE_PK_INFO_SUCCESS, handler(self, self._onEventRaceUpdatePkInfo))
	self._signalUniverseRaceSupportSuccess = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SUPPORT_SUCCESS, handler(self, self._onEventRaceSupportSuccess))
	self._signalGetUniverseRacePositionInfo = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_GET_POSITION_INFO, handler(self, self._onEventGetUniverseRacePositionInfo))
end

function UniverseRaceGuessMultipleNode:onExit()
    self._signalUniverseRaceUpdatePkInfo:remove()
	self._signalUniverseRaceUpdatePkInfo = nil
	self._signalUniverseRaceSupportSuccess:remove()
    self._signalUniverseRaceSupportSuccess = nil
	self._signalGetUniverseRacePositionInfo:remove()
    self._signalGetUniverseRacePositionInfo = nil
end

function UniverseRaceGuessMultipleNode:setShow(show)
	self._isShow = show
end

function UniverseRaceGuessMultipleNode:updateInfo()
	local nowRound = G_UserData:getUniverseRace():getNow_round()
	if nowRound >= 6 then
		self:_setUIVisible(false)
		self:_updateRound(Lang.get("universe_race_guess_series_empty_tip"))
	else
		self:_setUIVisible(true)
		self:_updateRound()
		self:_updateList()
		self:_resetSelectedList()
		self:_updateBtnAndTip()
		self:_updateAward()
	end
end

function UniverseRaceGuessMultipleNode:_setUIVisible(visible)
	self._listView:setVisible(visible)
	self._textGuessTitle:setVisible(visible)
	self._nodeAward:setVisible(visible)
	self._buttonSupport:setVisible(visible)
	self._nodeTip:setVisible(visible)
end

function UniverseRaceGuessMultipleNode:_updateRound(str)
	if str then
		self._textRound:setString(str)
		return
	end

	local nowRound = G_UserData:getUniverseRace():getNow_round()
	local strRound = ""
	local round = Lang.get("universe_race_round_desc")[nowRound]
	if round then
		strRound = Lang.get("universe_race_guess_multiple_title")..round
	end
	self._textRound:setString(strRound)
end

function UniverseRaceGuessMultipleNode:_updateList()
	local nowRound = G_UserData:getUniverseRace():getNow_round()
	self._listData = UniverseRaceDataHelper.getMultipleGuessListWithRound(nowRound)
	
	self._listView:removeAllItems()
    for group, unit in ipairs(self._listData) do
		local cell = UniverseRaceGuessMultipleCell.new(group, unit.data, handler(self, self._onCellClick))
		self._listView:pushBackCustomItem(cell)
		self._guessCount = cell:getRows()
	end
	self._costInfo = UniverseRaceDataHelper.getGuessCostConfig(nowRound, UniverseRaceConst.GUESS_TYPE_2)
end

function UniverseRaceGuessMultipleNode:_updateAward()
	local id = G_UserData:getUniverseRace():getNow_round()
	local info = UniverseRaceDataHelper.getRewardSeriesConfig(id)
	self._nodeAward:updateUI(info.award_type_1, info.award_value_1, info.award_size_1)
	self._nodeAward:setTextColorToDTypeColor()
end

function UniverseRaceGuessMultipleNode:_resetSelectedList()
	self._selectedList = {}
	for group, unit in ipairs(self._listData) do
		local groupData = unit.data
		self._selectedList[group] = {}
		for index, data in ipairs(groupData) do
			self._selectedList[group][index] = {}
			for side = 1, 2 do
				self._selectedList[group][index][side] = false
			end
		end
	end
end

function UniverseRaceGuessMultipleNode:_updateBtnAndTip()
	local selectedNum = self:_getSelectedCount()
	local isFull = selectedNum >= self._guessCount --是否选满了

	local color = isFull and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_ONE
	local formatStr = Lang.get("universe_race_guess_select_match_tip", {num1 = selectedNum, num2 = self._guessCount})
	local params = {other = {{},{color = color}}}
	local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
	richText:setAnchorPoint(cc.p(0, 0.5))
	self._nodeTip:removeAllChildren()
	self._nodeTip:addChild(richText)

	self._buttonSupport:setEnabled(isFull)
end

function UniverseRaceGuessMultipleNode:_onCellClick(group, key, indexInGroup, sideIndex, selected)
	local groupData = self._listData[group].data
	local unit = groupData[indexInGroup][sideIndex]
	local userId = unit.userData:getUser_id()
	
	if key == "btn" then
		local ret = self:_checkCanSelect(group, indexInGroup, sideIndex, selected)
		return ret
	elseif key == "icon" then
		local userDetailData = G_UserData:getUniverseRace():getUserDetailInfoWithId(userId)
		if userDetailData then
			local power = unit.userData:getPower()
			self:_popupUserDetail(userDetailData, power)
		else
			local pos = unit.pos
			G_UserData:getUniverseRace():c2sGetUniverseRacePositionInfo(pos)
		end
	elseif key == "look" then
		if self._callback then
			self._callback(unit.parentPos)
		end
	end
end

function UniverseRaceGuessMultipleNode:_checkCanSelect(group, indexInGroup, sideIndex, selected)
	local ret = false
	if selected then
		local isRight = self:_checkSelectGroupIsRight(group)
		if isRight == false then --选的组不对
			ret = false
			G_Prompt:showTip(Lang.get("universe_race_guess_condition_tip_1"))
		else
			local isSelected = self:_checkTheMatchIsSelected(group, indexInGroup, sideIndex)
			if isSelected then --选了同一场
				ret = "switch"
				self:_switchSelected(group, indexInGroup, sideIndex)
			else
				ret = true
				self._selectedList[group][indexInGroup][sideIndex] = true
			end
		end
	else
		ret = true
		self._selectedList[group][indexInGroup][sideIndex] = false
	end
	self:_updateBtnAndTip()
	return ret
end

--检测选中的组是否正确
--规则：每次只能在一组内选择，跨组选择是不允许的
function UniverseRaceGuessMultipleNode:_checkSelectGroupIsRight(group)
	for groupIndex, groupData in pairs(self._selectedList) do
		if groupIndex ~= group then --在其他组找
			for index, data in pairs(groupData) do
				for side = 1, 2 do
					if data[side] == true then --找到了在其他组的选择记录
						return false
					end
				end
			end
		end
	end
	return true
end

--检测选择的是否是已经选过的一场比赛
--例如，已经支持了这场比赛的A选手，现在又改支持B选手了
function UniverseRaceGuessMultipleNode:_checkTheMatchIsSelected(group, indexInGroup, sideIndex)
	for side, value in pairs(self._selectedList[group][indexInGroup]) do
		if side ~= sideIndex and value == true then
			return true
		end
	end
	return false
end

function UniverseRaceGuessMultipleNode:_switchSelected(group, indexInGroup, sideIndex)
	for side, value in pairs(self._selectedList[group][indexInGroup]) do
		if side == sideIndex then
			self._selectedList[group][indexInGroup][side] = true
		else
			self._selectedList[group][indexInGroup][side] = false
		end
	end
end

--获取已选择的数量
function UniverseRaceGuessMultipleNode:_getSelectedCount()
	local count = 0
	for groupIndex, groupData in pairs(self._selectedList) do
		for index, data in pairs(groupData) do
			for side, value in pairs(data) do
				if value == true then
					count = count + 1
				end
			end
		end
	end
	return count
end

function UniverseRaceGuessMultipleNode:_onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound)
	if self._isShow == false then
		return
	end
	if #pkInfos > 0 then --支持数有改变
		self:_updateList()
	end
	if isChangeRound then
		self:updateInfo()
	end
end

function UniverseRaceGuessMultipleNode:_onEventRaceSupportSuccess(eventName)
	if self._isShow == false then
		return
	end
	self:_updateList()
end

function UniverseRaceGuessMultipleNode:_popupUserDetail(userDetailData, power)
	local popup = require("app.ui.PopupUserDetailInfo").new(userDetailData, power)
    popup:setName("PopupUserDetailInfo")
    popup:openWithAction()
end

function UniverseRaceGuessMultipleNode:_onEventGetUniverseRacePositionInfo(eventName, userData, userDetailData)
	if self._isShow == false then
		return
	end
	if self._popupUserDetail then
		local power = userData:getPower()
		self:_popupUserDetail(userDetailData, power)
	end
end

function UniverseRaceGuessMultipleNode:_onButtonSupport()
	if UniverseRaceDataHelper.checkCanGuess() == false then
		G_Prompt:showTip(Lang.get("universe_race_guess_can_not_tip"))
		return
	end
	if UserCheck.enoughValue(self._costInfo.type, self._costInfo.value, self._costInfo.size, false) == false then
		G_Prompt:showTip(Lang.get("universe_race_res_guess_not_enough"))
		return
	end
	local chipIn = {}
	for group, unit in ipairs(self._listData) do
		local groupData = unit.data
		for index, data in ipairs(groupData) do
			for side = 1, 2 do
				if self._selectedList[group][index][side] == true then
					local info = data[side]
					local chipUnitData = {
						pos = info.parentPos,
						userId = info.userData:getUser_id()
					}
					table.insert(chipIn, chipUnitData)
				end
			end
		end
	end
	
	G_UserData:getUniverseRace():c2sUniverseRaceSupport(chipIn)
end

return UniverseRaceGuessMultipleNode