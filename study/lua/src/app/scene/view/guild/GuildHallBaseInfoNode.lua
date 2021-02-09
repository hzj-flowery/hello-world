--
-- Author: Liangxu
-- Date: 2017-06-22 14:10:42
-- 军团大厅基本信息
local ViewBase = require("app.ui.ViewBase")
local GuildHallBaseInfoNode = class("GuildHallBaseInfoNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local PopupGuildAnnouncement = require("app.scene.view.guild.PopupGuildAnnouncement")
local GuildConst = require("app.const.GuildConst")
local PopupSystemAlert = require("app.ui.PopupSystemAlert")
local ParameterIDConst = require("app.const.ParameterIDConst")
local TextHelper = require("app.utils.TextHelper")
local GuildTaskItemCell = require("app.scene.view.guild.GuildTaskItemCell")
local GuildTaskBoxNodeHelper = require("app.scene.view.guild.GuildTaskBoxNodeHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function GuildHallBaseInfoNode:ctor()
	self._listItemSource2 = nil
	self._taskBoxHelper = nil
	self._imageNameBg = nil
	local resource = {
		file = Path.getCSB("GuildHallBaseInfoNode", "guild"),
		binding = {
			_buttonLogout = {
				events = {{event = "touch", method = "_onButtonLogout"}}
			},
			_buttonModifyAnnouncement = {
				events = {{event = "touch", method = "_onButtonModifyAnnouncement"}}
			},
			_buttonModifyDeclaration = {
				events = {{event = "touch", method = "_onButtonModifyDeclaration"}}
			},
			_imageNameBg = {
				events = {{event = "touch", method = "_onButtonModifyName"}}	
			},
		}
	}
	GuildHallBaseInfoNode.super.ctor(self, resource)
end

function GuildHallBaseInfoNode:onCreate()
	--self._buttonModifyAnnouncement:setString(Lang.get("guild_btn_modify"))
	--self._buttonModifyDeclaration:setString(Lang.get("guild_btn_modify"))
	self._listItemSource2:setTemplate(GuildTaskItemCell)
	self._listItemSource2:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource2:setCustomCallback(handler(self, self._onItemTouch))

	self._taskBoxHelper = GuildTaskBoxNodeHelper.new(self._boxNode)
end

function GuildHallBaseInfoNode:onEnter()
	self._signalGuildBaseInfoUpdate = G_SignalManager:add(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE, handler(self, self._onEventGuildBaseInfoUpdate))
	self._signalSetGuildMessage = G_SignalManager:add(SignalConst.EVENT_GUILD_SET_MESSAGE_SUCCESS, handler(self, self._onEventSetGuildMessage))
	self._signalGuildBoxReward = G_SignalManager:add(SignalConst.EVENT_GUILD_BOX_REWARD, handler(self, self._onEventGuildBoxReward))
	self._signalGuildNameChange = G_SignalManager:add(SignalConst.EVENT_GUILD_NAME_CHANGE, handler(self, self._onEventGuildNameChange))
	self._signalGuildGetUserGuild = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(self, self._onEventGuildGetUserGuild))
end

function GuildHallBaseInfoNode:onExit()
	self._signalGuildBaseInfoUpdate:remove()
	self._signalGuildBaseInfoUpdate = nil
	self._signalSetGuildMessage:remove()
	self._signalSetGuildMessage = nil

	self._signalGuildBoxReward:remove()
	self._signalGuildBoxReward = nil

	self._signalGuildNameChange:remove()
	self._signalGuildNameChange = nil
	
	self._signalGuildGetUserGuild:remove()
	self._signalGuildGetUserGuild = nil
end

function GuildHallBaseInfoNode:updateView()
	G_UserData:getGuild():c2sGetGuildBase()	
end

function GuildHallBaseInfoNode:_updateInfo()
	self._myGuild = G_UserData:getGuild():getMyGuild()
	assert(self._myGuild, "G_UserData:getGuild():getMyGuild() = nil")

	local icon = self._myGuild:getIcon()
	local iconRes = Path.getCommonIcon("guild", icon)
	local name = self._myGuild:getName()
	local level = G_UserData:getGuild():getMyGuildLevel()--self._myGuild:getLevel()
	local exp = G_UserData:getGuild():getMyGuildExp()--self._myGuild:getExp()
	local needExp = UserDataHelper.getGuildLevelUpNeedExp(level)
	local names = UserDataHelper.getGuildLeaderNames()
	local leaderName = names.leaderName or Lang.get("guild_leader_name_default")
	local mateName = names.mateName or Lang.get("guild_leader_name_default")
	local elderName = names.elderNames and names.elderNames[1] or Lang.get("guild_leader_name_default")
	local elderName2 = names.elderNames and names.elderNames[2] or Lang.get("guild_leader_name_default")
	local memberNumber = self._myGuild:getMember_num()
	local maxMember = UserDataHelper.getGuildMaxMember(level)
	local announcement = UserDataHelper.getGuildAnnouncement(self._myGuild)  
	local declaration = UserDataHelper.getGuildDeclaration(self._myGuild) 
	local guildRank = self._myGuild:getGuild_rank()

	--self._imageIcon:loadTexture(iconRes)
	self._textName:setString(name)
	self._textLevel:setString(Lang.get("guild_hall_level", {level = level}))
	self._loadingBarProgress:setPercent(exp / needExp * 100)
	self._textProgress:setString(exp.."/"..needExp)
	self._textLeaderName:setString(leaderName)
	self._textMateName:setString(mateName)
	self._textElderName:setString(elderName)
	self._textElderName2:setString(elderName2)
	self._textMemberNumber:setString(memberNumber.."/"..maxMember)
	self._textAnnouncement:setString(announcement)
	self._textDeclaration:setString(declaration)
	self._textRank:setString(tostring(guildRank))

	self:_updateBtnState()
	self:_updateList()
	self._taskBoxHelper:refreshBoxView()
end

function GuildHallBaseInfoNode:_updateBtnState()
	local userMemberData = G_UserData:getGuild():getMyMemberData()
	local myPosition = userMemberData:getPosition()
	self._canDissolve = UserDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_1) --是否有解散军团的权限
	self._canSetAnnouncement = UserDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_7) --是否能修改公告
	self._canSetDeclaration = UserDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_8) --是否能修改宣言
	self._canModifyGuildName = UserDataHelper.isHaveJurisdiction(myPosition,GuildConst.GUILD_JURISDICTION_10) --是否能修改军团名

	if self._canDissolve then
		self._buttonLogout:setString(Lang.get("guild_btn_dissolve"))
	else
		self._buttonLogout:setString(Lang.get("guild_btn_logout"))
	end
	self._buttonModifyAnnouncement:setVisible(self._canSetAnnouncement)
	self._buttonModifyDeclaration:setVisible(self._canSetDeclaration)

	self._editName:setVisible(self._canModifyGuildName)
	self._imageNameBg:setTouchEnabled(self._canModifyGuildName)
