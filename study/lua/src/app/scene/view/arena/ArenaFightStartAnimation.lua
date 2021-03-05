--竞技场
--起始动画玩家名称战力 展示
local PopupBase = require("app.ui.PopupBase")
local ArenaFightStartAnimation = class("ArenaFightStartAnimation", PopupBase)
local ArenaFightStartName = import(".ArenaFightStartName")
local TextHelper = require("app.utils.TextHelper")
function ArenaFightStartAnimation:ctor(battleData, closeCall)
    
    self._battleData = battleData
    self._panelRoot = nil
    self._closeCall = closeCall
    local resource = {
        file = Path.getCSB("ArenaFightStartAnimation", "arena"),
    }
    ArenaFightStartAnimation.super.ctor(self, resource,false,true)
end

function ArenaFightStartAnimation:onCreate()

    --self._panelRoot:addClickEventListenerEx(handler(self, self.onPanelClick))
end



function ArenaFightStartAnimation:play()
    self:_createEffectNode(self._panelRoot)
end

function ArenaFightStartAnimation:onEnter()
    self:play()

    local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_ARENA_FIGHT)
end

function ArenaFightStartAnimation:onExit()

end

--1 攻击方
--2 防守方
function ArenaFightStartAnimation:_createActionNode(effect)
    local function getFirstEffect(playerIndex)
        local EffectGfxNode = require("app.effect.EffectGfxNode")
        if self._battleData.firstOrder == playerIndex then
            local subEffect = EffectGfxNode.new("effect_xianshou_xianshou")
            subEffect:play()
            return subEffect
        end
        return display.newNode()
    end

    local function getArenaRole(playerIndex)
        local path = nil 
        if playerIndex == 1 then
            local heroInfo = require("app.config.hero").get(self._battleData.attackBaseId)
            assert(heroInfo,"can not find hero base id")
            path = Path.getArenaUI("hero"..heroInfo.gender)
        end
        if playerIndex == 2 then
            local heroInfo = require("app.config.hero").get(self._battleData.defenseBaseId)
            assert(heroInfo,"can not find hero base id")
            path = Path.getArenaUI("hero"..heroInfo.gender)
        end
        return path
    end
    local function getPower(playerIndex)
        if playerIndex == 1 then
            local node = ArenaFightStartName.new()
            node:updateUI(self._battleData.attackName,
                        self._battleData.attackOffLevel,
                        self._battleData.attackPower)
   
            return node
        end
        if playerIndex == 2 then
            local node = ArenaFightStartName.new()
            node:updateUI(self._battleData.defenseName ,
                        self._battleData.defenseOffLevel,
                        self._battleData.defensePower)

            return node
        end
    end

    if effect == "xianshou_1" then
        local subEffect = getFirstEffect(1)
        return subEffect
    elseif effect == "xianshou_2" then    
        local subEffect = getFirstEffect(2)
        return subEffect
    elseif effect == "role_1" then
        local sprite = display.newSprite(getArenaRole(1))
        return sprite         
    elseif effect == "role_2" then
        local sprite = display.newSprite(getArenaRole(2))
        return sprite
    elseif effect == "power_1" then
        return getPower(1)
    elseif effect == "power_2" then
        return getPower(2)
    end
end

function ArenaFightStartAnimation:_createEffectNode(rootNode)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "effect_sljs_hurt_1" then
            local subEffect = EffectGfxNode.new("effect_sljs_hurt_1")
            subEffect:play()
            return subEffect
        elseif effect == "effect_xianshou_duizhan" then
            local subEffect = EffectGfxNode.new("effect_xianshou_duizhan")
            subEffect:play()
            return subEffect
        elseif effect == "effect_xianshou_dimian" then
            local subEffect = EffectGfxNode.new("effect_xianshou_dimian")
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect)    
        end
     
    end

    local function eventFunction(event,frameIndex, movingNode)
        if event == "finish" then
            if self._closeCall then
                self._closeCall()
            end
        end
    end
   
   local node =  G_EffectGfxMgr:createPlayMovingGfx( rootNode, "moving_xianshou", effectFunction, eventFunction , false )
   return node
end


return ArenaFightStartAnimation
