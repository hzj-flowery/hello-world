local Entity = require("app.fight.Entity")
local Unit = class("Unit", Entity)

-- config
local FightConfig = require("app.fight.Config")
local Hero = require("app.config.hero")
local HeroRes = require("app.config.hero_res")
local HeroSkillPlay = require("app.config.hero_skill_play")
local Monster = require("app.config.monster")
local HeroSkillEffect = require("app.config.hero_skill_effect")
local HeroSkillActive = require("app.config.hero_skill_active")

-- state
local StateMove = require("app.fight.states.StateMove")
local StateSkill = require("app.fight.states.StateSkill")
local StateHit = require("app.fight.states.StateHit")
local StateIdle = require("app.fight.states.StateIdle")
local StateDying = require("app.fight.states.StateDying")
local StateBuff = require("app.fight.states.StateBuff")
local StateWait = require("app.fight.states.StateWait")
local StateDamage = require("app.fight.states.StateDamage")
local StateWin = require("app.fight.states.StateWin")
local StateShow = require("app.fight.states.StateShow")
local StateAttackFinish = require("app.fight.states.StateAttackFinish")
local StateOpenShow = require("app.fight.states.StateOpenShow")
local StateAction = require("app.fight.states.StateAction")
local StateDamageWait = require("app.fight.states.StateDamageWait")
local StateGoldShow = require("app.fight.states.StateGoldShow")
local StateOut = require("app.fight.states.StateOut")
local StateHistoryShow = require("app.fight.states.StateHistoryShow")

--buffManager
local BuffManager = require("app.fight.BuffManager")
local Engine = require("app.fight.Engine")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")

local HeroConst = require("app.const.HeroConst")
local BattleHelper = require("app.fight.BattleHelper")

--
local Path = require("app.utils.Path")

Unit.ANGER_FULL = 4 --4格能量为满格

-- Unit.BUFF_POS_HEAD = 1
-- Unit.BUFF_POS_MIDDLE = 2
-- Unit.BUFF_POS_FOOT = 3

--
function Unit:ctor(data, enterAction, enterCallback)
    Unit.super.ctor(self)
    --
    self._data = data
    self.isLeader = data.isLeader --是否是主角
    self.stageID = data.stageId --唯一id
    self.configId = data.configId --表id
    self.camp = data.camp --队伍
    self.cell = data.cell --坐标
    self.maxHp = data.maxHp --最大血量
    self.hp = data.hp --血量
    self.anger = data.anger --怒气
    self.rankLevel = data.rankLevel --突破等级
    self.showHp = data.hp --展示血量
    self.monsterId = data.monsterId --怪物表id
    self.is_alive = true --是否死亡
    self.to_alive = true --本轮次结束后是否死亡
    self.limitLevel = data.limitLevel --界限突破等级
    self.limitRedLevel = data.limitRedLevel -- 红升金界限突破
    self.showMark = data.showMark --开局展示的图标
    self.protect = data.protect or 0
    --开局的保护盾

    self.attackIndex = 0 --攻击轮次

    self._finalDie = true --跳过战斗的时候是否死亡
    self._isJump = false --是否是最后展示win状态

    self.dropAward = nil --掉落物品
    self.startMove = false
    --
    self._states = {} --状态堆栈
    self._positionIdle = FightConfig.cells[self.camp][self.cell] --战斗位置
    self._positionEnter = FightConfig.cells[self.camp][self.cell + 6] --进场位置

    --
    self._info = Hero.get(data.configId) --英雄信息
    if self.limitRedLevel and self.limitRedLevel >= HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL then
        self._res = HeroRes.get(self._info.limit_red_res_id)
    elseif self.limitLevel and self.limitLevel >= HeroConst.HERO_LIMIT_RED_MAX_LEVEL then
        self._res = HeroRes.get(self._info.limit_res_id)
    else
        self._res = HeroRes.get(self._info.res_id) --英雄资源
    end
    self.country = self._info.country --阵营
    self._monsterInfo = nil --怪物信息
    if self.monsterId ~= 0 then
        self._monsterInfo = Monster.get(self.monsterId)
        assert(self._monsterInfo, "wrong monster id " .. tostring(self.monsterId))
    end

    --
    self._hitTipView = nil --打击信息
    self._shadow = nil --影子
    self.updateShadow = true --是否由unit位置控制影子

    --
    self._buffManager = BuffManager.getBuffManager() --buff管理
    self._beHit = false --是否被攻击

    --合击
    self._partner = nil --合击将信息
    -- self.readyForCombineMove = false			--是否准备合击移动
    self.readyForCombineSkill = false --主将，是否副将到位，可以发动合击技能，副将，是否整个合击打完
    self.inCombineWatcher = nil --围观群众

    self._buffList = {} --携带buff，用于显示

    --战斗后回位
    -- self._moveBack = nil
    self._enterAction = enterAction --进入到待机位后动作
    self._enterCallback = enterCallback --播完动作后回掉
    -- self._isPlayer = false					--是否是主角

    --设置位置
    assert(self._positionEnter, "no position stageId = " .. self.stageID .. " configId = " .. self.configId)
    self:setPosition(self._positionEnter[1], self._positionEnter[2])
    self._spineLoaded = false
    self:idle()

    --表现的buff列表
    self._showBuff = {}
    self._hasSkill = false --本次有攻击

    --是否是在说话中
    self._isTalking = false
    self._talkTime = 0 --说话的时间

    self.targetCount = 0 --攻击轮次
    self.attackId = 0 --被攻击的时候，攻击者id

    self._preSkillPos = nil --攻击前置位置
    self.projectileCount = 0 --如果有弹道 记录数量
    self.enterStage = true --进入场地，开始战斗update
    self.needOpenShow = false

    self._istransparent = false
end

function Unit:refreshData(data)
    self.maxHp = data.maxHp
    self.hp = data.hp
    self.showHp = data.hp
    self.anger = data.anger
    self:updateAnger()
    self:updateHP()
    self:updateHpShadow()
end

