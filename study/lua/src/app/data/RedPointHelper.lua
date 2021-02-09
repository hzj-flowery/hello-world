--小红点帮助类
--该模块会关联所有data模块
local RedPointHelper = {}
local FunctionConst = require("app.const.FunctionConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local ShopConst = require("app.const.ShopConst")
local HorseConst = require("app.const.HorseConst")

function RedPointHelper.getMoudleTable(funcId)
	local funcName = FunctionConst.getFuncName(funcId)
	local retFunc = RedPointHelper["_" .. funcName]

	if retFunc ~= nil and type(retFunc) == "table" then
		return retFunc
	end
	return nil
end

--检测某个模块，小红点是否开启
function RedPointHelper.isModuleReach(functionId, params)
	-- body
	local osTime = os.clock()
	local tParams = nil
	if params ~= nil and type(params) == "table" then
		tParams = unpack(params)
	end

	local value = functionId
	local isFunctionOpen = require("app.utils.logic.FunctionCheck").funcIsShow(functionId)
	if isFunctionOpen == false then
		return false
	end

	local retValue = false
	local moudleTable = RedPointHelper.getMoudleTable(functionId)
	if moudleTable and moudleTable.mainRP then
		--logWarn("RedPointHelper.isModuleReach functionId: "..functionId)
		retValue = moudleTable.mainRP(params)
	end
	local runningTime = os.clock() - osTime
	-- logWarn(string.format("RedPointHelper.isModuleReach running time [%.4f], functionId[%d]", runningTime, functionId))
	return retValue
end

--检测某个模块中小模块，小红点是否开启
function RedPointHelper.isModuleSubReach(functionId, key, params)
	-- body
	local tParams = nil
	if params ~= nil and type(params) == "table" then
		tParams = unpack(params)
	end

	local value = functionId
	local isFunctionOpen = require("app.utils.logic.FunctionCheck").funcIsShow(functionId)
	if (isFunctionOpen == false) then
		return false
	end

	local moudleTable = RedPointHelper.getMoudleTable(functionId)
	if moudleTable and moudleTable[key] then
		return moudleTable[key](params)
	end
	return false
end

----------------------------------------------------------------------------------
----------------------------------------------------------------------------------
--RP是redPoint缩写

--邮箱小红点逻辑
RedPointHelper._FUNC_MAIL = {
	--主界面红点,入口小红点
	mainRP = function(params)
		local redValue = G_UserData:getMails():hasRedPoint()
		return redValue
	end
}

--矿站战报
RedPointHelper._FUNC_MINE_CRAFT = {
	reportRP = function(params)
		local value = G_UserData:getRedPoint():isMineNewReport()
		local count = G_UserData:getRedPoint():getCount(18)
		return value, count
	end,
	mainRP = function(params)
		local value = G_UserData:getRedPoint():isMineBeHit()
		local value2 = G_UserData:getMineCraftData():isReachTimeLimit()
		local value3 = G_UserData:getMineCraftData():isPrivilegeRedPoint()
		local value4 = G_UserData:getRedPoint():isGrainCar()
		local value5 = G_UserData:getRedPoint():isGrainCarCanLaunch()
		return value or value2 or value3 or value4 or value5
	end
}

--竞技场小红点逻辑
RedPointHelper._FUNC_ARENA = {
	--主界面红点,入口小红点
	mainRP = function(params)
		--local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, "atkRP")
		local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, "defRP")
		local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, "peekRP")
		local redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, "atkTime")
		--local redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARENA, "awardRP")
		return redValue1 or redValue2 or redValue3
	end,
	atkTime = function(params)
		-- body
		local arenaData = G_UserData:getArenaData():getMyArenaData()
		if arenaData and arenaData.arenaCount then
			return arenaData.arenaCount > 0
		end
		return false
	end,
	atkRP = function(params)
		--local redValue = G_UserData:getRedPoint():isArenaAtkReport()
		return false
	end,
	defRP = function(params)
		local redValue = G_UserData:getRedPoint():isArenaDefReport()
		return redValue
	end,
	peekRP = function(params)
		local redValue = G_UserData:getRedPoint():isArenaPeekReport()
		return redValue
	end,
	awardRP = function(params)
		--local redValue = G_UserData:getArenaData():hasAwardReach()
		return false
	end
}

--每日任务
RedPointHelper._FUNC_DAILY_MISSION = {
	--主界面红点,入口小红点
	mainRP = function(params)
		local redValue1 = G_UserData:getDailyMission():getNewAward()
		local redValue2 = G_UserData:getAchievement():getNewAward()
		local redValue3 = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE)
		return redValue1 or redValue2 or redValue3
	end,
	dailyRP = function(params)
		local redValue1 = G_UserData:getDailyMission():getNewAward()
		return redValue1
	end
}

RedPointHelper._FUNC_ACHIEVEMENT = {
	mainRP = function()
		local redValue = G_UserData:getAchievement():getNewAward()
		logWarn("AchievementData:getNewAward " .. tostring(redValue))
		return redValue
	end,
	--目标
	targetRP = function()
		local redValue = G_UserData:getAchievement():hasAnyAwardCanGet(1) > 0
		return redValue
	end,
	--趣味
	gameRP = function()
		local redValue = G_UserData:getAchievement():hasAnyAwardCanGet(2) > 0
		return redValue
	end,
	--金将初见
	firstMeetRP = function()
		local redValue = G_UserData:getAchievement():hasAnyAwardCanGet(3) > 0
		return redValue
	end
}

RedPointHelper._FUNC_MORE = {
	mainRP = function()
		local MainMenuLayer = require("app.scene.view.main.MainMenuLayer")
		local funcList = MainMenuLayer.MORE_ICON
		for i, value in ipairs(funcList) do
			local redPoint = RedPointHelper.isModuleReach(value.funcId)
			if redPoint == true then
				return true
			end
		end
		return false
	end
}

RedPointHelper._FUNC_OFFICIAL = {
	mainRP = function()
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		local redValue = LogicCheckHelper.checkOfficialLevelUp()
		return redValue
	end
}

--Vip礼包
RedPointHelper._FUNC_VIP_GIFT = {
	mainRP = function()
		local redValue = G_UserData:getVip():hasVipGiftCanBuy()
		return redValue
	end
}
--充值icon
RedPointHelper._FUNC_RECHARGE = {
	mainRP = function()
		local redValue = G_UserData:getVip():hasVipGiftCanBuy()
		return redValue
	end
}

