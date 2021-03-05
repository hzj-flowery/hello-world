--
-- Author: JerryHe
-- Date: 2019-01-29
-- 
local PopupCheckHorseEquipHelper = {}
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")

PopupCheckHorseEquipHelper.FROM_TYPE1 = 1 --从“装备回收”点进来

function PopupCheckHorseEquipHelper.addEquipDataDesc(data, fromType)
	if data == nil then
		return nil
	end

	local cellData = clone(data)
	local desValue = {}
	if fromType == PopupCheckHorseEquipHelper.FROM_TYPE1 then
		local info = HorseEquipDataHelper.getHorseEquipAttrInfo(data)
		local desInfo = TextHelper.getAttrInfoBySort(info)

		for i = 1, 2 do
			local one = desInfo[i]
			if one then
				local attrName, attrValue = TextHelper.getAttrBasicText(one.id, one.value)
				attrName = TextHelper.expandTextByLen(attrName, 4)
				local info = {des = attrName, value = "+"..attrValue, colorValue = Colors.BRIGHT_BG_GREEN}
				table.insert(desValue, info)
			end
		end
	end
	cellData.desValue = desValue

	return cellData
end



--获取总体描述信息（左下角）
function PopupCheckHorseEquipHelper.getTotalDesInfo(fromType, foodData)
	local result = {}

	if fromType == PopupCheckHorseEquipHelper.FROM_TYPE1 then
		
	end

	return result
end

--获取已选择数量


function PopupCheckHorseEquipHelper._FROM_TYPE1()
	local data = G_UserData:getHorseEquipment():getAllRecoveryHorseEquipments()
	return data
end

function PopupCheckHorseEquipHelper.getMaxCount(fromType)
	if fromType == PopupCheckHorseEquipHelper.FROM_TYPE1 then
		local RecoveryConst = require("app.const.RecoveryConst")
		return RecoveryConst.RECOVERY_HORSE_EQUIP_MAX
	end
end

return PopupCheckHorseEquipHelper