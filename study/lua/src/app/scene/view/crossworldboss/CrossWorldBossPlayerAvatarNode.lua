--世界boss
local ViewBase = require("app.ui.ViewBase")
local CrossWorldBossPlayerAvatarNode = class("CrossWorldBossPlayerAvatarNode", ViewBase)

local scheduler = require("cocos.framework.scheduler")
local CrossWorldBossHelper = import(".CrossWorldBossHelper")
local CrossWorldBossConst = require("app.const.CrossWorldBossConst")

local FLY_SPEED = 800
local FLY_HEIGHT = 500


function CrossWorldBossPlayerAvatarNode:ctor()
    self._commonHeroAvatar = nil
    self._baseId = 0
    self._idlePos = nil
    self._pozhenPos = nil
    self._inAttacking = false
    self._isRandomMoving = false
    self._isPozhaoCamp = false
    self._hitdownIndex = 0
    self._liedownAndBackAction = nil
    self._avatarData = nil

    local resource = {
        file = Path.getCSB("CrossWorldBossPlayerAvatarNode", "crossworldboss"),
        binding = {

		}
    }

    CrossWorldBossPlayerAvatarNode.super.ctor(self, resource)
end


function CrossWorldBossPlayerAvatarNode:onCreate()
    self._commonHeroAvatar:setScale(0.7)
end

function CrossWorldBossPlayerAvatarNode:onEnter()

end

function CrossWorldBossPlayerAvatarNode:onExit()
    self:_endMoveTimer()

    if self._bezierFlyTimer then
        scheduler.unscheduleGlobal(self._bezierFlyTimer)
        self._bezierFlyTimer = nil 
    end

    self:stopAllActions()
end

function CrossWorldBossPlayerAvatarNode:moveToSuperAttackPos( pos )
    print("moveToSuperAttackPos")
    self._pozhenPos = pos

    if self._inAttacking or self._inMoving then
        return
    end

    self._moveEndCallback = nil

    self:stopAllActions()
    self:moveToPos(self._pozhenPos.x, self._pozhenPos.y, 0.8, function (  )
        self:turnBack(self._pozhenPos.x > 568)
        self._commonHeroAvatar:setAction("idle", true)
    end)
end

function CrossWorldBossPlayerAvatarNode:backToStandPos( t )
    print("backToStandPos, id = "..self._baseId)
    local pos = self._pozhenPos or self._idlePos

    if self._inAttacking then
        return
    end

    self._moveEndCallback = nil

    local time = t or 1.2
    self:stopAllActions()
    self:moveToPos(pos.x, pos.y, time, function (  )
        print("finish backToStandPos, id = "..self._baseId)
        self:turnBack(pos.x > 568)
        self._isRandomMoving = false 

        -- 这里处理移动过程中状态发生改变的情况，如果返回后,返回前的状态和当前状态不一致，就继续走
        if self._pozhenPos and self._pozhenPos.x ~= pos.x and self._pozhenPos.y ~= pos.y then
            self:backToStandPos()
        else
            self._commonHeroAvatar:setAction("idle", true)
        end
    end)
end

function CrossWorldBossPlayerAvatarNode:backToIdlePos( t )
    print("backToIdlePos, id = "..self._baseId)
    self._pozhenPos = nil

    if self._inAttacking then
        return
    end

    self._moveEndCallback = nil

    local time = t or 0.8
    self:stopAllActions()
    self:moveToPos(self._idlePos.x, self._idlePos.y, time, function (  )
        print("finish backToIdlePos, id = "..self._baseId)
        self:turnBack(self._idlePos.x > 568)
        self._isRandomMoving = false 
        self._commonHeroAvatar:setAction("idle", true)
    end)
end

function CrossWorldBossPlayerAvatarNode:beginRandowMove(param)
    self._randomMoveParam = param
    self:_doOneRandomMove()
end


