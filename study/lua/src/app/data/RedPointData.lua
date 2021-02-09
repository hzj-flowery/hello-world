--小红点服务器推送数据
local BaseData = require("app.data.BaseData")
local RedPointData = class("RedPointData", BaseData)

--local schema = {}
--schema["level"] 		= {"number", 0}
--schema["exp"] 			= {"number", 0}
--RedPointData.schema = schema
RedPointData.FILE_NAME = "redPoint"




function RedPointData:ctor(properties)
	RedPointData.super.ctor(self, properties)
    --服务器推送下来简单邮件
	self._recvRedPoint = G_NetworkManager:add(MessageIDConst.ID_S2C_RedPointNotify, handler(self, self._s2cRedPointNotify))
	self._signalRedPointClick = G_SignalManager:add(SignalConst.EVENT_RED_POINT_CLICK, handler(self,self._onEventRedPointClick))
	self._signalRedPointClickMemory = G_SignalManager:add(SignalConst.EVENT_RED_POINT_CLICK_MEMORY, handler(self,self._onEventRedPointClickMemory))
	self._data = {}
	self._counts = {}
	self._redPointTable = {}
	self._storageRedPointData = nil  --缓存红点
	self._everyLoginRedPoint = {} -- 每次登陆的红点提示
end

-- 清除
function RedPointData:clear()
    self._recvRedPoint:remove()
    self._recvRedPoint = nil
	self._signalRedPointClick:remove()
	self._signalRedPointClick = nil
	self._signalRedPointClickMemory:remove()
	self._signalRedPointClickMemory = nil
end

-- 重置
function RedPointData:reset()
	self._data = {}
	self._redPointTable = {}
	self._counts = {}
	self._storageRedPointData = nil
	self._everyLoginRedPoint = {}
end


function RedPointData:getCount(index)
	return self._counts[index] or 0
end
--小红点到前端会+1
--[[
//0  围剿叛军
//1  竞技场防守战报
//2  竞技场巅峰对决
//3  神将商店
//4  领地系统自己的信息
//5  领地系统朋友的求助信息
//6 //军团审批申请
//7 //军团援助有可领取的碎片
//8 //军团援助 自己能否援助
//9 //好友申请列表
//10 //领取好友体力
//11 //军团红包
//12 //军团捐献
//13 //军团任务
//14 //军团援助 自己能否援助别人
//15 //军团副本
//16 //复仇 主界面显示icon
//17 矿战战报
//18 //矿战被人干死
//19 军团战
//20 王者之战每日任务小红点 
//21 皇陵战报小红点 
//22 头像框
//23 个人竞技
//24 金将招募
//25 跨服军团战竞猜小红点
//26 老玩家回归主界面小红点
//27 跨服军团战驻扎
//28 暗度陈仓
//29 暗度陈仓发车红点
//30 红神兽活动
]]
function RedPointData:_s2cRedPointNotify(id, buffData)
	if(buffData == nil or type(buffData) ~= "table")then return end
	local mask = buffData.mask
	self._redPointTable = bit.tobits(mask)
	local counts = rawget(buffData, "count")
	if counts then
		self._counts = clone(counts)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE)
	dump(self._redPointTable)
end

-- 持久化 存储
function RedPointData:_onEventRedPointClick(event,funcId,param)
	local key = self:makeCacheKey(funcId,param)
	local value = G_ServerTime:getTime()
	self:setPointValue(key,value)

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,funcId,param)
end
-- 本次登录保存 红点状态
function RedPointData:_onEventRedPointClickMemory(event,funcId,param)
	local key = self:makeCacheKey(funcId,param)
	self._everyLoginRedPoint[key] = true
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,funcId,param)
end

--本次登录是否点击过
function RedPointData:isThisLoginClick(funcId,param)
	local key = self:makeCacheKey(funcId,param)
	return self._everyLoginRedPoint[key]
end


