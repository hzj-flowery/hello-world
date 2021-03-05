local PopupBase = require("app.ui.PopupBase")
local PetShow = class("PetShow", PopupBase)

local CSHelper  = require("yoka.utils.CSHelper")
local Pet = require("app.config.pet")
local HeroRes = require("app.config.hero_res")
local Instrument = require("app.config.instrument")
local UIHelper = require("yoka.utils.UIHelper")

local Path = require("app.utils.Path")
local Color = require("app.utils.Color")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

PetShow.AUTO_CLOSE_TIME = 10

PetShow.HERO_COLOR_BACK = 
{
    "",
    "",
    "",
    "show_purple",
    "show_yellow1",
    "show_red",
}

PetShow.PET_YUANQUAN = 
{
    "",
    "",
    "",
    "img_beast_magi_zi",
    "img_beast_magi_cheng",    
    "img_beast_magi_zi",
}

PetShow.SKILL_BG1 = 
{
    "",
    "",
    "",
    "img_beast_zi",
    "img_beast_cheng",    
    "img_beast_cheng",
}

PetShow.SKILL_BG3 = 
{
    "",
    "",
    "",
    "img_beast_zi2",
    "img_beast_cheng2",    
    "img_beast_cheng2",
}

function PetShow.create(heroId, callback, needAutoClose, isRight)
	-- assert(spriteFrames and num, "spriteFrames and num could not be nil !")
	local PetShow = PetShow.new(heroId, callback, needAutoClose, isRight)
    PetShow:open()
end

--普通副本结算
function PetShow:ctor(heroId, callback, needAutoClose, isRight)
    local hero = Pet.get(heroId)
    assert(hero, "pet id is wrong "..heroId)
    self._petCfg = hero
    self._heroRes = HeroRes.get(hero.res_id)
    --self._instrument = Instrument.get(hero.instrument_id)
    self._panelFinish = nil
    self._isAction = true
    self._effectShow = nil
    self._callback = callback
    self._needAutoClose = needAutoClose
    self._scheduleHandler = nil
    self._autoTime = 0
    self._isRight = isRight
    PetShow.super.ctor(self, nil, false, false)
end

function PetShow:onCreate()
end

function PetShow:onEnter()
    self:play()
end

function PetShow:onExit()
    if self._scheduleHandler then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
    end
    self._scheduleHandler = nil
end

function PetShow:_onFinishTouch(sender, event)
    if not self._isAction and event == 2 then
        if self._callback then
            self._callback()
        end
        self:close()
    end
end

function PetShow:play()
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

function PetShow:_createActionNode(effect)
    local funcName = "_"..effect
	if funcName then
		local func = self[funcName]
		assert(func, "has not func name = "..funcName)
		local node = func(self)
        return node
	end
end

--node绑定-----------------------------------------------------------------------


function PetShow:_xiujiang_shenshouzhuanquan( ... )
    -- body
    --
    local node = display.newNode()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "yuanquan" then
            local sprite = display.newSprite(Path.getPet(PetShow.PET_YUANQUAN[self._petCfg.color]))
         
            return sprite
        end
    end
    local function eventFunction(event)

    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( node, "moving_shenshouxiujiang_fazhen", effectFunction, eventFunction , false )
    effect:setScaleY(0.22)
    return node
end

function PetShow:_xiujiang_jineng_1()
    local sprite = display.newSprite(Path.getPet(PetShow.SKILL_BG1[self._petCfg.color]))
    return sprite
end


function PetShow:_xiujiang_jineng_2()
    local content =  self._petCfg.skill_name..self._petCfg.skill_description
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 22)
	label:setMaxLineWidth(290)
    label:setAnchorPoint(cc.p(0, 0.5))
    return label
end


function PetShow:_xiujiang_jineng_3()
    local sprite = display.newSprite(Path.getPet(PetShow.SKILL_BG3[self._petCfg.color]))
    return sprite
end



function PetShow:_xiujiang_zi_1()
    local content = Lang.get("pet_show_story_title")
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 22)
	label:setMaxLineWidth(25)
    label:setAnchorPoint(cc.p(0.5, 1))
    return label
end

function PetShow:_xiujiang_zi_2()
    local content = self._petCfg.description1
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 22)
	label:setMaxLineWidth(25)
    label:setAnchorPoint(cc.p(0.5, 1))
    return label
end

function PetShow:_xiujiang_zi_3()
    local content = self._petCfg.description2
    local label = cc.Label:createWithTTF(content, Path.getCommonFont(), 22)
	label:setMaxLineWidth(25)
    label:setAnchorPoint(cc.p(0.5, 1))
    return label
end



function PetShow:_xiujiang_mingzi()
    local image = self._heroRes.show_name

    local sprite = display.newSprite(Path.getShowHeroName(image))
    return sprite
end

function PetShow:_xiujiang_role()
    -- local image = self._heroRes.story_res
    -- local sprite = display.newSprite(Path.getChatRoleRes(image))
    -- return sprite
    local CSHelper  = require("yoka.utils.CSHelper")
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
    avatar:setConvertType(TypeConvertHelper.TYPE_PET)
    avatar:updateUI(self._petCfg.id)
    avatar:showName(false)
    avatar:setScale(1.5)

    
    --local heroAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar", "common"))
    --heroAvatar:updateUI(self._petCfg.id)
    --G_HeroVoiceManager:playVoiceWithHeroId(self._petCfg.id, true)
    return avatar
end

function PetShow:_xiujiang_colour_di()
    local image = Path.getShowHero(PetShow.HERO_COLOR_BACK[self._petCfg.color])
    local sprite = display.newSprite(image)
    return sprite
end

---------------------------------------------------------------------------------------

function PetShow:_createAnimation()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "effect_xiujiang_heidi" then
            local subEffect = cc.Node:create()
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
    local movingName = "moving_shenshouxiujiang"
    --if self._isRight then
    --    movingName = "moving_shenshouxiujiangx"
   -- end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self, movingName, effectFunction, eventFunction , false )
    self._effectShow = effect
end

function PetShow:_createContinueNode()
    local continueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
    self:addChild(continueNode)
    continueNode:setPosition(cc.p(0, -250))
    self._isAction = false
    if self._needAutoClose then
        self._scheduleHandler = SchedulerHelper.newSchedule(function()
            self._autoTime = self._autoTime + 1
            if self._autoTime >= PetShow.AUTO_CLOSE_TIME then
                if self._callback then
                    self._callback()
                end
                self:close()
            end
        end, 1)
    end
end



return PetShow