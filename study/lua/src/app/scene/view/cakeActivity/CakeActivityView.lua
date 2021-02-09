--
-- Author: Liangxu
-- Date: 2019-4-29
-- 蛋糕活动

local ViewBase = require("app.ui.ViewBase")
local CakeActivityView = class("CakeActivityView", ViewBase)
local PopupCakeGet = require("app.scene.view.cakeActivity.PopupCakeGet")
local CakeMaterialNode = require("app.scene.view.cakeActivity.CakeMaterialNode")
local CakeActivityInfoList = require("app.scene.view.cakeActivity.CakeActivityInfoList")
local CakeRankNode = require("app.scene.view.cakeActivity.CakeRankNode")
local CakeAwardBox = require("app.scene.view.cakeActivity.CakeAwardBox")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local CakeActivityConst = require("app.const.CakeActivityConst")
local CakeNode = require("app.scene.view.cakeActivity.CakeNode")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local PopupCakeAwardPreview = require("app.scene.view.cakeActivity.PopupCakeAwardPreview")
local PopupCakeDailyAward = require("app.scene.view.cakeActivity.PopupCakeDailyAward")
local PopupCakeLevelAward = require("app.scene.view.cakeActivity.PopupCakeLevelAward")
local DataConst = require("app.const.DataConst")
local CakeGuildTab = require("app.scene.view.cakeActivity.CakeGuildTab")
local AudioConst = require("app.const.AudioConst")

function CakeActivityView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS, onMsgCallBack)
	G_UserData:getCakeActivity():c2sEnterCakeActivity()
	
	return msgReg
end

function CakeActivityView:ctor()
	local resource = {
		file = Path.getCSB("CakeActivityView", "cakeActivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonShop = {
				events = {{event = "touch", method = "_onClickShop"}}
			},
			_buttonGetMaterial = {
				events = {{event = "touch", method = "_onClickGet"}}
			},
			_buttonAwardPreview = {
				events = {{event = "touch", method = "_onClickAwardPreview"}}
			},
			_buttonDaily = {
				events = {{event = "touch", method = "_onClickDaily"}}
			},
		},
	}
	CakeActivityView.super.ctor(self, resource)
end

function CakeActivityView:onCreate()
	self:_initData()
	self:_initView()
end

function CakeActivityView:_initData()
	self._targetTime = 0
	self._actStage = CakeActivityConst.ACT_STAGE_0
	self._lastActStage = CakeActivityConst.ACT_STAGE_0
	self._curCakeConfigInfo = nil
	self._curCakeData = nil
	self._cakeDataList = {}
	self._curCakeIndex = 0
	self._materialFakeCount = {} --材料假个数
	-- self._fakeCurExp = 0 --假的当前经验
	-- self._fakeLevel = 0 --假的等级
	self._isTouchingMaterical = false --是否在点击材料期间
end

function CakeActivityView:_initView()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_CAKE_ACTIVITY)

	local name1 = CakeActivityDataHelper.getMaterialName(CakeActivityConst.MATERIAL_TYPE_1)
	local name2 = CakeActivityDataHelper.getMaterialName(CakeActivityConst.MATERIAL_TYPE_2)
	local name3 = CakeActivityDataHelper.getMaterialName(CakeActivityConst.MATERIAL_TYPE_3)
	self._nodeHelp:updateUI(FunctionConst.FUNC_CAKE_ACTIVITY, {name1 = name1, name2 = name2, name3 = name3})
	
	self._buttonShop:updateUI(FunctionConst.FUNC_CAKE_ACTIVITY_SHOP)
	self._buttonDaily:updateUI(FunctionConst.FUNC_CAKE_ACTIVITY_DAILY_AWARD)

	local type = G_UserData:getCakeActivity():getActType()
	local info = CakeActivityDataHelper.getCakeResouceConfig(type)
	local customIcon = Path.getCommonIcon("main", info.gain_icon)
	local customIconTxt = info.gain_icon_word
	self._buttonGetMaterial:updateUI(FunctionConst.FUNC_CAKE_ACTIVITY_GET_MATERIAL, customIcon, customIconTxt)

	self._buttonAwardPreview:updateUI(FunctionConst.FUNC_CAKE_ACTIVITY_AWARD_PREVIEW)
	for i = 1, 3 do
		self["_material"..i] = CakeMaterialNode.new(self["_nodeMaterial"..i], i, handler(self, self._onClickMaterial), handler(self, self._onClickMaterialStep)) --材料
		self["_material"..i]:setStartCallback(handler(self, self._onStartCallback))
		self["_material"..i]:setStopCallback(handler(self, self._onStopCallback))
	end
	self._cake = CakeNode.new(self._nodeCake)
	self._infoList = CakeActivityInfoList.new(self._nodeInfoList, handler(self, self._doAddCakeExp)) --显示列表
	self._rank = CakeRankNode.new(self._nodeRank) --排行榜
	self._awardBox = CakeAwardBox.new(self._nodeAward, handler(self, self._onClickAwardBox))
	for i = 1, 3 do
		self["_cakeTab"..i] = CakeGuildTab.new(self["_nodeCakeTab"..i], i, handler(self, self._onClickCakeTab))
	end
	--G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, "moving_zhounianqingdangao", nil, nil, false)
