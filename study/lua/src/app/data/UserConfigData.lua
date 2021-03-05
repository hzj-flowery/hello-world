--用户配置数据
--跟玩家id绑定
local BaseData = import(".BaseData")
local UserConfigData = class("UserConfigData", BaseData)

UserConfigData.FILE_NAME = "userconfig"

local schema = {}
UserConfigData.schema = schema

function UserConfigData:ctor(properties)
    UserConfigData.super.ctor(self, properties)
    self._data = {}
    self._isInit = false
end

-- 清除
function UserConfigData:clear()
end

-- 重置
function UserConfigData:reset()
    self._isInit = false
    self._data = {}
end



--从本地读取缓存
--前提：登陆并有玩家ID数据
function UserConfigData:_init()
    if self._isInit then
        return
    end
    self._isInit = true
    self._data = self:_getData()
end

function UserConfigData:getData()
    if #self._data == 0 and self._isInit == false then
        self:_init()
    end
    return self._data
end

function UserConfigData:flush()
    self:_saveData(self._data)
end

function UserConfigData:_saveData(data)
    G_StorageManager:setUserInfo("", G_UserData:getBase():getId())	
    G_StorageManager:saveWithUser(UserConfigData.FILE_NAME,data)
    self._data = data
end

function UserConfigData:_getData()
    G_StorageManager:setUserInfo("", G_UserData:getBase():getId())	
    self._data = G_StorageManager:loadUser(UserConfigData.FILE_NAME) or {}
    return self._data
end


--
function UserConfigData:getConfigValue(key)
    local data = self:getData()
    --dump(data)
    local dataValue = data[key]
    return dataValue
end


function UserConfigData:setConfigValue(key,value)
    local data = self:getData() 
    data[key] = value
    self:_saveData(data)
end


return UserConfigData