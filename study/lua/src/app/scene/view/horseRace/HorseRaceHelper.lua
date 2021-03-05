local HorseRaceHelp = {}
local HorseTuRes = require("app.scene.view.horseRace.raceConfig.horse_tu_res")
local HorseRaceConst = require("app.const.HorseRaceConst")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local HorseRaceRewardMax = require("app.config.horse_race_reward_max")

local Zmax = 1000

local yMax = 16         --层数定的y是16格
local HorseRaceMapEndId = 75

local strBlock = 
{
    type = 0,           --类型
    blockX = 0,         --x轴格数
    blockY = 0,         --y轴格数
    res = "",           --资源
    resType = "",       --资源类型
    width = 0,          --宽度
    height = 0,         --高度
    mapPos = cc.p(0, 0),        --地图上的坐标
    zOrder = 0,         --层级
    point = 0,          --得分
    mapRes = nil,       --资源
    isGet = false,      --是否已经获得积分
    moveX = 0,          --图片偏移x
}


function HorseRaceHelp.getMapConfigById(id)
    local config = require("app.scene.view.horseRace.raceConfig.horse_tu_"..id)
    assert(config, "horse_tu_"..id.." not found!!")
    return config
end

function HorseRaceHelp.getMapBGConfigById(id)
    local config = require("app.scene.view.horseRace.raceConfig.horse_tu_"..id.."_bg")
    assert(config, "horse_tu_"..id.."_bg not found!!")
    return config
end

function HorseRaceHelp.getMapWidthBlock(id)
    local config = HorseRaceHelp.getMapConfigById(id)
    return config.length()
end

function HorseRaceHelp.isRewardFull()
    local soul = G_UserData:getHorseRace():getHorseSoul()
    local book = G_UserData:getHorseRace():getHorseBook()

    local buffDatas = G_UserData:getHomeland():getBuffDatasWithBaseId(6) -- 马跃檀溪获得额外相马经buff
    local extraAdd = 0
    
    if #buffDatas ~= 0 then
		extraAdd = buffDatas[1]:getConfig().value
	end

    for i = 1, HorseRaceRewardMax.length() do 
        local data = HorseRaceRewardMax.indexOf(i)
        if data.type == TypeConvertHelper.TYPE_RESOURCE and data.value == DataConst.RES_HORSE_SOUL then 
            if soul < data.size then 
                return false
            end
        elseif data.type == TypeConvertHelper.TYPE_ITEM and data.value == DataConst.ITEM_HORSE_CLASSICS then
            if book < data.size + extraAdd then 
                return false
            end
        end
    end
    return true
end

function HorseRaceHelp.getBlockInfo(id, type)
    local function getBlockRes(resId)
        local resData = HorseTuRes.get(resId)
        return tonumber(resData.type), resData.res, resData.restype, resData.width, resData.height, Zmax - resData.order, resData.point, resData.x
    end

    local blocks = {}
    local mapWidth = 0
    local config = nil
    if type == HorseRaceConst.CONFIG_TYPE_MAP then 
        config = HorseRaceHelp.getMapConfigById(id)
    elseif type == HorseRaceConst.CONFIG_TYPE_MAP_BG then 
        config = HorseRaceHelp.getMapBGConfigById(id)
    end
    for i = 1, config.length() do 
        local data = config.indexOf(i)
        for j = 1, yMax do 
            local yIndex = "Y"..j
            if data[yIndex] ~= 0 then 
                local block = clone(strBlock)
                block.blockX = i 
                block.blockY = j 
                local resId = tonumber(data[yIndex])
                local lastBlockX = 0
                block.type, block.res, block.resType, block.width, block.height, block.zOrder, block.point, block.moveX = getBlockRes(resId)  
                if resId == HorseRaceMapEndId then
                    mapWidth = (block.blockX-1) * HorseRaceConst.BLOCK_WIDTH + block.width
                end             
                table.insert(blocks, block)
            end
        end
    end
    
    table.sort(blocks, function(a, b) return a.blockX < b.blockX end)

    return blocks, mapWidth
end

return HorseRaceHelp