end

function CakeActivityView:onEnter()
	self._signalEnterSuccess = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS, handler(self, self._onEventEnterSuccess))
	self._signalAddCakeExp = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_ADD_CAKE_EXP, handler(self, self._onEventAddCakeExp))
	self._signalUpdateCakeInfo = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_CAKE_INFO, handler(self, self._onEventUpdateCakeInfo))
	self._signalUpdateRankCakeAndNotice = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_RANK_CAKE_AND_NOTICE, handler(self, self._onEventUpdateRankCakeAndNotice))
	self._signalGetLevelUpReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_GET_LEVEL_UP_REWARD, handler(self, self._onEventGetLevelUpReward))
	self._signalUpdateLevelUpReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_LEVEL_UP_REWARD, handler(self, self._onEventUpdateLevelUpReward))
	self._signalCakeActivityUpdateStatus = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_ACTIVITY_STATUS, handler(self, self._onEventCakeActivityUpdateStatus))
	self._signalGetRechargeReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_GET_RECHARGE_REWARD, handler(self, self._onEventGetRechargeReward))
	self._signalRechargeReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_RECHARGE_REWARD, handler(self, self._onEventRechargeReward))
	self._signalGetTaskReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_GET_TASK_REWARD, handler(self, self._onEventGetTaskReward))
	self._signalRedPointClick = G_SignalManager:add(SignalConst.EVENT_RED_POINT_CLICK, handler(self,self._onEventRedPointClick))
	self._signalLoginSuccess = G_SignalManager:add(SignalConst.EVENT_LOGIN_SUCCESS, handler(self, self._onEventLoginSuccess))
	self._signalGetDailyReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_GET_DAILY_REWARD, handler(self, self._onEventGetDailyReward))

	self:_updateData()
	self:_updateView()
	self._infoList:initInfoList()
	self:_updateCakeTab()
	self:_startCountDown()
	G_AudioManager:playMusicWithId(AudioConst.SOUND_BGM_CAKE_MAIN)
	
	if self._lastActStage == CakeActivityConst.ACT_STAGE_2 and self._actStage == CakeActivityConst.ACT_STAGE_3 then --如果从等待阶段到跨服阶段了，要重新拉取
		G_UserData:getCakeActivity():c2sEnterCakeActivity()
	end
end

