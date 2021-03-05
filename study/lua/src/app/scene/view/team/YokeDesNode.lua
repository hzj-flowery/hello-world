--
-- Author: Liangxu
-- Date: 2017-03-31 16:09:51
-- 羁绊描述富文本
local YokeDesNode = class("YokeDesNode", function()
	return cc.Node:create()
end)
local UIHelper = require("yoka.utils.UIHelper")

local TEMP_DIS = 5 --上下空余量

function YokeDesNode:ctor()
	
end

function YokeDesNode:updateView(info, width, dis)
	local richText = ccui.RichText:create()

	self._content = {}

	local fateType = info.fateType
	local func = self["_createTemplate"..fateType]
	if func then
		func(self, info)
	end
	local dis = dis or TEMP_DIS
	if #self._content > 0 then
		richText:setRichText(self._content)
		richText:setAnchorPoint(cc.p(0, 0))
		richText:setPosition(cc.p(0, dis))
		richText:ignoreContentAdaptWithSize(false)
		richText:setContentSize(cc.size(width, 0))
		richText:formatText()

		self:addChild(richText)
		local size = richText:getContentSize()
		self:setContentSize(cc.size(size.width, size.height + dis * 2))
	end
end

function YokeDesNode:_createUnit(text, isActivated)
	local unit = {}
	unit.type = "text"
	unit.color = isActivated and Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) or Colors.colorToNumber(Colors.BRIGHT_BG_TWO)
	unit.msg = text
	unit.fontSize = 20

	table.insert(self._content, unit)

	return unit
end

--创建模板1-武将羁绊
function YokeDesNode:_createTemplate1(info)
	local heroIds = info.heroIds
	local isActivated = info.isShowColor
	for i = 1, #heroIds do
		local heroId = heroIds[i]
		local config = require("app.config.hero").get(heroId)
		assert(config, string.format("hero config can not find id = %d", heroId))
		local text = config.type == 1 and G_UserData:getBase():getName() or config.name

		if i ~= #heroIds then
			text = text.."、"
		end
		local isIn = G_UserData:getTeam():isInBattleWithBaseId(heroId) or G_UserData:getTeam():isInReinforcementsWithBaseId(heroId)
		self:_createUnit(text, isActivated and isIn)
		isActivated = isActivated and isIn
	end

	self:_createUnit(Lang.get("hero_yoke_des_middle"), isActivated)
	local attrInfo = info.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		if i ~= #attrInfo then
			text = text.."，"
		end
		self:_createUnit(text, isActivated)
	end
end

--创建模板2-装备羁绊
function YokeDesNode:_createTemplate2(info)
	local equipIds = info.heroIds
	local isActivated = true

	self:_createUnit(Lang.get("hero_yoke_des_pre"), info.isActivated)

	for i = 1, #equipIds do
		local equipId = equipIds[i]
		local text = require("app.config.equipment").get(equipId).name
		if i ~= #equipIds then
			text = text.."、"
		end
		local isHave = G_UserData:getBattleResource():isInFirstPosWithEquipBaseId(equipId)
		self:_createUnit(text, isHave)
		isActivated = isActivated and isHave
	end

	self:_createUnit(Lang.get("hero_yoke_des_suf"), isActivated)

	local attrInfo = info.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		if i ~= #attrInfo then
			text = text.."，"
		end
		self:_createUnit(text, isActivated)
	end
end

--创建模板3-宝物羁绊
function YokeDesNode:_createTemplate3(info)
	local treasureIds = info.heroIds
	local isActivated = info.isActivated

	self:_createUnit(Lang.get("hero_yoke_des_pre"), isActivated)

	for i = 1, #treasureIds do
		local treasureId = treasureIds[i]
		local configInfo = require("app.config.treasure").get(treasureId)
		assert(configInfo, string.format("treasure config can not find id = %d", treasureId))
		local text = configInfo.name
		if i ~= #treasureIds then
			text = text.."、"
		end
		self:_createUnit(text, isActivated)
	end

	self:_createUnit(Lang.get("hero_yoke_des_suf"), isActivated)

	local attrInfo = info.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		if i ~= #attrInfo then
			text = text.."，"
		end
		self:_createUnit(text, isActivated)
	end
end

