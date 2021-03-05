
-- AvatarPostion 根据弹幕 攻击动画
local AvatarPostion = class("AvatarPostion", function(node)
    return node
end)
local Queue = require("app.utils.Queue")

local CountryBossUserAvatar = require("app.scene.view.countrybossbigboss.CountryBossUserAvatar")
local CountryBossBigBossAvatar = require("app.scene.view.countrybossbigboss.CountryBossBigBossAvatar")
local UIActionHelper = require("app.utils.UIActionHelper")

function AvatarPostion:ctor(node)
    -- 左边常态站位
    self._leftPos = {
        cc.p(-300,0),
        cc.p(-450,-75),
        cc.p(-375,120),
        cc.p(-200,-150),
        cc.p(-250,150),
    }
    -- 左边常态站位 状态
    self._leftPosState = {true, true, true, true, true}
    -- 右边常态站位
    self._rightPos = {
        cc.p(300,0),
        cc.p(450,75),
        cc.p(375,-120),
        cc.p(200,150),
        cc.p(250,-150),
    }
    self._rightPosState = {true, true, true, true, true}

    -- 左边攻击站位
    self._leftAttackSlotPos = {
        cc.p(-180,0),
        cc.p(-110,-60),
        cc.p(-110,60),
    }
    -- 左边攻击站位 状态
    self._leftAttackSlotState = {true, true, true}

    -- 右边边攻击站位
    self._rightAttackSlotPos = {
        cc.p(180,0),
        cc.p(110,-60),
        cc.p(110,60),
    }
    -- 右边攻击站位 状态
    self._rightAttackSlotState = {true, true, true}

    self._bossPos = cc.p(0, 0)
    self._constAvatars = {}
    self._avatarCount = 0

    self._leftAttackQueue = Queue.new() -- 缓存左边攻击队列
    self._rightAttackQueue = Queue.new() -- 缓存右边攻击队列


    self._constAttackTable = {} -- 10个常驻 角色
    self._constAttackDict = {} --避免 站了2个相同的角色
    self._nextConstAttack = {} --更新 10个常驻角色，并把它加入攻击列表里面

    self._cacheAvatars = Queue.new() --缓存 avatar
    self._useAvatars = {} --正在使用的 avatar

    self:scheduleUpdateWithPriorityLua(handler(self, self._update),0)

    self._totalCreateAvatar = 0
end

function AvatarPostion:_getPositionByAvatar(isLeft, fixIndex)
    if isLeft then
        return self._leftPos[fixIndex]
    else
        return self._rightPos[fixIndex]
    end
end

function AvatarPostion:getPositionByIndex(index)
    return self._position[index] or cc.p(0, 0)
end

function AvatarPostion:_createAvatar()
    local userAvatar = CountryBossUserAvatar.new(handler(self, self._avatarStateChangeCallback))
    self:addChild(userAvatar)
    userAvatar:setScale(0.7)
    self._totalCreateAvatar = self._totalCreateAvatar + 1

    return userAvatar
end



function AvatarPostion:_initConstPosAvatar(isLeft, fixIndex, userData)
    if not userData then
        return
    end
    if self._useAvatars[userData.userId] then
        return
    end

    local pos = self:_getPositionByAvatar(isLeft, fixIndex)
    local avatar = self:_getAvatarFromCache()
    avatar:updateData(userData)
    avatar:setFixIndex(fixIndex)
    avatar:setIsLeft(isLeft)
    self._useAvatars[avatar:getUserId()] = avatar
    avatar:switchState(CountryBossUserAvatar.RUNTOCONST_STATE, pos)
end

function AvatarPostion:_constPosUpdate()
    for i = 1, 5 do
        if self._leftPosState[i] then
            local userData = self._constAttackTable[i*2 -1]
            self:_initConstPosAvatar(true, i, userData)
        end
        if self._rightPosState[i] then
            local userData = self._constAttackTable[i*2]
            self:_initConstPosAvatar(false, i, userData)
        end
    end
end


function AvatarPostion:addUserAvatar(userData)
    --超过 10 个
    if not userData then
        return
    end
    if #self._constAttackTable >= 10 then
        return
    end
    if self._constAttackDict[userData.userId] then
        return
    end

    self._constAttackDict[userData.userId] = true
    table.insert(self._constAttackTable, userData)
end

function AvatarPostion:addBoss(bossId)
    self._bossAvatar = CountryBossBigBossAvatar.new(bossId)
    self._bossAvatar:setPosition(self._bossPos)
    self._bossAvatar:setLocalZOrder(-1 * self._bossPos.y)
    self._isBossDie = self._bossAvatar:isBossDie()
    self:_setWin()
    self._bossAvatar:setPlayBossDieCallback(handler(self, self._setWin))
    self:addChild(self._bossAvatar)
