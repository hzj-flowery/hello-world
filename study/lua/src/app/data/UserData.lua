local BaseData = require("app.data.BaseData")
local UserData = class("UserData", BaseData)

local schema = {}
schema["login"] = {"boolean", false}
schema["flush"] = {"boolean", false}

schema["base"] = {"table"}
schema["hero"] = {"table"}
schema["vip"] = {"table"}
schema["vipPay"] = {"table"}
schema["team"] = {"table"}
schema["chapter"] = {"table"}
schema["chapterBox"] = {"table"}
schema["stage"] = {"table"}
schema["items"] = {"table"}
schema["fragments"] = {"table"}
schema["shops"] = {"table"}
schema["karma"] = {"table"}
schema["equipment"] = {"table"}
schema["battleResource"] = {"table"}
schema["starRankData"] = {"table"}
schema["dailyDungeonData"] = {"table"}
schema["towerData"] = {"table"}
schema["towerRankData"] = {"table"}
schema["dailyMission"] = {"table"}
schema["treasure"] = {"table"}
schema["siegeData"] = {"table"}
schema["mails"] = {"table"}
schema["siegeRankData"] = {"table"}
schema["rechargeData"] = {"table"}
schema["activityMonthCard"] = {"table"}
schema["activity"] = {"table"}
schema["arenaData"] = {"table"}
schema["recruitData"] = {"table"}

schema["activityDailySignin"] = {"table"}
schema["activityDinner"] = {"table"}
schema["activityOpenServerFund"] = {"table"}
schema["activityLuxuryGiftPkg"] = {"table"}
schema["activityMoneyTree"] = {"table"}
schema["activityWeeklyGiftPkg"] = {"table"}
schema["activityLevelGiftPkg"] = {"table"}
schema["serverRecord"] = {"table"}
schema["activityFirstPay"] = {"table"}
schema["activityRechargeAward"] = {"table"}
schema["activityBetaAppointment"] = {"table"}
schema["redPetData"] = {"table"}
schema["activityResourceBack"] = {"table"}
schema["activitySuperCheckin"] = {"table"}
schema["explore"] = {"table"}
schema["userOpera"] = {"table"}
schema["achievement"] = {"table"}
schema["day7Activity"] = {"table"}
schema["guild"] = {"table"}
schema["guildDungeon"] = {"table"}
schema["customActivity"] = {"table"}
schema["chat"] = {"table"}
schema["territory"] = {"table"}
schema["rollNotice"] = {"table"}
schema["userSetting"] = {"table"}
schema["redPoint"] = {"table"}
schema["teamRedPoint"] = {"table"}
schema["teamCache"] = {"table"}
schema["attr"] = {"table"}
schema["questionnaire"] = {"table"}
schema["complexRank"] = {"table"}
schema["createRole"] = {"table"}
schema["instrument"] = {"table"}
schema["horse"] = {"table"}
schema["worldBoss"] = {"table"}
schema["crossWorldBoss"] = {"table"}
schema["userConfig"] = {"table"}
schema["auction"] = {"table"}
schema["tenJadeAuction"] = {"table"}
schema["handBook"] = {"table"}
schema["gemstone"] = {"table"}
schema["uiGuide"] = {"table"}
schema["bulletScreen"] = {"table"}
schema["friend"] = {"table"}
schema["enemy"] = {"table"}
schema["avatar"] = {"table"}
schema["nextFunctionOpen"] = {"table"}
schema["carnivalActivity"] = {"table"}
schema["guildAnswer"] = {"table"}
schema["pet"] = {"table"}
schema["crystalShop"] = {"table"}
schema["mineCraftData"] = {"table"}
schema["avatarPhoto"] = {"table"}
schema["rechargeRebate"] = {"table"}
schema["textInput"] = {"table"}
schema["silkbag"] = {"table"}
schema["silkbagOnTeam"] = {"table"}
schema["limitTimeActivity"] = {"table"}
schema["guildSprint"] = {"table"}
schema["timeLimitActivity"] = {"table"}
schema["dailyCount"] = {"table"}
schema["avatarActivity"] = {"table"}
schema["runningMan"] = {"table"}
schema["shopActive"] = {"table"}
schema["homeland"] = {"table"}
schema["countryBoss"] = {"table"}
schema["customActivityRecharge"] = {"table"}
schema["campRaceData"] = {"table"}
schema["linkageActivity"] = {"table"}
schema["guildWar"] = {"table"}
schema["guildCrossWar"] = {"table"}
schema["qinTomb"] = {"table"}
schema["groups"] = {"table"}
schema["horseRace"] = {"table"}
schema["seasonSport"] = {"table"}
schema["seasonSilk"] = {"table"}
schema["svip"] = {"table"}
schema["fightReport"] = {"table"}
schema["historyHero"] = {"table"}
schema["titles"] = {"table"}
schema["singleRace"] = {"table"}
schema["horseEquipment"] = {"table"}
schema["jade"] = {"table"}
schema["headFrame"] = {"table"}
schema["redPacketRain"] = {"table"}
schema["guildServerAnswer"] = {"table"}
schema["cakeActivity"] = {"table"}
schema["gachaGoldenHero"] = {"table"}
schema["synthesis"] = {"table"}
schema["returnData"] = {"table"}
schema["grainCar"] = {"table"}
schema["universeRace"] = {"table"}
schema["tactics"] = {"table"}
schema["bout"] = {"table"}
schema["tShirt"] = {"table"}
UserData.schema = schema