--根据最终unit改变属性
function Unit:setFinalData(data)
    self._data = data
    self.stageID = data.stageId
    self.maxHp = data.maxHp
    self.hp = data.hp
    self.anger = data.anger
    self.showHp = data.hp
    self._finalDie = false
    self.protect = data.protect
end

--根据最后情况更新unit
function Unit:doFinal()
    --人物出现
    self:showShadow(true)
    --首先回原位待机
    self:setRotation(0)
    self:setPosition(self._positionIdle[1], self._positionIdle[2])
    self:setHeight(0)
    self:setScale(1, 1)
    if self._finalDie then
        self:updateHP()
        self:updateHpShadow()
        self:clearState()
        self.is_alive = false
        self:dying()
    else
        self._actor:stopEffect()
        self:updateHP()
        self:updateHpShadow()
        self:updateAnger()
        self:clearState()
        self._isJump = true
    end
    self:fade(true)
end

--是否跳过后死亡
function Unit:isFinalDie()
    return self._finalDie
end

--创建演员,是否直接出现
function Unit:createActor()
    self._hitTipView = require("app.fight.views.HitTipView").new()
    self._hitTipView:setPosition(cc.p(0, 0))
    -- self._hitTipView:setPosition(cc.p(self._positionIdle[1], self._positionIdle[2]+180))
    self._actor =
        require("app.fight.views.Actor").new(
        self._res.fight_res,
        handler(self, self._onSpineLoadFinish),
        self.camp == FightConfig.campLeft and 1 or -1
    )
    self._actor:setPosition(cc.p(self._position[1], self._position[2]))
    self._actor:setVisible(false)
    return self._actor
end

--演员创建完成回掉
function Unit:_onSpineLoadFinish()
    self._spineLoaded = true
end

--是否完成spine倒入
function Unit:isSpineLoaded()
    return self._spineLoaded
end

--创建影子
function Unit:createShadow()
    local needAnim = false
    if self.isLeader then
        local HeroConfig = Hero.get(self.configId)
        assert(HeroConfig, "wrong hero id .. " .. self.configId)
        if HeroConfig.type ~= 1 then
            needAnim = true
        end
    end
    self._shadow = require("app.fight.views.ShadowActor").new(needAnim)
    self._shadow:setPosition(cc.p(self._positionEnter[1], self._positionEnter[2]))
    return self._shadow
end

--获得影子
function Unit:getShadow()
    return self._shadow
end

--影子设置可见
function Unit:showShadow(visible)
    self._shadow:setVisible(visible)
end

--创建名字血量信息版
function Unit:createBillBoard()
    local name = self._info.name
    local officerLevel = nil
    local rankLevel = self.rankLevel
    if self._monsterInfo then
        name = self._monsterInfo.name
    end
    if self.isLeader then
        if self.camp == 1 then
            name = Engine.getEngine().leftName
            officerLevel = Engine.getEngine().leftOfficerLevel
        else
            name = Engine.getEngine().rightName
            officerLevel = Engine.getEngine().rightOfficerLevel
        end
    end
    local color = self._info.color
    local trueColor = self._info.color
    if self._monsterInfo then
        color = self._monsterInfo.color
        trueColor = self._monsterInfo.color
    else
        if self.limitRedLevel and self.limitRedLevel >= HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL then
            color = 7
        elseif self.limitLevel and self.limitLevel >= HeroConst.HERO_LIMIT_RED_MAX_LEVEL then
            color = self._info.color + 1
        end
    end

    self._billBoard =
        require("app.fight.views.BillBoard").new(
        name,
        color,
        rankLevel,
        self.isLeader,
        officerLevel,
        self.showMark,
        self.camp,
        self.maxHp,
        trueColor
    )
    self._billBoard:updateAnger(self.anger)
    self._billBoard:setVisible(false)
    if self._actor then
        local billboardZ = self._actor:getLocalZOrder() + 1
        self._billBoard:setLocalZOrder(billboardZ)
    end
    self:updateHP()
    self._billBoard:updateHpShadow()
    self._billBoard:setPosition(cc.p(self._positionIdle[1], self._positionIdle[2] + 175 * FightConfig.getScale(self._positionIdle[2])))
    return self._billBoard
end

--获取伤害提示
function Unit:getHitTipView()
    return self._hitTipView
end

--获取行数
function Unit:getRow()
    if self.cell == 1 or self.cell == 4 then
        return 1
    elseif self.cell == 2 or self.cell == 5 then
        return 2
    elseif self.cell == 3 or self.cell == 6 then
        return 3
    end

    return 0
end

--星彩进入场地
function Unit:xingcaiIn()
    local cells = FightConfig.cells[FightConfig.campRight] --	星彩放到右边
    self:setPosition(cells[self.cell + 6][1], cells[self.cell + 6][2])
    self:clearState()
    self._actor:setVisible(true)
    local f = FightConfig.rows[self:getRow()][1]
    local move =
        StateMove.new(self, 1, "run", FightConfig.speed * f, cc.p(self._positionIdle[1], self._positionIdle[2]))
    self:setState(move)
    -- self:win()
    local wait = StateWait.new(self, StateWait.WAIT_NEW_UNIT, "win", self._enterCallback, FightConfig.XINGCAI_WAIT_TIME)
    self:addState(wait)
end

--进入战斗位置
function Unit:enterFightStage()
    self:setPosition(self._positionEnter[1], self._positionEnter[2])
    if self.enterStage then
        local f = FightConfig.rows[self:getRow()][1]
        local move =
            StateMove.new(
            self,
            1,
            "run",
            FightConfig.speed * f,
            cc.p(self._positionIdle[1], self._positionIdle[2]),
            StateMove.ENTER_STAGE
        )
        self:setState(move)
        local showTime = self._res.hero_ani_time / 1000
        if showTime ~= 0 then
            self._actor:setVisible(false)
            self:showShadow(false)
            local stateGoldShow = StateGoldShow.new(self, showTime)
            self:addState(stateGoldShow)
        else
            self._actor:setVisible(true)
        end
        local wait = StateWait.new(self, StateWait.WAIT_START)
        self:addState(wait)
    else
        local wait = StateWait.new(self, StateWait.WAIT_ENTER_STAGE)
        self:setState(wait)
    end
