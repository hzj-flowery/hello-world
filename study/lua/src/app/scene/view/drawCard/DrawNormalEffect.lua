local DrawEffectBase = require("app.scene.view.drawCard.DrawEffectBase")
local DrawNormalEffect = class("DrawNormalEffect", DrawEffectBase)

local EffectGfxNode = require("app.effect.EffectGfxNode")
local Hero = require("app.config.hero")

function DrawNormalEffect:ctor(awards)
    DrawNormalEffect.super.ctor(self, awards, DrawEffectBase.DRAW_TYPE_MONEY)
end

function DrawNormalEffect:onCreate()
    DrawNormalEffect.super.onCreate(self)
end

function DrawNormalEffect:onEnter()
    DrawNormalEffect.super.onEnter(self)
    self:play()
end

function DrawNormalEffect:_createActionNode(effect)
    if effect == "kabaoa_a" then
        local sprite = display.newSprite(Path.getDrawCard("zhaomu_lan"))
        return sprite
    elseif effect == "draw_hero_back_a" then
         local ViewBase = require("app.ui.ViewBase")
        local bgView = ViewBase.new(nil,G_SceneIdConst.SCENE_ID_DRAW_CARD)
        local point = G_ResolutionManager:getDesignCCPoint()
        bgView:setPosition(-point.x,-point.y)
        local node =  cc.Node:create()
        node:addChild(bgView)
        return node 
    elseif effect == "card_only_one" then
        local index = 1
        local heroId = self._awards[index].value
        local hero = Hero.get(heroId)
        local card = self:_createCard(hero.color)
        return card        
    elseif effect == "card_to_hero_only_one" then
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
        return self:_createHeroCardNode()
    end
end

function DrawNormalEffect:play()
    DrawNormalEffect.super.play(self)
    local function effectFunction(effect)
        if effect == "effect_kabao_red_z"then
            local subEffect = EffectGfxNode.new("effect_kabao_red_z")
            subEffect:play()
            return subEffect
        elseif effect == "effect_choujiang_knight_sj1_z" then
            local subEffect = EffectGfxNode.new("effect_choujiang_knight_sj1_z")
            subEffect:play()
            return subEffect
        elseif effect == "effect_hei_z" then
            local subEffect = EffectGfxNode.new("effect_hei_z")
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect)    
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            self:_createContinueNode()
            self._isAction = false
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeEffect, "moving_draw_hero_kabaoa", effectFunction, eventFunction , false )
end

return DrawNormalEffect