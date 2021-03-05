
local PopupChooseHistoryHeroHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

PopupChooseHistoryHeroHelper.FROM_TYPE1 = 1 --穿戴 “+”点进来
PopupChooseHistoryHeroHelper.FROM_TYPE2 = 2 --更换
PopupChooseHistoryHeroHelper.FROM_TYPE3 = 3 --护佑

PopupChooseHistoryHeroHelper.FROM_TYPE4 = 4 --从“重生”点进来


local BTN_DES = {
	[1] = "historyhero_choose_btn_type1",
	[2] = "historyhero_choose_btn_type2",
	[3] = "historyhero_choose_btn_type3",
	[4] = "historyhero_choose_btn_type4",
}

function PopupChooseHistoryHeroHelper.addDataDesc(data, fromType, index, pos)
	if data == nil then
		return nil
	end
	
	local cellData = clone(data)
	cellData.btnDesc = Lang.get(BTN_DES[fromType])
	cellData.btnIsHightLight = false
	cellData.btnEnable = true
	cellData.btnShowRP = false
	cellData.topImagePath = ""
	return cellData
end

function PopupChooseHistoryHeroHelper._FROM_TYPE1(param)
	local list = G_UserData:getHistoryHero():getReplaceDataBySort()
	return list
end

function PopupChooseHistoryHeroHelper._FROM_TYPE2(param)
	local id = unpack(param)
	if id and id > 0 then
		local unitData = G_UserData:getHistoryHero():getUnitDataWithId(id)
		local baseId = unitData:getBase_id()
		local list = G_UserData:getHistoryHero():getReplaceDataBySort(baseId)
		return list
	else
		local list = G_UserData:getHistoryHero():getReplaceDataBySort()
		return list
	end

end

function PopupChooseHistoryHeroHelper._FROM_TYPE3(param)
	return PopupChooseHistoryHeroHelper._FROM_TYPE2(param)
end

function PopupChooseHistoryHeroHelper._FROM_TYPE4(param)
	local list = G_UserData:getHistoryHero():getRebornList()
	return list
end


function PopupChooseHistoryHeroHelper.checkIsEmpty(fromType, param)
	local func = PopupChooseHistoryHeroHelper["_FROM_TYPE"..fromType]
	if func and type(func) == "function" then
		local dataList = func(param)
		return #dataList == 0
	end
	return true
end

return PopupChooseHistoryHeroHelper