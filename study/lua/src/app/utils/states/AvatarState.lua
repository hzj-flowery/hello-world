--avatar 状态机重的state
local AvatarState = class("AvatarState")

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

--状态机
-- willEnter
-- willExit
-- didEnter
-- didExit

-- 名字，切换状态的函数,是否可以被强制打断，
function AvatarState:ctor(name, willEnter, willExit, didEnter, didExit, canForceStop)
    self._name = name
    self._handlerWillEnter = willEnter
    self._handlerWillExit = willExit
    self._handlerDidEnter = didEnter
    self._handlerDidExit = didExit
    self._handlerUpdate = nil
    self._canForceStop = canForceStop or true
end

function AvatarState:setUpdate(update)
    self._handlerUpdate = update
end

function AvatarState:setCanForceStop(canForceStop)
    self._canForceStop = canForceStop
end

--
function AvatarState:onWillEnter()
    if self._handlerWillEnter then 
        self._handlerWillEnter(self._name)
    end
end

--
function AvatarState:onWillExit()
    if self._handlerWillExit then 
        self._handlerWillExit(self._name)
    end
end

--
function AvatarState:onDidEnter()
    if self._handlerDidEnter then 
        self._handlerDidEnter(self._name)
    end
end

--
function AvatarState:onDidExit()
    if self._handlerDidExit then 
        self._handlerDidExit(self._name)
    end
end

function AvatarState:setWillEnter(willEnter)
    self._handlerWillEnter = willEnter
end

function AvatarState:setWillExit(willExit)
    self._handlerWillExit = willExit
end

function AvatarState:setDidEnter(didEnter)
    self._handlerDidEnter = didEnter
end

function AvatarState:setDidExit(didExit)
    self._handlerDidExit = didExit
end

function AvatarState:canForceStop()
    return self._canForceStop
end

function AvatarState:getName()
    return self._name
end

function AvatarState:update(f)
    if self._handlerUpdate then 
        self._handlerUpdate(f)
    end
end

return AvatarState