--
function UserData:ctor()
	local properties = {
		base = require("app.data.UserBaseData").new(),
		hero = require("app.data.HeroData").new(),
		vip = require("app.data.VipData").new(),
		vipPay = require("app.data.VipPayData").new(),
		team = require("app.data.TeamData").new(),
		chapter = require("app.data.ChapterData").new(),
		chapterBox = require("app.data.ChapterBoxData").new(),
		stage = require("app.data.StageData").new(),
		items = require("app.data.ItemsData").new(),
		fragments = require("app.data.FragmentData").new(),
		shops = require("app.data.ShopData").new(),
		karma = require("app.data.KarmaData").new(),
		equipment = require("app.data.EquipmentData").new(),
		battleResource = require("app.data.BattleResourceData").new(),
		starRankData = require("app.data.StarRankData").new(),
		dailyDungeonData = require("app.data.DailyDungeonData").new(),
		towerData = require("app.data.TowerData").new(),
		towerRankData = require("app.data.TowerRankData").new(),
		dailyMission = require("app.data.DailyMissionData").new(),
		treasure = require("app.data.TreasureData").new(),
		mails = require("app.data.MailData").new(),
		siegeData = require("app.data.SiegeData").new(),
		siegeRankData = require("app.data.SiegeRankData").new(),
		rechargeData = require("app.data.RechargeData").new(),
		activity = require("app.data.ActivityData").new(),
		activityMonthCard = require("app.data.ActivityMonthCardData").new(),
		arenaData = require("app.data.ArenaData").new(),
		activityDailySignin = require("app.data.ActivityDailySigninData").new(),
		activityDinner = require("app.data.ActivityDinnerData").new(),
		activityOpenServerFund = require("app.data.ActivityOpenServerFundData").new(),
		activityLuxuryGiftPkg = require("app.data.ActivityLuxuryGiftPkgData").new(),
		activityMoneyTree = require("app.data.ActivityMoneyTreeData").new(),
		activityWeeklyGiftPkg = require("app.data.ActivityWeeklyGiftPkgData").new(),
		activityLevelGiftPkg = require("app.data.ActivityLevelGiftPkgData").new(),
		serverRecord = require("app.data.ServerRecordData").new(),
		activityRechargeAward = require("app.data.ActivityRechargeAwardData").new(),
		activityBetaAppointment = require("app.data.ActivityBetaAppointmentData").new(),
		redPetData = require("app.data.RedPetData").new(),
		activityResourceBack = require("app.data.ActivityResourceBackData").new(),
		activitySuperCheckin = require("app.data.ActivitySuperCheckinData").new(),
		activityFirstPay = require("app.data.ActivityFirstPayData").new(),
		explore = require("app.data.ExploreData").new(),
		userOpera = require("app.data.UserOperaData").new(),
		achievement = require("app.data.AchievementData").new(),
		day7Activity = require("app.data.Day7ActivityData").new(),
		guild = require("app.data.GuildData").new(),
		guildDungeon = require("app.data.GuildDungeonData").new(),
		customActivity = require("app.data.CustomActivityData").new(),
		chat = require("app.data.ChatData").new(),
		territory = require("app.data.TerritoryData").new(),
		rollNotice = require("app.data.RollNoticeData").new(),
		userSetting = require("app.data.UserSettingData").new(),
		recruitData = require("app.data.RecruitData").new(),
		redPoint = require("app.data.RedPointData").new(),
		teamRedPoint = require("app.data.TeamRedPointData").new(),
		teamCache = require("app.data.TeamCacheData").new(),
		attr = require("app.data.AttrData").new(),
		questionnaire = require("app.data.QuestionnaireData").new(),
		complexRank = require("app.data.ComplexRankData").new(),
		createRole = require("app.data.CreateRoleData").new(),
		instrument = require("app.data.InstrumentData").new(),
		horse = require("app.data.HorseData").new(),
		worldBoss = require("app.data.WorldBossData").new(),
		crossWorldBoss = require("app.data.CrossWorldBossData").new(),
		userConfig = require("app.data.UserConfigData").new(),
		auction = require("app.data.AuctionData").new(),
		tenJadeAuction = require("app.data.TenJadeAuctionData").new(),
		handBook = require("app.data.HandBookData").new(),
		gemstone = require("app.data.GemstoneData").new(),
		uiGuide = require("app.data.UIGuideData").new(),
		bulletScreen = require("app.data.BulletScreenData").new(),
		friend = require("app.data.FriendData").new(),
		enemy = require("app.data.EnemyData").new(),
		avatar = require("app.data.AvatarData").new(),
		nextFunctionOpen = require("app.data.NextFunctionOpenData").new(),
		carnivalActivity = require("app.data.CarnivalActivityData").new(),
		guildAnswer = require("app.data.GuildAnswerData").new(),
		pet = require("app.data.PetData").new(),
		crystalShop = require("app.data.CrystalShopData").new(),
		mineCraftData = require("app.data.MineCraftData").new(),
		avatarPhoto = require("app.data.AvatarPhotoData").new(),
		rechargeRebate = require("app.data.RechargeRebateData").new(),
		textInput = require("app.data.TextInputData").new(),
		silkbag = require("app.data.SilkbagData").new(),
		silkbagOnTeam = require("app.data.SilkbagOnTeamData").new(),
		limitTimeActivity = require("app.data.LimitTimeActivityData").new(),
		guildSprint = require("app.data.ActivityGuildSprintData").new(),
		timeLimitActivity = require("app.data.TimeLimitActivityData").new(),
		dailyCount = require("app.data.DailyCountData").new(),
		avatarActivity = require("app.data.AvatarActivityData").new(),
		runningMan = require("app.data.RunningManData").new(),
		shopActive = require("app.data.ShopActiveData").new(),
		homeland = require("app.data.HomelandData").new(),
		countryBoss = require("app.data.CountryBossData").new(),
		customActivityRecharge = require("app.data.CustomActivityRechargeData").new(),
		campRaceData = require("app.data.CampRaceData").new(),
		linkageActivity = require("app.data.LinkageActivityData").new(),
		guildWar = require("app.data.GuildWarData").new(),
		guildCrossWar = require("app.data.GuildCrossWarData").new(),
		qinTomb = require("app.data.QinTombData").new(),
		groups = require("app.data.GroupsData").new(),
		horseRace = require("app.data.HorseRaceData").new(),
		seasonSport = require("app.data.SeasonSportData").new(),
		seasonSilk = require("app.data.SeasonSilkData").new(),
		svip = require("app.data.SvipData").new(),
		fightReport = require("app.data.FightReportData").new(),
		historyHero = require("app.data.HistoryHeroData").new(),
		titles = require("app.data.HonorTitleData").new(),
		singleRace = require("app.data.SingleRaceData").new(),
		horseEquipment = require("app.data.HorseEquipmentData").new(),
		jade = require("app.data.JadeStoneData").new(),
		headFrame = require("app.data.HeadFrameData").new(),
		redPacketRain = require("app.data.RedPacketRainData").new(),
		guildServerAnswer = require("app.data.GuildServerAnswerData").new(),
		cakeActivity = require("app.data.CakeActivityData").new(),
		gachaGoldenHero = require("app.data.GachaGoldenHeroData").new(),
		synthesis = require("app.data.SynthesisData").new(),
		returnData = require("app.data.ReturnData").new(),
		grainCar = require("app.data.GrainCarData").new(),
		universeRace = require("app.data.UniverseRaceData").new(),
        tactics = require("app.data.TacticsData").new(),
		bout = require("app.data.BoutData").new(),
		tShirt = require("app.data.TShirtData").new(),
	}
	UserData.super.ctor(self, properties)

	self._modulePopupShow = {} --弹框显示，checkbox 本次登陆不再提示
	self._priceConfigCache = {}

	self._signalOpObject = G_NetworkManager:add(MessageIDConst.ID_S2C_OpObject, handler(self, self._recvOpObject))
	self._signalRecvSellObjects =
		G_NetworkManager:add(MessageIDConst.ID_S2C_SellObjects, handler(self, self._s2cSellObjects))
	self._signalRecvSellOnlyObjects =
		G_NetworkManager:add(MessageIDConst.ID_S2C_SellOnlyObjects, handler(self, self._s2cSellOnlyObjects))
	self._signalActivityNotice =
		G_NetworkManager:add(MessageIDConst.ID_S2C_ActivityNotice, handler(self, self._s2cActivityNotice))
