-- Author: nieming
-- Date:2018-01-12 18:01:33
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupCarnivalActivity = class("PopupCarnivalActivity", PopupBase)
local CustomActivityConst = require("app.const.CustomActivityConst")
local FestivalResConfog = require("app.config.festival_res")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")

PopupCarnivalActivity.CURTAIN_NUM = 4


function PopupCarnivalActivity:ctor()

	--csb bind var name
	self._activityAwardEndTime = nil  --Text
	self._activityEndTime = nil  --Text
	self._closeBtn = nil  --Button
	self._commonTabGroupHorizon = nil  --CommonTabGroup
	self._leftBtn = nil  --Button
	self._rightBtn = nil  --Button
	self._tabGroup = nil  --
	self._imageBg = nil


	self._terms = nil
	self._curTermIndex = 0
	self._termsNum = 0
	self._curTermData = nil
	self._stagesData = nil
	self._visibleActivityDatas = {}

	self._curSelectLeftTabIndex = 0
	self._curSelectRightTabIndex = 0

	self._recoverLeftTabIndex = 0
	self._recoverRightTabIndex = 0

	self._activityModuleUIList = {}
	self._nodeContent = nil

	self._effectNode = nil
	self._backEffectNode = nil

	local resource = {
		file = Path.getCSB("PopupCarnivalActivity", "carnivalActivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_closeBtn = {
				events = {{event = "touch", method = "_onCloseBtn"}}
			},
			_leftBtn = {
				events = {{event = "touch", method = "_onLeftBtn"}}
			},
			_rightBtn = {
				events = {{event = "touch", method = "_onRightBtn"}}
			},
		},
	}
	
	PopupCarnivalActivity.super.ctor(self, resource)
end

-- Describle：
function PopupCarnivalActivity:onCreate()
    self:_updateTopBar()

	if cc.isRegister("CommonTabGroupScrollVertical") then
        cc.bind( self._tabGroup, "CommonTabGroupScrollVertical")
    end
	self._title:ignoreContentAdaptWithSize(true)
	-- self._tabGroup:setCustomColor({
	-- 	{Colors.CARNIVAL_TAB_NORMAL, Colors.CARNIVAL_TAB_NORMAL_OUTLINE},
	-- 	{Colors.CARNIVAL_TAB_BRIGHT, nil},
	-- 	{Colors.CARNIVAL_TAB_NORMAL, Colors.CARNIVAL_TAB_NORMAL_OUTLINE},
	-- })

	
	self:_refreshData()
	self._countdownText:setVisible(false)
	self._countdownTime:setVisible(false)
end

-- Describle：
function PopupCarnivalActivity:onEnter()
	self._signalGetAward = G_SignalManager:add(SignalConst.EVENT_GET_CARNIVAL_ACTIVITY_AWARD_SUCCESS, handler(self, self._onEventGetAward))
	self._signalActivtyDataChange = G_SignalManager:add(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE, handler(self, self._onEventDataChange))
end

-- Describle：
function PopupCarnivalActivity:onExit()
	self._signalGetAward:remove()
	self._signalGetAward = nil

	self._signalActivtyDataChange:remove()
	self._signalActivtyDataChange = nil
end

function PopupCarnivalActivity:_updateTopBar()
    -- body
    self:resumeUpdateTopBar()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBarItemList:updateUI(TopBarStyleConst.STYLE_CARNIVAL_ACTIVITY, true)
end

function PopupCarnivalActivity:resumeUpdateTopBar( )
	-- body
	self._topBarItemList:resumeUpdate()
end

-- Describle：
function PopupCarnivalActivity:_onCloseBtn()
	-- body
	self:close()
end
-- Describle：
function PopupCarnivalActivity:_onLeftBtn()
	-- body
	if self._curTermIndex > 1 then
		self._curTermIndex = self._curTermIndex - 1
		self:switchTerm()
	end

end
-- Describle：
function PopupCarnivalActivity:_onRightBtn()
	-- body
	if self._curTermIndex < self._termsNum then
		self._curTermIndex = self._curTermIndex + 1
		self:switchTerm()
	end
end


