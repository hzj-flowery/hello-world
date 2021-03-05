--其它玩家详情数据封装类
local UserDetailDataHelper = {}
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local EquipDataHelper = require("app.utils.data.EquipDataHelper")
local TreasureDataHelper = require("app.utils.data.TreasureDataHelper")
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local MasterConst = require("app.const.MasterConst")
local AttributeConst = require("app.const.AttributeConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local PetDataHelper = require("app.utils.data.PetDataHelper")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local HomelandConst = require("app.const.HomelandConst")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local HeroConst = require("app.const.HeroConst")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")


function UserDetailDataHelper.getOtherUserTotalAttr(heroUnitData, userDetailData)
	local result = {}
	local level = heroUnitData:getLevel()
	local rank = heroUnitData:getRank_lv()

	local attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData:getConfig(), level)
	local attr2 = HeroDataHelper.getBreakAttr(heroUnitData)
	local attr3 = HeroDataHelper.getLimitAttr(heroUnitData)
	local attr4 = HeroDataHelper.getAwakeAttr(heroUnitData)
	local attr5 = UserDetailDataHelper.getOtherUserEquipAttr(heroUnitData, userDetailData)
	local attr6 = UserDetailDataHelper.getOtherUserTreasureAttr(heroUnitData, userDetailData)
	local attr7 = UserDetailDataHelper.getOtherUserInstrumentAttr(heroUnitData, userDetailData)
	local attr8 = UserDetailDataHelper.getOtherUserMasterAttr(heroUnitData, userDetailData)
	local attr9 = HeroDataHelper.getOfficialAttr(userDetailData:getOfficeLevel())
	local attr10 = UserDetailDataHelper.getOtherKarmaAttrRatio(heroUnitData, userDetailData)
	local attr11 = HeroDataHelper.getYokeAttrRatio(heroUnitData)
	local attr12 = UserDetailDataHelper.getOtherTalentAttr(heroUnitData, rank, userDetailData)
	local attr13 = UserDetailDataHelper.getOtherInstrumentTalentAttr(heroUnitData, userDetailData)
	local attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData)
	local attr15 = UserDetailDataHelper.getOtherAvatarAttr(heroUnitData, userDetailData)
	local attr16 = UserDetailDataHelper.getOtherAvatarShowAttr(heroUnitData, userDetailData)
	local attr17 = UserDetailDataHelper.getOtherPetHelpAttr(userDetailData)
	local attr18 = UserDetailDataHelper.getOtherPetMapAttr(userDetailData)
	local attr19 = UserDetailDataHelper.getOtherSilkbagAttr(heroUnitData, userDetailData)
	local attr20 = UserDetailDataHelper.getOtherHomelandAttr(heroUnitData, userDetailData)
	local attr21 = UserDetailDataHelper.getOtherHaloAttr(heroUnitData, rank, userDetailData)
	local attr22 = UserDetailDataHelper.getOtherUserHorseAttr(heroUnitData, userDetailData)
	local attr23 = UserDetailDataHelper.getOtherHorseKarmaAttr(userDetailData)
	local attr24 = UserDetailDataHelper.getOtherHistoryHeroAttr(heroUnitData, userDetailData)
    local attr25 = UserDetailDataHelper.getOtherTacticsAttr(heroUnitData, userDetailData)
    local attr26 = UserDetailDataHelper.getOtherBoutAttr(heroUnitData, userDetailData)

	-- dump(attr1, "======================================1")
	-- dump(attr2, "======================================2")
	-- dump(attr3, "======================================3")
	-- dump(attr4, "======================================4")
	-- dump(attr5, "======================================5")
	-- dump(attr6, "======================================6")
	-- dump(attr7, "======================================7")
	-- dump(attr8, "======================================8")
	-- dump(attr9, "======================================9")
	-- dump(attr10, "======================================10")
	-- dump(attr11, "======================================11")
	-- dump(attr12, "======================================12")
	-- dump(attr13, "======================================13")
	-- dump(attr14, "======================================14")
	-- dump(attr15, "======================================15")
	-- dump(attr16, "======================================16")
	-- dump(attr17, "======================================17")
	-- dump(attr18, "======================================18")
	-- dump(attr19, "======================================19")
	-- dump(attr20, "======================================20")
	-- dump(attr21, "======================================21")
	-- dump(attr22, "======================================22")
	-- dump(attr23, "======================================23")

	AttrDataHelper.appendAttr(result, attr1)
	AttrDataHelper.appendAttr(result, attr2)
	AttrDataHelper.appendAttr(result, attr3)
	AttrDataHelper.appendAttr(result, attr4)
	AttrDataHelper.appendAttr(result, attr5)
	AttrDataHelper.appendAttr(result, attr6)
	AttrDataHelper.appendAttr(result, attr7)
	AttrDataHelper.appendAttr(result, attr8)
	AttrDataHelper.appendAttr(result, attr9)
	AttrDataHelper.appendAttr(result, attr10)
	AttrDataHelper.appendAttr(result, attr11)
	AttrDataHelper.appendAttr(result, attr12)
	AttrDataHelper.appendAttr(result, attr13)
	AttrDataHelper.appendAttr(result, attr14)
	AttrDataHelper.appendAttr(result, attr15)
	AttrDataHelper.appendAttr(result, attr16)
	AttrDataHelper.appendAttr(result, attr17)
	AttrDataHelper.appendAttr(result, attr18)
	AttrDataHelper.appendAttr(result, attr19)
	AttrDataHelper.appendAttr(result, attr20)
	AttrDataHelper.appendAttr(result, attr21)
	AttrDataHelper.appendAttr(result, attr22)
	AttrDataHelper.appendAttr(result, attr23)
	AttrDataHelper.appendAttr(result, attr24)
    AttrDataHelper.appendAttr(result, attr25)
    AttrDataHelper.appendAttr(result, attr26)

	AttrDataHelper.processDefAndAddition(result)

	return result
