local SceneView = class("SceneView", function()
	return cc.Node:create()
end)
local Viewport = require("app.fight.scene.Viewport")

local FightConfig = require("app.fight.Config")
local BattleScene = require("app.config.battle_scene")

--
function SceneView:ctor()

    local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()

	self._sceneWidth = width
	self._sceneHeight = height

	self._farGround = require("app.fight.scene.FarGround").new()
	self:addChild(self._farGround)

	self._grdBack = require("app.fight.scene.Background").new()
	self:addChild(self._grdBack)

	self._grdFlash = require("app.fight.scene.Flashground").new()
	self:addChild(self._grdFlash)

	self._grdSlow = require("app.fight.scene.Slowground").new()
	self:addChild(self._grdSlow)

	self._grdGame = require("app.fight.scene.Gameground").new()
	self._grdGame:setPosition(0, -FightConfig.GAME_GROUND_FIX)
	self:addChild(self._grdGame)

	self._grdFront = require("app.fight.scene.Frontground").new()
	self:addChild(self._grdFront)

	self._attenuator = require("app.fight.scene.Attenuator").new(self)
end

function SceneView:resetScene(sceneId)
	local mapData = BattleScene.get(sceneId)
	assert(mapData, "wrong scene id "..sceneId)
	local turn = 1
	if mapData.is_turn == 1 then
		turn = -1
	end
	self._farGround:setBG(mapData.farground)
	self._farGround:setScaleX(turn)
	self._farGround:createEffect(mapData.back_eft)
	self._grdBack:setBG(mapData.background)
	self._grdBack:setScaleX(turn)
	self._grdBack:createEffect(mapData.middle_eft)
	self._grdFront:setScaleX(turn)
	self._grdFront:createEffect(mapData.front_eft)
end

function SceneView:doFinalSlow()
	-- print("1112233 set front visible false")
	-- self._grdFront:setVisible(false)
	-- self._grdFront:removeEffect()
end

function SceneView:reCreateFront()
	-- self._grdFront:reCreateEffect()
end

--
function SceneView:getBackGround()
	return self._grdBack
end

--
function SceneView:getFlashGround()
	return self._grdFlash
end

--
function SceneView:addEntityActor(actor)
	self._grdGame:addActor(actor)
end



function SceneView:removeActorByName(name)
	self._grdGame:removeActorByName(name)
end
--
function SceneView:removeEntityActor(actor)
	self._grdGame:removeActor(actor)
end

--
function SceneView:addTipView(view)
	self._grdGame:addTipView(view)
end

--
function SceneView:shake(ampX, ampY, atteCoef, timeCoef)
	self._attenuator:start(ampX, ampY, atteCoef, timeCoef)
end

--掉落
function SceneView:addDrop(stageId, awards)
	self._grdGame:addDrop(stageId, awards)
end

function SceneView:showSkill2Layer(s)
	self._grdGame:showLayerBlack(s)
	self._grdFront:setVisible(not s)
end

function SceneView:showSkill3Layer(s)
	if s then
		self._grdBack:fadeInCombineBG()
	else	
		self._grdBack:fadeOutCombineBG()
	end
	self._grdFront:setVisible(not s)
end

function SceneView:showFinalSlow(callback)
	self._grdGame:showLayerBlack(false)
	self._grdSlow:showWhiteAndYellow(callback)
end

return SceneView