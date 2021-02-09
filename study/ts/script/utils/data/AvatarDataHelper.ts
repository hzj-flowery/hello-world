import { G_UserData, G_ConfigLoader } from "../../init";
import { FunctionConst } from "../../const/FunctionConst";
import ParameterIDConst from "../../const/ParameterIDConst";
import { HeroConst } from "../../const/HeroConst";
import { AttrDataHelper } from "./AttrDataHelper";
import { ServerRecordConst } from "../../const/ServerRecordConst";
import { BaseConfig } from "../../config/BaseConfig";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { HeroDataHelper } from "./HeroDataHelper";

export namespace AvatarDataHelper {
    let AvatarConfig: BaseConfig;
    let AvatarShowConfig: BaseConfig;
    let HeroConfig: BaseConfig;
    let AvatarMappingConfig: BaseConfig;
    let HeroRankConfig: BaseConfig;
    let ParameterConfig: BaseConfig;
    let FunctionLevelConfig: BaseConfig;

    export function init() {
        AvatarConfig = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR);
        AvatarShowConfig = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR_SHOW);
        HeroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        AvatarMappingConfig = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR_MAPPING);
        HeroRankConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RANK);
        ParameterConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        FunctionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
    }

    export let getAvatarConfig = function (id) {
        return AvatarConfig.get(id);
    };

    export let getAvatarShowConfig = function (id) {

        return AvatarShowConfig.get(id);
    };

    export let getAvatarHeroConfig = function (id) {
        let info = getAvatarConfig(id);
        let heroId = info.hero_id;
        let heroInfo = HeroConfig.get(heroId);
        return heroInfo;
    };
    export let getAvatarMappingConfig = function (id) {

        let info = AvatarMappingConfig.get(id);
        console.assert(info, ('avatar_mapping config can not find id = %d' + id));
        return info;
    };
    export let getCurAvatarBatch = function () {
        let batch = G_UserData.getServerRecord().getRecordById(ServerRecordConst.KEY_ACTIVE_AVATAR_BATCH);
        if (batch <= 0) {
            batch = 1;
        }
        // console.log('getCurAvatarBatch = ' + batch);
        return batch;
    };
    export let getAllAvatarIds = function () {
        var sortFun = function (a, b) {
            let selfA = a.isSelf() && 1 || 0;
            let selfB = b.isSelf() && 1 || 0;
            let equipA = a.isEquiped() && 1 || 0;
            let equipB = b.isEquiped() && 1 || 0;
            let colorA = a.getConfig().color;
            let colorB = b.getConfig().color;
            let ownA = a.isOwned() && 1 || 0;
            let ownB = b.isOwned() && 1 || 0;
            if (selfA != selfB) {
                return selfB - selfA;
            }
            else if (equipA != equipB) {
                return equipB - equipA;
            }
            else if (ownA != ownB) {
                return ownB - ownA;
            }
            else if (colorA != colorB) {
                return colorB - colorA;
            }
            else if (a.getLevel() != b.getLevel()) {
                return b.getLevel() - a.getLevel();
            }

            else {
                return a.getConfig().id - b.getConfig().id;
            }
        }
        let avatarBatch = getCurAvatarBatch();
        let datas: any = [];
        let len = AvatarConfig.length();
        for (let i = 0; i < len; i++) {
            let info = AvatarConfig.indexOf(i);
            let batch = info.batch;
            if (avatarBatch >= batch || G_UserData.getAvatar().getUnitDataWithBaseId(info.id)) {
                let baseId = info.id;
                let data = null;
                let unitData = G_UserData.getAvatar().getUnitDataWithBaseId(baseId);
                if (unitData) {
                    data = unitData;
                } else {
                    let tempData = { base_id: baseId };
                    data = G_UserData.getAvatar().createTempAvatarUnitData(tempData);
                }
                datas.push(data);
            }
        }
        datas.sort(sortFun)
        let result: any = [];
        for (let j in datas) {
            let data = datas[j];
            result.push(data.getBase_id());
        }
        return result;
    };
    export let getAllOwnAvatarIds = function () {
        let result: any = [];
        let len = AvatarConfig.length();
        for (let i = 0; i < len; i++) {
            let info = AvatarConfig.indexOf(i);
            let avatarId = info.id;
            let isOwn = G_UserData.getAvatar().isHaveWithBaseId(avatarId);
            if (isOwn) {
                result.push(avatarId);
            }
        }
        return result;
    };
    export let getAvatarBaseAttr = function (id) {
        let result = {};
        let info = getAvatarConfig(id);
        for (let i = 1; i <= 2; i++) {
            let attrType = info['fashion_attr_' + i];
            let attrValue = info['fashion_value_' + i];
            AttrDataHelper.formatAttr(result, attrType, attrValue);
        }
        return result;
    };
    export let getAvatarTotalAttr = function (avatarId, level, templet) {
        let result = {};
        let baseAttr = getAvatarBaseAttr(avatarId);
        AttrDataHelper.appendAttr(result, baseAttr);
        return result;
    };
    export let getAllOwnAvatarShowInfo = function () {
        let result: any = [];
        let avatarPhoto = G_UserData.getAvatarPhoto().getAvatar_photo();
        for (let i in avatarPhoto) {
            let id = avatarPhoto[i];
            let info = getAvatarShowConfig(id);
            result.push(info);
        }
        return result;
    };
    export let isHaveAvatarShow = function (avatarShowId) {
        let info = getAvatarShowConfig(avatarShowId);
        let avatarId1 = info.avatar_id1;
        let avatarId2 = info.avatar_id2;
        let isHave1 = G_UserData.getAvatar().isHaveWithBaseId(avatarId1);
        let isHave2 = G_UserData.getAvatar().isHaveWithBaseId(avatarId2);
        return isHave1 && isHave2;
    };
    export let getShowAttr = function (avatarShowId) {
        let result: any = [];
        let info = getAvatarShowConfig(avatarShowId);
        for (let i = 1; i <= 4; i++) {
            let attrId = info['talent_attr_' + i];
            let attrValue = info['talent_value_' + i];
            if (attrId > 0) {
                result.push({
                    attrId: attrId,
                    attrValue: attrValue
                });
            }
        }
        return result;
    };
    export let getSkillInfo = function (data) {
        let result: any = [];
        let avatarId = data.getBase_id();
        let avatarConfig = getAvatarConfig(avatarId);
        let heroId = avatarConfig.hero_id;
        let limitLevel = 0;
        if (avatarConfig.limit == 1) {
            limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
        }
        let heroRankConfig = HeroDataHelper.getHeroRankConfig(heroId, 0, limitLevel);
        for (let i = 1; i <= 3; i++) {
            let skillId = heroRankConfig['rank_skill_' + i];
            if (skillId != 0) {
                let unit: any = { id: skillId };
                if (i == 3) {
                    unit.unlock = avatarConfig.skill_3_unlock;
                    unit.isActiveJoint = data.getLevel() >= avatarConfig.skill_3_unlock;
                }
                result.push(unit);
            }
        }
        return result;
    };
    export let getAllBookIds = function () {
        var avatarBatch = getCurAvatarBatch();
        var result = {};
        var len = AvatarShowConfig.length();
        for (let i = 0; i < len; i++) {
            var info = AvatarShowConfig.indexOf(i);
            var batch = info.batch;
            if (avatarBatch >= batch) {
                let country = info.country;
                if (result[country] == null) {
                    result[country] = [];
                }
                result[country].push(info.id);
            }
        }
        return result;
    };
    export let getBookIdsBySort = function (bookIds) {
        var sortFunc = function (a, b) {
            let activeA = a.isActive && 1 || 0;
            let activeB = b.isActive && 1 || 0;
            let canActiveA = !a.isActive && a.isHave && 1 || 0;
            let canActiveB = !b.isActive && b.isHave && 1 || 0;
            if (canActiveA != canActiveB) {
                return canActiveB - canActiveA;
            }
            else if (activeA != activeB) {
                return activeB - activeA;
            }
            else if (a.sort != b.sort) {
                return a.sort - b.sort;
            }
            else {
                return a.id - b.id;
            }
        }
        let result: any = [];
        let temp: any = [];
        for (let i in bookIds) {
            let bookId = bookIds[i];
            let info = getAvatarShowConfig(bookId);
            let showId = info.id;
            let sort = info.sort;
            let country = info.country;
            let one = {
                isActive: G_UserData.getAvatarPhoto().isActiveWithId(showId),
                isHave: isHaveAvatarShow(showId),
                id: showId,
                sort: sort
            };
            temp.push(one);
        }
        temp.sort(sortFunc);
        for (let k in temp) {
            let one = temp[k];
            result.push(one.id);
        }
        return result;
    };
    export let  getShowHeroBaseIdByCheck = function (unitData) {
        var heroBaseId = 0;
        var isEquipAvatar = false;
        var avatarLimitLevel = null;
        if (unitData.isLeader() && unitData.isUserHero() && G_UserData.getBase().isEquipAvatar()) {
            var avatarBaseId = G_UserData.getBase().getAvatar_base_id();
            var info = AvatarDataHelper.getAvatarConfig(avatarBaseId);
            heroBaseId = info.hero_id;
            isEquipAvatar = true;
            if (info.limit == 1) {
                avatarLimitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
        } else {
            heroBaseId = unitData.getBase_id();
            isEquipAvatar = false;
        }
        var avatarRedLimitLevel = null;
        return [
            heroBaseId,
            isEquipAvatar,
            avatarLimitLevel,
            avatarRedLimitLevel
        ];
    };

    export let  getShowSkillIdsByCheck = function (unitData) {
        var skillIds = {};
        if (unitData.isLeader() && unitData.isUserHero() && G_UserData.getBase().isEquipAvatar()) {
            var avatarBaseId = G_UserData.getBase().getAvatar_base_id();
            var heroBaseId = AvatarDataHelper.getAvatarConfig(avatarBaseId).hero_id;
            var limitLevel = unitData.getLimit_level();
            var limitRedLevel = unitData.getLimit_rtg();
            skillIds = HeroDataHelper.getSkillIdsWithBaseIdAndRank(heroBaseId, 0, limitLevel, limitRedLevel);
        } else {
            skillIds = HeroDataHelper.getSkillIdsWithHeroData(unitData);
        }
        return skillIds;
    };

    export let getShowPlayerBaseIdByCheck = function () {
        let playerBaseId = 0;
        if (G_UserData.getBase().isEquipAvatar()) {
            let avatarBaseId = G_UserData.getBase().getAvatar_base_id();
            playerBaseId = getAvatarConfig(avatarBaseId).hero_id;
        } else {
            playerBaseId = G_UserData.getBase().getPlayerBaseId();
        }
        return playerBaseId;
    };
    export let isPromptChange = function () {
        let unitData = G_UserData.getAvatar().getCurEquipedUnitData();
        if (unitData == null) {
            let count = G_UserData.getAvatar().getAvatarCount();
            return count > 0;
        }

        let tempLevel = ParameterConfig.get(ParameterIDConst.AVATAR_HINT_CLOSE).content;
        let openLevel = FunctionLevelConfig.get(FunctionConst.FUNC_AVATAR).level;
        let limitLevel = openLevel + tempLevel;
        let userLevel = G_UserData.getBase().getLevel();
        if (userLevel >= limitLevel) {
            return false;
        }
        let color = unitData.getConfig().color;
        let datas = G_UserData.getAvatar().getAllDatas();
        for (let k in datas) {
            let data = datas[k];
            let isEquip = data.isEquiped();
            let tempColor = data.getConfig().color;
            if (!isEquip && tempColor > color) {
                return true;
            }
        }
        return false;
    };
    export let isBetterThanCurEquiped = function (unitData) {
        let curData = G_UserData.getAvatar().getCurEquipedUnitData();
        if (curData == null) {
            return true;
        }
        let curColor = curData.getConfig().color;
        let color = unitData.getConfig().color;
        return color > curColor;
    };
    export let isCanActiveBookWithId = function (bookId) {
        let isActive = G_UserData.getAvatarPhoto().isActiveWithId(bookId);
        let isHave = isHaveAvatarShow(bookId);
        let isCanActive = !isActive && isHave;
        return isCanActive;
    };
    export let isCanActiveBook = function () {
        let avatarBatch = getCurAvatarBatch();
        let len = AvatarShowConfig.length();
        for (let i = 0; i < len; i++) {
            let info = AvatarShowConfig.indexOf(i);
            if (avatarBatch >= info.batch) {
                let showId = info.id;
                let isCanActive = isCanActiveBookWithId(showId);
                if (isCanActive == true) {
                    return true;
                }
            }
        }
        return false;
    };
    export let isCanActiveInBookIds = function (bookIds) {
        for (let i in bookIds) {
            let bookId = bookIds[i];
            let isCan = isCanActiveBookWithId(bookId);
            if (isCan) {
                return true;
            }
        }
        return false;
    };

}
// export let AvatarDataHelper = new TempAvatarDataHelper();