end

-- 清除
function UserData:clear()
	self:getBase():clear()
	self:getHero():clear()
	self:getVip():clear()
	self:getTeam():clear()
	self:getChapter():clear()
	self:getChapterBox():clear()
	self:getStage():clear()
	self:getItems():clear()
	self:getFragments():clear()
	self:getShops():clear()
	self:getKarma():clear()
	self:getEquipment():clear()
	self:getBattleResource():clear()
	self:getStarRankData():clear()
	self:getDailyDungeonData():clear()
	self:getTowerData():clear()
	self:getTowerRankData():clear()
	self:getDailyMission():clear()
	self:getTreasure():clear()
	self:getMails():clear()
	self:getSiegeData():clear()
	self:getSiegeRankData():clear()
	self:getRechargeData():clear()
	self:getActivity():clear()
	self:getActivityMonthCard():clear()
	self:getArenaData():clear()
	self:getActivityDailySignin():clear()
	self:getActivityDinner():clear()
	self:getActivityOpenServerFund():clear()
	self:getActivityLuxuryGiftPkg():clear()
	self:getActivityMoneyTree():clear()
	self:getActivityWeeklyGiftPkg():clear()
	self:getActivityLevelGiftPkg():clear()
	self:getServerRecord():clear()
	self:getActivityFirstPay():clear()
	self:getActivityRechargeAward():clear()
	self:getActivityBetaAppointment():clear()
	self:getRedPetData():clear()
	self:getActivityResourceBack():clear()
	self:getActivitySuperCheckin():clear()
	self:getExplore():clear()
	self:getUserOpera():clear()
	self:getAchievement():clear()
	self:getDay7Activity():clear()
	self:getGuild():clear()
	self:getGuildDungeon():clear()
	self:getCustomActivity():clear()
	self:getChat():clear()
	self:getTerritory():clear()
	self:getRollNotice():clear()
	self:getUserSetting():clear()
	self:getRecruitData():clear()
	self:getRedPoint():clear()
	self:getTeamRedPoint():clear()
	self:getTeamCache():clear()
	self:getAttr():clear()
	self:getQuestionnaire():clear()
	self:getComplexRank():clear()
	self:getCreateRole():clear()
	self:getInstrument():clear()
	self:getHorse():clear()
	self:getWorldBoss():clear()
	self:getCrossWorldBoss():clear()
	self:getUserConfig():clear()
	self:getAuction():clear()
	self:getTenJadeAuction():clear()
	self:getHandBook():clear()
	self:getGemstone():clear()
	self:getUiGuide():clear()
	self:getBulletScreen():clear()
	self:getFriend():clear()
	self:getEnemy():clear()
	self:getAvatar():clear()
	self:getNextFunctionOpen():clear()
	self:getCarnivalActivity():clear()
	self:getGuildAnswer():clear()
	self:getPet():clear()
	self:getCrystalShop():clear()
	self:getMineCraftData():clear()
	self:getAvatarPhoto():clear()
	self:getRechargeRebate():clear()
	self:getTextInput():clear()
	self:getSilkbag():clear()
	self:getSilkbagOnTeam():clear()
	self:getLimitTimeActivity():clear()
	self:getGuildSprint():clear()
	self:getTimeLimitActivity():clear()
	self:getDailyCount():clear()
	self:getAvatarActivity():clear()
	self:getRunningMan():clear()
	self:getShopActive():clear()
	self:getHomeland():clear()
	self:getCountryBoss():clear()
	self:getCustomActivityRecharge():clear()
	self:getCampRaceData():clear()
	self:getLinkageActivity():clear()
	self:getGuildWar():clear()
	self:getGuildCrossWar():clear()
	self:getQinTomb():clear()
	self:getGroups():clear()
	self:getHorseRace():clear()
	self:getSeasonSport():clear()
	self:getSeasonSilk():clear()
	self:getSvip():clear()
	self:getFightReport():clear()
	self:getHistoryHero():clear()
	self:getSingleRace():clear()
	self:getTitles():clear()
	self:getHeadFrame():clear()
	self:getHorseEquipment():clear()
	self:getJade():clear()
	self:getRedPacketRain():clear()
    self:getGuildServerAnswer():clear()
	self:getGachaGoldenHero():clear()
	self:getSynthesis():clear()
	self:getReturnData():clear()
	self:getCakeActivity():clear()
	self:getGrainCar():clear()
	self:getUniverseRace():clear()
    self:getTactics():clear()
	self:getBout():clear()
	self:getTShirt():clear()

	self._signalOpObject:remove()
	self._signalOpObject = nil
	self._signalRecvSellObjects:remove()
	self._signalRecvSellObjects = nil
	self._signalActivityNotice:remove()
	self._signalActivityNotice = nil
	self._signalRecvSellOnlyObjects:remove()
	self._signalRecvSellOnlyObjects = nil
