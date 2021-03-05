local BaseData = require("app.data.BaseData")
local TextInputData = class("TextInputData", BaseData)

local schema = {}
schema["lastInputCache"] = {"table", {}} --聊天输入

TextInputData.schema = schema

function TextInputData:ctor(properties)
    TextInputData.super.ctor(self, properties)

end

function TextInputData:clear()
end

function TextInputData:reset()	
end

function TextInputData:getLastTextInputByType(inputType)	
    if not inputType then
        return
    end
    local inputCache = self:getLastInputCache()
    return inputCache[inputType]
end

function TextInputData:setLastTextInputByType(inputType,txt)	
    if not inputType then
        return
    end
    local inputCache = self:getLastInputCache()
    inputCache[inputType] = txt
end

function TextInputData:clearLastTextInputByType(inputType)
    if not inputType then
        return
    end
    local inputCache = self:getLastInputCache()
    inputCache[inputType] = ""
end

return TextInputData