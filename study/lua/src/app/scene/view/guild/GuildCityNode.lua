local ViewBase = require("app.ui.ViewBase")
local GuildCityNode = class("GuildCityNode", ViewBase)
local GuildConst = require("app.const.GuildConst")
local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")

function GuildCityNode:ctor(cityCfg,listener)
    self._cityCfg = cityCfg
	self._listener = listener
    self._redPoint = nil
    self._button = nil
	self._imageNameBg = nil
	self._imageName = nil
	self._nodeDecorate = nil
	self._nodeWorldBoss = nil
	self._panelTouch = nil
	local resource = {
		file = Path.getCSB("GuildCityNode", "guild"),
		binding = {
			_button = {
				events = {{event = "touch", method = "_onCityClick"}}
			},
			_panelTouch = {
				events = {{event = "touch", method = "_onCityClick"}}
			},
		}
	}
	GuildCityNode.super.ctor(self, resource)
end

function GuildCityNode:onCreate()
	local cityNameX = self._cityCfg.name_postion_x-self._cityCfg.postion_x
	local cityNameY = self._cityCfg.name_postion_y-self._cityCfg.postion_y
	local isCityShow = self._cityCfg.open == 1
	self:setPosition(self._cityCfg.postion_x,self._cityCfg.postion_y)
	self._panelTouch:setSwallowTouches(false)
	self._button:setSwallowTouches(false)
	self._button:ignoreContentAdaptWithSize(true)
	self._button:loadTexture(Path.getGuildRes(self._cityCfg.pic))

	self._imageNameBg:setVisible(isCityShow )
	self._imageName:setVisible(isCityShow )
	self._redPoint:setVisible(isCityShow )
	self._nodeDecorate:setVisible(isCityShow )

	self._imageName:loadTexture(Path.getTextGuild(self._cityCfg.name_pic))
	self._imageName:ignoreContentAdaptWithSize(true)

	local nameSize = self._imageName:getContentSize()
	local bgSize = self._imageNameBg:getContentSize()
	bgSize.height = nameSize.height + 40
	self._imageNameBg:setContentSize(bgSize)
	self._imageNameBg:setPosition(cityNameX,cityNameY)
	self._imageName:setPosition(cityNameX,cityNameY)

	self._redPoint:setPosition(cityNameX + bgSize.width*0.5 -3,cityNameY + bgSize.height*0.5-6)

	
end

function GuildCityNode:onEnter()
	if self._cityCfg.id == GuildConst.CITY_BOSS_ID then--世界BOSS
		self._signalWorldBossGetInfo = G_SignalManager:add(SignalConst.EVENT_WORLDBOSS_GET_INFO, handler(self, self._onEventWorldBossGetInfo))
		self._signalCrossWorldBossGetInfo = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_INFO, handler(self, self._onEventWorldBossGetInfo))
		
		if CrossWorldBossHelper.checkNeedGetActivityInfo() then
			G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
		end
	end
end

function GuildCityNode:onExit()
	if self._signalWorldBossGetInfo then
		self._signalWorldBossGetInfo:remove()
		self._signalWorldBossGetInfo = nil
	end

	if self._signalCrossWorldBossGetInfo then
		self._signalCrossWorldBossGetInfo:remove()
		self._signalCrossWorldBossGetInfo = nil
	end
end

function GuildCityNode:refreshRedPoint(showRedPoint)
	if self._cityCfg.open == 1 then
		self._redPoint:setVisible(showRedPoint)
	end
end

function GuildCityNode:refreshCityView()
	if self._cityCfg.open ~= 1 then
		return
	end
	local openNeedLevel = self._cityCfg.show_level--开放需要的军团等级
	local guildLevel = G_UserData:getGuild():getMyGuildLevel()
	local isOpen = openNeedLevel <= guildLevel

	local imageName = self._cityCfg.name_pic
	
	if self._cityCfg.id == GuildConst.CITY_BOSS_ID  then--世界BOSS建筑
		if isOpen and not self._nodeWorldBoss then
			self:_createWorldBoss()
		elseif not isOpen and self._nodeWorldBoss then
			self._nodeWorldBoss:removeFromParent()
			self._nodeWorldBoss = nil
		end

		if CrossWorldBossHelper.checkShowCrossBoss() then
			imageName = "txt_guild_kuafuboss09"
		end
	end

	self._imageName:loadTexture(Path.getTextGuild(
		isOpen and imageName or (self._cityCfg.name_pic.."b")
	))
	
end

function GuildCityNode:_doClick()
	if self._listener and self._cityCfg.open == 1  then
		self._listener(self,self:getCityData())
	end
end

function GuildCityNode:_onCityClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:_doClick()
		return true
	else
		return false	
	end
end

function GuildCityNode:getCityData()
	return self._cityCfg
end

function GuildCityNode:_createWorldBoss()
	self:_onEventWorldBossGetInfo()
end

function GuildCityNode:_onEventWorldBossGetInfo(event)
	if self._nodeWorldBoss then
		self._nodeWorldBoss:removeFromParent()
		self._nodeWorldBoss = nil
	end

	local CSHelper = require("yoka.utils.CSHelper")-- 创建弹框
    local node =  CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
	--node:setCallBack(handler(self,self._doClick))
	--node:setTouchEnabled(true)
	node:setScale(0.5)
	node:setPositionY(-5)
	self._nodeDecorate:removeAllChildren()
	self._nodeDecorate:addChild(node)
	self._nodeWorldBoss = node

	if self._nodeWorldBoss then
		local bossId = CrossWorldBossHelper.getBossHeroId()

		if CrossWorldBossHelper.checkShowCrossBoss() then
			self._nodeWorldBoss:updateUI(bossId)
		else
			local bossInfo = G_UserData:getWorldBoss():getBossInfo()
			self._nodeWorldBoss:updateUI(bossInfo.hero_id)
		end
	end
end

return GuildCityNode