end

-- 重置
function UserData:reset()
	self:getBase():reset()
	self:getHero():reset()
	self:getVip():reset()
	self:getTeam():reset()
	self:getChapter():reset()
	self:getChapterBox():reset()
	self:getItems():reset()
	self:getFragments():reset()
	self:getShops():reset()
	self:getKarma():reset()
	self:getEquipment():reset()
	self:getBattleResource():reset()
	self:getStage():reset()
	self:getStarRankData():reset()
	self:getDailyDungeonData():reset()
	self:getTowerData():reset()
	self:getTowerRankData():reset()
	self:getDailyMission():reset()
	self:getTreasure():reset()
	self:getMails():reset()
	self:getSiegeData():reset()
	self:getSiegeRankData():reset()
	self:getRechargeData():reset()
	self:getActivity():reset()
	self:getActivityMonthCard():reset()
	self:getArenaData():reset()
	self:getActivityDailySignin():reset()
	self:getActivityDinner():reset()
	self:getActivityOpenServerFund():reset()
	self:getActivityLuxuryGiftPkg():reset()
	self:getActivityMoneyTree():reset()
	self:getActivityWeeklyGiftPkg():reset()
	self:getActivityLevelGiftPkg():reset()
	self:getServerRecord():reset()
	self:getActivityFirstPay():reset()
	self:getActivityRechargeAward():reset()
	self:getActivityBetaAppointment():reset()
	self:getRedPetData():reset()
	self:getActivityResourceBack():reset()
	self:getActivitySuperCheckin():reset()
	self:getExplore():reset()
	self:getUserOpera():reset()
	self:getAchievement():reset()
	self:getDay7Activity():reset()
	self:getGuild():reset()
	self:getGuildDungeon():reset()
	self:getCustomActivity():reset()
	self:getChat():reset()
	self:getTerritory():reset()
	self:getRollNotice():reset()
	self:getUserSetting():reset()
	self:getRecruitData():reset()
	self:getRedPoint():reset()
	self:getTeamRedPoint():reset()
	self:getTeamCache():reset()
	self:getAttr():reset()
	self:getQuestionnaire():reset()
	self:getComplexRank():reset()
	self:getCreateRole():reset()
	self:getInstrument():reset()
	self:getHorse():reset()
	self:getWorldBoss():reset()
	self:getCrossWorldBoss():reset()
	self:getUserConfig():reset()
	self:getAuction():reset()
	self:getTenJadeAuction():reset()
	self:getHandBook():reset()
	self:getGemstone():reset()
	self:getUiGuide():reset()
	self:getBulletScreen():reset()
	self:getFriend():reset()
	self:getEnemy():reset()
	self:getAvatar():reset()
	self:getNextFunctionOpen():reset()
	self:getCarnivalActivity():reset()
	self:getGuildAnswer():reset()
	self:getPet():reset()
	self:getCrystalShop():reset()
	self:getAvatarPhoto():reset()
	self:getRechargeRebate():reset()
	self:getTextInput():reset()
	self:getSilkbag():reset()
	self:getSilkbagOnTeam():reset()
	self:getLimitTimeActivity():reset()
	self:getGuildSprint():reset()
	self:getTimeLimitActivity():reset()
	self:getDailyCount():reset()
	self:getAvatarActivity():reset()
	self:getRunningMan():reset()
	self:getShopActive():reset()
	self:getHomeland():reset()
	self:getCountryBoss():reset()
	self:getCustomActivityRecharge():reset()
	self:getCampRaceData():reset()
	self:getLinkageActivity():reset()
	self:getGuildWar():reset()
	self:getGuildCrossWar():reset()
	self:getQinTomb():reset()
	self:getGroups():reset()
	self:getHorseRace():reset()
	self:getSeasonSport():reset()
	self:getSeasonSilk():reset()
	self:getSvip():reset()
	self:getFightReport():reset()
	self:getHistoryHero():reset()
	self:getSingleRace():reset()
	self:getTitles():reset()
	self:getHeadFrame():reset()
	self:getHorseEquipment():reset()
	self:getRedPacketRain():reset()
    self:getGuildServerAnswer():reset()
	self:getGachaGoldenHero():reset()
	self:getSynthesis():reset()
	self:getReturnData():reset()
	self:getCakeActivity():reset()
	self:getGrainCar():reset()
	self:getUniverseRace():reset()
    self:getTactics():reset()
	self:getBout():reset()
	self:getTShirt():reset()
