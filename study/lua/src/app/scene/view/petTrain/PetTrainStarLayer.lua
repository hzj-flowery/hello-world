--
-- Author: hedili
-- Date: 2018-01-30 17:57:20
-- 神兽升星
local ViewBase = require("app.ui.ViewBase")
local PetTrainStarLayer = class("PetTrainStarLayer", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AttributeConst = require("app.const.AttributeConst")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")
local AudioConst = require("app.const.AudioConst")
local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")

--根据材料数量，定义材料的位置
local MATERIAL_POS = {
	[1] = {{166, 56}},
	[2] = {{126, 56}, {284, 56}},
	[3] = {{93, 56}, {207, 56}, {316, 56}}
}

function PetTrainStarLayer:ctor(parentView)
	self._parentView = parentView
	local resource = {
		file = Path.getCSB("PetTrainStarLayer", "pet"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonStar = {
				events = {{event = "touch", method = "_onButtonBreakClicked"}}
			}
		}
	}
	self:setName("PetTrainStarLayer")
	PetTrainStarLayer.super.ctor(self, resource)
end

function PetTrainStarLayer:onCreate()
	self:_initData()
	self:_initView()
end

function PetTrainStarLayer:onEnter()
	self._signalPetStarUp =
		G_SignalManager:add(SignalConst.EVENT_PET_STAR_UP_SUCCESS, handler(self, self._petStarUpSuccess))

	self:_updatePageItem()
	self:_updateInfo()
end

function PetTrainStarLayer:onExit()
	self._signalPetStarUp:remove()
	self._signalPetStarUp = nil
end

function PetTrainStarLayer:initInfo()
	self:_updateInfo()
	self:_updatePageItem()
	self:_updateInfo()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function PetTrainStarLayer:_initData()
	self._isReachLimit = false -- 是否达到上限
	self._conditionLevel = false
	self._isPageViewMoving = false --pageview是否在拖动过程中
end

function PetTrainStarLayer:_initView()
	self._materialIcons = {}
	self._buttonStar:setString(Lang.get("pet_break_btn_break"))
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeDetailTitle2:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("pet_break_detail_title"))
	self._fileNodeDetailTitle2:setTitle(Lang.get("pet_break_cost_title"))

	self:_initPageView()
end

function PetTrainStarLayer:_createPageItem()
	local widget = ccui.Widget:create()
	widget:setSwallowTouches(false)
	widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)

	return widget
end

function PetTrainStarLayer:_updatePageItem()
	local allPetIds = self._parentView:getAllPetIds()
	local index = self._parentView:getSelectedPos()
	for i = index - 1, index + 1 do
		local item = self._pageItems[i]
		if item and item.widget then
			local widget = item.widget
			local count = widget:getChildrenCount()
			if count == 0 then
				local petId = allPetIds[i]
				local unitData = G_UserData:getPet():getUnitDataWithId(petId)
				local petBaseId = unitData:getBase_id()
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
				avatar:setConvertType(TypeConvertHelper.TYPE_PET)
				avatar:updateUI(petBaseId)

				avatar:setScale(1.0)
				avatar:setShadowScale(2.7) --神兽影子放大
				avatar:setPosition(cc.p(self._pageViewSize.width * 0.57, 190))
				avatar:playAnimationLoopIdle()
				widget:addChild(avatar)
				self._fileNodePetNew = avatar
				self._pageItems[i].avatar = avatar
			end
			if self._pageItems[i].avatar then
				local petId = allPetIds[i]
				local unitData = G_UserData:getPet():getUnitDataWithId(petId)
				local petBaseId = unitData:getBase_id()
				self._pageItems[i].avatar:updateUI(petBaseId)
			end
		end
	end
	self:_updatePageItemVisible()
end

