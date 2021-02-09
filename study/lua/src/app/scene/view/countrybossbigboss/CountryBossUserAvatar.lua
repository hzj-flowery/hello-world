-- Author: nieming
-- Date:2018-05-12 15:35:39
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CountryBossUserAvatar = class("CountryBossUserAvatar", ViewBase)
local UIActionHelper = require("app.utils.UIActionHelper")

CountryBossUserAvatar.IDLE_STATE = "Idle"
CountryBossUserAvatar.RUNTOATTACK_STATE = "RunToAttack"
CountryBossUserAvatar.RUNTOCONST_STATE = "RunToConst"
CountryBossUserAvatar.ATTACK_STATE = "Attack"
CountryBossUserAvatar.HIT_STATE = "Hit"
CountryBossUserAvatar.FLY_STATE = "Fly"
CountryBossUserAvatar.WIN_STATE = "Win"

local SPEED = 500

function CountryBossUserAvatar:ctor(callback)
	--csb bind var name
	self._commonHeroAvatar = nil --CommonHeroAvatar
	self._nodeRole = nil --Panel
	self._textOfficialName = nil --Text
	self._textUserName = nil --Text
	self._topNodeInfo = nil --Panel

	self._stateChangeCallback = callback
	local resource = {
		file = Path.getCSB("CountryBossUserAvatar", "countrybossbigboss")
	}
	CountryBossUserAvatar.super.ctor(self, resource)
end

-- Describle：
function CountryBossUserAvatar:onCreate()
end

function CountryBossUserAvatar:updateData(data)
	if not data then
		return
	end
	self._data = data

	self:_updateUI()
	self:_initStateMachine()
end

function CountryBossUserAvatar:_updateUI()
	self._isLeft = false
	self._fixIndex = 0 --固定索引
	self._slotIndex = 0 -- 攻击站位索引

	self:setPlayerName(self._data.name, self._data.officialLevel)
	self._commonHeroAvatar:updateUI(self._data.baseId, nil, nil, self._data.limitLevel)
	self._commonHeroAvatar:showTitle(self._data.titleId,self.__cname)  -- 显示称号
end

function CountryBossUserAvatar:setPlayerName(name, officialLevel)
	self._textUserName:setString(name)
	self._textOfficialName:setVisible(true)
	if officialLevel then
		local officialInfo = G_UserData:getBase():getOfficialInfo(officialLevel)
		if officialInfo == nil then
			return
		end
		self:updateLabel(
			"_textUserName",
			{
				color = Colors.getOfficialColor(officialLevel),
				outlineColor = Colors.getOfficialColorOutline(officialLevel)
			}
		)

		self:updateLabel(
			"_textOfficialName",
			{
				text = "[" .. officialInfo.name .. "]",
				color = Colors.getOfficialColor(officialLevel),
				outlineColor = Colors.getOfficialColorOutline(officialLevel)
			}
		)
	else
		self._textOfficialName:setVisible(false)
	end
end

function CountryBossUserAvatar:_initStateMachine()
	if self._stateMachine then
		return
	end
	local cfg = {
		["defaultState"] = CountryBossUserAvatar.IDLE_STATE,
		["stateChangeCallback"] = handler(self, self._changeCallback),
		["state"] = {
			[CountryBossUserAvatar.IDLE_STATE] = {
				["nextState"] = {
					[CountryBossUserAvatar.RUNTOATTACK_STATE] = {
						["transition"] = handler(self, self._transitionIdleToRunToAttack),
						["stopTransition"] = handler(self, self._stopTransitionIdleToRunToAttack)
					},
					[CountryBossUserAvatar.RUNTOCONST_STATE] = {},
					[CountryBossUserAvatar.WIN_STATE] = {}
				},
				["didEnter"] = handler(self, self._didEnterIdle)
			},
			[CountryBossUserAvatar.RUNTOATTACK_STATE] = {
				["nextState"] = {
					[CountryBossUserAvatar.ATTACK_STATE] = {},
					[CountryBossUserAvatar.WIN_STATE] = {}
				},
				["didEnter"] = handler(self, self._didEnterRunToAttack)
			},
			[CountryBossUserAvatar.RUNTOCONST_STATE] = {
				["nextState"] = {
					[CountryBossUserAvatar.ATTACK_STATE] = {},
					[CountryBossUserAvatar.IDLE_STATE] = {}
				},
				["didEnter"] = handler(self, self._didEnterRunToConst)
			},
			[CountryBossUserAvatar.ATTACK_STATE] = {
				["nextState"] = {
					[CountryBossUserAvatar.FLY_STATE] = {},
					[CountryBossUserAvatar.HIT_STATE] = {},
					[CountryBossUserAvatar.WIN_STATE] = {}
				},
				["didEnter"] = handler(self, self._didEnterAttack)
			},
			[CountryBossUserAvatar.HIT_STATE] = {
				["nextState"] = {
					[CountryBossUserAvatar.FLY_STATE] = {},
					[CountryBossUserAvatar.HIT_STATE] = {}
				},
				["didEnter"] = handler(self, self._didEnterHit)
			},
			[CountryBossUserAvatar.FLY_STATE] = {
				["nextState"] = {
					[CountryBossUserAvatar.IDLE_STATE] = {}
				},
				["didEnter"] = handler(self, self._didEnterFly)
			},
			[CountryBossUserAvatar.WIN_STATE] = {
				["didEnter"] = handler(self, self._didEnterWin)
			}
		}
	}

	local StateMachine = require("app.scene.view.countrybossbigboss.StateMachine")
	self._stateMachine = StateMachine.new(cfg)
