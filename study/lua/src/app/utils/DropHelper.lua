local DropHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

--检查掉落里面是否有一样的物品，然后插入表中
local function insertDropList(list, item)
    local needInsert = true
    for _, val in pairs(list) do
        if val.type == item.type and val.value == item.value then
            val.size = val.size + item.size
            needInsert = false
            break
        end
    end
    if needInsert then
        table.insert(list, item)
    end
    return list
end

--根据dropid获得dropList，并合并相同的物品
local function getReward(dropId)
    local dropData = require("app.config.drop").get(dropId)
    assert(dropData, "drop can't find id = " .. tostring(dropId))
    local dropList = {}
    for j = 1, 10 do
        local typeName = "type_" .. j
        local valueName = "value_" .. j
        local sizeName = "size_" .. j
        local item = {
            type = dropData[typeName],
            value = dropData[valueName],
            size = dropData[sizeName]
        }
        -- print("1112233 type = ", dropData[typeName], dropData[valueName], dropData[sizeName])
        if item.type ~= 0 then
            insertDropList(dropList, item)
        end
    end
    return dropList
end

--基本函数，根据id获得掉落奖励
function DropHelper.getDropReward(dropId)
    return getReward(dropId)
end

--爬塔掉落
function DropHelper.getTowerDrop(towerId, difficulty)
    local towerData = require("app.config.equip_stage").get(towerId)
    local dropId = towerData["team" .. difficulty .. "_drop"]
    local dropItemList = {}
    local reward = getReward(dropId)
    for _, item in pairs(reward) do
        if item.type ~= 0 then
            insertDropList(dropItemList, item)
        end
    end
    return dropItemList
end

--日常副本掉落
function DropHelper.getDailyDrop(dailyData)
    local StoryBox = require("app.config.story_box")
    local itemTotal = {
        type = 0,
        value = 0,
        size = 0
    }
    for i = 1, 6 do
        local dropName = "drop_" .. i
        local dropId = dailyData[dropName]
        local drop = StoryBox.get(dropId)
        for j = 1, 10 do
            local typeName = "type_" .. j
            local valueName = "value_" .. j
            local sizeName = "size_" .. j
            local item = {
                type = drop[typeName],
                value = drop[valueName],
                size = drop[sizeName]
            }
            if item.type ~= 0 then
                itemTotal.type = item.type
                itemTotal.value = item.value
                itemTotal.size = itemTotal.size + item.size
            end
        end
    end
    return itemTotal
end

--主线掉落
function DropHelper.getStageDrop(stageData)
    local dropList = {}
    for i = 1, 6 do
        local typeName = "type_" .. i
        local valueName = "value_" .. i
        local sizeName = "size_" .. i
        local item = {
            type = stageData[typeName],
            value = stageData[valueName],
            size = stageData[sizeName]
        }
        if item.type ~= 0 then
            insertDropList(dropList, item)
        end
    end
    local list = DropHelper.sortDropList(dropList)
    return list
end

--合并奖励物品，相同类型的，数量合并
function DropHelper.merageAwardList(awardList)
    local tempList = {}
    local retList = {}
    local function merageAward(award)
        local keyStr = award.type .. "|" .. award.value
        if tempList[keyStr] == nil then
            tempList[keyStr] = award.size
        else
            tempList[keyStr] = tempList[keyStr] + award.size
        end
    end

    for i, award in ipairs(awardList) do
        merageAward(award)
    end

    for key, value in pairs(tempList) do
        local array = string.split(key, "|")
        local award = {
            type = tonumber(array[1]),
            value = tonumber(array[2]),
            size = value
        }
        table.insert(retList, award)
    end
    return retList
end

--掉落排序
function DropHelper.sortDropList(dropList)
    for i, v in pairs(dropList) do
        if v.type == TypeConvertHelper.TYPE_HERO then
            v.importance = 1
        elseif v.type == TypeConvertHelper.TYPE_EQUIPMENT then
            v.importance = 2
        elseif v.type == TypeConvertHelper.TYPE_TREASURE then
            v.importance = 3
        elseif v.type == TypeConvertHelper.TYPE_SHENBING then
            v.importance = 4
        elseif v.type == TypeConvertHelper.TYPE_PET then
            v.importance = 5
        elseif v.type == TypeConvertHelper.TYPE_FRAGMENT then
            v.importance = 6
        elseif v.type == TypeConvertHelper.TYPE_RESOURCE and v.value == DataConst.RES_DIAMOND then
            v.importance = 7
        elseif v.type == TypeConvertHelper.TYPE_ITEM then
            v.importance = 8
        elseif v.type == TypeConvertHelper.TYPE_RESOURCE then
            v.importance = 9
        else
            v.importance = 10
        end
    end
    table.sort(
        dropList,
        function(a, b)
            if a.type == TypeConvertHelper.TYPE_FRAGMENT and b.type == TypeConvertHelper.TYPE_FRAGMENT then
                local aCfg = TypeConvertHelper.convert(a.type, a.value, a.size).cfg
                local bCfg = TypeConvertHelper.convert(b.type, b.value, b.size).cfg
                if aCfg.comp_type == bCfg.comp_type then
                    return aCfg.color > bCfg.color
                else
                    return aCfg.comp_type < bCfg.comp_type
                end
            elseif TypeConvertHelper.getTypeClass(a.type) == nil or TypeConvertHelper.getTypeClass(b.type) == nil then
                return false
            elseif a.type == b.type then
                local aCfg = TypeConvertHelper.convert(a.type, a.value, a.size).cfg
                local bCfg = TypeConvertHelper.convert(b.type, b.value, b.size).cfg
                if a.type == TypeConvertHelper.TYPE_TITLE then
                    return aCfg.colour > bCfg.colour
                else
                    return aCfg.color > bCfg.color
                end
            else
                return a.importance < b.importance
            end
        end
    )
    return dropList
end

-- TypeConvertHelper.TYPE_POWER              = -1           -- 战力
-- TypeConvertHelper.TYPE_HERO               = 1            -- 武将
-- TypeConvertHelper.TYPE_EQUIPMENT          = 2            -- 装备
-- TypeConvertHelper.TYPE_TREASURE           = 3            -- 宝物
-- TypeConvertHelper.TYPE_SHENBING           = 4            -- 神兵
-- TypeConvertHelper.TYPE_RESOURCE           = 5            -- 资源
-- TypeConvertHelper.TYPE_ITEM               = 6            -- 道具
-- TypeConvertHelper.TYPE_FRAGMENT           = 7            -- 碎片

--爬塔精英掉落
function DropHelper.getTowerSuperDrop(stageData)
    local dropList = {}
    for i = 1, 6 do
        local typeName = "type_" .. i
        local valueName = "value_" .. i
        local sizeName = "size_" .. i
        local item = {
            type = stageData[typeName],
            value = stageData[valueName],
            size = stageData[sizeName]
        }
        if item.type ~= 0 then
            insertDropList(dropList, item)
        end
    end
    local list = DropHelper.sortDropList(dropList)
    return list
end

return DropHelper