function PetTrainStarLayer:_initPageView()
	self._pageItems = {}
	self._pageView:setItemsMargin(60) --加大间隙，防止有武器太大，越界穿帮
	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self, self._onPageViewEvent))
	self._pageView:addTouchEventListener(handler(self, self._onPageTouch))
	self._pageViewSize = self._pageView:getContentSize()

	self._pageView:removeAllPages()
	local petCount = self._parentView:getPetCount()
	for i = 1, petCount do
		local widget = self:_createPageItem()
		self._pageView:addPage(widget)
		self._pageItems[i] = {widget = widget}
	end
	local selectedPos = self._parentView:getSelectedPos()
	self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function PetTrainStarLayer:_onPageViewEvent(sender, event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		local selectedPos = self._parentView:getSelectedPos()
		if targetPos ~= selectedPos then
			self._parentView:setSelectedPos(targetPos)
			local allPetIds = self._parentView:getAllPetIds()
			local curPetId = allPetIds[targetPos]
			G_UserData:getPet():setCurPetId(curPetId)
			self._parentView:updateArrowBtn()
			self:_updatePageItem()
			self:_updateInfo()
			self._parentView:updateRedPoint()
			self._parentView:updateTabVisible()
		end
	end
end

function PetTrainStarLayer:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		self._isPageViewMoving = true
		self:_updatePageItemVisible()
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		self._isPageViewMoving = false
	end
end

function PetTrainStarLayer:_updatePageItemVisible()
	local curIndex = self._parentView:getSelectedPos()
	for i, item in ipairs(self._pageItems) do
		if i == curIndex then
			item.widget:setVisible(true)
		else
			item.widget:setVisible(self._isPageViewMoving)
		end
	end
end

function PetTrainStarLayer:_updateInfo()
	self._petId = G_UserData:getPet():getCurPetId()
	self._petUnitData = G_UserData:getPet():getUnitDataWithId(self._petId)
	self._starLevel = self._petUnitData:getStar()
	self._isReachLimit = UserDataHelper.isReachStarLimit(self._petUnitData)

	self:setButtonEnable(true)
	self:_updateShow()
	self:_updateAttr()
	self:_updateCost()
end

function PetTrainStarLayer:_updateShow()
	local petBaseId = self._petUnitData:getBase_id()
	local starLevel = self._petUnitData:getStar()

	local strDes = ""

	self._fileNodeHeroName:setConvertType(TypeConvertHelper.TYPE_PET)
	self._fileNodeHeroName2:setConvertType(TypeConvertHelper.TYPE_PET)

	self._fileNodeHeroName:setName(petBaseId)
	self._fileNodeHeroName2:setName(petBaseId)
	self._fileNodeStar:setCount(starLevel)

	local strDesc = UserDataHelper.getPetStateStr(self._petUnitData)
	if strDesc then
		self._textIsBless:setString(strDesc)
		self._textIsBless:setVisible(true)
	else
		self._textIsBless:setVisible(false)
	end

	self._nodeBreakDesc:removeAllChildren()
	local widget = PetTrainHelper.createBreakDesc(self._petUnitData)

	self._nodeBreakDesc:addChild(widget)
end

function PetTrainStarLayer:_updateAttr()
	self._textOldStar:setString(Lang.get("pet_break_txt_break_title", {level = self._starLevel}))

	local strRankLevel = nil
	if self._isReachLimit == true then
		local strStarLevel = Lang.get("pet_break_txt_reach_limit")
		self._textNewStar:setString(strStarLevel)
		self._textNewAdd:setString(strStarLevel)

		local curBreakAttr = UserDataHelper.getPetBreakShowAttr(self._petUnitData)
		local oldPercent =
			Lang.get(
			"pet_break_txt_add",
			{
				percent = math.floor(curBreakAttr[AttributeConst.PET_ALL_ATTR] / 10)
			}
		)
		self._textOldAdd:setString(oldPercent)
		return
	end

	local strRankLevel = Lang.get("pet_break_txt_break_title", {level = self._starLevel + 1})

	self._textNewStar:setString(strRankLevel)

	local curBreakAttr = UserDataHelper.getPetBreakShowAttr(self._petUnitData)
	local nextBreakAttr = UserDataHelper.getPetBreakShowAttr(self._petUnitData, 1) or {}

	local oldPercent =
		Lang.get(
		"pet_break_txt_add",
		{
			percent = math.floor(curBreakAttr[AttributeConst.PET_ALL_ATTR] / 10)
		}
	)
	local newPercent =
		Lang.get(
		"pet_break_txt_add",
		{
			percent = math.floor(nextBreakAttr[AttributeConst.PET_ALL_ATTR] / 10)
		}
	)

	self._textOldAdd:setString(oldPercent)
	self._textNewAdd:setString(newPercent)
end

function PetTrainStarLayer:_updateCost()
	self._costCardNum = 0
	self._fileNodeDetailTitle2:setVisible(not self._isReachLimit)
	self._nodeResource:setVisible(not self._isReachLimit)
	self._panelCost:removeAllChildren()
	self._nodeNeedLevelPos:removeAllChildren()

	self._buttonStar:setEnabled(not self._isReachLimit)
	if self._isReachLimit then --达到顶级了
		local sp = cc.Sprite:create(Path.getTextTeam("img_beast_upstar"))
		local size = self._panelCost:getContentSize()
		sp:setPosition(cc.p(size.width / 2, size.height / 2))
		self._panelCost:addChild(sp)
		return
	end

	--材料
	self._materialIcons = {}
	self._materialInfo = {}
	self._resourceInfo = {}
	local allMaterialInfo = UserDataHelper.getPetBreakMaterials(self._petUnitData)
	for i, info in ipairs(allMaterialInfo) do
		if info.type ~= TypeConvertHelper.TYPE_RESOURCE then --排除银币
			table.insert(self._materialInfo, info)
		else
			table.insert(self._resourceInfo, info)
		end
	end
	local _createMaterialIcon = 
		function (info)
			local node = CSHelper.loadResourceNode(Path.getCSB("CommonCostNode", "common"))
			node:setCloseMode()
			node:updateView(info, self._petUnitData:getId())
			return node
		end
	local len = #self._materialInfo
	for i, info in ipairs(self._materialInfo) do
		local item = _createMaterialIcon(info)
		local pos = cc.p(MATERIAL_POS[len][i][1], MATERIAL_POS[len][i][2])
		item:setPosition(pos)
		self._panelCost:addChild(item)
		table.insert(self._materialIcons, item)
		if info.type == TypeConvertHelper.TYPE_PET then
			self._costCardNum = self._costCardNum + item:getNeedCount()
		end
	end

	--银币
	local resource = self._resourceInfo[1]
	if resource then
		self._nodeResource:updateUI(resource.type, resource.value, resource.size)
		self._nodeResource:setTextColor(Colors.BRIGHT_BG_TWO)
		self._nodeResource:setVisible(true)
	else
		self._nodeResource:setVisible(false)
	end

	--需要等级
	local myLevel = self._petUnitData:getLevel()
	local needLevel = UserDataHelper.getPetBreakLimitLevel(self._petUnitData)
	local colorNeed =
		myLevel < needLevel and Colors.colorToNumber(Colors.BRIGHT_BG_RED) or Colors.colorToNumber(Colors.BRIGHT_BG_GREEN)
	local needLevelInfo =
		Lang.get(
		"pet_break_txt_need_level",
		{
			value1 = myLevel,
			color = colorNeed,
			value2 = needLevel
		}
	)
	local richTextNeedLevel = ccui.RichText:createWithContent(needLevelInfo)
	richTextNeedLevel:setAnchorPoint(cc.p(0, 0))
	self._nodeNeedLevelPos:addChild(richTextNeedLevel)
	self._conditionLevel = myLevel >= needLevel
end

function PetTrainStarLayer:setButtonEnable(enable)
	self._buttonStar:setEnabled(enable)
	self._pageView:setEnabled(enable)
	if self._parentView and self._parentView.setArrowBtnEnable then
		self._parentView:setArrowBtnEnable(enable)
	end
end

function PetTrainStarLayer:_onButtonBreakClicked()
	if self._isReachLimit then
		G_Prompt:showTip(Lang.get("pet_break_reach_limit_tip"))
		return
	end
	if not self._conditionLevel then
		G_Prompt:showTip(Lang.get("pet_break_condition_no_level"))
		return
	end
	for i, icon in ipairs(self._materialIcons) do
		local isReachCondition = icon:isReachCondition()
		if not isReachCondition then
			local info = self._materialInfo[i]
			local param = TypeConvertHelper.convert(info.type, info.value)
			G_Prompt:showTip(Lang.get("pet_break_condition_no_cost", {name = param.name}))
			return
		end
	end
	for i, info in ipairs(self._resourceInfo) do
		local enough = require("app.utils.LogicCheckHelper").enoughValue(info.type, info.value, info.size)
		if not enough then
			return false
		end
	end

	self:_doPetBreak()
end

function PetTrainStarLayer:_doPetBreak()
	local id = self._petUnitData:getId()
	local config = self._petUnitData:getConfig()
	local petBaseId = self._petUnitData:getBase_id()
	local initial_star = self._petUnitData:getInitial_star()

	if config.color == 6 and initial_star == 0 then
		-- 非原始红神兽升星消耗
		petBaseId = config.potential_before
	end

	local petIds = {}
	local sameCards = G_UserData:getPet():getSameCardCountWithBaseId(petBaseId, id)
	local count = 0
	for k, card in pairs(sameCards) do
		if count >= self._costCardNum then
			break
		end
		table.insert(petIds, card:getId())
		count = count + 1
	end
	if config.color == 6 and initial_star == 0 then
		-- 非原始红神兽升星
		G_UserData:getPet():c2sPetStarUp(id, nil, petIds)
	else
		G_UserData:getPet():c2sPetStarUp(id, petIds, nil)
	end
	self:setButtonEnable(false)
end

function PetTrainStarLayer:_petStarUpSuccess()
	self:_playEffect()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:updateTabVisible()
		self._parentView:checkRedPoint(2)
		self._parentView:checkRedPoint(3)
	end
end

function PetTrainStarLayer:showPetAvatar()
	--self._fileNodeHeroOld:setOpacity(255)
	self._fileNodePetNew:setOpacity(255)
end

function PetTrainStarLayer:_playEffect()
	local function effectFunction(effect)
		if effect == "effect_wujiangtupo_ningju" then
			local subEffect = EffectGfxNode.new("effect_wujiangtupo_ningju")
			subEffect:play()
			return subEffect
		end

		if effect == "effect_wujiangtupo_feichu" then
			local subEffect = EffectGfxNode.new("effect_wujiangtupo_feichu")
			subEffect:play()
			return subEffect
		end

		if effect == "effect_wujiangtupo_xingxing" then
			local subEffect = EffectGfxNode.new("effect_wujiangtupo_xingxing")
			subEffect:play()
			return subEffect
		end

		if effect == "effect_wujiangtupo_daguang" then
			local subEffect = EffectGfxNode.new("effect_wujiangtupo_daguang")
			subEffect:play()
			return subEffect
		end

		if effect == "effect_wujiangtupo_xiaoxing" then
			local subEffect = EffectGfxNode.new("effect_wujiangtupo_xiaoxing")
			subEffect:play()
			return subEffect
		end

		if effect == "effect_wujiangtupo_guangqiu" then
			local subEffect = EffectGfxNode.new("effect_wujiangtupo_guangqiu")
			subEffect:play()
			return subEffect
		end

		if effect == "effect_wujiangtupo_shuxian" then
			local subEffect = EffectGfxNode.new("effect_wujiangtupo_shuxian")
			subEffect:play()
			return subEffect
		end

		if effect == "effect_wujiangtupo_xiaosan" then
			local subEffect = EffectGfxNode.new("effect_wujiangtupo_xiaosan")
			subEffect:play()
			return subEffect
		end

		return cc.Node:create()
	end

	local function eventFunction(event)
		if event == "1p" then
			local action = cc.FadeOut:create(0.3)
			--self._fileNodeHeroOld:runAction(action)
			G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_BREAK) --播音效
		elseif event == "2p" then
			local action = cc.FadeOut:create(0.3)
			self._fileNodePetNew:runAction(action)
		elseif event == "finish" then
			local popupBreakResult = require("app.scene.view.petTrain.PopupPetBreakResult").new(self, self._petId)
			popupBreakResult:open()

			self:setButtonEnable(true)
			self:_updateInfo()
		end
	end

	local effect =
		G_EffectGfxMgr:createPlayMovingGfx(self, "moving_shenshoushengxing1", effectFunction, eventFunction, false)

	effect:setPosition(G_ResolutionManager:getDesignCCPoint())
end

--全范围的情况，突破如果消耗同名卡，要重新更新列表
--此处特殊处理，重新建一遍pageView
function PetTrainStarLayer:updatePageView()
	self:_initPageView()
	self:_updatePageItem()
	self:_updateShow()
end

return PetTrainStarLayer
