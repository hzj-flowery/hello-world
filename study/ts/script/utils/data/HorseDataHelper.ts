
import AttributeConst from "../../const/AttributeConst";
import HorseConst from "../../const/HorseConst";
import { G_UserData, G_AudioManager, G_ConfigLoader } from "../../init";
import { RecoveryDataHelper } from "./RecoveryDataHelper";
import { Path } from "../Path";
import { HorseEquipDataHelper } from "./HorseEquipDataHelper";
import { AttrDataHelper } from "./AttrDataHelper";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { HeroDataHelper } from "./HeroDataHelper";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { UserDataHelper } from "./UserDataHelper";
import { Lang } from "../../lang/Lang";

export namespace HorseDataHelper {
    export function getHorseConfig(id) {

        let info = G_ConfigLoader.getConfig(ConfigNameConst.HORSE).get(id);
        console.assert(info, ('horse config can not find id = %d' + id));
        return info;
    };
    export function getHorseStarConfig(id, star) {

        let info = G_ConfigLoader.getConfig(ConfigNameConst.HORSE_STAR).get(id, star);
        console.assert(info, ('horse_star config can not find id = %d, star = %d' + id + star));
        return info;
    };
    export function getHorseName(id, star) {
        let info = this.getHorseStarConfig(id, star);
        return info.name;
    };
    export function getCostSingleInfo(id, star) {
        let info = this.getHorseStarConfig(id, star);
        let result = {};
        for (let i = 1; i <= 2; i++) {
            let type = info['type_' + i];
            let value = info['value_' + i];
            let size = info['size_' + i];
            RecoveryDataHelper.formatRecoveryCost(result, type, value, size);
        }
        return result;
    };
    export function getAttrSingleInfo(id, star) {
        let info = this.getHorseStarConfig(id, star);
        let result = {};
        AttrDataHelper.formatAttr(result, AttributeConst.ATK, info.atk);
        AttrDataHelper.formatAttr(result, AttributeConst.PD, info.pdef);
        AttrDataHelper.formatAttr(result, AttributeConst.MD, info.mdef);
        AttrDataHelper.formatAttr(result, AttributeConst.HP, info.hp);
        AttrDataHelper.formatAttr(result, AttributeConst.HIT, info.hit);
        AttrDataHelper.formatAttr(result, AttributeConst.NO_CRIT, info.no_crit);
        return result;
    };
    export function getSkillAttrSingleInfo(id, star) {
        let info = this.getHorseStarConfig(id, star);
        let result = {};
        AttrDataHelper.formatAttr(result, info.skill_type1, info.skill_size1);
        return result;
    };
    export function getHorseAttrInfo(horseData, addStar?, horseEquipList?) {
        let result = {};
        let tempStar = addStar || 0;
        let id = horseData.getBase_id();
        let star = horseData.getStar() + tempStar;
        if (star > HorseConst.HORSE_STAR_MAX) {
            return null;
        }
        result = this.getAttrSingleInfo(id, star);
        let equipList = horseEquipList;
        if (!horseEquipList) {
            equipList = G_UserData.getHorseEquipment().getEquipedEquipListWithHorseId(horseData.getId());
        }
        for (let k in equipList) {
            let unitData = equipList[k];
            let equipBaseId = unitData.getBase_id();
            let equipData = HorseEquipDataHelper.getHorseEquipConfig(equipBaseId);
            for (let i = 1; i <= 4; i++) {
                let attrType = equipData['attribute_type_' + i];
                if (attrType != 0) {
                    let attrValue = equipData['attribute_value_' + i];
                    if (attrType == AttributeConst.DEF) {
                        AttrDataHelper.formatAttr(result, AttributeConst.PD, attrValue);
                        AttrDataHelper.formatAttr(result, AttributeConst.MD, attrValue);
                    } else {
                        AttrDataHelper.formatAttr(result, attrType, attrValue);
                    }
                }
            }
        }
        return result;
    };
    export function getHorseSkillAttrInfo(horseData, addStar?) {
        let result = {};
        let tempStar = addStar || 0;
        let id = horseData.getBase_id();
        let star = horseData.getStar() + tempStar;
        if (star > HorseConst.HORSE_STAR_MAX) {
            return null;
        }
        result = this.getSkillAttrSingleInfo(id, star);
        return result;
    };
    export function getEffectWithBaseId(baseId) {
        let result = null;
        let info = this.getHorseConfig(baseId);
        let moving = info.moving;
        if (moving != '0') {
            result = moving.split('|');
        }
        return result;
    };
    export function getHeroBaseIdWithHorseId(horseId) {
        var heroUnitData = HorseDataHelper.getHeroDataWithHorseId(horseId);
        if (heroUnitData == null) {
            return null;
        }
        var heroBaseId = heroUnitData.getBase_id();
        return heroBaseId;
    }
    export function getHeroDataWithHorseId(horseId) {
        var data = G_UserData.getBattleResource().getHorseDataWithId(horseId);
        if (data == null) {
            return null;
        }
        var heroId = G_UserData.getTeam().getHeroIdWithPos(data.getPos());
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        return heroUnitData;
    }
    export function getHorseTalentInfo(id) {
        let result: any = {};
        for (let i = 1; i <= HorseConst.HORSE_STAR_MAX; i++) {
            let info = this.getHorseStarConfig(id, i);
            let temp = {
                star: info.star,
                des: info.talent_description,
                name: info.talent_name
            };
            result.push(temp);
        }
        return result;
    };
    export function getHorseListLimitCount() {
        let level = G_UserData.getBase().getLevel();

        let info = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(level);
        console.assert(info, ('role config can not find level = %d' + level));
        return info.horse_limit;
    };
    export function isPromptHorseUpStar(horseData) {
        let isStarLimit = horseData.isStarLimit();
        if (isStarLimit) {
            return false;
        }
        let canUpStar = true;
        let materialInfo = this.getCostSingleInfo(horseData.getBase_id(), horseData.getStar());
        let materialList = RecoveryDataHelper.convertToList(materialInfo);
        for (let i in materialList) {
            let info = materialList[i];
            if (info.type == TypeConvertHelper.TYPE_HORSE) {
                let myCount = UserDataHelper.getSameCardCount(info.type, info.value, horseData.getId());
                let needCount = info.size;
                let isReachCondition = myCount >= needCount;
                canUpStar = canUpStar && isReachCondition;
            } else if (info.type == TypeConvertHelper.TYPE_RESOURCE) {
                let [isOk] = LogicCheckHelper.enoughMoney(info.size);
                canUpStar = canUpStar && isOk;
            }
        }
        return canUpStar;
    };
    export function getHorseUpStarCostInfo(horseData) {
        let result = {};
        let id = horseData.getBase_id();
        let star = horseData.getStar();
        for (let i = 1; i <= star - 1; i++) {
            let info = this.getCostSingleInfo(id, i);
            RecoveryDataHelper.mergeRecoveryCost(result, info);
        }
        return result;
    };
    export function getHorseUpStarMaterial(horseData) {
        let temp = {};
        let id = horseData.getBase_id();
        let star = horseData.getStar();
        let info = this.getCostSingleInfo(id, star);
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) != TypeConvertHelper.TYPE_RESOURCE) {
                for (let value in unit) {
                    let size = unit[value];
                    RecoveryDataHelper.formatRecoveryCost(temp, type, value, size);
                }
            }
        }
        let result = RecoveryDataHelper.convertToList(temp);
        return result;
    };
    export function getHorseUpStarMoney(horseData) {
        let temp = {};
        let id = horseData.getBase_id();
        let star = horseData.getStar();
        let info = this.getCostSingleInfo(id, star);
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_RESOURCE) {
                for (let value in unit) {
                    let size = unit[value];
                    RecoveryDataHelper.formatRecoveryCost(temp, type, value, size);
                }
            }
        }
        let result = RecoveryDataHelper.convertToList(temp);
        return result[0];
    };
    export function getHorseRecoveryPreviewInfo(datas) {
        let result = [];
        let info = {};
        for (let k in datas) {
            let unitData = datas[k];
            let cost1 = this.getHorseUpStarCostInfo(unitData);
            let baseId = unitData.getBase_id();
            RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HORSE, baseId, 1);
            RecoveryDataHelper.mergeRecoveryCost(info, cost1);
        }
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_HORSE) {
                for (let value in unit) {
                    let size = unit[value];
                    let temp = RecoveryDataHelper.convertSameCard(type, value, size, 1);
                    RecoveryDataHelper.mergeRecoveryCost(currency, temp);
                }
                info[type] = null;
            }
        }
        RecoveryDataHelper.mergeRecoveryCost(info, currency);
        for (let type in info) {
            let unit = info[type];
            for (let value in unit) {
                let size = unit[value];
                result.push({
                    type: type,
                    value: value,
                    size: size
                })
            }
        }
        RecoveryDataHelper.sortAward(result);
        return result;
    };
    export function getHorseRebornPreviewInfo(data) {
        let result = [];
        let info = {};
        let cost1 = this.getHorseUpStarCostInfo(data);
        let baseId = data.getBase_id();
        RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_HORSE, baseId, 1);
        RecoveryDataHelper.mergeRecoveryCost(info, cost1);
        let currency = {};
        for (let type in info) {
            let unit = info[type];
            if (parseInt(type) == TypeConvertHelper.TYPE_HORSE) {
                for (let value in unit) {
                    let size = unit[value];
                    let temp = RecoveryDataHelper.convertSameCard(type, value, size, 2);
                    RecoveryDataHelper.mergeRecoveryCost(currency, temp);
                }
                info[type] = null;
            }
        }
        RecoveryDataHelper.mergeRecoveryCost(info, currency);
        for (let type in info) {
            let unit = info[type];
            for (let value in unit) {
                let size = unit[value];
                result.push({
                    type: type,
                    value: value,
                    size: size
                });
            }
        }
        RecoveryDataHelper.sortAward(result);
        return result;
    };
    export function isEffectiveHorseToHero(horseId, heroBaseId) {
        let [heroIds, isSuitAll] = G_UserData.getHorse().getHeroIdsWithHorseId(horseId);
        if (isSuitAll) {
            return true;
        } else {
            for (let i in heroIds) {
                let heroId = heroIds[i];
                if (heroId == heroBaseId) {
                    return true;
                }
            }
            return false;
        }
    };
    export function getHeroNameByFilter(heroBaseIds) {
        let isLeaderExist = false;
        let result: any = [];
        for (let i in heroBaseIds) {
            let heroBaseId = heroBaseIds[i];
            let info = HeroDataHelper.getHeroConfig(heroBaseId);
            if (info.type == 1) {
                if (!isLeaderExist) {
                    result.push(info.name + Lang.get("horse_suit_ride_heros_leader"));
                    isLeaderExist = true;
                }
            } else {
                result.push(info.name);
            }
        }
        return result;
    };
    export function playVoiceWithId(id) {
        let voiceName = this.getHorseConfig(id).voice;
        if (voiceName != '' && voiceName != '0') {
            let res = Path.getHeroVoice(voiceName);
            G_AudioManager.playSound(res);
        }
    };
    export function getHorseGroupConfig(id) {

        let info = G_ConfigLoader.getConfig(ConfigNameConst.HORSE_GROUP).get(id);
        console.assert(info, ('horse_group config can not find id = %d' + id));
        return info;
    };
    export function doActiveHorsePhoto(photoId) {
        G_UserData.getHorse().c2sActiveWarHorsePhoto(photoId);
    };
    export function isHorseRecoveryValid(horseId) {
        let horseEquipList = G_UserData.getHorseEquipment().getHorseEquipmentList();
        for (let k in horseEquipList) {
            let unitData = horseEquipList[k];
            if (unitData.getHorse_id() == horseId) {
                return false;
            }
        }
        return true;
    };
    export function getHorsePhotoDetailInfo(photoId, horseGroupList) {
        for (let i in horseGroupList) {
            let groupData = horseGroupList[i];
            if (groupData.id == photoId) {
                return groupData;
            }
        }
        return null;
    };
    export function getHorsePhotoNeedNum(photoId, horseGroupList) {
        for (let i in horseGroupList) {
            let groupData = horseGroupList[i];
            if (groupData.id == photoId) {
                let needNum = 0;
                for (let i1 = 1; i1 <= 2; i1++) {
                    if (groupData['horse' + i1] != 0) {
                        needNum = needNum + 1;
                    }
                }
                return needNum;
            }
        }
        return 0;
    };
    export function isHorsePhotoValid(horseStateList) {
        for (let k in horseStateList) {
            let horseState = horseStateList[k];
            if (horseState.state == HorseConst.HORSE_PHOTO_VALID) {
                return true;
            }
        }
        return false;
    };
    export function getAllHorsePhotoAttrList(stateList, groupList) {
        var powerList = {};
        for (var i in stateList) {
            var stateInfo = stateList[i];
            if (stateInfo.state == HorseConst.HORSE_PHOTO_DONE) {
                var groupData = groupList[i];
                for (var attrIndex = 1; attrIndex <= 4; attrIndex++) {
                    var attrId = groupData['attribute_type_' + attrIndex];
                    if (attrId != 0) {
                        var value = groupData['attribute_value_' + attrIndex];
                        powerList[attrId] = powerList[attrId] || 0;
                        powerList[attrId] = powerList[attrId] + value;
                    }
                }
            }
        }
        return powerList;
    };
    export function getAllHorsePhotoPowerList(stateList, groupList) {
        var result = {};
        var power = 0;
        for (var i in stateList) {
            var stateInfo = stateList[i];
            if (stateInfo.state == HorseConst.HORSE_PHOTO_DONE) {
                var groupData = groupList[i];
                power = power + groupData.all_combat;
            }
        }
        result[AttributeConst.HORSE_POWER] = power;
        return result;
    }
}