local BaseData = require("app.data.BaseData")
local VipPayData = class("VipPayData", BaseData)
local VipPayInfo = require("app.config.vip_pay")
local RechargeConst = require("app.const.RechargeConst")

local schema = {}
schema["login"]		= {"boolean", false}
schema["flush"]		= {"boolean", false}

VipPayData.schema = schema


--
function VipPayData:ctor()
	self._rechargeList = nil ---包含RechargeUnit的列表
    self._serverDatas = {}
    self._inited = false
    self._hasRecharged = false --是否充值过
    self._hasGotRechargeAward = true --是否领取过首冲奖励。
    self._firstBuyResetDate = {} --首次购买重置时间
	self._signalRecharge 	= G_NetworkManager:add(MessageIDConst.ID_S2C_GetRecharge, handler(self, self._onGetRecharge))
    self._recvUpdateRechargeReset = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateRechargeReset, handler(self, self._s2cUpdateRechargeReset))

    

	self:init()
end

function VipPayData:_onGetRecharge(id, message)
	local rechargeList = rawget(message, "recharge_money") or {}
	self:updateData(rechargeList)
end

function VipPayData:_s2cUpdateRechargeReset(id, message)
    local dateList = rawget(message, "date") or {}
    self._firstBuyResetDate = {}
    for k,v in ipairs(dateList) do
        table.insert( self._firstBuyResetDate, v)
    end
    local sortfunction = function(a,b)
        return a > b
    end
    table.sort( self._firstBuyResetDate, sortfunction )

    G_SignalManager:dispatch(SignalConst.EVENT_RECHARGE_FIRST_BUY_RESET,id,message)
    
end


-- 清除
function VipPayData:clear()
    self._signalRecharge:remove()
    self._signalRecharge = nil
    self._recvUpdateRechargeReset:remove()
    self._recvUpdateRechargeReset = nil
	self._rechargeList = nil
end

function VipPayData:getFirstBuyResetTime()
    local time = G_ServerTime:getTime()
    for k,v in ipairs(self._firstBuyResetDate) do
        if v <= time then
            return v
        end
    end
    return 0
end

function VipPayData:updateData(recharegeList)
	for i = 1, #recharegeList do
		local data = recharegeList[i]
        local id =  data.Key 
	    local time  = data.Value 

		for j = 1, #self._rechargeList do
			local rechargeData = self._rechargeList[j]
      
			if rechargeData.cfg.id == id then
				rechargeData.isBuyed = true --设置已购买
                rechargeData.buyTime = time
			end
		end
	end
end
---设置初始化数据
function VipPayData:init()
    if not self._inited then
        self:_initData()
        for i = 1, #self._serverDatas do
            local data = self._serverDatas[i]
            for j = 1, #self._rechargeList do
                local rechargeData = self._rechargeList[j]
                if rechargeData.cfg.price == data then
                    rechargeData.isBuyed = true --设置已购买
                end
            end
        end
        self._inited = true
    end
end

function VipPayData:setServerData(datas)
    self._serverDatas = datas
    self._inited = false
end


function VipPayData:_initData()
    local tempRechargeList = {}
    local tempJadeRechargeList = {}
    self._rechargeList = {}

	local function matchAppId(rechargeInfo)
        --[[
		local currentAppId = "0"
		if tostring(rechargeInfo.appid) == currentAppId then
			return true
		end
		return false
        ]]
        return true
	end

    

    -- 区分具体商品项的
    local shopInfos = {}

    for i = 1, VipPayInfo.length() do
        local rechargeInfo = VipPayInfo.indexOf(i)
        if matchAppId(rechargeInfo) then
			local rechargeData = {}
			rechargeData.cfg = rechargeInfo
			rechargeData.isBuyed = false
            rechargeData.buyTime = 0
            if rechargeInfo.card_type == RechargeConst.VIP_PAY_TYPE_RECHARGE then
                table.insert(tempRechargeList, rechargeData)
            elseif rechargeInfo.card_type == RechargeConst.VIP_PAY_TYPE_JADE then
                table.insert(tempJadeRechargeList, rechargeData)
            end
        end
    end

    table.sort( tempRechargeList, function (a ,b )
        local order_a,order_b = a.cfg.order,b.cfg.order
        return order_a < order_b
    end )
    table.sort( tempJadeRechargeList, function (a ,b )
        local order_a,order_b = a.cfg.order,b.cfg.order
        return order_a < order_b
    end )
    self._rechargeList = tempRechargeList
    self._jadeRechargeList = tempJadeRechargeList
end

function VipPayData:getRechargeList()
    local currVip = G_UserData:getVip():getLevel()
    local function matchVip(rechargeInfo)
        return rechargeInfo.vip_show <= currVip
    end
    
    local function checkLargeAmount(rechargeInfo)
        return rechargeInfo.large_amount ~= 1 or 
            (rechargeInfo.large_amount == 1 and G_ConfigManager:isLargeCashReCharge() )
    end

    
    local list = {}
    for k,v in ipairs(self._rechargeList) do
        if matchVip(v.cfg) and checkLargeAmount(v.cfg) then
            table.insert(list,v)
        end
        
    end
	return list
end

function VipPayData:getJadeRechargeList()
    local currVip = G_UserData:getVip():getLevel()
    local function matchVip(rechargeInfo)
        return rechargeInfo.vip_show <= currVip
    end
    
    local function checkLargeAmount(rechargeInfo)
        return rechargeInfo.large_amount ~= 1 or 
            (rechargeInfo.large_amount == 1 and G_ConfigManager:isLargeCashReCharge() )
    end

    
    local list = {}
    for k,v in ipairs(self._jadeRechargeList) do
        if matchVip(v.cfg) and checkLargeAmount(v.cfg) then
            table.insert(list,v)
        end
    end

    return list
end

return VipPayData