function CrossWorldBossPlayerAvatarNode:_handleRandomMoveParam( param )

    local posX, posY = self:getPosition()

    self._loweryBoundaryX = param.loweryBoundaryX
    self._upperyBoundaryX = param.upperyBoundaryX

    local random1 = math.random()
    self._moveXDistance = param.lowerMoveDisX + random1 * (param.upperMoveDisX - param.lowerMoveDisX) 

    -- 到达左右边界强制反向移动
    if posX - self._loweryBoundaryX < 5 then
        self._moveXDistance = math.abs( self._moveXDistance )
    elseif self._upperyBoundaryX - posX < 5 then
        self._moveXDistance = -math.abs( self._moveXDistance )
    end

    local random2 = math.random()
    self._moveYDistance = param.lowerMoveDisY + random2 * (param.upperMoveDisY - param.lowerMoveDisY) 

    -- 到达上下边界强制反向移动
    local curMaxY = G_UserData:getCrossWorldBoss():getMaxYByX(math.ceil(posX))
    if curMaxY - posY < 10 then
        self._moveYDistance = -math.abs( self._moveYDistance )
    end

    self._targetPosY = posY + self._moveYDistance
    self._targetPosX = posX + self._moveXDistance

    --目标X坐标对应的最大Y
    local targetMaxY = G_UserData:getCrossWorldBoss():getMaxYByX(math.ceil(self._targetPosX))

    --限制目标位置范围
    self._targetPosY = math.min(targetMaxY, math.max(0, self._targetPosY))
    self._targetPosX = math.min(self._upperyBoundaryX, math.max(self._loweryBoundaryX, self._targetPosX))

    local random3 = math.random()
    self._moveTime = param.lowerTime + random3 * (param.upperTime - param.lowerTime) 

    local random4 = math.random()
    self._pauseTime = param.lowerPauseTime + random4 * (param.upperPauseTime - param.lowerPauseTime) 
end

function CrossWorldBossPlayerAvatarNode:_doOneRandomMove(  )
    if self._isRandomMoving then
        return
    end

    self:_handleRandomMoveParam(self._randomMoveParam)

    self._isRandomMoving = true

    self:moveToPos(self._targetPosX, self._targetPosY, self._moveTime, function (  )
        local idleAction = cc.CallFunc:create(handler(self, function () 
            self._commonHeroAvatar:setAction("idle", true)
        end))
        local delayAction2 = cc.DelayTime:create(self._pauseTime)
        local finishAction = cc.CallFunc:create(handler(self, function () 
            self._isRandomMoving = false 
    
            if self._stopRandomMove then
    
            else
                self:_doOneRandomMove()
            end
        end))
    
        local action = cc.Sequence:create(idleAction, delayAction2, finishAction)
        self:runAction(action)
    end)
end

function CrossWorldBossPlayerAvatarNode:moveToPos( x, y, t, callback )
    local curPosX, curPosY = self:getPosition()

    self:_endMoveTimer()

    self._inMoving = true

    if t <= 0 or (x == curPosX and y == curPosY) then
        self:setPosition(x, y)
        self._inMoving = false
        
        return
    end

    self._moveEndCallback = callback

    self._positionDeltaX = x - curPosX
    self._positionDeltaY = y - curPosY
    self._startPositionX = curPosX
    self._startPositionY = curPosY
    self._elapsed = 0
    self._duration = t
    
    self._moveTimer = scheduler.scheduleGlobal(handler(self, self._moveUpdate), 1 / 30)

    self:turnBack(x < curPosX)

    self._commonHeroAvatar:setAction("run", true)
    self:setCascadeOpacityEnabled(true)
end

function CrossWorldBossPlayerAvatarNode:_endMoveTimer(  )
    if self._moveTimer then
        scheduler.unscheduleGlobal(self._moveTimer)
        self._moveTimer = nil
    end
end

function CrossWorldBossPlayerAvatarNode:_moveUpdate(f)
    local newPosX, newPosY
    local percent = math.max(0, math.min(1, (self._elapsed + f) / self._duration))
    newPosX = self._startPositionX + self._positionDeltaX * percent
    newPosY = self._startPositionY + self._positionDeltaY * percent
    self._elapsed = self._elapsed + f

    -- 结束移动条件
    if self._elapsed >= self._duration then 
        if self._moveEndCallback then
            self:_moveEndCallback()
            self._moveEndCallback = nil
        end

        self:_endMoveTimer()

        self._inMoving = false
    end

    local scale = 1 - 0.36 * math.min(1, (newPosY / 400))
    self:setScale(scale)
    self:setLocalZOrder(10000 - newPosY)

    self:setPosition(newPosX, newPosY)
