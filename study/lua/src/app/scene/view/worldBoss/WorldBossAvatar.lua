--竞技场
--英雄avatar 展示
local ViewBase = require("app.ui.ViewBase")
local WorldBossAvatar = class("WorldBossAvatar", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local ArenaHelper    = require("app.scene.view.arena.ArenaHelper")
local TextHelper = require("app.utils.TextHelper")
local WorldBossHelper = import(".WorldBossHelper")
local BullectScreenConst = require("app.const.BullectScreenConst")
local MOVE_TO_BOSS_OFFSET = 120
local MOVE_TIME = 0.5

function WorldBossAvatar:ctor()
    
    self._commonHeroAvatar = nil
    self._textUserName     = nil
    self._playingMoving = false
    self._baseId = 0
    local resource = {
        file = Path.getCSB("WorldBossAvatar", "worldBoss"),
    }
    WorldBossAvatar.super.ctor(self, resource)
end

function WorldBossAvatar:updatePlayerInfo(avatarData)

    self:updateAvatar(avatarData)
    
    self:setPlayerName(avatarData.name, avatarData.officialLevel)
    self:setUserId(avatarData.userId)
    self:setScale(0.8)
    self._commonHeroAvatar:showTitle(avatarData.titleId,self.__cname)-- 显示称号
end

function WorldBossAvatar:onCreate()
     self._commonHeroAvatar:setTouchEnabled(false)
end

function WorldBossAvatar:turnBack()
    self._commonHeroAvatar:turnBack()
end

function WorldBossAvatar:updateBaseId(baseId)
 
    self._baseId = baseId
    self._commonHeroAvatar:updateUI(baseId)
    
end


function WorldBossAvatar:updateAvatar(avatarData)
 
    self._baseId = avatarData.baseId
    self._commonHeroAvatar:updateAvatar(avatarData.playerInfo)
    
end

function WorldBossAvatar:setBossName(name)
    local params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO,self._baseId)
    self._textBossName:setString(name)
    self._textOfficialName:setVisible(false)
    self._textUserName:setVisible(false)
    if params then
        self:updateLabel("_textBossName",
        {
            color = params.icon_color,
            outlineColor = params.icon_color_outline
        })
    end
end

function WorldBossAvatar:setAction(ani,loop)
    self._commonHeroAvatar:setAction(ani,loop)
end

function WorldBossAvatar:setPlayerName(name,officialLevel)
    self._textUserName:setString(name)
    self._textOfficialName:setVisible(true)
    self._textBossName:setVisible(false)
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

function WorldBossAvatar:setCallBack(callBack)
    self._commonHeroAvatar:setTouchEnabled(true)
    self._commonHeroAvatar:setCallBack(callBack)

end

function WorldBossAvatar:isPlaying( ... )
    -- body
    return self._playingMoving
end

function WorldBossAvatar:_playShowEffect( ... )
   --播放特效
    local function eventFunction(event )
        -- body
        if event == "finish" then
            if onFinishCall then
                onFinishCall()
            end
            self._topNodeInfo:setVisible(true)
        end
    end
    self:setVisible(true)
    self._topNodeInfo:setVisible(false)
    self:resetAvatar()

    local  gfxEffect = G_EffectGfxMgr:createPlayGfx(self,"effect_juntuan_chuxian",eventFunction)
    G_EffectGfxMgr:applySingleGfx(self,"smoving_juntuan_chuxian")
end

function WorldBossAvatar:resetAvatar( ... )
    -- body
    self._commonHeroAvatar:setOpacity(255)
    self._commonHeroAvatar:setPosition(0,0)
    self._commonHeroAvatar:setScaleX(1.0)
    self._commonHeroAvatar:setScaleY(1.0)
end

function WorldBossAvatar:playHitAction( ... )
    -- body
    if self._playingMoving == true then
        return
    end
    local seq = cc.Sequence:create(
        cc.DelayTime:create(0.2), 
        cc.CallFunc:create(function()  
           self._playingMoving = true
           self._commonHeroAvatar:setAction("hit",false)
        end),
        cc.DelayTime:create(BullectScreenConst.AVATAR_BOSS_HIT), 
        cc.CallFunc:create(function()  
           self._commonHeroAvatar:setAction("idle",true)
        end),
        cc.DelayTime:create(BullectScreenConst.AVATAR_BOSS_HIT_FINISH), 
        cc.CallFunc:create(function()  
           self._playingMoving = false
        end)
    )
    self:runAction(seq)
end
function WorldBossAvatar:_playDispearEffect(onFinishCall)
    --播放特效
    local function eventFunction(event )
        -- body
        if event == "finish" then
            if onFinishCall then
                onFinishCall()
            end
            self:resetAvatar()
        end
    end
    self:resetAvatar()
    self._topNodeInfo:setVisible(false)
    local  gfxEffect = G_EffectGfxMgr:createPlayGfx(self._nodeEffect,"effect_juntuan_xiaoshi",eventFunction)
    G_EffectGfxMgr:applySingleGfx(self._commonHeroAvatar,"smoving_juntuan_xiaoshi")
end

