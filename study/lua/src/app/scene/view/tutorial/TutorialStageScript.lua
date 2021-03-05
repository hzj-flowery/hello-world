local TutorialStageScript = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TutorialStepHelper = import(".TutorialStepHelper")

local DEFAULT_WAIT_TIME = 0.5
--==================================================================
--引导触发条件逻辑


function TutorialStageScript.checkStage13(stageObj)

    local karmaId1 = 90101 --缘分id
	local karmaId2 = 90102
    local karmaId3 = 90103

    if G_UserData:getBase():isMale() == false then
        karmaId1 = 91101
        karmaId2 = 91102
        karmaId3 = 91103
    end

    local isActive1 = G_UserData:getKarma():isActivated(karmaId1)
    local isActive2 = G_UserData:getKarma():isActivated(karmaId2)
    local isActive3 = G_UserData:getKarma():isActivated(karmaId3)
    local result = true
    if isActive1 and isActive2 and isActive3 then
        result = false
    end

    logNewT("TutorialStageScript.checkStage13 check value = "..tostring(result))

    return result
end


--装备强化
function TutorialStageScript.checkStage14(stageObj)
     --检查宝箱是否领取
      local retValue1 = G_UserData:getBattleResource():getResourceId(1, 1, 1)
      local stageData = G_UserData:getStage():getStageById(100205)
      if stageData then
         local isGetBox = stageData:isReceive_box()
         if not isGetBox and retValue1 == nil then
            return true
         end
      end
      
   -- local retValue1 = G_UserData:getBattleResource():getResourceId(1, 1, 1)
    --local retValue2 = G_UserData:getEquipment():getEquipIdWithBaseId(101) --古锭刀id
  --  if retValue1 == nil and retValue2 ~= nil then
      -- return true
  --  end

    return false
end

--装备强化,检测是否身上有装备
function TutorialStageScript.checkStage15(stageObj)
     --检查宝箱是否领取
    local retValue1 = G_UserData:getBattleResource():getResourceId(1, 1, 1)
    if retValue1 then
       return true
    end

    return false
end



--检测物品是否存在
function TutorialStageScript.checkStage17(stageObj)
    local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, 200)
    if itemNum > 0 then
        return true
    end
    return false
end

--游历
function TutorialStageScript.checkStage19( ... )
    -- body
    local retValue1 = G_UserData:getExplore():isCanRunFirstExploreTutorial()

    return retValue1
end

--检测身上是否有宝物
function TutorialStageScript.checkStage20(stageObj)
    local retValue1 = G_UserData:getBattleResource():getResourceId(1, 2, 1)
    local retValue2 = G_UserData:getTreasure():getTreasureIdWithBaseId(101) --宝物吴子
    dump(retValue1)
    dump(retValue2)
    if retValue1 == nil and retValue2 ~= nil then
        return true
    end
    return false
end


--身上有宝物检测
function TutorialStageScript.checkStage21(stageObj)
    local retValue1 = G_UserData:getBattleResource():getResourceId(1, 2, 1)
    if retValue1 then
        return true
    end
    return false
end


--确保没升级过官衔
function TutorialStageScript.checkStage30(stageObj)
    local officialLevel = G_UserData:getBase():getOfficialLevel()
    if officialLevel == 0 then
        return true
    end

    return false
end


--检测是否加入军团
function TutorialStageScript.checkStage32(stageObj)
    local isInGuild = G_UserData:getGuild():isInGuild()
    if isInGuild == false then
        return true
    end

    return false
end


--名将传是否通过
function TutorialStageScript.checkStage40(stageObj)
    local maxStar = G_UserData:getChapter():getFamousPassCount()
    if maxStar == 0 then
        return true
    end
    return false
end

--过关斩将是否通过
function TutorialStageScript.checkStage55(stageObj)
    local maxStar = G_UserData:getTowerData():getMax_star()
    if maxStar == 0 then
        return true
    end
    return false
end

function TutorialStageScript.checkStage75(stageObj)
    local opHeroCount = G_UserData:getBase():getOpCountReHero()
    if opHeroCount == 0 then
        return true
    end

    return false
end