--酒馆功能小红点
RedPointHelper._FUNC_DRAW_HERO = {
	mainRP = function()
		local hasFreeTimeGold = G_UserData:getRecruitData():hasFreeGoldCount()
		local hasFreeTime = G_UserData:getRecruitData():hasFreeNormalCount()
		local valueBox = G_UserData:getRecruitData():hasBoxToGet()
		local DataConst = require("app.const.DataConst")
		local hasToken1 = G_UserData:getItems():getItemNum(DataConst.ITEM_RECRUIT_TOKEN) > 0
		local hasToken2 = G_UserData:getItems():getItemNum(DataConst.ITEM_RECRUIT_GOLD_TOKEN) > 0
		return hasFreeTime or hasFreeTimeGold or valueBox or hasToken1 or hasToken2
	end
}

--阵容小红点逻辑
RedPointHelper._FUNC_TEAM = {
	mainRP = function()
		local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TEAM, "posRP")
		local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TEAM, "reinforcementPosRP")
		local redValue3 = require("app.utils.data.AvatarDataHelper").isCanActiveBook()
		local redValue = redValue1 or redValue2 or redValue3
		return redValue
	end,
	posRP = function()
		--阵容位提示
		local isHaveEmptyPos = UserDataHelper.isHaveEmptyPos()
		local isHaveHeroNotInBattle = G_UserData:getHero():isHaveHeroNotInBattle()
		return isHaveEmptyPos and isHaveHeroNotInBattle
	end,
	reinforcementEmptyRP = function()
		local isHaveEmptyReinforcementPos = UserDataHelper.isHaveEmptyReinforcementPos()
		return isHaveEmptyReinforcementPos
	end,
	reinforcementPosRP = function()
		--援军位提示
		local isHaveEmptyReinforcementPos = UserDataHelper.isHaveEmptyReinforcementPos()
		local isHaveActiveYokeHeroNotInBattle = G_UserData:getHero():isHaveActiveYokeHeroNotInBattle()
		return isHaveEmptyReinforcementPos and isHaveActiveYokeHeroNotInBattle
	end
}

RedPointHelper._FUNC_PET_HOME = {
	mainRP = function()
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PET_HOME, "posRP")
		local redValue2 = G_UserData:getFragments():hasRedPoint({fragType = TypeConvertHelper.TYPE_PET}) --是否有神兽合成
		local redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "petShop") --神兽商店
		local redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PET_HOME, "petMapRP") --神兽图鉴激活红点

		local redValue5 = UserDataHelper.getPetTeamRedPoint()
		dump(redValue5)

		local redValue = redValue1 or redValue2 or redValue3 or redValue4 or redValue5
		return redValue
	end,
	posRP = function()
		--阵容位提示
		local isHaveEmptyPos = UserDataHelper.isHaveEmptyPetPos()
		local isHavePetNotInBattle = G_UserData:getPet():isHavePetNotInBattle()
		return isHaveEmptyPos and isHavePetNotInBattle
	end,
	petMapRP = function(...)
		-- body
		local redValue4 = G_UserData:getPet():isPetMapRedPoint()
		return redValue4
	end
}

RedPointHelper._FUNC_PET_CHANGE = {
	mainRP = function(petUnitData)
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PET_CHANGE, "betterColorRP", petUnitData)
		return redValue
	end,
	betterColorRP = function(petUnitData) --有品质更好的神兽
		local isPrompt = UserDataHelper.isPromptPetBetterColor(petUnitData)
		return isPrompt
	end
}

--武将更换小红点
RedPointHelper._FUNC_HERO_CHANGE = {
	mainRP = function(heroUnitData)
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HERO_CHANGE, "betterColorRP", heroUnitData)
		return redValue
	end,
	betterColorRP = function(heroUnitData) --有品质更好的武将
		local isPrompt = UserDataHelper.isPromptHeroBetterColor(heroUnitData)
		return isPrompt
	end
}

-- 战法小红点
RedPointHelper._FUNC_TACTICS = {
	mainRP = function(color)
		local unitList = G_UserData:getTactics():getCanUnlockList(color)
		return #unitList>0
	end,
	teamRP = function()
		local heroIds = G_UserData:getTeam():getHeroIds()
		for i, heroId in ipairs(heroIds) do
			if heroId > 0 then
				local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, "posRP", i)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(param)
		if require("app.utils.LogicCheckHelper").funcIsOpened(FunctionConst.FUNC_TACTICS) == false then
			return false
		end
		local pos = param.pos
		local slot = param.slot
		local isEmtpy = G_UserData:getBattleResource():isHaveEmptyTacticsPos(pos, slot)
		if isEmtpy then
			local isHave = G_UserData:getTactics():isHaveTacticsNotInPos(pos, slot)
			return isHave
		else
			local isBetter = G_UserData:getTactics():isHaveBetterTactics(pos, slot)
			return isBetter
		end
	end,
	posRP = function(pos) --没战法时的检测
		for i = 1, 3 do
			local param = {pos = pos, slot = i}
			local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, "slotRP", param)
			if redValue then
				return true
			end
		end
		return false
	end
}

--装备小红点
RedPointHelper._FUNC_EQUIP = {
	mainRP = function()
		local heroIds = G_UserData:getTeam():getHeroIds()
		for i, heroId in ipairs(heroIds) do
			if heroId > 0 then
				local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, "posRP", i)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(param)
		if require("app.utils.LogicCheckHelper").funcIsOpened(FunctionConst.FUNC_EQUIP) == false then
			return false
		end
		local pos = param.pos
		local slot = param.slot
		local isEmtpy = G_UserData:getBattleResource():isHaveEmptyEquipPos(pos, slot)
		if isEmtpy then
			local isHave = G_UserData:getEquipment():isHaveEquipmentNotInPos(slot)
			return isHave
		else
			local isBetter = G_UserData:getEquipment():isHaveBetterEquip(pos, slot)
			return isBetter
		end
	end,
	posRP = function(pos) --没装备时的检测
		for i = 1, 4 do
			local param = {pos = pos, slot = i}
			local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, "slotRP", param)
			if redValue then
				return true
			end
		end
		return false
	end
}

