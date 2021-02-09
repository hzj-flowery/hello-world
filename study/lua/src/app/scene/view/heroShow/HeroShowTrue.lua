local PopupBase = require("app.ui.PopupBase")
local HeroShowTrue = class("HeroShowTrue", PopupBase)

local CSHelper  = require("yoka.utils.CSHelper")
local Hero = require("app.config.hero")
local HeroRes = require("app.config.hero_res")
local Instrument = require("app.config.instrument")
local UIHelper = require("yoka.utils.UIHelper")

local Path = require("app.utils.Path")
local Color = require("app.utils.Color")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

HeroShowTrue.AUTO_CLOSE_TIME = 10

HeroShowTrue.HERO_COLOR_BACK_DI = 
{
    "",
    "",
    "",
    "show_purple1",
    "show_yellow1",
    "show_red1",
    "show_gold1",
}

HeroShowTrue.SHENBING_BACK = 
{
    "",
    "",
    "",
    "show_purple2",
    "show_yellow2",    
    "show_red2",
    "show_gold2",
}

HeroShowTrue.DES_BG1 = 
{
    "",
    "",
    "",
    "show_purple4",
    "show_yellow4",    
    "show_red4",
    "show_gold4",
}

HeroShowTrue.DES_BG2 = 
{
    "",
    "",
    "",
    "show_purple4",
    "show_yellow4",    
    "show_red4",
    "show_gold4",
}

HeroShowTrue.EFFECT_DI = {
    "",
    "",
    "",
    "effect_xiujiang_yuanquanzise",
    "effect_xiujiang_yuanquanchengse",    
    "effect_xiujiang_yuanquanhongse",
    "effect_xiujiang_yuanquanjinse",
}

--普通副本结算
function HeroShowTrue:ctor(heroId, callback, needAutoClose, isRight)
    local hero = Hero.get(heroId)
    assert(hero, "hero id is wrong "..heroId)
    self._hero = hero
    self._heroRes = HeroRes.get(hero.res_id)
    self._instrument = Instrument.get(hero.instrument_id)
    self._panelFinish = nil
    self._isAction = true
    self._effectShow = nil
    self._callback = callback
    self._needAutoClose = needAutoClose
    self._scheduleHandler = nil
    self._autoTime = 0
    self._isRight = isRight
    HeroShowTrue.super.ctor(self, nil, false, false)
end

function HeroShowTrue:onCreate()
end

function HeroShowTrue:onEnter()
    self:play()
end

function HeroShowTrue:onExit()
    if self._scheduleHandler then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
    end
    self._scheduleHandler = nil
end

function HeroShowTrue:_onFinishTouch(sender, event)
    if not self._isAction and event == 2 then
        if self._callback then
            self._callback()
        end
        self:close()
    end
end

function HeroShowTrue:play()
    self._isAction = true
    local params = {
        name = index,
        contentSize = G_ResolutionManager:getDesignCCSize(),
        anchorPoint = cc.p(0.5, 0.5),
        position = cc.p(0, 0)
    }
    self._panelFinish = UIHelper.createPanel(params)
    self._panelFinish:setTouchEnabled(true)
    self._panelFinish:setSwallowTouches(true)
    self._panelFinish:addTouchEventListener(handler(self,self._onFinishTouch))
    self:addChild(self._panelFinish)
    self._isAction = true
    self._effectShow = nil
    self:_createAnimation()

    --onEnter
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
end

function HeroShowTrue:_createActionNode(effect)
    local funcName = "_"..effect
	if funcName then
		local func = self[funcName]
		assert(func, "has not func name = "..funcName)
		local node = func(self)
        return node
	end
end

--node绑定-----------------------------------------------------------------------
function HeroShowTrue:_xiujiang_zi_shenbing_wuqiu()
    local image = Path.getInstrument(self._instrument.res)
    local sprite = display.newSprite(image)
    return sprite    
end

function HeroShowTrue:_xiujiang_zi_shenbing_o()
    local image = Path.getShowHeroTrue(HeroShowTrue.SHENBING_BACK[self._hero.color])
    local sprite = display.newSprite(image)
    return sprite
end

-- 武将定位
function HeroShowTrue:_xiujiang_zi_dingwei()
    local content = Lang.get("hero_show_position")..self._hero.feature
    local label = cc.Label:createWithTTF(content, Path.getFontW8(), 30)
    local color, outline = Color.getHeroYellowShowColor()
    label:setColor(color)
    -- label:enableOutline(outline, 2) 
    label:setAnchorPoint(cc.p(0, 0.5))
    return label
