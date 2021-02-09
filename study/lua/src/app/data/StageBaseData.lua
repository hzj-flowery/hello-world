local BaseData = require("app.data.BaseData")
local StageBaseData = class("ChapterData", BaseData)
local StoryStage = require("app.config.story_stage")

local schema = {}
schema["id"] 			                    = {"number", 0}
schema["star"] 			                    = {"number", 0}
schema["execute_count"] 			    	= {"number", 0}
schema["is_finished"] 			            = {"boolean", false}
schema["reset_count"]                    	= {"number", 0}
schema["receive_box"] 			        	= {"boolean", false}
schema["configData"]						= {"table", {}}
schema["killer"]							= {"string", ""}
schema["killerId"]							= {"number", 0}
StageBaseData.schema = schema

function StageBaseData:ctor(properties)
    StageBaseData.super.ctor(self, properties)
end

function StageBaseData:clear()
end

function StageBaseData:reset()
end

function StageBaseData:updateData(data)
	self:backupProperties()
	self:setProperties(data)
	local starOld = self:getLastStar()
	local starNew = data.star
	local star = G_UserData:getChapter():getTotal_star()
	star = star - starOld + starNew
	G_UserData:getChapter():setTotal_star(star)
end

function StageBaseData:getDropHintDatas()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local DropHelper = require("app.utils.DropHelper")
    local UserDataHelper = require("app.utils.UserDataHelper")
    local heroList = {}
  
	local stageCfg = self:getConfigData()
	local isFinish = self:isIs_finished()
	local awards = DropHelper.getStageDrop(stageCfg)
	if isFinish then
		for k,v in ipairs(awards) do
			if v.type == TypeConvertHelper.TYPE_HERO or v.type == TypeConvertHelper.TYPE_FRAGMENT
				or v.type == TypeConvertHelper.TYPE_EQUIPMENT
				then
				local reward = clone(v)
                heroList[v.type.."_"..v.value] = reward
                reward.order =  stageCfg.id * 10 + k
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
            if  G_UserData:getTeam():isInBattleWithBaseId(baseId) or UserDataHelper.isHaveKarmaWithHeroBaseId(baseId) or
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

return StageBaseData
