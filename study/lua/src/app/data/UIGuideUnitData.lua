
local StoryStageGuide = require("app.config.story_stage_guide")
local BaseData = import(".BaseData")
local UIGuideUnitData = class("UIGuideUnitData", BaseData)
local schema = {}
schema["id"] = {"number", 0}
schema["config"] = {"table", {}} --配置表信息
UIGuideUnitData.schema = schema

function UIGuideUnitData:ctor(properties)
	UIGuideUnitData.super.ctor(self, properties)
end


--清除
function UIGuideUnitData:clear()
end

function UIGuideUnitData:reset()
end


function UIGuideUnitData:initData(cfg)
    self:setId(cfg.id)
    self:setConfig(cfg)
end

function UIGuideUnitData:isLevelEnough()
    local cfg = self:getConfig()
    local level = G_UserData:getBase():getLevel() 
    if level < cfg.level_min and level > cfg.level_max then
        return false
    end
     return true
end


return UIGuideUnitData