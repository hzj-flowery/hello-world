--
-- Author: Liangxu
-- Date: 2018-8-28
-- 选择战马帮助类
local PopupChooseHorseHelper = {}
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

PopupChooseHorseHelper.FROM_TYPE1 = 1 --穿戴 “+”点进来
PopupChooseHorseHelper.FROM_TYPE2 = 2 --更换 Icon点进来
PopupChooseHorseHelper.FROM_TYPE3 = 3 --重生点进来

local BTN_DES = {
	[1] = "horse_btn_wear",
	[2] = "horse_btn_replace",
	[3] = "reborn_list_btn",
}

function PopupChooseHorseHelper.addHorseDataDesc(horseData, fromType)
	if horseData == nil then
		return nil
	end
	
	local heroUnitData = HorseDataHelper.getHeroDataWithHorseId(horseData:getId())
	local baseId, limitLevel, limitRedLevel
	if heroUnitData then
		baseId = heroUnitData:getBase_id()
		limitLevel = heroUnitData:getLimit_level()
		limitRedLevel = heroUnitData:getLimit_rtg()
	end
	local cellData = clone(horseData)
	cellData.heroBaseId = baseId
	cellData.limitLevel = limitLevel
	cellData.limitRedLevel = limitRedLevel
	cellData.btnDesc = Lang.get(BTN_DES[fromType])
	if cellData.isEffective == false then
		cellData.strSuit = HorseDataHelper.getHorseConfig(horseData:getBase_id()).type
	end

	return cellData
end

function PopupChooseHorseHelper._FROM_TYPE1(data)
	return data
end

function PopupChooseHorseHelper._FROM_TYPE2(data)
	return data
end

function PopupChooseHorseHelper._FROM_TYPE3(data)
	return G_UserData:getHorse():getRebornList()
end

function PopupChooseHorseHelper.checkIsEmpty(fromType, param)
	local func = PopupChooseHorseHelper["_FROM_TYPE"..fromType]
	if func and type(func) == "function" then
		local herosData = func(param)
		return #herosData == 0
	end
	return true
end

return PopupChooseHorseHelper