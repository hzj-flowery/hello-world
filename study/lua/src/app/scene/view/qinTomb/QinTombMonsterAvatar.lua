-- Author: hedili
-- Date:2018-04-19 14:10:18
-- Describle：秦皇陵怪物
local ViewBase = require("app.ui.ViewBase")
local QinTombMonsterAvatar = class("QinTombMonsterAvatar", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local QinTombAvatar = import(".QinTombAvatar")
local QinTombHelper = import(".QinTombHelper")
local QinTombConst = require("app.const.QinTombConst")
local StateMachine = require("app.utils.StateMachine")

QinTombMonsterAvatar.MAX_AVATAR_SIZE = 3

QinTombMonsterAvatar.CREATE_STATE = "Create"
QinTombMonsterAvatar.INIT_STATE = "Init"
QinTombMonsterAvatar.STAND_STATE = "Stand" --等待状态
QinTombMonsterAvatar.HOOK_STATE = "Hook" --打boss，与掠夺
QinTombMonsterAvatar.PK_STATE = "PK" --打boss，与掠夺
QinTombMonsterAvatar.REBORN_STATE = "ReBorn" --死亡状态


function QinTombMonsterAvatar:ctor(pointId, mapNode)
    --csb bind var name
    self._commonHeroAvatar = nil
    self._avatarName = nil
    self._currState = 0
    self._monsterId = pointId
    self._mapNode = mapNode
    local resource = {
        file = Path.getCSB("QinTombMonsterAvatar", "qinTomb"),
    
    }
    QinTombMonsterAvatar.super.ctor(self, resource)
end



function QinTombMonsterAvatar:_initStateMachine(defaultState)
    if self._stateMachine then
        return
    end
    local cfg = {
        ["defaultState"] = QinTombMonsterAvatar.CREATE_STATE,
        ["stateChangeCallback"] = handler(self, self._stateChangeCallback),
        ["state"] = {
            [QinTombMonsterAvatar.CREATE_STATE] = {
                ["nextState"] = {
                    [QinTombMonsterAvatar.INIT_STATE] = {
                    },
                },
            },
            [QinTombMonsterAvatar.INIT_STATE] = {
                ["nextState"] = {
                    [QinTombMonsterAvatar.STAND_STATE] = {
                    },
                    [QinTombMonsterAvatar.REBORN_STATE] = {
                    },
                    [QinTombMonsterAvatar.HOOK_STATE] = {
                    },
                    [QinTombMonsterAvatar.PK_STATE] = {
                    },
                },
                ["didEnter"] = handler(self, self._didEnterInit)
            },
            [QinTombMonsterAvatar.STAND_STATE] = {
                ["nextState"] = {
                    [QinTombMonsterAvatar.HOOK_STATE] = {
                    },
                    [QinTombMonsterAvatar.PK_STATE] = {
                    },
                },
                ["didEnter"] = handler(self, self._didEnterStand),
                ["didExit"] = handler(self, self._didWillExitStand)
            },
            [QinTombMonsterAvatar.HOOK_STATE] = {
                ["nextState"] = {
                    [QinTombMonsterAvatar.STAND_STATE] = {
                    },
                    [QinTombMonsterAvatar.PK_STATE] = {
                    },
                    [QinTombMonsterAvatar.REBORN_STATE] = {
                    },
                },
                ["didEnter"] = handler(self, self._didEnterHook),
                ["willExit"] = handler(self, self._didWillExitHook),
            },
            [QinTombMonsterAvatar.PK_STATE] = {
                ["nextState"] = {
                    [QinTombMonsterAvatar.HOOK_STATE] = {
                    },
                    [QinTombMonsterAvatar.STAND_STATE] = {
                    },
                },
                ["didEnter"] = handler(self, self._didEnterPK),
                ["willExit"] = handler(self, self._didWillExitPK),
            },
            [QinTombMonsterAvatar.REBORN_STATE] = {
                ["nextState"] = {
                    [QinTombMonsterAvatar.STAND_STATE] = {
                        ["transition"] = handler(self, self._transitionRebornToStand),
                        ["stopTransition"] = handler(self, self._stopTransitionRebornToStand),
                    },
                    [QinTombMonsterAvatar.HOOK_STATE] = {
                        ["transition"] = handler(self, self._transitionRebornToStand),
                        ["stopTransition"] = handler(self, self._stopTransitionRebornToStand),
                    },
                },
                ["didEnter"] = handler(self, self._didEnterReborn),
                ["willExit"] = handler(self, self._didWillExitReborn),
            },
        
        }
    }
    
    self._stateMachine = StateMachine.new(cfg)
end


-- Describle：
function QinTombMonsterAvatar:onCreate()
    
    self:_initStateMachine()
    self._nodeEffect:setVisible(false)
    self._touchPanel:addClickEventListenerEx(handler(self, self.onClickMonster))
    
    self:clearMonsterState()
    self:switchState(QinTombMonsterAvatar.INIT_STATE)
end

function QinTombMonsterAvatar:switchState(state, params, isForceStop)
    self._stateMachine:switchState(state, params, isForceStop)
end

function QinTombMonsterAvatar:onClickMonster(sender)
    -- body
    local result, errorFunc = QinTombHelper.checkAttackMonster(self._monsterId)
    if result == false then
        errorFunc()
        return
    end
    G_UserData:getQinTomb():c2sGraveBattlePoint()
end

function QinTombMonsterAvatar:getQinMonster(...)
    -- body
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    return monster
end

function QinTombMonsterAvatar:clearMonsterState(...)
    -- body
    --清理Monster状态
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local node = self:getChildByName("_commonHookAvatar" .. i)
        if node then
            node:removeFromParent()
        end
    end
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local node = self:getChildByName("_commonPkAvatar" .. i)
        if node then
            node:removeFromParent()
        end
    end
    
    --重新构建avatar
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local avatar = QinTombAvatar.new(self)
        avatar:setName("_commonHookAvatar" .. i)
        self:addChild(avatar)
        avatar:syncVisible(false)
        self["_commonHookAvatar" .. i] = avatar
    end
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local avatar = QinTombAvatar.new(self)
        avatar:setName("_commonPkAvatar" .. i)
        self:addChild(avatar)
        avatar:syncVisible(false)
        self["_commonPkAvatar" .. i] = avatar
    end


end
function QinTombMonsterAvatar:updateUI()
    -- body
    --初始化怪物状态
    logWarn("QinTombMonsterAvatar:updateUI()")
    
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    self._commonHeroAvatar:setBaseId(monster:getBaseId())
    self._commonHeroAvatar:setAsset(monster:getBaseId())
    
    self._avatarName:setString("" .. monster:getName())
    self._avatarName:setColor(Colors.getColor(monster:getColor()))
    self._avatarName:enableOutline(Colors.getColorOutline(monster:getColor()), 2)
    
    
    self._commonHeroAvatar:setAction("idle", true)
    self._commonHeroAvatar:setLocalZOrder(0)
    self:setPosition(monster:getPosition())
    
    self:updateHookAvatar()
    self:updatePkAvatar()
    
    self:updateHp()
    self:updateMonument()
    self._nodeAvatarInfo:setPosition(QinTombConst.MONSTER_AVATAR_INFO_POS)
    --self:playAttackEffect()
    --hook状态的话，攻击动作需要重置
    if self:getCurState() == QinTombMonsterAvatar.HOOK_STATE then
        logWarn("self:getCurState() = QinTombMonsterAvatar.HOOK_STATE")
        self:_enterHookAction()
    end
end

function QinTombMonsterAvatar:setMonsterVisible(show)
    if show == true then
        --self._commonHeroAvatar:setSoundEnable(true)
        for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
            local avatar = self:getChildByName("_commonHookAvatar" .. i)
            if avatar then
                avatar:setSoundEnable(true)
            end
        end
        
        self:setVisible(true)
    else
        for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
            local avatar = self:getChildByName("_commonHookAvatar" .. i)
            if avatar then
                avatar:setSoundEnable(false)
            end
        end
        self:setVisible(false)
    end
end

function QinTombMonsterAvatar:updateHp(...)
    -- body
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    local currHp, hpMax = monster:getDieTime()
    
    local percent = math.floor(currHp / hpMax * 100)
    
    if percent > 0 then
        self._percentText:setString(percent .. "%")
    else
        self._percentText:setString(" ")
    end
    
    self._monsterBlood:setPercent(percent)
    
    
    self:updateLabelState()
    self:playAttackEffect()
end

function QinTombMonsterAvatar:updateLabelState(...)
    -- body
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    if monster == nil then
        return
    end
    
    local monsterState = monster:getCurrState()
    
    self._avatarState:setVisible(false)
    self._avatarReborn:setVisible(false)
    
    if monsterState == QinTombConst.MONSTER_STATE_PK then
        local pkTime = QinTombHelper.getQinInfo("pk_time")
        local leftTime = G_ServerTime:getLeftSeconds(monster:getStop_time() + pkTime)
        if leftTime then
            self._avatarState:setString(Lang.get("qin_tomb_monster_state1", {num = leftTime}))
            self._avatarState:setVisible(true)
        end
    end
    if monsterState == QinTombConst.MONSTER_STATE_HOOK then
        
        end
    --怪物死亡重生倒计时
    if monsterState == QinTombConst.MONSTER_STATE_DEATH then
        local rebornTime = monster:getRebornTime()
        local curTime = G_ServerTime:getTime()
        if rebornTime > 0 and curTime <= rebornTime then
            local leftTime = rebornTime - curTime
            self._avatarReborn:setString(Lang.get("qin_tomb_monster_state2", {num = leftTime}))
            self._avatarReborn:setVisible(true)
        end
    end

end
--跟新挂机点玩家
function QinTombMonsterAvatar:updateHookAvatar(...)
    -- body
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    local teamId = monster:getOwn_team_id()
    
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local avatarNode = self:getChildByName("_commonHookAvatar" .. i)
        if avatarNode then
            avatarNode:syncVisible(false)
        end
    end
    
    if teamId and teamId > 0 then
        local teamUnit = G_UserData:getQinTomb():getTeamById(teamId)
        if teamUnit then
            local teamList = teamUnit:getTeamUsers()
            logWarn("QinTombMonsterAvatar:updateHookAvatar")
            for i, value in ipairs(teamList) do
                local hookWorldPos, dir = monster:getHookPosition(i)
                local avatarNode = self:getChildByName("_commonHookAvatar" .. i)
                if avatarNode then
                    avatarNode:syncVisible(true)
                    avatarNode:updateUI(value, teamUnit:getTeamId(), teamUnit:getTeamLeaderId())
                    avatarNode:setPosition(hookWorldPos)
                    --avatarNode:syncPosition(hookWorldPos)
                    if dir then
                        avatarNode:setAvatarScaleX(dir)
                    end
                    
                    avatarNode:setLocalZOrder(-hookWorldPos.y)
                end
            end
        end
    end
end


--跟新PK点玩家
function QinTombMonsterAvatar:updatePkAvatar(...)
    -- body
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    local teamId = monster:getBattle_team_id()
    
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local avatarNode = self:getChildByName("_commonPkAvatar" .. i)
        if avatarNode then
            avatarNode:syncVisible(false)
        end
    end
    
    if teamId == 0 then
        return
    end
    local teamUnit = G_UserData:getQinTomb():getTeamById(teamId)
    if teamUnit == nil then
        return
    end
    
    local teamList = teamUnit:getTeamUsers()
    for i, value in ipairs(teamList) do
        local pkPos = monster:getPkPosition(i)
        local hookPos, dir = monster:getHookPosition(i)
        local avatarNode = self:getChildByName("_commonPkAvatar" .. i)
        if avatarNode then
            avatarNode:syncVisible(true)
            avatarNode:updateUI(value, teamUnit:getTeamId(), teamUnit:getTeamLeaderId())
            avatarNode:setPosition(pkPos)
            --avatarNode:syncPosition(pkPos)
            avatarNode:setAvatarScaleX(dir)
            avatarNode:setLocalZOrder(-pkPos.y)
            avatarNode:showPkEffect(hookPos, pkPos)
        end
    end


end


--刷新墓地
function QinTombMonsterAvatar:updateMonument(...)
    -- body
    local UIHelper = require("yoka.utils.UIHelper")
    self._monumentAvatar:removeAllChildren()
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    local monumentList = monster:getMonumentList()
    dump(monumentList)
    
    local function createDeadImg(pos)
        local tempNode = UIHelper.createImage({texture = Path.getQinTomb("qin_dead_state")})
        tempNode:setPosition(pos)
        tempNode:setLocalZOrder(-pos.y)
        self._monumentAvatar:addChild(tempNode)
    end

    for i, value in ipairs(monumentList) do
        for k, j in ipairs(value.member) do
            if value.position == 1 then
                local pos = value.pkPos[k]
                if pos and type(pos) == "table" then
                  	createDeadImg(pos)
                end
            else
                local pos = value.hookPos[k]
                if pos and type(pos) == "table" then
                	createDeadImg(pos)
                end
            end
        end
    end
end

function QinTombMonsterAvatar:setAction(...)
    -- body
    self._commonHeroAvatar:setAction(...)
end


function QinTombMonsterAvatar:showShadow(...)
    -- body
    self._commonHeroAvatar:showShadow(...)
end


function QinTombMonsterAvatar:setAniTimeScale(...)
    -- body
    self._commonHeroAvatar:setAniTimeScale(...)
end

function QinTombMonsterAvatar:turnBack(...)
    self._commonHeroAvatar:turnBack(...)
end



function QinTombMonsterAvatar:playAttackEffect()
    --检测myTeam是否在boss格子上
    if QinTombHelper.checkMyTeamInBossPoint(self._monsterId) then
        if self._nodeEffect:isVisible() == false then
            self._nodeEffect:setVisible(true)
            self._nodeEffect:removeAllChildren()
            G_EffectGfxMgr:createPlayGfx(self._nodeEffect, "effect_xianqinhuangling_shuangjian", nil, true)
        end
    else
        self._nodeEffect:setVisible(false)
    end
end


function QinTombMonsterAvatar:playAttackAction(...)
    -- body
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    if monster == nil then
        return
    end
    
    
    local seq = cc.Sequence:create(
        cc.DelayTime:create(0.8),
        cc.CallFunc:create(function()
            local dirIndex = math.random(1, 2)
            local dir = 1.0
            if dirIndex == 2 then
                dir = -1.0
            end
            self._commonHeroAvatar:setAction("skill1", false)
            self._commonHeroAvatar:setScaleX(dir)
        end),
        cc.DelayTime:create(monster:getAttackActionTime()),
        cc.CallFunc:create(function()
            self._commonHeroAvatar:setAction("idle", true)
        end),
        cc.DelayTime:create(1),
        cc.CallFunc:create(function()
            
            end)
    )
    local rep = cc.RepeatForever:create(seq)
    self:stopAllActions()
    self:runAction(rep)
end


function QinTombMonsterAvatar:_didEnterInit()
    logWarn("QinTombMonsterAvatar _didEnterInit")

end

function QinTombMonsterAvatar:_stateChangeCallback(newState, oldState)
    logWarn(string.format("QinTombMonsterAvatar _stateChangeCallback newState[%s], oldState[%s]", newState, oldState))

end


function QinTombMonsterAvatar:_didEnterStand()
    logWarn("QinTombMonsterAvatar:_didEnterStand")
    self:stopAllActions()
    self._nodeRole:setVisible(true)
    self:setAction("idle", true)

end

function QinTombMonsterAvatar:_didWillExitStand(nextState)
    logWarn(" QinTombMonsterAvatar:_didWillExitStand")
end

function QinTombMonsterAvatar:_enterHookAction(...)
    -- bodybody
    self._nodeRole:setVisible(true)
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local avatar = self:getChildByName("_commonHookAvatar" .. i)
        if avatar and avatar:isVisible() then
            logWarn("QinTombMonsterAvatar:_enterHookAction" .. i)
            avatar:playLoopAttackAction()
        end
    end
    self:playAttackAction()
end


function QinTombMonsterAvatar:_didEnterHook()
    logWarn("QinTombMonsterAvatar:_didEnterHook")
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    local serverState = monster:getCurrState()
    self:_enterHookAction()
end

function QinTombMonsterAvatar:_didWillExitHook(...)
    -- body
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    local serverState = monster:getCurrState()
    
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local avatar = self:getChildByName("_commonHookAvatar" .. i)
        if avatar and avatar:isVisible() then
            avatar:stopLoopAttackAction()
        end
    end
    
    
    logWarn("QinTombMonsterAvatar:_didWillExitHook")
end

function QinTombMonsterAvatar:_didEnterPK()
    logWarn("QinTombMonsterAvatar:_didEnterPK")
    self._commonHeroAvatar:setAction("idle", true)
end

function QinTombMonsterAvatar:_didWillExitPK(...)
    
    
    logWarn("QinTombMonsterAvatar:_didWillExitPK")
end


function QinTombMonsterAvatar:_didEnterReborn()
    
    for i = 1, QinTombMonsterAvatar.MAX_AVATAR_SIZE do
        local avatar = self:getChildByName("_commonHookAvatar" .. i)
        if avatar then
            avatar:stopLoopAttackAction()
        end
    end
    
    self:stopAllActions()
    
    --logWarn("GuildWarRunAvatorNode ----------------  _didEnterReborn")
    local callback = function()
        local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
        local serverState = monster:getCurrState()
        if serverState == QinTombConst.MONSTER_STATE_HOOK or serverState == QinTombConst.MONSTER_STATE_PK then
            self:switchState(QinTombMonsterAvatar.HOOK_STATE)
        else
            self:switchState(QinTombMonsterAvatar.STAND_STATE)
        end
    end
    local playDieAction = function()
        self._commonHeroAvatar:setAction("die", false)
    end
    local playDieActionFinish = function()
        self._nodeRole:setVisible(false)
    end
    local curTime = G_ServerTime:getTime()
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    local time = monster:getRebornTime()
    local leftTime = math.max(0.01, time - curTime)
    local dieAction = monster:getDieActionTime()
    local seq = cc.Spawn:create(
        cc.Sequence:create(
            cc.CallFunc:create(playDieAction),
            cc.FadeOut:create(dieAction),
            cc.CallFunc:create(playDieActionFinish)
        ),
        cc.Sequence:create(
            cc.DelayTime:create(leftTime),
            cc.CallFunc:create(callback)
    )
    )
    self._nodeRole:stopAllActions()
    self._nodeRole:runAction(seq)

end


function QinTombMonsterAvatar:_stopTransitionRebornToStand()

end

function QinTombMonsterAvatar:_didWillExitReborn()

end

function QinTombMonsterAvatar:_transitionRebornToStand(finishFunc)
    self._nodeRole:setVisible(true)
    local function eventFunction(event)
        if event == "finish" then
            self._gfxEffect1 = nil
            self._gfxEffect2 = nil
            
            finishFunc()
        end
    end
    local gfxEffect1 = G_EffectGfxMgr:createPlayGfx(self._nodeRole, "effect_juntuan_chuxian", eventFunction)
    local gfxEffect2 = G_EffectGfxMgr:applySingleGfx(self._nodeRole, "smoving_juntuan_chuxian")
    self._gfxEffect1 = gfxEffect1
    self._gfxEffect2 = gfxEffect2
end


function QinTombMonsterAvatar:getCurState()
    return self._stateMachine:getCurState()
end


function QinTombMonsterAvatar:canSwitchToState(nextState, isForceStop)
    return self._stateMachine:canSwitchToState(nextState, isForceStop)
end


function QinTombMonsterAvatar:_saveSwitchState(state, params)
    logWarn(" QinTombMonsterAvatar:_saveSwitchState   " .. state)
    if self:canSwitchToState(state, isForceStop) then
        self._stateMachine:switchState(state, params, true)
    end
end


--同步服务器信息
function QinTombMonsterAvatar:synServerInfo()
    -- body
    logWarn("QinTombMonsterAvatar:synServerInfo")
    local curstate = self:getCurState()--self:getCurState()
    local monster = G_UserData:getQinTomb():getMonster(self._monsterId)
    
    local serverState = monster:getCurrState()
    
    logWarn(string.format("QinTombMonsterAvatar:synServerInfo serverState[%d], curstate[%s] monsterId[%d] monsterName[%s]",
        serverState,
        curstate,
        self._monsterId,
        monster:getName()))
    
    local function switchHookState(serverState)
        if serverState == QinTombConst.MONSTER_STATE_HOOK then
            logWarn("QinTombMonsterAvatar:switchAttackState xxxxxxxxxxxxxxxxxxxx")
            self:_saveSwitchState(QinTombMonsterAvatar.HOOK_STATE)
            return true
        end
        return false
    end
    
    local function switchPKState(serverState)
        if serverState == QinTombConst.MONSTER_STATE_PK then
            self:_saveSwitchState(QinTombMonsterAvatar.PK_STATE)
            return true
        end
        return false
    end
    
    --切换到死亡状态
    local function switchRebornState(serverState)
        if serverState == QinTombConst.MONSTER_STATE_DEATH then
            self:_saveSwitchState(QinTombMonsterAvatar.REBORN_STATE)
        end
    end
    
    local function switchIdleState(serverState)
        if serverState == QinTombConst.MONSTER_STATE_IDLE then
            self:_saveSwitchState(QinTombMonsterAvatar.STAND_STATE)
        end
    end
    
    if curstate == QinTombMonsterAvatar.STAND_STATE or curstate == QinTombMonsterAvatar.INIT_STATE then
        if switchHookState(serverState) then
            return
        end
        if switchPKState(serverState) then
            return
        end
    end
    
    if curstate == QinTombMonsterAvatar.HOOK_STATE or curstate == QinTombMonsterAvatar.INIT_STATE then
        if switchPKState(serverState) then
            return
        end
        if switchRebornState(serverState) then
            return
        end
        if switchIdleState(serverState) then
            return
        end
    end
    
    if curstate == QinTombMonsterAvatar.PK_STATE or curstate == QinTombMonsterAvatar.INIT_STATE then
        if switchHookState(serverState) then
            return
        end
        if switchIdleState(serverState) then
            return
        end
    end

end
return QinTombMonsterAvatar