--创建模板4-神兵羁绊
--
function YokeDesNode:_createTemplate4(info)
	local instrumentIds = info.heroIds
	local isActivated = info.isActivated

	self:_createUnit(Lang.get("hero_yoke_des_pre"), isActivated)

	for i = 1, #instrumentIds do
		local instrumentId = instrumentIds[i]
		local info = require("app.config.instrument").get(instrumentId)
		assert(info, string.format("instrument config can not find id = %d",instrumentId))
		local text = info.name
		if i ~= #instrumentIds then
			text = text.."、"
		end
		self:_createUnit(text, isActivated)
	end

	self:_createUnit(Lang.get("hero_yoke_des_suf"), isActivated)

	local attrInfo = info.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		if i ~= #attrInfo then
			text = text.."，"
		end
		self:_createUnit(text, isActivated)
	end
end

function YokeDesNode:onlyShow(info, width)
	local richText = ccui.RichText:create()
	self._content = {}

	local fateType = info.fateType
	local func = self["_onlyShowTemplate"..fateType]
	if func then
		func(self, info)
	end
	
	if #self._content > 0 then
		richText:setRichText(self._content)
		richText:setAnchorPoint(cc.p(0, 0))
		richText:setPosition(cc.p(0, 0))
		richText:ignoreContentAdaptWithSize(false)
		richText:setContentSize(cc.size(width,0))
		richText:formatText()

		self:addChild(richText)
		local size = richText:getContentSize()
		self:setContentSize(size)
	end
end

--创建模板1-武将羁绊
function YokeDesNode:_onlyShowTemplate1(info)
	local heroIds = info.heroIds
	local isActivated = info.isActivated
	for i = 1, #heroIds do
		local heroId = heroIds[i]
		local config = require("app.config.hero").get(heroId)
		assert(config, string.format("hero config can not find id = %d", heroId))
		local text = config.type == 1 and G_UserData:getBase():getName() or config.name

		if i ~= #heroIds then
			text = text.."、"
		end
		self:_createUnit(text, isActivated)
	end

	self:_createUnit(Lang.get("hero_yoke_des_middle"), isActivated)
	local attrInfo = info.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		if i ~= #attrInfo then
			text = text.."，"
		end
		self:_createUnit(text, isActivated)
	end
end

--创建模板2-装备羁绊
function YokeDesNode:_onlyShowTemplate2(info)
	local equipIds = info.heroIds
	local isActivated = info.isActivated

	self:_createUnit(Lang.get("hero_yoke_des_pre"), isActivated)

	for i = 1, #equipIds do
		local equipId = equipIds[i]
		local text = require("app.config.equipment").get(equipId).name
		if i ~= #equipIds then
			text = text.."、"
		end
		self:_createUnit(text, isActivated)
	end

	self:_createUnit(Lang.get("hero_yoke_des_suf"), isActivated)
	local attrInfo = info.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		if i ~= #attrInfo then
			text = text.."，"
		end
		self:_createUnit(text, isActivated)
	end
end

--创建模板3-宝物羁绊
function YokeDesNode:_onlyShowTemplate3(info)
	local treasureIds = info.heroIds
	local isActivated = info.isActivated

	self:_createUnit(Lang.get("hero_yoke_des_pre"), isActivated)

	for i = 1, #treasureIds do
		local treasureId = treasureIds[i]
		local text = require("app.config.treasure").get(treasureId).name
		if i ~= #treasureIds then
			text = text.."、"
		end
		self:_createUnit(text, isActivated)
	end

	self:_createUnit(Lang.get("hero_yoke_des_suf"), isActivated)

	local attrInfo = info.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		if i ~= #attrInfo then
			text = text.."，"
		end
		self:_createUnit(text, isActivated)
	end
end

function YokeDesNode:_onlyShowTemplate4(info)
	local instrumentIds = info.heroIds
	local isActivated = info.isActivated

	self:_createUnit(Lang.get("hero_yoke_des_pre"), isActivated)

	for i = 1, #instrumentIds do
		local instrumentId = instrumentIds[i]
		local info = require("app.config.instrument").get(instrumentId)
		assert(info, string.format("instrument config can not find id = %d",instrumentId))
		local text = info.name
		if i ~= #instrumentIds then
			text = text.."、"
		end
		self:_createUnit(text, isActivated)
	end

	self:_createUnit(Lang.get("hero_yoke_des_suf"), isActivated)

	local attrInfo = info.attrInfo
	for i = 1, #attrInfo do
		local attr = attrInfo[i]
		local text = Lang.get("hero_detail_yoke_attr_value", {
			attr = require("app.config.attribute").get(attr.attrId).cn_name,
			value = tonumber(attr.attrValue / 10),
		})
		if i ~= #attrInfo then
			text = text.."，"
		end
		self:_createUnit(text, isActivated)
	end
end

return YokeDesNode