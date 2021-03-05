--慢动作的场景
local Slowground = class("Slowground", function()
	return cc.Node:create()
end)

local Path = require("app.utils.Path")

local FightConfig = require("app.fight.Config")
local Engine = require("app.fight.Engine")
local FightSignalManager = require("app.fight.FightSignalManager")
local FightSignalConst = require("app.fight.FightSignalConst")

Slowground.ZORDER_YELLOW = 1
Slowground.ZORDER_WHITE = 2

--
function Slowground:ctor()
end

--
function Slowground:showWhiteAndYellow(callback)
	self._layerYellow = cc.LayerColor:create(cc.c4b(255, 230, 0, 255))
	self._layerYellow:setAnchorPoint(0.5,0.5)
	self._layerYellow:setIgnoreAnchorPointForPosition(false)
	self._layerYellow:setContentSize(cc.size(3000, 3000))
	-- self._layerYellow:setPositionY(self._layerYellow:getPositionY()+FightConfig.GAME_GROUND_FIX)
	self:addChild(self._layerYellow, Slowground.ZORDER_YELLOW)

	self._layerWhite = cc.LayerColor:create(cc.c4b(255, 255, 255, 255))
	self._layerWhite:setAnchorPoint(0.5,0.5)
	self._layerWhite:setIgnoreAnchorPointForPosition(false)
	self._layerWhite:setContentSize(cc.size(3000, 3000))
	-- self._layerWhite:setPositionY(self._layerWhite:getPositionY()+FightConfig.GAME_GROUND_FIX)
	self:addChild(self._layerWhite, Slowground.ZORDER_WHITE)

	local actionOut = cc.FadeOut:create(0)
	local actionIn = cc.FadeIn:create(0)
	local actionDelay = cc.DelayTime:create(FightConfig.SLOW_SCREEN_TIME)
	local actionQueue = cc.Sequence:create(actionDelay, actionOut, actionDelay, actionIn)
	local actionCallBack = cc.CallFunc:create(function() 
			self._layerWhite:setVisible(false)
			self._layerYellow:setVisible(false)
			if callback then 
				callback() 
			end 
		end)
	local actionEndCG = cc.CallFunc:create(function()
			-- Engine.getEngine():dispatchEndCG()
			FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_SHOW_ENDCG)
		end)
	local action = cc.Sequence:create(actionQueue, actionQueue, actionQueue, actionEndCG, actionCallBack)

	self._layerWhite:runAction(action)
end

-- function Slowground:

return Slowground