--宝物小红点
RedPointHelper._FUNC_TREASURE = {
	mainRP = function()
		local heroIds = G_UserData:getTeam():getHeroIds()
		for i, heroId in ipairs(heroIds) do
			if heroId > 0 then
				local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, "posRP", i)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(param)
		local pos = param.pos
		local slot = param.slot
		local isEmtpy = G_UserData:getBattleResource():isHaveEmptyTreasurePos(pos, slot)
		if isEmtpy then
			local isHave = G_UserData:getTreasure():isHaveTreasureNotInPos(slot)
			return isHave
		else
			local isBetter = G_UserData:getTreasure():isHaveBetterTreasure(pos, slot)
			return isBetter
		end
	end,
	posRP = function(pos)
		for i = 1, 2 do
			local param = {pos = pos, slot = i}
			local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, "slotRP", param)
			if redValue then
				return true
			end
		end
		return false
	end
}

--神兵小红点
RedPointHelper._FUNC_INSTRUMENT = {
	mainRP = function()
		local heroIds = G_UserData:getTeam():getHeroIds()
		for i, heroId in ipairs(heroIds) do
			if heroId > 0 then
				local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
				local heroBaseId = unitData:getBase_id()
				local param = {pos = i, heroBaseId = heroBaseId}
				local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, "posRP", param)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(param)
		local pos = param.pos
		local slot = param.slot
		local heroBaseId = param.heroBaseId
		local isEmtpy = G_UserData:getBattleResource():isHaveEmptyInstrumentPos(pos, slot)
		if isEmtpy then
			local isHave = G_UserData:getInstrument():isHaveInstrumentNotInPos(heroBaseId)
			return isHave
		else
			local isBetter = G_UserData:getInstrument():isHaveBetterInstrument(pos, heroBaseId)
			return isBetter
		end
	end,
	posRP = function(param)
		local pos = param.pos
		local heroBaseId = param.heroBaseId
		local temp = {pos = pos, slot = 1, heroBaseId = heroBaseId}
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, "slotRP", temp)
		if redValue then
			return true
		end
		return false
	end
}

--战马小红点
RedPointHelper._FUNC_HORSE = {
	mainRP = function()
		local reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_LIST)
		local reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_JUDGE)
		local reach3 = not require("app.scene.view.horseRace.HorseRaceHelper").isRewardFull()
		local reach4 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_BOOK) --是否有图鉴可以激活
		return reach1 or reach2 or reach3 or reach4
	end,
	slotRP = function(param)
		local pos = param.pos
		local slot = param.slot
		local heroBaseId = param.heroBaseId
		local isEmtpy = G_UserData:getBattleResource():isHaveEmptyHorsePos(pos, slot)
		if isEmtpy then
			local isHave = G_UserData:getHorse():isHaveHorseNotInPos(heroBaseId)
			return isHave
		else
			local isBetter = G_UserData:getHorse():isHaveBetterHorse(pos, heroBaseId)

			if param.notCheckEquip then
				return isBetter
			else
				local horseId = G_UserData:getBattleResource():getResourceId(pos, HorseConst.FLAG, 1)
				local hasEquip = G_UserData:getHorseEquipment():isHaveHorseEquipRP(horseId)
				return isBetter or hasEquip
			end
		end
	end,
	posRP = function(param)
		local pos = param.pos
		local heroBaseId = param.heroBaseId
		local temp = {pos = pos, slot = 1, heroBaseId = heroBaseId}
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, "slotRP", temp)
		if redValue then
			return true
		end
		return false
	end
}

-- --战马装备小红点
RedPointHelper._FUNC_HORSE_EQUIP = {
	slotRP = function(param)
		local result = G_UserData:getHorseEquipment():isHorseEquipRP(param)
		return result
	end
}

-- --老玩家回归小红点
RedPointHelper._FUNC_RETURN = {
	mainRP = function(param)
		--local result = G_UserData:getReturnData():needShowRedPoint()
		local result = G_UserData:getRedPoint():isReturnActivity() or G_UserData:getReturnData():needShowRedPoint()
		return result
	end
}

--神兽升级小红点
RedPointHelper._FUNC_PET_TRAIN_TYPE1 = {
	mainRP = function(petUnit)
		local redValue = UserDataHelper.isPromptPetUpgrade(petUnit)
		return redValue
	end
}

--神兽升星小红点
RedPointHelper._FUNC_PET_TRAIN_TYPE2 = {
	mainRP = function(petUnit)
		local redValue = UserDataHelper.isPromptPetBreak(petUnit)
		return redValue
	end
}

--神兽界限突破小红点
RedPointHelper._FUNC_PET_TRAIN_TYPE3 = {
	mainRP = function(petUnit)
		local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
		local redValue = PetTrainHelper.isPromptPetLimit(petUnit)
		return redValue
	end
}

--武将升级小红点
RedPointHelper._FUNC_HERO_TRAIN_TYPE1 = {
	mainRP = function(heroUnitData)
		if heroUnitData:isPureGoldHero() then
			return false
		end
		local redValue = UserDataHelper.isPromptHeroUpgrade(heroUnitData)
		return redValue
	end
}

--武将突破小红点
RedPointHelper._FUNC_HERO_TRAIN_TYPE2 = {
	mainRP = function(heroUnitData)
		if heroUnitData:isPureGoldHero() then
			local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
			local redValue = HeroGoldHelper.heroGoldNeedRedPoint(heroUnitData)
			return redValue
		end
		local redValue = UserDataHelper.isPromptHeroBreak(heroUnitData)
		return redValue
	end
}

--武将觉醒小红点
RedPointHelper._FUNC_HERO_TRAIN_TYPE3 = {
	mainRP = function(heroUnitData)
		if heroUnitData:isPureGoldHero() then
			return false
		end
		local redValue = UserDataHelper.isPromptHeroAwake(heroUnitData)
		return redValue
	end
}

--武将界限小红点
RedPointHelper._FUNC_HERO_TRAIN_TYPE4 = {
	mainRP = function(heroUnitData)
		if require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE4) == false then
			return false
		end
		local redValue = UserDataHelper.isPromptHeroLimit(heroUnitData)
		return redValue
	end
}

--装备强化小红点
RedPointHelper._FUNC_EQUIP_TRAIN_TYPE1 = {
	mainRP = function(pos)
		for i = 1, 4 do
			local equipId = G_UserData:getBattleResource():getResourceId(pos, 1, i)
			if equipId then
				local equipUnitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
				local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, "slotRP", equipUnitData)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(equipUnitData)
		local redValue = UserDataHelper.isPromptEquipStrengthen(equipUnitData)
		return redValue
	end
}

RedPointHelper._FUNC_EQUIP_TRAIN_TYPE3 = {
	mainRP = function(pos)
		for i = 1, 4 do
			local equipId = G_UserData:getBattleResource():getResourceId(pos, 1, i)
			if equipId then
				local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
				local redValue = EquipTrainHelper.needJadeRedPoint(equipId)
				if redValue then
					return true
				end
			end
		end
		return false
	end
}