end

--退出\解散
function GuildHallBaseInfoNode:_onButtonLogout()
	if self._canDissolve then
		local count = G_UserData:getGuild():getGuildMemberCount()
		if count > 1 then
			G_Prompt:showTip(Lang.get("guild_tip_can_not_dissolve"))
			return
		end

		local function callbackOK()
			G_UserData:getGuild():c2sGuildDismiss()
		end
		local content = Lang.get("guild_dissolve_hint")
		local title = Lang.get("guild_appoint_confirm_title")
		local popup = require("app.ui.PopupAlert").new(title, content, callbackOK)
		popup:openWithAction()
	else
		local userMemberData = G_UserData:getGuild():getMyMemberData()
		local time = userMemberData:getTime()
		if not UserDataHelper.checkCanQuitGuild(time) then
			return
		end

		local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_QUIT_CD_ID).content)
		local timeStr = G_ServerTime:getDayOrHourOrMinFormat(timeLimit)
		local content = Lang.get("guild_leave_hint", {time = timeStr})
		local title = Lang.get("guild_appoint_confirm_title")
		local function callbackOK()
			G_UserData:getGuild():c2sGuildLeave()
		end

		local popup = require("app.ui.PopupAlert").new(title, content, callbackOK)
		popup:openWithAction()
	end
end

