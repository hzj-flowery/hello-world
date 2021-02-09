--
-- Author: Liangxu
-- Date: 2017-03-08 19:47:14
-- 武将升级
local ViewBase = require("app.ui.ViewBase")
local HeroTrainUpgradeLayer = class("HeroTrainUpgradeLayer", ViewBase)
local HeroConst = require("app.const.HeroConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local CSHelper = require("yoka.utils.CSHelper")
local TextHelper = require("app.utils.TextHelper")
local DataConst = require("app.const.DataConst")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local AudioConst = require("app.const.AudioConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local UIConst = require("app.const.UIConst")

--需要记录的属性列表（飘字用）
--{属性Id， 对应控件名}
local RECORD_ATTR_LIST = {	
	{AttributeConst.ATK, "_fileNodeAttr1"},
	{AttributeConst.HP, "_fileNodeAttr2"},
	{AttributeConst.PD, "_fileNodeAttr3"},
	{AttributeConst.MD, "_fileNodeAttr4"},
	{AttributeConst.CRIT, nil},
	{AttributeConst.NO_CRIT, nil},
	{AttributeConst.HIT, nil},
	{AttributeConst.NO_HIT, nil},
	{AttributeConst.HURT, nil},
	{AttributeConst.HURT_RED, nil},
}

--材料id对应材料控件索引
local ITEM_ID_2_MATERICAL_INDEX = {
	[DataConst["ITEM_HERO_LEVELUP_MATERIAL_1"]] = 1,
	[DataConst["ITEM_HERO_LEVELUP_MATERIAL_2"]] = 2,
	[DataConst["ITEM_HERO_LEVELUP_MATERIAL_3"]] = 3,
	[DataConst["ITEM_HERO_LEVELUP_MATERIAL_4"]] = 4,
}

function HeroTrainUpgradeLayer:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("HeroTrainUpgradeLayer", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonUpgradeOne = {
				events = {{event = "touch", method = "_onButtonUpgradeOneClicked"}},
			},
			_buttonUpgradeFive = {
				events = {{event = "touch", method = "_onButtonUpgradeFiveClicked"}},
			},
		},
	}
	self:setName("HeroTrainUpgradeLayer")
	HeroTrainUpgradeLayer.super.ctor(self, resource)
end

function HeroTrainUpgradeLayer:onCreate()
	self:_initData()
	self:_initView()
end

function HeroTrainUpgradeLayer:onEnter()
	self._signalHeroLevelUp = G_SignalManager:add(SignalConst.EVENT_HERO_LEVELUP, handler(self, self._onHeroLevelUpSuccess))
end

function HeroTrainUpgradeLayer:onExit()
	self._signalHeroLevelUp:remove()
	self._signalHeroLevelUp = nil
	self:_clearTextSummary()
	self._nodeEffect:removeAllChildren()
end

function HeroTrainUpgradeLayer:initInfo()
	self._parentView:setArrowBtnVisible(true)
	self:_updateData()
	self:_updateView()
	self:_updatePageItem()
	local selectedPos = self._parentView:getSelectedPos()
	self._pageView:setCurrentPageIndex(selectedPos - 1)
end

function HeroTrainUpgradeLayer:_initData()
	self._limitLevel = 0 --等级限制
	self._limitExp = 0 --限制经验
	self._lastTotalPower = 0 --记录总战力
	self._lastAttrData = {} --记录属性
	self._diffAttrData = {} --记录属性差
	self._lastExp = 0 --记录武将升级经验
	self._lastLevel = 0 --记录武将升级的等级
	self._curAttrData = {} --当前属性数据
	self._nextAttrData = {} --下一级属性数据
	self._materialFakeCount = nil --材料假个数
	self._materialFakeCostCount = nil --材料假的消耗个数
	self._fakeCurExp = 0 --假的当前经验
	self._fakeLevel = 0 --假的等级
	self._fakeCurAttrData = {} --假的当前属性
	self._fakeNextAttrData = {} --假的下一等级数据
	self._costMaterials = {} --记录消耗的材料
	self._isLeader = false --是否主角
	self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_HERO_TRAIN_TYPE1)