function PopupCarnivalActivity:_onEventGetAward(event,message)
	local activityData = G_UserData:getCarnivalActivity():getActivityDataById(message.act_id)
	if not activityData then
		return
	end
	local questData = activityData:getQuestDataById(message.quest_id)
	if not questData then
		return
	end

	local rewards = {}
	local fixRewards = questData:getRewardItems()
	local selectRewards = questData:getSelectRewardItems()
	for k,v in ipairs(fixRewards) do
		table.insert(rewards,v)
	end
	local award_id = rawget(message, "award_id")
	local selectReward
	if award_id then
		selectReward = selectRewards[message.award_id]--服务器从1开始
	end

	if selectReward then
		table.insert(rewards,selectReward)
	end
	local award_num = rawget(message, "award_num")
	local newRewards = rewards
	if award_num and award_num > 1 then
		newRewards = {}
		local rate = award_num
		for k,v in ipairs(rewards) do
			table.insert(newRewards,{type = v.type,value = v.value,size = v.size * rate})
		end
	end
	G_Prompt:showAwards(newRewards)

end

function PopupCarnivalActivity:_refreshData()
	local terms = G_UserData:getCarnivalActivity():getAllVisibleTermData()
	if #terms == 0 then
		return
	end
	self._terms = terms
	local oldTermData = self._curTermData
	self._termsNum = #self._terms
	--有排序 可能导致 顺序不一致 需要从新获取索引
	local selectIndex = nil
	local isRrefreshData = false
	--正在当前界面
	if oldTermData then
		for k, v in ipairs(terms) do
			if v:getCarnival_id() == oldTermData:getCarnival_id() and v:getTerm() == oldTermData:getTerm() then
				selectIndex = k
				isRrefreshData = true
				break
			end
		end
	end
	--如果没有当前索引  优先进入当前正在进行的
	if not selectIndex then
		for k, v in ipairs(terms) do
			if v:getState() == CustomActivityConst.STATE_ING then
				selectIndex = k
				break
			end
		end
	end
	--如果都结束了 优先进入最后一期领奖
	if not selectIndex then
		for i = #terms, 1, -1 do
			local termData = terms[i]
			if termData:getState() == CustomActivityConst.STATE_AWARD_ING then
				selectIndex = i
				break
			end
		end
	end
	self._curTermIndex = selectIndex or 1
	self._curTermData = self._terms[self._curTermIndex]
	self._stagesData = self._curTermData:getStages()


	--只是刷新数据的时候 保留tab的索引
	if isRrefreshData then
		self._recoverLeftTabIndex = self._curSelectLeftTabIndex
		self._recoverRightTabIndex = self._curSelectRightTabIndex
	end

	self._curSelectLeftTabIndex = 0
	self._curSelectRightTabIndex = 0


	-- 根据配置设置左侧tabcell图片
	local normalImage = ccui.Helper:seekNodeByName(self._tabGroup, "Image_normal")
	local titleConfig = FestivalResConfog.get(self._curTermData:getTerm_icon())
	normalImage:loadTexture(titleConfig.res_id_4)

	self:_refreshAll()
end


function PopupCarnivalActivity:switchTerm()
	self._curTermData = self._terms[self._curTermIndex]
	if not self._curTermData then
		assert(false, "term data is nil")
		return
	end
	self._stagesData = self._curTermData:getStages()
	self._curSelectLeftTabIndex = 0
	self._curSelectRightTabIndex = 0
	self:_refreshAll()
end


function PopupCarnivalActivity:_refreshAll()
	self:_refreshLeftTab()
	--self:_refreshTime()
	self:_refreshLeftAndRightBtn()
	self:_refreshAllRedPoint()
	self:_refreshTitleAndOther()
end

function PopupCarnivalActivity:_refreshTitleAndOther()
	if not self._curTermData then
		return
	end


	--刷新标题
	local titleConfig = FestivalResConfog.get(self._curTermData:getTerm_icon())
	assert(titleConfig ~= nil, "can not find res id")
	self._title:loadTexture(titleConfig.res_id)--标题图片
	self._title:ignoreContentAdaptWithSize(true)

	self._imageBg:loadTexture(titleConfig.res_id_2)--标题图片
	self._imageBg:ignoreContentAdaptWithSize(true)

	self._imageBg1:loadTexture(titleConfig.res_id_3)--标题图片
	self._imageBg1:ignoreContentAdaptWithSize(true)


	-- local showCurtain = titleConfig.if_blind == 1
	-- for k =1,PopupCarnivalActivity.CURTAIN_NUM,1 do
	-- 	local node = self["_imageCurtain"..k]
	-- 	node:setVisible(showCurtain)
	-- end
	

	--刷新特效

	--[[
	local carnivalId = self._curTermData:getCarnival_id()
	local carnivalActivityUnitData = G_UserData:getCarnivalActivity():getUnitDataById(carnivalId)
	if not carnivalActivityUnitData then
		return 
	end

	local effectConfig = FestivalResConfog.get(carnivalActivityUnitData:getMain_view())
	assert(effectConfig ~= nil, "can not find res id")
	]]

	local effectConfig = titleConfig
	

	local addEffect = function(effectName,parentNode)
		parentNode:removeAllChildren()
		if not effectName or effectName == "" then
			return
		end
		
		local effect = G_EffectGfxMgr:createPlayMovingGfx( parentNode, Path.getFightSceneEffect(effectName), nil, nil ,false ) 
	end
	
	addEffect(effectConfig.front_eft,self._effectNode)
	addEffect(effectConfig.back_eft,self._backEffectNode)

	
