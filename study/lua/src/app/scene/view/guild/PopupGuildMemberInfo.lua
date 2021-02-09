--
-- Author: Liangxu
-- Date: 2017-06-26 15:09:50
-- 军团成员信息
local PopupBase = require("app.ui.PopupBase")
local PopupGuildMemberInfo = class("PopupGuildMemberInfo", PopupBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")
local GuildConst = require("app.const.GuildConst")
local PopupGuildAppoint = require("app.scene.view.guild.PopupGuildAppoint")
local PopupSystemAlert = require("app.ui.PopupSystemAlert")
local ParameterIDConst = require("app.const.ParameterIDConst")

PopupGuildMemberInfo.HERO_NUM = 6


function PopupGuildMemberInfo:ctor(data)
	self._data = data

	self._commonBtn1 = nil
	self._commonBtn2 = nil
	self._commonBtn3 = nil
	self._commonBtn4 = nil
	self._commonBtn5 = nil

	local resource = {
		file = Path.getCSB("PopupGuildMemberInfo", "guild"),
		binding = {
			_commonBtn1 = {
				events = {{event = "touch", method = "_onButtonSeeUserDetail"}}
			},
			_commonBtn2 = {
				events = {{event = "touch", method = "_onButtonPrivateChat"}}
			},
			_commonBtn3 = {
				events = {{event = "touch", method = "_onButtonAddBlackList"}}
			},
			_commonBtn4 = {
				events = {{event = "touch", method = "_onButtonBattle"}}
			},
			_commonBtn5 = {
				events = {{event = "touch", method = "_onButtonAddFriend"}}
			},
		}
	}
	PopupGuildMemberInfo.super.ctor(self, resource)
end

function PopupGuildMemberInfo:onCreate()
	self._panelBg:setTitle(Lang.get("guild_title_member_info"))
	self._panelBg:addCloseEventListener(handler(self, self._onClickClose))


	self._commonBtn1:setString(Lang.get("common_btn_look_team"))
	self._commonBtn2:setString(Lang.get("common_btn_private_chat"))
	self._commonBtn3:setString(Lang.get("common_btn_go_black_list"))
	self._commonBtn4:setString(Lang.get("common_btn_pk_target"))
	self._commonBtn5:setString(Lang.get("common_btn_add_friend"))

end

function PopupGuildMemberInfo:onEnter()
	self._signalLeaveSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_LEAVE_SUCCESS, handler(self, self._onEventGuildLeaveSuccess))
	self._signalKickSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(self, self._onEventGuildKickNotice))
	self._signalImpeachSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_IMPEACHMENT_LEADER_SUCCESS, handler(self, self._onEventGuildImpeachSuccess))


	self._signalGuildUserPositionChange = G_SignalManager:add(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE, handler(self, self._onEventGuildUserPositionChange))
	self._signalPromoteSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, handler(self, self._onEventGuildPromoteSuccess))
	
	self._signalAddFriend = G_SignalManager:add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(self, self._onAddFriendSuccess))
	self._signalDelFriend = G_SignalManager:add(SignalConst.EVENT_DEL_FRIEND_SUCCESS, handler(self, self._onDelFriendSuccess))

	local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()

	self:_updateInfo()
	self:_updateButtonState()
	self:_updateMiddleBtns(self._data:getUid())
end

function PopupGuildMemberInfo:onExit()
	self._signalLeaveSuccess:remove()
	self._signalLeaveSuccess = nil
	self._signalKickSuccess:remove()
	self._signalKickSuccess = nil
	self._signalImpeachSuccess:remove()
	self._signalImpeachSuccess = nil

	self._signalGuildUserPositionChange:remove()
	self._signalGuildUserPositionChange = nil
	self._signalPromoteSuccess:remove()
	self._signalPromoteSuccess = nil

	self._signalAddFriend:remove()
	self._signalAddFriend = nil

	self._signalDelFriend:remove()
	self._signalDelFriend = nil
end

