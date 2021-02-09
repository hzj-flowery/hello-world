-- TutorialStepHelper.lua
-- 新手引导步骤帮助类
-- 主要是方便构建引导步骤
-- 新手引导修改了多遍。。
-- 当策划有新的引导需求，你又很痛苦的添加时，那就是问题所在。 说明机制复杂，添加繁琐，麻烦。
-- 这时候留下的几条路： 1. 再次反思，从重构入手。 2. 由他去，修修补补。
-- 我选择了第一条路，反思本是程序员的思维习惯，改善重构才能让自己设计破茧而出。
-- 因此得到了一个经验是，痛苦的修改，一定是不“优美”的代码造成的
local TutorialStepHelper = {}
local TextHelper = require("app.utils.TextHelper")
local FunctionConst = require("app.const.FunctionConst")

local EffectGfxNode = require("app.effect.EffectGfxNode")
-- 暂停
TutorialStepHelper.STEP_PAUSE = 30000

-----------------------------------------------------------------------------------------------------
--根据TutorialConst做函数调用
-----------------------------------------------------------------------------------------------------


function TutorialStepHelper.STEP_TYEP_CLICK(stepData,tipLayer,params)
	

	local TutorialStepExtend = require("app.scene.view.tutorial.TutorialStepExtend")
	local stepTable = TutorialStepExtend["step"..stepData.cfg.id]
	if stepTable == nil then
		assert(false, string.format("stepTable is null stepId[%d]",stepData.cfg.id))
	end
	
	TutorialStepHelper.commonClickFunc(stepTable,stepData,tipLayer)
end


function TutorialStepHelper.STEP_TYEP_TALK(stepData,tipLayer,params)

	local TutorialStepExtend = require("app.scene.view.tutorial.TutorialStepExtend")
	local stepTable = TutorialStepExtend["step"..stepData.cfg.id]
	local eventName = params

	local function onChatFinish( ... )
		--扔出新手引导事件
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"OnChatFinish")
	end

	--显示剧情对话框
	if stepData.cfg.text_id > 0 then
		-- local ChatView = require("app.scene.view.storyChat.ChatView")
		-- local chatView = ChatView.new(stepData.cfg.text_id,onChatFinish)
		-- chatView:setPosition(cc.p(display.width*0.5, display.height*0.5))

		local PopupStoryChat = require("app.scene.view.storyChat.PopupStoryChat")
		local chatView = PopupStoryChat.new(stepData.cfg.text_id,onChatFinish)
	
		chatView:setPosition(G_ResolutionManager:getDesignCCPoint())
		G_TopLevelNode:addTutorialLayer(chatView)
	end
end

function TutorialStepHelper.STEP_TYEP_WAIT(stepData,tipLayer,params)
	local TutorialStepExtend = require("app.scene.view.tutorial.TutorialStepExtend")
	local stepTable = TutorialStepExtend["step"..stepData.id]
	--步骤延迟

end

function TutorialStepHelper.STEP_TYEP_JUMP(stepData,tipLayer,params)
	local TutorialStepExtend = require("app.scene.view.tutorial.TutorialStepExtend")
	local stepTable = TutorialStepExtend["step"..stepData.cfg.id]
	local funcId = stepData.cfg.type_param1
	logNewT("TutorialStepHelper.STEP_TYEP_JUMP "..tostring(funcId))
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(funcId)

	local function jumpFuncCallback()
		--扔出新手引导事件
		--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end

	jumpFuncCallback()
	if stepTable and stepTable.func then
		return stepTable.func(stepData, tipLayer)
	end
end

function TutorialStepHelper.STEP_TYEP_SCRIPT(stepData,tipLayer,params)
	local TutorialStepExtend = require("app.scene.view.tutorial.TutorialStepExtend")
	local stepTable = TutorialStepExtend["step"..stepData.cfg.id]
	if stepTable.func then
		return stepTable.func(stepData, tipLayer)
	end
end

-----------------------------------------------------------------------------------------------------
--通用函数
-----------------------------------------------------------------------------------------------------

function TutorialStepHelper.createStepDataById(stepId)
	local TutorialHelper = require("app.scene.view.tutorial.TutorialHelper")
	local stepInfo = TutorialHelper.getStepInfo(stepId)
	local stepData = TutorialStepHelper._createStepData(stepInfo)
	return stepData
end


--根据配置数据，构建新手引导步骤
function TutorialStepHelper._createStepData(stepInfo,index)
	local TutorialConst = require("app.const.TutorialConst")
	local stepData = {
		cfg = nil, --配置数据
		doFunction = nil, --执行步骤函数
		owner = nil,
		index = index,
	}
	local function getStepDoFunc(stepInfo)
		local funcName = TutorialConst.getStepTypeName(stepInfo.type)
		local funcValue = TutorialStepHelper[funcName]

		if funcValue and type(funcValue) == "function" then
			return funcValue
		end
		return nil
	end

	stepData.cfg = stepInfo
	stepData.owner = self
	stepData.doFunction = getStepDoFunc(stepInfo)

	return stepData
end


--类似于空步骤，战斗中使用。
--将FightView的 退出接口重置掉
function TutorialStepHelper.createReplaceBattlePopStep(needReplaceScene)



	local stepData = {
		cfg = nil, --配置数据
		doFunction = nil, --执行步骤函数
		owner = nil,
	}
	stepData.cfg = stepInfo
	stepData.owner = owner

	local function checkInTheFight(stepData)
		local root = ccui.Helper:seekNodeByName( display.getRunningScene(), "FightView")
		if root == nil then
			return false
		end
		logWarn("TutorialStepHelper.createReplaceBattlePopStep checkInTheFight true")
		return true
	end

	if needReplaceScene == true then
		local function replaceFunc( stepData )		
			if  G_SceneManager.fightScenePop and checkInTheFight(stepData) == true then
				local oldFunc = G_SceneManager.fightScenePop
				local function replacFunc()
					logWarn("TutorialStepHelper.createReplaceBattlePopStep owner, postEvent")
					--恢复退出函数
					G_SceneManager.fightScenePop = function( ... )
					 	crashPrint("fightScenePop:fightScenePop")
    					G_SceneManager:popScene()
					end
					--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"FightView finish") 
				end
				G_SceneManager.fightScenePop = replacFunc
				logWarn("replace exitFight")
			end
			stepData.doNextStep()
		end
		stepData.doFunction = replaceFunc
	else
		stepData.doFunction = function(stepData) 
			stepData.doNextStep()
		end
	end

	return stepData
