--
-- Author: Liangxu
-- Date: 2017-07-07 11:23:31
-- 选择装备帮助类
local PopupChooseEquipHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

PopupChooseEquipHelper.FROM_TYPE1 = 1 --穿戴 “+”点进来
PopupChooseEquipHelper.FROM_TYPE2 = 2 --更换 Icon点击来
PopupChooseEquipHelper.FROM_TYPE3 = 3 --装备重生点进来

local BTN_DES = {
	[1] = "equipment_btn_wear",
	[2] = "equipment_btn_replace",
	[3] = "reborn_list_btn",
}

function PopupChooseEquipHelper.addEquipDataDesc(equipData, fromType, showRP, curEquipUnitData, pos)
	if equipData == nil then
		return nil
	end
	
	-- local info = UserDataHelper.getEquipAttrInfo(equipData)
	-- local des = TextHelper.getAttrText(info, "\n")
	local heroUnitData = UserDataHelper.getHeroDataWithEquipId(equipData:getId())

	local baseId, limitLevel, limitRedLevel
	if heroUnitData then
		baseId = heroUnitData:getBase_id()
		limitLevel = heroUnitData:getLimit_level()
		limitRedLevel = heroUnitData:getLimit_rtg()
	end

	local rData = G_UserData:getBattleResource():getEquipDataWithId(equipData:getId())

	local cellData = clone(equipData)
	-- cellData.textDesc = des
	cellData.heroBaseId = baseId
	cellData.limitLevel = limitLevel
	cellData.limitRedLevel = limitRedLevel
	cellData.btnDesc = Lang.get(BTN_DES[fromType])
	cellData.btnIsHightLight = false
	cellData.isYoke = false --是否有羁绊关系
	if rData then
		cellData.btnDesc = Lang.get("equipment_btn_grab")--该装备已经穿上了，显示“抢来穿”
		cellData.btnIsHightLight = true
	end

	if fromType == PopupChooseEquipHelper.FROM_TYPE2 and showRP == true and not rData then --更换装备，显示红点
		cellData.showRP = PopupChooseEquipHelper._checkIsShowRP(equipData, curEquipUnitData)
	end

	if fromType == PopupChooseEquipHelper.FROM_TYPE1 or fromType == PopupChooseEquipHelper.FROM_TYPE2 and pos then
		local baseId = UserDataHelper.getHeroBaseIdWithPos(pos)
		cellData.isYoke = UserDataHelper.isHaveYokeBetweenHeroAndEquip(baseId, equipData:getBase_id())
	end

	return cellData
end

function PopupChooseEquipHelper._checkIsShowRP(equipData, curData)
	local curColor = curData:getConfig().color
	local curPotential = curData:getConfig().potential
	local curLevel = curData:getLevel()
	local curRLevel = curData:getR_level()

	local color = equipData:getConfig().color
	local potential = equipData:getConfig().potential
	local level = equipData:getLevel()
	local rLevel = equipData:getR_level()

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

function PopupChooseEquipHelper._FROM_TYPE1(data)
	return data
end

function PopupChooseEquipHelper._FROM_TYPE2(data)
	return data
end

function PopupChooseEquipHelper._FROM_TYPE3(data)
	return G_UserData:getEquipment():getRebornList()
end

return PopupChooseEquipHelper