end

function HeroTrainUpgradeLayer:_initView()
	self._fileNodeDetailTitle:setFontSize(24)
	self._fileNodeDetailTitle2:setFontSize(24)
	self._fileNodeDetailTitle:setTitle(Lang.get("hero_upgrade_detail_title"))
	self._fileNodeDetailTitle2:setTitle(Lang.get("hero_upgrade_detail_title2"))
	self._buttonUpgradeOne:setString(Lang.get("hero_upgrade_btn_upgrade_1"))
	self._buttonUpgradeFive:setString(Lang.get("hero_upgrade_btn_upgrade_5"))
	self._labelCount:setVisible(false)
    self:_initPageView()

    for i = 1, 4 do
		local itemId = DataConst["ITEM_HERO_LEVELUP_MATERIAL_"..i]
		self["_fileNodeMaterial"..i]:updateUI(itemId, handler(self, self._onClickMaterialIcon), handler(self, self._onStepClickMaterialIcon))
		self["_fileNodeMaterial"..i]:setStartCallback(handler(self, self._onStartCallback))
		self["_fileNodeMaterial"..i]:setStopCallback(handler(self, self._onStopCallback))
	end
end

function HeroTrainUpgradeLayer:_updateData()
	self._limitLevel = G_UserData:getBase():getLevel() 
	local curHeroId = G_UserData:getHero():getCurHeroId()
	self._heroUnitData = G_UserData:getHero():getUnitDataWithId(curHeroId)
	local heroConfig = self._heroUnitData:getConfig()
	self._isLeader = heroConfig.type == 1
	local templet = heroConfig.lvup_cost
	self._limitExp = UserDataHelper.getHeroNeedExpWithLevel(templet, self._limitLevel)

	self:_updateAttrData()
	self:_recordAddedLevel()
	self:_recordAddedExp()
	G_UserData:getAttr():recordPower()
end

function HeroTrainUpgradeLayer:_updateAttrData()
	local config = self._heroUnitData:getConfig()
	local curLevel = self._heroUnitData:getLevel()
	self._curAttrData = UserDataHelper.getBasicAttrWithLevel(config, curLevel)
	self._nextAttrData = UserDataHelper.getBasicAttrWithLevel(config, curLevel + 1)
	self._recordAttr:updateData(self._curAttrData)
end

function HeroTrainUpgradeLayer:_createPageItem()
	local widget = ccui.Widget:create()
	widget:setSwallowTouches(false)
	widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)

	return widget
end

function HeroTrainUpgradeLayer:_updatePageItem()
	local allHeroIds = self._parentView:getAllHeroIds()
	local index = self._parentView:getSelectedPos()
	for i = index-1, index+1 do
		if i >= 1 and i <= #allHeroIds then
			if self._pageItems[i] == nil then
				local widget = self:_createPageItem()
		        self._pageView:addPage(widget)
		        self._pageItems[i] = {widget = widget}
			end
			if self._pageItems[i].avatar == nil then
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
				avatar:setScale(1.4)
				avatar:setPosition(cc.p(self._pageViewSize.width*0.57, 192))
				self._pageItems[i].widget:addChild(avatar)
				self._pageItems[i].avatar = avatar
			end
			local heroId = allHeroIds[i]
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)
			local limitLevel = avatarLimitLevel or unitData:getLimit_level()
			local limitRedLevel = arLimitLevel or unitData:getLimit_rtg()
			self._pageItems[i].avatar:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
		end
	end
end

function HeroTrainUpgradeLayer:_initPageView()
	self._pageItems = {}

	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self,self._onPageViewEvent))
    self._pageViewSize = self._pageView:getContentSize()

	self._pageView:removeAllPages()
	local heroCount = self._parentView:getHeroCount()
    for i = 1, heroCount do
    	local widget = self:_createPageItem()
        self._pageView:addPage(widget)
        self._pageItems[i] = {widget = widget}
    end