end

function TutorialStepHelper.createEmptyStep()
	local stepData = {
		cfg = nil, --配置数据
		doFunction = nil, --执行步骤函数
		owner = nil,
	}

	stepData.cfg = stepInfo
	stepData.owner = owner
	local function empty( ... )
		-- body
		logWarn("TutorialStepHelper.createEmptyStep")
	end
	stepData.doFunction = empty
	return stepData
end

function TutorialStepHelper.createWaitStep(duration)
	local retData = TutorialStepHelper.createStepAsync(function(stepData)
		if stepData and stepData.doNextStep then
			stepData.doNextStep()
		end
	end, duration)
	return retData
end



function TutorialStepHelper.createStepAsync(stepFunc, duration)
	assert( type(stepFunc) == "function","Invalid steps: "..tostring(stepFunc))
	-- 伪造一个步长，来模拟异步流程调用

	local SchedulerHelper = require ("app.utils.SchedulerHelper")

	local retData = TutorialStepHelper.createFuncStep( function( ... )
		local params = {...}
		SchedulerHelper.newScheduleOnce(function()
			stepFunc(unpack(params))
		end, duration or 0)
	end)

	return retData
end

function TutorialStepHelper.createFuncStep(func)
	local stepData = {
		cfg = nil, --配置数据
		doFunction = nil, --执行步骤函数
		owner = nil,
	}
	stepData.cfg = nil
	stepData.owner = owner
	stepData.doFunction = func
	return stepData
end

function TutorialStepHelper.showSimulateGuide(stepData,rect,tipLayer,callBackFunc,offset)
	if rect ~= nil then
		local nodePos = tipLayer:convertToNodeSpace(cc.p(rect.x, rect.y))
		rect.x = nodePos.x
		rect.y = nodePos.y
		--添加手指
		local effectNode = EffectGfxNode.new("effect_finger")
		tipLayer:addChild(effectNode)
		effectNode:play()
		local posX, posY = rect.x + rect.width/2, rect.y + rect.height/2
		if offset then
			posX = posX + offset.x
			posY = posY + offset.y
		end
		effectNode:setPosition(cc.p(posX, posY))

		TutorialStepHelper.simulateGuide(tipLayer, rect, callBackFunc,stepData)
	else
		TutorialStepHelper.simulateGuide(tipLayer, nil, callBackFunc,stepData)
	end
end
--创建空点击步骤
function TutorialStepHelper.createClickStep( rect, callBackFunc)
	local stepData = {
		cfg = nil, --配置数据
		doFunction = nil, --执行步骤函数
		owner = nil,
	}

	local function simulateClick(stepData,tipLayer,params)
		local function onCallBack()
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"TutorialStepHelper.createClickStep")
		end

		if callBackFunc == nil then
			callBackFunc = onCallBack
		end

		TutorialStepHelper.showSimulateGuide(stepData,rect,tipLayer, callBackFunc)

	end
	stepData.cfg = nil
	stepData.owner = owner
	stepData.doFunction = simulateClick
	return stepData
end
-----------------------------------------------------------------------------------------------------

function TutorialStepHelper.createKarmaActiveStep()
	local retList = {}

	local karmaId1 = 90101 --缘分id
	local karmaId2 = 90102 
	local karmaId3 = 90103

	if G_UserData:getBase():isMale() == false then
		karmaId1 = 91101
		karmaId2 = 91102
		karmaId3 = 91103
	end

	--查找激活按钮
	local function findCellBtn(karmaId)
		if G_UserData:getKarma():isActivated(karmaId) == true then
			return nil
		end
		local PopupHeroKarma = display.getRunningScene():getSubNodeByName("PopupHeroKarma")
		local listView = PopupHeroKarma:getSubNodeByName("_listView")
		local karamWidget = listView:getSubNodeByName("HeroKarmaCellTitle"..karmaId)
		local clickWidget = karamWidget:getSubNodeByName("ButtonActive")
		return clickWidget:getCascadeBoundingBox()
	end
	
	local function clickFunc(karmaId,stepData)
		local stageObj = stepData.owner
		if stageObj then
			stepData.cfg = {}
			stepData.cfg.disconnect_id = 1313
			stepData.bindfunc = function ( stepData )
				local stageObj = stepData.owner
				if stageObj then
					stageObj:bindProtoMsg(MessageIDConst.ID_C2S_HeroActiveDestiny)
				end
			end
		end
		local PopupHeroKarma = display.getRunningScene():getSubNodeByName("PopupHeroKarma")
		PopupHeroKarma:doActive(karmaId)
		G_TutorialManager:clearTipLayer()
	end
	local function onClick1(sender,stepData)
		clickFunc(karmaId1,stepData)
	end
	local function onClick2(sender,stepData)
		clickFunc(karmaId2,stepData)
	end

	local function onClick3(sender,stepData)
		clickFunc(karmaId3,stepData)
	end

	local stepData3 = TutorialStepHelper.createFuncStep( function( stepData, tipLayer )
		local btnBox3 = findCellBtn(karmaId3)
		if btnBox3 ~= nil then
			TutorialStepHelper.showSimulateGuide(stepData,btnBox3, tipLayer, onClick3,cc.p(5,-10))
		else
			stepData.doNextStep()
		end
	end)

	local stepData2 = TutorialStepHelper.createFuncStep( function( stepData, tipLayer )
		local btnBox2 = findCellBtn(karmaId2)
		if btnBox2 ~= nil then
			TutorialStepHelper.showSimulateGuide(stepData,btnBox2, tipLayer, onClick2,cc.p(5,-10))
		else
			stepData.doNextStep()
		end
	end)


	local stepData1 = TutorialStepHelper.createFuncStep( function( stepData, tipLayer )
		local btnBox1 = findCellBtn(karmaId1)
		if btnBox1 ~= nil then
			TutorialStepHelper.showSimulateGuide(stepData,btnBox1, tipLayer, onClick1,cc.p(5,-10))
		else
			stepData.doNextStep()
		end
	end)
	
	table.insert(retList, stepData1)
	table.insert(retList, stepData2)
	table.insert(retList, stepData3)
	
	return retList
