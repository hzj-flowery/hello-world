import { HeroDataHelper } from "./HeroDataHelper";
import { EquipDataHelper } from "./EquipDataHelper";
import { AttrDataHelper } from "./AttrDataHelper";
import { EquipJadeHelper } from "../../scene/view/equipmentJade/EquipJadeHelper";
import AttributeConst from "../../const/AttributeConst";
import { TreasureDataHelper } from "./TreasureDataHelper";
import { InstrumentDataHelper } from "./InstrumentDataHelper";
import MasterConst from "../../const/MasterConst";
import { G_ConfigLoader, G_UserData } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { AvatarDataHelper } from "./AvatarDataHelper";
import { HeroConst } from "../../const/HeroConst";
import { PetDataHelper } from "./PetDataHelper";
import { SilkbagDataHelper } from "./SilkbagDataHelper";
import { HorseDataHelper } from "./HorseDataHelper";
import { HomelandHelp } from "../../scene/view/homeland/HomelandHelp";
import { UserDataHelper } from "./UserDataHelper";
import { HistoryHeroDataHelper } from "./HistoryHeroDataHelper";
import { TacticsDataHelper } from "./TacticsDataHelper";

export namespace UserDetailDataHelper {
    export function getOtherUserTotalAttr  (heroUnitData, userDetailData) {
        let result = {};
        let level = heroUnitData.getLevel();
        let rank = heroUnitData.getRank_lv();
        let attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData.getConfig(), level);
        let attr2 = HeroDataHelper.getBreakAttr(heroUnitData);
        let attr3 = HeroDataHelper.getLimitAttr(heroUnitData);
        let attr4 = HeroDataHelper.getAwakeAttr(heroUnitData);
        let attr5 = getOtherUserEquipAttr(heroUnitData, userDetailData);
        let attr6 = getOtherUserTreasureAttr(heroUnitData, userDetailData);
        let attr7 = getOtherUserInstrumentAttr(heroUnitData, userDetailData);
        let attr8 = getOtherUserMasterAttr(heroUnitData, userDetailData);
        let attr9 = HeroDataHelper.getOfficialAttr(userDetailData.getOfficeLevel());
        let attr10 = getOtherKarmaAttrRatio(heroUnitData, userDetailData);
        let attr11 = HeroDataHelper.getYokeAttrRatio(heroUnitData);
        let attr12 = getOtherTalentAttr(heroUnitData, rank, userDetailData);
        let attr13 = getOtherInstrumentTalentAttr(heroUnitData, userDetailData);
        let attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData);
        let attr15 = getOtherAvatarAttr(heroUnitData, userDetailData);
        let attr16 = getOtherAvatarShowAttr(heroUnitData, userDetailData);
        let attr17 = getOtherPetHelpAttr(userDetailData);
        let attr18 = getOtherPetMapAttr(userDetailData);
        let attr19 = getOtherSilkbagAttr(heroUnitData, userDetailData);
        let attr20 = getOtherHomelandAttr(heroUnitData, userDetailData);
        let attr21 = getOtherHaloAttr(heroUnitData, rank, userDetailData);
        let attr22 = getOtherUserHorseAttr(heroUnitData, userDetailData);
        let attr23 = getOtherHorseKarmaAttr(userDetailData);

        // var attr24 = UserDetailDataHelper.getOtherHistoryHeroAttr(heroUnitData, userDetailData);
        // var attr25 = UserDetailDataHelper.getOtherTacticsAttr(heroUnitData, userDetailData);
        // var attr26 = UserDetailDataHelper.getOtherBoutAttr(heroUnitData, userDetailData);

        AttrDataHelper.appendAttr(result, attr1);
        AttrDataHelper.appendAttr(result, attr2);
        AttrDataHelper.appendAttr(result, attr3);
        AttrDataHelper.appendAttr(result, attr4);
        AttrDataHelper.appendAttr(result, attr5);
        AttrDataHelper.appendAttr(result, attr6);
        AttrDataHelper.appendAttr(result, attr7);
        AttrDataHelper.appendAttr(result, attr8);
        AttrDataHelper.appendAttr(result, attr9);
        AttrDataHelper.appendAttr(result, attr10);
        AttrDataHelper.appendAttr(result, attr11);
        AttrDataHelper.appendAttr(result, attr12);
        AttrDataHelper.appendAttr(result, attr13);
        AttrDataHelper.appendAttr(result, attr14);
        AttrDataHelper.appendAttr(result, attr15);
        AttrDataHelper.appendAttr(result, attr16);
        AttrDataHelper.appendAttr(result, attr17);
        AttrDataHelper.appendAttr(result, attr18);
        AttrDataHelper.appendAttr(result, attr19);
        AttrDataHelper.appendAttr(result, attr20);
        AttrDataHelper.appendAttr(result, attr21);
        AttrDataHelper.appendAttr(result, attr22);
        AttrDataHelper.appendAttr(result, attr23);
        // AttrDataHelper.appendAttr(result, attr24);
        // AttrDataHelper.appendAttr(result, attr25);
        // AttrDataHelper.appendAttr(result, attr26);
        AttrDataHelper.processDefAndAddition(result);
        return result;
    };
    export function getOtherUserEquipAttr  (heroUnitData, userDetailData, isPower?) {
        let result = {};
        let pos = userDetailData.getHeroPos(heroUnitData);
        if (pos == null) {
            return result;
        }
        let equipDatas = userDetailData.getEquipDatasWithPos(pos);
        for (let i in equipDatas) {
            let equipData = equipDatas[i];
            let attrInfo = EquipDataHelper.getEquipAttrInfo(equipData);
            for (let k in attrInfo) {
                let value = attrInfo[k];
                if (result[k] == null) {
                    result[k] = 0;
                }
                result[k] = result[k] + value;
            }
            let jadeAttr = getOtherUserJadeAttr(equipData, heroUnitData, isPower, userDetailData);
            for (let k in jadeAttr) {
                let value = jadeAttr[k];
                if (result[k] == null) {
                    result[k] = 0;
                }
                result[k] = result[k] + value;
            }
        }
        let suitAttr = getOtherEquipSuitAttr(userDetailData, equipDatas, pos);
        for (let k in suitAttr) {
            let value = suitAttr[k];
            if (result[k] == null) {
                result[k] = 0;
            }
            result[k] = result[k] + value;
        }
        return result;
    };
    export function getOtherUserJadeAttr  (data, heroUnitData, isPower, userDetailData) {
        let result = {};
        let level = heroUnitData.getLevel();
        let jadeSysIds = data.getUserDetailJades() || {};
        let power = 0;
        for (let k in jadeSysIds) {
            let sysId = jadeSysIds[k];
            if (sysId > 0) {
                let heroBaseId = heroUnitData.getAvatarToHeroBaseIdByAvatarId(userDetailData.getAvatarBaseId());
                let config = EquipJadeHelper.getJadeConfig(sysId);
                if (config && EquipJadeHelper.isSuitableHero(config, heroBaseId)) {
                    let cfg = config;
                    if (!isPower) {
                        let size = EquipJadeHelper.getRealAttrValue(cfg, level);
                        if (cfg.type != 0) {
                            AttrDataHelper.formatAttr(result, cfg.type, size);
                        }
                    } else {
                        AttrDataHelper.formatAttr(result, AttributeConst.JADE_POWER, cfg.fake);
                    }
                }
            }
        }
        return result;
    };
    export function getOtherEquipSuitAttr  (userDetailData, equipDatas, pos) {
        let temp = {};
        for (let i in equipDatas) {
            let equipData = equipDatas[i];
            let equipConfig = equipData.getConfig();
            let suitId = equipConfig.suit_id;
            if (suitId > 0 && temp[suitId] == null) {
                let componentCount = 0;
                let componentIds = EquipDataHelper.getSuitComponentIds(suitId);
                for (let j in componentIds) {
                    let id = componentIds[j];
                    let isHave = userDetailData.isHaveEquipInPos(id, pos);
                    if (isHave) {
                        componentCount = componentCount + 1;
                    }
                }
                let attrInfo = EquipDataHelper.getSuitAttrShowInfo(suitId);
                for (let j in attrInfo) {
                    let one = attrInfo[j];
                    let count = one.count;
                    if (componentCount >= count) {
                        if (temp[suitId] == null) {
                            temp[suitId] = {};
                        }
                        let info = one.info;
                        for (let j in info) {
                            let data = info[j];
                            if (temp[suitId][data.type] == null) {
                                temp[suitId][data.type] = 0;
                            }
                            temp[suitId][data.type] = temp[suitId][data.type] + data.value;
                        }
                    }
                }
            }
        }
        let result = {};
        for (let k in temp) {
            let one = temp[k];
            for (let type in one) {
                let value = one[type];
                if (result[type] == null) {
                    result[type] = 0;
                }
                result[type] = result[type] + value;
            }
        }
        return result;
    };
    export function getOtherUserTreasureAttr  (heroUnitData, userDetailData,isPower?) {
        var result = {};
    var pos = userDetailData.getHeroPos(heroUnitData);
    if (pos == null || pos == 0) {
        return result;
    }
    var treasureDatas = userDetailData.getTreasureDatasWithPos(pos);
    for (let i in treasureDatas) {
        var treasureData = treasureDatas[i];
        var attrInfo = TreasureDataHelper.getTreasureAttrInfo(treasureData);
        for (let k in attrInfo) {
            var value = attrInfo[k];
            if (result[k] == null) {
                result[k] = 0;
            }
            result[k] = result[k] + value;
        }
        var jadeAttr = UserDetailDataHelper.getOtherUserJadeAttr(treasureData, heroUnitData, isPower, userDetailData);
        for (let k in jadeAttr) {
            var value = jadeAttr[k];
            if (result[k] == null) {
                result[k] = 0;
            }
            result[k] = result[k] + value;
        }
    }
    return result;
    };
    export function getOtherUserInstrumentAttr  (heroUnitData, userDetailData) {
        let result = {};
        let pos = userDetailData.getHeroPos(heroUnitData);
        if (pos == null || pos == 0) {
            return result;
        }
        let instrumentDatas = userDetailData.getInstrumentDatasWithPos(pos);
        for (let i in instrumentDatas) {
            let instrumentData = instrumentDatas[i];
            let attrInfo = InstrumentDataHelper.getInstrumentAttrInfo(instrumentData);
            for (let k in attrInfo) {
                let value = attrInfo[k];
                if (result[k] == null) {
                    result[k] = 0;
                }
                result[k] = result[k] + value;
            }
        }
        return result;
    };
    export function getOtherUserMasterAttr  (heroUnitData, userDetailData) {
        let result = {};
        let pos = userDetailData.getHeroPos(heroUnitData);
        if (pos == null || pos == 0) {
            return result;
        }
        let strengthenEquipAttr = getOtherMasterEquipStrengthenAttr(userDetailData, pos);
        let refineEquipAttr = getOtherMasterEquipRefineAttr(userDetailData, pos);
        let strengthenTreasureAttr = getOtherMasterTreasureUpgradeAttr(userDetailData, pos);
        let refineTreasureAttr = getOtherMasterTreasureRefineAttr(userDetailData, pos);
        AttrDataHelper.appendAttr(result, strengthenEquipAttr);
        AttrDataHelper.appendAttr(result, refineEquipAttr);
        AttrDataHelper.appendAttr(result, strengthenTreasureAttr);
        AttrDataHelper.appendAttr(result, refineTreasureAttr);
        return result;
    };
    export function getOtherMasterEquipStrengthenAttr  (userDetailData, pos) {
        let curAttr = {};
        let equipIds = userDetailData.getEquipInfoWithPos(pos);
        let minLevel = null;
        for (let i = 1; i <= 4; i++) {
            let equipId = equipIds[i];
            let level = null;
            if (equipId) {
                let equipData = userDetailData.getEquipDataWithId(equipId);
                level = equipData.getLevel();
            } else {
                level = 0;
            }
            if (minLevel == null) {
                minLevel = level;
            }
            if (level < minLevel) {
                minLevel = level;
            }
        }
        let masterConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_MASTER);
        for (let i = 0; i < masterConfig.length(); i++) {
            let info = masterConfig.indexOf(i);
            if (info.equip_type == MasterConst.MASTER_TYPE_1) {
                if (minLevel >= info.equip_value) {
                    for (let j = 1; j <= 4; j++) {
                        let attrType = info['master_type' + j];
                        if (attrType > 0) {
                            let attrValue = info['master_value' + j];
                            if (curAttr[attrType] == null) {
                                curAttr[attrType] = 0;
                            }
                            curAttr[attrType] = curAttr[attrType] + attrValue;
                        }
                    }
                } else {
                    break;
                }
            }
        }
        return curAttr;
    };
    export function getOtherMasterEquipRefineAttr  (userDetailData, pos) {
        let curAttr = {};
        let equipIds = userDetailData.getEquipInfoWithPos(pos);
        let minLevel = null;
        for (let i = 0; i < 4; i++) {
            let equipId = equipIds[i];
            let level = null;
            if (equipId) {
                let equipData = userDetailData.getEquipDataWithId(equipId);
                level = equipData.getR_level();
            } else {
                level = 0;
            }
            if (minLevel == null) {
                minLevel = level;
            }
            if (level < minLevel) {
                minLevel = level;
            }
        }
        let masterConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_MASTER);
        for (let i = 0; i < masterConfig.length(); i++) {
            let info = masterConfig.indexOf(i);
            if (info.equip_type == MasterConst.MASTER_TYPE_2) {
                if (minLevel >= info.equip_value) {
                    for (let j = 1; j <= 4; j++) {
                        let attrType = info['master_type' + j];
                        if (attrType > 0) {
                            let attrValue = info['master_value' + j];
                            if (curAttr[attrType] == null) {
                                curAttr[attrType] = 0;
                            }
                            curAttr[attrType] = curAttr[attrType] + attrValue;
                        }
                    }
                } else {
                    break;
                }
            }
        }
        return curAttr;
    };
    export function getOtherMasterTreasureUpgradeAttr  (userDetailData, pos) {
        let curAttr = {};
        let treasureIds = userDetailData.getTreasureInfoWithPos(pos);
        let minLevel = null;
        for (let i = 0; i < 2; i++) {
            let treasureId = treasureIds[i];
            let level = null;
            if (treasureId) {
                let treasureData = userDetailData.getTreasureDataWithId(treasureId);
                level = treasureData.getLevel();
            } else {
                level = 0;
            }
            if (minLevel == null) {
                minLevel = level;
            }
            if (level < minLevel) {
                minLevel = level;
            }
        }
        let masterConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_MASTER);
        for (let i = 0; i < masterConfig.length(); i++) {
            let info = masterConfig.indexOf(i);
            if (info.equip_type == MasterConst.MASTER_TYPE_3) {
                if (minLevel >= info.equip_value) {
                    for (let j = 1; j <= 4; j++) {
                        let attrType = info['master_type' + j];
                        if (attrType > 0) {
                            let attrValue = info['master_value' + j];
                            if (curAttr[attrType] == null) {
                                curAttr[attrType] = 0;
                            }
                            curAttr[attrType] = curAttr[attrType] + attrValue;
                        }
                    }
                } else {
                    break;
                }
            }
        }
        return curAttr;
    };
    export function getOtherMasterTreasureRefineAttr  (userDetailData, pos) {
        let curAttr = {};
        let treasureIds = userDetailData.getTreasureInfoWithPos(pos);
        let minLevel = null;
        for (let i = 0; i < 2; i++) {
            let treasureId = treasureIds[i];
            let level = null;
            if (treasureId) {
                let treasureData = userDetailData.getTreasureDataWithId(treasureId);
                level = treasureData.getRefine_level();
            } else {
                level = 0;
            }
            if (minLevel == null) {
                minLevel = level;
            }
            if (level < minLevel) {
                minLevel = level;
            }
        }
        let masterConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_MASTER);
        for (let i = 0; i < masterConfig.length(); i++) {
            let info = masterConfig.indexOf(i);
            if (info.equip_type == MasterConst.MASTER_TYPE_4) {
                if (minLevel >= info.equip_value) {
                    for (let j = 1; j <= 4; j++) {
                        let attrType = info['master_type' + j];
                        if (attrType > 0) {
                            let attrValue = info['master_value' + j];
                            if (curAttr[attrType] == null) {
                                curAttr[attrType] = 0;
                            }
                            curAttr[attrType] = curAttr[attrType] + attrValue;
                        }
                    }
                } else {
                    break;
                }
            }
        }
        return curAttr;
    };
    export function getOtherKarmaAttrRatio  (heroUnitData, userDetailData) {
        let heroConfig = heroUnitData.getConfig();
        let result = {};
        for (let i = 1; i <= HeroConst.HERO_KARMA_MAX; i++) {
            let friendId = heroConfig['friend_' + i];
            if (friendId > 0) {
                if (userDetailData.isKarmaActivated(friendId)) {
                    let friendConfig = HeroDataHelper.getHeroFriendConfig(friendId);
                    let attrId = friendConfig.talent_attr;
                    let attrValue = friendConfig.talent_value;
                    if (result[attrId] == null) {
                        result[attrId] = 0;
                    }
                    result[attrId] = result[attrId] + attrValue;
                }
            }
        }
        return result;
    };
    export function getOtherTalentAttr  (heroUnitData, rank, userDetailData) {
        let result = {};
        let heroBaseId = heroUnitData.getBase_id();
        let limitLevel = heroUnitData.getLimit_level();
        var limitRedLevel = heroUnitData.getLimit_rtg();
        if (heroUnitData.isLeader() && userDetailData.isEquipAvatar()) {
            let avatarId = userDetailData.getAvatarId();
            let avatarBaseId = userDetailData.getAvatarBaseId();
            let unitData = userDetailData.getAvatarUnitDataWithId(avatarId);
            heroBaseId = unitData.getConfig().hero_id;
            let limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
            if (limit == 1) {
                limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
        }
        for (let i = 0; i < rank; i++) {
            var info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel);
            if (info) {
                let target = info.talent_target;
                if (target == 1) {
                    for (let j = 1; j <= 2; j++) {
                        let attrId = info['talent_attr_' + j];
                        let attrValue = info['talent_value_' + j];
                        AttrDataHelper.formatAttr(result, attrId, attrValue);
                    }
                }
            }
        }
        if (userDetailData.isInBattle(heroUnitData)) {
            let heroId = heroUnitData.getId();
            let heroDatas = userDetailData.getHeroDataInBattle();
            for (let i in heroDatas) {
                let unit = heroDatas[i];
                let baseId = unit.getBase_id();
                let limitLevel = unit.getLimit_level();
                var limitRedLevel = unit.getLimit_rtg();
                if (unit.isLeader() && userDetailData.isEquipAvatar()) {
                    let avatarId = userDetailData.getAvatarId();
                    let avatarBaseId = userDetailData.getAvatarBaseId();
                    let unitData = userDetailData.getAvatarUnitDataWithId(avatarId);
                    baseId = unitData.getConfig().hero_id;
                    let limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
                    if (limit == 1) {
                        limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
                    }
                }
                let rLv = unit.getRank_lv();
                for (let j = 1; j <= rLv; j++) {
                    let info = HeroDataHelper.getHeroRankConfig(baseId, j, limitLevel);
                    if (info) {
                        let tar = info.talent_target;
                        if (tar == 2) {
                            for (let k = 1; k <= 2; k++) {
                                let attrId = info['talent_attr_' + k];
                                let attrValue = info['talent_value_' + k];
                                AttrDataHelper.formatAttr(result, attrId, attrValue);
                            }
                        }
                    }
                }
            }
        }
        return result;
    };
    export function getOtherHaloAttr  (heroUnitData, rank, userDetailData) {
        let result = {};
        let heroBaseId = heroUnitData.getBase_id();
        if (heroUnitData.isLeader() && userDetailData.isEquipAvatar()) {
            let avatarId = userDetailData.getAvatarId();
            let unitData = userDetailData.getAvatarUnitDataWithId(avatarId);
            heroBaseId = unitData.getConfig().hero_id;
        }
        let limitLevel = userDetailData.getUserLeaderLimitLevel(heroUnitData);
        var limitRedLevel = userDetailData.getUserLeaderRedLimitLevel(heroUnitData);
        for (let i = 1; i <= rank; i++) {
            var info = HeroDataHelper.getHeroRankConfig(heroBaseId, i, limitLevel, limitRedLevel);
            if (info) {
                for (let k = 1; k <= 2; k++) {
                    let haloTarget = info['halo_target_' + k];
                    if (haloTarget == 1) {
                        let attrId = info['halo_attr_' + k];
                        let attrValue = info['halo_value_' + k];
                        AttrDataHelper.formatAttr(result, attrId, attrValue);
                    }
                }
            }
        }
        if (userDetailData.isInBattle(heroUnitData)) {
            let heroId = heroUnitData.getId();
            let heroDatas = userDetailData.getHeroDataInBattle();
            for (let i in heroDatas) {
                let unit = heroDatas[i];
                let baseId = unit.getBase_id();
                if (unit.isLeader() && userDetailData.isEquipAvatar()) {
                    let avatarId = userDetailData.getAvatarId();
                    let unitData = userDetailData.getAvatarUnitDataWithId(avatarId);
                    baseId = unitData.getConfig().hero_id;
                }
                let limitLevel = unit.getLimit_level();
                var limitRedLevel = unit.getLimit_rtg();
                if (unit.isLeader()) {
                    limitLevel = userDetailData.getUserLeaderLimitLevel(unit);
                    limitRedLevel = userDetailData.getUserLeaderRedLimitLevel(unit);
                }
                let rLv = unit.getRank_lv();
                for (let j = 1; j <= rLv; j++) {
                    var info = HeroDataHelper.getHeroRankConfig(baseId, j, limitLevel, limitRedLevel);
                    if (info) {
                        for (let k = 1; k <= 2; k++) {
                            let haloTarget = info['halo_target_' + k];
                            if (haloTarget == 2) {
                                let attrId = info['halo_attr_' + k];
                                let attrValue = info['halo_value_' + k];
                                AttrDataHelper.formatAttr(result, attrId, attrValue);
                            }
                        }
                    }
                }
            }
        }
        return result;
    };
    export function getOtherInstrumentTalentAttr  (heroUnitData, userDetailData) {
        let result = {};
        let pos = userDetailData.getHeroPos(heroUnitData);
        if (pos == null || pos == 0) {
            return result;
        }
        let instrumentDatas = userDetailData.getInstrumentDatasWithPos(pos);
        for (let i in instrumentDatas) {
            let instrumentData = instrumentDatas[i];
            let configInfo = instrumentData.getConfig();
            let templet = instrumentData.getAdvacneTemplateId();
            let level = instrumentData.getLevel();
            for (let j = 1; j <= level; j++) {
                let info = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT_LEVEL).get(j, templet);
                console.assert(info, 'instrument_level config can not find level = %d, templet = %d');
                let target = info.talent_target;
                if (target == 1) {
                    for (let k = 1; k <= 2; k++) {
                        let attrId = info['talent_attr_' + k];
                        let attrValue = info['talent_value_' + k];
                        if (result[attrId] == null) {
                            result[attrId] = 0;
                        }
                        result[attrId] = result[attrId] + attrValue;
                    }
                }
            }
            let heroUnitData = userDetailData.getHeroDataWithPos(pos);
            let heroBaseId = userDetailData.getAvatarToHeroBaseId(heroUnitData);
            let heroConfig = HeroDataHelper.getHeroConfig(heroBaseId);
            let instrumentBaseId = heroConfig.instrument_id;
            let instrumentConfig = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(instrumentBaseId);
            if (level >= instrumentConfig.unlock) {
                let haloTarget = instrumentConfig.halo_target;
                if (haloTarget == 1) {
                    let attrId = instrumentConfig.halo_attr;
                    let attrValue = instrumentConfig.halo_value;
                    AttrDataHelper.formatAttr(result, attrId, attrValue);
                }
            }
        }
        let heroDatas = userDetailData.getHeroDataInBattle();
        for (let i in heroDatas) {
            let data = heroDatas[i];
            let instrumentDatas = userDetailData.getInstrumentDatasWithPos(i);
            for (let j in instrumentDatas) {
                let instrumentData = instrumentDatas[j];
                let configInfo = instrumentData.getConfig();
                let templet = instrumentData.getAdvacneTemplateId();
                let level = instrumentData.getLevel();
                for (let k = 0; k < level; k++) {
                    let info = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT_LEVEL).get(k, templet);
                    console.assert(info, 'instrument_level config can not find level = %d, templet = %d');
                    let target = info.talent_target;
                    if (target == 2) {
                        for (let m = 1; m <= 2; m++) {
                            let attrId = info['talent_attr_' + m];
                            let attrValue = info['talent_value_' + m];
                            if (result[attrId] == null) {
                                result[attrId] = 0;
                            }
                            result[attrId] = result[attrId] + attrValue;
                        }
                    }
                }
                let heroBaseId = userDetailData.getAvatarToHeroBaseId(data);
                let heroConfig = HeroDataHelper.getHeroConfig(heroBaseId);
                let instrumentBaseId = heroConfig.instrument_id;
                let instrumentConfig = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(instrumentBaseId);
                if (level >= instrumentConfig.unlock) {
                    let haloTarget = instrumentConfig.halo_target;
                    if (haloTarget == 2) {
                        let attrId = instrumentConfig.halo_attr;
                        let attrValue = instrumentConfig.halo_value;
                        AttrDataHelper.formatAttr(result, attrId, attrValue);
                    }
                }
            }
        }
        return result;
    };
    export function getOtherAvatarAttr  (heroUnitData, userDetailData) {
        let result = {};
        if (!heroUnitData.isLeader()) {
            return result;
        }
        if (!userDetailData.isEquipAvatar()) {
            return result;
        }
        let avatarId = userDetailData.getAvatarId();
        let unitData = userDetailData.getAvatarUnitDataWithId(avatarId);
        let baseId = unitData.getBase_id();
        let baseAttr = AvatarDataHelper.getAvatarBaseAttr(baseId);
        AttrDataHelper.appendAttr(result, baseAttr);
        return result;
    };
    export function getOtherAvatarPower  (heroUnitData, userDetailData) {
        let result = {};
        if (!heroUnitData.isLeader()) {
            return result;
        }
        if (!userDetailData.isEquipAvatar()) {
            return result;
        }
        let avatarId = userDetailData.getAvatarId();
        let unitData = userDetailData.getAvatarUnitDataWithId(avatarId);
        let power = unitData.getConfig().fake;
        result[AttributeConst.AVATAR_EQUIP_POWER] = power;
        return result;
    };
    export function getOtherAvatarShowAttr  (heroUnitData, userDetailData) {
        let result = {};
        let allInfo = userDetailData.getAllOwnAvatarShowInfo();
        for (let i in allInfo) {
            let info = allInfo[i];
            let target = info.talent_target;
            if (target == 1 && heroUnitData.isLeader()) {
                for (let j = 1; j <= 4; j++) {
                    let attrId = info['talent_attr_' + j];
                    let attrValue = info['talent_value_' + j];
                    AttrDataHelper.formatAttr(result, attrId, attrValue);
                }
            } else if (target == 2) {
                for (let j = 1; j <= 4; j++) {
                    let attrId = info['talent_attr_' + j];
                    let attrValue = info['talent_value_' + j];
                    AttrDataHelper.formatAttr(result, attrId, attrValue);
                }
            }
        }
        return result;
    };
    export function getOtherAvatarShowPower  (heroUnitData, userDetailData) {
        let result = {};
        let power = 0;
        let allInfo = userDetailData.getAllOwnAvatarShowInfo();
        for (let i in allInfo) {
            let info = allInfo[i];
            let target = info.talent_target;
            if (target == 1 && heroUnitData.isLeader()) {
                power = power + info.fake;
            } else if (target == 2) {
                power = power + info.fake;
            }
        }
        result[AttributeConst.AVATAR_POWER] = power;
        return result;
    };
    export function getOtherHeroPowerAttr  (heroUnitData, userDetailData) {
        let result = {};
        let level = heroUnitData.getLevel();
        let rank = heroUnitData.getRank_lv();
        let attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData.getConfig(), level);
        let attr2 = HeroDataHelper.getBreakAttr(heroUnitData);
        let attr3 = HeroDataHelper.getLimitAttr(heroUnitData);
        let attr4 = HeroDataHelper.getAwakeAttr(heroUnitData);
        let attr5 = getOtherUserEquipAttr(heroUnitData, userDetailData, true);
        let attr6 = getOtherUserTreasureAttr(heroUnitData, userDetailData,true);
        let attr7 = getOtherUserInstrumentAttr(heroUnitData, userDetailData);
        let attr8 = getOtherUserMasterAttr(heroUnitData, userDetailData);
        let attr9 = getOtherKarmaAttrRatio(heroUnitData, userDetailData);
        let attr10 = HeroDataHelper.getYokeAttrRatio(heroUnitData);
        let attr11 = HeroDataHelper.getOfficialPower(userDetailData.getOfficeLevel());
        let attr12 = HeroDataHelper.getTalentPower(heroUnitData, 0);
        let attr13 = getOtherInstrumentTalentAttr(heroUnitData, userDetailData);
        let attr14 = HeroDataHelper.getAwakeTalentAttr(heroUnitData);
        let attr15 = getOtherAvatarPower(heroUnitData, userDetailData);
        let attr16 = getOtherAvatarShowPower(heroUnitData, userDetailData);
        let attr17 = getOtherPetHelpAttr(userDetailData);
        let attr18 = getOtherPetMapPower(userDetailData);
        let attr19 = getOtherSilkbagPower(heroUnitData, userDetailData);
        let attr20 = getOtherHomelandPower(userDetailData);
        let attr21 = getOtherHaloAttr(heroUnitData, rank, userDetailData);
        let attr22 = getOtherHorsePower(heroUnitData, userDetailData);
        let attr23 = getOtherHorseKarmaPower(userDetailData);

        var attr24 = UserDetailDataHelper.getOtherHistoryHeroAttr(heroUnitData, userDetailData);
        var attr25 = UserDetailDataHelper.getOtherTacticsAttr(heroUnitData, userDetailData);
        var attr26 = UserDetailDataHelper.getOtherBoutAttr(heroUnitData, userDetailData);

        AttrDataHelper.appendAttr(result, attr1);
        AttrDataHelper.appendAttr(result, attr2);
        AttrDataHelper.appendAttr(result, attr3);
        AttrDataHelper.appendAttr(result, attr4);
        AttrDataHelper.appendAttr(result, attr5);
        AttrDataHelper.appendAttr(result, attr6);
        AttrDataHelper.appendAttr(result, attr7);
        AttrDataHelper.appendAttr(result, attr8);
        AttrDataHelper.appendAttr(result, attr9);
        AttrDataHelper.appendAttr(result, attr10);
        AttrDataHelper.appendAttr(result, attr11);
        AttrDataHelper.appendAttr(result, attr12);
        AttrDataHelper.appendAttr(result, attr13);
        AttrDataHelper.appendAttr(result, attr14);
        AttrDataHelper.appendAttr(result, attr15);
        AttrDataHelper.appendAttr(result, attr16);
        AttrDataHelper.appendAttr(result, attr17);
        AttrDataHelper.appendAttr(result, attr18);
        AttrDataHelper.appendAttr(result, attr19);
        AttrDataHelper.appendAttr(result, attr20);
        AttrDataHelper.appendAttr(result, attr21);
        AttrDataHelper.appendAttr(result, attr22);
        AttrDataHelper.appendAttr(result, attr23);

        AttrDataHelper.appendAttr(result, attr24);
        AttrDataHelper.appendAttr(result, attr25);
        AttrDataHelper.appendAttr(result, attr26);

        AttrDataHelper.processDefAndAddition(result);
        return result;
    };
    export function getOtherPetTotalAttr  (petUnitData) {
        let result = {};
        let level = petUnitData.getLevel();
        let attr1 = PetDataHelper.getPetBasicAttrWithLevel(petUnitData.getConfig(), level);
        let attr2 = PetDataHelper.getPetBreakAttr(petUnitData);
        AttrDataHelper.appendAttr(result, attr1);
        AttrDataHelper.replaceAttr(result, attr2);
        AttrDataHelper.processDefAndAddition(result);
        return result;
    };
    export function getOtherPetHelpAttr  (userDetailData) {
        let result = {};
        let petList = userDetailData.getProtectPetIds();
        let pet_help_percent = UserDataHelper.getParameterValue('pet_huyou_percent') / 1000;
        for (let i in petList) {
            let petId = petList[i];
            let petUnit = userDetailData.getPetUnitDataWithId(petId);
            let param = { unitData: petUnit };
            let attrAll = PetDataHelper.getPetTotalBaseAttr(param);
            for (let key = 0; key < attrAll.length; key++) {
                let value = attrAll[key];
                if (value!=null&&key != AttributeConst.PET_BLESS_RATE - 1) {
                    let blessRate = attrAll[AttributeConst.PET_BLESS_RATE];
                    let valueAdd = Math.floor(value * pet_help_percent / 6);
                    attrAll[key] = valueAdd;
                }
            }
            AttrDataHelper.appendAttr(result, attrAll);
        }
        return result;
    };
    export function getOtherPetMapAttr  (userDetailData) {
        let pet_map = G_ConfigLoader.getConfig(ConfigNameConst.PET_MAP);
        let result = [];
        for (let loop = 0; loop < pet_map.length(); loop++) {
            let petMapData = pet_map.indexOf(loop);
            if (petMapData.show > 0 && userDetailData.isPetHave(petMapData.id)) {
                let attrAll = [];
                for (let i = 1; i <= 4; i++) {
                    let attrType = petMapData['attribute_type_' + i];
                    let attrValue = petMapData['attribute_value_' + i];
                    if (attrType > 0) {
                        attrAll[attrType] = attrAll[attrType] || 0;
                        attrAll[attrType] = attrAll[attrType] + attrValue;
                    }
                }
                AttrDataHelper.appendAttr(result, attrAll);
            }
        }
        return result;
    };
    export function getOtherPetMapPower  (userDetailData) {
        let pet_map = G_ConfigLoader.getConfig(ConfigNameConst.PET_MAP);
        let result = [];
        let power = 0;
        for (let loop = 0; loop < pet_map.length(); loop++) {
            let petMapData = pet_map.indexOf(loop);
            if (petMapData.show > 0 && userDetailData.isPetHave(petMapData.id)) {
                power = power + petMapData.all_combat;
            }
        }
        result[AttributeConst.PET_POWER] = power;
        return result;
    };
    export function getOtherSilkbagAttr  (heroUnitData, userDetailData) {
        var result = {};
    var userLevel = userDetailData.getLevel();
    var pos = userDetailData.getHeroPos(heroUnitData);
    var heroBaseId = heroUnitData.getBase_id();
    if (heroUnitData.isLeader()) {
        heroBaseId = userDetailData.getBaseId();
    }
    var heroRank = heroUnitData.getRank_lv();
    var isInstrumentMaxLevel = userDetailData.isInstrumentLevelMaxWithPos(pos);
    var heroLimit = userDetailData.getUserLeaderLimitLevel(heroUnitData);
    var heroRedLimit = userDetailData.getUserLeaderRedLimitLevel(heroUnitData);
    var silkbagIds = userDetailData.getSilkbagIdsOnTeamWithPos(pos);
    for (let i in silkbagIds) {
        var silkbagId = silkbagIds[i];
        var unitData = userDetailData.getSilkbagUnitDataWithId(silkbagId);
        var baseId = unitData.getBase_id();
        var isEffective = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit)[0];
        if (isEffective) {
            var attr = SilkbagDataHelper.getAttrWithId(baseId, userLevel);
            AttrDataHelper.appendAttr(result, attr);
        }
    }
    return result;
    };
    export function getOtherHomelandAttr  (heroUnitData, userDetailData) {
        let attrAllList = {};
        let homeTreeData = userDetailData.getHomeTree();
        for (let i in homeTreeData) {
            let unitTreeData = homeTreeData[i];
            if (unitTreeData.tree_id > 0) {
                let currLevel = unitTreeData.tree_level;
                for (let level = 1; level <= currLevel; level++) {
                    let currData = G_UserData.getHomeland().getSubTreeCfg(unitTreeData.tree_id, level);
                    if (currData) {
                        let attrList = [];
                        for (let j = 1; j <= 4; j++) {
                            let attrType = currData['attribute_type' + j];
                            let attrValue = currData['attribute_value' + j];
                            if (attrType > 0) {
                                attrList.push({
                                    type: attrType,
                                    value: attrValue
                                });
                            }
                        }
                        for (let k in attrList) {
                            let attrValue = attrList[k];
                            AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value);
                        }
                    }
                }
            }
        }
        for (let i in homeTreeData) {
            let unitTreeData = homeTreeData[i];
            if (unitTreeData.tree_id == 0) {
                let currLevel = unitTreeData.tree_level;
                for (let level = 1; level <= currLevel; level++) {
                    let currData = G_UserData.getHomeland().getMainTreeCfg(level);
                    if (currData) {
                        let attrList = [];
                        for (let j = 1; j <= 4; j++) {
                            let attrType = currData['attribute_type' + j];
                            let attrValue = currData['attribute_value' + j];
                            if (attrType > 0) {
                                attrList.push({
                                    type: attrType,
                                    value: attrValue
                                });
                            }
                        }
                        for (let k in attrList) {
                            let attrValue = attrList[k];
                            AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value);
                        }
                    }
                }
            }
        }
        console.log(attrAllList);
        return attrAllList;
    };
    export function getOtherHomelandPower  (userDetailData) {
        let result = {};
        result[AttributeConst.HOMELAND_POWER] = 0;
        let homelandList = userDetailData.getHomeTree();
        if (homelandList && homelandList.length > 0) {
            let subPower = 0;
            let mainPower = 0;
            for (let i in homelandList) {
                let value = homelandList[i];
                if (value.tree_id == 0) {
                    mainPower = HomelandHelp.getMainTreePower(value.tree_level);
                } else {
                    subPower = subPower + HomelandHelp.getSubTreePower(value.tree_id, value.tree_level);
                }
            }
            let retPower = subPower + mainPower;
            result[AttributeConst.HOMELAND_POWER] = retPower;
        }
        return result;
    };
    export function getOtherSilkbagPower  (heroUnitData, userDetailData) {
        let result = {};
        let power = 0;
        let pos = userDetailData.getHeroPos(heroUnitData);
        var userLevel = userDetailData.getLevel();
        let heroBaseId = heroUnitData.getBase_id();
        if (heroUnitData.isLeader()) {
            heroBaseId = userDetailData.getBaseId();
        }
        let heroRank = heroUnitData.getRank_lv();
        let isInstrumentMaxLevel = userDetailData.isInstrumentLevelMaxWithPos(pos);
        let heroLimit = userDetailData.getUserLeaderLimitLevel(heroUnitData);
        var heroRedLimit = userDetailData.getUserLeaderRedLimitLevel(heroUnitData);
        let silkbagIds = userDetailData.getSilkbagIdsOnTeamWithPos(pos);
        for (let i in silkbagIds) {
            let silkbagId = silkbagIds[i];
            let unitData = userDetailData.getSilkbagUnitDataWithId(silkbagId);
            let baseId = unitData.getBase_id();
            var [isEffective] = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit);
            if (isEffective) {
                var attr = SilkbagDataHelper.getAttrWithId(baseId, userLevel);
                AttrDataHelper.appendAttr(result, attr);
            }
        }
        result[AttributeConst.SILKBAG_POWER] = power;
        return result;
    };
    export function getOtherUserHorseAttr  (heroUnitData, userDetailData) {
        let result = {};
        let pos = userDetailData.getHeroPos(heroUnitData);
        let horseDatas = userDetailData.getHorseDatasWithPos(pos);
        let horseEquipList = userDetailData.getHorseEquipData();
        for (let i in horseDatas) {
            let horseData = horseDatas[i];
            let list = [];
            let equipList = horseData.getEquip();
            for (let index in equipList) {
                let equipId = equipList[index];
                //此处添加保护
                if(horseEquipList['k_' + equipId])
                list[list.length] = horseEquipList['k_' + equipId];
            }
            let attrInfo = HorseDataHelper.getHorseAttrInfo(horseData, null, list);
            let skillAttrInfo = HorseDataHelper.getHorseSkillAttrInfo(horseData);
            AttrDataHelper.appendAttr(result, attrInfo);
            AttrDataHelper.appendAttr(result, skillAttrInfo);
        }
        return result;
    };
    export function getOtherHorsePower  (heroUnitData, userDetailData) {
        let result = {};
        let power = 0;
        let pos = userDetailData.getHeroPos(heroUnitData);
        let horseDatas = userDetailData.getHorseDatasWithPos(pos);
        let horseEquipList = userDetailData.getHorseEquipData();
        for (let i in horseDatas) {
            let horseData = horseDatas[i];
            let baseId = horseData.getBase_id();
            let star = horseData.getStar();
            let info = HorseDataHelper.getHorseStarConfig(baseId, star);
            power = power + info.power;
            let equipList = horseData.getEquip();
            for (let i1 in equipList) {
                let equipId = equipList[i1];
                if (horseEquipList['k_' + equipId]) {
                    let config = horseEquipList['k_' + equipId].getConfig();
                    power = power + config.all_combat;
                }
            }
        }
        result[AttributeConst.HORSE_POWER] = power;
        return result;
    };
    export function getOtherHorseKarmaAttr  (userDetailData) {
        let result = {};
        let horseKarmaInfo = userDetailData.getHorseKarmaInfo();
        for (let index in horseKarmaInfo) {
            let karmaId = horseKarmaInfo[index];
            let karmaConfig = HorseDataHelper.getHorseGroupConfig(karmaId);
            for (let i = 1; i <= 4; i++) {
                let attrType = karmaConfig['attribute_type_' + i];
                if (attrType != 0) {
                    let attrValue = karmaConfig['attribute_value_' + i];
                    AttrDataHelper.formatAttr(result, attrType, attrValue);
                }
            }
        }
        console.log(result);
        return result;
    };
    export function getOtherHorseKarmaPower(userDetailData) {
        var result = {};
        var power = 0;
        var horseKarmaInfo = userDetailData.getHorseKarmaInfo();
        for (let index in horseKarmaInfo) {
            var karmaId = horseKarmaInfo[index];
            var karmaConfig = HorseDataHelper.getHorseGroupConfig(karmaId);
            power = power + karmaConfig.all_combat;
        }
        result[AttributeConst.HORSE_POWER] = power;
        return result;
    };

    export function getOtherHistoryHeroAttr (heroUnitData, userDetailData) {
        var result = {};
        var pos = userDetailData.getHeroPos(heroUnitData);
        var historyHeroData = userDetailData.getHistoryHeroData(pos);
        if (!historyHeroData) {
            return result;
        }
        var attrInfo = HistoryHeroDataHelper.getAttrSingleInfo(historyHeroData);
        AttrDataHelper.appendAttr(result, attrInfo);
        return result;
    };
    export function getOtherHistoryHeroPower (heroUnitData, userDetailData) {
        var result = {};
        var pos = userDetailData.getHeroPos(heroUnitData);
        var historyHeroData = userDetailData.getHistoryHeroData(pos);
        if (!historyHeroData) {
            return result;
        }
        var attrInfo = HistoryHeroDataHelper.getPowerSingleInfo(historyHeroData);
        AttrDataHelper.appendAttr(result, attrInfo);
        return result;
    };
    export function getOtherTacticsAttr (heroUnitData, userDetailData) {
        var result = {};
        var pos = userDetailData.getHeroPos(heroUnitData);
        var unitList = userDetailData.getUnitDataListWithPos(pos);
        for (let _ in unitList) {
            var unitData = unitList[_];
            var attrInfo = TacticsDataHelper.getAttrSingleInfo(unitData);
            AttrDataHelper.appendAttr(result, attrInfo);
        }
        return result;
    };
    export function getOtherTacticsPower (heroUnitData, userDetailData) {
        var result = {};
        var pos = userDetailData.getHeroPos(heroUnitData);
        var unitList = userDetailData.getUnitDataListWithPos(pos);
        for (let _ in unitList) {
            var unitData = unitList[_];
            var attrInfo = TacticsDataHelper.getPowerSingleInfo(unitData);
            AttrDataHelper.appendAttr(result, attrInfo);
        }
        return result;
    };
    export function getOtherBoutAttr (heroUnitData, userDetailData) {
        var result = {};
        AttrDataHelper.appendAttr(result, userDetailData.getBoutAttr());
        return result;
    };
    export function getOtherBoutPower (heroUnitData, userDetailData) {
        var result = {};
        AttrDataHelper.appendAttr(result, userDetailData.getBoutPower());
        return result;
    };
}