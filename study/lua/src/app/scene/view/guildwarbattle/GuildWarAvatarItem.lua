
-- Author: �û�����
-- Date:2018-07-19 15:24:35
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildWarAvatarItem = class("GuildWarAvatarItem", ViewBase)

GuildWarAvatarItem.SCALE = 0.7

GuildWarAvatarItem.PROGRESS_IMGS = {

	"img_war_member03e",	
	"img_war_member03d",
	"img_war_member03c",
	"img_war_member03b",	
	"img_war_member03a",
}


function GuildWarAvatarItem:ctor()
	self._warUserData = nil
	--csb bind var name
	self._commonHeroAvatar = nil
	self._textPowerValue = nil
	self._textName = nil
	self._commonGuildFlag = nil
	self._loadingBarHp = nil
	self._imageProgress = nil
	self._callback = nil
	local resource = {
		file = Path.getCSB("GuildWarAvatarItem", "guildwarbattle"),

	}
	GuildWarAvatarItem.super.ctor(self, resource)
end

-- Describle：
function GuildWarAvatarItem:onCreate()
	self._commonHeroAvatar:setCallBack(handler(self,self._onHeroClick))
	self._imageProgress:ignoreContentAdaptWithSize(true)
end

-- Describle：
function GuildWarAvatarItem:onEnter()

end

-- Describle：
function GuildWarAvatarItem:onExit()

end

function GuildWarAvatarItem:_onHeroClick()
	--logWarn("GuildWarAvatarItem ----------  ")
	if self._callback then
		self._callback(self._warUserData)
	end
end

function GuildWarAvatarItem:setHeroClickCallback(callback)
	self._callback = callback
end


function GuildWarAvatarItem:updateInfo(warUserData)
	self._warUserData = warUserData 

	self:_updateHeroSpine()
	self:_updateHeroPower()
	self:_updateHeroName()
	self:_updateGuildFlag()
	self:_updateHp()
end

function GuildWarAvatarItem:turnBack(value)
	self._commonHeroAvatar:turnBack(value)
end


function GuildWarAvatarItem:_updateHeroSpine()
	self._commonHeroAvatar:updateAvatar(self._warUserData:getPlayerInfo())
	self._commonHeroAvatar:setTouchEnabled(true)	
	self._commonHeroAvatar:setScale(GuildWarAvatarItem.SCALE)
	self._commonHeroAvatar:turnBack()
end

function GuildWarAvatarItem:_updateHeroPower()
	local TextHelper = require("app.utils.TextHelper")
	local sizeText = TextHelper.getAmountText(self._warUserData:getPower())
	self._textPowerValue:setString(sizeText)
end

function GuildWarAvatarItem:_updateHeroName()
	self._textName:setString(self._warUserData:getUser_name())
	local officerLevel = self._warUserData:getOfficer_level()
	self._textName:setColor(Colors.getOfficialColor(officerLevel))
end

function GuildWarAvatarItem:_updateGuildFlag()
	local name = self._warUserData:getGuild_name()
	local index = self._warUserData:getGuild_icon()
	self._commonGuildFlag:updateUI(index,name)
end

function GuildWarAvatarItem:_updateHp()
	local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
	local maxHp = GuildWarDataHelper.getGuildWarHp(self._warUserData)
	local hp = self._warUserData:getWar_value()
	--self._loadingBarHp:setPercent(hp * 100 /maxHp)
	if hp <= 0 then
		self._imageProgress:setVisible(false)
	else
		self._imageProgress:setVisible(true)
		self._imageProgress:loadTexture( Path.getGuildWar( GuildWarAvatarItem.PROGRESS_IMGS[hp] ))
	end

end

return GuildWarAvatarItem
