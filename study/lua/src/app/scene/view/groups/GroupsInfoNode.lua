
-- Author: zhanglinsen
-- Date:2018-09-28 17:37:06
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GroupsInfoNode = class("GroupsInfoNode", ViewBase)
local GroupHeroNode = require("app.scene.view.groups.GroupHeroNode")
local PopupGroupsApplyView = import(".PopupGroupsApplyView")
local PopupGroupsInviteView = import(".PopupGroupsInviteView")
local PopupGroupsSelectedView = import(".PopupGroupsSelectedView")
local GroupsConst = require("app.const.GroupsConst")
local FriendConst = require("app.const.FriendConst")
local ChatConst = require("app.const.ChatConst")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local GroupsViewHelper = require("app.scene.view.groups.GroupsViewHelper")

function GroupsInfoNode:ctor()
	local resource = {
		file = Path.getCSB("GroupsInfoNode", "groups"),
		binding = {
			_btnAdd = {
				events = {{event = "touch", method = "_onBtnAdd"}}
			},
			_btnApply = {
				events = {{event = "touch", method = "_onBtnApply"}}
			},
			_btnGo = {
				events = {{event = "touch", method = "_onBtnGo"}}
			},
			_btnGuild = {
				events = {{event = "touch", method = "_onBtnGuild"}}
			},
			_btnOut = {
				events = {{event = "touch", method = "_onBtnOut"}}
			},
			_btnWorld = {
				events = {{event = "touch", method = "_onBtnWorld"}}
			},
			_btnLock = {
				events = {{event = "touch", method = "_onBtnLock"}}
			},
		},
	}
	GroupsInfoNode.super.ctor(self, resource)
end

function GroupsInfoNode:onCreate()
	self:_initData()
	self:_initView()
end

function GroupsInfoNode:_initData()
	self._myMemberData = nil
	self._memberData = nil
	self._isSelfLeader = false --自己是否是队长
	self._isInScene = false --是否在场景中，关系到进入活动是否显示
	self._isLock = true --默认锁住，解锁后可以移动成员位置
	self._isAuto = false --是否自动同意入队申请

	-- 队长更换位置相关
	self._originalPos = 0
	self._targetPos = 0
	self._isTouch = false
end

function GroupsInfoNode:_initView()
	self._panel:setSwallowTouches(false)
	self._btnAdd:setTitleText(Lang.get("groups_btn_name_add"))
	self._btnApply:setString(Lang.get("groups_btn_name_apply"))
	self._btnGo:setString(Lang.get("groups_btn_name_go"))
	self._btnOut:setString(Lang.get("groups_btn_name_out"))
	self._btnWorld:setTitleText(Lang.get("groups_btn_world_add"))
	self._btnGuild:setTitleText(Lang.get("groups_btn_guild_add"))
	self._ckbAuto:setString(Lang.get("groups_auto_join_content"))
	self._ckbAuto:setChangeCallBack(handler(self, self._onClickCheckBox))

	self._addMenuRoot:setVisible(false)
	self._textAwardTips:setString(Lang.get("groups_tips_31"))

	self._memberLoction2Data = {}
	for i = 1, GroupsConst.MAX_PLAYER_SIZE do
		local hero = GroupHeroNode.new(self["_nodeHero"..i], handler(self, self._onClickAdd), handler(self, self._onClickOut))
		self._memberLoction2Data[i] = {
			node = self["_nodeHero"..i],
			pos = cc.p(self["_nodeHero"..i]:getPosition()),
			hero = hero,
		}
	end
end

function GroupsInfoNode:onEnter()
	self._signalTransferLeader = G_SignalManager:add(SignalConst.EVENT_GROUP_TRANSFER_LEADER_SUCCESS, handler(self, self._onTransferLeaderSuccess))
	self._signalKickUser = G_SignalManager:add(SignalConst.EVENT_GROUP_MY_GROUP_KICK_USER, handler(self, self._onKickUserSuccess))
	self._signalChangeLocation = G_SignalManager:add(SignalConst.EVENT_GROUP_CHANGE_LOCATION_SUCCESS, handler(self, self._onChangeLocation))
	self._signalSetChangeSuccess = G_SignalManager:add(SignalConst.EVENT_GROUP_SET_CHANGE_SUCCESS, handler(self, self._onSetChangeSuccess))
	self._signalApplyListUpdate = G_SignalManager:add(SignalConst.EVENT_GROUP_APPLY_LIST_UPDATE, handler(self, self._onApplyListUpdate))
	self._signalApplyTimeOut = G_SignalManager:add(SignalConst.EVENT_GROUP_APPLY_TIME_OUT, handler(self, self._onApplyTimeOut))
	self._signalApproveInfoChange = G_SignalManager:add(SignalConst.EVENT_GROUP_APPROVE_APPLY_SUCCESS, handler(self, self._onOpApproveChange))

	local runningScene = G_SceneManager:getRunningScene()
    runningScene:addGetUserBaseInfoEvent()
	self._panel:addTouchEventListener(handler(self, self._onTouchEvent))
