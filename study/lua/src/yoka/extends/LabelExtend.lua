local Label = cc.Label
local scheduler=require("cocos.framework.scheduler")

function Label:updateTxtValue(num_value )

	if not num_value or num_value == "" then return end

	self._isPercent = false
	--百分比属性
	if type(num_value) =="string" and string.match(num_value, "%%") then
		num_value = string.sub(num_value, 1, -2)
		self._isPercent = true
	end

    local function txtRunAction(curr, dst)
	    self:stopUpdateSchedule()
	    -- self:scale(1)
	    -- self:doScaleAnimation()
	    
	    local step=30
	    self.stepValue=(dst-curr)/step
	    self.stepValue=self.stepValue>0 and math.ceil(self.stepValue) or math.floor(self.stepValue)
	    self.dstValue=dst
	    self.updateScheduler_=scheduler.scheduleGlobal(handler(self,self._updateScheduleFunc),1/30)
    end

    local value=tonumber(num_value)

    if(self.currValue==nil)then
    	local cur_value = self:getString()
    	if self._isPercent then
    		cur_value = string.sub(cur_value, 1, -2)
    	end
    	self.currValue= tonumber(cur_value)
    else
    	self.currValue=self.txt_temp_value
    end
    
   	if self.currValue~=value then
        txtRunAction(self.currValue,value)
    end

    self.txt_temp_value=value
    self:_formatNumber(num_value)
end

function Label:_formatNumber(num)
	local format=tostring(checknumber(num))
    self:setString(format..(self._isPercent and "%" or ""))
end

function Label:_updateScheduleFunc()
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

function Label:stopUpdateSchedule()
    if(self.updateScheduler_~=nil)then
        scheduler.unscheduleGlobal(self.updateScheduler_)
    end

    self:_formatNumber(self.currValue)
    self.updateScheduler_=nil
end
--数字增加 减少 动画效果 ---end


function Label:doScaleAnimation( duration )
	-- body
	local action1 = cc.ScaleTo:create(duration or 0.2,1.5)
	local action2 = cc.ScaleTo:create(duration or 0.2,1)
	local seq = cc.Sequence:create(action1,cc.DelayTime:create(0.1),action2)
	self:runAction(seq)
end

function Label:onExit( ... )
    -- body
    self:stopUpdateSchedule()
end