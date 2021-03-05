local State = require("app.fight.states.State")
-- local StateFlash = require("app.fight.states.StateFlash")
local StateIdle = class("StateIdle", State)

local HeroSkillEffect = require("app.config.hero_skill_effect")
local BuffManager = require("app.fight.BuffManager")

--
function StateIdle:ctor(entity)
    self._buffAction = nil
    self._flashAction = nil

    local buffList = entity._buffList
    
    --如果有buff的情况，优先播放buff动作
 
    if not entity.isPet then
        for _, v in pairs(buffList) do
            local buffData = HeroSkillEffect.get(v.configId)
            if buffData.buff_action ~= "" then
                self._buffAction = buffData.buff_action --这里action改成moving
            end
            if buffData.flash_action ~= "" then
                self._flashAction = buffData.flash_action
            end
        end
    end

    StateIdle.super.ctor(self, entity)

    if self._entity.isPet then
        return
    end
    -- self._buffList = self._entity._buffManager:getBuffListByStageId(self._entity.stageID)
    -- self._buffList = entity._buffList
    self._hasCombineSkill = false
    if not self._entity.enterStage then
        self._bShowName = false
    end
end

--
function StateIdle:start()
    StateIdle.super.start(self)
    self._entity:setAction("idle", true)
    if self._entity.isPet then
        -- self._entity:fade(false)
        return
    end
    if self._buffAction then
        self._entity:setAction(self._buffAction, true)
    end
    if self._flashAction then 
        self._entity:doMoving(self._flashAction)
    end

    -- local buffList = self._entity._buffList
    -- --如果有buff的情况，优先播放buff动作
    -- for _, v in pairs(buffList) do
    --     local buffData = HeroSkillEffect.get(v.configId)
    --     if buffData.buff_action ~= "" then
    --         -- print("1112233 buff action = ",self._entity.stageID, buffData.buff_action)
    --         self._entity:setAction(buffData.buff_action, true)
    --     end
    -- end
end

--
function StateIdle:update(f)
    StateIdle.super.update(self)
    -- if self._entity.isPet then
    --     return
    -- end
    -- local hasCombineSkill = self._entity:checkCombineSkill()
    -- if hasCombineSkill ~= self._hasCombineSkill then
    --     self._hasCombineSkill = hasCombineSkill
    --     if self._hasCombineSkill then
    --         self._entity:setAction("idle2", true)
    --         self._entity:showIdle2Effect(true)
    --     else
    --         self._entity:setAction("idle", true)
    --         self._entity:showIdle2Effect(false)
    --     end
    -- end
end

function StateIdle:onFinish()
    if self._entity.stopMoving then 
        self._entity:stopMoving()
    end
    StateIdle.super.onFinish(self)
end

return StateIdle
