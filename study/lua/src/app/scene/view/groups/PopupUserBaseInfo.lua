--弹出界面
--查看玩家信息弹框
local PopupBase = require("app.ui.PopupBase")
local PopupUserBaseInfo = class("PopupUserBaseInfo", PopupBase)
local TextHelper = require("app.utils.TextHelper")
local FriendConst = require("app.const.FriendConst")

PopupUserBaseInfo.COMMON_LOOK_BTN  = 1 --查看按钮
PopupUserBaseInfo.COMMON_PRIVATE_BTN  = 2 --私聊按钮
PopupUserBaseInfo.COMMON_APPOINT_LEADER_BTN  = 3 --拉黑按钮	移交队长
PopupUserBaseInfo.COMMON_KICK_GROUP_BTN  = 4 --切磋按钮		请离队伍
PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN  = 5 --添加好友按钮
PopupUserBaseInfo.COMMON_DEL_ENEMY_BTN  = 6 --删除仇人

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
--================================
	local resource = {
		file = Path.getCSB("PopupUserBaseInfo", "groups"),
		binding = {
			_commonBtn1 = {
				events = {{event = "touch", method = "onCommonBtnClick"}}
			},
			_commonBtn2 = {
				events = {{event = "touch", method = "onCommonBtnClick"}}
			},
			_commonBtn3 = {
				events = {{event = "touch", method = "onCommonBtnClick"}}
			},
			_commonBtn4 = {
				events = {{event = "touch", method = "onCommonBtnClick"}}
			},
			_commonBtn5 = {
				events = {{event = "touch", method = "onCommonBtnClick"}}
			},
			_commonBtn6 = {
				events = {{event = "touch", method = "onCommonBtnClick"}}
			}
		}
	}
	PopupUserBaseInfo.super.ctor(self, resource)
end

--
function PopupUserBaseInfo:onCreate()
    self._commonNodeBk:setTitle(self._title)
	self._commonNodeBk:hideBtnBg()
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))

    self._commonBtn1:setString(Lang.get("common_btn_look_team"))
	self._commonBtn2:setString(Lang.get("common_btn_private_chat"))
	self._commonBtn3:setString(Lang.get("groups_menu_turn_leader"))
	self._commonBtn4:setString(Lang.get("groups_menu_out_member"))
	self._commonBtn5:setString(Lang.get("common_btn_add_friend"))
	self._commonBtn6:setString(Lang.get("common_btn_del_enemy"))
	for i = 1, 6 do
		local comBtn = self["_commonBtn"..i]
		comBtn:setButtonTag(i)
	end

	self._commonBtn4:switchToNormal()
end


function PopupUserBaseInfo:onEnter()
	self._signalAddFriend = G_SignalManager:add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(self, self._onAddFriendSuccess))
	self._signalDelFriend = G_SignalManager:add(SignalConst.EVENT_DEL_FRIEND_SUCCESS, handler(self, self._onDelFriendSuccess))
	self._signalDelEnemy = G_SignalManager:add(SignalConst.EVENT_DEL_ENEMY_SUCCESS, handler(self, self._onDelEnemySuccess))
	self._signalTransferLeader = G_SignalManager:add(SignalConst.EVENT_GROUP_TRANSFER_LEADER_SUCCESS, handler(self, self._onTransferLeaderSuccess))
	self._signalAppTransferLeader = G_SignalManager:add(SignalConst.EVENT_GROUP_REQUEST_TRANSFER_LEADER_TO_ME, handler(self, self._onAppTransferLeaderSuccess))
	
	self._signalKickUser = G_SignalManager:add(SignalConst.EVENT_GROUP_MY_GROUP_KICK_USER, handler(self, self._onKickUserSuccess))
	self._signalKickOut = G_SignalManager:add(SignalConst.EVENT_GROUP_KICK_OUT, handler(self, self._onKickOutSuccess)) --被踢出
end

function PopupUserBaseInfo:onExit()
	self._signalAddFriend:remove()
	self._signalAddFriend = nil
	self._signalDelFriend:remove()
	self._signalDelFriend = nil
	self._signalDelEnemy:remove()
	self._signalDelEnemy = nil
	self._signalTransferLeader:remove()
	self._signalTransferLeader = nil
	self._signalAppTransferLeader:remove()
	self._signalAppTransferLeader = nil
	self._signalKickUser:remove()
	self._signalKickUser = nil
	self._signalKickOut:remove()
	self._signalKickOut = nil
end

function PopupUserBaseInfo:updateUI(userData)
	self._userData = userData

	local isLeader = userData:isLeader()
	local isSelfLeader = G_UserData:getGroups():isSelfLeader()

	local guildName = userData:getGuild_name()
	if guildName == "" then
		guildName = Lang.get("common_text_no")
	end

	local baseId = userData:getBase_id()
	local avatarBaseId = userData:getAvatar_base_id()
	if avatarBaseId > 0 then
		local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
		baseId = AvatarDataHelper.getAvatarConfig(avatarBaseId).hero_id
	end

	self._commonIcon:updateUI(baseId, nil, userData:getLimitLevel())
	self._commonPlayerName:updateUI(userData:getName(), userData:getOffice_level())

	local function updateNodeValue(node, value)
		node:updateLabel("Text_value", value)
	end

	self._commonBtn6:setVisible(G_UserData:getEnemy():isUserIdInEnemysList(userData:getUser_id()))

	if G_UserData:getFriend():isUserIdInFriendList(userData:getUser_id()) then
		self._commonBtn5:setString(Lang.get("common_btn_delete_friend"))
	else
		self._commonBtn5:setString(Lang.get("common_btn_add_friend"))
	end
	self._commonBtn3:setVisible(false)
	self._commonBtn4:setVisible(false)
	
	if isSelfLeader then
		self._commonBtn3:setString(Lang.get("groups_menu_turn_leader"))
		self._commonBtn3:setVisible(true)
		self._commonBtn4:setVisible(true)
	end

	if isLeader then
		self._commonBtn3:setString(Lang.get("groups_menu_transfer_leader"))
		self._commonBtn3:setVisible(true)
	end

	updateNodeValue(self:getSubNodeByName("Node_1"), userData:getLevel())
	updateNodeValue(self:getSubNodeByName("Node_2"), TextHelper.getAmountText(userData:getPower()))
	updateNodeValue(self:getSubNodeByName("Node_3"), guildName)
