local EquipDetailStrengthenNode = require("app.scene.view.equipmentDetail.EquipDetailStrengthenNode")
local EquipDetailSuitNode = require("app.scene.view.equipmentDetail.EquipDetailSuitNode")
local EquipDetailRefineNode = require("app.scene.view.equipmentDetail.EquipDetailRefineNode")
local EquipDetailBriefNode = require("app.scene.view.equipmentDetail.EquipDetailBriefNode")

local CommonEquipProperty = class("CommonEquipProperty")

local EXPORTED_METHODS = {
	"updateUI"
}

function CommonEquipProperty:ctor()
	self._target = nil
	self._name2 = nil
end

function CommonEquipProperty:_init()
	self._name2 = ccui.Helper:seekNodeByName(self._target, "Name2")
	self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
	self._listView:setScrollBarEnabled(false)
	cc.bind(self._target, "CommonDetailWindow")

	if cc.isRegister("CommonEquipName") then
		cc.bind(self._name2, "CommonEquipName")
	end
end

function CommonEquipProperty:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonEquipProperty:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

--强化属性
function CommonEquipProperty:_buildAttrModule()
	local equipData = self._equipData
	local equipDetailStrengthenNode = EquipDetailStrengthenNode.new(equipData)
	self._listView:pushBackCustomItem(equipDetailStrengthenNode)
end

--套装信息
function CommonEquipProperty:_buildSuitModule()
	local equipData = self._equipData

	local suitId = equipData:getConfig().suit_id
	if suitId > 0 then --有套装信息
		local equipDetailSuitNode = EquipDetailSuitNode.new(equipData)
		equipDetailSuitNode:setIconMask(false) --图标都亮显
		self._listView:pushBackCustomItem(equipDetailSuitNode)
	end
end

--精炼属性
function CommonEquipProperty:_buildRefineModule()
	local equipData = self._equipData
	local equipDetailRefineNode = EquipDetailRefineNode.new(equipData)
	self._listView:pushBackCustomItem(equipDetailRefineNode)
end

--描述
function CommonEquipProperty:_buildBriefModule()
	local equipData = self._equipData
	local equipDetailBriefNode = EquipDetailBriefNode.new(equipData)
	self._listView:pushBackCustomItem(equipDetailBriefNode)
end

function CommonEquipProperty:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()
	--属性
	self:_buildAttrModule()
	--套装信息
	self:_buildSuitModule()
	--精炼属性
	self:_buildRefineModule()
	--简介
	self:_buildBriefModule()
end

function CommonEquipProperty:updateUI(equipData)
	self._equipData = equipData

	self:_updateListView()

	local equipBaseId = equipData:getBase_id()
	local rLevel = equipData:getR_level()
	self._name2:setName(equipBaseId, rLevel)
end

return CommonEquipProperty