function CakeActivityView:onExit()
    self:_stopCountDown()

    self._signalEnterSuccess:remove()
    self._signalEnterSuccess = nil
    self._signalAddCakeExp:remove()
    self._signalAddCakeExp = nil
    self._signalUpdateCakeInfo:remove()
    self._signalUpdateCakeInfo = nil
    self._signalUpdateRankCakeAndNotice:remove()
    self._signalUpdateRankCakeAndNotice = nil
    self._signalGetLevelUpReward:remove()
    self._signalGetLevelUpReward = nil
    self._signalUpdateLevelUpReward:remove()
    self._signalUpdateLevelUpReward = nil
    self._signalCakeActivityUpdateStatus:remove()
    self._signalCakeActivityUpdateStatus = nil
    self._signalGetRechargeReward:remove()
    self._signalGetRechargeReward = nil
	self._signalRechargeReward:remove()
	self._signalRechargeReward = nil
    self._signalGetTaskReward:remove()
    self._signalGetTaskReward = nil
    self._signalRedPointClick:remove()
    self._signalRedPointClick = nil
    self._signalLoginSuccess:remove()
    self._signalLoginSuccess = nil
    self._signalGetDailyReward:remove()
    self._signalGetDailyReward = nil

    self._infoList:onExit()
end

function CakeActivityView:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function CakeActivityView:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function CakeActivityView:_updateCountDown()
	local countDown = self._targetTime - G_ServerTime:getTime()
	if countDown >= 0 then
		local timeString = G_ServerTime:getLeftDHMSFormatEx(self._targetTime)
    	self._textCountDown:setString(timeString)
    else
    	self._textCountDown:setString("")
    	if self._actStage == CakeActivityConst.ACT_STAGE_2 then
    		G_UserData:getCakeActivity():c2sEnterCakeActivity() --从阶段2到阶段3时，重新拉一边数据
    	end
    	self:_updateActivityStage()
	end
end

function CakeActivityView:_updateData()
	local index = G_UserData:getCakeActivity():getSelectCakeIndex()
	if index == 0 then
		index = 1
	end
	self._curCakeIndex = index
	self:_updateCakeData()
end

function CakeActivityView:_updateCakeData()
	self._cakeDataList = G_UserData:getCakeActivity():getCakeDataList()
	self._curCakeData = self._cakeDataList[self._curCakeIndex]
	self._curCakeConfigInfo = CakeActivityDataHelper.getCurCakeLevelConfig(self._curCakeData:getCake_level())
	-- self._fakeCurExp = self._curCakeData:getCake_exp()
	-- self._fakeLevel = self._curCakeData:getCake_level()
end

function CakeActivityView:_updateView()
	local ret = self:_updateActivityStage()
	if ret == false then --强制退出，后面不执行
		return
	end
	self:_updateCakeView()
	self:_initCakeTab()
	self:_updateAwardBox()
	self:_updateMaterial()
	self:_updateRank()
	self:_updateShopRp()
	self:_updateMaterialBtnRp()
	self:updateDailyBtnRp()
end

--更新活动阶段
function CakeActivityView:_updateActivityStage()
	local actStage, startTime, endTime = CakeActivityDataHelper.getActStage()
	if actStage == CakeActivityConst.ACT_STAGE_0 then
		G_Prompt:showTip(Lang.get("cake_activity_countdown_finish"))
		G_SceneManager:popScene() --活动结束，强制退出
		return false
	end
	self._lastActStage = self._actStage
	self._actStage = actStage
	local helpPosX = 370
	local info = CakeActivityDataHelper.getCurCakeResouceConfig()
	local sceneId1 = info.cake_map1
	local sceneId2 = info.cake_map2
	if actStage == CakeActivityConst.ACT_STAGE_1 then
		self:updateSceneId(sceneId1)
		self._topbarBase:setImageTitle("txt_sys_zhounianqing")
		self._textCountDownTitle:setString(Lang.get("cake_activity_countdown_title_1"))
		self._textCountDownTitle:setPositionX(200)
		self._textCountDown:setPositionX(205)
		self._targetTime = endTime
		helpPosX = 310
	elseif actStage == CakeActivityConst.ACT_STAGE_2 then
		self:updateSceneId(sceneId1)
		self._topbarBase:setImageTitle("txt_sys_zhounianqing")
		self._textCountDownTitle:setString(Lang.get("cake_activity_countdown_title_2"))
		self._textCountDownTitle:setPositionX(213)
		self._textCountDown:setPositionX(218)
		self._targetTime = endTime
		helpPosX = 310
	elseif actStage == CakeActivityConst.ACT_STAGE_3 then
		self:updateSceneId(sceneId2)
		self._topbarBase:setImageTitle("txt_sys_kuafuzhounianqing")
		self._textCountDownTitle:setString(Lang.get("cake_activity_countdown_title_3"))
		self._textCountDownTitle:setPositionX(200)
		self._textCountDown:setPositionX(205)
		self._targetTime = endTime
	elseif actStage == CakeActivityConst.ACT_STAGE_4 then
		self:updateSceneId(sceneId2)
		self._topbarBase:setImageTitle("txt_sys_kuafuzhounianqing")
		self._textCountDownTitle:setString(Lang.get("cake_activity_countdown_title_4"))
		self._textCountDownTitle:setPositionX(200)
		self._textCountDown:setPositionX(205)
		self._targetTime = endTime
	else
		self._textCountDownTitle:setString(Lang.get("cake_activity_countdown_finish"))
		self._textCountDownTitle:setPositionX(223)
	end
	self._nodeHelp:setPosition(cc.p(helpPosX, 616))
	self._rank:updateStage()
