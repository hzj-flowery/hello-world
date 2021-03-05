local BaseData = require("app.data.BaseData")
local UIGuideData = class("UIGuideData", BaseData)
local StoryStageGuide = require("app.config.story_stage_guide")
local UIGuideUnitData = import(".UIGuideUnitData")
local schema = {}
UIGuideData.schema = schema
function UIGuideData:ctor(properties)
    UIGuideData.super.ctor(self, properties)
end

--清除
function UIGuideData:clear()
end

function UIGuideData:reset()
end

function UIGuideData:hasUIGuide(guideType,paramValue)
    local cfg = self:findCfg(guideType,paramValue)
    if not cfg then
        return false
    end
    return true
end

function UIGuideData:needShowGuide(guideType,paramValue)
    local cfg = self:findCfg(guideType,paramValue)
    if not cfg then
        return false
    end

    local level = G_UserData:getBase():getLevel() 
    if level < cfg.level_min or level > cfg.level_max then
        return false
    end
    
    return true
end

function UIGuideData:findCfg(guideType,paramValue)
    paramValue = paramValue or 0
    local level = G_UserData:getBase():getLevel() 
    local guideCfg = nil
    for i = 1,StoryStageGuide.length(),1 do
        local cfg = StoryStageGuide.indexOf(i)
        if cfg.type == guideType and  cfg.value == paramValue then
            guideCfg =  cfg
            break
        end
    end
   return guideCfg
end

function UIGuideData:createUIGuideUnitData(guideType,paramValue)
    local guideCfg = self:findCfg(guideType,paramValue)
    local unitData = UIGuideUnitData.new()
    unitData:initData(guideCfg)
    return unitData
end


return UIGuideData