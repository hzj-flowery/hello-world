local HeroGoldHelper = {}

-- 是否为纯金将
function HeroGoldHelper.isPureHeroGold(heroUnitData)
    local isColor = heroUnitData:getConfig().color == 7
    local isLeader = heroUnitData:isLeader()
    return isColor and not isLeader and heroUnitData:getLimit_level() == 0
end

-- 金将养成消耗材料
function HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)
    if not HeroGoldHelper.isPureHeroGold(heroUnitData) then
        return
    end
    local goldLevel = heroUnitData:getRank_lv()
    local costInfo = HeroGoldHelper.getCostConfig(goldLevel)
    return costInfo, heroUnitData:getBase_id()
end

function HeroGoldHelper.heroGoldCanRankUp(heroUnitData)
    if not HeroGoldHelper.isPureHeroGold(heroUnitData) then
        return false
    end
    local HeroConst = require("app.const.HeroConst")
    if heroUnitData:getRank_lv() >= HeroConst.HERO_GOLD_MAX_RANK then
        return false
    end
    local costInfo = HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)
    local LimitCostConst = require("app.const.LimitCostConst")
    local isCan = true
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local UserDataHelper = require("app.utils.UserDataHelper")
    local oweCount =
        UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, heroUnitData:getBase_id(), heroUnitData:getId())
    for key = LimitCostConst.LIMIT_COST_KEY_1, LimitCostConst.LIMIT_COST_KEY_4 do
        local curCount = heroUnitData:getGoldResValue(key)
        if key == LimitCostConst.LIMIT_COST_KEY_1 then
            isCan = isCan and oweCount >= costInfo["cost_hero"]
        else
            isCan = isCan and curCount >= costInfo["size_" .. key]
        end
    end
    return isCan
end

function HeroGoldHelper.getCostConfig(rank_lv)
    local costInfo = require("app.config.gold_hero_train").get(rank_lv)
    assert(costInfo, "gold_hero_train not found config by " .. rank_lv)
    return costInfo
end

function HeroGoldHelper.isHaveCanFullMaterialsByKey(key, heroUnitData)
    local costInfo = HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)
    local LimitCostConst = require("app.const.LimitCostConst")
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    if key == LimitCostConst.LIMIT_COST_KEY_1 then
        local allCount =
            require("app.utils.UserDataHelper").getSameCardCount(
            TypeConvertHelper.TYPE_HERO,
            heroUnitData:getBase_id(),
            heroUnitData:getId()
        )
        return allCount >= costInfo["cost_hero"], allCount >= costInfo["cost_hero"]
    elseif key == LimitCostConst.LIMIT_COST_KEY_2 then
        local ownExp = heroUnitData:getGoldResValue(key)
        local DataConst = require("app.const.DataConst")
        local curExp = ownExp
        for j = 1, 4 do
            local count =
                require("app.utils.UserDataHelper").getNumByTypeAndValue(
                TypeConvertHelper.TYPE_ITEM,
                DataConst["ITEM_HERO_LEVELUP_MATERIAL_" .. j]
            )
            local itemValue = require("app.config.item").get(DataConst["ITEM_HERO_LEVELUP_MATERIAL_" .. j]).item_value
            local itemExp = count * itemValue
            ownExp = ownExp + itemExp
        end
        return curExp >= costInfo["size_" .. key], ownExp >= costInfo["size_" .. key]
    else
        local curCount = heroUnitData:getGoldResValue(key)
        local allCount =
            require("app.utils.UserDataHelper").getNumByTypeAndValue(
            costInfo["type_" .. key],
            costInfo["value_" .. key]
        ) + curCount
        return curCount >= costInfo["size_" .. key], allCount >= costInfo["size_" .. key]
    end
end

function HeroGoldHelper.heroGoldNeedRedPoint(heroUnitData)
    local HeroConst = require("app.const.HeroConst")
    if heroUnitData:getRank_lv() >= HeroConst.HERO_GOLD_MAX_RANK then
        return false, false
    end
    local costInfo = HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)
    if not costInfo then
        return false, false
    end
    local silver = costInfo["break_size"]
    local UserDataHelper = require("app.utils.UserDataHelper")
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2) -- 银币数量
    local isFull = HeroGoldHelper.heroGoldCanRankUp(heroUnitData)
    if isFull then
        return haveCoin >= silver, haveCoin >= silver
    else
        local LimitCostConst = require("app.const.LimitCostConst")
        local isAnyCanFull = false
        local isAllCanFull = true
        for key = LimitCostConst.LIMIT_COST_KEY_1, LimitCostConst.LIMIT_COST_KEY_4 do
            local isOneFull, isCanFull = HeroGoldHelper.isHaveCanFullMaterialsByKey(key, heroUnitData)
            isAnyCanFull = isAnyCanFull or (isCanFull and not isOneFull)
            isAllCanFull = isAllCanFull and isCanFull
        end
        return isAnyCanFull, isAllCanFull
    end
end

function HeroGoldHelper.getHeroIconRes(baseId)
    local HeroDataHelper = require("app.utils.data.HeroDataHelper")
    local heroInfo = HeroDataHelper.getHeroConfig(baseId)
    local heroResInfo = HeroDataHelper.getHeroResConfig(heroInfo.res_id)
    local heroIconRes = heroResInfo.gold_hero_icon
    return heroIconRes
end

function HeroGoldHelper.getHeroNameRes(baseId)
    local HeroDataHelper = require("app.utils.data.HeroDataHelper")
    local heroInfo = HeroDataHelper.getHeroConfig(baseId)
    local heroResInfo = HeroDataHelper.getHeroResConfig(heroInfo.res_id)
    local heroNameRes = heroResInfo.gold_hero_name
    return heroNameRes
end

return HeroGoldHelper