end

function CakeActivityView:_updateCakeView()
	self._cake:updateUI(self._curCakeConfigInfo)
	local guildName = self._curCakeData:getGuild_name()
	local foodName = CakeActivityDataHelper.getFoodName()
	self._textCakeName:setString(Lang.get("cake_activity_cake_name", {name = guildName, foodName = foodName}))
	self._textCakeLevel:setString(Lang.get("cake_activity_cake_level", {level = self._curCakeData:getCake_level()}))
	local totalExp = self._curCakeConfigInfo.exp
	if totalExp == 0 then --最高级时，分母显示上一等级的值
		local info = CakeActivityDataHelper.getCurCakeLevelConfig(self._curCakeData:getCake_level()-1)
		totalExp = info.exp
	end
	local curExp = self._curCakeData:getCake_exp()
	local percent = curExp/totalExp*100
	self._loadingBarExp:setPercent(percent)
	self._textExpPercent1:setString(curExp)
	self._textExpPercent2:setString(totalExp)
end

function CakeActivityView:_fakeUpdateCakeView(itemId)
	-- local configInfo = CakeActivityDataHelper.getCurCakeLevelConfig(self._fakeLevel)
	-- self._cake:updateUI(configInfo)
	-- self._textCakeLevel:setString(Lang.get("cake_activity_cake_level", {level = self._fakeLevel}))
	-- local totalExp = configInfo.exp
	-- if totalExp == 0 then --最高级时，分母显示上一等级的值
	-- 	local info = CakeActivityDataHelper.getCurCakeLevelConfig(self._fakeLevel-1)
	-- 	totalExp = info.exp
	-- end
	-- local curExp = self._fakeCurExp
	-- local percent = curExp/totalExp*100
	-- self._loadingBarExp:setPercent(percent)
	-- self._textExpPercent1:setString(curExp)
	-- self._textExpPercent2:setString(totalExp)

	local type = CakeActivityDataHelper.getMaterialTypeWithId(itemId)
	self["_material"..type]:setCount(self._materialFakeCount[itemId])
end

function CakeActivityView:_fakePushBullet(itemId, realCostCount)
	local fakeNoticeDatas = {}
	local tempData = {}
	tempData.notice_id = CakeActivityConst.NOTICE_TYPE_COMMON
	tempData.contents = {}
	if self._actStage == CakeActivityConst.ACT_STAGE_3 then
		table.insert(tempData.contents, {key = "sname", value = G_UserData:getBase():getReal_server_name()})
	end
	table.insert(tempData.contents, {key = "uname", value = G_UserData:getBase():getName()})
	table.insert(tempData.contents, {key = "itemid1", value = tostring(itemId)})
	table.insert(tempData.contents, {key = "itemnum", value = tostring(realCostCount)})
	local fakeNoticeData = G_UserData:getCakeActivity():createFakeNoticeData(tempData)
	table.insert(fakeNoticeDatas, fakeNoticeData)
	self._infoList:pushBullet(fakeNoticeDatas)
end

