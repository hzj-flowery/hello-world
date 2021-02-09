--用于avatar的状态机
local AvatarState = require("app.utils.states.AvatarState")

local AvatarStateMachine = class("AvatarStateMachine")

function AvatarStateMachine:ctor(defaultState, defaultCallback)
    self._defaultState = defaultState       --基础状态
    self._defaultCallback = defaultCallback
    self._curState = defaultState
    self._defaultState:onDidEnter()
end

function AvatarStateMachine:canChangeState(state)
    if state:getName() == self._curState:getName() then 
        return false
    end
    return true
end

function AvatarStateMachine:changeState(state)
    if not self:canChangeState(state) then 
        return 
    end

    local curState = self._curState
    local nextState = state

    curState:onWillExit()
    nextState:onWillEnter()

    --进入切换状态，
    self:_changeStateSuccess(curState, nextState)
end

function AvatarStateMachine:_changeStateSuccess(curState, nextState)

    self._defaultCallback(curState, nextState)
    curState:onDidExit()
    nextState:onDidEnter()

    self._curState = nextState
end

function AvatarStateMachine:update(f)
    self._curState:update(f)
end

function AvatarStateMachine:stopCurState()
    if self._curState ~= self._defaultState then
        self:changeState(self._defaultState)
    end
end

function AvatarStateMachine:getCurState()
    return self._curState
end

return AvatarStateMachine