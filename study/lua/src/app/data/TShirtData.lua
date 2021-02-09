
local BaseData = require("app.data.BaseData")
local TShirtData = class("TShirtData", BaseData)

--T恤基础数据
local schema = {}
schema["real_name"] 	= {"string", ""} -- 真名
schema["tel"] 			= {"string", ""} -- 电话
schema["address"]		= {"string", ""}  --地址
schema["cloth_size"]	= {"string", ""} -- 尺寸

local TShirtUnitData = class("TShirtUnitData", BaseData)
TShirtUnitData.schema = schema

function TShirtUnitData:ctor(properties)
    TShirtUnitData.super.ctor(self, properties)
end

function TShirtUnitData:updateData(data)
    self:setProperties(data)
end
------------------------------------------------------

function TShirtData:ctor(properties)
    TShirtData.super.ctor(self, properties)

    self._tShirtInfo = nil
    self._restNum = 0 --剩余数量

    self._recvGetUserTShirtInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUserTShirtInfo, handler(self, self._s2cGetUserTShirtInfo))
    self._recvTShirtInfoCommit = G_NetworkManager:add(MessageIDConst.ID_S2C_TShirtInfoCommit, handler(self, self._s2cTShirtInfoCommit))
    self._recvTShirtNumChange = G_NetworkManager:add(MessageIDConst.ID_S2C_TShirtNumChange, handler(self, self._s2cTShirtNumChange))
end

function TShirtData:clear()
    self._recvGetUserTShirtInfo:remove()
    self._recvGetUserTShirtInfo = nil
    self._recvTShirtInfoCommit:remove()
    self._recvTShirtInfoCommit = nil
    self._recvTShirtNumChange:remove()
    self._recvTShirtNumChange = nil
end

function TShirtData:reset()
	self._tShirtInfo = nil
    self._restNum = 0 --剩余数量
end

function TShirtData:_updateTShirtInfo(data)
    if data == nil then
        return
    end
    if self._tShirtInfo == nil then
        self._tShirtInfo = TShirtUnitData.new()
    end
    self._tShirtInfo:updateData(data)
end

function TShirtData:getTShirtInfo()
    return self._tShirtInfo
end

function TShirtData:getRestNum()
    return self._restNum
end

--是否已经登记
function TShirtData:isRegistered()
    if self._tShirtInfo == nil then
        return false
    else
        return true
    end
end

--是否已经抢完
function TShirtData:isEmpty()
    return self._restNum <= 0
end

function TShirtData:isOpen()
    if G_ConfigManager:isOpenTShirt() == false then
        return false
    end

    local UserDataHelper = require("app.utils.UserDataHelper")
    local limitNum = UserDataHelper.getParameter(G_ParameterIDConst.TSHIRT_LIMIT)
    local myNum = G_UserData:getBase():getRecharge_total()
    return myNum >= limitNum
end

function TShirtData:c2sGetUserTShirtInfo()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetUserTShirtInfo, {})
end

function TShirtData:_s2cGetUserTShirtInfo(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end
    local tShirt = rawget(message, "tShirt")
    local restNum = rawget(message, "rest_num") or 0

    self:_updateTShirtInfo(tShirt)
    self._restNum = restNum

    G_SignalManager:dispatch(SignalConst.EVENT_TSHIRT_GET_INFO)
end

function TShirtData:c2sTShirtInfoCommit(tShirtInfo)
    G_NetworkManager:send(MessageIDConst.ID_C2S_TShirtInfoCommit, {
        tShirt = tShirtInfo
    })
end

function TShirtData:_s2cTShirtInfoCommit(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end
    local tShirt = rawget(message, "tShirt")
    self:_updateTShirtInfo(tShirt)

    G_SignalManager:dispatch(SignalConst.EVENT_TSHIRT_COMMIT_SUCCESS)
end

function TShirtData:_s2cTShirtNumChange(id, message)
    local restNum = rawget(message, "rest_num") or 0
    self._restNum = restNum
    G_SignalManager:dispatch(SignalConst.EVENT_TSHIRT_REST_NUM_CHANGE)
end

return TShirtData