local ViewBase = require("app.ui.ViewBase")
local HorseRaceAvatar = class("HorseRaceAvatar", ViewBase)

local HorseRaceConst = require("app.const.HorseRaceConst")
local AvatarState = require("app.utils.states.AvatarState")
local AvatarStateMachine = require("app.utils.states.AvatarStateMachine")

local gravity = -2800
local jumpSpeed = 750

local speed = 700

local boxSize = cc.size(40, 200)

local gameOverTime = 0.5        --失败后延时出结算
local gameWinTime = 1           --胜利吼延时出结算

local AudioConst = require("app.const.AudioConst")

function HorseRaceAvatar:ctor(avatarId)
    self._position = cc.p(0, 0)

    self._stateMachine = nil
    self._stateStart = nil
    self._stateRun = nil
    self._stateJump = nil
    self._stateGameOver = nil

    self._startGame = false
    self._endGame = false
    self._win = false

    self._speedY = 0
    self._speedX = speed
    self._gForce = gravity
    self._nowFloorY = 0

    self._getPoint = 0

    self._timeDispatchX = 0
    self._waitTime = 0
    self._sendMsg = false

    self._distance = 0

    self._framePositionX = 0
    self._positionLastX = 0

    self._runSoundTime = 0

	local resource = {
        file = Path.getCSB("HorseRaceAvatar", "horseRace"),
	}
	HorseRaceAvatar.super.ctor(self, resource)
end

function HorseRaceAvatar:onCreate()
    self:_createStates()

    self._spineHero = require("yoka.node.HeroSpineNode").new()
    self._nodeSpine:addChild(self._spineHero)

    local resJson = Path.getSpine("8001")
    self._spineHero:setAsset(resJson)
    
    self._spineHero:setAnimation("run", true)
    self:resizeBox()

    self._stateMachine = AvatarStateMachine.new(self._stateStart, handler(self, self._stateChanged))


    G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_RUN)
    G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_JUMP)
    G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_DIE)
    G_AudioManager:preLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_WIN)
end

function HorseRaceAvatar:onEnter()
    self._listenerJump = G_SignalManager:add(SignalConst.EVENT_HORSE_JUMP, handler(self, self._onEventJump))
    self._listenerStart = G_SignalManager:add(SignalConst.EVENT_HORSE_RACE_START, handler(self, self._onEventStart))
    self._listenerStartAction = G_SignalManager:add(SignalConst.EVENT_HORSE_START_ACTION, handler(self, self._onEventStartAction))
end

function HorseRaceAvatar:onExit()
    self._listenerJump:remove()
    self._listenerJump = nil

    self._listenerStart:remove()
    self._listenerStart = nil

    self._listenerStartAction:remove()
    self._listenerStartAction = nil

    G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_RUN)
    G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_JUMP)
    G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_DIE)
    G_AudioManager:unLoadSoundWithId(AudioConst.SOUND_HORSE_RACE_WIN)

end

function HorseRaceAvatar:_createStates()
    self._stateStart = AvatarState.new("stateStart")
    self._stateStart:setDidEnter(handler(self, self._didEnterStart))

    self._stateRun = AvatarState.new("stateRun")
    self._stateRun:setDidEnter(handler(self, self._didEnterRun))

    self._stateJump = AvatarState.new("stateJump")
    self._stateJump:setDidEnter(handler(self, self._didEnterJump))
    -- self._stateJump:setUpdate(handler(self, self._jumpUpdate))

    self._stateJump2 = AvatarState.new("stateJump2")
    self._stateJump2:setDidEnter(handler(self, self._didEnterJump2))

    self._stateGameOver = AvatarState.new("stateGameOver")
    self._stateGameOver:setDidEnter(handler(self, self._didEnterGameOver))

    self._stateStartAction = AvatarState.new("stateStartAction")
    self._stateStartAction:setDidEnter(handler(self, self._didEnterStartAction))

    self._stateWin = AvatarState.new("stateWin")
    self._stateWin:setDidEnter(handler(self, self._didEnterWin))
