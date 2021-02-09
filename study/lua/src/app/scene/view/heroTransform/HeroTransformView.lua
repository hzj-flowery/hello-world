--
-- Author: Liangxu
-- Date: 2017-12-28 16:06:18
-- 武将置换上界面
local ViewBase = require("app.ui.ViewBase")
local HeroTransformView = class("HeroTransformView", ViewBase)
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local FunctionConst = require("app.const.FunctionConst")
local HeroConst = require("app.const.HeroConst")
local HeroTransformNode = require("app.scene.view.heroTransform.HeroTransformNode")
local PopupChooseHero2 = require("app.ui.PopupChooseHero2")
local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")
local PopupCheckHeroTransform = require("app.scene.view.heroTransform.PopupCheckHeroTransform")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local PopupHeroTransformPreview = require("app.scene.view.heroTransform.PopupHeroTransformPreview")
local AudioConst = require("app.const.AudioConst")
local PopupTransformResult = require("app.scene.view.heroTransform.PopupTransformResult")
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
local UserDataHelper = require("app.utils.UserDataHelper")

function HeroTransformView:ctor()
	local resource = {
		file = Path.getCSB("HeroTransformView", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonPreview = {
				events = {{event = "touch", method = "_onButtonPreviewClicked"}}
			},
			_buttonTransform = {
				events = {{event = "touch", method = "_onButtonTransformClicked"}}
			},
		},
	}
	HeroTransformView.super.ctor(self, resource)
end

function HeroTransformView:onCreate()
	self:_initData()
	self:_initView()
end

function HeroTransformView:onEnter()
	self._signalHeroTransform = G_SignalManager:add(SignalConst.EVENT_HERO_TRANSFORM_SUCCESS, handler(self, self._heroTransformSuccess))
	self:_updateData()
	self:_updateView()
end

function HeroTransformView:onExit()
	self._signalHeroTransform:remove()
	self._signalHeroTransform = nil
end

function HeroTransformView:_initData()
	self._srcHeroIds = {}
	self._tarHeroBaseId = 0
	self._tarHeroLimitLevel = 0
	self._tarHeroRedLimitLevel = 0
	self._resultData = nil
	self._isChangeCountry = false --是否跨阵营
end

function HeroTransformView:_initView()
	self:_initTips()
	self._buttonPreview:setString(Lang.get("hero_transform_btn_preview"))
	self._buttonTransform:setString(Lang.get("hero_transform_btn_transform"))
	self._srcHero = HeroTransformNode.new(self._nodeSrcHero, HeroConst.HERO_TRANSFORM_NODE_TYPE_SRC, handler(self, self._onClickSrcHero))
	self._tarHero = HeroTransformNode.new(self._nodeTarHero, HeroConst.HERO_TRANSFORM_NODE_TYPE_TAR, handler(self, self._onClickTarHero))
	self._checkBoxInstrument:setSelected(true) --默认勾选
end

function HeroTransformView:_initTips()
	local content = Lang.get("hero_transform_tips")
	local label = ccui.RichText:createWithContent(content)
	label:setAnchorPoint(cc.p(0.5, 0.5))
	self._nodeTopTip:addChild(label)
end

function HeroTransformView:_updateData()
	
end

function HeroTransformView:_updateView()
	self:_updateSrcHeroNode()
	self:_updateTarHeroNode()
	self:_updateTipsInfo()
end

function HeroTransformView:_onButtonPreviewClicked()
	local srcHeroId = self._srcHeroIds[1]
	local tarBaseHeroId = self._tarHeroBaseId
	local popup = PopupHeroTransformPreview.new(self, srcHeroId, tarBaseHeroId)
	popup:openWithAction()
end

function HeroTransformView:_onButtonTransformClicked()
	if self:_checkTransformCondition() == false then
		return
	end

	local title = Lang.get("hero_transform_alert_title")
	local content = ""
	if self._isChangeCountry then
		local costType, costValue, costSize = self:_getCostParam2()
		local itemParam = TypeConvertHelper.convert(costType, costValue)
		content = Lang.get("hero_transform_alert_content2", {itemName = itemParam.name})
	else
		content = Lang.get("hero_transform_alert_content")
	end
	
	local popup = require("app.ui.PopupSystemAlert").new(title, content, handler(self, self._doTransform))
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
end

