-- @Author  panhoa
-- @Date  2.18.2019
-- @Role 

local BaseData = require("app.data.BaseData")
local GuildCrossWarBossUnitData = class("GuildCrossWarBossUnitData", BaseData)
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")


local schema = {}
schema["id"]                = {"number", 0}     --据点ID
schema["hp"]                = {"number", 0}     --据点boss血量
schema["max_hp"]            = {"number", 0}     --据点boss最大血量
schema["config"]            = {"table", {}}     --据点Boss配置
schema["guild_name"]        = {"string", ""}    --据点占领军团
schema["is_kill"]           = {"boolean", false} --boss是否被击杀

GuildCrossWarBossUnitData.schema = schema
function GuildCrossWarBossUnitData:ctor(properties)
    GuildCrossWarBossUnitData.super.ctor(self, properties)
end

function GuildCrossWarBossUnitData:clear()
end

function GuildCrossWarBossUnitData:reset()
end

-- @Role    Update Data
function GuildCrossWarBossUnitData:updateData(data)
    self:setProperties(data)
end

-- @Role    Get Boss's State
function GuildCrossWarBossUnitData:getCurState()
    local function getState( ... )

        if self:getHp() == self:getMax_hp() and self:getMax_hp() > 0 then
            return GuildCrossWarConst.BOSS_STATE_IDLE, 
                        Lang.get("guild_cross_war_bossstate_2")
        elseif self:getHp() > 0 and self:getHp() < self:getMax_hp() then
            return GuildCrossWarConst.BOSS_STATE_PK,
                        Lang.get("guild_cross_war_bossstate_2")
        elseif self:getHp() <= 0 then
            return GuildCrossWarConst.BOSS_STATE_DEATH,
                        Lang.get("guild_cross_war_bossstate_2")
        end
    end

    local state, _ = GuildCrossWarHelper.getCurCrossWarStage()
    if GuildCrossWarConst.ACTIVITY_STAGE_1 == state then
        return GuildCrossWarConst.BOSS_STATE_IDLE,
                        Lang.get("guild_cross_war_bossstate_1")
    elseif GuildCrossWarConst.ACTIVITY_STAGE_2 == state then
        local curState, strDesc = getState()
       return curState, strDesc
    else
        return GuildCrossWarConst.BOSS_STATE_DEATH, ""
    end
end


return GuildCrossWarBossUnitData