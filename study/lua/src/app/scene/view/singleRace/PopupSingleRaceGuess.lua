--个人竞技竞猜界面
local PopupBase = require("app.ui.PopupBase")
local PopupSingleRaceGuess = class("PopupSingleRaceGuess", PopupBase)
local SingleRaceGuessTabNode = require("app.scene.view.singleRace.SingleRaceGuessTabNode")
local SingleRaceGuessPlayerCell = require("app.scene.view.singleRace.SingleRaceGuessPlayerCell")
local SingleRaceGuessServerCell = require("app.scene.view.singleRace.SingleRaceGuessServerCell")
local SingleRaceConst = require("app.const.SingleRaceConst")
local SingleRaceDataHelper = require("app.utils.data.SingleRaceDataHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

local TAB2CELL = {
	[1] = SingleRaceGuessPlayerCell,
	[2] = SingleRaceGuessServerCell,
	[3] = SingleRaceGuessServerCell,
}

function PopupSingleRaceGuess:ctor()
	local resource = {
		file = Path.getCSB("PopupSingleRaceGuess", "singleRace"),
		binding = {}
	}
	self:setName("PopupSingleRaceGuess")
	PopupSingleRaceGuess.super.ctor(self, resource)
end

function PopupSingleRaceGuess:onCreate()
	self:_initData()
	self:_initView()
end

function PopupSingleRaceGuess:_initData()
	self._selectedTab = SingleRaceConst.GUESS_TAB_TYPE_1
	self._curGuessUnitData = nil
	self._listData = {}
end

function PopupSingleRaceGuess:_initView()
	self._popBG:setTitle(Lang.get("single_race_guess_title"))
	self._popBG:addCloseEventListener(handler(self, self.close))
	self._nodeHelp:updateLangName("single_race_guess_rule")
	for i = 1, 3 do
		self["_tab"..i] = SingleRaceGuessTabNode.new(self["_nodeTab"..i], i, handler(self, self._onClickTab))
	end

	for i = 1, 3 do
		self["_listView"..i]:setTemplate(TAB2CELL[i])
		self["_listView"..i]:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		self["_listView"..i]:setCustomCallback(handler(self, self._onItemTouch))
	end
end

function PopupSingleRaceGuess:onEnter()
	self._signalSingleRaceGuessSuccess = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GUESS_SUCCESS, handler(self, self._onEventGuessSuccess))
	self._signalSingleRaceGuessUpdate = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GUESS_UPDATE, handler(self, self._onEventGuessUpdate))
	self._signalSingleRaceStatusChange = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_STATUS_CHANGE, handler(self, self._onEventRaceStatusChange))

	self._targetTime = SingleRaceDataHelper.getStartTime()
	self:_startCountDown()
	self:_updateGuessData()
	self:_updateView()
end

function PopupSingleRaceGuess:onExit()
	self:_stopCountDown()
	self._signalSingleRaceGuessSuccess:remove()
	self._signalSingleRaceGuessSuccess = nil
	self._signalSingleRaceGuessUpdate:remove()
	self._signalSingleRaceGuessUpdate = nil
	self._signalSingleRaceStatusChange:remove()
	self._signalSingleRaceStatusChange = nil
end

function PopupSingleRaceGuess:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function PopupSingleRaceGuess:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function PopupSingleRaceGuess:_updateCountDown()
	local status = G_UserData:getSingleRace():getStatus()
    local isIn = SingleRaceDataHelper.isInGuessTime()
	local countDown = self._targetTime - G_ServerTime:getTime()
	if status == SingleRaceConst.RACE_STATE_PRE and isIn and countDown > 0 then
		self._textCountDown:setVisible(true)
    	self._textCountDownTitle:setVisible(true)
		local timeString = G_ServerTime:getLeftDHMSFormatEx(self._targetTime)
    	self._textCountDown:setString(timeString)
    else
    	self._textCountDown:setVisible(false)
    	self._textCountDownTitle:setVisible(false)
	end
	if isIn then
		self:_updateTips()
	end
end

function PopupSingleRaceGuess:_updateGuessData()
	self._curGuessUnitData = G_UserData:getSingleRace():getGuessUnitDataWithId(self._selectedTab)
end

function PopupSingleRaceGuess:_updateView()
	self:_updateTips()
	self:_updateTabs()
	self:_updateBar()
	self:_updateList()
end

function PopupSingleRaceGuess:_updateTips()
	self._nodeTip:removeAllChildren()
	local isIn, wday, hour = SingleRaceDataHelper.isInGuessTime()
	local status = G_UserData:getSingleRace():getStatus()
	if isIn == false and status == SingleRaceConst.RACE_STATE_PRE then
		local strWday = Lang.get("common_wday")[wday]
		local textTip = ccui.RichText:createWithContent(Lang.get("single_race_guess_open_tip", {wday = strWday, hour = hour}))
		self._nodeTip:addChild(textTip)
	end
end