end

--合计将礼包引导步骤列表
function TutorialStepHelper.createComboHeroStepList()

	local tableList = {}
	

	local stepData1 = TutorialStepHelper.createFuncStep(function(stepData, tipLayer)
		local PopupComboHeroGift = require("app.ui.PopupComboHeroGift").new(nil)
		PopupComboHeroGift:open()
		--弹出newFunction界面后，走强制蒙层
		stepData.doNextStep()
	end)

    --创建一个强制蒙层
	--主要是战斗状态下，蒙层点击会穿透引起问题
	local stepData2 = TutorialStepHelper.createFuncStep(function(stepData, tipLayer) 
	 	TutorialStepHelper.showSimulateGuide(stepData, nil, tipLayer)
	end)
    
	local stepData3 = TutorialStepHelper.createFuncStep(function(stepData, tipLayer)
	
		local function getBtnBox()
			local root = display.getRunningScene():getSubNodeByName("_commonBtn")
			return root:getCascadeBoundingBox()
		end
		local root = display.getRunningScene():getSubNodeByName("_commonBtn")
		
		local function onClickFunc(sender, stepData)
			logWarn("TutorialStepHelper.createComboHeroStepList")
			local PopupComboHeroGift = display.getRunningScene():getSubNodeByName("PopupComboHeroGift")
			PopupComboHeroGift:close()
			G_TutorialManager:clearTipLayer()

			G_SceneManager:popToRootAndReplaceScene("main")
			
		end
		TutorialStepHelper.showSimulateGuide(stepData, getBtnBox(), tipLayer, onClickFunc, cc.p(5,-10) )
	end)

	table.insert(tableList,stepData1)
	table.insert(tableList,stepData2)
	table.insert(tableList,stepData3)


	return tableList
end

--构建新功能开启引导
function TutorialStepHelper.createNewFunctionOpenStepList( funcId )
	-- body
	local tableList = {}
	
	local stepData1 = TutorialStepHelper.createFuncStep(function(stepData, tipLayer)
		local PopupNewFunction = require("app.ui.PopupNewFunction").new(funcId)
		PopupNewFunction:open()
		--弹出newFunction界面后，走强制蒙层
		stepData.doNextStep()
	end)

    --创建一个强制蒙层
	--主要是战斗状态下，蒙层点击会穿透引起问题
	local stepData2 = TutorialStepHelper.createFuncStep(function(stepData, tipLayer) 
	 	TutorialStepHelper.showSimulateGuide(stepData, nil, tipLayer)
	end)
    
	local stepData3 = TutorialStepHelper.createFuncStep(function(stepData, tipLayer)
		local function getBtnBox()
			local root = display.getRunningScene():getSubNodeByName("_commonBtn")
			return root:getCascadeBoundingBox()
		end
		local root = display.getRunningScene():getSubNodeByName("_commonBtn")
		
		local function onClickFunc(sender, stepData)
			logWarn("TutorialStepHelper.buildNewFunctionBtnTable")
			local PopupNewFunction = display.getRunningScene():getSubNodeByName("PopupNewFunction")
			PopupNewFunction:close()
			G_TutorialManager:clearTipLayer()

			local runningScene =  display.getRunningScene()
			if runningScene:getName() == "main" then
				stepData.doNextStep()
			else
				G_SceneManager:popToRootAndReplaceScene("main")
			end
		end
		TutorialStepHelper.showSimulateGuide(stepData,getBtnBox(), tipLayer, onClickFunc, cc.p(5,-10) )
	end)

	table.insert(tableList,stepData1)
	table.insert(tableList,stepData2)
	table.insert(tableList,stepData3)

	return tableList
end

function TutorialStepHelper.createChapterEndStep()
	local retList = {}

	local stepData1 =  TutorialStepHelper.createFuncStep( function( stepData )
        -- body
		--章节结束显示
	    local isChapterFinish =  G_UserData:getStage():needShowEnd()
	
        if isChapterFinish == false then
            stepData.doNextStep()
            return
        end
		-- 挂起，等PopupStageReward显示结束
    end)
	--章节奖励领取	
	local stepData2 = TutorialStepHelper.createFuncStep( function( stepData, tipLayer )
		local PopupStageReward = ccui.Helper:seekNodeByName(display.getRunningScene(), "PopupStageReward")
		if PopupStageReward == nil then
			stepData.doNextStep()
			return
		end

		--显示点击小手
		local function findTakeBtn()
            local confirmBtn = PopupStageReward:getSubNodeByName("confirmBtn")
            return confirmBtn:getCascadeBoundingBox()
        end

        local takeBtn = findTakeBtn()
 		local function clickFunc(sender, stepData)
			local PopupStageReward = display.getRunningScene():getSubNodeByName("PopupStageReward")
			PopupStageReward:_getReward()
			G_TutorialManager:clearTipLayer()
		end
		
		TutorialStepHelper.showSimulateGuide(stepData,takeBtn, tipLayer, clickFunc)

		local stageObj = stepData.owner
		stepData.cfg = {}
		stepData.cfg.disconnect_id = 1206
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_GetAllAwardBox)
		end
	end)

