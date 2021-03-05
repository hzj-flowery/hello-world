
-- Author: zhanglinsen
-- Date:2018-09-27 19:48:11
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GroupsListView = class("GroupsListView", ViewBase)
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local GroupsFixViewCell = import(".GroupsFixViewCell")
local GroupsViewHelper = require("app.scene.view.groups.GroupsViewHelper")

function GroupsListView:ctor(groupType)
	self._curGroupType = groupType

	local resource = {
		file = Path.getCSB("GroupsListView", "groups"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnCreate = {
				events = {{event = "touch", method = "_onBtnCreate"}}
			},
			_btnJoin = {
				events = {{event = "touch", method = "_onBtnJoin"}}
			},
		}
	}
	GroupsListView.super.ctor(self, resource)
end

function GroupsListView:onCreate()
	self._listDatas = {}

	local infos = GroupsDataHelper.getGroupInfos()
	self._groupInfos = {}
	local tabNameList = {}
	self._curTabIndex = 0
	for i, info in ipairs(infos) do
		table.insert(self._groupInfos, info.configInfo)
		table.insert(tabNameList, info.name)
		if info.configInfo.id == self._curGroupType then
			self._curTabIndex = i
		end
	end
	
	local param = {
		rootNode = self._scrollViewTab,
		containerStyle = 2,
		callback = handler(self, self._onTabSelect),
		textList = tabNameList
	}

	self._tabGroup:recreateTabs(param)

	self._listView:setTemplate(GroupsFixViewCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))

	self._commonFullScreen:setTitle(Lang.get("groups_team_title"))
	self._btnCreate:setString(Lang.get("groups_btn_create"))
	self._btnJoin:setString(Lang.get("groups_btn_join"))
end

function GroupsListView:onEnter()
	self._signalListGet = G_SignalManager:add(SignalConst.EVENT_GROUP_LIST_GET, handler(self, self._onGroupListGet))
	self._signalListUpdate = G_SignalManager:add(SignalConst.EVENT_GROUP_LIST_UPDATE, handler(self, self._onGroupListUpdate))
	self._signalApplyJoinSuccess = G_SignalManager:add(SignalConst.EVENT_GROUP_APPLY_JOIN_SUCCESS, handler(self, self._onApplyJoinSuccess))
	self._signalRejectMyApply = G_SignalManager:add(SignalConst.EVENT_GROUP_REJECT_MY_APPLY, handler(self, self._onRejectMyApply))
	self._signalApplyJoinTimeOut = G_SignalManager:add(SignalConst.EVENT_GROUP_APPLY_JOIN_TIME_OUT, handler(self, self._onApplyJoinTimeOut))
	self._signalDataReset = G_SignalManager:add(SignalConst.EVENT_GROUP_DATA_RESET, handler(self, self._onDataReset))

	self._tabGroup:setTabIndex(self._curTabIndex)
end

function GroupsListView:onExit()
	self._signalListGet:remove()
	self._signalListGet = nil
	self._signalListUpdate:remove()
	self._signalListUpdate = nil
	self._signalApplyJoinSuccess:remove()
	self._signalApplyJoinSuccess = nil
	self._signalRejectMyApply:remove()
	self._signalRejectMyApply = nil
	self._signalApplyJoinTimeOut:remove()
	self._signalApplyJoinTimeOut = nil
	self._signalDataReset:remove()
	self._signalDataReset = nil
end

function GroupsListView:_onTabSelect(index, sender)
	if self._curTabIndex == index then 
		return 
	end

	self._curTabIndex = index
	local groupType = self._groupInfos[self._curTabIndex].id
	self._curGroupType = groupType

	self:_updateList()
end

function GroupsListView:refreshView()
	self:_updateList()
end

function GroupsListView:_updateList()
	self:_updateListData()
	if #self._listDatas == 0 then
		self._listView:setVisible(false)
		self._textEmpty:setVisible(true)
	else
		self._listView:setVisible(true)
		self._textEmpty:setVisible(false)
		self._listView:clearAll()
		self._listView:resize(#self._listDatas)
	end
end

function GroupsListView:_updateListData()
	local unitData = G_UserData:getGroups():getGroupsUnitData(self._curGroupType)
	if unitData == nil then
		G_UserData:getGroups():c2sGetTeamsList(self._curGroupType)
	end
	self._listDatas = unitData and unitData:getDataList() or {}
end

function GroupsListView:_onItemUpdate(item, index)
	local itemData = self._listDatas[index+1]
	if itemData then
		item:updateUI(itemData)
	end
end

function GroupsListView:_onItemSelected(item, index)

end

function GroupsListView:_onItemTouch(index, t)
	local memberData = self._listDatas[index+1]
	local groupId = memberData:getTeam_id()
	local groupType = memberData:getTeam_type()
	local isOk, func = GroupsViewHelper.checkIsCanApplyJoin(groupType)
	if isOk == false then
		if func then
			func()
		end
		return
	end
	
	G_UserData:getGroups():c2sApplyTeam(groupType, groupId)
end

function GroupsListView:_onGroupListGet(event, teamType)
	if self._curGroupType ~= teamType then
		return 
	end
	self:_updateList()
end

function GroupsListView:_onGroupListUpdate(event, teamType)
	if self._curGroupType ~= teamType then
		return 
	end
	self:_updateList()
end

function GroupsListView:_onApplyJoinSuccess(event, teamType)
	if self._curGroupType ~= teamType then
		return 
	end
	self:_updateList()
end

function GroupsListView:_onRejectMyApply(event)
	self:_updateList()
end

function GroupsListView:_onApplyJoinTimeOut(event, teamType, teamId)
	if self._curGroupType ~= teamType then
		return 
	end
	self:_updateList()
end

function GroupsListView:_onDataReset()
	G_UserData:getGroups():c2sGetTeamsList(self._curGroupType)
end

function GroupsListView:_onBtnCreate()
	local groupType = self._curGroupType
	local isOk, func = GroupsViewHelper.checkIsCanCreate(groupType)
	if isOk == false then
		if func then
			func()
		end
		return
	end
	
	G_UserData:getGroups():c2sCreateTeam(groupType)
end

function GroupsListView:_onBtnJoin()
	local groupType = self._curGroupType
	local isOk, func = GroupsViewHelper.checkIsCanApplyJoin(groupType)
	if isOk == false then
		if func then
			func()
		end
		return
	end
	
	local memberId = 0
	G_UserData:getGroups():c2sApplyTeam(groupType, memberId)
end

return GroupsListView