local PopupBase = require("app.ui.PopupBase")
local PopupCampMap = class("PopupCampMap", PopupBase)
local CampRaceVSNode = require("app.scene.view.campRace.CampRaceVSNode")
local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
local CampRaceConst = require("app.const.CampRaceConst")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local CampRaceCountryNode = require("app.scene.view.campRace.CampRaceCountryNode")
local CampRaceLookNode = require("app.scene.view.campRace.CampRaceLookNode")
local PopupReplays = require("app.scene.view.campRace.PopupReplays")

function PopupCampMap:waitEnterMsg(callBack, camp)
	local campIndex = 1
	local function onMsgCallBack(id, camp)
		local count = G_UserData:getCampRaceData():getUserIdsCount(camp)
		if count == 0 then
			if campIndex >= 1 and campIndex <= 4 then
				G_UserData:getCampRaceData():c2sGetCampRaceLastRank(campIndex)
				campIndex = campIndex + 1
				if campIndex > 4 then
					G_Prompt:showTip(Lang.get("camp_race_map_no_content"))
				end
			end
		else
			self._camp = camp
			callBack()
		end
    end

    G_UserData:getCampRaceData():c2sGetCampRaceLastRank(camp)

    local signal = G_SignalManager:add(SignalConst.EVENT_GET_LAST_RANK, onMsgCallBack)
    return signal
end

function PopupCampMap:ctor(isMultipleCamp)
	self._isMultipleCamp = isMultipleCamp or false --是否显示多阵营
	
	local resource = {
		file = Path.getCSB("PopupCampMap", "campRace"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onCloseClick"}}
			},
		}
	}
	PopupCampMap.super.ctor(self, resource)
end

function PopupCampMap:onCreate()
	self:_initData()
	self:_initView()
end

function PopupCampMap:_initData()
	
end

function PopupCampMap:_initView()
	--选手
	for i = 1, 14 do
		self["_player"..i] = CampRaceVSNode.new(self["_nodePlayer"..i], i)
	end

	--查看按钮
	for i = 1, 7 do
		local pos1 = i*2-1
		local pos2 = i*2
		self["_look"..pos1..pos2] = CampRaceLookNode.new(self["_nodeLook"..pos1..pos2], pos1, pos2, handler(self, self._onLookClick))
	end

	--阵营按钮
	for i = 1, 4 do
		self["_country"..i] = CampRaceCountryNode.new(self["_nodeCamp"..i], i, handler(self, self._onCampClick))
		self["_nodeCamp"..i]:setVisible(self._isMultipleCamp)
	end
end

function PopupCampMap:onEnter()
	self._signalGetLastRank = G_SignalManager:add(SignalConst.EVENT_GET_LAST_RANK, handler(self, self._onEventGetLastRank))
	self._signalUpdateState = G_SignalManager:add(SignalConst.EVENT_CAMP_UPDATE_STATE, handler(self, self._onEventUpdateState))

	self:_updateView()
end

function PopupCampMap:onExit()
	self._signalGetLastRank:remove()
	self._signalGetLastRank = nil
	self._signalUpdateState:remove()
	self._signalUpdateState = nil
end

function PopupCampMap:_updateView()
	self:_updateCamp()
	self:_updatePlayers()
	self:_updateLook()
	self:_updateState()
	self:_updateCountry()
end

function PopupCampMap:_updateCamp()
	local res = Path.getCampImg("img_camp_com"..self._camp)
	self._imageCamp:loadTexture(res)
end

function PopupCampMap:_updatePlayers()
	for i = 1, 14 do
		local state = CampRaceHelper.getMacthStateWithPos(self._camp, i)
		if state == CampRaceConst.MATCH_STATE_BEFORE then --未比赛
			self["_player"..i]:updateUI(nil)
			self["_textScore"..i]:setVisible(false)
			if self["_imageLinePos"..i] then
				self["_imageLinePos"..i]:setVisible(false)
			end
		elseif state == CampRaceConst.MATCH_STATE_ING then --比赛中
			local userData = G_UserData:getCampRaceData():getUserByPos(self._camp, i)
			local score = CampRaceHelper.getMatchScore(self._camp, i)
			self["_player"..i]:updateUI(userData, true)
			self["_textScore"..i]:setString(score)
			self["_textScore"..i]:setColor(Colors.getCampWhite())
			self["_textScore"..i]:setVisible(true)
			if self["_imageLinePos"..i] then
				self["_imageLinePos"..i]:setVisible(false)
			end
		elseif state == CampRaceConst.MATCH_STATE_AFTER then --比赛完
			local userData = G_UserData:getCampRaceData():getUserByPos(self._camp, i)
			local score = CampRaceHelper.getMatchScore(self._camp, i)
			local isWin = score >= 2
			self["_player"..i]:updateUI(userData, isWin)
			self["_textScore"..i]:setString(score)
			self["_textScore"..i]:setColor(Colors.getCampScoreGray())
			self["_textScore"..i]:setVisible(true)
			if self["_imageLinePos"..i] then
				self["_imageLinePos"..i]:setVisible(isWin)
			end
		end
	end
end

function PopupCampMap:_updateLook()
	for i = 1, 7 do
		local pos1 = i*2-1
		local pos2 = i*2
		local state = CampRaceHelper.getMacthStateWithPos(self._camp, pos1)
		self["_look"..pos1..pos2]:updateUI(state)
	end
end

function PopupCampMap:_updateState()
	local round = G_UserData:getCampRaceData():getFinalStatusByCamp(self._camp)
	self._textState:setString(Lang.get("camp_race_map_match_round_"..round))
end

function PopupCampMap:_onCampClick(camp)
	if self._isMultipleCamp then
		G_UserData:getCampRaceData():c2sGetCampRaceLastRank(camp)
	end
end

function PopupCampMap:_updateCountry()
	if not self._isMultipleCamp then
		return
	end
	for i = 1, 4 do 
		self["_country"..i]:setSelected(i == self._camp)
	end
end

function PopupCampMap:_onLookClick(pos1, pos2, state)
	if G_UserData:getCampRaceData():isMatching() then
		G_Prompt:showTip(Lang.get("camp_race_map_can_not_look_tip"))
		return
	end

	if state == CampRaceConst.MATCH_STATE_ING then --比赛中
        local userData = G_UserData:getCampRaceData():getUserByPos(self._camp, pos1)
        local userId = userData:getId()
        G_UserData:getCampRaceData():setCurWatchUserId(userId)
        G_UserData:getCampRaceData():c2sGetCampRaceFormation(self._camp, userId)
        self:close()
    elseif state == CampRaceConst.MATCH_STATE_AFTER then --比完了
    	local reports = G_UserData:getCampRaceData():getReportGroupByPos(self._camp, pos1, pos2)
		local sortReports = CampRaceHelper.sortReportGroup(reports)
        local popup = PopupReplays.new(sortReports)
        popup:openWithAction()
    end
end

function PopupCampMap:_onCloseClick()
	self:close()
end

function PopupCampMap:_onEventGetLastRank(eventName, camp)
	self._camp = camp
	self:_updateCountry()
	self:_updateView()
end

--总状态的更新
function PopupCampMap:_onEventUpdateState(eventName, camp)
	if self._camp == camp then
		self:_updateView()
	end
end

return PopupCampMap