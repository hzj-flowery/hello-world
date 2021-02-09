local PopupBase = require("app.ui.PopupBase")
local GoldHeroShow = class("GoldHeroShow", PopupBase)
local CSHelper  = require("yoka.utils.CSHelper")
local AudioConst = require("app.const.AudioConst")
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")
local GoldHeroAvatar = require("app.scene.view.gachaGoldHero.GoldHeroAvatar")


function GoldHeroShow:ctor(heroId, callback)
    self._heroId = heroId
    self._callback = callback
    self._campPos = 1

    local resource = {
        file = Path.getCSB("GoldHeroShow", "gachaDrawGoldHero"),
        binding = {
			_resourceTouch = {
				events = {{event = "touch", method = "_onCloseView"}}
			},
		}
	}
    GoldHeroShow.super.ctor(self, resource, false, false)
end

function GoldHeroShow:onCreate()
    self:_getCampIndex() 
    self:_playZhaomu()
end

function GoldHeroShow:onEnter()
    self:_createContinueNode()
end

function GoldHeroShow:onExit()
end

function GoldHeroShow:_playZhaomu( ... )
    local heroResConfig = require("app.config.hero_res")
    local configInfo = heroResConfig.get(self._heroId)

    local function effectFunction(effect)
        if effect == "mingzi" then
            local mingzi = ccui.ImageView:create()
            mingzi:loadTexture(Path.getGoldHeroTxt(configInfo.gold_hero_show))
            return mingzi
        elseif effect == "shuoming" then
            local shuoming = ccui.ImageView:create()
            shuoming:loadTexture(Path.getGoldHeroTxt(configInfo.gold_hero_show .. "b"))
            return shuoming
        elseif effect == "dipan" then
            local shuoming = ccui.ImageView:create()
            shuoming:loadTexture(Path.getGoldHero(GachaGoldenHeroConst.DRAW_HERO_DIPAN[self._campPos]))
            return shuoming
        elseif effect == "juese" then
            return self:_createHero()
        end
    end
    local function eventFunction(event)
        if event == "finish" then
        end
    end
    self._nodeEffect:removeAllChildren()
    G_AudioManager:playSoundWithId(AudioConst.SOUND_GACHA_EFCGOLDEN_HERO)
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_jinjiangzhaomu_zhengjiang", effectFunction, eventFunction, false)
end

function GoldHeroShow:_onCloseView( ... )
    if self._callback then
        self._callback()
    end
    self:close()
end

function GoldHeroShow:_createHero()
    local avatar = GoldHeroAvatar.new()
    avatar:updateUI(self._heroId, nil, true)
    avatar:setScale(0.8)
    avatar:setNameVisible(false)
    avatar:playAnimationEfcOnce("coming")
    G_HeroVoiceManager:playVoiceWithHeroId(self._heroId, true)
    return avatar
end

function GoldHeroShow:_createContinueNode()
    local continueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
    self:addChild(continueNode)
    continueNode:setPosition(cc.p(0, -250))
end

function GoldHeroShow:_getCampIndex()
    --local heroIds = G_UserData:getGachaGoldenHero():getGoldHeroGroupId() or {}
    local heroConfig = require("app.config.hero")
    local configInfo = heroConfig.get(self._heroId)
    self._campPos = configInfo.country
end


return GoldHeroShow