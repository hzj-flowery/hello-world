--
-- Author: Liangxu
-- Date: 2017-07-07 16:19:59
-- 选择宝物帮助类
local PopupChooseTreasureHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

PopupChooseTreasureHelper.FROM_TYPE1 = 1 --穿戴 “+”点进来
PopupChooseTreasureHelper.FROM_TYPE2 = 2 --更换 Icon点进来
PopupChooseTreasureHelper.FROM_TYPE3 = 3 --重生宝物 点进来
PopupChooseTreasureHelper.FROM_TYPE4 = 4 --从“宝物置换”点进来

local BTN_DES = {
	[1] = "treasure_btn_wear",
	[2] = "treasure_btn_replace",
	[3] = "reborn_list_btn",
	[4] = "reborn_list_btn",
}

function PopupChooseTreasureHelper.addTreasureDataDesc(treasureData, fromType, showRP, curTreasureUnitData, pos)
	if treasureData == nil then
		return nil
	end
	
	-- local info = UserDataHelper.getTreasureAttrInfo(treasureData)
	-- local des = TextHelper.getAttrText(info, "\n")
	local heroUnitData = UserDataHelper.getHeroDataWithTreasureId(treasureData:getId())

	local baseId, limitLevel, limitRedLevel
	if heroUnitData then
		baseId = heroUnitData:getBase_id()
		limitLevel = heroUnitData:getLimit_level()
		limitRedLevel = heroUnitData:getLimit_rtg()
	end

	local rData = G_UserData:getBattleResource():getTreasureDataWithId(treasureData:getId())

	local cellData = clone(treasureData)
	-- cellData.textDesc = des
	cellData.heroBaseId = baseId
	cellData.limitLevel = limitLevel
	cellData.limitRedLevel = limitRedLevel
	cellData.btnDesc = Lang.get(BTN_DES[fromType])
	cellData.btnIsHightLight = false
	cellData.isYoke = false --是否有羁绊关系
	if rData then
		cellData.btnDesc = Lang.get("treasure_btn_grab")--该宝物已经穿上了，显示“抢来穿”
		cellData.btnIsHightLight = true
	end

	if fromType == PopupChooseTreasureHelper.FROM_TYPE2 and showRP == true and not rData then --更换装备，显示红点
		cellData.showRP = PopupChooseTreasureHelper._checkIsShowRP(treasureData, curTreasureUnitData, pos)
	end

	if fromType == PopupChooseTreasureHelper.FROM_TYPE1 or fromType == PopupChooseTreasureHelper.FROM_TYPE2 and pos then
		local baseId = UserDataHelper.getHeroBaseIdWithPos(pos)
		cellData.isYoke = UserDataHelper.isHaveYokeBetweenHeroAndTreasured(baseId, treasureData:getBase_id())
	end

	return cellData
end

function PopupChooseTreasureHelper._checkIsShowRP(treasureData, curData, pos)
	local baseId = UserDataHelper.getHeroBaseIdWithPos(pos)
	local curColor = curData:getConfig().color
	local curPotential = curData:getConfig().potential
	local curLevel = curData:getLevel()
	local curRLevel = curData:getRefine_level()
	local isCurYoke = UserDataHelper.isHaveYokeBetweenHeroAndTreasured(baseId, curData:getBase_id())

	local color = treasureData:getConfig().color
	local potential = treasureData:getConfig().potential
	local level = treasureData:getLevel()
	local rLevel = treasureData:getRefine_level()
	local isYoke = UserDataHelper.isHaveYokeBetweenHeroAndTreasured(baseId, treasureData:getBase_id())

	if isCurYoke then
		return isYoke
	elseif isYoke then
		return true
	end

	if color ~= curColor then
		return color > curColor
	elseif potential ~= curPotential then
		return potential > curPotential
	elseif level ~= curLevel then
		return level > curLevel
	elseif rLevel ~= curRLevel then
		return rLevel > curRLevel
	end
	return false
end

function PopupChooseTreasureHelper._FROM_TYPE1(data)
	return data
end

function PopupChooseTreasureHelper._FROM_TYPE2(data)
	return data
end

function PopupChooseTreasureHelper._FROM_TYPE3(data)
	return G_UserData:getTreasure():getRebornList()
end

function PopupChooseTreasureHelper._FROM_TYPE4(param)
	local filterIds, tempData = unpack(param)
	return  UserDataHelper.getTreasureTransformTarList(filterIds, tempData)
end

return PopupChooseTreasureHelper