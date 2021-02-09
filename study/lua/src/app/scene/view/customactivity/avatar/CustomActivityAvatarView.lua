
-- Author: nieming
-- Date:2018-04-12 16:33:24
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CustomActivityAvatarView = class("CustomActivityAvatarView", ViewBase)
local CustomActivityAvatarHelper = import(".CustomActivityAvatarHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local UserCheck = require("app.utils.logic.UserCheck")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local DataConst = require("app.const.DataConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")

local FAST_STEP_TIME = 0.025 --快速转动步长时间
local FAST_STEP_TIME_CONTINUOUTS = FAST_STEP_TIME  --连续过程中的步长时间
local HIGHLIGHT_TIME = FAST_STEP_TIME * 5 --高亮停留时间
local SLOW_TIME = 0.04 --减数时间
local TOTAL_ITEM_NUM = 14 --item 个数

function CustomActivityAvatarView:ctor(parentView,activityUnitData)

	--csb bind var name
	self._btnFive = nil  --CommonButtonSwitchLevel0
	self._btnOne = nil  --CommonButtonSwitchLevel0
	self._btnReadme = nil  --Button
	self._btnShop = nil  --CommonMainMenu
	self._costNum = nil  --Text
	self._curName = nil  --Text
	self._freeNum = nil  --Text
	self._getState = nil  --SingleNode
	self._imageCostIcon = nil  --ImageView
	self._itemParentNode = nil  --SingleNode
	self._runState = nil  --SingleNode

	self._parentView = parentView
	self._awardsItemList = {} --awards item 节点
	self._lastIndex = 1 -- 上一次结束索引
	self._actionState = false --播放动画状态
	self._targetIndex = 1 -- 单次索引
	self._targetIndexs = {} -- 五连 索引列表
	self._fiveTurnIndex = 1 --五连轮转index
	self._awards = {} --奖励 type value size
	self._recvAwards = {}
	self._activityUnitData = activityUnitData
	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CustomActivityAvatarView", "customactivity/avatar"),
		binding = {
			_btnFive = {
				events = {{event = "touch", method = "_onBtnFive"}}
			},
			_btnOne = {
				events = {{event = "touch", method = "_onBtnOne"}}
			},
			_btnReadme = {
				events = {{event = "touch", method = "_onBtnReadme"}}
			},
			_btnShop = {
				events = {{event = "touch", method = "_onBtnShop"}}
			},
		},
	}
	CustomActivityAvatarView.super.ctor(self, resource)
end

-- Describle：
function CustomActivityAvatarView:onCreate()
	self._btnFive:setString(Lang.get("customactivity_avatar_act_fivetime"))
	self._btnOne:setString(Lang.get("customactivity_avatar_act_onetime"))
	self._btnShop:updateUI(FunctionConst.FUNC_AVATAR_ACTIVITY_SHOP)
	self:_initView()
	self:_createStaticEffect()
end

function CustomActivityAvatarView:_initView()
	local awardsList, cosRes, freeNum = CustomActivityAvatarHelper.getInitViewData(self._activityUnitData:getBatch())
	local CustomActivityAvatarViewItem = require("app.scene.view.customactivity.avatar.CustomActivityAvatarViewItem")
	self._awards = awardsList
	self._awardsItemList = {}
	for k, v in pairs(awardsList) do
		local item = CustomActivityAvatarViewItem.new(k, v)
		self._awardsItemList[k] = item
		local pos = CustomActivityAvatarHelper.getItemPositionByIndex(k)
		self._itemParentNode:addChild(item)
		item:setPosition(pos)
	end
	
	self:_initCostUI()

	self:_switchRunState()
	self:_updateFreeCount()
end

