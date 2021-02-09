--
-- Author: Liangxu
-- Date: 2019-10-24
-- 
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceMapNode = class("UniverseRaceMapNode", ViewBase)
local UniverseRacePlayerNode = require("app.scene.view.universeRace.UniverseRacePlayerNode")
local UniverseRaceReportNode = require("app.scene.view.universeRace.UniverseRaceReportNode")
local UniverseRaceChampionNode = require("app.scene.view.universeRace.UniverseRaceChampionNode")
local CSHelper = require("yoka.utils.CSHelper")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local PopupUniverseRaceReplay = require("app.scene.view.universeRace.PopupUniverseRaceReplay")

local SIDE_OFFSET = {
	[UniverseRaceConst.SIDE_LEFT] = -65,
	[UniverseRaceConst.SIDE_RIGHT] = 65,
}

function UniverseRaceMapNode:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceMapNode", "universeRace"),
		binding = {
			
		},
	}
	UniverseRaceMapNode.super.ctor(self, resource)
end

function UniverseRaceMapNode:onCreate()
	self:_initData()
	self:_initView()
end

function UniverseRaceMapNode:_initData()
	self._avatars = {}
	self._players = {}
	self._reports = {}
end

function UniverseRaceMapNode:_initView()
	for i = 1, 31 do
		local position = G_UserData:getUniverseRace():getPosWithIndex(i)
		self["_player"..i] = UniverseRacePlayerNode.new(self["_nodePlayer"..i], position, handler(self, self._onClickPlayer))
		self._players[position] = self["_player"..i]
		self["_report"..i] = UniverseRaceReportNode.new(self["_nodeReport"..i], position)
		self._reports[position] = self["_report"..i]
	end
	self._champion = UniverseRaceChampionNode.new(self._nodeChampion)
end

function UniverseRaceMapNode:onEnter()
	self._signalUniverseRaceUpdatePkInfo = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_UPDATE_PK_INFO_SUCCESS, handler(self, self._onEventRaceUpdatePkInfo))
	self._signalUniverseRaceMatchFinish = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_MATCH_FINISH, handler(self, self._onEventRaceMatchFinish))
	self._signalUniverseRaceUserPositionChange = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_USER_POSITION_CHANGE, handler(self, self._onEventRaceUserPositionChange))
	self._signalUniverseRaceScoreChange = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SCORE_CHANGE, handler(self, self._onEventRaceScoreChange))
end

function UniverseRaceMapNode:onExit()
	for k, avatar in pairs(self._avatars) do
		avatar:stopAllActions()
	end
	
	self._signalUniverseRaceUpdatePkInfo:remove()
	self._signalUniverseRaceUpdatePkInfo = nil
	self._signalUniverseRaceMatchFinish:remove()
    self._signalUniverseRaceMatchFinish = nil
	self._signalUniverseRaceUserPositionChange:remove()
    self._signalUniverseRaceUserPositionChange = nil
	self._signalUniverseRaceScoreChange:remove()
	self._signalUniverseRaceScoreChange = nil
end

function UniverseRaceMapNode:updateUI()
	self:_updateAvatars()
	self:_updatePlayers(true)
	self:_updateChampion()
	self:_updateAvatarAction()
	self:_updatePath()
	self:_updateReportEffects()
end

function UniverseRaceMapNode:updateState()
	self:_updatePlayers(true)
	self:_updateAvatarAction()
	self:_updateReportEffects()
	local racePos = G_UserData:getUniverseRace():findSelfRacePosOfCurRound()
	if racePos > 0 then --比赛开始时，参赛者需要转到对战界面
		G_UserData:getUniverseRace():setCurWatchPos(racePos)
		G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, UniverseRaceConst.LAYER_STATE_BATTLE, false)
	end
end

function UniverseRaceMapNode:_updatePath()
	for k, report in pairs(self._reports) do
		report:updateUI()
	end
end

