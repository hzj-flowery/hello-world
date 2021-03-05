--弹出界面
--查看玩家信息弹框
local PopupBase = require("app.ui.PopupBase")
local PopupUserBaseInfo = class("PopupUserBaseInfo", PopupBase)
local TextHelper = require("app.utils.TextHelper")
local FriendConst = require("app.const.FriendConst")

PopupUserBaseInfo.COMMON_LOOK_BTN  = 1 --查看按钮
PopupUserBaseInfo.COMMON_PRIVATE_BTN  = 2 --私聊按钮
PopupUserBaseInfo.COMMON_ON_CHAT_BTN  = 3 --拉黑按钮
PopupUserBaseInfo.COMMON_PK_BTN  = 4 --切磋按钮
PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN  = 5 --添加好友按钮
PopupUserBaseInfo.COMMON_DEL_ENEMY_BTN  = 6 --删除仇人
PopupUserBaseInfo.COMMON_CREATE_TEAM  = 7 --组建队伍

PopupUserBaseInfo.BTN_NUM  = 7 --按钮数量

function PopupUserBaseInfo:ctor( callback )
	self._title = Lang.get("common_title_look_player_info")
	self._callback = callback
--================================
--自动绑定UI名称
	self._commonNodeBk = nil --通用背景框
	self._commonIcon = nil
	self._commonPlayerName  = nil
	self._commonBtn1 = nil
	self._commonBtn2 = nil
	self._commonBtn3 = nil
	self._commonBtn4 = nil
	self._commonBtn5 = nil
	self._commonBtn6 = nil
--================================
	local resource = {
		file = Path.getCSB("PopupUserBaseInfo", "common"),
		binding = {
		}
	}
	PopupUserBaseInfo.super.ctor(self, resource)
end

--
function PopupUserBaseInfo:onCreate()
	-- button

    self._commonNodeBk:setTitle(self._title)
	self._commonNodeBk:hideBtnBg()
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))

    self._commonNodeBk2:setTitle(self._title)
	self._commonNodeBk2:hideBtnBg()
	self._commonNodeBk2:addCloseEventListener(handler(self, self.onBtnCancel))
end



function PopupUserBaseInfo:onEnter()
	self._signalAddFriend = G_SignalManager:add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(self, self._onAddFriendSuccess))
	self._signalDelFriend = G_SignalManager:add(SignalConst.EVENT_DEL_FRIEND_SUCCESS, handler(self, self._onDelFriendSuccess))
	self._signalDelEnemy = G_SignalManager:add(SignalConst.EVENT_DEL_ENEMY_SUCCESS, handler(self, self._onDelEnemySuccess))
end

function PopupUserBaseInfo:onExit()
	self._signalAddFriend:remove()
	self._signalAddFriend = nil

	self._signalDelFriend:remove()
	self._signalDelFriend = nil

	self._signalDelEnemy:remove()
	self._signalDelEnemy = nil
end


