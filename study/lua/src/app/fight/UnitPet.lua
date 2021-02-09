local Entity = require("app.fight.Entity")
local UnitPet = class("UnitPet", Entity)

local StateIdle = require("app.fight.states.StateIdle")
local StateMove = require("app.fight.states.StateMove")
local StateSkill = require("app.fight.states.StateSkill")
local StatePetShow = require("app.fight.states.StatePetShow")
local StatePetEnter = require("app.fight.states.StatePetEnter")
local StateWait = require("app.fight.states.StateWait")

local HeroRes = require("app.config.hero_res")
local HeroSkillPlay = require("app.config.hero_skill_play")
local Pet = require("app.config.pet")

local FightConfig = require("app.fight.Config")
local BuffManager = require("app.fight.BuffManager")
local StateAttackFinish = require("app.fight.states.StateAttackFinish")
local StateBuff = require("app.fight.states.StateBuff")


function UnitPet:ctor(data)
    UnitPet.super.ctor(self)

	self.camp = data.camp
    self._configId = data.configId 
	self._star = data.star 
	self._configData = Pet.get(data.configId)
	assert(self._configData, "pet data is nil id = "..data.configId)
	self._resData = HeroRes.get(self._configData.res_id)
	assert(self._resData, "pet res id nil id = "..self._configData.res_id)

	self._skillAnim = FightConfig.PET_SKILL_ANIM[self.camp]
	--写死一波技能字体，到时候改
	-- if self._resData.id == 701 then 	--熊猫
	-- 	self._skillAnim = FightConfig.PANDA_SKILL_ANIM[self.camp]
	-- elseif self._resData.id == 702 then 	--鹿
	-- 	self._skillAnim = FightConfig.LU_SKILL_ANIM[self.camp]
	-- elseif self._resData.id == 703 then		--青鸾
	-- 	self._skillAnim = FightConfig.QINGLUAN_SKILL_ANIM[self.camp]
	-- elseif self._resData.id == 704 then 	--烈火狐
	-- 	self._skillAnim = FightConfig.LIEHUOHU_SKILL_ANIM[self.camp]
	-- elseif self._resData.id == 705 then 	--青龙
	-- 	self._skillAnim = FightConfig.QINGLONG_SKILL_ANIM[self.camp]
	-- elseif self._resData.id == 708 then 	--玄武
	-- 	self._skillAnim = FightConfig.XUANWU_SKILL_ANIM[self.camp]
	-- elseif self._resData.id == 709 then 	--狗鲲
	-- 	self._skillAnim = FightConfig.GOUKUN_SKILL_ANIM[self.camp]
	-- elseif self._resData.id == 706 then 	--白虎
	-- 	self._skillAnim = FightConfig.BAIHU_SKILL_ANIM[self.camp]
	-- elseif self._resData.id == 710 then 	--麒麟
	-- 	self._skillAnim = FightConfig.QILIN_SKILL_ANIM[self.camp]
	-- end

	self._buffManager = BuffManager.getBuffManager()	--buff管理

	self.isPet = true

	self.attackIndex = 0
	
	--演员
	self._actor = nil
	self._skillInfo = nil

	self._shadow = nil									--影子
	self.updateShadow = false							--是否由unit位置控制影子

	self._isMoveAttack = false						--是否走出去攻击

	self:_updatePetPos()
end

function UnitPet:getResId()
	return self._configData.res_id
end

function UnitPet:getColor()
	return self._configData.color
end

function UnitPet:getSkillAnim()
	return self._skillAnim
end

function UnitPet:_updatePetPos()

	if FightConfig.NEED_PET_SHOW then
		self._positionEnter = FightConfig.getPetEnterPosition(self.camp)
	else 
		self._positionEnter = FightConfig.getPetIdlePosition(self.camp)
	end

	local posXYArr = string.split(self._resData.battle_xy, "|")
	local fix = self.camp == FightConfig.campLeft and -1 or 1
	self._positionIdle = 
	{
		tonumber(posXYArr[1])*fix,
		tonumber(posXYArr[2])
	}
	
	self:setPosition(self._positionEnter[1], self._positionEnter[2])
	local wait = StateWait.new(self, StateWait.WAIT_ENTER_STAGE)
	self:addState(wait)
end

function UnitPet:createActor()
	self._actor = require("app.fight.views.PetActor").new(self._resData.fight_res, handler(self, self._onSpineLoadFinish))
	self._actor:setVisible(false)
    self:setTowards(self.camp)
	return self._actor
