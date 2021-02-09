
local ViewBase = require("app.ui.ViewBase")
local GuildWarCountdownNode = class("GuildWarCountdownNode", ViewBase)

function GuildWarCountdownNode:ctor()
    self._imageBg = nil
    self._imageNum1 = nil
    self._imageNum2 = nil
    self._effectNode = nil
    self._num1X = 0
    self._num2X = 0
    self._time = 0
    self._textNum = nil
    self._isRunning = false
	local resource = {
		file = Path.getCSB("GuildWarCountdownNode", "guildwarbattle"),

	}
	GuildWarCountdownNode.super.ctor(self, resource)
end

function GuildWarCountdownNode:onCreate()
    self._num1X  = self._imageNum1:getPositionX()
    self._num2X = self._imageNum2:getPositionX()
end

function GuildWarCountdownNode:onEnter()
    local curTime = G_ServerTime:getTime()
    if self._time > curTime  then
        self:startCountdown(self._time)
    end
end

function GuildWarCountdownNode:onExit()
    self:stopCountdown()
end

function GuildWarCountdownNode:isRunning()
    return self._isRunning 
end

function GuildWarCountdownNode:startCountdown(time, finishCallBack)
    self._time = time
    local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)

    self._isRunning = true
    self._finishCallBack = finishCallBack
    self:_onRefreshTick()
end

function GuildWarCountdownNode:stopCountdown()
    local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function GuildWarCountdownNode:_onRefreshTick(dt)
	local curTime = G_ServerTime:getTime()
    local second = self._time - curTime

    self:_refreshTime(second)

    if second <= 0 then
        self:stopCountdown()
        local function eventFunction(event)
            if event == "finish" then
                self:setVisible(false)
                self._isRunning = false
                if self._finishCallBack then
                    self._finishCallBack()
                end
            end
        end
        self._effectNode:removeAllChildren()
        local gfxEffect = G_EffectGfxMgr:createPlayGfx(self._effectNode, "effect_zhandou_duijue", eventFunction, true)     
    end
  
end



function GuildWarCountdownNode:_refreshTime(num)
    if num <= 0 then
         self._textNum:setVisible(false)
         self._imageBg:setVisible(false)
    elseif num <= 3 then
        self._effectNode:removeAllChildren()
        G_EffectGfxMgr:createPlayGfx(self._effectNode, "effect_jingjijishi_"..num, eventFunction, true)     
        self._imageBg:setVisible(false)
        self._textNum:setVisible(false)
    else
        self._imageBg:setVisible(true)
        self._textNum:setVisible(true)
        self._textNum:setString(tostring(num))
    end
   

    --[[
    if num <= 0 then
        self._imageNum1:setVisible(false)
        self._imageNum2:setVisible(false)
    elseif num < 10 then
        self._imageNum1:setVisible(true)
        self._imageNum2:setVisible(false)
        self._imageNum1:setPositionX(0)
        self._imageNum1:loadTexture(Path.getGuildWar("vip_"..num))
    else
        local num1 = math.floor( num / 10)
        local num2 = num % 10

        self._imageNum1:setVisible(true)
        self._imageNum2:setVisible(true)  

        self._imageNum1:setPositionX(self._num1X)
        self._imageNum2:setPositionX(self._num2X)

       -- self._imageNum1:setString( tostring(math.floor( num / 10) )) 
       -- self._imageNum2:setString(tostring(num % 10))
        self._imageNum1:loadTexture(Path.getGuildWar("vip_"..num1))
        self._imageNum2:loadTexture(Path.getGuildWar("vip_"..num2))
    end
    ]]
end



return GuildWarCountdownNode