end

function GroupsInfoNode:onExit()
	self._signalTransferLeader:remove()
	self._signalTransferLeader = nil
	self._signalKickUser:remove()
	self._signalKickUser = nil
	self._signalChangeLocation:remove()
	self._signalChangeLocation = nil
	self._signalSetChangeSuccess:remove()
	self._signalSetChangeSuccess = nil
	self._signalApplyListUpdate:remove()
	self._signalApplyListUpdate = nil
	self._signalApplyTimeOut:remove()
	self._signalApplyTimeOut = nil
	self._signalApproveInfoChange:remove()
	self._signalApproveInfoChange = nil
end

function GroupsInfoNode:updateInfo()
	self:_updateData()
	self:_updateView()
end

function GroupsInfoNode:_updateData()
	self._myMemberData = G_UserData:getGroups():getMyGroupData()
	self._memberData = self._myMemberData:getGroupData()
	local targetId = self._memberData:getTeam_target()
	self._configInfo = GroupsDataHelper.getTeamTargetConfig(targetId)
	self._isSelfLeader = G_UserData:getGroups():isSelfLeader()
	self._isInScene = self._memberData:isIs_scene()
	self._isAuto = self._myMemberData:isTeam_auto()
end

function GroupsInfoNode:_updateView()
	self:_updateAwardTip()
	self:_updateHeros()
	self:_layoutBtns()
	self:_updateLock()
	self:_updateAuto()
	self:_checkApplyRedPoint()
end

function GroupsInfoNode:_updateAwardTip()
	if self._myMemberData:isAwardAdd() then
		self._textAwardTips:setColor(cc.c3b(0x3c, 0xff, 0x00))
		self._imageArrow:setVisible(true)
	else
		self._textAwardTips:setColor(cc.c3b(0x7d, 0x7d, 0x7d))
		self._imageArrow:setVisible(false)
	end
end

function GroupsInfoNode:_updateHeros()
	for i = 1, GroupsConst.MAX_PLAYER_SIZE do
		local userData = self._memberData:getUserDataWithLocation(i)
		local hero = self._memberLoction2Data[i].hero
		hero:updataUI(userData)
		hero:getHeroAvatar():setTouchEnabled(self._isLock)
	end
end

function GroupsInfoNode:_layoutBtns()
	local btns = {self._btnGo, self._btnApply, self._btnAdd, self._btnLock}
	local showBtns = {}
	if self._isInScene then
		if self._isSelfLeader then
			showBtns = {self._btnApply, self._btnAdd, self._btnLock}
		else
			showBtns = {self._btnAdd}
		end
	else
		if self._isSelfLeader then
			showBtns = {self._btnGo, self._btnApply, self._btnAdd, self._btnLock}
		else
			showBtns = {self._btnAdd}
		end
	end

	for i, btn in ipairs(btns) do
		btn:setVisible(false)
	end
	for i, btn in ipairs(showBtns) do
		btn:setVisible(true)
	end
end

function GroupsInfoNode:_updateLock()
	if self._isLock then
		self._btnLock:setTitleText(Lang.get("groups_member_btn_adjust"))
	else
		self._btnLock:setTitleText(Lang.get("groups_member_btn_confirm"))
	end
	self._nodeBtns:setVisible(self._isLock)
	self._imageTip:setVisible(not self._isLock)
	self._panel:setTouchEnabled(self._isSelfLeader and not self._isLock)
	self._ckbAuto:setTouchEnabled(self._isLock)
	-- self._panelTarget:setTouchEnabled(self._isSelfLeader and self._isLock)
	for i = 1, GroupsConst.MAX_PLAYER_SIZE do
		local hero = self._memberLoction2Data[i].hero
		hero:getHeroAvatar():setTouchEnabled(self._isLock)
	end
end

function GroupsInfoNode:_updateAuto()
	self._imageAuto:setVisible(self._isSelfLeader)
	self._ckbAuto:setSelected(self._isAuto)
