local BaseData = require("app.data.BaseData")
local HonorTitleItemData = class("HonorTitleData", BaseData)

local schema = {}
schema["id"] = {"number", 0}
schema["limitLevel"] = {"number", 0}
schema["day"] = {"number", 0}
schema["timeType"] = {"number", 0}
schema["timeValue"] = {"table", {}}
schema["name"] = {"string", {}}
schema["colour"] = {"string", ""}
schema["resource"] = {"string", ""}
schema["des"] = {"string", ""}
schema["isEquip"] = {"boolean", false}
schema["expireTime"] = {"number", 0}
schema["isOn"] = {"boolean"}
schema["fresh"] = {"boolean"}

HonorTitleItemData.schema = schema

function HonorTitleItemData:ctor(properties)
    HonorTitleItemData.super.ctor(self, properties)
end

function HonorTitleItemData:init(template)
    self:setId(template.id)
    self:setLimitLevel(template.limitLevel)
    self:setDay(template.day)
    self:setTimeType(template.timeType)
    self:setTimeValue(template.timeValue)
    self:setName(template.name)
    self:setColour(template.colour)
    self:setResource(template.resource)
    self:setDes(template.des)
    self:setIsEquip(template.isEquip)
    self:setExpireTime(template.expireTime)
    self:setIsOn(template.isOn)
    self:setFresh(template.fresh)
end

-- 更新称号后台数据
function HonorTitleItemData:updateData(item)
    self:setIsEquip(item.equip)
    self:setExpireTime(item.expire_time)
    self:setIsOn(item.on)
    self:setFresh(item.fresh)
end

return HonorTitleItemData
