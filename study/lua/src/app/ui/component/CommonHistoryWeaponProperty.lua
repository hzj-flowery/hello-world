local UserDataHelper = require("app.utils.UserDataHelper")
local EquipDetailStrengthenNode = require("app.scene.view.equipmentDetail.EquipDetailStrengthenNode")
local EquipDetailSuitNode = require("app.scene.view.equipmentDetail.EquipDetailSuitNode")
local EquipDetailRefineNode = require("app.scene.view.equipmentDetail.EquipDetailRefineNode")
local EquipDetailBriefNode = require("app.scene.view.equipmentDetail.EquipDetailBriefNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local HistoryWeaponDetailSkillNode = require("app.scene.view.historyhero.HistoryWeaponDetailSkillNode")
local HistoryWeaponDetailHeroNode = require("app.scene.view.historyhero.HistoryWeaponDetailHeroNode")

local TreasureDetailBriefNode = require("app.scene.view.treasureDetail.TreasureDetailBriefNode")


local CommonHistoryWeaponProperty = class("CommonHistoryWeaponProperty")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonHistoryWeaponProperty:ctor()
	self._target = nil
    self._name2 = nil
end

function CommonHistoryWeaponProperty:_init()
    self._name2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")

    -- if cc.isRegister("CommonTreasureName") then
	-- 	cc.bind(self._name2, "CommonTreasureName")
	-- end

end

function CommonHistoryWeaponProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHistoryWeaponProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonHistoryWeaponProperty:_buildSkillModule()
	--技能
	local historyWeaponDetailSkillNode = HistoryWeaponDetailSkillNode.new(self._weaponData)
	self._listView:pushBackCustomItem(historyWeaponDetailSkillNode)
end


function CommonHistoryWeaponProperty:_buildHeroModule()
	--适用武将
	local historyWeaponDetailHeroNode = HistoryWeaponDetailHeroNode.new(self._weaponData)
	self._listView:pushBackCustomItem(historyWeaponDetailHeroNode)
end

-- function CommonHistoryWeaponProperty:_buildBriefModule()
-- 	--描述
-- 	local treasureData = self._treasureData

-- 	local treasureDetailBriefNode = TreasureDetailBriefNode.new(treasureData)
-- 	self._listView:pushBackCustomItem(treasureDetailBriefNode)
-- end


function CommonHistoryWeaponProperty:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()

	--技能
	self:_buildSkillModule()
	--适用武将
	self:_buildHeroModule()
	-- --简介
	-- self:_buildBriefModule()
end

function CommonHistoryWeaponProperty:updateUI(weaponData)
    self._weaponData = weaponData

    self:_updateListView()


    local weaponId = weaponData:getId()
    self:setName(weaponId)
end

function CommonHistoryWeaponProperty:setName(weaponId)
	local weaponParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, weaponId)
	self._name2:setString(weaponParam.name)
	self._name2:setColor(weaponParam.icon_color)
end




return CommonHistoryWeaponProperty