
-- Author: liangxu
-- Date:2018-5-4 15:54:50
-- Describle：装备运营活动
local ViewBase = require("app.ui.ViewBase")
local CustomActivityEquipmentView = class("CustomActivityEquipmentView", ViewBase)
local SchedulerHelper = require("app.utils.SchedulerHelper")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
local ActivityEquipDataHelper = require("app.utils.data.ActivityEquipDataHelper")
local CustomActivityConst = require("app.const.CustomActivityConst")
local DataConst = require("app.const.DataConst")
local UIHelper  = require("yoka.utils.UIHelper")
local CSHelper = require("yoka.utils.CSHelper")
local AudioConst = require("app.const.AudioConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")

local BG_MOVE_SPEED = 500 --背景移动速度
local BG_WIDTH = 1400 * 0.9 --背景图宽度（缩了90%）

function CustomActivityEquipmentView:ctor(parentView)
	self._parentView = parentView

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CustomActivityEquipmentView", "customactivity"),
		binding = {
			_btnReadme = {
				events = {{event = "touch", method = "_onBtnReadme"}}
			},
			_btnShop = {
				events = {{event = "touch", method = "_onBtnShop"}}
			},
			_button1 = {
				events = {{event = "touch", method = "_onClickButton1"}}
			},
			_button2 = {
				events = {{event = "touch", method = "_onClickButton2"}}
			},
		},
	}
	CustomActivityEquipmentView.super.ctor(self, resource)
end

function CustomActivityEquipmentView:onCreate()
	self:_initData()
	self:_initView()
end

function CustomActivityEquipmentView:_initData()
	local actUnitData = G_UserData:getCustomActivity():getEquipActivity()
	if actUnitData then
		self._batch = actUnitData:getBatch()
		self._configInfo = ActivityEquipDataHelper.getActiveConfig(self._batch)
	end
	self._countDownHandler = nil --倒计时计时器
	self._shoutHandler = nil --喊话计时器
	self._bgmHandler = nil --背景音
	self._listViewWidth = self._listViewRecord:getContentSize().width
	self._listViewHeight = self._listViewRecord:getContentSize().height
	self._bgInitPosx1 = self._nodeBg1:getPositionX() --背景图1初始x坐标
	self._bgInitPosx2 = self._nodeBg2:getPositionX() --背景图2初始x坐标
	self._targetPosX = self._bgInitPosx1 - BG_WIDTH
	self._awards = {} --存储获得的奖励
	self._effect1 = nil
	self._effect2 = nil
	self._effect3 = nil
	self._effect0 = nil
	self._isInHitState = false --是否在追击状态中
	self._bgmSoundId = nil
end

function CustomActivityEquipmentView:_initView()
	self._nodeHeroAvatar:setAsset("103_escape")
	self._nodeHeroAvatar:setShadowScale(2.0)
	self._nodeHeroAvatar:setBubblePosition(cc.p(128, 105))
	-- self:_initDayOrNight()
	self._btnShop:updateUI(FunctionConst.FUNC_EQUIP_ACTIVITY_SHOP)
	self._button2:setString(self._configInfo.name2)
	self:_initBowStatic()

	--充值兑换次数的提示句
	local resParam = TypeConvertHelper.convert(self._configInfo.money_type, self._configInfo.money_value)
	local content = Lang.get("customactivity_equip_hit_num_tip", {
			money = self._configInfo.money,
			count = self._configInfo.money_size,
			urlIcon = resParam.res_mini,
		})
	local richText = ccui.RichText:createWithContent(content)
	richText:setAnchorPoint(cc.p(0, 0))
	self._nodeTip:addChild(richText)

	self:_initCostUI()

	-- self:_updateLimitCount()
end

function CustomActivityEquipmentView:_initCostUI()
	--local isReturnServer = G_GameAgent:isLoginReturnServer()
	local resParam = TypeConvertHelper.convert(self._configInfo.money_type, self._configInfo.money_value)
	local resNum = UserDataHelper.getNumByTypeAndValue(self._configInfo.money_type, self._configInfo.money_value)

	local yubiParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
	local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)

	self._imgLeftBottom:setVisible(false)

	local Paramter = require("app.config.parameter")
	local consume_time1 = tonumber(Paramter.get(884).content)
	local consume_time2 = tonumber(Paramter.get(884).content)

	if resNum >= 10 then
		self._textCost1:setString(self._configInfo.consume_time1)
		self._imageCost1:loadTexture(resParam.res_mini)
		self._textCost2:setString(self._configInfo.consume_time2 * self._configInfo.hit_num)
		self._imageCost2:loadTexture(resParam.res_mini)
	elseif resNum > 0 then
		self._textCost1:setString(self._configInfo.consume_time1)
		self._imageCost1:loadTexture(resParam.res_mini)
		self._textCost2:setString(consume_time2 * self._configInfo.hit_num)
		self._imageCost2:loadTexture(yubiParam.res_mini)
	else
		self._textCost1:setString(consume_time1)
		self._imageCost1:loadTexture(yubiParam.res_mini)
		self._textCost2:setString(consume_time2 * self._configInfo.hit_num)
		self._imageCost2:loadTexture(yubiParam.res_mini)
	end
