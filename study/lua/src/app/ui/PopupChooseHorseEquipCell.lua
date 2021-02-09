--
-- Author: JerryHe
-- Date: 2019-01-28
-- 选择战马装备Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChooseHorseEquipCell = class("PopupChooseHorseEquipCell", ListViewCellBase)
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

function PopupChooseHorseEquipCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChooseHorseEquipCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2  = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			},
		}
	}
	PopupChooseHorseEquipCell.super.ctor(self, resource)
end

function PopupChooseHorseEquipCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupChooseHorseEquipCell:update(data1, data2)
	local function updateCell(index, data)
		if data then
			self["_item"..index]:setVisible(true)

			local baseId = data:getBase_id()

			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, baseId)
			self["_item"..index]:setTouchEnabled(true)
			local icon = self["_item"..index]:getCommonIcon()
			local params = icon:getItemParams()

			self:_showAttrDes(index, data)
			
            if data.horseId ~= 0 then
                local horseUnitData = G_UserData:getHorse():getUnitDataWithId(data.horseId)
                if horseUnitData and horseUnitData:isInBattle() then
					local heroUnitData = HorseDataHelper.getHeroDataWithHorseId(data.horseId)

                    if heroUnitData then
						local heroBaseId = heroUnitData:getBase_id()
						local limitLevel = heroUnitData:getLimit_level()
						local limitRedLevel = heroUnitData:getLimit_rtg()
                        local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
                        self["_textHeroName"..index]:setVisible(true)
                        self["_textHeroName"..index]:setString(heroParam.name..Lang.get("horse_equip_wear"))
                        self["_textHeroName"..index]:setColor(params.icon_color)     
                    else
                        self["_textHeroName"..index]:setVisible(false)
                    end
                else
                    self["_textHeroName"..index]:setVisible(false)
                end
			else
				self["_textHeroName"..index]:setVisible(false)
            end

			self["_buttonChoose"..index]:setString(data.btnDesc)
			if data.btnIsHightLight == false then
				self["_buttonChoose"..index]:switchToNormal()
			else
				self["_buttonChoose"..index]:switchToHightLight()
			end

			if data.showRP == true then
				self["_buttonChoose"..index]:showRedPoint(true)
			else
				self["_buttonChoose"..index]:showRedPoint(false)
			end
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, data1)
	updateCell(2, data2)
end

function PopupChooseHorseEquipCell:_showAttrDes(index, data)
    logWarn("PopupChooseHorseEquipCell:_showAttrDes")
    dump(data)
    
    local info = HorseEquipDataHelper.getHorseEquipAttrInfo(data)
    local desInfo = TextHelper.getAttrInfoBySort(info)

	for i = 1, 2 do
		local one = desInfo[i]
		if one then
			local attrName, attrValue = TextHelper.getAttrBasicText(one.id, one.value)
			attrName = TextHelper.expandTextByLen(attrName, 4)
			self["_nodeAttr"..index.."_"..i]:updateUI(attrName, "+"..attrValue, nil, 5)
			self["_nodeAttr"..index.."_"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
			self["_nodeAttr"..index.."_"..i]:setVisible(true)
		else
			self["_nodeAttr"..index.."_"..i]:setVisible(false)
		end
	end
end

function PopupChooseHorseEquipCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChooseHorseEquipCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PopupChooseHorseEquipCell