function TutorialStageScript.checkStage80(stageObj)
    local count = G_UserData:getBase():getOpCountSiege()
    local siegeCount = #G_UserData:getSiegeData():getSiegeEnemys()
    local guideId = G_UserData:getBase():getGuide_id()
    dump(count)
    dump(siegeCount)
    dump(guideId)
    --需要确保引导从未触发过南蛮
    if count == 0 and guideId < 8000 then
        return true
    end

    return false
end



--确保有锦囊，并且没穿戴
function TutorialStageScript.checkStage90(stageObj)
    local silkId = G_UserData:getSilkbagOnTeam():getIdWithPosAndIndex(1, 1)
    local list = G_UserData:getSilkbag():getListNoWeared()
  
    if silkId == 0 and #list > 0 then
        return true
    end

    return false
end


--确保有神兽，并且没上阵
function TutorialStageScript.checkStage120(stageObj)
    local petId = G_UserData:getBase():getOn_team_pet_id()
    local list = G_UserData:getPet():getListDataBySort()
  
    if petId == 0 and #list > 0 then
        return true
    end

    return false
end


--确保没升级过神树
function TutorialStageScript.checkStage140(stageObj)
    logWarn("TutorialStageScript.checkStage140")
    local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()

    if mainTreeLevel == 1 then
        return true
    end

    return false
end



--忽略章节结束后跑图效果
function TutorialStageScript.ignoreEvent40( stageObj,eventName )
    -- body
    logWarn("ignore ChapterView:onRunMapAnimComplete")
    if eventName == "ChapterView:onRunMapAnimComplete" then
        logWarn("ChapterView:onRunMapAnimComplete false")
        return false
    end
    return true
end

--==================================================================
--引导构建逻辑
--构建分两种：1.根据table构建  2.动态添加函数
--在引导过程中，去除动态引导步骤
--引导步骤可以直接调用下一个步骤（新增功能）

function TutorialStageScript.createWaitStep( ... )
    -- body
end

function TutorialStageScript.buildStage1(stageObj)

    stageObj:addStepData( TutorialStepHelper.createStepDataById(101) )
    stageObj:addStepData( TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(102) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(103) )
    stageObj:addStepDataList( TutorialStepHelper.createFightSummnyStep(true) )
end

function TutorialStageScript.buildStage2(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById(201) )
    stageObj:addStepData( TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME) )
    
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_DRAW_HERO) )


    --stageObj:addStepData( TutorialStepHelper.createStepDataById(204) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(205) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(206) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(207) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(208) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(209) )
end

function TutorialStageScript.buildStage3(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById(301) )
    stageObj:addStepData( TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(302) )
    stageObj:addStepData( TutorialStepHelper.createEmptyStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(303) )
    stageObj:addStepData( TutorialStepHelper.createEmptyStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(304) )

    stageObj:addStepData( TutorialStepHelper.createStepDataById(305) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(306) )
end

function TutorialStageScript.buildStage4(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById(401) )
    stageObj:addStepData( TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(402) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(403) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(404) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(405) )
    stageObj:addStepDataList( TutorialStepHelper.createFightSummnyStep(true) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById(406) )
end


function TutorialStageScript.buildStage6(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById(601) )
    stageObj:addStepData( TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(602) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(603) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(604) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(605) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(606) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(607) )
end

function TutorialStageScript.buildStage7(stageObj)

    stageObj:addStepData( TutorialStepHelper.createStepDataById(701) )
    stageObj:addStepData( TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(702) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById(703) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(704) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(705) )
    stageObj:addStepDataList( TutorialStepHelper.createFightSummnyStep(true) )

end




--新手引导第4关卡
function TutorialStageScript.buildStage10(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1001) )
    stageObj:addStepData( TutorialStepHelper.createWaitStep(DEFAULT_WAIT_TIME) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1002) )
   -- stageObj:addStepData( TutorialStepHelper.createStepDataById(1003) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1004) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1005) )
    stageObj:addStepDataList( TutorialStepHelper.createFightSummnyStep(true) )
end

--新手引导第五关卡
function TutorialStageScript.buildStage11(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1101) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1102) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1103) )
    stageObj:addStepDataList( TutorialStepHelper.createFightSummnyStep(true) )
end