end

--背景白天/黑夜
function CustomActivityEquipmentView:_initDayOrNight()
	local function  isNight( ... )
        local hour = G_ServerTime:getCurrentHHMMSS(G_ServerTime:getTime())
        if hour >= 18 and hour <= 23 then
            return true
        end
        if hour >= 0 and hour <= 5 then
            return true
        end
    end
    self._imageDay:setVisible(true)
    self._imageNight:setVisible(false)
    if isNight() then
        self._imageDay:setVisible(false)
        self._imageNight:setVisible(true)
    end
end

function CustomActivityEquipmentView:onEnter()
	self._signalCustomActivityEquipInfo = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO, handler(self, self._customActivityEquipInfo))
	self._signalCustomActivityDrawEquipSuccess = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS, handler(self, self._customActivityDrawEquipSuccess))
	self._signalCustomActivityRechargeLimitChange = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_LIMIT_CHANGE, handler(self, self._customActivityRechargeLimitChange))

	self:_resetBg()
	self:_startCountDown()
	self:scheduleUpdateWithPriorityLua(handler(self, self._onUpdateMoveBg), 0)
	self:_runStart()
	self:_startShout()
	self:_updateShopRP()

end

function CustomActivityEquipmentView:onExit()
	self:_stopCountDown()
	self:unscheduleUpdate()
	self:_stopShout()
	self:stopBGM()

	self._signalCustomActivityEquipInfo:remove()
	self._signalCustomActivityEquipInfo = nil
	self._signalCustomActivityDrawEquipSuccess:remove()
	self._signalCustomActivityDrawEquipSuccess = nil
	self._signalCustomActivityRechargeLimitChange:remove()
	self._signalCustomActivityRechargeLimitChange = nil
end

function CustomActivityEquipmentView:refreshView(customActUnitData, resetListData)
	local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP)
	if rechargeUnit:isExpired() then
		G_UserData:getCustomActivityRecharge():c2sSpecialActInfo(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP)
		return
	end
	self:_updateData()
	self:_updateView()
end

function CustomActivityEquipmentView:_customActivityEquipInfo(eventName, actType)
	if actType ~= CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP then
		return
	end
	self:_updateData()
	self:_updateView()
end

function CustomActivityEquipmentView:_updateData()

end

function CustomActivityEquipmentView:_updateView()
	self:_updateRecord()
	self:_updateCost()
	self:_initCostUI()
	--hedili updateView的时候LimitCount更新
	-- self:_updateLimitCount()
end

function CustomActivityEquipmentView:_startCountDown()
	self:_stopCountDown()
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function CustomActivityEquipmentView:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

function CustomActivityEquipmentView:_onCountDown()
	local actUnitData = G_UserData:getCustomActivity():getEquipActivity()
	if actUnitData and actUnitData:isActInRunTime() then
		local timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		self._textTime:setString(timeStr)
	else
		self._textTime:setString(Lang.get("customactivity_equip_act_end"))
		self:_stopCountDown()
	end
end

function CustomActivityEquipmentView:_startShout()
	self:_stopShout()
	self:_onShout()
	self._shoutHandler = SchedulerHelper.newScheduleOnce(handler(self, self._startShout), 5) --5秒喊一句
end

function CustomActivityEquipmentView:_stopShout()
	if self._shoutHandler then
		SchedulerHelper.cancelSchedule(self._shoutHandler)
		self._shoutHandler = nil
	end
end

function CustomActivityEquipmentView:_onShout()
	local bubbleText = ""
	if self._isInHitState then
		bubbleText = ActivityEquipDataHelper.randomHitChat(self._batch)
	else
		bubbleText = ActivityEquipDataHelper.randomCommonChat(self._batch)
	end
	self._nodeHeroAvatar:setBubble(bubbleText, nil, nil, nil, 145)

	local function func()
		self._nodeHeroAvatar:setBubbleVisible(false)
	end
	local delay = cc.DelayTime:create(3)
    local action = cc.Sequence:create(delay, cc.CallFunc:create(func))
    self._nodeHeroAvatar:stopAllActions()
	self._nodeHeroAvatar:runAction(action)
