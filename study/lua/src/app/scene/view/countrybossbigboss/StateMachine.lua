local StateMachine = class("StateMachine")
-- 更好管理avatar 状态机
--[[
-- defaultState--默认状态 必须有
-- stateChangeCallback
-- state 所有状态
    nextState --可以做跳转的下一个状态
        transition(finishCallback) -- 转化到下一个状态的回调函数
        canStopTransition -- true or false  是否可以 强制结束 默认可以
        stopTransition --

    willEnter -- 将要进入该状态
    willExit -- 将要进入该状态 退出前要做的一些提前准备 可能
    didEnter -- 已经进入
    didExit -- 已经 退出
    stopEnter -- 强制取消进入 --发生在transition 过程中 nextState stopEnter
    stopExit -- 强制取消退出 --发生在transition 过程中 curstate stopEnter
]]
function StateMachine:ctor(cfg)
    if not (cfg and cfg.state and cfg.defaultState) then
        assert(false, "StateMachine structure Error")
    end
    self._cfg = cfg --state 配置
    self._curState = nil
    self._nextState = nil
    self._isInTransition = false

    self._curStateCfg = nil
    self._nextStateCfg = nil
    self._tempParams = nil
    self:_setStartState(cfg.defaultState)
end

function StateMachine:_setStartState(state)
    self._curState = state
    self._curStateCfg = self:_getStateCfg(self._curState)
    self:_safeCallFunc(self._curStateCfg["didEnter"])
end

function StateMachine:_getStateCfg(state)
    local stateCfg = self._cfg.state[state]
    assert(stateCfg ~= nil, "StateMachine can not find state "..(self._curState or nil))
    return stateCfg
end

function StateMachine:_getTransitionCfg(nextState)
    if self._curStateCfg.nextState and nextState then
        local transitionCfg = self._curStateCfg.nextState[nextState]
        return transitionCfg
    end
end
-- return: true 中断switchState
function StateMachine:_stopTransition()
    local transitionCfg = self:_getTransitionCfg(self._nextState)
    if transitionCfg and (transitionCfg.canStopTransition == nil or transitionCfg.canStopTransition == true) then
        if not self._nextStateCfg or not self._curStateCfg then
            return false
        end
        if transitionCfg["stopTransition"] then
            transitionCfg["stopTransition"]()
        end
        self:_safeCallFunc(self._curStateCfg["stopExit"])
        self:_safeCallFunc(self._nextStateCfg["stopEnter"])

        self._nextState = nil
        self._nextStateCfg = nil
        self._isInTransition = false
        return false
    end
    return true
end

function StateMachine:_safeCallFunc(f, ...)
    if f then
        f(...)
    end
end


function StateMachine:canSwitchToState(nextState, isForce)
    if self._isInTransition and not isForce then
        return false
    end
    local transitionCfg = self:_getTransitionCfg(nextState)
    if transitionCfg then
        return true
    end
    return false
end

function StateMachine:switchState(nextState, params, isForceStop)
        -- logError("switchState "..nextState)
    if nextState == self._curState then
        return false
    end

    if self._isInTransition then
        if isForceStop then
            if self:_stopTransition() then
                return false
            end
        else
            return false
        end
    end

    local transitionCfg = self:_getTransitionCfg(nextState)
    if not transitionCfg then
        -- logWarn(string.format("can not switch curState %s to nextState: %s",self._curState, nextState or "nil"))
        return false
    end

    self._tempParams = params

    self:_safeCallFunc(self._curStateCfg["willExit"],nextState)
    self._nextState = nextState
    self._nextStateCfg = self:_getStateCfg(nextState)
    self:_safeCallFunc(self._curStateCfg["willEnter"], self._tempParams)

    self._isInTransition = true
    if transitionCfg["transition"] then
        transitionCfg["transition"](handler(self, self._switchStateSuccess))
    else
        self:_switchStateSuccess()
    end
    return true
end

function StateMachine:_switchStateSuccess()
    -- logError(string.format("===================== newState %s  oldState %s ", self._nextState or "nil", self._curState or "nil"))
    if not self._isInTransition then
        return
    end
    self._isInTransition = false
    self:_safeCallFunc(self._curStateCfg["didExit"],self._nextState)
    self:_safeCallFunc(self._nextStateCfg["didEnter"], self._tempParams)
    local oldState = self._curState
    local newState = self._nextState
    self._curState = self._nextState
    self._curStateCfg = self._nextStateCfg
    self._nextState = nil
    self._nextStateCfg = nil
    self._tempParams = nil

    self:_safeCallFunc(self._cfg["stateChangeCallback"], newState, oldState)
end

function StateMachine:getCurState()
    return self._curState
end

return StateMachine
