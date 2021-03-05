--
-- Author: hedl
-- Date: 2017-04-20 16:46:24
-- 装备详情
local ViewBase = require("app.ui.ViewBase")
local EquipDetailBaseView = class("EquipDetailBaseView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EquipDetailStrengthenNode = require("app.scene.view.equipmentDetail.EquipDetailStrengthenNode")
local EquipDetailSuitNode = require("app.scene.view.equipmentDetail.EquipDetailSuitNode")
local EquipDetailRefineNode = require("app.scene.view.equipmentDetail.EquipDetailRefineNode")
local EquipDetailBriefNode = require("app.scene.view.equipmentDetail.EquipDetailBriefNode")
local EquipDetailJadeNode = require("app.scene.view.equipmentJade.EquipDetailJadeNode")
local UserDataHelper = require("app.utils.UserDataHelper")
local EquipConst = require("app.const.EquipConst")
local UIHelper = require("yoka.utils.UIHelper")

function EquipDetailBaseView:ctor(equipData, rangeType)
	self._textName = nil --装备名称
	self._textPotential = nil --装备品级
	self._textDetailName = nil --装备详情头部的名称
	self._listView = nil --装备详情列表框

	self._equipData = equipData
	self._rangeType = rangeType or EquipConst.EQUIP_RANGE_TYPE_1

	local resource = {
		file = Path.getCSB("EquipDetailBaseView", "equipment"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {}
	}
	EquipDetailBaseView.super.ctor(self, resource)
end

function EquipDetailBaseView:onCreate()
	self:_updateInfo()
end

function EquipDetailBaseView:onEnter()
end

function EquipDetailBaseView:onExit()
end

function EquipDetailBaseView:_updateInfo()
	local equipData = self._equipData
	local equipBaseId = equipData:getBase_id()
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId)

	--名字
	local equipName = equipParam.name
	local rLevel = equipData:getR_level()
	if rLevel > 0 then
		equipName = equipName .. "+" .. rLevel
	end
	self._textName:setString(equipName)
	self._textName:setColor(equipParam.icon_color)
	-- self._textName:enableOutline(equipParam.icon_color_outline, 2)
	self._textDetailName:setString(equipName)
	self._textDetailName:setFontSize(22)
	self._textDetailName:setColor(equipParam.icon_color)
	UIHelper.updateTextOutline(self._textDetailName, equipParam)

	local heroUnitData = UserDataHelper.getHeroDataWithEquipId(equipData:getId())
	if heroUnitData == nil then
		self._textFrom:setVisible(false)
	else
		local baseId = heroUnitData:getBase_id()
		local limitLevel = heroUnitData:getLimit_level()
		local limitRedLevel = heroUnitData:getLimit_rtg()
		self._textFrom:setVisible(true)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
		self._textFrom:setString(Lang.get("treasure_detail_from", {name = heroParam.name}))
	end

	--品级
	self._textPotential:setString(Lang.get("equipment_detail_txt_potential", {value = equipParam.potential}))
	self._textPotential:setColor(equipParam.icon_color)
	self._textPotential:enableOutline(equipParam.icon_color_outline, 2)

	--详情列表
	self._listView:removeAllItems()

	self:_updateListView()
end

--强化属性
function EquipDetailBaseView:_buildAttrModule()
	local equipData = self._equipData
	local equipDetailStrengthenNode = EquipDetailStrengthenNode.new(equipData, self._rangeType)
	self._listView:pushBackCustomItem(equipDetailStrengthenNode)
end

--套装信息
function EquipDetailBaseView:_buildSuitModule()
	local equipData = self._equipData

	local suitId = equipData:getConfig().suit_id
	if suitId > 0 and equipData:isInBattle() then --有套装信息
		local equipDetailSuitNode = EquipDetailSuitNode.new(equipData, true)
		self._listView:pushBackCustomItem(equipDetailSuitNode)
	end
end

--精炼属性
function EquipDetailBaseView:_buildRefineModule()
	local equipData = self._equipData
	local equipDetailRefineNode = EquipDetailRefineNode.new(equipData, self._rangeType)
	self._listView:pushBackCustomItem(equipDetailRefineNode)
end

--描述
function EquipDetailBaseView:_buildBriefModule()
	local equipData = self._equipData
	local equipDetailBriefNode = EquipDetailBriefNode.new(equipData)
	self._listView:pushBackCustomItem(equipDetailBriefNode)
end

function EquipDetailBaseView:_buildJadeModule()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	if FunctionCheck.funcIsShow(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) then
		local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
		if EquipTrainHelper.canLimitUp(self._equipData:getBase_id()) then
			local equipData = self._equipData
			local equipDetailJadeNode = EquipDetailJadeNode.new(equipData, self._rangeType)
			self._listView:pushBackCustomItem(equipDetailJadeNode)
		end
	end
end

function EquipDetailBaseView:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()
	--属性
	self:_buildAttrModule()
	--套装信息
	self:_buildSuitModule()
	--精炼属性
	self:_buildRefineModule()
	--玉石
	self:_buildJadeModule()
	--简介
	self:_buildBriefModule()

	self._listView:doLayout()
end

return EquipDetailBaseView
