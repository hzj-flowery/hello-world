-- 
-- Author: JerryHe
-- Date: 2019-01-29
-- Desc: 战马装备详情
-- 

local HorseEquipDetailAttrNode = require("app.scene.view.horseEquipDetail.HorseEquipDetailAttrNode")
local HorseEquipDetailBriefNode = require("app.scene.view.horseEquipDetail.HorseEquipDetailBriefNode")

local CommonHorseEquipProperty = class("CommonHorseEquipProperty")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonHorseEquipProperty:ctor()
	self._target = nil
    self._name2 = nil
end

function CommonHorseEquipProperty:_init()
    self._name2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")

    if cc.isRegister("CommonHorseEquipName") then
		cc.bind(self._name2, "CommonHorseEquipName")
	end

end

function CommonHorseEquipProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHorseEquipProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--描述
function CommonHorseEquipProperty:_buildBriefModule()
	local equipData = self._equipData
	local equipDetailBriefNode = HorseEquipDetailBriefNode.new(equipData)
	self._listView:pushBackCustomItem(equipDetailBriefNode)
end

-- 属性
function CommonHorseEquipProperty:_buildAttrModule()
	local equipData = self._equipData
	local equipDetailStrengthenNode = HorseEquipDetailAttrNode.new(equipData)
	self._listView:pushBackCustomItem(equipDetailStrengthenNode)
end

function CommonHorseEquipProperty:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()
	--属性
	self:_buildAttrModule()
	--简介
	self:_buildBriefModule()
end

function CommonHorseEquipProperty:updateUI(equipData)
    self._equipData = equipData

    self:_updateListView()

    local equipBaseId = equipData:getBase_id()
    self._name2:setName(equipBaseId)
end



return CommonHorseEquipProperty