end

function CrossWorldBossPlayerAvatarNode:isAttacking(  )
    return self._inAttacking
end

function CrossWorldBossPlayerAvatarNode:doAttack(callback, bossAvatar, bulletId, isForceAttack)
    print("doAttack, id = "..self._baseId)

    if self._inAttacking then
        return 
    end

    if self._inMoving then
        -- 在往idle pos跑动的时候发起攻击会中断当前跑动，立即攻击boss
        if isForceAttack then
            self:_endMoveTimer()
            self._inMoving = false
        else
            return
        end
    end

    if self._liedownAndBackAction then
        self:stopAction(self._liedownAndBackAction)
        self._liedownAndBackAction = nil
    end

    self._inAttacking = true

    local posX, posY = self:getPosition()

    local attackPos = nil
    if posX > 568 then
        attackPos = G_UserData:getCrossWorldBoss():getRightAttackPos()
    else
        attackPos = G_UserData:getCrossWorldBoss():getLeftAttackPos()
    end

    if self._isPozhaoCamp == true and self._pozhenPos then  --破招阵营玩家在position2上
        local attackAction = cc.CallFunc:create(handler(self, self._playAniAndSound))
        local delayAction1 = cc.DelayTime:create(2)
        local stopAttackAction = cc.CallFunc:create(handler(self, self._stopAniAndSound))
        local bossAttackedAction = cc.CallFunc:create(handler(self, function (  )
            if bossAvatar then
                bossAvatar:bossAttackedCallback(self._isPozhaoCamp, posX)
            end
        end))

        local delayAction2 = cc.DelayTime:create(0.5)

        local rebornAction = cc.CallFunc:create(handler(self, function (  )
            self._inAttacking = false

            if callback then
                callback()
            end

            self:_reborn()
        end))

        local action = cc.Sequence:create(attackAction, delayAction1, stopAttackAction, bossAttackedAction, delayAction2, rebornAction)
        self:runAction(action)
    else
        self:moveToPos(attackPos.x, attackPos.y, 0.5, function (  )
            if callback then 
                callback()
                self:_reborn()
            else
                if self._isPozhaoCamp == false then  --非破招阵营玩家
                    local actionsArray = {}

                    local attackAction = cc.CallFunc:create(handler(self, self._playAniAndSound))
                    local delayAction1 = cc.DelayTime:create(0.8)
                    local stopAttackAction = cc.CallFunc:create(handler(self, self._stopAniAndSound))
                    local disappearAction = cc.CallFunc:create(handler(self, function (  )
                        local dieAction = cc.CallFunc:create(handler(self, self._playFantanAnimation))

                        local bossAttackedAction = cc.CallFunc:create(handler(self, function (  )
                            if bossAvatar then
                                bossAvatar:bossAttackedCallback(self._isPozhaoCamp, posX)
                            end
                        end))

                        local rebornAction = cc.CallFunc:create(handler(self, self._playDisappearAndRebornEffect))

                        local disappearActionArray = {}
                        local bossState = G_UserData:getCrossWorldBoss():getState()
                        if ( self._userId == G_UserData:getBase():getId() and bossState == CrossWorldBossConst.BOSS_CHARGE_STATE) or 
                             bulletId == 601 then  --bulletId == 601 时代表此次攻击在蓄力状态下 
                            disappearActionArray = {dieAction, bossAttackedAction}
                        else
                            disappearActionArray = {bossAttackedAction, rebornAction}
                        end

                        local action1 = cc.Sequence:create(disappearActionArray)
                        self:runAction(action1)
                    end))

                    actionsArray = {attackAction, delayAction1, stopAttackAction, disappearAction}

                    local action = cc.Sequence:create(actionsArray)
                    self:runAction(action)
                else   --破招阵营玩家但不在position2上
                    local attackAction = cc.CallFunc:create(handler(self, self._playAniAndSound))
                    local delayAction1 = cc.DelayTime:create(1.5)
                    local stopAttackAction = cc.CallFunc:create(handler(self, self._stopAniAndSound))
                    local bossAttackedAction = cc.CallFunc:create(handler(self, function (  )
                        if bossAvatar then
                            bossAvatar:bossAttackedCallback(self._isPozhaoCamp, posX)
                        end
                    end))

                    local rebornAction = cc.CallFunc:create(handler(self, self._playDisappearAndRebornEffect))
                    local action = cc.Sequence:create(attackAction, delayAction1, stopAttackAction, bossAttackedAction, rebornAction)

                    self:runAction(action)
                end
            end
        end)
    end
