--
-- Author: hedili
-- Date: 2018-01-24 17:24:00
-- 神兽详情 基础属性模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PetDetailAttrModule = class("PetDetailAttrModule", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local PetConst = require("app.const.PetConst")
local AttributeConst = require("app.const.AttributeConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

local TWO_BUTTON_POSX = {116.00, 282.93}
local THREE_BUTTON_POSX = {70.00, 200.78, 332.00}

function PetDetailAttrModule:ctor(petUnitData, rangeType)
	self._petUnitData = petUnitData
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("PetDetailAttrModule", "pet"),
		binding = {
			_buttonUpgrade = {
				events = {{event = "touch", method = "_onButtonUpgradeClicked"}}
			},
			_buttonBreak = {
				events = {{event = "touch", method = "_onButtonBreakClicked"}}
			},
			_buttonLimit = {
				events = {{event = "touch", method = "_onButtonLimitClicked"}}
			}
		}
	}
	self:setName("PetDetailAttrModule")
	PetDetailAttrModule.super.ctor(self, resource)
end

function PetDetailAttrModule:showButton(needShow)
	if needShow == nil or needShow == false then
		self._buttonUpgrade:setVisible(false)
		self._buttonBreak:setVisible(false)
		self._buttonLimit:setVisible(false)
	else
		self._buttonUpgrade:setVisible(true)
		self._buttonBreak:setVisible(true)
		local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
		local isOpen = PetTrainHelper.canShowLimitBtn(self._petUnitData)
		--界限突破成功后也要显示按钮
		self._buttonLimit:setVisible(isOpen)
		self:_reSetButtonPosX(true)
	end
	self:_arrangePanel()
end

function PetDetailAttrModule:_reSetButtonPosX(isThree)
	if isThree then
		self._buttonUpgrade:setPositionX(THREE_BUTTON_POSX[1])
		self._buttonBreak:setPositionX(THREE_BUTTON_POSX[2])
		self._buttonLimit:setPositionX(THREE_BUTTON_POSX[3])
	else
		self._buttonUpgrade:setPositionX(TWO_BUTTON_POSX[1])
		self._buttonBreak:setPositionX(TWO_BUTTON_POSX[2])
	end
end

function PetDetailAttrModule:onCreate()
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)

	self._panelBg:setSwallowTouches(false)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("hero_detail_title_attr"))
	self._nodeLevel:setFontSize(20)
	self._buttonUpgrade:setString(Lang.get("hero_detail_btn_upgrade"))
	self._buttonBreak:setString(Lang.get("pet_detail_btn_star"))
	self._buttonLimit:setString(Lang.get("pet_detail_btn_limit"))
	self:update(self._petUnitData)
	self:showButton(false)
end

function PetDetailAttrModule:_creatRichText(content)
	-- body
	local label = ccui.RichText:create()
	label:setRichText(content)
	label:setAnchorPoint(cc.p(0, 1))
	label:ignoreContentAdaptWithSize(false)
	label:setContentSize(cc.size(360, 0))
	label:formatText()

	return label
end
function PetDetailAttrModule:_arrangePanel(...)
	-- body
	local PetDataHelper = require("app.utils.data.PetDataHelper")
	self._nodeRichDesc:removeAllChildren()
	if self._attrInfo == nil then
		return
	end
	local blessRate = self._attrInfo[AttributeConst.PET_BLESS_RATE] / 1000 * 100
	if self._buttonUpgrade:isVisible() == true then
		self._nodePanel:setPositionY(60)
		self._panelBg:setContentSize(cc.size(402, 286))
		local percent = PetDataHelper.getParameterValue("pet_huyou_percent") / 10
		local desc = Lang.get("pet_attr_pend_desc", {num = percent})
		local richContent = PetDataHelper.convertAttrAppendDesc(desc, blessRate)
		local widget = self:_creatRichText(richContent)
		self._nodeRichDesc:addChild(widget)
	else
		self._nodePanel:setPositionY(0)
		self._panelBg:setContentSize(cc.size(402, 226))
		local percent = PetDataHelper.getParameterValue("pet_huyou_percent") / 10
		local desc = Lang.get("pet_attr_pend_desc", {num = percent})
		local richContent = PetDataHelper.convertAttrAppendDesc(desc, blessRate)
		local widget = self:_creatRichText(richContent)
		self._nodeRichDesc:addChild(widget)
	end

	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
end
function PetDetailAttrModule:update(petUnitData)
	local heroConfig = petUnitData:getConfig()
	local level = petUnitData:getLevel() --等级
	local maxLevel = G_UserData:getBase():getLevel()
	local param = {
		unitData = petUnitData
	}

	local attrInfo = UserDataHelper.getPetTotalAttr(param)

	self._attrInfo = attrInfo
	self._nodeLevel:updateUI(Lang.get("hero_detail_txt_level"), level, maxLevel)
	self._nodeLevel:setMaxValue("/" .. maxLevel)
	self._nodeAttr1:updateView(AttributeConst.ATK_FINAL, attrInfo[AttributeConst.ATK_FINAL], nil, 4)
	self._nodeAttr2:updateView(AttributeConst.HP_FINAL, attrInfo[AttributeConst.HP_FINAL], nil, 4)
	self._nodeAttr3:updateView(AttributeConst.PD_FINAL, attrInfo[AttributeConst.PD_FINAL], nil, 4)
	self._nodeAttr4:updateView(AttributeConst.MD_FINAL, attrInfo[AttributeConst.MD_FINAL], nil, 4)

	self:_checkUpgradeRedPoint(petUnitData)
end

function PetDetailAttrModule:_onButtonUpgradeClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE1)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local petId = self._petUnitData:getId()
	G_SceneManager:showScene("petTrain", petId, PetConst.PET_TRAIN_UPGRADE, self._rangeType, true)
end

function PetDetailAttrModule:_onButtonBreakClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE2)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local petId = self._petUnitData:getId()
	G_SceneManager:showScene("petTrain", petId, PetConst.PET_TRAIN_STAR, self._rangeType, true)
end

function PetDetailAttrModule:_onButtonLimitClicked()
	local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE3)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	local petId = self._petUnitData:getId()
	G_SceneManager:showScene("petTrain", petId, PetConst.PET_TRAIN_LIMIT, self._rangeType, true)
end

function PetDetailAttrModule:_checkUpgradeRedPoint(petUnitData)
	local RedPointHelper = require("app.data.RedPointHelper")
	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, petUnitData)
	self._buttonUpgrade:showRedPoint(reach)

	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData)
	self._buttonBreak:showRedPoint(reach)

	local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, petUnitData)
	self._buttonLimit:showRedPoint(reach)
end

return PetDetailAttrModule
