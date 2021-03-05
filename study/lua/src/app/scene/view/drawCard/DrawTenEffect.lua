local DrawEffectBase = require("app.scene.view.drawCard.DrawEffectBase")
local DrawTenEffect = class("DrawTenEffect", DrawEffectBase)

local EffectGfxNode = require("app.effect.EffectGfxNode")
local Hero = require("app.config.hero")

function DrawTenEffect:ctor(awards)
    DrawTenEffect.super.ctor(self, awards,  DrawEffectBase.DRAW_TYPE_GOLD)
end

function DrawTenEffect:onCreate()
    DrawTenEffect.super.onCreate(self)
end

function DrawTenEffect:onEnter()
    DrawTenEffect.super.onEnter(self)
    self:play()
end

function DrawTenEffect:_createActionNode(effect)
    if effect == "kabaoc_c" then
        local sprite = display.newSprite( Path.getDrawCard("zhaomu_cheng") )
        return sprite
    elseif effect == "draw_hero_back_a" then
        local ViewBase = require("app.ui.ViewBase")
        local bgView = ViewBase.new(nil,G_SceneIdConst.SCENE_ID_DRAW_CARD)
        local point = G_ResolutionManager:getDesignCCPoint()
        bgView:setPosition(-point.x,-point.y)
        local node =  cc.Node:create()
        node:addChild(bgView)
        return node    
    elseif effect == "draw_hero_back_b" then
        local sprite = display.newSprite( Path.getStageBG("zhaomu_bj_2") )
        return sprite 
    elseif effect == "draw_hero_back_c" then
        local sprite = display.newSprite( Path.getStageBG("zhaomu_bj_3") )
        return sprite 
    end
    if string.find(effect, "card_to_hero_") then
        local strArray = string.split(effect, "_")
        local index = tonumber(strArray[4])
        -- local node = self._cardNode[index]
        -- if not node then
        --     node = cc.Node:create()
        --     self._cardNode[index] = node
        -- end
        -- local heroId = self._awards[index].value
        -- local hero = Hero.get(heroId)
        -- if hero.color < 4 then
        --     self:_playAvatarOpen(node, hero)
        -- else
        --     self:_playAvatarClose(node, index)
        --     table.insert(self._cardToOpen, index)
        -- end
        -- return node
        return self:_createHeroCardNode(index)
    elseif string.find(effect,"card_") then
        local strArray = string.split(effect, "_")
        local index = tonumber(strArray[2])
        local heroId = self._awards[index].value
        local hero = Hero.get(heroId)
        local card = self:_createCard(hero.color)
        return card
    end
end

function DrawTenEffect:play()
    DrawTenEffect.super.play(self)
    local function effectFunction(effect)
        if effect == "effect_kabao_red_z"then
            local subEffect = EffectGfxNode.new("effect_kabao_red_z")
            subEffect:play()
            return subEffect
        elseif effect == "effect_choujiang_knight_sj1_z" then
            local subEffect = EffectGfxNode.new("effect_choujiang_knight_sj1_z")
            subEffect:play()
            return subEffect
        elseif effect == "effect_draw_hero_ball_z" then
            local subEffect = EffectGfxNode.new("effect_draw_hero_ball_z")
            subEffect:play()
            return subEffect
        elseif effect == "effect_hei_z" then
            local subEffect = EffectGfxNode.new("effect_hei_z")
            subEffect:play()
            return subEffect
        elseif effect == "effect_sky_f_z" then
            local subEffect = EffectGfxNode.new("effect_sky_f_z")
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect)    
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            self._isAction = false
            self:_createContinueNode()
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeEffect, "moving_draw_hero_kabaoc", effectFunction, eventFunction , false )
end

return DrawTenEffect