function CustomActivityAvatarView:_initCostUI()
	--local isReturnServer = G_GameAgent:isLoginReturnServer()
	local awardsList, cosRes, freeNum = CustomActivityAvatarHelper.getInitViewData(self._activityUnitData:getBatch())
	local resParam = TypeConvertHelper.convert(cosRes.type, cosRes.value, cosRes.size)
	local resNum = UserDataHelper.getNumByTypeAndValue(cosRes.type, cosRes.value, cosRes.size)

	local yubiParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
	local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)

	local Paramter = require("app.config.parameter")
	local consume_time1 = tonumber(Paramter.get(885).content)

	if resNum >= 10 then
		self._imageCostIcon1:loadTexture(resParam.res_mini)
		self._imageCostIcon2:loadTexture(resParam.res_mini)
		self._costNum1:setString(cosRes.size) -- 1次
		self._costNum2:setString(cosRes.size * 10) -- 5次
	elseif resNum > 0 then
		self._imageCostIcon1:loadTexture(resParam.res_mini)
		self._imageCostIcon2:loadTexture(yubiParam.res_mini)
		self._costNum1:setString(cosRes.size) -- 1次
		self._costNum2:setString(consume_time1 * 10) -- 5次
	else
		self._imageCostIcon1:loadTexture(yubiParam.res_mini)
		self._imageCostIcon2:loadTexture(yubiParam.res_mini)
		self._costNum1:setString(consume_time1) -- 1次
		self._costNum2:setString(consume_time1 * 10) -- 5次
	end
end


--静态特效
function CustomActivityAvatarView:_createStaticEffect()
	G_EffectGfxMgr:createPlayGfx(self._itemsEffectNode, "effect_xianshihuodong_faguang", nil, false)
end

function CustomActivityAvatarView:_updateFreeCount()
	local freeCount = CustomActivityAvatarHelper.getFreeCount(self._activityUnitData:getBatch())
	if freeCount > 0 then
		self._freeNode:setVisible(true)
		self._oneCostNode:setVisible(false)
		self._freeNum:setString(freeCount)
	else
		self._freeNode:setVisible(false)
		self._oneCostNode:setVisible(true)
	end
end

-- Describle：
function CustomActivityAvatarView:onEnter()
	self._signalRun = G_SignalManager:add(SignalConst.EVENT_AVATAR_ACTIVITY_SUCCESS, handler(self, self._onEventRun))
	self._signalFreeCountChange = G_SignalManager:add(SignalConst.EVENT_GET_DAILY_COUNT_SUCCESS, handler(self, self._onEventFreeCountChange))

end

-- Describle：
function CustomActivityAvatarView:onExit()
	self._signalRun:remove()
	self._signalRun = nil
	self._signalFreeCountChange:remove()
	self._signalFreeCountChange = nil
end
-- Describle：
function CustomActivityAvatarView:_onBtnFive()
	-- body
	--local isReturnServer = G_GameAgent:isLoginReturnServer()

	if self._actionState then
		return
	end
	if not G_UserData:getCustomActivity():isAvatarActivityVisible() then
		G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
		return
	end

	local getCosRes = CustomActivityAvatarHelper.getCosRes(self._activityUnitData:getBatch())
	local ownNum = UserDataHelper.getNumByTypeAndValue(getCosRes.type, getCosRes.value)
	local costYuBi = nil
	if getCosRes.size * 10 <= ownNum then 
		
	else
		local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
		local Paramter = require("app.config.parameter")
		local onceNeedNum = tonumber(Paramter.get(885).content)

		if onceNeedNum * 10 > yubiNum then
			local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
			G_Prompt:showTip(Lang.get("customactivity_equip_cost_not_enough", {name1 = param.name, name2 = param.name}))

			return
		end
		costYuBi = onceNeedNum * 10
	end

	-- if not UserCheck.enoughValue(getCosRes.type, getCosRes.value, getCosRes.size * 10, true) then
	-- 	return
	-- end

	local params = {
		moduleName = "COST_YUBI_MODULE_NAME_4",
		yubiCount = costYuBi,
		itemCount = 10,
	}
	UIPopupHelper.popupCostYubiTip(params, handler(self, self._doAvatarActivity), 2)
end

