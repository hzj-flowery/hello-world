-- Description: 粮车路径点
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-09-06

local BaseData = require("app.data.BaseData")
local GrainRoadPoint = class("GrainRoadPoint", BaseData)

local schema = {}
schema["mine_id"]				= {"number", 0} --矿点
schema["next_mine_id"]			= {"number", 0} --下一矿点
schema["enter_time"]			= {"number", 0} --进站时间
schema["leave_time"] 			= {"number", 0} --出站时间
schema["pre_leave_time"] 		= {"number", 0} --
schema["guild_id"] 		        = {"number", 0} --军团id
schema["guild_name"] 		    = {"string", 0} --军团名

GrainRoadPoint.schema = schema

function GrainRoadPoint:ctor(properties)
	GrainRoadPoint.super.ctor(self, properties)
end

function GrainRoadPoint:clear()
end

function GrainRoadPoint:reset()
end

function GrainRoadPoint:initData(msg)
    self:setProperties(msg)
end

function GrainRoadPoint:updateData(data)
end

function GrainRoadPoint:insertData(data)
end

function GrainRoadPoint:deleteData(data)
end

return GrainRoadPoint