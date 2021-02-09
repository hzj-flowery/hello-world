
-----------------------------------------------------------------------------------------------------
--以下是每个步骤特殊处理函数
--这类步骤一般在guild.lua里有一一对应关系
-----------------------------------------------------------------------------------------------------
--[[
--步骤处理自定义数据
--按钮数据。
--自定义函数等
TutorialStepExtend.step101 =
{
	btnName = "xxx", --按钮名称
	func = function(stepData) -- 自定义函数
	end,
	waittime = 0.5 --等待时间
}
]]

local TutorialStepExtend = {}
local TutorialStepHelper = import(".TutorialStepHelper")


TutorialStepExtend.step101 = {
	func = function( ... )
		-- body
		G_SceneManager:popToRootAndReplaceScene("stage",1)
	end
}

TutorialStepExtend.step102 = {} --TutorialStepHelper.buildStageTable("stageId_100101")

TutorialStepExtend.step103 = {
	func = function( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_ExecuteStage)
		end

		G_UserData:getStage():c2sExecuteStage(100101)
	end
}--TutorialStepHelper.buildStageFightTable()


--等待战斗结束
TutorialStepExtend.step104 = TutorialStepHelper.buildFightSummnyTable()

--跳转关卡
TutorialStepExtend.step201 = TutorialStepHelper.buildNewFunctionSceneTable()

--弹出新功能开启
TutorialStepExtend.step202 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_DRAW_HERO)

--点击前往查看
TutorialStepExtend.step203 = TutorialStepHelper.buildNewFunctionBtnTable()


--跳转页面
TutorialStepExtend.step204 = {}
--剧情
TutorialStepExtend.step205 =
{
}

TutorialStepExtend.step206 =  TutorialStepHelper.buildMainIconGoTable(
	"commonMain"..FunctionConst.FUNC_DRAW_HERO, FunctionConst.FUNC_DRAW_HERO)
--{
--	btnName = "commonMain"..FunctionConst.FUNC_DRAW_HERO,
--}


TutorialStepExtend.step207 =
{
	enterName = "DrawCardView",
	simulate = true,

	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("_cashCell")
		local btnWidget = target:getSubNodeByName("BtnDraw")
		return btnWidget:getCascadeBoundingBox()
	end,

	clickfunc = function()
		local target = display.getRunningScene():getSubNodeByName("DrawCardView")
		target:_onGoldClick()
		G_TutorialManager:clearTipLayer()
	end,

	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_RecruitGoldOne)
		end
	end
}




--剧情
TutorialStepExtend.step209 =
{

}


TutorialStepExtend.step209 =
{
	simulate = true,
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,
	clickfunc = function(sender, stepData)
		G_SceneManager:popScene()
	end,
}

TutorialStepExtend.step301 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("main")
	end
}
--点击阵容3号位
TutorialStepExtend.step302 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar3")
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar3")
		root:onClickCallBack()
		G_TutorialManager:clearTipLayer()
	end
}

--点击上阵 关银萍
TutorialStepExtend.step303 =
{
	simulate = true,
	findfunc = function()
		local chooseHero = display.getRunningScene():getSubNodeByName("PopupChooseHero")
		local listView = chooseHero:getSubNodeByName("_listView")
		local itemList = listView:getChildren()
		local cellWidget = itemList[1]
		local clickWidget = cellWidget:getSubNodeByName("_buttonChoose1")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc =  function(sender, stepData)
		logNewT("TutorialStepExtend.step303")
		local chooseHero = display.getRunningScene():getSubNodeByName("PopupChooseHero")
		local listView = chooseHero:getSubNodeByName("_listView")
		local itemList = listView:getChildren()
		local cellWidget = itemList[1]
		cellWidget:_onButtonClicked1()

		--引导进入下一步
		stepData.doNextStep()
		--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,

	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_ChangeHeroFormation)
		end
	end
}


--点击任意区域
TutorialStepExtend.step304 =
{
	simulate = true, --模拟点击
}


--合击剧情
TutorialStepExtend.step305 =
{

}

TutorialStepExtend.step306 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,

	clickfunc =  function(sender, stepData)
		--引导进入下一步
		stepData.doNextStep()
	end,
}

TutorialStepExtend.step401 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("main")
	end
}


TutorialStepExtend.step402 = TutorialStepHelper.buildMainIconGoTable("_btnMainFight", FunctionConst.FUNC_NEW_STAGE)



TutorialStepExtend.step403 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("ChapterIcon1")
		local btnWidget1 = target:getSubNodeByName("_btnCity")
		return btnWidget1:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local target = display.getRunningScene():getSubNodeByName("ChapterIcon1")
		--local btnWidget1 = target:getSubNodeByName("_btnCity")
		target:goToStage()
		G_TutorialManager:clearTipLayer()
	end,
}


TutorialStepExtend.step404 = TutorialStepHelper.buildStageTable("stageId_100102")


TutorialStepExtend.step405 = TutorialStepHelper.buildStageFightTable()


--等待战斗结束
TutorialStepExtend.step406 = TutorialStepHelper.buildFightSummnyTable()


TutorialStepExtend.step501 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("stage",1)
	end
}

TutorialStepExtend.step502 = {}

--点击宝箱
TutorialStepExtend.step503 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("ImageBox_100102")
		return target:getCascadeBoundingBox()
	end,

	clickfunc =  function(sender, stepData)
		local target = display.getRunningScene():getSubNodeByName("ImageBox_100102")
		local root = display.getRunningScene():getSubNodeByName("StageView")
		root:_onBoxTouch(target)
		G_TutorialManager:clearTipLayer()
		--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,
}

--点击领取
TutorialStepExtend.step504 = TutorialStepHelper.buildPopupBoxRewardTable( MessageIDConst.ID_C2S_ReceiveStageBox )

--点击确定按钮，抛出事件
TutorialStepExtend.step505 = TutorialStepHelper.buildPopupGetRewardsTable()


TutorialStepExtend.step506 = {}
--点击返回
TutorialStepExtend.step507 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		return  TutorialStepHelper.findBackButton()
	end,


	clickfunc =  function(sender, stepData)
		--引导进入下一步
		stepData.doNextStep()
	end,
}

---------------------------------------------------------------------------
---------------------------------------------------------------------------
TutorialStepExtend.step601 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("main")
	end
}

TutorialStepExtend.step602 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar3")
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar3")
		root:onClickCallBack()
		G_TutorialManager:clearTipLayer()
	end
}

