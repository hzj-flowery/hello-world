--
-- Author: Liangxu
-- Date: 2017-06-22 16:28:57
-- 军团大厅审核申请Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildCheckApplicationCell = class("GuildCheckApplicationCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildConst = require("app.const.GuildConst")

function GuildCheckApplicationCell:ctor()
	local resource = {
		file = Path.getCSB("GuildCheckApplicationCell", "guild"),
		binding = {
			--[[ --加上连点击
			_buttonRefuse = {
				events = {{event = "touch", method = "_onButtonRefuse"}}
			},
			_buttonAgree = {
				events = {{event = "touch", method = "_onButtonAgree"}}
			},
			]]
		}
	}
	GuildCheckApplicationCell.super.ctor(self, resource)
end

function GuildCheckApplicationCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self:_initIcon()

	self._buttonRefuse:addClickEventListenerExDelay(handler(self,self._onButtonRefuse), 100)
	self._buttonAgree:addClickEventListenerExDelay(handler(self,self._onButtonAgree), 100)

	local userMemberData = G_UserData:getGuild():getMyMemberData()
	local userPosition = userMemberData:getPosition()
	local isHave = UserDataHelper.isHaveJurisdiction(userPosition, GuildConst.GUILD_JURISDICTION_6)
	if isHave then --是否有审批权限
		self._buttonRefuse:setString(Lang.get("guild_btn_refuse"))
		self._buttonAgree:setString(Lang.get("guild_btn_agree"))
		self._buttonRefuse:setVisible(true)
		self._buttonAgree:setVisible(true)
	else
		self._buttonRefuse:setVisible(false)
		self._buttonAgree:setVisible(false)
	end
end

function GuildCheckApplicationCell:_onButtonRefuse()
	self:dispatchCustomCallback(GuildConst.GUILD_CHECK_APPLICATION_OP2)
end

function GuildCheckApplicationCell:_onButtonAgree()
	self:dispatchCustomCallback(GuildConst.GUILD_CHECK_APPLICATION_OP1)
end

function GuildCheckApplicationCell:_initIcon()
    self._fileNodeIcon:setTouchEnabled(true)
	self._fileNodeIcon:setCallBack(handler(self,self.onClickHeroHead))
end

function GuildCheckApplicationCell:onClickHeroHead(sender)
	if self._data then
		G_UserData:getBase():c2sGetUserBaseInfo(self._data:getUid())
	end
end

function GuildCheckApplicationCell:update(data)
	self._data = data
	local heroBaseId = data:getPlayer_info().covertId--data:getBase_id()
	local heroName = data:getName()
	local official = data:getOfficer_level()
	local officialName, officialColor,officialInfo = UserDataHelper.getOfficialInfo(official)
	local level = data:getLevel()
	local power = TextHelper.getAmountText1(data:getPower())
	local onlineText, color = UserDataHelper.getOnlineText(data:getOffline())
	
	self._fileNodeIcon:updateIcon( data:getPlayer_info(), nil, data:getHead_frame_id() )
	--self._headFrame:updateUI(data:getHead_frame_id(),self._fileNodeIcon:getScale())

	--self._official:setString(officialName)
	--self._official:setColor(officialColor)
	self._official:loadTexture(Path.getTextHero(officialInfo.picture))
	self._official:ignoreContentAdaptWithSize(true)

	self._name:setString(heroName)
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._name, official)
	
	self._name:setColor(officialColor)
	self._level:setString(level)
	self._power:setString(power)
	self._online:setString(onlineText)
	self._online:setColor(color)
end

return GuildCheckApplicationCell