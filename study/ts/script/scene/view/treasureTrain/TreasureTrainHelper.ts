import { FunctionConst } from "../../../const/FunctionConst";
import TreasureConst from "../../../const/TreasureConst";
import { G_ConfigLoader, G_Prompt, G_UserData } from "../../../init";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { EquipJadeHelper } from "../equipmentJade/EquipJadeHelper";

export namespace TreasureTrainHelper {

    export var isOpen = function (funcId) {
        var arr = FunctionCheck.funcIsOpened(funcId)
        var isOpen = arr[0];
        var des = arr.length > 1 ? arr[1] : null;
        if (!isOpen) {
            G_Prompt.showTip(des);
            return false;
        }
        return true;
    };

    export var checkIsReachRefineMaxLevel = function (data) {
        var curLevel = data.getRefine_level()
        var maxLevel = data.getMaxRefineLevel()

        return curLevel >= maxLevel
    };

    export var getShowTreasureTrainTab = function () {
        var data = [];
        var curTreasureId = G_UserData.getTreasure().getCurTreasureId();
        var curUnitData = G_UserData.getTreasure().getTreasureDataWithId(curTreasureId);
        for (var index = 1; index != TreasureConst.TREASURE_TRAIN_MAX_TAB; index++) {
            if (LogicCheckHelper.funcIsShow(FunctionConst['FUNC_TREASURE_TRAIN_TYPE' + index])) {
                if (index == TreasureConst.TREASURE_TRAIN_LIMIT) {
                    if (curUnitData.isCanLimitBreak()) {
                        (data.push(index));
                    }
                } else {
                    (data.push(index));
                }
            }
        }
        return data;
    };
    export var haveBetterAndCanEquipJade = function (treasureId, jadeId, slot) {
        var params = {} as any;
        if (jadeId) {
            params.jadeId = jadeId;
        }
        if (slot > 1) {
            params.property = 2;
        } else {
            params.property = 1;
        }
        var treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        if (!treasureUnitData.isInBattle()) {
            return [
                false,
                false
            ];
        }
        params.equipBaseId = treasureUnitData.getBase_id();
        params.equipId = treasureId;
        params.hideWear = true;
        var jade = G_UserData.getJade();
        var jadeUnitData = jade.getJadeDataById(jadeId);
        var better = false;
        var list = jade.getJadeListByEquip(params, FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
        var [heroBaseId, convertHeroBaseId] = UserDataHelper.getHeroBaseIdWithTreasureId(treasureId);
        var isHave = TreasureTrainHelper._isHaveSuitable(heroBaseId, list, treasureUnitData);
        if (jadeUnitData) {
            if (!jadeUnitData.isSuitableHero(heroBaseId)) {
                better = list.length > 0 && isHave;
            }
            for (var i = 0; i < list.length; i++) {
                if (better) {
                    break;
                }
                if (list[i].getConfig().color > jadeUnitData.getConfig().color && !treasureUnitData.isHaveTwoSameJade(list[i].getId())[0] && list[i].isSuitableHero(heroBaseId)) {
                    better = true;
                }
            }
        }
        return [
            list.length > 0 && isHave,
            better
        ];
    };
    export var _isHaveSuitable = function (heroBaseId, list, treasureUnitData) {
        var isHave = false;
        if (list.length <= 1) return isHave;
        for (var i = 1; i != list.length; i++) {
            if (list[i].isSuitableHero(heroBaseId) && !treasureUnitData.isHaveTwoSameJade(list[i].getId())[0]) {
                isHave = true;
            }
        }
        return isHave;
    };
    export var getTreasureJadeAttr = function (unitData) {
        var jades = unitData.getJades();
        var attrInfo = [];
        for (var i = 1; i != jades.length; i++) {
            if (jades[i] > 0) {
                var jadeUnitData = G_UserData.getJade().getJadeDataById(jades[i]);
                var cfg = jadeUnitData.getConfig();
                var _ = jadeUnitData.getEquipHeroBaseId(), heroBaseId;
                var isSuitable = jadeUnitData.isSuitableHero(heroBaseId);
                (attrInfo.push({
                    order: i,
                    type: cfg.type,
                    value: EquipJadeHelper.getRealAttrValue(cfg, G_UserData.getBase().getLevel()),
                    property: cfg.property,
                    description: cfg.description,
                    isSuitable: isSuitable
                }))
            }
        }
        (attrInfo.sort((t1, t2) => {
            return t1.order - t2.order;
        }));
        return attrInfo;
    };
    export var needJadeRedPoint = function (treasureId) {
        var needRed = false;
        var [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
        if (!isOpen) {
            return needRed;
        }
        var treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        if (!treasureUnitData.isInBattle()) {
            return needRed;
        }
        var jades = treasureUnitData.getJades();
        var slotList = (treasureUnitData.getConfig().inlay_type.split('|'));
        for (var i = 0; i < jades.length; i++) {
            if (parseInt(slotList[i]) > 0) {
                var [isHave, haveBetter] = TreasureTrainHelper.haveBetterAndCanEquipJade(treasureId, jades[i], i);
                if (jades[i] == 0) {
                    needRed = needRed || isHave;
                }
                needRed = needRed || haveBetter;
                if (needRed) {
                    return needRed;
                }
            }
        }
        return needRed;
    };

}