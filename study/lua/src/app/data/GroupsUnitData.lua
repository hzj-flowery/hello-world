--
-- 某类活动的队伍总数据
-- Author: zhanglinsen
-- Date: 2018-08-30 10:05:31
-- 
local BaseData = require("app.data.BaseData")
local GroupsUnitData = class("GroupsUnitData", BaseData)

local GroupsConst = require("app.const.GroupsConst")
local GroupsMemberData = require("app.data.GroupsMemberData")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")

local schema = {}
GroupsUnitData.schema = schema

function GroupsUnitData:ctor(properties)
	GroupsUnitData.super.ctor(self, properties)

	self._memberList = {}
end

function GroupsUnitData:clear()
	self._memberList = {}
end

function GroupsUnitData:reset()
	self._memberList = {}
end

-- 检测玩法是否包含目标队伍数据
function GroupsUnitData:getMemberData(teamId)
	return self._memberList[teamId]
end

--所有可以显示的组队信息
function GroupsUnitData:getDataList()
	local sortFunc = function(a, b)
		if a:isIs_scene() ~= b:isIs_scene() then
			return a:isIs_scene() == false
		elseif a:getTeam_id() ~= b:getTeam_id() then
			return a:getTeam_id() < b:getTeam_id() --id小的创建时间早
		else
			return a:getUserCount() > b:getUserCount()
		end
	end 

	local dataList = {}
	for k, data in pairs(self._memberList) do
		if not data:isFull() then
			table.insert(dataList, data)
		end
	end
	table.sort(dataList, sortFunc)

	return dataList
end

--更新所有组队信息
--@param groups 所有队伍信息
function GroupsUnitData:updateData(teams)
	for i, team in ipairs(teams) do
		local teamId = rawget(team, "team_id") or 0
		local memberData = self:getMemberData(teamId)
		if memberData == nil then
			memberData = GroupsMemberData.new()
		end
		memberData:updateData(team)
		self._memberList[teamId] = memberData
	end
end

--删除队伍组队信息
--@param delId 删除队伍id
function GroupsUnitData:removeGroupData(delId)
	self._memberList[delId] = nil
end

function GroupsUnitData:updateApplicationTime(appTeams)
	for i, appTeam in ipairs(appTeams) do
		local teamId = appTeam.team_id
		local appTime = appTeam.app_time
		local memberData = self:getMemberData(teamId)
		if memberData then
			local teamType = memberData:getTeam_type()
			local refuseJoinTime = GroupsDataHelper.getTeamInfoConfig(teamType).refuse_join_time
			memberData:setApplyEndTime(appTime + refuseJoinTime)
		end
	end
end


return GroupsUnitData