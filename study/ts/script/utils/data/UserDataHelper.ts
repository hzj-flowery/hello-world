import CommonConst from "../../const/CommonConst";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { DataConst } from "../../const/DataConst";
import { FunctionConst } from "../../const/FunctionConst";
import HonorTitleConst from "../../const/HonorTitleConst";
import JadeStoneConst from "../../const/JadeStoneConst";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_ServerTime, G_UserData } from "../../init";
import { Lang } from "../../lang/Lang";
import { PopupHonorTitleHelper } from "../../scene/view/playerDetail/PopupHonorTitleHelper";
import { assert } from "../GlobleFunc";
import { StringUcfirst } from "../handler";
import { FunctionCheck } from "../logic/FunctionCheck";
import { Path } from "../Path";
import { table } from "../table";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { ActivityDataHelper } from "./ActivityDataHelper";
import { ActivityGuildSprintDataHelper } from "./ActivityGuildSprintDataHelper";
import { AvatarDataHelper } from "./AvatarDataHelper";
import { ChatDataHelper } from "./ChatDataHelper";
import { EquipDataHelper } from "./EquipDataHelper";
import { GuildDataHelper } from "./GuildDataHelper";
import { GuildDungeonDataHelper } from "./GuildDungeonDataHelper";
import { HeroDataHelper } from "./HeroDataHelper";
import { HistoryHeroDataHelper } from "./HistoryHeroDataHelper";
import { InstrumentDataHelper } from "./InstrumentDataHelper";
import { MailDataHelper } from "./MailDataHelper";
import { PetDataHelper } from "./PetDataHelper";
import { ShopDataHelper } from "./ShopDataHelper";
import { TeamDataHelper } from "./TeamDataHelper";
import { TreasureDataHelper } from "./TreasureDataHelper";
import { UserDetailDataHelper } from "./UserDetailDataHelper";
import { VipDataHelper } from "./VipDataHelper";

interface IUserDataHelper {