--装备精炼小红点
RedPointHelper._FUNC_EQUIP_TRAIN_TYPE2 = {
	mainRP = function(pos)
		for i = 1, 4 do
			local equipId = G_UserData:getBattleResource():getResourceId(pos, 1, i)
			if equipId then
				local equipUnitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
				local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, "slotRP", equipUnitData)
				if redValue then
					return true
				end
			end
		end
	end,
	slotRP = function(equipUnitData)
		local redValue = UserDataHelper.isPromptEquipRefine(equipUnitData)
		return redValue
	end
}

--宝物升级小红点
RedPointHelper._FUNC_TREASURE_TRAIN_TYPE1 = {
	mainRP = function(pos)
		for i = 1, 2 do
			local treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, i)
			if treasureId then
				local treasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
				local redValue =
					RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, "slotRP", treasureUnitData)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(treasureUnitData)
		local redValue = UserDataHelper.isPromptTreasureUpgrade(treasureUnitData)
		return redValue
	end
}

--宝物精炼小红点
RedPointHelper._FUNC_TREASURE_TRAIN_TYPE2 = {
	mainRP = function(pos)
		for i = 1, 2 do
			local treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, i)
			if treasureId then
				local treasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
				local redValue =
					RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, "slotRP", treasureUnitData)
				if redValue then
					return true
				end
			end
		end
	end,
	slotRP = function(treasureUnitData)
		local redValue = UserDataHelper.isPromptTreasureRefine(treasureUnitData)
		return redValue
	end
}

RedPointHelper._FUNC_TREASURE_TRAIN_TYPE3 = {
	mainRP = function(pos)
		for i = 1, 2 do
			local treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, i)
			if treasureId then
				local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
				local redValue = TreasureTrainHelper.needJadeRedPoint(treasureId)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(treasureUnitData)
		local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
		local redValue = TreasureTrainHelper.needJadeRedPoint(treasureUnitData:getId())
		return redValue
	end
}

--宝物界限小红点
RedPointHelper._FUNC_TREASURE_TRAIN_TYPE4 = {
	mainRP = function(pos)
		for i = 1, 2 do
			local treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, i)
			if treasureId then
				local treasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
				local redValue =
					RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, "slotRP", treasureUnitData)
				if redValue then
					return true
				end
			end
		end
	end,
	slotRP = function(treasureUnitData)
		local redValue = UserDataHelper.isPromptTreasureLimit(treasureUnitData)
		return redValue
	end
}

--神兵进阶小红点
RedPointHelper._FUNC_INSTRUMENT_TRAIN_TYPE1 = {
	mainRP = function(pos)
		for i = 1, 1 do
			local instrumentId = G_UserData:getBattleResource():getResourceId(pos, 3, i)
			if instrumentId then
				local instrumentUnitData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
				local redValue =
					RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, "slotRP", instrumentUnitData)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(instrumentUnitData)
		local redValue = UserDataHelper.isPromptInstrumentAdvance(instrumentUnitData)
		return redValue
	end
}

--神兵突界小红点
RedPointHelper._FUNC_INSTRUMENT_TRAIN_TYPE2 = {
	mainRP = function(pos)
		for i = 1, 1 do
			local instrumentId = G_UserData:getBattleResource():getResourceId(pos, 3, i)
			if instrumentId then
				local instrumentUnitData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
				local redValue =
					RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2, "slotRP", instrumentUnitData)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(instrumentUnitData)
		local redValue = UserDataHelper.isPromptInstrumentLimit(instrumentUnitData)
		return redValue
	end
}

--战马升星小红点
RedPointHelper._FUNC_HORSE_TRAIN = {
	mainRP = function(pos)
		for i = 1, 1 do
			local horseId = G_UserData:getBattleResource():getResourceId(pos, HorseConst.FLAG, i)
			if horseId then
				local horseUnitData = G_UserData:getHorse():getUnitDataWithId(horseId)
				local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_TRAIN, "slotRP", horseUnitData)
				if redValue then
					return true
				end
			end
		end
		return false
	end,
	slotRP = function(horseUnitData)
		local redValue = require("app.utils.data.HorseDataHelper").isPromptHorseUpStar(horseUnitData)
		return redValue
	end
}

--缘分小红点
RedPointHelper._FUNC_HERO_KARMA = {
	mainRP = function(heroUnitData)
		local config = heroUnitData:getConfig()
		local karmaData = UserDataHelper.getHeroKarmaData(config)
		for i, data in ipairs(karmaData) do
			local reach = UserDataHelper.getReachCond(heroUnitData, data["cond1"], data["cond2"]) --是否达成显示条件
			local isActivated = G_UserData:getKarma():isActivated(data.id)
			local isCanActivate = true
			local heroIds = data.heroIds
			for i = 1, 3 do
				local heroId = heroIds[i]
				if heroId then
					local isHaveHero = G_UserData:getKarma():isHaveHero(heroId)
					isCanActivate = isCanActivate and isHaveHero
				end
			end
			if isCanActivate and not isActivated and reach then
				return true
			end
		end
		return false
	end
}

--回收小红点
local FuncRecycleList = {
	FunctionConst.FUNC_RECOVERY_TYPE1
}
RedPointHelper._FUNC_RECYCLE = {
	mainRP = function()
		local funcList = FuncRecycleList
		for i, funcId in ipairs(funcList) do
			local redPoint = RedPointHelper.isModuleReach(funcId)
			if redPoint == true then
				return true
			end
		end
		return false
	end
}

--武将回收小红点
RedPointHelper._FUNC_RECOVERY_TYPE1 = {
	mainRP = function()
		local redValue = G_UserData:getHero():isShowRedPointOfHeroRecovery()
		return redValue
	end
}

--冒险功能列表
local FuncAdventureList = {
	FunctionConst.FUNC_PVE_TERRITORY,
	FunctionConst.FUNC_ARENA,
	FunctionConst.FUNC_DAILY_STAGE,
	FunctionConst.FUNC_PVE_SIEGE,
	FunctionConst.FUNC_PVE_TOWER
}

RedPointHelper._FUNC_ADVENTURE = {
	mainRP = function()
		local MainMenuLayer = require("app.scene.view.main.MainMenuLayer")
		local funcList = FuncAdventureList

		for i, funcId in ipairs(funcList) do
			local redPoint = RedPointHelper.isModuleReach(funcId)

			if redPoint == true then
				return true
			end
		end
		return false
	end
}

