-- Author: nieming
-- Date:2018-05-12 15:35:39
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildServerAnswerAvatar = class("GuildServerAnswerAvatar", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
local GuildAnswerConst = require("app.const.GuildAnswerConst")
local TreeBuffConst = require("app.config.tree_buff")

local SPEED = 600
local FLY_SPEED = 800
local FLY_HEIGHT = 500
local TYPE_MOVE = 1
local TYPE_SET = 2

function GuildServerAnswerAvatar:ctor()
    self._commonHeroAvatar = nil
    self._heroName = nil
    self._user_id = 0
    self._side = 0
    self._queuePos = {}
    self._canMove = true
    self._recoveryFlag = 0
    self._wudiTimes = 0
    self._isInWudiBuff = false
    local resource = {
        file = Path.getCSB("GuildServerAnswerAvatar", "guildServerAnswer")
    }
    GuildServerAnswerAvatar.super.ctor(self, resource)
end

-- Describle：
function GuildServerAnswerAvatar:onCreate()
    self._imageFace:setVisible(false)
end

function GuildServerAnswerAvatar:updateAvatar(data, point, state)
    if not data then
        return
    end
    if self:isVisible() then
        if state == GuildAnswerConst.ANSWER_STATE_PLAYING or state == GuildAnswerConst.ANSWER_STATE_RESTING then
            self:moveTo(cc.p(point.x, point.y))
        else
            self:setPosTo(cc.p(point.x, point.y))
        end
        self:_updateBaseData(data)
    else
        self:setVisible(true)
        self:_updateBaseData(data)
        self:_reborn(data, state, point)
    end
    self:setLocalZOrder(500 - point.y)
    self:_updateState(state, point)
    self._isFirst = false


    self._wudiTimes = data:getSecurity_times()
    self:_showBuffEffect(self._wudiTimes > 0)
end

function GuildServerAnswerAvatar:getWudiTimes(  )
    return self._wudiTimes
end

function GuildServerAnswerAvatar:subWudiTimes()
    self._wudiTimes = self._wudiTimes - 1

    local list = G_UserData:getGuildServerAnswer():getGuildServerAnswerPlayerDatas()
    for k, v in pairs(list) do
        if v:getUser_id() == self._user_id then
            v:setSecurity_times(self._wudiTimes)
            break
        end
    end

    self:_showBuffEffect(self._wudiTimes > 0)
end

function GuildServerAnswerAvatar:_showBuffEffect(isShow)
    if isShow == false then
        if self._buffEffect then
            self._buffEffect:setVisible(false)
        end
        return
    end

    if self._buffEffect == nil then
        local buffEffectName = TreeBuffConst.get(4).avatar_effect
        local spine = require("yoka.node.SpineNode").new(0.5)
        self._buffEffect = require("app.fight.views.Animation").new(spine)
        self._buffEffectNode:addChild(self._buffEffect)
        self._buffEffect:setAsset(Path.getFightEffectSpine(buffEffectName))
        self._buffEffect:setAnimation("effect")
        self._buffEffect:setScale(1.5)

        --self._buffEffectNode:setPositionY(self._commonHeroAvatar:getHeight() / 2)
    end

    self._buffEffect:setVisible(isShow)
end

function GuildServerAnswerAvatar:_reborn(data, state, point)
    self:_updateUI(data)
    if state == GuildAnswerConst.ANSWER_STATE_PLAYING and not self._isFirst then
        self:_readyEnterScene(point, 0.5)
    else
        self:setPosTo(cc.p(point.x, point.y))
    end
end

function GuildServerAnswerAvatar:_updateBaseData(data)
    self._user_id = data:getUser_id()
    self._side = data:getSide()
end

function GuildServerAnswerAvatar:getSide()
    return self._side
end

function GuildServerAnswerAvatar:_updateState(state, point)
    if self._state == state then
        return
    end
    self._state = state
    if state == GuildAnswerConst.ANSWER_STATE_READY then
        self:_readyEnterScene(point)
    else
        self:_setAction()
    end
end

function GuildServerAnswerAvatar:_setAction()
    if not self._canMove then
        return
    end
    if self._state == GuildAnswerConst.ANSWER_STATE_PLAYING or self._state == GuildAnswerConst.ANSWER_STATE_RESTING then
        self:didEnterAction("run")
    else
        self:didEnterAction("idle")
    end
end

function GuildServerAnswerAvatar:_readyEnterScene(point, appFate)
    local appFateEx = appFate or 0
    self:setPosTo(cc.p(point.x - 1000, point.y))
    self:moveTo(cc.p(point.x, point.y), self:getRandomFate() + appFateEx)
end

-- 获取随机缩放
function GuildServerAnswerAvatar:getRandomFate()
    local fate = math.random(30, 70)
    return fate / 100
end

function GuildServerAnswerAvatar:_updateUI(data)
    local serverData = {
        ["base_id"] = data:getBase_id(),
        ["avatar_base_id"] = data:getAvatar_base_id()
    }
    local _, avatarData = UserDataHelper.convertAvatarId(serverData)
    self._commonHeroAvatar:updateAvatar(
        avatarData,
        nil,
        nil,
        function()
            self:_setAction()
        end
    )

    self:_updateName(data)
end

function GuildServerAnswerAvatar:_updateName(data)
    local color, colorOutline = GuildServerAnswerHelper.getNameColor(data)
    self._guildName:setString(data:getGuild_name())
    self._heroName:setString(data:getName())
    self._guildName:setColor(color)
    self._heroName:setColor(color)
    self._guildName:enableOutline(colorOutline, 1)
    self._heroName:enableOutline(colorOutline, 1)
end

function GuildServerAnswerAvatar:setPosTo(pos)
    local info = self._queuePos[#self._queuePos]
    if info and info.type == TYPE_SET then
        info.pos = pos
    else
        local moveInfo = {}
        moveInfo.pos = pos
        moveInfo.type = TYPE_SET
        table.insert(self._queuePos, moveInfo)
    end
end

function GuildServerAnswerAvatar:moveTo(pos, fate)
    local moveInfo = {}
    moveInfo.pos = pos
    moveInfo.fate = fate or 1
    moveInfo.type = TYPE_MOVE
    table.insert(self._queuePos, moveInfo)
end

function GuildServerAnswerAvatar:_moveToEx(moveInfo)
    if not self._canMove then
        return
    end
    local pos = moveInfo.pos
    local fate = moveInfo.fate
    local curPos = cc.p(self:getPositionX(), self:getPositionY())
    self._canMove = false
    self:didEnterAction("run")
    local distance = self:_distance(curPos, pos)
    local time = distance / (SPEED * fate)
    local move = cc.MoveTo:create(time, pos)
    local sequece =
        cc.Sequence:create(
        move,
        cc.CallFunc:create(
            function()
                self._canMove = true
                self:_setAction()
            end
        )
    )
    self:runAction(sequece)
end

function GuildServerAnswerAvatar:_distance(pos1, pos2)
    local value1 = (pos1.x - pos2.x) * (pos1.x - pos2.x)
    local value2 = (pos1.y - pos2.y) * (pos1.y - pos2.y)
    return math.sqrt(value1 + value2)
end

function GuildServerAnswerAvatar:didEnterAction(actionName, shadow)
    if self._actionName == actionName then
        return
    end
    local isShadow = true
    if type(shadow) == "boolean" then
        isShadow = shadow
    end
    self._actionName = actionName
    self._commonHeroAvatar:setAction(actionName, true)
    self._commonHeroAvatar:showShadow(isShadow)
end

-- Describle：
function GuildServerAnswerAvatar:onEnter()
    self._isFirst = true
    self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)
end

-- Describle：
function GuildServerAnswerAvatar:onExit()
    self:unscheduleUpdate()
end

function GuildServerAnswerAvatar:getId()
    return self._user_id
end

function GuildServerAnswerAvatar:died(callback)
    if self._wudiTimes > 0 then
        return
    end

    self:didEnterAction("hitfly", false)
    self:_startFlyAction(callback)
end

-- 初始化 飞 参数
function GuildServerAnswerAvatar:_startFlyAction(callback)
    if self._startPlayFly then
        return
    end
    local p1x, p1y = self:getPosition()
    local distance = math.random(680, 750)
    local p1 = cc.p(p1x, p1y)
    local p2 = cc.p(0, 0)
    local p3 = cc.p(0, p1.y)
    p3.x = p1.x - distance
    p2.x = p1.x - distance / 2.5
    p2.y = p1.y + FLY_HEIGHT
    self._targetRotate = -30

    self._bezierPos1 = p1
    self._bezierPos2 = p2
    self._bezierPos3 = p3
    self._bezierTime = distance / FLY_SPEED
    self._curBezierTime = 0
    self._startPlayFly = true
    self._flyActionMoveEndCallBack = callback

    self:setRotation(0)
end
--变速曲线
function GuildServerAnswerAvatar:_flyCurveFunc(t)
    return 1 - (t * 0.5 - 0.5) * (t * 0.5 + 3 * t * 0.5 - 2)
end

function GuildServerAnswerAvatar:_getBezierPos(t)
    local k1 = (1 - t) * (1 - t)
    local k2 = 2 * t * (1 - t)
    local k3 = t * t

    local x = k1 * self._bezierPos1.x + k2 * self._bezierPos2.x + k3 * self._bezierPos3.x
    local y = k1 * self._bezierPos1.y + k2 * self._bezierPos2.y + k3 * self._bezierPos3.y
    return cc.p(x, y)
end

function GuildServerAnswerAvatar:_flyUpdate(t)
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
                self._flyActionMoveEndCallBack(self)
            end
            self:hide()
        end
    end
end

function GuildServerAnswerAvatar:hide()
    self:setVisible(false)
    self:stopAllActions()
    self._user_id = 0
    self._side = 0
    self._queuePos = {}
    self._canMove = true
    self._recoveryFlag = 0
    self._state = nil
end

function GuildServerAnswerAvatar:_update(dt)
    -- if not self._startPlayFly then
    --     self:_setAction()
    -- end
    self:_moveUpdate(dt)
    self:_flyUpdate(dt)
end

function GuildServerAnswerAvatar:_moveUpdate(dt)
    if self._canMove and #self._queuePos > 0 then
        local info = self._queuePos[1]
        if info.type == TYPE_MOVE then
            self:_moveToEx(info)
        else
            self:setPosition(info.pos)
        end
        table.remove(self._queuePos, 1)
    end
end

function GuildServerAnswerAvatar:setRecoveryFlag(flag)
    self._recoveryFlag = flag
end

function GuildServerAnswerAvatar:getRecoveryFlag()
    return self._recoveryFlag
end

function GuildServerAnswerAvatar:playFace(right_answer)
    local radio = math.random()
    if radio < GuildAnswerConst.FACE_RADIO then
        self:_setFace(right_answer)
    end
end

function GuildServerAnswerAvatar:_setFace(right_answer)
    local face = 0
    if self._side == right_answer then
        local index = math.random(1, #GuildAnswerConst.TRUE_FACE)
        face = GuildAnswerConst.TRUE_FACE[index]
    else
        local index = math.random(1, #GuildAnswerConst.FALSE_FACE)
        face = GuildAnswerConst.FALSE_FACE[index]
    end
    self._imageFace:loadTexture(Path.getChatFaceRes(face))
    self._imageFace:setVisible(true)
    local sequece =
        cc.Sequence:create(
        cc.DelayTime:create(GuildAnswerConst.FACE_TIME),
        cc.CallFunc:create(
            function()
                self._imageFace:setVisible(false)
            end
        )
    )
    self._imageFace:runAction(sequece)
end

return GuildServerAnswerAvatar