--点击中间英雄
TutorialStepExtend.step603 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root,teamPageItem = display.getRunningScene():getSubNodeByName("TeamView"):getCurHeroSpine()
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root,teamPageItem = display.getRunningScene():getSubNodeByName("TeamView"):getCurHeroSpine()
		teamPageItem:_onClickAvatar()
		G_TutorialManager:clearTipLayer()
	end,
}

--点击升级按钮
TutorialStepExtend.step604 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("HeroDetailAttrModule")
		local clickWidget = root:getSubNodeByName("_buttonUpgrade")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("HeroDetailAttrModule")
		root:_onButtonUpgradeClicked()
		G_TutorialManager:clearTipLayer()
	end,
}

--一键升级按钮
TutorialStepExtend.step605=
{
	simulate = true,
	findfunc = function(nodeName)
		local clickWidget = display.getRunningScene():getSubNodeByName("_buttonUpgradeFive")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc = function()
		local upgradeLayer = display.getRunningScene():getSubNodeByName("HeroTrainUpgradeLayer")
		upgradeLayer:_onButtonUpgradeFiveClicked()
		G_TutorialManager:clearTipLayer()
	end,
	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_HeroLevelUp)
		end
	end
}

--剧情
TutorialStepExtend.step606={

}

TutorialStepExtend.step607 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,

	clickfunc =  function(sender, stepData)
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,
}


---------------------------------------------------------------------------
---------------------------------------------------------------------------
TutorialStepExtend.step701 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("main")
	end
}

TutorialStepExtend.step702 =  TutorialStepHelper.buildMainIconGoTable("_btnMainFight", FunctionConst.FUNC_TUTORIAL_JUMP_PVE)

TutorialStepExtend.step703 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("stage",1)
	end
}


TutorialStepExtend.step704 = TutorialStepHelper.buildStageTable("stageId_100103")

TutorialStepExtend.step705 = TutorialStepHelper.buildStageFightTable()

--等待战斗结束
TutorialStepExtend.step706 = TutorialStepHelper.buildFightSummnyTable()


---------------------------------------------------------------------------
---------------------------------------------------------------------------

TutorialStepExtend.step801 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("stage",1)
	end
}

TutorialStepExtend.step802 = {}


--点击宝箱
TutorialStepExtend.step803 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("_btnStarBox2")
		return target:getCascadeBoundingBox()
	end,

	clickfunc =  function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("StageView")
		root:_onBox2Touch()
		G_TutorialManager:clearTipLayer()
	end,
}

--点击领取
TutorialStepExtend.step804 =  TutorialStepHelper.buildPopupBoxRewardTable( MessageIDConst.ID_C2S_FinishChapterBoxRwd )

--点击确定按钮，抛出事件
TutorialStepExtend.step805 = TutorialStepHelper.buildPopupGetRewardsTable()

TutorialStepExtend.step806 = {}
--点击返回
TutorialStepExtend.step807 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,

	clickfunc =  function(sender, stepData)
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,
}

---------------------------------------------------------------------------
---------------------------------------------------------------------------

TutorialStepExtend.step901 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("main")
	end
}

--点击阵容3号位
TutorialStepExtend.step902 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		root:onClickCallBack()
		G_TutorialManager:clearTipLayer()
	end

}

--点击中间英雄
TutorialStepExtend.step903=
{
	simulate = true,
	findfunc = function(nodeName)
		local root,teamPageItem = display.getRunningScene():getSubNodeByName("TeamView"):getCurHeroSpine()
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root,teamPageItem = display.getRunningScene():getSubNodeByName("TeamView"):getCurHeroSpine()
		teamPageItem:_onClickAvatar()
		G_TutorialManager:clearTipLayer()
	end,
}

--点击升级按钮
TutorialStepExtend.step904=
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_buttonBreak")
		return root:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("HeroDetailAttrModule")
		root:_onButtonBreakClicked()
		G_TutorialManager:clearTipLayer()
	end,
}

--点击升级按钮
TutorialStepExtend.step905=
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_buttonBreak")
		return root:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local upgradeLayer = display.getRunningScene():getSubNodeByName("HeroTrainBreakLayer")
		upgradeLayer:_onButtonBreakClicked()
		G_TutorialManager:clearTipLayer()
	end,
	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_HeroRankUp)
		end
	end
}


--武将突破剧情
TutorialStepExtend.step906 = {}

--返回按钮
TutorialStepExtend.step907 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,

	clickfunc =  function(sender, stepData)
		logNewT("TutorialStepExtend.step908")
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,
}
---------------------------------------------------------------------------
---------------------------------------------------------------------------

TutorialStepExtend.step1001 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("main")
	end
}

TutorialStepExtend.step1002 = TutorialStepHelper.buildMainIconGoTable("_btnMainFight", FunctionConst.FUNC_TUTORIAL_JUMP_PVE)


--JUMP
TutorialStepExtend.step1003 =
{
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("stage",1)
	end
}


TutorialStepExtend.step1004 = TutorialStepHelper.buildStageTable("stageId_100104")

TutorialStepExtend.step1005 = TutorialStepHelper.buildStageFightTable()

--等待战斗结束
TutorialStepExtend.step1006 = TutorialStepHelper.buildFightSummnyTable()


---跳转
TutorialStepExtend.step1101 = {
	func = function ( ... )
		-- body
		G_SceneManager:popToRootAndReplaceScene("stage",1)
	end
}

TutorialStepExtend.step1102 = TutorialStepHelper.buildStageTable("stageId_100105")

TutorialStepExtend.step1103 = TutorialStepHelper.buildStageFightTable()
--等待战斗结束
TutorialStepExtend.step1104 = TutorialStepHelper.buildFightSummnyTable()

--领取星级宝箱
TutorialStepExtend.step1105 = {

}

--奖励弹框
TutorialStepExtend.step1106 = {

}


---跳转
TutorialStepExtend.step1201 = {
	func = function ( ... )
		-- body
		G_SceneManager:popToRootAndReplaceScene("stage",1)
	end
}
--点击返回
TutorialStepExtend.step1203 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,

	clickfunc =  function()
		local scene, view = G_SceneManager:createScene("chapter")
		G_SceneManager:popToRootScene()
		G_SceneManager:replaceScene(scene)
	end,
}