function PopupGuildMemberInfo:_updateInfo()
	local heroBaseId = self._data:getPlayer_info().covertId

 	assert(heroBaseId ~= 0 , string.format("Could not find the base_id for member data: %s %d %d",self._data:getName(),self._data:getBase_id(),self._data:getAvatar()))

	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
	local heroName = self._data:getName()
	local level = self._data:getLevel()
	local position = self._data:getPosition()
	local duties = UserDataHelper.getGuildDutiesName(position)
	local power = TextHelper.getAmountText1(self._data:getPower())
	local contribution = TextHelper.getAmountText1(self._data:getWeek_contribution())
	local onlineText, color = UserDataHelper.getOnlineText(self._data:getOffline())
	local officialName, officialColor,officialInfo = UserDataHelper.getOfficialInfo(self._data:getOfficer_level())

	--dump(self._data)
	self._fileNodeIcon:updateIcon(self._data:getPlayer_info(), nil, self._data:getHead_frame_id())
	self._textName:setString(heroName)
	self._textName:setColor(officialColor)
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, self._data:getOfficer_level())
	self._textLevel:setString(level)
	self._textDuties:setString(duties)
	self._textPower:setString(power)
	self._textContribution:setString(tostring(contribution))
	self._textOnline:setString(onlineText)
	self._textOnline:setColor(color)

	self._imageOfficial:loadTexture(Path.getTextHero(officialInfo.picture))
	self._imageOfficial:ignoreContentAdaptWithSize(true)


	local heroList = self._data:getHeros()
	--dump(heroList)
	for i = 1,PopupGuildMemberInfo.HERO_NUM,1 do
		local fileNodeIcon = self["_fileNodeIcon"..i]
		local formationHeroBaseId = i == 1 and heroBaseId or heroList[i]
		if fileNodeIcon and formationHeroBaseId and formationHeroBaseId ~= 0 then
			fileNodeIcon:setVisible(true)
			fileNodeIcon:updateUI(formationHeroBaseId)
		elseif fileNodeIcon then
			fileNodeIcon:setVisible(false)
		end
	end
	
end

function PopupGuildMemberInfo:_updateButtonState()
	
	local btnData = {}
	local isSelf = self._data:isSelf()
	if isSelf then
		 logError("should not run here!")
		--table.insert(btnData,{name = Lang.get("guild_btn_quit"),event = handler(self, self._onQuit),highlight = false})
		--table.insert(btnData,{name = Lang.get("guild_btn_dissolve"),event = handler(self, self._onDissolve),highlight = true})
	else
		-- 任命、踢出、弹劾

		local userInfo = G_UserData:getGuild():getMyMemberData()

		assert(userInfo, "PopupGuildMemberInfo _updateButtonState not find userInfo ")

		local userPosition = userInfo:getPosition()
		local position = self._data:getPosition()

		local canImpeach = UserDataHelper.isHaveJurisdiction(userPosition,GuildConst.GUILD_JURISDICTION_9)
		local canAppoint = UserDataHelper.isHaveJurisdiction(userPosition,GuildConst.GUILD_JURISDICTION_3)
		local canExpel = UserDataHelper.isHaveJurisdiction(userPosition,GuildConst.GUILD_JURISDICTION_5)

		if userPosition == GuildConst.GUILD_POSITION_1 then --团长
			
			if canAppoint then
				table.insert(btnData,{name = Lang.get("guild_btn_appoint"),event = handler(self, self._onAppoint),highlight = false})
			end

			if canExpel then
				table.insert(btnData,{name = Lang.get("guild_btn_expel"),event = handler(self, self._onExpel),highlight = false})
			end
			
		elseif userPosition == GuildConst.GUILD_POSITION_2 then --副团长
			if position == GuildConst.GUILD_POSITION_1 then
				if canImpeach then
					table.insert(btnData,{name = Lang.get("guild_btn_impeach"),event = handler(self, self._onImpeach),highlight = false})
				end
					
			elseif position == GuildConst.GUILD_POSITION_2 then
				logError("should not run here!")
			else
				if canExpel then
					table.insert(btnData,{name = Lang.get("guild_btn_expel"),event = handler(self, self._onExpel),highlight = false})
				end
			end
		elseif userPosition == GuildConst.GUILD_POSITION_3 then --长老
			if position == GuildConst.GUILD_POSITION_1 then

				if canImpeach then
					table.insert(btnData,{name = Lang.get("guild_btn_impeach"),event = handler(self, self._onImpeach),highlight = false})
				end
				
			elseif position == GuildConst.GUILD_POSITION_2 or position == GuildConst.GUILD_POSITION_3 then
	
			else
				if canExpel then
					table.insert(btnData,{name = Lang.get("guild_btn_expel"),event = handler(self, self._onExpel),highlight = false})
				end
			end

		else --成员
			if position == GuildConst.GUILD_POSITION_1 then
				if canImpeach then
					table.insert(btnData,{name = Lang.get("guild_btn_impeach"),event = handler(self, self._onImpeach),highlight = false})
				end
			end
			
		end
	end
	local btnCount = #btnData --按钮数量
	if btnCount == 0 then
		self._button1:setVisible(false)
		self._button2:setVisible(false)
		self._button3:setVisible(false)
	elseif btnCount == 1 then
		self._button1:setVisible(true)
		self._button2:setVisible(false)
		self._button3:setVisible(false)
		--self._button1:setPositionX(0)
	elseif btnCount == 2  then	
		self._button1:setVisible(true)
		self._button2:setVisible(true)
		self._button3:setVisible(false)
		--self._button1:setPositionX(-111)
		--self._button2:setPositionX(111)
	elseif btnCount == 3  then	
		self._button1:setVisible(true)
		self._button2:setVisible(true)
		self._button3:setVisible(true)
		--self._button1:setPositionX(-171)
		--self._button2:setPositionX(0)
		--self._button3:setPositionX(171)
	end
	for k,v in ipairs(btnData) do
		local button = self["_button"..k]
		button:setString(v.name)
		button:addClickEventListenerEx(v.event)
		button:enableHighLightStyle(v.highlight)
	end
