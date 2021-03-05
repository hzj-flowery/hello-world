--世界boss
local ViewBase = require("app.ui.ViewBase")
local CrossWorldBossAvatarNode = class("CrossWorldBossAvatarNode", ViewBase)
local CrossWorldBossConst = require("app.const.CrossWorldBossConst")
local CrossBossParameter = require("app.config.cross_boss_parameter")
local scheduler = require("cocos.framework.scheduler")

local CrossWorldBossHelper = import(".CrossWorldBossHelper")

local AudioConst = require("app.const.AudioConst")

function CrossWorldBossAvatarNode:ctor()
    self._baseId = 0
    self._curState = nil
    self._stateRestTime = 0
    self._isFadeOuting = false
    self._attackedTimes = 0
    
    local resource = {
        file = Path.getCSB("CrossWorldBossAvatarNode", "crossworldboss"),
        binding = {
			_bossClickPanel = {
				events = {{event = "touch", method = "_onBossClick"}}
			},
		}
    }

    CrossWorldBossAvatarNode.super.ctor(self, resource)
end


function CrossWorldBossAvatarNode:onCreate()
    self._spineBoss = require("yoka.node.HeroSpineNode").new()
    self._spineBoss:setScale(0.8)
    self._bossSpineNode:addChild(self._spineBoss)
    
    self:_showProgressEffect()

    self._totalStamina = CrossWorldBossHelper.getParameterValue("stamina_default") * G_UserData:getBase():getOpenServerDayNum()
end

function CrossWorldBossAvatarNode:onEnter()
   
end

function CrossWorldBossAvatarNode:onExit()
    self:_endStateCountdown()

    if self._idleLoopSoundId then
        G_AudioManager:stopSound(self._idleLoopSoundId)
        self._idleLoopSoundId = nil
    end
end

function CrossWorldBossAvatarNode:updateUI()

end

function CrossWorldBossAvatarNode:_onBossClick(  )
    local isOpen = G_UserData:getCrossWorldBoss():isBossStart()
	if isOpen == false then
		G_Prompt:showTip(Lang.get("worldboss_no_open"))
		return
	end

	if CrossWorldBossHelper.checkBossFight() == false then
		return
	end

	G_UserData:getCrossWorldBoss():c2sAttackCrossWorldBoss()
end

function CrossWorldBossAvatarNode:changeZorderByPos()
    local posX, posY

    posX, posY = self:getPosition()

    self:setLocalZOrder(10000 - posY)
end

function CrossWorldBossAvatarNode:updateBaseId(spineName)
    --self._baseId = baseId
    local resJson = Path.getSpine(spineName)
    self._spineBoss:setAsset(resJson)
	self._spineBoss.signalLoad:add(
        function()
            self:changeBossState(self._curState)
		end
	)
end

function CrossWorldBossAvatarNode:playAnimation(name, isLoop)
    self._spineBoss:setAnimation(name, isLoop)
	-- self._spineBoss.signalComplet:addOnce(
	-- 	function(...)
    --         --self._spineBoss:setAnimation("idle", true)
	-- 	end
	-- )
end

function CrossWorldBossAvatarNode:playAnimationOnce(name)
    self._spineBoss:setAnimation(name, false)
	self._spineBoss.signalComplet:addOnce(
		function(...)
            self._spineBoss:setAnimation("idle", true)
		end
	)
end

function CrossWorldBossAvatarNode:updateBossStamina()

end

