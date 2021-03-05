-- Author: liangxu
-- Date:2018-6-5 15:23:52
-- Describle：神兽运营活动
local ViewBase = require("app.ui.ViewBase")
local CustomActivityPetView = class("CustomActivityPetView", ViewBase)
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

local SPINE_INFO = {
	["mid"] = {pos = cc.p(355, 290), scale = 0.8, opacity = 1.0*255, opacityBall = 1.0*255, order = 3},
	["left"] = {pos = cc.p(30, 290), scale = 0.4, opacity = 0.3*255, opacityBall = 0.1*255, order = 2},
	["right"] = {pos = cc.p(780, 290), scale = 0.4, opacity = 0.3*255, opacityBall = 0.1*255, order = 2},
	["leftOut"] = {pos = cc.p(-58, 290), scale = 0.2, opacity = 0.3*255, opacityBall = 0.1*255, order = 1},
	["rightOut"] = {pos = cc.p(918, 290), scale = 0.2, opacity = 0.3*255, opacityBall = 0.1*255, order = 1},
}
local MOVE_TIME = 0.5

function CustomActivityPetView:ctor(parentView)
	self._parentView = parentView

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CustomActivityPetView", "customactivity"),
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
			_buttonLeft = {
				events = {{event = "touch", method = "_onClickButtonLeft"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onClickButtonRight"}}
			},
		},
	}
	CustomActivityPetView.super.ctor(self, resource)
end

function CustomActivityPetView:onCreate()
	self:_initData()
	self:_initView()
end

function CustomActivityPetView:_initData()
	local actUnitData = G_UserData:getCustomActivity():getPetActivity()
	if actUnitData then
		self._batch = actUnitData:getBatch()
		self._configInfo = ActivityEquipDataHelper.getActiveConfig(self._batch)
		self._backNames = string.split(self._configInfo.back_name, "|")
		self._picNames = string.split(self._configInfo.pic_name, "|")
		self._titleNames = string.split(self._configInfo.title_name, "|")
		self._timeNames = string.split(self._configInfo.time_name, "|")
		self._fragmentIds = string.split(self._configInfo.fragment, "|")
		self._maxIndex = #self._backNames
	end
	self._countDownHandler = nil --倒计时计时器

	local recordIndex = G_UserData:getCustomActivityRecharge():getCurSelectedIndex()
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

function CustomActivityPetView:_initView()
	self._btnShop:updateUI(FunctionConst.FUNC_PET_ACTIVITY_SHOP)
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

function CustomActivityPetView:_initCostUI()
	--local isReturnServer = G_GameAgent:isLoginReturnServer()
	local resParam = TypeConvertHelper.convert(self._configInfo.money_type, self._configInfo.money_value)
	local resNum = UserDataHelper.getNumByTypeAndValue(self._configInfo.money_type, self._configInfo.money_value)

	local yubiParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
	local yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)

	local Paramter = require("app.config.parameter")
	local consume_time1 = tonumber(Paramter.get(886).content)
	local consume_time2 = tonumber(Paramter.get(886).content)

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
end

function CustomActivityPetView:_initSpine()
	local function setSpineNode(node, key)
		local info = SPINE_INFO[key]
		node:setPosition(info.pos)
		node:setScale(info.scale)
		local pic = node:getChildByName("nodePic")
		if pic then
			pic:setOpacity(info.opacity)
		end
		local ball = node:getChildByName("spine")
		if ball then
			ball:setOpacity(info.opacityBall)
		end
		node:setLocalZOrder(info.order)
	end

	self._spineNodes = {}
	self._spines = {}
	for i = 1, self._maxIndex do
		local picName = self._picNames[i]
    	local backName = self._backNames[i]
    	local node = cc.Node:create()
    	local nodePic = cc.Node:create()
    	nodePic:setName("nodePic")
    	node:addChild(nodePic)
    	nodePic:setCascadeOpacityEnabled(true)
    	G_EffectGfxMgr:createPlayMovingGfx(nodePic, picName, nil, nil , false)
    	local spine = require("yoka.node.SpineNode").new()
    	spine:setName("spine")
    	spine:setCascadeOpacityEnabled(true)
    	node:addChild(spine)
		self._panelSpine:addChild(node)
		local resJson = Path.getEffectSpine(backName)
		spine:setAsset(resJson)
		spine:setAnimation("idle", true)
		self._spines[i] = spine
		self._spineNodes[i] = node
	end

	local curIndex = self._curIndex
	local midSpine = self._spineNodes[curIndex]
	self._curSpine = self._spines[curIndex]
	setSpineNode(midSpine, "mid")
	local leftIndex = curIndex-1 
	local leftSpine = self._spineNodes[leftIndex]
	if leftSpine then
		setSpineNode(leftSpine, "left")
		local index = leftIndex-1
		while self._spineNodes[index] do
			setSpineNode(self._spineNodes[index], "leftOut")
			index = index-1
		end
	end
	local rightIndex = curIndex+1 
	local rightSpine = self._spineNodes[rightIndex]
	if rightSpine then
		setSpineNode(rightSpine, "right")
		local index = rightIndex+1
		while self._spineNodes[index] do
			setSpineNode(self._spineNodes[index], "rightOut")
			index = index+1
		end
	end

	self._nodeIndicator:refreshPageData(nil, self._maxIndex, curIndex-1, 16)