end

function UserDetailDataHelper.getOtherUserEquipAttr(heroUnitData, userDetailData, isPower)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	if pos == nil then
		return result
	end

	local equipDatas = userDetailData:getEquipDatasWithPos(pos)
	for i, equipData in ipairs(equipDatas) do
		local attrInfo = EquipDataHelper.getEquipAttrInfo(equipData)
		for k, value in pairs(attrInfo) do
			if result[k] == nil then
				result[k] = 0
			end
			result[k] = result[k] + value
		end
		local jadeAttr = UserDetailDataHelper.getOtherUserJadeAttr(equipData, heroUnitData, isPower, userDetailData)
		for k, value in pairs(jadeAttr) do
			if result[k] == nil then
				result[k] = 0
			end
			result[k] = result[k] + value
		end
	end

	local suitAttr = UserDetailDataHelper.getOtherEquipSuitAttr(userDetailData, equipDatas, pos)
	for k, value in pairs(suitAttr) do
		if result[k] == nil then
			result[k] = 0
		end
		result[k] = result[k] + value
	end

	return result
end

function UserDetailDataHelper.getOtherUserJadeAttr(data, heroUnitData, isPower, userDetailData)
	local result = {}
	local level = heroUnitData:getLevel()
	local jadeSysIds = data:getUserDetailJades() or {}
	local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
	local AttributeConst = require("app.const.AttributeConst")
	local power = 0
	for k, sysId in pairs(jadeSysIds) do
		if sysId > 0 then
			local heroBaseId = heroUnitData:getAvatarToHeroBaseIdByAvatarId(userDetailData:getAvatarBaseId())
			local config = EquipJadeHelper.getJadeConfig(sysId)
			if config and EquipJadeHelper.isSuitableHero(config, heroBaseId) then
				local cfg = config
				if not isPower then
					local size = EquipJadeHelper.getRealAttrValue(cfg, level)
					if cfg.type ~= 0 then
						AttrDataHelper.formatAttr(result, cfg.type, size)
					end
				else
					AttrDataHelper.formatAttr(result, AttributeConst.JADE_POWER, cfg.fake)
				end
			end
		end
	end
	return result
end

function UserDetailDataHelper.getOtherEquipSuitAttr(userDetailData, equipDatas, pos)
	local temp = {}

	for i, equipData in ipairs(equipDatas) do
		local equipConfig = equipData:getConfig()
		local suitId = equipConfig.suit_id

		if suitId > 0 and temp[suitId] == nil then --有套装配置，还没计算过此套装Id对应的属性，避免重复计算
			local componentCount = 0
			local componentIds = EquipDataHelper.getSuitComponentIds(suitId)
			for j, id in ipairs(componentIds) do
				local isHave = userDetailData:isHaveEquipInPos(id, pos)
				if isHave then
					componentCount = componentCount + 1
				end
			end

			local attrInfo = EquipDataHelper.getSuitAttrShowInfo(suitId)
			for j, one in ipairs(attrInfo) do
				local count = one.count
				if componentCount >= count then
					if temp[suitId] == nil then
						temp[suitId] = {}
					end
					local info = one.info
					for j, data in ipairs(info) do
						if temp[suitId][data.type] == nil then
							temp[suitId][data.type] = 0
						end
						temp[suitId][data.type] = temp[suitId][data.type] + data.value
					end
				end
			end
		end
	end

	local result = {}
	for k, one in pairs(temp) do
		for type, value in pairs(one) do
			if result[type] == nil then
				result[type] = 0
			end
			result[type] = result[type] + value
		end
	end

	return result
end

function UserDetailDataHelper.getOtherUserTreasureAttr(heroUnitData, userDetailData, isPower)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	if pos == nil or pos == 0 then
		return result
	end

	local treasureDatas = userDetailData:getTreasureDatasWithPos(pos)
	for i, treasureData in ipairs(treasureDatas) do
		local attrInfo = TreasureDataHelper.getTreasureAttrInfo(treasureData)
		for k, value in pairs(attrInfo) do
			if result[k] == nil then
				result[k] = 0
			end
			result[k] = result[k] + value
		end
		local jadeAttr = UserDetailDataHelper.getOtherUserJadeAttr(treasureData, heroUnitData, isPower, userDetailData)
		for k, value in pairs(jadeAttr) do
			if result[k] == nil then
				result[k] = 0
			end
			result[k] = result[k] + value
		end
	end
	return result
end

function UserDetailDataHelper.getOtherUserInstrumentAttr(heroUnitData, userDetailData)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	if pos == nil or pos == 0 then
		return result
	end

	local instrumentDatas = userDetailData:getInstrumentDatasWithPos(pos)
	for i, instrumentData in ipairs(instrumentDatas) do
		local attrInfo = InstrumentDataHelper.getInstrumentAttrInfo(instrumentData)
		for k, value in pairs(attrInfo) do
			if result[k] == nil then
				result[k] = 0
			end
			result[k] = result[k] + value
		end
	end
	return result
end