end

function CrossWorldBossPlayerAvatarNode:_playDisappearAndRebornEffect(  )
    local function eventFunction(event )
        -- body
        if event == "finish" then
            local posX, posY = self:getPosition()
            if posX > 568 then
                self:setPosition(1336, 280)
            else
                self:setPosition(-200, 280)
            end
            self._nodePlatform:setVisible(true)
            self._nodePlatform:setOpacity(255)
            self._nodePlatform:setScaleX(1)
            self._nodePlatform:setScaleY(1)

            self._inAttacking = false
            self:backToStandPos(1)
        end
    end

    --self._commonHeroAvatar:setVisible(false)

    local  gfxEffect = G_EffectGfxMgr:createPlayGfx(self,"effect_juntuan_xiaoshi",eventFunction)
    G_EffectGfxMgr:applySingleGfx(self._nodePlatform,"smoving_juntuan_xiaoshi")
end

function CrossWorldBossPlayerAvatarNode:updatePlayerInfo(avatarData)
    self._avatarData = avatarData

    self:updateAvatar(avatarData)
    
    self:setPlayerName(avatarData.name, avatarData.officialLevel)
    self:setUserId(avatarData.userId)
    self._commonHeroAvatar:showTitle(avatarData.titleId,self.__cname)-- 显示称号
end

function CrossWorldBossPlayerAvatarNode:setUserId( userId )
    -- body
    self._userId =userId
end

function CrossWorldBossPlayerAvatarNode:setHitdownIndex( index )
    self._hitdownIndex = index
end

function CrossWorldBossPlayerAvatarNode:getHitdownIndex(  )
    return self._hitdownIndex
end

function CrossWorldBossPlayerAvatarNode:setIsPozhaoCamp ( flag )
    self._isPozhaoCamp = flag
end

function CrossWorldBossPlayerAvatarNode:getIsPozhaoCamp(  )
    return self._isPozhaoCamp
end

function CrossWorldBossPlayerAvatarNode:updateAvatar(avatarData)
 
    self._baseId = avatarData.baseId
    self._commonHeroAvatar:updateAvatar(avatarData.playerInfo)
    
end

function CrossWorldBossPlayerAvatarNode:playAnimationOnce(animName)
    self._commonHeroAvatar:playAnimationOnce(animName)
end

function CrossWorldBossPlayerAvatarNode:_playAttackAnimation()
    self._commonHeroAvatar:setAction("skill1", false)
end

function CrossWorldBossPlayerAvatarNode:_stopAniAndSound()
    if self._flashObj then
        self._flashObj:finish()
        self._flashObj = nil
    end

    local hero, shadow = self._commonHeroAvatar:getFlashEntity()
    shadow:setPosition(cc.p(0, 0))


    -- 破盾成功后会播放一个sound，这里特殊处理是为了避免把这个sound给停了
    local bossState = G_UserData:getCrossWorldBoss():getState()
    if bossState == CrossWorldBossConst.BOSS_WEAK_STATE then
        local stateStartTime = G_UserData:getCrossWorldBoss():getState_startTime()
        local curTime = G_ServerTime:getTime()
        local stateContinueTime = CrossWorldBossHelper.getParameterValue("weak_last_time")

        local weekTime = stateStartTime + stateContinueTime - curTime
        weekTime = math.min(weekTime, stateContinueTime)

        if weekTime <= stateContinueTime - 5 then
            G_AudioManager:stopAllSound()
        end
    else
        G_AudioManager:stopAllSound()
    end
end

