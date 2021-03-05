--合成模块数据封装类

local SynthesisDataHelper = {}
local SynthesisConfig = require("app.config.synthesis")
local SynthesisConst = require("app.const.SynthesisConst")

function SynthesisDataHelper.getSynthesisMaterilNum (configInfo)
    if configInfo == nil then
        return 0
    end

    local num = 0

    for index = 1, SynthesisConst.MAX_MATERIAL_NUM do
        if configInfo["material_size_"..index] and configInfo["material_size_"..index] > 0 then
            num = num + 1
        end
    end

    return num
end

return SynthesisDataHelper