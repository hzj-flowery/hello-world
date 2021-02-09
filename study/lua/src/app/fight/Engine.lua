local Engine = class("Engine")
local scheduler = require("cocos.framework.scheduler")
local FightConfig = require("app.fight.Config")
-- local PrioritySignal = require("yoka.event.PrioritySignal")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")

local _engine = nil

local sharedScheduler = cc.Director:getInstance():getScheduler()

--
function Engine.create(scene)
	_engine = Engine.new(scene)
	return _engine
end
function Engine.clear()
	if _engine then
		_engine:_reset()
	end
	_engine = nil
end
function Engine.getEngine()
	return _engine
end

--
function Engine:ctor(scene)
	self._scene = scene
	self._interval = 0
	self._newInterval = 0
	self._nextInterval = 0
	self._running = false
	self._winCamp = 0		--胜利方

	self._units = {}
	self._pets = {}
	self._aliveUnits = {}
	self._aliveUnits[FightConfig.campLeft] = {}
	self._aliveUnits[FightConfig.campRight] = {}

	self._tracks = {}
	self._sceneFrontEffects = {}

	self._waves = nil
	self._isJump = false

	-- self.signal = PrioritySignal.new("string")

	self._runCount = 0	--跑图人数
	self._runFinishCount = 0	--完成跑图人数
	self._fightSpeed = 1

	self.leftName = nil
	self.rightName = nil
	self.leftOfficerLevel = nil
	self.rightOfficerLevel = nil
	self._monsterTalk = {}
	self._monsterEndTalk = {}
	self._doSlowAction = false

	self._preLoad = nil

	self._sounds = {}
end

--
function Engine:resetBattle()
	self._running = false
	self._interval = 0
	self._newInterval = 0
	self._nextInterval = 0
	self._aliveUnits = {}
	self._aliveUnits[FightConfig.campLeft] = {}
	self._aliveUnits[FightConfig.campRight] = {}
	self._tracks = {}
	self._sceneFrontEffects = {}
end

function Engine:_reset()
	self._interval = 0
	self._newInterval = 0
	self._nextInterval = 0
	self._running = false
	self._winCamp = 0		--胜利方
	self._units = {}
	self._pets = {}
	self._aliveUnits = {}
	self._aliveUnits[FightConfig.campLeft] = {}
	self._aliveUnits[FightConfig.campRight] = {}

	self._tracks = {}
	self._sceneFrontEffects = {}

	self._waves = nil
	self._isJump = false

	self._runCount = 0	--跑图人数
	self._runFinishCount = 0	--完成跑图人数
	self._fightSpeed = 1

	self.leftName = nil
	self.rightName = nil
	self.leftOfficerLevel = nil
	self.rightOfficerLevel = nil
	self._monsterTalk = {}
	self._monsterEndTalk = {}
	self._doSlowAction = false

	self._preLoad = nil

	self._sounds = {}
end

-----------------------------------------------------------------------------------------
--
function Engine:setupBattle(report)
	self:resetBattle()
	self._report = report
	-- self._report = nil

	self.leftName = self._report:getLeftName()
	self.rightName = self._report:getRightName()
	self.leftOfficerLevel = self._report:getAttackOfficerLevel()
	self.rightOfficerLevel = self._report:getDefenseOfficerLevel()	

	self._waves = self._report:getWaves()
	--self._waveCount = #self._report.waves
	self._waveCount = #self._waves
	self._waveId = 0
	--self:initUnit(self._waves[self._waveId]:getUnits())
	if report:isWin() then
		self._winCamp = FightConfig.campLeft
		self._loseCamp = FightConfig.campRight
	else
		self._winCamp = FightConfig.campRight
		self._loseCamp = FightConfig.campLeft
	end
	--
	self:setupWave()
end