function UniverseRaceMapNode:_updateAvatars()
	local userDatas = G_UserData:getUniverseRace():getUserDatas()
	for userId, userData in pairs(userDatas) do
		local avatar = self._avatars[userId]
		if avatar == nil then
			avatar = self:_createAvatar(userData)
		end
		local position = userData:getPosition()
		--调整层级
		local round = userData:getRound()
		local zOrder = 10 * round
		avatar:setLocalZOrder(zOrder)
		
		local index, side = G_UserData:getUniverseRace():getIndexAndSideWithPos(position)
		if index == 0 and side == 0 then --此userData是冠军
			avatar:setVisible(false) --隐藏avatar，此人会在冠军位显示
		else
			local posX, posY = self["_nodeReport"..index]:getPosition()
			avatar:setPosition(cc.p(posX + SIDE_OFFSET[side], posY))
			avatar:turnBack(side == UniverseRaceConst.SIDE_RIGHT)
			local isEliminated = userData:isEliminated()
			if isEliminated then
				avatar:applyShader("gray")
			else
				avatar:cancelShader()
			end
		end
	end
end

function UniverseRaceMapNode:_createAvatar(userData)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
	local covertId, limitLevel = userData:getCovertIdAndLimitLevel()
	avatar:updateUI(covertId, nil, nil, limitLevel)
	avatar:setScale(0.4)
	
	local userId = userData:getUser_id()
	self._avatars[userId] = avatar
	self._nodeMid:addChild(avatar)
	return avatar
end

function UniverseRaceMapNode:_updateAvatarAction()
	local raceState = UniverseRaceDataHelper.getRaceStateAndTime()
	local userDatas = G_UserData:getUniverseRace():getUserDatas()
	for userId, userData in pairs(userDatas) do
		local avatar = self._avatars[userId]
		local isEliminated = userData:isEliminated()
		if isEliminated then
			self:_playAction(avatar, "dizzy")
		else
			local racePos = G_UserData:getUniverseRace():findRacePosOfCurRound(userId)
			if racePos > 0 then --在本轮
				if raceState == UniverseRaceConst.RACE_STATE_ING then
					self:_playAction(avatar, "skill1")
				elseif raceState == UniverseRaceConst.RACE_STATE_BREAK then
					self:_playAction(avatar, "idle")
				end
			else
				self:_playAction(avatar, "idle")
			end
		end
	end
end

function UniverseRaceMapNode:_updateReportEffects()
	local raceState = UniverseRaceDataHelper.getRaceStateAndTime()
	for position, report in pairs(self._reports) do
		local groupReportData = G_UserData:getUniverseRace():getGroupReportData(position)
		if groupReportData and groupReportData:isMatchEnd() == false then
			report:setEffect(true)
		else
			report:setEffect(false)
		end
	end
end

function UniverseRaceMapNode:_updatePlayers(isUpdateScore)
	for i = 1, 31 do
		local userData1, userData2 = self:_getUserDatasWithIndex(i)
		self["_player"..i]:updateUI(userData1, userData2)
		if isUpdateScore then
			self["_player"..i]:updateScore(userData1, userData2)
		end
	end
end

function UniverseRaceMapNode:_getUserDatasWithIndex(index)
	local pos1 = G_UserData:getUniverseRace():getPosWithIndexAndSide(index, UniverseRaceConst.SIDE_LEFT)
	local pos2 = G_UserData:getUniverseRace():getPosWithIndexAndSide(index, UniverseRaceConst.SIDE_RIGHT)
	local data1, isHide1 = G_UserData:getUniverseRace():getUserDataWithPosition(pos1)
	local data2, isHide2 = G_UserData:getUniverseRace():getUserDataWithPosition(pos2)

	local userData1 = nil
	local userData2 = nil
	if data1 and isHide1 == false then
		userData1 = data1
	end
	if data2 and isHide2 == false then
		userData2 = data2
	end
	return userData1, userData2