function HeroTransformView:_checkTransformCondition()
	if #self._srcHeroIds == 0 then
		G_Prompt:showTip(Lang.get("hero_transform_condition_tip4"))
		return false
	end

	if self._tarHeroBaseId == 0 then
		G_Prompt:showTip(Lang.get("hero_transform_condition_tip5"))
		return false
	end

	local costType1, costValue1, costSize1 = self:_getCostParam1()
	local ownCount1 = UserDataHelper.getNumByTypeAndValue(costType1, costValue1)
	local needCount1 = self:_getNeedItemCount1()
	if ownCount1 < needCount1 then
		local popup = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		popup:updateUI(costType1, costValue1)
		popup:openWithAction()
		return false
	end

	local costType2, costValue2, costSize2 = self:_getCostParam2()
	local ownCount2 = UserDataHelper.getNumByTypeAndValue(costType2, costValue2)
	local needCount2 = self:_getNeedItemCount2(costSize2)
	if ownCount2 < needCount2 then
		local popup = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		popup:updateUI(costType2, costValue2)
		popup:openWithAction()
		return false
	end

	return true
end

function HeroTransformView:_doTransform()
	self:_setResultData()
	local srcIds = self._srcHeroIds
	local toId = self._tarHeroBaseId
	local withInstrument = self._checkBoxInstrument:isSelected()
	G_UserData:getHero():c2sHeroTransform(srcIds, toId, withInstrument)
	self:_setButtonEnable(false)
end

function HeroTransformView:_setResultData()
	local data = {}
	local firstHeroId = self._srcHeroIds[1]
	local heroData = G_UserData:getHero():getUnitDataWithId(firstHeroId)
	local level = heroData:getLevel()
	local rank = heroData:getRank_lv()
	local awakeLevel = heroData:getAwaken_level()
	local awakeStar, starLevel = HeroDataHelper.convertAwakeLevel(awakeLevel)
	local awakeDes = Lang.get("hero_awake_star_level", {star = awakeStar, level = starLevel})
	local num = #self._srcHeroIds
	local instrumentNum = 0
	if self._checkBoxInstrument:isSelected() then
		instrumentNum = InstrumentDataHelper.getInstrumentCountWithHeroIds(self._srcHeroIds)
	end

	data.srcHeroBaseId = heroData:getBase_id()
	data.tarHeroBaseId = self._tarHeroBaseId
	data.tarHeroLimitLevel = self._tarHeroLimitLevel
	data.tarHeroRedLimitLevel = self._tarHeroRedLimitLevel
	data.value = {}
	data.isGoldHero = self:_isChooseGoldHero()
	table.insert(data.value, level)
	table.insert(data.value, rank)
	table.insert(data.value, awakeDes)
	table.insert(data.value, num)
	table.insert(data.value, instrumentNum)

	self._resultData = data
end

function HeroTransformView:_getSrcHeroCountry()
	local country = 1
	local firstHeroId = self._srcHeroIds[1]
	if firstHeroId then
		local heroData = G_UserData:getHero():getUnitDataWithId(firstHeroId)
		country = heroData:getConfig().country
	end
	return country
end

function HeroTransformView:_getSrcHeroTrained()
	local trained = false
	local firstHeroId = self._srcHeroIds[1]
	if firstHeroId then
		local heroData = G_UserData:getHero():getUnitDataWithId(firstHeroId)
		trained = heroData:isDidTrain()
	end
	return trained
end

function HeroTransformView:_getSrcHeroBaseIds()
	local temp = {}
	for i, heroId in ipairs(self._srcHeroIds) do
		local heroData = G_UserData:getHero():getUnitDataWithId(heroId)
		local baseId = heroData:getBase_id()
		temp[i] = baseId
	end
	local result = table.unique(temp, true)
	return result
end

function HeroTransformView:_getTarHeroTempData()
	local tempData = {}
	local firstHeroId = self._srcHeroIds[1]
	if firstHeroId then
		local heroData = G_UserData:getHero():getUnitDataWithId(firstHeroId)
		tempData.level = heroData:getLevel()
		tempData.rank_lv = heroData:getRank_lv()
		tempData.awaken_level = heroData:getAwaken_level()
		tempData.limit_level = heroData:getLimit_level()
		tempData.limit_rtg = heroData:getLimit_rtg()
		tempData.isDidLimit = heroData:isDidLimit()
		tempData.isDidLimitRed = heroData:isDidLimitRed()
		tempData.color = heroData:getConfig().color
	end
	return tempData
end

function HeroTransformView:_onClickSrcHero()
	local country = self:_getSrcHeroCountry()
	local tabIndex = country
	local popup = PopupCheckHeroTransform.new(self, handler(self, self._onChooseSrcHero), tabIndex)
	popup:setSelectedHeroIds(self._srcHeroIds)
	popup:openWithAction()
end