end

--
function UserData:_recvOpObject(id, message)
	local function procItem(message)
		local item = rawget(message, "item")
		if item then
			if rawget(item, "update") then
				self:getItems():updateData(item.update)
				G_SignalManager:dispatch(SignalConst.EVENT_ITEM_OP_UPDATE, item.update)
			end
			if rawget(item, "insert") then
				self:getItems():insertData(item.insert)
				G_SignalManager:dispatch(SignalConst.EVENT_ITEM_OP_INSERT, item.insert)
			end
			if rawget(item, "delete") then
				self:getItems():deleteData(item.delete)
				G_SignalManager:dispatch(SignalConst.EVENT_ITEM_OP_DELETE, item.delete)
			end
		end
	end

	local function procHero(message)
		local hero = rawget(message, "hero")
		if hero then
			if rawget(hero, "update") then
				self:getHero():updateData(hero.update)
			end
			if rawget(hero, "insert") then
				self:getHero():insertData(hero.insert)
			end
			if rawget(hero, "delete") then
				self:getHero():deleteData(hero.delete)
			end
		end
	end

	local function procVip(message)
		local vip = rawget(message, "vip")
		if vip then
			self:getVip():updateData(message.vip.update)
		end
	end

	local function procFragment(message)
		local fragment = rawget(message, "fragment")
		if fragment then
			if rawget(fragment, "update") then
				self:getFragments():updateData(fragment.update)
				G_SignalManager:dispatch(SignalConst.EVENT_ITEM_OP_UPDATE, fragment.update)
			end
			if rawget(fragment, "insert") then
				self:getFragments():insertData(fragment.insert)
				G_SignalManager:dispatch(SignalConst.EVENT_ITEM_OP_UPDATE, fragment.insert)
			end
			if rawget(fragment, "delete") then
				self:getFragments():deleteData(fragment.delete)
				G_SignalManager:dispatch(SignalConst.EVENT_ITEM_OP_UPDATE, fragment.delete)
			end
		end
	end
	local function procCurrency(message)
		local currency = rawget(message, "currency")
		if currency then
			if rawget(currency, "update") then
				self:getBase():updateCurrencys(currency.update)
				G_SignalManager:dispatch(SignalConst.EVENT_RECV_CURRENCYS_INFO, currency.update)
			end
		end
	end

	local function procRecover(message)
		local recover = rawget(message, "recover")
		if recover then
			if rawget(recover, "update") then
				self:getBase():updateRecover(recover.update)
				G_SignalManager:dispatch(SignalConst.EVENT_RECV_RECOVER_INFO, recover.update)
			end
		end
	end

	local function procEquipment(message)
		local equipment = rawget(message, "equipment")
		if equipment then
			if rawget(equipment, "update") then
				self:getEquipment():updateData(equipment.update)
			end
			if rawget(equipment, "insert") then
				self:getEquipment():insertData(equipment.insert)
			end
			if rawget(equipment, "delete") then
				self:getEquipment():deleteData(equipment.delete)
			end
		end
	end

	local function procTreasure(message)
		local treasure = rawget(message, "treasure")
		if treasure then
			if rawget(treasure, "update") then
				self:getTreasure():updateData(treasure.update)
			end
			if rawget(treasure, "insert") then
				self:getTreasure():insertData(treasure.insert)
			end
			if rawget(treasure, "delete") then
				self:getTreasure():deleteData(treasure.delete)
			end
		end
	end

	local function procInstrument(message)
		local instrument = rawget(message, "instrument")
		if instrument then
			if rawget(instrument, "update") then
				self:getInstrument():updateData(instrument.update)
			end
			if rawget(instrument, "insert") then
				self:getInstrument():insertData(instrument.insert)
			end
			if rawget(instrument, "delete") then
				self:getInstrument():deleteData(instrument.delete)
			end
		end
	end

	local function procHorse(message)
		local warHorse = rawget(message, "warHorse")
		if warHorse then
			if rawget(warHorse, "update") then
				self:getHorse():updateData(warHorse.update)
			end
			if rawget(warHorse, "insert") then
				self:getHorse():insertData(warHorse.insert)
			end
			if rawget(warHorse, "delete") then
				self:getHorse():deleteData(warHorse.delete)
			end
		end
	end

	local function procGemstone(message)
		local gemstone = rawget(message, "gemstone")
		if gemstone then
			if rawget(gemstone, "update") then
				self:getGemstone():updateData(gemstone.update)
			end
			if rawget(gemstone, "insert") then
				self:getGemstone():insertData(gemstone.insert)
			end
			if rawget(gemstone, "delete") then
				self:getGemstone():deleteData(gemstone.delete)
			end
		end
	end

	local function procAvatar(message)
		local avatar = rawget(message, "avatar")
		if avatar then
			if rawget(avatar, "update") then
				self:getAvatar():updateData(avatar.update)
			end
			if rawget(avatar, "insert") then
				self:getAvatar():insertData(avatar.insert)
			end
			if rawget(avatar, "delete") then
				self:getAvatar():deleteData(avatar.delete)
			end
		end
	end

	local function procPet(message)
		local pet = rawget(message, "pet")
		if pet then
			if rawget(pet, "update") then
				self:getPet():updateData(pet.update)
			end
			if rawget(pet, "insert") then
				self:getPet():insertData(pet.insert)
			end
			if rawget(pet, "delete") then
				self:getPet():deleteData(pet.delete)
			end
		end
	end

	local function procSilkbag(message)
		local silkbag = rawget(message, "silkbag")
		if silkbag then
			if rawget(silkbag, "update") then
				self:getSilkbag():updateData(silkbag.update)
			end
			if rawget(silkbag, "insert") then
				self:getSilkbag():insertData(silkbag.insert)
			end
			if rawget(silkbag, "delete") then
				self:getSilkbag():deleteData(silkbag.delete)
			end
		end
	end

	local function procHistoryHero(message)
		local star = rawget(message, "star")
		if star then
			if rawget(star, "update") then
				self:getHistoryHero():updateData(star.update)
			end
			if rawget(star, "insert") then
				self:getHistoryHero():insertData(star.insert)
			end
			if rawget(star, "delete") then
				self:getHistoryHero():deleteData(star.delete)
			end
		end
	end

	local function procHistoryHeroWeapon(message)
		local starWeapon = rawget(message, "star_weapon")
		if starWeapon then
			if rawget(starWeapon, "update") then
				self:getHistoryHero():updateWeaponData(starWeapon.update)
			end
			if rawget(starWeapon, "insert") then
				self:getHistoryHero():insertWeaponData(starWeapon.insert)
			end
			if rawget(starWeapon, "delete") then
				self:getHistoryHero():deleteWeaponData(starWeapon.delete)
			end
		end
	end

	-- 操作称号数据
	local function procTitle(message)
		local title = rawget(message, "title")
		if title then
			if rawget(title, "update") then -- 数据有更新
				self:getTitles():updateTitleList(title.update)
			end
			if rawget(title, "insert") then -- 有新数据
				self:getTitles():insertHonorTitleList(title.insert)
			end
			if rawget(title, "delete") then -- 无
			end
		end
	end

	--操作头像框
	local function procHeadFrame(message)
		local headFrame = rawget(message, "head_frame")
		if headFrame then
			if rawget(headFrame, "update") then
				self:getHeadFrame():updateHeadFrame(headFrame.update)
			end
			if rawget(headFrame, "insert") then
				self:getHeadFrame():insertHeadFrame(headFrame.insert)
			end
			if rawget(headFrame, "delete") then
				self:getHeadFrame():deleteHeadFrame(headFrame.delete)
			end

			if rawget(headFrame, "cur_head_frame") then 
				self:getHeadFrame():setCurrentFrameByOp(headFrame.cur_head_frame)
			end
			G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HEAD_FRAME)
		end
	end

	-- 战马装备
	local function procHorseEquipment(message)
		local warHorseEquip = rawget(message, "war_horse_equip")
		if warHorseEquip then
			if rawget(warHorseEquip, "update") then -- 数据有更新
				self:getHorseEquipment():updateData(warHorseEquip.update)
			end
			if rawget(warHorseEquip, "insert") then -- 有新数据
				self:getHorseEquipment():insertData(warHorseEquip.insert)
			end
			if rawget(warHorseEquip, "delete") then
				self:getHorseEquipment():deleteData(warHorseEquip.delete) -- 无
			end
		end
	end

	local function procJadeStone(message)
		local jadeData = rawget(message, "jade")
		if jadeData then
			if rawget(jadeData, "update") then -- 数据有更新
				self:getJade():updateData(jadeData.update)
			end
			if rawget(jadeData, "insert") then -- 有新数据
				self:getJade():insertData(jadeData.insert)
			end
			if rawget(jadeData, "delete") then
				self:getJade():deleteData(jadeData.delete) -- 无
			end
		end
	end

	local function procHomeTreeBuff(message)
		local homeBuff = rawget(message, "home_buff")
		if homeBuff then
			if rawget(homeBuff, "update") then -- 数据有更新
				self:getHomeland():updateBuffData(homeBuff.update)
			end
			if rawget(homeBuff, "insert") then -- 有新数据
				self:getHomeland():insertBuffData(homeBuff.insert)
			end
			if rawget(homeBuff, "delete") then
				self:getHomeland():deleteBuffData(homeBuff.delete) -- 无
			end
		end
	end

	-- 战法
	local function procTactics(message)
		local tactics = rawget(message, "tactics")
		if tactics then
			if rawget(tactics, "update") then
				self:getTactics():updateData(tactics.update)
			end
			if rawget(tactics, "insert") then
				self:getTactics():insertData(tactics.insert)
			end
			if rawget(tactics, "delete") then
				self:getTactics():deleteData(tactics.delete)
			end
		end
    end
    
    local function procBout(message)
        -- body
        local bout = rawget(message, "bout")
        if bout then
            if rawget(bout, "insert") then
                self:getBout():insertData(bout.insert)
            end
            if rawget(bout, "delete") then
                self:getBout():deleteData(bout.delete)
            end
            if rawget(bout, "update") then
                self:getBout():updateData(bout.update)
            end         
        end
    end

	procItem(message)
	procHero(message)
	procVip(message)
	procFragment(message)
	procCurrency(message)
	procRecover(message)
	procEquipment(message)
	procTreasure(message)
	procInstrument(message)
	procHorse(message)
	procGemstone(message)
	procAvatar(message)
	procPet(message)
	procSilkbag(message)
	procHistoryHero(message)
	procHistoryHeroWeapon(message)
	procTitle(message)
	procHeadFrame(message)

	procHorseEquipment(message) --解析战马装备数据		\
	procJadeStone(message)
	procHomeTreeBuff(message)
    procTactics(message)
    procBout(message) --阵法