end

function HeroTrainUpgradeLayer:_onPageViewEvent(sender,event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		local selectedPos = self._parentView:getSelectedPos()
		if targetPos ~= selectedPos then
			self._parentView:setSelectedPos(targetPos)
			local allHeroIds = self._parentView:getAllHeroIds()
			local curHeroId = allHeroIds[targetPos]
			G_UserData:getHero():setCurHeroId(curHeroId)
			self._parentView:updateArrowBtn()
			self:_updateData()
			self:_updateView()
			self:_updatePageItem()
			self._parentView:updateTabIcons()
		end
	end
end

function HeroTrainUpgradeLayer:_updateView()
	self:_updateBaseInfo()
	self:_updateLoadingBar()
	self:_updateLevel()
	self:_updateAttr()
	self:_updateCost()
end

function HeroTrainUpgradeLayer:_updateBaseInfo()
	local heroBaseId = self._heroUnitData:getBase_id()
	local rankLevel = self._heroUnitData:getRank_lv()
	local limitLevel = self._heroUnitData:getLimit_level()
	local limitRedLevel = self._heroUnitData:getLimit_rtg()
	self._fileNodeCountry:updateUI(heroBaseId)
	self._fileNodeHeroName:setName(heroBaseId, rankLevel, limitLevel, nil, limitRedLevel)
	self._fileNodeHeroName2:setName(heroBaseId, rankLevel, limitLevel, nil, limitRedLevel)

	self:setButtonEnable(true)
end

--进度条
function HeroTrainUpgradeLayer:_updateLoadingBar(withAni)
	local level = self._heroUnitData:getLevel()
	self._textLevel:setString(Lang.get("hero_upgrade_txt_level", {level = level}))

	local heroConfig = self._heroUnitData:getConfig()
	local templet = heroConfig.lvup_cost
	local needCurExp = UserDataHelper.getHeroLevelUpExp(level, templet)
	local nowExp = self._heroUnitData:getExp() - UserDataHelper.getHeroNeedExpWithLevel(templet, level)
	if self._isLeader then
		nowExp = G_UserData:getBase():getExp()
		needCurExp = UserDataHelper.getUserLevelUpExp()
	end
	local percent = nowExp / needCurExp * 100
	self._loadingBarExp:setPercent(percent)

	if withAni then --播滚动动画
		local lastValue = tonumber(self._textExpPercent1:getString())
		if nowExp ~= lastValue then
			self._textExpPercent2:doScaleAnimation()
		end
		self._textExpPercent1:updateTxtValue(nowExp)
	else
		self._textExpPercent1:setString(nowExp)
	end
	self._textExpPercent2:setString("/"..needCurExp)
end

--等级
function HeroTrainUpgradeLayer:_updateLevel()
	local level = self._heroUnitData:getLevel()
	self._textOldLevel1:setString(level)
	self._textOldLevel2:setString("/"..self._limitLevel)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))
	
	self._textNewLevel:setString((level+1).."/"..self._limitLevel)
end

--属性
function HeroTrainUpgradeLayer:_updateAttr()
	self._fileNodeAttr1:updateInfo(AttributeConst.ATK, self._curAttrData[AttributeConst.ATK], self._nextAttrData[AttributeConst.ATK], 4)
	self._fileNodeAttr2:updateInfo(AttributeConst.HP, self._curAttrData[AttributeConst.HP], self._nextAttrData[AttributeConst.HP], 4)
	self._fileNodeAttr3:updateInfo(AttributeConst.PD, self._curAttrData[AttributeConst.PD], self._nextAttrData[AttributeConst.PD], 4)
	self._fileNodeAttr4:updateInfo(AttributeConst.MD, self._curAttrData[AttributeConst.MD], self._nextAttrData[AttributeConst.MD], 4)
end

