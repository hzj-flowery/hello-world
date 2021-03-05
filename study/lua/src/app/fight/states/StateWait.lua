local StateIdle = require("app.fight.states.StateIdle")
local StateWait = class("StateWait", StateIdle)

StateWait.WAIT_COMBINE = "wait_combine"
StateWait.WAIT_START = "wait_start"
StateWait.WAIT_COMBINE_SKILL = "wait_skill"
StateWait.WAIT_SECOND_WAVE = "wait_second_wave"
StateWait.WAIT_NEW_UNIT = "wait_new_unit" --引导新人进入之后
StateWait.WAIT_COMBINE_FLASH = "wait_combine_flash"
StateWait.WAIT_ENTER_STAGE = "wait_enter_stage" --等待入场

--
function StateWait:ctor(entity, waitType, action, callback, delay)
    StateWait.super.ctor(self, entity)
    self._waitType = waitType
    self._entity.readyForCombineSkill = false
    self._action = action
    self._callback = callback
    self._delay = delay or 0
    self._startDelay = 0

    -- self._entity.readyForCombineMove = false

    -- self._bShowName = false
end

--
function StateWait:start()
    StateWait.super.start(self)

    self._startDelay = 0
    if
        self._waitType == StateWait.WAIT_COMBINE or self._waitType == StateWait.WAIT_COMBINE_SKILL or
            self._waitType == StateWait.WAIT_COMBINE_FLASH
     then
        self._entity.signalStateWait:dispatch(self._waitType)
    elseif self._waitType == StateWait.WAIT_SECOND_WAVE then
        require("app.fight.Engine").getEngine():runMapInPosition(self._entity.stageID)
    elseif self._waitType == StateWait.WAIT_NEW_UNIT then
        -- elseif self._waitType == StateWait.WAIT_START and self._callback then
        -- 	self._callback()
        -- self._entity:getActor():setActionWithCallback(self._action,
        -- 	function()
        -- 		self._entity:setAction(self._action, true)
        -- 		-- self._callback()
        -- 	end)
        self._entity:playWinAction()
    elseif self._waitType == StateWait.WAIT_START then
        self._entity.signalStartCG:dispatch("enterStage")
    end
    if self._waitType == StateWait.WAIT_COMBINE or self._waitType == StateWait.WAIT_COMBINE_SKILL then
        self._entity:setBuffEffectVisible(false)
    end
end

--
function StateWait:update(f)
    -- if self._waitType == StateWait.WAIT_COMBINE and self._entity.readyForCombineMove then
    -- 	self:onFinish()
    -- else
    if self:isStart() and self._callback then
        if self._startDelay >= self._delay then
            self:_callback()
            self._callback = nil
        end
        self._startDelay = self._startDelay + f
    end
    if self._waitType == StateWait.WAIT_COMBINE_SKILL and self._entity.readyForCombineSkill then
        -- print("unit id = "..self._entity.stageID.." stop skill waiting")
        self:onFinish()
    end
    if self._entity.startMove then
        self:onFinish()
        self._entity.startMove = false
    end
end

function StateWait:onFinish()
    if self._waitType == StateWait.WAIT_COMBINE_SKILL then
        self._entity:setBuffEffectVisible(true)
    end
    StateWait.super.onFinish(self)
end

return StateWait
