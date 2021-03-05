--
-- Author: Liangxu
-- Date: 2017-02-28 17:24:00
-- 武将详情 基础属性模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroDetailAttrModule = class("HeroDetailAttrModule", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local HeroConst = require("app.const.HeroConst")
local AttributeConst = require("app.const.AttributeConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function HeroDetailAttrModule:ctor(heroUnitData, rangeType, isPure)
	self._heroUnitData = heroUnitData
	self._rangeType = rangeType
	self._isPure = isPure

	local resource = {
		file = Path.getCSB("HeroDetailAttrModule", "hero"),
		binding = {
			_buttonUpgrade = {
				events = {{event = "touch", method = "_onButtonUpgradeClicked"}}
			},
			_buttonBreak = {
				events = {{event = "touch", method = "_onButtonBreakClicked"}}
			},
			_buttonAwake = {
				events = {{event = "touch", method = "_onButtonAwakeClicked"}}
			},
			_buttonLimit = {
				events = {{event = "touch", method = "_onButtonLimitClicked"}}
			},
			_buttonGold = {
				events = {{event = "touch", method = "_onButtonGoldClicked"}}
			}
		}
	}
	self:setName("HeroDetailAttrModule")
	HeroDetailAttrModule.super.ctor(self, resource)
end

function HeroDetailAttrModule:onCreate()
	self._panelBg:setSwallowTouches(false)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("hero_detail_title_attr"))
	self._nodeLevel:setFontSize(20)
	self._buttonGold:setString(Lang.get("goldenhero_train_button_text"))
	self._buttonUpgrade:setString(Lang.get("hero_detail_btn_upgrade"))
	self._buttonBreak:setString(Lang.get("hero_detail_btn_break"))
	self._buttonAwake:setString(Lang.get("hero_detail_btn_awake"))
	self._buttonLimit:setString(Lang.get("hero_detail_btn_limit"))

	self._nodeBottom:setVisible(false)
	self:_doLayout()
	self:update(self._heroUnitData)
end

function HeroDetailAttrModule:update(heroUnitData)
	local level = heroUnitData:getLevel() --等级
	local maxLevel = G_UserData:getBase():getLevel()
	local param = {
		heroUnitData = heroUnitData
	}
	local attrInfo = UserDataHelper.getTotalAttr(param)

	local rank = heroUnitData:getRank_lv()
	if heroUnitData:isPureGoldHero() then
		self._nodeLevel:updateUI(Lang.get("goldenhero_train_des_new"), rank, rank)
		self._nodeLevel:setMaxValue("")
	else
		self._nodeLevel:updateUI(Lang.get("team_detail_des_level_new"), level, maxLevel)
		self._nodeLevel:setMaxValue("/" .. maxLevel)
	end
	self._nodeAttr1:updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], nil, 4)
	self._nodeAttr2:updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], nil, 4)
	self._nodeAttr3:updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], nil, 4)
	self._nodeAttr4:updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], nil, 4)

	self:_checkUpgradeRedPoint(heroUnitData)
	self:_checkBreakRedPoint(heroUnitData)
	self:_checkAwakeRedPoint(heroUnitData)
	self:_checkLimitRedPoint(heroUnitData)
	self:_checkGoldRankRedPoint(heroUnitData)
end

function HeroDetailAttrModule:_onButtonUpgradeClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE1)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local heroId = self._heroUnitData:getId()
	G_SceneManager:showScene("heroTrain", heroId, HeroConst.HERO_TRAIN_UPGRADE, self._rangeType, true)
end

function HeroDetailAttrModule:_onButtonBreakClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE2)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local heroId = self._heroUnitData:getId()
	G_SceneManager:showScene("heroTrain", heroId, HeroConst.HERO_TRAIN_BREAK, self._rangeType, true)
end

function HeroDetailAttrModule:_onButtonAwakeClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local heroId = self._heroUnitData:getId()
	G_SceneManager:showScene("heroTrain", heroId, HeroConst.HERO_TRAIN_AWAKE, self._rangeType, true)
