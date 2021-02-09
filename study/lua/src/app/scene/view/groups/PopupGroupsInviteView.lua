
-- Author: zhanglinsen
-- Date:2018-09-10 10:50:33
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupGroupsInviteView = class("PopupGroupsInviteView", PopupBase)
local PopupGroupsInviteCell = import(".PopupGroupsInviteCell")
local GroupsConst = require("app.const.GroupsConst")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local HeroConst = require("app.const.HeroConst")

function PopupGroupsInviteView:ctor()
	local resource = {
		file = Path.getCSB("PopupGroupsInviteView", "groups"),
	}
	PopupGroupsInviteView.super.ctor(self, resource)
end

function PopupGroupsInviteView:onCreate()
	self._selectTabIndex = 0
	self._myGroupData = nil
	self._listDatas = {}
	self._friendList = {}
	self._guildMemberList = {}
	self._maxLevel = 0
	self._minLevel = 0

	self._panelBg:setTitle(Lang.get("groups_title_invite_friend"))
	self._panelBg:addCloseEventListener(handler(self, self._onCloseClick))
	self._panelBg:setCloseVisible(true)
	
	self:_initTab()
	self._listView:setTemplate(PopupGroupsInviteCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupGroupsInviteView:_initTab()
	local textNames = {}
    table.insert(textNames, Lang.get("groups_title_guild_member"))
    table.insert(textNames, Lang.get("groups_title_online_friend"))
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = -2,
		textList = textNames,
	}
	self._tabGroup:recreateTabs(param)
end

function PopupGroupsInviteView:onEnter()
	self._signalKickOut = G_SignalManager:add(SignalConst.EVENT_GROUP_KICK_OUT, handler(self, self._onKickOut)) --被踢出
	self._signalInviteJoinGuild = G_SignalManager:add(SignalConst.EVENT_GROUP_INVITE_JOIN_GROUP_SUCCEED, handler(self, self._onInviteJoinGroup)) --成功邀请玩家
	self._signalGetFriendList = G_SignalManager:add(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS, handler(self, self._onGetFriendList))--好友数据
	self._signalGetGuildMemberList = G_SignalManager:add(SignalConst.EVENT_GUILD_QUERY_MALL, handler(self, self._onGetGuildMemberList))--军团数据
	self._signalInviteTimeOut = G_SignalManager:add(SignalConst.EVENT_GROUP_INVITE_TIME_OUT, handler(self, self._onInviteTimeOut))
	self._signalMyGroupUpdate = G_SignalManager:add(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE, handler(self, self._onMyGroupUpdate))
	self._signalRejectInvite = G_SignalManager:add(SignalConst.EVENT_GROUP_REJECT_INVITE, handler(self, self._onRejectInvite))
	self._signalAcceptInvite = G_SignalManager:add(SignalConst.EVENT_GROUP_ACCEPT_INVITE, handler(self, self._onAcceptInvite))
	self._signalJoinSuccess = G_SignalManager:add(SignalConst.EVENT_GROUP_JOIN_SUCCESS, handler(self, self._onJoinSuccess))
	self._signalMemberReachFull = G_SignalManager:add(SignalConst.EVENT_GROUP_MEMBER_REACH_FULL, handler(self, self._onMemberReachFull))

	self._tabGroup:setTabIndex(GroupsConst.TAB_INVITE_TYPE_1)
end

function PopupGroupsInviteView:onExit()
	self._signalKickOut:remove()
	self._signalKickOut = nil
	self._signalInviteJoinGuild:remove()
	self._signalInviteJoinGuild = nil
	self._signalGetFriendList:remove()
	self._signalGetFriendList = nil
	self._signalGetGuildMemberList:remove()
	self._signalGetGuildMemberList = nil
	self._signalInviteTimeOut:remove()
	self._signalInviteTimeOut = nil
	self._signalMyGroupUpdate:remove()
	self._signalMyGroupUpdate = nil
	self._signalRejectInvite:remove()
	self._signalRejectInvite = nil
	self._signalAcceptInvite:remove()
	self._signalAcceptInvite = nil
	self._signalJoinSuccess:remove()
	self._signalJoinSuccess = nil
	self._signalMemberReachFull:remove()
	self._signalMemberReachFull = nil
end

function PopupGroupsInviteView:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	
	self._selectTabIndex = index

	self:_requestInviteListData()
	self:_updateData()
	self:_updateView()
end

function PopupGroupsInviteView:_requestInviteListData()
	if self._selectTabIndex == GroupsConst.TAB_INVITE_TYPE_1 then
		if G_UserData:getGuild():isInGuild() then
			G_UserData:getGuild():c2sQueryGuildMall()
		end
	elseif self._selectTabIndex == GroupsConst.TAB_INVITE_TYPE_2 then
		G_UserData:getFriend():c2sGetFriendList()
	end
end

function PopupGroupsInviteView:_updateData()
	self._myGroupData = G_UserData:getGroups():getMyGroupData()
	if self._myGroupData then
		self._maxLevel = self._myGroupData:getGroupData():getMax_level()
		self._minLevel = self._myGroupData:getGroupData():getMin_level()
	end

	if self._selectTabIndex == GroupsConst.TAB_INVITE_TYPE_1 then
		local tempList = clone(self._guildMemberList)
		self._guildMemberList = self:_filterData(tempList)
		self._listDatas = self._guildMemberList
	elseif self._selectTabIndex == GroupsConst.TAB_INVITE_TYPE_2 then
		local tempList = clone(self._friendList)
		self._friendList = self:_filterData(tempList)
		self._listDatas = self._friendList
	end