end

function CustomActivityPetView:onEnter()
	self._signalCustomActivityPetInfo = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO, handler(self, self._customActivityPetInfo))
	self._signalCustomActivityDrawPetSuccess = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS, handler(self, self._customActivityDrawPetSuccess))

	self:_startCountDown()
	self:_updateShopRP()
end

function CustomActivityPetView:onExit()
	self:_stopCountDown()
	G_UserData:getCustomActivityRecharge():setCurSelectedIndex(self._curIndex)

	self._signalCustomActivityPetInfo:remove()
	self._signalCustomActivityPetInfo = nil
	self._signalCustomActivityDrawPetSuccess:remove()
	self._signalCustomActivityDrawPetSuccess = nil
end

function CustomActivityPetView:refreshView(customActUnitData, resetListData)
	local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET)
	if rechargeUnit:isExpired() then
		G_UserData:getCustomActivityRecharge():c2sSpecialActInfo(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET)
		return
	end
	self:_updateData()
	self:_updateView()
end

function CustomActivityPetView:_customActivityPetInfo(actType)
	if actType ~= CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET then
		return
	end
	self:_updateData()
	self:_updateView()
end

function CustomActivityPetView:_updateData()

end

function CustomActivityPetView:_updateView()
	self:_updateTitle()
	self:_updateCost()
	self:_updateArrowBtn()
	self:_updateFragmentCount()
	self:_initCostUI()
end

--创建富文本
function CustomActivityPetView:_createProgressRichText(richText)
	self._textOwnFragNum:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0,0.5))
    self._textOwnFragNum:addChild(widget)
end

function CustomActivityPetView:_updateTitle()
    local titleName = self._titleNames[self._curIndex]
	local timeName = self._timeNames[self._curIndex]
	local fragmentId = self._fragmentIds[self._curIndex]

	self._imageTitle:loadTexture(Path.getCustomActivityUI(titleName))
	self._textTimeTitle:setString(timeName)
end

function CustomActivityPetView:_updateFragmentCount(  )
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

function CustomActivityPetView:_updateCost()
	local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET)
	local freeCount = rechargeUnit:getRestFreeCount(self._batch)
	if freeCount > 0 then
		self._button1:setString(Lang.get("customactivity_pet_rest_free_count", {count = freeCount}))
		self._imageCostBg1:setVisible(false)
	else
		self._button1:setString(self._configInfo.name1)
		self._imageCostBg1:setVisible(true)
	end

	self:_initCostUI()
end

function CustomActivityPetView:_startCountDown()
	self:_stopCountDown()
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function CustomActivityPetView:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

function CustomActivityPetView:_onCountDown()
	local actUnitData = G_UserData:getCustomActivity():getPetActivity()
	if actUnitData and actUnitData:isActInRunTime() then
		local timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		self._textTime:setString(timeStr)
	else
		self._textTime:setString(Lang.get("customactivity_pet_act_end"))
		self:_stopCountDown()
	end
end

function CustomActivityPetView:_onBtnReadme()
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_PET_ACTIVITY)
end

function CustomActivityPetView:_onBtnShop()
	if not G_UserData:getCustomActivity():isPetActivityVisible() then
		G_Prompt:showTip(Lang.get("customactivity_pet_act_end_tip"))
		return
	end
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_PET_ACTIVITY_SHOP)
end

