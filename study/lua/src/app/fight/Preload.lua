local Preload = class("Preload")
local FightConfig = require("app.fight.Config")
local PrioritySignal = require("yoka.event.PrioritySignal")
local Hero = require("app.config.hero")
local HeroRes = require("app.config.hero_res")
local HeroSpineNode = require("yoka.node.HeroSpineNode")
local Engine = require("app.fight.Engine")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local Path = require("app.utils.Path")
local HeroSkillActive = require("app.config.hero_skill_active")
local HeroSkillPlay = require("app.config.hero_skill_play")
local HistoricalHero = require("app.config.historical_hero")

--
function Preload:ctor(report)
    --
    self._report = report
    self._loads = {}
    self._hisLoads = {}
    self._loaded = 0
    self._count = 0

    --
    local waves = self._report:getWaves()
    for iWave, vWave in ipairs(waves) do
        local units = vWave:getUnits()
        for iUnit, vUnit in ipairs(units) do
            local heroInfo = Hero.get(vUnit.configId)
            local heroRes = HeroRes.get(heroInfo.res_id)
            assert(heroRes, "wrong hero res id " .. heroInfo.res_id)
            self:_addLoad(Path.getSpine(heroRes.fight_res))

            local isExist = G_SpineManager:isSpineExist(Path.getSpine(heroRes.fight_res))
            assert(isExist, "hero has no spine" .. Path.getSpine(heroRes.fight_res))

            if G_SpineManager:isSpineExist(Path.getSpine(heroRes.fight_res .. "_fore_effect")) then
                self:_addLoad(Path.getSpine(heroRes.fight_res .. "_fore_effect"))
            end
        end
    end

    local starIds = self._report:getStarIds()
    for _, id in pairs(starIds) do
        local data = HistoricalHero.get(id)
        assert(data, "wrong history hero id = " .. id)
        local res = HeroRes.get(data.res_id)
        assert(res, "wrong Hero res id = " .. data.res_id)
        if res.story_res_spine ~= 0 then
            self:_addHisLoad(Path.getSpine(res.story_res_spine))
        end
    end

    local skillIds = self._report:getSkillIds()
    for i, v in ipairs(skillIds) do
        local skillInfo = HeroSkillActive.get(v, 0, 0)
        assert(skillInfo, "skillInfo wrong skill id " .. tostring(v))
        local skillPlay = HeroSkillPlay.get(skillInfo.skill_show_id)
        assert(
            skillPlay,
            "skillPlay wrong skill id " ..
                tostring(skillInfo.id) .. " wrong skillPlayId " .. tostring(skillInfo.skill_show_id)
        )
        if skillPlay.atk_action ~= 0 then
            local ani = Path.getAttackerAction(skillPlay.atk_action)
            local str = cc.FileUtils:getInstance():getStringFromFile(ani)
            local data = json.decode(str)
            assert(data, string.format('Preload - Load ani json "%s" failed', ani))

            for j, layer in ipairs(data.layers) do
                if layer.name == "body" then
                elseif layer.name == "shadow" then
                elseif layer.name == "body_2" then
                else
                    local spinePath = Path.getFightEffectSpine(layer.name)
                    if G_SpineManager:isSpineExist(spinePath) then
                        self:_addLoad(spinePath)
                    end
                end
            end

            for _, eventList in pairs(data.events) do
                for _, event in ipairs(eventList) do
                    if event.type == "sound" then
                        local soundPath = Path.getFightSound(event.value1)
                        G_AudioManager:preLoadSound(soundPath)
                        Engine.getEngine():pushSound(soundPath)
                    end
                end
            end
        end

        if skillPlay.battle_voice ~= "0" then
            local soundPath = Path.getSkillVoice(skillPlay.battle_voice)
            G_AudioManager:preLoadSound(soundPath)
            Engine.getEngine():pushSound(soundPath)
        end
    end

    --
    assert(self._count > 0, string.format("fight Preload count = 0!!!", position))
    dump(self._loads)

    self.signalFinish = PrioritySignal.new("string")
end

--
function Preload:_addLoad(path)
    if self._loads[path] == nil then
        self._loads[path] = 1
        self._count = self._count + 1
    end
end

function Preload:_addHisLoad(path)
    if self._hisLoads[path] == nil then
        self._hisLoads[path] = 1
        self._count = self._count + 1
    end
end

--
function Preload:start()
    local function callback()
        self._loaded = self._loaded + 1
        if self._loaded >= self._count then
            self:_setupBattle()
        end
    end
    for k, v in pairs(self._loads) do
        local ret = G_SpineManager:addSpineAsync(k, HeroSpineNode.SCALE, callback, self)
    end
    for k, v in pairs(self._hisLoads) do
        local ret = G_SpineManager:addSpineAsync(k, 1, callback, self)
    end
end

--
function Preload:_setupBattle()
    local report = clone(self._report)
    Engine.getEngine():setupBattle(report)
    SchedulerHelper.newScheduleOnce(
        function()
            self.signalFinish:dispatch()
        end,
        0
    )
end

function Preload:removeLoadHandler()
    G_SpineManager:removeSpineLoadHandlerByTarget(self)
end

return Preload