end

function UserData:c2sSellObjects(objects)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_SellObjects,
		{
			objects = objects
		}
	)
end

function UserData:c2sSellOnlyObjects(objects)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_SellOnlyObjects,
		{
			objects = objects
		}
	)
end

function UserData:c2sClientLog(table)
	-- body
	local clientLog = json.encode(table)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_SendClientLog,
		{
			logStr = clientLog
		}
	)
end

--活动开启服务器通知
--收到通知后，客户端拉取数据  // 活动类型（1:世界BOSS）
function UserData:_s2cActivityNotice(id, message)
	if message.activity_type == 1 then --世界BOSS
	--self:getWorldBoss():c2sEnterWorldBoss()
	end
	--发送活动开启通知
	G_SignalManager:dispatch(SignalConst.EVENT_ACTIVITY_NOTICE, message)
end

-- Describle：
function UserData:_s2cSellObjects(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local awards = rawget(message, "awards")
	if not awards then
		awards = {}
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, awards)
end

-- Describle：
function UserData:_s2cSellOnlyObjects(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local awards = rawget(message, "awards")
	if not awards then
		awards = {}
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SELL_ONLY_OBJECTS_SUCCESS, awards)
end

-- true 弹框在本次登陆显示
-- false 弹框在本次登陆不显示
function UserData:setPopModuleShow(moduelName, needShow)
	if needShow == nil then
		needShow = true
	end
	self._modulePopupShow["" .. moduelName] = needShow
