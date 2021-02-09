--
-- Author: Liangxu
-- Date: 2017-07-17 13:37:28
-- 
local PopupCheckEquipHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")

PopupCheckEquipHelper.FROM_TYPE1 = 1 --从“装备回收”点进来

function PopupCheckEquipHelper.addEquipDataDesc(data, fromType)
	if data == nil then
		return nil
	end

	local cellData = clone(data)
	local desValue = {}
	if fromType == PopupCheckEquipHelper.FROM_TYPE1 then
		local info = UserDataHelper.getEquipAttrInfo(data)
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
function PopupCheckEquipHelper.getTotalDesInfo(fromType, foodData)
	local result = {}

	if fromType == PopupCheckEquipHelper.FROM_TYPE1 then
		
	end

	return result
end

--获取已选择数量


function PopupCheckEquipHelper._FROM_TYPE1()
	local data = G_UserData:getEquipment():getRecoveryList()
	return data
end

function PopupCheckEquipHelper.getMaxCount(fromType)
	if fromType == PopupCheckEquipHelper.FROM_TYPE1 then
		local RecoveryConst = require("app.const.RecoveryConst")
		return RecoveryConst.RECOVERY_EQUIP_MAX
	end
end

return PopupCheckEquipHelper