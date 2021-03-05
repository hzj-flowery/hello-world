local ViewBase = require("app.ui.ViewBase")
local PopupStoryChatNode = class("PopupStoryChatNode", ViewBase)

local HeroRes = require("app.config.hero_res")
local Hero = require("app.config.hero")

PopupStoryChatNode.ROLE_SCALE = 0.85
PopupStoryChatNode.MALE_SCALE = 0.72    --男主缩放
PopupStoryChatNode.FEMALE_SCALE = 0.72   --女主缩放

PopupStoryChatNode.MOVE_TIME = 0.3

local centerPos = G_ResolutionManager:getDesignCCPoint()

PopupStoryChatNode.ENTER_POSITION = 
{
    cc.p(centerPos.x - 668, centerPos.y),
    cc.p(centerPos.x + 668, centerPos.y),
}

PopupStoryChatNode.TALK_POSITION = 
{
    cc.p(centerPos.x - 284, centerPos.y),
    cc.p(centerPos.x + 284, centerPos.y),
}

function PopupStoryChatNode:ctor(heroId, stagePos, myHeroId)
    self._heroId = heroId
    self._stagePos = stagePos
    self._avatarTalker = nil
    self._myHeroId = myHeroId or 1

    self._towards = 1

    local resource = {
		file = Path.getCSB("PopupStoryChatNode", "storyChat"),
		size = {1136, 640},
		binding = {
		}
	}
	PopupStoryChatNode.super.ctor(self, resource)
end

function PopupStoryChatNode:getHeroId()
    return self._heroId
end

function PopupStoryChatNode:turnBack()
    self:setScaleX(-1)
    self._towards = -1
end

function PopupStoryChatNode:onCreate()
    if self._heroId == 0 then
        self:setVisible(false)
        return
    end
    
    local scale = PopupStoryChatNode.ROLE_SCALE
    local heroId = self._heroId
    if self._heroId == 1 then
        self._avatarTalker:updateUI(self._myHeroId)
        if self._myHeroId < 10 then 
            scale = PopupStoryChatNode.MALE_SCALE
        else
            scale = PopupStoryChatNode.FEMALE_SCALE
        end
    else
        self._avatarTalker:updateUI(self._heroId)
    end
    self._avatarTalker:setScale(scale)

    if self._stagePos == 2 then
        self:turnBack()
    end

    self:setPosition(PopupStoryChatNode.ENTER_POSITION[self._stagePos])

    local heroData = Hero.get(heroId)
    assert(heroData, "not hero id "..heroId)
    local resData = HeroRes.get(heroData.res_id)
    assert(resData, "not hero res "..heroData.res_id)
    self._posX = PopupStoryChatNode.TALK_POSITION[self._stagePos].x + resData.story_res_chat_x * self._towards
end

function PopupStoryChatNode:onEnter()
end

function PopupStoryChatNode:onExit()
end

function PopupStoryChatNode:enterStage(callback)
    local action1 = cc.MoveTo:create(PopupStoryChatNode.MOVE_TIME, cc.p(self._posX, PopupStoryChatNode.TALK_POSITION[self._stagePos].y))
    local action2 = cc.CallFunc:create(function() 
                                        if callback then 
                                            callback() 
                                        end 
                                    end)
    local action = cc.Sequence:create(action1, action2)
	self:runAction(action)
end

function PopupStoryChatNode:leaveStage()
    local action1 = cc.MoveTo:create(PopupStoryChatNode.MOVE_TIME, PopupStoryChatNode.ENTER_POSITION[self._stagePos])
    local action2 = cc.RemoveSelf:create()
    local action = cc.Sequence:create(action1, action2)
	self:runAction(action)    
end

return PopupStoryChatNode