--
function Engine:addMonsterTalk(talkConfig)
	self._monsterTalk[#self._monsterTalk+1] = talkConfig
end

function Engine:addLoseTalk(talkConfig)
	self._monsterEndTalk[#self._monsterEndTalk+1] = talkConfig
end

--
function Engine:checkMonsterTalk()
	if #self._monsterTalk ~= 0 then
		for i = 1, #self._monsterTalk do
			local talk = self._monsterTalk[i]
			if talk.round == self:getBattleRound() then
				for unit in self:foreachUnit() do
					local talkId = unit.monsterId
					if talkId == 0 then
						talkId = unit.configId
					end	
					if talkId == talk.target then
						local canTalk = true
						if talk.death ~= 0 then
							if talk.death ~= self:checkUnitFinalAlive(unit) then
								canTalk = false
							end
						end
						if canTalk then
							unit:talk(talk.position, talk.face, talk.bubble)
						end
						break
					end
				end			
			end
		end
	end	
end

--
function Engine:checkMosterEndTalk()
	if #self._monsterEndTalk == 0 then
		return 
	end
	for i = 1, #self._monsterEndTalk do 
		local talk = self._monsterEndTalk[i]
		for unit in self:foreachUnit() do 
			local talkId = unit.monsterId
			if talkId == talk.target and self:checkUnitFinalAlive(unit) then 
				unit:endTalk(talk.position, talk.face, talk.bubble)
				break
			end
		end
	end
end

--2 存活， 1 死亡
function Engine:checkUnitFinalAlive(unit)
	local wave = self._waves[self._waveId]
	for _, v in pairs(wave:getFinalUnits()) do
		local stageId = v.stageId
		if unit.stageID == stageId then
			return 2		
		end
	end
	return 1
end

--获得fightScene的信号
function Engine:getSceneSignal()
	return self._scene.signalStateFinish
end


--
function Engine:setupWave()
	self._waveId = self._waveId + 1
	local wave = self._waves[self._waveId]

	if #wave:getUnits() ~= 0 then
		self:initUnit(wave:getUnits())
		local enterList = wave:getFirstEnter()
		if #enterList ~= 0 then
			self:initEnter(enterList)
		end
	end

	if #wave:getPets() ~= 0 then
		self:initPet(wave:getPets())
	end

	self._loopWave = require("app.fight.loop.LoopWave").new(wave)
	self._loopWave.selfIndex = self._waveId

end

--

function Engine:getBattleRound()
	if self._loopWave then
		return self._loopWave._index
	end
	return 0
end

--
function Engine:startWithPreload(report, callback)
	self._preLoad = require("app.fight.Preload").new(report)
	self._preLoad.signalFinish:addOnce(function ()
		self:start()
		if callback then
			callback()
		end
	end)
	self._preLoad:start()
end

--
function Engine:start()
	if self._running then
		return
	end
	self._newInterval = nil
	self._interval = nil
	self._scheduler = scheduler.scheduleUpdateGlobal(handler(self, self.onLoop))
	self._running = true
end

function Engine:clearPreLoad()
	if self._preLoad then
		self._preLoad:removeLoadHandler()
		self._preLoad = nil
	end
end

--暂停战斗循环逻辑
function Engine:pause()
	if self._scheduler then
		scheduler.unscheduleGlobal(self._scheduler)
		self._scheduler = nil
	end
	self._running = false
end

--停止战斗，并清除缓存
function Engine:stop()
	if self._scheduler then
		scheduler.unscheduleGlobal(self._scheduler)
		self._scheduler = nil
	end
	self:clearPreLoad()
	self:unLoadSounds()
	self._running = false
end
--
function Engine:onLoop(f)
    local loops = 0
    if self._newInterval == nil or self._interval == nil then
    	self._newInterval = 0
    	self._interval = 0
    else
    	self._newInterval = self._newInterval + f
		self._interval = self._interval + FightConfig.interval*5
    end
	
	if self._interval > self._newInterval then
		self._interval = self._newInterval
	end
	-- release_print("Engine:onLoop f = " .. f)
	-- release_print("Engine:onLoop interval = " .. self._interval)
	-- release_print("Engine:onLoop newInterval = " .. self._newInterval)
	if self._newInterval > 0 and self._interval > 0 then
		while self._interval >= self._nextInterval and loops < 5 do
	        self:onLogicUpdate(FightConfig.interval)
	        self._nextInterval = self._nextInterval + FightConfig.interval
	        loops = loops + 1

	        -- release_print("Engine:onLoop loops = " .. loops)
	    	-- release_print("Engine:onLoop nextInterval = " .. self._nextInterval)
	    end

    
	    local interpolation = (self._interval + FightConfig.interval - self._nextInterval) / FightConfig.interval
	    -- release_print("Engine:onLoop interpolation = " .. interpolation)
	    self:onFrameUpdate(interpolation)
	end
end

--设置最后状态
function Engine:setFinalData()
	local wave = self._waves[self._waveId]
	for _, v in pairs(wave:getFinalUnits()) do
		local stageId = v.stageId
		local unit = self:getUnitById(stageId)
		if unit then
			unit:setFinalData(v)
		end
	end
end

--执行最后的状态
function Engine:doFinalAction()
	for unit in self:foreachUnit() do
		unit:doFinal()
	end	
end


function Engine:jumpToEnd()

	if not self._loopWave then
		return
	end
	self:setFinalData()
	self._isJump = true

	self._scene:stopFlash()
	--镜头拉回来
	self._scene:clearState()
	local viewport = cc.p(0, 0)
	self:setViewport(viewport)

	self:getView():showSkill3Layer(false)

	for i, v in pairs(self._tracks) do
		v:remove()
	end

	for i, v in pairs(self._sceneFrontEffects) do
		v:remove()
	end

	self._loopWave:onFinish()

	if self._waveId == #self._waves then
		self:doFinalAction()
		self:jumpWaveSignal()
		-- self:finishWave(self._waveId)
	end

end

function Engine:jumpWaveSignal()		--只是分发结束信号用于view的回掉结算，只是跳过
	-- local signal = Engine.SIGNAL_JUMP_WAVE
	-- self.signal:dispatch(signal)
	FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_JUMP_WAVE)
end

function Engine:doFinish()
	self:playWinAction()
	self:playPetEnd()
	self:changeBattleSpeed(1)
end

function Engine:finishWave(waveId)		--这个函数是做一部分表现
	FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_FINISH_WAVE, waveId)
	self:playWinAction()
	self:playPetEnd()
	if waveId == #self._waves then
		self:changeBattleSpeed(1)
	end

	local BuffManager = require("app.fight.BuffManager")
	BuffManager.getBuffManager():clearBuff()
