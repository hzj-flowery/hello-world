--
-- Author: hedili
-- Date: 2018-02-02 15:23:31
-- 选择神兽帮助类
local PopupChoosePetHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

PopupChoosePetHelper.FROM_TYPE1 = 1 --穿戴 “+”点进来
PopupChoosePetHelper.FROM_TYPE2 = 2 --更换
PopupChoosePetHelper.FROM_TYPE3 = 3 --护佑

PopupChoosePetHelper.FROM_TYPE4 = 4 --从“神兽重生”点进来


local BTN_DES = {
	[1] = "pet_choose_btn_type1",
	[2] = "pet_choose_btn_type2",
	[3] = "pet_choose_btn_type3",
	[4] = "pet_choose_btn_type4",
}

function PopupChoosePetHelper.addPetDataDesc(petData, fromType, showRP, curEquipUnitData, pos)
	if petData == nil then
		return nil
	end
	
	local cellData = clone(petData)
	cellData.btnDesc = Lang.get(BTN_DES[fromType])
	cellData.btnIsHightLight = false
	cellData.btnEnable = true
	cellData.btnShowRP = false
	cellData.topImagePath = ""
	return cellData
end

function PopupChoosePetHelper._FROM_TYPE1(data)
	dump(data)
	local petData = G_UserData:getPet():getReplaceDataBySort()
	return petData
end

function PopupChoosePetHelper._FROM_TYPE2(param)

	local petId = unpack(param)
	if petId and petId > 0 then
		local unitPetData = G_UserData:getPet():getUnitDataWithId(petId)
		local baseId = unitPetData:getBase_id()
		local petData = G_UserData:getPet():getReplaceDataBySort(baseId)
		return petData
	else
		local petData = G_UserData:getPet():getReplaceDataBySort()
		return petData
	end

end

function PopupChoosePetHelper._FROM_TYPE3(param)
	return PopupChoosePetHelper._FROM_TYPE2(param)
end

function PopupChoosePetHelper._FROM_TYPE4(param)
	PopupChoosePetHelper._beReplacedPos = nil
	local heroData = G_UserData:getPet():getRebornList()
	return heroData
end



function PopupChoosePetHelper.checkIsEmpty(fromType, param)
	local func = PopupChoosePetHelper["_FROM_TYPE"..fromType]
	if func and type(func) == "function" then
		local petData = func(param)
		return #petData == 0
	end
	return true
end

return PopupChoosePetHelper