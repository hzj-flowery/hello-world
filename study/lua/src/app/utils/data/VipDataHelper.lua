--vip功能


local VipDataHelper = {}

function VipDataHelper.getVipValueByType(vipType)
	local vipCfg = VipDataHelper.getVipCfgByType(vipType)

	--dump(vipCfg)
	if vipCfg then
		return vipCfg.value
	end
	return 0
end

function VipDataHelper.getVipCfgByTypeLevel(vipType,vipLevel)
	local vipMgr = G_UserData:getVip()
	local vipCfg = vipMgr:getVipFunctionDataByTypeLevel(vipType,vipLevel)
	return vipCfg
end


function VipDataHelper.getVipCfgByType(vipType)
	local vipMgr = G_UserData:getVip()
	local vipCfg = vipMgr:getVipFunctionDataByType(vipType)
	return vipCfg
end


function VipDataHelper.getVipGiftPkgList()
	local currentVipLv = G_UserData:getVip():getLevel()
	local list = G_UserData:getVip():getVipList()
	local vipGiftPkgList = {}
	for k,v in ipairs(list) do
		if currentVipLv >= v:getInfo().show_lv then
			table.insert( vipGiftPkgList, v)
		end
	end
	return vipGiftPkgList
end

function VipDataHelper.findFirstCanReceiveGiftPkgIndex(listData)
	local playerVipLevel = G_UserData:getVip():getLevel()
	for k,v in ipairs(listData) do
		local currVipLevel = v:getId()
		if currVipLevel > playerVipLevel then--不能领

		elseif G_UserData:getVip():isVipRewardTake(currVipLevel) then--已领取

		else --可以领
			return k
		end
	end
	return nil
end

function VipDataHelper.findFirstUnReceiveGiftPkgIndex(listData)
	local playerVipLevel = G_UserData:getVip():getLevel()
	for k,v in ipairs(listData) do
		local currVipLevel = v:getId()
		if currVipLevel > playerVipLevel then--不能领
			return k
		elseif G_UserData:getVip():isVipRewardTake(currVipLevel) then--已领取
		else --可以领
		end
	end
	return nil
end

--是否显示VIP礼包入口
function VipDataHelper.isShowEnterIcon()
	local list = VipDataHelper.getVipGiftPkgList()
	local playerVipLevel = G_UserData:getVip():getLevel()
	for k,v in ipairs(list) do
		local currVipLevel = v:getId()
		if currVipLevel > playerVipLevel then--不可领
			return true
		elseif G_UserData:getVip():isVipRewardTake(currVipLevel) then--已领取
			
		else--能领取	
			return true
		end
	end
	return 	false
end

return VipDataHelper
