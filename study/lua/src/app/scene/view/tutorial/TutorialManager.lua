-- TutorialManager.lua
--新手引导的管理类
--旨在负责管理新手引导的步数，以及引导的事件处理

--[[
引导状态机的问题： 1.进入游戏， 2.执行， 3.中断
1. 引导只有在进入游戏时，检测引导id。
2. 引导可以连续执行，直到引导处于中断状态
3. 中断状态下，引导id为 30000（一个恒定值）， 这时候只有升级与特殊关卡通关后，才会激活引导， stageid 为新的
4. 中断状态下，引导步骤行走，是通过 TUTORIAL_START_EVENT 事件来推动	
5. 引导步骤不可逆，如何实现？
]]

local TutorialInfo = require("app.config.guide")
local TutorialTipLayer = import(".TutorialTipLayer")
local TutorialHelper = import(".TutorialHelper")
local TutorialStageBase = import(".TutorialStageBase")
local TutorialConst = require("app.const.TutorialConst")
local TutorialManager = class("TutorialManager")

local START_STAGE = 1
local START_STEP = 100

function TutorialManager:ctor()
	-- 新手引导是否开启。这里以后会读取配置文件来判断是否开启
	self._tutorialEnabled = true

	if CONFIG_TUTORIAL_ENABLE ~=nil then
		self._tutorialEnabled = CONFIG_TUTORIAL_ENABLE
	end

	self._tutorialTipLayer = nil

	-- 当前阶段，从服务器获取
	self._curStageId = nil
	-- 阶段列表
	self._stageMap = nil 
	-- 是否是暂时停止
	self._isPause = nil
	self._eventList = {}

	-- 是否屏蔽step事件，特殊情况下用
	self._notProcessStep = false

	-- 开场动画是否正在进行
	self._isPlayingOpening = false

end

function TutorialManager:clear()
	for i,value in pairs( self._eventList ) do
		value:remove()
	end

	self._eventList ={}
	self._curStageId = nil
	self._stageMap = nil
	self._isPause = nil
	self._isPlayingOpening = false
	
	local popupStoryChat = ccui.Helper:seekNodeByName( G_TopLevelNode,"PopupStoryChat" )
	if popupStoryChat then
		popupStoryChat:close()
	end
	self:_resetTipLayer(true)
end

--构建stageMap
function TutorialManager:_buildStageMap()
	self._stageMap = {}
	local stageInfoList = TutorialHelper.getStageList()
	self._stageCfgList = stageInfoList

	for i, stagecfg in ipairs(stageInfoList) do
		local stage = TutorialStageBase.new(stagecfg.stage)
		self._stageMap[stagecfg.stage] = stage
	end
end

--启动客户端时调用，重置时调用
function TutorialManager:_getCurrStageId()
	local guideId = G_UserData:getBase():getGuide_id()
	dump(guideId)
	logNewT( string.format("TutorialManager guide id is [%d]",guideId))
	local currStageId = 0
	if guideId == 0 then
		currStageId = START_STAGE
		return currStageId
	end

	--该阶段为中断节点
	if TutorialHelper.isEndStep(guideId) == true then
		logNewT( string.format("TutorialManager:_getCurrStageId is guide end step[%d]",guideId))
		currStageId = TutorialHelper.STEP_PAUSE
		return currStageId
	end

	--该阶段为起始节点
	if TutorialHelper.isStartStep(guideId) == false then
		logNewT( string.format("TutorialManager:_getCurrStageId is guide start step[%d]",guideId))
		currStageId = TutorialHelper.STEP_PAUSE
		return currStageId
	end

	
	local stepInfo = TutorialHelper.getStageByStepId(guideId)
	currStageId = stepInfo.stage

	-- 如果数据此时不合法，则直接结束此次引导
	if not self:_isTutorialReady(currStageId) then
		local stageObj = self._stageMap[currStageId]
		if stageObj:getNextStepId() and stageObj:getNextStepId() > 0 then
			self:sendUpdateGuideId(stageObj:getNextStepId())
		end
		currStageId = TutorialHelper.STEP_PAUSE
	end

	return currStageId
end

