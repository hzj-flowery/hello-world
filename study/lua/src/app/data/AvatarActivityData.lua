-- Author: nieming
-- Date:2018-04-13 11:30:48
-- Describle：

local BaseData = require("app.data.BaseData")
local AvatarActivityData = class("AvatarActivityData", BaseData)

local schema = {}
--schema
AvatarActivityData.schema = schema


function AvatarActivityData:ctor(properties)
	AvatarActivityData.super.ctor(self, properties)

	self._signalRecvAvatarActivity = G_NetworkManager:add(MessageIDConst.ID_S2C_AvatarActivity, handler(self, self._s2cAvatarActivity))

end

function AvatarActivityData:clear()

	self._signalRecvAvatarActivity:remove()
	self._signalRecvAvatarActivity = nil
end

function AvatarActivityData:reset()

end

-- Describle：
-- Param:
--	op_type   1: 投1次 2: 投5次
function AvatarActivityData:c2sAvatarActivity( op_type)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AvatarActivity, {
		op_type = op_type,
	})
end
-- Describle：
function AvatarActivityData:_s2cAvatarActivity(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_AVATAR_ACTIVITY_SUCCESS, message)
end




return AvatarActivityData