end

--创建名字血量信息版
function UnitPet:createBillBoard()
-- 	self._star = data.star 
-- 	self._configData = Pet.get(data.configId)

	self._billBoard = require("app.fight.views.BillBoardPet").new(self._configData.name, self._configData.color, self._star)
    if self._actor then
        local billboardZ = self._actor:getLocalZOrder() + 1
        self._billBoard:setLocalZOrder(billboardZ)
	end
	local towards = self.camp == FightConfig.campLeft and 1 or -1
	local petHeight = self._resData.spine_height * FightConfig.SCALE_ACTOR
	self._billBoard:setPosition(cc.p(self._positionIdle[1] + towards*self._resData.name_x, self._positionIdle[2] + petHeight))
	self._billBoard:setVisible(false)
	return self._billBoard
end

function UnitPet:getBillBoard()
	return self._billBoard
end

--创建影子
function UnitPet:createShadow()
	self._shadow = require("app.fight.views.ShadowActor").new()
	self._shadow:setPosition(cc.p(self._positionIdle[1], self._positionIdle[2]))
	self.updateShadow = true
	self._shadow:setVisible(false)
	self._shadow:setScale(FightConfig.PET_SHADOW_SCALE)
	return self._shadow
end

--获得影子
function UnitPet:getShadow()
	return self._shadow
end

function UnitPet:getActor()
	return self._actor
end

function UnitPet:_onSpineLoadFinish()
end

function UnitPet:getCamp()
	return self.camp
end

function UnitPet:getConfigId()
	return self._configId
end

--待机
function UnitPet:idle()
	local idle = StateIdle.new(self, true)
	self:setState(idle)
	self:setTowards(self.camp)	
end

--设置动作
function UnitPet:setAction(name, loop)
	self._actor:setAction(name, loop)
end

--进入场地
function UnitPet:enterFightGround()
	
	if FightConfig.NEED_PET_SHOW then 
		local statePetEnter = StatePetEnter.new(self, self._resData.show_stop)
		self:setState(statePetEnter)
		local move = StateMove.new(self, StateMove.TYPE_BEZIER, "moveback", 30, cc.p(self._positionIdle[1], self._positionIdle[2]), StateMove.BACK_ATTACK)
		move:setCallback(handler(self, UnitPet._checkOpenBuff))
		self:addState(move)
	else 
		local move = StateMove.new(self, StateMove.TYPE_BEZIER, "run", FightConfig.speed, cc.p(self._positionIdle[1], self._positionIdle[2]), StateMove.BACK_ATTACK)
		move:setCallback(handler(self, UnitPet._checkOpenBuff))
		self:setState(move)
	end
	local wait = StateWait.new(self, StateWait.WAIT_START, "idle", handler(self, self._dispatchInPosition), 0.5)
	self:addState(wait)
end

function UnitPet:_checkOpenBuff()
	self._buffManager:checkPetsBuff()
end

function UnitPet:_dispatchInPosition()
	-- self.signalStartCG:dispatch("enterStage")
	self:idle()
end

function UnitPet:skill(skillInfo, targets)
	self:clearState()
	self._skillInfo = skillInfo

	local skillPlay = HeroSkillPlay.get(skillInfo.skill_show_id)
	assert(skillPlay, "wrong skill id "..tostring(skillInfo.skill_show_id))

	--把技能位置先算出来
	local start_location_type = skillPlay.start_location_type
	local prePosition = self:getAttackPosition(start_location_type, cc.p(skillPlay.x, skillPlay.y), targets)
	--宠物展示，如果type是2
	if skillInfo.skill_type == 2 then

	end

	--攻击前位移
	self._isMoveAttack = false
	if prePosition then
		self._isMoveAttack = true
		prePosition.y = prePosition.y - 2
		local cameraTargetPos = nil
		if skillPlay.camera_location_type ~= 0 then
			cameraTargetPos = self:getAttackPosition(skillPlay.camera_location_type, 
														cc.p(skillPlay.camera_x, skillPlay.camera_y + FightConfig.GAME_GROUND_FIX), 
														targets)										
		end
		local move = StateMove.new(self, skillPlay.atk_pre_type, skillPlay.atk_pre_action, 
									skillPlay.atk_pre_speed, prePosition, nil, cameraTargetPos)
		self:addState(move)
	end

	--释放技能
	local skill = StateSkill.new(self, skillPlay, targets, skillInfo)
	self:addState(skill)

	--攻击后回位
	if prePosition then
		local cameraTargetPos = nil
		if skillPlay.camera_location_type ~= 0 then
			cameraTargetPos = cc.p(0, 0)
		end
		local move = StateMove.new(self, skillPlay.atk_follow_type, skillPlay.atk_follow_action, 
									skillPlay.atk_follow_speed, cc.p(self._positionIdle[1],self._positionIdle[2]), 
									StateMove.BACK_ATTACK, cameraTargetPos)
		self:addState(move)
	end


	local targetIds = {}
	for i, v in pairs(targets.list) do
        table.insert(targetIds, v.unit.stageID)
	end
	local stateBuff = StateBuff.new(self, BuffManager.BUFF_ATTACK_BACK, self.camp, targetIds)
	self:addState(stateBuff)

	local attackFinish = StateAttackFinish.new(self, {})
	self:addState(attackFinish)	
