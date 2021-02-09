import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { LimitCostConst } from "../../../const/LimitCostConst";
import PetConst from "../../../const/PetConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_ConfigLoader, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

export namespace PetTrainHelper {
    export const CFG_PARAMETER_LIMIT_STAR = 651;
    export const CFG_PARAMETER_ITEM = 652;
    export const CFG_PARAMETER_ITEM_CONSUME = 654;
    export const CFG_PARAMETER_COIN = 653;
    export function createBreakDesc(petUnitData) {
        var label: cc.Label | cc.RichText;
        if (UserDataHelper.isReachStarLimit(petUnitData)) {
            label = UIHelper.createLabel({ fontSize: 22 }).getComponent(cc.Label);
            label.string = Lang.get('pet_break_txt_all_unlock');
            label.font = cc.resources.get(Path.getCommonFont(), cc.Font) as cc.Font;
            label.overflow = cc.Label.Overflow.CLAMP;
            label.node.width = 334;
            label.node.setAnchorPoint(cc.v2(0.5, 1));

        } else {
            var starLevel = petUnitData.getStar() + 1;
            var petStarConfig = UserDataHelper.getPetStarConfig(petUnitData.getBase_id(), starLevel);
            var talentName = petStarConfig.talent_name;
            var talentDes = petStarConfig.talent_description;
            var arr = talentDes.split('\n');
            talentDes = arr.join('\\n');
            var breakDes = Lang.get('pet_break_txt_break_des', { rank: starLevel });
            var talentInfo = Lang.get('pet_break_txt_talent_des', {
                name: talentName,
                des: talentDes,
                breakDes: breakDes
            });
            label = RichTextExtend.createWithContent(talentInfo);
            label.node.setAnchorPoint(cc.v2(0.5, 1));
            // label.ignoreContentAdaptWithSize(false);
            label.maxWidth = 334;
            // label.formatText();
        }
        return label;
    };
    export function getCurLimitCostInfo() {
        var petId = G_UserData.getPet().getCurPetId();
        var petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
        return PetTrainHelper.getLimitCostInfo(petUnitData);
    };
    export function getLimitCostInfo(petUnitData) {
        var costInfo: any = {};
        var petConfig = petUnitData.getConfig();
        if (petConfig.pet_limit_id == 0) {
            petConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(petConfig.potential_before);
        }
        var limitId = petConfig.pet_limit_id;
        var petLimitConfig = UserDataHelper.getPetLimitConfig(petConfig.pet_limit_id);
        for (var i = LimitCostConst.LIMIT_COST_KEY_1; i <= LimitCostConst.LIMIT_COST_KEY_4; i++) {
            costInfo['type_' + i] = petLimitConfig['type_' + i];
            costInfo['value_' + i] = petLimitConfig['value_' + i];
            costInfo['size_' + i] = petLimitConfig['size_' + i];
            costInfo['consume_' + i] = petLimitConfig['consume_' + i];
        }
        costInfo['coin_size'] = petLimitConfig.break_size;
        return costInfo;
    };
    export function getCanConsumePetNums(baseId) {
        var result = G_UserData.getPet().getSameCardCountWithBaseId(baseId);
        return result.length;
    };
    export function canLimit(petUnit, bAllReady) {
        var isCan = true;
        isCan = isCan && PetTrainHelper.canEnterLimit(petUnit);
        isCan = isCan && petUnit.getStar() >= PetTrainHelper.getCanLimitMinStar();
        isCan = isCan && petUnit.getQuality() == PetConst.QUALITY_ORANGE;
        function checkIsMaterialFull(petUnit, costKey) {
            var curCount = petUnit.getMaterials()[costKey - 1];
            var costInfo = PetTrainHelper.getCurLimitCostInfo();
            return curCount >= costInfo['size_' + costKey];
        }
        if (bAllReady) {
            for (var i = LimitCostConst.LIMIT_COST_KEY_1; i <= LimitCostConst.LIMIT_COST_KEY_4; i++) {
                isCan = isCan && checkIsMaterialFull(petUnit, i);
            }
        }
        return isCan;
    };
    export function isPromptPetLimit(petUnit) {
        if (!PetTrainHelper.canEnterLimit(petUnit)) {
            return false;
        }
        if (petUnit.getStar() < PetTrainHelper.getCanLimitMinStar()) {
            return false;
        }
        if (petUnit.getQuality() != PetConst.QUALITY_ORANGE) {
            return false;
        }
        var isAllFull = true;
        for (var key = LimitCostConst.LIMIT_COST_KEY_1; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            var [isOk, isFull] = PetTrainHelper.isPromptPetLimitWithCostKey(petUnit, key);
            isAllFull = isAllFull && isFull;
            if (isOk) {
                return true;
            }
        }
        if (isAllFull) {
            var info = PetTrainHelper.getCurLimitCostInfo();
            var [isOk] = LogicCheckHelper.enoughMoney(info.coin_size) as boolean[];
            if (isOk) {
                return true;
            }
        }
        return false;
    };
    export function isPromptPetLimitWithCostKey(petUnit, key) {
        var info = PetTrainHelper.getLimitCostInfo(petUnit);
        var curCount = petUnit.getCurLimitCostCountWithKey(key);
        var maxSize = info['size_' + key];
        var isFull = curCount >= maxSize;
        if (!isFull) {
            if (key == LimitCostConst.LIMIT_COST_KEY_1) {
                let Item = G_ConfigLoader.getConfig(ConfigNameConst.ITEM);
                var ownExp = curCount;
                for (var j = 1; j <= 4; j++) {
                    var count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst['ITEM_PET_LEVELUP_MATERIAL_' + j]);
                    var itemValue = Item.get(DataConst['ITEM_PET_LEVELUP_MATERIAL_' + j]).item_value;
                    var itemExp = count * itemValue;
                    ownExp = ownExp + itemExp;
                    if (ownExp >= maxSize) {
                        return [
                            true,
                            isFull
                        ];
                    }
                }
            } else {
                var count = UserDataHelper.getNumByTypeAndValue(info['type_' + key], info['value_' + key]) + curCount;
                if (count >= maxSize) {
                    return [
                        true,
                        isFull
                    ];
                }
            }
        }
        return [
            false,
            isFull
        ];
    };
    export function canShowLimitBtn(petUnit) {
        var isCan = true;
        var isShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_PET_TRAIN_TYPE3);
        isCan = isCan && isShow;
        isCan = isCan && (petUnit.getQuality() == PetConst.QUALITY_ORANGE && petUnit.getConfig().potential_after > 0 && petUnit.getStar() >= PetTrainHelper.getCanLimitMinStar() || (petUnit.getQuality() == PetConst.QUALITY_RED && petUnit.getInitial_star() == 0));
        return isCan;
    };
    export function petStarCanLimit(petUnit) {
        return petUnit.getStar() >= PetTrainHelper.getCanLimitMinStar();
    };
    export function canEnterLimit(petUnit) {
        var [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE3);
        var config = petUnit.getConfig();
        return (config.potential_after > 0 || config.potential_before > 0) && isOpen;
    };
    export function limitAfterLevel(petUnit) {
        return petUnit.getLevel();
    };
    export function getCanLimitMinStar() {
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var config = Paramter.get(650);
        console.assert(config, 'paramter not found config by ' + 650);
        return Number(config.content);
    };
    export function limitReduceStar(curStar) {
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var config = Paramter.get(PetTrainHelper.CFG_PARAMETER_LIMIT_STAR);
        console.assert(config, 'paramter not found config by ' + PetTrainHelper.CFG_PARAMETER_LIMIT_STAR);
        var content = config.content.split(',');
        var step = {};
        for (let i in content) {
            var value = content[i];
            step[i] = value.split('|');
        }
        for (let i in step) {
            var value = step[i];
            if (Number(step[i][0]) == curStar) {
                return Number(step[i][1]);
            }
        }
        return 0;
    };
    export function getLimitCostItemMaxNums() {
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var config = Paramter.get(PetTrainHelper.CFG_PARAMETER_ITEM_CONSUME);
        console.assert(config, 'paramter not found config by ' + PetTrainHelper.CFG_PARAMETER_ITEM_CONSUME);
        return Number(config.content);
    };
    export function getCurLimitPetUnit() {
        var petId = G_UserData.getPet().getCurPetId();
        var petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
        return petUnitData;
    };
    export function getCurTabSize() {
        var curHeroId = G_UserData.getPet().getCurPetId();
        var curPetData = G_UserData.getPet().getUnitDataWithId(curHeroId);
        var canEnter = canShowLimitBtn(curPetData);
        var tabsize = PetConst.MAX_TRAIN_TAB - 1;
        if (canEnter) {
            tabsize = PetConst.MAX_TRAIN_TAB;
        }
        return tabsize;
    };

}