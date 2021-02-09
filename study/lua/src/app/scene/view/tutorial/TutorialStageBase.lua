
-- TutorialStageBase.lua

--[[
	引导流程基类
	主要负责对一些基础引导的流程的数据的整理，比如每一步可能都有的说话，最后的步数跳转等
]]


local TutorialHelper = import(".TutorialHelper")
local TutorialStageScript = import(".TutorialStageScript")
local TutorialStepHelper = import(".TutorialStepHelper")
local TutorialConst = require("app.const.TutorialConst")

local TutorialStageBase = class("TutorialStageBase")


--[[
local stepData = {
	cfg = nil, --配置数据
	doFunction = nil, --执行步骤函数
}
]]

function TutorialStageBase:ctor(stageId)
	-- 保存新手引导的数据
	local stepList, stageInfo = TutorialHelper.getStepList(stageId)
	self._stepCfgList = stepList
	self._stageCfg = stageInfo
	self._stepDataList = {}
	self._currStep = 0
	self._jumpStepId = 0

	--执行阶段触发检查，如果满足则执行
	self._doCheckFunc = TutorialStageScript["checkStage"..stageId]
	self._doIgnoreEvent = TutorialStageScript["ignoreEvent"..stageId]

	self:_buildStepList(stageId)

end

function TutorialStageBase:_buildStepList(stageId)
	self._stepDataList = {}
	local function defFunc()
		for i, value in ipairs(self._stepCfgList) do
			table.insert(self._stepDataList, self:_createStepData(value,i) )
		end
	end
	local buildFunc = TutorialStageScript["buildStage"..stageId] or defFunc

	buildFunc(self)
end
function TutorialStageBase:getStepCfgList()
	return self._stepCfgList
end

function TutorialStageBase:_init()

end

function TutorialStageBase:getId()
	return self._stageCfg.stage
end

function TutorialStageBase:ignoreEvent( eventName )
	-- body
	logWarn("TutorialStageBase:ignoreEvent")
	if self._doIgnoreEvent then
		return self._doIgnoreEvent(self,eventName)
	end
	return true
end

--新手引导从中断激活的第一个步骤，需要判定 EVENT_TUTORIAL_START 事件参数
function TutorialStageBase:isStartEvent(params)
	if params == nil then
		return false
	end

	local eventType = self._stageCfg.event_type
	logNewT(string.format("TutorialStageBase:isStartEvent [%d] [%s]",eventType, params))

	if eventType == TutorialConst.STAGE_ACTIVE_LEVEL then
		if params == "PopupPlayerLevelUp" then
			return true
		end
	end
	if eventType == TutorialConst.STAGE_ACTIVE_STORY then
		if params == "FightView" then
			return true
		end
	end

	if eventType == TutorialConst.STAGE_ACTIVE_BOX_AWARD then
		if params == "PopupGetRewards" then
			return true
		end
	end
	--游历奖励获取激活引导
	if eventType == TutorialConst.STAGE_EXPLORE_FINISH_AWARD then
		if params == "PopupGetRewards" then
			return true
		end
	end

	--游历奖励获取激活引导
	if eventType == TutorialConst.STAGE_REBEL_EVENT then
		if params == "PopupSiegeCome" then
			return true
		end
	end
	return false
end


function TutorialStageBase:_isEventMatch(params)
	local eventType = self._stageCfg.event_type
	local eventValue = self._stageCfg.event_param
	local levelMin = self._stageCfg.level_min 
	local levelMax = self._stageCfg.level_max

	if eventType == 0 then
		return false
	end

	local curLevel = G_UserData:getBase():getLevel()
	if levelMin > 0 and levelMax > 0 then
		if curLevel < levelMin or curLevel > levelMax then
			return false
		end
	end
	---------------------------------
	local function levelTypeActive()
		return true
	end
	if eventType == TutorialConst.STAGE_ACTIVE_LEVEL then
		return levelTypeActive()
	end
	---------------------------------
	local function storyTypeActive()
		local stageId = params.battleId
		--通关关卡
		logNewT("storyTypeActive open stage story by id :"..stageId)
		if eventValue == stageId then
			return true
		end
		return false
	end
	if eventType == TutorialConst.STAGE_ACTIVE_STORY then
		return storyTypeActive()
	end
	---------------------------------
	local function boxTypeActive()
		local boxId = params-- boxId or stageId
		dump(boxId)
		dump(eventValue)
		if eventValue == boxId then
			return true
		end
		return false
	end

	if eventType == TutorialConst.STAGE_ACTIVE_BOX_AWARD then
		return boxTypeActive()
	end
	local function exploreTypeActive()
		local exploreId = params.id-- boxId or stageId

		local passCount = G_UserData:getExplore():getPassCount(exploreId)
		dump(passCount)
		if eventValue == exploreId and passCount == 2 then
			return true
		end
		return false
	end

	if eventType == TutorialConst.STAGE_EXPLORE_FINISH_AWARD then
		return exploreTypeActive()
	end

	--处理南蛮入侵事件
	if eventType == TutorialConst.STAGE_REBEL_EVENT then
		--引导没处理过南蛮入侵
		local count = G_UserData:getBase():getOpCountSiege()
		local siegeCount = #G_UserData:getSiegeData():getSiegeEnemys()
		local guideId = G_UserData:getBase():getGuide_id()
		dump(count)
		dump(siegeCount)
		dump(guideId)
		if count == 0 and guideId < 8000 then
			return true
		end
		return false
	end
