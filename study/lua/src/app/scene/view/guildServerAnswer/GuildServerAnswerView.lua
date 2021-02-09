-- Author: liushiyin
-- Date:2019-03-11 18:36:29
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildServerAnswerView = class("GuildServerAnswerView", ViewBase)
local GuildServerAnswerRankLayer = import(".GuildServerAnswerRankLayer")
local GuildServerAnswerNode = import(".GuildServerAnswerNode")
local GuildServerAnswerAvatarLayer = import(".GuildServerAnswerAvatarLayer")
local GuildAnswerConst = require("app.const.GuildAnswerConst")
local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")

local TITLE_IMAGE_RES = "txt_sys_com_quanfudati"
local BG_RES_HEAD = "left_bg"
local BG_RES_MID = "mid_bg"
local BG_RES_TAIL = "right_bg"
local BG_WIDTH = 348
local SPEED = 400
local LAST_DELAY = 0.1
local END_SPINE_NAME = "quanfudatizhongdian"

function GuildServerAnswerView:waitEnterMsg(callBack)
	local function onMsgCallBack(id, answerData)
		callBack()
	end
	G_UserData:getGuildServerAnswer():c2sEnterNewGuildAnswer()

	return G_SignalManager:add(SignalConst.EVENT_GUILD_ENTER_NEW_ANSWER, onMsgCallBack)
end

function GuildServerAnswerView:ctor()
	--csb bind var name
	self._subLayers = {}
	self._state = 0
	self._scrollBg = nil
	self._maxSlide = 0
	self._bgList = {}
	self._startGo = false
	self._isLastQues = false
	self._delay = 0

	local resource = {
		file = Path.getCSB("GuildServerAnswerView", "guildServerAnswer"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {}
	}
	GuildServerAnswerView.super.ctor(self, resource)
end

-- Describle：
function GuildServerAnswerView:onCreate()
	self:_initUI()
	self:_resetListBG()
end

function GuildServerAnswerView:_initUI()
	local answerAvatarLayer = GuildServerAnswerAvatarLayer.new()
	self._panelContent:addChild(answerAvatarLayer)
	self._subLayers[GuildAnswerConst.ANSWER_AVATAR_LAYER] = answerAvatarLayer
	local answerRanklayer = GuildServerAnswerRankLayer.new()
	self._panelContent:addChild(answerRanklayer)
	self._subLayers[GuildAnswerConst.ANSWER_RANK_LAYER] = answerRanklayer

	local answerNode = GuildServerAnswerNode.new()
	self._nodePopup:addChild(answerNode)
	self._subLayers[GuildAnswerConst.ANSWER_NODE] = answerNode

	self._topbarBase:setImageTitle(TITLE_IMAGE_RES)
	self._topbarBase:hideBG()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_SERVER_ANSWER)
	self._buttonHelp:updateLangName("guild_server_answer_help")
end

-- Describle：
function GuildServerAnswerView:onEnter()
	self._signalEventGuildServerAnswerUpdateState =
		G_SignalManager:add(SignalConst.EVENT_GUILD_SERVER_ANSWER_UPDATE_STATE, handler(self, self._onEventAnswerUpdateState))
	self._signalAllDataReady = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onAllDataReady))
	self._signalEnter =
		G_SignalManager:add(SignalConst.EVENT_GUILD_ENTER_NEW_ANSWER, handler(self, self._onEventEnterView))

	self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)
	self:_updateState(true)
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playMusicWithId(AudioConst.MUSCI_NEW_ANSWER)

	-- G_EffectGfxMgr:createPlayMovingGfx(self._panelContent, "smoving_saipaojishi")
end

-- Describle：
function GuildServerAnswerView:onExit()
	self:unscheduleUpdate()
	self._signalEventGuildServerAnswerUpdateState:remove()
	self._signalEventGuildServerAnswerUpdateState = nil
	self._signalAllDataReady:remove()
	self._signalAllDataReady = nil
	self._signalEnter:remove()
	self._signalEnter = nil
end

-- #scrollBg begin
function GuildServerAnswerView:_resetListBG()
	local size = self._resourceNode:getContentSize()
	self._maxSlide = math.ceil(size.width / BG_WIDTH) + 2
	local posx = 0
	local offsetX = 0
	for i = 1, self._maxSlide do
		local imageBg = self._bgList[i]
		if not imageBg then
			imageBg = ccui.ImageView:create()
			imageBg:setAnchorPoint(cc.p(0, 0.5))
			self._bgList[i] = imageBg
			self._scrollBg:addChild(imageBg)
		end
		imageBg:removeAllChildren()
		local resName = BG_RES_MID
		if i == 1 then
			resName = BG_RES_HEAD
		end
		if imageBg:getName() ~= resName then
			imageBg:loadTexture(Path.getAnswerBg(resName))
		end
		imageBg:setName(resName)
		imageBg:setPositionX(posx + offsetX)
		offsetX = offsetX + BG_WIDTH
	end
end

function GuildServerAnswerView:_update(dt)
	if self._startGo then
		local offsetx = SPEED * dt
		self:_updateBgList(offsetx)
		if self._isLastQues then
			self._delay = self._delay + dt
		end
	end
end

