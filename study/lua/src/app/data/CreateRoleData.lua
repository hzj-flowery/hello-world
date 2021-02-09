--聊天玩家数据
--@Author:Conley
local BaseData = import(".BaseData")
local CreateRoleData = class("CreateRoleData", BaseData)

local CACHE_FILENAME = "activationcode"

local schema = {}
CreateRoleData.schema = schema


function CreateRoleData:ctor(properties)
	CreateRoleData.super.ctor(self, properties)
end

-- 清除
function CreateRoleData:clear()
end

-- 重置
function CreateRoleData:reset()
end

function CreateRoleData:saveActivationCode(code)
    G_StorageManager:save(CACHE_FILENAME,{ code = code})
end

function CreateRoleData:getActivationCodeConfig()
    local data = G_StorageManager:load(CACHE_FILENAME) or {}
	if not data.code or data.code  == "" then
		return nil		
	end
    G_UserData:getCreateRole():saveActivationCode("")
	local AccountCode = require("app.config.accountcode")
	local config = AccountCode.get(data.code)
	--assert(config,"accountcode can't find id = "..tostring(data.code))
    return config
end

return CreateRoleData