--第二关章节
TutorialStepExtend.step1204 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("ChapterIcon2")
		local btnWidget1 = target:getSubNodeByName("_btnCity")
		return btnWidget1:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local target = display.getRunningScene():getSubNodeByName("ChapterIcon2")
		target:goToStage()
		G_TutorialManager:clearTipLayer()
	end
}
--关卡剧情
TutorialStepExtend.step1205 = {}
TutorialStepExtend.step1206 = TutorialStepHelper.buildStageTable("stageId_100201")
--=============================================================================
--程序处理

TutorialStepExtend.step1302 = TutorialStepHelper.buildNewFunctionSceneTable()
TutorialStepExtend.step1303 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_HERO_KARMA) --弹出缘分新系统
TutorialStepExtend.step1304 = TutorialStepHelper.buildNewFunctionBtnTable()
TutorialStepExtend.step1305 = {
}--跳转页面
--点击男主
TutorialStepExtend.step1306 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		root:onClickCallBack()
		G_TutorialManager:clearTipLayer()
	end
}
--点击缘分
TutorialStepExtend.step1307 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_panelKarma")
		return root:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("TeamView")
		root:getHeroLayer():_onKarmaClicked()
	end
}
--点击激活
TutorialStepExtend.step1308 = {
	func = function(stepData, tipLayer)
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"PopupHeroKarma.step1308")
	end
}
--剧情阶段
TutorialStepExtend.step1309 = {}
--点击关闭缘分
TutorialStepExtend.step1310 =TutorialStepHelper.buildCloseDlgTable("PopupHeroKarma")

--点击返回
TutorialStepExtend.step1311 = {
	simulate = true, --模拟点击
	findfunc = function()
		return TutorialStepHelper.findBackButton()
	end,

	clickfunc =  function()
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,
}
--跳转到主界面
TutorialStepExtend.step1312 = {
	func = function ( ... )
		G_SceneManager:popToRootAndReplaceScene("main")
	end
}
--点击征战
TutorialStepExtend.step1313 = TutorialStepHelper.buildMainIconGoTable("_btnMainFight", FunctionConst.FUNC_NEW_STAGE)
--=============================================================================
--穿戴装备引导
TutorialStepExtend.step1401 = {
	func = function ( ... )
		G_SceneManager:popToRootAndReplaceScene("stage")
	end
} --跳转关卡界面



TutorialStepExtend.step1402 = {
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("ImageBox_100205")
		return target:getCascadeBoundingBox()
	end,

	clickfunc =  function(sender, stepData)
		local target = display.getRunningScene():getSubNodeByName("ImageBox_100205")
		local root = display.getRunningScene():getSubNodeByName("StageView")
		root:_onBoxTouch(target)
		G_TutorialManager:clearTipLayer()
	end,
}

TutorialStepExtend.step1403 = TutorialStepHelper.buildPopupBoxRewardTable( MessageIDConst.ID_C2S_ReceiveStageBox )

TutorialStepExtend.step1404 = TutorialStepHelper.buildPopupGetRewardsTable()

TutorialStepExtend.step1405 = {} --剧情阶段
--点击返回
TutorialStepExtend.step1406 =
{
	simulate = true, --模拟点击
	findfunc = function()
		return TutorialStepHelper.findBackButton()
	end,

	clickfunc =  function()
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,
}

--跳转到主界面
TutorialStepExtend.step1501 = {
	func = function()
		G_SceneManager:showScene("main")
	end
}

--点击男主
TutorialStepExtend.step1502 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		root:onClickCallBack()
		G_TutorialManager:clearTipLayer()
	end
}

--点击主角武器栏
TutorialStepExtend.step1503 ={
	simulate = true, --模拟点击

	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_fileNodeEquip1")
		local clickWidget = root:getSubNodeByName("PanelTouch")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc =  function()
		local root = display.getRunningScene():getSubNodeByName("TeamView")
		local equipIcon = root:getHeroLayer():getEquipmentIconByIndex(1)
		equipIcon:_onPanelTouch()
		G_TutorialManager:clearTipLayer()
		--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,
}

--点击穿戴
TutorialStepExtend.step1504 = TutorialStepHelper.buildPopupChooseTable("PopupChooseEquip2",MessageIDConst.ID_C2S_AddFightEquipment)
--=============================================================================
--强化装备引导
TutorialStepExtend.step1601 = {
	func = function ( ... )
		-- body
		local teamView =  ccui.Helper:seekNodeByName(display.getRunningScene(), "TeamView")
		if teamView == nil then
			G_SceneManager:popToRootAndReplaceScene("team")
		else

		end
	end
}--跳转主角阵容界面

TutorialStepExtend.step1602 ={}--剧情阶段
--点击装备
TutorialStepExtend.step1603 ={
	simulate = true, --模拟点击
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_fileNodeEquip1")
		local clickWidget = root:getSubNodeByName("PanelTouch")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc =  function()
		local root = display.getRunningScene():getSubNodeByName("TeamView")
		local equipIcon = root:getHeroLayer():getEquipmentIconByIndex(1)
		equipIcon:_onPanelTouch()
		G_TutorialManager:clearTipLayer()
	end,
}
--点击详情强化
TutorialStepExtend.step1604 ={
	simulate = true, --模拟点击
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("EquipDetailStrengthenNode")
		local clickWidget = root:getSubNodeByName("ButtonStrengthen")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc =  function()
		local root = display.getRunningScene():getSubNodeByName("EquipDetailStrengthenNode")
		root:_onButtonStrengthenClicked()
		G_TutorialManager:clearTipLayer()
	end,
}
--点击强化
TutorialStepExtend.step1605 = TutorialStepHelper.buildEquipUpTable(true)

TutorialStepExtend.step1606 = TutorialStepHelper.buildEquipUpTable(false)--点击强化
TutorialStepExtend.step1607 ={}--剧情
TutorialStepExtend.step1608 ={
	simulate = true,
	findfunc = function(nodeName)
		return  TutorialStepHelper.findBackButton()
	end,
	clickfunc =  function()
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,
}--返回
--跳转主界面
TutorialStepExtend.step1609 ={
	func = function()
		G_SceneManager:showScene("main")
	end
}
TutorialStepExtend.step1610 = TutorialStepHelper.buildMainIconGoTable("_btnMainFight", FunctionConst.FUNC_NEW_STAGE)
--=============================================================================
--第二组合击将引导

--程序处理
TutorialStepExtend.step1701 = TutorialStepHelper.buildNewFunctionSceneTable()