--奖励弹框
	local stepData3 = TutorialStepHelper.createFuncStep( function( stepData, tipLayer )
		local PopupGetRewards = ccui.Helper:seekNodeByName(display.getRunningScene(), "PopupGetRewards")
		if PopupGetRewards == nil then
			stepData.doNextStep()
			return
		end

		local function clickFunc(sender, stepData)
			local PopupGetRewards = ccui.Helper:seekNodeByName(display.getRunningScene(), "PopupGetRewards")
			if PopupGetRewards and PopupGetRewards:isAnimEnd() then
				PopupGetRewards:close()
				logWarn("TutorialStepHelper.createFuncStep close click")
				stepData.doNextStep()
			end
		end
		TutorialStepHelper.simulateGuide(tipLayer, nil, clickFunc, stepData)
	end)

--章节movie
	local stepData4 = TutorialStepHelper.createFuncStep( function( stepData, tipLayer )
		local PopupMovieText = ccui.Helper:seekNodeByName(display.getRunningScene(), "PopupMovieText")
		if PopupMovieText == nil then
			stepData.doNextStep()
			return
		end
	end)

	table.insert(retList, stepData1)
	table.insert(retList, stepData2)
	table.insert(retList, stepData3)
	table.insert(retList, stepData4)
	return retList
end


--南蛮触发引导
function TutorialStepHelper.createSiegeTriggerStep(needReplaceScene)
	--判定是否有点击前往，有的话弹出
	--没的话，直接走场景切换
	local stepList = {}

	local function waitSiegeShow(stepData, tipLayer, param)
		local PopupSiegeCome = ccui.Helper:seekNodeByName(display.getRunningScene(),"PopupSiegeCome")
		if PopupSiegeCome then

		else
			stepData.doNextStep()
		end
	end

	local function doSiegeClick( stepData, tipLayer, param )
		-- body
		local PopupSiegeCome = ccui.Helper:seekNodeByName(display.getRunningScene(),"PopupSiegeCome")
		if PopupSiegeCome then
			local target = PopupSiegeCome:getSubNodeByName("buttonFight")
			local function clickFunc(sender, stepData)
				logNewT("TutorialStepHelper.createSiegeTriggerStep clickFunc")
				local siegeCome = ccui.Helper:seekNodeByName(display.getRunningScene(),"PopupSiegeCome")
				logNewT("TutorialStepHelper.createSiegeTriggerStep onClose")
				siegeCome:close()
				stepData.doNextStep()
			end
			dump(target:getCascadeBoundingBox())
			TutorialStepHelper.showSimulateGuide(stepData,target:getCascadeBoundingBox(), tipLayer, clickFunc, cc.p(5,-10) )
		else
			stepData.doNextStep()
		end
	end

	local stepData1 = TutorialStepHelper.createFuncStep(waitSiegeShow)
	local stepData2 = TutorialStepHelper.createFuncStep(doSiegeClick)

	table.insert(stepList,stepData1)
	table.insert(stepList,stepData2)
	return stepList
end

--升级触发引导
function TutorialStepHelper.createStageTriggerStep(needReplaceScene)
	local stepList = {}
	if needReplaceScene == nil then
		needReplaceScene = true
	end
	local function isInFightScene( ... )
		-- body
		local root =  ccui.Helper:seekNodeByName(display.getRunningScene(),"FightView")
		if root == nil then
			return false
		end
		return true
	end
	--升级界面有两个步骤
	--1. 升级界面关闭步骤1
	local function doLevelUp(stepData, tipLayer, param)
		local playerLevelUp = ccui.Helper:seekNodeByName(display.getRunningScene(),"PopupPlayerLevelUp")
		if playerLevelUp then
			local function clickFunc(sender, stepData)
				logNewT("TutorialStepHelper.createStageTriggerStep clickFunc")
				local playerLevelUp = ccui.Helper:seekNodeByName(display.getRunningScene(),"PopupPlayerLevelUp")
				if playerLevelUp and playerLevelUp:isAnimEnd() == true then
					logNewT("TutorialStepHelper.createStageTriggerStep onClose")
					playerLevelUp:close()
					stepData.doNextStep()
				end
			end
			TutorialStepHelper.simulateGuide(tipLayer, nil, clickFunc, stepData)
		else
			stepData.doNextStep()
		end
	end

	
	

	local function stepFunc( stepData )
		local playerLevelUp = ccui.Helper:seekNodeByName(display.getRunningScene(),"PopupPlayerLevelUp")
		if playerLevelUp == nil then
			stepData.doNextStep()
		end
		if isInFightScene() == true then
			stepData.doNextStep()
		end
	end
	--
	local stepData1 = TutorialStepHelper.createReplaceBattlePopStep(needReplaceScene)
	--local stepData2 = TutorialStepHelper.createFuncStep( stepFunc )
	local stepData3 = TutorialStepHelper.createFuncStep(doLevelUp)


	table.insert(stepList,stepData1)
	--table.insert(stepList,stepData2)
	table.insert(stepList,stepData3)
	return stepList
end

function TutorialStepHelper.createFightTriggerStep(needReplaceScene)
	local stepList = TutorialStepHelper.createFightSummnyStep(needReplaceScene)
	table.remove(stepList, 1)
	return stepList
end

