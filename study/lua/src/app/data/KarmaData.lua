--
-- Author: Liangxu
-- Date: 2017-03-24 11:15:23
-- 缘分数据
local BaseData = require("app.data.BaseData")
local KarmaData = class("KarmaData", BaseData)

local schema = {}
schema["hero_base_id"] = {"table", {}}
schema["destiny_id"] = {"table", {}}
KarmaData.schema = schema

function KarmaData:ctor(properties)
	KarmaData.super.ctor(self, properties)

	self._heroBaseIds = {}
	self._destinyIds = {}
	self._recvGetDestiny = G_NetworkManager:add(MessageIDConst.ID_S2C_GetDestiny, handler(self, self._s2cGetDestiny))
	self._recvHeroActiveDestiny = G_NetworkManager:add(MessageIDConst.ID_S2C_HeroActiveDestiny, handler(self, self._s2cHeroActiveDestiny))
end

function KarmaData:clear()
	self._recvGetDestiny:remove()
	self._recvGetDestiny = nil
	self._recvHeroActiveDestiny:remove()
	self._recvHeroActiveDestiny = nil
end

function KarmaData:reset()
	self._heroBaseIds = {}
	self._destinyIds = {}
end

function KarmaData:_s2cGetDestiny(id, message)
	self._heroBaseIds = {}
	self._destinyIds = {}

	local heroBaseIds = rawget(message, "hero_base_id") or {}
	self:setHero_base_id(heroBaseIds)
	for i, baseId in ipairs(heroBaseIds) do
		self._heroBaseIds["k_"..tostring(baseId)] = true
	end

	local destinyIds = rawget(message, "destiny_id") or {}
	self:setDestiny_id(destinyIds)
	for i, destinyId in ipairs(destinyIds) do
		self._destinyIds["k_"..tostring(destinyId)] = true
	end
end

function KarmaData:insertData(data)
    self._heroBaseIds["k_"..tostring(data.base_id)] = true

    local heroBaseIds = self:getHero_base_id()
    table.insert(heroBaseIds, data.base_id)
    self:setHero_base_id(heroBaseIds)
end

--是否已经激活
function KarmaData:isActivated(id)
	local is = self._destinyIds["k_"..tostring(id)]
	if is == nil then
		return false
	end
	return is
end

function KarmaData:isHaveHero(baseId)
	local is = self._heroBaseIds["k_"..tostring(baseId)]
	if is == nil then
		return false
	end
	return is
end

--激活缘分
function KarmaData:c2sHeroActiveDestiny(heroId, destinyId, heroUid)
	G_NetworkManager:send(MessageIDConst.ID_C2S_HeroActiveDestiny, {
		hero_uid = heroUid,
		hero_base_id = heroId,
		destiny_id = destinyId
	})
end

function KarmaData:_s2cHeroActiveDestiny(id, message)
	if message.ret == MessageErrorConst.RET_OK then
		local destinyId = message.destiny_id
		self._destinyIds["k_"..tostring(destinyId)] = true

		local destinyIds = self:getDestiny_id()
	    table.insert(destinyIds, destinyId)
	    self:setDestiny_id(destinyIds)

		G_SignalManager:dispatch(SignalConst.EVENT_HERO_KARMA_ACTIVE_SUCCESS, destinyId)
		-- G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HERO_KARMA)
	end
end

return KarmaData