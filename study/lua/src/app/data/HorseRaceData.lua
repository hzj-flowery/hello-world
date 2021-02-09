local BaseData = require("app.data.BaseData")
local HorseRaceData = class("HorseRaceData", BaseData)


local schema = {}
schema["horseSoul"] = {"number", 0} 	--今天获得的马魂
schema["horseBook"] = {"number", 0}		--今天获得的马经
schema["raceCount"] = {"number", 0}		--今天跑酷的次数
HorseRaceData.schema = schema

function HorseRaceData:ctor(properties)
	HorseRaceData.super.ctor(self, properties)
	self._token = 0
	self._recvWarHorseRide = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseRide, handler(self, self._s2cWarHorseRide))
	self._recvWarHorseRideInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseRideInfo, handler(self, self._s2cWarHorseRideInfo))
	self._recvWarHorseRideStart = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseRideStart, handler(self, self._s2cWarHorseRideStart))

end

function HorseRaceData:clear()
	self._recvWarHorseRide:remove()
	self._recvWarHorseRide = nil

	self._recvWarHorseRideInfo:remove()
	self._recvWarHorseRideInfo = nil

	self._recvWarHorseRideStart:remove()
	self._recvWarHorseRideStart = nil
end

function HorseRaceData:reset()
end

function HorseRaceData:c2sWarHorseRide(runDistance, point)
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseRide, {
		distance = runDistance,
		score = point,
		token = self._token
	})
end

function HorseRaceData:_s2cWarHorseRide(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setHorseSoul(message.ride_info.horse_soul)
	self:setHorseBook(message.ride_info.horse_book)
	self:setRaceCount(message.ride_info.num)
	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_RACE_RIDE_END, message.awards)
end

function HorseRaceData:c2sWarHorseRideInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseRideInfo, {
	})
end

function HorseRaceData:_s2cWarHorseRideInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:resetTime()
	self:setHorseSoul(message.ride_info.horse_soul)
	self:setHorseBook(message.ride_info.horse_book)
	self:setRaceCount(message.ride_info.num)
	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_RACE_RIDE_INFO)
end

function HorseRaceData:c2sWarHorseRideStart()
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseRideStart, {
	})
end

function HorseRaceData:_s2cWarHorseRideStart(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self._token = message.token
	print("1112233 token = ", self._token )
	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_RACE_TOKEN)
end



return HorseRaceData