end

function GroupsInfoNode:_onClickOut(userData)
	if self._isLock == false then
		return
	end
	if userData then
		local function onBtnGo()
			self._myMemberData:c2sTeamKick(userData:getUser_id())
		end 
		
		local popup = require("app.ui.PopupSystemAlert").new(Lang.get("groups_kick_title"), Lang.get("groups_kick_content",{name=userData:getName()}), onBtnGo)
		popup:setCheckBoxVisible(false)
		popup:setCloseVisible(true)
		popup:openWithAction()
	end
end

function GroupsInfoNode:_onClickAdd(sender)
	if self._isLock == false then
		return
	end
	local popup = PopupGroupsInviteView.new()
	popup:openWithAction()
end

function GroupsInfoNode:_checkIsSelectedMember(sender)
	local pos = sender:getTouchBeganPosition()
	for i = 1, GroupsConst.MAX_PLAYER_SIZE do
		local hero = self._memberLoction2Data[i].hero
		if not hero:isEmpty() then
			local location = hero:getHeroAvatar():getSpineHero():convertToNodeSpace(pos)
			local rect = hero:getHeroAvatar():getSpineHero():getBoundingBox()
			if cc.rectContainsPoint(rect, location) then
				return i
			end
		end
	end
	return nil
end

function GroupsInfoNode:_onMemberSelected(target)
	if self._isTouch ~= true then 
		return 
	end
	self._curSelectedMemberNode = target
	self._curSelectedMemberNode:setScale(1.12)
	self._curSelectedMemberNode:setOpacity(180)
	self._curSelectedMemberNode:setLocalZOrder(100)
end

function GroupsInfoNode:_checkMoveHit(location)
	self._targetPos = 0
	for i = 1, GroupsConst.MAX_PLAYER_SIZE do
		if self._originalPos ~= i then
			local node = self._memberLoction2Data[i].node
			local rect = node:getBoundingBox()
			local width = rect.width --需要转换坐标点
			local height = rect.height
			rect.x = rect.x - width/2
			rect.y = rect.y - height/2
			if cc.rectContainsPoint(rect, location) then
				self._targetPos = i
			end
		end
	end
end

function GroupsInfoNode:_onMemberUnselected()
	if self._targetPos > 0 then
		local hero = self._memberLoction2Data[self._targetPos].hero
		if hero:isEmpty() then
			G_Prompt:showTip(Lang.get("groups_tips_26"))
		else
			local targetNode = self._memberLoction2Data[self._targetPos].node
			local originalNode = self._memberLoction2Data[self._originalPos].node
			local targetHero = self._memberLoction2Data[self._targetPos].hero
			local originalHero = self._memberLoction2Data[self._originalPos].hero
			self._memberLoction2Data[self._targetPos].node = originalNode
			self._memberLoction2Data[self._originalPos].node = targetNode
			self._memberLoction2Data[self._targetPos].hero = originalHero
			self._memberLoction2Data[self._originalPos].hero = targetHero

			self._myMemberData:c2sTeamChangeMemberNo(self._originalPos, self._targetPos)
		end
	end
	self._curSelectedMemberNode:setScale(1.0)
	self._curSelectedMemberNode:setOpacity(255)

	self:_updateMemberPos()
end

function GroupsInfoNode:_updateMemberPos()
	for i = 1, GroupsConst.MAX_PLAYER_SIZE do
		local memberNode = self._memberLoction2Data[i].node
		local touchBeginPos = self._memberLoction2Data[i].pos
		if memberNode then
			memberNode:setPosition(touchBeginPos)
			memberNode:setLocalZOrder(i*10)
		end
	end
end

function GroupsInfoNode:_onTouchEvent(sender, state)
	if state == ccui.TouchEventType.began then
		local index = self:_checkIsSelectedMember(sender)
		if index then
			self._isTouch = true
			self._originalPos = index

			local node = self._memberLoction2Data[index].node
			local touchBeginPos = self._panel:convertToNodeSpace(sender:getTouchBeganPosition())
			node:setPosition(touchBeginPos)
			local selectedMemberPos = cc.p(node:getPosition())
			self._distanceX = selectedMemberPos.x - touchBeginPos.x
			self._distanceY = selectedMemberPos.y - touchBeginPos.y
			self:_onMemberSelected(node)
			self:_checkMoveHit(touchBeginPos)
			return true
		end
		self._isTouch = false
		return false
	elseif state == ccui.TouchEventType.moved then
		if self._isTouch then
			local movePos = sender:getTouchMovePosition()
			local localMovePos = self._panel:convertToNodeSpace(movePos)
			local spinePosX = localMovePos.x + self._distanceX
			local spinePosY = localMovePos.y + self._distanceY
			self._curSelectedMemberNode:setPosition(cc.p(spinePosX, spinePosY))
			
			self:_checkMoveHit(localMovePos)
		end
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		if self._isTouch then
			self:_onMemberUnselected()
		end
	end
