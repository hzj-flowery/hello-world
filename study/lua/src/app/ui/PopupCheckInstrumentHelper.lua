--
-- Author: Liangxu
-- Date: 2017-9-19 15:04:35
-- 
local PopupCheckInstrumentHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")

PopupCheckInstrumentHelper.FROM_TYPE1 = 1 --从“神兵回收”点进来
PopupCheckInstrumentHelper.FROM_TYPE2 = 2 --从“神兵置换”点进来

function PopupCheckInstrumentHelper.addInstrumentDataDesc(data, fromType)
	if data == nil then
		return nil
	end

	local cellData = clone(data)
	local desValue = {}
	if fromType == PopupCheckInstrumentHelper.FROM_TYPE1 or fromType == PopupCheckInstrumentHelper.FROM_TYPE2 then
		local info = UserDataHelper.getInstrumentAttrInfo(data)
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
function PopupCheckInstrumentHelper.getTotalDesInfo(fromType, foodData)
	local result = {}

	if fromType == PopupCheckInstrumentHelper.FROM_TYPE1 then
		
	end

	return result
end

--获取已选择数量


function PopupCheckInstrumentHelper._FROM_TYPE1()
	local data = G_UserData:getInstrument():getRecoveryList()
	return data
end

function PopupCheckInstrumentHelper._FROM_TYPE2()
	local data = G_UserData:getInstrument():getTransformSrcList()
	return data
end

function PopupCheckInstrumentHelper.getMaxCount(fromType)
	if fromType == PopupCheckInstrumentHelper.FROM_TYPE1 then
		local RecoveryConst = require("app.const.RecoveryConst")
		return RecoveryConst.RECOVERY_INSTRUMENT_MAX
	end
end

return PopupCheckInstrumentHelper