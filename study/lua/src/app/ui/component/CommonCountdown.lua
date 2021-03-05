-- Author: nieming
-- Date:2018-05-17 20:28:43
-- Describle：

local CommonCountdown = class("CommonCountdown")

local EXPORTED_METHODS = {
	"startCountDown",
	"enableEndLable",
	"setEndLabelString",
	"setGap",
	"setCountdownLableParam",
	"setCountdownTimeParam",
	"setEndLabelParam",
	"getTotalWidth",
    "setCountdownLabel",
    "setCustomColor",
}

function CommonCountdown:ctor()
	self._target = nil
end

function CommonCountdown:_init()
	self._countdownLabel = ccui.Helper:seekNodeByName(self._target, "CountDownLabel")
	self._countdownTime = ccui.Helper:seekNodeByName(self._target, "CountDownTime")
	self._endLabel = ccui.Helper:seekNodeByName(self._target, "EndLabel")
	self._endLabel:setVisible(false)
	self._enableEndLabel = false
	self._gap = 5
end

function CommonCountdown:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonCountdown:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonCountdown._defaultFormatTime (time)
	return G_ServerTime:getLeftSecondsString(time, "00:00:00")
end

function CommonCountdown:_layout()
	local totalWidth = self._countdownTime:getContentSize().width
	if self._countdownLabel:isVisible() then
		totalWidth = totalWidth + self._countdownLabel:getContentSize().width + self._gap
		self._countdownLabel:setPositionX(-1 * totalWidth/2)
	end
	self._countdownTime:setPositionX(totalWidth/2)
end

function CommonCountdown:setGap(gap)
	self._gap = gap
end

function CommonCountdown:startCountDown(lableStr, endTime, endCallback, timeFormatFunc)

    self._endTime = endTime
	self._endCallback = endCallback
	self._formatTimeFunc = timeFormatFunc
	if not self._formatTimeFunc then
		self._formatTimeFunc = CommonCountdown._defaultFormatTime
	end

	if lableStr and lableStr ~= "" then
		self._countdownLabel:setVisible(true)
		self._countdownLabel:setString(lableStr)
	else
		self._countdownLabel:setVisible(false)
	end
	self._endLabel:setVisible(false)
	self._countdownTime:setVisible(true)
    self._countdownTime:stopAllActions()

	self._countdownTime:setString(self._formatTimeFunc(self._endTime))
	self:_layout()
	local curTime = G_ServerTime:getTime()
	if curTime <= self._endTime then
		local UIActionHelper = require("app.utils.UIActionHelper")
		local action = UIActionHelper.createUpdateAction(function()
			self:_timeUpdae()
		end, 0.5)
		self._countdownTime:runAction(action)
	else
		self:_CallEnd()
	end
end

function CommonCountdown:_timeUpdae()
	local curTime = G_ServerTime:getTime()
	if  curTime > self._endTime then
		self._countdownTime:stopAllActions()
		self:_CallEnd()
	else
		self._countdownTime:setString(self._formatTimeFunc(self._endTime))
	end
end

function CommonCountdown:_CallEnd()
	if self._enableEndLabel then
		self._countdownTime:setVisible(false)
		self._countdownLabel:setVisible(false)
		self._endLabel:setVisible(true)
	end
	if self._endCallback then
		self._endCallback()
	end
end

function CommonCountdown:enableEndLable(str)
	if str and str ~= "" then
		self._endLabel:setString(str)
		self._enableEndLabel = true
	else
		self._enableEndLabel = false
	end
end

function CommonCountdown:setEndLabelString(str)
	self._countdownTime:setVisible(false)
	self._countdownLabel:setVisible(false)
	self._endLabel:setVisible(true)
	self._endLabel:setString(str)
end

-- 自定义UI
--
function CommonCountdown:_updateTextParam(node, params)

	dump(params)
    -- 兼容直接设置文本内容
    if type(params) == "string" or type(params) == "number" then
    	node:setString(params)
    	return node
    end
	
	if params.fontSize then
		node:setFontSize(params.fontSize)
	end

	if params.color then
		node:setColor(params.color)
	end

	if params.outlineColor ~= nil then
		node:enableOutline(params.outlineColor, params.outlineSize or 2)
	end

	
    if params.visible ~= nil then
        node:setVisible(checkbool(params.visible))
    end

    if params.text ~= nil then
        node:setString(params.text)
    end
end



function CommonCountdown:setCountdownLableParam(param)
	self:_updateTextParam(self._countdownLabel, param)
end

function CommonCountdown:setCountdownTimeParam(param)
	self:_updateTextParam(self._countdownTime, param)
end

function CommonCountdown:setEndLabelParam(param)
	self:_updateTextParam(self._endLabel, param)
end

function CommonCountdown:getTotalWidth( ... )
	-- body
	local width = self._countdownLabel:getContentSize().width + self._countdownTime:getContentSize().width
	return width
end

function CommonCountdown:setCustomColor(labelColor, timeColor)
    -- body
    if labelColor then
        self._countdownLabel:setColor(labelColor)
    end
    if timeColor then
        self._countdownTime:setColor(timeColor)
    end
end

return CommonCountdown