--花费
function HeroTrainUpgradeLayer:_updateCost()
	if self._isLeader then
		self._panelMaterial:setVisible(false)
		self._panelButton:setVisible(false)
		self._panelLeader:setVisible(true)
	else
		self._panelLeader:setVisible(false)
		self._panelMaterial:setVisible(true)
		self._panelButton:setVisible(true)
		for i = 1, 4 do
			self["_fileNodeMaterial"..i]:updateCount()
		end
	end
end

function HeroTrainUpgradeLayer:_onStartCallback(itemId, count)
	self._materialFakeCount = count
	self._materialFakeCostCount = 0
	self._fakeCurExp = self._heroUnitData:getExp()
	self._fakeLevel = self._heroUnitData:getLevel()
	self._fakeCurAttrData = self._curAttrData
	self._fakeNextAttrData = self._nextAttrData
end

function HeroTrainUpgradeLayer:_onStopCallback()
	self._labelCount:setVisible(false)
end

function HeroTrainUpgradeLayer:_onStepClickMaterialIcon(itemId, itemValue)
	if self._materialFakeCount <= 0 then
		return false
	end
	if self._fakeCurExp >= self._limitExp then
		return false
	end

	self._materialFakeCount = self._materialFakeCount - 1
	self._materialFakeCostCount = self._materialFakeCostCount + 1
	self._fakeCurExp = self._fakeCurExp + itemValue
	self:_fakeUpdateView(itemId)
	self:_fakePlayEffect(itemId)

	return true
end

--假的刷新界面，根据客户端自己算的数据
function HeroTrainUpgradeLayer:_fakeUpdateView(itemId)
	local heroConfig = self._heroUnitData:getConfig()
	local templet = heroConfig.lvup_cost

	self._fakeLevel = UserDataHelper.getCanReachLevelWithExp(self._fakeCurExp, templet)
	self._textLevel:setString(Lang.get("hero_upgrade_txt_level", {level = self._fakeLevel}))

	--xN
	self._labelCount:setString("+"..self._materialFakeCostCount)
	self._labelCount:setVisible(self._materialFakeCostCount > 1)

	--进度条
	local needCurExp = UserDataHelper.getHeroLevelUpExp(self._fakeLevel, templet)
	local nowExp = self._fakeCurExp - UserDataHelper.getHeroNeedExpWithLevel(templet, self._fakeLevel)
	local percent = nowExp / needCurExp * 100
	self._loadingBarExp:setPercent(percent)
	self._textExpPercent1:updateTxtValue(nowExp)
	self._textExpPercent2:setString("/"..needCurExp)
	self._textExpPercent2:doScaleAnimation()

	--等级
	self._textOldLevel1:setString(self._fakeLevel)
	self._textOldLevel2:setString("/"..self._limitLevel)
	local posX = self._textOldLevel1:getPositionX()
	local posY = self._textOldLevel1:getPositionY()
	local size1 = self._textOldLevel1:getContentSize()
	self._textOldLevel2:setPosition(cc.p(posX + size1.width, posY))
	self._textNewLevel:setString((self._fakeLevel+1).."/"..self._limitLevel)

	--属性
	self._fakeCurAttrData = UserDataHelper.getBasicAttrWithLevel(heroConfig, self._fakeLevel)
	self._fakeNextAttrData = UserDataHelper.getBasicAttrWithLevel(heroConfig, self._fakeLevel + 1)
	self._fileNodeAttr1:updateInfo(AttributeConst.ATK, self._fakeCurAttrData[AttributeConst.ATK], self._fakeNextAttrData[AttributeConst.ATK], 4)
	self._fileNodeAttr2:updateInfo(AttributeConst.HP, self._fakeCurAttrData[AttributeConst.HP], self._fakeNextAttrData[AttributeConst.HP], 4)
	self._fileNodeAttr3:updateInfo(AttributeConst.PD, self._fakeCurAttrData[AttributeConst.PD], self._fakeNextAttrData[AttributeConst.PD], 4)
	self._fileNodeAttr4:updateInfo(AttributeConst.MD, self._fakeCurAttrData[AttributeConst.MD], self._fakeNextAttrData[AttributeConst.MD], 4)

	--消耗
	local index = ITEM_ID_2_MATERICAL_INDEX[itemId]
	self["_fileNodeMaterial"..index]:setCount(self._materialFakeCount)
