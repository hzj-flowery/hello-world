local ViewBase = require("app.ui.ViewBase")
local PetMerge = class("PetMerge", ViewBase)


local Pet = require("app.config.pet")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper  = require("yoka.utils.CSHelper")

function PetMerge:ctor(petId, count)
    self._count = count or 1        --数量
    self._isAnimFinish = false      --动画是否播放完
    self._petData = Pet.get(petId)       --英雄表格数据
    assert(self._petData, "wrong pet id = "..petId)

    --ui
    self._imageBG = nil     --背景图片
    self._showNode = nil    --英雄节点
    self._nodeContinue = nil        --点击继续
    self._imageGetBG = nil          --恭喜获得
    self._textGetDetail = nil       --恭喜获得xxx *x
    local resource = {
		file = Path.getCSB("PetMerge", "petMerge"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_imageBG = {
				events = {{event = "touch", method = "_onImageBGTouch"}}
			},        
		}		
	}
    PetMerge.super.ctor(self, resource, G_SceneIdConst.SCENE_ID_DRAW_CARD)
end

function PetMerge:onCreate()
    self._nodeContinue:setVisible(false)
    self._imageGetBG:setVisible(false)
    self._textGetDetail:setVisible(false)
end

function PetMerge:onEnter()
    self:_playHeroOpen()
end

function PetMerge:onExit()
end

function PetMerge:_playHeroOpen()
    self._imageGetBG:setVisible(true)
    if self._petData.color >= 4 then
        local PetShow = require("app.scene.view.petMerge.PetShow")
        PetShow.create(self._petData.id, function() self:_playAvatarOpen() end)
        --self:_playAvatarOpen()
    else
        self:_playAvatarOpen()
    end
end

function PetMerge:_playAvatarOpen()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local function effectFunction(effect)
        if effect == "card_lv" then
            local card = self:_createCard(self._petData.color)
            return card
        elseif effect == "hero_come" then
            local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
            avatar:setConvertType(TypeConvertHelper.TYPE_PET)
            avatar:updateUI(self._petData.id)
            avatar:showName(true)
            --根据hero_res 的 height 设置名字高度
            avatar:updateNameHeight( avatar:getHeight() )
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
            self._textGetDetail:setString(Lang.get("recruit_get_detail", {name = self._petData.name, count = self._count}))
            self._nodeContinue:setVisible(true)
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._showNode, "moving_card_open_yes", effectFunction, eventFunction , false )
end

function PetMerge:_createCard(color)
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

function PetMerge:_onImageBGTouch()
    if self._isAnimFinish then
        G_SceneManager:popScene()
    end
end



return PetMerge