    //ActivityDataHelper.ts
    checkPackBeforeGetActReward?(data)
    checkPackBeforeGetActReward2?(data)
    getFundGroupByFundActivityId?(actId)
    //ShopDataHelper.ts
    getShopBuyTimesDesc?(shopId, shopItemId)
    getShopItemCanBuyTimes?(shop)
    getFixShopDiscount?(shopItem)
    getTotalPriceByAdd?(priceAddId, startTimes, buyTimes, srcPrice?)
    getTotalNumByAdd?(priceAddId, startTimes, surplus, totalPrice, srcPrice)
    getFixItemMaxNum?(shopItemData)
    getPriceAdd?(priceAddId, buyTimes)
    getShopType?(shopId)
    getShopTab?(entranceType?)
    getShopIdByTab?(tabIndex)
    getShopSubTab?(shopId)
    getRandomShopInfo?(shopId)
    isFragmentInBattle?(shopItem)
    getShopHeroInBattle?(shopId)
    getShopRefreshToken?()
    getShopLeaveRefreshSec?(shopId)
    getShopRecoverMaxRefreshCountTime?(shopId)
    //VipDataHelper.ts
    getVipValueByType?(vipType)
    getVipCfgByTypeLevel?(vipType, vipLevel)
    getVipCfgByType?(vipType)
    getVipGiftPkgList?()
    findFirstCanReceiveGiftPkgIndex?(listData)
    findFirstUnReceiveGiftPkgIndex?(listData)
    isShowEnterIcon?()
    //HeroDataHelper.ts
    init?()
    getHeroConfig?(id)
    getHeroResConfig?(id)
    getHeroYokeConfig?(id)
    getHeroFriendConfig?(id)
    getHeroAwakenConfig?(id, awakeCost)
    getHeroLevelupConfig?(level, templet)
    getHeroRankConfig?(id, rank, limit, limitRedLevel)
    getHeroDataWithEquipId?(id)
    getHeroDataWithTreasureId?(id)
    getHeroRankCostConfig?(rank, templet)
    getHeroLimitSizeConfig?(id, limitLevel)
    getHeroLimitCostConfig?(limitLevel)
    getHeroYokeIdsByConfig?(baseId)
    getHeroKarmaData?(heroConfig)
    getReachCond?(heroData, cond1, cond2, level?, officialLevel?)
    isShowYokeMark?(baseId)
    isHaveYokeWithHeroBaseId?(baseId)
    isHaveKarmaWithHeroBaseId?(baseId)
    isHaveYokeToBattleWarriorByTreasureId?(treasureId)
    getActivateKarmaInfoWithHeroBaseId?(baseId)
    getKarmaInfoWithHeroBaseId?(baseId)
    getUserLevelUpExp?(lastLevel?)
    getHeroNeedExpWithLevel?(templet, level)
    getCanReachLevelWithExp?(totalExp, templet)
    getHeroLevelUpExp?(level, templet)
    getBasicAttrWithLevel?(heroConfig, level)
    getHeroBreakMaterials?(heroUnitData)
    getHeroBreakLimitLevel?(heroUnitData)
    getBreakCostWithRank?(rank, templet)
    getHeroBreakMaxLevel?(heroUnitData)
    getBreakAttr?(heroUnitData, addRank?)
    getBreakAttrWithBaseIdAndRank?(baseId, rank, limitLevel)
    getLimitAttr?(heroUnitData, tempLimitLevel?)
    getLimitSingleAttr?(heroBaseId, limitLevel?)
    getAllLimitCost?(heroUnitData)
    getLimitSingleCost?(limitLevel)
    isReachLimitRank?(limitLevel, curRank)
    getNeedLimitLevelWithRank?(rank)
    getAwakeAttr?(heroUnitData, addLevel?)
    getAwakeTalentAttr?(heroUnitData)
    getAvatarAttr?(heroUnitData)
    getAvatarPower?(heroUnitData)
    getAvatarShowAttr?(heroUnitData)
    getAvatarShowPower?(heroUnitData)
    getSilkbagAttr?(heroUnitData)
    getSilkbagPower?(heroUnitData)
    getEquipAttr?(pos, isPower?)
    getTreasureAttr?(pos)
    getInstrumentAttr?(pos)
    getMasterAttr?(pos)
    getOfficialAttr?(level)
    getHomelandPower?()
    getOfficialPower?(level)
    getTalentPower?(heroUnitData, tempRank)
    getKarmaAttrRatio?(heroConfig)
    getYokeAttrRatio?(heroUnitData)
    getTalentAttr?(heroUnitData, rank, notTalent)
    getHaloAttr?(heroUnitData, rank)
    getInstrumentTalentAttr?(pos)
    getTotalAttr?(param)
    getTotalBaseAttr?(param)
    getPartnersInfo?(secondHeroDatas)
    getPartnersInfoByUserDetail?(secondHeroDatas)
    getActivatedYokeTotalCount?(heroDatas)
    getYokeOverviewInfo?(heroDatas)
    getYokeDetailInfo?(heroDatas)
    getHeroYokeInfo?(heroUnitData)
    getYokeUnitInfoWithId?(fateId, heroUnitData)
    getWillActivateYokeCount?(baseId, beReplacedId?, willInReinforcement?, notCheckReinforcement?)
    convertHeroExp?(expCount)
    getAllLevelUpCost?(unitData)
    getAllBreakCost?(unitData)
    getGoldBreakCost?(unitData)
    getNormalBreakCost?(unitData)
    getAllAwakeCost?(unitData)
    getHeroRecoveryPreviewInfo?(heroDatas)
    getHeroRebornPreviewInfo?(data)
    getHeroPowerAttr?(param)
    getHeroPowerBaseAttr?(param)
    isHaveEmptyPos?()
    isHaveEmptyReinforcementPos?()
    isPromptHeroUpgrade?(heroUnitData)
    isPromptHeroBreak?(heroUnitData)
    isPromptHeroAwake?(heroUnitData)
    isPromptHeroLimit?(heroUnitData)
    isPromptHeroLimitWithCostKey?(heroUnitData, key): Array<any>
    isCanHeroAwakeEquip?(heroUnitData)
    isCanHeroAwake?(heroUnitData)
    getHeroListLimitCount?()
    getHeroAwakeConfigInfo?(heroUnitData, addLevel?)
    convertAwakeLevel?(awakeLevel)
    findNextAwakeLevel?(level, awakenCost, maxLevel)
    getHeroAwakeEquipState?(heroUnitData)
    getHeroAwakeLevelAttr?(awakeLevel, awakeCost)
    getHeroAwakeEquipAttr?(awakeLevel, awakeCost)
    getGemstoneAttr?(itemId)
    getHeroAwakeCurGemstoneAttr?(heroUnitData)
    getHeroAwakeMaterials?(heroUnitData)
    getHeroAwakeCost?(heroUnitData)
    getHeroAwakeLimitLevel?(heroUnitData)
    getHeroAwakeTalentDesInfo?(heroUnitData)
    getHeroTransformTarList?(filterIds, tempData)
    isHaveBetterColorHero?(heroUnitData)
    isReachCheckBetterColorHeroRP?(heroUnitData)
    isPromptHeroBetterColor?(heroUnitData)
    getHeroInBattleAverageLevel?()
    getHeroInBattleAverageRank?()
    getHeroInBattleAverageAwakeLevel?()
    getSkillIdsWithHeroData?(unitData)
    getSkillIdsWithBaseIdAndRank?(baseId, rank, limitLevel)
    isLeaderWithHeroBaseId?(baseId)
    getOfficialIdWithHeroId?(baseId)
    getOfficialNameWithHeroId?(baseId)
    getAwakeGemstonePreviewInfo?(unitData)
    getOwnCountOfAwakeGemstone?(type, value)
    getHorseAttr?(pos)
    getHorsePower?(pos)
    getHorsePhotoAttr?()
    //EquipDataHelper.ts
    getEquipStrengthenAttr?(data, addLevel?)
    getEquipRefineAttr?(data, addLevel?)
    getEquipRefineAttrWithConfig?(config, rLevel)
    getEquipAttrInfo?(data)
    getEquipJadeAttrInfo?(data, level, isPower)
    getLevelupCostValue?(data)
    getLevelupCostWithLevelAndTemplet?(level, templet)
    getOneKeyStrengCost?(pos)
    getNeedLevelWithMasterTypeAndLevel?(type, level)
    getEquipLevelupAttrValue?(initLevel, level, templet, index)
    getEquipRefineAttrValue?(initLevel, level, templet, index)
    getHeroBaseIdWithEquipId?(id)
    getSuitName?(suitId)
    getSuitComponentIds?(suitId)
    getSuitAttrShowInfo?(suitId)
    getEquipSuitAttr?(equipIds, pos)
    getAllEquipInfoInBattle?()
    getEquipStrengthenAttrDiff?(data, level1, level2)
    getCurRefineLevelExp?(templet, level)
    getEquipNeedExpWithLevel?(templet, level)
    getCanReachRefineLevelWithExp?(totalExp, templet)
    getEquipTotalExp?(templet, curExp, level)
    getEquipCurExp?(templet, totalExp, level)
    getEquipRefineAttrDiff?(data, level1, level2)
    getMasterEquipStrengthenInfo?(pos)
    getMasterEquipRefineInfo?(pos)
    getEquipStrengAllCost?(unitData)
    getEquipRefineAllCost?(unitData)
    getEquipRecoveryPreviewInfo?(datas)
    getEquipRebornPreviewInfo?(data)
    isPromptEquipStrengthen?(equipUnitData)
    isPromptEquipRefine?(equipUnitData)
    getEquipListLimitCount?()
    getEquipEffectWithBaseId?(baseId)
    isHaveYokeBetweenHeroAndEquip?(heroBaseId, equipBaseId)
    isNeedEquipWithBaseId?(baseId)
    getEquipInBattleAverageStr?()
    getEquipInBattleAverageRefine?()
    //TreasureDataHelper.ts
    getTreasureConfig?(id)
    getLimitCostConfig?(limitLevel)
    getTreasureStrengthenAttr?(data, addLevel?)
    getTreasureStrAttrWithConfigAndLevel?(config, level)
    getTreasureRefineAttr?(data, addLevel?)
    getTreasureRefineAttrWithConfigAndRLevel?(configInfo, rLevel)
    getTreasureAttrInfo?(data)
    getTreasureNeedExpWithLevel?(templet, level)
    getCanReachTreasureLevelWithExp?(totalExp, templet)
    getTreasureLevelUpExp?(level, templet)
    getTreasureLevelupAttrValue?(initLevel, level, templet, index)
    getTreasureRefineAttrValue?(initLevel, level, templet, index)
    getHeroBaseIdWithTreasureId?(id)
    getTreasureYokeInfo?(baseId)
    _createYokeBasicInfo?(info)
    isHaveYokeBetweenHeroAndTreasured?(heroBaseId, treasureBaseId)
    checkIsEquipInHero?(treasureId, heroBaseId)
    getTreasureRefineMaterial?(data)
    getTreasureRefineMoney?(data)
    getMasterTreasureUpgradeInfo?(pos)
    getMasterTreasureRefineInfo?(pos): any
    getTreasureStrengAllCost?(unitData)
    getTreasureRefineAllCost?(unitData)
    getTreasureLimitCost?(unitData)
    getTreasureRecoveryPreviewInfo?(datas)
    getTreasureRebornPreviewInfo?(data)
    isPromptTreasureUpgrade?(treasureData)
    isPromptTreasureRefine?(treasureData)
    isPromptTreasureLimit?(treasureData)
    isPromptTreasureLimitWithCostKey?(treasureData, key)
    getTreasureListLimitCount?()
    getTreasureInBattleAverageStr?()
    getTreasureInBattleAverageRefine?()
    getTreasureTransformTarList?(filterIds, tempData)
    isReachTreasureLimitRank?(limitLevel, curLevel)
    //TeamDataHelper.ts
    isHaveEquipInPos?(baseId, pos)
    getOpenLevelWithId?(funcId)
    getHeroBaseIdWithPos?(pos)
    getTeamOpenCount?()
    //GuildDataHelper.ts
    getGuildMaxMember?(level)
    getGuildLevelUpNeedExp?(level)
    getCreateGuildNeedMoney?()
    getSupportTimes?()
    isHaveJurisdiction?(position, jurisdiction)
    getGuildLeaderNames?()
    getGuildDutiesName?(position)
    checkCanQuitGuild?(time)
    checkCanExpelGuild?(time)
    checkCanApplyJoinInGuild?()
    checkCanImpeach?(offlineTime)
    formatNotify?(notifyDatas)
    getOfficialInfo?(official)
    checkCanGuildHelpOther?(fragmentId)
    getGuildRandomTalkText?()
    getGuildRewardInfo?()
    getGuildRequestedFilterIds?()
    getGuildRequestHelpHeroList?(filterIds)
    getGuildHelpCdCountDownTime?()
    getGuildHelpNeedGold?()
    getGuildAnnouncement?()
    getGuildDeclaration?(guild?)
    getOpenRedPacketData?(redPacketData, openRedBagUserList)
    getGuildMissionData?()
    getGuildTotalActivePercent?()
    getGuildTotalActiveColor?()
    isHaveGuildPermission?(permissionType)
    getGuildContributionList?()
    getGuildContributionBoxData?()
    getGuildContributionRemainCount?()
    getGuildContributionName?(id)
    isGuildTaskHasComplete?(taskId)
    getCanSnatchRedPacketNum?()
    getGuildMemberListBySort?(category, isAscendOrder)
    //InstrumentDataHelper.ts
    getInstrumentConfig?(baseId)
    getInstrumentRankConfig?(rankId, limitLevel)
    getInstrumentAttrInfo?(data, addLevel?)
    getInstrumentLevelAttr?(level, templet)
    getHeroBaseIdWithInstrumentId?(id)
    getYokeIdWithInstrumentId?(id)
    getYokeAttrWithInstrumentId?(id)
    getInstrumentTalentInfo?(templet)
    getInstrumentAdvanceMaterial?(data)
    getInstrumentAdvanceMoney?(data): any
    getInstrumentAdvanceAllCost?(unitData)
    getInstrumentAllLimitCost?(unitData)
    getInstrumentRecoveryPreviewInfo?(datas)
    getInstrumentRebornPreviewInfo?(data)
    getInstrumentListLimitCount?()
    isPromptInstrumentAdvance?(instrumentData)
    isInBattleHeroWithBaseId?(baseId)
    getCommonInstrumentIdAndCount?(baseId)
    findNextInstrumentTalent?(level, templet, maxLevel)
    getInstrumentCountWithHeroIds?(heroIds)
    getInstrumentInBattleAverageAdvance?()
    getInstrumentBaseIdByCheckAvatar?(unitData)
    isReachInstrumentLimitRank?(templateId, limitLevel, curLevel)
    isPromptInstrumentLimit?(instrumentData)
    isPromptInstrumentLimitWithCostKey?(instrumentData, key)
    getInstrumentTransformTarList?(filterIds, tempData)
    getHeroDataWithInstrumentId?(id)
    //UserDetailDataHelper.ts
    getOtherUserTotalAttr?(heroUnitData, userDetailData)
    getOtherUserEquipAttr?(heroUnitData, userDetailData, isPower?)
    getOtherUserJadeAttr?(data, heroUnitData, isPower, userDetailData)
    getOtherEquipSuitAttr?(userDetailData, equipDatas, pos)
    getOtherUserTreasureAttr?(heroUnitData, userDetailData)
    getOtherUserInstrumentAttr?(heroUnitData, userDetailData)
    getOtherUserMasterAttr?(heroUnitData, userDetailData)
    getOtherMasterEquipStrengthenAttr?(userDetailData, pos)
    getOtherMasterEquipRefineAttr?(userDetailData, pos)
    getOtherMasterTreasureUpgradeAttr?(userDetailData, pos)
    getOtherMasterTreasureRefineAttr?(userDetailData, pos)
    getOtherKarmaAttrRatio?(heroUnitData, userDetailData)
    getOtherTalentAttr?(heroUnitData, rank, userDetailData)
    getOtherHaloAttr?(heroUnitData, rank, userDetailData)
    getOtherInstrumentTalentAttr?(heroUnitData, userDetailData)
    getOtherAvatarAttr?(heroUnitData, userDetailData)
    getOtherAvatarPower?(heroUnitData, userDetailData)
    getOtherAvatarShowAttr?(heroUnitData, userDetailData)
    getOtherAvatarShowPower?(heroUnitData, userDetailData)
    getOtherHeroPowerAttr?(heroUnitData, userDetailData)
    getOtherPetTotalAttr?(petUnitData)
    getOtherPetHelpAttr?(userDetailData)
    getOtherPetMapAttr?(userDetailData)
    getOtherPetMapPower?(userDetailData)
    getOtherSilkbagAttr?(heroUnitData, userDetailData)
    getOtherHomelandAttr?(heroUnitData, userDetailData)
    getOtherHomelandPower?(userDetailData)
    getOtherSilkbagPower?(heroUnitData, userDetailData)
    getOtherUserHorseAttr?(heroUnitData, userDetailData)
    getOtherHorsePower?(heroUnitData, userDetailData)
    getOtherHorseKarmaAttr?(userDetailData)
    //MailDataHelper.ts
    isMailExpired?(mailInfo)
    getExpiredMailIds?()
    //PetDataHelper.ts
    getPetStarConfig?(id, star)
    getPetMapConfig?(petMapId)
    getPetStarCostConfig?(star, templet)
    getPetLevelupConfig?(level, templet)
    getPetLimitConfig?(id)
    getPetListLimitCount?()
    getPetHelpAttr?(isOnlyBase?)
    getPetMapAttr?(...vars)
    getPetMapPower?()
    getPetBasicAttrWithLevelFilter?(petCfg, level)
    getPetBasicAttrWithLevel?(petCfg, level)
    getPetUpgradeQuality?(unitData)
    getPetNeedExpWithLevel?(level, templet)
    getPetCanReachLevelWithExp?(totalExp, templet)
    getPetLevelUpExp?(level, templet)
    getPetBreakMaterials?(petUnitData)
    getPetBreakLimitLevel?(petUnitData)
    getPetBreakCostWithStar?(rank, templet)
    getPetBreakMaxLevel?(petUnitData)
    getPetBreakShowAttr?(petUnitData, addStar?)
    getPetBreakAttr?(petUnitData, addStar?)
    getPetBreakAttrWithBaseIdAndStar?(baseId, baseAttr, starLevel)
    getPetTotalBaseAttr?(param)
    getPetTotalAttr?(param)
    getPetFragment?(petId)
    getPetSkillIds?(baseId, star)
    isReachStarLimit?(petUnitData)
    isPetMapAct?(petMapData)
    convertAttrAppendDesc?(desc, percent)
    isReachCheckBetterColorPetRP?(petUnitData)
    isHaveBetterColorPet?(petUnitData)
    isPromptPetBetterColor?(petUnitData)
    isPromptPetUpgrade?(petUnitData)
    getPetStateStr?(petUnitData)
    isPromptPetBreak?(petUnitData)
    isHaveEmptyPetPos?()
    getPetPowerFormula?(attrInfo)
    getPetPower?(petUnitData)
    getPetPowerAttr?(param)
    getPetLimitAttr?(petUnitData, tempLimitLevel)
    getAllPetLevelUpCost?(unitData)
    getAllPetBreakCost?(unitData)
    getAllPetLimitUpCost?(unitData)
    getPetRecoveryPreviewInfo?(heroDatas)
    getPetRebornPreviewInfo?(data)
    getPetTeamRedPoint?(...vars)
    getPetEffectWithBaseId?(baseId)
    playVoiceWithId?(id)
    //GuildDungeonDataHelper.ts
    getMyGuildDungeonRankData?()
    getGuildDungeonSortedRankList?()
    getGuildDungeonTotalPoint?()
    getGuildDungeonRemainTotalFightCount?()
    getTableNum?(t)
    getGuildDungeonSortedRecordList?()
    getGuildDungeonMonsterList?()
    getGuildDungeonMonsterData?(dungeonRank)
    getGuildDungeonMemberList?()
    hasGuildDungeonMonsterData?()
    getGuildDungeonPreviewRewards?()
    getGuildDungeonTalk?(monsterBattleUser)
    getGuildDungeonStartTimeAndEndTime?()
    isGuildDungenoInAttackTime?()
    getGuildDungenoOpenTimeHintText?()
    getGuildDungenoFightCount?()
    guildDungeonNeedShopAutionDlg?()
    getGuildDungenoGetPrestige?()
    //ChatDataHelper.ts
    getChatParameterById?(id)
    getShowChatChannelIds?()
    isCanCrossServerChat():boolean;
    //ActivityGuildSprintDataHelper.ts
    getGuildSprintRankRewardList?(rankDataList)
    isGuildSprintActEnd?()
    //HistoryHeroDataHelper.ts
    getHistoryHeroPosShowNum?()
    getHistoryHeroStateWithPos?(pos)
    getHistoryHeroInfo?(baseId)
    getHistoryHeroEffectWithBaseId?(baseId)
    getHistoryHeroBookInfo?()
    getHistoryHeroStepByHeroId?(heroId, step)
    getHistoricalSkills?(baseId)
    getHistoricalHeroRebornPreviewInfo?(data)


