local TextField=ccui.TextField

function TextField:setupCursorAndListener(color,listener_func)
	self.listener_func=listener_func
	if(self.cursor==nil)then
		self.cursor=display.newNode():addTo(self)
		local spr_cur=display.newSprite("res/ui3/common/img_com_buyminusboard.png"):addTo(self.cursor)
		local size=self:getContentSize()
		local fontSize=self:getFontSize()
		spr_cur:setScaleY(fontSize/22)
		--self.cursor:setPositionY(size.height/2)
		if(color~=nil)then
			spr_cur:setColor(color)
		end
		local action1=cc.FadeTo:create(0.5,0)
		local action2=cc.FadeTo:create(0.5,255)
		local seq=cc.Sequence:create(action1,action2)
		local re=cc.RepeatForever:create(seq)
		spr_cur:runAction(re)

		self:addEventListener(handler(self,self.onTextEventFunc__))

		self._conW = size.width
		self._conH = size.height
		self:showCursor__(false)
	end

end

function TextField:resetCursor( )
	-- body
	self.cursor:setPositionX(1)
end

function TextField:showCursor__(b)
	
	local content = self:getString()
	local fontSize = self:getFontSize()
	local maxRows = math.floor(self._conH/fontSize)

	local contentWidth = self:getAutoRenderSize().width
	local rows = math.floor(contentWidth/self._conW)+1
	rows = math.min(rows, maxRows)


	local xpos = contentWidth  --光标坐标

	if contentWidth>self._conW then
		xpos = contentWidth - (rows-1)*self._conW
	end

	local ypos = self._conH - (rows-0.5)*fontSize - (rows-1)*3 --行距

	--单行输入框
	if rows == 1 then
		xpos = math.min(contentWidth, self._conW)
	end

	--没输入任何内容
	if content =="" then 
		xpos = 0
	end

	self.cursor:setVisible(b)
	self.cursor:setPositionX(xpos+1)
	self.cursor:setPositionY(ypos)

	--print("yyyyyy posX="..xpos.."  posY="..ypos.."  stringlen="..contentWidth.. " rows="..rows.."  self._conW="..self._conW..
	--	" self._conH="..self._conH)
end



function TextField:onTextEventFunc__(txt,eventType)
	if(self.listener_func~=nil)then
		self.listener_func(txt,eventType)
	end
    if(eventType==ccui.TextFiledEventType.attach_with_ime)then
		self:showCursor__(true)
    elseif(eventType==ccui.TextFiledEventType.detach_with_ime)then
        self:showCursor__(false)
    elseif(eventType==ccui.TextFiledEventType.insert_text)then
        self:showCursor__(true)
    elseif(eventType==ccui.TextFiledEventType.delete_backward)then
    	self:showCursor__(true)
    end
end

local Text=ccui.Text
local scheduler=require("cocos.framework.scheduler")

--数字增加 减少 动画效果 ---start
function Text:updateTxtValue( num_value )

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
	    self:doScaleAnimation()
	    
	    local step=5
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
    	self.currValue= tonumber(cur_value) or 0
    else
    	self.currValue=self.txt_temp_value
    end
    
   	if self.currValue~=value then
        txtRunAction(self.currValue,value)
    end

    self.txt_temp_value=value
    self:_formatNumber(num_value)
end

function Text:_formatNumber(num)
	local format=tostring(checknumber(num))
    self:setString(format..(self._isPercent and "%" or ""))
end

function Text:_updateScheduleFunc()
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

function Text:stopUpdateSchedule()
    if(self.updateScheduler_~=nil)then
        scheduler.unscheduleGlobal(self.updateScheduler_)
    end

    self:_formatNumber(self.currValue)
    self.updateScheduler_=nil
end
--数字增加 减少 动画效果 ---end


function Text:doScaleAnimation( duration )
	-- body
	local action1 = cc.ScaleTo:create(duration or 0.2,1.5)
	local action2 = cc.ScaleTo:create(duration or 0.2,1)
	local seq = cc.Sequence:create(action1,cc.DelayTime:create(0.1),action2)
	self:runAction(seq)
end

function Text:onExit( ... )
	-- body
	self:stopUpdateSchedule()
end