function CustomActivityPetView:_onClickButton1()
	if self:_checkTime() == false then
		return
	end
	local ret, costYuBi, itemCount = self:_checkCost(CustomActivityConst.PET_DRAW_TYPE_1)
	if ret == false then
		return
	end
	local params = {
		moduleName = "COST_YUBI_MODULE_NAME_3",
		yubiCount = costYuBi,
		itemCount = itemCount,
	}
	UIPopupHelper.popupCostYubiTip(params, 
									handler(self, self._doPlaySpecialActivity),
									CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET,
									CustomActivityConst.PET_DRAW_TYPE_1,
									self._curIndex)
end

function CustomActivityPetView:_onClickButton2()
	if self:_checkTime() == false then
		return
	end
	local ret, costYuBi, itemCount = self:_checkCost(CustomActivityConst.PET_DRAW_TYPE_2)
	if ret == false then
		return
	end
	local params = {
		moduleName = "COST_YUBI_MODULE_NAME_3",
		yubiCount = costYuBi,
		itemCount = itemCount,
	}
	UIPopupHelper.popupCostYubiTip(params, 
									handler(self, self._doPlaySpecialActivity),
									CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET,
									CustomActivityConst.PET_DRAW_TYPE_2,
									self._curIndex)
end

function CustomActivityPetView:_doPlaySpecialActivity(activityType, drawType, curIndex)
	G_UserData:getCustomActivityRecharge():c2sPlaySpecialActivity(activityType, drawType, curIndex)
	self:_setBtnEnabled(false)
end

function CustomActivityPetView:_onClickButtonLeft()
	if self._curIndex <= 1 then
		return
	end
	self:_setBtnEnabled(false)
	self:_moveToRight()
end

function CustomActivityPetView:_onClickButtonRight()
	if self._curIndex >= self._maxIndex then
		return
	end
	self:_setBtnEnabled(false)
	self:_moveToLeft()
end

function CustomActivityPetView:_updateArrowBtn()
	self._buttonLeft:setVisible(self._curIndex > 1)
	self._buttonRight:setVisible(self._curIndex < self._maxIndex)
end

function CustomActivityPetView:_setBtnEnabled(enabled)
	self._button1:setEnabled(enabled)
	self._button2:setEnabled(enabled)
	self._buttonLeft:setEnabled(enabled)
	self._buttonRight:setEnabled(enabled)
end

function CustomActivityPetView:_moveToLeft()
	local curNode = self._spineNodes[self._curIndex]
	local leftNode = self._spineNodes[self._curIndex-1]
	local rightNode = self._spineNodes[self._curIndex+1]
	local rightOutNode = self._spineNodes[self._curIndex+2]
	if curNode then
		self:_moveNode(curNode, SPINE_INFO["left"], function()
			self._curIndex = self._curIndex + 1
			self._curSpine = self._spines[self._curIndex]
			self:_updateTitle()
			self:_updateFragmentCount()
			self:_updateArrowBtn()
            self:_setBtnEnabled(true)
            self._nodeIndicator:setCurrentPageIndex(self._curIndex-1)
		end)
	end
	if leftNode then
		self:_moveNode(leftNode, SPINE_INFO["leftOut"])
	end
	if rightNode then
		self:_moveNode(rightNode, SPINE_INFO["mid"])
	end
	if rightOutNode then
		self:_moveNode(rightOutNode, SPINE_INFO["right"])
	end
end

function CustomActivityPetView:_moveToRight()
	local curNode = self._spineNodes[self._curIndex]
	local rightNode = self._spineNodes[self._curIndex+1]
	local leftNode = self._spineNodes[self._curIndex-1]
	local leftOutNode = self._spineNodes[self._curIndex-2]
	if curNode then
		self:_moveNode(curNode, SPINE_INFO["right"], function()
			self._curIndex = self._curIndex - 1
			self._curSpine = self._spines[self._curIndex]
			self:_updateTitle()
			self:_updateFragmentCount()
			self:_updateArrowBtn()
            self:_setBtnEnabled(true)
            self._nodeIndicator:setCurrentPageIndex(self._curIndex-1)
		end)
	end
	if rightNode then
		self:_moveNode(rightNode, SPINE_INFO["rightOut"])
	end
	if leftNode then
		self:_moveNode(leftNode, SPINE_INFO["mid"])
	end
	if leftOutNode then
		self:_moveNode(leftOutNode, SPINE_INFO["left"])
	end
