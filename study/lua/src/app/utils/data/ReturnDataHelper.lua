--商店模块数据封装类


local ReturnDataHelper = {}


local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local ShopInfo = require("app.config.shop")
local ShopConst = require("app.const.ShopConst")
--商店通用函数
function ReturnDataHelper.getRewardConfigInfo(configInfo, num)
    local rewardConfigInfo = {}

    if configInfo == nil then return {} end

    for index = 1, num do
        local reward_type = configInfo["reward_type"..index]
        local reward_value = configInfo["reward_value"..index]
        local reward_size = configInfo["reward_size"..index]

        if reward_size and reward_size > 0 then
            table.insert( rewardConfigInfo, {type = reward_type, value = reward_value, size = reward_size} )
        end
    end

    return rewardConfigInfo
end

return ReturnDataHelper