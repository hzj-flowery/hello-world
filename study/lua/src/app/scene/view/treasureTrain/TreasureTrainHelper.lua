--
-- Author: Liangxu
-- Date: 2017-05-10 14:45:55
-- 宝物培养帮助类
local TreasureTrainHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")

local curTreasureId = 0


--检查功能开启
function TreasureTrainHelper.isOpen(funcId)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOpen, des = LogicCheckHelper.funcIsOpened(funcId)
	if not isOpen then
		G_Prompt:showTip(des)
		return false
	end
	return true
end

--检查是否达到了精炼的最大等级
function TreasureTrainHelper.checkIsReachRefineMaxLevel(data)
	local curLevel = data:getRefine_level()
	local maxLevel = data:getMaxRefineLevel()

	return curLevel >= maxLevel
end

-- 获取可显示的tab数量
function TreasureTrainHelper.getShowTreasureTrainTab()
    local TreasureConst = require("app.const.TreasureConst")
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local data = {}
	local curTreasureId = G_UserData:getTreasure():getCurTreasureId()
	local curUnitData = G_UserData:getTreasure():getTreasureDataWithId(curTreasureId)
    for index = 1, TreasureConst.TREASURE_TRAIN_MAX_TAB do
        if LogicCheckHelper.funcIsShow(FunctionConst["FUNC_TREASURE_TRAIN_TYPE" .. index]) then
            if index == TreasureConst.TREASURE_TRAIN_LIMIT then --
                if curUnitData:isCanLimitBreak() then
                    table.insert(data, index)
                end
            else
                table.insert(data, index)
            end
        end
    end
    
    return data
end

-- 是否有可装备和更好的玉石
function TreasureTrainHelper.haveBetterAndCanEquipJade(treasureId, jadeId, slot)
    local params = {}
    if jadeId and jadeId > 0 then
        params.jadeId = jadeId
    end
    if slot > 1 then
        params.property = 2
    else
        params.property = 1
    end
    local treasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
    if not treasureUnitData:isInBattle() then
        return false, false
    end
    params.equipBaseId = treasureUnitData:getBase_id()
    params.equipId = treasureId
    params.hideWear = true
    local jade = G_UserData:getJade()
    local jadeUnitData = jade:getJadeDataById(jadeId)
    local better = false
    local list = jade:getJadeListByEquip(params, FunctionConst.FUNC_TREASURE_TRAIN_TYPE3)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local _, heroBaseId = UserDataHelper.getHeroBaseIdWithTreasureId(treasureId)
    local isHave = TreasureTrainHelper._isHaveSuitable(heroBaseId, list, treasureUnitData)
    if jadeUnitData then
        if not jadeUnitData:isSuitableHero(heroBaseId) then
            better = #list > 0 and isHave
        end
        for i = 1, #list do
            if better then
                break
            end
            if
                list[i]:getConfig().color > jadeUnitData:getConfig().color and
                    not treasureUnitData:isHaveTwoSameJade(list[i]:getId()) and
                    list[i]:isSuitableHero(heroBaseId)
             then
                better = true
            end
        end
    end
    return #list > 0 and isHave, better
end


function TreasureTrainHelper._isHaveSuitable(heroBaseId, list, treasureUnitData)
    local isHave = false
    for i = 1, #list do
        if list[i]:isSuitableHero(heroBaseId) and not treasureUnitData:isHaveTwoSameJade(list[i]:getId()) then
            isHave = true
        end
    end
    return isHave
end

-- 获取装备玉石属性
function TreasureTrainHelper.getTreasureJadeAttr(unitData)
    local jades = unitData:getJades()
    local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
    local attrInfo = {}
    for i = 1, #jades do
        if jades[i] > 0 then
            local jadeUnitData = G_UserData:getJade():getJadeDataById(jades[i])
            local cfg = jadeUnitData:getConfig()
            local _, heroBaseId = jadeUnitData:getEquipHeroBaseId()
            local isSuitable = jadeUnitData:isSuitableHero(heroBaseId)
            table.insert(
                attrInfo,
                {
                    order = i,
                    type = cfg.type,
                    value = EquipJadeHelper.getRealAttrValue(cfg, G_UserData:getBase():getLevel()),
                    property = cfg.property,
                    description = cfg.description,
                    isSuitable = isSuitable
                }
            )
        end
    end
    table.sort(
        attrInfo,
        function(t1, t2)
            return t1.order > t2.order
        end
    )
    return attrInfo
end

-- 玉石红点
function TreasureTrainHelper.needJadeRedPoint(treasureId)
    local needRed = false
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3)
    if not isOpen then
        return needRed
    end
    local treasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
    if not treasureUnitData:isInBattle() then
        return needRed
    end
    local jades = treasureUnitData:getJades()
    local slotList = string.split(treasureUnitData:getConfig().inlay_type, "|")
    for i = 1, #jades do
        if tonumber(slotList[i]) > 0 then
            local isHave, haveBetter = TreasureTrainHelper.haveBetterAndCanEquipJade(treasureId, jades[i], i)
            if jades[i] == 0 then
                needRed = needRed or isHave
            end
            needRed = needRed or haveBetter
            if needRed then
                return needRed
            end
        end
    end
    return needRed
end


return TreasureTrainHelper