--重置新手引导，主要是针对步数的，如果换一个账号可能步数不同了
function TutorialManager:reset()

	-- 清空原来的数据
	self._curStageId = nil
	self._isPause = nil
	
	self:_buildStageMap()


	-- 监听网络事件
	if self._tutorialEnabled then
		local stageId = self:_getCurrStageId()
		

		self._curStageId = stageId

		-- 是否暂停
		self._isPause = self._curStageId == TutorialHelper.STEP_PAUSE

		-- 重置新手引导层
		self:_resetTipLayer()

		-- 监听网络消息
	
		self._eventList = {}

		--点击事件授权（针对一些模块的表现效果需要使用点击事件的）
		table.insert( self._eventList, G_SignalManager:add(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN, handler(self, self._onAuthTouchBegin), self))
		table.insert( self._eventList, G_SignalManager:add(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END, 	handler(self, self._onAuthTouchEnd), self) )

		-- 新手引导递进消息
		table.insert( self._eventList,  G_SignalManager:add(SignalConst.EVENT_TUTORIAL_STEP, handler(self, self._onEventTutorialStep)) )

		--以下引导事件， 是由中断后再开始
		-- 新手引导升级事件引导开始事件
		table.insert( self._eventList,  G_SignalManager:add(SignalConst.EVENT_TUTORIAL_START, handler(self, self._onEventTutorialStart)))

		--收到升级事件，引导触发
		table.insert( self._eventList,  G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventTutorialLevelUp)) )
		--引导中断后，通关某个关卡触（即战斗后触发的引导）
		table.insert( self._eventList,  G_SignalManager:add(SignalConst.EVENT_TUTORIAL_BATTLE_START, handler(self, self._onEventTutorialBattle)))
		--引导中断后，领取关卡宝箱触发
		table.insert( self._eventList,  G_SignalManager:add(SignalConst.EVENT_CHAPTER_STAGE_BOX, handler(self, self._onEventTutorialBoxReward)))
		--游历通关后，触发
		table.insert( self._eventList,  G_SignalManager:add(SignalConst.EVENT_EXPLORE_GET_REWARD, handler(self, self._onEventTutorialExplore)))


		--引导中断后，南蛮入侵触发
		table.insert( self._eventList,  G_SignalManager:add(SignalConst.EVENT_TRIGGER_REBEL_ARMY, handler(self, self._onEventTutorialRebel)))
	end

end


--是否开启新手引导
function TutorialManager:isTutorialEnabled()
	return self._tutorialEnabled
end

function TutorialManager:setTutorialEnabled(enable)
	self._tutorialEnabled = enable
end


function TutorialManager:isDoingStep(currStageId)
	if not self._tutorialEnabled then return false end
	if self._isPause then return false end

	-- 屏蔽step事件之后直接返回
	if self._notProcessStep then
		return false
	end
	if self._stageMap == nil or self._curStageId == nil then
		return false
	end
	--获得当前阶段
	if currStageId then
		local curStage = self._stageMap[self._curStageId]
		if  currStageId == self._curStageId and curStage  then
			return true
		end
	else
		local curStage = self._stageMap[self._curStageId]
		if curStage then
			return true
		end
	end
	return false
end

--是否有引导
--@param callback 如果没有引导会调用此回调
function TutorialManager:hasTutorial(callback)
	-- 新手引导的具体执行函数
	local function onTutorialCallback()
		-- 新手引导被关闭了，则返回
		if not self._tutorialEnabled or self._isPause then
			-- 清理界面
			if not self._isPause then
				self:_finish()
			else
				self:_pause()
			end
			if callback then
				callback()
			end
			return
		end

		local info = TutorialHelper.getStageById(self._curStageId)
		if not info then
			-- 新手引导结束
			self:_finish()
			if callback then
				callback()
			end
			return
		end

		self:_resetTipLayer()

		-- 执行新手引导
		self:_onEventTutorialStep()

	end

	-- 如果还在开场动画之中
	if self._isPlayingOpening then

		self:_resetTipLayer(true)
		-- 继续下一步开场引导
		self._openingSteps.nextStep(onTutorialCallback)
	else
		-- 否则就开始新手引导
		onTutorialCallback()
	end

end

-- 授权点击事件
function TutorialManager:_onAuthTouchBegin(_, param)
	if not self._tutorialEnabled then return end
	if self._isPause then return end
	if self._tutorialTipLayer == nil then return end

	logNewT("TutorialManager:_onAuthTouchBegin")

	local rect = type(param) == "table" and param or cc.rect(0, 0, display.width, display.height)

	self._tutorialTipLayer:pushAuthTouchRect(rect)

	if type(param) == "boolean" then
		self._notProcessStep = param
	end
end

-- 授权点击事件完成

function TutorialManager:_onAuthTouchEnd()

	if not self._tutorialEnabled then return end
	if self._isPause then return end
	if self._tutorialTipLayer == nil then return end


	self._tutorialTipLayer:popAuthTouchRect()

	self._notProcessStep = false

end

function TutorialManager:clearTipLayer()
	self._tutorialTipLayer:clearTip()
	self._tutorialTipLayer:setTouchRect(cc.rect(0, 0, 0, 0))