function TutorialStepHelper.createFightSummnyStep(needReplaceScene)
	--没升级有3步
	--有升级有4步
	if needReplaceScene == nil then
		needReplaceScene = true
	end

	local stepList = {}
	
	local function checkInTheFight(stepData)
		local root = ccui.Helper:seekNodeByName( display.getRunningScene(), "FightView")
		if root == nil then
			stepData.doNextStep()
			return false
		end
		return true
	end

	local stepData1 = TutorialStepHelper.createFuncStep(function(stepData,tipLayer )
		 checkInTheFight(stepData)
	end)

	local stepData2 = TutorialStepHelper.createReplaceBattlePopStep(needReplaceScene)

	
	local function doBattleOver(stepData, tipLayer, param)
		if checkInTheFight(stepData) then
			local function clickFunc(sender, stepData)
				logNewT("TutorialStepHelper.doBattleOver clickFunc")
				local SummaryBase = ccui.Helper:seekNodeByName(display.getRunningScene(),"SummaryBase")
				if SummaryBase and SummaryBase:isAnimEnd() == true then
					stepData.doNextStep()
				end
			end
			TutorialStepHelper.simulateGuide(tipLayer, nil, clickFunc, stepData)
		end
	end

	--升级界面有两个步骤
	--1. 升级界面关闭步骤1
	--2. 战斗结束步骤2
	local function doLevelUp(stepData, tipLayer, param)
		if checkInTheFight(stepData) then
			local UserCheck = require("app.utils.logic.UserCheck")  
			local levelUp = UserCheck.isLevelUp(function() 
				logNewT("SummaryBase remove")
				local SummaryBase = ccui.Helper:seekNodeByName(display.getRunningScene(),"SummaryBase")
				SummaryBase:doCallBack()
				SummaryBase:close()
				stepData.doNextStep()
			end)
			if levelUp then
				local function clickFunc(sender, stepData)
					logNewT("TutorialStepHelper.doLevelUp clickFunc")
					local playerLevelUp = ccui.Helper:seekNodeByName(display.getRunningScene(),"PopupPlayerLevelUp")
					if playerLevelUp and playerLevelUp:isAnimEnd() == true then
						logNewT("TutorialStepHelper.doLevelUp onClose")
						playerLevelUp:close()
					end
				end
				TutorialStepHelper.simulateGuide(tipLayer, nil, clickFunc, stepData)
			end
		end
	end

	local stepData3 = TutorialStepHelper.createFuncStep(doBattleOver)
	local stepData4 = TutorialStepHelper.createFuncStep(doLevelUp)
	
	table.insert(stepList,stepData1)
	dump(needReplaceScene)

	if needReplaceScene == true then
		table.insert(stepList,stepData2)
	end
	
	table.insert(stepList,stepData3)
	table.insert(stepList,stepData4)

	return stepList
end

--战斗结算步骤
function TutorialStepHelper.addFightSummnyStep(stepData,tipLayer)
	-- body
	logNewT("TutorialStepHelper.addFightSummnyStep")
	local stageObj = stepData.owner
	local isLevelUp = G_UserData:getBase():isLevelUp()
	
	local stepData1 = TutorialStepHelper.createReplaceBattlePopStep()
	stageObj:addStepToBottom(stepData1) --点击结算

	if isLevelUp == true then
		local stepData3 = TutorialStepHelper.createEmptyStep(stageObj)
		stageObj:addStepToBottom(stepData3) --点击升级界面
	end

end


function TutorialStepHelper.simulateEmptyClick(stepTable,stepData,tipLayer)
	local simulate = false

	if stepTable.simulate then
		simulate = stepTable.simulate
	end
	
	local callBack = stepTable.clickfunc
	if simulate then
		TutorialStepHelper.simulateGuide(tipLayer, nil, callBack)
		return
	end
	
end

function TutorialStepHelper.commonClickFunc(stepTable,stepData,tipLayer)

	local simulate = false
	if stepTable.simulate then
		simulate = stepTable.simulate
	end

	--模拟空点击
	local nodeName = stepTable.btnName or ""
	if  ( nodeName == "" or nodeName == nil ) and stepTable.findfunc == nil then
		TutorialStepHelper.simulateEmptyClick(stepTable, stepData, tipLayer)
		return
	end

	local function commonFindFunc(nodeName)
		local target = display.getRunningScene():getSubNodeByName(nodeName)
		return target:getCascadeBoundingBox()
	end
	
	local boxRect = nil 
	if stepTable.findfunc then
		boxRect = stepTable.findfunc()
	else
		boxRect = commonFindFunc(nodeName)
	end
	if boxRect then
		local callBack = stepTable.clickfunc
		local nodePos = tipLayer:convertToNodeSpace(cc.p(boxRect.x, boxRect.y))
		boxRect.x = nodePos.x
		boxRect.y = nodePos.y
		TutorialStepHelper.showGuideFinger(stepData, tipLayer, boxRect, nil, simulate, callBack)
	end
	TutorialStepHelper.showGuideTip(stepData.cfg,tipLayer)
	local bindfunc = stepTable.bindfunc
	if bindfunc then
		bindfunc(stepData)
	end
end
	
--[[
	模拟引导，主要是引导入口
	param tipLayer 指引层
	param rect 触摸区域，没有则全屏
	param callback 回调
]]
function TutorialStepHelper.simulateGuide(tipLayer, rect, callback, stepData)

	local designSize = G_ResolutionManager:getDesignCCSize()

	rect = rect or {
		x = 0, 
		y = 0, 
		width = designSize.width, 
		height = designSize.height}


	local function onTouchEvent(sender)
		local endPosition = sender:getTouchEndPosition()
		local nodePos = tipLayer:convertToNodeSpace(endPosition)
		logNewT("TutorialStepHelper.simulateGuide")
		if cc.rectContainsPoint(rect,nodePos) then
			if callback ~= nil and type(callback) == "function" then
				callback(sender,stepData)
			end
		end
	end
 	local layer = ccui.Widget:create()
	layer:setIgnoreAnchorPointForPosition(false)
	layer:setAnchorPoint(cc.p(0.5,0.5))
 	layer:setTouchEnabled(true)

	layer:setContentSize(cc.size( designSize.width,  designSize.height ))
	layer:setPosition(designSize.width*0.5, designSize.height*0.5)
 	layer:addClickEventListenerEx(onTouchEvent)
	logNewT("TutorialStepHelper.simulateGuide(tipLayer, rect, callback)")
 	tipLayer:addChild(layer)
end


