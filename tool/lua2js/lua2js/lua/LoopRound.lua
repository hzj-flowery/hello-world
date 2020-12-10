local Loop = require("app.fight.loop.Loop")
local LoopRound = class("LoopRound", Loop)

local FightSignalManager = require("app.fight.FightSignalManager")
local FightSignalConst = require("app.fight.FightSignalConst")

local FightConfig = require("app.fight.Config")

--
function LoopRound:ctor(data)
	LoopRound.super.ctor(self)
	self._data = data
	self._index = 1     --attack序列号
	self._attack = nil
    self._buff = nil
    self._attackIndex = 0   --execute的attack序列号
end

--
function LoopRound:start()
	LoopRound.super.start(self)
	self._index = 1
	FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_ROUND_START)
end

--
function LoopRound:checkAttack()
	if self._attack == nil then
		local attackData = self._data.attacks[self._index]
		if attackData.isPet then
			self._attack = require("app.fight.loop.LoopOneAttackPet").new(attackData, self._index)
		elseif attackData.isHistory then 
			self._attack = require("app.fight.loop.LoopOneAttackHistory").new(attackData, self._index)
		else
			self._attack = require("app.fight.loop.LoopOneAttack").new(attackData, self._index)
		end
	end
end

--
function LoopRound:update(f)
	if self._index > #self._data.attacks then
		-- if self:checkUnitIdle() then
			self._finish = true
		-- end
	else
		self:checkAttack()
		if self._attack then
			if self._attack:isFinish() then
				self._attack:clear()
				self._attack = nil
				self._index = self._index + 1
			else
				if self._attack:isExecute() then
                    self._attack:execute()
                    self._attackIndex = self._attackIndex + 1
				end
			end
		end
	end
end

function LoopRound:getLoopAttack()
	if not self._attack then 
		return 
	end
	local type = self._attack:getAttackType()
	if type ~= FightConfig.HISTORY_ATTACK then
		return self._attack
	end
end

function LoopRound:clear()
	if not self._attack then 
		return 
	end
	self._attack:clear()
	self._attack = nil
end

function LoopRound:onFinish()
	local BuffManager = require("app.fight.BuffManager")
	BuffManager.getBuffManager():checkRoundEndAnger(self._data.angers)
    LoopRound.super.onFinish(self)
end

function LoopRound:getAttackIndex()
    return self._index
end

return LoopRound