end

--跳入战斗场地
function Unit:JumpIntoStage()
    self._actor:setVisible(true)
    if self.needOpenShow then
        self:openShow()
        return
    end
    -- local f = FightConfig.rows[self:getRow()][1]
    -- local move = StateMove.new(self, 1, "run", FightConfig.speed * f, cc.p(self._positionIdle[1],self._positionIdle[2]), StateMove.ENTER_STAGE)
    -- self:setState(move)
    -- local wait = StateWait.new(self, StateWait.WAIT_START, "idle", handler(self, self._jumpEnd))
    -- self:addState(wait)
    local f = FightConfig.rows[self:getRow()][1]
    local move =
        StateMove.new(
        self,
        2,
        "moveahead",
        FightConfig.jumpSpeed * f,
        cc.p(self._positionIdle[1], self._positionIdle[2])
    )
    self:setState(move)
    local wait =
        StateWait.new(self, StateWait.WAIT_START, "idle", handler(self, self._jumpEnd), FightConfig.JUMP_IN_WAIT_TIME)
    self:addState(wait)
end

--进入场地后show
function Unit:openShow()
    self:setTowards(self.camp)
    local stateOpenShow = StateOpenShow.new(self, cc.p(self._positionIdle[1], self._positionIdle[2]), 0)
    self:setState(stateOpenShow)
    local wait = StateWait.new(self, StateWait.WAIT_START, "idle", handler(self, self._jumpEnd))
    self:addState(wait)
end

--跳入场地后的回调
function Unit:_jumpEnd()
    -- Engine.getEngine():dispatchJumpTalk(self.configId)
    FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_JUMP_TALK, self.configId)
    self.signalStartCG:dispatch("enterStage")
end

--设置待机
function Unit:idle()
    if not self.is_alive then
        return
    end
    local idle = StateIdle.new(self)
    self:setState(idle)
    self:setTowards(self.camp)
end

--检查是否满足合击技能条件
function Unit:checkCombineSkill()
    if not FightConfig.SHOW_IDLE2 then
        return false
    end

    if self.anger < Unit.ANGER_FULL then
        return false
    end

    if self._info.skill_3_type ~= 1 then
        return false
    end

    local engine = require("app.fight.Engine")
    if not engine.getEngine():hasPartner(self.camp, self._info.skill_3_partner) then
        return false
    end

    return true
end

