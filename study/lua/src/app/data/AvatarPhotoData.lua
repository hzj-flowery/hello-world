-- 
-- Author: Liangxu
-- Date: 2018-2-12 16:05:45
-- 变身卡图鉴数据

local BaseData = require("app.data.BaseData")
local AvatarPhotoData = class("AvatarPhotoData", BaseData)

local schema = {}
schema["avatar_photo"] = {"table", {}}
AvatarPhotoData.schema = schema

function AvatarPhotoData:ctor(properties)
	AvatarPhotoData.super.ctor(self, properties)

	self._recvGetActiveAvatarPhoto = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActiveAvatarPhoto, handler(self, self._s2cGetActiveAvatarPhoto))
	self._recvActiveAvatarPhoto = G_NetworkManager:add(MessageIDConst.ID_S2C_ActiveAvatarPhoto, handler(self, self._s2cActiveAvatarPhoto))
end

function AvatarPhotoData:clear()
	self._recvGetActiveAvatarPhoto:remove()
	self._recvGetActiveAvatarPhoto = nil
	self._recvActiveAvatarPhoto:remove()
	self._recvActiveAvatarPhoto = nil
end

function AvatarPhotoData:reset()

end

function AvatarPhotoData:isActiveWithId(id)
	local avatarPhoto = self:getAvatar_photo()
	for i, photoId in ipairs(avatarPhoto) do
		if photoId == id then
			return true
		end
	end
	return false
end

function AvatarPhotoData:_s2cGetActiveAvatarPhoto(id, message)
	local avatarPhoto = rawget(message, "avatar_photo") or {}
	self:setAvatar_photo(avatarPhoto)
end

function AvatarPhotoData:c2sActiveAvatarPhoto(id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActiveAvatarPhoto, {
		id = id,
	})
end

function AvatarPhotoData:_s2cActiveAvatarPhoto(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local photoId = rawget(message, "id") or 0

	G_SignalManager:dispatch(SignalConst.EVENT_AVATAR_PHOTO_ACTIVE_SUCCESS, photoId)
end

return AvatarPhotoData