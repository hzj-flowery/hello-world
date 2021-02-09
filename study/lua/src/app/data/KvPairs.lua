
local BaseData = require("app.data.BaseData")
local KvPairs = class("KvPairs", BaseData)

local schema = {}
KvPairs.schema = schema

function KvPairs:ctor(properties)
	KvPairs.super.ctor(self, properties)

	self._mapData = {}
end

function KvPairs:clear()
end

function KvPairs:reset()
end


function KvPairs:initData(message)
    local data = {}
    local parameter = rawget(message,"parameter") or {}
    for k,v in ipairs(parameter) do
        local key = rawget(v,"key") 
        local value = rawget(v,"value") 
        data[key] = value
    end
    self._mapData = data
end

function KvPairs:setValue(key,value)
    self._mapData[key] = tostring(value) 
end


function KvPairs:getValue(key)
    return self._mapData[key] 
end


return KvPairs