end

function HeroDetailAttrModule:_onButtonLimitClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE4)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local heroId = self._heroUnitData:getId()
	G_SceneManager:showScene("heroTrain", heroId, HeroConst.HERO_TRAIN_LIMIT, self._rangeType, true)
end

function HeroDetailAttrModule:_onButtonGoldClicked()
	local heroId = self._heroUnitData:getId()
	G_SceneManager:showScene("heroGoldTrain", heroId)
end

function HeroDetailAttrModule:_checkUpgradeRedPoint(heroUnitData)
	if heroUnitData:getConfig().type ~= 1 then
		local RedPointHelper = require("app.data.RedPointHelper")
		local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, heroUnitData)
		self._buttonUpgrade:showRedPoint(reach)
	end
end

function HeroDetailAttrModule:_checkBreakRedPoint(heroUnitData)
	local RedPointHelper = require("app.data.RedPointHelper")
	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, heroUnitData)
	self._buttonBreak:showRedPoint(reach)
end

function HeroDetailAttrModule:_checkAwakeRedPoint(heroUnitData)
	local RedPointHelper = require("app.data.RedPointHelper")
	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, heroUnitData)
	self._buttonAwake:showRedPoint(reach)
end

function HeroDetailAttrModule:_checkLimitRedPoint(heroUnitData)
	local RedPointHelper = require("app.data.RedPointHelper")
	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE4, heroUnitData)
	self._buttonLimit:showRedPoint(reach)
end

function HeroDetailAttrModule:_checkGoldRankRedPoint(heroUnitData)
	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	local reach = HeroGoldHelper.heroGoldNeedRedPoint(heroUnitData)
	self._buttonGold:showRedPoint(reach)
end

function HeroDetailAttrModule:_doLayout()
	if self._isPure then
		self:_pureLayout()
	else
		self:_normalLayout()
	end
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
end

