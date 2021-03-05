---------------------------------------------------------------------
-- Created by: liangxu
-- Date: 2020-03-23 10:53:46
---------------------------------------------------------------------
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceReelNode = class("UniverseRaceReelNode", ViewBase)

function UniverseRaceReelNode:ctor(callback)
	self._callback = callback
	local resource = {
		file = Path.getCSB("UniverseRaceReelNode", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	UniverseRaceReelNode.super.ctor(self, resource)
end

function UniverseRaceReelNode:onCreate()
	
end

function UniverseRaceReelNode:onEnter()
	self:_playEffect()
end

function UniverseRaceReelNode:onExit()
	
end

function UniverseRaceReelNode:_playEffect()
	local interval = 0.5
	local action1 = cc.ScaleTo:create(0.5, 1.0)
	local act1 = cc.EaseBackOut:create(action1)
	
	local playExpand = function()
		local designSize = G_ResolutionManager:getDesignCCSize()
		local designWidth = designSize.width
		local action2 = cc.ScaleTo:create(interval, 1.0)
		local act2 = cc.EaseBackOut:create(action2)
		local posLeft = -(designWidth / 2) - 20
		local posRight = designWidth / 2 + 20
		local action3 = cc.MoveTo:create(interval, cc.p(posLeft, 0))
		local act3 = cc.EaseBackOut:create(action3)
		local action4 = cc.MoveTo:create(interval, cc.p(posRight, 0))
		local act4 = cc.EaseBackOut:create(action4)
		
		self._imageBg:runAction(act2)
		self._imageLeft:runAction(act3)
		self._imageRight:runAction(act4)
	end
	
	self._nodeRoot:runAction(cc.Sequence:create(act1,
												cc.CallFunc:create(function()
													playExpand()
												end),
												cc.DelayTime:create(interval),
												cc.CallFunc:create(function()
													if self._callback then
														self._callback()
													end
												self:removeFromParent()
												end)))
end

return UniverseRaceReelNode