---------------------------------------------------------------------
-- Created by: liangxu
-- Date: 2020-02-18 15:44:15
---------------------------------------------------------------------
local ReturnServerDataHelper = {}

function ReturnServerDataHelper.getReturnAwardConfig(id)
	local info = require("app.config.return_award").get(id)
	assert(info, string.format("return_award config can not find id = %d", id))
	return info
end

--获取回归服奖励列表
function ReturnServerDataHelper.getReturnAwardList()
	local result = {}
	
	local vipMax, goldMax = G_UserData:getBase():getReturnAward()
	local vipLevel = G_UserData:getBase():getReturnVipLevel()
	local totalVip = 0
	local Config = require("app.config.return_award")
	local vipKey = "vip"..vipLevel
	assert(Config.hasKey(vipKey), string.format("return_award config can not find vip %d", vipLevel))
	
	local returnSvr = G_UserData:getBase():getReturnSvr()
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		local curValue = info[vipKey]
		
		local nextValue = nil
		if i + 1 <= len then
			local nextInfo = Config.indexOf(i + 1)
			nextValue = nextInfo[vipKey]
		end
		
		if totalVip < vipMax then
			totalVip = totalVip + curValue
			local restVip = vipMax - totalVip
			if nextValue then
				if restVip < nextValue then
					totalVip = totalVip + restVip
					curValue = curValue + restVip
				end
			else
				curValue = curValue + restVip --没有nextValue,表示到最后一行了，还有剩余vip经验，就都加上
			end
			local isReceived = returnSvr and returnSvr:isReceivedWithId(info.id) or false
			local isCanReceive = returnSvr and returnSvr:isCanReceive(info.id) or false
			local unit = {
				id = info.id,
				level = info.level,
				value = curValue,
				isReceived = isReceived,
				isCanReceive = isCanReceive,
			}
			table.insert(result, unit)
		else
			break
		end
	end
	
	table.sort(result, function(a, b)
		if a.isReceived ~= b.isReceived then
			return a.isReceived == false
		else
			return a.level < b.level
		end
	end)
	
	return result
end

return ReturnServerDataHelper