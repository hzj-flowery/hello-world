--
-- Author: Liangxu
-- Date: 2017-06-22 15:31:19
-- 军团大厅审核申请
local ViewBase = require("app.ui.ViewBase")
local GuildCheckApplicationNode = class("GuildCheckApplicationNode", ViewBase)
local GuildCheckApplicationCell = require("app.scene.view.guild.GuildCheckApplicationCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildConst = require("app.const.GuildConst")

function GuildCheckApplicationNode:ctor()
	local resource = {
		file = Path.getCSB("GuildCheckApplicationNode", "guild"),
		binding = {
			
		}
	}
	GuildCheckApplicationNode.super.ctor(self, resource)
end

function GuildCheckApplicationNode:onCreate()
	self._textTip:setString(Lang.get("guild_tip_no_application"))
	self._listItemSource:setTemplate(GuildCheckApplicationCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
end

function GuildCheckApplicationNode:onEnter()
	self._signalGuildGetApplication = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_APPLICATION, handler(self, self._updateInfo))
	self._signalGuildCheckApplication = G_SignalManager:add(SignalConst.EVENT_GUILD_CHECK_APPLICATION_SUCCESS, handler(self, self._guildCheckApplicationSuccess))
end

function GuildCheckApplicationNode:onExit()
	self._signalGuildGetApplication:remove()
	self._signalGuildGetApplication = nil
	self._signalGuildCheckApplication:remove()
	self._signalGuildCheckApplication = nil
end

function GuildCheckApplicationNode:updateView()
	G_UserData:getGuild():c2sGetGuildApplication()
end

function GuildCheckApplicationNode:_updateInfo()
	self:_updateList()

	local myGuild = G_UserData:getGuild():getMyGuild()
	local level = G_UserData:getGuild():getMyGuildLevel()
	self._curCount = G_UserData:getGuild():getGuildMemberCount()
	self._maxCount = UserDataHelper.getGuildMaxMember(level)
	self._textCount:setString(Lang.get("guild_txt_member_count", {count1 = self._curCount, count2 = self._maxCount}))
end

function GuildCheckApplicationNode:_updateList()
	self._guildApplicationList = G_UserData:getGuild():getGuildApplicationListBySort()
	if #self._guildApplicationList == 0 then
		self._listItemSource:setVisible(false)
		self._textTip:setVisible(true)
		--self._imageRoot:setVisible(false)
	else
		self._textTip:setVisible(false)
		self._listItemSource:setVisible(true)
		--self._imageRoot:setVisible(true)
		self._listItemSource:clearAll()
		self._listItemSource:resize(#self._guildApplicationList)
	end
end

function GuildCheckApplicationNode:_onItemUpdate(item, index)
	if self._guildApplicationList[index + 1] then
		item:update(self._guildApplicationList[index + 1])
	end
end

function GuildCheckApplicationNode:_onItemSelected(item, index)
	
end

function GuildCheckApplicationNode:_onItemTouch(index, type)
	local data = self._guildApplicationList[index + 1]
	local id = data:getUid()
	if type == GuildConst.GUILD_CHECK_APPLICATION_OP1 then
		if self._curCount >= self._maxCount then
			G_Prompt:showTip(Lang.get("guild_tip_member_count_max"))
			return
		end
	end
	G_UserData:getGuild():c2sGuildCheckApplication(id, type)
end

function GuildCheckApplicationNode:_guildCheckApplicationSuccess(eventName, op, applicationId)
	G_Prompt:showTip(Lang.get("guild_tip_application_op_"..tostring(op)))
	G_UserData:getGuild():deleteApplicationDataWithId(applicationId)
	self:updateView()
end

return GuildCheckApplicationNode