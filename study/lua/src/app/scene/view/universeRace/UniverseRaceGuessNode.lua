local ViewBase = require("app.ui.ViewBase")
local UniverseRaceGuessNode = class("UniverseRaceGuessNode", ViewBase)
local UniverseRaceGuessSingleCell = require("app.scene.view.universeRace.UniverseRaceGuessSingleCell")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local UserCheck = require("app.utils.logic.UserCheck")
local UniverseRaceConst = require("app.const.UniverseRaceConst")

function UniverseRaceGuessNode:ctor(callback)
	self._callback = callback
	local resource = {
		file = Path.getCSB("UniverseRaceGuessNode", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	UniverseRaceGuessNode.super.ctor(self, resource)
end

function UniverseRaceGuessNode:onCreate()
	self._listData = {}
	self._isShow = false
	
	self._listView:setTemplate(UniverseRaceGuessSingleCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function UniverseRaceGuessNode:onEnter()
	self._signalUniverseRaceUpdatePkInfo = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_UPDATE_PK_INFO_SUCCESS, handler(self, self._onEventRaceUpdatePkInfo))
	self._signalUniverseRaceSupportSuccess = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SUPPORT_SUCCESS, handler(self, self._onEventRaceSupportSuccess))
	self._signalGetUniverseRacePositionInfo = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_GET_POSITION_INFO, handler(self, self._onEventGetUniverseRacePositionInfo))
end

function UniverseRaceGuessNode:onExit()
    self._signalUniverseRaceUpdatePkInfo:remove()
	self._signalUniverseRaceUpdatePkInfo = nil
	self._signalUniverseRaceSupportSuccess:remove()
    self._signalUniverseRaceSupportSuccess = nil
	self._signalGetUniverseRacePositionInfo:remove()
    self._signalGetUniverseRacePositionInfo = nil
end

function UniverseRaceGuessNode:setShow(show)
	self._isShow = show
end

function UniverseRaceGuessNode:updateInfo()
	self:_updateRound()
	self:_updateList()
	self:_updateAward()
end

function UniverseRaceGuessNode:_updateRound()
	local nowRound = G_UserData:getUniverseRace():getNow_round()
	local strRound = ""
	local round = Lang.get("universe_race_round_desc")[nowRound]
	if round then
		strRound = Lang.get("universe_race_guess_single_title")..round
	end
	self._textRound:setString(strRound)
	self._costInfo = UniverseRaceDataHelper.getGuessCostConfig(nowRound, UniverseRaceConst.GUESS_TYPE_1) --单场竞猜
end

function UniverseRaceGuessNode:_updateList()
	local nowRound = G_UserData:getUniverseRace():getNow_round()
	self._listData = UniverseRaceDataHelper.getSingleGuessListWithRound(nowRound)
	self._listView:clearAll()
    self._listView:resize(#self._listData)
end

function UniverseRaceGuessNode:_updateAward()
	local nowRound = G_UserData:getUniverseRace():getNow_round()
	local info = UniverseRaceDataHelper.getRewardGuessConfig(nowRound)
	self._nodeAward:updateUI(info.award_type_1, info.award_value_1, info.award_size_1)
	self._nodeAward:setTextColorToDTypeColor()
end

function UniverseRaceGuessNode:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._listData[index]
	if data then
		item:update(data, self._costInfo)
	end
end

function UniverseRaceGuessNode:_onItemSelected(item, index)
	
end

function UniverseRaceGuessNode:_onItemTouch(index, key, t)
	local index = index + 1
	local data = self._listData[index]
	local unit = data[t]
	local userId = unit.userData:getUser_id()
	
	if key == "btn" then
		self:_onSupport(unit)
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

function UniverseRaceGuessNode:_onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound)
	if self._isShow == false then
		return
	end
	if #pkInfos > 0 then --支持数有改变
		self:_updateList()
	end
    if isChangeRound then
		self:_updateRound()
		self:_updateList()
		self:_updateAward()
	end
end

function UniverseRaceGuessNode:_onEventRaceSupportSuccess(eventName)
	if self._isShow == false then
		return
	end
	self:_updateList()
end

function UniverseRaceGuessNode:_popupUserDetail(userDetailData, power)
	local popup = require("app.ui.PopupUserDetailInfo").new(userDetailData, power)
    popup:setName("PopupUserDetailInfo")
    popup:openWithAction()
end

function UniverseRaceGuessNode:_onEventGetUniverseRacePositionInfo(eventName, userData, userDetailData)
	if self._isShow == false then
		return
	end
	if self._popupUserDetail then
		local power = userData:getPower()
		self:_popupUserDetail(userDetailData, power)
	end
end

function UniverseRaceGuessNode:_onSupport(unit)
	if UniverseRaceDataHelper.checkCanGuess() == false then
		G_Prompt:showTip(Lang.get("universe_race_guess_can_not_tip"))
		return
	end
	if UserCheck.enoughValue(self._costInfo.type, self._costInfo.value, self._costInfo.size, false) == false then
		G_Prompt:showTip(Lang.get("universe_race_res_guess_not_enough"))
		return
	end
	local chipIn = {}
	local chipUnitData = {
		pos = unit.parentPos,
		userId = unit.userData:getUser_id()
	}
	table.insert(chipIn, chipUnitData)
	G_UserData:getUniverseRace():c2sUniverseRaceSupport(chipIn)
end

return UniverseRaceGuessNode