end

function HorseRaceAvatar:setStartPos(position)
    self._position = position
    self._framePositionX = position.x
    self:setPosition(position)
end

function HorseRaceAvatar:_stateChanged(curState, nextState)
end

function HorseRaceAvatar:_didEnterStart()
    self._spineHero:setAnimation("idle", true)
end

function HorseRaceAvatar:_didEnterRun()
    -- G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_RUN)
    self._runSoundTime = 1
    self._spineHero:setAnimation("run", true)
end

--jump2
function HorseRaceAvatar:_didEnterJump()
    G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_JUMP)
    self._spineHero:setAnimation("jump", true)
    self._speedY = jumpSpeed
    self._position.y = self._position.y + 1
end

function HorseRaceAvatar:_didEnterJump2()
    G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_JUMP)
    self._spineHero:setAnimation("jump2", true)
    self._speedY = jumpSpeed 
end

function HorseRaceAvatar:_didEnterGameOver()
    self._spineHero:setAnimation("hit")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_DIE)
end

function HorseRaceAvatar:_didEnterStartAction()
    self._spineHero:setAnimation("start")
end

function HorseRaceAvatar:_didEnterWin()
    self._spineHero:setAnimation("win", true)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_WIN)
end

function HorseRaceAvatar:update(f, blocks)
    self._gForce = gravity*f
    self._stateMachine:update(f)
    if self._startGame and not self._endGame then 
        self:_moveAhead(f)
        local block = self:_getBlockAround(blocks)
        self:_updateBlockAround(block)
        self:_updatePosY(f)
        self:updateDispatch(f)
    end
    if self._endGame and not self._sendMsg then 
        local time = gameOverTime
        if self._win then 
            time = gameWinTime 
        end
        if self._waitTime >= time then 
            G_SignalManager:dispatch(SignalConst.EVENT_HORSE_GAME_OVER, self._distance, self._getPoint)
            self._sendMsg = true
        end
        self._waitTime = self._waitTime + f
    end

    if self._stateMachine:getCurState() == self._stateRun then 
        if self._runSoundTime + f > 0.5 then 
            G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_RUN)
            self._runSoundTime = 0
        end
        self._runSoundTime = self._runSoundTime + f
    end

    self:_updateFrame(f)
end

function HorseRaceAvatar:updateDispatch(f)
    self._timeDispatchX = self._timeDispatchX + f
    if self._timeDispatchX >= 0.5 then 
        G_SignalManager:dispatch(SignalConst.EVENT_HORSE_MOVE_X, self._distance)
    end
end


function HorseRaceAvatar:resizeBox()
    self._panelBox:setContentSize(boxSize)
end

function HorseRaceAvatar:updateForce(f)
    
end

--判断是否碰撞
function HorseRaceAvatar:_judgeBlock(block)
    local posX, posY = self._panelBox:getPosition()
    local box = {
        x = self._position.x - boxSize.width/2, 
        y = self._position.y, 
        width = boxSize.width, 
        height = boxSize.height
    }

    local blockBox = {
        x = block.mapPos.x, 
        y = block.mapPos.y, 
        width = block.width, 
        height = block.height
    }

    if box.x > blockBox.x + blockBox.width then 
        return false 
    elseif box.x + box.width < blockBox.x then 
        return false 
    elseif box.y > blockBox.y + blockBox.height then 
        return false 
    elseif box.y + box.height < blockBox.y then 
        return false
    end

    return true, block
end

--获得周围的block
function HorseRaceAvatar:_getBlockAround(blocks)
    self._nowFloorY  = 0
    local aroundBlocks = {}
    local posX = self._position.x
    for i, v in pairs(blocks) do 
        if v.mapPos.x > posX - 1500 and v.mapPos.x < posX + 100 then 
            local block = v
            table.insert(aroundBlocks, block)
            if block.type == HorseRaceConst.BLOCK_TYPE_MAP and self._position.x >= block.mapPos.x and self._position.x <= block.mapPos.x + block.width then 
                self._nowFloorY = block.mapPos.y + block.height
            end
        end
    end
    return aroundBlocks
