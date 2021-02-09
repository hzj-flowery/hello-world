
local CommonRollNumber = class("CommonRollNumber")
local scheduler = require("cocos.framework.scheduler")

local EXPORTED_METHODS = {
    "updateTxtValue",
    "setRollListener",
    "setRollEndCallback"
}

function CommonRollNumber:ctor()
	self._target = nil
    self._rollListener = nil
    self._rollEndCallback = nil
end

function CommonRollNumber:_init()
    self._target:onNodeEvent("exit", function ()
        logWarn("CommonRollNumber exit .......")
        self:stopUpdateSchedule()
    end)
end

function CommonRollNumber:bind(target)
	self._target = target
    self._rollListener = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonRollNumber:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonRollNumber:updateTxtValue(num_value,unit_value,step,notAni)
	if not num_value then return end
    step = step or 30
    local function txtRunAction(curr, dst)
	    self:stopUpdateSchedule()
        
        --dst >= unit_value math.floor(dst/unit_value)
        --curr >= unit_value math.floor(curr/unit_value)
        --if math.abs(dst-curr) > unit_value then
        --    self:doScaleAnimation()
        --end
        if not notAni then
            self:doScaleAnimation()
        end

	    self.stepValue= (dst-curr)/step
	    self.stepValue=self.stepValue>0 and math.ceil(self.stepValue) or math.floor(self.stepValue)
	    self.dstValue = dst
	    self.updateScheduler_=scheduler.scheduleGlobal(handler(self,self._updateScheduleFunc),1/30)
    end

    if(self.currValue==nil)then
    	self.currValue= self._rollListener:getNumberValue(self._target)
    else
    	self.currValue=self.txt_temp_value
    end
    
   	if self.currValue ~= num_value  then
        txtRunAction(self.currValue,num_value)
    end

    self.txt_temp_value = num_value
    self:_formatNumber(num_value)
end

function CommonRollNumber:_formatNumber(num)
    if self._rollListener and num then
        self._rollListener:setNumberValue(num)
    end
end

function CommonRollNumber:_updateScheduleFunc()
    if(self.currValue==nil)then return end
    self.currValue=self.currValue+self.stepValue
    if(self.currValue>=self.dstValue and self.stepValue>0)then
        self.currValue=self.dstValue
        self:stopUpdateSchedule()
    elseif(self.currValue<=self.dstValue and self.stepValue<0)then
        self.currValue=self.dstValue
        self:stopUpdateSchedule()
    end
    self:_formatNumber(self.currValue)
end

function CommonRollNumber:stopUpdateSchedule()
    if(self.updateScheduler_~=nil)then
        scheduler.unscheduleGlobal(self.updateScheduler_)
    end
    self:_formatNumber(self.currValue)
    self.updateScheduler_=nil
    if self._rollEndCallback then
        self._rollEndCallback(self._target)
        self.currValue = nil
    end
end

function CommonRollNumber:doScaleAnimation(duration)
	local action1 = cc.ScaleTo:create(duration or 0.2,1.5)
	local action2 = cc.ScaleTo:create(duration or 0.2,1)
	local seq = cc.Sequence:create(action1,cc.DelayTime:create(0.1),action2)
	self._target:runAction(seq)
end

function CommonRollNumber:setRollListener(listener)
    self._rollListener = listener
end

function CommonRollNumber:setRollEndCallback(callback)
    self._rollEndCallback = callback
end

function CommonRollNumber:resetValue()
    self.currValue = nil
end


return CommonRollNumber