function CrossWorldBossPlayerAvatarNode:_playAniAndSound()
    local function getAttackAction()
		--[[
		1.color=4、5、6的武将：hero id&001
		2.橙升红武将：91&hero id&001
		3.男主角：1002
		4.女主角：11002
        --]]
        local playerInfo = self._avatarData.playerInfo
		if playerInfo.limit == 1 then
			local retId = "91"..playerInfo.covertId.."001"
			return tonumber(retId)
		else
			if playerInfo.covertId < 100 then
				if playerInfo.covertId < 10 then
					return 1001
				end
				if playerInfo.covertId > 10 then
					return 11001
				end
			end
			local retId = playerInfo.covertId.."001"
			return tonumber(retId)
		end
    end
    
 	local FlashPlayer = require("app.flash.FlashPlayer")
    local hero, shadow = self._commonHeroAvatar:getFlashEntity()
	local attackId = getAttackAction()
	local hero_skill_play = require("app.config.hero_skill_play")
	local skillData = hero_skill_play.get(attackId)
	if skillData then
		if self._flashObj then
			self._flashObj:finish()
			self._flashObj = nil
		end
        local ani = Path.getAttackerAction(skillData.atk_action)
        local posX, posY = self:getPosition()
		self._flashObj = FlashPlayer.new(hero, shadow, ani, posX > 568, self._commonHeroAvatar, true )
		self._flashObj:start()
	end

end


function CrossWorldBossPlayerAvatarNode:_playDieAnimation()
    self._commonHeroAvatar:setAction("hitlie", false)
end

function CrossWorldBossPlayerAvatarNode:liedownAndGotoIdlepos( index )
    print("self._hitdownIndex "..self._hitdownIndex)

    if self._inAttacking or self._inMoving then
        self._pozhenPos = nil 
        return
    end

    local delayAction1 = cc.DelayTime:create(0.5 + self._hitdownIndex * 0.2)

    local hitlieAction = cc.CallFunc:create(handler(self, function () 
        self._commonHeroAvatar:setAction("hitlie", false)
    end))

    local delayAction2 = cc.DelayTime:create((6-self._hitdownIndex) * 0.2)

    local backAction = cc.CallFunc:create(handler(self, function () 
        if self._pozhenPos then
            self:backToIdlePos()
        else
            self._commonHeroAvatar:setAction("idle", true)
        end

        self._liedownAndBackAction = nil
    end))

    self._liedownAndBackAction = cc.Sequence:create(delayAction1, hitlieAction, delayAction2, backAction)
    self:runAction(self._liedownAndBackAction)
end

function CrossWorldBossPlayerAvatarNode:_playFantanAnimation()
    --self._commonHeroAvatar:playAnimationOnce("hitlie")
    self._commonHeroAvatar:setAction("hitfly", true)
    self:_startFlyAction( function (  )
        self._inAttacking = false
        self:backToIdlePos()
    end)
end

function CrossWorldBossPlayerAvatarNode:_startFlyAction(callback)
    if self._startPlayFly then
        return
    end
    local p1x, p1y = self:getPosition()
    local distance = math.random(680, 750)
    local p1 = cc.p(p1x, p1y)
    local p2 = cc.p(0, 0)
    local p3 = cc.p(0, p1.y)

    if p1x > 568 then
        p3.x = p1.x + distance
        p2.x = p1.x + distance / 2.5
    else
        p3.x = p1.x - distance
        p2.x = p1.x - distance / 2.5
    end

    p2.y = p1.y + FLY_HEIGHT
    self._targetRotate = -30

    self._bezierPos1 = p1
    self._bezierPos2 = p2
    self._bezierPos3 = p3
    self._bezierTime = distance / FLY_SPEED
    self._curBezierTime = 0
    self._startPlayFly = true
    self._flyActionMoveEndCallBack = callback

    if self._bezierFlyTimer then
        scheduler.unscheduleGlobal(self._bezierFlyTimer)
        self._bezierFlyTimer = nil 
    end

    self._bezierFlyTimer = scheduler.scheduleGlobal(handler(self, self._flyUpdate), 1 / 30)

    self:setRotation(0)