function HeroTransformView:_onClickTarHero()
	local popup = PopupChooseHero2.new()
	popup:setTitle(Lang.get("hero_transform_choose_list_title2"))
	local filterIds = self:_getSrcHeroBaseIds()
	local tempData = self:_getTarHeroTempData()
	popup:updateUI(PopupChooseHeroHelper.FROM_TYPE8, handler(self, self._onChooseTarHero), filterIds, tempData)
	popup:openWithAction()
end

function HeroTransformView:_onChooseSrcHero(heroIds)
	self._srcHeroIds = clone(heroIds)
	self:_updateSrcHeroNode()
	self._tarHeroBaseId = 0
	self:_updateTarHeroNode()
	self:_updateTipsInfo()

	local color = 5
	if self:_isChooseRedHero() then
		color = 6
	elseif self:_isChooseGoldHero() then
		color = 7
	end
	G_SignalManager:dispatch(SignalConst.EVENT_HERO_TRANSFORM_CHOOSE, color)
end

function HeroTransformView:_onChooseTarHero(heroId, param, heroData)
	self._tarHeroBaseId = heroData:getBase_id()
	self._tarHeroLimitLevel = heroData:getLimit_level()
	self._tarHeroRedLimitLevel = heroData:getLimit_rtg()
	self:_updateTarHeroNode()
	self:_updateTipsInfo()
end

function HeroTransformView:_updateSrcHeroNode()
	local firstHeroId = self._srcHeroIds[1]
	local baseId = 0
	local limitLevel = 0
	local limitRedLevel = 0
	local heroCount = #self._srcHeroIds
	if firstHeroId then
		local heroData = G_UserData:getHero():getUnitDataWithId(firstHeroId)
		baseId = heroData:getBase_id()
		limitLevel = heroData:getLimit_level()
		limitRedLevel = heroData:getLimit_rtg()
	end

	self._srcHero:setHeroCount(heroCount)
	self._srcHero:setHeroId(baseId, limitLevel, limitRedLevel)
	self._srcHero:updateUI()
end

function HeroTransformView:_updateTarHeroNode()
	local lock = #self._srcHeroIds == 0 and true or false
	self._imageArrow:setVisible(not lock)
	self._tarHero:setLock(lock)
	self._tarHero:setHeroId(self._tarHeroBaseId, self._tarHeroLimitLevel, self._tarHeroRedLimitLevel)
	self._tarHero:updateUI()
end

function HeroTransformView:_updateTipsInfo()
	local show = #self._srcHeroIds > 0 and self._tarHeroBaseId > 0
	self._imageTipBg:setVisible(show)
	self._nodeCost:setVisible(show)

	local previewShow = show and self:_getSrcHeroTrained()
	self._buttonPreview:setVisible(previewShow)
	if previewShow then
		self._buttonPreview:setPositionX(-159)
		self._buttonTransform:setPositionX(158)
		self._nodeCost:setPositionX(158)
	else
		self._buttonTransform:setPositionX(0)
		self._nodeCost:setPositionX(0)
	end

	self:_updateCost1()
	self:_updateCost2()
end

--是否选的是红将
function HeroTransformView:_isChooseRedHero()
	local firstHeroId = self._srcHeroIds[1]
	if firstHeroId then
		local heroData = G_UserData:getHero():getUnitDataWithId(firstHeroId)
		local color = heroData:getConfig().color
		if color == 6 then
			return true
		end
	end
	return false
end

--是否选的是金将
function HeroTransformView:_isChooseGoldHero()
	local firstHeroId = self._srcHeroIds[1]
	if firstHeroId then
		local heroData = G_UserData:getHero():getUnitDataWithId(firstHeroId)
		local color = heroData:getConfig().color
		if color == 7 then
			return true
		end
	end
	return false
end

function HeroTransformView:_getCostParam1()
	local costType = TypeConvertHelper.TYPE_ITEM
	local costValue = DataConst.ITEM_TRANSFORM
	local costSize = 1
	if self:_isChooseRedHero() then
		costValue = DataConst.ITEM_TRANSFORM_RED
	elseif self:_isChooseGoldHero() then
		costValue = DataConst.ITEM_TRANSFORM_GOLD
	end

	return costType, costValue, costSize
end

function HeroTransformView:_getCostParam2()
	local strContent = require("app.config.parameter").get(ParameterIDConst.DISPLACE_CHANGE_CAMP).content
	if self:_isChooseRedHero() then
		strContent = require("app.config.parameter").get(ParameterIDConst.DISPLACE_RED_ACROSS).content
	elseif self:_isChooseGoldHero() then
		strContent = require("app.config.parameter").get(ParameterIDConst.DISPLACE_GOLD_ACROSS).content
	end

	local tbTemp = string.split(strContent, "|")
	local costType = tonumber(tbTemp[1])
	local costValue = tonumber(tbTemp[2])
	local costSize = tonumber(tbTemp[3])

	return costType, costValue, costSize