RedPointHelper._FUNC_PVE_TERRITORY = {
	mainRP = function()
		local redValue1 = G_UserData:getTerritory():isShowRedPoint()
		local redValue2 = G_UserData:getTerritory():isRiotRedPoint()
		local redValue3 = false
		--G_UserData:getRedPoint():isTerritoryRedPoint()
		local redValue4 = false
		--G_UserData:getRedPoint():isTerritoryFriend()
		return redValue1 or redValue2 or redValue3 or redValue4
	end,
	riotRP = function()
		local redValue2 = G_UserData:getTerritory():isRiotRedPoint()
		return redValue2
	end,
	friendRP = function()
		local redValue2 = G_UserData:getTerritory():isRiotHelpRedPoint()
		return redValue2
	end
}

--商店
RedPointHelper._FUNC_SHOP_SCENE = {
	mainRP = function()
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "heroShop")
		if redValue == true then
			return true
		end

		redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "equipShop")
		if redValue == true then
			return true
		end

		redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "arenaShop")
		if redValue == true then
			return true
		end

		redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "guildShop")
		if redValue == true then
			return true
		end

		redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "petShop")
		if redValue == true then
			return true
		end

		redValue = false
		-- G_UserData:getRedPoint():isHeroShopShowRed()
		return redValue
	end,
	heroShop = function()
		local UserDataHelper = require("app.utils.UserDataHelper")
		local recoverTime, isRecoverFull, intervalTime = UserDataHelper.getShopRecoverMaxRefreshCountTime(ShopConst.HERO_SHOP)
		local redValue = isRecoverFull -- G_UserData:getShops():isRandomShopFreeMax(ShopConst.HERO_SHOP)
		return redValue
	end,
	equipShop = function()
		local redValue = G_UserData:getShops():isFixShopGoodsCanBuy(ShopConst.EQUIP_SHOP, ShopConst.EQUIP_SHOP_SUB_AWARD)
		return redValue
	end,
	arenaShop = function()
		local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "arenaShop1")
		if redValue == true then
			return true
		end

		redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, "arenaShop2")
		if redValue == true then
			return true
		end
		return false
	end,
	arenaShop1 = function(...)
		local redValue1 = G_UserData:getShops():isFixShopTypeItemCanBuy(ShopConst.ARENA_SHOP, ShopConst.ARENA_SHOP_SUB_ITEM)
		return redValue1
	end,
	arenaShop2 = function(...)
		local redValue2 = G_UserData:getShops():isFixShopGoodsCanBuy(ShopConst.ARENA_SHOP, ShopConst.ARENA_SHOP_SUB_AWARD)
		return redValue2
	end,
	guildShop = function()
		local redValue = G_UserData:getShops():isFixShopTypeItemCanBuy(ShopConst.GUILD_SHOP, ShopConst.GUILD_SHOP_SUB_ITEM1)
		return redValue
	end,
	petShop = function()
		local UserDataHelper = require("app.utils.UserDataHelper")
		local recoverTime, isRecoverFull, intervalTime = UserDataHelper.getShopRecoverMaxRefreshCountTime(ShopConst.PET_SHOP)
		local redValue = isRecoverFull
		return redValue
	end
}
----------------------------------------------------------------------------------
----------------------福利
RedPointHelper._FUNC_WELFARE = {
	mainRP = function()
		return G_UserData:getActivity():hasRedPoint()
	end,
	subActivity = function(actId) --福利子活动的活动ID
		return G_UserData:getActivity():hasRedPointForSubAct(actId)
	end,
	openServerFund = function(param) --基金类型（成长基金和全服奖励）
		local fundType, group = param[1], param[2]
		return G_UserData:getActivityOpenServerFund():hasRewardCanReceiveByFundType(fundType, group)
	end
}

--首充
RedPointHelper._FUNC_FIRST_RECHARGE = {
	mainRP = function(params)
		return G_UserData:getActivityFirstPay():hasRedPoint(params)
	end
}

--配置活动
RedPointHelper._FUNC_ACTIVITY = {
	mainRP = function(params) --活动类型（不传判断整个红点）
		return G_UserData:getTimeLimitActivity():hasRedPoint()
	end,
	subActivityRP = function(params) --活动类型（不传判断整个红点）
		return G_UserData:getTimeLimitActivity():hasRedPointForSubAct(params[1], params[2])
	end
}

--七日活动
RedPointHelper._FUNC_WEEK_ACTIVITY = {
	mainRP = function(params) --活动类型、页签索引（活动类型没有则判断首页红点，页签索引没有则判断活动红点）
		return G_UserData:getDay7Activity():hasRedPoint(params)
	end
}

--聊天
RedPointHelper._FUNC_CHAT = {
	mainRP = function(params) --频道ID（不传判断主页红点）
		return G_UserData:getChat():hasRedPoint(params)
	end,
	personalChatRP = function(params) --玩家ID，与某个人的
		return G_UserData:getChat():hasRedPointWithPlayer(params)
	end,
	privateChatRp = function ( params )
		local ChatConst = require("app.const.ChatConst")
		return G_UserData:getChat():isChannelHasRedPoint(ChatConst.CHANNEL_PRIVATE)
	end
}
--------------------------------------------------------------

RedPointHelper._FUNC_HERO_LIST = {
	mainRP = function(params)
		return G_UserData:getFragments():hasRedPoint({fragType = 1})
	end
}

RedPointHelper._FUNC_EQUIP_LIST = {
	mainRP = function(params)
		return G_UserData:getFragments():hasRedPoint({fragType = 2})
	end
}

RedPointHelper._FUNC_TREASURE_LIST = {
	mainRP = function(params)
		return G_UserData:getFragments():hasRedPoint({fragType = 3})
	end
}

RedPointHelper._FUNC_INSTRUMENT_LIST = {
	mainRP = function(params)
		return G_UserData:getFragments():hasRedPoint({fragType = 4})
	end
}

RedPointHelper._FUNC_HORSE_LIST = {
	mainRP = function(params)
		-- local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, "list")
		local reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, "fraglist")
		local reach4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, "equipFraglist")
		return reach2 or reach4
	end,
	list = function()
		local reach = false
		local horseDatas = G_UserData:getHorse():getHorseListData()
		for id, unitData in pairs(horseDatas) do
			if RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_TRAIN, "slotRP", unitData) then
				reach = true
				break
			end
		end
		return reach
	end,
	fraglist = function()
		return G_UserData:getFragments():hasRedPoint({fragType = 12})
	end,
	equipFraglist = function()
		return G_UserData:getFragments():hasRedPoint({fragType = 15})
	end
}