--弹出新武将合击礼包界面
TutorialStepExtend.step1702 = TutorialStepHelper.buildPopupComboGiftTable()
--点击确认
TutorialStepExtend.step1703 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_commonBtn")
		return root:getCascadeBoundingBox()
	end,
	clickfunc = function ()
		G_SceneManager:showScene("main")
	end
}
--剧情阶段
TutorialStepExtend.step1704 ={}

TutorialStepExtend.step1705 = TutorialStepHelper.buildMainIconGoTable(
	"commonMain"..FunctionConst.FUNC_ITEM_BAG, FunctionConst.FUNC_ITEM_BAG)
--{btnName = "commonMain"..FunctionConst.FUNC_ITEM_BAG,}--点击背包

--点击使用
TutorialStepExtend.step1706 = {
	simulate = true,
	findfunc = function(nodeName)
		local chooseHero = display.getRunningScene():getSubNodeByName("PackageView")
		local listView = chooseHero:getSubNodeByName("_listViewTab1")
		local itemList = listView:getChildren()
		local cellWidget = itemList[1]

		local clickWidget = cellWidget:getSubNodeByName("_buttonReplace1")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc =  function(sender, stepData)
		logNewT("TutorialStepExtend.step1709")
		local chooseHero = display.getRunningScene():getSubNodeByName("PackageView")
		local listView = chooseHero:getSubNodeByName("_listViewTab1")
		local itemList = listView:getChildren()
		local cellWidget = itemList[1]

		local clickWidget = cellWidget:getSubNodeByName("_buttonReplace1")
		local button = clickWidget:getSubNodeByName("Button")
		cellWidget:_onBtnClick(button)
		G_TutorialManager:clearTipLayer()

		stepData.doNextStep()
	end,

	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_UseItem)
		end
	end
}
TutorialStepExtend.step1707 = TutorialStepHelper.buildPopupGetRewardsTable()--点击确认
TutorialStepExtend.step1708 ={}--剧情阶段
--点击返回
TutorialStepExtend.step1709 ={
	simulate = true,
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,
	clickfunc =  function()
	    G_SceneManager:showScene("main")
	end,
}

TutorialStepExtend.step1710 = TutorialStepHelper.buildMainIconGoTable("_btnMainFight", FunctionConst.FUNC_NEW_STAGE)

--=============================================================================
--竞技场引导

TutorialStepExtend.step2201 = TutorialStepHelper.buildNewFunctionSceneTable()
--弹出新功能开启
TutorialStepExtend.step2202 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_ARENA)
TutorialStepExtend.step2203 = TutorialStepHelper.buildNewFunctionBtnTable()
--跳转主界面
TutorialStepExtend.step2204 = {

}

--点击冒险按钮
TutorialStepExtend.step2205 = {}--插入剧情阶段
TutorialStepExtend.step2206 = TutorialStepHelper.buildMainIconGoTable("commonMain"..FunctionConst.FUNC_ADVENTURE, FunctionConst.FUNC_ADVENTURE)

--点击竞技场
TutorialStepExtend.step2207 = TutorialStepHelper.buildChallengeCellTable(FunctionConst.FUNC_ARENA)

--点击倒数第二个武将
TutorialStepExtend.step2208 = {
	simulate = true,
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("ArenaScrollNode")
		local heroAvatar = root:getSelfTopNode()
		local clickWidget = heroAvatar:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("ArenaScrollNode")
		local heroAvatar = root:getSelfTopNode()
		heroAvatar:doCallBackFunc()
	end,
	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_ChallengeArena)
		end
	end,
}
-----------------------------------------------------
TutorialStepExtend.step2301 = {
	func = function(stepData)
		local runningScene =  display.getRunningScene()
		dump( runningScene:getName() )
		if runningScene:getName() ~= "fight" then
			G_SceneManager:popToRootAndReplaceScene("arena")
		end
	end
}

TutorialStepExtend.step2302 = {}

TutorialStepExtend.step2303 = {
	simulate = true,
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("ArenaView")
		local btpShop = root:getSubNodeByName("commonMain"..FunctionConst.FUNC_ARENA_SHOP)
		dump(btpShop:getCascadeBoundingBox())
		return btpShop:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("ArenaView")
		--root:_onBtnShop()
		stepData.doNextStep()
	end,
}

TutorialStepExtend.step2304 = {
	func = function()
		local ShopConst = require("app.const.ShopConst")
		G_SceneManager:showScene("shop",ShopConst.ARENA_SHOP)
		G_TutorialManager:clearTipLayer()
	end
}

TutorialStepExtend.step2305 = {
	simulate = true,
	findfunc = function()
		local ShopConst = require("app.const.ShopConst")
		local root = display.getRunningScene():getSubNodeByName("ShopFixView")
		local panelTab = root:getSubNodeByName("Panel_tab"..ShopConst.ARENA_SHOP_SUB_AWARD)
		return panelTab:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local ShopConst = require("app.const.ShopConst")
		local root = display.getRunningScene():getSubNodeByName("ShopFixView")
		root:setTabIndex(ShopConst.ARENA_SHOP_SUB_AWARD)
		G_TutorialManager:clearTipLayer()
	end,
}

TutorialStepExtend.step2306 = TutorialStepHelper.buildShopItemBuyTable()


TutorialStepExtend.step2307 = {}

TutorialStepExtend.step2308 = {
	simulate = true,
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,
	clickfunc = function(sender, stepData)
		G_SceneManager:popScene()
	end,
}


TutorialStepExtend.step1801 = TutorialStepHelper.buildNewFunctionSceneTable()

TutorialStepExtend.step1802 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_TRAVEL)

--点击前往查看
TutorialStepExtend.step1803 = TutorialStepHelper.buildNewFunctionBtnTable()


--剧情
TutorialStepExtend.step1804 = {}

--游历按钮点击
TutorialStepExtend.step1805 = TutorialStepHelper.buildMainIconGoTable("commonMain"..FunctionConst.FUNC_TRAVEL, FunctionConst.FUNC_TRAVEL)

--剧情
TutorialStepExtend.step1806 = {}


--点击桃源村
TutorialStepExtend.step1807 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("ExploreMainView")
		local city1 = root:getCityById(1)
		return city1:getSubNodeByName("_btnCity"):getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("ExploreMainView")
		local city1 = root:getCityById(1)
		city1:goToCity()
		G_TutorialManager:clearTipLayer()
	end,
}