function CrossWorldBossAvatarNode:changeBossState( newState )
    self._nodeWeekCount:setVisible(false)

    if self._curState == newState then
        return 
    end

    local oldState = self._curState
    self._curState = newState

    if self._idleLoopSoundId then
        G_AudioManager:stopSound(self._idleLoopSoundId)
        self._idleLoopSoundId = nil
    end

    self:_endStateCountdown()

    self._bossDizzSpineNode:removeAllChildren()

    if self._curState == CrossWorldBossConst.BOSS_NORMAL_STATE then
        -- 
        self._shieldEffectNode:removeAllChildren()
        self._shieldIdleEffectNode:removeAllChildren()
        self._shieldIdleEffectNode1:removeAllChildren()	

        -- 破招失败
        if oldState == CrossWorldBossConst.BOSS_CHARGE_STATE then
            self:playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_BOOM_EFFECT)

            local bossInfo = CrossWorldBossHelper.getBossInfo()
            if bossInfo then
                local voicePath = Path.getSkillVoice(bossInfo.voice2)
                G_AudioManager:playSound(voicePath)
            end
        end

        self:playAnimation("idle", true)
    elseif self._curState == CrossWorldBossConst.BOSS_CHARGE_STATE then
        -- 蓄力状态结束倒计时
        self:_startStateCountdown()

        --self:playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_IDLE_EFFECT)
        self:playBossShieldIdleEffect()   -- 护盾的idle动画用单独的节点

        self:playAnimation("xuli", true)

        if oldState == CrossWorldBossConst.BOSS_NORMAL_STATE then
            local bossInfo = CrossWorldBossHelper.getBossInfo()
            if bossInfo then
                local voicePath = Path.getSkillVoice(bossInfo.voice1)
                G_AudioManager:playSound(voicePath)
            end
        end
    elseif self._curState == CrossWorldBossConst.BOSS_WEAK_STATE then
        self._shieldIdleEffectNode:removeAllChildren()
        self._shieldIdleEffectNode1:removeAllChildren()	

        if oldState == CrossWorldBossConst.BOSS_CHARGE_STATE then
            self:playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_BREAK_EFFECT)
        end
        self._nodeWeekCount:setVisible(true)
        self:playAnimation("dizzy", true)
        self:showBossDizzEffect()
    end
end

function CrossWorldBossAvatarNode:setWeekCountdownLabel(t)
    self._weekLeftTime:setString(Lang.get("country_boss_meeting_countdown", {num = t}))
end

function CrossWorldBossAvatarNode:bossAttackedCallback( isPozhao, attackPosX )
    if self._curState == CrossWorldBossConst.BOSS_NORMAL_STATE then
        self._attackedTimes = self._attackedTimes + 1
        if self._attackedTimes >= 2 then   -- 每受击2次播放一次受击动画
            self:playAnimationOnce("hit")
            self._attackedTimes = 0
        end
    end

    if self._curState ~= CrossWorldBossConst.BOSS_CHARGE_STATE then
        return
    end

    if isPozhao then
        self:playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_POZHAO_ATTACK_EFFECT, attackPosX)
    elseif attackPosX > 568 then
        self:playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_RIGHT_ATTACK_EFFECT)
    else
        self:playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_LEFT_ATTACK_EFFECT)
    end
end

function CrossWorldBossAvatarNode:doFadeOutAction(  )
    self._isFadeOuting = true
    self._spineBoss:setAnimation("idle", true)
	-- self._spineBoss.signalComplet:addOnce(
    --     function(...)
    --         --self._isFadeOuting = false
    --         local fadeOutAction = cc.FadeOut:create(3)
    --         local resetAction = cc.CallFunc:create(handler(self, self._resetFlag))
    --         local hideAction = cc.CallFunc:create(handler(self, self.hideBoss))
    --         local action = cc.Sequence:create(fadeOutAction, resetAction, hideAction)
    --         self._bossSpineNode:runAction(action)
	-- 	end
	-- )
end

function CrossWorldBossAvatarNode:_resetFlag( )
    --self._isFadeOuting = false
end

function CrossWorldBossAvatarNode:hideBoss(  )
    if self._isFadeOuting then
        return
    end

    self:setVisible(false)
end

