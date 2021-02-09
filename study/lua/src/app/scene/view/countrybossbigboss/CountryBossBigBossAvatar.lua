
-- Author: nieming
-- Date:2018-05-12 15:35:25
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CountryBossBigBossAvatar = class("CountryBossBigBossAvatar", ViewBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")

CountryBossBigBossAvatar.IDLE_STATE = 1
CountryBossBigBossAvatar.ATTACK_STATE = 2
CountryBossBigBossAvatar.DIE_STATE = 3


function CountryBossBigBossAvatar:ctor(bossId)
	--csb bind var name
	self._commonHeroAvatar = nil  --CommonHeroAvatar
	self._nodeRole = nil  --Panel
	self._textBossName = nil  --Text
	self._topNodeInfo = nil  --Panel
	self._bossId = bossId
	self._state = CountryBossBigBossAvatar.IDLE_STATE
	self._isLeft = false

	local configs = {
		[9] = {attackName = "style", hitDelayTime = 1, flyDelayTime = 1.5, isAttackAll = true}, --曹操
		[10] = {attackName = "style", hitDelayTime = 1.2, flyDelayTime = 2.5, isAttackAll = true}, --诸葛亮
		[11] = {attackName = "style", hitDelayTime = 1.3, flyDelayTime = 1.8, stopAttackDelay = 2.2, isAttackAll = false}, --周瑜
		[12] = {attackName = "style", hitDelayTime = 0.3,  flyDelayTime = 2.4, stopAttackDelay = 3, isAttackAll = false}, --吕布
	}
	self._actionConfig = configs[self._bossId]
	assert(self._actionConfig ~= nil, "can not find boss action config")

	local resource = {
		file = Path.getCSB("CountryBossBigBossAvatar", "countrybossbigboss"),
	}
	CountryBossBigBossAvatar.super.ctor(self, resource)
end
-- Describle：
function CountryBossBigBossAvatar:onCreate()
	local cfg = CountryBossHelper.getBossConfigById(self._bossId)
	self._textBossName:setString(cfg.name)
	self._commonHeroAvatar:updateUI(cfg.hero_id)
	self._commonHeroAvatar:setCallBack(handler(self, self._onBtnGo))
	self._commonHeroAvatar:setTouchEnabled(true)
	local isDie = self:isBossDie()

	self:updateState()
	if isDie then
		self._state = CountryBossBigBossAvatar.DIE_STATE
	else
		self._state = CountryBossBigBossAvatar.IDLE_STATE
	end
	--测试
	-- local seqAction = self:_createDelayAction(5, function()
	-- 	logError("boss die====================")
	-- 	self._testBossDie = true
	-- 	G_SignalManager:dispatch(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS)
	-- end)
	-- self:runAction(seqAction)
end

function CountryBossBigBossAvatar:playerAttack()
	if self._state ==  CountryBossBigBossAvatar.IDLE_STATE then
		self._state = CountryBossBigBossAvatar.ATTACK_STATE
		self._commonHeroAvatar:playEffectOnce(self._actionConfig.attackName)
		self._commonHeroAvatar:showShadow(false)
		if self._actionConfig.stopAttackDelay then
			local seqAction = self:_createDelayAction(self._actionConfig.stopAttackDelay, function()
				self:_returnToNormal()
			end)
			self:runAction(seqAction)
		else
			self._commonHeroAvatar:addSpineLoadHandler(function()
				self:_returnToNormal()
			end)
		end
	end
end


function CountryBossBigBossAvatar:_returnToNormal()
	if not self._commonHeroAvatar then
		return
	end
	self._commonHeroAvatar:setAction("idle", true)
	self._state = CountryBossBigBossAvatar.IDLE_STATE
	self._commonHeroAvatar:showShadow(true)
end

function CountryBossBigBossAvatar:_createDelayAction(dt, callback)
    local delayAction = cc.DelayTime:create(dt)
	local callFuncAction = cc.CallFunc:create(callback)
	local seqAction = cc.Sequence:create(delayAction, callFuncAction)
    return seqAction
end

function CountryBossBigBossAvatar:isIdle()
	return self._state == CountryBossBigBossAvatar.IDLE_STATE
end

function CountryBossBigBossAvatar:isAttackAll()
	return self._actionConfig.isAttackAll
end

function CountryBossBigBossAvatar:getHitDelayTime()
	return self._actionConfig.hitDelayTime
end

function CountryBossBigBossAvatar:getFlyDelayTime()
	return self._actionConfig.flyDelayTime
end

function CountryBossBigBossAvatar:turnBack(trueOrFalse)
	if trueOrFalse == false then
		self._isLeft = false
	else
		self._isLeft = true
	end
	self._commonHeroAvatar:turnBack(trueOrFalse)
end

function CountryBossBigBossAvatar:isLeft()
	return self._isLeft
end
-- Describle：
function CountryBossBigBossAvatar:onEnter()

end

-- Describle：
function CountryBossBigBossAvatar:onExit()

end

function CountryBossBigBossAvatar:isBossDie()
	return CountryBossHelper.isBossDie(self._bossId)
end

function CountryBossBigBossAvatar:_playDieCallBack()
	self:updateState()
	if self._bossDieCallback then
		self._bossDieCallback()
	end
end

function CountryBossBigBossAvatar:setPlayBossDieCallback(callback)
	self._bossDieCallback = callback
end


function CountryBossBigBossAvatar:updateState()
	self._isDie:setVisible(self:isBossDie())
end

function CountryBossBigBossAvatar:playBossDie()
	if self._state ~=  CountryBossBigBossAvatar.IDLE_STATE then
		return
	end
	self._state = CountryBossBigBossAvatar.DIE_STATE
	self:_playDieCallBack()
	-- self._commonHeroAvatar:playEffectOnce("hitfly")
	-- local seqAction = self:_createDelayAction(0.2, function()
	-- 	self._commonHeroAvatar:playEffectOnce("hitfall")
	-- 	local seqAction2 = self:_createDelayAction(0.2, function()
	-- 		self._commonHeroAvatar:playEffectOnce("hitlie")
	-- 		self._commonHeroAvatar:addSpineLoadHandler(function()
	-- 			local seqAction3 = self:_createDelayAction(0.8, function()
	-- 				self._commonHeroAvatar:setAction("idle", true)
					-- self:_playDieCallBack()
	-- 			end)
	-- 			self:runAction(seqAction3)
	-- 		end)
	-- 	end)
	-- 	self:runAction(seqAction2)
	-- end)
	-- self:runAction(seqAction)
end


function CountryBossBigBossAvatar:_onBtnGo()
	local bossData = G_UserData:getCountryBoss():getBossDataById(self._bossId)
	if not bossData then
		return
	end
	if bossData:isBossDie() then
		G_Prompt:showTip(CountryBossHelper.getKillTip(self._bossId))
		return
	end
	if CountryBossHelper.getStage() ~= CountryBossConst.STAGE3 then
		G_Prompt:showTip(Lang.get("country_boss_fight_time_end"))
		return
	end
	local cdTime = CountryBossHelper.getStage3AttackCd()
	local canFightTime = cdTime + G_UserData:getCountryBoss():getChallenge_boss_time2()
	local curTime = G_ServerTime:getTime()
	if curTime < canFightTime then
		G_Prompt:showTip(Lang.get("country_boss_fight_cd"))
		return
	end
	G_UserData:getCountryBoss():c2sAttackCountryBoss(self._bossId)
end


return CountryBossBigBossAvatar