end

function PopupGuildMemberInfo:_updateMiddleBtns(uid)
	if G_UserData:getFriend():isUserIdInFriendList(uid) then
		self._commonBtn5:setString(Lang.get("common_btn_delete_friend"))
	else
		self._commonBtn5:setString(Lang.get("common_btn_add_friend"))
	end

	if G_UserData:getFriend():isUserIdInBlackList(uid) then

		self._commonBtn3:setString(Lang.get("common_btn_leave_black_list"))
	else
		self._commonBtn3:setString(Lang.get("common_btn_go_black_list"))
	end
end

function PopupGuildMemberInfo:_onClickClose()
	self:close()
end

--查看
function PopupGuildMemberInfo:_onButtonSeek()
	G_UserData:getBase():c2sGetUserBaseInfo(self._data:getUid())
end

--退出
function PopupGuildMemberInfo:_onQuit()
	local position = self._data:getPosition()
	if position == GuildConst.GUILD_POSITION_1 then
		G_Prompt:showTip(Lang.get("guild_tip_leader_can_not_quit"))
		return
	end

	local time = self._data:getTime()
	if not UserDataHelper.checkCanQuitGuild(time) then
		return
	end

	local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_QUIT_CD_ID).content)
	local timeStr = G_ServerTime:getDayOrHourOrMinFormat(timeLimit)
	local content = Lang.get("guild_appoint_confirm_leave_des", {time = timeStr})
	local title = Lang.get("guild_appoint_confirm_title")
	local function callbackOK()
		G_UserData:getGuild():c2sGuildLeave()
	end

	local popup = PopupSystemAlert.new(title, content, callbackOK)
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
end

--解散
function PopupGuildMemberInfo:_onDissolve()
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
end

--任命
function PopupGuildMemberInfo:_onAppoint()
	local popup = PopupGuildAppoint.new(self._data:getUid(), self._data:getPosition())
	popup:openWithAction()
end


--踢出
function PopupGuildMemberInfo:_onExpel()
	local time = self._data:getTime()
	if not UserDataHelper.checkCanExpelGuild(time) then
		return
	end

	local myGuild = G_UserData:getGuild():getMyGuild()
	if not myGuild then
		return
	end
	local remainCount =  UserDataHelper.getParameter(ParameterIDConst.GUILD_MAXKICK_TIMES)  - myGuild:getKick_member_cnt()
	local popupAlert = require("app.ui.PopupAlert").new(nil,
		Lang.get("guild_kick_dialog_txt", {value = remainCount}), function()
			assert(self._data,"PopupGuildMemberInfo text _data nil value")
			G_UserData:getGuild():c2sGuildKick(self._data:getUid())
		end)
	popupAlert:openWithAction()
	 
	
	--G_UserData:getGuild():c2sGuildKick(self._data:getUid())
end

--弹劾
function PopupGuildMemberInfo:_onImpeach()
	local offline = self._data:getOffline()
	if not UserDataHelper.checkCanImpeach(offline) then
		return
	end

	G_UserData:getGuild():c2sLeaderImpeachment()
end


function PopupGuildMemberInfo:_onButtonSeeUserDetail(sender)
	local uid = self._data:getUid()
	G_UserData:getBase():c2sGetUserDetailInfo(uid)
end


function PopupGuildMemberInfo:_onButtonPrivateChat(sender)

	local ChatConst = require("app.const.ChatConst")
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	local chatPlayerData = require("app.data.ChatPlayerData").new()
	chatPlayerData:setDataByGuildMemberData(self._data)
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT,{ChatConst.CHANNEL_PRIVATE,chatPlayerData} )

	--点击私聊后，窗口关闭
	self:close()
end


function PopupGuildMemberInfo:_onButtonBattle(sender)
	local uid = self._data:getUid()
	local sceneName = G_SceneManager:getRunningScene():getName()
	if sceneName == "fight" then
		G_Prompt:showTip(Lang.get("chat_pk_hint_when_infight"))
	else
		G_UserData:getBase():c2sPractice(uid)
	end

end