--点击roll点
TutorialStepExtend.step1808 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("ExploreMapView")
		return root:getSubNodeByName("_btnRoll"):getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("ExploreMapView")
		root:_onBtnRoll()
		G_TutorialManager:clearTipLayer()
	end,
	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_RollExplore)
		end
	end
}

--点击roll点
TutorialStepExtend.step1809 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("ExploreMapView")
		return root:getSubNodeByName("_btnRoll"):getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("ExploreMapView")
		root:_onBtnRoll()
		G_TutorialManager:clearTipLayer()
	end,

}
--引导结束
-------------------------------------------------------
-------------------------------------------------------
TutorialStepExtend.step1901 = {
	func = function(stepData)
		local exploreMap =  ccui.Helper:seekNodeByName(display.getRunningScene(), "ExploreMapView")
		if exploreMap == nil then
			G_SceneManager:popToRootAndReplaceScene("exploreMap", 1)
		else
			stepData.doNextStep()
		end
	end
}

--点击点击水镜学堂
TutorialStepExtend.step1902 = {
	simulate = true,
	findfunc = function(nodeName)
		local ExploreConst = require("app.const.ExploreConst")
		local root = display.getRunningScene():getSubNodeByName("ExploreMapView")
		local answer = root:getSubNodeByName("ExploreMapViewEventIcon"..ExploreConst.EVENT_TYPE_ANSWER)
		return answer:getSubNodeByName("_iconImage"):getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local ExploreConst = require("app.const.ExploreConst")
		local root = display.getRunningScene():getSubNodeByName("ExploreMapView")
		local answer = root:getSubNodeByName("ExploreMapViewEventIcon"..ExploreConst.EVENT_TYPE_ANSWER)
		answer:_onClickBtn()
	end,
}

TutorialStepExtend.step1903 = {}

--点击玩家选择答案
TutorialStepExtend.step1904 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("EventAnswerNode")
		local answer = root:getSubNodeByName("EventAnswerCell2") --刘备
		return answer:getSubNodeByName("_btnAnswer"):getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("EventAnswerNode")
		--TODO需要打开
		root:_onAnswerClick(2)
		G_TutorialManager:clearTipLayer()
		--stepData.doNextStep()
	end,

	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_ExploreDoEvent)
		end
	end
}

TutorialStepExtend.step1905 = TutorialStepHelper.buildPopupGetRewardsTable()
--点击关闭
TutorialStepExtend.step1906 = TutorialStepHelper.buildCloseDlgTable("PopupEventBase")

--点击roll点
TutorialStepExtend.step1907 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("ExploreMapView")
		return root:getSubNodeByName("_btnRoll"):getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("ExploreMapView")
		root:_onBtnRoll()
		G_TutorialManager:clearTipLayer()
		stepData.doNextStep()
	end,
}

--游历界面
TutorialStepExtend.step2001 = {
	func = function(stepData)
		local exploreMap =  ccui.Helper:seekNodeByName(display.getRunningScene(), "ExploreMainView")
		if exploreMap == nil then
			G_SceneManager:popToRootAndReplaceScene("exploreMain", 1)
		else
			stepData.doNextStep()
		end
	end
}
--剧情
TutorialStepExtend.step2002 = {}

--返回
TutorialStepExtend.step2003 = {
	simulate = true,
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,
	clickfunc = function(sender, stepData)
		G_SceneManager:showScene("main")
	end,
}

--点击男主
TutorialStepExtend.step2004 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		root:onClickCallBack()
		G_TutorialManager:clearTipLayer()
	end
}

--点击主角宝物栏
TutorialStepExtend.step2005 ={
	simulate = true, --模拟点击

	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_fileNodeTreasure1")
		local clickWidget = root:getSubNodeByName("PanelTouch")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc =  function()
		local root = display.getRunningScene():getSubNodeByName("TeamView")
		local icon = root:getHeroLayer():getTreasureIconByIndex(1)
		icon:_onPanelTouch()
		G_TutorialManager:clearTipLayer()
	end,
}

--点击穿戴
TutorialStepExtend.step2006 = TutorialStepHelper.buildPopupChooseTable("PopupChooseTreasure2",MessageIDConst.ID_C2S_AddFightInstrument)

--=============================================================================
--强化宝物引导
TutorialStepExtend.step2101 ={
	func = function ( ... )
		-- body
		local teamView =  ccui.Helper:seekNodeByName(display.getRunningScene(), "TeamView")
		if teamView == nil then
			G_SceneManager:popToRootAndReplaceScene("team")
		else

		end
	end
}--跳转主角阵容界面
TutorialStepExtend.step2102 ={}--剧情阶段
--点击宝物
TutorialStepExtend.step2103 ={
	simulate = true, --模拟点击
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_fileNodeTreasure1")
		local clickWidget = root:getSubNodeByName("PanelTouch")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc =  function()
		local root = display.getRunningScene():getSubNodeByName("TeamView")
		local equipIcon = root:getHeroLayer():getTreasureIconByIndex(1)
		equipIcon:_onPanelTouch()
		G_TutorialManager:clearTipLayer()
	end,
}

--点击详情强化
TutorialStepExtend.step2104 ={
	simulate = true, --模拟点击
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("TreasureDetailStrengthenNode")
		local clickWidget = root:getSubNodeByName("ButtonStrengthen")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc =  function()
		local root = display.getRunningScene():getSubNodeByName("TreasureDetailStrengthenNode")
		root:_onButtonStrengthenClicked()
	end,
}
--点击强化
TutorialStepExtend.step2105 = TutorialStepHelper.buildTreasureUpTable(true)

TutorialStepExtend.step2106 = {}--剧情
--返回
TutorialStepExtend.step2107 ={
	simulate = true,
	findfunc = function(nodeName)
		return  TutorialStepHelper.findBackButton()
	end,
	clickfunc =  function(sender, stepData)
		G_SceneManager:showScene("main")
	end,
}

--点击游历
TutorialStepExtend.step2108 = TutorialStepHelper.buildMainIconGoTable("commonMain"..FunctionConst.FUNC_TRAVEL, FunctionConst.FUNC_TRAVEL)

--点击徐州
TutorialStepExtend.step2109 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("ExploreMainView")
		local city1 = root:getCityById(2)
		return city1:getSubNodeByName("_btnCity"):getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("ExploreMainView")
		local city1 = root:getCityById(2)
		city1:goToCity()
	end,
}

