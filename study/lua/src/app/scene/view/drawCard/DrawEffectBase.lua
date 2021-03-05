local PopupBase = require("app.ui.PopupBase")
local DrawEffectBase = class("DrawEffectBase", PopupBase)

local CSHelper  = require("yoka.utils.CSHelper")
local DrawCardCell = require("app.scene.view.drawCard.DrawCardCell")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local UIHelper = require("yoka.utils.UIHelper")
local HeroShow = require("app.scene.view.heroShow.HeroShow")

local Hero = require("app.config.hero")

DrawEffectBase.DRAW_TYPE_MONEY = 1
DrawEffectBase.DRAW_TYPE_GOLD = 2

local Parameter = require("app.config.parameter")
local ParameterIDConst = require("app.const.ParameterIDConst")

function DrawEffectBase:ctor(awards, type)
    -- self._rootNode = rootNode
    self._awards = awards
    self._cardNode = nil
    self._cardToOpen = nil
    self._isAction = false
    self._isOpenCardAnim = nil
    self._labelGetMoney = nil
    self._hasShowTip = false
    if type == DrawEffectBase.DRAW_TYPE_MONEY then
        self._getMoney = tonumber(Parameter.get(ParameterIDConst.DRAW_NORMAL_GIVE).content)
        self._getPoint = tonumber(Parameter.get(ParameterIDConst.RECRUIT_POINT_NORMAL).content)
    elseif type == DrawEffectBase.DRAW_TYPE_GOLD then
        self._getMoney = tonumber(Parameter.get(ParameterIDConst.DRAW_MONEY_GIVE).content) * #self._awards
        self._getPoint = tonumber(Parameter.get(ParameterIDConst.RECRUIT_POINT_GOLD).content) * #self._awards
    end

    --ui
    self._panelBase = nil   --全屏节点
    self._nodeEffect = nil  --特效节点
    self._imageGetBG = nil  --恭喜获得
    self._textGetDetail = nil   --获得详情

    local resource = {
		file = Path.getCSB("DrawEffectLayer", "drawCard"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {     
            _panelBase = {
				events = {{event = "touch", method = "_onFinishTouch"}}
			},
		}		
	}
    DrawEffectBase.super.ctor(self, resource, false, true)
end

function DrawEffectBase:onCreate()
    
  
end

function DrawEffectBase:onEnter()
    self._textGetDetail:setVisible(false)
    self._imageGetBG:setVisible(false)

    local point = G_ResolutionManager:getDesignCCPoint()
    point.x = 0
    point.y = 0
    self:setPosition(point)
end

function DrawEffectBase:onExit()
end

function DrawEffectBase:_playHeroShow(index)
    local hero = Hero.get(self._awards[index].value)
    local HeroShow = require("app.scene.view.heroShow.HeroShow")
    HeroShow.create(hero.id, function() self:_openCard(index) end)
end

function DrawEffectBase:_onFinishTouch(sender, event)
    if self._isAction then
        return 
    end
    -- if event == 2 then
        if self._isOpenCardAnim then
            return
        end
        if #self._cardToOpen == 0 then
            self:removeFromParent()
            G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
            G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
        else
            self:_playHeroShow(self._cardToOpen[1])
            -- self:_openCard(self._cardToOpen[1])
        end
    -- end
end

function DrawEffectBase:_reset()
    self._cardNode = {}
    self._cardToOpen = {}
    self._heroShow = nil
    --[[
    local params = {
        name = index,
        contentSize = cc.size(1136, 640),
        anchorPoint = cc.p(0.5,0.5),
        position = cc.p(0, 0)
    }
    ]]
    -- self._panelFinish = UIHelper.createPanel(params)
    -- self._panelFinish:setTouchEnabled(true)
    -- self._panelFinish:addTouchEventListener(handler(self,self._onFinishTouch))
    -- self._rootNode:addChild(self._panelFinish)
    -- self:addChild(self._panelFinish)
    -- self._panelFinish:setVisible(false)    
    self._textGetDetail:setVisible(false)
    self._imageGetBG:setVisible(false)
    self._hasShowTip = false
end

function DrawEffectBase:_showGetDetail()
    self._textGetDetail:setVisible(true)
    self._imageGetBG:setVisible(true)  
    self._textGetDetail:setString(Lang.get("recruit_get_money", {count = self._getMoney, count2 = self._getPoint}))  
end

function DrawEffectBase:_playAvatarOpen(rootNode, hero)
    if not self._hasShowTip then
        self:_showGetDetail()
        self._hasShowTip = true
    end
    self._isOpenCardAnim = true
    local function effectFunction(effect)
        if effect == "card_lv" then
            local card = self:_createCard(hero.color)
            return card
        elseif effect == "hero_come" then
            local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
            avatar:updateUI(hero.id)
            avatar:showName(true)
            return avatar
        elseif effect == "effect_zm_boom" then
            local subEffect = EffectGfxNode.new("effect_zm_boom")
            subEffect:play()
            return subEffect            
        end
    end
    local function eventFunction(event)
        if event == "finish" then
            self._isOpenCardAnim = false
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( rootNode, "moving_card_open_yes", effectFunction, eventFunction , false )
    local size = rootNode:getContentSize()
    effect:setPosition(size.width*0.5, size.height*0.5)  
end

function DrawEffectBase:_playAvatarClose(rootNode, index)
    local function effectFunction(effect)
        if effect == "card_lv" then
            local heroId = self._awards[index].value
            local hero = Hero.get(heroId)
            local card = self:_createCard(hero.color)
            return card  
        elseif effect == "shabi" then
            local params = {
                name = index,
                contentSize = cc.size(148, 208),
                anchorPoint = cc.p(0.5,0.5),
                position = cc.p(0, 0)
            }
            local panel = UIHelper.createPanel(params)
            panel:setTouchEnabled(true)
            panel:addTouchEventListener(handler(self,self._onTouchCard))
            return panel
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( rootNode, "moving_card_open_no", effectFunction, nil , false )
    local size = rootNode:getContentSize()
    effect:setPosition(size.width*0.5, size.height*0.5)  
end

function DrawEffectBase:_onTouchCard(sender, event)
    if event == 2 then
        local index = tonumber(sender:getName())
        self:_playHeroShow(index)
    end
end

function DrawEffectBase:_openCard(index)
    local hero = Hero.get(self._awards[index].value)
    self._cardNode[index]:removeAllChildren()
    self:_playAvatarOpen(self._cardNode[index], hero)
    self:_removeCardToOpenByIndex(index)
end

function DrawEffectBase:_removeCardToOpenByIndex(index)
    for i = #self._cardToOpen, 1, -1 do
        local val = self._cardToOpen[i]
        if val == index then
            table.remove(self._cardToOpen, i)
            return
        end
    end
end

function DrawEffectBase:play()
    self:_reset()
    self._isAction = true 
    -- self._panelFinish:setVisible(true)
      --onEnter
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
end

function DrawEffectBase:_createCard(color)
    local effectName = 
    {
        Path.getDrawCard("blue_card"),
        Path.getDrawCard("green_card"),
        Path.getDrawCard("blue_card"),
        "moving_cardlight_zise",
        "moving_cardlight_chengse",
        "moving_cardlight_hongse",
    }
    if color < 4 then 
        local sprite = display.newSprite(effectName[color])
        return sprite
    else
        local node = cc.Node:create()
        G_EffectGfxMgr:createPlayMovingGfx( node, effectName[color])
        return node
    end
end

function DrawEffectBase:_createContinueNode()
    local continueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
    self:addChild(continueNode)
   
    continueNode:setPosition(cc.p( G_ResolutionManager:getDesignCCPoint().x, 70 ))-- -250
end

function DrawEffectBase:_createHeroCardNode(nodeIndex)
    local showColor = 5
    if G_TutorialManager:isDoingStep() then
        showColor = 4
    end
    local index = nodeIndex or 1
    local node = self._cardNode[index]
    if not node then
        node = cc.Node:create()
        self._cardNode[index] = node
    end
    local heroId = self._awards[index].value
    local hero = Hero.get(heroId)
    if hero.color < showColor then
        local AudioConst = require("app.const.AudioConst")
        G_AudioManager:playSoundWithId(AudioConst.SOUND_DRAW_SHOW_CARD)
        self:_playAvatarOpen(node, hero)
    else
        self:_playAvatarClose(node, index)
        table.insert(self._cardToOpen, index)
    end
    return node
end

return DrawEffectBase