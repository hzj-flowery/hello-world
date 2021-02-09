-- Author: liushiyin
-- Date:2019-03-11 18:36:39
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildServerAnswerAvatarLayer = class("GuildServerAnswerAvatarLayer", ViewBase)
local GuildServerAnswerAvatar = import(".GuildServerAnswerAvatar")
local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
local GuildAnswerConst = require("app.const.GuildAnswerConst")
local AudioConst = require("app.const.AudioConst")

local EFFECT_MOVING = {
	[1] = "moving_quanfudati_ganning",
	[2] = "moving_quanfudati_huangyueying",
	[3] = "moving_quanfudati_lvbu"
}

local EFFECT_SOUND = {
	[1] = AudioConst.SOUND_NEW_ANSWER_KILL1,
	[2] = AudioConst.SOUND_NEW_ANSWER_KILL2,
	[3] = AudioConst.SOUND_NEW_ANSWER_KILL3
}

local EFFECT_OUT_SOUND = {
	[1] = AudioConst.SOUND_NEW_ANSWER_OUT1,
	[2] = AudioConst.SOUND_NEW_ANSWER_OUT2,
	[3] = AudioConst.SOUND_NEW_ANSWER_OUT3
}

local EFFECT_TRUE = "moving_quanfudati_zhengque"
local EFFECT_FALSE = "moving_quanfudati_cuowu"

local SPEED = 500

function GuildServerAnswerAvatarLayer:ctor()
	--csb bind var name
	self._leftEffectCenter = nil --SingleNode
	self._rightEffectCenter = nil --SingleNode
	self._listAvatars = {}
	self._showAvatarList = {}
	self._nodeParent = nil
	self._leftPosMaps = {}
	self._rightPosMaps = {}
	local resource = {
		file = Path.getCSB("GuildServerAnswerAvatarLayer", "guildServerAnswer"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {}
	}
	GuildServerAnswerAvatarLayer.super.ctor(self, resource)
end

-- Describle：
function GuildServerAnswerAvatarLayer:onCreate()
	self._leftPosMaps, self._rightPosMaps = GuildServerAnswerHelper.getPlayerPointMaps()
	self._leftEffectCenter:setLocalZOrder(500)
	self._rightEffectCenter:setLocalZOrder(500)
	self:_initPlayerAvatars()
end

-- Describle：
function GuildServerAnswerAvatarLayer:onEnter()
	self._signalEventGuildServerPlayerrUpdate =
		G_SignalManager:add(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, handler(self, self._onEventPlayerUpdate))
	self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)
	self:_updateAvatarEx()
end

function GuildServerAnswerAvatarLayer:_initPlayerAvatars()
	local maxKeng = GuildServerAnswerHelper.getServerAnswerMaxKeng()
	for i = 1, maxKeng do
		local avatar = GuildServerAnswerAvatar.new()
		self._nodeParent:addChild(avatar)
		table.insert(self._listAvatars, avatar)
		avatar:hide()
	end
end

-- Describle：
function GuildServerAnswerAvatarLayer:onExit()
	self._signalEventGuildServerPlayerrUpdate:remove()
	self._signalEventGuildServerPlayerrUpdate = nil
end

function GuildServerAnswerAvatarLayer:_onEventPlayerUpdate(id, message)
	local flag = message.flag
	if flag == 0 then
		self:_doMidfield()
	elseif flag == 1 then
		self:_updateAvatarEx()
	end
end

function GuildServerAnswerAvatarLayer:enterAllAvatarRun()
	for k, avatar in pairs(self._listAvatars) do
		if avatar:isVisible() then
			avatar:didEnterAction("run")
		end
	end
end

function GuildServerAnswerAvatarLayer:enterAllAvatarIdle()
	for k, avatar in pairs(self._listAvatars) do
		if avatar:isVisible() then
			avatar:didEnterAction("idle")
		end
	end
end

