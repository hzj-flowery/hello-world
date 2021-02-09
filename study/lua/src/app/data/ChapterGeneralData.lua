local BaseData = require("app.data.BaseData")
local ChapterGeneralData = class("ChapterGeneralData", BaseData)

local schema = {}
schema["id"] = {"number", 0}
schema["pass"] = {"boolean", false}
schema["configData"] = {"table", 0}
ChapterGeneralData.schema = schema

function ChapterGeneralData:ctor(properties)
    ChapterGeneralData.super.ctor(self, properties)
end

function ChapterGeneralData:clear()
end

function ChapterGeneralData:reset()
end

return ChapterGeneralData