function CrossWorldBossAvatarNode:_startStateCountdown(  )
    local stateStartTime = G_UserData:getCrossWorldBoss():getState_startTime()
    local stateContinueTime = CrossWorldBossHelper.getParameterValue("charge_last_time")
    local curTime = G_ServerTime:getTime()



    self._stateRestTime = stateStartTime + stateContinueTime - curTime

    self._stateRestTime = math.min(self._stateRestTime, stateContinueTime)

    -- print("curTime "..curTime)
    -- print("stateContinueTime "..stateContinueTime)
    -- print("stateStartTime "..stateStartTime)
    -- print("self._stateRestTime "..self._stateRestTime)

    self:_endStateCountdown()

    self._nodeProgress:setVisible(true)

    if curTime < stateStartTime + stateContinueTime then
        self._countdownTimer = scheduler.scheduleGlobal(handler(self, self._updateCountdown), 1)
        self._leftTime:setString(Lang.get("country_boss_meeting_countdown", {num = self._stateRestTime}))
    else
        print("self._nodeProgress:setVisible(false)")
        self._nodeProgress:setVisible(false)
    end
end

function CrossWorldBossAvatarNode:_updateCountdown(  )
    --print("self._stateRestTime "..self._stateRestTime)
    self._stateRestTime = self._stateRestTime - 1

    if self._stateRestTime <= 0 then
        self:_endStateCountdown()
    else
        self._leftTime:setString(Lang.get("country_boss_meeting_countdown", {num = self._stateRestTime}))
    end
end

function CrossWorldBossAvatarNode:_endStateCountdown(  )
    if self._countdownTimer then
        scheduler.unscheduleGlobal(self._countdownTimer)
        self._countdownTimer = nil
    end

    self._nodeProgress:setVisible(false)
end

function CrossWorldBossAvatarNode:setBossCampIcon()
    local bossInfo = CrossWorldBossHelper.getBossInfo()
    if bossInfo then
        local path = Path.getTextSignet("img_cross_boss_camp0"..bossInfo.camp_1)
        self._imageZhenyin:loadTexture(path)
    end
end

function CrossWorldBossAvatarNode:setBossStamina()
    local bossStamina = G_UserData:getCrossWorldBoss():getStamina()
    local totalStamina = G_UserData:getCrossWorldBoss():getTotal_stamina()

    local percent = bossStamina / totalStamina
    percent = math.min(1, math.max(percent, 0))

    self._labelProgress:setString(math.ceil(percent * 100) .. "%")

    self._effectNode:setPositionY(-45 + 85 * percent)
end

function CrossWorldBossAvatarNode:showBossDizzEffect()
    local spineRipple = require("yoka.node.SpineNode").new()
    self._bossDizzSpineNode:removeAllChildren()
    self._bossDizzSpineNode:addChild(spineRipple)
    spineRipple:setAsset(Path.getFightEffectSpine("sp_03yunxuan"))
    spineRipple:setAnimation("effect", true)
end

function CrossWorldBossAvatarNode:_showProgressEffect(  )
	local stencil = cc.Node:create()
	local image = display.newSprite((Path.getCrossBossImage(tostring("img_cross_boss_zhezhao01"))))
	stencil:addChild(image)

	local clippingNode = cc.ClippingNode:create()
	clippingNode:setStencil(stencil)  

	local contentSize = G_ResolutionManager:getDesignCCSize()
	self._effectNode = cc.Node:create()

    local spineRipple = require("yoka.node.SpineNode").new()
    self._effectNode:addChild(spineRipple)
    spineRipple:setAsset(Path.getEffectSpine("tujieshui"))
    spineRipple:setAnimation("purple", true)
	
	clippingNode:setInverted(false)
	clippingNode:setAlphaThreshold(0.5)
	clippingNode:setName("clippingNode")
	clippingNode:addChild(self._effectNode)

	self._effectNode:setPositionY(-45)

	self._nodeEffect:addChild(clippingNode)
end