function CakeActivityView:_updateAwardBox()
	local rewards = G_UserData:getCakeActivity():getUpRewards()
	local notReceieveId = 0 --可领但没领的奖励Id
	for i, reward in ipairs(rewards) do
		if reward.isReceived == false then
			notReceieveId = reward.rewardId
			break
		end
	end
	self._nodeAward:setVisible(true)
	if notReceieveId > 0 then
		self._awardBox:updateUI(CakeActivityConst.AWARD_STATE_2, notReceieveId)
	else
		local cakeLevel = self._curCakeData:getCake_level()
		if cakeLevel < CakeActivityConst.MAX_LEVEL then
			local info = CakeActivityDataHelper.getCurCakeLevelConfig(cakeLevel+1)
			local awardId = info.lv
			self._awardBox:updateUI(CakeActivityConst.AWARD_STATE_1, awardId)
		else
			self._nodeAward:setVisible(false) --最大级，隐藏宝箱
		end
	end
end

function CakeActivityView:_initCakeTab()
	local TAB_POS = {
		[1] = {cc.p(-147, 220)},
		[2] = {cc.p(-212, 220), cc.p(-82, 220)},
		[3] = {cc.p(-277, 220), cc.p(-147, 220), cc.p(-18, 220)},
	}
	local showCount = 0
	if (self._actStage == CakeActivityConst.ACT_STAGE_3 
		or self._actStage == CakeActivityConst.ACT_STAGE_4) 
		and G_UserData:getCakeActivity():getMyGuildCakeIndex() == 0 
	then --跨服\展示阶段，没有我的军团
		for i, data in ipairs(self._cakeDataList) do
			self["_cakeTab"..i]:updateUI(data)
			showCount = showCount + 1
		end
	end

	for i = 1, 3 do
		if i <= showCount then
			self["_nodeCakeTab"..i]:setVisible(true)
			local pos = TAB_POS[showCount][i]
			if pos then
				self["_nodeCakeTab"..i]:setPosition(pos)
			end
		else
			self["_nodeCakeTab"..i]:setVisible(false)
		end
	end
end

function CakeActivityView:_updateMaterial()
	for i = 1, 3 do
		local count = self["_material"..i]:updateCount()
		local itemId = CakeActivityDataHelper.getMaterialItemId(i)
		self._materialFakeCount[itemId] = count
	end
end

function CakeActivityView:_updateRank()
	self._rank:updateRank()
end

function CakeActivityView:_updateMyPoint()
	self._rank:updateMyScore()
end

function CakeActivityView:_updateShopRp()
	local show = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAKE_ACTIVITY_SHOP)
	self._buttonShop:showRedPoint(show)
end

function CakeActivityView:_onClickShop()
	local functionId = self._buttonShop:getFuncId()
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(functionId)
end

function CakeActivityView:_onClickGet()
	local popup = PopupCakeGet.new()
	popup:openWithAction()
end

function CakeActivityView:_onClickAwardPreview()
	if self._actStage == CakeActivityConst.ACT_STAGE_0 then
		G_Prompt:showTip(Lang.get("cake_activity_act_end_tip"))
		return
	end
	local index = nil
	if self._actStage == CakeActivityConst.ACT_STAGE_3 then --跨服阶段直接选中第2个页签
		index = 2
	end
	local popup = PopupCakeAwardPreview.new(index)
	popup:openWithAction()
end

function CakeActivityView:_onClickDaily()
	local popup = PopupCakeDailyAward.new(self)
	popup:openWithAction()
end

function CakeActivityView:_onClickMaterial(item)
	
end

function CakeActivityView:_doAddCakeExp(item)
	local addGuildId = self._curCakeData:getGuild_id()
	local itemId = item.id
	local itemNum = item.num
	G_UserData:getCakeActivity():c2sAddGuildCakeExp(addGuildId, itemId, itemNum)
	self:_setClickEnabled(false)
end

function CakeActivityView:_onStartCallback(itemId, count)
	self._isTouchingMaterical = true
end

function CakeActivityView:_onStopCallback()
	self._isTouchingMaterical = false
end