end

function CountryBossUserAvatar:_changeCallback(newState, oldState)
	if self._stateChangeCallback then
		self._stateChangeCallback(self, newState, oldState)
	end
end

function CountryBossUserAvatar:_didEnterIdle()
	self._commonHeroAvatar:setAction("idle", true)
	self._commonHeroAvatar:showShadow(true)
end

function CountryBossUserAvatar:_didEnterRunToAttack(targetPos)
	self._commonHeroAvatar:setAction("run", true)
	self._commonHeroAvatar:showShadow(true)

	if self:getFixIndex() == 0 then
		local curPos = self:_getRandomPos()
		self:setPosition(curPos)
	end

	if not targetPos then
		assert(false, "please input curPos and targetPos")
		return
	end
	self:_setTargetPos(targetPos)
end

function CountryBossUserAvatar:_didEnterRunToConst(targetPos)
	self._commonHeroAvatar:setAction("run", true)
	self._commonHeroAvatar:showShadow(true)

	if not targetPos then
		assert(false, "please input targetPos")
		return
	end
	local curPos = self:_getRandomPos()
	self:setPosition(curPos)
	self:_setTargetPos(targetPos)
end

function CountryBossUserAvatar:_didEnterAttack()
	self._commonHeroAvatar:setAction("skill1", true)
	self._commonHeroAvatar:showShadow(false)
end

function CountryBossUserAvatar:_didEnterHit()
	self._commonHeroAvatar:setAction("hit", true)
	self._commonHeroAvatar:showShadow(true)
end

function CountryBossUserAvatar:_didEnterFly()
	self._commonHeroAvatar:setAction("hitfly", true)
	self._commonHeroAvatar:showShadow(false)
	self:_startFlyAction()
end

function CountryBossUserAvatar:_didEnterWin()
	self._commonHeroAvatar:setAction("win", true)
	self._commonHeroAvatar:showShadow(true)
end

function CountryBossUserAvatar:_stopTransitionIdleToRunToAttack()
	self:stopAllActions()
end
function CountryBossUserAvatar:_transitionIdleToRunToAttack(finishFunc)
	local dt = 0
	if self:getSlotIndex() == 2 then
		dt = math.random(0, 60)
	else
		dt = math.random(40, 100)
	end
	dt = dt / 100
	local seqAction =
		UIActionHelper.createDelayAction(
		dt,
		function()
			finishFunc()
		end
	)
	self:runAction(seqAction)
end

function CountryBossUserAvatar:turnBack(trueOrFalse)
	self._commonHeroAvatar:turnBack(trueOrFalse)
end

function CountryBossUserAvatar:setIsLeft(trueOrFalse)
	self._isLeft = trueOrFalse
	if self._isLeft then
		self:turnBack(false)
	else
		self:turnBack()
	end
end

function CountryBossUserAvatar:isLeft()
	return self._isLeft
end
--
function CountryBossUserAvatar:setFixIndex(fixIndex)
	self._fixIndex = fixIndex
end

function CountryBossUserAvatar:getFixIndex()
	return self._fixIndex
end

function CountryBossUserAvatar:getUserId()
	return self._data.userId or 0
end

function CountryBossUserAvatar:setSlotIndex(index)
	self._slotIndex = index
end

function CountryBossUserAvatar:getSlotIndex(index)
	return self._slotIndex
end

function CountryBossUserAvatar:switchState(state, params, isForceStop)
	self._stateMachine:switchState(state, params, isForceStop)
end

function CountryBossUserAvatar:getCurState()
	return self._stateMachine:getCurState()
end

function CountryBossUserAvatar:canSwitchToState(nextState)
	return self._stateMachine:canSwitchToState(nextState)
end

-- 获取随机位置
function CountryBossUserAvatar:_getRandomPos()
	local maxY = 200
	local posy = math.random(0, 2 * maxY)
	local posy = posy - maxY
	if self:isLeft() then
		return cc.p(G_ResolutionManager:getDesignWidth() / -2 - 100, posy)
	else
		return cc.p(G_ResolutionManager:getDesignWidth() / 2 + 100, posy)
	end