function UserDetailDataHelper.getOtherUserMasterAttr(heroUnitData, userDetailData)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	if pos == nil or pos == 0 then
		return result
	end

	local strengthenEquipAttr = UserDetailDataHelper.getOtherMasterEquipStrengthenAttr(userDetailData, pos)
	local refineEquipAttr = UserDetailDataHelper.getOtherMasterEquipRefineAttr(userDetailData, pos)
	local strengthenTreasureAttr = UserDetailDataHelper.getOtherMasterTreasureUpgradeAttr(userDetailData, pos)
	local refineTreasureAttr = UserDetailDataHelper.getOtherMasterTreasureRefineAttr(userDetailData, pos)

	AttrDataHelper.appendAttr(result, strengthenEquipAttr)
	AttrDataHelper.appendAttr(result, refineEquipAttr)
	AttrDataHelper.appendAttr(result, strengthenTreasureAttr)
	AttrDataHelper.appendAttr(result, refineTreasureAttr)

	return result
end

function UserDetailDataHelper.getOtherMasterEquipStrengthenAttr(userDetailData, pos)
	local curAttr = {}

	local equipIds = userDetailData:getEquipInfoWithPos(pos)
	local minLevel = nil
	for i = 1, 4 do
		local equipId = equipIds[i]
		local level = nil
		if equipId then
			local equipData = userDetailData:getEquipDataWithId(equipId)
			level = equipData:getLevel()
		else
			level = 0
		end
		if minLevel == nil then
			minLevel = level
		end
		if level < minLevel then
			minLevel = level
		end
	end

	local masterConfig = require("app.config.equipment_master")
	for i = 1, masterConfig.length() do
		local info = masterConfig.indexOf(i)
		if info.equip_type == MasterConst.MASTER_TYPE_1 then
			if minLevel >= info.equip_value then
				for j = 1, 4 do
					local attrType = info["master_type" .. j]
					if attrType > 0 then
						local attrValue = info["master_value" .. j]
						if curAttr[attrType] == nil then
							curAttr[attrType] = 0
						end
						curAttr[attrType] = curAttr[attrType] + attrValue
					end
				end
			else
				break
			end
		end
	end
	return curAttr
end

function UserDetailDataHelper.getOtherMasterEquipRefineAttr(userDetailData, pos)
	local curAttr = {}

	local equipIds = userDetailData:getEquipInfoWithPos(pos)
	local minLevel = nil
	for i = 1, 4 do
		local equipId = equipIds[i]
		local level = nil
		if equipId then
			local equipData = userDetailData:getEquipDataWithId(equipId)
			level = equipData:getR_level()
		else
			level = 0
		end
		if minLevel == nil then
			minLevel = level
		end
		if level < minLevel then
			minLevel = level
		end
	end

	local masterConfig = require("app.config.equipment_master")
	for i = 1, masterConfig.length() do
		local info = masterConfig.indexOf(i)
		if info.equip_type == MasterConst.MASTER_TYPE_2 then
			if minLevel >= info.equip_value then
				for j = 1, 4 do
					local attrType = info["master_type" .. j]
					if attrType > 0 then
						local attrValue = info["master_value" .. j]
						if curAttr[attrType] == nil then
							curAttr[attrType] = 0
						end
						curAttr[attrType] = curAttr[attrType] + attrValue
					end
				end
			else
				break
			end
		end
	end

	return curAttr
end

function UserDetailDataHelper.getOtherMasterTreasureUpgradeAttr(userDetailData, pos)
	local curAttr = {}

	local treasureIds = userDetailData:getTreasureInfoWithPos(pos)
	local minLevel = nil
	for i = 1, 2 do
		local treasureId = treasureIds[i]
		local level = nil
		if treasureId then
			local treasureData = userDetailData:getTreasureDataWithId(treasureId)
			level = treasureData:getLevel()
		else
			level = 0
		end
		if minLevel == nil then
			minLevel = level
		end
		if level < minLevel then
			minLevel = level
		end
	end

	local masterConfig = require("app.config.equipment_master")
	for i = 1, masterConfig.length() do
		local info = masterConfig.indexOf(i)
		if info.equip_type == MasterConst.MASTER_TYPE_3 then
			if minLevel >= info.equip_value then
				for j = 1, 4 do
					local attrType = info["master_type" .. j]
					if attrType > 0 then
						local attrValue = info["master_value" .. j]
						if curAttr[attrType] == nil then
							curAttr[attrType] = 0
						end
						curAttr[attrType] = curAttr[attrType] + attrValue
					end
				end
			else
				break
			end
		end
	end

	return curAttr
end

function UserDetailDataHelper.getOtherMasterTreasureRefineAttr(userDetailData, pos)
	local curAttr = {}

	local treasureIds = userDetailData:getTreasureInfoWithPos(pos)
	local minLevel = nil
	for i = 1, 2 do
		local treasureId = treasureIds[i]
		local level = nil
		if treasureId then
			local treasureData = userDetailData:getTreasureDataWithId(treasureId)
			level = treasureData:getRefine_level()
		else
			level = 0
		end
		if minLevel == nil then
			minLevel = level
		end
		if level < minLevel then
			minLevel = level
		end
	end

	local masterConfig = require("app.config.equipment_master")
	for i = 1, masterConfig.length() do
		local info = masterConfig.indexOf(i)
		if info.equip_type == MasterConst.MASTER_TYPE_4 then
			if minLevel >= info.equip_value then
				for j = 1, 4 do
					local attrType = info["master_type" .. j]
					if attrType > 0 then
						local attrValue = info["master_value" .. j]
						if curAttr[attrType] == nil then
							curAttr[attrType] = 0
						end
						curAttr[attrType] = curAttr[attrType] + attrValue
					end
				end
			else
				break
			end
		end
	end

	return curAttr
end