end

function UniverseRaceMapNode:_updateChampion()
	local championUser = G_UserData:getUniverseRace():getUserDataWithPosition(63)
	self._champion:updateUI(championUser)
end

function UniverseRaceMapNode:_onClickPlayer(pos, state)
	if state == UniverseRaceConst.MATCH_STATE_ING then --比赛中
		G_UserData:getUniverseRace():setCurWatchPos(pos)
        G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, UniverseRaceConst.LAYER_STATE_BATTLE, true)
    elseif state == UniverseRaceConst.MATCH_STATE_AFTER then --比完了
    	local groupReportData = G_UserData:getUniverseRace():getGroupReportData(pos)
    	if groupReportData then
    		local popup = PopupUniverseRaceReplay.new(groupReportData)
    		popup:openWithAction()
    	else
    		G_Prompt:showTip(Lang.get("universe_race_reports_empty_tip"))
    	end
    end
end

function UniverseRaceMapNode:_moveAvatar(userId, lastPosition, position)
	local avatar = self._avatars[userId]
	if avatar == nil then
		return
	end

	local turnBackFunc = function(actions, faceSide)
		if faceSide == UniverseRaceConst.SIDE_LEFT then
			faceSide = UniverseRaceConst.SIDE_RIGHT
		else
			faceSide = UniverseRaceConst.SIDE_LEFT
		end
		local needBack = faceSide == UniverseRaceConst.SIDE_LEFT
		local func = cc.CallFunc:create(function(actionNode)
			actionNode:turnBack(needBack)
		end)
		table.insert(actions, func)
		return actions, faceSide
	end

	--特殊的index，导致行走路径不同
	local checkIsSpecialIndex = function(index)
		local indexs = UniverseRaceConst.getIndexsWithRound(4) --第3轮走到第4轮的路径和其他情况是不同的
		for i, v in ipairs(indexs) do
			if index == v then
				return true
			end
		end
		return false
	end

	local startIndex, startSide = G_UserData:getUniverseRace():getIndexAndSideWithPos(lastPosition)
	local endIndex, endSide = G_UserData:getUniverseRace():getIndexAndSideWithPos(position)
	if endIndex == 0 and endSide == 0 then --要移到的是冠军位，就不做move了
		avatar:setVisible(false)
		return
	end
	
	--调整层级
	local userData = G_UserData:getUniverseRace():getUserDataWithId(userId)
	local round = userData:getRound()
	local zOrder = 10 * round
	avatar:setLocalZOrder(zOrder)
	
	local actions = {}
	local startPos = cc.p(self["_nodeReport"..startIndex]:getPosition())
	local endIndex = UniverseRaceConst.NEXT_INDEX[startIndex]
	local endPos = cc.p(self["_nodeReport"..endIndex]:getPosition())
	local pos1 = cc.p(endPos.x, startPos.y)
	local pos2 = endPos
	local pos3 = cc.p(endPos.x + SIDE_OFFSET[endSide], endPos.y)
	local isSpecial = checkIsSpecialIndex(endIndex)
	if isSpecial then
		local midPosX = math.floor((startPos.x + endPos.x) / 2)
		pos1 = cc.p(midPosX, startPos.y)
		pos2 = cc.p(midPosX, endPos.y)
	end
	local moveTime1, moveTime2, moveTime3 = self:_getMoveTime(startPos, pos1, pos2, pos3)
	local moveTo1 = cc.MoveTo:create(moveTime1, pos1)
	local moveTo2 = cc.MoveTo:create(moveTime2, pos2)
	local moveTo3 = cc.MoveTo:create(moveTime3, pos3)

	local faceSide = nil --面朝方向
	if startSide == UniverseRaceConst.SIDE_LEFT then
		faceSide = UniverseRaceConst.SIDE_RIGHT
	else
		faceSide = UniverseRaceConst.SIDE_LEFT
	end
	local forwardSide = nil --前进方向
	if endPos.x > startPos.x then
		forwardSide = UniverseRaceConst.SIDE_RIGHT
	else
		forwardSide = UniverseRaceConst.SIDE_LEFT
	end

	if faceSide ~= forwardSide then
		actions, faceSide = turnBackFunc(actions, faceSide)
	end
	local runFunc = cc.CallFunc:create(function(actionNode)
		self:_playAction(avatar, "run")
	end)
	table.insert(actions, runFunc)
	table.insert(actions, moveTo1)
	table.insert(actions, moveTo2)
	if not isSpecial and faceSide ~= endSide then
		actions, faceSide = turnBackFunc(actions, faceSide)
	end
	table.insert(actions, moveTo3)
	if faceSide == endSide then
		actions, faceSide = turnBackFunc(actions, faceSide)
	end
	local idleFunc = cc.CallFunc:create(function(actionNode)
		self:_playAction(avatar, "idle")
	end)
	table.insert(actions, idleFunc)

	local seq = cc.Sequence:create(unpack(actions))								
	avatar:runAction(seq)
