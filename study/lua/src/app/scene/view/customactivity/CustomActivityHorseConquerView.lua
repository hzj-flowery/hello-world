-- Author: liangxu
-- Date:2019-2-15
-- Describle：训马活动
local ViewBase = require("app.ui.ViewBase")
local CustomActivityHorseConquerView = class("CustomActivityHorseConquerView", ViewBase)
local SchedulerHelper = require("app.utils.SchedulerHelper")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
local ActivityEquipDataHelper = require("app.utils.data.ActivityEquipDataHelper")
local CustomActivityConst = require("app.const.CustomActivityConst")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AudioConst = require("app.const.AudioConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local UIPopupHelper = require("app.utils.UIPopupHelper")

function CustomActivityHorseConquerView:ctor(parentView)
	self._parentView = parentView

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CustomActivityHorseConquerView", "customactivity"),
		binding = {
			_btnReadme = {
				events = {{event = "touch", method = "_onBtnReadme"}}
			},
			_button1 = {
				events = {{event = "touch", method = "_onClickButton1"}}
			},
			_button2 = {
				events = {{event = "touch", method = "_onClickButton2"}}
			},
			_buttonLeft = {
				events = {{event = "touch", method = "_onClickButtonLeft"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onClickButtonRight"}}
			},
		},
	}
	CustomActivityHorseConquerView.super.ctor(self, resource)
end

function CustomActivityHorseConquerView:onCreate()
	self:_initData()
	self:_initView()
end

function CustomActivityHorseConquerView:_initData()
	local actUnitData = G_UserData:getCustomActivity():getHorseConquerActivity()
	if actUnitData then
		self._batch = actUnitData:getBatch()
		self._configInfo = ActivityEquipDataHelper.getActiveConfig(self._batch)
		self._picNames = string.split(self._configInfo.pic_name, "|")
		self._titleNames = string.split(self._configInfo.title_name, "|")
		self._timeNames = string.split(self._configInfo.time_name, "|")
		self._fragmentIds = string.split(self._configInfo.fragment, "|")
		self._maxIndex = #self._titleNames
	end
	self._countDownHandler = nil --倒计时计时器
	self._shoutHandler = nil --喊话计时器
	local recordIndex = G_UserData:getCustomActivityRecharge():getCurSelectedIndex2()
	if recordIndex > 0 and recordIndex <= self._maxIndex then --有记录
		self._curIndex = recordIndex
	else --选中间的
		local temp = self._maxIndex % 2
		if temp == 0 then
			self._curIndex = math.floor(self._maxIndex / 2)
		else
			self._curIndex = math.floor(self._maxIndex / 2) + 1
		end
	end
end

function CustomActivityHorseConquerView:_initView()
	self._nodeBook:updateUI(FunctionConst.FUNC_HAND_BOOK)
	self._nodeBook:addClickEventListenerEx(handler(self, self._onClickBook))
	self._button1:setString(self._configInfo.name1)
	self._button2:setString(self._configInfo.name2)

	local effectLeft = EffectGfxNode.new("effect_guanxing_jiantou")
	local effectRight = EffectGfxNode.new("effect_guanxing_jiantou")
	local size = self._buttonLeft:getContentSize()
	effectLeft:setPosition(cc.p(size.width/2, size.height/2))
	effectRight:setPosition(cc.p(size.width/2, size.height/2))
    effectLeft:play()
    effectRight:play()
	self._buttonLeft:addChild(effectLeft)
	self._buttonRight:addChild(effectRight)

	--充值兑换次数的提示句
	local resParam = TypeConvertHelper.convert(self._configInfo.money_type, self._configInfo.money_value)
	local content = Lang.get("customactivity_pet_num_tip", {
			money = self._configInfo.money,
			count = self._configInfo.money_size,
			urlIcon = resParam.res_mini,
		})
	local richText = ccui.RichText:createWithContent(content)
	richText:setAnchorPoint(cc.p(0, 0))
	self._nodeTip:addChild(richText)

	self:_initCostUI()

	self:_initSpine()
end

function CustomActivityHorseConquerView:_initCostUI()
	--local isReturnServer = G_GameAgent:isLoginReturnServer()
	local resParam = TypeConvertHelper.convert(self._configInfo.money_type, self._configInfo.money_value)
	local resNum = UserDataHelper.getNumByTypeAndValue(self._configInfo.money_type, self._configInfo.money_value)

	local yubiParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
	local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)

	local Paramter = require("app.config.parameter")
	local consume_time1 = tonumber(Paramter.get(887).content)
	local consume_time2 = tonumber(Paramter.get(887).content)

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

	self._imgLeftBottom:setVisible(false)
	self._nodeTip:setVisible(false)
end

function CustomActivityHorseConquerView:_initSpine()
	local curIndex = self._curIndex
	self._nodeIndicator:refreshPageData(nil, self._maxIndex, curIndex-1, 16)
	self:_updateMoving()
	self:_updateViewer()
	self:_initBgMoving()
end

function CustomActivityHorseConquerView:_initBgMoving()
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeBg, "moving_xunmachangjing", nil, nil, false)
end

