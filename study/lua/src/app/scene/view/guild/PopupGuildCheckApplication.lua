
local PopupBase = require("app.ui.PopupBase")
local PopupGuildCheckApplication = class("PopupGuildCheckApplication", PopupBase)
local GuildCheckApplicationCell = require("app.scene.view.guild.GuildCheckApplicationCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildConst = require("app.const.GuildConst")

function PopupGuildCheckApplication:ctor()
	local resource = {
		file = Path.getCSB("PopupGuildCheckApplication", "guild"),
		binding = {
			_buttonRefuseAll = {
				events = {{event = "touch", method = "_onButtonRefuseAll"}}
			},
		}
	}
	PopupGuildCheckApplication.super.ctor(self, resource, false)
end



function PopupGuildCheckApplication:onCreate()
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))
	self._panelBg:setTitle(Lang.get("guild_check_application_pop_title"))
	self._textTip:setString(Lang.get("guild_tip_no_application"))
	self._listItemSource:setTemplate(GuildCheckApplicationCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))

	self._buttonRefuseAll:setString(Lang.get("guild_btn_refuse_all"))
end

function PopupGuildCheckApplication:onEnter()
	self._signalGuildGetApplication = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_APPLICATION, handler(self, self._onEventGuildGetApplication))
	self._signalGuildCheckApplication = G_SignalManager:add(SignalConst.EVENT_GUILD_CHECK_APPLICATION_SUCCESS, handler(self, self._onEventGuildCheckApplicationSuccess))


	local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()

	self:updateView()

end

function PopupGuildCheckApplication:onExit()
	self._signalGuildGetApplication:remove()
	self._signalGuildGetApplication = nil
	self._signalGuildCheckApplication:remove()
	self._signalGuildCheckApplication = nil
end

function PopupGuildCheckApplication:updateView()
	G_UserData:getGuild():c2sGetGuildApplication()
end

function PopupGuildCheckApplication:_updateInfo()
	self:_updateList()

	local myGuild = G_UserData:getGuild():getMyGuild()
	local level = G_UserData:getGuild():getMyGuildLevel()
	self._curCount = G_UserData:getGuild():getGuildMemberCount()
	self._maxCount = UserDataHelper.getGuildMaxMember(level)
	self._textCount:setString(Lang.get("guild_txt_member_count", {count1 = self._curCount, count2 = self._maxCount}))
end

function PopupGuildCheckApplication:_updateList()
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

function PopupGuildCheckApplication:_onItemUpdate(item, index)
	if self._guildApplicationList[index + 1] then
		item:update(self._guildApplicationList[index + 1])
	end
end

function PopupGuildCheckApplication:_onItemSelected(item, index)
	
end

function PopupGuildCheckApplication:_onItemTouch(index, type)
	local data = self._guildApplicationList[index + 1]
	local id = data:getUid()
	if type == GuildConst.GUILD_CHECK_APPLICATION_OP1 then
		local isGuildWarRunning = G_UserData:getLimitTimeActivity():isActivityOpen(FunctionConst.FUNC_GUILD_WAR)
		if isGuildWarRunning then
			G_Prompt:showTip(Lang.get("guild_tip_approval_forbid_when_guildwar"))
			return 
		end
		if self._curCount >= self._maxCount then
			G_Prompt:showTip(Lang.get("guild_tip_member_count_max"))
			return
		end
	end



	G_UserData:getGuild():c2sGuildCheckApplication(id, type)
end

function PopupGuildCheckApplication:_onEventGuildCheckApplicationSuccess(eventName, op, applicationId)
	G_Prompt:showTip(Lang.get("guild_tip_application_op_"..tostring(op)))
	G_UserData:getGuild():deleteApplicationDataWithId(applicationId)
	self:updateView()
end

function PopupGuildCheckApplication:_onEventGuildGetApplication(eventName)
	self:_updateInfo()
end


function PopupGuildCheckApplication:_onClickClose()
	self:close()
end

function PopupGuildCheckApplication:_onButtonRefuseAll(render)
	local count = G_UserData:getGuild():getGuildMemberCount()
	if count <= 0 then
		return
	end
	G_UserData:getGuild():c2sGuildCheckApplication(0, GuildConst.GUILD_CHECK_APPLICATION_OP2)
end

return PopupGuildCheckApplication
