
-- Author: conley
-- Date:2018-11-23 17:08:04
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local HistoryHeroBookItemCell = class("HistoryHeroBookItemCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")
local AttributeConst = require("app.const.AttributeConst")


function HistoryHeroBookItemCell:ctor()

	--csb bind var name
	self._avatar01 = nil  --
	self._avatar02 = nil  --
	self._commonAttr01 = nil  --
	self._commonAttr02 = nil  --
	self._fileNodePower = nil  --CommonHeroPower
	self._heroName01 = nil  --
	self._heroName02 = nil  --
	self._textBookName = nil  --Text

	local resource = {
		file = Path.getCSB("HistoryHeroBookItemCell", "historyhero"),

	}
	HistoryHeroBookItemCell.super.ctor(self, resource)
end

function HistoryHeroBookItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self:_updateItemVisible(false)
end

function HistoryHeroBookItemCell:_updateItemVisible(bVisible)
	self._resourceNode:setVisible(bVisible)
end

function HistoryHeroBookItemCell:updateItemAttrs(bVisible)
	self["_commonAttr01"]:setVisible(bVisible)
	self["_commonAttr02"]:setVisible(bVisible)
end

function HistoryHeroBookItemCell:updateUI(data)
	if data == nil then return end
	self:_updateItemVisible(true)

	self["_textBookName"]:setString(data.name)
	self["_avatar01"]:updateUI(tonumber(data.hero_1))
	self["_avatar02"]:updateUI(tonumber(data.hero_2))
	self["_avatar01"]:setScale(1.4)
	self["_avatar02"]:setScale(1.4)
	self["_avatar02"]:turnBack(true)

	local params1 = self["_avatar01"]:getItemParams()
	local params2 = self["_avatar02"]:getItemParams()
	self["_heroName01"]:setName(params1.name)
	self["_heroName02"]:setName(params2.name)
	self["_heroName01"]:setColor(params1.icon_color)
	self["_heroName02"]:setColor(params2.icon_color)

	local attrName1, _ = TextHelper.getAttrBasicText(data.attr_type_1, 0)
	local attrName2, _ = TextHelper.getAttrBasicText(data.attr_type_2, 0)
	self["_commonAttr01"]:setVisible(data.isCurGallery)
	self["_commonAttr02"]:setVisible(data.isCurGallery)
	self["_commonAttr01"]:setAttrName(attrName1)
	self["_commonAttr02"]:setAttrName(attrName2)
	self["_commonAttr01"]:setValue(data.attr_value_1)
	self["_commonAttr02"]:setValue(data.attr_value_2)
	self["_fileNodePower"]:updateUI(tonumber(data.power))
end

return HistoryHeroBookItemCell