--第二章节
function TutorialStageScript.buildStage12(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1201) )

    stageObj:addStepDataList( TutorialStepHelper.createChapterEndStep() )

    --点击返回去除，直接跳转到章节界面
    stageObj:addStepData( TutorialStepHelper.createFuncStep(function(stepData)
        local scene, view = G_SceneManager:createScene("chapter")
		G_SceneManager:popToRootScene()
		G_SceneManager:replaceScene(scene)
    end) )

   -- stageObj:addStepData( TutorialStepHelper.createStepDataById(1203) )

    --等待浮岛
    stageObj:addStepData( TutorialStepHelper.createFuncStep(function(stepData)
        local chapterView = ccui.Helper:seekNodeByName(display.getRunningScene(), "ChapterView")
        if chapterView:isPlayingPassLevelAnim() == false then
            stepData.doNextStep()
        end
    end) )

    stageObj:addStepData( TutorialStepHelper.createStepDataById(1204) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1205) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1206) )
end

--第二章节
function TutorialStageScript.buildStage13(stageObj)
    --通关后触发
    stageObj:addStepDataList( TutorialStepHelper.createFightTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById(1302) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_HERO_KARMA) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById(1305) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1306) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1307) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById(1308) )
    stageObj:addStepDataList(TutorialStepHelper.createKarmaActiveStep())
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1309) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1310) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1311) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1312) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById(1313) )


    dump(#stageObj._stepDataList)
end

function TutorialStageScript.buildStage14(stageObj)
    --通关后触发
    stageObj:addStepDataList( TutorialStepHelper.createFightTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById(1401) )

    --跳转到宝箱步骤
    stageObj:addStepData(TutorialStepHelper.createFuncStep(function( stepData )
        -- body
        local stageView = display.getRunningScene():getSubNodeByName("StageView")
		if stageView then
			stageView:jumpToStagePos(100205)
		end
        stepData.doNextStep()
    end))

    for i = 1402, 1406, 1 do
         stageObj:addStepData( TutorialStepHelper.createStepDataById(i) )
    end
end

function TutorialStageScript.buildStage15(stageObj)

    for i = 1501, 1504, 1 do
         stageObj:addStepData( TutorialStepHelper.createStepDataById(i) )
    end
end

function TutorialStageScript.buildStage16(stageObj)

    for i = 1601, 1610, 1 do
         stageObj:addStepData( TutorialStepHelper.createStepDataById(i) )
    end
end


--第二章节
function TutorialStageScript.buildStage17(stageObj)

    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById(1701) )
    --合计将礼包引导
    stageObj:addStepDataList(TutorialStepHelper.createComboHeroStepList() )

    for i = 1704, 1710, 1 do
         stageObj:addStepData( TutorialStepHelper.createStepDataById(i) )
    end

end


function TutorialStageScript.buildStage18(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1801 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_TRAVEL) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById( 2004 ) )
   -- stageObj:addStepData( TutorialStepHelper.createStepDataById( 2005 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1805 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1806 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1807 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1808 ) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById( 2010 ) )
end


function TutorialStageScript.buildStage19(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1901 ) )
    stageObj:addStepData( TutorialStepHelper.createEmptyStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1902 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1903 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1904 ) )
    -- stageObj:addStepData( TutorialStepHelper.createStepDataById( 2105 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1906 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 1907 ) )
end



function TutorialStageScript.buildStage20(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2001 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2002 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2003 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2004 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2005 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2006 ) )
   -- stageObj:addStepData( TutorialStepHelper.createEmptyStep() )
end


function TutorialStageScript.buildStage21(stageObj)

    for i = 2101, 2109, 1 do
         stageObj:addStepData( TutorialStepHelper.createStepDataById(i) )
    end

end


function TutorialStageScript.buildStage22(stageObj)

    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2201 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_ARENA) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById( 1804 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2205 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2206 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2207 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2208 ) )
    stageObj:addStepDataList( TutorialStepHelper.createFightSummnyStep(false) )
end


function TutorialStageScript.buildStage23(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2301 ) )
    --等待奖励弹框结束
    local function func(stepData)
        local PopupRankUpReward = ccui.Helper:seekNodeByName(display.getRunningScene(), "PopupRankUpReward")
        if PopupRankUpReward == nil then
            stepData.doNextStep()
        end
    end

    stageObj:addStepData( TutorialStepHelper.createFuncStep(func) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2302 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2303 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2304 ) )
  
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2305 ) )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2306 ) )
    --等待1.5秒，等飘字结束
    stageObj:addStepData( TutorialStepHelper.createWaitStep( 1.5 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2307 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 2308 ) )
