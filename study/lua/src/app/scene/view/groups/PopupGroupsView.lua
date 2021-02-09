
-- Author: zhanglinsen
-- Date:2018-09-19 18:18:47
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupGroupsView = class("PopupGroupsView", PopupBase)
local GroupsInfoNode = require("app.scene.view.groups.GroupsInfoNode")

function PopupGroupsView:ctor()
	local resource = {
		file = Path.getCSB("PopupGroupsView", "groups"),
		binding = {
			
		},
	}
	PopupGroupsView.super.ctor(self, resource)
end

function PopupGroupsView:onCreate()
	self._popBase:addCloseEventListener(handler(self, self._onCloseClick))
	self._popBase:setCloseVisible(true)
	self._popBase:setTitle(Lang.get("groups_member_title"))
end

function PopupGroupsView:onEnter()
	self._signalMyGroupUpdate = G_SignalManager:add(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE, handler(self, self._onMyGroupUpdate))
	self:_refreshView()
end

function PopupGroupsView:onExit()
	self._signalMyGroupUpdate:remove()
	self._signalMyGroupUpdate = nil
end

function PopupGroupsView:_refreshView()
	local chooseView = self:_getInfoView()
	chooseView:updateInfo()
end

function PopupGroupsView:_getInfoView()
	local infoView = self._infoView
	if infoView == nil then
		infoView = GroupsInfoNode.new()
		infoView:setCascadeOpacityEnabled(true)
		self._panelRoot:addChild(infoView)
		self._infoView = infoView
	end
	return infoView
end

function PopupGroupsView:_onCloseClick()
	self:close()
end

function PopupGroupsView:_onMyGroupUpdate()
	self:_refreshView()
end

return PopupGroupsView