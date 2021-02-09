--
-- Author: Liangxu
-- Date: 2019-10-28
-- 
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceChampionLayer = class("UniverseRaceChampionLayer", ViewBase)
local UniverseRaceChampionCell = require("app.scene.view.universeRace.UniverseRaceChampionCell")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UniverseRaceReelNode = require("app.scene.view.universeRace.UniverseRaceReelNode")

function UniverseRaceChampionLayer:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceChampionLayer", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnMap = {
				events = {{event = "touch", method = "_onClickMap"}}
			},
			_btnPastChampion = {
				events = {{event = "touch", method = "_onClickPastChampion"}}
			},
		},
	}
	UniverseRaceChampionLayer.super.ctor(self, resource)
end

function UniverseRaceChampionLayer:onCreate()
	self._cells = {}
	for i = 2, 6 do
		local type = "mid"
		if i == 2 then
			type = "left"
		elseif i == 6 then
			type = "right"
		end
		local cell = UniverseRaceChampionCell.new(type, handler(self, self._onLook))
		self["_nodeHero"..i]:addChild(cell)
		self["_nodeHero"..i]:setVisible(false)
		self._cells[i] = cell
	end
	self._playedOpenMoving = false
	self._nodeStory:setVisible(false)
end

function UniverseRaceChampionLayer:onEnter()
	self._signalGetUniverseRacePositionInfo = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_GET_POSITION_INFO, handler(self, self._onEventGetUniverseRacePositionInfo))
end

function UniverseRaceChampionLayer:onExit()
	self._signalGetUniverseRacePositionInfo:remove()
    self._signalGetUniverseRacePositionInfo = nil
end

function UniverseRaceChampionLayer:onShow()
	
end

function UniverseRaceChampionLayer:onHide()
	
end

function UniverseRaceChampionLayer:updateInfo()
	local matchData = G_UserData:getUniverseRace():getMatchDataWithPosition(63)
    if matchData then
        local userId = matchData:getUser_id()
        local championUser = G_UserData:getUniverseRace():getUserDataWithId(userId)
        local championDetail = G_UserData:getUniverseRace():getUserDetailInfoWithId(userId)
        if championUser and championDetail then
            self._userData = championUser
            self._userDetailData = championDetail
            self:_updateView()
            return
        end
    end
	G_UserData:getUniverseRace():c2sGetUniverseRacePositionInfo(63) --63，冠军位置
end

function UniverseRaceChampionLayer:_updateView()
	local heroList = self._userData:getHeroList()
	local covertId, limitLevel, limitRedLevel = self._userData:getCovertIdAndLimitLevel()
	self._nodeStory:updateUI(covertId, limitLevel, limitRedLevel)
	self._nodeStory:setVisible(false)
	self._textServer:setString(self._userData:getServer_name())
	self._textName:setString(self._userData:getUser_name())
	self._textName:setColor(Colors.getOfficialColor(self._userData:getOfficer_level()))
	for i = 2, 6 do
		local heroData = heroList[i]
		local heroCoverId = nil
		local heroLimitLevel = nil
		local heroLimitRedLevel = nil
		if heroData then
			heroCoverId = heroData:getCoverId()
			heroLimitLevel = heroData:getLimitLevel()
			heroLimitRedLevel = heroData:getLimitRedLevel()
		end
		self._cells[i]:updateUI(heroCoverId, heroLimitLevel, heroLimitRedLevel)
		self["_nodeHero"..i]:setVisible(false)
	end
	
	if self._playedOpenMoving == false then
		self:_playOpenMoving()
	else
		self:_playEnterEffect()
	end
end

function UniverseRaceChampionLayer:_onClickMap()
	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, UniverseRaceConst.LAYER_STATE_MAP, true)
end

function UniverseRaceChampionLayer:_onClickPastChampion()
	local reelNode = UniverseRaceReelNode.new(handler(self, self._switchLayer))
	self._nodeAni:addChild(reelNode)
end

function UniverseRaceChampionLayer:_switchLayer()
	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, UniverseRaceConst.LAYER_STATE_PAST_CHAMPION, true)
end

function UniverseRaceChampionLayer:_onLook()
	if self._userDetailData == nil then
        return
    end
    local popup = require("app.ui.PopupUserDetailInfo").new(self._userDetailData, self._userData:getPower())
    popup:setName("PopupUserDetailInfo")
    popup:openWithAction()
end

function UniverseRaceChampionLayer:_onEventGetUniverseRacePositionInfo(eventName, userData, userDetailData)
	self._userData = userData
    self._userDetailData = userDetailData
    self:_updateView()
end

--播放开场moving
function UniverseRaceChampionLayer:_playOpenMoving()
	self._panelDesign:setVisible(false)
	
	local function eventFunction(event)
		if event == "finish" then
			self._panelDesign:setVisible(true)
			self:_playEnterEffect()
		end
	end
	self._playedOpenMoving = true
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, "moving_zhenwu_chibang", nil, eventFunction, true)
end

function UniverseRaceChampionLayer:_playEnterEffect()
	local function eventFunction(event)
		if event == "lihui" then
			self._nodeStory:setVisible(true)
			G_EffectGfxMgr:applySingleGfx(self._nodeStory, "smoving_zhenwuzhanshen_lihui", nil, nil, nil)
		elseif event == "finish" then
			
		else
			local stc, edc = string.find(event, "m")
			if stc then
				local index = string.sub(event, edc+1, -1)
				local node = self["_nodeHero"..(index+1)]
				node:setVisible(true)
				G_EffectGfxMgr:applySingleGfx(node, "smoving_zhenwuzhanshen_kapai1", nil, nil, nil)
			end
		end
	end
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, "moving_zhenwuzhanshen_kapai", nil, eventFunction, false)
end

return UniverseRaceChampionLayer