end

function PopupCarnivalActivity:_refreshContent()
	local stageData = self._stagesData[self._curSelectLeftTabIndex]
	if not stageData then
		assert(false, "not find stage data")
		return
	end

	if stageData:getSpecial_id() ~= 0 then
		return
	end

	local activitys = self._visibleActivityDatas
	local activityData= activitys[self._curSelectRightTabIndex]
	if not activityData then
		assert(false, "not find activity data")
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_CARNIVAL_ACTIVITY,{actId = activityData:getId()})

	self:_setActivityModuleUIVisible(false)	

	local activityModuleUI = self:_getActivityModuleUI(activityData)
	activityModuleUI:setVisible(true)
	activityModuleUI:refreshView(activityData,true)
end

function PopupCarnivalActivity:_onLeftTabSelect(tabIndex, sender)
	if tabIndex == self._curSelectLeftTabIndex then
		return
	end
	self._curSelectLeftTabIndex = tabIndex
	self:_refreshRightTab()
end

function PopupCarnivalActivity:_createLeftTabItem(tabNode)
    local tabItem = {}
    local instNode = tabNode
    tabItem.normalImage = ccui.Helper:seekNodeByName(instNode, "Image_normal")
    tabItem.downImage = ccui.Helper:seekNodeByName(instNode, "Image_down")
	tabItem.textWidget = ccui.Helper:seekNodeByName(instNode, "Text_desc")
	tabItem.textWidget:setFontSize(24)
	tabItem.textWidget:disableEffect(cc.LabelEffect.OUTLINE)
	tabItem.imageWidget = ccui.Helper:seekNodeByName(instNode, "Image_icon")
	tabItem.imageSelect = ccui.Helper:seekNodeByName(instNode, "Image_select")
	tabItem.imageTag = ccui.Helper:seekNodeByName(instNode, "Image_tag")
	tabItem.imageWidget:ignoreContentAdaptWithSize(true)
	tabItem.redPoint = ccui.Helper:seekNodeByName(instNode, "Image_RedPoint")
    return tabItem
end

function PopupCarnivalActivity:_updateLeftTabItem(tabItem)
    local index = tabItem.index
	local stageData = self._stagesData[index]
	if stageData then
		tabItem.textWidget:setString(stageData:getName())
		--[[
		local config = FestivalResConfog.get(stageData:getResID())
		assert(config ~= nil, "can not find res id "..tostring(stageData:getResID()))
		tabItem.imageWidget:loadTexture(config.res_id)
		tabItem.imageWidget:setScale(config.res_zoom/1000)
		]]
	end
end

function PopupCarnivalActivity:_getLeftTabCount()
    return #self._stagesData
end

function PopupCarnivalActivity:_refreshLeftTab()
	dump(self._stagesData)

	local titleConfig = FestivalResConfog.get(self._curTermData:getTerm_icon())
	self._tabBrightColor = Colors.toColor3B(tonumber(titleConfig.color_5))


	local param = {
		callback = handler(self, self._onLeftTabSelect),
		containerStyle = 2,
        offset = 2,
		tabStyle =  1,
        createTabItemCallback = handler(self,self._createLeftTabItem),
        updateTabItemCallback = handler(self,self._updateLeftTabItem),
		getTabCountCallback = handler(self,self._getLeftTabCount),
		brightTabItemCallback = handler(self,self._brightLeftTabItem),
	}
	self._curSelectLeftTabIndex = 0
	self._tabGroup:recreateTabs(param)

	self._tips:setColor(Colors.toColor3B(tonumber(titleConfig.color_4)))
	self._tips:enableOutline(Colors.toColor3B(tonumber(titleConfig.color_4_1)), 2)

	if self._recoverLeftTabIndex ~= 0 and self._recoverLeftTabIndex <= #self._stagesData then
		self._tabGroup:setTabIndex(self._recoverLeftTabIndex)
	else
		self._tabGroup:setTabIndex(1)
	end
	self._recoverLeftTabIndex = 0
end