function CustomActivityHorseConquerView:onEnter()
	self._signalCustomActivityHorseConquerInfo = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO, handler(self, self._customActivityHorseConquerInfo))
	self._signalCustomActivityConquerHorseSuccess = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS, handler(self, self._customActivityConquerHorseSuccess))

	self:_startCountDown()
	self:_startShout()
end

function CustomActivityHorseConquerView:onExit()
	self:_stopCountDown()
	self:_stopShout()
	G_UserData:getCustomActivityRecharge():setCurSelectedIndex2(self._curIndex)

	self._signalCustomActivityHorseConquerInfo:remove()
	self._signalCustomActivityHorseConquerInfo = nil
	self._signalCustomActivityConquerHorseSuccess:remove()
	self._signalCustomActivityConquerHorseSuccess = nil
end

function CustomActivityHorseConquerView:refreshView(customActUnitData, resetListData)
	local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER)
	if rechargeUnit:isExpired() then
		G_UserData:getCustomActivityRecharge():c2sSpecialActInfo(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER)
		return
	end
	self:_updateData()
	self:_updateView()
end

function CustomActivityHorseConquerView:_customActivityHorseConquerInfo(actType)
	if actType ~= CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER then
		return
	end
	self:_updateData()
	self:_updateView()
end

function CustomActivityHorseConquerView:_updateData()
	
end

function CustomActivityHorseConquerView:_updateView()
	self:_updateTitle()
	self:_updateFragmentCount()
	self:_updateCost()
	self:_updateArrowBtn()
	self:_initCostUI()
end

--创建富文本
function CustomActivityHorseConquerView:_createProgressRichText(richText)
	self._textOwnFragNum:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0,0.5))
    self._textOwnFragNum:addChild(widget)
end

function CustomActivityHorseConquerView:_updateFragmentCount(  )
	local fragmentId = self._fragmentIds[self._curIndex]

	local fragmentConfig = require("app.config.fragment")
	local fragmentInfo = fragmentConfig.get(tonumber(fragmentId))

	local myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local needCount = fragmentInfo.fragment_num

    local richText = Lang.get("pet_fragment_progress",
			{
			 value = myCount, max = needCount, 
			 valueColor = Colors.colorToNumber(myCount >= needCount and Colors.DARK_BG_GREEN or Colors.DARK_BG_RED),
			 maxColor = Colors.colorToNumber(Colors.DARK_BG_ONE)
			})

	self:_createProgressRichText(richText)
end

function CustomActivityHorseConquerView:_updateTitle()
    local titleName = self._titleNames[self._curIndex]
    local timeName = self._timeNames[self._curIndex]
	self._imageTitle:loadTexture(Path.getCustomActivityUI(titleName))
	self._textTimeTitle:setString(timeName)
end

function CustomActivityHorseConquerView:_updateCost()
	local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER)
	local freeCount = rechargeUnit:getRestFreeCount(self._batch)
	if freeCount > 0 then
		self._button1:setString(Lang.get("customactivity_pet_rest_free_count", {count = freeCount}))
		self._imageCostBg1:setVisible(false)
	else
		self._button1:setString(self._configInfo.name1)
		self._imageCostBg1:setVisible(true)
	end
end

function CustomActivityHorseConquerView:_startCountDown()
	self:_stopCountDown()
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function CustomActivityHorseConquerView:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

function CustomActivityHorseConquerView:_onCountDown()
	local actUnitData = G_UserData:getCustomActivity():getHorseConquerActivity()
	if actUnitData and actUnitData:isActInRunTime() then
		local timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		self._textTime:setString(timeStr)
	else
		self._textTime:setString(Lang.get("customactivity_horse_conquer_act_end"))
		self:_stopCountDown()
	end
end

function CustomActivityHorseConquerView:_startShout()
	self:_stopShout()
	self:_onShout()
	self._shoutHandler = SchedulerHelper.newScheduleOnce(handler(self, self._startShout), 5) --5秒喊一句
end

function CustomActivityHorseConquerView:_stopShout()
	if self._shoutHandler then
		SchedulerHelper.cancelSchedule(self._shoutHandler)
		self._shoutHandler = nil
	end
end

