import { G_ConfigLoader, G_UserData } from "../../../../init";
import { ConfigNameConst } from "../../../../const/ConfigNameConst";
import { DailyCountData } from "../../../../data/DailyCountData";

export namespace CustomActivityAvatarHelper {
    export let getInitViewData = function (id) {
        if (!id) {
            id = 1;
        }
        let AvatarActivity = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR_ACTIVITY);
        var config = AvatarActivity.get(id);
        console.assert(config != null, 'avatar_activity can no find drop id =' + (id || 'nil'));
        var awardsList = [];
        for (var i = 1; i <= 14; i++) {
            awardsList.push({
                type: config['type_' + i],
                value: config['value_' + i],
                size: config['size_' + i]
            });
        }
        var costRes:any = {
            type: config.drop_type,
            value: config.drop_value,
            size: config.drop_size
        };
        return [
            awardsList,
            costRes
        ];
    };
    export let getCosRes = function (id?) {
        if (!id) {
            id = 1;
        }
        let AvatarActivity = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR_ACTIVITY);
        var config = AvatarActivity.get(id);
        console.assert(config != null, 'avatar_activity can no find drop id =' + (id || 'nil'));
        return {
            type: config.drop_type,
            value: config.drop_value,
            size: config.drop_size
        };
    };
    export let getMaxFreeNum = function (id) {
        if (!id) {
            id = 1;
        }
        let AvatarActivity = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR_ACTIVITY);
        var config = AvatarActivity.get(id);
        console.assert(config != null, 'avatar_activity can no find drop id =' + (id || 'nil'));
        return config.day_free;
    };
    export let getFreeCount = function (id) {
        if (!id) {
            id = 1;
        }
        var maxFreeCount = CustomActivityAvatarHelper.getMaxFreeNum(id);
        var useCount = G_UserData.getDailyCount().getCountById(DailyCountData.DAILY_RECORD_AVATAR_ACTVITY_CNT);
        var freeCount = maxFreeCount - useCount;
        if (freeCount <= 0) {
            freeCount = 0;
        }
        return freeCount;
    };
    export let getItemPositionByIndex = function (index) {
        var x, y;
        var colNum = 5;
        var rowNum = 4 - 2;
        var gapX = 131;
        var gapY = 112.5;
        var maxHeight = (rowNum + 1) * gapY;
        if (index <= colNum) {
            x = (index - 1) * gapX;
            y = 0;
        } else if (index <= colNum + rowNum) {
            x = (colNum - 1) * gapX;
            y = -1 * (index - colNum) * gapY;
        } else if (index <= colNum + rowNum + colNum) {
            x = (colNum + rowNum + colNum - index) * gapX;
            y = -1 * maxHeight;
        } else {
            x = 0;
            y = -1 * (((colNum + rowNum) * 2 - index + 1) * gapY);
        }
        return cc.v2(x, y);
    };
    export let getManualInsertAvatarActivityStartDay = function () {
        let ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var config = ParamConfig.get(226);
        console.assert(config != null, 'can not find ParamConfig id = 226');
        return Number(config.content);
    };
    export let getManualInsertAvatarActivityEndDay = function () {
        
        let ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var config = ParamConfig.get(227);
        console.assert(config != null, 'can not find ParamConfig id = 227');
        return Number(config.content);
    };
}