RedPointHelper._FUNC_HORSE_BOOK = {
	mainRP = function(params)
		local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_BOOK, "horseBook")
		return reach
	end,
	horseBook = function()
		return G_UserData:getHorse():isHorsePhotoValid()
	end
}

RedPointHelper._FUNC_HORSE_JUDGE = {
	mainRP = function(params)
		local reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_JUDGE, "type1")
		local reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_JUDGE, "type2")
		return reach1 or reach2
	end,
	type1 = function()
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local DataConst = require("app.const.DataConst")
		local myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS)
		return myCount >= HorseConst.JUDGE_COST_COUNT_1
	end,
	type2 = function()
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local DataConst = require("app.const.DataConst")
		local myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS)
		return myCount >= HorseConst.JUDGE_COST_COUNT_2
	end
}

RedPointHelper._FUNC_DAILY_STAGE = {
	mainRP = function(params)
		return G_UserData:getDailyDungeonData():hasRedPoint()
	end
}

--主线副本
RedPointHelper._FUNC_NEW_STAGE = {
	mainRP = function(params)
		return G_UserData:getChapter():hasRedPoint()
	end
}

--精英副本
RedPointHelper._FUNC_ELITE_CHAPTER = {
	mainRP = function(params)
		return G_UserData:getChapter():hasRedPointForExplore(2)
	end
}

--名将副本
RedPointHelper._FUNC_FAMOUS_CHAPTER = {
	mainRP = function(params)
		return G_UserData:getChapter():hasRedPointForExplore(3)
	end
}

--围剿叛军
RedPointHelper._FUNC_PVE_SIEGE = {
	mainRP = function(params)
		return G_UserData:getSiegeData():hasRedPoint()
	end
}

--爬塔
RedPointHelper._FUNC_PVE_TOWER = {
	mainRP = function(params)
		if require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_PVE_TOWER) == false then
			return false
		end
		local redValue01 = G_UserData:getTowerData():hasRedPoint()
		local redValue02 = RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_SUPER)
		local redValue03 = RedPointHelper.isModuleReach(FunctionConst.FUNC_TOWER_SWEEP)
		return redValue01 or redValue02 or redValue03
	end
}

--爬塔扫荡
RedPointHelper._FUNC_TOWER_SWEEP = {
	mainRP = function(params)
		if require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_TOWER_SWEEP) == false then
			return false
		end

		return G_UserData:getTowerData():hasTowerSweepRedPoint()
	end
}

--爬塔精英挑战
RedPointHelper._FUNC_TOWER_SUPER = {
	mainRP = function(params)
		if require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_TOWER_SUPER) == false then
			return false
		end
		return G_UserData:getTowerData():hasSuperStageChallengeCountRedPoint()
	end
}

--问卷
RedPointHelper._FUNC_QUESTION = {
	mainRP = function(params)
		return true
	end
}

--世界boss
RedPointHelper._FUNC_WORLD_BOSS = {
	mainRP = function(params)
		return false
	end
}

--背包界面
RedPointHelper._FUNC_ITEM_BAG = {
	mainRP = function(params)
		local FunctionCheck = require("app.utils.logic.FunctionCheck")
		local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
		local isMerge = require("app.utils.UserDataHelper").isEnoughBagMergeLevel()
		local hasRed = false
		if isOpen then
			local hasRedItem = G_UserData:getItems():hasRedPoint()
			local hasRedFragment = G_UserData:getFragments():hasRedPoint({fragType = 8})
			local hasRedFragment2 = G_UserData:getFragments():hasRedPoint({fragType = 6})
			hasRed = hasRedItem or hasRedFragment or hasRedFragment2
		else
			hasRed = hasRedItem
		end

		if hasRed == true then
			return true
		end

		if isMerge then -- 达到80级以后合并装备、神兵、宝物的红提示
			local hasRedEquip = G_UserData:getFragments():hasRedPoint({fragType = 2})
			local hasRedTreasure = G_UserData:getFragments():hasRedPoint({fragType = 3})
			local hasRedInstrument = G_UserData:getFragments():hasRedPoint({fragType = 4})
			hasRed = hasRed or hasRedEquip or hasRedInstrument or hasRedInstrument
		end

		-- 历代名将碎片和武器碎片的红点提示
		local isHistoryOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
		if isHistoryOpen then
			local hasRedHistoryHero = G_UserData:getFragments():hasRedPoint({fragType = 13})
			local hasRedHistoryHeroEquip = G_UserData:getFragments():hasRedPoint({fragType = 14})
			hasRed = hasRed or hasRedHistoryHero or hasRedHistoryHeroEquip
		end

		return hasRed
	end
}

--军团
RedPointHelper._FUNC_ARMY_GROUP = {
	mainRP = function(params)
		local redValue1 = G_UserData:getGuild():hasAddGuildRedPoint()
		local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "helpRP")
		local redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "hallRP")
		local redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "contributionRP")
		local redValue5 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "dungeonRP")

		logWarn(
			"  " ..
				tostring(redValue1) ..
					" " ..
						tostring(redValue2) .. " " .. tostring(redValue3) .. " " .. tostring(redValue4) .. " " .. tostring(redValue5)
		)
		return redValue1 or redValue2 or redValue3 or redValue4
	end,
	myHelpRP = function(params) --我的求助
		local redValue1 = G_UserData:getGuild():hasHelpRewardRedPoint()
		local redValue2 = G_UserData:getRedPoint():isHasGuildHelpReceive()
		local redValue3 = G_UserData:getRedPoint():isGuildCanAddHeroHelp()

		logWarn("myHelpRP  " .. tostring(redValue1) .. " " .. tostring(redValue2) .. " " .. tostring(redValue3))

		return redValue1 or redValue2 or redValue3
	end,
	giveHelpRP = function(params) --军团援助
		local RedPointConst = require("app.const.RedPointConst")
		local redValue1 = G_UserData:getRedPoint():isHasRedPointByMaskIndex(RedPointConst.MASK_INDEX_GUILD_HELP)
		return redValue1
	end,
	helpRP = function(params) --祈福
		local GuildConst = require("app.const.GuildConst")
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_HELP_ID, false) then
			return false
		end

		local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "myHelpRP")
		local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "giveHelpRP")
		return redValue1 or redValue2
	end,
	hallRP = function(params) --大厅
		local GuildConst = require("app.const.GuildConst")
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_HALL_ID, false) then
			return false
		end

		local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "checkApplicationRP")
		local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "redPacketRP")
		local redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, "guildTaskRP")
		return redValue1 or redValue2 or redValue3
	end,
	checkApplicationRP = function(params) --审核申请
		local redValue1 = G_UserData:getRedPoint():isHasGuildCheckApplication()
		return redValue1
	end,
	redPacketRP = function(params) --军团红包
		local redValue1 = G_UserData:getRedPoint():isGuildHasRedPacketRedPoint()
		return redValue1
	end,
	contributionRP = function(params) --军团捐献
		local GuildConst = require("app.const.GuildConst")
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_CONTRIBUTION_ID, false) then
			return false
		end
		local redValue1 = G_UserData:getRedPoint():isGuildHasContributionRedPoint()
		local redValue2 = G_UserData:getGuild():hasCanContributionRedPoint()
		return redValue1 or redValue2
	end,
	guildTaskRP = function(params) --军团基本信息红点
		local redValue1 = G_UserData:getRedPoint():isGuildHasTaskRedPoint()
		return redValue1
	end,
	dungeonRP = function(params) --军团副本
		local GuildConst = require("app.const.GuildConst")
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_DUNGEON_ID, false) then --军团副本ID
			return false
		end

		if not LogicCheckHelper.checkGuildDungeonInOpenTime(false) then
			return false
		end

		--[[
		local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
		return userGuildInfo:getDungeon_cnt() > 0
			]]
		--判断时间

		local RedPointConst = require("app.const.RedPointConst")
		return G_UserData:getRedPoint():isHasRedPointByMaskIndex(RedPointConst.MASK_INDEX_GUILD_DUNGEON)
	end
}

