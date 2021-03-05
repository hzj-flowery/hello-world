
-- Author: zhanglinsen
-- Date:2018-09-07 10:05:16
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupGroupsSelectedCell = import(".PopupGroupsSelectedCell")
local GroupsConst = require("app.const.GroupsConst")
local PopupGroupsSelectedView = class("PopupGroupsSelectedView", PopupBase)
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")

function PopupGroupsSelectedView:ctor(myMemberData)
	self._myMemberData = myMemberData

	local resource = {
		file = Path.getCSB("PopupGroupsSelectedView", "groups"),
		binding = {
			_commonBtn1 = {
				events = {{event = "touch", method = "_onCommonBtn1"}}
			},
			_commonBtn2 = {
				events = {{event = "touch", method = "_onCommonBtn2"}}
			},
		},
	}
	PopupGroupsSelectedView.super.ctor(self, resource)
end

function PopupGroupsSelectedView:onCreate()
	self:_initData()
	self:_initView()
end

function PopupGroupsSelectedView:_initData()
	self._selectIdx = 0
	self._memberData = self._myMemberData:getGroupData()
	local targetId = self._memberData:getTeam_target()
	self._configInfo = GroupsDataHelper.getTeamTargetConfig(targetId)
end

function PopupGroupsSelectedView:_initView()
	self._panelBg:setTitle(Lang.get("groups_target_title"))
	self._panelBg:setCloseVisible(true)
	self._panelBg:addCloseEventListener(handler(self,self._onCloseClick))

	self._listView:setTemplate(PopupGroupsSelectedCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))

	self._txtTitle1:setString(Lang.get("groups_team_target"))
	self._txtTitle2:setString(Lang.get("groups_level_limit"))
	self._commonBtn1:setString(Lang.get("groups_target_cancel"))
	self._commonBtn2:setString(Lang.get("groups_target_change"))
end

function PopupGroupsSelectedView:onEnter()
	self._signalSetChangeSuccess = G_SignalManager:add(SignalConst.EVENT_GROUP_SET_CHANGE_SUCCESS, handler(self, self._onSetChangeSuccess))

	self:_updateTargetData()
	self:_updateTargetList()

	self:_updateLevelData()
end

function PopupGroupsSelectedView:onExit()
	self._signalSetChangeSuccess:remove()
	self._signalSetChangeSuccess = nil
end

function PopupGroupsSelectedView:_updateTargetData()
	self._targetDatas = {}
	local groupsType = self._memberData:getTeam_type()
	local teamInfo = GroupsDataHelper.getTeamInfoConfig(groupsType)
	local targetIds = string.split(teamInfo.target, "|")
	for k, id in ipairs(targetIds) do
		local teamTargetInfo = GroupsDataHelper.getTeamTargetConfig(tonumber(id))
		table.insert(self._targetDatas, teamTargetInfo)
	end

	local target = self._memberData:getTeam_target()
	self._selectIdx = 0
	for i, v in ipairs(self._targetDatas) do
		if v.target == target then
			self._selectIdx = i
		end	
	end
	
	for i,v in ipairs(self._targetDatas) do
		if v.target == target then
			v.isSelected = true
		else
			v.isSelected = false
		end	
	end
end

function PopupGroupsSelectedView:_updateTargetList()
	self._listView:clearAll()
	self._listView:resize(#self._targetDatas)
end

function PopupGroupsSelectedView:_updateLevelData()
	local minLevel = self._memberData:getMin_level()
	local maxLevel = self._memberData:getMax_level()

	self._levelDatas = {}
	for i = self._configInfo.level_min, self._configInfo.level_max do
		table.insert(self._levelDatas, i)
	end

	self._selectedTop:updateUI(self._levelDatas, minLevel)
	self._selectedBottom:updateUI(self._levelDatas, maxLevel)
end

function PopupGroupsSelectedView:_onCloseClick()
	self:close()
end

function PopupGroupsSelectedView:_onCommonBtn1()
	self:close()
end

function PopupGroupsSelectedView:_onCommonBtn2()
	local top = tonumber(self._selectedTop:getSelectData()) 
	local bottom = tonumber(self._selectedBottom:getSelectData())

	if not top or not bottom then
		G_Prompt:showTip(Lang.get("groups_tips_27"))
		return
	end
	local max = math.max(top,bottom)
	local min = math.min(top,bottom)

	local itemData = self._targetDatas[self._selectIdx]
	local isAuto = self._myMemberData:isTeam_auto()
	G_UserData:getGroups():c2sChangeTeamSet(itemData.target, min, max, isAuto)
end

function PopupGroupsSelectedView:_onItemUpdate(item, index)
	local itemData = self._targetDatas[index+1]
	if itemData then
		item:updateUI(itemData)
	end
end

function PopupGroupsSelectedView:_onItemSelected(item, index)

end

function PopupGroupsSelectedView:_onItemTouch(index, item, isSelected)
	local data = self._targetDatas[index+1]
	local items = self._listView:getItems()
	if not items then 
		return 
	end
	self._selectIdx = index+1
	for k,v in ipairs(items) do
		if v:getTag() ~= index then
			local itemData = self._targetDatas[v:getTag()+1]
			itemData.isSelected = false
			v:updateUI(itemData)
		end	
	end

	data.isSelected = true
	item:updateUI(data)
end

function PopupGroupsSelectedView:_onSetChangeSuccess()
	self:close()
end

return PopupGroupsSelectedView