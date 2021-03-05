import {AudioConst} from './AudioConst';
import {Path} from '../utils/Path';
import { TypeConvertHelper } from '../utils/TypeConvertHelper';
import { G_ConfigLoader } from '../init';
import { ConfigNameConst } from './ConfigNameConst';

export namespace CakeActivityConst {
    export let MATERIAL_ITEM_ID_1;
    export let MATERIAL_ITEM_ID_2;
    export let MATERIAL_ITEM_ID_3;
    export let MATERIAL_VALUE_1;
    export let MATERIAL_VALUE_2;
    export let MATERIAL_VALUE_3;
    export let INFO_LIST_MAX_COUNT;
    export let CAKE_LOCAL_TIME;
    export let CAKE_CROSS_TIME;
    export let CAKE_TIME_GAP;
    export let CAKE_TIME_LEFT;
    export const MATERIAL_TYPE_1 = 1;
    export const MATERIAL_TYPE_2 = 2;
    export const MATERIAL_TYPE_3 = 3;
    export const RANK_TYPE_1 = 1;
    export const RANK_TYPE_2 = 2;
    export const NOTICE_TYPE_COMMON = 1;
    export const NOTICE_TYPE_LEVEL_UP = 2;
    export const NOTICE_TYPE_GET_FRUIT = 3;
    export const AWARD_STATE_1 = 1;
    export const AWARD_STATE_2 = 2;
    export const AWARD_STATE_3 = 3;
    export const TASK_STATE_1 = 1;
    export const TASK_STATE_2 = 2;
    export const TASK_STATE_3 = 3;
    export const DAILY_AWARD_STATE_0 = 0;
    export const DAILY_AWARD_STATE_1 = 1;
    export const DAILY_AWARD_STATE_2 = 2;
    export const DAILY_AWARD_STATE_3 = 3;
    export const DAILY_AWARD_STATE_4 = 4;
    export const ACT_STAGE_0 = 0;
    export const ACT_STAGE_1 = 1;
    export const ACT_STAGE_2 = 2;
    export const ACT_STAGE_3 = 3;
    export const ACT_STAGE_4 = 4;
    export const MAX_LEVEL = 10;
    export const RANK_AWARD_TYPE_1 = 1;
    export const RANK_AWARD_TYPE_2 = 2;
    export const RANK_AWARD_TYPE_3 = 3;
    export const RANK_AWARD_TYPE_4 = 4;
    export const getMaterialTypeWithId = function (id) {
        for (var materialType = CakeActivityConst.MATERIAL_TYPE_1; materialType <= CakeActivityConst.MATERIAL_TYPE_3; materialType++) {
            if (id == CakeActivityConst['MATERIAL_ITEM_ID_' + materialType]) {
                return materialType;
            }
        }
        console.assert(false, 'CakeActivityConst.getMaterialTypeWithId id is wrong, id =', id);
    };
    export const getMaterialIconWithId = function (id) {
        var res = null;
        if (id == CakeActivityConst.MATERIAL_ITEM_ID_1) {
            res = Path.getAnniversaryImg('img_prop_egg');
        } else if (id == CakeActivityConst.MATERIAL_ITEM_ID_2) {
            res = Path.getAnniversaryImg('img_prop_cream');
        } else if (id == CakeActivityConst.MATERIAL_ITEM_ID_3) {
            res = Path.getAnniversaryImg('img_prop_fruits');
        }
        if (res == null) {
            let param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, id);
            res = param.icon;
        }
        return res;
    };
    export const getMaterialSoundIdWithId = function (id) {
        var soundId = 0;
        if (id == CakeActivityConst.MATERIAL_ITEM_ID_1) {
            soundId = AudioConst.SOUND_CAKE_EGG;
        } else if (id == CakeActivityConst.MATERIAL_ITEM_ID_2) {
            soundId = AudioConst.SOUND_CAKE_CREAM;
        } else if (id == CakeActivityConst.MATERIAL_ITEM_ID_3) {
            soundId = AudioConst.SOUND_CAKE_FRUIT;
        }
        return soundId;
    };

    export function init() {

        let Config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        MATERIAL_ITEM_ID_1 = Number(Config.get(691).content);
        MATERIAL_ITEM_ID_2 = Number(Config.get(692).content);
        MATERIAL_ITEM_ID_3 = Number(Config.get(693).content);
        MATERIAL_VALUE_1 = Number(Config.get(682).content.split('|')[1]);
        MATERIAL_VALUE_2 = Number(Config.get(683).content.split('|')[1]);
        MATERIAL_VALUE_3 = Number(Config.get(684).content.split('|')[1]);
        INFO_LIST_MAX_COUNT = Number(Config.get(688).content);
        CAKE_LOCAL_TIME = Number(Config.get(680).content);
        CAKE_CROSS_TIME = Number(Config.get(681).content);
        CAKE_TIME_GAP = Number(Config.get(701).content);
        CAKE_TIME_LEFT = Number(Config.get(702).content);
    }
}