end

function AvatarPostion:pushAttack(userData)
    if not  userData then
        return
    end
    if self._bossAvatar:isBossDie() then
        return
    end
    local avatar = self._useAvatars[userData.userId]
    if avatar then
        if avatar:isLeft() then
            self._leftAttackQueue:push(userData)
        else
            self._rightAttackQueue:push(userData)
        end
    else
        self._avatarCount  = self._avatarCount + 1
        if self._avatarCount % 2 == 0 then
            self._leftAttackQueue:push(userData)
        else
            self._rightAttackQueue:push(userData)
        end
    end

    self:addUserAvatar(userData)
end

function AvatarPostion:_getAvatarFromCache()
    local avatar = self._cacheAvatars:pop()
    if not avatar then
        avatar = self:_createAvatar()
    end
    avatar:setVisible(true)
    return avatar
end



function AvatarPostion:_recycleAvatar(avatar)
    avatar:setVisible(false)
    avatar:setFixIndex(0)
    avatar:setSlotIndex(0)
    avatar:setIsLeft(false)
    avatar:setRotation(0)
    avatar:switchState(CountryBossUserAvatar.IDLE_STATE)
    self._useAvatars[avatar:getUserId()] = nil
    logWarn("_recycleAvatar  "..avatar:getUserId())
    self._cacheAvatars:push(avatar)
end

function AvatarPostion:_avatarStateChangeCallback(avatar, newState, oldState)
    if oldState == CountryBossUserAvatar.RUNTOCONST_STATE
        and newState == CountryBossUserAvatar.IDLE_STATE then
        self:_runToConstPosCallback(avatar)
    elseif newState == CountryBossUserAvatar.RUNTOCONST_STATE then
        self:_updatePosState(avatar:isLeft(), avatar:getFixIndex(), false)
    elseif newState == CountryBossUserAvatar.RUNTOATTACK_STATE then
        self:_updatePosState(avatar:isLeft(), avatar:getFixIndex(), true)
    elseif oldState == CountryBossUserAvatar.FLY_STATE
        and newState == CountryBossUserAvatar.IDLE_STATE then
        self:_flyEndCallback(avatar)
    elseif newState == CountryBossUserAvatar.FLY_STATE then
        self:_flyBeginCallback(avatar)
    elseif newState == CountryBossUserAvatar.ATTACK_STATE then
        self:_attackCallback(avatar)
    end
end

function AvatarPostion:_runToConstPosCallback(avatar)
    local userData = self._nextConstAttack[avatar:getUserId()]
    local isLeft = avatar:isLeft()
    if  userData then
        if isLeft then
            self._leftAttackQueue:insert(1, userData)
        else
            self._rightAttackQueue:insert(1, userData)
        end
    end
    self._nextConstAttack[avatar:getUserId()] = nil
    self:_setWin()
end

function AvatarPostion:_attackCallback(avatar)
    if avatar:isLeft() then
        self._leftAttackBoss = true
    else
        self._rightAttackBoss = true
    end
end

function AvatarPostion:_flyEndCallback(avatar)
    self:_recycleAvatar(avatar)
end

function AvatarPostion:_flyBeginCallback(avatar)
    if avatar:isLeft() then
        self._leftAttackSlotState[avatar:getSlotIndex()] = true
    else
        self._rightAttackSlotState[avatar:getSlotIndex()] = true
    end
end

function AvatarPostion:_hit()
    local seqAction = UIActionHelper.createDelayAction(self._bossAvatar:getHitDelayTime(), function()
        for k, v in pairs(self._useAvatars)do
            if self._bossAvatar:isAttackAll() or v:isLeft() == self._bossAvatar:isLeft() then
                v:switchState(CountryBossUserAvatar.HIT_STATE)
            end
        end
    end)
    self:runAction(seqAction)
end

--拍飞
function AvatarPostion:_fly()
    local seqAction = UIActionHelper.createDelayAction(self._bossAvatar:getFlyDelayTime(), function()
        if self._bossAvatar:isAttackAll() then
            self._leftAttackBoss = false
            self._rightAttackBoss = false
        else
            if self._bossAvatar:isLeft() then
                self._leftAttackBoss = false
            else
                self._rightAttackBoss = false
            end
        end
        for k, v in pairs(self._useAvatars)do
            if self._bossAvatar:isAttackAll() or v:isLeft() == self._bossAvatar:isLeft() then
                v:switchState(CountryBossUserAvatar.FLY_STATE)
            end
        end
    end)
    self:runAction(seqAction)
end

