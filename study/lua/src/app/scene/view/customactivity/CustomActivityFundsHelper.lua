-- @Author panhoa
-- @Date 11.24.2018
-- @Role 

local CustomActivityFundsHelper = {}

-- @Role    获取基金基础信息
function CustomActivityFundsHelper.getFundsBaseInfo()
    local funds = require("app.config.gm_fund")
    local fundsList = {}
    for index = 1, funds.length()  do
        local cellData = funds.indexOf(index)
        local group = cellData.group
        fundsList[group] = fundsList[group] or {}
        if fundsList[group] == nil then
            fundsList[group] = {}
        end

        table.insert(fundsList[group], cellData)
        table.sort(fundsList[group], function(item1, item2)
            return item1.day < item2.day
        end)
    end
    return fundsList
end

-- @Role    获取VIP Pay的信息
-- @Param   orderId 订单Id
function CustomActivityFundsHelper.getVipPayConfigByIdOrderId(orderId)
    local VipPay = require("app.config.vip_pay")
    local payCfg = VipPay.get(orderId)
    return payCfg
end


return CustomActivityFundsHelper