end

function HeroTrainUpgradeLayer:_fakePlayEffect(itemId)
	self:_playSingleBallEffect(itemId, true)
end

function HeroTrainUpgradeLayer:_onClickMaterialIcon(materials)
	if self:_checkLimitLevel() == false then
		return
	end
	if self:_checkMaterials(materials) == false then
		return
	end
	self:_doUpgrade(materials)
end

--检查等级限制
function HeroTrainUpgradeLayer:_checkLimitLevel()
	local level = self._heroUnitData:getLevel()
	if level >= self._limitLevel then
		G_Prompt:showTip(Lang.get("hero_upgrade_level_limit_tip"))
		return false
	end
	return true
end

--获取一键升级需要的材料
function HeroTrainUpgradeLayer:_getUpgradeMaterials(level)
	local templet = self._heroUnitData:getConfig().lvup_cost
	local curLevel = self._heroUnitData:getLevel()
	local targetLevel = math.min(curLevel+level, self._limitLevel)
	local curExp = clone(self._heroUnitData:getExp())
	local targetExp = UserDataHelper.getHeroNeedExpWithLevel(templet, targetLevel)

	local materials = {}
	local reach = false --是否达到限制
	for i = 1, 4 do
		local itemId = self["_fileNodeMaterial"..i]:getItemId()
		local expValue = self["_fileNodeMaterial"..i]:getItemValue()
		local count = self["_fileNodeMaterial"..i]:getCount()
		local item = {id = itemId, num = 0}
		for j = 1, count do
			curExp = curExp + expValue
			item.num = item.num + 1
			if curExp >= targetExp then
				reach = true
				break
			end
		end
		if item.num > 0 then
			table.insert(materials, item)
		end
		if reach then
			break
		end
	end

	return materials
end

function HeroTrainUpgradeLayer:_onButtonUpgradeOneClicked()
	if self:_checkLimitLevel() == false then
		return
	end

	local materials = self:_getUpgradeMaterials(1)
	if self:_checkMaterials(materials) == false then
		return
	end
	self:_doUpgrade(materials)
	self:setButtonEnable(false)
end

function HeroTrainUpgradeLayer:_onButtonUpgradeFiveClicked()
	if self:_checkLimitLevel() == false then
		return
	end

	local materials = self:_getUpgradeMaterials(5)
	if self:_checkMaterials(materials) == false then
		return
	end
	self:_doUpgrade(materials)
	self:setButtonEnable(false)
end

function HeroTrainUpgradeLayer:_checkMaterials(materials)
	if #materials == 0 then
		local popup = require("app.ui.PopupItemGuider").new()
		popup:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HERO_LEVELUP_MATERIAL_3)
		popup:openWithAction()
		return false
	else
		return true
	end
end

function HeroTrainUpgradeLayer:_doUpgrade(materials)
	local heroId = self._heroUnitData:getId()
	G_UserData:getHero():c2sHeroLevelUp(heroId, materials)
	self._costMaterials = materials
end

function HeroTrainUpgradeLayer:setButtonEnable(enable)
	self._buttonUpgradeOne:setEnabled(enable)
	self._buttonUpgradeFive:setEnabled(enable)
	self._pageView:setEnabled(enable)
	if self._parentView and self._parentView.setArrowBtnEnable then
		self._parentView:setArrowBtnEnable(enable)
	end
end