end




function TutorialStageScript.buildStage30(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3001 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_OFFICIAL) )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3004 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3005 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3006 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3007 ) )
    --关闭晋升弹框
    stageObj:addStepData( TutorialStepHelper.createEmptyStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3008 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3009 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3010 ) )
end

function TutorialStageScript.buildStage32(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3201 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_ARMY_GROUP) )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3204 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 3205 ) )

end



function TutorialStageScript.buildStage40(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4001 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_FAMOUS_CHAPTER) )
 

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4004 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4005 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4006 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4007 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4008 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4009 ) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById( 4010 ) )
    stageObj:addStepDataList( TutorialStepHelper.createFightSummnyStep(false) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4010 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4011 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4012 ) )
end


function TutorialStageScript.buildStage45(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4501 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_DAILY_STAGE) )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4504 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4505 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4506 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4507 ) )
    local function func(stepData)
    	local root = display.getRunningScene():getSubNodeByName("PopupDailyChoose")
		local chooseCell =  root:getSubNodeByName("PopupDailyChooseCell1")
        if chooseCell:isEntered() == true then
            stepData.doNextStep()
            return
        end
    end
    stageObj:addStepData( TutorialStepHelper.createFuncStep(func) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 4508 ) )
end





function TutorialStageScript.buildStage55(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5501 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_PVE_TOWER) )
 
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5504 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5505 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5506 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5507 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5508 ) )
    
    stageObj:addStepDataList( TutorialStepHelper.createFightSummnyStep(false) )
end

function TutorialStageScript.buildStage56(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5601 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5602 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5603 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5604 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5605 ) )
    --等待1.5秒，等飘字结束
    stageObj:addStepData( TutorialStepHelper.createWaitStep( 1.5 ) )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5606 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 5607 ) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById( 4008 ) )
end




function TutorialStageScript.buildStage75(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7501 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_RECYCLE) )
 

    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7502 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7503 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7504 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7505 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7506 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7507 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7508 ) )
    --stageObj:addStepData( TutorialStepHelper.createStepDataById( 7509 ) )
end

function TutorialStageScript.buildStage76(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7601 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7602 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 7603 ) )
end

function TutorialStageScript.buildStage80(stageObj)
    --stageObj:addStepDataList( TutorialStepHelper.createSiegeTriggerStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 8001 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 8002 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 8003 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 8004 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 8005 ) )
end


function TutorialStageScript.buildStage90(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 9001 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_SILKBAG) ) 
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 9004 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 9005 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 9006 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 9007 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 9008 ) )
end


function TutorialStageScript.buildStage120(stageObj)
    stageObj:addStepDataList( TutorialStepHelper.createStageTriggerStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 12001 ) )
    stageObj:addStepDataList( TutorialStepHelper.createNewFunctionOpenStepList(FunctionConst.FUNC_PET_HOME) ) 
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 12004 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 12005 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 12006 ) )
    --stageObj:addStepData( TutorialStepHelper.createEmptyStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 12007 ) )
    --stageObj:addStepData( TutorialStepHelper.createEmptyStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 12008 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 12009 ) )
end

function TutorialStageScript.buildStage140(stageObj)
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 14001 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 14002 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 14003 ) )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 14004 ) )

    local function closePopupResult(stepData, tipLayer, param)
        local function clickFunc(sender, stepData)
            logNewT("TutorialStepHelper.closePopupResult clickFunc")
            local upResult = ccui.Helper:seekNodeByName(display.getRunningScene(),"PopupHomelandUpResult")
            if upResult and upResult:isAnimEnd() == true then
                logNewT("TutorialStepHelper.closePopupResult onClose")
                upResult:close()
                stepData.doNextStep()
            end
        end
		TutorialStepHelper.simulateGuide(tipLayer, nil, clickFunc, stepData)
    end

    stageObj:addStepData( TutorialStepHelper.createFuncStep(closePopupResult) )
    stageObj:addStepData( TutorialStepHelper.createEmptyStep() )
    stageObj:addStepData( TutorialStepHelper.createStepDataById( 14005 ) )
end
return TutorialStageScript