function GuildServerAnswerView:_updateBgList(offsetX)
	local size = self._resourceNode:getContentSize()
	local state = G_UserData:getGuildServerAnswer():getAnswerState()
	local curNo = GuildServerAnswerHelper.getCurrentVisibleQuesNo() -- 当前题号
	local waitTime = GuildAnswerConst.EFFECT_TIME + GuildAnswerConst.FACE_TIME
	for i = 1, self._maxSlide do
		local posx = self._bgList[i]:getPositionX()
		local width = self._bgList[i]:getContentSize().width
		if posx + width < 0 then
			if self._isLastQues and self._delay >= waitTime then
				self._bgList[i]:loadTexture(Path.getAnswerBg(BG_RES_TAIL))
				self._bgList[i]:setName(BG_RES_TAIL)
				self:_attachLastMoving(self._bgList[i])
				self._isLastQues = false
				self._delay = 0
			elseif
				curNo == GuildAnswerConst.WAVE_MAX_NUMS and state == GuildAnswerConst.ANSWER_STATE_RESTING and not self._nextDo
			 then --最后一题
				self._isLastQues = true
				self._delay = 0
				self._nextDo = true
			elseif self._bgList[i]:getName() == BG_RES_HEAD then
				self._bgList[i]:loadTexture(Path.getAnswerBg(BG_RES_MID))
				self._bgList[i]:setName(BG_RES_MID)
			end
			posx = self:_getMaxBgPosX() + BG_WIDTH
			self._bgList[i]:setPositionX(posx)
		elseif posx + width <= size.width + offsetX * 2 then -- 停止
			if self._bgList[i]:getName() == BG_RES_TAIL then
				self._startGo = false
				self._nextDo = false
				self._subLayers[GuildAnswerConst.ANSWER_AVATAR_LAYER]:enterAllAvatarWin()
				self:_playDestinationEffect(self._bgList[i])
			end
		end
		self._bgList[i]:setPositionX(posx - offsetX)
	end
end

function GuildServerAnswerView:_attachLastMoving(node)
	if not GuildServerAnswerHelper.isHaveRightAnswerPlayer() then
		return
	end
	local function createSpineNode()
		-- body
		local curQues = G_UserData:getGuildServerAnswer():getCurQuestion()
		local posy = 0
		if curQues:getRightAnswer() == GuildAnswerConst.LEFT_SIDE then
			posy = 450
		else
			posy = 180
		end
		local spineNode = require("yoka.node.SpineNode").new()
		spineNode:setAsset(Path.getEffectSpine(END_SPINE_NAME))
		spineNode:setPosition(cc.p(0, posy))
		spineNode:setAnimation("effect1", true)
		spineNode:setName(END_SPINE_NAME)
		return spineNode
	end
	local spinenode = createSpineNode()
	node:addChild(spinenode)
end

function GuildServerAnswerView:_getMaxBgPosX()
	local maxX = 0
	for i = 1, self._maxSlide do
		local posx = self._bgList[i]:getPositionX()
		if posx > maxX then
			maxX = posx
		end
	end
	return maxX
end
-- #scrollBg end

function GuildServerAnswerView:_onEventEnterView()
	self:_updateState()
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, {flag = 1})
end

function GuildServerAnswerView:_onEventAnswerUpdateState(id, state)
	self:_updateState()
end

function GuildServerAnswerView:_onAllDataReady()
	G_UserData:getGuildServerAnswer():c2sEnterNewGuildAnswer()
end

function GuildServerAnswerView:_updateState(enter)
	local state = G_UserData:getGuildServerAnswer():getAnswerState()
	if state == GuildAnswerConst.ANSWER_STATE_PLAYING or state == GuildAnswerConst.ANSWER_STATE_RESTING then
		local no = GuildServerAnswerHelper.getCurrentVisibleQuesNo()
		if state == GuildAnswerConst.ANSWER_STATE_RESTING and enter and no == 10 then -- 最后一题进来
			self:_goIdle()
		elseif state == GuildAnswerConst.ANSWER_STATE_PLAYING and enter and no == 10 then
			self:_setResAllMid()
			self:_goRun()
		else
			self:_goRun()
		end
	else
		self._startGo = false
		local need = GuildServerAnswerHelper.needReset()
		if need then
			self:_resetListBG()
		end
	end
	self._subLayers[GuildAnswerConst.ANSWER_NODE]:updateUI(state)
end

function GuildServerAnswerView:_goRun()
	self._startGo = true
	self._subLayers[GuildAnswerConst.ANSWER_AVATAR_LAYER]:enterAllAvatarRun()
end

function GuildServerAnswerView:_goIdle()
	self._startGo = false
	self._subLayers[GuildAnswerConst.ANSWER_AVATAR_LAYER]:enterAllAvatarIdle()
end

function GuildServerAnswerView:_setResAllMid()
	for i = 1, self._maxSlide do
		local imageBg = self._bgList[i]
		if imageBg then
			imageBg:loadTexture(Path.getAnswerBg(BG_RES_MID))
		end
	end
end

--
function GuildServerAnswerView:_playDestinationEffect(node)
	if not GuildServerAnswerHelper.isHaveRightAnswerPlayer() then
		return
	end
	local spineNode = node:getChildByName(END_SPINE_NAME)
	if spineNode then
		spineNode:setAnimation("effect2", false)
		G_EffectGfxMgr:createPlayMovingGfx(spineNode, "moving_quanfudatizhongdian_shengli", nil, nil)
	end
end

return GuildServerAnswerView