end


function TutorialStageBase:isFilterType(filterType,params)
	filterType = filterType or TutorialConst.STAGE_ACTIVE_LEVEL
	local eventType = self._stageCfg.event_type
	--是否过滤
	if eventType == filterType then
		if self:_isEventMatch(params) == true then
			return false
		end
	end
	return true
end
--该新手引导阶段是否能触发
function TutorialStageBase:isActivie()
	local curLevel = G_UserData:getBase():getLevel()
	local eventType = self._stageCfg.event_type
	local eventValue = self._stageCfg.event_param
	local levelMin = self._stageCfg.level_min 
	local levelMax = self._stageCfg.level_max 

	if eventType == 0 then
		return true
	end

	logNewT("curr level :"..curLevel)
	logNewT("need level levelMin :"..levelMin.." levelMax: "..levelMax)

	-- 不在等级范围内的则不满足
	if levelMin > 0 and levelMax > 0 then
		if curLevel < levelMin or curLevel > levelMax then
			return false
		end
	end

	---------------------------------
	local function levelTypeActive()
		if self._doCheckFunc then
			return self._doCheckFunc(self)
		end
		return true
	end
	if eventType == TutorialConst.STAGE_ACTIVE_LEVEL then
		return levelTypeActive()
	end
	---------------------------------
	local function storyTypeActive()
		if self._doCheckFunc then
			return self._doCheckFunc(self)
		end
		return true
	end
	if eventType == TutorialConst.STAGE_ACTIVE_STORY then
		return storyTypeActive()
	end
	---------------------------------
	local function boxTypeActive()
		if self._doCheckFunc then
			return self._doCheckFunc(self)
		end
		return true
	end

	if eventType == TutorialConst.STAGE_ACTIVE_BOX_AWARD then
		return boxTypeActive()
	end
	----------------------------------
	--游历引导监测
	local function exploreTypeActive()
		if self._doCheckFunc then
			return self._doCheckFunc(self)
		end
		return true
	end

	if eventType == TutorialConst.STAGE_EXPLORE_FINISH_AWARD then
		return exploreTypeActive()
	end


	----------------------------------
	--南蛮入侵引导触发
	local function rebelTypeActive()
		if self._doCheckFunc then
			return self._doCheckFunc(self)
		end
		return true
	end
	if eventType == TutorialConst.STAGE_REBEL_EVENT then
		return rebelTypeActive()
	end

	local function scriptTypeActive( ... )
		-- body
		if self._doCheckFunc then
			return self._doCheckFunc(self)
		end
		return true
	end
	if eventType == TutorialConst.STAGE_SCRIPT_CHECK then
		return scriptTypeActive()
	end
	return true
end

--新手引导,激活后执行
function TutorialStageBase:doActivie()

end