function PopupGuildMemberInfo:_onButtonAddFriend(sender)
	local FriendConst = require("app.const.FriendConst")
	local uid = self._data:getUid()
	local name = self._data:getName()
	if G_UserData:getFriend():isUserIdInFriendList(uid) then
		local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_delete_friend"),
						Lang.get("lang_friend_delete_tips", {name = name}), function()
							G_UserData:getFriend():c2sDelFriend(uid, FriendConst.FRIEND_DEL_FRIEND_TYPE)
						end)
		popupAlert:openWithAction()
	else
		if G_UserData:getFriend():isUserIdInBlackList(uid) then
			G_Prompt:showTip(Lang.get("lang_friend_add_friend_leave_black_tip"))
			return
		end
		G_UserData:getFriend():c2sAddFriend(name, FriendConst.FRIEND_ADD_FRIEND_TYPE)
	end

end


function PopupGuildMemberInfo:_onButtonAddBlackList(sender)
	local FriendConst = require("app.const.FriendConst")
	local uid = self._data:getUid()
	local name = self._data:getName()

	if G_UserData:getFriend():isUserIdInBlackList(uid) then
		G_UserData:getFriend():c2sDelFriend(uid, FriendConst.FRIEND_DEL_BLACK_TYPE)
	else
		if G_UserData:getFriend():isUserIdInFriendList(uid) then
			local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_go_black_list"),
							Lang.get("lang_friend_black_tips2", {name = name}), function()
								G_UserData:getFriend():c2sAddFriend(name, FriendConst.FRIEND_ADD_BLACK_TYPE)
							end)
			popupAlert:openWithAction()
		else
			local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_go_black_list"),
							Lang.get("lang_friend_black_tips1", {name = name}), function()
								G_UserData:getFriend():c2sAddFriend(name, FriendConst.FRIEND_ADD_BLACK_TYPE)
							end)
			popupAlert:openWithAction()
		end
	end
end

--任命完成回调
function PopupGuildMemberInfo:refreshData()
	local uid =  self._data:getUid()
	local data = G_UserData:getGuild():getGuildMemberDataWithId(uid)
	if data then
		self._data = data
	end
	self:_updateInfo()
	self:_updateButtonState()
	self:_updateMiddleBtns(self._data:getUid())
end


--退会成功
function PopupGuildMemberInfo:_onEventGuildLeaveSuccess()
	G_SceneManager:popScene()
	local function showTips()
		local timeLimit = UserDataHelper.getParameter(ParameterIDConst.GUILD_QUIT_CD_ID)
		local timeStr = G_ServerTime:getDayOrHourOrMinFormat(timeLimit)
		G_Prompt:showTip(Lang.get("guild_quit_hint", {time = timeStr}))
	end
	local scheduler = require("cocos.framework.scheduler")
	scheduler.performWithDelayGlobal(function()
		showTips()
    end, 0.3)
end

--踢人成功
function PopupGuildMemberInfo:_onEventGuildKickNotice(eventName, uid)
	if uid ~= G_UserData:getBase():getId() then
		G_Prompt:showTip(Lang.get("guild_tip_expel_success"))
		self:close()
	end
end

--发起弹劾成功
function PopupGuildMemberInfo:_onEventGuildImpeachSuccess()
	G_Prompt:showTip(Lang.get("guild_tip_impeach_success"))
end

function PopupGuildMemberInfo:_onEventGuildUserPositionChange(eventName, uid)
	self:refreshData()
end

function PopupGuildMemberInfo:_onEventGuildPromoteSuccess(eventName, uid, op)
	self:refreshData()
end

--解散成功
function PopupGuildMemberInfo:_onEventGuildDismissSuccess()
	G_Prompt:showTip(Lang.get("guild_tip_dismiss_success"))
	G_SceneManager:popScene()
end

function PopupGuildMemberInfo:_onAddFriendSuccess(event, message)
	local FriendConst = require("app.const.FriendConst")
	local friend_type = rawget(message, "friend_type")
	if friend_type then
		if friend_type == FriendConst.FRIEND_ADD_FRIEND_TYPE then
			G_Prompt:showTip(Lang.get("lang_friend_apply_success_tip"))
		else
			G_Prompt:showTip(Lang.get("lang_friend_black_success_tip"))
		end
		self:refreshData()
	end
end

function PopupGuildMemberInfo:_onDelFriendSuccess(event, message)
	local FriendConst = require("app.const.FriendConst")
	local friend_type = rawget(message, "friend_type")
	if friend_type then
		if friend_type == FriendConst.FRIEND_DEL_FRIEND_TYPE then
			G_Prompt:showTip(Lang.get("lang_friend_delete_success_tip"))
		else
			G_Prompt:showTip(Lang.get("lang_friend_del_black_success_tip"))
		end
		self:refreshData()
	end
end

return PopupGuildMemberInfo