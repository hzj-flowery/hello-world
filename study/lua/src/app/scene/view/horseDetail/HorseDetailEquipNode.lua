--
-- Author: JerryHe
-- Date: 2019-01-28
-- 战马详情的装备模块
local ViewBase = require("app.ui.ViewBase")
local HorseDetailEquipNode = class("HorseDetailEquipNode", ViewBase)
local TeamHorseEquipIcon = require("app.scene.view.team.TeamHorseEquipIcon")
local HorseConst = require("app.const.HorseConst")

function HorseDetailEquipNode:ctor()
	local resource = {
		file = Path.getCSB("TeamHorseEquipNode", "team"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
    }
    
	HorseDetailEquipNode.super.ctor(self, resource)
end

function HorseDetailEquipNode:onCreate()
	self:_initData()
	self:_initView()
end

function HorseDetailEquipNode:_initData()
    self._horseId = G_UserData:getHorse():getCurHorseId()
    self._horseEquipNum = 3
end

function HorseDetailEquipNode:_initView()
    
    -- 战马装备
    self._horseEquipments = {}
    for i = 1, self._horseEquipNum do
        local target = self["_fileNodeEquip"..i]
        local horseEquip = TeamHorseEquipIcon.new(target,self._horseId,i)
        table.insert(self._horseEquipments, horseEquip)
    end
end

function HorseDetailEquipNode:onEnter()
	self:updateInfo()
end

function HorseDetailEquipNode:onExit()

end

function HorseDetailEquipNode:updateInfo()
	self:_updateData()
	self:_updateView()
end

function HorseDetailEquipNode:_updateData()
    
end

function HorseDetailEquipNode:_updateView()
    for i, horseEquip in ipairs(self._horseEquipments) do
        horseEquip:updateIcon()
    end
end

function HorseDetailEquipNode:updateHorseEquip(horseEquipPos)
    local horseEquip = self._horseEquipments[horseEquipPos]
    assert(horseEquip,"战马装备icon是空，传入的位置坐标是"..horseEquipPos)
    horseEquip:updateIcon()
end

return HorseDetailEquipNode