end

--获得攻击位置
function UnitPet:getAttackPosition(t, offset, targets)
	local factor = self.camp == FightConfig.campLeft and -1 or 1
	if t == 1 then --无位移
	elseif t == 2 then --屏幕中心点偏移
		return cc.p(offset.x * factor, offset.y)
	elseif t == 3 then --目标偏移
		local totalPos = {}
		local count = 0
		for i,v in ipairs(targets.list) do
			local target = v.unit
			local pos = cc.p(FightConfig.getIdlePosition(target.camp, target.cell))
			table.insert(totalPos, pos)
			count = count+1
		end
		local finalPos = {}
		local posX = 0
		local posY = 0
		for _, v in pairs(totalPos) do
			posX = v.x + posX
			posY = v.y + posY
		end
		posX = posX / count
		posY = posY / count
		return cc.pAdd(cc.p(posX, posY), cc.p(offset.x * factor, offset.y))
	elseif t == 4 then --排 2,5
		for i,v in ipairs(targets.list) do
			local pos
			local target = v.unit
			if target.cell == 1 or target.cell == 2 or target.cell == 3 then
				pos = cc.p(FightConfig.getIdlePosition(target.camp, 2))
			elseif target.cell == 4 or target.cell == 5 or target.cell == 6 then
				pos = cc.p(FightConfig.getIdlePosition(target.camp, 5))
			end
			return cc.pAdd(pos, cc.p(offset.x * factor, offset.y))
		end
	elseif t == 5 then --列 1,2,3
		for i,v in ipairs(targets.list) do
			local pos
			local target = v.unit
			if target.cell == 1 or target.cell == 4 then
				pos = cc.p(FightConfig.getIdlePosition(target.camp, 1))
			elseif target.cell == 2 or target.cell == 5 then
				pos = cc.p(FightConfig.getIdlePosition(target.camp, 2))
			elseif target.cell == 3 or target.cell == 6 then
				pos = cc.p(FightConfig.getIdlePosition(target.camp, 3))
			end
			return cc.pAdd(pos, cc.p(offset.x * factor, offset.y))
		end
	end
	return nil
end

--update
function UnitPet:update(f)
	UnitPet.super.update(self, f)



	if #self._states == 0 then
		self:idle()
	end
end

--updateframe
function UnitPet:updateFrame(f)
	UnitPet.super.updateFrame(self, f)
	if self.updateShadow then
		self._shadow:updatePos(cc.p(self._positionFrame[1],self._positionFrame[2]))
	end
	self._shadow:setLocalZOrder((-checkint(self._positionFrame[2]))-1)
end

--状态结束
function UnitPet:onStateFinish(state)
	self.signalStateFinish:dispatch(state.__cname)
end

--是否显示影子
function UnitPet:showShadow(v)
	self._shadow:setVisible(v)
end


--petFade
function UnitPet:fade(isIn)
	-- self._actor:playFade(isIn)
	self._actor:setVisible(isIn)
	self._billBoard:setVisible(isIn)
	self:showShadow(isIn)
end

--做胜利动作
function UnitPet:doWinAction( )
	self._actor:setAction("win", true)
end

--检查是否需要在技能结束后消失
function UnitPet:checkShow()
	if not self._isMoveAttack then 
		self:setPosition(self._positionIdle[1], self._positionIdle[2])
		self:fade(false)
	end
end

return UnitPet