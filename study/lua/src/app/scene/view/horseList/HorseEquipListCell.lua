--
-- Author: JerryHe
-- Date: 2019-01-24
-- 战马装备列表Cell
-- 
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HorseEquipListCell = class("HorseEquipListCell", ListViewCellBase)
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AttributeConst = require("app.const.AttributeConst")
local HorseConst = require("app.const.HorseConst")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

function HorseEquipListCell:ctor()
	local resource = {
		file = Path.getCSB("HorseEquipListCell", "horse"),
		binding = {
		}
	}
	HorseEquipListCell.super.ctor(self, resource)
end

function HorseEquipListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function HorseEquipListCell:update(equipData1, equipData2)
    self._equipData1 = equipData1
    self._equipData2 = equipData2

	local function updateCell(index, equipData)
		if equipData then
			if type(equipData) ~= "table" then
				return
			end
			self["_item"..index]:setVisible(true)
            local baseId = equipData:getBase_id()
            local name = equipData:getConfig().name

			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, baseId)
			self["_item"..index]:setName(name)
			self["_item"..index]:setTouchEnabled(true)
			self["_item"..index]:setCallBack(handler(self, self["_onClickIcon"..index]))
			
			self:_showAttrDes(index, equipData)

            local horseId = equipData:getHorse_id()
            if horseId == 0 then
                self["_textHeroName"..index]:setVisible(false)
            else
                local horseUnitData = G_UserData:getHorse():getUnitDataWithId(horseId)
                if horseUnitData and horseUnitData:isInBattle() then
                    local heroUnitData = HorseDataHelper.getHeroDataWithHorseId(horseId)

                    if heroUnitData then
                        local heroBaseId = heroUnitData:getBase_id()
                        local limitLevel = heroUnitData:getLimit_level()
                        local limitRedLevel = heroUnitData:getLimit_rtg()
                        local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
                        local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, baseId)
                        self["_textHeroName"..index]:setVisible(true)
                        self["_textHeroName"..index]:setString(heroParam.name..Lang.get("horse_equip_wear"))
                        self["_textHeroName"..index]:setColor(equipParam.icon_color)     
                    else
                        self["_textHeroName"..index]:setVisible(false)
                    end
                else
                    self["_textHeroName"..index]:setVisible(false)
                end
            end
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, equipData1)
	updateCell(2, equipData2)
end

function HorseEquipListCell:_showAttrDes(index, data)
    local info = HorseEquipDataHelper.getHorseEquipAttrInfo(data)

    local showList = {}
    for k, v in pairs(info) do
        showList[#showList + 1] = {id=k, value = v}
    end
    
    -- 最多显示两个属性
	for i = 1, 2 do
        local attrId = nil
        local value = nil
        if showList[i] then
            attrId = showList[i].id
            value = showList[i].value
        end
        
        if value then
			local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
			attrName = TextHelper.expandTextByLen(attrName, 4)
			self["_nodeAttr"..index.."_"..i]:updateUI(attrName, "+"..attrValue)
			self["_nodeAttr"..index.."_"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
            self["_nodeAttr"..index.."_"..i]:setVisible(true)
		else
			self["_nodeAttr"..index.."_"..i]:setVisible(false)
		end
	end
end

function HorseEquipListCell:_onButtonUpStarClicked1()
	self:dispatchCustomCallback(1)
end

function HorseEquipListCell:_onButtonUpStarClicked2()
	self:dispatchCustomCallback(2)
end

function HorseEquipListCell:_onClickIcon1(sender, itemParams)
	G_SceneManager:showScene("horseEquipDetail", self._equipData1, HorseConst.HORSE_EQUIP_RANGE_TYPE_1)
end

function HorseEquipListCell:_onClickIcon2(sender, itemParams)
	G_SceneManager:showScene("horseEquipDetail", self._equipData2, HorseConst.HORSE_EQUIP_RANGE_TYPE_1)
end

return HorseEquipListCell