--=============================================================================
--官衔引导，官衔升级
TutorialStepExtend.step3001 = TutorialStepHelper.buildNewFunctionSceneTable()
--剧情阶段
TutorialStepExtend.step3002 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_OFFICIAL)
TutorialStepExtend.step3003 = TutorialStepHelper.buildNewFunctionBtnTable()
--剧情阶段
TutorialStepExtend.step3004 = {}

TutorialStepExtend.step3005 = TutorialStepHelper.buildMainIconGoTable("commonMain"..FunctionConst.FUNC_MORE, FunctionConst.FUNC_MORE)
--点击官衔
TutorialStepExtend.step3006 = TutorialStepHelper.buildMainIconGoTable(
	"commonMain"..FunctionConst.FUNC_OFFICIAL, FunctionConst.FUNC_OFFICIAL) --{btnName = "commonMain"..FunctionConst.FUNC_OFFICIAL}
--点击晋升
TutorialStepExtend.step3007 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("PopupOfficialRankUp")
		return root:getSubNodeByName("_btnUp"):getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("PopupOfficialRankUp")
		root:onBtnUp()
		stepData.doNextStep()
	end,
	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_UpOfficerLevel)
		end
	end
}
--剧情
TutorialStepExtend.step3008 = {}
--关闭
TutorialStepExtend.step3009 = TutorialStepHelper.buildCloseDlgTable("PopupOfficialRankUp")

--征战
TutorialStepExtend.step3010 = TutorialStepHelper.buildMainIconGoTable("_btnMainFight", FunctionConst.FUNC_NEW_STAGE)

--=============================================================================
--军团本引导
TutorialStepExtend.step3201 = TutorialStepHelper.buildNewFunctionSceneTable()
--军团开启
TutorialStepExtend.step3202 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_ARMY_GROUP)
--点击前往查看
TutorialStepExtend.step3203 = TutorialStepHelper.buildNewFunctionBtnTable()

--剧情阶段
TutorialStepExtend.step3204 = {}

TutorialStepExtend.step3205 =  TutorialStepHelper.buildMainIconGoTable("commonMain"..FunctionConst.FUNC_ARMY_GROUP, FunctionConst.FUNC_ARMY_GROUP)


--=============================================================================
--日常副本引导
TutorialStepExtend.step4501 = TutorialStepHelper.buildNewFunctionSceneTable()
--剧情阶段
TutorialStepExtend.step4502 = TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_DAILY_STAGE)
TutorialStepExtend.step4503 =  TutorialStepHelper.buildNewFunctionBtnTable()
--点击前往查看
TutorialStepExtend.step4504 = {}
--点击冒险
TutorialStepExtend.step4505 =  TutorialStepHelper.buildMainIconGoTable("commonMain"..FunctionConst.FUNC_ADVENTURE, FunctionConst.FUNC_ADVENTURE)
--点击日常副本
TutorialStepExtend.step4506 = TutorialStepHelper.buildChallengeCellTable(FunctionConst.FUNC_DAILY_STAGE)

--点击城池
TutorialStepExtend.step4507 = {
	simulate = true,
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("DailyChallengeView")
		local dailyCity = root:getSubNodeByName("DailyCity2")
		return dailyCity:getSubNodeByName("_btnCity"):getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("DailyChallengeView")
		local dailyCity = root:getSubNodeByName("DailyCity2")
		dailyCity:_onCityClick()
	end,
}

--点击挑战
TutorialStepExtend.step4508 = {
	simulate = true,
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("PopupDailyChoose")
		local chooseCell =  root:getSubNodeByName("PopupDailyChooseCell1")
		return chooseCell:getSubNodeByName("_btnFight"):getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("PopupDailyChoose")
		local chooseCell =  root:getSubNodeByName("PopupDailyChooseCell1")
		chooseCell:_executeStage()
	end,
	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_ExecuteDailyDungeon)
		end
	end
}



--=============================================================================
--过关斩将引导过关斩将引导
TutorialStepExtend.step5501 = TutorialStepHelper.buildNewFunctionSceneTable()

--剧情
TutorialStepExtend.step5502 =  TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_PVE_TOWER)
--点击前往查看
TutorialStepExtend.step5503 =  TutorialStepHelper.buildNewFunctionBtnTable()

TutorialStepExtend.step5504 = {}

--点击冒险按钮
TutorialStepExtend.step5505 = TutorialStepHelper.buildMainIconGoTable("commonMain"..FunctionConst.FUNC_ADVENTURE, FunctionConst.FUNC_ADVENTURE)

--点击过关斩将
TutorialStepExtend.step5506 = TutorialStepHelper.buildChallengeCellTable(FunctionConst.FUNC_PVE_TOWER)


--点击第一个武将
TutorialStepExtend.step5507 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("TowerAvatarNode1")
		return root:getSubNodeByName("_panelTouch"):getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("TowerAvatarNode1")
		root:_onAvatarClick()
	end,
}

--点击挑战
TutorialStepExtend.step5508 = {
	simulate = true,
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("PopupTowerChoose")
		local chooseCell =  root:getSubNodeByName("_chooseCell3")
		return chooseCell:getSubNodeByName("_btnFight"):getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("PopupTowerChoose")
		root:_onChallengeClick(3)
	end,
	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_ExecuteTower)
		end
	end
}

--=============================================================================
--过关斩将引导,商店购买
TutorialStepExtend.step5601 = {
	func = function(stepData)
		local runningScene =  display.getRunningScene()
		dump( runningScene:getName() )
		if runningScene:getName() ~= "fight" then
			G_SceneManager:popToRootAndReplaceScene("tower")
		end
	end
}

TutorialStepExtend.step5602 = {}

TutorialStepExtend.step5603 = {
	simulate = true,
	findfunc = function()
		local root = display.getRunningScene():getSubNodeByName("TowerView")
		local btpShop = root:getSubNodeByName("commonMain"..FunctionConst.FUNC_EQUIP_SHOP)
		return btpShop:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local ShopConst = require("app.const.ShopConst")
		G_SceneManager:showScene("shop",ShopConst.EQUIP_SHOP )
		G_TutorialManager:clearTipLayer()
	end,
}


