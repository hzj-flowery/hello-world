

--百大军团排行数据
--@Author:Conley

local BaseData = require("app.data.BaseData")
local ActivityGuildSprintRankUnitData = class("ActivityGuildSprintRankUnitData", BaseData)

local schema = {}
schema["rank"]  		= {"number",0}--
schema["guild_name"]  	= {"string", ""}--
schema["guild_leader_name"] 	= {"string",""}--
schema["guild_leader_office_level"] = {"number",0}--

ActivityGuildSprintRankUnitData.schema = schema

function ActivityGuildSprintRankUnitData:ctor(properties)
	ActivityGuildSprintRankUnitData.super.ctor(self)
    if properties then
        self:initData(properties)
    end
    
end

-- 清除
function ActivityGuildSprintRankUnitData:clear()
   
end

-- 重置
function ActivityGuildSprintRankUnitData:reset()
end

function ActivityGuildSprintRankUnitData:initData(properties)
    self:setProperties(properties)
end


return ActivityGuildSprintRankUnitData