function CrossWorldBossAvatarNode:playBossShieldEffect( effectType, attackPosX )
    local movingName = ""

    if effectType == CrossWorldBossConst.BOSS_SHIELD_IDLE_EFFECT then
        movingName = "moving_BOSSdun_cj"

    elseif effectType == CrossWorldBossConst.BOSS_SHIELD_POZHAO_ATTACK_EFFECT then
        movingName = "moving_BOSSdun_baodian"

    elseif effectType == CrossWorldBossConst.BOSS_SHIELD_LEFT_ATTACK_EFFECT then
        movingName = "moving_BOSSdun_fantan_1"

        G_AudioManager:playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_FANTAN_SOUND)

    elseif effectType == CrossWorldBossConst.BOSS_SHIELD_RIGHT_ATTACK_EFFECT then
        movingName = "moving_BOSSdun_fantan_2"

        G_AudioManager:playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_FANTAN_SOUND)

    elseif effectType == CrossWorldBossConst.BOSS_SHIELD_BOOM_EFFECT then
        movingName = "moving_BOSSdun_skill"

        G_AudioManager:playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_BOOM_SOUND)

    elseif effectType == CrossWorldBossConst.BOSS_SHIELD_BREAK_EFFECT then
        movingName = "moving_BOSSdun_hit"

        G_AudioManager:playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_BREAK_SOUND)
    end

    local function eventFunction(event, frameIndex, movingNode)
        if event == "finish" then
        end
    end

    if effectType == CrossWorldBossConst.BOSS_SHIELD_BREAK_EFFECT then
        self._shieldIdleEffectNode:removeAllChildren()
        self._shieldIdleEffectNode1:removeAllChildren()
    end

    if effectType == CrossWorldBossConst.BOSS_SHIELD_POZHAO_ATTACK_EFFECT then
        self:_playPozhaoAttackedEffect(attackPosX)
    else
        self._shieldEffectNode:removeAllChildren()	
        G_EffectGfxMgr:createPlayMovingGfx(self._shieldEffectNode, movingName, nil, eventFunction, true)
    end
end

function CrossWorldBossAvatarNode:playBossShieldIdleEffect()
    self._shieldIdleEffectNode:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._shieldIdleEffectNode, "moving_BOSSdun_cj", nil, nil, true)

    self._shieldIdleEffectNode1:removeAllChildren()	
    G_EffectGfxMgr:createPlayMovingGfx(self._shieldIdleEffectNode1, "moving_BOSSdun_cj_di", nil, nil, true)

    self._idleLoopSoundId = G_AudioManager:playSoundWithIdExt(AudioConst.SOUND_CROSS_SHIELD_IDLE_SOUND, nil, true)
end

function CrossWorldBossAvatarNode:_playPozhaoAttackedEffect( attackPosX )
    local shuffle = function(list)
        local length = #list
		for k,v in ipairs(list) do
			local newK = math.random(1, length)
			local oldValue = list[k]
			list[k] = list[newK]
            list[newK] = oldValue
            
            length = length - 1
		end 
    end
    
    local indexArray = {1, 2, 3, 4, 5, 6}

    shuffle(indexArray)

    dump(indexArray)

    local num = math.random(1, 6)
    local actionArrays = {}

    local movingName = "_shieldLeftPoint"
    if attackPosX > 568 then
        movingName = "_shieldRightPoint"
    end

    for i = 1, num do
        local index = indexArray[i]

        local effectAction = cc.CallFunc:create(handler(self, function () 
            G_AudioManager:playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_ATTACKED_SOUND)
            self[movingName..index]:removeAllChildren()	
            G_EffectGfxMgr:createPlayMovingGfx(self[movingName..index], "moving_BOSSdun_baodian", nil, nil, true)
        end))

        local delayAction = cc.DelayTime:create(0.5)

        table.insert( actionArrays, effectAction )
        table.insert( actionArrays, delayAction )
    end

    local action = cc.Sequence:create(actionArrays)
    self:runAction(action)
end

return CrossWorldBossAvatarNode