TutorialStepExtend.step5604 = {
	simulate = true,
	findfunc = function()
		local ShopConst = require("app.const.ShopConst")
		local root = display.getRunningScene():getSubNodeByName("ShopFixView")
		local panelTab = root:getSubNodeByName("Panel_tab"..ShopConst.EQUIP_SHOP_SUB_AWARD)
		return panelTab:getCascadeBoundingBox()
	end,
	clickfunc = function(sender, stepData)
		local ShopConst = require("app.const.ShopConst")
		local root = display.getRunningScene():getSubNodeByName("ShopFixView")
		root:setTabIndex(ShopConst.EQUIP_SHOP_SUB_AWARD)
		G_TutorialManager:clearTipLayer()
	end,
}

TutorialStepExtend.step5605 = TutorialStepHelper.buildShopItemBuyTable()


TutorialStepExtend.step5606 = {}

TutorialStepExtend.step5607 = {
	simulate = true,
	findfunc = function(nodeName)
		return TutorialStepHelper.findBackButton()
	end,
	clickfunc = function(sender, stepData)
		G_SceneManager:popScene()
	end,
}

TutorialStepExtend.step5608 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("TowerAvatarNode2")
		return root:getSubNodeByName("_panelTouch"):getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local root = display.getRunningScene():getSubNodeByName("TowerAvatarNode2")
		root:_onAvatarClick()
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"step5608")
	end,
}


--=============================================================================
--名将副本引导
TutorialStepExtend.step4001 = TutorialStepHelper.buildNewFunctionSceneTable()

--剧情
TutorialStepExtend.step4002 =  TutorialStepHelper.buildNewFunctionDlgTable(FunctionConst.FUNC_FAMOUS_CHAPTER)
--点击前往查看
TutorialStepExtend.step4003 =  TutorialStepHelper.buildNewFunctionBtnTable()

TutorialStepExtend.step4004 = {}

--点击征战
TutorialStepExtend.step4005 = TutorialStepHelper.buildMainIconGoTable("_btnMainFight", FunctionConst.FUNC_NEW_STAGE)

--点击名将副本 _checkType3
TutorialStepExtend.step4006 = {
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("_checkType3")
		return target:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local ChapterView = display.getRunningScene():getSubNodeByName("ChapterView")
		local target = display.getRunningScene():getSubNodeByName("_checkType3")
		ChapterView:_onTypeClick(target)
		stepData.doNextStep()
	end,
}

--点击章节
TutorialStepExtend.step4007 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("ChapterIcon2001")--貂蝉传
		local btnWidget1 = target:getSubNodeByName("_btnCity")
		return btnWidget1:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local target = display.getRunningScene():getSubNodeByName("ChapterIcon2001")
		target:goToStage()
		G_TutorialManager:clearTipLayer()
	end,
}

TutorialStepExtend.step4008 = TutorialStepHelper.buildStageTable("stageId_300101")--张梁

TutorialStepExtend.step4009 = TutorialStepHelper.buildFamousFightTable()

TutorialStepExtend.step4010 = {
	func = function(stepData, tipLayer)
		logWarn("do step4010")
	end
}

TutorialStepExtend.step4011 = TutorialStepHelper.buildPopupGetRewardsTable()--点击确认

TutorialStepExtend.step4012 = {}
--=============================================================================
--武将回收
TutorialStepExtend.step7501 = TutorialStepHelper.buildNewFunctionSceneTable()

--剧情
TutorialStepExtend.step7502 =  {}

--点击更多
TutorialStepExtend.step7503 = TutorialStepHelper.buildMainIconGoTable("commonMain"..FunctionConst.FUNC_MORE, FunctionConst.FUNC_MORE)
--点击官衔
TutorialStepExtend.step7504 = TutorialStepHelper.buildMainIconGoTable(
	"commonMain"..FunctionConst.FUNC_RECYCLE, FunctionConst.FUNC_RECYCLE)

TutorialStepExtend.step7505 = {
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("_buttonAutoAdd")
		return target:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local RecoveryHeroLayer = display.getRunningScene():getSubNodeByName("RecoveryHeroLayer")
		RecoveryHeroLayer:_onButtonAutoAddClicked()
		stepData.doNextStep()
	end,
}

--点击章节
TutorialStepExtend.step7506 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("_buttonRecovery")
		return target:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local RecoveryHeroLayer = display.getRunningScene():getSubNodeByName("RecoveryHeroLayer")
		RecoveryHeroLayer:_onButtonRecoveryClicked()
	end,
}


--点击章节
TutorialStepExtend.step7507 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("_buttonOk")
		return target:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local RecoveryHeroLayer = display.getRunningScene():getSubNodeByName("PopupRecoveryPreview")
		RecoveryHeroLayer:_onButtonOk()
		stepData.doNextStep()
	end,
}

TutorialStepExtend.step7508 = TutorialStepHelper.buildPopupGetRewardsTable()--点击确认

--剧情
TutorialStepExtend.step7509 ={}


--武将回收
TutorialStepExtend.step7601 = {
	func = function(stepData)
		local recovery =  ccui.Helper:seekNodeByName(display.getRunningScene(), "RecoveryView")
		if recovery == nil then
			local RecoveryConst = require("app.const.RecoveryConst")
			G_SceneManager:popToRootAndReplaceScene("recovery", RecoveryConst.RECOVERY_TYPE_1)
		else
			stepData.doNextStep()
		end
	end
}


TutorialStepExtend.step7602 = {
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("_buttonShop")
		return target:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local RecoveryView = display.getRunningScene():getSubNodeByName("RecoveryView")
		RecoveryView:shopBtnClick()
		G_TutorialManager:clearTipLayer()
	end,
}

TutorialStepExtend.step7603 = {}

--=============================================================================
---南蛮入侵引导
TutorialStepExtend.step8001 = {
	func = function(stepData)
		--local SiegeView =  ccui.Helper:seekNodeByName(display.getRunningScene(), "SiegeView")
		--if SiegeView == nil then
		--	G_SceneManager:popToRootAndReplaceScene("siege")
		--else
		--	stepData.doNextStep()
		--end
	end
}


TutorialStepExtend.step8002 = {
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local PopupSiegeCome = display.getRunningScene():getSubNodeByName("PopupSiegeCome")
		local target = PopupSiegeCome:getSubNodeByName("buttonFight")
		return target:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local PopupSiegeCome = display.getRunningScene():getSubNodeByName("PopupSiegeCome")
		PopupSiegeCome:_onChallengeClick()
		G_TutorialManager:clearTipLayer()
	end,
}

