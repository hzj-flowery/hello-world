--
-- Author: JerryHe
-- Date: 2019-01-28
-- 选择战马装备帮助类
-- 
local PopupChooseHorseEquipHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

PopupChooseHorseEquipHelper.FROM_TYPE1 = 1 --穿戴 “+”点进来
PopupChooseHorseEquipHelper.FROM_TYPE2 = 2 --更换 Icon点击来

local BTN_DES = {
	[1] = "equipment_btn_wear",
	[2] = "equipment_btn_replace",
}

function PopupChooseHorseEquipHelper.addEquipDataDesc(equipData, fromType, curEquipUnitData, pos)
	if equipData == nil then
		return nil
	end

	local cellData = clone(equipData)
	-- cellData.textDesc = des
	cellData.horseId = equipData:getHorse_id()
	cellData.btnDesc = Lang.get(BTN_DES[fromType])
	cellData.btnIsHightLight = false
	if cellData.horseId ~= 0 then
		cellData.btnDesc = Lang.get("equipment_btn_grab")--该装备已经穿上了，显示“抢来穿”
		cellData.btnIsHightLight = true
	end

	return cellData
end

function PopupChooseHorseEquipHelper._checkIsShowRP(equipData, curData)
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

function PopupChooseHorseEquipHelper._FROM_TYPE1(data)
	return data
end

function PopupChooseHorseEquipHelper._FROM_TYPE2(data)
	return data
end

return PopupChooseHorseEquipHelper