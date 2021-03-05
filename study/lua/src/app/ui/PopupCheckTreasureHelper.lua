--
-- Author: Liangxu
-- Date: 2017-07-17 14:47:08
--
local PopupCheckTreasureHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
local TextHelper = require("app.utils.TextHelper")
local RecoveryConst = require("app.const.RecoveryConst")

PopupCheckTreasureHelper.FROM_TYPE1 = 1 --从“宝物回收”点进来
PopupCheckTreasureHelper.FROM_TYPE2 = 2 --从“宝物置换”点进来

function PopupCheckTreasureHelper.addTreasureDataDesc(data, fromType)
	if data == nil then
		return nil
	end

	local cellData = clone(data)
	local desValue = {}
	if fromType == PopupCheckTreasureHelper.FROM_TYPE1 or PopupCheckTreasureHelper.FROM_TYPE2 then
		local info = UserDataHelper.getTreasureAttrInfo(data)
		local desInfo = TextHelper.getAttrInfoBySort(info)
		for i, one in ipairs(desInfo) do
			local attrName, attrValue = TextHelper.getAttrBasicText(one.id, one.value)
			attrName = TextHelper.expandTextByLen(attrName, 4)
			local info = {des = attrName, value = "+"..attrValue, colorValue = Colors.BRIGHT_BG_GREEN}
			table.insert(desValue, info)
		end
	end
	cellData.desValue = desValue

	return cellData
end

--获取总体描述信息（左下角）
function PopupCheckTreasureHelper.getTotalDesInfo(fromType, foodData)
	local result = {}

	-- if fromType == PopupCheckHeroHelper.FROM_TYPE1 then
		
	-- end

	return result
end

function PopupCheckTreasureHelper._FROM_TYPE1()
	local data = G_UserData:getTreasure():getRecoveryList()
	return data
end

function PopupCheckTreasureHelper._FROM_TYPE2()
	local data = G_UserData:getTreasure():getTransformList()
	-- local data = G_UserData:getTreasure():getRecoveryList()
	return data
end

function PopupCheckTreasureHelper.getMaxCount(fromType)
	if fromType == PopupCheckTreasureHelper.FROM_TYPE1 then
		return RecoveryConst.RECOVERY_TREASURE_MAX
	end
end

return PopupCheckTreasureHelper