end

function UniverseRaceMapNode:_onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound)
    if #reports > 0 or isChangeRound then --更新战报或进入下一轮时
		self:_updatePlayers()
		self:_updateChampion()
		self:_updateAvatarAction()
		self:_updateReportEffects()
	end
end

function UniverseRaceMapNode:_onEventRaceMatchFinish(eventName, position, userId)
	local avatar = self._avatars[userId]
	avatar:applyShader("gray")
	self:_playAction(avatar, "dizzy")
	--点亮路线
	local report = self._reports[position]
	report:updateUI()
	--台子停止冒烟
	report:setEffect(false)
end

function UniverseRaceMapNode:_onEventRaceUserPositionChange(eventName, userId, lastPosition, position)
	logWarn(string.format( "UniverseRaceMapNode:_onEventRaceUserPositionChange, userId = %d, lastPosition = %d, position = %d", userId, lastPosition, position))
	self:_moveAvatar(userId, lastPosition, position)
	
	local nextPos = UniverseRaceDataHelper.getGroupConfig(position).next_position
	if nextPos == 0 then --冠军
		return
	end
	local prePos = G_UserData:getUniverseRace():getPrePosOfPos(nextPos)
	local userData1 = G_UserData:getUniverseRace():getUserDataWithPosition(prePos[1])
	local userData2 = G_UserData:getUniverseRace():getUserDataWithPosition(prePos[2])
	local player = self._players[nextPos]
	player:updateScore(userData1, userData2)
end

function UniverseRaceMapNode:_onEventRaceScoreChange(eventName, position, side)
	local player = self._players[position]
	player:playScoreEffect(side)
end

--根据各个move节点，算出每段move的时间，让其保持匀速运动
function UniverseRaceMapNode:_getMoveTime(pos1, pos2, pos3, pos4)
	local totalTime = 6 --总move时长
	local getDis = function(posA, posB)
		local disX = math.abs(posA.x - posB.x)
		local disY = math.abs(posA.y - posB.y)
		return disX + disY
	end
	
	local dis1 = getDis(pos1, pos2)
	local dis2 = getDis(pos2, pos3)
	local dis3 = getDis(pos3, pos4)
	local totalDis = dis1 + dis2 + dis3
	local moveTime1 = totalTime * dis1/totalDis
	local moveTime2 = totalTime * dis2/totalDis
	local moveTime3 = totalTime * dis3/totalDis

	return moveTime1, moveTime2, moveTime3
end

--avatar播放动作
function UniverseRaceMapNode:_playAction(avatar, actionName)
	local count1 = math.random(15, 25)
	local count2 = 1
	if actionName == "idle" then
		avatar:playLoopActions("idle", "win", count1, count2)
	else
		avatar:setAction(actionName, true, false)
	end
end

return UniverseRaceMapNode