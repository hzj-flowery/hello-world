import { ConfigNameConst } from '../const/ConfigNameConst';
import { FunctionConst } from '../const/FunctionConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { G_ConfigLoader, G_NetworkManager, G_SignalManager } from '../init';
import { AchievementData } from './AchievementData';
import { ActivityBetaAppointmentData } from './ActivityBetaAppointmentData';
import { ActivityDailySigninData } from './ActivityDailySigninData';
import { ActivityData } from './ActivityData';
import { ActivityDinnerData } from './ActivityDinnerData';
import { ActivityFirstPayData } from './ActivityFirstPayData';
import { ActivityGuildSprintData } from './ActivityGuildSprintData';
import { ActivityLevelGiftPkgData } from './ActivityLevelGiftPkgData';
import { ActivityLuxuryGiftPkgData } from './ActivityLuxuryGiftPkgData';
import { ActivityMoneyTreeData } from './ActivityMoneyTreeData';
import { ActivityMonthCardData } from './ActivityMonthCardData';
import { ActivityOpenServerFundData } from './ActivityOpenServerFundData';
import { ActivityRechargeAwardData } from './ActivityRechargeAwardData';
import { ActivityResourceBackData } from './ActivityResourceBackData';
import { ActivitySuperCheckinData } from './ActivitySuperCheckinData';
import { ActivityWeeklyGiftPkgData } from './ActivityWeeklyGiftPkgData';
import { ArenaData } from './ArenaData';
import { AttrData } from './AttrData';
import { AuctionData } from './AuctionData';
import { AvatarActivityData } from './AvatarActivityData';
import { AvatarData } from './AvatarData';
import { AvatarPhotoData } from './AvatarPhotoData';
import { BaseData } from './BaseData';
import { BattleResourceData } from './BattleResourceData';
import { BulletScreenData } from './BulletScreenData';
import { CakeActivityData } from './CakeActivityData';
import { CampRaceData } from './CampRaceData';
import { CarnivalActivityData } from './CarnivalActivityData';
import { ChapterBoxData } from './ChapterBoxData';
import { ChapterData } from './ChapterData';
import { ChatData } from './ChatData';
import { ComplexRankData } from './ComplexRankData';
import { CountryBossData } from './CountryBossData';
import { CreateRoleData } from './CreateRoleData';
import { CrystalShopData } from './CrystalShopData';
import { CustomActivityData } from './CustomActivityData';
import { CustomActivityRechargeData } from './CustomActivityRechargeData';
import { DailyCountData } from './DailyCountData';
import { DailyDungeonData } from './DailyDungeonData';
import { DailyMissionData } from './DailyMissionData';
import { Day7ActivityData } from './Day7ActivityData';
import { EnemyData } from './EnemyData';
import { EquipmentData } from './EquipmentData';
import { ExploreData } from './ExploreData';
import { FightReportData } from './FightReportData';
import { FragmentData } from './FragmentData';
import { FriendData } from './FriendData';
import { GachaGoldenHeroData } from './GachaGoldenHeroData';
import { GemstoneData } from './GemstoneData';
import { GroupsData } from './GroupsData';
import { GuildAnswerData } from './GuildAnswerData';
import { GuildCrossWarData } from './GuildCrossWarData';
import { GuildData } from './GuildData';
import { GuildDungeonData } from './GuildDungeonData';
import { GuildServerAnswerData } from './GuildServerAnswerData';
import { GuildWarData } from './GuildWarData';
import { HandBookData } from './HandBookData';
import { HeadFrameData } from './HeadFrameData';
import { HeroData } from './HeroData';
import { HistoryHeroData } from './HistoryHeroData';
import { HomelandData } from './HomelandData';
import { HonorTitleData } from './HonorTitleData';
import { HorseData } from './HorseData';
import { HorseEquipmentData } from './HorseEquipmentData';
import { HorseRaceData } from './HorseRaceData';
import { InstrumentData } from './InstrumentData';
import { ItemsData } from './ItemsData';
import { JadeStoneData } from './JadeStoneData';
import { KarmaData } from './KarmaData';
import { LimitTimeActivityData } from './LimitTimeActivityData';
import { LinkageActivityData } from './LinkageActivityData';
import { MailData } from './MailData';
import { MineCraftData } from './MineCraftData';
import { NextFunctionOpenData } from './NextFunctionOpenData';
import { PetData } from './PetData';
import { QinTombData } from './QinTombData';
import { QuestionnaireData } from './QuestionnaireData';
import { RechargeData } from './RechargeData';
import { RechargeRebateData } from './RechargeRebateData';
import { RecruitData } from './RecruitData';
import { RedPacketRainData } from './RedPacketRainData';
import { RedPointData } from './RedPointData';
import { RollNoticeData } from './RollNoticeData';
import { RunningManData } from './RunningManData';
import { SeasonSilkData } from './SeasonSilkData';
import { SeasonSportData } from './SeasonSportData';
import { ServerRecordData } from './ServerRecordData';
import { ShopActiveData } from './ShopActiveData';
import { ShopData } from './ShopData';
import { SiegeData } from './SiegeData';
import { SiegeRankData } from './SiegeRankData';
import { SilkbagData } from './SilkbagData';
import { SilkbagOnTeamData } from './SilkbagOnTeamData';
import { SingleRaceData } from './SingleRaceData';
import { StageData } from './StageData';
import { StarRankData } from './StarRankData';
import { SvipData } from './SvipData';
import { SynthesisData } from './SynthesisData';
import { TeamCacheData } from './TeamCacheData';
import { TeamData } from './TeamData';
import { TeamRedPointData } from './TeamRedPointData';
import { TerritoryData } from './TerritoryData';
import { TextInputData } from './TextInputData';
import { TimeLimitActivityData } from './TimeLimitActivityData';
import { TowerData } from './TowerData';
import { TowerRankData } from './TowerRankData';
import { TreasureData } from './TreasureData';
import { UIGuideData } from './UIGuideData';
import { UserBaseData } from './UserBaseData';
import { UserConfigData } from './UserConfigData';
import { UserOperaData } from './UserOperaData';
import { UserSettingData } from './UserSettingData';
import { VipData } from './VipData';
import { VipPayData } from './VipPayData';
import { WorldBossData } from './WorldBossData';
import { Day7RechargeData } from './Day7RechargeData';
import { RechargeActivityData } from './RechargeActivityData';
import { GrainCarData } from './GrainCarData';
import { ReturnData } from './ReturnData';
import { TenJadeAuctionData } from './TenJadeAuctionData';
import { TacticsData } from './TacticsData';
import { BoutData } from './BoutData';
import { RedPetData } from './RedPetData';
import { CrossWorldBossData } from './CrossWorldBossData';
import {MilitaryMasterPlanDataNew } from './MilitaryMasterPlanDataNew';
import { ShareRewardData } from './ShareRewardData';
let schema = {};
schema['login'] = [
    'boolean',
    false
];
schema['flush'] = [
    'boolean',
    false
];
schema['base'] = ['object'];
schema['bout'] = ['object'];
schema['crossWorldBoss'] = ['object'];

