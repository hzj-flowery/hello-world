--
-- Author: Liangxu
-- Date: 2018-11-14
--
local CommonGroupsMiniList = class("CommonGroupsMiniList")
local CommonGroupsMiniListCell = require("app.ui.component.CommonGroupsMiniListCell")
local PopupAlert = require("app.ui.PopupAlert")

local EXPORTED_METHODS = {
	
}

function CommonGroupsMiniList:ctor()
	self._isOpen = true --默认打开
	self._userList = {}
end

function CommonGroupsMiniList:_init()
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
	cc.bind(self._listView, "ListView")
	self._buttonArrow = ccui.Helper:seekNodeByName(self._target, "ButtonArrow")
	self._buttonArrow:addClickEventListenerEx(handler(self, self._onClickBtnArrow))
	self._buttonGroup = ccui.Helper:seekNodeByName(self._target, "ButtonGroup")
	self._buttonGroup:addClickEventListenerEx(handler(self, self._doPopupGroup))
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
	self._textAwardTips = ccui.Helper:seekNodeByName(self._target, "TextAwardTips")
	self._textAwardTips:setString(Lang.get("groups_tips_32"))

	self._initPosX, self._initPosY = self._target:getPosition()
	self._moveDistance = self._imageBg:getContentSize().width

	self._target:onNodeEvent("enter", function ()
		self._signalMyGroupUpdate = G_SignalManager:add(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE, handler(self, self._onMyGroupUpdate))
        self._signalTransferLeader = G_SignalManager:add(SignalConst.EVENT_GROUP_TRANSFER_LEADER_SUCCESS, handler(self, self._onTransferLeaderSuccess))
		self._signalKickUser = G_SignalManager:add(SignalConst.EVENT_GROUP_MY_GROUP_KICK_USER, handler(self, self._onKickUserSuccess))
		self._signalChangeLocation = G_SignalManager:add(SignalConst.EVENT_GROUP_CHANGE_LOCATION_SUCCESS, handler(self, self._onChangeLocation))

        self:_updateData()
        self:_updateView()
    end)

	self._target:onNodeEvent("exit", function ()
		self._signalMyGroupUpdate:remove()
		self._signalMyGroupUpdate = nil
        self._signalTransferLeader:remove()
		self._signalTransferLeader = nil
		self._signalKickUser:remove()
		self._signalKickUser = nil
		self._signalChangeLocation:remove()
		self._signalChangeLocation = nil
    end)
end

function CommonGroupsMiniList:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonGroupsMiniList:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonGroupsMiniList:_updateData()
	self._userList = {}
	local myGroupData = G_UserData:getGroups():getMyGroupData()
	if myGroupData then
		self._userList = myGroupData:getGroupData():getUserList()
	end
end

function CommonGroupsMiniList:_updateView()
	self._listView:removeAllChildren()
	for i = 1, 3 do
		local userData = self._userList[i]
		local cell = CommonGroupsMiniListCell.new(handler(self, self._onClickCallback))
		cell:update(userData, i)
		self._listView:pushBackCustomItem(cell)
	end
	self:_updateAwardTip()
end

function CommonGroupsMiniList:_updateAwardTip()
	local myGroupData = G_UserData:getGroups():getMyGroupData()
	if myGroupData then
		if myGroupData:isAwardAdd() then
			self._textAwardTips:setColor(cc.c3b(0x3c, 0xff, 0x00))
			self._imageArrow:setVisible(true)
		else
			self._textAwardTips:setColor(cc.c3b(0x7d, 0x7d, 0x7d))
			self._imageArrow:setVisible(false)
		end
	end
end

function CommonGroupsMiniList:_onClickCallback(userData)
	if userData then
		self:_doPopupGroup()
	else
		local popup = require("app.scene.view.groups.PopupGroupsInviteView").new()
		popup:openWithAction()
	end
end

function CommonGroupsMiniList:_doPopupGroup()
	local popup = require("app.scene.view.groups.PopupGroupsView").new()
	popup:openWithAction()
end

function CommonGroupsMiniList:_onClickBtnArrow()
	if self._isOpen then
		self:_moveIn()
	else
		self:_moveOut()
	end
end

--弹出
function CommonGroupsMiniList:_moveOut()
	if self._imageBg:getActionByTag(456) then
		return
	end

	local moveBy = cc.MoveBy:create(0.5, cc.p(self._moveDistance, 0))
	local seq = cc.Sequence:create(
					moveBy, 
					cc.CallFunc:create(function()
						self._isOpen = true
						self._buttonArrow:setRotation(0)
					end)
				)
	
	seq:setTag(456)
	self._imageBg:runAction(seq)
end

--弹入
function CommonGroupsMiniList:_moveIn()
	if self._imageBg:getActionByTag(123) then
		return
	end

	local moveBy = cc.MoveBy:create(0.5, cc.p(-self._moveDistance, 0))
	local seq = cc.Sequence:create(
					moveBy, 
					cc.CallFunc:create(function()
						self._isOpen = false
						self._buttonArrow:setRotation(180)
					end)
				)
	
	
	seq:setTag(123)
	self._imageBg:runAction(seq)
end

function CommonGroupsMiniList:_onMyGroupUpdate()
	local myGroupData = G_UserData:getGroups():getMyGroupData()
	if myGroupData == nil then
		local callback = function ()
        	G_SceneManager:popScene()
	    end
	    local popup = PopupAlert.new(nil, Lang.get("groups_not_connect_out_active_tip"), callback, callback)
	    popup:onlyShowOkButton()
	    popup:openWithAction()
		return
	end
	
	self:_updateData()
    self:_updateView()
end

function CommonGroupsMiniList:_onTransferLeaderSuccess()
	self:_updateData()
    self:_updateView()
end

function CommonGroupsMiniList:_onKickUserSuccess()
	self:_updateData()
    self:_updateView()
end

function CommonGroupsMiniList:_onChangeLocation()
	self:_updateData()
    self:_updateView()
end

return CommonGroupsMiniList