--修改公告
function GuildHallBaseInfoNode:_onButtonModifyAnnouncement()
	local popup = PopupGuildAnnouncement.new(handler(self, self._onSaveAnnouncement))
	popup:setTitle(Lang.get("guild_title_announcement"))
	local content =  UserDataHelper.getGuildAnnouncement( self._myGuild) 
	popup:setContent(content)
	popup:openWithAction()
end

--修改宣言
function GuildHallBaseInfoNode:_onButtonModifyDeclaration()
	local popup = PopupGuildAnnouncement.new(handler(self, self._onSaveDeclaration))
	popup:setTitle(Lang.get("guild_title_declaration"))
	local content = UserDataHelper.getGuildDeclaration(self._myGuild)  
	popup:setContent(content)
	popup:openWithAction()
end

--保存公告
function GuildHallBaseInfoNode:_onSaveAnnouncement(content)
	G_UserData:getGuild():c2sSetGuildMessage(content, GuildConst.GUILD_MESSAGE_TYPE_1)
end

--保存宣言
function GuildHallBaseInfoNode:_onSaveDeclaration(content)
	G_UserData:getGuild():c2sSetGuildMessage(content, GuildConst.GUILD_MESSAGE_TYPE_2)
end

function GuildHallBaseInfoNode:_onEventSetGuildMessage(eventName, type)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	if type == GuildConst.GUILD_MESSAGE_TYPE_1 then
		local content = UserDataHelper.getGuildAnnouncement() 
		self._textAnnouncement:setString(content)
		G_Prompt:showTip(Lang.get("guild_announcement_change_success"))
	elseif type == GuildConst.GUILD_MESSAGE_TYPE_2 then
		local content =  UserDataHelper.getGuildDeclaration() 
		self._textDeclaration:setString(content)
		G_Prompt:showTip(Lang.get("guild_declaration_change_success"))
	end
end

--改军团名
function GuildHallBaseInfoNode:_onButtonModifyName(sender)
	local callback = function(guildName)
		G_UserData:getGuild():c2sGuildChangeName(guildName)
	end
	local ParameterIDConst = require("app.const.ParameterIDConst")
	local PopupGuildChangeName = require("app.scene.view.guild.PopupGuildChangeName")
	local popup = PopupGuildChangeName.new()
	popup:updateUI(
		Lang.get("guild_change_name_title"),
		Lang.get("guild_change_name_hint"),
		{ type = TypeConvertHelper.TYPE_RESOURCE,value =  DataConst.RES_DIAMOND, 
		size = UserDataHelper.getParameter(ParameterIDConst.GUILD_RENAME_COST)},
		callback)
	popup:openWithAction()
	
end

--解散成功
function GuildHallBaseInfoNode:_dismissSuccess()
	G_Prompt:showTip(Lang.get("guild_tip_dismiss_success"))
	G_SceneManager:popScene()
end


function GuildHallBaseInfoNode:_updateList()
	self._guildTaskList = G_UserData:getGuild():getMyGuild():getSortedTaskDataList()
	self._listItemSource2:clearAll()
	self._listItemSource2:resize(math.ceil(#self._guildTaskList))-- 一行3个
end

function GuildHallBaseInfoNode:_onItemUpdate(item, index)
	if self._guildTaskList[index + 1] then
		item:update(self._guildTaskList[index + 1])
	end
end

function GuildHallBaseInfoNode:_onItemSelected(item, index)
end

function GuildHallBaseInfoNode:_onItemTouch(lineIndex,index)
	local data = self._guildTaskList[index + 1]
	if not data then
		return
	end
	
end

function GuildHallBaseInfoNode:_onEventGuildBoxReward(event,rewards)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	--刷新宝箱
	self._taskBoxHelper:refreshBoxView()
	if rewards then
		G_Prompt:showAwards(rewards)
	end
end

function GuildHallBaseInfoNode:_onEventGuildBaseInfoUpdate(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateInfo()
end

function GuildHallBaseInfoNode:_onEventGuildNameChange(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	G_Prompt:showTip(Lang.get("guild_tip_change_name_success"))
end

function GuildHallBaseInfoNode:_onEventGuildGetUserGuild(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateInfo()
end



return GuildHallBaseInfoNode