--[[
	展示引导流程的tip
]]
function TutorialStepHelper.showGuideTip(info, tipLayer)

	local info = info

	if string.len(info.comment) > 0 then
		-- 创建对话框
		local dialogue = cc.CSLoader:createNode(Path.getCSB("TutorialTipContentNode", "tutorial"))
		local nodeRight = dialogue:getSubNodeByName("Node_root_fight")
		local nodeLeft  =  dialogue:getSubNodeByName("Node_root_left")
		local nodeRoot = nodeLeft
		nodeRight:setVisible(false)
		nodeLeft:setVisible(false)

		local midPoint = G_ResolutionManager:getDesignCCPoint()

		if info.image == 1 then
			nodeRoot = nodeRight
		end
		
		nodeRoot:setVisible(true)
		tipLayer:addChild(dialogue)

		local position = cc.p(0, 0)
		
		dialogue:setPosition(cc.p(info.positionX + midPoint.x , info.positionY))

		-- 头像
		--local hero = dialogue:updateImageView("Image_hero", Path.getCommonIcon("hero",info.comment_face))
		--hero:setPosition(cc.p(info.x, info.y))

		local wordLabel = nodeRoot:updateLabel("Text_words", {visible = false})
		local richText = TutorialStepHelper._parseTutorialTip(
			info.comment,
			wordLabel:getFontSize(),
			wordLabel:getColor(),
			wordLabel:getContentSize()
		)
	
		wordLabel:getParent():addChild(richText)
		richText:setAnchorPoint(cc.p(0, 0.5))
		richText:setPosition(wordLabel:getPosition())
	end

end

--[[
	引导手指指向
	@param tipLayer 指引层
	@param rect  	指向的绝对坐标
	@param offset 偏移值，可选
	@param simulate 是否模拟点击，可选
	@param callback 回调，可选，主要是模拟的时候用
]]
function TutorialStepHelper.showGuideFinger(stepData, tipLayer, boxRect, offset, simulate, callback)

	--local rect = target:getBoundingBox()
	local rect = boxRect or cc.rect(0,0,0,0)
	local info = stepData.cfg
	if offset then
		rect.x = rect.x + offset.x/2 + (offset.cx or 0)
		rect.y = rect.y + offset.y/2 + (offset.cy or 0)
		rect.width = rect.width - offset.x
		rect.height = rect.height - offset.y
	end

	-- 设置可触摸区域
	if not simulate then
		tipLayer:setTouchRect(cc.rect(rect.x, rect.y, rect.width, rect.height))
	end

	local posX, posY = rect.x + rect.width/2, rect.y + rect.height/2

	local fingerOffsetX, fingerOffsetY = info.x, info.y
	-- 记录一下实际手指的位置
	local targetPosition = cc.p(posX + fingerOffsetX, posY + fingerOffsetY)

	--显示蒙层高亮
	tipLayer:showHighLightClick(targetPosition,info)
	
	-- 手指
	local effectNode = EffectGfxNode.new("effect_finger")
	tipLayer:addChild(effectNode)
	effectNode:play()

	effectNode:setPosition(targetPosition)


	if info.finger > 0 then
		effectNode:setRotation(info.finger)
	end

	if info.voice ~= "" then
		G_AudioManager:playSound(Path.getTutorialVoice( info.voice ) )
	end
	if simulate then
		TutorialStepHelper.simulateGuide(tipLayer, rect, callback,stepData)
	end

end


function TutorialStepHelper._parseTutorialTip(tip, fontSize, fontColor, contentSize)

	-- 先找出所有的关键词，并整理
	local contents = TextHelper.parseConfigText(tip)

	-- 文本模板
	local richTextContents = {}

	for i=1, #contents do
		local content = contents[i]
		table.insert(richTextContents, {
			type = "text",
			msg = content.content,
			color = Colors.colorToNumber(content.isKeyWord and cc.c3b(255, 255, 0) or fontColor),
			fontSize = fontSize,
			opacity = 255
		})

	end

	local richText = ccui.RichText:create()
	richText:setCascadeOpacityEnabled(true)

	richText:setRichText(richTextContents)

	richText:setAnchorPoint(cc.p(0.5, 0.5))
	if contentSize then
		richText:ignoreContentAdaptWithSize(false)
		richText:setContentSize(contentSize)
	end

	richText:formatText()
	local virtualContentSize = richText:getVirtualRendererSize()

	local node = display.newNode()
	node:setAnchorPoint(cc.p(0.5, 0.5))
	node:setCascadeOpacityEnabled(true)
	node:addChild(richText)

	node:setContentSize(virtualContentSize)
	richText:setPosition(virtualContentSize.width/2, virtualContentSize.height/2)

	return node

end

----------------------------------------------------------------------------------
----------------------------------------------------------------------------------
--找到返回按钮
function TutorialStepHelper.findBackButton()
	local sceneNode = display.getRunningScene()
	local target = ccui.Helper:seekNodeByName(sceneNode, "_topNode")
	if target == nil then
		target = ccui.Helper:seekNodeByName(sceneNode, "_topbarBase")
	end
	if target == nil then
		target = ccui.Helper:seekNodeByName(sceneNode, "_topBar")
	end
	assert(target, "can not find topbar in TutorialStepHelper.findBackButton")
	local btnWidget1 = target:getSubNodeByName("btnBack")
	local btnWidget2 = btnWidget1:getSubNodeByName("Button")
	return btnWidget2:getCascadeBoundingBox()
end

--构建StageTable
function TutorialStepHelper.buildStageTable(stageName)
	local function findStageNode(nodeName)
		local target = display.getRunningScene():getSubNodeByName(nodeName)
		if target and target.getPanelTouch then
			local touchWidget =  target:getPanelTouch()
			return touchWidget:getCascadeBoundingBox()
		end
		return nil
	end
	local function clickStageNode(nodeName)
		local target = display.getRunningScene():getSubNodeByName("StageView")
		local stageNode = target:getSubNodeByName(nodeName)
		stageNode:showStageDetail()
		G_TutorialManager:clearTipLayer()
	end

	local stageTable = {
		btnName = stageName,
		simulate = true,
		
		findfunc = function(nodeName)
			return findStageNode(stageName)
		end,

		clickfunc = function()
			clickStageNode(stageName)
		end,
	}
	return stageTable
end

