local BaseData = require("app.data.BaseData")
local SvipData = class("SvipData", BaseData)


local schema = {}

SvipData.schema = schema

function SvipData:ctor(properties)
    SvipData.super.ctor(self, properties)
    self._recvGameAdmit = G_NetworkManager:add(MessageIDConst.ID_S2C_GameAdmit, handler(self, self._s2cGameAdmit))--获取个人军团信息
end

function SvipData:clear()
	self._recvGameAdmit:remove()
	self._recvGameAdmit = nil
end

function SvipData:reset()	
end

--请求消息
function SvipData:c2sGameAdmit(realName,birthday,phone,qq)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GameAdmit, 
    {
        real_name = realName,
        birthday = birthday,
        phone = phone,
        qq = qq,
    }) 
end


function SvipData:_s2cGameAdmit(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SUPER_VIP)
    G_SignalManager:dispatch(SignalConst.EVENT_SVIP_REGISTE_SUCCESS)
end

return SvipData