end

function CustomActivityEquipmentView:_updateRecord()
	local count = #self._awards
	local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP)
	local records = rechargeUnit:getRecordList(count)
	local textInfo = ActivityEquipDataHelper.getAwardRecordText(records)

	self._listViewRecord:removeAllChildren()
	for i, info in ipairs(textInfo) do
		local item = self:_createRecordItem(info)
		self._listViewRecord:pushBackCustomItem(item)
	end
	local size = self._listViewRecord:getInnerContainer():getContentSize()
	if size.height > self._listViewHeight then
		self._listViewRecord:jumpToBottom()
	end
end

function CustomActivityEquipmentView:_createRecordItem(info)
	local text = info.text
	local color = info.color
	local widget = ccui.Widget:create()

	local des = "$c"..color.."_"..text.."$"
	local formatStr = Lang.get("customactivity_equip_award_record", {des = des})
	local params = {defaultColor = Colors.DARK_BG_ONE, defaultSize = 20}
	local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
	richText:setAnchorPoint(cc.p(0, 0))
	richText:ignoreContentAdaptWithSize(false)
	richText:setContentSize(cc.size(self._listViewWidth, 0))
	richText:formatText()
	widget:addChild(richText)

	local height = richText:getContentSize().height
	local size = cc.size(self._listViewWidth, height)
	widget:setContentSize(size)
	return widget
end

function CustomActivityEquipmentView:_updateCost()
	local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP)
	local freeCount = rechargeUnit:getRestFreeCount(self._batch)
	if freeCount > 0 then
		self._button1:setString(Lang.get("customactivity_equip_rest_free_count", {count = freeCount}))
		self._imageCostBg1:setVisible(false)
	else
		self._button1:setString(self._configInfo.name1)
		self._imageCostBg1:setVisible(true)
	end
end

function CustomActivityEquipmentView:_updateLimitCount()
	local formatStr = ""
	local max = self._configInfo.toplimit
	if max == 9999 then --无上限限制
		formatStr = Lang.get("customactivity_equip_free_tip")
	else
		local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP)
		local totalCount = rechargeUnit:getTotal_use()
		local count = "$c110_"..totalCount.."$" --绿色
		if totalCount >= max then
			count = "$c6_"..totalCount.."$" --红色
		end
		formatStr = Lang.get("customactivity_equip_max_num_tip", {count = count, max = max})
	end
	
	local params = {defaultColor = Colors.DARK_BG_ONE, defaultSize = 20}
	local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
	richText:setAnchorPoint(cc.p(0, 0.5))
	self._nodeCount:removeAllChildren()
	self._nodeCount:addChild(richText)
end

function CustomActivityEquipmentView:_resetBg()
	self._nodeBg1:setPositionX(self._bgInitPosx1)
	self._nodeBg2:setPositionX(self._bgInitPosx2)
end

function CustomActivityEquipmentView:_onUpdateMoveBg(dt)
	local function moveNode(node)
		local posx = node:getPositionX() - BG_MOVE_SPEED * dt
		node:setPositionX(posx)
	end
	local function checkNode(node)
		local posx = node:getPositionX()
		if posx < self._targetPosX then
			return false
		else
			return true
		end
	end

	moveNode(self._nodeBg1)
	moveNode(self._nodeBg2)
	if checkNode(self._nodeBg1) == false then
		local posx = self._nodeBg2:getPositionX() + BG_WIDTH
		self._nodeBg1:setPositionX(posx)
	end
	if checkNode(self._nodeBg2) == false then
		local posx = self._nodeBg1:getPositionX() + BG_WIDTH
		self._nodeBg2:setPositionX(posx)
	end
end

function CustomActivityEquipmentView:_runStart()
	self._nodeHeroAvatar:setAction("run", true)
end

function CustomActivityEquipmentView:_onBtnReadme()
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_EQUIP_ACTIVITY)
end

function CustomActivityEquipmentView:_onBtnShop()
	if not G_UserData:getCustomActivity():isEquipActivityVisible() then
		G_Prompt:showTip(Lang.get("customactivity_equip_act_end_tip"))
		return
	end
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_EQUIP_ACTIVITY_SHOP)
end