end

function HorseRaceAvatar:_moveAhead(f) 
    self._speedX = speed*f
    self._position.x = self._position.x + self._speedX
    -- self:setPositionX(self._position.x)
    self._distance = self._distance + self._speedX
    self._positionLastX = self._position.x
end

function HorseRaceAvatar:_updateFrame(f)
    if self._framePositionX ~= self._position.x then 
        self._framePositionX = self._positionLastX + (self._position.x - self._positionLastX) * f
        self:setPositionX(self._framePositionX)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_HORSE_RACE_POSX, self._framePositionX)
end

function HorseRaceAvatar:_updateBlockAround(blocks)
    for i, v in pairs(blocks) do 
        local isTouch, block = self:_judgeBlock(v)
        if isTouch then 
            self:_updateTouchBlock(block)
        end
    end
end

function HorseRaceAvatar:_updateTouchBlock(block)
    if block.type == HorseRaceConst.BLOCK_TYPE_MAP then --如果碰到土地了
        -- 如果坐标y在土地的y之上 
        if self._position.y >= block.mapPos.y + block.height - 1 then 
            self._gForce = 0
            self._speedY = 0
            self._position.y = block.mapPos.y + block.height
            if self._stateMachine:getCurState() == self._stateJump or self._stateMachine:getCurState() == self._stateJump2 then 
                self._stateMachine:changeState(self._stateRun)
            end
            if self._win then 
                self._speedX = 0
                self._endGame = true
                self._stateMachine:changeState(self._stateWin)
            end
        else    --其他情况碰撞，就是死了
            self:_gameOver()
        end 
    elseif block.type == HorseRaceConst.BLOCK_TYPE_OBSTRUCTION then     --碰到阻碍
        self:_gameOver()
    elseif block.type == HorseRaceConst.BLOCK_TYPE_REWARD then 
        self:_getReward(block)
    elseif block.type == HorseRaceConst.BLOCK_TYPE_FINAL then 
        self:_checkWin()
    end

end

function HorseRaceAvatar:_gameOver()
    self._speedX = 0
    self._endGame = true
    self._stateMachine:changeState(self._stateGameOver)
end

function HorseRaceAvatar:_getReward(block)
    if not block.isGet then
        self._getPoint = self._getPoint + block.point
        G_SignalManager:dispatch(SignalConst.EVENT_HORSE_GET_POINT, self._getPoint, block)
        block.isGet = true
    end
end

function HorseRaceAvatar:_updatePosY(f)
    -- print("1112233 update time = ", f)
    local distance = self._speedY*f
    local nextY = self._position.y + distance

    if self._position.y > self._nowFloorY and nextY < self._nowFloorY then 
        self._position.y = self._nowFloorY 
    else 
        self._position.y = nextY
    end
    self:setPositionY(self._position.y)
    self._speedY = self._speedY + self._gForce

    if self._position.y < 40 then 
        self:_gameOver()
    end
 end

function HorseRaceAvatar:updateForce(f)

end

function HorseRaceAvatar:_onEventJump()
    if self._stateMachine:getCurState() == self._stateJump then 
        self._stateMachine:changeState(self._stateJump2)
    elseif self._stateMachine:getCurState() == self._stateRun then
        self._stateMachine:changeState(self._stateJump)
    end
end

function HorseRaceAvatar:_onEventStart()
    self._startGame = true
    self._stateMachine:changeState(self._stateRun)
end

function HorseRaceAvatar:_onEventStartAction()
    self._stateMachine:changeState(self._stateStartAction)
end

function HorseRaceAvatar:_checkWin()
    self._win = true
end


return HorseRaceAvatar