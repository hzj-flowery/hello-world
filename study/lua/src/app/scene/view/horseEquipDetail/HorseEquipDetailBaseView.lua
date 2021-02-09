--
-- Author: JerryHe
-- Date: 2019-01-28
-- 
local ViewBase = require("app.ui.ViewBase")
local HorseEquipDetailBaseView = class("HorseEquipDetailBaseView", ViewBase)
local HorseEquipDetailAttrNode = require("app.scene.view.horseEquipDetail.HorseEquipDetailAttrNode")
local HorseEquipDetailBriefNode = require("app.scene.view.horseEquipDetail.HorseEquipDetailBriefNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")
local HorseConst = require("app.const.HorseConst")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

function HorseEquipDetailBaseView:ctor(equipData, rangeType)
	self._textName 			= nil
	self._textFrom			= nil
	self._textDetailName 	= nil
    self._listView 			= nil 
    self._nodeEquip         = nil

	self._equipData 		= equipData
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("HorseEquipDetailBaseView", "horse"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		
		}
	}
	HorseEquipDetailBaseView.super.ctor(self, resource)
end

function HorseEquipDetailBaseView:onCreate()
	
end

function HorseEquipDetailBaseView:onEnter()
	self:_updateInfo()
end

function HorseEquipDetailBaseView:onExit()

end

function HorseEquipDetailBaseView:_updateInfo()
	local equipData = self._equipData
	local equipBaseId = equipData:getBase_id()
    local configData = equipData:getConfig()
    local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, equipBaseId)         
    
    local horseId   = equipData:getHorse_id()
	if horseId == 0 then
		self._textFrom:setVisible(false)
		self._imageTalentBg:setVisible(false)
	else
		self._textFrom:setVisible(true)
        self._imageTalentBg:setVisible(true)
        
        local horseUnitData = G_UserData:getHorse():getUnitDataWithId(horseId)
        if horseUnitData and horseUnitData:isInBattle() then
            local heroBaseId = HorseDataHelper.getHeroBaseIdWithHorseId(horseId)
            if heroBaseId then
                local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
                self._textFrom:setString(heroParam.name..Lang.get("horse_equip_wear"))
            else
                self._textFrom:setVisible(false)
                self._imageTalentBg:setVisible(false)
            end
        else
            self._imageTalentBg:setVisible(false)
            self._textFrom:setVisible(false)
        end
        
        -- self._textFrom:setString(Lang.get("horse_equip_detail_from"))
	end

	--名字
	self._textName:setString(configData.name)
	self._textName:setColor(equipParam.icon_color)
	-- self._textName:enableOutline(equipParam.icon_color_outline, 2)
	self._textDetailName:setString(configData.name)
	self._textDetailName:setColor(equipParam.icon_color)
	-- self._textDetailName:enableOutline(equipParam.icon_color_outline, 2)

	--详情列表
    self:_updateListView()
end

function HorseEquipDetailBaseView:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()
	--属性
	self:_buildAttrModule()
	--简介
    self:_buildBriefModule()
end

function HorseEquipDetailBaseView:_buildAttrModule()
	local item = HorseEquipDetailAttrNode.new(self._equipData, self._rangeType)
	self._listView:pushBackCustomItem(item)
end

function HorseEquipDetailBaseView:_buildBriefModule()
	local item = HorseEquipDetailBriefNode.new(self._equipData)
	self._listView:pushBackCustomItem(item)
end

return HorseEquipDetailBaseView