function UserDetailDataHelper.getOtherKarmaAttrRatio(heroUnitData, userDetailData)
	local heroConfig = heroUnitData:getConfig()
	local result = {}
	for i = 1, HeroConst.HERO_KARMA_MAX do
		local friendId = heroConfig["friend_" .. i]
		if friendId > 0 then
			if userDetailData:isKarmaActivated(friendId) then
				local friendConfig = HeroDataHelper.getHeroFriendConfig(friendId)
				local attrId = friendConfig.talent_attr
				local attrValue = friendConfig.talent_value
				if result[attrId] == nil then
					result[attrId] = 0
				end
				result[attrId] = result[attrId] + attrValue
			end
		end
	end
	return result
end

function UserDetailDataHelper.getOtherTalentAttr(heroUnitData, rank, userDetailData)
	local result = {}

	local heroBaseId = heroUnitData:getBase_id()
	local limitLevel = heroUnitData:getLimit_level()
	local limitRedLevel = heroUnitData:getLimit_rtg()
	if heroUnitData:isLeader() and userDetailData:isEquipAvatar() then
		local avatarId = userDetailData:getAvatarId()
		local avatarBaseId = userDetailData:getAvatarBaseId()
		local unitData = userDetailData:getAvatarUnitDataWithId(avatarId)
		heroBaseId = unitData:getConfig().hero_id
		local limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit
		if limit == 1 then
			limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
		end
	end

	for i = 1, rank do
		local info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel)
		if info then
			local target = info.talent_target
			if target == 1 then --对自己
				for j = 1, 2 do
					local attrId = info["talent_attr_" .. j]
					local attrValue = info["talent_value_" .. j]
					AttrDataHelper.formatAttr(result, attrId, attrValue)
				end
			end
		end
	end

	if userDetailData:isInBattle(heroUnitData) then
		local heroId = heroUnitData:getId()
		local heroDatas = userDetailData:getHeroDataInBattle()
		for i, unit in ipairs(heroDatas) do
			local baseId = unit:getBase_id()
			local limitLevel = unit:getLimit_level()
			local limitRedLevel = unit:getLimit_rtg()
			if unit:isLeader() and userDetailData:isEquipAvatar() then
				local avatarId = userDetailData:getAvatarId()
				local avatarBaseId = userDetailData:getAvatarBaseId()
				local unitData = userDetailData:getAvatarUnitDataWithId(avatarId)
				baseId = unitData:getConfig().hero_id
				local limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit
				if limit == 1 then
					limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
				end
			end

			local rLv = unit:getRank_lv()
			for j = 1, rLv do
				local info = HeroDataHelper.getHeroRankConfig(baseId, j, limitLevel, limitRedLevel)
				if info then
					local tar = info.talent_target
					if tar == 2 then --对上阵武将
						for k = 1, 2 do
							local attrId = info["talent_attr_" .. k]
							local attrValue = info["talent_value_" .. k]
							AttrDataHelper.formatAttr(result, attrId, attrValue)
						end
					end
				end
			end
		end
	end

	return result
end

function UserDetailDataHelper.getOtherHaloAttr(heroUnitData, rank, userDetailData)
	local result = {}

	local heroBaseId = heroUnitData:getBase_id()
	if heroUnitData:isLeader() and userDetailData:isEquipAvatar() then
		local avatarId = userDetailData:getAvatarId()
		local unitData = userDetailData:getAvatarUnitDataWithId(avatarId)
		heroBaseId = unitData:getConfig().hero_id
	end
	local limitLevel = userDetailData:getUserLeaderLimitLevel(heroUnitData)
	local limitRedLevel = userDetailData:getUserLeaderRedLimitLevel(heroUnitData)
	for i = 1, rank do
		local info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel)
		if info then
			for k = 1, 2 do
				local haloTarget = info["halo_target_" .. k]
				if haloTarget == 1 then --对自己
					local attrId = info["halo_attr_" .. k]
					local attrValue = info["halo_value_" .. k]
					AttrDataHelper.formatAttr(result, attrId, attrValue)
				end
			end
		end
	end

	if userDetailData:isInBattle(heroUnitData) then
		local heroId = heroUnitData:getId()
		local heroDatas = userDetailData:getHeroDataInBattle()
		for i, unit in ipairs(heroDatas) do
			local baseId = unit:getBase_id()
			if unit:isLeader() and userDetailData:isEquipAvatar() then
				local avatarId = userDetailData:getAvatarId()
				local unitData = userDetailData:getAvatarUnitDataWithId(avatarId)
				baseId = unitData:getConfig().hero_id
			end
			local limitLevel = unit:getLimit_level()
			local limitRedLevel = unit:getLimit_rtg()
			if unit:isLeader() then
				limitLevel = userDetailData:getUserLeaderLimitLevel(unit)
				limitRedLevel = userDetailData:getUserLeaderRedLimitLevel(unit)
			end
			local rLv = unit:getRank_lv()
			for j = 1, rLv do
				local info = HeroDataHelper.getHeroRankConfig(baseId, j, limitLevel, limitRedLevel)
				if info then
					for k = 1, 2 do
						local haloTarget = info["halo_target_" .. k]
						if haloTarget == 2 then --对上阵武将
							local attrId = info["halo_attr_" .. k]
							local attrValue = info["halo_value_" .. k]
							AttrDataHelper.formatAttr(result, attrId, attrValue)
						end
					end
				end
			end
		end
	end

	return result
end