end

function GroupsInfoNode:_onKickUserSuccess()
	self:_updateData()
	self:_updateView()
end

function GroupsInfoNode:_onTransferLeaderSuccess()
	self:_updateData()
	self:_updateView()
end

function GroupsInfoNode:_onApplyListUpdate()
	self:_checkApplyRedPoint()
end

function GroupsInfoNode:_onApplyTimeOut()
	self:_checkApplyRedPoint()
end

function GroupsInfoNode:_onOpApproveChange()
	self:_checkApplyRedPoint()
end

function GroupsInfoNode:_checkApplyRedPoint()
	if self._isSelfLeader then
		local applyListCount = self._myMemberData:getApplyListCount()
		self._btnApply:showRedPoint(applyListCount > 0)
	end
end

function GroupsInfoNode:_onChangeLocation()
	self:_updateData()
	self:_updateHeros()
end

function GroupsInfoNode:_onSetChangeSuccess()
	self:_updateData()
	self:_updateAuto()
end

-- Describle：招募
function GroupsInfoNode:_onBtnAdd()
	self._addMenuRoot:setVisible( not self._addMenuRoot:isVisible() )
end

-- Describle：申请列表
function GroupsInfoNode:_onBtnApply()
	local popup = PopupGroupsApplyView.new()
	popup:openWithAction()
end

-- Describle：进入活动
function GroupsInfoNode:_onBtnGo()
	local groupType = self._memberData:getTeam_type()
	G_UserData:getGroups():c2sTeamEnterScene(groupType)
end

-- Describle：离开队伍
function GroupsInfoNode:_onBtnOut()
	GroupsViewHelper.quitGroupTip()
end

-- Describle：世界招募
function GroupsInfoNode:_onBtnWorld()
	local memberData = self._memberData
	if memberData:isFull() then
		G_Prompt:showTip(Lang.get("groups_tips_18")) 
		self._addMenuRoot:setVisible( not self._addMenuRoot:isVisible() )
		return
	end

	local teamType = GroupsDataHelper.getGroupTypeWithTarget(memberData:getTeam_target())
	local isSuccess = G_UserData:getChat():sendCreateTeamMsg(ChatConst.CHANNEL_WORLD,
											memberData:getTeam_id(),
											teamType,
											memberData:getUserCount(),
											GroupsConst.MAX_PLAYER_SIZE,
											false)

	self._addMenuRoot:setVisible(not self._addMenuRoot:isVisible())
	if isSuccess then
		G_Prompt:showTip(Lang.get("groups_tips_17")) 
	end
end

-- Describle：军团招募
function GroupsInfoNode:_onBtnGuild()
	local memberData = self._memberData
	if memberData:isFull() then
		G_Prompt:showTip(Lang.get("groups_tips_18")) 
		self._addMenuRoot:setVisible( not self._addMenuRoot:isVisible() )
		return
	end	
	
	local teamType = GroupsDataHelper.getGroupTypeWithTarget(memberData:getTeam_target())
	local isSuccess = G_UserData:getChat():sendCreateTeamMsg(ChatConst.CHANNEL_GUILD,
											memberData:getTeam_id(),
											teamType,
											memberData:getUserCount(),
											GroupsConst.MAX_PLAYER_SIZE,
											false)
	self._addMenuRoot:setVisible(not self._addMenuRoot:isVisible())
	if isSuccess then
		G_Prompt:showTip(Lang.get("groups_tips_17")) 
	end
end

function GroupsInfoNode:_onBtnLock()
	self._isLock = not self._isLock
	self:_updateLock()
end

function GroupsInfoNode:_onClickCheckBox(isCheck)
	if self._myMemberData then
		local memberData = self._myMemberData:getGroupData()
		local teamTarget = memberData:getTeam_target()
		local minLevel = memberData:getMin_level()
		local maxLevel = memberData:getMax_level()
		G_UserData:getGroups():c2sChangeTeamSet(teamTarget, minLevel, maxLevel, isCheck)
	end
end

return GroupsInfoNode