end
-- 执行新手流程
function TutorialManager:_onEventTutorialStep(_, params)
	if not self._tutorialEnabled then return end
	if self._isPause then return end

	-- 屏蔽step事件之后直接返回
	if self._notProcessStep then
		return
	end

	local function doNextStep()

		--获得当前阶段
		local curStage = self._stageMap[self._curStageId]
		if params then
			logNewT("TutorialManager:_onEventTutorialStep : "..params)
			--针对特定阶段忽略一些事件
			if curStage and curStage:ignoreEvent(params) == false then
				return
			end
		end
		

		if self._tutorialTipLayer then
			self._tutorialTipLayer:clearTip()
			self._tutorialTipLayer:setTouchRect(cc.rect(0, 0, 0, 0))
		end

		if curStage then
		
			--执行当前阶段,返回false，说明该阶段做完
			if curStage:doNextStep(self._tutorialTipLayer, params, doNextStep) == false then
				--找到下一个可执行阶段
				local nextStageId = curStage:getNextStageId()
				local nextStepId = curStage:getNextStepId()
				
				if nextStepId > 0 then
					self:sendUpdateGuideId(nextStepId)
				end                  

				self._curStageId = nextStageId
				if self._curStageId == TutorialHelper.STEP_PAUSE then
					logNewT("Tutorial is pause : "..self._curStageId)
					self:_pause()
				elseif not TutorialHelper.getStageById(self._curStageId) then
					logNewT("Tutorial is finish : "..self._curStageId)
					self:_finish()
				else
					logNewT("do next stage : "..self._curStageId)
					
					self:_onEventTutorialStep()
				end
				-- 销毁当前引导流程
				curStage:destroy()
			end
		end
	end
	doNextStep()
end

function TutorialManager:_procEventActiveStage(filterType,params)
	logNewT("TutorialManager:_procEventActiveStage")
	if not self._tutorialEnabled then return end
	if not self._isPause then return end

	-- 查找当前升级的匹配的引导数据
	local curStage = self:_findActiveStage(filterType, params) --1代表升级, 2关卡

	-- 找不到就返回
	if not curStage then return end

	-- 这里不能直接开始新手引导，要等待升级界面
	-- 但是要先登记
	if curStage:getId() ~= self._curStageId then
		self:sendUpdateGuideId(curStage:getStepId())
		self._curStageId = curStage:getId()
		logNewT("TutorialManager:_procEventActiveStage newStageId is "..self._curStageId)
		self._isGuideInvalid = true
	end

end
function TutorialManager:_onEventTutorialBattle(id, params)
	logNewT("TutorialManager:_onEventTutorialBattle")
	self:_procEventActiveStage(TutorialConst.STAGE_ACTIVE_STORY, params)
end

function TutorialManager:_onEventTutorialLevelUp(id, params)
	logNewT("TutorialManager:_onEventTutorialLevelUp")
	self:_procEventActiveStage(TutorialConst.STAGE_ACTIVE_LEVEL, params)
end

function TutorialManager:_onEventTutorialBoxReward(id, params)
	logNewT("TutorialManager:_onEventTutorialBoxReward")
	self:_procEventActiveStage(TutorialConst.STAGE_ACTIVE_BOX_AWARD, params)
end

function TutorialManager:_onEventTutorialExplore(id, params)
	logNewT("TutorialManager:_onEventTutorialExplore")
	self:_procEventActiveStage(TutorialConst.STAGE_EXPLORE_FINISH_AWARD, params)
end

function TutorialManager:_onEventTutorialRebel( id, params )
	logNewT("TutorialManager:_onEventTutorialRebel")
	self:_procEventActiveStage(TutorialConst.STAGE_REBEL_EVENT, params)
end

--找到当前满足条件的引导
function TutorialManager:_findActiveStage(filterType,params)
	for i, stageCfg in ipairs(self._stageCfgList) do
		local stage = self._stageMap[stageCfg.stage]
		
		if stage and stage:isFilterType(filterType, params) == false then
			--是否满足触发条件
			if stage:isActivie() then
				return stage
			end
		end
	end
	return nil
end



function TutorialManager:_isTutorialStartEvent(stageId, eventName)
	local stage = self._stageMap[stageId]
	if stage then
		return stage:isStartEvent(eventName)
	end
	return false
end

-- 引导是否准备好开始了
function TutorialManager:_isTutorialReady(stageId)

	local stage = self._stageMap[stageId]
	if stage then
		return stage:isActivie()
	end

	return true
end