end

function PopupGroupsInviteView:_updateView()
	self._listView:clearAll()
	self._listView:resize(#self._listDatas)

	if #self._listDatas == 0 then
		self._textMid:setVisible(true)
		if self._selectTabIndex == GroupsConst.TAB_INVITE_TYPE_1 then
			self._textMid:setString(Lang.get("groups_invite_guild_empty"))
		elseif self._selectTabIndex == GroupsConst.TAB_INVITE_TYPE_2 then
			self._textMid:setString(Lang.get("groups_invite_friend_empty"))
		end
	else
		self._textMid:setVisible(false)
	end
end

function PopupGroupsInviteView:_onKickOut(event)
    self:close()
end

function PopupGroupsInviteView:_onInviteJoinGroup(event)
	self:_updateData()
	self:_updateView()
end

function PopupGroupsInviteView:_onInviteTimeOut()
	self:_updateData()
	self:_updateView()
end

function PopupGroupsInviteView:_onMyGroupUpdate()
	self:_updateData()
	self:_updateView()
end

function PopupGroupsInviteView:_onRejectInvite()
	self:_updateData()
	self:_updateView()
end

function PopupGroupsInviteView:_onAcceptInvite()
	self:_updateData()
	self:_updateView()
end

function PopupGroupsInviteView:_onJoinSuccess()
	self:_updateData()
	self:_updateView()
end

function PopupGroupsInviteView:_onMemberReachFull()
	self:close()
end

function PopupGroupsInviteView:_onItemUpdate(item, index)
	local itemData = self._listDatas[index+1]
	if itemData then
		item:updateUI(index, itemData)
	end
end

function PopupGroupsInviteView:_onItemSelected(item, index)

end

function PopupGroupsInviteView:_onItemTouch(index, userId)
	if self._myGroupData then
		self._myGroupData:c2sInviteJoinTeam(userId)
	end
end

function PopupGroupsInviteView:_onCloseClick()
    self:close()                 
end

function PopupGroupsInviteView:_onGetFriendList(event, datas)
	self._friendList = {}
	if datas then 
		local friendList = rawget(datas, "friendList") or {}
		for _, unitData in pairs(friendList) do
			if unitData:getOnline() == 0 then --0表示在线
				local limitLevel = 0
				local playerShowInfo = unitData:getPlayerShowInfo()
				local avatarBaseId = playerShowInfo.avatarBaseId
		        if avatarBaseId > 0 then
		            local limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit
		            if limit == 1 then
		                limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
		            end
		        end

				local cellData = {
					covertId = unitData:getCovertId(),
					limitLevel = limitLevel,
					userId = unitData:getId(),
					guildName = unitData:getGuild_name(),
					playerName = unitData:getName(),
					officerLevel = unitData:getOffice_level(),
					level = unitData:getLevel(),
					power = unitData:getPower(),
					maxLv = self._maxLevel,
					minLv = self._minLevel,
					power = unitData:getPower(),
					head_frame_id = unitData:getHead_frame_id()
				}
				table.insert(self._friendList, cellData)
			end
		end
	end

	self:_updateData()
	if self._selectTabIndex == GroupsConst.TAB_INVITE_TYPE_2 then
		self:_updateView()
	end
end

function PopupGroupsInviteView:_onGetGuildMemberList(event)
	local datas = G_UserData:getGuild():getGuildMemberList()
	self._guildMemberList = {}
	for _, unitData in pairs(datas) do
		if unitData:isOnline() then
			local limitLevel = 0
			local playerInfo = unitData:getPlayer_info()
			local avatarBaseId = playerInfo.avatarBaseId
	        if avatarBaseId > 0 then
	            local limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit
	            if limit == 1 then
	                limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
	            end
	        end
			local cellData = {
				covertId = playerInfo.covertId,
				limitLevel = limitLevel,
				userId = unitData:getUid(),
				guildName = G_UserData:getGuild():getMyGuild():getName(),
				playerName = unitData:getName(),
				officerLevel = unitData:getOfficer_level(),
				level = unitData:getLevel(),
				power = unitData:getPower(),
				maxLv = self._maxLevel,
				minLv = self._minLevel,
				power = unitData:getPower(),
				head_frame_id = unitData:getHead_frame_id()
			}
			table.insert(self._guildMemberList, cellData)
		end
	end

	self:_updateData()
	if self._selectTabIndex == GroupsConst.TAB_INVITE_TYPE_1 then
		self:_updateView()
	end
end

--筛选数据，去除已入队的
function PopupGroupsInviteView:_filterData(cellDatas)
	local sortFunc = function(a, b)
		return a.power > b.power
	end
	local result = {}
	if self._myGroupData then
		for i, cellData in ipairs(cellDatas) do
			local userId = cellData.userId
			if not self._myGroupData:isExistUser(userId) then
				table.insert(result, cellData)
			end
		end
	end
	
	table.sort(result, sortFunc)
	return result
end

return PopupGroupsInviteView