function HeroDetailAttrModule:_normalLayout()
	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	local isGold = HeroGoldHelper.isPureHeroGold(self._heroUnitData)
	self._buttonGold:setVisible(isGold)
	self._buttonGold:setPositionY(37)
	local showUpgrade = self._heroUnitData:getConfig().type ~= 1 and not isGold
	self._buttonUpgrade:setVisible(showUpgrade)

	local showBreak = self._heroUnitData:isCanBreak() and not isGold
	self._buttonBreak:setVisible(showBreak)

	local canAwake = self._heroUnitData:isCanAwake() and not isGold
	local awakeIsOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
	local showAwake = canAwake and awakeIsOpen
	self._buttonAwake:setVisible(showAwake)

	local canLimit, limitType = self._heroUnitData:isCanLimitBreak()
	canLimit = canLimit and not isGold
	local funcLimitType = FunctionConst.FUNC_HERO_TRAIN_TYPE4
	local funcLimitType2 = funcLimitType
	if limitType==HeroConst.HERO_LIMIT_TYPE_GOLD then
		funcLimitType = FunctionConst.FUNC_HERO_TRAIN_TYPE4_RED
	end
	local limitIsOpen = LogicCheckHelper.funcIsOpened(funcLimitType)
	local showLimit = canLimit and limitIsOpen
	
	self._buttonLimit:setVisible(showLimit)

	local dynamicBtns = {} --需要动态排版的按钮
	local showCount = 0
	if showUpgrade then
		showCount = showCount + 1
	end
	if showBreak then
		showCount = showCount + 1
	end
	if showAwake then
		showCount = showCount + 1
		local funcLevelInfo = require("app.config.function_level").get(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
		assert(funcLevelInfo, "Invalid function_level can not find funcId " .. FunctionConst.FUNC_HERO_TRAIN_TYPE3)
		table.insert(dynamicBtns, {btn = self._buttonAwake, displayOpenLevel=funcLevelInfo.level, openLevel = funcLevelInfo.level})
	end
	if showLimit then
		showCount = showCount + 1
		local funcLevelInfo = require("app.config.function_level").get(funcLimitType)
		assert(funcLevelInfo, "Invalid function_level can not find funcId " .. funcLimitType)
		local funcLevelInfo2 = require("app.config.function_level").get(funcLimitType2)
		assert(funcLevelInfo2, "Invalid function_level can not find funcId " .. funcLimitType2)
		-- 保持原有的顺序，界限在觉醒之前
		table.insert(dynamicBtns, {btn = self._buttonLimit, displayOpenLevel=funcLevelInfo2.level, openLevel = funcLevelInfo.level})
	end

	table.sort(
		dynamicBtns,
		function(a, b)
			return a.displayOpenLevel < b.displayOpenLevel
		end
	)

	if showCount > 3 then
		self._panelBg:setContentSize(cc.size(402, 284))
		self._nodeTitle:setPositionY(262)
		self._nodeLevel:setPositionY(213)
		self._nodeAttr1:setPositionY(182)
		self._nodeAttr2:setPositionY(182)
		self._nodeAttr3:setPositionY(153)
		self._nodeAttr4:setPositionY(153)
		self._buttonUpgrade:setPositionY(95)
		self._buttonBreak:setPositionY(95)
		if dynamicBtns[1] then
			dynamicBtns[1].btn:setPosition(cc.p(334, 95))
		end
		if dynamicBtns[2] then
			dynamicBtns[2].btn:setPosition(cc.p(70, 37))
		end
	else
		self._panelBg:setContentSize(cc.size(402, 226))
		self._nodeTitle:setPositionY(204)
		self._nodeLevel:setPositionY(155)
		self._nodeAttr1:setPositionY(124)
		self._nodeAttr2:setPositionY(124)
		self._nodeAttr3:setPositionY(95)
		self._nodeAttr4:setPositionY(95)
		self._buttonUpgrade:setPositionY(37)
		self._buttonBreak:setPositionY(37)
		if dynamicBtns[1] then
			dynamicBtns[1].btn:setPosition(cc.p(334, 37))
		end
	end
end

function HeroDetailAttrModule:showAttrBottom(attr)
	local offsetY = 80
	local size = self._panelBg:getContentSize()
	size.height = size.height + offsetY
	self._panelBg:setContentSize(size)
	self._nodeBottom:setVisible(true)
	self._nodeTop:setPositionY(self._nodeTop:getPositionY() + offsetY)
	self._nodeBottom:setPositionY(self._nodeBottom:getPositionY() - 100)
	self._nodeAttr6:updateView(AttributeConst.ATK_PER, attr[AttributeConst.ATK_PER], nil, 4)
	self._nodeAttr7:updateView(AttributeConst.PD_PER, attr[AttributeConst.PD_PER], nil, 4)
	self._nodeAttr8:updateView(AttributeConst.MD_PER, attr[AttributeConst.MD_PER], nil, 4)
	self._nodeAttr9:updateView(AttributeConst.HP_PER, attr[AttributeConst.HP_PER], nil, 4)
end

function HeroDetailAttrModule:reUpdateAttr(attrInfo)
	self._nodeAttr1:updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], nil, 4)
	self._nodeAttr2:updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], nil, 4)
	self._nodeAttr3:updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], nil, 4)
	self._nodeAttr4:updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], nil, 4)
end

function HeroDetailAttrModule:_pureLayout()
	self._buttonGold:setVisible(false)
	self._buttonUpgrade:setVisible(false)
	self._buttonBreak:setVisible(false)
	self._buttonAwake:setVisible(false)
	self._buttonLimit:setVisible(false)
	self._nodeTitle:setPositionY(134)
	self._nodeLevel:setPositionY(92)
	self._nodeAttr1:setPositionY(61)
	self._nodeAttr2:setPositionY(61)
	self._nodeAttr3:setPositionY(32)
	self._nodeAttr4:setPositionY(32)
	self._panelBg:setContentSize(cc.size(402, 156))
end

function HeroDetailAttrModule:getPanelSize()
	return self._panelBg:getContentSize()
end

return HeroDetailAttrModule
