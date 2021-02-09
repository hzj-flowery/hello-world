local TimeExpiredData = import(".TimeExpiredData")
local BaseData = class("BaseData",TimeExpiredData)

BaseData.schema = {
    id = {"string"}
}
BaseData.fields = {"id"}

local function filterProperties(properties, filter)
    for i, field in ipairs(filter) do
        properties[field] = nil
    end
end

function BaseData:ctor(properties)
    self._isModelBase = true
    if type(properties) ~= "table" then properties = {} end
    self:setProperties(properties)
    BaseData.super.ctor(self)
end

function BaseData:setProperties(properties)
    assert(type(properties) == "table", string.format("%s:setProperties() - invalid properties", self.class.__cname))

    for field, schema in pairs(self.class.schema) do
        local typ, def, id = schema[1], schema[2] , schema[3]
        --id关联
        local propname = field .. "_"

        local val = nil
        if rawget(properties, field) then
            val = properties[field]
        end
        if val ~= nil then
            if typ == "number" then val = tonumber(val) end
            if typ == "boolean" then
                if val == "true" or val == true then
                    val = true
                else
                    val = false
                end
            end
            assert(type(val) == typ, string.format("%s:setProperties() - type mismatch, %s expected %s, actual is %s", self.class.__cname, field, typ, type(val)))
            self[propname] = val
        elseif self[propname] == nil and def ~= nil then
            if type(def) == "table" then
                val = clone(def)
            elseif type(def) == "function" then
                val = def()
            else
                val = def
            end
            self[propname] = val
        end

        -- set
        local skey = "set"..field:ucfirst()
        if self[skey] == nil then
            self[skey] = function(self, value)
                self[field.."_"] = value
            end
        end

        -- get
        local g = "get"
        if typ == "boolean" then g = "is" end
        local gkey = g..field:ucfirst()
        if self[gkey] == nil then
            self[gkey] = function(self)
                return self[field.."_"]
            end
        end
        
    end

    return self
end

function BaseData:getProperties(fields, filter)
    local schema = self.class.schema
    if type(fields) ~= "table" then fields = self.class.fields end

    local properties = {}
    for i, field in ipairs(fields) do
        local propname = field .. "_"
        local typ = schema[field][1]
        local val = self[propname]
        assert(type(val) == typ, string.format("%s:getProperties() - type mismatch, %s expected %s, actual is %s", self.class.__cname, field, typ, type(val)))
        properties[field] = val
    end

    if type(filter) == "table" then
        filterProperties(properties, filter)
    end

    return properties
end

function BaseData:backupProperties()
    for field, schema in pairs(self.class.schema) do
        local propname = field .. "_"
        local typ = schema[1]
        local val = self[propname]
        assert(type(val) == typ, string.format("%s:getProperties() - type mismatch, %s expected %s, actual is %s", self.class.__cname, field, typ, type(val)))
        self[field .. "_last_"] = val

        local g = "get"
        if typ == "boolean" then g = "is" end
        local gkey = g .. "Last" .. field:ucfirst()
        if self[gkey] == nil then
            self[gkey] = function(self)
                return self[field.."_last_"]
            end
        end
    end
end

return BaseData