-- Describle：
function CustomActivityAvatarView:_onBtnOne()
	-- body
	--local isReturnServer = G_GameAgent:isLoginReturnServer()

	if self._actionState then
		return
	end

	if not G_UserData:getCustomActivity():isAvatarActivityVisible() then
		G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
		return
	end

	local freeCount = CustomActivityAvatarHelper.getFreeCount(self._activityUnitData:getBatch())
	local costYuBi = nil
	if freeCount <= 0 then
		local getCosRes = CustomActivityAvatarHelper.getCosRes(self._activityUnitData:getBatch())
		local ownNum = UserDataHelper.getNumByTypeAndValue(getCosRes.type, getCosRes.value)

		if getCosRes.size <= ownNum then 
		
		else
			local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
			local Paramter = require("app.config.parameter")
			local onceNeedNum = tonumber(Paramter.get(885).content)
			
			if onceNeedNum > yubiNum then
				local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
				G_Prompt:showTip(Lang.get("customactivity_equip_cost_not_enough", {name1 = param.name, name2 = param.name}))

				return
			end
			costYuBi = onceNeedNum
		end

		--if not UserCheck.enoughValue(getCosRes.type, getCosRes.value, getCosRes.size, true) then
		--	return
		--end
	end
	local params = {
		moduleName = "COST_YUBI_MODULE_NAME_4",
		yubiCount = costYuBi,
		itemCount = 1,
	}
	UIPopupHelper.popupCostYubiTip(params, handler(self, self._doAvatarActivity), 1)
	
end

function CustomActivityAvatarView:_doAvatarActivity(index)
	self._parentView:pauseUpdateTopBar()
	G_UserData:getAvatarActivity():c2sAvatarActivity(index)
end

function CustomActivityAvatarView:_onEventFreeCountChange()
	self:_updateFreeCount()
end

function CustomActivityAvatarView:_onEventRun(event, message)
	--check data
	local recvAwards = rawget(message, "awards")
	local indexs = {}
	local awards = {}
	if recvAwards then
		for k, v in pairs(recvAwards) do
			table.insert(indexs, v.index)
			table.insert(awards, v.award)
		end
	end
	self._recvAwards = awards

	self:_stopActions()
	-- self:_setAllItemOpacity(255 * 0.8)

	if #indexs <= 0 then
		return
	end

	if #indexs == 1 then
		self:_playOne(indexs[1])
	else
		self:_playFive(indexs)
	end

	self:_initCostUI()
end

function CustomActivityAvatarView:_stopActions()
	self:stopAllActions()
	for k , v in pairs(self._awardsItemList) do
		v:stopAction()
	end
end
-- Describle：
function CustomActivityAvatarView:_onBtnReadme()
	-- body
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_AVATAR_ACTIVITY )
end

-- function CustomActivityAvatarView:_setAllItemOpacity(op)
-- 	for k , v in pairs(self._awardsItemList) do
-- 		v:setNormalBgOpacity(op)
-- 	end
-- end

function CustomActivityAvatarView:_getTargetIndexCount(index)
	local newCount = 0
	if index <= self._lastIndex then
		newCount = index + #self._awardsItemList - self._lastIndex + 1
	else
		newCount = index - self._lastIndex + 1
	end
	return newCount
end

--缓慢开始
function CustomActivityAvatarView:_runStartSlow(startIndex, callback)
	self:_newSteps(startIndex, TOTAL_ITEM_NUM/2, FAST_STEP_TIME + SLOW_TIME * TOTAL_ITEM_NUM/2, -1*SLOW_TIME, function(index)
			self._awardsItemList[index]:playRun(HIGHLIGHT_TIME)
	end,function(index)
		callback()
	end)
end

--缓慢结束
function CustomActivityAvatarView:_runEndSlow(startIndex, callback)
	self:_newSteps(startIndex, TOTAL_ITEM_NUM/2, FAST_STEP_TIME, SLOW_TIME, function(index)
			self._awardsItemList[index]:playRun(HIGHLIGHT_TIME)
	end,function(index)
		callback()
	end)
end