--背包界面
RedPointHelper._FUNC_FRIEND = {
	mainRP = function(params)
		local isOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_FRIEND)
		if not isOpen then
			return false
		end
		local redValue1 = G_UserData:getFriend():hasApplyRedPoint()
		local redValue2 = G_UserData:getFriend():hasGetEnergyRedPoint()
		return redValue1 or redValue2
	end
}

RedPointHelper._FUNC_SYNTHESIS = {
	mainRP = function(params)
		return G_UserData:getSynthesis():checkCanSynthesis()
	end
}

RedPointHelper._FUNC_CRYSTAL_SHOP = {
	mainRP = function(params)
		local isOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_CRYSTAL_SHOP)
		if not isOpen then
			return false
		end
		return G_UserData:getCrystalShop():hasRedPoint()
	end
}

RedPointHelper._FUNC_AVATAR = {
	mainRP = function()
		local isOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_AVATAR)
		if not isOpen then
			return false
		end
		local redValue1 = require("app.utils.data.AvatarDataHelper").isPromptChange()
		local redValue2 = require("app.utils.data.AvatarDataHelper").isCanActiveBook()
		return redValue1 or redValue2
	end
}
--背包界面
RedPointHelper._FUNC_CARNIVAL_ACTIVITY = {
	mainRP = function(params)
		local isOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_CARNIVAL_ACTIVITY)
		if not isOpen then
			return false
		end
		return G_UserData:getCarnivalActivity():isHasRedPoint()
	end
}

--锦囊
RedPointHelper._FUNC_SILKBAG = {
	mainRP = function(pos)
		for i = 1, 6 do
			local param = {pos = pos, slot = i}
			local redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SILKBAG, "slotRP", param)
			if redValue then
				return true
			end
		end
		return false
	end,
	slotRP = function(param)
		local pos = param.pos
		local slot = param.slot
		return G_UserData:getSilkbag():isHaveRedPoint(pos, slot)
	end
}

--拍卖
RedPointHelper._FUNC_AUCTION = {
	mainRP = function(pos)
		local isOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_AUCTION)
		if not isOpen then
			return false
		end
		return G_UserData:getAuction():isHaveRedPoint()
	end
}
--手杀联动(三国杀)
RedPointHelper._FUNC_LINKAGE_ACTIVITY = {
	mainRP = function(params)
		local isOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_LINKAGE_ACTIVITY)
		if not isOpen then
			return false
		end
		return G_UserData:getLinkageActivity():hasRedPoint()
	end
}
--手杀联动(三国杀online)
RedPointHelper._FUNC_LINKAGE_ACTIVITY2 = {
	mainRP = function(params)
		local isOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_LINKAGE_ACTIVITY)
		if not isOpen then
			return false
		end
		return G_UserData:getLinkageActivity():hasRedPoint()
	end
}

--神兽家园小红点数据
RedPointHelper._FUNC_HOMELAND = {
	mainRP = function(...)
		-- body
		return G_UserData:getHomeland():hasRedPoint()
	end
}

--阵营竞技
RedPointHelper._FUNC_CAMP_RACE = {
	mainRP = function(...)
		return G_UserData:getCampRaceData():hasRedPoint()
	end
}

--跑男系统小红点数据
RedPointHelper._FUNC_RUNNING_MAN = {
	mainRP = function(...)
		-- body
		return G_UserData:getRunningMan():hasRedPoint()
	end
}

--高级VIP信息认证
RedPointHelper._FUNC_RICH_MAN_INFO_COLLECT = {
	mainRP = function(...)
		return false
	end
}

--无差别小红点
RedPointHelper._FUNC_SEASONSOPRT = {
	mainRP = function(...)
		-- body
		return G_UserData:getRedPoint():isSeasonDailyReward()
	end
}

--跨服军团战小红点
RedPointHelper._FUNC_GUILD_CROSS_WAR = {
	mainRP = function(...)
		-- body
        return G_UserData:getRedPoint():isGuildCrossWarGuess() or 
               G_UserData:getRedPoint():isGuildCrossWarCamp()
    end,
    inspireSupport =  function(data)
		return G_UserData:getRedPoint():isGuildCrossWarGuess()
	end
}

--组队红点
RedPointHelper._FUNC_GROUPS = {
	mainRP = function(...)
		return G_UserData:getGroups():hasRedPoint()
	end
}

-- 称号小红点
RedPointHelper._FUNC_TITLE = {
	mainRP = function(...)
		return G_UserData:getTitles():isHasRedPoint()
	end
}

-- 头像框小红点
RedPointHelper._FUNC_HEAD_FRAME = {
	mainRP = function(...)
		return G_UserData:getHeadFrame():hasRedPoint()
	end
}

--个人竞技竞猜
RedPointHelper._FUNC_SINGLE_RACE = {
	mainRP = function(...)
		return G_UserData:getRedPoint():isSingleRaceGuess()
	end
}

