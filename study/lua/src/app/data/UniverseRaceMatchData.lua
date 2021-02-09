--真武战神比赛数据
local BaseData = require("app.data.BaseData")
local UniverseRaceMatchData = class("UniverseRaceMatchData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0}
schema["position"] = {"number", 0}
schema["atk_user_support"] = {"number", 0}
schema["def_user_support"] = {"number", 0}
schema["hide"] = {"number", 0} --0显示，1隐藏
UniverseRaceMatchData.schema = schema

function UniverseRaceMatchData:ctor(properties)
	UniverseRaceMatchData.super.ctor(self, properties)
end

function UniverseRaceMatchData:clear()
	
end

function UniverseRaceMatchData:reset()
	
end

function UniverseRaceMatchData:updateData(data)
	self:setProperties(data)

	local hide = rawget(data, "hide") or 0
	local userId = rawget(data, "user_id") or 0
	if hide == 0 and userId > 0 then --此位置的玩家是显示的，说明该玩家站在此位置，所以更新position
		local userData = G_UserData:getUniverseRace():getUserDataWithId(userId)
		if userData then
			local position = rawget(data, "position") or 0
			userData:updatePosition(position)
		end
	end
end

function UniverseRaceMatchData:isHide()
	return self:getHide() == 1
end

function UniverseRaceMatchData:updateSupportNum(userId, addNum)
	local position = self:getPosition()
	local prePos = G_UserData:getUniverseRace():getPrePosOfPos(position)
	local userData1 = G_UserData:getUniverseRace():getUserDataWithPosition(prePos[1])
	local userData2 = G_UserData:getUniverseRace():getUserDataWithPosition(prePos[2])
	if userData1:getUser_id() == userId then
		local supportNum = self:getAtk_user_support() + addNum
		self:setAtk_user_support(supportNum)
	elseif userData2:getUser_id() == userId then
		local supportNum = self:getDef_user_support() + addNum
		self:setDef_user_support(supportNum)
	else
		logError(string.format("UniverseRaceMatchData:updateSupportNum is wrong, position = %d, userId = %d, addNum = %d", position, userId, addNum))
	end
end

return UniverseRaceMatchData