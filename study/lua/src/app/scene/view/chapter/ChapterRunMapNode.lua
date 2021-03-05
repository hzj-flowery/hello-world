local ViewBase = require("app.ui.ViewBase")
local ChapterRunMapNode = class("ChapterRunMapNode", ViewBase)
local CSHelper = require("yoka.utils.CSHelper")
ChapterRunMapNode.SCALE_AVATAR = 0.5
--idle/1        win/11          run/70        finish/95

function ChapterRunMapNode:ctor()
    self._actor = nil
	ChapterRunMapNode.super.ctor(self, nil)
end

function ChapterRunMapNode:onCreate()
    self:_createActor()
end

function ChapterRunMapNode:_createActor()
    if self._actor then
        self._actor:stopAllActions()
        self._actor:removeFromParent()
        self._actor = nil
    end
    local myHeroId = G_UserData:getHero():getRoleBaseId()
    local playerBaseId = G_UserData:getBase():getPlayerBaseId()
    local avatarId =  G_UserData:getBase():getAvatar_base_id()
    local limit = 0
    if avatarId > 0 then
        local HeroConst = require("app.const.HeroConst")
        limit = tonumber(require("app.config.avatar").get(avatarId).limit) > 0 and HeroConst.HERO_LIMIT_RED_MAX_LEVEL or 0
    end
    myHeroId = (playerBaseId > 0 and playerBaseId or myHeroId)

    self._actor = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
    self._actor:updateUI(myHeroId, "", false, limit)
    self._actor:setScale(ChapterRunMapNode.SCALE_AVATAR)
    self._actor:setAction("idle", true)
    self:addChild(self._actor)
end

function ChapterRunMapNode:run(startPos,endPos)
    dump(startPos)
    dump(endPos)
   -- self._actor:setAnchorPoint(0.5,0.5)
    self._actor:setPosition(cc.p(startPos.x, startPos.y))
    self._actor:setVisible(false)
    local interval = 1/30
    local delayAction = cc.DelayTime:create(0*interval)--上一个岛动画时间
    local delayAction01 = cc.DelayTime:create(1*interval)
    local delayAction02 = cc.DelayTime:create(11*interval)
    local delayAction03 = cc.DelayTime:create(70*interval)
    local delayAction04 = cc.DelayTime:create(88*interval)
    local delayAction05 = cc.DelayTime:create(95*interval)
    local idleAction = cc.CallFunc:create(function() 
         self._actor:setVisible(true)
         self:_onPlayActor("idle") end)
    local winAction = cc.CallFunc:create(function() self:_onPlayActor("win") end)
    local runAction = cc.CallFunc:create(function() self:_onRun(endPos) end)
    local fadeAction = cc.CallFunc:create(function() self._actor:runAction(cc.FadeOut:create(7*interval)) end)
    local finishAction = cc.CallFunc:create(function()  self:_onFinish() end)
    local action = cc.Sequence:create(delayAction,cc.Spawn:create(
        cc.Sequence:create(delayAction01,idleAction),
        cc.Sequence:create(delayAction02,winAction),
        cc.Sequence:create(delayAction03,runAction),
        cc.Sequence:create(delayAction04,fadeAction) ,
        cc.Sequence:create(delayAction05,finishAction)
    )
    )
    self:runAction(action)
end

function ChapterRunMapNode:_onPlayActor(actorName)
    self._actor:setAction(actorName, true)
end

function ChapterRunMapNode:_onRun(endPos)
    self._actor:setAction("run", true)
    local interval = 1/30
    local action = cc.MoveTo:create( (95-70)*interval, endPos) --cc.MoveTo(3,endPos)
    self._actor:runAction(action)    
end

function ChapterRunMapNode:_onFinish()
    self:removeFromParent()
end

return ChapterRunMapNode