end

function HeroTransformView:_updateCost1()
	local costType, costValue, costSize = self:_getCostParam1()
	self._nodeCost:updateUI(costType, costValue)
	local count = UserDataHelper.getNumByTypeAndValue(costType, costValue)
	local max = self:_getNeedItemCount1()
	local enough = count >= max
	self._nodeCost:setCount(max)
	self._nodeCost:setTextColorToDTypeColor(enough)
end

function HeroTransformView:_updateCost2()
	local costType, costValue, costSize = self:_getCostParam2()
	self._nodeCost2:updateUI(costType, costValue)
	local count = UserDataHelper.getNumByTypeAndValue(costType, costValue)
	local needCount = self:_getNeedItemCount2(costSize)
	if needCount == 0 then
		self._nodeCost2:setVisible(false)
	else
		self._nodeCost2:setVisible(true)
		local enough = count >= needCount
		self._nodeCost2:setCount(needCount)
		self._nodeCost2:setTextColorToDTypeColor(enough)
	end
end

function HeroTransformView:_getNeedItemCount1()
	local totalCost = {}
	local count = 0 
	for i, heroId in ipairs(self._srcHeroIds) do
		local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local cost1 = HeroDataHelper.getAllBreakCost(unitData)
		local cost2 = HeroDataHelper.getAllAwakeCost(unitData)
		local cost3 = HeroDataHelper.getAllLimitCostWithoutGold(unitData)
		RecoveryDataHelper.formatRecoveryCost(totalCost, TypeConvertHelper.TYPE_HERO, unitData:getBase_id(), 1)
		RecoveryDataHelper.mergeRecoveryCost(totalCost, cost1)
		RecoveryDataHelper.mergeRecoveryCost(totalCost, cost2)
		RecoveryDataHelper.mergeRecoveryCost(totalCost, cost3)
	end

	for type, unit in pairs(totalCost) do
		if type == TypeConvertHelper.TYPE_HERO then
			for value, size in pairs(unit) do
				count = count + size
			end
		end
	end
	local temp = tonumber(require("app.config.parameter").get(ParameterIDConst.DISPLACE_PROPORTION).content)
	if self:_isChooseRedHero() then
		temp = tonumber(require("app.config.parameter").get(ParameterIDConst.DISPLACE_RED_BASIS).content)
	elseif self:_isChooseGoldHero() then
		temp = tonumber(require("app.config.parameter").get(ParameterIDConst.DISPLACE_HERO_GOLD).content)
	end
	count = math.ceil(count/temp)

	return count
end

function HeroTransformView:_getNeedItemCount2(ratio)
	if self._tarHeroBaseId == 0 then
		return 0
	end

	local count = 0
	local tarCountry = UserDataHelper.getHeroConfig(self._tarHeroBaseId).country
	local tbTemp = {}
	for i, heroId in ipairs(self._srcHeroIds) do
		local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local baseId = unitData:getBase_id()
		local country = unitData:getConfig().country
		if tbTemp[country] == nil then
			tbTemp[country] = {}
		end
		if tbTemp[country][baseId] == nil then
			tbTemp[country][baseId] = true
		end
	end

	for country, one in pairs(tbTemp) do
		if country ~= tarCountry then
			for baseId, value in pairs(one) do
				count = count + ratio
			end
		end
	end

	self._isChangeCountry = count > 0

	return count
end

function HeroTransformView:_setButtonEnable(enable)
	self._buttonPreview:setEnabled(enable)
	self._buttonTransform:setEnabled(enable)
	self._srcHero:setEnabled(enable)
	self._tarHero:setEnabled(enable)
end

function HeroTransformView:_heroTransformSuccess()
	self:_playEffect()
end

function HeroTransformView:_playEffect()
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "1p" then
    		local action = cc.FadeOut:create(0.3)
    		local heroNode = self._srcHero:getHeroNode()
    		heroNode:runAction(action)
    		-- G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_BREAK) --播音效
        elseif event == "2p" then
        	local action = cc.FadeOut:create(0.3)
        	local heroNode = self._tarHero:getHeroNode()
    		heroNode:runAction(action)
    	elseif event == "finish" then
    		local popup = PopupTransformResult.new(self, self._resultData)
			popup:open()
			
			self:_setButtonEnable(true)
			self:_initData()
			self:_updateView()
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_zhihuan", effectFunction, eventFunction , false)
    effect:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5, G_ResolutionManager:getDesignHeight()*0.5))
end

return HeroTransformView