function CakeActivityView:_onClickMaterialStep(itemId, itemValue, costCountEveryTime)
	if CakeActivityDataHelper.isCanGiveMaterial(true) == false then
		return false
	end
	if self._materialFakeCount[itemId] <= 0 then
		return false
	end
	local realCostCount = math.min(self._materialFakeCount[itemId], costCountEveryTime)
	self._materialFakeCount[itemId] = self._materialFakeCount[itemId] - realCostCount
	-- self._fakeCurExp = self._fakeCurExp + (itemValue * realCostCount)
	-- local configInfo = CakeActivityDataHelper.getCurCakeLevelConfig(self._fakeLevel)
	-- if configInfo.exp > 0 and self._fakeCurExp >= configInfo.exp then
	-- 	self._fakeCurExp = self._fakeCurExp - configInfo.exp
	-- 	self._fakeLevel = self._fakeLevel + 1
	-- end
	self:_fakeUpdateCakeView(itemId)
	self:_fakePlayEffect(itemId)
	self:_fakePushBullet(itemId, realCostCount)
	self:_playMaterialSound(itemId)

	return true, realCostCount
end

function CakeActivityView:_playMaterialSound(itemId)
	local soundId = CakeActivityDataHelper.getMaterialSoundIdWithId(itemId)
	if soundId > 0 then
		G_AudioManager:playSoundWithId(soundId)
	end
end

function CakeActivityView:_onClickAwardBox(state, awardId)
	--跨服阶段时，不是自己的军团，不能点开这个奖励预览界面
	if (self._actStage == CakeActivityConst.ACT_STAGE_3 or self._actStage == CakeActivityConst.ACT_STAGE_4) and G_UserData:getCakeActivity():getMyGuildCakeIndex() == 0 then
		G_Prompt:showTip(Lang.get("cake_activity_can_not_receive_award_tip"))
		return
	end
	local curLevel = self._curCakeData:getCake_level()
	local popup = PopupCakeLevelAward.new(curLevel)
	popup:openWithAction()
end

function CakeActivityView:_onClickCakeTab(index)
	if self._curCakeIndex == index then
		return
	end
	self._curCakeIndex = index
	self:_updateCakeTab()
end

function CakeActivityView:_updateCakeTab()
	for i = 1, 3 do
		self["_cakeTab"..i]:setSelected(self._curCakeIndex == i)
	end
	self:_updateCakeData()
	self:_updateCakeView()
	self:_updateAwardBox()
	if self._actStage == CakeActivityConst.ACT_STAGE_3 then
		G_UserData:getCakeActivity():setSelectCakeIndex(self._curCakeIndex)
	end
end

function CakeActivityView:_onEventEnterSuccess()
	self:_updateData()
	self:_updateView()
	self._infoList:initInfoList()
	self:_updateCakeTab()
end

function CakeActivityView:_onEventAddCakeExp(eventName, itemId, itemNum, awards, noticeDatas, addEggLimit)
	-- if self._isTouchingMaterical == false then --不在点击材料期间，才刷新材料数据，防止假数据和真数据混淆造成的显示误差
		self:_updateMaterial()
	-- end
	self:_updateCakeData()
	self:_updateCakeView()
	self:_updateMyPoint()
	if addEggLimit then
		local materialName = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId).name
		G_Prompt:showTip(Lang.get("cake_activity_add_egg_limit_tip", {materialName = materialName}))
	end

	self:_setClickEnabled(true)
	G_Prompt:showAwardsExploreMode(self._nodeAwardPrompt, awards)
end

function CakeActivityView:_onEventUpdateCakeInfo(eventName, guildIds)
	local curGuildId = self._curCakeData:getGuild_id()
	local isIn = false
	for i, guildId in ipairs(guildIds) do
		if curGuildId == guildId then
			isIn = true
		end
	end
	if isIn then
		self:_updateCakeData()
		self:_updateCakeView()
		if self._curCakeData:isLevelUp() then
			self:_playLevelUpEffect()
			G_AudioManager:playSoundWithId(AudioConst.SOUND_CAKE_LVUP)
		end
	end
end

function CakeActivityView:_onEventUpdateRankCakeAndNotice(eventName, noticeDatas)
	self:_updateRank()
	self._infoList:pushBullet(noticeDatas)