end

--是否开始合击
-- function Engine:dispatchCombineSkill(isSkill)
-- 	if isSkill then
-- 		self.signal:dispatch(Engine.SIGNAL_IN_COMBINE)
-- 	else
-- 		self.signal:dispatch(Engine.SIGNAL_OUT_COMBINE)
-- 	end
-- end

--完成战斗后胜利动作
function Engine:playWinAction()
	for unit in self:foreachUnit() do
		if unit.is_alive and unit.camp == self._winCamp then
			unit:setWin()
			unit:setZOrderFix(0)
		end
	end	
	for pet in self:foreachPet() do 
		if pet.camp == self._winCamp then 
			pet:doWinAction()
		end
	end
	local sceneView = Engine.getEngine():getView()
	sceneView:showSkill2Layer(false)
end

--完成战斗后神兽的表现
function Engine:playPetEnd()
	-- local showLosePet = false
	-- for unit in self:foreachUnit() do 
	-- 	if unit.is_alive and unit.camp == self._loseCamp then 
	-- 		showLosePet = true
	-- 	end
	-- end
	-- local pet = self:getPetByCamp(self._loseCamp)
	-- if pet then
	-- 	pet:fade(showLosePet)
	-- end
	
end

function Engine:getWaveCount()
	return self._waveCount
end

function Engine:isUnitIdle()
	for unit in self:foreachUnit() do
		if unit:getState() ~= "StateIdle" then
			return false
		end
	end
	return true
end

function Engine:isUnitActorLoaded()
	for unit in self:foreachUnit() do
		if not unit:isSpineLoaded() then
			return false
		end
	end
	return true	
end

