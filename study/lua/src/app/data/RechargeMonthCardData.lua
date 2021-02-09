--充值月卡数据
--@Author:Conley

local BaseData = require("app.data.BaseData")
local VipPay = require("app.config.vip_pay")
local RechargeMonthCardData = class("RechargeMonthCardData", BaseData)
local schema = {}
schema["id"] 		= {"number", 0}
schema["config"] 		= {"table", {}}
schema["remainDay"] 		= {"number", 0}--剩余天数，包括今天
schema["canReceive"] 		= {"boolean", false}--可以领取
RechargeMonthCardData.schema = schema

function RechargeMonthCardData:ctor(properties)
	RechargeMonthCardData.super.ctor(self, properties)
end

-- 清除
function RechargeMonthCardData:clear()

end

-- 重置
function RechargeMonthCardData:reset()
	
end

function RechargeMonthCardData:initData(data)
	local id = data.id
	self:setId(id)
	
	local info = VipPay.get(id)
    assert(info,"vip_pay can't find id = "..tostring(id))
    self:setConfig(info)

	self:setRemainDay(data.expire_days)
	--using_state = 3; //领取状态  true 可领取 false 不可领取
	self:setCanReceive(data.using_state)--设置是否可领取
end


return RechargeMonthCardData