end

function CakeActivityView:_onEventGetLevelUpReward(eventName, awards)
	self:_updateMaterial()
	self:_updateAwardBox()
end

function CakeActivityView:_onEventGetDailyReward(eventName)
	self:_updateMaterial()
end

function CakeActivityView:_onEventUpdateLevelUpReward(eventName)
	self:_updateAwardBox()
end

function CakeActivityView:_onEventCakeActivityUpdateStatus()
	self:_updateActivityStage()
end

function CakeActivityView:_onEventGetRechargeReward()
	self:_updateMaterial()
end

function CakeActivityView:_onEventRechargeReward()
	self:_updateMaterial()
end

function CakeActivityView:_onEventGetTaskReward(eventName, taskId, awards)
	self:_updateMaterial()
	self:_updateMaterialBtnRp()
end

function CakeActivityView:_onEventRedPointClick(eventName, funcId)
	if funcId == FunctionConst.FUNC_CAKE_ACTIVITY_GET_MATERIAL then
		self:_updateMaterialBtnRp()
	end
end

function CakeActivityView:_onEventLoginSuccess()
	G_UserData:getCakeActivity():c2sEnterCakeActivity() --断线重连
end

function CakeActivityView:_fakePlayEffect(itemId)
	self:_playSingleEffect(itemId)
end

function CakeActivityView:_playSingleEffect(itemId)
	local particleNames = {
		[2] = "tujiegreen",
		[3] = "tujieblue",
		[4] = "tujiepurple",
		[5] = "tujieorange",
	}
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
	local color = param.cfg.color
	local particleName = particleNames[color] or particleNames[2]
	local emitter = cc.ParticleSystemQuad:create("particle/"..particleName..".plist")
	emitter:resetSystem()

	local type = CakeActivityDataHelper.getMaterialTypeWithId(itemId)
	local startPos = UIHelper.convertSpaceFromNodeToNode(self["_nodeMaterial"..type], self)
	emitter:setPosition(startPos)
	self:addChild(emitter)
	local endPos = UIHelper.convertSpaceFromNodeToNode(self._nodeCake, self)
	local pointPos1 = cc.p(startPos.x, startPos.y + 200)
	local pointPos2 = cc.p((startPos.x + endPos.x) / 2, startPos.y + 100)
	local bezier = {
		pointPos1,
		pointPos2,
		endPos
	}
	local action1 = cc.BezierTo:create(0.7, bezier)
	local action2 = cc.EaseSineIn:create(action1)
	emitter:runAction(
		cc.Sequence:create(
			action2,
			cc.CallFunc:create(
				function()
					self:_playFinishEffect()
					self:_setClickEnabled(true)
				end
			),
			cc.RemoveSelf:create()
		)
	)
end

--播放结束特效
function CakeActivityView:_playFinishEffect()
	local function effectFunction(effect)
		if effect == "effect_equipjinglian" then
			local subEffect = EffectGfxNode.new("effect_equipjinglian")
			subEffect:play()
			return subEffect
		end

		return cc.Node:create()
	end

	local function eventFunction(event)
		if event == "finish" then
		end
	end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_equipjinglian", effectFunction, eventFunction, true)
	effect:setPosition(
		cc.p(G_ResolutionManager:getDesignWidth() * 0.5 + 30, G_ResolutionManager:getDesignHeight() * 0.5 + 50)
	)
end

function CakeActivityView:_setClickEnabled(enable)
	for i = 1, 3 do
		self["_cakeTab"..i]:setEnabled(enable)
	end
end

function CakeActivityView:_playLevelUpEffect()
	local function eventFunction(event)
        if event == "finish" then
        	
        end
    end
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, "moving_dangao_dangaoshengji", nil, eventFunction , true)
end

--更新获取材料按钮红点
function CakeActivityView:_updateMaterialBtnRp()
	local show = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, "getMaterial")
	self._buttonGetMaterial:showRedPoint(show)
end

function CakeActivityView:updateDailyBtnRp()
	local show = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, "getDailyAward")
	self._buttonDaily:showRedPoint(show)
end

return CakeActivityView