function CustomActivityEquipmentView:_onClickButton1()
	if self:_checkTime() == false then
		return
	end
	local ret, costYuBi, itemCount = self:_checkCost(CustomActivityConst.EQUIP_DRAW_TYPE_1)
	if ret == false then
		return
	end
	local params = {
		moduleName = "COST_YUBI_MODULE_NAME_2",
		yubiCount = costYuBi,
		itemCount = itemCount,
	}
	UIPopupHelper.popupCostYubiTip(params, 
									handler(self, self._doPlaySpecialActivity),
									CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP,
									CustomActivityConst.EQUIP_DRAW_TYPE_1)
end

function CustomActivityEquipmentView:_onClickButton2()
	if self:_checkTime() == false then
		return
	end
	local ret, costYuBi, itemCount = self:_checkCost(CustomActivityConst.EQUIP_DRAW_TYPE_2)
	if ret == false then
		return
	end
	local params = {
		moduleName = "COST_YUBI_MODULE_NAME_2",
		yubiCount = costYuBi,
		itemCount = itemCount,
	}
	UIPopupHelper.popupCostYubiTip(params, 
									handler(self, self._doPlaySpecialActivity),
									CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP,
									CustomActivityConst.EQUIP_DRAW_TYPE_2,
									true)
end

function CustomActivityEquipmentView:_doPlaySpecialActivity(activityType, drawType, ctlBtn)
	G_UserData:getCustomActivityRecharge():c2sPlaySpecialActivity(activityType, drawType, 1)
	if ctlBtn then
		self._button1:setEnabled(false)
		self._button2:setEnabled(false)
	end
end

function CustomActivityEquipmentView:_playHitAndTalk()
	self._nodeHeroAvatar:playEffectOnce("hit")
	self._nodeHeroAvatar:addSpineLoadHandler(function()
		self._nodeHeroAvatar:setAction("run", true)
	end)

	self:_startShout()
end

function CustomActivityEquipmentView:_customActivityDrawEquipSuccess(eventName, actType, drawType, records, equips)
	if actType ~= CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP then
		return
	end

	self:_updateData()
	self:_updateCost()
	self:_updateShopRP()

	self:_initCostUI()

	self:_playBowEffect(equips)
	for i, id in ipairs(records) do
		local info = ActivityEquipDataHelper.getActiveDropConfig(id)
		local unit = {
			type = info.type,
			id = info.value,
			num = info.size,
		}
		table.insert(self._awards, unit)
	end
end

function CustomActivityEquipmentView:_customActivityRechargeLimitChange(eventName, actType, limitUse)
	if actType ~= CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP then
		return
	end

	-- self:_updateLimitCount()
end

function CustomActivityEquipmentView:_checkTime()
	local isVisible = G_UserData:getCustomActivity():isEquipActivityVisible()
	if isVisible then
		return true
	else
		G_Prompt:showTip(Lang.get("customactivity_equip_act_end_tip"))
		return false
	end
end

function CustomActivityEquipmentView:_checkCost(drawType)
	local result = false
	local costYuBi = nil
	local itemCount = nil

	local consume_time1 = self._configInfo.consume_time1
	local consume_time2 = self._configInfo.consume_time2
	local hit_num = self._configInfo.hit_num

	local checkCostCoin = function (type, value)
		local hitCount = UserDataHelper.getNumByTypeAndValue(type, value)
		if drawType == CustomActivityConst.EQUIP_DRAW_TYPE_1 then
			local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP)
			local freeCount = rechargeUnit:getRestFreeCount(self._batch)
			if freeCount > 0 then
				return true
			end
			local limitCount = consume_time1
			if hitCount >= limitCount then
				return true, limitCount, 1 --单次，写死1个
			end
		elseif drawType == CustomActivityConst.EQUIP_DRAW_TYPE_2 then
			local limitCount = consume_time2 * hit_num
			if hitCount >= limitCount then
				return true, limitCount, hit_num
			end
		end

		return false
	end

	result = checkCostCoin(self._configInfo.money_type, self._configInfo.money_value)

	if result then

	else
		local Paramter = require("app.config.parameter")
		consume_time1 = tonumber(Paramter.get(884).content)
		consume_time2 = tonumber(Paramter.get(884).content)
		hit_num = self._configInfo.hit_num
		result, costYuBi, itemCount = checkCostCoin(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)  -- 玉璧数量

		if not result then
			local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
			G_Prompt:showTip(Lang.get("customactivity_horse_conquer_cost_not_enough", {name1 = param.name, name2 = param.name}))
		end
	end

	return result, costYuBi, itemCount
end

