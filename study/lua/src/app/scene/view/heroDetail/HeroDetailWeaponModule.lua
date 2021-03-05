--
-- Author: Liangxu
-- Date: 2017-03-01 19:46:33
-- 武将详情 神兵模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroDetailWeaponModule = class("HeroDetailWeaponModule", ListViewCellBase)
local AttributeConst = require("app.const.AttributeConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local InstrumentConst = require("app.const.InstrumentConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

local NORMAL_WIDTH = 80

function HeroDetailWeaponModule:ctor(heroUnitData)
	self._heroUnitData = heroUnitData
	local resource = {
		file = Path.getCSB("HeroDetailWeaponModule", "hero"),
		binding = {
			_buttonAdvance = {
				events = {{event = "touch", method = "_onButtonAdvanceClicked"}}
			}
		}
	}
	HeroDetailWeaponModule.super.ctor(self, resource)
end

function HeroDetailWeaponModule:onCreate()
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("hero_detail_title_weapon"))
	self._buttonAdvance:setString(Lang.get("hero_detail_btn_advance"))

	local baseId = self._heroUnitData:getConfig().instrument_id
	local level = 0
	local limitLevel = 0
	local attrInfo = {
		[AttributeConst.ATK] = 0,
		[AttributeConst.HP] = 0,
		[AttributeConst.PD] = 0,
		[AttributeConst.MD] = 0
	}
	local instrumentId = nil
	local heroUnitData = self._heroUnitData
	local pos = heroUnitData:getPos()
	if pos then
		instrumentId = G_UserData:getBattleResource():getResourceId(pos, 3, 1)
	end

	if instrumentId then
		local unitData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
		level = unitData:getLevel()
		limitLevel = unitData:getLimit_level()
		attrInfo = UserDataHelper.getInstrumentAttrInfo(unitData)
		self._buttonAdvance:setEnabled(true)
	else
		self._buttonAdvance:setEnabled(false)
	end

	self._instrumentId = instrumentId

	self._fileNodeIcon:updateUI(baseId, nil, limitLevel)
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, nil, nil, limitLevel)
	self._textName:setString(param.name)
	self._textName:setColor(param.icon_color)
	local UIHelper  = require("yoka.utils.UIHelper")
	UIHelper.updateTextOutline(self._textName, param)
	-- if param.color == 7 then
	-- 	self._textName:enableOutline(cc.c4b(param.icon_color_outline.r,
	-- 										param.icon_color_outline.g,
	-- 										param.icon_color_outline.b,
	-- 										param.icon_color_outline.a))
	-- end

	local label = nil
	local showId = AvatarDataHelper.getShowHeroBaseIdByCheck(self._heroUnitData)
	local description = AvatarDataHelper.getAvatarMappingConfig(showId).description
	if level >= param.unlock then
		local content =
			Lang.get(
			"instrument_detail_advance",
			{
				des = description,
				color = Colors.colorToNumber(Colors.BRIGHT_BG_GREEN)
			}
		)
		label = ccui.RichText:createWithContent(content)
	else
		local content =
			Lang.get(
			"instrument_detail_advance_unlock",
			{
				des = description,
				color = Colors.colorToNumber(Colors.BRIGHT_BG_TWO),
				level = param.unlock
			}
		)
		label = ccui.RichText:createWithContent(content)
	end
	label:setAnchorPoint(cc.p(0, 1))
	label:ignoreContentAdaptWithSize(false)
	label:setContentSize(cc.size(260, 0))
	label:formatText()
	self._nodeDesc:addChild(label)
	local virtualContentSize = label:getVirtualRendererSize()
	if virtualContentSize.height > NORMAL_WIDTH then
		local size = self._panelBg:getContentSize()
		local offsetY = (virtualContentSize.height - NORMAL_WIDTH) + 10
		size.height = size.height + offsetY
		self._panelBg:setContentSize(size)
		local posY = self._node:getPositionY()
		self._node:setPositionY(posY + offsetY)
		local btPosY = self._nodeBottom:getPositionY()
		self._nodeBottom:setPositionY(btPosY - offsetY)
	end

	self._textLevel:setString(Lang.get("hero_detail_instrument_advance_level", {level = level}))
	self._nodeAttr1:updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], nil, 4)
	self._nodeAttr2:updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], nil, 4)
	self._nodeAttr3:updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], nil, 4)
	self._nodeAttr4:updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], nil, 4)

	if not heroUnitData:isUserHero() then
		local size = self._panelBg:getContentSize()
		size.height = size.height - 54
		self._panelBg:setContentSize(size)
		local posY = self._node:getPositionY()
		self._node:setPositionY(posY - 54)
	end

	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
	self._buttonAdvance:setVisible(heroUnitData:isUserHero())
end

function HeroDetailWeaponModule:_onClickIcon1()
	local itemParam1 = self._fileNodeIcon:getItemParams()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(TypeConvertHelper.TYPE_EQUIPMENT, itemParam1.cfg.id)
	PopupItemGuider:openWithAction()
end

function HeroDetailWeaponModule:_onButtonAdvanceClicked()
	G_SceneManager:showScene(
		"instrumentTrain",
		self._instrumentId,
		InstrumentConst.INSTRUMENT_TRAIN_ADVANCE,
		InstrumentConst.INSTRUMENT_RANGE_TYPE_2
	)
end

return HeroDetailWeaponModule
