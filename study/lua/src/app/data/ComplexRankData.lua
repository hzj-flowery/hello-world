--[[
    ComplexRankData
]]
local BaseData = require("app.data.BaseData")

local ComplexRankData = class("ComplexRankData", BaseData)
local ComplexRankConst = require("app.const.ComplexRankConst")
--[[

	//综合排行榜
	ID_C2S_GetUserLevelRank = 30500;
	ID_S2C_GetUserLevelRank = 30501;
	ID_C2S_GetUserPowerRank = 30502;
	ID_S2C_GetUserPowerRank = 30503;
	ID_C2S_GetStageStarRank = 30504;
	ID_S2C_GetStageStarRank = 30505;
	ID_C2S_GetTowerStarRank	= 30506;
	ID_S2C_GetTowerStarRank	= 30507;
	ID_C2S_GetRebelArmyHurtRank= 30508;
	ID_S2C_GetRebelArmyHurtRank= 30509;
	ID_C2S_GetRebelArmyGuildHurtRank= 30510;
	ID_S2C_GetRebelArmyGuildHurtRank= 30511;
	ID_C2S_GetUserActivePhotoRank
	ID_S2C_GetUserActivePhotoRank
]]
function ComplexRankData:ctor(properties)
	ComplexRankData.super.ctor(self, properties)

	self._shopList = {}
	self._recvGetUserLevelRank =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserLevelRank, handler(self, self._s2cGetUserLevelRank))
	self._recvGetUserPowerRank =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserPowerRank, handler(self, self._s2cGetUserPowerRank))

	self._recvGetArenaTopInfo =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetArenaTopInfo, handler(self, self._s2cGetArenaTopInfo))

	self._recvGetStageStarRank =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetStageStarRank, handler(self, self._s2cGetStageStarRank))

	self._recvGetTowerStarRank =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetTowerStarRank, handler(self, self._s2cGetTowerStarRank))

	self._recvGetActivePhotoRank =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserActivePhotoRank, handler(self, self._s2cGetActivePhotoRank))

	self._recvGetUserAvaterPhotoRank =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserAvaterPhotoRank, handler(self, self._s2cGetUserAvaterPhotoRank))

	self._recvGetGuildRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildRank, handler(self, self._s2cGetGuildRank))
end

function ComplexRankData:clear()
	-- body
	self._recvGetUserLevelRank:remove()
	self._recvGetUserLevelRank = nil

	self._recvGetUserPowerRank:remove()
	self._recvGetUserPowerRank = nil

	self._recvGetArenaTopInfo:remove()
	self._recvGetArenaTopInfo = nil

	self._recvGetStageStarRank:remove()
	self._recvGetStageStarRank = nil

	self._recvGetTowerStarRank:remove()
	self._recvGetTowerStarRank = nil

	self._recvGetGuildRank:remove()
	self._recvGetGuildRank = nil

	self._recvGetActivePhotoRank:remove()
	self._recvGetActivePhotoRank = nil

	self._recvGetUserAvaterPhotoRank:remove()
	self._recvGetUserAvaterPhotoRank = nil
end

function ComplexRankData:reset(...)
	-- body
end

function ComplexRankData:c2sGetUserRankByType(typeIndex)
	if typeIndex == ComplexRankConst.USER_LEVEL_RANK then --1
		self:c2sGetUserLevelRank()
	elseif typeIndex == ComplexRankConst.USER_POEWR_RANK then --2
		self:c2sGetUserPowerRank()
	elseif typeIndex == ComplexRankConst.USER_ARENA_RANK then --3
		self:c2sGetArenaTopInfo()
	elseif typeIndex == ComplexRankConst.STAGE_STAR_RANK then -- 4
		local ChapterConst = require("app.const.ChapterConst")
		self:c2sGetStageStarRank(ChapterConst.CHAPTER_TYPE_NORMAL)
	elseif typeIndex == ComplexRankConst.ELITE_STAR_RANK then -- 5
		local ChapterConst = require("app.const.ChapterConst")
		self:c2sGetStageStarRank(ChapterConst.CHAPTER_TYPE_ELITE)
	elseif typeIndex == ComplexRankConst.TOWER_STAR_RANK then --叛军排行
		self:c2sGetTowerStarRank()
	elseif typeIndex == ComplexRankConst.USER_GUILD_RANK then --7 --军团
		self:c2sGetGuildRank()
	elseif typeIndex == ComplexRankConst.ACTIVE_PHOTO_RANK then
		self:c2sGetActivePhotoRank()
	elseif typeIndex == ComplexRankConst.AVATAR_PHOTO_RANK then
		self:c2sGetUserAvaterPhotoRank()
	end
end

function ComplexRankData:c2sGetUserLevelRank()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserLevelRank, {})
end

function ComplexRankData:c2sGetUserPowerRank()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserPowerRank, {})
end

function ComplexRankData:c2sGetArenaTopInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetArenaTopInfo, {})
end

function ComplexRankData:c2sGetStageStarRank(rankType)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_GetStageStarRank,
		{
			rank_type = rankType
		}
	)
end

function ComplexRankData:c2sGetTowerStarRank()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTowerStarRank, {})
end

function ComplexRankData:c2sGetGuildRank()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetGuildRank, {})
end

function ComplexRankData:c2sGetActivePhotoRank()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserActivePhotoRank, {})
end

function ComplexRankData:c2sGetUserAvaterPhotoRank()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserAvaterPhotoRank, {})
end

--[[
function ComplexRankData:c2sGetRebelArmyGuildHurtRank()
    G_NetworkManager:send(MessageConst.ID_C2S_GetRebelArmyGuildHurtRank, {})
end
]]
function ComplexRankData:_s2cGetUserLevelRank(id, message)
	if message.ret ~= 1 then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_LEVEL_RANK, message)
end

function ComplexRankData:_s2cGetUserPowerRank(id, message)
	if message.ret ~= 1 then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_POWER_RANK, message)
end

function ComplexRankData:_s2cGetArenaTopInfo(id, message)
	if message.ret ~= 1 then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_ARENA_RANK, message)
end

function ComplexRankData:_s2cGetStageStarRank(id, message)
	if message.ret ~= 1 then
		return
	end
	local ChapterConst = require("app.const.ChapterConst")

	local rankType = rawget(message, "rank_type")
	if rankType then
		if rankType == ChapterConst.CHAPTER_TYPE_NORMAL then
			G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_STAGE_STAR_RANK, message)
		elseif rankType == ChapterConst.CHAPTER_TYPE_ELITE then
			G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_ELITE_STAR_RANK, message)
		end
	end
end

function ComplexRankData:_s2cGetTowerStarRank(id, message)
	if message.ret ~= 1 then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_TOWER_STAR_RANK, message)
end

function ComplexRankData:_s2cGetActivePhotoRank(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_ACTIVE_PHOTO_RANK, message)
end

function ComplexRankData:_s2cGetUserAvaterPhotoRank(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_USER_AVATAR_PHOTO_RANK, message)
end

function ComplexRankData:_s2cGetGuildRank(id, message)
	if message.ret ~= 1 then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_COMPLEX_GUILD_RANK, message)
end

return ComplexRankData
