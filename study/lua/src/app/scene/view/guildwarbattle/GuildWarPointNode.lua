

local ViewBase = require("app.ui.ViewBase")
local GuildWarPointNode = class("GuildWarPointNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")

function GuildWarPointNode:ctor(cityId,config)
	self._cityId = cityId
	self._config = config

	--csb bind var name
	self._panelTouchRegion = nil

	
	self._populationNode = nil
	self._nameNode = nil


	self._guildWarPointNameNode = nil
	self._guildWarPopulationNode = nil
	self._guildWarAttackNode = nil

	self._listener = nil


	self._nodeSword = nil

	local resource = {
		file = Path.getCSB("GuildWarPointNode", "guildwarbattle"),
		binding = {
			--[[
			_imageState = {
				events = {{event = "touch", method = "_onPointClick"}}
			},
			]]
		},
	}
	GuildWarPointNode.super.ctor(self, resource)
end


-- Describle：
function GuildWarPointNode:onCreate()
	local x,y = self._config.clickPos.x,self._config.clickPos.y--GuildWarDataHelper.decodePoint(self._config.click_point)
	self:setPosition(x,y)
	self:_setTouchSize()
	self._panelTouchRegion:setSwallowTouches(false)

	local GuildWarPointNameNode = require("app.scene.view.guildwarbattle.GuildWarPointNameNode")
	self._guildWarPointNameNode = GuildWarPointNameNode.new(self._nameNode)

	local GuildWarPopulationNode = require("app.scene.view.guildwarbattle.GuildWarPopulationNode")
	self._guildWarPopulationNode = GuildWarPopulationNode.new(self._populationNode)

	
	if self:_isBuilding() then
	--[[
		local GuildWarAttackNode = require("app.scene.view.guildwarbattle.GuildWarAttackNode")
		self._guildWarAttackNode = GuildWarAttackNode.new(self._cityId,self._config)
		self:addChild(self._guildWarAttackNode)

		local buildX,buildY = self._config.x-x,self._config.y-y
		self._guildWarAttackNode:setPosition(buildX,buildY + 260)
		]]
	end


	
end

function GuildWarPointNode:_setTouchSize()
	
	local clickPointX,clickPointY = self._config.clickPos.x,self._config.clickPos.y--GuildWarDataHelper.decodePoint(self._config.click_point)
	local x,y = clickPointX,clickPointY
	local clickRadius = self._config.click_radius
	clickPointX = clickPointX - x
	clickPointY = clickPointY - y
	self._panelTouchRegion:setPosition(clickPointX,clickPointY)
	self._panelTouchRegion:setContentSize(cc.size(clickRadius * 2,clickRadius * 2))
end

function GuildWarPointNode:_onPointClick(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._listener then
				self._listener(self._cityId,self._config.point_id)
			end
		end
	end

end

function GuildWarPointNode:setOnPointClickListener(listener)
	self._listener = listener
	if self._guildWarAttackNode then
		self._guildWarAttackNode:setOnPointClickListener(listener)
	end
	
end



-- Describle：
function GuildWarPointNode:onEnter()
end

-- Describle：
function GuildWarPointNode:onExit()
end

function GuildWarPointNode:updateInfo()
--	logWarn(string.format(" GuildWarPointNode ---------------- canAttack  %d ",self._config.point_id) )
	local guildWarUser = G_UserData:getGuildWar():getMyWarUser(self._cityId)
	local isSelfInPoint = guildWarUser:getCurrPoint() == self._config.point_id
	if isSelfInPoint then
		--local isDefender = GuildWarDataHelper.selfIsDefender(self._cityId)
		--local canAttack = self:_isLivingBuilding() and not isDefender

		--logWarn(string.format(" GuildWarPointNode ---------------- canAttack  %d  %s",self._config.point_id,tostring(canAttack)) )

		self._imageState:setVisible(false)--不显示了
		self._imageState:loadTexture(Path.getGuildWar("img_war_com02c"))
	else	
		self._imageState:setVisible(false)
	end

	if self._guildWarAttackNode then
		if isSelfInPoint then
			local isDefender = GuildWarDataHelper.selfIsDefender(self._cityId)
			local canAttack = self:_isLivingBuilding() and not isDefender
			--logWarn(string.format(" GuildWarPointNode ---------------- canAttack  %d  %s",self._config.point_id,tostring(canAttack)) )
			self._guildWarAttackNode:setVisible(canAttack)
		else
			self._guildWarAttackNode:setVisible(false)
		end
	end

	self._guildWarPopulationNode:updateInfo(self._cityId,self._config.point_id)
	self._guildWarPointNameNode:updateInfo(self._cityId,self._config)
end

function GuildWarPointNode:getPointId()
	return self._config.point_id
end

function GuildWarPointNode:_isBuilding()
	return self._config.build_hp > 0
end

function GuildWarPointNode:_isLivingBuilding()
	if self._config.build_hp > 0 then
		local nowWarWatch = G_UserData:getGuildWar():getWarWatchById(self._cityId,self._config.point_id)
		local maxHp = self._config.build_hp
		local hp = maxHp
		if  nowWarWatch then
			hp = nowWarWatch:getWatch_value() 
		end
		return hp > 0
	end
	
	return false
end



return GuildWarPointNode