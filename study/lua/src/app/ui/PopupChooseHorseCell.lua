
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChooseHorseCell = class("PopupChooseHorseCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseConst = require("app.const.HorseConst")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local TextHelper = require("app.utils.TextHelper")

function PopupChooseHorseCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChooseHorseCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2  = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			},
		}
	}
	PopupChooseHorseCell.super.ctor(self, resource)
end

function PopupChooseHorseCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupChooseHorseCell:update(data1, data2)
	local function updateCell(index, data)
		if data then
			self["_item"..index]:setVisible(true)

			local baseId = data:getBase_id()
			local star = data:getStar()
			local name = HorseDataHelper.getHorseName(baseId, star)

			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_HORSE, baseId)
			self["_item"..index]:setName(name)
			self["_item"..index]:setTouchEnabled(true)
            self["_nodeStar"..index]:setCount(star, HorseConst.HORSE_STAR_MAX)
            
            -- 装备简介内容
            self["_item"..index]:setEquipBriefVisible(true)
            self["_item"..index]:updateEquipBriefBg(data:getConfig().color)
            local equipList = G_UserData:getHorseEquipment():getEquipedEquipListWithHorseId(data:getId())
            local stateList = {0,0,0}
            for k, equipData in pairs(equipList) do
                local config = equipData:getConfig()
                stateList[config.type] = config.color
            end
            self["_item"..index]:updateEquipBriefIcon(stateList)
            --

			self:_showAttrDes(index, data)

			local heroBaseId = data.heroBaseId
			local limitLevel = data.limitLevel
			local limitRedLevel = data.limitRedLevel
			if heroBaseId then
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
				self["_textHeroName"..index]:setString(heroParam.name)
				self["_textHeroName"..index]:setColor(heroParam.icon_color)
				self["_textHeroName"..index]:enableOutline(heroParam.icon_color_outline, 2)
				self["_textHeroName"..index]:setVisible(true)
			else
				self["_textHeroName"..index]:setVisible(false)
			end

			if data.strSuit then --适合武将文字
				self["_buttonChoose"..index]:setVisible(false)
				self["_textTip"..index]:setVisible(true)
				self["_textTip"..index]:setString(Lang.get("horse_suit_ride_tip", {type = data.strSuit}))
			else
				self["_textTip"..index]:setVisible(false)
				self["_buttonChoose"..index]:setVisible(true)
				self["_buttonChoose"..index]:setString(data.btnDesc)
				self["_buttonChoose"..index]:switchToNormal()
			end
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, data1)
	updateCell(2, data2)
end

function PopupChooseHorseCell:_showAttrDes(index, data)
	local showAttrIds = {AttributeConst.ATK, AttributeConst.HP} --需要显示的2种属性
	local info = HorseDataHelper.getHorseAttrInfo(data)

	for i = 1, 2 do
		local attrId = showAttrIds[i]
		local value = info[attrId]
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

function PopupChooseHorseCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChooseHorseCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PopupChooseHorseCell