end

function CustomActivityPetView:_moveNode(node, tarInfo, callback)
	local moveTo = cc.MoveTo:create(MOVE_TIME, tarInfo.pos)
	local scaleTo = cc.ScaleTo:create(MOVE_TIME, tarInfo.scale)
	local fadePicFunc = cc.CallFunc:create(function()
		local pic = node:getChildByName("nodePic")
		pic:runAction(cc.FadeTo:create(MOVE_TIME, tarInfo.opacity))
	end)
	local fadeSpineFunc = cc.CallFunc:create(function()
		local ball = node:getChildByName("spine")
		ball:runAction(cc.FadeTo:create(MOVE_TIME, tarInfo.opacityBall))
	end)
	local spawn = cc.Spawn:create(moveTo, scaleTo, fadePicFunc, fadeSpineFunc)
	node:runAction(cc.Sequence:create(
            spawn,
            cc.CallFunc:create(function()
            	node:setLocalZOrder(tarInfo.order)
            	if callback then
            		callback()
            	end
            end)
        )
	)
end

function CustomActivityPetView:_customActivityDrawPetSuccess(eventName, actType, drawType, records, equips)
	if actType ~= CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET then
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
		self:_playStarBlink(star, drawType, records)
		self:_playStarSound(star)
	end

	self:_updateData()
	self:_updateCost()
	self:_updateShopRP()
	self:_updateFragmentCount()
end

function CustomActivityPetView:_playStarSound(star)
	local actions = {}
	local play = cc.CallFunc:create(function()
		G_AudioManager:playSoundWithId(AudioConst.SOUND_STAR_BLINK)
	end)
	local delay = cc.DelayTime:create(0.3)

	for i = 1, star do
		table.insert(actions, play)
		table.insert(actions, delay)
	end

	local action = cc.Sequence:create(unpack(actions))
	self:runAction(action)
end

function CustomActivityPetView:_playStarBlink(star, index, records)
	self._curSpine:setAnimation("effect"..star, false)
	self._curSpine.signalComplet:addOnce(function( ... )
		self:_popupAward(records)
		self._curSpine:setAnimation("idle", true)
		self:_setBtnEnabled(true)
	end)
end

function CustomActivityPetView:_popupAward(records)
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

function CustomActivityPetView:_checkTime()
	local isVisible = G_UserData:getCustomActivity():isPetActivityVisible()
	if isVisible then
		return true
	else
		G_Prompt:showTip(Lang.get("customactivity_pet_act_end_tip"))
		return false
	end
end

function CustomActivityPetView:_checkCost(drawType)
	local result = false
	local costYuBi = nil
	local itemCount = nil
	
	local consume_time1 = self._configInfo.consume_time1
	local consume_time2 = self._configInfo.consume_time2
	local hit_num = self._configInfo.hit_num

	local checkCostCoin = function (type, value)
		local hitCount = UserDataHelper.getNumByTypeAndValue(type, value)
		if drawType == CustomActivityConst.PET_DRAW_TYPE_1 then
			local rechargeUnit = G_UserData:getCustomActivityRecharge():getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET)
			local freeCount = rechargeUnit:getRestFreeCount(self._batch)
			if freeCount > 0 then
				return true
			end
			local limitCount = consume_time1
			if hitCount >= limitCount then
				return true, limitCount, 1 --单次，写死1个
			end
		elseif drawType == CustomActivityConst.PET_DRAW_TYPE_2 then
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
		consume_time1 = tonumber(Paramter.get(886).content)
		consume_time2 = tonumber(Paramter.get(886).content)
		hit_num = self._configInfo.hit_num
		result, costYuBi, itemCount = checkCostCoin(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)  -- 玉璧数量

		if not result then
			local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
			G_Prompt:showTip(Lang.get("customactivity_pet_cost_not_enough", {name1 = param.name, name2 = param.name}))
		end
	end

	return result, costYuBi, itemCount
end

function CustomActivityPetView:_updateShopRP()
	local shopRP = G_UserData:getShopActive():isShowPetRedPoint()
    self._btnShop:showRedPoint(shopRP)
end

return CustomActivityPetView