--播放一个掉落效果
function CustomActivityEquipmentView:_playOneDropEffect(record)
	local startPos = UIHelper.convertSpaceFromNodeToNode(self._nodeDropStartPos, self)
	local endPos = {x = math.random(500, 1000), y = 220}
	local fadeOut = cc.FadeOut:create(1)
	local jumpTo = cc.JumpTo:create(1, cc.p(endPos.x, endPos.y), 200, 1)
	local action1 = cc.EaseBounceOut:create(jumpTo)
	local action3 = cc.Spawn:create(action1, cc.ScaleTo:create(1, 0.6))

	local sp = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
	sp:initUI(record.type, record.id, record.num)
	sp:setPosition(startPos)
	sp:setScale(0.3)
	self:addChild(sp)
	sp:runAction(cc.Sequence:create(
            action3,
            fadeOut,
            cc.RemoveSelf:create()
        )
	)
end

function CustomActivityEquipmentView:_playBowEffect(equips)
	local count = #self._awards
	if count == 0 then
		self:_playBowOut(equips)
	else
		self:_playBowShoot(equips)
	end
end

--弓箭弹出
function CustomActivityEquipmentView:_playBowOut(equips)
	local function effectFunction()
		return cc.Node:create()
	end

	local function eventFunction(event)
    	if event == "finish" then
    		self:_playBowShoot(equips)
    		if self._effect1 then
		    	self._effect1:runAction(cc.RemoveSelf:create())
		    	self._effect1 = nil
		    end
        end
    end
    self._effect0:setVisible(false)

    if self._effect1 then
    	self._effect1:runAction(cc.RemoveSelf:create())
    	self._effect1 = nil
    end
	self._effect1 = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_gxqp_shejian1", effectFunction, eventFunction , false)
	self._isInHitState = true
end

--弓箭射击
function CustomActivityEquipmentView:_playBowShoot(equips)
	local function effectFunction()
		return cc.Node:create()
	end

	local function eventFunction(event)
		if event == "hit" then
			self:_playHitAndTalk()
			local record = self._awards[1]
			if record then
				self:_playOneDropEffect(record)
			end
    	elseif event == "finish" then
    		if self._effect2 then
		    	self._effect2:runAction(cc.RemoveSelf:create())
		    	self._effect2 = nil
		    end
		    table.remove(self._awards, 1)
		    self:_updateRecord()
    		local count = #self._awards
    		if count > 0 then
    			self:_playBowShoot(equips)
    		else
    			self:_playBowIn(equips)
    		end
        end
    end
    self._effect0:setVisible(false)
    if self._effect2 then
    	self._effect2:runAction(cc.RemoveSelf:create())
    	self._effect2 = nil
    end
	self._effect2 = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_gxqp_shejian2", effectFunction, eventFunction , false)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_SHOOT)
end

--弓箭缩回
function CustomActivityEquipmentView:_playBowIn(equips)
	local function effectFunction()
		return cc.Node:create()
	end

	local function eventFunction(event)
    	if event == "finish" then
    		if self._effect3 then
		    	self._effect3:runAction(cc.RemoveSelf:create())
		    	self._effect3 = nil
		    end
		    self._effect0:setVisible(true)
		    if #equips > 0 then
		    	local popup = require("app.ui.PopupGetRewards").new()
				popup:showRewards(equips)
		    end
		    self._button1:setEnabled(true)
		    self._button2:setEnabled(true)
        end
    end
    self._effect0:setVisible(false)
    if self._effect3 then
    	self._effect3:runAction(cc.RemoveSelf:create())
    	self._effect3 = nil
    end
	self._effect3 = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_gxqp_shejian3", effectFunction, eventFunction , false)
	self._isInHitState = false
end

--弓箭静态
function CustomActivityEquipmentView:_initBowStatic()
	self._effect0 = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_gxqp_shejian0", nil, nil , false)
end

function CustomActivityEquipmentView:_updateShopRP()
	local shopRP = G_UserData:getShopActive():isShowEquipRedPoint()
    self._btnShop:showRedPoint(shopRP)
end

function CustomActivityEquipmentView:startBGM()
	self:stopBGM()
	self:_onBGM()
	self._bgmHandler = SchedulerHelper.newSchedule(handler(self, self._onBGM), 1)
end

function CustomActivityEquipmentView:_onBGM()
	self._bgmSoundId = G_AudioManager:playSoundWithId(AudioConst.SOUND_MA_TI)
end

function CustomActivityEquipmentView:stopBGM()
	if self._bgmSoundId then
		G_AudioManager:stopSound(self._bgmSoundId)
	end
	if self._bgmHandler then
		SchedulerHelper.cancelSchedule(self._bgmHandler)
		self._bgmHandler = nil
	end
end

return CustomActivityEquipmentView