end

function UserData:getPopModuleShow(moduelName)
	return self._modulePopupShow["" .. moduelName]
end

function UserData:getPriceConfig(priceAddId)
	local priceConfig = self._priceConfigCache[priceAddId]
	if priceConfig then
		return priceConfig
	end

	local function createPriceConfig(priceAddId)
		local priceCfg = require("app.config.price")
		local lastCfgData = nil

		local priceIdList = {}
		for i = 1, priceCfg.length() do
			local cfgData = priceCfg.indexOf(i)
			if cfgData.id == priceAddId then
				table.insert(priceIdList, cfgData)
			end
		end

		lastCfgData = priceIdList[#priceIdList]
		local maxTime = lastCfgData and lastCfgData.time or 0

		local newPriceIdList = {}
		for k, v in ipairs(priceIdList) do
			newPriceIdList[k] = v
		end

		local lastPriceConfig = nil
		logWarn("ddd " .. maxTime)
		for i = maxTime, 1, -1 do
			logWarn("ddd " .. tostring(i))
			if not newPriceIdList[i] then
				newPriceIdList[i] = lastPriceConfig
			else
				lastPriceConfig = newPriceIdList[i]
			end
		end
		return {priceList = priceIdList, priceMap = newPriceIdList, maxTime = maxTime}
	end
	priceConfig = createPriceConfig(priceAddId)
	self._priceConfigCache[priceAddId] = priceConfig
	return priceConfig
end

return UserData
