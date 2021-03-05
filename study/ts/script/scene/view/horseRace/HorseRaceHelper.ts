import { G_UserData, G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { clone } from "../../../utils/GlobleFunc";
import { HorseRaceConst } from "../../../const/HorseRaceConst";
import { ArraySort } from "../../../utils/handler";

let Zmax = 1000;
let yMax = 16;
let HorseRaceMapEndId = 75;
let strBlock = {
    type: 0,
    blockX: 0,
    blockY: 0,
    res: '',
    resType: '',
    width: 0,
    height: 0,
    mapPos: cc.v2(0, 0),
    zOrder: 0,
    point: 0,
    mapRes: null,
    isGet: false,
    moveX: 0
};
export namespace HorseRaceHelper {
    export function getMapConfigById(id) {
        let config = G_ConfigLoader.getConfig('horse_tu_' + id);
        return config;
    };
    export function getMapBGConfigById(id) {
        let config = G_ConfigLoader.getConfig('horse_tu_' + id + '_bg');
        return config;
    };
    export function getMapWidthBlock(id) {
        let config = HorseRaceHelper.getMapConfigById(id);
        return config.length();
    };
    export function isRewardFull() {
        let soul = G_UserData.getHorseRace().getHorseSoul();
        let book = G_UserData.getHorseRace().getHorseBook();

        var buffDatas = G_UserData.getHomeland().getBuffDatasWithBaseId(6) ;
        var extraAdd = 0;
        if (buffDatas.length != 0) {
            extraAdd = buffDatas[0].getConfig().value;
        }
        let HorseRaceRewardMax = G_ConfigLoader.getConfig(ConfigNameConst.HORSE_RACE_REWARD_MAX);
        for (let i = 0; i < HorseRaceRewardMax.length(); i++) {
            let data = HorseRaceRewardMax.indexOf(i);
            if (data.type == TypeConvertHelper.TYPE_RESOURCE && data.value == DataConst.RES_HORSE_SOUL) {
                if (soul < data.size) {
                    return false;
                }
            } else if (data.type == TypeConvertHelper.TYPE_ITEM && data.value == DataConst.ITEM_HORSE_CLASSICS) {
                if (book < data.size + extraAdd) {
                    return false;
                }
            }
        }
        return true;
    };
    export function getBlockInfo(id, type):any[] {
        function getBlockRes(resId) {
            let HorseTuRes = G_ConfigLoader.getConfig(ConfigNameConst.HORSE_TU_RES);
            let resData = HorseTuRes.get(resId);
            return [
                Number(resData.type),
                resData.res,
                resData.restype,
                resData.width,
                resData.height,
                Zmax - resData.order,
                resData.point,
                resData.x
            ];
        }
        let blocks = [];
        let mapWidth = 0;
        let config = null;
        if (type == HorseRaceConst.CONFIG_TYPE_MAP) {
            config = HorseRaceHelper.getMapConfigById(id);
        } else if (type == HorseRaceConst.CONFIG_TYPE_MAP_BG) {
            config = HorseRaceHelper.getMapBGConfigById(id);
        }
        for (let i = 0; i < config.length(); i++) {
            let data = config.indexOf(i);
            for (let j = 1; j <= yMax; j++) {
                let yIndex = 'Y' + j;
                if (data[yIndex] != 0) {
                    let block = clone(strBlock);
                    block.blockX = i + 1;
                    block.blockY = j;
                    let resId = Number(data[yIndex]);
                    let lastBlockX = 0;
                    [block.type, block.res, block.resType, block.width, block.height, block.zOrder, block.point, block.moveX] = getBlockRes(resId);
                    if (resId == HorseRaceMapEndId) {
                        mapWidth = (block.blockX - 1) * HorseRaceConst.BLOCK_WIDTH + block.width;
                    }
                    blocks.push(block);
                }
            }
        }
        ArraySort(blocks, function (a, b) {
            return a.blockX < b.blockX;
        });
        return [
            blocks,
            mapWidth
        ];
    };

};