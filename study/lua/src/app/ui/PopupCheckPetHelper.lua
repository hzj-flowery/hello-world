--
-- Author: hedili
-- Date: 2018-02-15 15:40:28
-- 
local PopupCheckPetHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

PopupCheckPetHelper.FROM_TYPE1 = 1 --从“神兽升级”点进来
PopupCheckPetHelper.FROM_TYPE2 = 2 --从“神兽回收”点进来


function PopupCheckPetHelper.addPetDataDesc(petData, fromType)
	if petData == nil then
		return nil
	end

	local cellData = clone(petData)
	cellData.isYoke = false
	local desValue = {}
	if fromType == PopupCheckPetHelper.FROM_TYPE1 then
		local info1 = {des = Lang.get("hero_check_cell_des_1"), value = Lang.get("hero_check_cell_value_1", {level = petData:getLevel()})}
		local info2 = {des = Lang.get("hero_check_cell_des_2"), value = petData:getConfig().exp, colorValue = Colors.BRIGHT_BG_GREEN}
		table.insert(desValue, info1)
		table.insert(desValue, info2)
	elseif fromType == PopupCheckPetHelper.FROM_TYPE2 then
		local info1 = {des = Lang.get("pet_list_cell_level_des"), value = Lang.get("pet_txt_level", {level = petData:getLevel()})}
		
		local info2 = {des = Lang.get("pet_list_cell_star_des"), value = Lang.get("pet_txt_star_level", {level= petData:getStar()})}
		table.insert(desValue, info1)
		table.insert(desValue, info2)
	end
	cellData.desValue = desValue

	return cellData
end

--获取总体描述信息（左下角）
function PopupCheckPetHelper.getTotalDesInfo(fromType, foodData)
	local result = {}

	if fromType == PopupCheckPetHelper.FROM_TYPE1 then
		
	elseif fromType == PopupCheckPetHelper.FROM_TYPE2 then
		
	end

	return result
end

function PopupCheckPetHelper._FROM_TYPE2()
	local data = G_UserData:getPet():getRecoveryList()
	return data
end



function PopupCheckPetHelper.getMaxCount(fromType)
	if fromType == PopupCheckPetHelper.FROM_TYPE1 then
		local userLevel = G_UserData:getBase():getLevel()
		local maxCount = userLevel < 50 and 6 or 10
		return maxCount
	elseif fromType == PopupCheckPetHelper.FROM_TYPE2 then
		local RecoveryConst = require("app.const.RecoveryConst")
		return RecoveryConst.RECOVERY_PET_MAX
	end
end

return PopupCheckPetHelper