local DrawEffectBase = require("app.scene.view.drawCard.DrawEffectBase")
local DrawOneEffect = class("DrawOneEffect", DrawEffectBase)

local EffectGfxNode = require("app.effect.EffectGfxNode")
local Hero = require("app.config.hero")

function DrawOneEffect:ctor(awards)
    DrawOneEffect.super.ctor(self, awards, DrawEffectBase.DRAW_TYPE_GOLD)
end

function DrawOneEffect:onCreate()
    DrawOneEffect.super.onCreate(self)
end

function DrawOneEffect:onEnter()
    DrawOneEffect.super.onEnter(self)
    self:play()
end

function DrawOneEffect:_createActionNode(effect)
    if effect == "kabaob_b" then
        local sprite = display.newSprite( Path.getDrawCard("zhaomu_zi") )
        dump(sprite)
        return sprite
    elseif effect == "draw_hero_back_a" then
        local ViewBase = require("app.ui.ViewBase")
        local bgView = ViewBase.new(nil,G_SceneIdConst.SCENE_ID_DRAW_CARD)
        local point = G_ResolutionManager:getDesignCCPoint()
        bgView:setPosition(-point.x,-point.y)
        local node =  cc.Node:create()
        node:addChild(bgView)
        return node
       -- local sprite = display.newSprite( Path.getStageBG("zhaomu_bj") )
       -- return sprite        
    elseif effect == "draw_hero_back_b" then
        local sprite = display.newSprite( Path.getStageBG("zhaomu_bj_2") )
        return sprite 
    elseif effect == "draw_hero_back_c" then
        local sprite = display.newSprite( Path.getStageBG("zhaomu_bj_3") )
        return sprite 
    elseif effect == "card_just_one" then
        local index = 1
        local heroId = self._awards[index].value
        local hero = Hero.get(heroId)
        local card = self:_createCard(hero.color)
        return card        
    elseif effect == "card_to_hero_just_one" then
        -- local index = 1
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
        return self:_createHeroCardNode()
    end
    if effect == "kabaoa_b" then
        local sprite = display.newSprite(Path.getDrawCard("zhaomu_zi"))
        return sprite
    end
end

function DrawOneEffect:play()
    DrawOneEffect.super.play(self)
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
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeEffect, "moving_draw_hero_kabaob", effectFunction, eventFunction , false )
end

return DrawOneEffect