function TutorialStepHelper.buildFightSummnyTable()
	local scritpTable = {
		func = function(stepData, tipLayer)

			logNewT("TutorialStepHelper.addFightSummnyStep")
			local stageObj = stepData.owner
			local isLevelUp = G_UserData:getBase():isLevelUp()
			
			local stepData1 = TutorialStepHelper.createReplaceBattlePopStep()
			stageObj:addStepToBottom(stepData1) --点击结算

			if isLevelUp == true then
				local stepData3 = TutorialStepHelper.createEmptyStep(stageObj)
				stageObj:addStepToBottom(stepData3) --点击升级界面
			end

			TutorialStepHelper.addFightSummnyStep(stepData, tipLayer)
		end
	}
	return scritpTable
end


--点击领取奖励弹框
function TutorialStepHelper.buildPopupGetRewardsTable()

	local tempTable = {
		func = function(stepData, tipLayer)
			logWarn("do buildPopupGetRewardsTable")
			local function onClickPanel(sender, stepData)
				logWarn("buildPopupGetRewardsTable onClickPanel")
				local PopupGetRewards = ccui.Helper:seekNodeByName(display.getRunningScene(), "PopupGetRewards")
				if PopupGetRewards and PopupGetRewards:isAnimEnd() then
					logNewT("TutorialStepHelper.buildPopupGetRewardsTable onClose")
					PopupGetRewards:close()
					stepData.doNextStep()
				end
			end
			TutorialStepHelper.simulateGuide(tipLayer,nil,onClickPanel,stepData)
			
		end
	}
	return tempTable
end

function TutorialStepHelper.buildPopupComboGiftTable()
	local tempTable = {
		func = function(stepData, tipLayer)
			local function goToMainScene()
				G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"PopupComboHeroGift")
			end

			local showFuncId = stepData.cfg.type_param1
			local PopupComboHeroGift = require("app.ui.PopupComboHeroGift").new(goToMainScene)
			PopupComboHeroGift:open()
		end
	}
	return tempTable
end


--点击弹出奖励领取框
function TutorialStepHelper.buildPopupBoxRewardTable(msgId)
	local tempTable = {

		simulate = true,
		findfunc = function(nodeName)
			local target = display.getRunningScene():getSubNodeByName("_btnOk")
			local btnWidget2 = target:getSubNodeByName("Button")
			return btnWidget2:getCascadeBoundingBox()
		end,

		clickfunc = function(sender, stepData)
			local PopupBoxReward = display.getRunningScene():getSubNodeByName("PopupBoxReward")
			PopupBoxReward:onBtnOk()
			--清理小手
			G_TutorialManager:clearTipLayer()
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupBoxReward close")
		end,

		bindfunc = function ( stepData )
			local stageObj = stepData.owner
			if stageObj then
				msgId = msgId or MessageIDConst.ID_C2S_ReceiveStageBox
				stageObj:bindProtoMsg(msgId)
			end
		end
	}
	return tempTable
end

--点击战斗按钮
function TutorialStepHelper.buildFamousFightTable()
	local stageFightTable = {
		simulate = true,
		bindfunc = function ( stepData )
			local stageObj = stepData.owner
			if stageObj then
				stageObj:bindProtoMsg(MessageIDConst.ID_C2S_ExecuteStage)
			end
		end,
		
		findfunc = function(nodeName)
			local target = display.getRunningScene():getSubNodeByName("_btnFight")
			return target:getCascadeBoundingBox()
		end,
		
		clickfunc = function(sender, stepData)
			local PopupFamousDetail = display.getRunningScene():getSubNodeByName("PopupFamousDetail")
			PopupFamousDetail:_onFightClick()
		end,

	}
	return stageFightTable
end


--点击战斗按钮
function TutorialStepHelper.buildStageFightTable()
	local stageFightTable = {
		simulate = true,
		bindfunc = function ( stepData )
			local stageObj = stepData.owner
			if stageObj then
				stageObj:bindProtoMsg(MessageIDConst.ID_C2S_ExecuteStage)
			end
		end,
		
		findfunc = function(nodeName)
			local target = display.getRunningScene():getSubNodeByName("_btnFight")
			return target:getCascadeBoundingBox()
		end,
		
		clickfunc = function(sender, stepData)
			local PopupStageDetail = display.getRunningScene():getSubNodeByName("PopupStageDetail")
			PopupStageDetail:_onFightClick()
		end,

	}
	return stageFightTable
end

function TutorialStepHelper.buildNewFunctionSceneTable()
	local table = {
	func = function(stepData)
		local runningScene =  display.getRunningScene()
		if runningScene:getName() == "login" then
			logWarn("buildNewFunctionSceneTable  popToRootAndReplaceScene main")
			G_SceneManager:popToRootAndReplaceScene("main")
		else
			stepData.doNextStep()
		end
	end
	}
	return table
end

function TutorialStepHelper.buildNewFunctionBtnTable()
	local table = {
		simulate = true,

		findfunc = function(nodeName)
			local root = display.getRunningScene():getSubNodeByName("_commonBtn")
			return root:getCascadeBoundingBox()
		end,

		clickfunc = function(sender, stepData)
			logWarn("TutorialStepHelper.buildNewFunctionBtnTable")
			local PopupNewFunction = display.getRunningScene():getSubNodeByName("PopupNewFunction")
			PopupNewFunction:close()
			G_TutorialManager:clearTipLayer()

			local runningScene =  display.getRunningScene()
			if runningScene:getName() == "main" then
				stepData.doNextStep()
			else
				G_SceneManager:popToRootAndReplaceScene("main")
			end
			
		end
	}
	return table
end

function TutorialStepHelper.buildNewFunctionDlgTable(funcId)

	local tempTable1 = {
		func = function(stepData, tipLayer)
			--弹框显示完成后
			--local function goToMainScene()
				--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"PopupNewFunction")
				--stepData.doNextStep()
			--end

			local showFuncId = stepData.cfg.type_param1
			local PopupNewFunction = require("app.ui.PopupNewFunction").new(funcId)
			PopupNewFunction:open()
			--弹出newFunction界面后，走强制蒙层
			stepData.doNextStep()
		end
	}

	return tempTable1