--随即取得最终点
function WorldBossAvatar:_getBossTargetPos( ... )
    -- body
    local worldBossPos = WorldBossHelper.getBossPosition()
    local offset = cc.p(
    MOVE_TO_BOSS_OFFSET + math.random(BullectScreenConst.MOVE_TO_BOSS_OFFSETX.x, BullectScreenConst.MOVE_TO_BOSS_OFFSETX .y),
    math.random(BullectScreenConst.MOVE_TO_BOSS_OFFSETY.x, BullectScreenConst.MOVE_TO_BOSS_OFFSETY.y))

    local targetPos  = cc.p(worldBossPos.x - offset.x, offset.y + worldBossPos.y)

    return targetPos
end
--突然出现，冲过去攻击，并消失
function WorldBossAvatar:playImmAttack()
    if  self._playingMoving  == true then
        return false
    end

    self._playingMoving = true
    local x, y = self:getPosition()
    
    --self:setVisible(false)

	self:setAction("idle",true)
	local worldBossPos = WorldBossHelper.getBossPosition()
    local targetPos  = self:_getBossTargetPos()

	local seq = cc.Sequence:create(
        cc.CallFunc:create(function()  
            self:_playShowEffect()
        end),
        cc.DelayTime:create(BullectScreenConst.AVATAR_IM_DELAY), 
        cc.CallFunc:create(function() 
           	self:setAction("run",true)
        end),
        cc.MoveTo:create(BullectScreenConst.AVATAR_IM_MOVE_TIME, targetPos),
        cc.CallFunc:create(function() 
            if self:isAnimExit(BullectScreenConst.ATTACK_NAME) then 
                 self:setAction(BullectScreenConst.ATTACK_NAME,false)
            end
           	G_SignalManager:dispatch(SignalConst.EVENT_BULLET_BOSS_HIT)
        end),
        cc.DelayTime:create(BullectScreenConst.AVATAR_ATTACK_ACITON), 
        cc.CallFunc:create(function()
            self:setAction("idle",false)
            --播放特效
            self:_playDispearEffect(function ( ... )
                -- body
                 self:setVisible(false)
                 self:setPosition(x,y)
                 self._playingMoving = false
            end)
        end))
    
    self:runAction(seq)

    return true
end

function WorldBossAvatar:isAnimExit(name)
   return self._commonHeroAvatar:isAnimExit(name) 
end

--播放冲过去攻击，并回退动作
function WorldBossAvatar:playGoAttack( attackPos )
    -- body
    if  self._playingMoving  == true then
        return
    end

    self._playingMoving = true
    local x, y = self:getPosition()
    

	self:setAction("run",true)
	local worldBossPos = WorldBossHelper.getBossPosition()

    local targetPos  = self:_getBossTargetPos()

	local seq = cc.Sequence:create(
        cc.MoveTo:create(BullectScreenConst.AVATAR_GA_MOVE_TIME, targetPos),
        cc.CallFunc:create(function() 
            if self:isAnimExit(BullectScreenConst.ATTACK_NAME) then 
                self:setAction(BullectScreenConst.ATTACK_NAME,false) 
            else 
                self:setAction(BullectScreenConst.ATTACK_NAME_NO_ATTACK, true) 
            end
            G_SignalManager:dispatch(SignalConst.EVENT_BULLET_BOSS_HIT)
        end),
        cc.DelayTime:create(BullectScreenConst.AVATAR_ATTACK_ACITON), 
        cc.CallFunc:create(function()  
            self:_playDispearEffect()
        end),
    	cc.DelayTime:create(BullectScreenConst.AVATAR_IM_DELAY), 
        cc.CallFunc:create(function()
            self:setVisible(true)
            self:setPosition(cc.p(-568,y))
            self:setAction("run",true)
        end),
        cc.DelayTime:create(0.2), 
        cc.MoveTo:create(BullectScreenConst.AVATAR_GA_MOVE_BACK_TIME, cc.p(x,y)),
        cc.CallFunc:create(function()
            self:setAction("idle",true)
            self._playingMoving = false
            self._topNodeInfo:setVisible(true)
        end))
    self:runAction(seq)
end

function WorldBossAvatar:playMovingEffect(callBack)
	logWarn("WorldBossView:_playMovingEffect")
	
	self._playingMoving = true
	local x, y = self:getPosition()

	self:setAction("run",true)
	local worldBossPos = WorldBossHelper.getBossPosition()
    dump(worldBossPos)
	local action1 = cc.MoveTo:create(MOVE_TIME, cc.p(worldBossPos.x - MOVE_TO_BOSS_OFFSET,worldBossPos.y))
	local action2 = cc.CallFunc:create(function()  
		self._playingMoving = false
        if callBack then
            callBack()
        end
	end)

	local seq = cc.Sequence:create(action1, action2)
	self:runAction(seq)
end

--
function WorldBossAvatar:onEnter()
    self._playingMoving = false
end

function WorldBossAvatar:onExit()

end

function WorldBossAvatar:setUserId( userId )
    -- body
    self._userId =userId
end

function  WorldBossAvatar:getUserId( )
    -- body
    return self._userId
end

return WorldBossAvatar