end

function CountryBossUserAvatar:_setTargetPos(pos)
	self._targetPos = pos
	local startX, startY = self:getPosition()
	local dy = pos.y - startY
	local dx = pos.x - startX
	local k = math.sqrt(dy * dy + dx * dx)
	self._kx = dx / k
	self._ky = dy / k
end

function CountryBossUserAvatar:_stopMove()
	self._targetPos = nil
	self._kx = 0
	self._ky = 0
	local curstate = self:getCurState()
	if curstate == CountryBossUserAvatar.RUNTOATTACK_STATE then
		self:switchState(CountryBossUserAvatar.ATTACK_STATE)
	elseif curstate == CountryBossUserAvatar.RUNTOCONST_STATE then
		self:switchState(CountryBossUserAvatar.IDLE_STATE)
	else
		self:switchState(CountryBossUserAvatar.IDLE_STATE)
	end
end

-- 初始化 飞 参数
function CountryBossUserAvatar:_startFlyAction()
	if self._startPlayFly then
		return
	end
	local p1x, p1y = self:getPosition()
	local distance = G_ResolutionManager:getDesignWidth() / 2 - math.abs(p1x) + math.random(60, 150)
	local p1 = cc.p(p1x, p1y)
	local p2 = cc.p(0, 0)
	local p3 = cc.p(0, p1.y)
	if p1.x > 0 then
		p3.x = p1.x + distance
		p2.x = p1.x + distance / 2
		p2.y = p1.y + math.random(300, 400)
		self._targetRotate = 50
	else
		p3.x = p1.x - distance
		p2.x = p1.x - distance / 2
		p2.y = p1.y + math.random(300, 400)
		self._targetRotate = -50
	end
	self._bezierPos1 = p1
	self._bezierPos2 = p2
	self._bezierPos3 = p3
	self._bezierTime = distance / 300
	self._curBezierTime = 0
	self._startPlayFly = true

	self._flyActionMoveEndCallBack = callback
	self:setRotation(0)
end
--变速曲线
function CountryBossUserAvatar:_flyCurveFunc(t)
	return -1 * (t - 1) * (t - 1) + 1
end

function CountryBossUserAvatar:_getBezierPos(t)
	local k1 = (1 - t) * (1 - t)
	local k2 = 2 * t * (1 - t)
	local k3 = t * t
	local x = k1 * self._bezierPos1.x + k2 * self._bezierPos2.x + k3 * self._bezierPos3.x
	local y = k1 * self._bezierPos1.y + k2 * self._bezierPos2.y + k3 * self._bezierPos3.y
	return cc.p(x, y)
end

function CountryBossUserAvatar:_flyUpdate(t)
	if self._startPlayFly then
		self._curBezierTime = self._curBezierTime + t
		local percent = self._curBezierTime / self._bezierTime
		if percent >= 1 then
			percent = 1
		end
		percent = self:_flyCurveFunc(percent)
		local pos = self:_getBezierPos(percent)
		self:setPosition(pos)
		-- 旋转
		if math.abs(pos.x) < math.abs(self._bezierPos2.x) then
			--当前没到最高点
			local rPercent = math.abs((pos.x - self._bezierPos1.x) / (self._bezierPos2.x - self._bezierPos1.x))
			self:setRotation(self._targetRotate * rPercent)
		end

		if percent == 1 then
			self._startPlayFly = false
			self:setRotation(0)
			self:switchState(CountryBossUserAvatar.IDLE_STATE)
			if self._flyActionMoveEndCallBack then
				self._flyActionMoveEndCallBack(self)
			end
		end
	end
end

-- --跑步
function CountryBossUserAvatar:_runUpdate(dt)
	if self._targetPos then
		local posx, posy = self:getPosition()
		local d = SPEED * dt
		local dx = d * self._kx
		local dy = d * self._ky
		local x, y

		if math.abs(self._targetPos.x - posx) < math.abs(dx) then
			x = self._targetPos.x
		else
			x = posx + dx
		end

		if math.abs(self._targetPos.y - posy) < math.abs(dy) then
			y = self._targetPos.y
		else
			y = posy + dy
		end
		self:setPosition(cc.p(x, y))
		self:setLocalZOrder(-1 * y)
		if x == self._targetPos.x and y == self._targetPos.y then
			self:_stopMove()
		end
	end
end

function CountryBossUserAvatar:_update(dt)
	self:_flyUpdate(dt)
	self:_runUpdate(dt)
end

-- Describle：
function CountryBossUserAvatar:onEnter()
end

-- Describle：
function CountryBossUserAvatar:onExit()
end

function CountryBossUserAvatar:clean()
	self._targetPos = nil
	self._startPlayFly = nil
end

return CountryBossUserAvatar
