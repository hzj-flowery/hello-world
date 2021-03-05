local ExploreMapHelper = {}

ExploreMapHelper.DIR_UP = 1
ExploreMapHelper.DIR_DOWN = 2
ExploreMapHelper.DIR_LEFT = 3
ExploreMapHelper.DIR_RIGHT = 4

local Path = require("app.utils.Path")
local Explore = require("app.config.explore")
local ExploreDiscover = require("app.config.explore_discover")
local ExploreTreasure = require("app.config.explore_treasure")
local FragmentConfig = require("app.config.fragment")
local TreasureConfig = require("app.config.treasure")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

ExploreMapHelper.FIRST_SIZE = cc.size(165, 95)
ExploreMapHelper.LAST_SIZE = cc.size(165, 95)
ExploreMapHelper.NORMAL_SIZE = cc.size(130, 79)

ExploreMapHelper.DIR_TABLE =
{
    {0.5, 0.5}, {-0.5, -0.5}, {-0.5, 0.5}, {0.5, -0.5},
}

local Block =
{
    index = 0,
    posX = 0,
    posY = 0,
    type = 0,   --游历事件类型
    blockImagePath = nil,  -- 格子地板图片
    eventIconInfo = nil,    --游历事件信息
    treasureIconInfo = nil, -- 游历天降宝物信息
    isTreasure = nil,
    blockSprite = nil, --格子地板sprite对象
    icon = nil, --游历事件icon node对象
    size = ExploreMapHelper.NORMAL_SIZE
}

--type
-- type 事件类型  imageName 起点图片名称
function ExploreMapHelper.createFirstBlockData(posX, posY, type, blockImageName)
    local block = clone(Block)
    block.posX = posX
    block.posY = posY
    block.index = 1
    block.type = type
    block.size = ExploreMapHelper.FIRST_SIZE
    block.blockImagePath = Path.getExploreBlock(blockImageName)
    return block
end

function ExploreMapHelper.createEndBlockData(lastBlock, direction, type, blockImageName)
    local dir = tonumber(direction)
    local block = clone(Block)
    block.size = ExploreMapHelper.LAST_SIZE
    local posX = lastBlock.posX + block.size.width*ExploreMapHelper.DIR_TABLE[dir][1]
    local posY = lastBlock.posY + block.size.height*ExploreMapHelper.DIR_TABLE[dir][2]
    block.posX = posX
    block.posY = posY
    block.type = type
    block.index = lastBlock.index + 1
    block.blockImagePath = Path.getExploreBlock(blockImageName)
    return block
end


-- lastBlock 上一个格子信息  direction 方向  type 事件类型  exploreId 游历章节id
function ExploreMapHelper.generateBlockData(lastBlock, direction, type, exploreId, defaultBlockImageName)
    local dir = tonumber(direction)
    local block = clone(Block)
    local posX = lastBlock.posX + lastBlock.size.width*ExploreMapHelper.DIR_TABLE[dir][1]
    local posY = lastBlock.posY + lastBlock.size.height*ExploreMapHelper.DIR_TABLE[dir][2]
    block.posX = posX
    block.posY = posY
    block.type = type
    if type ~= 0 then
        local discoverData = ExploreDiscover.get(type)
        assert(discoverData, "type = "..type)
        block.blockImagePath = Path.getExploreBlock(discoverData.res_id)
        if ExploreMapHelper.isExploreTreasure(type) then
            --天降宝物信息
            block.treasureIconInfo = ExploreMapHelper._getExploreTreasureIconInfo(exploreId, type)
            block.isTreasure = true
        else
            --事件信息
            block.eventIconInfo = ExploreMapHelper._getExploreEventIconInfo(type)
        end
    else
        block.blockImagePath = Path.getExploreBlock(defaultBlockImageName)
    end
    block.index = lastBlock.index + 1
    return block
end

-- 游历事件 图标及名称
function ExploreMapHelper._getExploreEventIconInfo(type)
    -- body
    local discoverData = ExploreDiscover.get(type)
    local eventInfo = {}
    eventInfo.eventIconPath = Path.getExploreIconImage(discoverData.res_id2.."_icon")
    eventInfo.eventNamePath = Path.getExploreTextImage("txt_"..discoverData.res_id2)
    return eventInfo
end

-- 是否是游历跑图奖励 11---15
function ExploreMapHelper.isExploreTreasure(type)
    if type and type >= 11 and type <= 15 then
        return true
    end
    return false
end

-- 根据id获取游历名称
function ExploreMapHelper.getExploreNameById(id)
    local info = Explore.get(id)
    assert(info, "explore id = "..id)
    local name = info.name
    return name
end

-- 获取 游历 天降宝物 跑图奖励 展示 需要的相关数据
function ExploreMapHelper._getExploreTreasureIconInfo(exploreId, type)
    local treasureData = ExploreTreasure.get(exploreId)
    assert(treasureData, "exploreId = "..exploreId)
    local data = {}
    local tp
    local vaule
    -- type == 11 12 13 14 15游历事件type
    if type == 11 then
        data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover1_icon)
        tp = treasureData.discover1_rewardtype
        vaule = treasureData.discover1_rewardid
    elseif type == 12 then
        data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover2_icon)
        tp = treasureData.discover2_rewardtype
        vaule = treasureData.discover2_rewardid
    elseif type == 13 then
        data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover3_icon)
        tp = treasureData.discover3_rewardtype
        vaule = treasureData.discover3_rewardid
    elseif type == 14 then
        data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover4_icon)
        tp = treasureData.discover4_rewardtype
        vaule = treasureData.discover4_rewardid
    elseif type == 15 then
        data.treasureIconPath = Path.getExploreTreasureBigIcon(treasureData.discover5_icon)
        tp = treasureData.discover5_rewardtype
        vaule = treasureData.discover5_rewardid
    else
        assert(false, "type = "..type)
    end
    -- 如果是碎片
    if tp == TypeConvertHelper.TYPE_FRAGMENT then
        local config = FragmentConfig.get(vaule)
        assert(config ~= nil, "config = nil vaule = "..vaule)
        local treasureConfig = TreasureConfig.get(config.comp_value)
        assert(treasureConfig ~= nil, "treasureConfig = nil config.comp_value = "..config.comp_value)
        local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, config.comp_value)
        data.name = treasureConfig.name
        data.color = itemParams.icon_color
        data.color_outline = itemParams.icon_color_outline
    elseif tp == TypeConvertHelper.TYPE_TREASURE then
        local treasureConfig = TreasureConfig.get(vaule)
        assert(treasureConfig ~= nil, "treasureConfig is nil vaule = "..vaule)
        local itemParams = TypeConvertHelper.convert(tp, vaule)
        data.name = treasureConfig.name
        data.color = itemParams.icon_color
        data.color_outline = itemParams.icon_color_outline
    else
        assert(false, "unknow treasure type")
        data.name = ""
        data.color = Colors.BRIGHT_BG_ONE
        data.color_outline =  Colors.BRIGHT_BG_ONE
    end

    return data
end

return ExploreMapHelper