schema['hero'] = ['object'];
schema['vip'] = ['object'];
schema['vipPay'] = ['object'];
schema['team'] = ['object'];
schema['chapter'] = ['object'];
schema['chapterBox'] = ['object'];
schema['stage'] = ['object'];
schema['items'] = ['object'];
schema['fragments'] = ['object'];
schema['shops'] = ['object'];
schema['karma'] = ['object'];
schema['equipment'] = ['object'];
schema['battleResource'] = ['object'];
schema['starRankData'] = ['object'];
schema['dailyDungeonData'] = ['object'];
schema['towerData'] = ['object'];
schema['towerRankData'] = ['object'];
schema['dailyMission'] = ['object'];
schema['treasure'] = ['object'];
schema['siegeData'] = ['object'];
schema['mails'] = ['object'];
schema['siegeRankData'] = ['object'];
schema['rechargeData'] = ['object'];
schema['activityMonthCard'] = ['object'];
schema['activity'] = ['object'];
schema['arenaData'] = ['object'];
schema['recruitData'] = ['object'];
schema['activityDailySignin'] = ['object'];
schema['activityDinner'] = ['object'];
schema['activityOpenServerFund'] = ['object'];
schema['activityLuxuryGiftPkg'] = ['object'];
schema['activityMoneyTree'] = ['object'];
schema['activityWeeklyGiftPkg'] = ['object'];
schema['activityLevelGiftPkg'] = ['object'];
schema['serverRecord'] = ['object'];
schema['activityFirstPay'] = ['object'];
schema['activityRechargeAward'] = ['object'];
schema['activityBetaAppointment'] = ['object'];
schema['activityResourceBack'] = ['object'];
schema['activitySuperCheckin'] = ['object'];
schema['explore'] = ['object'];
schema['userOpera'] = ['object'];
schema['achievement'] = ['object'];
schema['day7Activity'] = ['object'];
schema['guild'] = ['object'];
schema['guildDungeon'] = ['object'];
schema['customActivity'] = ['object'];
schema['chat'] = ['object'];
schema['territory'] = ['object'];
schema['rollNotice'] = ['object'];
schema['userSetting'] = ['object'];
schema['redPoint'] = ['object'];
schema['redPetData'] = ['object'];
schema['teamRedPoint'] = ['object'];
schema['teamCache'] = ['object'];
schema['attr'] = ['object'];
schema['questionnaire'] = ['object'];
schema['complexRank'] = ['object'];
schema['createRole'] = ['object'];
schema['instrument'] = ['object'];
schema['horse'] = ['object'];
schema['worldBoss'] = ['object'];
schema['userConfig'] = ['object'];
schema['auction'] = ['object'];
schema['handBook'] = ['object'];
schema['gemstone'] = ['object'];
schema['uiGuide'] = ['object'];
schema['bulletScreen'] = ['object'];
schema['friend'] = ['object'];
schema['enemy'] = ['object'];
schema['avatar'] = ['object'];
schema['nextFunctionOpen'] = ['object'];
schema['carnivalActivity'] = ['object'];
schema['guildAnswer'] = ['object'];
schema['pet'] = ['object'];
schema['crystalShop'] = ['object'];
schema['mineCraftData'] = ['object'];
schema['avatarPhoto'] = ['object'];
schema['rechargeRebate'] = ['object'];
schema['textInput'] = ['object'];
schema['silkbag'] = ['object'];
schema['silkbagOnTeam'] = ['object'];
schema['limitTimeActivity'] = ['object'];
schema['guildSprint'] = ['object'];
schema['timeLimitActivity'] = ['object'];
schema['dailyCount'] = ['object'];
schema['avatarActivity'] = ['object'];
schema['runningMan'] = ['object'];
schema['shopActive'] = ['object'];
schema['homeland'] = ['object'];
schema['countryBoss'] = ['object'];
schema['customActivityRecharge'] = ['object'];
schema['campRaceData'] = ['object'];
schema['linkageActivity'] = ['object'];
schema['guildWar'] = ['object'];
schema['guildCrossWar'] = ['object'];
schema['qinTomb'] = ['object'];
schema['groups'] = ['object'];
schema['horseRace'] = ['object'];
schema['seasonSport'] = ['object'];
schema['seasonSilk'] = ['object'];
schema['svip'] = ['object'];
schema['fightReport'] = ['object'];
schema['historyHero'] = ['object'];
schema['titles'] = ['object'];
schema['singleRace'] = ['object'];
schema['horseEquipment'] = ['object'];
schema['jade'] = ['object'];
schema['headFrame'] = ['object'];
schema['redPacketRain'] = ['object'];
schema['guildServerAnswer'] = ['object'];
schema['cakeActivity'] = ['object'];
schema['gachaGoldenHero'] = ['object'];
schema['synthesis'] = ['object'];
schema['day7Recharge'] = ['object'];
schema['rechargeActivity'] = ['object'];
schema['rechargeActivity'] = ['object'];
schema['grainCar'] = ['object'];
schema['returnData'] = ['object'];
schema["tenJadeAuction"] = ['object'];
schema['tactics'] = ['object'];
schema['militaryMasterPlan'] = ['object'];
schema['shareReward'] = ['object'];

export interface UserData {
    isLogin(): boolean;
    setLogin(value: boolean);
    isLastLogin(): boolean;
    isFlush(): boolean;
    setFlush(value: boolean);
    isLastFlush(): boolean;