--
function Engine:onLogicUpdate(f)
	if not self._running then
		return
	end
	if self._loopWave then
		if not self._loopWave:isStart()  then
			if self:isUnitActorLoaded() then
				self._loopWave:start()
			end
		else
            if self._loopWave:isFinish() then
				--回合结束
				if self._waveId < #self._waves then
					if self._isJump then		--如果是点跳过，并且是
						self._loopWave:clear()
					end
					self._runCount = 0
					for unit in self:foreachUnit() do
						if unit:isFinalDie() and self._isJump then
							unit:doFinal()
						else
							unit:runMap()
							unit:setZOrderFix(0)
							self._runCount = self._runCount + 1
						end
					end	
					local sceneView = Engine.getEngine():getView()
					sceneView:showSkill2Layer(false)
					self._isJump = false
				else
					self:doFinish()
					FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_FIGHT_END)
				end
				self._loopWave = nil
			else
				self._loopWave:update(f)
			end
		end
	end
	--

	--
	local newUnits = {}
	for i,v in ipairs(self._units) do
		v:update(f)
		if not v:isRemove() then
			newUnits[#newUnits+1] = v
		else
			v:getActor():death()
			v:getBillBoard():showDead()
            v:getShadow():death()
            v:clearActor()
		end
	end
	self._units = newUnits

	local newTracks = {}
	for i,v in ipairs(self._tracks) do
		v:update(f)
		if not v:isRemove() then
			newTracks[#newTracks+1] = v
		else
            self._scene:removeEntity(v:getActor())
            v:clearActor()
		end
	end
	self._tracks = newTracks

	--
	local newEffects = {}
	for i,v in ipairs(self._sceneFrontEffects) do
		v:update(f)
		if not v:isRemove() then
			newEffects[#newEffects+1] = v
		else
            self._scene:removeEntityByFront(v:getActor())
		end
	end
	self._sceneFrontEffects = newEffects

	--pet
	local newPets = {}
	for i, v in pairs(self._pets) do 
		v:update(f)
		if not v:isRemove() then
			newPets[#newPets + 1] = v 
		else 
			v:getActor():death()
            v:getShadow():death()
            v:clearActor()
		end
	end
	self._pets = newPets

	
	--
	self._scene:update(f)
end

--
function Engine:onFrameUpdate(f)
	for i,v in ipairs(self._units) do
		v:updateFrame(f)
	end

	for i,v in ipairs(self._tracks) do
		if not v:isRemove() then
			v:updateFrame(f)
		end
	end

	--
	for i,v in ipairs(self._sceneFrontEffects) do
		if not v:isRemove() then
			v:updateFrame(f)
		end
	end

	--
	for i, v in pairs(self._pets) do 
		if not v:isRemove() then 
			v:updateFrame(f)
		end
	end

	--
	self._scene:updateFrame(f)
end

function Engine:isUnitInField(unitData)
    for _, unit in pairs(self._units) do
        if unit.stageID == unitData.stageId then
            return true
        end
    end
    return false
end

--
function Engine:initPet(list)
	local Pet = require("app.fight.UnitPet")
	for i, v in pairs(list) do 
		local pet = Pet.new(v)
		pet:createActor()
		pet:createBillBoard()
		pet:createShadow()
		self:addPet(pet)
	end
end

--
function Engine:addPet(pet)
	local petActor = pet:getActor()
	local billBoard = pet:getBillBoard()
	local shadow = pet:getShadow()
	table.insert(self._pets, pet)
	self._scene:addEntity(petActor)
	self._scene:addEntity(billBoard)
	self._scene:addEntity(shadow)
end

--
function Engine:initUnit(list, isReborn)	--是否重生
	local Unit = require("app.fight.Unit")
	for i,v in ipairs(list) do
		-- if not self:isUnitInField(v) then
			-- print("1112233 is unit in field", self:isUnitInField(v))
		local unit = Unit.new(v)
		-- unit:refreshData(v)
		unit:createActor()
		unit:createBillBoard()
		unit:createShadow()
		self:addUnit(unit, isReborn)
	end
end

function Engine:initEnter(list) 
	for unit in self:foreachUnit() do
	   unit.enterStage = false
	end
	for i, v in pairs(list) do
		self:getUnitById(v).enterStage = true
	end
end

--舞台id，物品id，入场后动作，入场后回掉
function Engine:createNewUnit(unitStageId, unitId, enterAction, callBack)
	local strUnit = 
	{
		stageId = unitStageId,                        --战场id
		configId = unitId,                       --表id
		maxHp = 100, 							--最大血量
		hp = 100, 							--血量
		anger = 3, 							--怒气
		rankLevel = 0,                      --突破等级
		monsterId = 0,
		limitLevel = 0,
		limitRedLevel = 0,
        showMark = {}
	}
	strUnit.camp = math.floor(unitStageId / 100)
	strUnit.cell = unitStageId % 10
	local Unit = require("app.fight.Unit")
	local unit = Unit.new(strUnit, enterAction, callBack)
	unit:createActor(true)
	unit:createShadow()
	unit:createBillBoard()
	self:addUnit(unit)
	unit:xingcaiIn()
end

--是否在待机位置添加unit
function Engine:addUnit(unit, isReborn)
	local camp = unit.camp
	local cell = unit.cell
	local actor = unit:getActor()
    local billboard = unit:getBillBoard()
	local shadow = unit:getShadow()
	local hitTipView = unit:getHitTipView()
	table.insert(self._units, unit)
	table.insert(self._aliveUnits[camp], unit)
	self._scene:addEntity(actor)
    self._scene:addEntity(billboard)
	self._scene:addEntity(shadow)
	self._scene:addTipView(hitTipView)
	
	local cells = FightConfig.cells[camp]
	if isReborn then
		actor:setVisible(true)
		unit:setPosition(cells[cell][1], cells[cell][2])
		unit:setTowards(unit.camp)
		unit:showRebornEffect()
	else
		unit:setPosition(cells[cell+6][1], cells[cell+6][2])
	end
    --unit:setScale(cells[cell][3])
	
	if camp == FightConfig.campLeft then

	elseif camp == FightConfig.campRight then

	end
end

function Engine:createProjectile(skillPlay, targets, startP, endP, attackId)
	local projectile = require("app.fight.Projectile").new(skillPlay, targets, endP, attackId)
	projectile:createActor()
	local actor = projectile:getActor()
	table.insert(self._tracks, projectile)
	self._scene:addEntity(actor, 0)
	projectile:setPosition(startP.x, startP.y)
	projectile:start()

	return projectile
end

function Engine:createFieldEffectByPos(name, pos, towards)


end

--
function Engine:createEffect(name, zOrderFix, towards)
	local effect = require("app.fight.Effect").new()
	effect:createActor(name)
	local actor = effect:getActor()
	table.insert(self._tracks, effect)
	self._scene:addEntity(actor, 0)
	--effect:setPosition(pos.x, pos.y)
	if towards then
		effect:setTowards(towards)
	end
	if zOrderFix then
		effect:setZOrderFix(zOrderFix)
	end
	effect:start()

	return effect
end

--
function Engine:createEffectBySceneFront(name, towards)
	local effect = require("app.fight.EffectScreen").new()
	effect:createActor(name)
	local actor = effect:getActor()
	table.insert(self._sceneFrontEffects, effect)
	self._scene:addEntityByFront(actor)
	if towards then
		effect:setTowards(towards)
	end
	effect:start()

	return effect
end


--
function Engine:shakeScene(ampX, ampY, atteCoef, timeCoef)
	self._scene:shake(ampX, ampY, atteCoef, timeCoef)
end

--
function Engine:setViewport(pos)
	self._scene:setViewport(pos)
end

--
function Engine:getViewport()
	return self._scene:getViewport()
end

--
function Engine:setScenePosition(x, y)
	self._scene:setFlashPosition(x, y)
end

--
function Engine:startFlashViewport(id, towards)
	self._scene:startFlashViewport(id, towards)
end

--
function Engine:checkUnitIdle(camp)
	for i,v in ipairs(self._units) do
		if (v.camp == camp or camp==nil) and v:getState() ~= "StateIdle" then
			return false
		end
	end
	
	return true
end
--
function Engine:getUnitByCell(camp, cell)
	for i,v in ipairs(self._units) do
		if v.cell == cell then
			return v
		end
	end

	return nil
end

--
function Engine:getUnitById(id)
	for i,v in ipairs(self._units) do
		if v.stageID == id then
			return v
		end
	end

	return nil
end

--
function Engine:getPetByCamp(camp, config)
	for i, v in pairs(self._pets) do 
		if v:getCamp() == camp and v:getConfigId() == config then
			return v
		end
	end
	return nil
end

function Engine:foreachPet()
	local list = self._pets
	local i = #list + 1
	return function()
		i = i - 1
		return list[i]
	end
end

--
function Engine:foreachUnit()
	local list = self._units
	local i = #list + 1
	return function()
		i = i - 1
		return list[i]
	end
end

--
function Engine:tipHit(pos, value, crit)
	if self._scene then
		self._scene:tipHit(pos, value, crit)
	end
end

-- function Engine:dispatchCheckLead()
-- 	self.signal:dispatch(Engine.SIGNAL_CHECK_LEAD)
-- end

function Engine:startBattle()
	local BuffManager = require("app.fight.BuffManager")
	BuffManager.getBuffManager():checkPoint(BuffManager.BUFF_FIGHT_OPENING)
	for unit in self:foreachUnit() do
		 -- unit:idle()
		unit:playStartBuff()
	end
	if self:getBattleRound() == 1 then	--第一轮对话放到杀之后
		self:checkMonsterTalk()
	end
end

--检查是否合击同伴在场
function Engine:hasPartner(camp, heroId)
	for unit in self:foreachUnit() do
		if unit.camp == camp and unit.configId == heroId then
			return true
		end
	end
	return false
end

function Engine:getView()
	return self._scene:getView()
end

function Engine:addCameraState(targetPos, time, isBack)
	self._scene:addCameraState(targetPos, time, isBack)
end

function Engine:addDieDrop(stageId, awards)
	self._scene:addDropItem(stageId, awards)
end

-- function Engine:dispatchDrop()
-- 	self.signal:dispatch(Engine.SIGNAL_DROP_ITEM)
-- end

--跑图到位信号处理
function Engine:runMapInPosition(stageId)
	local unit = self:getUnitById(stageId)
	unit:remove()
	self._runFinishCount = self._runFinishCount + 1
	if self._runFinishCount == self._runCount then
		self:finishWave(self._waveId)
		-- self.signal:dispatch(Engine.SIGNAL_RUN_MAP_FINISH)
		FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_RUN_MAP_FINISH)
	end
end

function Engine:getMaxRound()
	return self._report:getMaxRoundNum()
end

--
function Engine:getBattleSpeed()
	return self._fightSpeed
end

function Engine:changeBattleSpeed(speed)
	if speed then
		self._fightSpeed = speed
	end
	sharedScheduler:setTimeScale(self._fightSpeed)
	-- self._scheduler:setTimeScale(speed)
end

function Engine:getAttackConfigId()
	if not self._loopWave then 
		return 
	end
	local round = self._loopWave:getLoopRound()
	local loopAttack = round:getLoopAttack()
	if not loopAttack then 
		return 
	end
	local configId = loopAttack:getUnitConfigId()
	return configId
end

function Engine:getAttackIndex()
	if not self._loopWave then 
		return 
	end
    local round = self._loopWave:getLoopRound()
    if not round then 
        return 
    end
    local index = round:getAttackIndex()
    return index
end

function Engine:isUnitInFieldByConfigId(configId)
    for _, unit in pairs(self._units) do
        if unit.configId == configId then
            return true
        end
    end
    return false	
end

-- function Engine:dispatchCombineFlash(callback, flash)
-- 	self.signal:dispatch(Engine.SIGNAL_PLAY_COMBINE_FLASH, callback, flash)
-- end

function Engine:_nextJump()
	-- self._loopWave:startEnter()
end

-- function Engine:dispatchJumpTalk(heroId)
-- 	self.signal:dispatch(Engine.SIGNAL_JUMP_TALK, handler(self, self._nextJump), heroId)
-- end


function Engine:unitDie(unitId)
	FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_UNIT_DIE, unitId)
	-- self.signal:dispatch(Engine.SIGNAL_UNIT_DIE, unitId)
end

function Engine:dispatchLastHit(unit)
	if self._doSlowAction then
		return
	end
	if self._waveId ~= self._waveCount then
		return 
	end
	local isLastUnit = true
	for sunit in self:foreachUnit() do
		if sunit.camp == unit.camp and sunit.to_alive then
			isLastUnit = false
			break
		end
	end
	if isLastUnit then
		self:_doFinalSlowAction()
		FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_DO_FINAL_SLOW)
		-- self.signal:dispatch(Engine.SIGNAL_DO_FINAL_SLOW)
	end
end

function Engine:_finalSlowCallback()
	self:changeBattleSpeed()
	-- self._scene:getView():reCreateFront()
end

function Engine:_doFinalSlowAction()
	self._doSlowAction = true
	-- 把前景给隐藏了
	-- self._scene:getView():doFinalSlow()
	-- self._scene:stopFlash()
	sharedScheduler:setTimeScale(FightConfig.SLOW_ACTION_RET)
	local sceneView = Engine.getEngine():getView()
	sceneView:showFinalSlow(handler(self, self._finalSlowCallback))
end

-- function Engine:dispatchEndCG()
-- 	self.signal:dispatch(Engine.SIGNAL_SHOW_ENDCG)
-- end

function Engine:petsEnter()
	if self._pets ~= 0 then
		for i, v in pairs(self._pets) do 
			v:enterFightGround()
		end
	end
end

function Engine:playFeatures(stageId, skillId, callback)
	local unit = self:getUnitById(stageId)
	-- assert(unit, "stageid = "..stageId.." skillid = "..skillId)
	if unit then
		unit:playFeature(skillId, callback)
	end
end

-- function Engine:dispatchPetSkillShiow(camp, anim)
-- 	self.signal:dispatch(Engine.SIGNAL_PLAY_PET_SKILL, camp, anim)
-- end

function Engine:pushSound(soundPath)
	table.insert(self._sounds, soundPath)
end

function Engine:unLoadSounds()
	for _, v in pairs(self._sounds) do 
		G_AudioManager:unLoadSound(v)
	end
end

function Engine:getWaveId()
	return self._waveId
end

function Engine:makeUnitIdle()
    for i, v in pairs(self._units) do 
        if v:getState() == "StateOut" then 
            v:clearState()
        end
    end
end


return Engine