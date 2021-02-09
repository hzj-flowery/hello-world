
--冷却时间帮助类
local FightBtn = class("FightBtn")

function FightBtn:ctor(textImage, timeLabel, getEndTimeFunc, timeLabelBg)
    self._textImage = textImage
    self._timeLabel = timeLabel
	self._getEndTimeFunc = getEndTimeFunc
	self._timeLabelBg = timeLabelBg
end

function FightBtn:update()
	self._canAttackTime = self._getEndTimeFunc()
	local curTime = G_ServerTime:getTime()
    -- logError("time1  "..G_ServerTime:getTimeString(self._canAttackTime))
    -- logError("time2  "..G_ServerTime:getTimeString(self.curTime))
	if curTime <= self._canAttackTime then
		self:_startCd()
		self._timeLabel:setString(G_ServerTime:getLeftSecondsString(self._canAttackTime, "00:00:00"))
		local UIActionHelper = require("app.utils.UIActionHelper")
		local action = UIActionHelper.createUpdateAction(function()
			self:_cdUpdate()
		end, 0.5)
		self._timeLabel:runAction(action)
	else
		self:_stopCd()
	end
end

function FightBtn:_stopCd()
	self._timeLabel:stopAllActions()
	self._timeLabel:setVisible(false)
	-- self._textImage:setPositionY(78)

	if self._timeLabelBg then
		self._timeLabelBg:setVisible(false)
	end
end

function FightBtn:_startCd()
	self._timeLabel:stopAllActions()
	self._timeLabel:setVisible(true)
	-- self._textImage:setPositionY(92)

	if self._timeLabelBg then
		self._timeLabelBg:setVisible(true)
	end
end

function FightBtn:_cdUpdate()
	local curTime = G_ServerTime:getTime()
	if curTime > self._canAttackTime then
		self:_stopCd()
	else
		self._timeLabel:setString(G_ServerTime:getLeftSecondsString(self._canAttackTime, "00:00:00"))
	end
end

function FightBtn:canFight()
    local curTime = G_ServerTime:getTime()
    local canAttackTime = self._getEndTimeFunc()
    if curTime > canAttackTime then
        return true
    end
    return false
end

return FightBtn