end



function TutorialStepHelper.buildEquipUpTable(useBindFinc)
	local tempTable = {
		simulate = true,
		findfunc = function()
			local root = display.getRunningScene():getSubNodeByName("EquipTrainStrengthenLayer")
			local clickWidget = root:getSubNodeByName("_buttonStrengFive")
			return clickWidget:getCascadeBoundingBox()
		end,
		clickfunc =  function()
			logNewT("TutorialStepExtend.step1505")
			local root = display.getRunningScene():getSubNodeByName("EquipTrainStrengthenLayer")
			root:_onButtonStrengFiveClicked()
			G_TutorialManager:clearTipLayer()
		end,
	}

	if useBindFinc == true then
		tempTable.bindfunc = function ( stepData )
			local stageObj = stepData.owner
			if stageObj then
				stageObj:bindProtoMsg(MessageIDConst.ID_C2S_UpgradeEquipment)
			end
		end
	end
	return tempTable
end

--宝物通用升级步骤
function TutorialStepHelper.buildTreasureUpTable(useBindFinc)
	local tempTable = {
		simulate = true,
		findfunc = function()
			local root = display.getRunningScene():getSubNodeByName("TreasureTrainStrengthenLayer")
			local clickWidget = root:getSubNodeByName("_buttonStrengthenFive")
			return clickWidget:getCascadeBoundingBox()
		end,
		clickfunc =  function()
			local root = display.getRunningScene():getSubNodeByName("TreasureTrainStrengthenLayer")
			root:_onButtonStrengthenFiveClicked()
			G_TutorialManager:clearTipLayer()
		end,
	}

	if useBindFinc == true then
		tempTable.bindfunc = function ( stepData )
			local stageObj = stepData.owner
			if stageObj then
				stageObj:bindProtoMsg(MessageIDConst.ID_C2S_UpgradeTreasure)
			end
		end
	end
	return tempTable
end

--挑战通用跳转步骤
function TutorialStepHelper.buildChallengeCellTable(funcId)
	local tempTable = {
		simulate = true,
		findfunc = function()
			local root = display.getRunningScene():getSubNodeByName("ChallengeCell_"..funcId)
			local clickWidget = root:getSubNodeByName("_panelBase")
			return clickWidget:getCascadeBoundingBox()
		end,
		clickfunc = function()
			local root = display.getRunningScene():getSubNodeByName("ChallengeCell_"..funcId)
			G_TutorialManager:clearTipLayer()
			return root:goToScene()
		end,
	}
	return tempTable
end

--商店通用购买引导步骤
function TutorialStepHelper.buildShopItemBuyTable( ... )
	-- body
	local tempTable = {
		simulate = true,
		findfunc = function()
			local root = display.getRunningScene():getSubNodeByName("ShopFixView")
			local shopItemCell = root:findCellItem(1,1)
			local btnOk = shopItemCell:getSubNodeByName("Button_ok")
			return btnOk:getCascadeBoundingBox()
		end,
		clickfunc = function(sender, stepData)
			local root = display.getRunningScene():getSubNodeByName("ShopFixView")
			root:_onItemTouch(1,1)
			--stepData.doNextStep()
		end,
		bindfunc = function ( stepData )
			local stageObj = stepData.owner
			if stageObj then
				stageObj:bindProtoMsg(MessageIDConst.ID_C2S_BuyShopGoods)
			end
		end
	}

	return tempTable
end


function TutorialStepHelper.buildMainIconGoTable(btnName, wayFuncId)
	local tempTable = {
		simulate = true,
		findfunc = function(nodeName)
			local root = display.getRunningScene():getSubNodeByName(btnName)
			dump(root:getCascadeBoundingBox())
			return root:getCascadeBoundingBox()
		end,
		clickfunc =  function(sender, stepData)
			logNewT("TutorialStepHelper.buildMainIconGoTable "..tostring(wayFuncId))
			local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
			WayFuncDataHelper.gotoModuleByFuncId(wayFuncId)
		end,
	}
	return tempTable
end

--popupName: 例如 PopupChooseTreasure2
--bindMsgId: 例如 MessageIDConst.ID_C2S_AddFightEquipment
function TutorialStepHelper.buildPopupChooseTable(popupName,bindMsgId)
	local tempTable = {
		simulate = true,
		findfunc = function(nodeName)
			local chooseHero = display.getRunningScene():getSubNodeByName(popupName)
			local listView = chooseHero:getSubNodeByName("_listView")
			local itemList = listView:getChildren()
			local cellWidget = itemList[1]
			local clickWidget = cellWidget:getSubNodeByName("_buttonChoose1")
			return clickWidget:getCascadeBoundingBox()
		end,

		clickfunc =  function(sender,stepData)
			logNewT("TutorialStepExtend.step2107")
			local chooseHero = display.getRunningScene():getSubNodeByName(popupName)
			local listView = chooseHero:getSubNodeByName("_listView")
			local itemList = listView:getChildren()
			local cellWidget = itemList[1]
			cellWidget:_onButtonClicked1()
			stepData.doNextStep()
		end,
		
		bindfunc = function ( stepData )
			local stageObj = stepData.owner
			if stageObj then
				stageObj:bindProtoMsg(bindMsgId)
			end
		end
	}

	return tempTable
end

--构建点击关闭引导
function TutorialStepHelper.buildCloseDlgTable(dlgName)
	local tempTable = {

		simulate = true,
		findfunc = function()
			local dlgObj = display.getRunningScene():getSubNodeByName(dlgName)
			local clickWidget = dlgObj:getSubNodeByName("Button_close")
			return clickWidget:getCascadeBoundingBox()
		end,
		
		clickfunc = function(sender, stepData)
			local dlgObj = display.getRunningScene():getSubNodeByName(dlgName)
			dlgObj:close()
			stepData.doNextStep()
		end
	}

	return tempTable
end


return TutorialStepHelper