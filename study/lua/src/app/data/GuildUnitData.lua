--
-- Author: Liangxu
-- Date: 2017-06-20 15:56:18
-- 军团单元数据
local BaseData = require("app.data.BaseData")
local GuildUnitData = class("GuildUnitData", BaseData)

local schema = {}
schema["id"] 				= {"number", 0} --军团id
schema["name"] 				= {"string", ""} --军团名称
schema["level"] 			= {"number", 0} --军团等级
schema["exp"] 				= {"number", 0} --军团经验
schema["announcement"] 		= {"string", ""} --公告
schema["declaration"] 		= {"string", ""} --宣言
schema["leader"] 			= {"number", 0} --会长id
schema["member_num"] 		= {"number", 0} --军团人数
schema["dungeon_score"] 	= {"number", 0} --军团贡献
schema["icon"] 				= {"number", 0} --军团图标
schema["guild_rank"] 		= {"number", 0} --军团排名
schema["created"] 			= {"number", 0} --创建时间
schema["leader_name"]		= {"string", ""} --会长名字
schema["has_application"] 	= {"boolean", false} --是否已经有入会申请
schema["impeach_time"]		= {"number", 0} --弹劾时间
schema["leader_base_id"]		= {"number", 0} --会长BaseID
schema["daily_total_exp"]		= {"number", 0} --每日累计经验
schema["active_days"]		= {"number", 0} --活跃天数（个人自己的）
schema["donate_point"]		= {"number", 0}   --捐献积分
schema["leader_officer_level"]		= {"number", 0}   --会长officer_level
schema["leader_avater_base_id"]		= {"number", 0}   --会长avater
schema["leader_player_info"] 	= {"table",nil} --玩家信息
schema["answer_time"] 	= {"number",3} --公会答题时间
schema["answer_time_reset_cnt"] 	= {"number",0} --公会答题时间重置次数
schema["mine_born_id"] 		= 	{"number", 0}			--出生矿坑id
schema["kick_member_cnt"] 		= 	{"number", 0}		--公会踢人次数
schema["war_declare_time"] 		= 	{"number", 0}		--军团宣战时间
schema["icon_list"]		= {"table", {}} --军团图标列表 // [id1,过期时间1  id2,过期时间2 id3,过期时间3]
schema["last_icon"] 		= 	{"number", 0}		--军团宣战时间


--	repeated IntMap daily_part_count = 18; //每个玩法的累计人数
--	repeated IntMap daily_part_exp = 19; //每个玩法的累计经验
--	repeated Award	 week_pay = 20; //每周工资 （个人自己的）

GuildUnitData.schema = schema

function GuildUnitData:ctor(properties)
	GuildUnitData.super.ctor(self, properties)

	if properties then
		local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(properties)
		self:setLeader_player_info(playerInfo)
	end

	self._guildTaskList = {}--军团任务列表
	self._myWeekWageItems = {}--周工资
end

function GuildUnitData:clear()
end

function GuildUnitData:reset()
	self._guildTaskList = {}--军团任务列表
end

--只有自己军团才有任务数据
function GuildUnitData:initTaskData(message)
	self:_createGuildTaskDatas()
	self:_updateGuildTaskDatas(message)
	local awardList = rawget(message,"week_pay") or {}
	self._myWeekWageItems = {}
	for k,v in ipairs(awardList) do
		table.insert( self._myWeekWageItems, { type = v.type,value = v.value,size = v.size } )
	end

	local data = {}
	local guildIconList = self:getIcon_list()
    for k, v in pairs(guildIconList) do
        local infoArray = string.split(v, ",")
        local id = tonumber(infoArray[1])
		local time = tonumber(infoArray[2])
		
		data[id] = time
	end
	
	self:setIcon_list(data)
end

function GuildUnitData:_createGuildTaskDatas()
	self._guildTaskList = {}--军团任务列表
	local GuildWagesType = require("app.config.guild_wages_type")
	local GuildTaskUnitData = require("app.data.GuildTaskUnitData")
	for index = 1,GuildWagesType.length(),1 do
		local config = GuildWagesType.indexOf(index)
		local data = GuildTaskUnitData.new()
		data:initData(config)
		self._guildTaskList[config.type] = data
	end
end

function GuildUnitData:getGuildTaskUnitData(id)
	return self._guildTaskList[id]
end

function GuildUnitData:_updateGuildTaskDatas(message)
	--repeated IntMap daily_part_count = 18; //每个玩法的累计人数
	--repeated IntMap daily_part_exp = 19; //每个玩法的累计经验
	--repeated Award	 week_pay = 20; //每周工资 （个人自己的）
	local dailyPartCount = rawget(message,"daily_part_count") or {}
	local dailyPartExp = rawget(message,"daily_part_exp") or {}
	local weekRewards = rawget(message,"week_pay") or {}
	for k,v in ipairs(dailyPartCount) do
		local unitData = self:getGuildTaskUnitData(v.Key)
		if unitData then
			local maxValue = unitData:getConfig().max_active
			unitData:setPeople(math.min(maxValue,v.Value))
		end
	end
	for k,v in ipairs(dailyPartExp) do
		local unitData = self:getGuildTaskUnitData(v.Key)
		if unitData then
    		unitData:setExp(v.Value)
		end
	end
end

function GuildUnitData:getSortedTaskDataList()
	local listData = {}
	for k,v in pairs(self._guildTaskList) do
		table.insert( listData, v )
	end
	--排序
	local sortfunction = function(obj1,obj2)
		return obj1:getConfig().index <  obj2:getConfig().index
	end
	table.sort( listData, sortfunction )
	return listData
end

function GuildUnitData:getWeekWageItems()
	return self._myWeekWageItems
end

function GuildUnitData:getTaskDataList()
	return self._guildTaskList
end

return GuildUnitData