-- 新手引导升级事件相关引导开始事件
function TutorialManager:_onEventTutorialStart(id, param)

	if not self._tutorialEnabled then return end
	--只有在中断状态下，才会触发
	if not self._isPause then return end
	if not self._curStageId then return end

	--判定起始事件是否正确
	if not self:_isTutorialStartEvent(self._curStageId, param) then
		return
	end

	logNewT(string.format("TutorialManager:_onEventTutorialStart on event[%s], currStageId[%d]", 
			tostring(param), self._curStageId))

	-- 如果数据此时不合法，则直接结束此次引导
	if not self:_isTutorialReady(self._curStageId) then
		local curStage = self._stageMap[self._curStageId]
		local nextStepId = curStage:getNextStepId()
		if nextStepId and nextStepId > 0 then
			self:sendUpdateGuideId(nextStepId)
		end
		
		self._curStageId = nil
		return
	end



	self._isPause = false
	-- 重置引导层
	self:_resetTipLayer()
	-- 然后开始新手引导
	self:_onEventTutorialStep(id, param)
end

-- 新手引导完成
function TutorialManager:_finish()
	self:clear()
end

-- 新手引导暂停

function TutorialManager:_pause()
	self:_resetTipLayer(true)
	self._isPause = true
	self._curStageId = nil
	self._curTutorials = nil
	self._nextTutorialStep = nil
end

-- 重置屏蔽层

function TutorialManager:_resetTipLayer(cleanup)

	if not self._tutorialTipLayer then
		self._tutorialTipLayer = TutorialTipLayer.new()
		self._tutorialTipLayer:retain()		
		G_TopLevelNode:addTutorialLayer(self._tutorialTipLayer)	
		self._tutorialTipLayer:setName("TutorialTipLayer")
	end

	if not cleanup then

	else
		self._tutorialTipLayer:removeFromParent()
		-- 自定义清理方法
		self._tutorialTipLayer:destroy()
		self._tutorialTipLayer:release()
		self._tutorialTipLayer = nil
	end
end

function TutorialManager:sendUpdateGuideId(guideId)
	logNewT(string.format("TutorialManager:sendUpdateGuideId[%d],", guideId))
	G_NetworkManager:send(MessageIDConst.ID_C2S_UpdateGuideId,{guide_id = guideId})
end


function TutorialManager:dumpInfo()
	local curStage = self._stageMap[self._curStageId]
	dump(  self._curStageId )
	if curStage then
		dump(  curStage._currStep )
	end
end

--[=========================[

	是否有开场引导
	开场动画东西不多，直接认为是引导的一部分好了

	@param callback 如果没有引导会调用此回调

]=========================]

function TutorialManager:hasOpeningTutorial(onFinishCallback)

	if self._isPlayingOpening then return end

	self._isPlayingOpening = true

	-- 开场是固定流程
	local steps = {

		-- 全屏旁白
		function(callback)
			--local MovieConst = require("app.const.MovieConst")
			--local PopupMovieText = require("app.ui.PopupMovieText").new(MovieConst.TYPE_LOGIN_START,callback)
			--PopupMovieText:showUI()
			callback()
			logNewT("MovieConst.TYPE_LOGIN_START")
		end,

		--播放一场战斗
		function(callback)
		
			local function playMovice()
				local function finish( ... )
					if callback then
						callback()
					end
					G_SceneManager:popScene()
				end
				local MovieConst = require("app.const.MovieConst")
				local PopupMovieText = require("app.ui.PopupMovieText").new(MovieConst.TYPE_CREATE_ROLE_START,callback)
				PopupMovieText:showUI()
				logNewT("MovieConst.TYPE_CREATE_ROLE_START")
			end

			G_SceneManager:showScene("firstfight", playMovice)
		end,
		

		-- 等待创角
		function(callback)


			if onFinishCallback then
				onFinishCallback()
			end
	


			logNewT("Create role Scene")
		end,

		-- 创角后的旁白
		function(callback)

			local function finish()
				self._isPlayingOpening = false
				if callback then
					callback()
				end
			end
			finish()
			--local MovieConst = require("app.const.MovieConst")
			--local PopupMovieText = require("app.ui.PopupMovieText").new(MovieConst.TYPE_LOGIN_END,finish)
			--PopupMovieText:showUI()
		end
	}

	local index = 1
	local onGuideCallback = nil

	local function nextStep(callback)

		-- 来自引导内部的流程转接
		onGuideCallback = onGuideCallback or callback

		-- 加个锁，防止连续点击
		local lock = false
		local function nextHandler()

			if lock then return end
			lock = true

			-- 开场结束了
			if index > #steps then
				-- 开场引导结束后的回调
				if onGuideCallback then
					onGuideCallback()
				end
				return
			end

			nextStep()
		end
		
		local stepProc = steps[index]
		index = index + 1

		if stepProc then
			stepProc(nextHandler)
		end

	end

	nextStep()

	-- 保存一下开场的步数和当前步长
	self._openingSteps = steps
	-- 将nextStep方法保存在步数之中
	steps.nextStep = nextStep

end

return TutorialManager