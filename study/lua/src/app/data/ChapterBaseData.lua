local BaseData = require("app.data.BaseData")
local ChapterBaseData = class("ChapterBaseData", BaseData)

local schema = {}
schema["id"] 			                    = {"number", 0}
schema["breward"] 			                = {"number", 0}
schema["sreward"] 			                = {"number", 0}
schema["greward"]                           = {"number", 0}
schema["preward"]                           = {"number", 0}
schema["has_entered"]   		            = {"boolean", false}
schema["showEnding"]                        = {"boolean", false}    --是否需要展示ending
schema["configData"]                        = {"table", {}}
schema["stageIdList"]                       = {"table", {}}
schema["bossId"]                            = {"number", 0}
schema["bossState"]                         = {"number", 0}     --0， 没死， 1， 死了
schema["showRunningMap"]                    = {"boolean", false}    --是否需要展示跑图
ChapterBaseData.schema = schema

function ChapterBaseData:ctor(properties)
    ChapterBaseData.super.ctor(self, properties)
end

function ChapterBaseData:clear()

end

function ChapterBaseData:reset()

end

function ChapterBaseData:updateData(data)
    self:setProperties(data)
end

function ChapterBaseData:isLastStagePass()
    local stageData = G_UserData:getStage()
    local list = self:getStageIdList()
    local stage = stageData:getStageById(list[#list])
    if stage:getStar() ~= 0 then
        return true
    end
    return false
end

function ChapterBaseData:getChapterStar()
    local stageData = G_UserData:getStage()
    local list = self:getStageIdList()
    local totalStar = 0
    for _, id in pairs(list) do
        local stage = stageData:getStageById(id)
        local star = stage:getStar()
        totalStar = totalStar + star
    end
    return totalStar
end

function ChapterBaseData:getOpenStage()
    local stageData = G_UserData:getStage()
    local list = self:getStageIdList()
    local openList = {}
    local stage = stageData:getStageById(list[1])
    table.insert(openList, stage)
    for i, v in pairs(list) do
        local stage = stageData:getStageById(v)
        if stage:getStar() ~= 0 then
            local nextId = stage:getConfigData().next_id
            local isInChapter = false
            for _, id in pairs(list) do
                if nextId == id then
                    isInChapter = true
                    break
                end
            end
            if isInChapter then
                local nextStage = stageData:getStageById(nextId)
                table.insert(openList, nextStage)
            end
        end
    end
    return openList
end


function ChapterBaseData:canGetStageBoxReward()
    local stageData = G_UserData:getStage()
    local list = self:getStageIdList()
    for i, v in pairs(list) do
        local stage = stageData:getStageById(v)
        local stageCfg = stage:getConfigData()
        if stageCfg.box_id ~= 0 then
            local isPass = stage:isIs_finished()
            local isGet = stage:isReceive_box()
            local canGet = isPass and not isGet
            if canGet then
                return true
            end
        end
    end
    return false
end

function ChapterBaseData:canGetStarBox()
    local stars = self:getChapterStar()
    local chapterInfo = self:getConfigData()
    if stars >= chapterInfo.copperbox_star and chapterInfo.copperbox_star > 0
        and self:getBreward() == 0 then
        return true
    elseif stars >= chapterInfo.silverbox_star and chapterInfo.silverbox_star > 0
        and self:getSreward() == 0  then
        return true
    elseif stars >= chapterInfo.goldbox_star and chapterInfo.goldbox_star > 0
        and self:getGreward() == 0  then
        return true
    end
	--通关宝箱
	if self:isLastStagePass() and self:getPreward() == 0 then
		return true
	end

    return false
end

function ChapterBaseData:needShowEndStory()
    local stages = self:getStageIdList()
    local stageId = stages[#stages]
    local stageData = G_UserData:getStage():getStageById(stageId)
    if stageData:isIs_finished() and self:isShowEnding() then
        return true
    end
    return false
end

--获得本章节星数
function ChapterBaseData:getChapterFinishState()
    local isFinish = true
    local totalStar = 0
	local getStar = 0
    local stageList = self:getStageIdList()
	for _, val in pairs(stageList) do
		local stageData = G_UserData:getStage():getStageById(val)
		if stageData then
			if not stageData:isIs_finished() then
				isFinish = false
			end
			getStar = getStar + stageData:getStar()
		end
		totalStar = totalStar + 3
	end
    return isFinish, getStar, totalStar
end

--TODO 性能优化（上阵和关卡通关影响掉落数据）
function ChapterBaseData:getDropHintDatas()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local DropHelper = require("app.utils.DropHelper")
    local UserDataHelper= require("app.utils.UserDataHelper")
    local stageData = G_UserData:getStage()
    local list = self:getStageIdList()
    local heroList = {}
    for i, v in pairs(list) do
        local stage = stageData:getStageById(v)
        local stageCfg = stage:getConfigData()
        local isFinish = stage:isIs_finished()
        local awards = DropHelper.getStageDrop(stageCfg)
        if isFinish then
            for k,v in ipairs(awards) do
                if v.type == TypeConvertHelper.TYPE_HERO or v.type == TypeConvertHelper.TYPE_FRAGMENT
                 or v.type == TypeConvertHelper.TYPE_EQUIPMENT
                 then
                    local reward = clone(v)
                    heroList[v.type.."_"..v.value] = reward
                    reward.order = stageCfg.id * 10 + k
                end
            end
        end
    end
    local Hero = require("app.config.hero")
    local heroRewardList = {}
    for k,v in pairs(heroList) do
        local baseId = 0
        local equipId = 0
         v.isEquip = false
        if v.type == TypeConvertHelper.TYPE_HERO then
            baseId = v.value
        elseif v.type == TypeConvertHelper.TYPE_FRAGMENT then
            local param = TypeConvertHelper.convert(v.type, v.value, v.size)
            baseId = param.cfg.comp_type == TypeConvertHelper.TYPE_HERO and param.cfg.comp_value or 0--武将碎片
            equipId = param.cfg.comp_type == TypeConvertHelper.TYPE_EQUIPMENT and param.cfg.comp_value or 0--装备碎片
        elseif v.type == TypeConvertHelper.TYPE_EQUIPMENT then
            equipId = v.value
        end

        if baseId > 0 then
            local heroConfig = Hero.get(baseId)
            assert(heroConfig, string.format("hero config can not find id = %d", baseId))
            if G_UserData:getTeam():isInBattleWithBaseId(baseId) or UserDataHelper.isHaveKarmaWithHeroBaseId(baseId) or
                 UserDataHelper.isShowYokeMark(baseId) or
                heroConfig.color >= 6 then--红色武将，则永久展示
              table.insert(heroRewardList,v)
            end
        end
        if equipId > 0 and UserDataHelper.isNeedEquipWithBaseId(equipId) then
            v.isEquip = true
            table.insert(heroRewardList,v)
        end
    end
    --掉落展示排列规则：先装备，再武将,再按照关卡循序
    local sortFunc = function(v1,v2)
        if v1.isEquip ~= v2.isEquip then
            return v1.isEquip
        end
        return v1.order <  v2.order
    end
    table.sort(heroRewardList,sortFunc)
    return heroRewardList
end

return ChapterBaseData
