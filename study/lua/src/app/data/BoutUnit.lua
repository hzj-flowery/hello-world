-- @Author panhoa
-- @Date 4.3.2020

local BaseData = require("app.data.BaseData")
local BoutUnit = class(BoutUnit, BaseData)

local schema = {}
schema["id"]  = {"number", 0}        --阵法Id
schema["pos"] = {"number", 0}        --阵法位

BoutUnit.schema = schema
function BoutUnit:ctor(properties)
    -- body
    BoutUnit.super.ctor(self, properties)
    if properties then
        self:setProperties(properties)
    end
end

function BoutUnit:clear( ... )
    -- body
end

function BoutUnit:reset( ... )
    -- body
end

function BoutUnit:getConfig( ... )
    -- body
    local BoutHelper = require("app.scene.view.bout.BoutHelper")
    return BoutHelper.getBoutInfoItem(self:getId(), self:getPos())
end

function BoutUnit:isSpecialBoutPoint( ... )
    -- body
    return rawequal(self:getConfig().point_type, 2)
end


return BoutUnit