function AvatarPostion:_bossAttackUpdate()
    if self._bossAvatar:isIdle() then

        if self._isBossDie then
            local seqAction = UIActionHelper.createDelayAction(0.8, function()
                self._bossAvatar:playBossDie()
            end)
            self._bossAvatar:runAction(seqAction)

        elseif self._leftAttackBoss then

            if not self._bossAvatar:isAttackAll() then
                self._bossAvatar:turnBack()
            end
            local seqAction = UIActionHelper.createDelayAction(0.3, function()
                self._bossAvatar:playerAttack()
                self:_hit()
                self:_fly()
            end)
            self._bossAvatar:runAction(seqAction)

        elseif self._rightAttackBoss then
            if not self._bossAvatar:isAttackAll() then
                self._bossAvatar:turnBack(false)
            end
            local seqAction = UIActionHelper.createDelayAction(0.3, function()
                self._bossAvatar:playerAttack()
                self:_hit()
                self:_fly()
            end)
            self._bossAvatar:runAction(seqAction)
        end
    end
end

function AvatarPostion:_playAttack(userData, slotIndex, isLeft)

    local avatar = self._useAvatars[userData.userId]
    if avatar and not avatar:canSwitchToState(CountryBossUserAvatar.RUNTOATTACK_STATE) then
        return false
    end

    if not avatar then
        avatar = self:_getAvatarFromCache()
        avatar:updateData(userData)
        avatar:setPosition(cc.p(G_ResolutionManager:getDesignWidth()/-2 - 200, -200))
        self._useAvatars[userData.userId] = avatar
    end
    avatar:setSlotIndex(slotIndex)
    avatar:setIsLeft(isLeft)
    local targetPos
    if isLeft then
        targetPos = self._leftAttackSlotPos[slotIndex]
    else
        targetPos = self._rightAttackSlotPos[slotIndex]
    end
    avatar:switchState(CountryBossUserAvatar.RUNTOATTACK_STATE, targetPos)
    return true
end


function AvatarPostion:_updatePosState(isLeft, fixIndex, trueOrFalse)
    if fixIndex == 0 then
        return
    end
    if isLeft then
        self._leftPosState[fixIndex] = trueOrFalse
        if trueOrFalse then
            local newUserData = self._leftAttackQueue:pop()
            if newUserData and not self._constAttackDict[newUserData.userId] then
                local oldUserData = self._constAttackTable[fixIndex*2 -1]
                if oldUserData then
                    self._constAttackDict[oldUserData.userId] = nil
                end
                self._constAttackTable[fixIndex*2 -1] = newUserData
                self._nextConstAttack[newUserData.userId] = newUserData
                self._constAttackDict[newUserData.userId] = true
            end
        end
    else
        self._rightPosState[fixIndex] = trueOrFalse
        if trueOrFalse then
            local newUserData = self._rightAttackQueue:pop()
            if newUserData and not self._constAttackDict[newUserData.userId] then
                local oldUserData = self._constAttackTable[fixIndex*2]
                if oldUserData then
                    self._constAttackDict[oldUserData.userId] = nil
                end
                self._constAttackTable[fixIndex*2] = newUserData
                self._nextConstAttack[newUserData.userId] = newUserData
                self._constAttackDict[newUserData.userId] = true
            end
        end
    end
end

function AvatarPostion:_update(dt)
    -- 遍历攻击站位
    for k, v in pairs(self._leftAttackSlotState) do
        if v then
            local leftAvatar = self._leftAttackQueue:pop()
            if not leftAvatar then
                break
            end
            if self._bossAvatar:isBossDie() then
                break
            end
            if not self:_playAttack(leftAvatar, k, true) then
                break
            end
            self._leftAttackSlotState[k] = false
        end
    end

    for k, v in pairs(self._rightAttackSlotState) do
        if v then
            local rightAvatar = self._rightAttackQueue:pop()
            if not rightAvatar then
                break
            end
            if self._bossAvatar:isBossDie() then
                break
            end
            if not self:_playAttack(rightAvatar, k, false) then
                break
            end
            self._rightAttackSlotState[k] = false
        end
    end
    self:_bossAttackUpdate()
    -- 遍历 常态站位
    self:_constPosUpdate()

    for k, v in pairs(self._useAvatars)do
        v:_update(dt)
    end
end


function AvatarPostion:_setWin()
    if self._isBossDie then
        for k, v in pairs(self._useAvatars)do
            v:switchState(CountryBossUserAvatar.WIN_STATE, nil, true)
            v:stopAllActions()
            -- v:clean()
        end
        self._bossAvatar:updateState()
    end
end


function AvatarPostion:updateBossState()
    local oldBossState = self._isBossDie
    self._isBossDie = self._bossAvatar:isBossDie()
    if oldBossState == false and self._isBossDie == true then
        self._bossAvatar:playBossDie()
    end
end

return AvatarPostion
