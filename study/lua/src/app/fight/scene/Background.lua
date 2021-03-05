local Background = class("Background", function()
	return cc.Node:create()
end)

local Path = require("app.utils.Path")

-- local FightConfig = require("app.fight.Config")

Background.ZORDER_BACK = 1
Background.ZORDER_EFFECT = 2
Background.ZORDER_COMBINE_BACK = 3
-- Background.ZORDER_YELLOW = 4
-- Background.ZORDER_WHITE = 5

--
function Background:ctor()
	self._image = nil
	self._effectNode = cc.Node:create()
	self._imageCombine = nil
	self:addChild(self._effectNode, Background.ZORDER_EFFECT)

	self._layerWhite = nil
	self._layerYellow = nil
end

function Background:setBG(name)
	if self._image then
		self._image:removeFromParent(true)
		self._image = nil
	end
	-- self._image = cc.Sprite:create(Path.getFightSceneBackground(name))
	self._image = cc.Sprite:create(name)
	self._image:setAnchorPoint(cc.p(0.5, 0))
	local height = G_ResolutionManager:getDesignCCSize().height
	self._image:setPosition(cc.p(0, -height/2))
	self:addChild(self._image, Background.ZORDER_BACK)
end

--
function Background:createCombineBG()
	self._imageCombine = cc.Sprite:create("fight/scene/img_skill3bg.png")
	-- self._imageCombine:setScale(4)
	self._imageCombine:setScaleX(20)
	self._imageCombine:setScaleY(4.2)
	self:addChild(self._imageCombine, Background.ZORDER_COMBINE_BACK)
	-- self._imageCombine:setOpacity(0)
end

function Background:createEffect(effectName)
	self._effectNode:removeAllChildren()
	if effectName ~= "" then
		G_EffectGfxMgr:createPlayMovingGfx( self._effectNode, Path.getFightSceneEffect(effectName), nil, nil ,false ) 
	end
end

--
function Background:fadeInCombineBG()
	if not self._imageCombine then
		self:createCombineBG()
	end
	-- local action = cc.FadeIn:create(0.1)
	-- self._imageCombine:runAction(action)
	-- self._imageCombine:setOpacity(255)
	self._imageCombine:setVisible(true)
end

--
function Background:fadeOutCombineBG()
	if self._imageCombine then
		-- local action = cc.FadeOut:create(0.5)
		-- self._imageCombine:runAction(action)
		self._imageCombine:setVisible(false)
	end
end

-- function Background:showWhiteAndYellow(callback)
-- 	self._layerYellow = cc.LayerColor:create(cc.c4b(255, 255, 0, 255))
-- 	self._layerYellow:setAnchorPoint(0.5,0.5)
-- 	self._layerYellow:setIgnoreAnchorPointForPosition(false)
-- 	self._layerYellow:setContentSize(cc.size(3000, 3000))
-- 	-- self._layerYellow:setPositionY(self._layerYellow:getPositionY()+FightConfig.GAME_GROUND_FIX)
-- 	self:addChild(self._layerYellow, Background.ZORDER_YELLOW)

-- 	self._layerWhite = cc.LayerColor:create(cc.c4b(255, 255, 255, 255))
-- 	self._layerWhite:setAnchorPoint(0.5,0.5)
-- 	self._layerWhite:setIgnoreAnchorPointForPosition(false)
-- 	self._layerWhite:setContentSize(cc.size(3000, 3000))
-- 	-- self._layerWhite:setPositionY(self._layerWhite:getPositionY()+FightConfig.GAME_GROUND_FIX)
-- 	self:addChild(self._layerWhite, Background.ZORDER_WHITE)

-- 	local actionOut = cc.FadeOut:create(0)
-- 	local actionIn = cc.FadeIn:create(0)
-- 	local actionDelay = cc.DelayTime:create(FightConfig.SLOW_SCREEN_TIME)
-- 	local actionQueue = cc.Sequence:create(actionDelay, actionOut, actionDelay, actionIn)
-- 	local actionCallBack = cc.CallFunc:create(function() 
-- 			self._layerWhite:setVisible(false)
-- 			self._layerYellow:setVisible(false)
-- 			if callback then 
-- 				callback() 
-- 			end 
-- 		end)
-- 	local action = cc.Sequence:create(actionQueue, actionQueue, actionQueue, actionQueue, actionQueue, actionCallBack)

-- 	self._layerWhite:runAction(action)
-- end

return Background