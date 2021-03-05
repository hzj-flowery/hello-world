local ViewBase = require("app.ui.ViewBase")
local FightStart = class("FightStart", ViewBase)
local BattleDataHelper = require("app.utils.BattleDataHelper")
local AudioConst = require("app.const.AudioConst")

function FightStart:ctor(battleData, battleSpeed)
	local size = G_ResolutionManager:getDesignCCSize()
	self._ScreenHight = size.height
    self._ScreenWidth = size.width
	self._isFinish = false
	self._battleData = battleData
	self._battleSpeed = battleSpeed
	
	FightStart.super.ctor(self)
end

function FightStart:onCreate()
	self._touchPanel = cc.Layer:create()
	self._touchPanel:setPosition(cc.p(self._ScreenWidth*0.5, self._ScreenHight*0.5))
	self._touchPanel:setContentSize(cc.size(self._ScreenWidth, self._ScreenHight))
	self._touchPanel:setTouchEnabled(true)
	self:addChild(self._touchPanel)
end

function FightStart:onEnter()
	self:playStartGfx()
end

function FightStart:playStartGfx()
	if self._battleData and self._battleData.battleType == BattleDataHelper.BATTLE_TYPE_ARENA then
		local ArenaFightStartAnimation = require("app.scene.view.arena.ArenaFightStartAnimation")
		self._animationPopup = ArenaFightStartAnimation.new(self._battleData, handler(self,self._onFinish))
		self._animationPopup:open()
	else
		self:_playCG()
	end
end
function FightStart:onExit()
	if self._animationPopup then
		self._animationPopup:removeFromParent()
	end
end

function FightStart:_playCG()
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_START_CG, self._battleSpeed)
    local function eventFunction(event)
        if event == "finish" then
			self:_onFinish()
        end
    end
    local  gfxEffect = G_EffectGfxMgr:createPlayGfx(self, "effect_zhandou_duijue", eventFunction, true)
    gfxEffect:setPosition(cc.p(self._ScreenWidth/2, self._ScreenHight/2))
end

function FightStart:_onFinish()
	local FightSignalConst = require("app.fight.FightSignalConst")
	local FightSignalManager = require("app.fight.FightSignalManager")
	FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_CHECK_LEAD)
	self._isFinish = true
end

function FightStart:isFinish()
	return self._isFinish
end

return FightStart