function PopupSingleRaceGuess:_updateTabs()
	for i = 1, 3 do
		local selected = i == self._selectedTab
		local unitData = G_UserData:getSingleRace():getGuessUnitDataWithId(i)
		local voted = unitData:isVoted()
		local showRp = G_UserData:getSingleRace():hasRedPointOfGuessWithType(i)
		self["_tab"..i]:setSelected(selected)
		self["_tab"..i]:setVoted(voted)
		self["_tab"..i]:showRP(showRp)
	end
end

function PopupSingleRaceGuess:_updateBar()
	for i = 1, 3 do
		self["_imageBar"..i]:setVisible(i == self._selectedTab)
	end
end

function PopupSingleRaceGuess:_updateList()
	if self._selectedTab == SingleRaceConst.GUESS_TAB_TYPE_1 then
		self._listData = G_UserData:getSingleRace():getGuessPlayerList()
	elseif self._selectedTab == SingleRaceConst.GUESS_TAB_TYPE_2 then
		self._listData = G_UserData:getSingleRace():getGuessServerList(true)
	elseif self._selectedTab == SingleRaceConst.GUESS_TAB_TYPE_3 then
		self._listData = G_UserData:getSingleRace():getGuessServerList(false)
	end
	for i = 1, 3 do
		self["_listView"..i]:stopAutoScroll()
	end
	self["_listView"..self._selectedTab]:clearAll()
    self["_listView"..self._selectedTab]:resize(#self._listData)
end

function PopupSingleRaceGuess:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._listData[index]
	if data then
		local mySupportId = self._curGuessUnitData:getMy_support()
		local id = self:_getIdAndNameWithData(data)
		local supportNum = self._curGuessUnitData:getSupportNumWithId(id)
		local markRes = Path.getIndividualCompetitiveImg("img_guessing_04")
		local textButton = Lang.get("single_race_guess_btn_text_support")
		if self._selectedTab == SingleRaceConst.GUESS_TAB_TYPE_3 then
			markRes = Path.getIndividualCompetitiveImg("img_guessing_05")
			textButton = Lang.get("single_race_guess_btn_text_step")
		end
		item:update(data, index, mySupportId, supportNum, markRes, textButton)
	end
end

function PopupSingleRaceGuess:_onItemSelected(item, index)
	
end

function PopupSingleRaceGuess:_onItemTouch(index, t)
	if SingleRaceDataHelper.checkCanGuess() == false then
		return
	end
    local index = index + t
	local data = self._listData[index]
	local answerId = self._curGuessUnitData:getAnswer_id()
	local supportId, name = self:_getIdAndNameWithData(data)
	local content = ""
	if answerId == SingleRaceConst.GUESS_TAB_TYPE_1 then
		local official = data:getOfficer_level()
		local color = Colors.colorToNumber(Colors.getOfficialColor(official))
		local outlineColor = Colors.getOfficialColorOutline(official)
		content = Lang.get("single_race_guess_confirm_desc"..answerId, {name = name, color = color, outlineColor = Colors.colorToNumber(outlineColor)})
	else
		content = Lang.get("single_race_guess_confirm_desc"..answerId, {name = name})
	end
	local popupAlert = require("app.ui.PopupAlert").new(nil, 
														content,
														function()
														 	G_UserData:getSingleRace():c2sSingleRaceAnswerSupport(answerId, supportId)
														end)
	popupAlert:openWithAction()
end

function PopupSingleRaceGuess:_getIdAndNameWithData(data)
	local id = 0
	local name = ""
	if iskindof(data, "SingleRaceUserData") then
		id = data:getUser_id()
		name = data:getUser_name()
	elseif iskindof(data, "SingleRaceGuessServerData") then
		id = data:getServer_id()
		name = data:getServer_name()
	end
	return id, name
end

function PopupSingleRaceGuess:_onClickTab(index)
	if index == self._selectedTab then
		return
	end
	self._selectedTab = index
	self:_updateGuessData()
	self:_updateView()
end

function PopupSingleRaceGuess:_getItemWithId(id)
	local items = self["_listView"..self._selectedTab]:getItems()
	for i, item in ipairs(items) do
		if item:getDataId() == id then
			return item
		end
	end
	return nil
end

function PopupSingleRaceGuess:_onEventGuessSuccess(eventName, answerId, supportId)
	if answerId == self._selectedTab then
		self:_updateGuessData()
		self:_updateTabs()
		self:_updateList()
	end
end

function PopupSingleRaceGuess:_onEventGuessUpdate(eventName, answerId, supportId, supportNum)
	if answerId == self._selectedTab then
		self:_updateGuessData()
		local item = self:_getItemWithId(supportId)
		if item then
			item:updateCount(supportNum)
		end
	end
end

function PopupSingleRaceGuess:_onEventRaceStatusChange(eventName, status)
	if status == SingleRaceConst.RACE_STATE_ING then --比赛开始，隐藏竞猜按钮
		self:_updateList()
	end
end

return PopupSingleRaceGuess