function GuildServerAnswerAvatarLayer:enterAllAvatarWin()
	for k, avatar in pairs(self._listAvatars) do
		if avatar:isVisible() then
			avatar:didEnterAction("win")
		end
	end
end

function GuildServerAnswerAvatarLayer:_findAvatarById(userId)
	local avatar = self._showAvatarList[userId]
	if avatar and avatar:isVisible() then
		return avatar
	end
end

function GuildServerAnswerAvatarLayer:_getFreeAvatar()
	for k, avatar in pairs(self._listAvatars) do
		if not avatar:isVisible() then
			return avatar
		end
	end
end

function GuildServerAnswerAvatarLayer:_resetRecoveryFlag()
	for k, v in pairs(self._showAvatarList) do
		self._showAvatarList[k]:setRecoveryFlag(1)
	end
end

function GuildServerAnswerAvatarLayer:_recovery()
	for k, v in pairs(self._showAvatarList) do
		if self._showAvatarList[k]:getRecoveryFlag() == 1 then
			self._showAvatarList[k]:hide()
			self._showAvatarList[k] = nil
		end
	end
end

function GuildServerAnswerAvatarLayer:_updateAvatarEx()
	local state = G_UserData:getGuildServerAnswer():getAnswerState()
	if state == GuildAnswerConst.ANSWER_STATE_INIT or state == GuildAnswerConst.ANSWER_STATE_IDLE then
		return
	end
	local list = GuildServerAnswerHelper.getServerAnswerSortPlayers()
	local maxSize = GuildServerAnswerHelper.getServerAnswerMaxKeng()
	if list[1] and not list[1]:isSelf() then
		maxSize = maxSize - 1
	end
	local maxCount = math.min(maxSize, #list)
	self:_resetRecoveryFlag()
	self:_updateExitsAvatar(maxCount, list)
	self:_recovery()
	self:_allocNewAvatar(maxCount, list)
end

function GuildServerAnswerAvatarLayer:_updateExitsAvatar(maxCount, list)
	for i = 1, maxCount do
		local data = list[i]
		local avatar = self:_findAvatarById(data:getUser_id())
		if avatar then
			avatar:setRecoveryFlag(0)
		end
	end
end

function GuildServerAnswerAvatarLayer:_allocNewAvatar(maxCount, list)
	local leftCount, rightCount = self:_getStartCount(list[1])
	local state = G_UserData:getGuildServerAnswer():getAnswerState()
	for i = 1, maxCount do
		local data = list[i]
		local avatar = self:_findAvatarById(data:getUser_id())
		if not avatar then
			avatar = self:_getFreeAvatar()
			self._showAvatarList[data:getUser_id()] = avatar
		end
		if avatar then
			if data:getSide() == GuildAnswerConst.LEFT_SIDE then
				leftCount = leftCount + 1
				local point = self._leftPosMaps[leftCount]
				avatar:updateAvatar(data, point, state)
			else
				rightCount = rightCount + 1
				local point = self._rightPosMaps[rightCount]
				avatar:updateAvatar(data, point, state)
			end
		end
	end
end

function GuildServerAnswerAvatarLayer:_getStartCount(data)
	local leftCount = 0
	local rightCount = 0
	if data and data:isSelf() then
		if data:getSide() == GuildAnswerConst.LEFT_SIDE then
			leftCount = 0
			rightCount = 1
		else
			leftCount = 1
			rightCount = 0
		end
	else
		leftCount = 1
		rightCount = 1
	end
	return leftCount, rightCount
end

function GuildServerAnswerAvatarLayer:_playKillEffect(node)
	self._curNode = node
	local size = self._resourceNode:getContentSize()
	node:removeAllChildren()
	node:stopAllActions()
	local serverTime = math.floor(G_ServerTime:getTime() / 30)
	local effectIndex = serverTime % #EFFECT_MOVING + 1
	node:setPositionX(size.width + 100)
	local time = size.width / SPEED

	G_AudioManager:playSoundWithId(EFFECT_OUT_SOUND[effectIndex])
	G_EffectGfxMgr:createPlayMovingGfx(node, EFFECT_MOVING[effectIndex], nil, nil)
	local move = cc.MoveTo:create(time, cc.p(-200, node:getPositionY()))
	local sequece =
		cc.Sequence:create(
		move,
		cc.CallFunc:create(
			function()
				node:removeAllChildren()
				self._curNode = nil

				for k, avatar in pairs(self._showAvatarList) do
					if avatar:isVisible() and avatar:getSide() ~= self._right_answer and avatar:getWudiTimes() > 0 then
						avatar:subWudiTimes()
					end
				end
			end
		)
	)
	self._effectIndex = effectIndex
	node:runAction(sequece)
end

function GuildServerAnswerAvatarLayer:_update(dt)
	if self._curNode then
		self:_checkDied()
	end
end

function GuildServerAnswerAvatarLayer:_doMidfield()
	local curQues = G_UserData:getGuildServerAnswer():getCurQuestion()
	local right_answer = curQues:getRightAnswer()
	local sequece =
		cc.Sequence:create(
		cc.CallFunc:create(
			function()
				self:_playAnswerEffect(right_answer)
			end
		),
		cc.DelayTime:create(GuildAnswerConst.EFFECT_TIME),
		cc.CallFunc:create(
			function()
				self:_playFaceAction(right_answer)
			end
		),
		cc.DelayTime:create(GuildAnswerConst.FACE_TIME),
		cc.CallFunc:create(
			function()
				self:_killMan(right_answer)
			end
		)
	)
	self:runAction(sequece)
end

function GuildServerAnswerAvatarLayer:_playFaceAction(right_answer)
	for k, avatar in pairs(self._showAvatarList) do
		avatar:playFace(right_answer)
	end
end

function GuildServerAnswerAvatarLayer:_playAnswerEffect(right_answer)
	local selfUnitData = GuildServerAnswerHelper.getSelfUnitData()
	self._nodeEffect:removeAllChildren()
	local effectFunction = function(key)
		if key == "ziti" then
			local txt = "txt_answer_02"
			if selfUnitData:getSide() == right_answer then
				txt = "txt_answer_01"
			end
			local image = ccui.ImageView:create()
			image:loadTexture(Path.getGuildAnswerText(txt))
			return image
		end
	end
	if selfUnitData then
		if selfUnitData:getSide() == right_answer then
			G_AudioManager:playSoundWithId(AudioConst.SOUND_NEW_ANSWER_WIN)
			G_EffectGfxMgr:createPlayMovingGfx(
				self._nodeEffect,
				EFFECT_TRUE,
				effectFunction,
				function(event)
					if event == "finish" then
						G_Prompt:showAwards(GuildServerAnswerHelper.getAnswerAwards(1))
					end
				end,
				true
			)
		else
			G_AudioManager:playSoundWithId(AudioConst.SOUND_NEW_ANSWER_LOSE)
			G_EffectGfxMgr:createPlayMovingGfx(
				self._nodeEffect,
				EFFECT_FALSE,
				effectFunction,
				function(event)
					if event == "finish" then
						G_Prompt:showAwards(GuildServerAnswerHelper.getAnswerAwards(2))
					end
				end,
				true
			)
		end
	end
end

function GuildServerAnswerAvatarLayer:_killMan(right_answer)
	self._right_answer = right_answer
	if right_answer == GuildAnswerConst.LEFT_SIDE then
		self:_playKillEffect(self._rightEffectCenter) -- 删右边
	else
		self:_playKillEffect(self._leftEffectCenter)
	end
end

function GuildServerAnswerAvatarLayer:_checkDied()
	for k, avatar in pairs(self._showAvatarList) do
		if avatar:isVisible() and avatar:getSide() ~= self._right_answer then
			if avatar:getPositionX() + 170 > self._curNode:getPositionX() then
				G_AudioManager:playSoundWithId(EFFECT_SOUND[self._effectIndex])
				avatar:died()
			end
		end
	end
end

return GuildServerAnswerAvatarLayer