function UserDetailDataHelper.getOtherInstrumentTalentAttr(heroUnitData, userDetailData)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	if pos == nil or pos == 0 then
		return result
	end

	local instrumentDatas = userDetailData:getInstrumentDatasWithPos(pos)
	for i, instrumentData in ipairs(instrumentDatas) do
		local configInfo = instrumentData:getConfig()
		local templet = instrumentData:getAdvacneTemplateId()
		local level = instrumentData:getLevel()
		for j = 1, level do
			local info = require("app.config.instrument_level").get(j, templet)
			assert(info, string.format("instrument_level config can not find level = %d, templet = %d", j, templet))
			local target = info.talent_target
			if target == 1 then --对自己
				for k = 1, 2 do
					local attrId = info["talent_attr_" .. k]
					local attrValue = info["talent_value_" .. k]
					if result[attrId] == nil then
						result[attrId] = 0
					end
					result[attrId] = result[attrId] + attrValue
				end
			end
		end

		local heroUnitData = userDetailData:getHeroDataWithPos(pos)
		local heroBaseId = userDetailData:getAvatarToHeroBaseId(heroUnitData)
		local heroConfig = HeroDataHelper.getHeroConfig(heroBaseId)
		local instrumentBaseId = heroConfig.instrument_id
		local instrumentConfig = require("app.config.instrument").get(instrumentBaseId)
		if level >= instrumentConfig.unlock then
			local haloTarget = instrumentConfig.halo_target
			if haloTarget == 1 then
				local attrId = instrumentConfig.halo_attr
				local attrValue = instrumentConfig.halo_value
				AttrDataHelper.formatAttr(result, attrId, attrValue)
			end
		end
	end

	local heroDatas = userDetailData:getHeroDataInBattle()
	for i, data in ipairs(heroDatas) do
		local instrumentDatas = userDetailData:getInstrumentDatasWithPos(i)
		for j, instrumentData in ipairs(instrumentDatas) do
			local configInfo = instrumentData:getConfig()
			local templet = instrumentData:getAdvacneTemplateId()
			local level = instrumentData:getLevel()
			for k = 1, level do
				local info = require("app.config.instrument_level").get(k, templet)
				assert(info, string.format("instrument_level config can not find level = %d, templet = %d", k, templet))
				local target = info.talent_target
				if target == 2 then --对其它人
					for m = 1, 2 do
						local attrId = info["talent_attr_" .. m]
						local attrValue = info["talent_value_" .. m]
						if result[attrId] == nil then
							result[attrId] = 0
						end
						result[attrId] = result[attrId] + attrValue
					end
				end
			end

			local heroBaseId = userDetailData:getAvatarToHeroBaseId(data)
			local heroConfig = HeroDataHelper.getHeroConfig(heroBaseId)
			local instrumentBaseId = heroConfig.instrument_id
			local instrumentConfig = require("app.config.instrument").get(instrumentBaseId)
			if level >= instrumentConfig.unlock then
				local haloTarget = instrumentConfig.halo_target
				if haloTarget == 2 then
					local attrId = instrumentConfig.halo_attr
					local attrValue = instrumentConfig.halo_value
					AttrDataHelper.formatAttr(result, attrId, attrValue)
				end
			end
		end
	end

	return result
end

--获取变身卡对应属性
function UserDetailDataHelper.getOtherAvatarAttr(heroUnitData, userDetailData)
	local result = {}
	if not heroUnitData:isLeader() then
		return result
	end
	if not userDetailData:isEquipAvatar() then
		return result
	end

	local avatarId = userDetailData:getAvatarId()
	local unitData = userDetailData:getAvatarUnitDataWithId(avatarId)
	local baseId = unitData:getBase_id()
	local baseAttr = AvatarDataHelper.getAvatarBaseAttr(baseId)
	AttrDataHelper.appendAttr(result, baseAttr)

	return result
end

function UserDetailDataHelper.getOtherAvatarPower(heroUnitData, userDetailData)
	local result = {}
	if not heroUnitData:isLeader() then
		return result
	end
	if not userDetailData:isEquipAvatar() then
		return result
	end
	local avatarId = userDetailData:getAvatarId()
	local unitData = userDetailData:getAvatarUnitDataWithId(avatarId)
	local power = unitData:getConfig().fake

	result[AttributeConst.AVATAR_EQUIP_POWER] = power
	return result
end

--获取变身卡图鉴属性
function UserDetailDataHelper.getOtherAvatarShowAttr(heroUnitData, userDetailData)
	local result = {}
	local allInfo = userDetailData:getAllOwnAvatarShowInfo()

	for i, info in ipairs(allInfo) do
		local target = info.talent_target
		if target == 1 and heroUnitData:isLeader() then
			for j = 1, 4 do
				local attrId = info["talent_attr_" .. j]
				local attrValue = info["talent_value_" .. j]
				AttrDataHelper.formatAttr(result, attrId, attrValue)
			end
		elseif target == 2 then
			for j = 1, 4 do
				local attrId = info["talent_attr_" .. j]
				local attrValue = info["talent_value_" .. j]
				AttrDataHelper.formatAttr(result, attrId, attrValue)
			end
		end
	end

	return result
end

function UserDetailDataHelper.getOtherAvatarShowPower(heroUnitData, userDetailData)
	local result = {}
	local power = 0
	local allInfo = userDetailData:getAllOwnAvatarShowInfo()
	for i, info in ipairs(allInfo) do
		local target = info.talent_target
		if target == 1 and heroUnitData:isLeader() then
			power = power + info.fake
		elseif target == 2 then
			power = power + info.fake
		end
	end

	result[AttributeConst.AVATAR_POWER] = power
	return result
end

