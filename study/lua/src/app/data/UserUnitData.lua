local BaseData = require("app.data.BaseData")
local UserUnitData = class("UserUnitData", BaseData)
local schema = {}
schema["id"] 					= {"number", 0}
schema["name"] 					= {"string", ""}
schema["level"] 				= {"number", 0}
schema["exp"]					= {"number", 0}
schema["create_time"] 			= {"number", 0}
schema["power"] 				= {"number", 0}
schema["officer_level"] 		= {"number", 0}
schema["server_name"]				= {"string", ""}
schema["change_name_count"]			= {"number", 0}
schema["recharge_total"]            = {"number", 0}
schema["guide_id"]				= {"number", 0}
schema["today_init_level"]			= {"number", 0}	--今天上线时等级
schema["server_open_time"]			= {"number", 0}	--开服时间
schema["avatar_base_id"]			= {"number", 0} --变身卡baseId
schema["avatar_id"]					= {"number", 0} --变身卡Id
schema["on_team_pet_id"]			= {"number", 0} --上阵神兽id
schema["order_state"]           = {"number", 0} --公测预约




UserUnitData.schema = schema

function UserUnitData:ctor(properties)
	UserUnitData.super.ctor(self)

	if properties then
		self:updateData(properties)
	end
end

function UserUnitData:clear()
	
end

function UserUnitData:reset()
	
end

function UserUnitData:updateData(data)
	self:setProperties(data)

	
end

return UserUnitData