end

-- 武将定位-描述
function HeroShowTrue:_xiujiang_zi_dingwei_txt()
    local content = self._hero.skill_name..self._hero.skill_description
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 20)
	label:setMaxLineWidth(370)
    label:setAnchorPoint(cc.p(0, 0.5))
    return label
end

-- 
function HeroShowTrue:_xiujiang_zi_dingwei_di()
    local image = Path.getShowHeroTrue(HeroShowTrue.DES_BG1[self._hero.color])
    local sprite = display.newSprite(image)
    return sprite
end

-- 武将神兵
function HeroShowTrue:_xiujiang_zi_shenbing()
    local content = Lang.get("hero_show_instrument")..self._instrument.name
    local label = cc.Label:createWithTTF(content, Path.getFontW8(), 30)
    local color, outline = Color.getHeroYellowShowColor()
    label:setColor(color)
    -- label:enableOutline(outline, 2) 
    label:setAnchorPoint(cc.p(0, 0.5))
    return label
end

-- 武将神兵-描述
function HeroShowTrue:_xiujiang_zi_shenbing_txt()
    local content = self._hero.instrument_description
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 20)
	label:setMaxLineWidth(370)
    label:setAnchorPoint(cc.p(0, 0.5))
    return label
end

function HeroShowTrue:_xiujiang_zi_shenbing_di()
    local image = Path.getShowHeroTrue(HeroShowTrue.DES_BG2[self._hero.color])
    local sprite = display.newSprite(image)
    return sprite
end

function HeroShowTrue:_xiujiang_zi_1()
    local content = Lang.get("hero_show_story_title")
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 20)
	label:setMaxLineWidth(25)
    label:setAnchorPoint(cc.p(0.5, 1))
    return label
end

function HeroShowTrue:_xiujiang_zi_2()
    local content = self._hero.description1
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 20)
	label:setMaxLineWidth(25)
    label:setAnchorPoint(cc.p(0.5, 1))
    return label
end

function HeroShowTrue:_xiujiang_zi_3()
    local content = self._hero.description2
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 20)
	label:setMaxLineWidth(25)
    label:setAnchorPoint(cc.p(0.5, 1))
    return label
end

function HeroShowTrue:_xiujiang_country()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, self._hero.id)
    local sprite = display.newSprite(param.country_text)
    return sprite
end

function HeroShowTrue:_xiujiang_mingzi()
    local image = self._heroRes.show_name
    local sprite = display.newSprite(Path.getShowHeroNameTrue(image))
    return sprite
end

function HeroShowTrue:_xiujiang_role()
    -- local image = self._heroRes.story_res
    -- local sprite = display.newSprite(Path.getChatRoleRes(image))
    -- return sprite
    local CSHelper  = require("yoka.utils.CSHelper")
    local heroAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar", "common"))
    heroAvatar:updateUI(self._hero.id)
    G_HeroVoiceManager:playVoiceWithHeroId(self._hero.id, true)
    return heroAvatar
end

function HeroShowTrue:_xiujiang_colour_di2()
    local image = Path.getShowHeroTrue(HeroShowTrue.HERO_COLOR_BACK_DI[self._hero.color])
    local sprite = display.newSprite(image)
    return sprite
end

---------------------------------------------------------------------------------------

function HeroShowTrue:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "effect_xiujiang_heidi" then
            local subEffect = cc.Node:create()
            return subEffect
        elseif effect == "xiujiang_colour_di" then
            local name = HeroShowTrue.EFFECT_DI[self._hero.color]
            local subEffect = EffectGfxNode.new(name)
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect)    
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            self:_createContinueNode()
            G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
        end

        --do
    end
    local movingName = "moving_xiujiang"
    if self._isRight then
        movingName = "moving_xiujiangjx"
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self, movingName, effectFunction, eventFunction , false )
    self._effectShow = effect
end

function HeroShowTrue:_createContinueNode()
    local continueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
    self:addChild(continueNode)
    continueNode:setPosition(cc.p(0, -250))
    self._isAction = false
    if self._needAutoClose then
        self._scheduleHandler = SchedulerHelper.newSchedule(function()
            self._autoTime = self._autoTime + 1
            if self._autoTime >= HeroShowTrue.AUTO_CLOSE_TIME then
                if self._callback then
                    self._callback()
                end
                self:close()
            end
        end, 1)
    end
end



return HeroShowTrue