function UserDetailDataHelper.getOtherHeroPowerAttr(heroUnitData, userDetailData)
	local result = {}

	local level = heroUnitData:getLevel()
	local rank = heroUnitData:getRank_lv()

	local attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData:getConfig(), level)
	local attr2 = HeroDataHelper.getBreakAttr(heroUnitData)
	local attr3 = HeroDataHelper.getLimitAttr(heroUnitData)
	local attr4 = HeroDataHelper.getAwakeAttr(heroUnitData)
	local attr5 = UserDetailDataHelper.getOtherUserEquipAttr(heroUnitData, userDetailData, true)
	local attr6 = UserDetailDataHelper.getOtherUserTreasureAttr(heroUnitData, userDetailData, true)
	local attr7 = UserDetailDataHelper.getOtherUserInstrumentAttr(heroUnitData, userDetailData)
	local attr8 = UserDetailDataHelper.getOtherUserMasterAttr(heroUnitData, userDetailData)
	local attr9 = UserDetailDataHelper.getOtherKarmaAttrRatio(heroUnitData, userDetailData)
	local attr10 = HeroDataHelper.getYokeAttrRatio(heroUnitData)
	local attr11 = HeroDataHelper.getOfficialPower(userDetailData:getOfficeLevel())
	local attr12 = HeroDataHelper.getTalentPower(heroUnitData, 0)
	local attr13 = UserDetailDataHelper.getOtherInstrumentTalentAttr(heroUnitData, userDetailData)
	local attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData)
	local attr15 = UserDetailDataHelper.getOtherAvatarPower(heroUnitData, userDetailData)
	local attr16 = UserDetailDataHelper.getOtherAvatarShowPower(heroUnitData, userDetailData)
	local attr17 = UserDetailDataHelper.getOtherPetHelpAttr(userDetailData)
	local attr18 = UserDetailDataHelper.getOtherPetMapPower(userDetailData)
	local attr19 = UserDetailDataHelper.getOtherSilkbagPower(heroUnitData, userDetailData)
	local attr20 = UserDetailDataHelper.getOtherHomelandPower(userDetailData)
	local attr21 = UserDetailDataHelper.getOtherHaloAttr(heroUnitData, rank, userDetailData)
	local attr22 = UserDetailDataHelper.getOtherHorsePower(heroUnitData, userDetailData)
	local attr23 = UserDetailDataHelper.getOtherHorseKarmaPower(userDetailData)
	local attr24 = UserDetailDataHelper.getOtherHistoryHeroPower(heroUnitData, userDetailData)
    local attr25 = UserDetailDataHelper.getOtherTacticsPower(heroUnitData, userDetailData)
    local attr26 = UserDetailDataHelper.getOtherBoutPower(heroUnitData, userDetailData)
	--

	AttrDataHelper.appendAttr(result, attr1)
	AttrDataHelper.appendAttr(result, attr2)
	AttrDataHelper.appendAttr(result, attr3)
	AttrDataHelper.appendAttr(result, attr4)
	AttrDataHelper.appendAttr(result, attr5)
	AttrDataHelper.appendAttr(result, attr6)
	AttrDataHelper.appendAttr(result, attr7)
	AttrDataHelper.appendAttr(result, attr8)
	AttrDataHelper.appendAttr(result, attr9)
	AttrDataHelper.appendAttr(result, attr10)
	AttrDataHelper.appendAttr(result, attr11)
	AttrDataHelper.appendAttr(result, attr12)
	AttrDataHelper.appendAttr(result, attr13)
	AttrDataHelper.appendAttr(result, attr14)
	AttrDataHelper.appendAttr(result, attr15)
	AttrDataHelper.appendAttr(result, attr16)
	AttrDataHelper.appendAttr(result, attr17)
	AttrDataHelper.appendAttr(result, attr18)
	AttrDataHelper.appendAttr(result, attr19)
	AttrDataHelper.appendAttr(result, attr20)
	AttrDataHelper.appendAttr(result, attr21)
	AttrDataHelper.appendAttr(result, attr22)
	AttrDataHelper.appendAttr(result, attr23)
	AttrDataHelper.appendAttr(result, attr24)
    AttrDataHelper.appendAttr(result, attr25)
    AttrDataHelper.appendAttr(result, attr26)

	AttrDataHelper.processDefAndAddition(result)

	return result
end

function UserDetailDataHelper.getOtherPetTotalAttr(petUnitData)
	local result = {}
	local level = petUnitData:getLevel()

	local attr1 = PetDataHelper.getPetBasicAttrWithLevel(petUnitData:getConfig(), level)
	local attr2 = PetDataHelper.getPetBreakAttr(petUnitData)

	local AttrDataHelper = require("app.utils.data.AttrDataHelper")

	AttrDataHelper.appendAttr(result, attr1)
	AttrDataHelper.replaceAttr(result, attr2)

	AttrDataHelper.processDefAndAddition(result)

	return result
end

function UserDetailDataHelper.getOtherPetHelpAttr(userDetailData)
	local result = {}
	local petList = userDetailData:getProtectPetIds()
	local pet_help_percent = PetDataHelper.getParameterValue("pet_huyou_percent") / 1000

	for i, petId in ipairs(petList) do
		local petUnit = userDetailData:getPetUnitDataWithId(petId)
		local param = {
			unitData = petUnit
		}
		local attrAll = PetDataHelper.getPetTotalBaseAttr(param) --PetDataHelper.getPetBasicAttrWithLevelFilter(petUnit:getConfig(), petUnit:getLevel())
		for key, value in pairs(attrAll) do
			if key ~= AttributeConst.PET_BLESS_RATE then
				local blessRate = attrAll[AttributeConst.PET_BLESS_RATE]
				local valueAdd = math.floor(value * pet_help_percent / 6) -- value + math.floor(value * blessRate / 1000)
				attrAll[key] = valueAdd
			end
		end

		AttrDataHelper.appendAttr(result, attrAll)
	end

	return result
