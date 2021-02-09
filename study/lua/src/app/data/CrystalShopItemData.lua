-- Author: nieming
-- Date:2018-02-07 16:09:56
-- Describle：

local BaseData = require("app.data.BaseData")
local CrystalShopItemData = class("CrystalShopItemData", BaseData)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local FunctionLevelConfig = require("app.config.function_level")
local UserCheck = require("app.utils.logic.UserCheck")

local schema = {}
schema["id"] = {"number", 0}
schema["value"] = {"number",0}
schema["buy_count"] = {"number", 0}
schema["awards"] = {"table",{}}
schema["pay_amount"] = {"number", 0}
schema["pay_type"] = {"number", 0}
schema["description"] = {"string", ""}
schema["is_function"] = {"number", 0}
schema["is_work"] = {"number", 0}
schema["page"] = {"number", 0}
schema["buy_size"] = {"number", 0}
schema["function_id"] = {"number", 0}
--schema
CrystalShopItemData.schema = schema


CrystalShopItemData.PAGE_RECHARGE = 2	-- 充值水晶标签页

function CrystalShopItemData:ctor(properties)
	CrystalShopItemData.super.ctor(self, properties)
end

function CrystalShopItemData:isAlreadGet(page)
	if page == CrystalShopItemData.PAGE_RECHARGE then
		return self:getBuy_count() >= self:getBuy_size()
	else
		return self:getBuy_count() > 0
	end
end

function CrystalShopItemData:canGet(page)
	-- return false
	if page == CrystalShopItemData.PAGE_RECHARGE then
		return self:getBuy_count() < self:getValue()
	else
		return self:getValue() >= self:getPay_amount()
	end
end

function CrystalShopItemData:canShow()
	if self:getIs_work() == 0 then
		return false
	end

	local functionConfig = FunctionLevelConfig.get(self:getFunction_id())
	local TimeConst = require("app.const.TimeConst")
	if not functionConfig or UserCheck.enoughOpenDay(functionConfig.day, TimeConst.RESET_TIME_24) == false then
		return false
	end

	local funcId = self:getIs_function()
	if funcId and funcId ~= 0 then
		local isOpen = LogicCheckHelper.funcIsOpened(funcId)
		if not isOpen then
			return false
		end
	end

	if funcId == FunctionConst.FUNC_COUNTRY_BOSS then
		local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
		return CountryBossHelper.isTodayOpen()
	elseif funcId == FunctionConst.FUNC_CAMP_RACE then
		local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
		return CampRaceHelper.isOpenToday()
	elseif funcId == FunctionConst.FUNC_GUILD_SERVER_ANSWER then
		local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
		return GuildServerAnswerHelper.isTodayOpen()
	elseif funcId == FunctionConst.FUNC_GUILD_ANSWER then
		local GuildAnswerHelper = require("app.scene.view.guildAnswer.GuildAnswerHelper")
		return GuildAnswerHelper.isTodayOpen()
	end

	return true
end

function CrystalShopItemData:clear()

end

function CrystalShopItemData:reset()

end



return CrystalShopItemData
