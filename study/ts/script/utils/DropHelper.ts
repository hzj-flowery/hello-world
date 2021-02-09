import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { TypeConvertHelper } from "./TypeConvertHelper";
import { DataConst } from "../const/DataConst";

export namespace DropHelper {
    export function insertDropList(list: any[], item): any[] {
        var needInsert = true;
        for (let i = 0; i < list.length; i++) {
            var val = list[i];
            if (val.type == item.type && val.value == item.value) {
                val.size = val.size + item.size;
                needInsert = false;
                break;
            }
        }
        if (needInsert) {
            list.push(item);
        }
        return list;
    }

    export function getReward(dropId): any[] {
        var dropData = G_ConfigLoader.getConfig(ConfigNameConst.DROP).get(dropId);
        var dropList = [];
        for (let i = 1; i <= 10; i++) {
            var typeName = 'type_' + i;
            var valueName = 'value_' + i;
            var sizeName = 'size_' + i;
            var item = {
                type: dropData[typeName],
                value: dropData[valueName],
                size: dropData[sizeName]
            };
            if (item.type != 0) {
                insertDropList(dropList, item);
            }
        }
        return dropList;
    }
    export function getDropReward(dropId): any[] {
        return getReward(dropId);
    };
    export function getTowerDrop(towerId, difficulty): any[] {
        var towerData = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE).get(towerId);
        var dropId = towerData['team' + (difficulty + '_drop')];
        var dropItemList = [];
        var reward = getReward(dropId);
        for (let i = 0; i < reward.length; i++) {
            var item = reward[i];
            if (item.type != 0) {
                insertDropList(dropItemList, item);
            }
        }
        return dropItemList;
    };
    export function getDailyDrop(dailyData) {
        var StoryBox = G_ConfigLoader.getConfig(ConfigNameConst.STORY_BOX);
        var itemTotal = {
            type: 0,
            value: 0,
            size: 0
        };
        for (var i = 1; i <= 6; i++) {
            var dropName = 'drop_' + i;
            var dropId = dailyData[dropName];
            var drop = StoryBox.get(dropId);
            for (var j = 1; j <= 10; j++) {
                var typeName = 'type_' + j;
                var valueName = 'value_' + j;
                var sizeName = 'size_' + j;
                var item = {
                    type: drop[typeName],
                    value: drop[valueName],
                    size: drop[sizeName]
                };
                if (item.type != 0) {
                    itemTotal.type = item.type;
                    itemTotal.value = item.value;
                    itemTotal.size = itemTotal.size + item.size;
                }
            }
        }
        return itemTotal;
    };
    export function getStageDrop(stageData) {
        var dropList = [];
        for (var i = 1; i <= 6; i++) {
            var typeName = 'type_' + i;
            var valueName = 'value_' + i;
            var sizeName = 'size_' + i;
            var item = {
                type: stageData[typeName],
                value: stageData[valueName],
                size: stageData[sizeName]
            };
            if (item.type != 0) {
                insertDropList(dropList, item);
            }
        }
        var list = sortDropList(dropList);
        return list;
    };
    export function merageAwardList(awardList: any[]) {
        var tempList = {};
        var retList = [];
        function merageAward(award) {
            var keyStr = award.type + ('|' + award.value);
            if (tempList[keyStr] == null) {
                tempList[keyStr] = award.size;
            } else {
                tempList[keyStr] = tempList[keyStr] + award.size;
            }
        }

        for (let i = 0; i < awardList.length; i++) {
            let award = awardList[i];
            merageAward(award);
        }

        for (const key in tempList) {
            var value = tempList[key];
            var array = key.split('|');
            let award = {
                type: parseFloat(array[0]),
                value: parseFloat(array[1]),
                size: value
            };
            retList.push(award);
        }
        return retList;
    };

    export function sortDropList(dropList: any[]) {

        for (let i = 0; i < dropList.length; i++) {
            var v = dropList[i];
            if (v.type == TypeConvertHelper.TYPE_HERO) {
                v.importance = 1;
            } else if (v.type == TypeConvertHelper.TYPE_EQUIPMENT) {
                v.importance = 2;
            } else if (v.type == TypeConvertHelper.TYPE_TREASURE) {
                v.importance = 3;
                // } else if (v.type == TypeConvertHelper.TYPE_SHENBING) {
                //     v.importance = 4;
            } else if (v.type == TypeConvertHelper.TYPE_PET) {
                v.importance = 5;
            } else if (v.type == TypeConvertHelper.TYPE_FRAGMENT) {
                v.importance = 6;
            } else if (v.type == TypeConvertHelper.TYPE_RESOURCE && v.value == DataConst.RES_DIAMOND) {
                v.importance = 7;
            } else if (v.type == TypeConvertHelper.TYPE_ITEM) {
                v.importance = 8;
            } else if (v.type == TypeConvertHelper.TYPE_RESOURCE) {
                v.importance = 9;
            } else {
                v.importance = 10;
            }
        }
        dropList.sort(function (a, b) {
            if (a.type == TypeConvertHelper.TYPE_FRAGMENT && b.type == TypeConvertHelper.TYPE_FRAGMENT) {
                var aCfg = TypeConvertHelper.convert(a.type, a.value, a.size).cfg;
                var bCfg = TypeConvertHelper.convert(b.type, b.value, b.size).cfg;
                if (aCfg.comp_type == bCfg.comp_type) {
                    return bCfg.color - aCfg.color;
                } else {
                    return aCfg.comp_type - bCfg.comp_type;
                }
            } else if (TypeConvertHelper.getTypeClass(a.type) == null || TypeConvertHelper.getTypeClass(b.type) == null) {
                return 1;
            } else if (a.type == b.type) {
                var aCfg = TypeConvertHelper.convert(a.type, a.value, a.size).cfg;
                var bCfg = TypeConvertHelper.convert(b.type, b.value, b.size).cfg;
                if (a.type == TypeConvertHelper.TYPE_TITLE) {
                    return bCfg.colour - aCfg.colour;
                } else {
                    return bCfg.color - aCfg.color;
                }
            } else {
                return a.importance - b.importance;
            }
        });
        return dropList;
    };
    export function getTowerSuperDrop(stageData) {
        var dropList = [];
        for (var i = 1; i <= 6; i++) {
            var typeName = 'type_' + i;
            var valueName = 'value_' + i;
            var sizeName = 'size_' + i;
            var item = {
                type: stageData[typeName],
                value: stageData[valueName],
                size: stageData[sizeName]
            };
            if (item.type != 0) {
                insertDropList(dropList, item);
            }
        }
        var list = sortDropList(dropList);
        return list;
    };
}