function RedPointData:isRebelArmy( ... )
	if(#self._redPointTable >= 1)then
		return self._redPointTable[1] > 0
	end

	return false
end

--竞技场防守战报
function RedPointData:isArenaDefReport( ... )
	-- body
	if(#self._redPointTable >= 2)then
		return self._redPointTable[2] > 0
	end

	return false
end

--竞技场巅峰对决
function RedPointData:isArenaPeekReport( ... )
	-- body
	if(#self._redPointTable >= 3)then
		return self._redPointTable[3] > 0
	end

	return false
end


--神将商店
function RedPointData:isHeroShopShowRed( ... )
	-- body
	if(#self._redPointTable >= 4)then
		return self._redPointTable[4] > 0
	end

	return false
end


--领地系统自己的信息
function RedPointData:isTerritoryRedPoint( ... )
	-- body
	if(#self._redPointTable >= 5)then
		return self._redPointTable[5] > 0
	end

	return false
end



--军团审批申请
function RedPointData:isHasGuildCheckApplication( ... )
	-- body
	if(#self._redPointTable >= 7)then
		return self._redPointTable[7] > 0
	end

	return false
end

--军团援助有可领取的碎片
function RedPointData:isHasGuildHelpReceive( ... )
	-- body
	if(#self._redPointTable >= 8)then
		return self._redPointTable[8] > 0
	end

	return false
end

--军团援助 自己能否援助
function RedPointData:isGuildCanAddHeroHelp( ... )
	-- body
	if(#self._redPointTable >= 9)then
		return self._redPointTable[9] > 0
	end

	return false
end
--好友申请
function RedPointData:isHasFriendApplyRedPoint(  )
	-- body
	if(#self._redPointTable >= 10)then
		return self._redPointTable[10] > 0
	end

	return false
end

--好友精力领取
function RedPointData:isHasFriendGetEnergyRedPoint(  )
	-- body
	if(#self._redPointTable >= 11)then
		return self._redPointTable[11] > 0
	end
	return false
end



--军团红包
function RedPointData:isGuildHasRedPacketRedPoint( ... )
	-- body
	if(#self._redPointTable >= 12)then
		return self._redPointTable[12] > 0
	end

	return false
end

--军团捐献
function RedPointData:isGuildHasContributionRedPoint( ... )
	-- body
	if(#self._redPointTable >= 13)then
		return self._redPointTable[13] > 0
	end

	return false
end

--军团任务
function RedPointData:isGuildHasTaskRedPoint( ... )
	-- body
	if(#self._redPointTable >= 14)then
		return self._redPointTable[14] > 0
	end

	return false
end

--军团任务
function RedPointData:isEnemyRevengeRedPoint()
	-- body
	if(#self._redPointTable >= 17)then
		return self._redPointTable[17] > 0
	end
	return false
end

--矿战战报
function RedPointData:isMineNewReport()
	-- body
	if(#self._redPointTable >= 18)then
		return self._redPointTable[18] > 0
	end
	return false
end

--矿战被干
function RedPointData:isMineBeHit()
	if(#self._redPointTable >= 19)then
		return self._redPointTable[19] > 0
	end
	return false	
end


--武者之战小红点
function RedPointData:isSeasonDailyReward()
	if(#self._redPointTable >= 21)then
		return self._redPointTable[21] > 0
	end
	return false	
end


--皇陵小红点
function RedPointData:isQinTombReport()
	if(#self._redPointTable >= 22)then
		return self._redPointTable[22] > 0
	end
	return false	
end

--个人竞技竞猜
function RedPointData:isSingleRaceGuess()
	if(#self._redPointTable >= 24)then
		return self._redPointTable[24] > 0
	end
	return false
end

--金将招募小红点
function RedPointData:isGachaGoldenHero()
	if(#self._redPointTable >= 25)then
		return self._redPointTable[25] > 0
	end
	return false	
end

--跨服军团战竞猜小红点
function RedPointData:isGuildCrossWarGuess()
	if(#self._redPointTable >= 26)then
		return self._redPointTable[26] > 0
	end
	return false	
end

--老玩家回归主界面小红点
function RedPointData:isReturnActivity()
	if(#self._redPointTable >= 27)then
		return self._redPointTable[27] > 0
	end
	return false	
end

--跨服军团战驻扎小红点
function RedPointData:isGuildCrossWarCamp()
	if(#self._redPointTable >= 28)then
		return self._redPointTable[28] > 0
	end
	return false	
end

--暗度陈仓小红点
function RedPointData:isGrainCar()
	if(#self._redPointTable >= 29)then
		return self._redPointTable[29] > 0
	end
	return false
end

--暗度陈仓发车小红点
function RedPointData:isGrainCarCanLaunch()
	if(#self._redPointTable >= 30)then
		return self._redPointTable[30] > 0
	end
	return false
end

--红神兽活动小红点
function RedPointData:isRedPetShow()
	if(#self._redPointTable >= 31)then
		return self._redPointTable[31] > 0
	end
	return false
end

function RedPointData:resetRedPointTableByIndex(index)
	if(#self._redPointTable >= index + 1)then
		self._redPointTable[index + 1] = 0
	end
end


function RedPointData:isHasRedPointByMaskIndex( maskIndex )
	-- body
	if(#self._redPointTable >= maskIndex +1)then
		return self._redPointTable[maskIndex + 1] > 0
	end

	return false
end

function RedPointData:flush()
	self:_saveData(self._data)
end

function RedPointData:_saveData(data)
	G_StorageManager:setUserInfo("", G_UserData:getBase():getId())
	G_StorageManager:saveWithUser(RedPointData.FILE_NAME,
		data
	)
end

function RedPointData:_getData()
	if not self._storageRedPointData then
		G_StorageManager:setUserInfo("", G_UserData:getBase():getId())
		self._storageRedPointData = G_StorageManager:loadUser(RedPointData.FILE_NAME) or {}
	end
	return self._storageRedPointData
end

function RedPointData:getPointValue(key)
	local data = self:_getData()
	local dataValue = data[key]
	return dataValue
end

--
function RedPointData:setPointValue(key,value)
	local data = self:_getData()
	data[key] = value
	self:_saveData(data)
end

--今天是否显示过了红点
function RedPointData:isTodayShowedRedPoint(key)
	local time = self:getPointValue(key)
	if not time then
		return false
	end
	local TimeConst = require("app.const.TimeConst")
	local expired = G_ServerTime:isTimeExpired(time,TimeConst.RESET_TIME )
	return not expired
end

function RedPointData:isTodayShowedRedPointByFuncId(funcId,param)
	return self:isTodayShowedRedPoint(self:makeCacheKey(funcId,param))
end

function RedPointData:makeCacheKey(funcId,param)
	local key = tostring(funcId)
	if param then
		key = key..json.encode(param)
	end
	return key
end

function RedPointData:clearRedPointShowFlag(funcId,param)
	local key = self:makeCacheKey(funcId,param)
	self:setPointValue(key,0)
end

return RedPointData
