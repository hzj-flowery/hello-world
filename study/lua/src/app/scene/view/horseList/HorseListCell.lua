--
-- Author: Liangxu
-- Date: 2018-8-29
-- 战马列表Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HorseListCell = class("HorseListCell", ListViewCellBase)
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AttributeConst = require("app.const.AttributeConst")
local HorseConst = require("app.const.HorseConst")

function HorseListCell:ctor()
	local resource = {
		file = Path.getCSB("HorseListCell", "horse"),
		binding = {
			_buttonUpStar1 = {
				events = {{event = "touch", method = "_onButtonUpStarClicked1"}}
			},
			_buttonUpStar2 = {
				events = {{event = "touch", method = "_onButtonUpStarClicked2"}}
			}
		}
	}
	HorseListCell.super.ctor(self, resource)
end

function HorseListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._buttonUpStar1:setString(Lang.get("horse_btn_advance"))
	self._buttonUpStar2:setString(Lang.get("horse_btn_advance"))
end

function HorseListCell:update(horseId1, horseId2)
	self._horseId1 = horseId1
	self._horseId2 = horseId2

	local function updateCell(index, horseId)
		if horseId then
			if type(horseId) ~= "number" then
				return
			end
			self["_item" .. index]:setVisible(true)
			local data = G_UserData:getHorse():getUnitDataWithId(horseId)
			local baseId = data:getBase_id()
			local star = data:getStar()
			local name = HorseDataHelper.getHorseName(baseId, star)

			self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_HORSE, baseId)
			self["_item" .. index]:setName(name)
			self["_item" .. index]:setTouchEnabled(true)
			self["_item" .. index]:setCallBack(handler(self, self["_onClickIcon" .. index]))

			-- 装备简介内容
			self["_item" .. index]:setEquipBriefVisible(true)
			self["_item" .. index]:updateEquipBriefBg(data:getConfig().color)
			local equipList = G_UserData:getHorseEquipment():getEquipedEquipListWithHorseId(horseId)
			local stateList = {0, 0, 0}
			for k, equipData in pairs(equipList) do
				local config = equipData:getConfig()
				stateList[config.type] = config.color
			end
			self["_item" .. index]:updateEquipBriefIcon(stateList)
			--

			self["_nodeStar" .. index]:setCount(star, HorseConst.HORSE_STAR_MAX)

			self:_showAttrDes(index, data)

			local heroUnitData = HorseDataHelper.getHeroDataWithHorseId(data:getId())

			if heroUnitData then
				local baseId = heroUnitData:getBase_id()
				local limitLevel = heroUnitData:getLimit_level()
				local limitRedLevel = heroUnitData:getLimit_rtg()
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
				self["_textHeroName" .. index]:setString(heroParam.name)
				self["_textHeroName" .. index]:setColor(heroParam.icon_color)
				require("yoka.utils.UIHelper").updateTextOutline(self["_textHeroName" .. index], heroParam)
				self["_textHeroName" .. index]:setVisible(true)
			else
				self["_textHeroName" .. index]:setVisible(false)
			end
		else
			self["_item" .. index]:setVisible(false)
		end
	end

	updateCell(1, horseId1)
	updateCell(2, horseId2)
end

function HorseListCell:_showAttrDes(index, data)
	local showAttrIds = {AttributeConst.ATK, AttributeConst.HP} --需要显示的2种属性
	local info = HorseDataHelper.getHorseAttrInfo(data)

	for i = 1, 2 do
		local attrId = showAttrIds[i]
		local value = info[attrId]
		if value then
			local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
			attrName = TextHelper.expandTextByLen(attrName, 4)
			self["_nodeAttr" .. index .. "_" .. i]:updateUI(attrName, "+" .. attrValue)
			self["_nodeAttr" .. index .. "_" .. i]:setValueColor(Colors.BRIGHT_BG_GREEN)
			self["_nodeAttr" .. index .. "_" .. i]:setVisible(true)
		else
			self["_nodeAttr" .. index .. "_" .. i]:setVisible(false)
		end
	end
end

function HorseListCell:_onButtonUpStarClicked1()
	self:dispatchCustomCallback(1)
end

function HorseListCell:_onButtonUpStarClicked2()
	self:dispatchCustomCallback(2)
end

function HorseListCell:_onClickIcon1(sender, itemParams)
	local horseId = self._horseId1
	G_SceneManager:showScene("horseDetail", horseId, HorseConst.HORSE_RANGE_TYPE_1)
end

function HorseListCell:_onClickIcon2(sender, itemParams)
	local horseId = self._horseId2
	G_SceneManager:showScene("horseDetail", horseId, HorseConst.HORSE_RANGE_TYPE_1)
end

return HorseListCell
