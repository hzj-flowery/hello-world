-- Author: nieming
-- Date:2018-04-25 14:37:30
-- Describle：单个仇人信息

local BaseData = require("app.data.BaseData")
local EnemyUnitData = class("EnemyUnitData", BaseData)
local UserDataHelper = require("app.utils.UserDataHelper")
local schema = {}
--schema
schema["uid"] = {"number", 0}
schema["name"] = {"string", ""}
schema["level"] = {"number", 0}
schema["vip"] = {"number", 0}
schema["online"] = {"number", 0} --离线时间  0 表示在线  >0 离线
schema["power"] = {"number", 0}
schema["guild_name"] = {"string", ""}
schema["guild_id"] = {"number", 0}
schema["office_level"] = {"number", 0}
schema["enemy_value"] = {"number", 0} --仇恨值
schema["mine_name"] = {"string", ""} --矿区名字
schema["covertId"] = {"number", 0} -- 转换变身卡id
schema["head_frame_id"] = {"number",0}
EnemyUnitData.schema = schema


function EnemyUnitData:ctor(properties)
	EnemyUnitData.super.ctor(self, properties)

end

function EnemyUnitData:clear()

end

function EnemyUnitData:reset()

end

function EnemyUnitData:updateData(messageData)
	self:setProperties(messageData)
	local covertId = UserDataHelper.convertAvatarId(messageData)
	if covertId then
		self:setCovertId(covertId)
	end
end



return EnemyUnitData