function PopupCarnivalActivity:_onRightTabSelect(tabIndex, sender)
	if tabIndex == self._curSelectRightTabIndex then
		return
	end
	self._curSelectRightTabIndex = tabIndex
	self:_refreshContent()
	self:_refreshTabRedPoint()
end

function PopupCarnivalActivity:_refreshRightTab()
	local stageData = self._stagesData[self._curSelectLeftTabIndex]

	-- 特殊说明页面，只显示一张图片
	if stageData:getSpecial_id() ~= 0 then
		self:_setActivityModuleUIVisible(false)	
		local specialPanel = self:_getSpecialDesPanel(stageData:getSpecial_id())
		specialPanel:setVisible(true)
		return
	end

	local activitys = stageData:getVisibleActivitys()
	local textList = {}
	for _, v in ipairs(activitys)do
		table.insert(textList, v:getTitle())
	end

	if #textList <= 0 then
		self:_setActivityModuleUIVisible(false)	
	end

	local param = {
		callback = handler(self, self._onRightTabSelect),
		isVertical = 2,
		offset = 2,
		textList = textList,
        brightTabItemCallback = handler(self,self._brightTabItem),
	}
	self._curSelectRightTabIndex = 0
	self._visibleActivityDatas = activitys
	self._commonTabGroupHorizon:recreateTabs(param)
	if self._recoverRightTabIndex ~= 0 and self._recoverRightTabIndex <= #textList then
		self._commonTabGroupHorizon:setTabIndex(self._recoverRightTabIndex)
	else
		self._commonTabGroupHorizon:setTabIndex(1)
	end
	self._recoverRightTabIndex = 0
	self:_refreshTabRedPoint()
end

function PopupCarnivalActivity:_brightLeftTabItem(tabItem,bright)
    local textWidget = tabItem.textWidget
    local normalImage = tabItem.normalImage
    local downImage =  tabItem.downImage
    normalImage:setVisible(not bright)
	downImage:setVisible(bright)
    textWidget:setColor(bright and Colors.TAB_CHOOSE_TEXT_COLOR or self._tabBrightColor)
end


function PopupCarnivalActivity:_brightTabItem(tabItem,bright)
    local textWidget = tabItem.textWidget
    local normalImage = tabItem.normalImage
    local downImage =  tabItem.downImage
    normalImage:setVisible(not bright)
    downImage:setVisible(bright)
    textWidget:setColor(bright and  Colors.TAB_TWO_SELECTED or Colors.TAB_TWO_NORMAL)
   -- textWidget:enableOutline(bright and Colors.CHAT_TAB_BRIGHT_OUTLINE or Colors.CHAT_TAB_NORMAL_OUTLINE ,2)
end

function PopupCarnivalActivity:_refreshTime()
	self._countdownTime:stopAllActions()
	self:_updateTime()
	local UIActionHelper = require("app.utils.UIActionHelper")
	local action = UIActionHelper.createUpdateAction(function()
		self:_updateTime()
	end, 0.5)
	self._countdownTime:runAction(action)
end

function PopupCarnivalActivity:_updateTime()
	if not self._curTermData then
		return
	end
	local startTime = self._curTermData:getStart_time()
	local endTime = self._curTermData:getEnd_time()
	local awardTime = self._curTermData:getAward_time()
	local curTime = G_ServerTime:getTime()
	if curTime < startTime then
		self._countdownText:setVisible(true)
		self._countdownText:setString(Lang.get("lang_carnival_activity_begin_countdown"))
		self._countdownTime:setString(CustomActivityUIHelper.getLeftDHMSFormat(startTime))
	elseif curTime >= startTime and curTime < endTime then
		self._countdownText:setVisible(true)
		self._countdownText:setString(Lang.get("lang_carnival_activity_end_countdown"))
		self._countdownTime:setString(CustomActivityUIHelper.getLeftDHMSFormat(endTime))
	elseif curTime >= endTime and curTime < awardTime then
		self._countdownText:setVisible(true)
		self._countdownText:setString(Lang.get("lang_carnival_activity_award_end_countdown"))
		self._countdownTime:setString(CustomActivityUIHelper.getLeftDHMSFormat(awardTime))
	else
		self._countdownText:setVisible(false)
		self._countdownTime:stopAllActions()
		self._countdownTime:setString(Lang.get("lang_carnival_activity_award_end"))
	end
end



function PopupCarnivalActivity:_refreshLeftAndRightBtn()
	self._leftBtn:setVisible(self._curTermIndex > 1)
	self._rightBtn:setVisible(self._curTermIndex < self._termsNum)
end