TutorialStepExtend.step8003 = {}
--点击怪物
TutorialStepExtend.step8004 = {
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local SiegeView = display.getRunningScene():getSubNodeByName("SiegeView")
		local target = SiegeView:getSiegeNodeByIndex(1)
		local clickWidget = target:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local SiegeView = display.getRunningScene():getSubNodeByName("SiegeView")
		local target = SiegeView:getSiegeNodeByIndex(1)
		target:_onAvatarClick()
		G_TutorialManager:clearTipLayer()
	end,
}

TutorialStepExtend.step8005 = {
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("SiegeChallengeBtns")
		local clickWidget = target:getSubNodeByName("_btnPowerAttack")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local SiegeChallengeBtns = display.getRunningScene():getSubNodeByName("SiegeChallengeBtns")
		SiegeChallengeBtns:_onPowerClick(1)
		G_TutorialManager:clearTipLayer()
		stepData.doNextStep()
	end,
}


--=============================================================================
---穿戴锦囊引导
TutorialStepExtend.step9001 = TutorialStepHelper.buildNewFunctionSceneTable()

--剧情
TutorialStepExtend.step9002 =  {}
--点击更多
TutorialStepExtend.step9003 = {}
--剧情阶段
TutorialStepExtend.step9004 = {}
--点击主角
TutorialStepExtend.step9005 = {
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_heroAvatar1")
		root:onClickCallBack()
		G_TutorialManager:clearTipLayer()
	end
}

--点击锦囊
TutorialStepExtend.step9006 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local target = display.getRunningScene():getSubNodeByName("_buttonSilkbag")
		return target:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local TeamHeroNode = display.getRunningScene():getSubNodeByName("TeamHeroNode")
		TeamHeroNode:_onButtonSilkbagClicked()
		G_TutorialManager:clearTipLayer()
	end,
}


--点击穿戴
TutorialStepExtend.step9007 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		local SilkbagView = display.getRunningScene():getSubNodeByName("SilkbagView")
		local listView = SilkbagView:getSubNodeByName("_listView")
		local itemList = listView:getChildren()
		local cellWidget = itemList[1]
		local clickWidget = cellWidget:getSubNodeByName("_button")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc =  function(sender, stepData)
		local SilkbagView = display.getRunningScene():getSubNodeByName("SilkbagView")
		local listView = SilkbagView:getSubNodeByName("_listView")
		local itemList = listView:getChildren()
		local cellWidget = itemList[1]
		cellWidget:_onButtonClicked()
		--引导进入下一步
		stepData.doNextStep()
	end,

	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_EquipSilkbag)
		end
	end
}

--剧情
TutorialStepExtend.step9008 ={}


--=============================================================================
---神兽上阵引导
TutorialStepExtend.step12001 = TutorialStepHelper.buildNewFunctionSceneTable()
TutorialStepExtend.step12002 =  {}
TutorialStepExtend.step12003 = {}

--剧情阶段
TutorialStepExtend.step12004 = {}
--点击神兽icon
TutorialStepExtend.step12005 =  TutorialStepHelper.buildMainIconGoTable(
	"commonMain"..FunctionConst.FUNC_PET_HOME, FunctionConst.FUNC_PET_HOME)

--点击神兽中间+号
TutorialStepExtend.step12006 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("_avatar1")
		local clickWidget = root:getSubNodeByName("Panel_click")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("_avatar1")
		root:onClickCallBack()
		G_TutorialManager:clearTipLayer()

	end
}


--点击穿戴
TutorialStepExtend.step12007 =
{
	simulate = true, --模拟点击
	findfunc = function()
		local chooseHero = display.getRunningScene():getSubNodeByName("PopupChoosePet")
		local listView = chooseHero:getSubNodeByName("_listView")
		local itemList = listView:getChildren()
		local cellWidget = itemList[1]
		local clickWidget = cellWidget:getSubNodeByName("_buttonChoose1")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc =  function(sender, stepData)
		logNewT("TutorialStepExtend.step12007")
		local chooseHero = display.getRunningScene():getSubNodeByName("PopupChoosePet")
		local listView = chooseHero:getSubNodeByName("_listView")
		local itemList = listView:getChildren()
		local cellWidget = itemList[1]
		cellWidget:_onButtonClicked1()

		--引导进入下一步
		stepData.doNextStep()
		--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,

	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_PetOnTeam)
		end
	end
}

--剧情
TutorialStepExtend.step12008 ={}
--返回
TutorialStepExtend.step12009 =
{
	simulate = true, --模拟点击
	findfunc = function(nodeName)
		return  TutorialStepHelper.findBackButton()
	end,
	clickfunc =  function(sender, stepData)
		--引导进入下一步
		stepData.doNextStep()
	end,
}

--=============================================================================
---神树进阶引导
TutorialStepExtend.step14001 = {
	func = function( ... )
		G_SceneManager:popToRootAndReplaceScene("main")
	end
}
--点击神兽icon
TutorialStepExtend.step14002 =  TutorialStepHelper.buildMainIconGoTable(
	"commonMain"..FunctionConst.FUNC_HOMELAND, FunctionConst.FUNC_HOMELAND)

--点击中间神树
TutorialStepExtend.step14003 =
{
	simulate = true,
	findfunc = function(nodeName)
		local root = display.getRunningScene():getSubNodeByName("mainTree")
		local clickWidget = root:getSubNodeByName("_panelContainer")
		return clickWidget:getCascadeBoundingBox()
	end,
	clickfunc = function()
		local root = display.getRunningScene():getSubNodeByName("mainTree")
		root:_onBtnAdd()
		G_TutorialManager:clearTipLayer()
	end
}


--点击晋升
TutorialStepExtend.step14004 =
{
	simulate = true, --模拟点击
	findfunc = function()
		local root =  display.getRunningScene():getSubNodeByName("PopupHomelandMainUp")
		local clickWidget = root:getSubNodeByName("_btnUp")
		return clickWidget:getCascadeBoundingBox()
	end,

	clickfunc =  function(sender, stepData)
		logNewT("TutorialStepExtend.step14007")
		local root = display.getRunningScene():getSubNodeByName("PopupHomelandMainUp")
		root:_onBtnMainUp()
		--引导进入下一步
		stepData.doNextStep()
		--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP)
	end,

	bindfunc = function ( stepData )
		local stageObj = stepData.owner
		if stageObj then
			stageObj:bindProtoMsg(MessageIDConst.ID_C2S_HomeTreeUpLevel)
		end
	end
}

--剧情
TutorialStepExtend.step14005 ={}
---------------------------------------------------------------------------
---------------------------------------------------------------------------
return TutorialStepExtend