    getBase(): UserBaseData
    setBase(value: UserBaseData)
    getLastBase(): UserBaseData
    getBout():BoutData;
    setBout(value:BoutData)
    getHero(): HeroData
    setHero(value: HeroData)
    getLastHero(): HeroData
    getVip(): VipData
    setVip(value: VipData)
    getLastVip(): VipData
    getVipPay(): VipPayData
    setVipPay(value: VipPayData)
    getLastVipPay(): VipPayData
    getTeam(): TeamData
    setTeam(value: TeamData)
    getLastTeam(): TeamData
    getChapter(): ChapterData
    setChapter(value: ChapterData)
    getLastChapter(): ChapterData
    getChapterBox(): ChapterBoxData
    setChapterBox(value: ChapterBoxData)
    getLastChapterBox(): ChapterBoxData
    getStage(): StageData
    setStage(value: StageData)
    getLastStage(): StageData
    getItems(): ItemsData
    setItems(value: ItemsData)
    getLastItems(): ItemsData
    getFragments(): FragmentData
    setFragments(value: FragmentData)
    getLastFragments(): FragmentData
    getShops(): ShopData
    setShops(value: ShopData)
    getLastShops(): ShopData
    getKarma(): KarmaData
    setKarma(value: KarmaData)
    getLastKarma(): KarmaData
    getEquipment(): EquipmentData
    setEquipment(value: EquipmentData)
    getLastEquipment(): EquipmentData
    getBattleResource(): BattleResourceData
    setBattleResource(value: BattleResourceData)
    getLastBattleResource(): BattleResourceData
    getStarRankData(): StarRankData
    setStarRankData(value: StarRankData)
    getLastStarRankData(): StarRankData
    getDailyDungeonData(): DailyDungeonData
    setDailyDungeonData(value: DailyDungeonData)
    getLastDailyDungeonData(): DailyDungeonData
    getTowerData(): TowerData
    setTowerData(value: TowerData)
    getLastTowerData(): TowerData
    getTowerRankData(): TowerRankData
    setTowerRankData(value: TowerRankData)
    getLastTowerRankData(): TowerRankData
    getDailyMission(): DailyMissionData
    setDailyMission(value: DailyMissionData)
    getLastDailyMission(): DailyMissionData
    getTreasure(): TreasureData
    setTreasure(value: TreasureData)
    getLastTreasure(): TreasureData
    getMails(): MailData
    setMails(value: MailData)
    getLastMails(): MailData
    getSiegeData(): SiegeData
    setSiegeData(value: SiegeData)
    getLastSiegeData(): SiegeData
    getSiegeRankData(): SiegeRankData
    setSiegeRankData(value: SiegeRankData)
    getLastSiegeRankData(): SiegeRankData
    getRechargeData(): RechargeData
    setRechargeData(value: RechargeData)
    getLastRechargeData(): RechargeData
    getActivity(): ActivityData
    setActivity(value: ActivityData)
    getLastActivity(): ActivityData
    getActivityMonthCard(): ActivityMonthCardData
    setActivityMonthCard(value: ActivityMonthCardData)
    getLastActivityMonthCard(): ActivityMonthCardData
    getArenaData(): ArenaData
    setArenaData(value: ArenaData)
    getLastArenaData(): ArenaData
    getActivityDailySignin(): ActivityDailySigninData
    setActivityDailySignin(value: ActivityDailySigninData)
    getLastActivityDailySignin(): ActivityDailySigninData
    getActivityDinner(): ActivityDinnerData
    setActivityDinner(value: ActivityDinnerData)
    getLastActivityDinner(): ActivityDinnerData
    getActivityOpenServerFund(): ActivityOpenServerFundData
    setActivityOpenServerFund(value: ActivityOpenServerFundData)
    getLastActivityOpenServerFund(): ActivityOpenServerFundData
    getActivityLuxuryGiftPkg(): ActivityLuxuryGiftPkgData
    setActivityLuxuryGiftPkg(value: ActivityLuxuryGiftPkgData)
    getLastActivityLuxuryGiftPkg(): ActivityLuxuryGiftPkgData
    getActivityMoneyTree(): ActivityMoneyTreeData
    setActivityMoneyTree(value: ActivityMoneyTreeData)
    getLastActivityMoneyTree(): ActivityMoneyTreeData
    getActivityWeeklyGiftPkg(): ActivityWeeklyGiftPkgData
    setActivityWeeklyGiftPkg(value: ActivityWeeklyGiftPkgData)
    getLastActivityWeeklyGiftPkg(): ActivityWeeklyGiftPkgData
    getActivityLevelGiftPkg(): ActivityLevelGiftPkgData
    setActivityLevelGiftPkg(value: ActivityLevelGiftPkgData)
    getLastActivityLevelGiftPkg(): ActivityLevelGiftPkgData
    getServerRecord(): ServerRecordData
    setServerRecord(value: ServerRecordData)
    getLastServerRecord(): ServerRecordData
    getActivityRechargeAward(): ActivityRechargeAwardData
    setActivityRechargeAward(value: ActivityRechargeAwardData)
    getLastActivityRechargeAward(): ActivityRechargeAwardData
    getActivityBetaAppointment(): ActivityBetaAppointmentData
    setActivityBetaAppointment(value: ActivityBetaAppointmentData)
    getLastActivityBetaAppointment(): ActivityBetaAppointmentData
    getActivityResourceBack(): ActivityResourceBackData
    setActivityResourceBack(value: ActivityResourceBackData)
    getLastActivityResourceBack(): ActivityResourceBackData
    getActivitySuperCheckin(): ActivitySuperCheckinData
    setActivitySuperCheckin(value: ActivitySuperCheckinData)
    getLastActivitySuperCheckin(): ActivitySuperCheckinData
    getActivityFirstPay(): ActivityFirstPayData
    setActivityFirstPay(value: ActivityFirstPayData)
    getLastActivityFirstPay(): ActivityFirstPayData
    getExplore(): ExploreData
    setExplore(value: ExploreData)
    getLastExplore(): ExploreData
    getUserOpera(): UserOperaData
    setUserOpera(value: UserOperaData)
    getLastUserOpera(): UserOperaData
    getAchievement(): AchievementData
    setAchievement(value: AchievementData)
    getLastAchievement(): AchievementData
    getDay7Activity(): Day7ActivityData
    setDay7Activity(value: Day7ActivityData)
    getLastDay7Activity(): Day7ActivityData
    getGuild(): GuildData
    setGuild(value: GuildData)
    getLastGuild(): GuildData
    getGuildDungeon(): GuildDungeonData
    setGuildDungeon(value: GuildDungeonData)
    getLastGuildDungeon(): GuildDungeonData
    getCustomActivity(): CustomActivityData
    setCustomActivity(value: CustomActivityData)
    getLastCustomActivity(): CustomActivityData
    getChat(): ChatData
    setChat(value: ChatData)
    getLastChat(): ChatData
    getTerritory(): TerritoryData
    setTerritory(value: TerritoryData)
    getLastTerritory(): TerritoryData
    getRollNotice(): RollNoticeData
    setRollNotice(value: RollNoticeData)
    getLastRollNotice(): RollNoticeData
    getUserSetting(): UserSettingData
    setUserSetting(value: UserSettingData)
    getLastUserSetting(): UserSettingData
    getRecruitData(): RecruitData
    setRecruitData(value: RecruitData)
    getLastRecruitData(): RecruitData
    getRedPoint(): RedPointData
    setRedPoint(value: RedPointData)
    getLastRedPoint(): RedPointData
    getTeamRedPoint(): TeamRedPointData
    setTeamRedPoint(value: TeamRedPointData)
    getLastTeamRedPoint(): TeamRedPointData
    getTeamCache(): TeamCacheData
    setTeamCache(value: TeamCacheData)
    getLastTeamCache(): TeamCacheData
    getAttr(): AttrData
    setAttr(value: AttrData)
    getLastAttr(): AttrData
    getQuestionnaire(): QuestionnaireData
    setQuestionnaire(value: QuestionnaireData)
    getLastQuestionnaire(): QuestionnaireData
    getComplexRank(): ComplexRankData
    setComplexRank(value: ComplexRankData)
    getLastComplexRank(): ComplexRankData
    getCreateRole(): CreateRoleData
    setCreateRole(value: CreateRoleData)
    getLastCreateRole(): CreateRoleData
    getInstrument(): InstrumentData
    setInstrument(value: InstrumentData)
    getLastInstrument(): InstrumentData
    getHorse(): HorseData
    setHorse(value: HorseData)
    getLastHorse(): HorseData
    getWorldBoss(): WorldBossData
    setWorldBoss(value: WorldBossData)
    getLastWorldBoss(): WorldBossData
    getUserConfig(): UserConfigData
    setUserConfig(value: UserConfigData)
    getLastUserConfig(): UserConfigData
    getAuction(): AuctionData
    setAuction(value: AuctionData)
    getLastAuction(): AuctionData
    getHandBook(): HandBookData
    setHandBook(value: HandBookData)
    getLastHandBook(): HandBookData
    getGemstone(): GemstoneData
    setGemstone(value: GemstoneData)
    getLastGemstone(): GemstoneData
    getUiGuide(): UIGuideData
    setUiGuide(value: UIGuideData)
    getLastUiGuide(): UIGuideData
    getBulletScreen(): BulletScreenData
    setBulletScreen(value: BulletScreenData)
    getLastBulletScreen(): BulletScreenData
    getFriend(): FriendData
    setFriend(value: FriendData)
    getLastFriend(): FriendData
    getEnemy(): EnemyData
    setEnemy(value: EnemyData)
    getLastEnemy(): EnemyData
    getAvatar(): AvatarData
    setAvatar(value: AvatarData)
    getLastAvatar(): AvatarData
    getNextFunctionOpen(): NextFunctionOpenData
    setNextFunctionOpen(value: NextFunctionOpenData)
    getLastNextFunctionOpen(): NextFunctionOpenData
    getCarnivalActivity(): CarnivalActivityData
    setCarnivalActivity(value: CarnivalActivityData)
    getLastCarnivalActivity(): CarnivalActivityData
    getGuildAnswer(): GuildAnswerData
    setGuildAnswer(value: GuildAnswerData)
    getLastGuildAnswer(): GuildAnswerData
    getPet(): PetData
    getRedPetData():RedPetData
    setRedPetData(value:RedPetData)
    setPet(value: PetData)
    getLastPet(): PetData
    getCrystalShop(): CrystalShopData
    setCrystalShop(value: CrystalShopData)
    getLastCrystalShop(): CrystalShopData
    getMineCraftData(): MineCraftData
    setMineCraftData(value: MineCraftData)
    getLastMineCraftData(): MineCraftData
    getAvatarPhoto(): AvatarPhotoData
    setAvatarPhoto(value: AvatarPhotoData)
    getLastAvatarPhoto(): AvatarPhotoData
    getRechargeRebate(): RechargeRebateData
    setRechargeRebate(value: RechargeRebateData)
    getLastRechargeRebate(): RechargeRebateData
    getTextInput(): TextInputData
    setTextInput(value: TextInputData)
    getLastTextInput(): TextInputData
    getSilkbag(): SilkbagData
    setSilkbag(value: SilkbagData)
    getLastSilkbag(): SilkbagData
    getSilkbagOnTeam(): SilkbagOnTeamData
    setSilkbagOnTeam(value: SilkbagOnTeamData)
    getLastSilkbagOnTeam(): SilkbagOnTeamData
    getLimitTimeActivity(): LimitTimeActivityData
    setLimitTimeActivity(value: LimitTimeActivityData)
    getLastLimitTimeActivity(): LimitTimeActivityData
    getGuildSprint(): ActivityGuildSprintData
    setGuildSprint(value: ActivityGuildSprintData)
    getLastGuildSprint(): ActivityGuildSprintData
    getTimeLimitActivity(): TimeLimitActivityData
    setTimeLimitActivity(value: TimeLimitActivityData)
    getLastTimeLimitActivity(): TimeLimitActivityData
    getDailyCount(): DailyCountData
    setDailyCount(value: DailyCountData)
    getLastDailyCount(): DailyCountData
    getAvatarActivity(): AvatarActivityData
    setAvatarActivity(value: AvatarActivityData)
    getLastAvatarActivity(): AvatarActivityData
    getRunningMan(): RunningManData
    setRunningMan(value: RunningManData)
    getLastRunningMan(): RunningManData
    getShopActive(): ShopActiveData
    setShopActive(value: ShopActiveData)
    getLastShopActive(): ShopActiveData
    getHomeland(): HomelandData
    setHomeland(value: HomelandData)
    getLastHomeland(): HomelandData
    getCountryBoss(): CountryBossData
    setCountryBoss(value: CountryBossData)
    getLastCountryBoss(): CountryBossData
    getCustomActivityRecharge(): CustomActivityRechargeData
    setCustomActivityRecharge(value: CustomActivityRechargeData)
    getLastCustomActivityRecharge(): CustomActivityRechargeData
    getCampRaceData(): CampRaceData
    setCampRaceData(value: CampRaceData)
    getLastCampRaceData(): CampRaceData
    getLinkageActivity(): LinkageActivityData
    setLinkageActivity(value: LinkageActivityData)
    getLastLinkageActivity(): LinkageActivityData
    getGuildWar(): GuildWarData
    setGuildWar(value: GuildWarData)
    getLastGuildWar(): GuildWarData
    getGuildCrossWar(): GuildCrossWarData
    setGuildCrossWar(value: GuildCrossWarData)
    getLastGuildCrossWar(): GuildCrossWarData
    getQinTomb(): QinTombData
    setQinTomb(value: QinTombData)
    getLastQinTomb(): QinTombData
    getGroups(): GroupsData
    setGroups(value: GroupsData)
    getLastGroups(): GroupsData
    getHorseRace(): HorseRaceData
    setHorseRace(value: HorseRaceData)
    getLastHorseRace(): HorseRaceData
    getSeasonSport(): SeasonSportData
    setSeasonSport(value: SeasonSportData)
    getLastSeasonSport(): SeasonSportData
    getSeasonSilk(): SeasonSilkData
    setSeasonSilk(value: SeasonSilkData)
    getLastSeasonSilk(): SeasonSilkData
    getSvip(): SvipData
    setSvip(value: SvipData)
    getLastSvip(): SvipData
    getFightReport(): FightReportData
    setFightReport(value: FightReportData)
    getLastFightReport(): FightReportData
    getHistoryHero(): HistoryHeroData
    setHistoryHero(value: HistoryHeroData)
    getLastHistoryHero(): HistoryHeroData
    getTitles(): HonorTitleData
    setTitles(value: HonorTitleData)
    getLastTitles(): HonorTitleData
    getSingleRace(): SingleRaceData
    setSingleRace(value: SingleRaceData)
    getLastSingleRace(): SingleRaceData
    getHorseEquipment(): HorseEquipmentData
    setHorseEquipment(value: HorseEquipmentData)
    getLastHorseEquipment(): HorseEquipmentData
    getJade(): JadeStoneData
    setJade(value: JadeStoneData)
    getLastJade(): JadeStoneData
    getHeadFrame(): HeadFrameData
    setHeadFrame(value: HeadFrameData)
    getLastHeadFrame(): HeadFrameData
    getRedPacketRain(): RedPacketRainData
    setRedPacketRain(value: RedPacketRainData)
    getLastRedPacketRain(): RedPacketRainData
    getGuildServerAnswer(): GuildServerAnswerData
    setGuildServerAnswer(value: GuildServerAnswerData)
    getLastGuildServerAnswer(): GuildServerAnswerData
    getCakeActivity(): CakeActivityData
    setCakeActivity(value: CakeActivityData)
    getLastCakeActivity(): CakeActivityData
    getGachaGoldenHero(): GachaGoldenHeroData
    setGachaGoldenHero(value: GachaGoldenHeroData)
    getLastGachaGoldenHero(): GachaGoldenHeroData
    getSynthesis(): SynthesisData
    setSynthesis(value: SynthesisData)
    getLastSynthesis(): SynthesisData
    getDay7Recharge(): Day7RechargeData
    getRechargeActivity(): RechargeActivityData
    getCrossWorldBoss(): CrossWorldBossData
    getReturnData(): ReturnData;
    getGrainCar(): GrainCarData;
    getTenJadeAuction(): TenJadeAuctionData;
    getTactics(): TacticsData
    setTactics(value: TacticsData)
    getLastTactics(): TacticsData
    setMilitaryMasterPlan(value:MilitaryMasterPlanDataNew)
    getMilitaryMasterPlan():MilitaryMasterPlanDataNew
    getLastTactics(): TacticsData;
    getShareReward():ShareRewardData;