end
--变速曲线
function CrossWorldBossPlayerAvatarNode:_flyCurveFunc(t)
    return 1 - (t * 0.5 - 0.5) * (t * 0.5 + 3 * t * 0.5 - 2)
end

function CrossWorldBossPlayerAvatarNode:_getBezierPos(t)
    local k1 = (1 - t) * (1 - t)
    local k2 = 2 * t * (1 - t)
    local k3 = t * t

    local x = k1 * self._bezierPos1.x + k2 * self._bezierPos2.x + k3 * self._bezierPos3.x
    local y = k1 * self._bezierPos1.y + k2 * self._bezierPos2.y + k3 * self._bezierPos3.y
    return cc.p(x, y)
end

function CrossWorldBossPlayerAvatarNode:_flyUpdate(t)
    if self._startPlayFly then
        self._curBezierTime = self._curBezierTime + t
        local percent = self._curBezierTime / self._bezierTime
        if percent >= 1 then
            percent = 1
        end
        local t = self:_flyCurveFunc(percent)
        local pos = self:_getBezierPos(t)
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
            if self._flyActionMoveEndCallBack then
                self:_flyActionMoveEndCallBack()
            end
            
            if self._bezierFlyTimer then
                scheduler.unscheduleGlobal(self._bezierFlyTimer)
                self._bezierFlyTimer = nil 
            end
        end
    end
end

function CrossWorldBossPlayerAvatarNode:setIdleAction(  )
    self._commonHeroAvatar:setAction("idle", true)
end

function CrossWorldBossPlayerAvatarNode:_reborn()
    local pos = self._pozhenPos or self._idlePos
    self:setPos(pos)

    self:setOpacity(255)

    self._inAttacking = false

    self:_endMoveTimer()

    self:setIdleAction()

    self._inMoving = false
end

function CrossWorldBossPlayerAvatarNode:_changeScaleAndZorderByPos(_, newPos)
    local newPosX, newPosY, oldPosX, oldPosY

    oldPosX, oldPosY = self:getPosition()

    if newPos then
        newPosX = newPos.x
        newPosY = newPos.y
    else
        newPosX, newPosY = self:getPosition()
    end

    local scale = 1 - 0.36 * math.min(1, (newPosY / 400))
    self:setScale(scale)
    self:setLocalZOrder(10000 - newPosY)
end

function CrossWorldBossPlayerAvatarNode:turnBack(needBack)
    self._commonHeroAvatar:turnBack(needBack)
end

function CrossWorldBossPlayerAvatarNode:setIdlePos( pos )
    self._idlePos = pos
end

function CrossWorldBossPlayerAvatarNode:setPozhenPos( pos )
    self._pozhenPos = pos
end

function CrossWorldBossPlayerAvatarNode:getPozhenPos(  )
    return self._pozhenPos
end

function CrossWorldBossPlayerAvatarNode:setPos(pos)
    self:_changeScaleAndZorderByPos(nil, pos)
    self:turnBack(pos.x > 568)
    self:setPosition(pos.x, pos.y)
end

function CrossWorldBossPlayerAvatarNode:updateBaseId(baseId)
    self._baseId = baseId
    self._commonHeroAvatar:updateUI(baseId)
end

function CrossWorldBossPlayerAvatarNode:showTitle( id )
    self._commonHeroAvatar:showTitle(id, self.__cname)
end

function CrossWorldBossPlayerAvatarNode:setPlayerName(name, officialLevel)
    self._textUserName:setString(name)
    self._textOfficialName:setVisible(true)

    if officialLevel then
        local officialInfo = G_UserData:getBase():getOfficialInfo(officialLevel)
        if officialInfo == nil then
            return
        end
        self:updateLabel("_textUserName",
        {
            color = Colors.getOfficialColor(officialLevel),
            outlineColor = Colors.getOfficialColorOutline(officialLevel)
        })
       
        self:updateLabel("_textOfficialName",
        {
            text = "["..officialInfo.name.."]",
            color = Colors.getOfficialColor(officialLevel),
            outlineColor = Colors.getOfficialColorOutline(officialLevel)
        })
    else
        self._textOfficialName:setVisible(false)
    end
end

return CrossWorldBossPlayerAvatarNode