end

function UserDetailDataHelper.getOtherPetMapAttr(userDetailData)
	local pet_map = require("app.config.pet_map")
	local result = {}

	for loop = 1, pet_map.length() do
		local petMapData = pet_map.indexOf(loop)
		if petMapData.show > 0 and userDetailData:isPetHave(petMapData.id) then
			local attrAll = {}
			for i = 1, 4 do
				local attrType = petMapData["attribute_type_" .. i]
				local attrValue = petMapData["attribute_value_" .. i]
				if attrType > 0 then
					attrAll[attrType] = attrAll[attrType] or 0
					attrAll[attrType] = attrAll[attrType] + attrValue
				end
			end

			AttrDataHelper.appendAttr(result, attrAll)
		end
	end

	return result
end

function UserDetailDataHelper.getOtherPetMapPower(userDetailData)
	local pet_map = require("app.config.pet_map")
	local result = {}
	local power = 0
	for loop = 1, pet_map.length() do
		local petMapData = pet_map.indexOf(loop)
		if petMapData.show > 0 and userDetailData:isPetHave(petMapData.id) then
			power = power + petMapData.all_combat
		end
	end
	result[AttributeConst.PET_POWER] = power
	return result
end

function UserDetailDataHelper.getOtherSilkbagAttr(heroUnitData, userDetailData)
	local result = {}
	local userLevel = userDetailData:getLevel()
	local pos = userDetailData:getHeroPos(heroUnitData)
	local heroBaseId = heroUnitData:getBase_id()
	if heroUnitData:isLeader() then --判断变身卡，转化
		heroBaseId = userDetailData:getBaseId()
	end
	local heroRank = heroUnitData:getRank_lv()
	local isInstrumentMaxLevel = userDetailData:isInstrumentLevelMaxWithPos(pos)
	local heroLimit = userDetailData:getUserLeaderLimitLevel(heroUnitData)
	local heroRedLimit = userDetailData:getUserLeaderRedLimitLevel(heroUnitData)
	local silkbagIds = userDetailData:getSilkbagIdsOnTeamWithPos(pos)
	for i, silkbagId in ipairs(silkbagIds) do
		local unitData = userDetailData:getSilkbagUnitDataWithId(silkbagId)
		local baseId = unitData:getBase_id()
		local isEffective =
			SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)
		if isEffective then
			local attr = SilkbagDataHelper.getAttrWithId(baseId, userLevel)
			AttrDataHelper.appendAttr(result, attr)
		end
	end

	return result
end

function UserDetailDataHelper.getOtherHomelandAttr(heroUnitData, userDetailData)
	local attrAllList = {}
	local homeTreeData = userDetailData:getHomeTree()

	for i, unitTreeData in ipairs(homeTreeData) do
		if unitTreeData.tree_id > 0 then
			local currLevel = unitTreeData.tree_level
			for level = 1, currLevel do
				local currData = G_UserData:getHomeland():getSubTreeCfg(unitTreeData.tree_id, level)
				if currData then
					local attrList = {}
					for j = 1, 4 do
						local attrType = currData["attribute_type" .. j]
						local attrValue = currData["attribute_value" .. j]
						if attrType > 0 then
							table.insert(attrList, {type = attrType, value = attrValue})
						end
					end
					for k, attrValue in ipairs(attrList) do
						AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value)
					end
				end
			end
		end
	end

	for i, unitTreeData in ipairs(homeTreeData) do
		if unitTreeData.tree_id == 0 then
			local currLevel = unitTreeData.tree_level
			for level = 1, currLevel do
				local currData = G_UserData:getHomeland():getMainTreeCfg(level)
				if currData then
					local attrList = {}
					for j = 1, 4 do
						local attrType = currData["attribute_type" .. j]
						local attrValue = currData["attribute_value" .. j]
						if attrType > 0 then
							table.insert(attrList, {type = attrType, value = attrValue})
						end
					end
					for k, attrValue in ipairs(attrList) do
						AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value)
					end
				end
			end
		end
	end
	dump(attrAllList)
	return attrAllList
end

--获取别的玩家家园战力
function UserDetailDataHelper.getOtherHomelandPower(userDetailData)
	-- body

	local result = {}
	result[AttributeConst.HOMELAND_POWER] = 0
	local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
	local homelandList = userDetailData:getHomeTree()
	if homelandList and #homelandList > 0 then
		local subPower = 0
		local mainPower = 0
		for i, value in ipairs(homelandList) do
			if value.tree_id == 0 then
				mainPower = HomelandHelp.getMainTreePower(value.tree_level)
			else
				subPower = subPower + HomelandHelp.getSubTreePower(value.tree_id, value.tree_level)
			end
		end

		local retPower = subPower + mainPower
		result[AttributeConst.HOMELAND_POWER] = retPower
	end
	return result
end

