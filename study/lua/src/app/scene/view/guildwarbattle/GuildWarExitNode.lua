

local ViewBase = require("app.ui.ViewBase")
local GuildWarExitNode = class("GuildWarExitNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local GuildWarConst = require("app.const.GuildWarConst")

function GuildWarExitNode:ctor(cityId,poindId)
	self._cityId = cityId
	self._pointId = poindId   
	self._config =  GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,poindId)
	self._imageLight = nil
	self._panelTouchRegion = nil

	local resource = {
		file = Path.getCSB("GuildWarExitNode", "guildwarbattle"),
		binding = {
			_panelTouchRegion = {
				events = {{event = "touch", method = "_onExitClick"}}
			},
		
		},
	}
	GuildWarExitNode.super.ctor(self, resource)
end

-- Describle：
function GuildWarExitNode:onCreate()
    local x,y = self._config.clickPos.x,self._config.clickPos.y--GuildWarDataHelper.decodePoint(self._config.click_point)
	self:setPosition(x,y)
	self:_setTouchSize()
	self._panelTouchRegion:setSwallowTouches(false)

	local campType = GuildWarDataHelper.getSelfCampType(self._cityId )
	local goAttack = campType == GuildWarConst.CAMP_TYPE_DEFENDER
	if goAttack then
		self:_visibleSign(true)
		self._imageLight:loadTexture(Path.getTextSignet("img_guild_war01"))
	else

		self:_visibleSign(true)
		self._imageLight:loadTexture(Path.getTextSignet("img_guild_war02b"))
	end

end

-- Describle：
function GuildWarExitNode:onEnter()

end

function GuildWarExitNode:_setTouchSize()
	 
	local clickPointX,clickPointY = self._config.clickPos.x,self._config.clickPos.y--GuildWarDataHelper.decodePoint(self._config.click_point)
	local x,y = clickPointX,clickPointY
	local clickRadius = self._config.click_radius
	clickPointX = clickPointX - x
	clickPointY = clickPointY - y
	self._panelTouchRegion:setPosition(clickPointX,clickPointY)
	self._panelTouchRegion:setContentSize(cc.size(clickRadius * 2,clickRadius * 2))
end

-- Describle：
function GuildWarExitNode:onExit()
end

function GuildWarExitNode:_onExitClick(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
			local success = GuildWarCheck.guildWarCanExit(self._cityId )
			if success then
				G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_CHANGE_CITY,self._pointId)
			end
		end
	end

end


function GuildWarExitNode:_visibleSign(show)
	self._imageLight:setVisible(show)	
	if show then
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playFloatXEffect(self._imageLight)
	else
		self._imageLight:stopAllActions()
	end
end



return GuildWarExitNode