function HeroTrainUpgradeLayer:_onHeroLevelUpSuccess()
	self:_updateData()
	self:_updateCost()
	if self._parentView and self._parentView.checkRedPoint then
		self._parentView:checkRedPoint(1)
		self._parentView:checkRedPoint(2)
		self._parentView:checkRedPoint(3)
	end

	if self._materialFakeCount == 0 then --如果假球已经飞过了，就不再播球了，直接播剩下的特效和飘字
		self._materialFakeCount = nil
        self:_playExplodeEffect()
		self:_playPrompt()
		self:setButtonEnable(true)
		return
	end

	for i, material in ipairs(self._costMaterials) do
		local itemId = material.id
		if i == #self._costMaterials then --最后一个球，结束时播爆炸特效并飘字
			self:_playSingleBallEffect(itemId, true, true)
		else
			self:_playSingleBallEffect(itemId)
		end
	end
end

--====================================特效部分==========================================
--isPlayFinishEffect,是否播结束特效
--isPlayPrompt,是否结束播飘字
function HeroTrainUpgradeLayer:_playSingleBallEffect(itemId, isPlayFinishEffect, isPlayPrompt)
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
	local color = param.cfg.color
	local sp = display.newSprite(Path.getBackgroundEffect("img_photosphere"..color))
	local emitter = cc.ParticleSystemQuad:create("particle/particle_touch.plist")
	if emitter then
		emitter:setPosition(cc.p(sp:getContentSize().width / 2, sp:getContentSize().height / 2))
        sp:addChild(emitter)
        emitter:resetSystem()
    end

    local index = ITEM_ID_2_MATERICAL_INDEX[itemId]
    local startPos = UIHelper.convertSpaceFromNodeToNode(self["_fileNodeMaterial"..index], self)
    sp:setPosition(startPos)
    self:addChild(sp)
    local curSelectedPos = self._parentView:getSelectedPos()
    local curAvatar = self._pageItems[curSelectedPos].avatar
    local endPos = UIHelper.convertSpaceFromNodeToNode(curAvatar, self, cc.p(0, curAvatar:getHeight() / 2)) --飞到中心点
    local pointPos1 = cc.p(startPos.x, startPos.y + 200)
    local pointPos2 = cc.p((startPos.x + endPos.x) / 2, startPos.y + 100)
    local bezier = {
	    pointPos1,
	    pointPos2,
	    endPos,
	}
	local action1 = cc.BezierTo:create(0.7, bezier)
	local action2 = cc.EaseSineIn:create(action1)
	sp:runAction(cc.Sequence:create(
            action2,
            cc.CallFunc:create(function()
            	if isPlayFinishEffect then
            		self:_playExplodeEffect()
            	end
            	if isPlayPrompt then
            		self:_playPrompt()
            		self:setButtonEnable(true)	
            	end
            end),
            cc.RemoveSelf:create()
        )
	)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_LV)
end

function HeroTrainUpgradeLayer:_playExplodeEffect()
	local effect1 = EffectGfxNode.new("effect_wujianglevelup_baozha")
	local effect2 = EffectGfxNode.new("effect_wujianglevelup_light")
	effect1:setAutoRelease(true)
	effect2:setAutoRelease(true)
	self._nodeEffect:addChild(effect1)
	self._nodeEffect:addChild(effect2)
    effect1:play()
    effect2:play()
end

--=========================飘字部分========================================

--记录增加的等级
function HeroTrainUpgradeLayer:_recordAddedLevel()
	local level = self._heroUnitData:getLevel()
	self._diffLevel = level - self._lastLevel
	self._lastLevel = level
end

--记录增加的经验
function HeroTrainUpgradeLayer:_recordAddedExp()
	local level = self._heroUnitData:getLevel()
	local heroConfig = self._heroUnitData:getConfig()
	local templet = heroConfig.lvup_cost
	local nowExp = self._heroUnitData:getExp() - UserDataHelper.getHeroNeedExpWithLevel(templet, level)
	if self._isLeader then
		nowExp = G_UserData:getBase():getExp()
	end

	self._diffExp = nowExp - self._lastExp
	self._lastExp = nowExp
end