function UserDetailDataHelper.getOtherSilkbagPower(heroUnitData, userDetailData)
	local result = {}
	local power = 0
	local pos = userDetailData:getHeroPos(heroUnitData)
	local heroBaseId = heroUnitData:getBase_id()
	if heroUnitData:isLeader() then --判断变身卡，转化
		heroBaseId = userDetailData:getBaseId()
	end
	local heroRank = heroUnitData:getRank_lv()
	local isInstrumentMaxLevel = userDetailData:isInstrumentLevelMaxWithPos(pos)
	local heroLimit = userDetailData:getUserLeaderLimitLevel(heroUnitData)
	local heroRedLimit = userDetailData:getUserLeaderRedLimitLevel(heroUnitData)
	local silkbagIds = userDetailData:getSilkbagIdsOnTeamWithPos(pos)
	for i, silkbagId in ipairs(silkbagIds) do
		local unitData = userDetailData:getSilkbagUnitDataWithId(silkbagId)
		local baseId = unitData:getBase_id()
		local isEffective =
			SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)
		if isEffective then
			local info = SilkbagDataHelper.getSilkbagConfig(baseId)
			power = power + info.fake
		end
	end

	result[AttributeConst.SILKBAG_POWER] = power
	return result
end

function UserDetailDataHelper.getOtherUserHorseAttr(heroUnitData, userDetailData)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)

	local horseDatas = userDetailData:getHorseDatasWithPos(pos)
	local horseEquipList = userDetailData:getHorseEquipData()
	for i, horseData in ipairs(horseDatas) do
		local list = {}
		local equipList = horseData:getEquip()
		for index, equipId in ipairs(equipList) do
			list[#list + 1] = horseEquipList["k_" .. equipId]
		end
		local attrInfo = HorseDataHelper.getHorseAttrInfo(horseData, nil, list)
		local skillAttrInfo = HorseDataHelper.getHorseSkillAttrInfo(horseData)
		AttrDataHelper.appendAttr(result, attrInfo)
		AttrDataHelper.appendAttr(result, skillAttrInfo)
	end
	return result
end

function UserDetailDataHelper.getOtherHorsePower(heroUnitData, userDetailData)
	local result = {}
	local power = 0
	local pos = userDetailData:getHeroPos(heroUnitData)
	local horseDatas = userDetailData:getHorseDatasWithPos(pos)
	local horseEquipList = userDetailData:getHorseEquipData()
	for i, horseData in ipairs(horseDatas) do
		local baseId = horseData:getBase_id()
		local star = horseData:getStar()
		local info = HorseDataHelper.getHorseStarConfig(baseId, star)
		power = power + info.power

		local equipList = horseData:getEquip()
		for i1, equipId in ipairs(equipList) do
			if horseEquipList["k_" .. equipId] then
				local config = horseEquipList["k_" .. equipId]:getConfig()
				power = power + config.all_combat
			end
		end
	end

	result[AttributeConst.HORSE_POWER] = power
	return result
end

function UserDetailDataHelper.getOtherHorseKarmaAttr(userDetailData)
	local result = {}
	local horseKarmaInfo = userDetailData:getHorseKarmaInfo()
	for index, karmaId in ipairs(horseKarmaInfo) do
		local karmaConfig = HorseDataHelper.getHorseGroupConfig(karmaId)
		for i = 1, 4 do
			local attrType = karmaConfig["attribute_type_" .. i]
			if attrType ~= 0 then
				local attrValue = karmaConfig["attribute_value_" .. i]
				AttrDataHelper.formatAttr(result, attrType, attrValue)
			end
		end
	end

	dump(result)

	return result
end

function UserDetailDataHelper.getOtherHorseKarmaPower(userDetailData)
	local result = {}
	local power = 0
	local horseKarmaInfo = userDetailData:getHorseKarmaInfo()
	for index, karmaId in ipairs(horseKarmaInfo) do
		local karmaConfig = HorseDataHelper.getHorseGroupConfig(karmaId)
		power = power + karmaConfig.all_combat
	end
	result[AttributeConst.HORSE_POWER] = power
	return result
end

function UserDetailDataHelper.getOtherHistoryHeroAttr(heroUnitData, userDetailData)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	local historyHeroData = userDetailData:getHistoryHeroData(pos)
	if not historyHeroData then
		return result
	end

	local attrInfo = HistoryHeroDataHelper.getAttrSingleInfo(historyHeroData)
	AttrDataHelper.appendAttr(result, attrInfo)
	return result
	
end

function UserDetailDataHelper.getOtherHistoryHeroPower(heroUnitData, userDetailData)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	local historyHeroData = userDetailData:getHistoryHeroData(pos)
	if not historyHeroData then
		return result
	end

	local attrInfo = HistoryHeroDataHelper.getPowerSingleInfo(historyHeroData)
	AttrDataHelper.appendAttr(result, attrInfo)
	return result
	
end


function UserDetailDataHelper.getOtherTacticsAttr(heroUnitData, userDetailData)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	local unitList = userDetailData:getUnitDataListWithPos(pos)

	for _,unitData in ipairs(unitList) do
		local attrInfo = TacticsDataHelper.getAttrSingleInfo(unitData)
		AttrDataHelper.appendAttr(result, attrInfo)
    end
	return result
end

-- 获取战法战力
function UserDetailDataHelper.getOtherTacticsPower(heroUnitData, userDetailData)
	local result = {}
	local pos = userDetailData:getHeroPos(heroUnitData)
	local unitList = userDetailData:getUnitDataListWithPos(pos)

	for _,unitData in ipairs(unitList) do
		local attrInfo = TacticsDataHelper.getPowerSingleInfo(unitData)
		AttrDataHelper.appendAttr(result, attrInfo)
    end
	return result
end

function UserDetailDataHelper.getOtherBoutAttr(heroUnitData, userDetailData)
    local result = {}
    AttrDataHelper.appendAttr(result, userDetailData:getBoutAttr())
 
	return result
end

-- 获取战法战力
function UserDetailDataHelper.getOtherBoutPower(heroUnitData, userDetailData)
	local result = {}
    AttrDataHelper.appendAttr(result, userDetailData:getBoutPower())

	return result
end


return UserDetailDataHelper
