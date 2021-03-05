--
-- Author: Liangxu
-- Date: 2018-11-26
-- 跨服个人竞技赛程图
local ViewBase = require("app.ui.ViewBase")
local SingleRaceMapNode = class("SingleRaceMapNode", ViewBase)
local SingleRacePlayerNode = require("app.scene.view.singleRace.SingleRacePlayerNode")
local SingleRaceConst = require("app.const.SingleRaceConst")
local SingleRaceReportNode = require("app.scene.view.singleRace.SingleRaceReportNode")
local PopupSingleRaceReplay = require("app.scene.view.singleRace.PopupSingleRaceReplay")
local SingleRaceRankNode = require("app.scene.view.singleRace.SingleRaceRankNode")

local SCALE_LARGE = 1.0
local SCALE_SMALL = 0.39

function SingleRaceMapNode:ctor(parentView)
	self._parentView = parentView
	self._scrollView = parentView._scrollView
	self._curState = parentView._curState

	local resource = {
		file = Path.getCSB("SingleRaceMapNode", "singleRace"),
		binding = {
			
		},
	}
	SingleRaceMapNode.super.ctor(self, resource)
end

function SingleRaceMapNode:onCreate()
	self:_initData()
	self:_initView()
end

function SingleRaceMapNode:_initData()
	if self._curState == SingleRaceConst.MAP_STATE_LARGE then
		self._curScale = SCALE_LARGE
	else
		self._curScale = SCALE_SMALL
	end
	self._lastClickTime = 0
	self._lastClickPos = cc.p(0, 0)

	self._rank = SingleRaceRankNode.new(self._nodeRank)
end

function SingleRaceMapNode:_initView()
	local size = self:_getSize()
	self._scrollView:setInnerContainerSize(size)
	self:setPosition(cc.p(size.width/2, size.height/2))
	self:setScale(self._curScale)

	for i = 1, 63 do
		self["_player"..i] = SingleRacePlayerNode.new(self["_nodePlayer"..i], i, handler(self, self._onClickPlayer))
	end

	for i = 33, 63 do
		self["_report"..i] = SingleRaceReportNode.new(self["_nodeReport"..i], i, handler(self, self._onLookClick))
	end

	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addTouchEventListener(handler(self, self._onTouchEvent))
end

function SingleRaceMapNode:onEnter()
	self._signalSingleRaceUpdatePkInfo = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_UPDATE_PK_INFO_SUCCESS, handler(self, self._onEventRaceUpdatePkInfo))
	self._signalSingleRaceStatusChange = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_STATUS_CHANGE, handler(self, self._onEventRaceStatusChange))
	self._signalSingleRaceGetPkInfoSuccess = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GET_PK_INFO_SUCCESS, handler(self, self._onEventSingleRaceGetPkInfoSuccess))

	self:_updateData()
	self:_updateView()
end

function SingleRaceMapNode:onExit()
	self._signalSingleRaceUpdatePkInfo:remove()
	self._signalSingleRaceUpdatePkInfo = nil
	self._signalSingleRaceStatusChange:remove()
	self._signalSingleRaceStatusChange = nil
	self._signalSingleRaceGetPkInfoSuccess:remove()
	self._signalSingleRaceGetPkInfoSuccess = nil
end

function SingleRaceMapNode:onShow()
	self._signalGetSingleRacePositionInfo = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GET_POSITION_INFO, handler(self, self._onEventGetSingleRacePositionInfo))
end

function SingleRaceMapNode:onHide()
	if self._signalGetSingleRacePositionInfo then
		self._signalGetSingleRacePositionInfo:remove()
    	self._signalGetSingleRacePositionInfo = nil
	end
end

function SingleRaceMapNode:_updateData()
	
end

function SingleRaceMapNode:_updateView()
	self:_updatePlayers()
	self:_updateReports()
	self:_updateFontSize()
	self:_updateRankScale()
	self._rank:updateUI()
end

function SingleRaceMapNode:_updatePlayers()
	local finalPos = G_UserData:getSingleRace():getSelfFinalPos()
	local tbPos = G_UserData:getSingleRace():getSameServerPlayerFinalPos()
	local isSameServer = function(filterPos, pos)
		for k, v in pairs(filterPos) do
			if v == pos then
				return true
			end
		end
		return false
	end
	
	for i = 1, 63 do
		local userData = G_UserData:getSingleRace():getUserDataWithPosition(i)
		local state = G_UserData:getSingleRace():getResultStateWithPosition(i)
		self["_player"..i]:updateUI(userData, state)
		self["_player"..i]:removeEffect()
		if i == finalPos then
			self["_player"..i]:showEffect("effect_touxiangziji")
		elseif isSameServer(tbPos, i) then
			self["_player"..i]:showEffect("effect_taozhuang_orange")
		end
		self["_player"..i]:setSelfModule(i == finalPos)
	end