--蛋糕活动商店
RedPointHelper._FUNC_CAKE_ACTIVITY_SHOP = {
	mainRP = function(...)
		return G_UserData:getCakeActivity():isShowShopRedPoint()
	end
}

--蛋糕活动
RedPointHelper._FUNC_CAKE_ACTIVITY = {
	mainRP = function(...)
		local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, "getMaterial")
		local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, "giveMaterial")
		local redValue3 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, "getLevelUpAward")
		local redValue4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, "getDailyAward")
		return redValue1 or redValue2 or redValue3 or redValue4
	end,

	--有材料可领取
	getMaterial = function(params)
		local redValue1 = G_UserData:getCakeActivity():isHaveCanGetMaterial()
		local redValue2 = G_UserData:getCakeActivity():isPromptRecharge()
		return redValue1 or redValue2
	end,
	--有可捐献的材料
	giveMaterial = function(params)
		return G_UserData:getCakeActivity():isHaveCanGiveMaterial()
	end,
	--有可领取的蛋糕升级奖励
	getLevelUpAward = function(params)
		return G_UserData:getCakeActivity():isHaveCanGetLevelUpAward()
	end,
	--有可领取的蛋糕登录奖励
	getDailyAward = function(params)
		return G_UserData:getCakeActivity():isHaveCanGetDailyAward()
	end,
}

--金将招募
RedPointHelper._FUNC_GACHA_GOLDENHERO = {
	mainRP = function(...)
		return G_UserData:getRedPoint():isGachaGoldenHero()
	end
}

--历代名将红点
RedPointHelper._FUNC_HISTORY_HERO = {
	mainRP = function()
		local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_HERO, "getMaterial")
		return redValue1
	end,
	getMaterial =  function()
		local redValue = G_UserData:getHistoryHero():existCanBreakHistoryHero()
		return redValue
	end,
}

--历代名将灵力觉醒
RedPointHelper._FUNC_HISTORY_HERO_WAKEN = {
	mainRP = function(data)
		return data:enoughMaterial() --材料齐备
	end,
}

--历代名将界限突破
RedPointHelper._FUNC_HISTORY_HERO_BREAK = {
	mainRP = function(data)
		return data:materialAllReady() --材料齐备（全齐）
	end,
}

--历代名将上阵
RedPointHelper._FUNC_HISTORY_FORMATION = {
	mainRP = function()
		local redValue1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "space")
		local redValue2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, "stronger")
		return redValue1 or redValue2
	end,
	space =  function()
		local redValue = G_UserData:getHistoryHero():existSpaceOnFormation()
		return redValue
	end,
	stronger =  function()
		local redValue = G_UserData:getHistoryHero():existStrongerHero()
		return redValue
	end,
	strongerThanMe =  function(data)
		local redValue = data:existStronger()
		return redValue
	end
}

--暗度陈仓
RedPointHelper._FUNC_GRAIN_CAR = {
	mainRP = function(data)
		local canDonate = G_UserData:getRedPoint():isGrainCar()
		local canLaunch = G_UserData:getRedPoint():isGrainCarCanLaunch()
		return canDonate or canLaunch
	end,
	canDonate = function(data)
		return G_UserData:getRedPoint():isGrainCar()
	end,
	canLaunch = function(data)
		return G_UserData:getRedPoint():isGrainCarCanLaunch()
	end,
}

--红神兽
RedPointHelper._FUNC_RED_PET = {
	mainRP = function(data)
		local hasFreeTimes = G_UserData:getRedPoint():isRedPetShow()
		return hasFreeTimes
	end,
}


RedPointHelper._FUNC_ICON_MERGE = {
    mainRP = function()
        local MainMenuLayer = require("app.scene.view.main.MainMenuLayer")
        local funcList = MainMenuLayer.BAG_MERGE
        for i, value in ipairs(funcList) do
            local redPoint = RedPointHelper.isModuleReach(value.funcId)
            if redPoint == true then
                return true
            end
        end
        return false
    end
}

--背包整合界面
RedPointHelper._FUNC_ITEM_BAG2 = {
    mainRP = function(params)
        local FunctionCheck = require("app.utils.logic.FunctionCheck")
        local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
        local hasRed = false
        if isOpen then
            local hasRedItem = G_UserData:getItems():hasRedPoint()
            local hasRedFragment = G_UserData:getFragments():hasRedPoint({fragType = 8})
            local hasRedFragment2 = G_UserData:getFragments():hasRedPoint({fragType = 6})
            hasRed = hasRedItem or hasRedFragment or hasRedFragment2
        else
            hasRed = hasRedItem
        end

        if hasRed == true then
            return true
        end

        -- 历代名将碎片和武器碎片的红点提示
        local isHistoryOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
        if isHistoryOpen then
            local hasRedHistoryHero = G_UserData:getFragments():hasRedPoint({fragType = 13})
            local hasRedHistoryHeroEquip = G_UserData:getFragments():hasRedPoint({fragType = 14})
            hasRed = hasRed or hasRedHistoryHero or hasRedHistoryHeroEquip
        end

        return hasRed
    end
}

--回归确认红点
RedPointHelper._FUNC_RETURN_CONFIRM = {
	mainRP = function(params)
		if G_GameAgent:isLoginReturnServer() == false then
			return false
		end
		
		local FunctionCheck = require("app.utils.logic.FunctionCheck")
		local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RETURN_CONFIRM)
		if isOpen == false then
			return false
		end
		
		local info = G_GameAgent:getReturnServerInfo()
		if info.alreadyBackSid and info.alreadyBackSid ~= "" then
			return false
		end

		return true
	end	
}

--回归奖励红点
RedPointHelper._FUNC_RETURN_AWARD = {
	mainRP = function(params)
		if G_GameAgent:isLoginReturnServer() == false then
			return false
		end

		local FunctionCheck = require("app.utils.logic.FunctionCheck")
		local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RETURN_AWARD)
		if isOpen == false then
			return false
		end

		local returnSvr = G_UserData:getBase():getReturnSvr()
		if returnSvr == nil then
			return false
		end
		local ReturnServerDataHelper = require("app.utils.data.ReturnServerDataHelper")
		local list = ReturnServerDataHelper.getReturnAwardList()
		for i, unit in ipairs(list) do
			if returnSvr:isCanReceive(unit.id) then
				return true
			end
		end

		return false
	end
}

--阵法
RedPointHelper._FUNC_BOUT = {
	mainRP = function()
		return G_UserData:getBout():isMainRed()
	end,
}

return RedPointHelper
