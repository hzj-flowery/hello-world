--个人竞技竞猜用的服务器数据
local BaseData = require("app.data.BaseData")
local SingleRaceGuessServerData = class("SingleRaceGuessServerData", BaseData)

local schema = {}
schema["server_id"] = {"number", 0}
schema["server_name"] = {"string", ""}
schema["power"] = {"number", 0}
schema["voted"] = {"boolean", false}
SingleRaceGuessServerData.schema = schema

function SingleRaceGuessServerData:ctor(properties)
	SingleRaceGuessServerData.super.ctor(self, properties)
	self._userDatas = {}
end

function SingleRaceGuessServerData:clear()
	
end

function SingleRaceGuessServerData:reset()
	self._userDatas = {}
	self:setPower(0)
end

function SingleRaceGuessServerData:initData(data)
	self:setServer_id(data:getServer_id())
	self:setServer_name(data:getServer_name())
	self._userDatas = {}
	self:setPower(0)
end

function SingleRaceGuessServerData:insertUser(user)
	table.insert(self._userDatas, user)
	local power = self:getPower()
	power = power + user:getPower()
	self:setPower(power)
end

function SingleRaceGuessServerData:getUserDatas()
	local result = clone(self._userDatas)
	table.sort(result, function(a, b)
		return a:getPower() > b:getPower()
	end)
	return result
end

return SingleRaceGuessServerData