function CustomActivityHorseConquerView:_onShout()
	local bubbleText = ActivityEquipDataHelper.randomCommonChat(self._batch)
	self:_playTalk(bubbleText)
end

function CustomActivityHorseConquerView:_playTalk(bubbleText)
	self._nodeTalk:setText(bubbleText, 150, true)
	self._nodeTalk:setVisible(true)
	local function func()
		self._nodeTalk:setVisible(false)
	end
	local delay = cc.DelayTime:create(3)
    local action = cc.Sequence:create(delay, cc.CallFunc:create(func))
    self._nodeTalk:stopAllActions()
	self._nodeTalk:runAction(action)
end

function CustomActivityHorseConquerView:_onBtnReadme()
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_HORSE_CONQUER_ACTIVITY)
end

function CustomActivityHorseConquerView:_onClickButton1()
	if self:_checkTime() == false then
		return
	end
	local ret, costYuBi, itemCount = self:_checkCost(CustomActivityConst.HORSE_CONQUER_TYPE_1)
	if ret == false then
		return
	end
	local params = {
		moduleName = "COST_YUBI_MODULE_NAME_5",
		yubiCount = costYuBi,
		itemCount = itemCount,
	}
	UIPopupHelper.popupCostYubiTip(params, 
									handler(self, self._doPlaySpecialActivity),
									CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER,
									CustomActivityConst.HORSE_CONQUER_TYPE_1,
									self._curIndex)
end

function CustomActivityHorseConquerView:_onClickButton2()
	if self:_checkTime() == false then
		return
	end
	local ret, costYuBi, itemCount = self:_checkCost(CustomActivityConst.HORSE_CONQUER_TYPE_2)
	if ret == false then
		return
	end
	local params = {
		moduleName = "COST_YUBI_MODULE_NAME_5",
		yubiCount = costYuBi,
		itemCount = itemCount,
	}
	UIPopupHelper.popupCostYubiTip(params, 
									handler(self, self._doPlaySpecialActivity),
									CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER,
									CustomActivityConst.HORSE_CONQUER_TYPE_2,
									self._curIndex)
end

function CustomActivityHorseConquerView:_doPlaySpecialActivity(activityType, drawType, curIndex)
	G_UserData:getCustomActivityRecharge():c2sPlaySpecialActivity(activityType, drawType, curIndex)
	self:_setBtnEnabled(false)
end

function CustomActivityHorseConquerView:_onClickButtonLeft()
	if self._curIndex <= 1 then
		return
	end
	self._curIndex = self._curIndex - 1
	self:_updateTitle()
	self:_updateFragmentCount()
	self:_updateMoving()
	self:_updateArrowBtn()
	self._nodeIndicator:setCurrentPageIndex(self._curIndex-1)
end

function CustomActivityHorseConquerView:_onClickButtonRight()
	if self._curIndex >= self._maxIndex then
		return
	end
	self._curIndex = self._curIndex + 1
	self:_updateTitle()
	self:_updateFragmentCount()
	self:_updateMoving()
	self:_updateArrowBtn()
	self._nodeIndicator:setCurrentPageIndex(self._curIndex-1)
end

function CustomActivityHorseConquerView:_onClickBook()
	local HandBookHelper = require("app.scene.view.handbook.HandBookHelper")
	G_SceneManager:showScene("handbook", FunctionConst.FUNC_HORSE_BOOK, HandBookHelper.TBA_HORSE)
end

function CustomActivityHorseConquerView:_updateMoving()
	self._nodeMoving:removeAllChildren()
	local movingName = "moving_"..self._picNames[self._curIndex].."_".."idle"
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, movingName, nil, nil, false)
end

function CustomActivityHorseConquerView:_updateViewer()
	self._nodeViewer:removeAllChildren()
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeViewer, "moving_xunma_guanzhongidle", nil, nil, false)
end

function CustomActivityHorseConquerView:_updateArrowBtn()
	self._buttonLeft:setVisible(self._curIndex > 1)
	self._buttonRight:setVisible(self._curIndex < self._maxIndex)
end

function CustomActivityHorseConquerView:_setBtnEnabled(enabled)
	self._button1:setEnabled(enabled)
	self._button2:setEnabled(enabled)
	self._buttonLeft:setEnabled(enabled)
	self._buttonRight:setEnabled(enabled)
end

function CustomActivityHorseConquerView:_customActivityConquerHorseSuccess(eventName, actType, drawType, records, equips)
	if actType ~= CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER then
		return
	end

	local star = 0
	for i, id in ipairs(records) do
		local info = ActivityEquipDataHelper.getActiveDropConfig(id)
		if info.star > star then
			star = info.star --找到最高星数
		end
	end
	if star > 0 then
		self:_playHorseAction(star, drawType, records)
	end

	self:_updateData()
	self:_updateCost()
	self:_updateFragmentCount()

	self:_initCostUI()
