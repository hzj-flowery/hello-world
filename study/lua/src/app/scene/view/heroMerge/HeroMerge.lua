local ViewBase = require("app.ui.ViewBase")
local HeroMerge = class("HeroMerge", ViewBase)

-- function HeroMerge.create(heroId, count)
-- 	local HeroMerge = HeroMerge.new(heroId, count)
--     HeroMerge:open()
-- end

local Hero = require("app.config.hero")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper  = require("yoka.utils.CSHelper")

function HeroMerge:ctor(heroId, count)
    self._count = count or 1        --数量
    self._isAnimFinish = false      --动画是否播放完
    self._heroData = Hero.get(heroId)       --英雄表格数据
    assert(self._heroData, "wrong hero id = "..heroId)

    --ui
    self._imageBG = nil     --背景图片
    self._heroNode = nil    --英雄节点
    self._nodeContinue = nil        --点击继续
    self._imageGetBG = nil          --恭喜获得
    self._textGetDetail = nil       --恭喜获得xxx *x
    local resource = {
		file = Path.getCSB("HeroMerge", "heroMerge"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_imageBG = {
				events = {{event = "touch", method = "_onImageBGTouch"}}
			},        
		}		
	}
    HeroMerge.super.ctor(self, resource, G_SceneIdConst.SCENE_ID_DRAW_CARD)
end

function HeroMerge:onCreate()
    self._nodeContinue:setVisible(false)
    self._imageGetBG:setVisible(false)
    self._textGetDetail:setVisible(false)
end

function HeroMerge:onEnter()
    self:_playHeroOpen()
end

function HeroMerge:onExit()
end

function HeroMerge:_playHeroOpen()
    self._imageGetBG:setVisible(true)
    if self._heroData.color >= 4 then
        local HeroShow = require("app.scene.view.heroShow.HeroShow")
        HeroShow.create(self._heroData.id, function() self:_playAvatarOpen() end)
    else
        self:_playAvatarOpen()
    end
end

function HeroMerge:_playAvatarOpen()
    local function effectFunction(effect)
        if effect == "card_lv" then
            local card = self:_createCard(self._heroData.color)
            return card
        elseif effect == "hero_come" then
            local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
            avatar:updateUI(self._heroData.id)
            avatar:showName(true)
            avatar:showCountry(true)
            return avatar
        elseif effect == "effect_zm_boom" then
            local subEffect = EffectGfxNode.new("effect_zm_boom")
            subEffect:play()
            return subEffect            
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            self._isAnimFinish = true
            self._textGetDetail:setVisible(true)
            self._textGetDetail:setString(Lang.get("recruit_get_detail", {name = self._heroData.name, count = self._count}))
            self._nodeContinue:setVisible(true)
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._heroNode, "moving_card_open_yes", effectFunction, eventFunction , false )
end

function HeroMerge:_createCard(color)
    local spriteName = 
    {
        Path.getDrawCard("blue_card"),
        Path.getDrawCard("green_card"),
        Path.getDrawCard("blue_card"),
        Path.getDrawCard("purple_card"),
        Path.getDrawCard("god_card"),
        Path.getDrawCard("red_card"),
    }
    --以后要做特效
    local sprite = display.newSprite(spriteName[color])
    return sprite
end

function HeroMerge:_onImageBGTouch()
    if self._isAnimFinish then
        G_SceneManager:popScene()
    end
end



return HeroMerge