--匀速
function CustomActivityAvatarView:_runAverage(startIndex, count, t, callback)
	self:_newSteps(startIndex, count, t, 0, function(index)
			self._awardsItemList[index]:playRun(HIGHLIGHT_TIME)
	end,function(index)
		callback()
	end)
end


function CustomActivityAvatarView:_playOne(targetIndex)
	self:_playActionStart()
	self._targetIndex = targetIndex
	local count = self:_getTargetIndexCount(targetIndex)
	count = count + 2*#self._awardsItemList
	self:_runStartSlow(self._lastIndex, function()
		self:_runAverage(self._lastIndex + 1, count, FAST_STEP_TIME, function()
			self:_runEndSlow(self._lastIndex + 1, function()
				self._awardsItemList[self._lastIndex]:playSelect(function()
					self:_popupAwards(self._recvAwards)
					self:_playActionEnd()
				end)
			end)
		end)
	end)
end

function CustomActivityAvatarView:_playActionStart()
	self._actionState = true
	self._itemsEffectNode:setVisible(false)
end

function CustomActivityAvatarView:_playActionEnd()
	self._parentView:resumeUpdateTopBar()
	-- self:_setAllItemOpacity(255)
	self._actionState = false
	self._itemsEffectNode:setVisible(true)
	self._awardsItemList[self._lastIndex]:setHighlight(false)
end
-- 中间显示奖励  状态
function CustomActivityAvatarView:_switchAwardState ()
	-- body...
	self._getState:setVisible(true)
	self._getState:removeAllChildren()
	self._getState:setPositionX(0)
	self._runState:setVisible(false)
	self._curName:setString(Lang.get("customactivity_avatar_act_title2"))
end

--中间显示点击状态
function CustomActivityAvatarView:_switchRunState ()
	-- body...
	self._getState:setVisible(false)
	self._getState:removeAllChildren()
	self._runState:setVisible(true)
	local actUnitdata = G_UserData:getCustomActivity():getAvatarActivity()
	if actUnitdata then
		self._curName:setString(actUnitdata:getTitle())
	end
end

function CustomActivityAvatarView:_updateFiveAward(index)
	local gapX = 75
	local posx = (index -1) * gapX
	-- local
	local awardIndex = self._targetIndexs[index]
	local award = self._awards[awardIndex]
	local parentNode = cc.Node:create()
	self._getState:addChild(parentNode)
	parentNode:setPosition(cc.p(posx, 0))
	-- parentNode:setScale(0.8)

	local function effectFunction(effect)
		if effect == "icon" then
			local item = ComponentIconHelper.createIcon(award.type,award.value,award.size)
			-- item:setScale(0.8)
			return item
		end
	end
	local effect = G_EffectGfxMgr:createPlayMovingGfx( parentNode, "moving_xianshihuodong_lianchou", effectFunction, nil ,false )

	local size = self._getState:getParent():getContentSize()


	if index <= 5 then
		self._getState:setPositionX(-1 * posx/2 +	size.width * 0.5)
	else
		self._getState:setPositionX(-1 * posx + gapX * 2 +	size.width * 0.5 )
	end
	

end

function CustomActivityAvatarView:_popupAwards(awards, callback)
	local PopupGetRewards = require("app.ui.PopupGetRewards").new(callback)
	PopupGetRewards:showRewards(awards)
end

function CustomActivityAvatarView:_fiveStepCallBack(index)
	self:_updateFiveAward(index)
	if index == #self._targetIndexs then

		self:_playActionEnd()
		-- local awards = {}
		-- for k, v in pairs(self._targetIndexs) do
		-- 	table.insert(awards, self._awards[v])
		-- end
		self:_popupAwards(self._recvAwards, function()
			if self._switchRunState then
				self:_switchRunState()
			end
		end)
	end
