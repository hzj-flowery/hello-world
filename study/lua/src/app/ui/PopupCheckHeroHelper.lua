--
-- Author: Liangxu
-- Date: 2017-07-15 15:40:28
-- 
local PopupCheckHeroHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

PopupCheckHeroHelper.FROM_TYPE1 = 1 --从“武将升级”点进来
PopupCheckHeroHelper.FROM_TYPE2 = 2 --从“武将回收”点进来
PopupCheckHeroHelper.FROM_TYPE3 = 3 --从“武将置换”点进来

function PopupCheckHeroHelper.addHeroDataDesc(heroData, fromType)
	if heroData == nil then
		return nil
	end

	local cellData = clone(heroData)
	cellData.isYoke = false
	local desValue = {}
	if fromType == PopupCheckHeroHelper.FROM_TYPE1 then
		local info1 = {des = Lang.get("hero_check_cell_des_1"), value = Lang.get("hero_check_cell_value_1", {level = heroData:getLevel()})}
		local info2 = {des = Lang.get("hero_check_cell_des_2"), value = heroData:getConfig().exp, colorValue = Colors.BRIGHT_BG_GREEN}
		table.insert(desValue, info1)
		table.insert(desValue, info2)
	elseif fromType == PopupCheckHeroHelper.FROM_TYPE2 then
		local info1 = {des = Lang.get("hero_list_cell_level_des"), value = Lang.get("hero_txt_level", {level = heroData:getLevel()})}
		local awakeStar, awakeLevel = UserDataHelper.convertAwakeLevel(heroData:getAwaken_level())
		local info2 = {des = Lang.get("hero_list_cell_awake_des"), value = Lang.get("hero_awake_star_level", {star = awakeStar, level = awakeLevel})}
		table.insert(desValue, info1)
		table.insert(desValue, info2)
		cellData.isYoke = UserDataHelper.isHaveYokeWithHeroBaseId(heroData:getBase_id())
	elseif fromType == PopupCheckHeroHelper.FROM_TYPE3 then
		local info1 = {des = Lang.get("hero_list_cell_level_des"), value = Lang.get("hero_txt_level", {level = heroData:getLevel()})}
		local awakeStar, awakeLevel = UserDataHelper.convertAwakeLevel(heroData:getAwaken_level())
		local info2 = {des = Lang.get("hero_list_cell_awake_des"), value = Lang.get("hero_awake_star_level", {star = awakeStar, level = awakeLevel})}
		table.insert(desValue, info1)
		table.insert(desValue, info2)
		local yokeCount = UserDataHelper.getWillActivateYokeCount(heroData:getBase_id())
		cellData.isYoke = yokeCount > 0
	end
	cellData.desValue = desValue

	return cellData
end

--获取总体描述信息（左下角）
function PopupCheckHeroHelper.getTotalDesInfo(fromType, foodData)
	local result = {}

	if fromType == PopupCheckHeroHelper.FROM_TYPE1 then
		
	elseif fromType == PopupCheckHeroHelper.FROM_TYPE2 then
		
	end

	return result
end

function PopupCheckHeroHelper._FROM_TYPE2()
	local data = G_UserData:getHero():getRecoveryList()
	return data
end

function PopupCheckHeroHelper._FROM_TYPE3()
	local data = G_UserData:getHero():getTransformSrcList()
	return data
end

function PopupCheckHeroHelper.getMaxCount(fromType)
	if fromType == PopupCheckHeroHelper.FROM_TYPE1 then
		local userLevel = G_UserData:getBase():getLevel()
		local maxCount = userLevel < 50 and 6 or 10
		return maxCount
	elseif fromType == PopupCheckHeroHelper.FROM_TYPE2 then
		local RecoveryConst = require("app.const.RecoveryConst")
		return RecoveryConst.RECOVERY_HERO_MAX
	end
end

return PopupCheckHeroHelper