--刷新当前页签下面tab 页签的红点状态
function PopupCarnivalActivity:_refreshTabRedPoint()
	if not self._stagesData then
		return
	end
	for k, v in ipairs(self._stagesData) do
		local activitys = v:getVisibleActivitys()
		local havaRedPoint = false
		for i, act in ipairs(activitys) do
			if act:isHasRedPoint() then
				havaRedPoint = true
				break
			end
		end
		self._tabGroup:setRedPointByTabIndex(k, havaRedPoint)
	end

	for k,act in ipairs(self._visibleActivityDatas) do
		if act:isHasRedPoint() then
			self._commonTabGroupHorizon:setRedPointByTabIndex(k, true)
		else
			self._commonTabGroupHorizon:setRedPointByTabIndex(k, false)
		end
	end
	
end

--刷新所有红点状态
function PopupCarnivalActivity:_refreshAllRedPoint()
	self:_refreshTabRedPoint()

	local leftBtnRedPoint = false
	local rightBtnRedPoint = false

	local leftTerms = {}
	local leftCount = 0
	for i = 1, self._curTermIndex -1 do
		local termData = self._terms[i]
		local key = termData:getCarnival_id().."_"..termData:getTerm()
		leftTerms[key] = true
		leftCount = leftCount + 1
	end
	if leftCount > 0 then
		leftBtnRedPoint = G_UserData:getCarnivalActivity():isTermsHasRedPoint(leftTerms)
	end

	local rightTerms = {}
	local rightCount = 0
	for i = self._curTermIndex + 1, self._termsNum do
		local termData = self._terms[i]
		local key = termData:getCarnival_id().."_"..termData:getTerm()
		rightTerms[key] = true
		rightCount = rightCount + 1
	end
	if rightCount > 0 then
		rightBtnRedPoint = G_UserData:getCarnivalActivity():isTermsHasRedPoint(rightTerms)
	end


	self._rightRedPoint:setVisible(rightBtnRedPoint)
	self._leftRedPoint:setVisible(leftBtnRedPoint)
end

function PopupCarnivalActivity:_onEventDataChange()--+++++++++++++++++++++++++`
	self:_refreshData()
end



function PopupCarnivalActivity:_setActivityModuleUIVisible(visible)
	--右边内容视图切换
	for i,view in pairs(self._activityModuleUIList) do
		view:setVisible(visible)
	end

	if self._carnivalActivitySpecialPanel then
		self._carnivalActivitySpecialPanel:setVisible(false)
	end
end
	
function PopupCarnivalActivity:_getActivityModuleUI(actUnitdata)
	local actType = actUnitdata:getAct_type() 
	local activityModuleUI = self._activityModuleUIList[actType]
	if activityModuleUI == nil then
		if actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_DROP_SHOW then
			local CarnivalActivityIntroLayer = require("app.scene.view.carnivalActivity.CarnivalActivityIntroLayer")
			activityModuleUI = CarnivalActivityIntroLayer.new(actType)
		elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL then
			local CarnivalActivityExchangeLayer = require("app.scene.view.carnivalActivity.CarnivalActivityExchangeLayer")
			activityModuleUI = CarnivalActivityExchangeLayer.new(actType, actUnitdata:getQuest_type() )
		elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY then
			local CarnivalActivityRechargeLayer = require("app.scene.view.carnivalActivity.CarnivalActivityRechargeLayer")
			activityModuleUI = CarnivalActivityRechargeLayer.new(actType)
		elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PUSH then
			local CarnivalActivityTaskLayer = require("app.scene.view.carnivalActivity.CarnivalActivityTaskLayer")
			activityModuleUI = CarnivalActivityTaskLayer.new(actType)
		end
		local point = G_ResolutionManager:getDesignCCPoint()
		activityModuleUI:setPosition(-point.x,-point.y)
		self._nodeContent:addChild(activityModuleUI)
		self._activityModuleUIList[actType] = activityModuleUI
	end
	return activityModuleUI
end

function PopupCarnivalActivity:_getSpecialDesPanel(special_id)
	if self._carnivalActivitySpecialPanel == nil then
		local CarnivalActivitySpecialLayer = require("app.scene.view.carnivalActivity.CarnivalActivitySpecialLayer")
		self._carnivalActivitySpecialPanel = CarnivalActivitySpecialLayer.new(special_id)
		local point = G_ResolutionManager:getDesignCCPoint()
		self._carnivalActivitySpecialPanel:setPosition(-point.x,-point.y)
		self._nodeContent:addChild(self._carnivalActivitySpecialPanel)
	end

	return self._carnivalActivitySpecialPanel
end


return PopupCarnivalActivity