end

function SingleRaceMapNode:_updateReports()
	for i = 33, 63 do
		self["_report"..i]:updateUI()
	end
end

function SingleRaceMapNode:_onLookClick(pos, state)
	if state == SingleRaceConst.MATCH_STATE_ING then --比赛中
		G_UserData:getSingleRace():setCurWatchPos(pos)
        G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_SWITCH_LAYER, SingleRaceConst.LAYER_STATE_BATTLE)
    elseif state == SingleRaceConst.MATCH_STATE_AFTER then --比完了
    	local replays = G_UserData:getSingleRace():getReportData(pos)
    	if replays then
    		local popup = PopupSingleRaceReplay.new(replays)
    		popup:openWithAction()
    	else
    		G_Prompt:showTip(Lang.get("single_race_reports_empty_tip"))
    	end
    end
end

function SingleRaceMapNode:_onClickPlayer(userId, pos, power)
	local userDetailData = G_UserData:getSingleRace():getUserDetailInfoWithId(userId)
	if userDetailData then
		self:_popupUserDetail(userDetailData, power)
	else
		G_UserData:getSingleRace():c2sGetSingleRacePositionInfo(pos)
	end
end

function SingleRaceMapNode:_popupUserDetail(userDetailData, power)
	local popup = require("app.ui.PopupUserDetailInfo").new(userDetailData, power)
    popup:setName("PopupUserDetailInfo")
    popup:openWithAction()
end

function SingleRaceMapNode:_onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound)
	if #reports > 0 or isChangeRound then --更新了战报，说明比分发生改变，要刷新，轮次发生改变也刷新
		self:_updateData()
		self:_updateView()
	end
	if isChangeRound then
		self._parentView:updateProcessTitle()
		self._parentView:playRoundEffect()
		if G_UserData:getSingleRace():getNow_round() == 1 and G_UserData:getSingleRace():isSelfEliminated() == false then --比赛开始时，参赛者需要转到对战界面
			local racePos = G_UserData:getSingleRace():findSelfRacePos()
			G_UserData:getSingleRace():setCurWatchPos(racePos)
			print( "SingleRaceMapNode:_onEventRaceUpdatePkInfo---------", racePos )
			G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_SWITCH_LAYER, SingleRaceConst.LAYER_STATE_BATTLE)
		end
	end
end

function SingleRaceMapNode:_onEventRaceStatusChange(eventName, status)
	if status == SingleRaceConst.RACE_STATE_ING then
		G_UserData:getSingleRace():c2sGetSingleRacePkInfo() --比赛开始，且在这个界面时，重新拉数据
		self._parentView:playFire()
		self._parentView:updateGuessRedPoint()
	end
end

function SingleRaceMapNode:_onEventSingleRaceGetPkInfoSuccess()
	self:_updateData()
	self:_updateView()
	self._rank:updateUI()
end

function SingleRaceMapNode:_onEventGetSingleRacePositionInfo(eventName, userData, userDetailData)
	if self._popupUserDetail then
		local power = userData:getPower()
		self:_popupUserDetail(userDetailData, power)
	end
end

--=====================缩放相关========================================================================
function SingleRaceMapNode:changeScale(state, transAnchorPoint)
	self._curState = state
	if state == SingleRaceConst.MAP_STATE_LARGE then
		self:_changeBigger(transAnchorPoint)
	elseif state == SingleRaceConst.MAP_STATE_SMALL then
		self:_changeSmaller(transAnchorPoint)
	end
end

function SingleRaceMapNode:_changeBigger(transAnchorPoint)
	if transAnchorPoint == nil then
		transAnchorPoint = self:_getDefaultAnchorPoint()
	end
	self._curScale = SCALE_LARGE
	self._scrollView:stopAutoScroll()
	self:_updateFontSize()

	local srcAnchorPoint = self._panelMap:getAnchorPoint()
	local srcPosX, srcPosY = self:getPosition()
	self._panelMap:setAnchorPoint(transAnchorPoint)

	local transPos = cc.p(srcPosX * transAnchorPoint.x/srcAnchorPoint.x, srcPosY * transAnchorPoint.y/srcAnchorPoint.y)
	local size = self:_getSize()
	self._scrollView:setInnerContainerSize(size)
	local tarPos = cc.p(transPos.x * SCALE_LARGE/SCALE_SMALL, transPos.y * SCALE_LARGE/SCALE_SMALL)
	self:setPosition(tarPos)
	self._scrollView:setInnerContainerPosition(cc.p(tarPos.x*(SCALE_SMALL-SCALE_LARGE)/SCALE_LARGE, tarPos.y*(SCALE_SMALL-SCALE_LARGE)/SCALE_LARGE))

	local scaleTo = cc.ScaleTo:create(0.3, self._curScale)
	self:runAction(scaleTo)

	self:_updateRankScale()
