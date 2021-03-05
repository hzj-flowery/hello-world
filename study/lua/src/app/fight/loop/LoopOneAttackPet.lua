local LoopAttackBase = require("app.fight.loop.LoopAttackBase")
local LoopOneAttackPet = class("LoopOneAttack", LoopAttackBase)
local HeroSkillActive = require("app.config.hero_skill_active")
local Engine = require("app.fight.Engine")
local HeroSkillEffect = require("app.config.hero_skill_effect")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")
local FightConfig = require("app.fight.Config")

function LoopOneAttackPet:ctor(data, index)
    LoopOneAttackPet.super.ctor(self, data, index)
	self:_makeAttacker()
	self:_makeTargets()
	self:_makeAddTargets()
	self._atkType = FightConfig.PET_ATTACK
end

function LoopOneAttackPet:_makeAttacker()
	self._unit = Engine.getEngine():getPetByCamp(self._data.petCamp, self._data.petId)		--攻击单位
    self._signalAttacker = self._unit.signalStateFinish:add(handler(self, self._onHitFinish))	--攻击者监听

    self._skillInfo = HeroSkillActive.get(self._data.skillId, 0, 0)
    assert(self._skillInfo, "wrong skill id "..tostring(self._data.skillId))

    local sceneSignal = Engine.getEngine():getSceneSignal():add(handler(self, self._onSceneFinish))
	table.insert(self._signals, sceneSignal) 
end

--执行攻击
function LoopOneAttackPet:execute()
	FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_ROUND_BUFF_CHECK)
	if self._skillInfo then
	end  
	self._unit:fade(true)
	LoopOneAttackPet.super.execute(self)
end

--开始攻击
function LoopOneAttackPet:_startSkill()
	self._unit:skill(self._skillInfo, self._targets)
	LoopOneAttackPet.super._startSkill(self)
	if self._skillInfo and self._skillInfo.skill_type == 2 then
		-- Engine.getEngine():dispatchPetSkillShiow(self._unit.camp, self._unit:getSkillAnim())
		local petId = self._unit:getResId()
		local color = self._unit:getColor()
		FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_PLAY_PET_SKILL, self._unit.camp, self._unit:getSkillAnim(), petId, color)
	end
end

--获得攻击unit的id
function LoopOneAttackPet:getUnitConfigId()
	return self._unit.configId
end

function LoopOneAttackPet:_processBuff(data)
	local buffData = data
	buffData.buffConfig = HeroSkillEffect.get(buffData.configId)
	-- buffData.attacker = self._unit.stageID 
	buffData.attacker = self._unit.camp  
	buffData.attackId = self._unit.camp    
	buffData.target = buffData.stageId		--被上buff的对象
	buffData.targets = {}					--被攻击的目标
	buffData.atkTargets = {}				--攻击者用buff目标
	buffData.checkCount = 0					--被攻击的检察数量
	buffData.atkCheckCount = 0				--攻击者的检查数量
	for _, hitter in pairs(self._targets.list) do
		if hitter.unit.to_alive then
			table.insert(buffData.targets, hitter.unit.stageID)	
		end
		table.insert(buffData.atkTargets, hitter.unit.stageID) 
	end
	buffData.totalCount = #buffData.targets
	buffData.atkTotalCount = #buffData.atkTargets
	buffData.attackIndex = self._index
	return buffData
end

--结束本次攻击轮次
function LoopOneAttackPet:_onFinish()
	for unit in Engine.getEngine():foreachUnit() do
		unit:setZOrderFix(0)
	end
	for pet in Engine.getEngine():foreachPet() do 
		pet:setZOrderFix(0)
	end
	local sceneView = Engine.getEngine():getView()
	sceneView:showSkill2Layer(false)
	LoopOneAttackPet.super._onFinish(self)
end

return LoopOneAttackPet