function TutorialStageBase:_doNextStep(nextStepFuc)


	--dump(#self._stepDataList)
	--1.当前步骤加1
	local currStepData = self._stepDataList[self._currStep]
	self._currStep = self._currStep + 1 
	local nextStepData = self._stepDataList[self._currStep]
	
	if nextStepData == nil then -- finish
		logNewT("TutorialStageBase:_doNextStep return false")
		return false
	end

	--dump(nextStepData)
	--执行下一步周的function函数
	---dump(self._currStep)
	--dump(nextStepData.doFunction)
	if nextStepData.doFunction and type(nextStepData.doFunction) =="function" then
		local cfgId = 0
		if nextStepData.cfg then
			cfgId = nextStepData.cfg.id
		end
		local paramsMsg = self._params
		if paramsMsg == nil or type(paramsMsg) == "table" then
			paramsMsg = ""
		end
		
		crashPrint(string.format("TutorialStageBase:doNextStep currstep[%d] cfgId[%d] [%s]", self._currStep, cfgId, paramsMsg))
		nextStepData.doNextStep = nextStepFuc --连续执行新手步骤时使用
		local retFunc = nextStepData.doFunction(nextStepData,self._tipLayer,self._params)
		if retFunc == nil then
			retFunc =  true
		end

		return retFunc
	end
	return true
end
--执行下一步
function TutorialStageBase:doNextStep(tipLayer,params,nextStepFuc)
	-- body
	self._tipLayer = tipLayer
	self._params = params

	if self:_doNextStep(nextStepFuc) == false then
		return false
	end

	return true
end

function TutorialStageBase:getCurrStep()
	return self._stepDataList[self._currStep]
end

function TutorialStageBase:getNextStageId( ... )
	-- body
	
	return self._stageCfg.next_stage or 0
end


function TutorialStageBase:getStepId( ... )
	return self._stageCfg.id or 0
end


function TutorialStageBase:getNextStepId( ... )
	-- body
	--如果下一阶段不存在，则返回当前阶段最后一步
	if self._stageCfg.next_stage == TutorialHelper.STEP_PAUSE then
		local endStepInfo = self._stepCfgList[#self._stepCfgList]
		return endStepInfo.id
	end

	local stepList, nextStepStart = TutorialHelper.getStepList(self._stageCfg.next_stage)
	return nextStepStart.id or 0
end

function TutorialStageBase:updateJumpStepId()
	local disconnectId = self._stageCfg.disconnect_id
	if disconnectId and disconnectId > 0 then
		self._jumpStepId = disconnectId
		--将step移动到跳转id
		local function moveToJumpId(disconnectId)
			for i, value in ipairs(self._stepDataList) do
				if value == disconnectId then
					return i
				end
			end
		end

		self._currStep = moveToJumpId(disconnectId)
	end
end



--根据配置数据，构建新手引导步骤
function TutorialStageBase:_createStepData(stepInfo,index)
	local stepData = {
		cfg = nil, --配置数据
		doFunction = nil, --执行步骤函数
		owner = nil,
		index = index,
	}
	stepData.cfg = stepInfo
	stepData.owner = self
	stepData.doFunction = self:_getStepDoFunc(stepInfo)

	return stepData
end


--根据该步骤类型，获得执行函数
function TutorialStageBase:_getStepDoFunc(stepCfg)
	local funcName = TutorialConst.getStepTypeName(stepCfg.type)
	local funcValue = TutorialStepHelper[funcName]

	if funcValue and type(funcValue) == "function" then
		return funcValue
	end
	return nil
end

--销毁当前新手引导步数数据
function TutorialStageBase:destroy()
	self:_clear()
end

--[[
	销毁当前新手引导步数数据
]]
function TutorialStageBase:_clear()

	local SocketManager = require "app.manager.SocketManager"

	if self._oldNetwork and
		self._oldSendFunc and
		self._oldNetwork == SocketManager then
		SocketManager.send = self._oldSendFunc
	end

	self._oldNetwork = nil
	self._oldSendFunc = nil
end



-- 绑定指定的协议，捆绑打包发送新手引导id
function TutorialStageBase:bindProtoMsg(msgId)

	if not msgId or type(msgId) ~= "number" then

    end
	logNewT(string.format("TutorialStageBase:bindProtoMsg MsgId[%d],",  msgId))

	local NetworkManager = G_NetworkManager
	local oldSend = NetworkManager.send
	-- debug
	if self._oldSendFunc and self._oldSendFunc ~= oldSend then
	    self._oldSendFunc = nil
	    self._oldNetwork = nil
	end

	-- 保存起来，如果中途销毁可以赋值回去
	self._oldSendFunc = oldSend
	self._oldNetwork = NetworkManager

	-- 将发送出去的消息二次打包，只针对新手引导涉及到的引导步骤，其他消息照旧
	NetworkManager.send = function(manager, id, buff)
		-- debug 
		if not id or type(id) ~= "number" then
			
	    end
		-- 必须是绑定的消息才打包引导id，因为这里面可能会混入其他的协议，比如心跳，同步时间之类的
		if msgId == id then
			--有中断节点则发送协议给服务器
			local currStepData =  self:getCurrStep()

			if currStepData and currStepData.cfg and currStepData.cfg.disconnect_id > 0 then
				local nextStepId = currStepData.cfg.disconnect_id

				--发送中断阶段给服务器
				local encodeBuff = pbc.encode(MessageConst["cs" .. id], buff)
				
				local msgBuffer = {
					guideid = nextStepId,
					sub_msgid = id,
					sub_msg = encodeBuff}

				dump(msgBuffer)
				oldSend(manager, MessageIDConst.ID_C2S_GeneralGuide, msgBuffer)
				logNewT(string.format("NetworkManager.send guide stage to nextStepId[%d] MsgId[%d],", nextStepId, msgId))
			end
			-- 最后要把方法赋值回去
			NetworkManager.send = oldSend
		else
			oldSend(manager, id, buff)
		end
	end

end

--[[
	终止一个流程
]]

function TutorialStageBase:stop()
	-- 直接将下一步置为30000，表示终止
	self._info.next_step = 30000
	self._totalSteps = {}
	self._headSteps = {}
	self._bottomSteps = {}
	self._baseSteps = {}
	self._dialogueSteps = {}

end



--[[
	添加流程至流程底部
	steps 需添加的流程，可以是一组（table），也可以是一个（function)
]]

function TutorialStageBase:addStepData(stepData)
	stepData.owner = self
	table.insert(self._stepDataList,stepData)
end

function TutorialStageBase:addStepDataList( stepDataList )
	-- body
--	dump(stepDataList)
	for i, stepData in ipairs(stepDataList) do
		self:addStepData(stepData)
	end
end

function TutorialStageBase:addStepToBottom(stepData)
	stepData.owner = self
	table.insert(self._stepDataList,stepData)
end

function TutorialStageBase:addStepToTop(func)
	local stepData = {}
	stepData.owner = self
	stepData.cfg = nil
	stepData.doFunction = func
	stepData.doNextStep = nil
	table.insert(self._stepDataList,1,stepData)
end


return TutorialStageBase