--[[
	message S2C_GetUserBaseInfo {
	optional uint32 ret = 1;
	optional uint32 base_id = 2;
	optional string name = 3;
	optional uint32 office_level = 4;
	optional uint32 level = 5;
	optional uint32 power = 6;
	optional string guild_name = 7;
}
]]
function PopupUserBaseInfo:updateUI(simpleUser)
	self._simpleUser = simpleUser

	local guildName = simpleUser.guildName
	if simpleUser.guildName == nil or simpleUser.guildName == "" then
		guildName = Lang.get("common_text_no")
	end

	--local baseId = nil
	--local limitLevel = nil
	local UserDataHelper = require("app.utils.UserDataHelper")
	--dump(simpleUser)
	local baseId,avatarTable = UserDataHelper.convertAvatarId(simpleUser)
	local head_frame_id = rawget(simpleUser,"head_frame_id") or 1 
	self._commonIcon:updateIcon(avatarTable, nil, head_frame_id)

	--self._commonHeadFrame:updateUI(head_frame_id,self._commonIcon:getScale())
	self._commonPlayerName:updateUI(simpleUser.name, simpleUser.officeLevel)

	local function updateNodeValue(node, value)
		node:updateLabel("Text_value", value)
	end

	updateNodeValue( self:getSubNodeByName("Node_1"), simpleUser.level)
	updateNodeValue( self:getSubNodeByName("Node_2"), TextHelper.getAmountText(simpleUser.power) )
	updateNodeValue( self:getSubNodeByName("Node_3"), guildName )

	local btnData = {}



	table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_LOOK_BTN,name = Lang.get("common_btn_look_team"),event = handler(self, self.onCommonBtnClick),highlight = true})
	table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_PRIVATE_BTN,name = Lang.get("common_btn_private_chat"),event = handler(self, self.onCommonBtnClick),highlight = true})

	
	if G_UserData:getFriend():isUserIdInFriendList(simpleUser.userId) then
		table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN,name = Lang.get("common_btn_delete_friend"),event = handler(self, self.onCommonBtnClick),highlight = false})
	else
		table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN,name = Lang.get("common_btn_add_friend"),event = handler(self, self.onCommonBtnClick),highlight = false})
	end

	if G_UserData:getFriend():isUserIdInBlackList(simpleUser.userId) then
		table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_ON_CHAT_BTN,name = Lang.get("common_btn_leave_black_list"),event = handler(self, self.onCommonBtnClick),highlight = true})
	else
		table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_ON_CHAT_BTN,name = Lang.get("common_btn_go_black_list"),event = handler(self, self.onCommonBtnClick),highlight = true})
	end



	table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_PK_BTN,name = Lang.get("common_btn_pk_target"),event = handler(self, self.onCommonBtnClick),highlight = true})



	if G_UserData:getEnemy():isUserIdInEnemysList(simpleUser.userId) then
		table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_DEL_ENEMY_BTN,name = Lang.get("common_btn_del_enemy"),event = handler(self, self.onCommonBtnClick),highlight = true})
	end


	if require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_GROUPS) then
		table.insert(btnData,{btnId = PopupUserBaseInfo.COMMON_CREATE_TEAM,name = Lang.get("common_btn_create_team"),event = handler(self, self.onCommonBtnClick),highlight = true})
	end

	for k = 1,PopupUserBaseInfo.BTN_NUM,1 do
		local button = self["_commonBtn"..k]
		button:setVisible(false)
	end
	
	for k,v in ipairs(btnData) do
		local button = self["_commonBtn"..k]
		button:setString(v.name)
		button:addClickEventListenerEx(v.event)
		button:enableHighLightStyle(v.highlight)
		button:setButtonTag(v.btnId)
		button:setVisible(true)
	end


	if #btnData > 6 then
		self._panelInfo:setPositionY(37)
		self._commonNodeBk:setVisible(false)
		self._commonNodeBk2:setVisible(true)
		self._commonNodeBk:setCloseVisible(false)
		self._commonNodeBk2:setCloseVisible(true)
	else
		self._panelInfo:setPositionY(0)
		self._commonNodeBk:setVisible(true)
		self._commonNodeBk2:setVisible(false)	
		self._commonNodeBk:setCloseVisible(true)
		self._commonNodeBk2:setCloseVisible(false)
	end

end

