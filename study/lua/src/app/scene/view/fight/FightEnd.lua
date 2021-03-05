local ViewBase = require("app.ui.ViewBase")
local FightEnd = class("FightEnd", ViewBase)
local BattleDataHelper = require("app.utils.BattleDataHelper")
local AudioConst = require("app.const.AudioConst")
local FightConfig = require("app.fight.Config")

function FightEnd:ctor(callback)
	self._ScreenHight = math.min(640, display.height)
    self._ScreenWidth = math.min(1136, display.width)
    self._callback = callback
	FightEnd.super.ctor(self)
end

function FightEnd:onCreate()
	self._touchPanel = cc.Layer:create()
	self._touchPanel:setPosition(cc.p(self._ScreenWidth*0.5, self._ScreenHight*0.5))
	self._touchPanel:setContentSize(cc.size(self._ScreenWidth, self._ScreenHight))
	self._touchPanel:setTouchEnabled(true)
	self:addChild(self._touchPanel)
end

function FightEnd:onEnter()
	self:playStartGfx()
end

function FightEnd:playStartGfx()
    self:_playCG()
	-- if self._battleData and self._battleData.battleType == BattleDataHelper.BATTLE_TYPE_ARENA then
	-- 	local ArenaFightStartAnimation = require("app.scene.view.arena.ArenaFightStartAnimation")
	-- 	self._animationPopup = ArenaFightStartAnimation.new(self._battleData, handler(self,self._onFinish))
	-- 	self._animationPopup:open()
	-- else
	-- 	self:_playCG()
	-- end
end
function FightEnd:onExit()

end

function FightEnd:_playCG()
    local function eventFunction(event)
        if event == "finish" then
			self:_onFinish()
        end
	end
	local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_END_CG)
	local  gfxEffect = G_EffectGfxMgr:createPlayGfx(self, "effect_zhandou_shengfu", eventFunction, true)
    gfxEffect:setPosition(G_ResolutionManager:getDesignCCPoint())
end

function FightEnd:_onFinish()
	if self._callback then
		local actionDelay = cc.DelayTime:create(FightConfig.END_DELAY_TIME) 
		local actionFunc = cc.CallFunc:create(function() self._callback() end)
		local action = cc.Sequence:create(actionDelay, actionFunc)
		self:runAction(action)
        -- self._callback()
    end
	-- local Engine = require("app.fight.Engine")
	-- Engine.getEngine():dispatchCheckLead()
	-- self._isFinish = true
end

return FightEnd