
-- Author: zhanglinsen
-- Date:2018-09-10 10:48:16
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupGroupsApplyView = class("PopupGroupsApplyView", PopupBase)
local PopupGroupsApplyCell = import(".PopupGroupsApplyCell")

function PopupGroupsApplyView:ctor()
	local resource = {
		file = Path.getCSB("PopupGroupsApplyView", "groups"),

	}
	PopupGroupsApplyView.super.ctor(self, resource)
end

function PopupGroupsApplyView:onCreate()
	self._listDatas = {}

	self._panelBg:setTitle(Lang.get("groups_title_apply_list"))
	self._panelBg:addCloseEventListener(handler(self, self._onCloseClick))
	self._panelBg:setCloseVisible(true)

	self._listView:setTemplate(PopupGroupsApplyCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupGroupsApplyView:onEnter()
	self._signalApplyListUpdate = G_SignalManager:add(SignalConst.EVENT_GROUP_APPLY_LIST_UPDATE, handler(self, self._onApplyListUpdate))
	self._signalApplyTimeOut = G_SignalManager:add(SignalConst.EVENT_GROUP_APPLY_TIME_OUT, handler(self, self._onApplyTimeOut))
	self._signalMyGroupApproveChange = G_SignalManager:add(SignalConst.EVENT_GROUP_APPROVE_APPLY_SUCCESS, handler(self, self._onMyGroupApproveChange))
	self._signalMemberReachFull = G_SignalManager:add(SignalConst.EVENT_GROUP_MEMBER_REACH_FULL, handler(self, self._onMemberReachFull))

	self:_updateData()
	self:_updateList()
end

function PopupGroupsApplyView:onExit()
	self._signalApplyListUpdate:remove()
	self._signalApplyListUpdate = nil
	self._signalApplyTimeOut:remove()
	self._signalApplyTimeOut = nil
	self._signalMyGroupApproveChange:remove()
	self._signalMyGroupApproveChange = nil
	self._signalMemberReachFull:remove()
	self._signalMemberReachFull = nil
end

function PopupGroupsApplyView:_updateList()
	self._listView:clearAll()
	self._listView:resize(#self._listDatas)
end

function PopupGroupsApplyView:_updateData()
	self._listDatas = {}
	local myGroupData = G_UserData:getGroups():getMyGroupData()
	if myGroupData then
		local applyList = myGroupData:getApplyList()
		for k, data in pairs(applyList) do
			table.insert(self._listDatas, data)
		end
	end
end

function PopupGroupsApplyView:_onItemUpdate(item, index)
	local itemData = self._listDatas[index+1]
	if itemData then
		item:updateUI(index, itemData)
	end
end

function PopupGroupsApplyView:_onItemSelected(item, index)

end

function PopupGroupsApplyView:_onItemTouch(index, t, isAccept)
	local itemData = self._listDatas[index+t]
	if itemData then
		local userId = itemData:getUser_id()
		G_UserData:getGroups():getMyGroupData():c2sApproveTeam(userId, isAccept)
	end	
end

function PopupGroupsApplyView:_onCloseClick()
    self:close()
end

function PopupGroupsApplyView:_onApplyListUpdate(event)
	self:_updateData()
	self:_updateList()
end

function PopupGroupsApplyView:_onApplyTimeOut(event, userId)
	self:_updateData()
	self:_updateList()
end

function PopupGroupsApplyView:_onMyGroupApproveChange(event, userId, op)
	self:_updateData()
	self:_updateList()
end

function PopupGroupsApplyView:_onMemberReachFull()
	self:close()
end

return PopupGroupsApplyView