end
-- 连续5次 中间部分
function CustomActivityAvatarView:_runFiveAverage()
	if self._fiveTurnIndex >= #self._targetIndexs then
		return
	end
	self._fiveTurnIndex = self._fiveTurnIndex + 1
	self._targetIndex = self._targetIndexs[self._fiveTurnIndex]

	local count = self:_getTargetIndexCount(self._targetIndex)
	self:_runAverage(self._lastIndex, count, FAST_STEP_TIME_CONTINUOUTS, function()
		self._awardsItemList[self._lastIndex]:playSelect(function()
			self:_fiveStepCallBack(self._fiveTurnIndex)
			self:_runFiveAverage()
		end)
	end)
end

function CustomActivityAvatarView:_playFive(targetIndexs)
	if not targetIndexs or #targetIndexs <= 0 then
		return
	end
	self._targetIndexs = targetIndexs
	self._fiveTurnIndex = 1
	self._targetIndex = self._targetIndexs[self._fiveTurnIndex]
	self:_playActionStart()
	local count = self:_getTargetIndexCount(self._targetIndex)
	count = count + 2*#self._awardsItemList

	self:_runStartSlow(self._lastIndex, function()
		self:_runAverage(self._lastIndex + 1, count, FAST_STEP_TIME, function()
			self:_runEndSlow(self._lastIndex + 1, function()
				self._awardsItemList[self._lastIndex]:playSelect(function()
					self:_switchAwardState()
					self:_fiveStepCallBack(self._fiveTurnIndex)
					self:_runFiveAverage()
				end)
			end)
		end)
	end)
end



function CustomActivityAvatarView:_getCurRunIndex()
	local itemsNum = #self._awardsItemList
	local temp = self._startIndex + self._stepCount -1
	local curIndex = temp - math.floor(temp/itemsNum) *itemsNum
	if curIndex == 0 then
		curIndex = itemsNum
	end
	self._lastIndex = curIndex
	return self._lastIndex
end

function CustomActivityAvatarView:_newSteps(startIndex, count, t, dt, callFunc, endCallFunc)
	self._startIndex = startIndex
	self._count = count
	self._stepCount = 0
	self._stepTime = t
	self._dt = dt
	self._callFunc = callFunc
	self._endCallFunc = endCallFunc
	self:_nextStep()
end


function CustomActivityAvatarView:_nextStep()
	if self._stepCount > self._count -1 then
		-- self._stepCount = self._stepCount + 1
		if self._endCallFunc then
			self._endCallFunc(self:_getCurRunIndex())
		end
		return
	end

	self._stepCount = self._stepCount + 1
	if self._callFunc then
		self._callFunc(self:_getCurRunIndex())
	end

	self._stepTime = self._stepTime + self._dt
	--logWarnlogWarn("CustomActivityAvatarView ----------------  "..tostring(self._stepTime))
	local delayAction = cc.DelayTime:create(self._stepTime)
	local callFuncAction = cc.CallFunc:create(function()
		self:_nextStep()
	end)
	local action = cc.Sequence:create(delayAction, callFuncAction)
	self:runAction(action)
end

function CustomActivityAvatarView:_onBtnShop()
	if not G_UserData:getCustomActivity():isAvatarActivityVisible() then
		G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
		return
	end
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AVATAR_ACTIVITY_SHOP )
end

function CustomActivityAvatarView:refreshView(customActUnitData,resetListData)
	self:_refreshActTime()
	self:_initCostUI()
end

function CustomActivityAvatarView:_updateTime()
	local actUnitData = G_UserData:getCustomActivity():getAvatarActivity()
	if actUnitData and actUnitData:isActInRunTime() then
		if actUnitData:isActInRunTime() then
			local timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
			self._textTime:setString(timeStr)
			return
		end
	end
	self._textTime:stopAllActions()
	self._textTime:setString(Lang.get("customactivity_avatar_act_end"))

end

function CustomActivityAvatarView:_refreshActTime(actUnitData)
	self._textTime:stopAllActions()
	self:_updateTime()
	local UIActionHelper = require("app.utils.UIActionHelper")
	local action = UIActionHelper.createUpdateAction(function()
		self:_updateTime()
	end, 0.5)
	self._textTime:runAction(action)
end


return CustomActivityAvatarView