    getHeroChangeData?(heroId);
    getResItemMaxUseNum?(itemId);
    getNumByTypeAndValue?(type, value);
    checkResourceLimit?(goodId);
    getServerRecoverNum?(resId);
    getRefreshTime?(resId);
    updateRecorverNum?(resId, value);
    isFragmentCanMerage?(fragmentId);
    getPopModuleShow?(moduleDataName);
    setPopModuleShow?(moduleDataName, needShow);
    getOnlineText?(time);
    calcDiscount(originalPrice, discountPrice);
    splitNumber(num);
    makeRewards(cfg, maxNum, prefix?);
    makePreviewBossRewards(cfg, maxNum, prefix, bossInfo);
    getUpgradeAttrData(lastLevel, currLevel);
    getHeroTopImage(baseId);
    getTreasureTopImage(treasureId);
    getParameter(id);
    getSameCardCount(type, value, filterId?);
    convertAvatarId(serverData);
    convertToBaseIdByAvatarBaseId(avatarBaseId, heroBaseId?);
    _convertServerData(serverData);
    getParameterValue(keyIndex);
    isEnoughBagMergeLevel();
    appendNodeTitle(node, titleId, moduleName, anchorPoint?: cc.Vec2);
    _showNodeTitle(node: cc.Node, isShow, titleId, pos, scale, isEffect, isOffset, anchorPoint);
    makePreviewCrossBossRewards(cfg, maxNum, prefix, bossInfo);
    initAllDataHelper();

}