function HeroTrainUpgradeLayer:_playPrompt()
    local summary = {}
    if self._diffLevel == 0 then
    	local content = Lang.get("summary_hero_exp_add", {value = self._diffExp})
    	local param = {
    		content = content,
    		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
    		dstPosition = UIHelper.convertSpaceFromNodeToNode(self._textExpPercent1, self),
    		finishCallback = function()
    			self:_updateLoadingBar(true)
    		end
    	} 
		table.insert(summary, param)
    else
    	local content1 = Lang.get("summary_hero_levelup")
    	local param1 = {
    		content = content1,
    		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
    		dstPosition = UIHelper.convertSpaceFromNodeToNode(self._textOldLevel1, self),
    		finishCallback = function()
    			if self._textOldLevel1 and self._updateLevel then
    				self:_updateLoadingBar(true)
    				self._textOldLevel1:updateTxtValue(self._heroUnitData:getLevel())
    				self:_updateLevel()
    				self:_onSummaryFinish()
    			end
    		end
    	} 
		table.insert(summary, param1)

		--提示可以突破
		local rankMax = UserDataHelper.getHeroBreakMaxLevel(self._heroUnitData)
		if self._heroUnitData:getRank_lv() < rankMax then
			local heroBaseId = self._heroUnitData:getBase_id()
			local limitLevel = self._heroUnitData:getLimit_level()
			local limitRedLevel = self._heroUnitData:getLimit_rtg()
			local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
			local desNode = self:getParent():getParent():getSubNodeByName("_nodeTabIcon2")
			local content2 = Lang.get("summary_hero_can_break", {
					name = heroParam.name,
					color = Colors.colorToNumber(heroParam.icon_color),
					outlineColor = Colors.colorToNumber(heroParam.icon_color_outline),
					value = rankMax,
				})
	    	local param2 = {
	    		content = content2,
	    		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN},
	    		dstPosition = UIHelper.convertSpaceFromNodeToNode(desNode, self),
	    	} 
			table.insert(summary, param2)
		end
		

		--属性飘字
		self:_addBaseAttrPromptSummary(summary)
    end

    G_Prompt:showSummary(summary)

	--总战力
	G_Prompt:playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN)
end

--加入基础属性飘字内容
function HeroTrainUpgradeLayer:_addBaseAttrPromptSummary(summary)
	local attr = self._recordAttr:getAttr()
	local desInfo = TextHelper.getAttrInfoBySort(attr)
	for i, info in ipairs(desInfo) do
		local attrId = info.id
		local diffValue = self._recordAttr:getDiffValue(attrId)
		if diffValue ~= 0 then
			local param = {
				content = AttrDataHelper.getPromptContent(attrId, diffValue),
				anchorPoint = cc.p(0, 0.5),
				startPosition = {x = UIConst.SUMMARY_OFFSET_X_TRAIN+UIConst.SUMMARY_OFFSET_X_ATTR},
				dstPosition = UIHelper.convertSpaceFromNodeToNode(self["_fileNodeAttr"..i], self),
				finishCallback = function()
					local _, curValue = TextHelper.getAttrBasicText(attrId, self._curAttrData[attrId])
					self["_fileNodeAttr"..i]:getSubNodeByName("TextCurValue"):updateTxtValue(curValue)
					self["_fileNodeAttr"..i]:updateInfo(attrId, self._curAttrData[attrId], self._nextAttrData[attrId], 4)
				end,
			}
			table.insert(summary, param)
		end
	end

	return summary
end

--武将升级飘字结束后的回调
function HeroTrainUpgradeLayer:_onSummaryFinish()
	--升级特效结束后，通知新手步骤
	self:runAction(cc.Sequence:create(
			cc.DelayTime:create(0.3),
			cc.CallFunc:create(function()
				G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
			end)
		)
	)
end

--
function HeroTrainUpgradeLayer:_clearTextSummary()
	local runningScene = G_SceneManager:getRunningScene()
	runningScene:clearTextSummary()
end

return HeroTrainUpgradeLayer