--
-- Author: Liangxu
-- Date: 2019-4-12
-- 红包雨
local ViewBase = require("app.ui.ViewBase")
local RedPacketRainView = class("RedPacketRainView", ViewBase)
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local RedPacketNode = require("app.scene.view.redPacketRain.RedPacketNode")
local RedPacketRainConst = require("app.const.RedPacketRainConst")
local PopupRedPacketRainStart = require("app.scene.view.redPacketRain.PopupRedPacketRainStart")
local PopupRedRainSettlement = require("app.scene.view.redPacketRain.PopupRedRainSettlement")
local RedPacketRainRankNode = require("app.scene.view.redPacketRain.RedPacketRainRankNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local AudioConst = require("app.const.AudioConst")

local RECORD_MAX = 4 --右下角记录的最大数
local MOVE_TIME = 0.5
local POS_INTERVAL = 100 --随机坐标间隔，基于红包尺寸

function RedPacketRainView:ctor()
	local resource = {
		file = Path.getCSB("RedPacketRainView", "redPacketRain"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	RedPacketRainView.super.ctor(self, resource, 17)
end

function RedPacketRainView:onCreate()
	self:_initData()
	self:_initView()
end

function RedPacketRainView:_initData()
	self._schedulePlay = nil
	self._scheduleCountDown = nil
	self._schedulePreCountDown = nil
	self._schedulerRequestRank = nil
	self._finishPreTime = 0 --开始倒计时结束时间
	self._finishTime = 0 --结束时间
	self._minPosX = G_ResolutionManager:getBangOffset() + POS_INTERVAL --红包飘落起始点X坐标随机范围最小值
	self._maxPosX = G_ResolutionManager:getBangDesignWidth() - POS_INTERVAL --红包飘落起始点X坐标随机范围最大值
	self._minPosY = G_ResolutionManager:getDesignHeight() - 200 --弹幕出现起始Y坐标随机
	self._maxPosY = G_ResolutionManager:getDesignHeight() - 50
	self._packetList = {}
	self._recordDataList = {}
	self._recordNodeList = {}
	self._rainInterval = 0 --每个红包掉落的间隔时间
	self._isRecordMoving = false --抢包记录是否在移动
	self:_initRandomPosX()
	self._rankNode = nil
end

--初始化随机坐标X
function RedPacketRainView:_initRandomPosX()
	self._randomPosX = {} --存储x坐标
	self._randomIndex = {} --记录随到的x坐标索引的状态，ture表示正在用到的，false表示没在用到的
	local index = 1
	local posX = self._minPosX
	while posX <= self._maxPosX do
		self._randomPosX[index] = posX
		self._randomIndex[index] = false
		posX = posX + POS_INTERVAL
		index = index + 1
	end
end

function RedPacketRainView:_initView()
	for i = 1, RECORD_MAX do
		local node = cc.Node:create()
		node:setCascadeOpacityEnabled(true)
		local posY = 35*(RECORD_MAX-i)
		node:setPosition(cc.p(0, posY))
		self._nodeRecord:addChild(node)
		table.insert(self._recordNodeList, node)
	end
	self._rankNode = RedPacketRainRankNode.new(handler(self, self._onClickQuit))
	self._nodeRank:addChild(self._rankNode)
	self._rankNode:setVisible(false)
end

function RedPacketRainView:onEnter()
	self._signalEnterSuccess = G_SignalManager:add(SignalConst.EVENT_RED_PACKET_RAIN_ENTER_SUCCESS, handler(self, self._onEventEnterSuccess))
	self._signalGetResult = G_SignalManager:add(SignalConst.EVENT_RED_PACKET_RAIN_GET_SUCCESS, handler(self, self._onEventGetResult))
	self._signalGetNotify = G_SignalManager:add(SignalConst.EVENT_RED_PACKET_RAIN_GET_NOTIFY, handler(self, self._onEventGetNotify))
	self._signalGetResultTimeout = G_SignalManager:add(SignalConst.EVENT_RED_PACKET_RAIN_GET_TIMEOUT, handler(self, self._onEventGetResultTimeout))
	self._signalGetRank = G_SignalManager:add(SignalConst.EVENT_RED_PACKET_RAIN_GET_RANK, handler(self, self._onEventGetRank))

	self:_updateMoney()
	if G_UserData:getRedPacketRain():isPlayed() then
		self._textCountDown:setString("0")
		self:_requestRankInfo()
	else
		self:_popupStartView()
	end
end

function RedPacketRainView:onExit()
	self:_stopRain()
	self:_stopPreCountDown()
	self:_stopCountDown()
	self:_stopRequestRankCountDown()

    self._signalEnterSuccess:remove()
    self._signalEnterSuccess = nil
    self._signalGetResult:remove()
    self._signalGetResult = nil
    self._signalGetNotify:remove()
    self._signalGetNotify = nil
    self._signalGetResultTimeout:remove()
    self._signalGetResultTimeout = nil
    self._signalGetRank:remove()
    self._signalGetRank = nil
end

function RedPacketRainView:_popupStartView()
	local popupStart = PopupRedPacketRainStart.new(handler(self, self._onClickStart), handler(self, self._onClickQuit))
	popupStart:open()
end

function RedPacketRainView:_onClickStart()
	self._finishPreTime = G_ServerTime:getTime() + RedPacketRainConst.TIME_PRE_START
	if self._finishPreTime >= G_UserData:getRedPacketRain():getActEndTime() then
		G_Prompt:showTip(Lang.get("red_pacekt_rain_finish_tip"))
		return false
	end
    self._nodeCount:setVisible(true)
	self:_startPreCountDown()
	return true
end

function RedPacketRainView:_onClickQuit()
	G_SceneManager:popScene()
end

function RedPacketRainView:_startPreCountDown()
    self:_stopPreCountDown()
    self._schedulePreCountDown = SchedulerHelper.newSchedule(handler(self, self._updatePreCountDown), 1)
    self:_updatePreCountDown()
end

function RedPacketRainView:_stopPreCountDown()
    if self._schedulePreCountDown ~= nil then
        SchedulerHelper.cancelSchedule(self._schedulePreCountDown)
        self._schedulePreCountDown = nil
    end
end

function RedPacketRainView:_updatePreCountDown()
	local nowTime = G_ServerTime:getTime()
	local countDownTime = self._finishPreTime - nowTime
    if countDownTime > 0 then
		if countDownTime >= 1 and countDownTime <= 3 then
			G_EffectGfxMgr:createPlayGfx(self._nodeCount, "effect_jingjijishi_"..countDownTime, nil, true)
		end
    else
    	self:_stopPreCountDown()
		self._nodeCount:setVisible(false)
    	G_UserData:getRedPacketRain():c2sEnterNewRedPacket()
    end
end

function RedPacketRainView:_startRain()
	self._packetIndex = 1
    self:_stopRain()
    self._schedulePlay = SchedulerHelper.newSchedule(handler(self, self._updateRain), self._rainInterval)
    self:_updateRain()
end

function RedPacketRainView:_stopRain()
    if self._schedulePlay ~= nil then
        SchedulerHelper.cancelSchedule(self._schedulePlay)
        self._schedulePlay = nil
    end
end

function RedPacketRainView:_updateRain()
	if self._packetIndex > #self._packetList then
		self:_stopRain()
		return
	end

	local index = self:_getRandomIndex()
	local posX = self._randomPosX[index]
	local startPos = cc.p(posX, 590)
	local unitData = self._packetList[self._packetIndex]
	local node = RedPacketNode.new(unitData, index, function(index)
		self._randomIndex[index] = false --状态重置
	end)
	if node then
		node:setPosition(startPos)
		self:addChild(node)
		node:playDrop()
		self._packetIndex = self._packetIndex + 1
	end
end

function RedPacketRainView:_getRandomIndex()
	local indexs = {}
	for k, state in pairs(self._randomIndex) do --把没在用的index收集起来
		if state == false then
			table.insert(indexs, k)
		end
	end
	if #indexs == 0 then
		return 1 --如果全部都在使用中，就返回第一个
	end

	local random = math.random(1, #indexs)
	local index = indexs[random]
	self._randomIndex[index] = true
	return index
end

function RedPacketRainView:_startCountDown()
    self:_stopCountDown()
    self._scheduleCountDown = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function RedPacketRainView:_stopCountDown()
    if self._scheduleCountDown ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleCountDown)
        self._scheduleCountDown = nil
    end
end

function RedPacketRainView:_updateCountDown()
	local nowTime = G_ServerTime:getTime()
	local countDownTime = self._finishTime - nowTime
    if countDownTime > 0 then
    	self._textCountDown:setString(tostring(countDownTime))
    else
    	self:_onFinish()
    end
end

function RedPacketRainView:_onFinish()
	self._textCountDown:setString("0")
	self:_stopCountDown()
	self:_popupSettlement()
end

--弹出结算
function RedPacketRainView:_popupSettlement()
	local data = G_UserData:getRedPacketRain():getReceivedPacketData()
	local popup = PopupRedRainSettlement.new(data, handler(self, self._requestRankInfo))
	popup:openWithAction()
	G_AudioManager:playSoundWithId(AudioConst.SOUND_NEW_FUNC_OPEN)
end

function RedPacketRainView:_onEventEnterSuccess()
	G_AudioManager:playMusicWithId(AudioConst.MUSIC_HORSE_RACE)
	self._packetList = G_UserData:getRedPacketRain():getPacketList()
	self._finishTime = G_ServerTime:getTime() + RedPacketRainConst.TIME_PLAY
	local count = #self._packetList
	local sec = RedPacketRainConst.TIME_PLAY - RedPacketRainConst.TIME_PRE_FINISH
	self._rainInterval = sec / count
	self:_startRain()
	self:_startCountDown()
end

function RedPacketRainView:_onEventGetResult(eventName, packetId)
	local text = nil
	local unitData = G_UserData:getRedPacketRain():getUnitDataWithId(packetId)
	local isReal = unitData:isReal()
	if isReal then
		local type = unitData:getRedpacket_type()
		if type == RedPacketRainConst.TYPE_BIG then
			text = ccui.RichText:createRichTextByFormatString(Lang.get("red_packet_rain_result_big", {num = unitData:getMoney()}),
															{defaultSize = 20})
		else
			text = ccui.RichText:createRichTextByFormatString(Lang.get("red_packet_rain_result_small", {num = unitData:getMoney()}),
															{defaultSize = 20})
		end
	else
		local user = self:_getRandomGrabUser()
		if unitData:isRob() and user then
			local params = {other = {{},{color = Colors.getOfficialColor(user:getOfficer_level())}}}
			text = ccui.RichText:createRichTextByFormatString(Lang.get("red_packet_rain_result_grab", {name = user:getName()}), params)
		else
			text = ccui.RichText:createRichTextByFormatString(Lang.get("red_packet_rain_result_empty"))
		end
	end
	-- self:_playPrompt(text)
	self:_updateMoney()
end

function RedPacketRainView:_getRandomGrabUser()
	local index = math.random(1, #self._recordDataList)
	if self._recordDataList[index] then
		return self._recordDataList[index].user
	else
		return nil
	end
end

function RedPacketRainView:_playPrompt(text)
	local node = cc.Sprite:create(Path.getRedBagImg("img_huodedi"))
	local nodeSize = node:getContentSize()
	text:setPosition(cc.p(nodeSize.width/2, nodeSize.height/2))
	node:addChild(text)
	self:addChild(node)
	local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()
    node:setPosition(cc.p(width/2, height/2))
	local moveBy = cc.MoveBy:create(2.0, cc.p(0, 100))
	local seq = cc.Sequence:create(moveBy, cc.RemoveSelf:create())
	node:runAction(seq)
end

function RedPacketRainView:_onEventGetNotify(eventName, records)
	for i, record in ipairs(records) do
		table.insert(self._recordDataList, record)
	end
	if #records > 0 and self._isRecordMoving == false then
		self:_pushRecordNode()
	end
end

function RedPacketRainView:_onEventGetResultTimeout(eventName)
	self:_stopRain()
	self:_onFinish()
end

function RedPacketRainView:_onEventGetRank(eventName, listInfo, myInfo)
	self:_updateRankView(listInfo, myInfo)
end

function RedPacketRainView:_pushRecordNode()
	local record = self._recordDataList[1]
	if record then
		if record.packet:getRedpacket_type() == RedPacketRainConst.TYPE_BIG then --大红包，弹特效
			self:_playRecordEffect(record)
		end
		self:_pushBullet(record)
		local firstNode = self._recordNodeList[1]
		self._isRecordMoving = true
		self:_moveOut(firstNode, function()
			firstNode:removeAllChildren()
			table.remove(self._recordNodeList, 1)
			table.insert(self._recordNodeList, firstNode)
			table.remove(self._recordDataList, 1)
			local recordNode = self:_createRecordItem(record)
			firstNode:addChild(recordNode)
			firstNode:setPosition(cc.p(0, 0))
			self:_moveIn(firstNode, function()
				if self._recordDataList[1] then
					self:_pushRecordNode()
				else
					self._isRecordMoving = false
				end
			end)
		end)
		for i = 2, RECORD_MAX do
			local node = self._recordNodeList[i]
			self:_moveUp(node)
		end
	end
end

function RedPacketRainView:_createRecordItem(record)
	local name = record.user:getName()
	local officerLevel = record.user:getOfficer_level()
	local money = record.packet:getMoney()
	local node = cc.Sprite:create(Path.getRedBagImg("img_huodedi2"))
	node:setAnchorPoint(cc.p(1, 0))
	node:setCascadeOpacityEnabled(true)
	local formatStr = Lang.get("red_packet_rain_grab_text_1", {name = name, count = money})
	local params = {defaultColor = Colors.DARK_BG_ONE, defaultSize = 20, other = {{color = Colors.getOfficialColor(officerLevel)}}}
	local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
	richText:setAnchorPoint(cc.p(1, 0.5))
	local nodeSize = node:getContentSize()
	richText:setPosition(cc.p(nodeSize.width-5, nodeSize.height/2))
	node:addChild(richText)
	
	return node
end

function RedPacketRainView:_moveIn(node, callback)
	-- local fadeIn = cc.FadeIn:create(MOVE_TIME)
	-- local seq = cc.Sequence:create(fadeIn,
	-- 								cc.CallFunc:create(function()
	-- 									if callback then
	-- 										callback()
	-- 									end
	-- 								end))
	-- node:runAction(seq)
	node:setOpacity(255)
	if callback then
		callback()
	end
end

function RedPacketRainView:_moveOut(node, callback)
	local fadeOut = cc.FadeOut:create(MOVE_TIME)
	local seq = cc.Sequence:create(fadeOut,
									cc.CallFunc:create(function()
										if callback then
											callback()
										end
									end))
	node:runAction(seq)
end

function RedPacketRainView:_moveUp(node)
	local moveBy = cc.MoveBy:create(MOVE_TIME, cc.p(0, 35))
	node:runAction(moveBy)
end

function RedPacketRainView:_playRecordEffect(record)
	local function eventFunction(event, frameIndex, effectNode)
        if event == "finish" then
            effectNode._node:runAction(cc.RemoveSelf:create())
        end
	end

	local name = record.user:getName()
	local officerLevel = record.user:getOfficer_level()
	local money = record.packet:getMoney()
	local formatStr = Lang.get("red_packet_rain_big_get_tip", {name = name, money = money})
	local params = {defaultSize = 26, other = {{color = Colors.getOfficialColor(officerLevel)}}}
	local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
	self:addChild(richText)
	local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()
    richText:setPosition(cc.p(width/2, height/2+120))
	G_EffectGfxMgr:applySingleGfx(richText, "smoving_danmu", eventFunction, nil, nil)
end

function RedPacketRainView:_updateMoney()
	local data = G_UserData:getRedPacketRain():getReceivedPacketData()
	self._textMoney:setString(tostring(data.money))
end

function RedPacketRainView:_pushBullet(record)
	local type = record.packet:getRedpacket_type()
	local name = record.user:getName()
	local officerLevel = record.user:getOfficer_level()
	local money = record.packet:getMoney()
	local formatStr = Lang.get("red_packet_rain_bullet_des", {name = name, money = money})
	local params = {defaultColor = Colors.DARK_BG_ONE, defaultSize = 20, other = {{color = Colors.getOfficialColor(officerLevel)}}}
	local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
	richText:setAnchorPoint(cc.p(0, 0.5))
	
	local node = nil
	if type == RedPacketRainConst.TYPE_BIG then
		node = cc.Sprite:create(Path.getRedBagImg("img_danmu"))
	else
		node = cc.Sprite:create()
	end
	node:setAnchorPoint(cc.p(0, 0.5))
	node:addChild(richText)
	richText:setPosition(cc.p(80, 30))

	local randomPosY = math.random(self._minPosY, self._maxPosY)
	local startPosX = G_ResolutionManager:getDesignWidth()
	local distance = G_ResolutionManager:getDesignWidth() + 500
	local moveBy = cc.MoveBy:create(10.0, cc.p(0-distance, 0))
	local seq = cc.Sequence:create(moveBy, cc.RemoveSelf:create())
	node:setPosition(cc.p(startPosX, randomPosY))
	self:addChild(node)
	node:runAction(seq)
end

function RedPacketRainView:_stopRequestRankCountDown()
    if self._schedulerRequestRank ~= nil then
        SchedulerHelper.cancelSchedule(self._schedulerRequestRank)
        self._schedulerRequestRank = nil
    end
end

function RedPacketRainView:_requestRankInfo()
	self:_stopRequestRankCountDown()
	self._schedulerRequestRank = SchedulerHelper.newSchedule(function()
		G_UserData:getRedPacketRain():c2sGetRedPacketRank()
	end, 30) --30秒刷新一次
	self._rankNode:setVisible(true)
	self._rankNode:setBlackBgVisible(true)
	G_UserData:getRedPacketRain():c2sGetRedPacketRank()
end

function RedPacketRainView:_updateRankView(listInfo, myInfo)
	self._rankNode:updateUI(listInfo, myInfo)
end

return RedPacketRainView