end

function CustomActivityHorseConquerView:_playHorseAction(star, drawType, records)
	local function eventFunction(event)
		if event == "finish" then
			self:runAction(cc.Sequence:create(
				cc.DelayTime:create(0.01),
				cc.CallFunc:create(function()
					self:_updateMoving()
					self:_updateViewer()
				end)))
			self:_popupAward(records)
			self:_setBtnEnabled(true)
			self._nodeEmoji:removeAllChildren()
			self:_startShout()
		end
    end

	local moving = ""
	local viewMoving = ""
	local strTalk = ""
	local emojiName = ""
	local soundId = 0
	if star >= 7 then --成功
		moving = "moving_"..self._picNames[self._curIndex].."_".."win"
		viewMoving = "moving_xunma_guanzhongchenggong"
		strTalk = Lang.get("customactivity_horse_talk_win")
		emojiName = "effect_xunma_aixin"
		soundId = AudioConst.SOUND_HORSE_CONQUER_WIN
	elseif star >= 4 then
		moving = "moving_"..self._picNames[self._curIndex].."_".."good"
		viewMoving = "moving_xunma_guanzhongidle"
		strTalk = Lang.get("customactivity_horse_talk_lose")
		emojiName = "effect_xunma_chenmo"
		soundId = AudioConst.SOUND_HORSE_CONQUER_GOOD
	else
		moving = "moving_"..self._picNames[self._curIndex].."_".."lose"
		viewMoving = "moving_xunma_guanzhongjiayou"
		strTalk = Lang.get("customactivity_horse_talk_lose")
		emojiName = "effect_xunma_shengqi"
		soundId = AudioConst.SOUND_HORSE_CONQUER_LOSE
	end
	self:_stopShout()
	self._nodeTalk:setVisible(false)
	self:runAction(cc.Sequence:create(
		cc.DelayTime:create(1.3),
		cc.CallFunc:create(function()
			self:_playTalk(strTalk)
		end)))

	self._nodeEmoji:removeAllChildren()
	local emoji = EffectGfxNode.new(emojiName)
	emoji:setAutoRelease(true)
	self._nodeEmoji:addChild(emoji)
	emoji:play()

	G_AudioManager:playSoundWithId(soundId)

	self._nodeMoving:removeAllChildren()
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, moving, effectFunction, eventFunction, true)

	self._nodeViewer:removeAllChildren()
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeViewer, viewMoving, nil, nil, false)
end

function CustomActivityHorseConquerView:_popupAward(records)
	local awards = {}
	for i, id in ipairs(records) do
		local info = ActivityEquipDataHelper.getActiveDropConfig(id)
		local award = {
			type = info.type,
			value = info.value,
			size = info.size,
		}
		table.insert(awards, award)
	end

	local popup = require("app.ui.PopupGetRewards").new()
	popup:showRewards(awards)
end

function CustomActivityHorseConquerView:_checkTime()
	local isVisible = G_UserData:getCustomActivity():isHorseConquerActivityVisible()
	if isVisible then
		return true
	else
		G_Prompt:showTip(Lang.get("customactivity_horse_conquer_act_end_tip"))
		return false
	end
end

function CustomActivityHorseConquerView:_checkCost(drawType)
	local result = false
	local costYuBi = nil
	local itemCount = nil
	
	local consume_time1 = self._configInfo.consume_time1
	local consume_time2 = self._configInfo.consume_time2
	local hit_num = self._configInfo.hit_num

	local checkCostCoin = function (type, value)
		local hitCount = UserDataHelper.getNumByTypeAndValue(type, value)
		if drawType == CustomActivityConst.HORSE_CONQUER_TYPE_1 then
			local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER)
			local freeCount = rechargeUnit:getRestFreeCount(self._batch)
			if freeCount > 0 then
				return true
			end
			local limitCount = consume_time1
			if hitCount >= limitCount then
				return true, limitCount, 1 --单次，写死1个
			end
		elseif drawType == CustomActivityConst.HORSE_CONQUER_TYPE_2 then
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
		consume_time1 = tonumber(Paramter.get(887).content)
		consume_time2 = tonumber(Paramter.get(887).content)
		hit_num = self._configInfo.hit_num
		result, costYuBi, itemCount = checkCostCoin(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)  -- 玉璧数量

		if not result then
			local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
			G_Prompt:showTip(Lang.get("customactivity_horse_conquer_cost_not_enough", {name1 = param.name, name2 = param.name}))
		end
	end

	return result, costYuBi, itemCount
end

return CustomActivityHorseConquerView