export let UserDataHelper: IUserDataHelper = {
    getHeroChangeData(heroId) {
        let heroMgr = G_UserData.getHero();
        let hero = heroMgr.getUnitDataWithId(heroId);
        let changeList = [];
        let attribute = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE);
        console.assert(hero != null, 'can\'t find hero data by hero id = ' + heroId);
        function findIdByKey(keyName) {
            for (let i = 0; i < attribute.length(); i++) {
                let data = attribute.indexOf(i);
                if (data.en_name == keyName) {
                    return data;
                }
            }
            return null;
        }
        function saveChangeData(key, newValue, oldValue) {
            let attrData = findIdByKey(key);
            if (attrData) {
                let changeData = {
                    key: key,
                    attrId: attrData.id,
                    desc: attrData.cn_name,
                    heroId: heroId,
                    oldValue: oldValue,
                    newValue: newValue
                };
                changeList.push(changeData);
            }
        }
        for (let key in (hero.constructor as any).schema) {
            let value = (hero.constructor as any).schema[key];
            let newValue = Number(hero['get' + StringUcfirst(key)](hero));
            let oldValue = Number(hero['getLast' + StringUcfirst(key)](hero));
            if (typeof newValue == 'number' && typeof oldValue == 'number') {
                if (newValue != oldValue) {
                    saveChangeData(key, newValue, oldValue);
                }
            }
        }
        return changeList;
    },
    getResItemMaxUseNum: function (itemId) {
        function filterItem(itemId) {
            if (itemId == DataConst.ITEM_VIT || itemId == DataConst.ITEM_SPIRIT || itemId == DataConst.ITEM_TOKEN) {
                return true;
            }
            return false;
        }

        if (filterItem(itemId) == false) {
            let itemData = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(itemId);
            if (itemData == null) {
                return 0;
            }

            if (itemData.item_type == 8 || itemData.item_type == 14) {
                let itemNum1 = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemData.id);
                let itemNum2 = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, Number(itemData.key_value));
                return Math.min(itemNum1, itemNum2);
            } else if (itemData.item_type == 9) {
                let itemNum1 = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemData.id);
                let valueList = itemData.key_value.split('|') || [];
                for (let i in valueList) {
                    let value = valueList[i];
                    let itemNum2 = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, Number(value));
                    itemNum1 = Math.min(itemNum1, itemNum2);
                }
                return itemNum1;
            }
            if (DataConst.JADE_STONE_BOX[itemId]) {
                return JadeStoneConst.MAX_USER_NUM;
            }
            return -1;
        }
        let itemData = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(itemId);
        if (itemData == null) {
            return -1;
        }
        let dropData = G_ConfigLoader.getConfig(ConfigNameConst.DROP).get(itemData.item_value);
        if (dropData == null) {
            return -1;
        }
        let recoverData = G_ConfigLoader.getConfig(ConfigNameConst.RECOVER).get(dropData.value_1);
        if (recoverData == null) {
            return -1;
        }
        var oneSize = dropData.size_1 || 1;
        var currSize = UserDataHelper.getNumByTypeAndValue(dropData.type_1, dropData.value_1);
        var maxLimit = recoverData.client_limit;
        var useNum = Math.ceil((maxLimit - currSize) / oneSize);
        return useNum;
    },
    checkResourceLimit(goodId) {
        let recoverData = G_ConfigLoader.getConfig(ConfigNameConst.RECOVER).get(goodId);
        if (recoverData == null) {
            return 0;
        }
        return recoverData.client_limit;
    },
    getNumByTypeAndValue(type, value) {
        let baseMgr = G_UserData.getBase();
        if (type == TypeConvertHelper.TYPE_POWER) {
            return baseMgr.getPower();
        }
        if (type == TypeConvertHelper.TYPE_ITEM) {
            let itemMgr = G_UserData.getItems();
            let itemNum = itemMgr.getItemNum(value);
            return itemNum;
        }
        if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            let fragMgr = G_UserData.getFragments();
            let itemNum = fragMgr.getFragNumByID(value);
            return itemNum;
        }
        if (type == TypeConvertHelper.TYPE_HERO) {
            let heroMgr = G_UserData.getHero();
            let heroNum = G_UserData.getHero().getHeroCountWithBaseId(value);
            return heroNum;
        }
        if (type == TypeConvertHelper.TYPE_TREASURE) {
            let treasureNum = G_UserData.getTreasure().getTreasureCountWithBaseId(value);
            return treasureNum;
        }
        if (type == TypeConvertHelper.TYPE_PET) {
            let petNum = G_UserData.getPet().getPetCountWithBaseId(value);
            return petNum;
        }
        if (type == TypeConvertHelper.TYPE_RESOURCE) {
            let size = baseMgr.getResValue(value);
            return size;
        }
        if (type == TypeConvertHelper.TYPE_GEMSTONE) {
            let unitData = G_UserData.getGemstone().getUnitDataWithId(value);
            let num = unitData && unitData.getNum() || 0;
            return num;
        }
        if (type == TypeConvertHelper.TYPE_HORSE) {
            let num = G_UserData.getHorse().getHorseCountWithBaseId(value);
            return num;
        }
        if (type == TypeConvertHelper.TYPE_SILKBAG) {
            return G_UserData.getSilkbag().getCountWithBaseId(value);
        }
        if (type == TypeConvertHelper.TYPE_EQUIPMENT) {
            let ids = G_UserData.getEquipment().getEquipmentIdsWithBaseId(value);
            let count = ids.length;
            let len = count;
            for (let i = 0; i < len; i++) {
                let data = G_UserData.getEquipment().getEquipmentDataWithId(ids[i]);
                if (data.isInBattle() || !data.isBlackPlat()) {
                    count = count - 1;
                }
            }
            return count;
        }
        return 0;
    },
    getServerRecoverNum(resId) {
        let baseMgr = G_UserData.getBase();
        let recoverData = baseMgr.getServerRecoverData(resId);
        if (recoverData) {
            return recoverData.num;
        }
        return 0;
    },
    getRefreshTime(resId) {
        let baseMgr = G_UserData.getBase();
        let name = DataConst.getResName(resId);
        let recoverData = baseMgr.getRecoverData(resId);
        if (recoverData) {
            return recoverData.time;
        }
        return 0;
    },
    updateRecorverNum(resId, value) {
        let baseMgr = G_UserData.getBase();
        let recoverData = G_ConfigLoader.getConfig(ConfigNameConst.RECOVER).get(resId);
        if (recoverData == null) {
            return 0;
        }
        if (value > recoverData.client_limit) {
            value = recoverData.client_limit;
        }
        baseMgr.setRecoverData(resId, value);
        return 0;
    },
    isFragmentCanMerage(fragmentId) {
        let number = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        let itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId);
        let config = itemParam.cfg;
        if (number >= config.fragment_num) {
            return [
                true,
                config
            ];
        }
        return [
            false,
            config
        ];
    },
    getPopModuleShow(moduleDataName) {
        let isShow = G_UserData.getPopModuleShow(moduleDataName);
        return isShow;
    },
    setPopModuleShow(moduleDataName, needShow) {
        G_UserData.setPopModuleShow(moduleDataName, needShow);
    },
    getOnlineText(time) {
        let text = '';
        let color = null;
        if (time == 0) {
            text = Lang.get('guild_txt_online');
            color = Colors.BRIGHT_BG_GREEN;
        } else {
            let sec = G_ServerTime.getTime() - time;
            text = Lang.get('guild_txt_offline', { time: G_ServerTime.getDayOrHourOrMinFormat(sec) });
            color = Colors.BRIGHT_BG_TWO;
        }
        return [
            text,
            color
        ];
    },
    calcDiscount(originalPrice, discountPrice) {
        if (originalPrice == 0) {
            return 0;
        }
        return Math.floor(discountPrice / originalPrice * 10 + 0.5);
    },
    splitNumber(num) {
        let arrNum = 4;
        let arr = []
        for (let i = 0; i < arrNum; i += 1) {
            let num1 = num % 10;
            num = Math.floor((num - num1) / 10);
            arr.push(num1)
        }
        return arr;
    },
    makeRewards(cfg, maxNum, prefix) {
        prefix = prefix || '';
        let rewardList = [];
        maxNum = maxNum || 4;
        for (let i = 1; i <= maxNum; i += 1) {
            if (cfg[prefix + ('type_' + i)] != 0) {
                let reward = {
                    type: cfg[prefix + ('type_' + i)],
                    value: cfg[prefix + ('value_' + i)],
                    size: cfg[prefix + ('size_' + i)]
                };
                rewardList.push(reward);
            }
        }
        return rewardList;
    },
    makePreviewBossRewards(cfg, maxNum, prefix, bossInfo) {
        prefix = prefix || 'reward_type_';
        let rewardTypeList = [];
        maxNum = maxNum || 4;
        for (let i = 1; i <= maxNum; i += 1) {
            if (cfg[prefix + i] != 0) {
                rewardTypeList.push(cfg[prefix + i]);
            }
        }
        let bossHeroId = bossInfo.hero_id;
        let heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(bossHeroId);
        console.assert(heroConfig, 'hero config can not find id = %d');
        let rewardList = [];
        for (let k in rewardTypeList) {
            let v = rewardTypeList[k];
            if (v == 1) {
            } else if (v == 2) {
                rewardList.push({
                    type: TypeConvertHelper.TYPE_HERO,
                    value: bossHeroId,
                    size: 1
                });
            } else if (v == 3) {
                rewardList.push({
                    type: TypeConvertHelper.TYPE_FRAGMENT,
                    value: heroConfig.fragment_id,
                    size: 1
                });
            } else if (v == 4) {
                rewardList.push({
                    type: TypeConvertHelper.TYPE_INSTRUMENT,
                    value: heroConfig.instrument_id,
                    size: 1
                });
            } else if (v == 5) {
                rewardList.push({
                    type: TypeConvertHelper.TYPE_SILKBAG,
                    value: bossInfo.silk_bag,
                    size: 1
                });
            } else if (v == 101) {
                rewardList.push({
                    type: TypeConvertHelper.TYPE_SILKBAG,
                    value: bossInfo.silk_bag101,
                    size: 1
                });
            } else if (v == 102) {
                rewardList.push({
                    type: TypeConvertHelper.TYPE_SILKBAG,
                    value: bossInfo.silk_bag102,
                    size: 1
                });
            }
        }
        return rewardList;
    },
    getUpgradeAttrData(lastLevel, currLevel) {
        let Role = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
        let attr = {
            lvup_power: 0,
            lvup_energy: 0
        };
        for (let i = lastLevel; i <= currLevel - 1; i += 1) {
            let roleCfgData = Role.get(i);
            console.assert(roleCfgData, 'role can not find by level is' + i);
            attr.lvup_power = attr.lvup_power + roleCfgData.lvup_power;
            attr.lvup_energy = attr.lvup_energy + roleCfgData.lvup_energy;
        }
        return attr;
    },
    getHeroTopImage(baseId) {
        let needShow = G_UserData.getTeam().isInBattleWithBaseId(baseId);
        if (needShow) {
            let res = Path.getTextSignet('img_iconsign_shangzhen');
            return [
                res,
                CommonConst.HERO_TOP_IMAGE_TYPE_INBATTLE
            ];
        }
        needShow = UserDataHelper.isHaveKarmaWithHeroBaseId(baseId);
        if (needShow) {
            let res = Path.getTextSignet('img_iconsign_mingjiangce');
            return [
                res,
                CommonConst.HERO_TOP_IMAGE_TYPE_KARMA
            ];
        }
        needShow = UserDataHelper.isShowYokeMark(baseId);
        if (needShow) {
            let res = Path.getTextSignet('img_iconsign_jiban');
            return [
                res,
                CommonConst.HERO_TOP_IMAGE_TYPE_YOKE
            ];
        }
        return [];
    },
    getTreasureTopImage(treasureId) {
        let needShow = HeroDataHelper.isHaveYokeToBattleWarriorByTreasureId(treasureId);
        if (needShow) {
            let res = Path.getTextSignet('img_iconsign_jiban');
            return [
                res,
                CommonConst.TREASURE_TOP_IMAGE_TYPE_YOKE
            ];
        } else {
            return null;
        }
    },
    getParameter(id) {
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        let config = Parameter.get(id);
        console.assert(config, 'parameter can\'t find id:' + String(id));
        if (Number(config.content)) {
            return Number(config.content);
        }
        return config.content;
    },
    getSameCardCount(type, value, filterId) {
        let count = 0;
        if (type == TypeConvertHelper.TYPE_HERO) {
            count = G_UserData.getHero().getSameCardCountWithBaseId(value, filterId).length;
        } else if (type == TypeConvertHelper.TYPE_TREASURE) {
            count = G_UserData.getTreasure().getSameCardsWithBaseId(value).length;
        } else if (type == TypeConvertHelper.TYPE_INSTRUMENT) {
            count = G_UserData.getInstrument().getSameCardsWithBaseId(value).length;
        } else if (type == TypeConvertHelper.TYPE_ITEM) {
            count = G_UserData.getItems().getItemNum(value);
        } else if (type == TypeConvertHelper.TYPE_PET) {
            count = G_UserData.getPet().getSameCardCountWithBaseId(value).length;
        } else if (type == TypeConvertHelper.TYPE_HORSE) {
            count = G_UserData.getHorse().getSameCardsWithBaseId(value, filterId).length;
        }
        return count;
    },
    convertAvatarId: function (serverData) {
        let table = UserDataHelper._convertServerData(serverData);
        return [
            table.covertId,
            table
        ];
    },
    convertToBaseIdByAvatarBaseId: function (avatarBaseId, heroBaseId) {
        let baseId = heroBaseId;
        let limit = 0;
        if (avatarBaseId && avatarBaseId > 0) {
            let avatarConfig = AvatarDataHelper.getAvatarConfig(avatarBaseId);
            let isRed = avatarConfig.limit;
            if (isRed == 1) {
                limit = 3;
            }
            baseId = avatarConfig.hero_id;
        }
        return [
            baseId,
            limit
        ];
    },
    _convertServerData: function (serverData) {
        let table: {
            baseId?,
            avatarBaseId?,
            covertId?,
            limitLevel?,
            isHasAvatar?
        } = {};
        function getBaseId(serverData) {
            if (serverData['base_id']) {
                return serverData['base_id'];
            }
            if (serverData['sender_base_id']) {
                return serverData['sender_base_id'];
            }
            if (serverData['recive_base_id']) {
                return serverData['recive_base_id'];
            }
            if (serverData['leader_base_id']) {
                return serverData['leader_base_id'];
            }
            if (serverData['leader']) {
                return serverData['leader'];
            }
            if (serverData['base_id_']) {
                return serverData['base_id_'];
            }
            if (serverData['baseId']) {
                return serverData['baseId'];
            }
            return 0;
        }
        function getAvataId(serverData) {
            if (serverData['avatar_base_id']) {
                return serverData['avatar_base_id'];
            }
            if (serverData['recive_avatar_base_id']) {
                return serverData['recive_avatar_base_id'];
            }
            if (serverData['sender_avatar_base_id']) {
                return serverData['sender_avatar_base_id'];
            }
            if (serverData['leader_avater_base_id']) {
                return serverData['leader_avater_base_id'];
            }
            if (serverData['avatar']) {
                return serverData['avatar'];
            }
            if (serverData['avatar_base_id_']) {
                return serverData['avatar_base_id_'];
            }
            if (serverData['avatarBaseId']) {
                return serverData['avatarBaseId'];
            }
            return 0;
        }
        table.baseId = getBaseId(serverData);
        table.avatarBaseId = getAvataId(serverData);
        [table.covertId, table.limitLevel] = UserDataHelper.convertToBaseIdByAvatarBaseId(table.avatarBaseId, table.baseId);
        table.isHasAvatar = table.avatarBaseId && table.avatarBaseId > 0;
        return table;
    },
    getParameterValue: function (keyIndex) {
        let parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        for (let i = 0; i < parameter.length(); i++) {
            let value = parameter.indexOf(i);
            if (value.key == keyIndex) {
                return Number(value.content);
            }
        }
        console.assert(false, ' can\'t find key index in parameter ' + keyIndex);
    },
    isEnoughBagMergeLevel: function ():boolean {
        return FunctionCheck.funcIsOpened(FunctionConst.FUNC_ICON_MERGE)[0];
    },
    appendNodeTitle: function (node, titleId, moduleName, anchorPoint?: cc.Vec2) {
        if (!node || titleId<0 || !moduleName) {
            return;
        }
        let config = HonorTitleConst.TITLE_CONFIG;
        let pos = config[moduleName][HonorTitleConst.CONFIG_INDEX_POS - 1];
        let scale = config[moduleName][HonorTitleConst.CONFIG_INDEX_SCALE - 1];
        let isEffect = config[moduleName][HonorTitleConst.CONFIG_INDEX_EFFECT - 1];
        let isOffset = config[moduleName][HonorTitleConst.CONFIG_INDEX_OFFSET - 1];
        UserDataHelper._showNodeTitle(node, titleId > 0, titleId, pos, scale, isEffect, isOffset, anchorPoint);
    },
    _showNodeTitle: function (node: cc.Node, isShow, titleId, pos, scale, isEffect, isOffset, anchorPoint: cc.Vec2) {
        let titleImg = node.getChildByName('titleImg');
        if (!titleImg) {
            titleImg = new cc.Node();
            let sp = titleImg.addComponent(cc.Sprite);
            sp.sizeMode = cc.Sprite.SizeMode.RAW;
            // titleImg.ignoreContentAdaptWithSize(true);
            titleImg.name = 'titleImg';
            node.addChild(titleImg);
            if(anchorPoint != null)
            {
                titleImg.setAnchorPoint(anchorPoint);
            }
        }
        if (!isShow) {
            titleImg.active = isShow;
            return;
        }
        let config = PopupHonorTitleHelper.getConfigByTitleId(titleId);

        pos = isOffset ? cc.v2(pos.x + config.offset_x, pos.y + config.offset_y) : pos;
        titleImg.setPosition(pos);
        titleImg.setScale(scale);
        let resPath = PopupHonorTitleHelper.getTitleImg(titleId);
        var index = resPath.lastIndexOf('/');
        var atlasPath = resPath.substr(0, index);
        var framePath = resPath.substr(index + 1);

        cc.resources.load(atlasPath, cc.SpriteAtlas, (err, res: cc.SpriteAtlas) => {
            if (titleImg.isValid) {
                var spriteFrame = res.getSpriteFrame(framePath);
                titleImg.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }
        })
        titleImg.active = isShow;
        titleImg.removeAllChildren();
        if (isEffect && config.moving != '') {
            G_EffectGfxMgr.createPlayGfx(titleImg, config.moving);
        }
    },

    makePreviewCrossBossRewards: function (cfg, maxNum, prefix, bossInfo) {
        prefix = prefix || 'reward_type_';
        var rewardTypeList = [];
        maxNum = maxNum || 4;
        for (var i = 1; i <= maxNum; i += 1) {
            if (cfg[prefix + i] != 0) {
                table.insert(rewardTypeList, cfg[prefix + i]);
            }
        }
        var goldBossHeroId = bossInfo.hero_id;
        var goldHeroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(goldBossHeroId);
        assert(goldHeroConfig, 'hero config can not find id = %d');
        var redBossHeroId = bossInfo.red_hero_id;
        var redHeroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(redBossHeroId);
        assert(redHeroConfig, 'hero config can not find id = %d');
        var rewardList = [];
        for (let k in rewardTypeList) {
            var v = rewardTypeList[k];
            if (v == 1) {
            } else if (v == 2) {
                table.insert(rewardList, {
                    type: TypeConvertHelper.TYPE_HERO,
                    value: redBossHeroId,
                    size: 1
                });
            } else if (v == 3) {
                table.insert(rewardList, {
                    type: TypeConvertHelper.TYPE_FRAGMENT,
                    value: redHeroConfig.fragment_id,
                    size: 1
                });
            } else if (v == 4) {
                table.insert(rewardList, {
                    type: TypeConvertHelper.TYPE_INSTRUMENT,
                    value: redHeroConfig.instrument_id,
                    size: 1
                });
            } else if (v == 5) {
                table.insert(rewardList, {
                    type: TypeConvertHelper.TYPE_HERO,
                    value: goldBossHeroId,
                    size: 1
                });
            } else if (v == 6) {
                table.insert(rewardList, {
                    type: TypeConvertHelper.TYPE_FRAGMENT,
                    value: goldHeroConfig.fragment_id,
                    size: 1
                });
            } else if (v == 7) {
                table.insert(rewardList, {
                    type: TypeConvertHelper.TYPE_INSTRUMENT,
                    value: goldHeroConfig.instrument_id,
                    size: 1
                });
            }
        }
        return rewardList;
    },

    initAllDataHelper: function () {
        addFunctions(ActivityDataHelper);
        addFunctions(ShopDataHelper);
        addFunctions(VipDataHelper);
        addFunctions(HeroDataHelper);
        addFunctions(EquipDataHelper);
        addFunctions(TreasureDataHelper);
        addFunctions(TeamDataHelper);
        addFunctions(GuildDataHelper);
        addFunctions(InstrumentDataHelper);
        addFunctions(UserDetailDataHelper);
        addFunctions(MailDataHelper);
        addFunctions(PetDataHelper);
        addFunctions(GuildDungeonDataHelper);
        addFunctions(ChatDataHelper);
        addFunctions(ActivityGuildSprintDataHelper);
        // addFunctions(require('TimeLimitActivityDataHelper'));
        addFunctions(HistoryHeroDataHelper);
    }
}


function addFunctions(functions) {
    for (let k in functions) {
        let v = functions[k];
       // console.assert(!UserDataHelper[k]||String(k)=="initConfig", 'There is an another check named: ' + String(k));
        UserDataHelper[k] = v;
    }
}