end

function SingleRaceMapNode:_changeSmaller(transAnchorPoint)
	if transAnchorPoint == nil then
		transAnchorPoint = self:_getDefaultAnchorPoint()
	end
	self._curScale = SCALE_SMALL
	self._scrollView:stopAutoScroll()
	self:_updateFontSize()
	
	local srcAnchorPoint = self._panelMap:getAnchorPoint()
	local srcPosX, srcPosY = self:getPosition()
	self._panelMap:setAnchorPoint(transAnchorPoint)

	local transPos = cc.p(srcPosX * transAnchorPoint.x/srcAnchorPoint.x, srcPosY * transAnchorPoint.y/srcAnchorPoint.y)
	local size = self:_getSize()
	self._scrollView:setInnerContainerSize(size)
	local tarPos = cc.p(transPos.x * SCALE_SMALL/SCALE_LARGE, transPos.y * SCALE_SMALL/SCALE_LARGE)
	self:setPosition(tarPos)

	self._scrollView:setInnerContainerPosition(cc.p(0, 0))
	local scaleTo = cc.ScaleTo:create(0.3, self._curScale)
	local func = cc.CallFunc:create(function()
		self._panelMap:setAnchorPoint(cc.p(0.5, 0.5))
		local size = self:_getSize()
		self:setPosition(cc.p(size.width/2, size.height/2))
	end)
	local seq = cc.Sequence:create(scaleTo, func)
	self:runAction(seq)

	self:_updateRankScale()
end

function SingleRaceMapNode:_updateFontSize()
	if self._curScale == SCALE_LARGE then
		for i = 1, 63 do
			self["_player"..i]:fontSizeSmaller()
		end
		for i = 33, 63 do
			self["_report"..i]:fontSizeSmaller()
		end
	elseif self._curScale == SCALE_SMALL then
		for i = 1, 63 do
			self["_player"..i]:fontSizeBigger()
		end
		for i = 33, 63 do
			self["_report"..i]:fontSizeBigger()
		end
	end
end

function SingleRaceMapNode:_updateRankScale()
	if self._curScale == SCALE_LARGE then
		self._nodeRank:setScale(1.0)
	elseif self._curScale == SCALE_SMALL then
		self._nodeRank:setScale(2.3)
	end
end

function SingleRaceMapNode:_getSize()
	local size = self._panelMap:getContentSize()
	local width = math.ceil(size.width * self._curScale)
	local height = math.ceil(size.height * self._curScale)

	return cc.size(width, height)
end

function SingleRaceMapNode:_getDefaultAnchorPoint()
	local worldPos = cc.p(display.width*0.5, display.height*0.5)
	local focusPos = G_UserData:getSingleRace():getCurFocusPos()
	if focusPos > 0 then --找到位置，以他为中心点缩放
		worldPos = self["_nodePlayer"..focusPos]:convertToWorldSpace(cc.p(0,0))
	end
	
	local anchorPoint = self:_getAnchorPoint(worldPos)
	return anchorPoint
end

function SingleRaceMapNode:_getAnchorPoint(worldPos)
	local pos = self._panelTouch:convertToNodeSpace(worldPos)
	local size = self._panelMap:getContentSize()
	local anchorPoint = cc.p(pos.x/size.width, pos.y/size.height)
	return anchorPoint
end

function SingleRaceMapNode:_onTouchEvent(sender, state)
	if state == ccui.TouchEventType.began then
		if self:_isDoubleClick(sender) then
			local transAnchorPoint = self:_getAnchorPoint(sender:getTouchBeganPosition())
			if self._curState == SingleRaceConst.MAP_STATE_SMALL then
				self:changeScale(SingleRaceConst.MAP_STATE_LARGE, transAnchorPoint)
			else
				self:changeScale(SingleRaceConst.MAP_STATE_SMALL, transAnchorPoint)
			end
			self._parentView:updateInfo(self._curState)
		end
	elseif state == ccui.TouchEventType.moved then
		
	elseif state == ccui.TouchEventType.ended then
		
	elseif state == ccui.TouchEventType.canceled then
		
	end
end

function SingleRaceMapNode:_isDoubleClick(sender)
	local curTime = timer:getms()
	local diffTime = curTime - self._lastClickTime
	self._lastClickTime = curTime

	local curPos = sender:getTouchBeganPosition()
	local diffX = math.abs(curPos.x - self._lastClickPos.x)
	local diffY = math.abs(curPos.y - self._lastClickPos.y)
	self._lastClickPos = curPos
	if diffTime < 300 and diffX < 20 and diffY < 20 then --双击
		return true
	else
		return false
	end
end

return SingleRaceMapNode