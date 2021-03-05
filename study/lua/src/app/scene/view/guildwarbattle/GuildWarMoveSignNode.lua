
-- Author: �û�����
-- Date:2018-07-19 15:24:37
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildWarMoveSignNode = class("GuildWarMoveSignNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")

function GuildWarMoveSignNode:ctor()
	self._data = nil
	self._imageDragon = nil  
	self._textCd = nil
	self._listener = nil
	self._progressRing = nil
	self._panelTouch = nil
	self._showEffect = false
	self._effectNode = nil
	local resource = {
		file = Path.getCSB("GuildWarMoveSignNode", "guildwarbattle"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPointClick"}}
			},

		},
	}
	GuildWarMoveSignNode.super.ctor(self, resource)
end


function GuildWarMoveSignNode:onCreate()
	self:_createProgress()
	self._effectNode = G_EffectGfxMgr:createPlayMovingGfx( self._panelTouch, "moving_juntuanzhan_jiantou", nil, nil, false )
end

function GuildWarMoveSignNode:onEnter()
	self:_startTimer()
end

function GuildWarMoveSignNode:onExit()
	self:_endTimer()
end


function GuildWarMoveSignNode:_startTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),0.5)
end

function GuildWarMoveSignNode:_endTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end


function GuildWarMoveSignNode:_onRefreshTick(dt)
	
	
	if self._data then
		self:_refreshTimeView()
	end
end



function GuildWarMoveSignNode:updateInfo(data)
	self._data = data
	local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(data.cityId,data.pointId)
	local clickPointX,clickPointY = config.clickPos.x,config.clickPos.y -- GuildWarDataHelper.decodePoint(config.click_point)
	self:setPosition(clickPointX,clickPointY)

	self:_refreshTimeView()

end

function GuildWarMoveSignNode:_refreshTimeView()
	--cd 时间
	local canMove = true
	local guildWarUser = G_UserData:getGuildWar():getMyWarUser(self._data.cityId)
	local moveTime = guildWarUser:getMove_time()
    local moveCD = GuildWarDataHelper.getGuildWarMoveCD() 
    local curTime = G_ServerTime:getMSTime()-999
    if curTime <= (moveTime + moveCD)*1000  then
		canMove = false
        local second = (moveTime + moveCD )*1000- curTime
		second = math.max(0,second)
        self._textCd:setString( Lang.get("guildwar_move_cd",{value = math.ceil(second/1000) }))
		self._progressRing:setVisible(true)
		self._progressRing:setPercentage(second * 100/(moveCD*1000))   	
		self._effectNode:setVisible(false)
		self._showEffect = true
    else
	
        self._textCd:setString("")
		self._progressRing:setVisible(false)
		self._effectNode:setVisible(true)

		if self._showEffect  then
			self._showEffect = false
			--G_EffectGfxMgr:createPlayMovingGfx( self._panelTouch, "moving_juntuanzhan_jiantou", nil, nil, false )
		end


    end
end



function GuildWarMoveSignNode:_onPointClick(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._listener then
				self._listener(	self._data.cityId,self._data.pointId)
			end
			self:_onButtonMove()
		end
	end

end

function GuildWarMoveSignNode:_onButtonMove()
	-- 检查CD
	local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
	local success = GuildWarCheck.guildWarCanMove(self._data.cityId,self._data.pointId,false,true)
	if success then
		local pointId = self._data.pointId --myWatchUser:getPoint()--目标据点
		G_UserData:getGuildWar():c2sMoveGuildWarPoint(pointId)
	end

end


function GuildWarMoveSignNode:_createProgress()
	local pic = Path.getGuildWar("img_war_com02d")
	self._progressRing = cc.ProgressTimer:create(cc.Sprite:create(pic))
	self._progressRing:setReverseDirection(true)
	local size = self._panelTouch:getContentSize()
	self._progressRing:setPosition(size.width*0.5,size.height*0.5)
	self._panelTouch:addChild(self._progressRing)
end



function GuildWarMoveSignNode:setOnPointClickListener(listener)
	self._listener = listener
end


return GuildWarMoveSignNode