--伤害状态
function Unit:damage(buffs)
    local hasSpineEffect = false
    local isFirstBuff = false
    local buffList = {}
    for i, v in pairs(buffs) do
        local config = self._buffManager:getBuffConfigByGlobalId(v.globalId)
        -- if not config then
        -- 	return
        -- end
        if config.buff_front_effect == "" then
            table.insert(buffList, v)
        else
            if not isFirstBuff then
                self:startDamageWithSpine(config, v, i == #buffs)
                isFirstBuff = true
            else
                self:addDamageWithSpine(config, v, i == #buffs)
            end
            hasSpineEffect = true
        end
    end
    local damage = StateDamage.new(self, buffList, true)
    if hasSpineEffect then
        self:addState(damage)
    else
        self:setState(damage)
    end
end

--需要播放特效的buff
function Unit:startDamageWithSpine(buffConfig, buff, isLast)
    local damageWait = StateDamageWait.new(self, buffConfig, isLast)
    self:setState(damageWait)
    local damage = StateDamage.new(self, {buff})
    self:addState(damage)
end

--
function Unit:addDamageWithSpine(buffConfig, buff, isLast)
    local damageWait = StateDamageWait.new(self, buffConfig, isLast)
    self:addState(damageWait)
    local damage = StateDamage.new(self, {buff})
    self:addState(damage)
end

--胜利状态
function Unit:win()
    local win = StateWin.new(self)
    self:addState(win)
end

--设置胜利
function Unit:setWin()
    self:clearState()
    if not self:isSandby() then
        local move =
            StateMove.new(
            self,
            StateMove.TYPE_MOVE,
            "run",
            12,
            cc.p(self._positionIdle[1], self._positionIdle[2]),
            StateMove.ENTER_STAGE
        )
        self:setState(move)
    end
    -- if self._enterAction then
    -- 	local wait = StateWait.new(self, StateWait.WAIT_NEW_UNIT, self._enterAction, self._enterCallback)
    -- 	self:addState(wait)
    -- else
    local win = StateWin.new(self)
    self:addState(win)
    -- end
end

--设置开场buff
function Unit:playStartBuff()
    local stateBuff = StateBuff.new(self, BuffManager.BUFF_FIGHT_OPENING, self.stageID)
    self:setState(stateBuff)
end

--释放技能
function Unit:skill(skillInfo, targets, unitPartner)
    self._partner = unitPartner
    if self:getState() == "StateIdle" then
        self:clearState()
    end

    --根据skillinfo判断是否实行本次攻击
    self._buffManager:checkPoint(BuffManager.BUFF_PRE_ATTACK, self.stageID) --结算自己的buff
    self._hasSkill = true
    if not skillInfo then
        if #self._states == 0 then
            self.signalStateFinish:dispatch("StateAttackFinish", self.stageID)
        end
        self._hasSkill = false

        self._buffManager:checkPoint(BuffManager.BUFF_ATTACK_BACK, self.stageID, nil, true)
        self._buffManager:checkPoint(BuffManager.BUFF_HIT_BACK, self.stageID, nil, true)
        if self.to_alive then
            -- else
            --     if self:getState() ~= "StateDamage" and self:getState() ~= "StateDamageWait" then
            --         self.is_alive = self.to_alive
            --     end
            -- self._buffManager:checkPoint(BuffManager.BUFF_PRE_ATTACK, self.stageID)
            
        else
            self:dying()
            self.is_alive = self.to_alive
            return
        end
        return
    end

    local stateHistoryShow = StateHistoryShow.new(self, BuffManager.HIS_BEFORE_ATK)
    self:addState(stateHistoryShow)

    local skillShowId = skillInfo.skill_show_id
    local selfSkillId = nil
    -- print("1112233 ", targets.list[1].unit.stageID, #tar)
    if #targets.list == 1 and targets.list[1].unit.stageID == self.stageID then
        selfSkillId = skillShowId - skillShowId % 10 + 9 --如果是加血并且只加自己，去掉id最后的数字，改成9
    end
    local skillPlay = HeroSkillPlay.get(skillShowId)
    if selfSkillId and HeroSkillPlay.get(selfSkillId) then
        skillPlay = HeroSkillPlay.get(selfSkillId)
    end
    assert(skillPlay, "wrong skill id " .. tostring(skillShowId))

    --把技能位置先算出来
    local start_location_type = skillPlay.start_location_type
    local prePosition = self:getAttackPosition(start_location_type, cc.p(skillPlay.x, skillPlay.y), targets)

    --加入展示环节,如果是合击的话，把需要移动位置放进去，给副将移动提供基准
    if skillInfo.skill_type == 2 or skillInfo.skill_type == 3 then
        local show = StateShow.new(self, skillPlay, skillInfo.skill_type, prePosition)
        self:addState(show)
    end

    local stateBuff = StateBuff.new(self, BuffManager.BUFF_AFTER_SHOW, self.stageID)
    self:addState(stateBuff)

    if skillInfo.skill_type == 3 then
        local waitFlash = StateWait.new(self, StateWait.WAIT_COMBINE_FLASH)
        self:addState(waitFlash)
    end

    -- --技能前移动
    -- local start_location_type = skillPlay.start_location_type
    -- local prePosition = self:getAttackPosition(start_location_type, cc.p(skillPlay.x, skillPlay.y), targets)

    if prePosition then
        prePosition.y = prePosition.y - 2 --如果打后排的话。。由于前排位置有-1，所以要-2
        local cameraTargetPos = nil
        if skillPlay.camera_location_type ~= 0 then
            cameraTargetPos =
                self:getAttackPosition(
                skillPlay.camera_location_type,
                cc.p(skillPlay.camera_x, skillPlay.camera_y + FightConfig.GAME_GROUND_FIX),
                targets
            )
        end
        local move =
            StateMove.new(
            self,
            skillPlay.atk_pre_type,
            skillPlay.atk_pre_action,
            skillPlay.atk_pre_speed,
            prePosition,
            nil,
            cameraTargetPos
        )
        self:addState(move)
    end

    --合击技能情况处理
    if skillInfo.skill_type == 3 then
        --移动到位后等待
        local wait = StateWait.new(self, StateWait.WAIT_COMBINE_SKILL)
        self:addState(wait)

    -- self._partner:startCombineVice(skillPlay, prePosition)
    end

    --技能释放
    local skill = StateSkill.new(self, skillPlay, targets, skillInfo)
    self:addState(skill)

    --攻击完成后结算
    local finishBuff = self._buffManager:getFinishBuffByStageId(self.stageID)
    self:addAttackFinish(finishBuff)

    -- self._moveBack = nil
    --攻击后回位
    if prePosition then
        local cameraTargetPos = nil
        if skillPlay.camera_location_type ~= 0 then
            cameraTargetPos = cc.p(0, 0)
        end
        local move =
            StateMove.new(
            self,
            skillPlay.atk_follow_type,
            skillPlay.atk_follow_action,
            skillPlay.atk_follow_speed,
            cc.p(self._positionIdle[1], self._positionIdle[2]),
            StateMove.BACK_ATTACK,
            cameraTargetPos
        )
        -- self._moveBack = move
        self:addState(move)
    end

    local targetIds = {}
    for i, v in pairs(targets.list) do
        table.insert(targetIds, v.unit.stageID)
    end
    local stateBuff = StateBuff.new(self, BuffManager.BUFF_ATTACK_BACK, self.stageID, targetIds)
    self:addState(stateBuff)
end

--合击时候副将攻击,传入主将攻击位置
function Unit:startCombineVice(skillPlay, prePosition)
    --副将展示合击
    local show = StateShow.new(self, nil, 3)
    self:setState(show)

    --副将等待flash展示
    local waitFlash = StateWait.new(self, StateWait.WAIT_COMBINE_FLASH)
    self:addState(waitFlash)

    --副将移动
    local factor = self.camp == FightConfig.campLeft and 1 or -1
    local prePositionVice = cc.pAdd(prePosition, cc.p(skillPlay.x_2 * factor, skillPlay.y_2))
    local move =
        StateMove.new(
        self,
        skillPlay.atk_pre_type_2,
        skillPlay.atk_pre_action_2,
        skillPlay.atk_pre_speed_2,
        prePositionVice
    )
    self:addState(move)

    --副将移动到位等待
    local waitCombine = StateWait.new(self, StateWait.WAIT_COMBINE_SKILL)
    self:addState(waitCombine)

    --副将攻击后回位
    local moveBack =
        StateMove.new(
        self,
        skillPlay.atk_follow_type_2,
        skillPlay.atk_follow_action_2,
        skillPlay.atk_follow_speed_2,
        cc.p(self._positionIdle[1], self._positionIdle[2])
    )
    self:addState(moveBack)
end

--添加攻击完成状态
function Unit:addAttackFinish(buffList)
    local attackFinish = StateAttackFinish.new(self, buffList)
    self:addState(attackFinish)
end

--开始合击移动
function Unit:startCombineMove()
    -- self.readyForCombineMove = true
end

--开始合击攻击
function Unit:startCombineSkill()
    self.readyForCombineSkill = true --主将释放技能，副将依然等待，完成后副将设置此参数调用回位
end

--副将开始移动
function Unit:startPartnerMove()
    local prePosition = self:getAttackPosition(start_location_type, cc.p(skillPlay.x, skillPlay.y), targets)
    local factor = self.camp == FightConfig.campLeft and -1 or 1
    local prePosition_2 = cc.pAdd(prePosition, cc.p(offset.x * factor, offset.y))
end

--获得合击将
function Unit:getPartner()
    return self._partner
end

--获得合击前站位
function Unit:_getPreCombinedPosition(idx)
    local pos = cc.p(FightConfig.getIdlePosition(self.camp, 1))
    local offset = {50, -50}
    if idx == 2 then
        pos = cc.p(FightConfig.getIdlePosition(self.camp, 3))
        offset = {50, 50}
    end
    return cc.pAdd(pos, cc.p(offset[1], offset[2]))
end

--合击前，进入合击位
function Unit:doPreCombinedAttack()
    -- self.readyForCombineMove = false
    local combineIdx = 1
    if not self._partner then --有副将的人一定是主将
        combineIdx = 2
    end
    local move = StateMove.new(self, 1, "run", 10, self:_getPreCombinedPosition(combineIdx))
    self:setState(move)
    local wait = StateWait.new(self, StateWait.WAIT_COMBINE)
    self:addState(wait)
end

--更新血量,参数1,更新的hp值;参数2,更改护盾值;参数3:是否是攻击中带入

function Unit:changeHp(value)
    self.hp = self.hp + value
    self.showHp = self.hp
    if self.showHp > self.maxHp then
        self.showHp = self.maxHp
    elseif self.showHp < 0 then
        self.showHp = 0
    end
end

function Unit:updateHP(value, protect, isHitInfo)
    local changeValue = value or 0
    local changeProtect = protect or 0
    if self.calcDamage then
        if changeValue < -1 then
            self.totalDamage = self.totalDamage + changeValue
        end
    end

    if isHitInfo then
        -- 如果是加血的，视为直接攻击
        -- local hpAttack = false
        -- if changeValue > 0 then
        --     hpAttack = true
        -- end
        -- if hpAttack then

        -- 区分一下是不是加血，如果是加血，两个一起加
        local isAddHp = false
        if changeValue > 0 or changeProtect > 0 then
            isAddHp = true
        end
        if isAddHp then
            self:changeHp(changeValue)
            -- self.hp = self.hp + changeValue
            -- self.showHp = self.hp
            -- if self.showHp > self.maxHp then
            --     self.showHp = self.maxHp
            -- end
            self.protect = self.protect + changeProtect
        else
            local hpHit = changeValue
            self.protect = self.protect + changeValue
            if self.protect < 0 then
                hpHit = self.protect
                self.protect = 0
            end

            if self.protect == 0 then
                -- self.showHp = self.showHp + hpHit
                -- if self.showHp < 0 then
                --     self.showHp = 0
                -- end
                self:changeHp(hpHit)
            end
        end
    else
        self:changeHp(changeValue)
        -- self.showHp = self.showHp + changeValue
        -- if self.showHp > self.maxHp then
        --     self.showHp = self.maxHp
        -- end
        self.protect = self.protect + changeProtect
        if self.protect < 0 then
            self.protect = 0
        end
    end

    if self._billBoard then
        self._billBoard:updateHP(self.showHp, self.protect)
        if value == 0 then
            self._billBoard:updateHpShadow()
        end
    end
end

--更新血量的底
function Unit:updateHpShadow(needMoving)
    if self._billBoard then
        self._billBoard:updateHpShadow(needMoving)
    end
end

--展示伤害
function Unit:tipHit(value, hitInfo)
    if self._hitTipView then
        local height = self._heightFrame
        if height < 0 then
            height = 0
        end
        self._hitTipView:popup(value, hitInfo, "damage", cc.p(self._positionFrame[1], self._positionFrame[2] + height))
    end
end

--清除buff时候展示的伤害
function Unit:doEndHpEffect(damage, hitInfo)
    -- local showValue = damage.showValue
    -- local value = damage.value
    -- local protect = damage.protect
    -- if damage.pType = 1 then
    --     protect = -protect
    -- end
    -- if damage.type == 1 then
    --     showValue = -showValue
    --     value = - value
    -- end
    -- value = value + protect

    local hpValue, protectValue, showValue = BattleHelper.parseDamage(damage)
    self:updateHP(hpValue, protectValue)
    self:tipHit(showValue, hitInfo)
    if not self.to_alive then
        self.is_alive = false
        if self:getState() == "StateIdle" then
            self:clearState()
            self:dying()
        end
        return
    end
    if self:getState() == "StateIdle" and hpValue < 0 then
        local stateAction = StateAction.new(self, "hit")
        self:setState(stateAction)
    end
    self:updateHpShadow(true)
end

--增加受击状态
function Unit:hit(action, info, isProjectile, attackId)
    self:clearState()
    local hit = StateHit.new(self, action, info, isProjectile, attackId)
    self:addState(hit)
    self._beHit = true
end

--受击动作
function Unit:hitPlay(skillPlay, info, hitCount, isProjectile, attackId)
    local action = skillPlay.atk_action
    local cell = nil
    local fileUtils = cc.FileUtils:getInstance()
    --print("getHitAction "..Path.getTargetAction(action))
    if fileUtils:isFileExist(Path.getTargetAction(action)) == false then
        if skillPlay.atk_type == 2 then --列
            if self.cell == 1 or self.cell == 2 or self.cell == 3 then
                cell = 1
            else
                cell = 2
            end
        elseif skillPlay.atk_type == 3 then --排
            if self.cell == 1 or self.cell == 4 then
                cell = 1
            elseif self.cell == 2 or self.cell == 5 then
                cell = 2
            elseif self.cell == 3 or self.cell == 6 then
                cell = 3
            end
        elseif skillPlay.atk_type == 5 then --相邻
            cell = hitCount
        else
            cell = self.cell
        end
    end
    self.attackId = attackId
    self:hit(Path.getTargetAction(action, cell), info, isProjectile, attackId)
end

--发布死亡状态，用于死亡对话检测
function Unit:dispatchDie()
    local unitId = self.configId
    if self.monsterId ~= 0 then
        unitId = self.monsterId
    end
    local engine = require("app.fight.Engine")
    engine.getEngine():unitDie(unitId)
end

--死亡状态
function Unit:dying()
    local dying = StateDying.new(self, Path.getTargetAction("dying"))
    self:addState(dying)
end

function Unit:setDieState()
    local dying = StateDying.new(self, Path.getTargetAction("dying"))
    self:setState(dying)
end

--获得攻击位置
function Unit:getAttackPosition(t, offset, targets)
    local factor = self.camp == FightConfig.campLeft and -1 or 1
    if t == 1 then --无位移
    elseif t == 2 then --屏幕中心点偏移
        return cc.p(offset.x * factor, offset.y)
    elseif t == 3 then --目标偏移
        local totalPos = {}
        local count = 0
        for i, v in ipairs(targets.list) do
            local target = v.unit
            local pos = cc.p(FightConfig.getIdlePosition(target.camp, target.cell))
            table.insert(totalPos, pos)
            count = count + 1
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
        for i, v in ipairs(targets.list) do
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
        for i, v in ipairs(targets.list) do
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

function Unit:hasSkill()
    return self._hasSkill
end

--状态结束
function Unit:onStateFinish(state)
    if state.__cname == "StateDamage" and not self._hasSkill and state._isLastBuff then --没有攻击info
        --如果死了，
        self._buffManager:checkPoint(BuffManager.BUFF_AFTER_SHOW, self.stageID)
        self.signalStateFinish:dispatch("StateAttackFinish", self.stageID)
    end
    self.signalStateFinish:dispatch(state.__cname, self.stageID)
end

--是否就位
function Unit:isSandby()
    local pos1 = string.format("%0.11f", self._position[1])
    local pos2 = string.format("%0.11f", self._position[2])
    local idlepos1 = string.format("%0.11f", self._positionIdle[1])
    local idlepos2 = string.format("%0.11f", self._positionIdle[2])
    if pos1 ~= idlepos1 or pos2 ~= idlepos2 then
        return false
    end
    return true
end

--是否在待机位
function Unit:isInIdlePosition()
    if self._position[1] ~= self._positionIdle[1] or self._position[2] ~= self._positionIdle[2] then
        return false
    end

    return true
end

--update
function Unit:update(f)
    Unit.super.update(self, f)
    self._billBoard:update(f)
    self:_updateTalk(f)
    if #self._states == 0 then
        if not self.is_alive then
            -- self._buffManager:checkPoint(BuffManager.BUFF_HIT_BACK, self.attackId, self.stageID) --检查一个回位置buff

            if self.dropAward then
                local Engine = require("app.fight.Engine")
                Engine.getEngine():addDieDrop(self.stageID, self.dropAward)
            end
            self:remove()
            self._beHit = false
        elseif not self:isSandby() then
            print("1112233 check behit 11111111", self.stageID)
            local move =
                StateMove.new(
                self,
                StateMove.TYPE_MOVE,
                "run",
                12,
                cc.p(self._positionIdle[1], self._positionIdle[2]),
                StateMove.BACK_HIT
            )
            self:setState(move)
            local stateHistoryShow = StateHistoryShow.new(self, BuffManager.HIS_AFTER_HIT, true)
            self:addState(stateHistoryShow)
            local stateBuff = StateBuff.new(self, BuffManager.BUFF_HIT_BACK, self.attackId, self.stageID)
            self:addState(stateBuff)
            self._beHit = false
        else
            if self._isJump then
                if not self:isSandby() then
                    local move =
                        StateMove.new(
                        self,
                        StateMove.TYPE_MOVE,
                        "run",
                        12,
                        cc.p(self._positionIdle[1], self._positionIdle[2]),
                        StateMove.BACK_HIT
                    )
                    self:setState(move)
                end
                self._isJump = false
            else
                if self._beHit then
                    print("1112233 check behit, 2222222", self.stageID)
                    local stateHistoryShow = StateHistoryShow.new(self, BuffManager.HIS_AFTER_HIT, true)
                    self:setState(stateHistoryShow)
                    self._buffManager:checkPoint(BuffManager.BUFF_HIT_BACK, self.attackId, self.stageID)
                    self._beHit = false
                end
                if #self._states == 0 then
                    self:idle()
                end
            end
        end
    end
end

--updateframe
function Unit:updateFrame(f)
    Unit.super.updateFrame(self, f)
    self._billBoard:setLocalZOrder((-checkint(self._positionFrame[2])) + self._zOrderFix + 1)
    if self.updateShadow then
        self._shadow:updatePos(cc.p(self._positionFrame[1], self._positionFrame[2]))
    end
    self._shadow:setLocalZOrder((-checkint(self._positionFrame[2])) - 1)
    -- self._hitTipView:setPosition(cc.p(self._positionFrame[1], self._positionFrame[2]+180))
end

function Unit:_updateTalk(f)
    if self._isTalking then
        if self._talkTime >= FightConfig.UNIT_TALK_SHOW_TIME then
            self:stopTalk()
        else
            self._talkTime = self._talkTime + f
        end
    end
end

--设置动作
function Unit:setAction(name, loop)
    -- print("1112233 unit id = ", self.stageID, "action name = ", name)
    self._actor:setAction(name, loop)
end

--buff 展示
function Unit:buffPlay(buffId, damage, isAngerBuff, dieIndex, sound, isbuffEffect)
    -- if not self.is_alive and not isbuffEffect then
    --     return
    -- end

    local config = HeroSkillEffect.get(buffId)
    if config.buff_res ~= "" then
        if self._actor then
            self._actor:doOnceEffect(config.buff_res)
        end
    end
    if damage then
        local type = "buff_damage"
        if isAngerBuff then
            type = "anger_buff"
        end
        local damageType = 0
        if damage.type == 1 then
            damageType = -1
        elseif damage.type == 2 then
            damageType = 1
        end
        local value = damage.value and damageType * damage.value or 0
        local showValue = damage.showValue and damageType * damage.showValue or 0

        self._hitTipView:popup(showValue, buffId, type, cc.p(self._positionFrame[1], self._positionFrame[2]))

        if type == "buff_damage" then
            -- local protect = damageType * damage.protect
            -- value = value + protect
            -- self:updateHP(value)
            -- self:updateHpShadow(true)
            local hpValue, protectValue = BattleHelper.parseDamage(damage)
            self:updateHP(hpValue, protectValue)
            self:updateHpShadow(true)
        end
        local attackIndex = Engine.getEngine():getAttackIndex()
        if not self.to_alive and dieIndex then
            self:setDieState()
            self.is_alive = false
        end
    else
        if self._hitTipView then
            self._hitTipView:popup(nil, buffId, "buff", cc.p(self._positionFrame[1], self._positionFrame[2]))
        end
    end
    if sound then
        local speed = Engine.getEngine():getBattleSpeed()
        G_AudioManager:playSound(Path.getFightSound(sound), speed)
    end
end

--展示特性
function Unit:playFeature(skillId, callback)
    -- skillId = 2020540
    local skillInfo = HeroSkillActive.get(skillId)
    assert(skillInfo, "wrong skill id = " .. skillId)
    local skillPath = skillInfo.talent
    -- if self.stageID == 201 then
    self._hitTipView:popup(skillPath, _, "feature", cc.p(self._positionFrame[1], self._positionFrame[2]), callback)
    -- end
end

--更新buff面板
function Unit:_updateBuffBoard()
    self._billBoard:updateBuff(self._buffList)
end

--更新怒气
function Unit:updateAnger(value)
    local changeValue = value or 0
    self.anger = self.anger + changeValue
    if self.anger < 0 then
        self.anger = 0
    end
    self._billBoard:updateAnger(self.anger)
    self._angerChange = {}
end

--跑图
function Unit:runMap()
    local targetCamp = 2 --只有我方会跑图，目标敌方
    local cell = self.stageID % 100
    local targetCell = cell + 3
    if targetCell > 6 then
        targetCell = targetCell - 6
    end
    local targetPos = FightConfig.cells[targetCamp][targetCell + 6]
    local f = FightConfig.rows[self:getRow()][1]
    local runFix = 2
    local move =
        StateMove.new(
        self,
        StateMove.TYPE_MOVE,
        "run",
        FightConfig.speed * f * runFix,
        cc.p(targetPos[1] + 20, targetPos[2])
    )
    self:setState(move)
    local wait = StateWait.new(self, StateWait.WAIT_SECOND_WAVE, handler(self, self.remove))
    self:addState(wait)
end

--添加buff
function Unit:getBuff(buff)
    table.insert(self._buffList, buff)
    self:_updateBuffBoard()
    self:_updateBuffShow(buff)
end

--检查特殊buff
function Unit:checkSpcialBuff()
    for i = 1, #self._buffList do
        local buff = self._buffList[i]
        if buff.buffConfig.special == "jifei" and self.to_alive then
            local out = StateOut.new(self, buff.attackId)
            self:addState(out)
        end
    end
end

--播放一次性的buff
function Unit:playOnceBuff(buff, config)
    local buffConfig = config
    if not config then
        buffConfig = buff.buffConfig
    end
    if self._actor then
        self._actor:doOnceBuff(buffConfig.buff_res, buffConfig.buff_pos)
    end
end

--删除buff
function Unit:deleteBuff(buff)
    for i = #self._buffList, 1, -1 do
        if self._buffList[i].globalId == buff.globalId then
            table.remove(self._buffList, i)
            if buff.buffConfig.special == "jifei" then
                self:clearState()
            end
            break
        end
    end
    self:_updateBuffBoard()
    self:_updateDeleteShowBuff(buff)
    if self:getState() == "StateIdle" then
        self:_refreshAction()
    end
end

--删除buff产生的效果
function Unit:doBuffEndOp(type, damage)
    local buffConfig = FightConfig.REMOVE_BUFF_TYPE[type]
    if buffConfig.name == "addHp" or buffConfig.name == "DecHp" then
        damage.type = buffConfig.addType
        damage.pType = damage.type
        local hurtInfo = {}
        self:doEndHpEffect(damage, hurtInfo)
    elseif buffConfig.name == "removeAnger" or buffConfig.name == "addAnger" then
        damage.type = buffConfig.addType
        local configId = buffConfig.configId
        self:buffPlay(configId, damage, true)
        self._actor:doOnceBuff(buffConfig.buffRes)
        local sValue = damage.showValue
        if damage.type == 1 then
            sValue = -sValue
        end
        self:updateAnger(sValue)
    end
end

function Unit:_refreshAction()
    self:setAction("idle", true)
    self._actor:stopMoving()
    local buffList = self._buffList
    for _, v in pairs(buffList) do
        local buffData = HeroSkillEffect.get(v.configId)
        if buffData.buff_action ~= "" then
            self:setAction(buffData.buff_action, true)
        end
        if buffData.flash_action ~= "" then
            self._actor:doMoving(buffData.flash_action)
        end
    end
end

function Unit:_updateBuffShow(buff)
    if not buff.buffConfig then
        buff.buffConfig = HeroSkillEffect.get(buff.configId)
    end
    local buffData = buff.buffConfig
    local buffPos = buffData.buff_pos
    local buffPri = buffData.buff_pri
    if buffData.target_color == "translucent" then --透明，特殊处理一下
        self._actor:stopAllActions()
        self._actor:setOpacity(100)
        self._istransparent = true
        return
    end
    if buffData.buff_res == "" then
        return
    end
    if not self._showBuff[buffPos] then --没有buff的情况
        self._actor:showBuff(buffData.buff_res, buffData.buff_pos, buffData.target_color, buffData.buff_action)
        self._showBuff[buffPos] = buff
    elseif self._showBuff[buffPos].configId ~= buff.configId then
        local lastBuffData = self._showBuff[buffPos].buffConfig
        if buffData.buff_pri <= lastBuffData.buff_pri then
            self._actor:showBuff(buffData.buff_res, buffData.buff_pos, buffData.target_color, buffData.buff_action)
            self._showBuff[buffPos] = buff
        end
    else --相同configid的情况
        local data = buff.buffConfig
        if data.buff_sup == 1 then
            local buffCount = self._buffManager:getBuffCount(self.stageID, buff.configId)
            self._actor:showBuffCount(buffCount, data.buff_colour, data.buff_pos)
        end
    end
end

function Unit:_updateDeleteShowBuff(buff)
    local buffData = buff.buffConfig
    local buffPos = buffData.buff_pos
    local buffPri = buffData.buff_pri
    if self._showBuff[buffPos] and self._showBuff[buffPos].configId == buff.configId then
        local nextShowBuff = nil
        for i = #self._buffList, 1, -1 do
            local data = self._buffList[i].buffConfig
            if data.buff_res ~= "" and data.buff_pos == buffPos then
                if not nextShowBuff then
                    nextShowBuff = self._buffList[i]
                elseif data.buff_pri < nextShowBuff.buffConfig.buff_pri then
                    nextShowBuff = self._buffList[i]
                end
            end
        end
        if nextShowBuff then
            local nextData = nextShowBuff.buffConfig
            self._actor:showBuff(nextData.buff_res, nextData.buff_pos, nextData.target_color, buffData.buff_action)
            self._showBuff[buffPos] = nextShowBuff
            if nextData.buff_sup == 1 then
                local count = self._buffManager:getBuffCount(self.stageID, nextShowBuff.configId)
                self._actor:showBuffCount(count, nextData.buff_colour, nextData.buff_pos)
            end
        else
            self._actor:removeBuff(buffPos)
            self._showBuff[buffPos] = nil
        end
    end
end

--是否显示影子
function Unit:showShadow(v)
    self._shadow:setVisible(v)
end

--unitFade
function Unit:fade(isIn)
    self._actor:playFade(isIn, self._istransparent)
    if isIn then
        self.inCombineWatcher = false
        self._billBoard:setVisible(true)
        self:showShadow(true)
    else
        self._billBoard:setVisible(false)
        self:showShadow(false)
    end
end

--检测是否有动作
function Unit:checkAnimation(name)
    return self._actor:isAnimationExist(name)
end

--播放胜利动作
function Unit:playWinAction()
    if self:checkAnimation("win1") then
        self._actor:setActionWithCallback(
            "win",
            function()
                self:setAction("win1", true)
            end
        )
    else
        self:setAction("win", true)
    end
end

function Unit:doActionWithCallBack(action, callback)
    self._actor:setActionWithCallback(action, callback)
end

--展示技能
function Unit:showSkill(imageId)
    self._actor:showSkill(imageId)
end

--是否是主角
function Unit:isPlayer()
    return self.isLeader
end

--说话
function Unit:talk(position, face, content)
    if position == "0" then --任意位置
        self._actor:talk(face, content)
        self._isTalking = true
        self._talkTime = 0
    else
        local strArr = string.split(position, "|")
        for k, v in ipairs(strArr) do
            local position = tonumber(v)
            if position == self.cell then
                self._actor:talk(face, content)
                self._isTalking = true
                self._talkTime = 0
                break
            end
        end
    end
end

--如果失败的话，小怪说话
function Unit:endTalk(position, face, content)
    if position == "0" then --任意位置
        self._actor:talk(face, content)
    else
        local strArr = string.split(position, "|")
        for k, v in ipairs(strArr) do
            local position = tonumber(v)
            if position == self.cell then
                self._actor:talk(face, content)
                break
            end
        end
    end
end

--停止说话
function Unit:stopTalk()
    self._actor:stopTalk()
    self._isTalking = false
end

--设置bufflayer可见
function Unit:setBuffLayerVisible(s)
    self._actor:showBuffLayer(s)
end

--隐藏或者显示buff效果 包括buff显示以及变色
function Unit:setBuffEffectVisible(s)
    self._actor:showBuffLayer(s)
    self._actor:setColorVisible(s)
end

--设置
function Unit:showIdle2Effect(v)
    self._actor:showIdle2Effect(v)
end

--复活后表现
function Unit:showRebornEffect()
    self._hitTipView:popup(
        0,
        FightConfig.BUFF_REBORN_ID,
        "buff_damage",
        cc.p(self._positionIdle[1], self._positionIdle[2])
    )
    self._actor:doOnceEffect(FightConfig.REBOEN_EFFECT)
end

--播放合击duang
function Unit:playDuang(callback)
    self._actor:playCombineDuang(callback)
end

--播放指定特效
function Unit:playSpineEffect(spine, action, sound)
    self._actor:playEffect(spine, action)
    if sound ~= "" then
        local speed = Engine.getEngine():getBattleSpeed()
        G_AudioManager:playSound(Path.getFightSound(sound), speed)
    end
end

--处理damage跳字以及血量更新
--伤害类型，真实伤害，显示伤害， 伤害类型（暴击～闪避，等等）
function Unit:doHurt(type, damage, showDamage, hurts, protect)
    local damageType = 0
    if type == 1 then
        damageType = -1
    elseif type == 2 then
        damageType = 1
    end

    local showDamage = damageType * showDamage
    local damage = damageType * damage
    self:tipHit(showDamage, hurts)
    self:updateHP(damage, protect, true)
end

-- --附加伤害展示
-- function Unit:getAddHurt(type, damage, showDamage, hitInfo)
--     local damageType = 0
--     if type == 1 then
--         damageType = -1
--     elseif type == 2 then
--         damageType = 1
--     end

--     local showDamage = damageType * showDamage
--     local damage = damageType * damage
--     self:updateHP(damage)
--     self:tipHit(showDamage, hitInfo)
-- end

--附加伤害结束
function Unit:getAddHurtEnd()
    if not self.to_alive then
        self.is_alive = false
        if self:getState() == "StateIdle" then
            self:clearState()
            self:dying()
        end
        return
    end
    self:updateHpShadow(true)
end

function Unit:doMoving(moving)
    if self._actor then
        self._actor:doMoving(moving)
    end
end

function Unit:stopMoving()
    if self._actor then
        self._actor:stopMoving()
    end
end

function Unit:playHistoryShow(hisHeroId, skillId)
    if self._actor then
        self._actor:playHistoryShowAnim(hisHeroId, skillId, self.stageID)
    end
end

function Unit:getBufflist()
    return self._buffList
end

return Unit