end

function PopupUserBaseInfo:onCommonBtnClick(sender)
	local userData = self._userData
	local btnIndex = sender:getTag()
	if btnIndex == PopupUserBaseInfo.COMMON_LOOK_BTN then --查看
		G_UserData:getBase():c2sGetUserDetailInfo(userData:getUser_id())
		self:close()
	end

	if btnIndex == PopupUserBaseInfo.COMMON_PRIVATE_BTN then --私聊
		local ChatConst = require("app.const.ChatConst")
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.chatMsgSendCheck(ChatConst.CHANNEL_PRIVATE, true, true) then
			return
		end

		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		local chatPlayerData = require("app.data.ChatPlayerData").new()
		chatPlayerData:setDataByGroupUserData(userData)
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT,{ChatConst.CHANNEL_PRIVATE,chatPlayerData} )

		--点击私聊后，窗口关闭
		self:close()
		return
	end


	if btnIndex == PopupUserBaseInfo.COMMON_KICK_GROUP_BTN then --请离队伍
		local function onBtnGo()
			G_UserData:getGroups():getMyGroupData():c2sTeamKick(userData:getUser_id())
		end
	
		local popup = require("app.ui.PopupSystemAlert").new(Lang.get("groups_kick_title"), Lang.get("groups_kick_content",{name=userData:getName()}), onBtnGo)
		popup:setCheckBoxVisible(false)
		popup:setCloseVisible(true)
		popup:openWithAction()

		self:close()
	end

	if btnIndex == PopupUserBaseInfo.COMMON_ADD_FRIEND_BTN then --添加好友
		if G_UserData:getFriend():isUserIdInFriendList(userData:getUser_id()) then
			local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_delete_friend"),
							Lang.get("lang_friend_delete_tips", {name = userData:getName()}), function()
								G_UserData:getFriend():c2sDelFriend(userData:getUser_id(), FriendConst.FRIEND_DEL_FRIEND_TYPE)
							end)
			popupAlert:openWithAction()
		else
			if G_UserData:getFriend():isUserIdInBlackList(userData:getUser_id()) then
				G_Prompt:showTip(Lang.get("lang_friend_add_friend_leave_black_tip"))
				return
			end
			G_UserData:getFriend():c2sAddFriend(userData:getName(), FriendConst.FRIEND_ADD_FRIEND_TYPE)
		end
		self:close()
	end

	if btnIndex == PopupUserBaseInfo.COMMON_APPOINT_LEADER_BTN then --移交队长 or 请求带队
		local isLeader = self._userData:isLeader()
		if isLeader then -- 请求自己带队
			G_UserData:getGroups():c2sAppTransferLeader()
		else --移交队长
			G_UserData:getGroups():c2sTransferLeader(userData:getUser_id())
		end
		self:close()
	end

	if btnIndex == PopupUserBaseInfo.COMMON_DEL_ENEMY_BTN then
		local popupAlert = require("app.ui.PopupAlert").new(Lang.get("common_btn_del_enemy"),
															Lang.get("lang_friend_enemy_delete_tip", {name = userData:getName()}), 
															function()
																G_UserData:getEnemy():c2sDelEnemy(userData:getUser_id())
															end)
		popupAlert:openWithAction()
	end
end

function PopupUserBaseInfo:onBtnCancel()
	self:close()
end

function PopupUserBaseInfo:_onAddFriendSuccess(event, message)
	local friendType = rawget(message, "friend_type")
	if friendType then
		if friendType == FriendConst.FRIEND_ADD_FRIEND_TYPE then
			G_Prompt:showTip(Lang.get("lang_friend_apply_success_tip"))
		else
			G_Prompt:showTip(Lang.get("lang_friend_black_success_tip"))
		end
		self:updateUI(self._userData)
	end
end

function PopupUserBaseInfo:_onDelFriendSuccess(event, message)
	local friendType = rawget(message, "friend_type")
	if friendType then
		if friendType == FriendConst.FRIEND_DEL_FRIEND_TYPE then
			G_Prompt:showTip(Lang.get("lang_friend_delete_success_tip"))
			self:close()
			return
		else
			G_Prompt:showTip(Lang.get("lang_friend_del_black_success_tip"))
		end
		self:updateUI(self._userData)
	end
end

function PopupUserBaseInfo:_onDelEnemySuccess()
	self:close()
end

function PopupUserBaseInfo:_onKickUserSuccess()
	self:close()
end

function PopupUserBaseInfo:_onTransferLeaderSuccess()
	self:close()
end

function PopupUserBaseInfo:_onAppTransferLeaderSuccess()
	G_Prompt:showTip(Lang.get("groups_tips_1"))
	self:close()
end

function PopupUserBaseInfo:_onKickOutSuccess(event)
	self:close()
end

return PopupUserBaseInfo