    // getBout()

}

export class UserData extends BaseData {
    public static schema = schema;

    public _modulePopupShow
    public _priceConfigCache
    public _signalOpObject
    public _signalRecvSellObjects
    public _signalRecvSellOnlyObjects
    public _signalActivityNotice

    constructor() {
        super();
        this.initUserData();
    }

    public initUserData() {
        let properties = {
            base: new UserBaseData(),
            bout:new BoutData(),
            hero: new HeroData(),
            militaryMasterPlan:new MilitaryMasterPlanDataNew(),
            vip: new VipData(),
            vipPay: new VipPayData(),
            team: new TeamData(),
            chapter: new ChapterData(),
            chapterBox: new ChapterBoxData(),
            crossWorldBoss:new CrossWorldBossData(),
            stage: new StageData(),
            items: new ItemsData(),
            fragments: new FragmentData(),
            shops: new ShopData(),
            karma: new KarmaData(),
            equipment: new EquipmentData(),
            battleResource: new BattleResourceData(),
            starRankData: new StarRankData(),
            dailyDungeonData: new DailyDungeonData(),
            towerData: new TowerData(),
            towerRankData: new TowerRankData(),
            dailyMission: new DailyMissionData(),
            treasure: new TreasureData(),
            mails: new MailData(),
            siegeData: new SiegeData(),
            siegeRankData: new SiegeRankData(),
            rechargeData: new RechargeData(),
            activity: new ActivityData(),
            activityMonthCard: new ActivityMonthCardData(),
            arenaData: new ArenaData(),
            activityDailySignin: new ActivityDailySigninData(),
            activityDinner: new ActivityDinnerData(),
            activityOpenServerFund: new ActivityOpenServerFundData(),
            activityLuxuryGiftPkg: new ActivityLuxuryGiftPkgData(),
            activityMoneyTree: new ActivityMoneyTreeData(),
            activityWeeklyGiftPkg: new ActivityWeeklyGiftPkgData(),
            activityLevelGiftPkg: new ActivityLevelGiftPkgData(),
            serverRecord: new ServerRecordData(),
            activityRechargeAward: new ActivityRechargeAwardData(),
            activityBetaAppointment: new ActivityBetaAppointmentData(),
            activityResourceBack: new ActivityResourceBackData(),
            activitySuperCheckin: new ActivitySuperCheckinData(),
            activityFirstPay: new ActivityFirstPayData(),
            explore: new ExploreData(),
            userOpera: new UserOperaData(),
            achievement: new AchievementData(),
            day7Activity: new Day7ActivityData(),
            guild: new GuildData(),
            guildDungeon: new GuildDungeonData(),
            customActivity: new CustomActivityData(),
            chat: new ChatData(),
            territory: new TerritoryData(),
            rollNotice: new RollNoticeData(),
            userSetting: new UserSettingData(),
            recruitData: new RecruitData(),
            redPoint: new RedPointData(),
            redPetData:new RedPetData(),
            teamRedPoint: new TeamRedPointData(),
            teamCache: new TeamCacheData(),
            attr: new AttrData(),
            questionnaire: new QuestionnaireData(),
            complexRank: new ComplexRankData(),
            createRole: new CreateRoleData(),
            instrument: new InstrumentData(),
            horse: new HorseData(),
            worldBoss: new WorldBossData(),
            userConfig: new UserConfigData(),
            auction: new AuctionData(),
            handBook: new HandBookData(),
            gemstone: new GemstoneData(),
            uiGuide: new UIGuideData(),
            bulletScreen: new BulletScreenData(),
            friend: new FriendData(),
            enemy: new EnemyData(),
            avatar: new AvatarData(),
            nextFunctionOpen: new NextFunctionOpenData(),
            carnivalActivity: new CarnivalActivityData(),
            guildAnswer: new GuildAnswerData(),
            pet: new PetData(),
            crystalShop: new CrystalShopData(),
            mineCraftData: new MineCraftData(),
            avatarPhoto: new AvatarPhotoData(),
            rechargeRebate: new RechargeRebateData(),
            textInput: new TextInputData(),
            silkbag: new SilkbagData(),
            silkbagOnTeam: new SilkbagOnTeamData(),
            limitTimeActivity: new LimitTimeActivityData(),
            guildSprint: new ActivityGuildSprintData(),
            timeLimitActivity: new TimeLimitActivityData(),
            dailyCount: new DailyCountData(),
            avatarActivity: new AvatarActivityData(),
            runningMan: new RunningManData(),
            shopActive: new ShopActiveData(),
            homeland: new HomelandData(),
            countryBoss: new CountryBossData(),
            customActivityRecharge: new CustomActivityRechargeData(),
            campRaceData: new CampRaceData(),
            linkageActivity: new LinkageActivityData(),
            grainCar: new GrainCarData(),
            guildWar: new GuildWarData(),
            guildCrossWar: new GuildCrossWarData(),
            qinTomb: new QinTombData(),
            groups: new GroupsData(),
            horseRace: new HorseRaceData(),
            seasonSport: new SeasonSportData(),
            seasonSilk: new SeasonSilkData(),
            svip: new SvipData(),
            fightReport: new FightReportData(),
            historyHero: new HistoryHeroData(),
            titles: new HonorTitleData(),
            singleRace: new SingleRaceData(),
            horseEquipment: new HorseEquipmentData(),
            jade: new JadeStoneData(),
            headFrame: new HeadFrameData(),
            redPacketRain: new RedPacketRainData(),
            guildServerAnswer: new GuildServerAnswerData(),
            cakeActivity: new CakeActivityData(),
            gachaGoldenHero: new GachaGoldenHeroData(),
            synthesis: new SynthesisData(),
            day7Recharge: new Day7RechargeData(),
            rechargeActivity: new RechargeActivityData(),
            returnData: new ReturnData(),
            tenJadeAuction: new TenJadeAuctionData(),
            tactics: new TacticsData(),
            shareReward: new ShareRewardData(),
            flush: false,
            login: false,
        };
        this.setProperties(properties);
        this._modulePopupShow = {};
        this._priceConfigCache = {};
        this._signalOpObject = G_NetworkManager.add(MessageIDConst.ID_S2C_OpObject, this._recvOpObject.bind(this));
        this._signalRecvSellObjects = G_NetworkManager.add(MessageIDConst.ID_S2C_SellObjects, this._s2cSellObjects.bind(this));
        this._signalRecvSellOnlyObjects = G_NetworkManager.add(MessageIDConst.ID_S2C_SellOnlyObjects, this._s2cSellOnlyObjects.bind(this));
        this._signalActivityNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_ActivityNotice, this._s2cActivityNotice.bind(this));
    }
    public clear() {
        this.getBase().clear();
        this.getHero().clear();
        this.getVip().clear();
        this.getTeam().clear();
        this.getChapter().clear();
        this.getChapterBox().clear();
        this.getCrossWorldBoss().clear();
        this.getStage().clear();
        this.getItems().clear();
        this.getFragments().clear();
        this.getShops().clear();
        this.getKarma().clear();
        this.getEquipment().clear();
        this.getBattleResource().clear();
        this.getStarRankData().clear();
        this.getDailyDungeonData().clear();
        this.getTowerData().clear();
        this.getTowerRankData().clear();
        this.getDailyMission().clear();
        this.getTreasure().clear();
        this.getMails().clear();
        this.getSiegeData().clear();
        this.getSiegeRankData().clear();
        this.getRechargeData().clear();
        this.getActivity().clear();
        this.getActivityMonthCard().clear();
        this.getArenaData().clear();
        this.getActivityDailySignin().clear();
        this.getActivityDinner().clear();
        this.getActivityOpenServerFund().clear();
        this.getActivityLuxuryGiftPkg().clear();
        this.getActivityMoneyTree().clear();
        this.getActivityWeeklyGiftPkg().clear();
        this.getActivityLevelGiftPkg().clear();
        this.getServerRecord().clear();
        this.getActivityFirstPay().clear();
        this.getActivityRechargeAward().clear();
        this.getActivityBetaAppointment().clear();
        this.getActivityResourceBack().clear();
        this.getActivitySuperCheckin().clear();
        this.getExplore().clear();
        this.getUserOpera().clear();
        this.getAchievement().clear();
        this.getDay7Activity().clear();
        this.getGuild().clear();
        this.getGuildDungeon().clear();
        this.getCustomActivity().clear();
        this.getChat().clear();
        this.getTerritory().clear();
        this.getRollNotice().clear();
        this.getUserSetting().clear();
        this.getRecruitData().clear();
        this.getRedPoint().clear();
        this.getTeamRedPoint().clear();
        this.getTeamCache().clear();
        this.getAttr().clear();
        this.getQuestionnaire().clear();
        this.getComplexRank().clear();
        this.getCreateRole().clear();
        this.getInstrument().clear();
        this.getHorse().clear();
        this.getWorldBoss().clear();
        this.getUserConfig().clear();
        this.getAuction().clear();
        this.getHandBook().clear();
        this.getGemstone().clear();
        this.getUiGuide().clear();
        this.getBulletScreen().clear();
        this.getFriend().clear();
        this.getEnemy().clear();
        this.getAvatar().clear();
        this.getNextFunctionOpen().clear();
        this.getCarnivalActivity().clear();
        this.getGuildAnswer().clear();
        this.getPet().clear();
        this.getCrystalShop().clear();
        this.getMineCraftData().clear();
        this.getAvatarPhoto().clear();
        this.getRechargeRebate().clear();
        this.getTextInput().clear();
        this.getSilkbag().clear();
        this.getSilkbagOnTeam().clear();
        this.getLimitTimeActivity().clear();
        this.getGuildSprint().clear();
        this.getTimeLimitActivity().clear();
        this.getDailyCount().clear();
        this.getAvatarActivity().clear();
        this.getRunningMan().clear();
        this.getShopActive().clear();
        this.getHomeland().clear();
        this.getCountryBoss().clear();
        this.getCustomActivityRecharge().clear();
        this.getCampRaceData().clear();
        this.getLinkageActivity().clear();
        this.getGuildWar().clear();
        this.getGuildCrossWar().clear();
        this.getQinTomb().clear();
        this.getGroups().clear();
        this.getHorseRace().clear();
        this.getSeasonSport().clear();
        this.getSeasonSilk().clear();
        this.getSvip().clear();
        this.getFightReport().clear();
        this.getHistoryHero().clear();
        this.getSingleRace().clear();
        this.getTitles().clear();
        this.getHeadFrame().clear();
        this.getHorseEquipment().clear();
        this.getJade().clear();
        this.getRedPacketRain().clear();
        this.getGuildServerAnswer().clear();
        this.getGachaGoldenHero().clear();
        this.getSynthesis().clear();
        this.getCakeActivity().clear();
        this.getDay7Recharge().clear();
        this.getRechargeActivity().clear();
        this.getGrainCar().clear();
        this.getReturnData().clear();
        this.getTenJadeAuction().clear();
        this.getBout().clear();
        this.getMilitaryMasterPlan().clear();
        this._signalOpObject.remove();
        this._signalOpObject = null;
        this._signalRecvSellObjects.remove();
        this._signalRecvSellObjects = null;
        this._signalActivityNotice.remove();
        this._signalActivityNotice = null;
        this._signalRecvSellOnlyObjects.remove();
        this._signalRecvSellOnlyObjects = null;
    }
    public reset() {
        this.getBase().reset();
        this.getHero().reset();
        this.getVip().reset();
        this.getTeam().reset();
        this.getChapter().reset();
        this.getChapterBox().reset();
        this.getCrossWorldBoss().reset();
        this.getItems().reset();
        this.getFragments().reset();
        this.getShops().reset();
        this.getKarma().reset();
        this.getEquipment().reset();
        this.getBattleResource().reset();
        this.getStage().reset();
        this.getStarRankData().reset();
        this.getDailyDungeonData().reset();
        this.getTowerData().reset();
        this.getTowerRankData().reset();
        this.getDailyMission().reset();
        this.getTreasure().reset();
        this.getMails().reset();
        this.getSiegeData().reset();
        this.getSiegeRankData().reset();
        this.getRechargeData().reset();
        this.getActivity().reset();
        this.getActivityMonthCard().reset();
        this.getArenaData().reset();
        this.getActivityDailySignin().reset();
        this.getActivityDinner().reset();
        this.getActivityOpenServerFund().reset();
        this.getActivityLuxuryGiftPkg().reset();
        this.getActivityMoneyTree().reset();
        this.getActivityWeeklyGiftPkg().reset();
        this.getActivityLevelGiftPkg().reset();
        this.getServerRecord().reset();
        this.getActivityFirstPay().reset();
        this.getActivityRechargeAward().reset();
        this.getActivityBetaAppointment().reset();
        this.getActivityResourceBack().reset();
        this.getActivitySuperCheckin().reset();
        this.getExplore().reset();
        this.getUserOpera().reset();
        this.getAchievement().reset();
        this.getDay7Activity().reset();
        this.getGuild().reset();
        this.getGuildDungeon().reset();
        this.getCustomActivity().reset();
        this.getChat().reset();
        this.getTerritory().reset();
        this.getRollNotice().reset();
        this.getUserSetting().reset();
        this.getRecruitData().reset();
        this.getRedPoint().reset();
        this.getTeamRedPoint().reset();
        this.getTeamCache().reset();
        this.getAttr().reset();
        this.getQuestionnaire().reset();
        this.getComplexRank().reset();
        this.getCreateRole().reset();
        this.getInstrument().reset();
        this.getHorse().reset();
        this.getWorldBoss().reset();
        this.getUserConfig().reset();
        this.getAuction().reset();
        this.getHandBook().reset();
        this.getGemstone().reset();
        this.getUiGuide().reset();
        this.getBulletScreen().reset();
        this.getFriend().reset();
        this.getEnemy().reset();
        this.getAvatar().reset();
        this.getNextFunctionOpen().reset();
        this.getCarnivalActivity().reset();
        this.getGuildAnswer().reset();
        this.getPet().reset();
        this.getCrystalShop().reset();
        this.getAvatarPhoto().reset();
        this.getRechargeRebate().reset();
        this.getTextInput().reset();
        this.getSilkbag().reset();
        this.getSilkbagOnTeam().reset();
        this.getLimitTimeActivity().reset();
        this.getGuildSprint().reset();
        this.getTimeLimitActivity().reset();
        this.getDailyCount().reset();
        this.getAvatarActivity().reset();
        this.getRunningMan().reset();
        this.getShopActive().reset();
        this.getHomeland().reset();
        this.getCountryBoss().reset();
        this.getCustomActivityRecharge().reset();
        this.getCampRaceData().reset();
        this.getLinkageActivity().reset();
        this.getGuildWar().reset();
        this.getGuildCrossWar().reset();
        this.getQinTomb().reset();
        this.getGroups().reset();
        this.getHorseRace().reset();
        this.getSeasonSport().reset();
        this.getSeasonSilk().reset();
        this.getSvip().reset();
        this.getFightReport().reset();
        this.getHistoryHero().reset();
        this.getSingleRace().reset();
        this.getTitles().reset();
        this.getHeadFrame().reset();
        this.getHorseEquipment().reset();
        this.getRedPacketRain().reset();
        this.getGuildServerAnswer().reset();
        this.getGachaGoldenHero().reset();
        this.getSynthesis().reset();
        this.getCakeActivity().reset();
        this.getDay7Recharge().reset();
        this.getRechargeActivity().reset();
        this.getGrainCar().reset();
        this.getReturnData().reset();
        this.getTenJadeAuction().reset();
        this.getBout().reset();
        this.getMilitaryMasterPlan().reset();
    }
    private procItem(message) {
        let item = message['item'];
        if (item) {
            if (item.hasOwnProperty('update')) {
                this.getItems().updateData(item.update);
                G_SignalManager.dispatch(SignalConst.EVENT_ITEM_OP_UPDATE, item.update);
            }
            if (item.hasOwnProperty('insert')) {
                this.getItems().insertData(item.insert);
                G_SignalManager.dispatch(SignalConst.EVENT_ITEM_OP_INSERT, item.insert);
            }
            if (item.hasOwnProperty('delete')) {
                this.getItems().deleteData(item.delete);
                G_SignalManager.dispatch(SignalConst.EVENT_ITEM_OP_DELETE, item.delete);
            }
        }
    }
    private procHero(message) {
        let hero = message['hero'];
        if (hero) {
            if (hero.hasOwnProperty('update')) {
                this.getHero().updateData(hero.update);
            }
            if (hero.hasOwnProperty('insert')) {
                this.getHero().insertData(hero.insert);
            }
            if (hero.hasOwnProperty('delete')) {
                this.getHero().deleteData(hero.delete);
            }
        }
    }
    private procVip(message) {
        let vip = message['vip'];
        if (vip) {
            this.getVip().updateData(message.vip.update);
        }
    }
    private procFragment(message) {
        let fragment = message['fragment'];
        if (fragment) {
            if (fragment.hasOwnProperty('update')) {
                this.getFragments().updateData(fragment.update);
                G_SignalManager.dispatch(SignalConst.EVENT_ITEM_OP_UPDATE, fragment.update);
            }
            if (fragment.hasOwnProperty('insert')) {
                this.getFragments().insertData(fragment.insert);
                G_SignalManager.dispatch(SignalConst.EVENT_ITEM_OP_UPDATE, fragment.insert);
            }
            if (fragment.hasOwnProperty('delete')) {
                this.getFragments().deleteData(fragment.delete);
                G_SignalManager.dispatch(SignalConst.EVENT_ITEM_OP_UPDATE, fragment.delete);
            }
        }
    }
    private procCurrency(message) {
        let currency = message['currency'];
        if (currency) {
            if (currency.hasOwnProperty('update')) {
                this.getBase().updateCurrencys(currency.update);
                G_SignalManager.dispatch(SignalConst.EVENT_RECV_CURRENCYS_INFO, currency.update);
            }
        }
    }
    private procRecover(message) {
        let recover = message['recover'];
        if (recover) {
            if (recover.hasOwnProperty('update')) {
                this.getBase().updateRecover(recover.update);
                G_SignalManager.dispatch(SignalConst.EVENT_RECV_RECOVER_INFO, recover.update);
            }
        }
    }
    private procEquipment(message) {
        let equipment = message['equipment'];
        if (equipment) {
            if (equipment.hasOwnProperty('update')) {
                this.getEquipment().updateData(equipment.update);
            }
            if (equipment.hasOwnProperty('insert')) {
                this.getEquipment().insertData(equipment.insert);
            }
            if (equipment.hasOwnProperty('delete')) {
                this.getEquipment().deleteData(equipment.delete);
            }
        }
    }
    private procTreasure(message) {
        let treasure = message['treasure'];
        if (treasure) {
            if (treasure.hasOwnProperty('update')) {
                this.getTreasure().updateData(treasure.update);
            }
            if (treasure.hasOwnProperty('insert')) {
                this.getTreasure().insertData(treasure.insert);
            }
            if (treasure.hasOwnProperty('delete')) {
                this.getTreasure().deleteData(treasure.delete);
            }
        }
    }
    private procInstrument(message) {
        let instrument = message['instrument'];
        if (instrument) {
            if (instrument.hasOwnProperty('update')) {
                this.getInstrument().updateData(instrument.update);
            }
            if (instrument.hasOwnProperty('insert')) {
                this.getInstrument().insertData(instrument.insert);
            }
            if (instrument.hasOwnProperty('delete')) {
                this.getInstrument().deleteData(instrument.delete);
            }
        }
    }
    private procHorse(message) {
        let warHorse = message['warHorse'];
        if (warHorse) {
            if (warHorse.hasOwnProperty('update')) {
                this.getHorse().updateData(warHorse.update);
            }
            if (warHorse.hasOwnProperty('insert')) {
                this.getHorse().insertData(warHorse.insert);
            }
            if (warHorse.hasOwnProperty('delete')) {
                this.getHorse().deleteData(warHorse.delete);
            }
        }
    }
    private procGemstone(message) {
        let gemstone = message['gemstone'];
        if (gemstone) {
            if (gemstone.hasOwnProperty('update')) {
                this.getGemstone().updateData(gemstone.update);
            }
            if (gemstone.hasOwnProperty('insert')) {
                this.getGemstone().insertData(gemstone.insert);
            }
            if (gemstone.hasOwnProperty('delete')) {
                this.getGemstone().deleteData(gemstone.delete);
            }
        }
    }
    private procAvatar(message) {
        let avatar = message['avatar'];
        if (avatar) {
            if (avatar.hasOwnProperty('update')) {
                this.getAvatar().updateData(avatar.update);
            }
            if (avatar.hasOwnProperty('insert')) {
                this.getAvatar().insertData(avatar.insert);
            }
            if (avatar.hasOwnProperty('delete')) {
                this.getAvatar().deleteData(avatar.delete);
            }
        }
    }
    private procPet(message) {
        let pet = message['pet'];
        if (pet) {
            if (pet.hasOwnProperty('update')) {
                this.getPet().updateData(pet.update);
            }
            if (pet.hasOwnProperty('insert')) {
                this.getPet().insertData(pet.insert);
            }
            if (pet.hasOwnProperty('delete')) {
                this.getPet().deleteData(pet.delete);
            }
        }
    }
    private procSilkbag(message) {
        let silkbag = message['silkbag'];
        if (silkbag) {
            if (silkbag.hasOwnProperty('update')) {
                this.getSilkbag().updateData(silkbag.update);
            }
            if (silkbag.hasOwnProperty('insert')) {
                this.getSilkbag().insertData(silkbag.insert);
            }
            if (silkbag.hasOwnProperty('delete')) {
                this.getSilkbag().deleteData(silkbag.delete);
            }
        }
    }
    private procHistoryHero(message) {
        let star = message['star'];
        if (star) {
            if (star.hasOwnProperty('update')) {
                this.getHistoryHero().updateData(star.update);
            }
            if (star.hasOwnProperty('insert')) {
                this.getHistoryHero().insertData(star.insert);
            }
            if (star.hasOwnProperty('delete')) {
                this.getHistoryHero().deleteData(star.delete);
            }
        }
    }
    private procHistoryHeroWeapon(message) {
        let starWeapon = message['star_weapon'];
        if (starWeapon) {
            if (starWeapon.hasOwnProperty('update')) {
                this.getHistoryHero().updateWeaponData(starWeapon.update);
            }
            if (starWeapon.hasOwnProperty('insert')) {
                this.getHistoryHero().insertWeaponData(starWeapon.insert);
            }
            if (starWeapon.hasOwnProperty('delete')) {
                this.getHistoryHero().deleteWeaponData(starWeapon.delete);
            }
        }
    }
    private procTitle(message) {
        let title = message['title'];
        if (title) {
            if (title.hasOwnProperty('update')) {
                this.getTitles().updateTitleList(title.update);
            }
            if (title.hasOwnProperty('insert')) {
                this.getTitles().insertHonorTitleList(title.insert);
            }
            if (title.hasOwnProperty('delete')) {
            }
        }
    }
    private procHeadFrame(message) {
        let headFrame = message['head_frame'];
        if (headFrame) {
            if (headFrame.hasOwnProperty('update')) {
                this.getHeadFrame().updateHeadFrame(headFrame.update);
            }
            if (headFrame.hasOwnProperty('insert')) {
                this.getHeadFrame().insertHeadFrame(headFrame.insert);
            }
            if (headFrame.hasOwnProperty('delete')) {
                this.getHeadFrame().deleteHeadFrame(headFrame.delete);
            }
            if (headFrame.hasOwnProperty('cur_head_frame')) {
                this.getHeadFrame().setCurrentFrameByOp(headFrame.cur_head_frame);
            }
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HEAD_FRAME);
        }
    }
    private procHorseEquipment(message) {
        let warHorseEquip = message['war_horse_equip'];
        if (warHorseEquip) {
            if (warHorseEquip.hasOwnProperty('update')) {
                this.getHorseEquipment().updateData(warHorseEquip.update);
            }
            if (warHorseEquip.hasOwnProperty('insert')) {
                this.getHorseEquipment().insertData(warHorseEquip.insert);
            }
            if (warHorseEquip.hasOwnProperty('delete')) {
                this.getHorseEquipment().deleteData(warHorseEquip.delete);
            }
        }
    }
    private procJadeStone(message) {
        let jadeData = message['jade'];
        if (jadeData) {
            if (jadeData.hasOwnProperty('update')) {
                this.getJade().updateData(jadeData.update);
            }
            if (jadeData.hasOwnProperty('insert')) {
                this.getJade().insertData(jadeData.insert);
            }
            if (jadeData.hasOwnProperty('delete')) {
                this.getJade().deleteData(jadeData.delete);
            }
        }
    }
    private procHomeTreeBuff(message) {
        var homeBuff = message['home_buff'];
        if (homeBuff) {
            if (homeBuff.hasOwnProperty('update')) {
                this.getHomeland().updateBuffData(homeBuff.update);
            }
            if (homeBuff.hasOwnProperty('insert')) {
                this.getHomeland().insertBuffData(homeBuff.insert);
            }
            if (homeBuff.hasOwnProperty('delete')) {
                this.getHomeland().deleteBuffData(homeBuff.delete);
            }
        }
    }
    private procTactics(message) {
        var tactics = message['tactics'];
        if (tactics) {
            if (tactics.hasOwnProperty('update')) {
                this.getTactics().updateData(tactics.update);
            }
            if (tactics.hasOwnProperty('insert')) {
                this.getTactics().insertData(tactics.insert);
            }
            if (tactics.hasOwnProperty('delete')) {
                this.getTactics().deleteData(tactics.delete);
            }
        }
    }
    private procBout(message) {
        var bout = message['bout'];
        if (bout) {
            if (bout.hasOwnProperty('update')) {
                // this.getBout().insertData(bout.insert);
            }
            if (bout.hasOwnProperty('insert')) {
                // this.getBout().deleteData(bout.delete);
            }
            if (bout.hasOwnProperty('delete')) {
                // this.getBout().updateData(bout.update);
            }
        }
    }
    public _recvOpObject(id, message) {
        this.procItem(message);
        this.procHero(message);
        this.procVip(message);
        this.procFragment(message);
        this.procCurrency(message);
        this.procRecover(message);
        this.procEquipment(message);
        this.procTreasure(message);
        this.procInstrument(message);
        this.procHorse(message);
        this.procGemstone(message);
        this.procAvatar(message);
        this.procPet(message);
        this.procSilkbag(message);
        this.procHistoryHero(message);
        this.procHistoryHeroWeapon(message);
        this.procTitle(message);
        this.procHeadFrame(message);
        this.procHorseEquipment(message);
        this.procJadeStone(message);
        this.procHomeTreeBuff(message);
        this.procTactics(message);
        // this.procBout(message);
    }
    public c2sSellObjects(objects) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SellObjects, { objects: objects });
    }
    public c2sSellOnlyObjects(objects) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SellOnlyObjects, { objects: objects });
    }
    public c2sClientLog(table) {
        let clientLog = JSON.stringify(table);
        G_NetworkManager.send(MessageIDConst.ID_C2S_SendClientLog, { logStr: clientLog });
    }
    public _s2cActivityNotice(id, message) {
        if (message.activity_type == 1) {
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVITY_NOTICE, message);
    }
    public _s2cSellObjects(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awards = message['awards'];
        if (!awards) {
            awards = {};
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, awards);
    }
    public _s2cSellOnlyObjects(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awards = message['awards'];
        if (!awards) {
            awards = {};
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SELL_ONLY_OBJECTS_SUCCESS, awards);
    }
    public setPopModuleShow(moduelName, needShow) {
        if (needShow == null) {
            needShow = true;
        }
        this._modulePopupShow['' + moduelName] = needShow;
    }
    public getPopModuleShow(moduelName) {
        return this._modulePopupShow['' + moduelName];
    }
    public getPriceConfig(priceAddId) {
        let priceConfig = this._priceConfigCache[priceAddId];
        if (priceConfig) {
            return priceConfig;
        }
        function createPriceConfig(priceAddId) {
            let priceCfg = G_ConfigLoader.getConfig(ConfigNameConst.PRICE);
            let lastCfgData = null;
            let priceIdList = [];
            for (let i = 0; i < priceCfg.length(); i++) {
                let cfgData = priceCfg.indexOf(i);
                if (cfgData.id == priceAddId) {
                    priceIdList.push(cfgData);
                }
            }
            lastCfgData = priceIdList[priceIdList.length - 1];
            let maxTime = lastCfgData && lastCfgData.time || 0;
            let newPriceIdList = {};
            for (let k = 1; k <= priceIdList.length; k++) {
                let v = priceIdList[k - 1];
                newPriceIdList[k] = v;
            }
            let lastPriceConfig = null;
            for (let i = maxTime; i >= 1; i += -1) {
                if (!newPriceIdList[i]) {
                    newPriceIdList[i] = lastPriceConfig;
                } else {
                    lastPriceConfig = newPriceIdList[i];
                }
            }
            return {
                priceList: priceIdList,
                priceMap: newPriceIdList,
                maxTime: maxTime
            };
        }
        priceConfig = createPriceConfig(priceAddId);
        this._priceConfigCache[priceAddId] = priceConfig;
        return priceConfig;
    }
}