function PopupUserBaseInfo:onCommonBtnClick(sender)
	if not self._simpleUser then
		return
	end

	local simpleUser = self._simpleUser
	local btnIndex = sender:getTag()
	if btnIndex == PopupUserBaseInfo.COMMON_LOOK_BTN then --查看
		G_UserData:getBase():c2sGetUserDetailInfo(simpleUser.userId)
	end

	if btnIndex == PopupUserBaseInfo.COMMON_PRIVATE_BTN then --私聊
		--G_UserData:getBase():c2sGetUserDetailInfo(simpleUser.userId)
		local ChatConst = require("app.const.ChatConst")
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.chatMsgSendCheck(ChatConst.CHANNEL_PRIVATE,true,true) then
			return
		end

		
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		local chatPlayerData = require("app.data.ChatPlayerData").new()
		chatPlayerData:setDataBySimpleUser(simpleUser)
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT,{ChatConst.CHANNEL_PRIVATE,chatPlayerData} )

		--点击私聊后，窗口关闭
		self:close()

		--G_Prompt:showTip(Lang.get("mission_function_not_open"))
		return
	end


	if btnIndex == PopupUserBaseInfo.COMMON_PK_BTN then --切磋
		local sceneName = G_SceneManager:getRunningScene():getName()
		if sceneName == "fight" then
			G_Prompt:showTip(Lang.get("chat_pk_hint_when_infight"))
		elseif sceneName == "guildTrain" and not G_UserData:getGuild():getTrainEndState() then
            G_Prompt:showTipOnTop(Lang.get("chat_pk_when_train"))
		else
			G_UserData:getBase():c2sPractice(simpleUser.userId)
		end
	end
	if btnIndex == PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN then --添加好友
		if G_UserData:getFriend():isUserIdInFriendList(simpleUser.userId) then
			local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_delete_friend"),
							Lang.get("lang_friend_delete_tips", {name = simpleUser.name}), function()
								G_UserData:getFriend():c2sDelFriend(simpleUser.userId, FriendConst.FRIEND_DEL_FRIEND_TYPE)
							end)
			popupAlert:openWithAction()
		else
			if G_UserData:getFriend():isUserIdInBlackList(simpleUser.userId) then
				G_Prompt:showTip(Lang.get("lang_friend_add_friend_leave_black_tip"))
				return
			end
			G_UserData:getFriend():c2sAddFriend(simpleUser.name, FriendConst.FRIEND_ADD_FRIEND_TYPE)
		end
	end


	if btnIndex == PopupUserBaseInfo.COMMON_ON_CHAT_BTN then --拉黑
		if G_UserData:getFriend():isUserIdInBlackList(simpleUser.userId) then
			G_UserData:getFriend():c2sDelFriend(simpleUser.userId, FriendConst.FRIEND_DEL_BLACK_TYPE)
		else
			if G_UserData:getFriend():isUserIdInFriendList(simpleUser.userId) then
				local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_go_black_list"),
								Lang.get("lang_friend_black_tips2", {name = simpleUser.name}), function()
									G_UserData:getFriend():c2sAddFriend(simpleUser.name, FriendConst.FRIEND_ADD_BLACK_TYPE)
								end)
				popupAlert:openWithAction()
			else
				local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_go_black_list"),
								Lang.get("lang_friend_black_tips1", {name = simpleUser.name}), function()
									G_UserData:getFriend():c2sAddFriend(simpleUser.name, FriendConst.FRIEND_ADD_BLACK_TYPE)
								end)
				popupAlert:openWithAction()
			end
		end
	end

	if btnIndex == PopupUserBaseInfo.COMMON_DEL_ENEMY_BTN then
		local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_del_enemy"),
						Lang.get("lang_friend_enemy_delete_tip", {name = simpleUser.name}), function()
							G_UserData:getEnemy():c2sDelEnemy(simpleUser.userId)
						end)
		popupAlert:openWithAction()
	end

	if btnIndex == PopupUserBaseInfo.COMMON_CREATE_TEAM then
		logWarn("PopupUserBaseInfo ------------- COMMON_CREATE_TEAM ")
		if G_UserData:getGroups():getMyGroupData() then
			G_UserData:getGroups():getMyGroupData():c2sInviteJoinTeam(simpleUser.userId)
		else
			G_Prompt:showTip(Lang.get("groups_tips_25"))
		end
	end
end

function PopupUserBaseInfo:onBtnCancel()
	self:close()
end


function PopupUserBaseInfo:_onAddFriendSuccess(event, message)

	local friend_type = rawget(message, "friend_type")
	if friend_type then
		if friend_type == FriendConst.FRIEND_ADD_FRIEND_TYPE then
			G_Prompt:showTip(Lang.get("lang_friend_apply_success_tip"))
		else
			G_Prompt:showTip(Lang.get("lang_friend_black_success_tip"))
		end
		self:updateUI(self._simpleUser)
	end
end

function PopupUserBaseInfo:_onDelFriendSuccess(event, message)
	local friend_type = rawget(message, "friend_type")
	if friend_type then
		if friend_type == FriendConst.FRIEND_DEL_FRIEND_TYPE then
			G_Prompt:showTip(Lang.get("lang_friend_delete_success_tip"))
			self:close()
			return
		else
			G_Prompt:showTip(Lang.get("lang_friend_del_black_success_tip"))
		end
		self:updateUI(self._simpleUser)
	end
end

function PopupUserBaseInfo:_onDelEnemySuccess()
	-- self:updateUI(self._simpleUser)
	self:close()
end
return PopupUserBaseInfo
