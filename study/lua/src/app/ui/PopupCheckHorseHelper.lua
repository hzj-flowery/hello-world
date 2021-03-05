--
-- Author: Liangxu
-- Date: 2018-8-30
-- 
local PopupCheckHorseHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")

PopupCheckHorseHelper.FROM_TYPE1 = 1 --从“回收”点进来

function PopupCheckHorseHelper.addHorseDataDesc(data, fromType)
	if data == nil then
		return nil
	end

	local cellData = clone(data)
	if fromType == PopupCheckHorseHelper.FROM_TYPE1 then
		
	end

	return cellData
end



--获取总体描述信息（左下角）
function PopupCheckHorseHelper.getTotalDesInfo(fromType, foodData)
	local result = {}

	if fromType == PopupCheckHorseHelper.FROM_TYPE1 then
		
	end

	return result
end

--获取已选择数量


function PopupCheckHorseHelper._FROM_TYPE1()
	local data = G_UserData:getHorse():getRecoveryList()
	return data
end

function PopupCheckHorseHelper.getMaxCount(fromType)
	if fromType == PopupCheckHorseHelper.FROM_TYPE1 then
		local RecoveryConst = require("app.const.RecoveryConst")
		return RecoveryConst.RECOVERY_HORSE_MAX
	end
end

return PopupCheckHorseHelper