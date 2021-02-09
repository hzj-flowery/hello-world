import { Path } from "../../../utils/Path"
import { assert } from "../../../utils/GlobleFunc"
import { Color } from "../../../utils/Color"
import { G_ConfigLoader } from "../../../init"
import { ConfigNameConst } from "../../../const/ConfigNameConst"
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper"

export class ExploreMapHelper {
    static DIR_UP = 1
    static DIR_DOWN = 2
    static DIR_LEFT = 3
    static DIR_RIGHT = 4
    static FIRST_SIZE = cc.size(165, 95)
    static LAST_SIZE = cc.size(165, 95)
    static NORMAL_SIZE = cc.size(130, 79)
    static DIR_TABLE = [
        [0.5, 0.5],
        [-0.5, -0.5],
        [-0.5, 0.5],
        [0.5, -0.5]
    ]
    static Block =
        {
            index: 0,
            posX: 0,
            posY: 0,
            type: 0,   //游历事件类型
            blockImagePath: null,  // 格子地板图片
            eventIconInfo: null,    //游历事件信息
            treasureIconInfo: null, // 游历天降宝物信息
            isTreasure: false,
            blockSprite: null, //格子地板sprite对象
            icon: null, //游历事件icon node对象
            size: ExploreMapHelper.NORMAL_SIZE
        }

    static cloneBlock() {
        var obj = {};
        for (var key in ExploreMapHelper.Block) {
            obj[key] = ExploreMapHelper.Block[key];
        }
        return obj;
    }

    //type
    // type 事件类型  imageName 起点图片名称
    static createFirstBlockData(posX, posY, type, blockImageName) {
        var block: any = ExploreMapHelper.cloneBlock();
        block.index = 0;
        block.posX = posX;
        block.posY = posY;
        block.type = type;
        block.size = ExploreMapHelper.FIRST_SIZE;
        block.blockImagePath = Path.getExploreBlock(blockImageName);
        return block;
    }
    static createEndBlockData(lastBlock, direction, type, blockImageName) {
        var dir = direction;
        var block: any = ExploreMapHelper.cloneBlock();
        block.size = ExploreMapHelper.LAST_SIZE;
        var posX = lastBlock.posX + block.size.width * ExploreMapHelper.DIR_TABLE[dir-1][0];
        var posY = lastBlock.posY + block.size.height * ExploreMapHelper.DIR_TABLE[dir-1][1];
        block.posX = posX;
        block.posY = posY;
        block.type = type;
        block.index = lastBlock.index + 1;
        block.blockImagePath = Path.getExploreBlock(blockImageName);
        return block;
    }
    // lastBlock 上一个格子信息  direction 方向  type 事件类型  exploreId 游历章节id
    static generateBlockData(lastBlock, direction, type, exploreId, defaultBlockImageName) {
        var dir = direction;
        var block: any = ExploreMapHelper.cloneBlock();
        var posX = lastBlock.posX + lastBlock.size.width * ExploreMapHelper.DIR_TABLE[dir - 1][0];
        var posY = lastBlock.posY + lastBlock.size.height * ExploreMapHelper.DIR_TABLE[dir - 1][1];
        block.posX = posX;
        block.posY = posY;
        block.type = type;
        if (type != 0) {
            var discoverData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(type);
          //assert((discoverData, 'type = ' + type);
            block.blockImagePath = Path.getExploreBlock(discoverData.res_id);
            if (ExploreMapHelper.isExploreTreasure(type)) {
                block.treasureIconInfo = ExploreMapHelper._getExploreTreasureIconInfo(exploreId, type);
                block.isTreasure = true;
            } else {
                block.eventIconInfo = ExploreMapHelper._getExploreEventIconInfo(type);
            }
        } else {
            block.blockImagePath = Path.getExploreBlock(defaultBlockImageName);
        }
        block.index = lastBlock.index + 1;
        return block;
    }
    // 游历事件 图标及名称
    static _getExploreEventIconInfo(type) {
        var discoverData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(type);
        var eventInfo: any = {};
        eventInfo.eventIconPath = Path.getExploreIconImage(discoverData.res_id2 + '_icon');
        eventInfo.eventNamePath = Path.getExploreTextImage('txt_' + discoverData.res_id2);
        return eventInfo;
    }
    // 是否是游历跑图奖励 11//-15
    static isExploreTreasure(type) {
        if (type && type >= 11 && type <= 15) {
            return true;
        }
        return false;
    }

    static getExploreNameById = function (id) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE).get(id);
        var name = info.name;
        return name;
    };
    // 获取 游历 天降宝物 跑图奖励 展示 需要的相关数据
    static _getExploreTreasureIconInfo(exploreId, type) {
        var treasureData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_TREASURE).get(exploreId);
      //assert((treasureData, 'exploreId = ' + exploreId);
        var data: any = {};
        var tp;
        var vaule;
        if (type == 11) {
            data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover1_icon);
            tp = treasureData.discover1_rewardtype;
            vaule = treasureData.discover1_rewardid;
        } else if (type == 12) {
            data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover2_icon);
            tp = treasureData.discover2_rewardtype;
            vaule = treasureData.discover2_rewardid;
        } else if (type == 13) {
            data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover3_icon);
            tp = treasureData.discover3_rewardtype;
            vaule = treasureData.discover3_rewardid;
        } else if (type == 14) {
            data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover4_icon);
            tp = treasureData.discover4_rewardtype;
            vaule = treasureData.discover4_rewardid;
        } else if (type == 15) {
            data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover5_icon);
            tp = treasureData.discover5_rewardtype;
            vaule = treasureData.discover5_rewardid;
        } else {
          //assert((false, 'type = ' + type);
        }
        if (tp == TypeConvertHelper.TYPE_FRAGMENT) {
            var config = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT).get(vaule);
          //assert((config != null, 'config = nil vaule = ' + vaule);
            var treasureConfig = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(config.comp_value);
          //assert((treasureConfig != null, 'treasureConfig = nil config.comp_value = ' + config.comp_value);
            var itemParams: any = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, config.comp_value);
            data.name = treasureConfig.name;
            data.color = itemParams.icon_color;
            data.color_outline = itemParams.icon_color_outline;
        } else if (tp == TypeConvertHelper.TYPE_TREASURE) {
            var treasureConfig = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(vaule);
          //assert((treasureConfig != null, 'treasureConfig is nil vaule = ' + vaule);
            var itemParams = TypeConvertHelper.convert(tp, vaule);
            data.name = treasureConfig.name;
            data.color = itemParams.icon_color;
            data.color_outline = itemParams.icon_color_outline;
        } else {
          //assert((false, 'unknow treasure type');
            data.name = '';
            data.color = Color.BRIGHT_BG_ONE;
            data.color_outline = Color.BRIGHT_BG_ONE;
        }
        return data;
    }

}