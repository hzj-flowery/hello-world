-- 驻地系统数据单元
local TerritoryUnit = class("TerritoryUnit")
local TerritoryInfo = require("app.config.territory_performance")
local TerritoryConst = require("app.const.TerritoryConst")
local EVENT_RIOT = 100
local EVENT_RIOT_FINISH = 101

-- 排序事件，按时间
local function SortEvent ( lE,rE )
	return lE.time < rE.time
end


function TerritoryUnit:ctor( index, data )
	-- 服务器推送过来的数据不包含未开启的领地信息
	-- 所以如果没有，则读取表里的数据并设置为未开启
	if data == nil then
		self._id = index -- 领地ID
		self._heroId = nil -- 巡逻武将BASEID
		self._events = {} -- 领地事件
		self._startTime = 0 -- 开始巡逻时间
		self._remainTime = 0 -- 一共巡逻多久
		self._award = nil -- 武将掉落奖励
		self._open = false -- 是否开启
	else
		self._id = data.id
		self._heroId = data.patrol_hero_base_id
		self._patrolType = data.patrol_type
		self._events = data.patrol_events
		self._startTime = data.patrol_start
		self._endTime = data.patrol_end
		self._limitLevel = data.patrol_hero_limit_level
		self._limitRedLevel = data.patrol_hero_limit_rtg
		self._remainTime = math.abs(self._startTime - data.patrol_end)
		--self._award = data.awards
		self._open = true
	end
	-- 暂时初始化下一个领地为0，在DATA中根据表计算再赋值
	self._nextId = 0

	-- 可攻打状态在DATA中赋值
	self._canFight = false
	-- 缓存领地的config信息
	self._territoryCfg = TerritoryInfo.get(self._id)

	-- 分析BUBBLE
	self._territoryBubble = {}
	local bubblestring = self._territoryCfg.hero_bubble_id
	if type(bubblestring) == "string" then
		local bubblelist = string.split(bubblestring,"|")
		for i,bubbleId in ipairs(bubblelist) do
			table.insert(self._territoryBubble,tonumber(bubbleId))
		end
	end
	
	-- 排序事件
	table.sort(self._events, SortEvent)
end

-- 设置领地数据
function TerritoryUnit:setTerritoryData( data )
	-- 如果参数为空，则默认未开启
	if data == nil then
		self._heroId = nil -- 巡山武将id
		self._events = {} -- 领地事件
		self._startTime = 0 -- 开始巡逻时间
		self._remainTime = 0 -- 一共巡逻多久
		self._award = nil -- 武将掉落奖励
		self._open = false -- 是否开启
	else
		self._id = data.id
		self._heroId = data.patrol_hero_base_id
		self._patrolType = data.patrol_type
		self._events = data.patrol_events
		self._startTime = data.patrol_start
		self._endTime = data.patrol_end
		self._limitLevel = data.patrol_hero_limit_level
		self._limitRedLevel = data.patrol_hero_limit_rtg
		self._remainTime = math.abs(self._startTime - data.patrol_end)
		self._open = true
	end

	-- 排序事件
	table.sort(self._events, SortEvent)
end

-- 设置领地的下一领地ID
function TerritoryUnit:setNextId( nextId )
	self._nextId = nextId or 0
end

-- 获取下一领地ID
function TerritoryUnit:getNextId( )
	return self._nextId
end

-- 插入领地事件，仅支持镇压
function TerritoryUnit:insertEvent( eventId )
	local serverTime = G_ServerTime:getTime() - 10 -- 为了界面可以及时刷新，留10秒容差时间
	-- 组装镇压事件
	local eventStruct =
	{
		id = eventId,
		time = serverTime,
		info_id = 2,
		is_riot = true,
		fname = G_UserData:getBase():getName(),
	}

	-- 查找事件时间，插入当前时间的事件
	for i,event in ipairs(self._events) do
		if serverTime < event.time then
			table.insert(self._events, i, eventStruct)
			break
		end
	end
end

-- 获取Bubbleid
function TerritoryUnit:getTerritoryBubble( index )
	if self._territoryBubble[index] ~= nil then
		return self._territoryBubble[index]
	end

	return 0
end

-- 获取领地ID
function TerritoryUnit:getTerritoryId( )
	return self._id
end

-- 获取上一领地ID
function TerritoryUnit:getPreTerritoryId()
	return self._territoryCfg.pre_id
end

-- 获取领地的名字
function TerritoryUnit:getTerritoryName( ... )
	return self._territoryCfg.name
end

--有符合等级可以攻打的新领地，并且满足推荐战力的时候。
function TerritoryUnit:isCanFight( ... )
	-- body
	local state = self:getTerritoryState()
	if state == TerritoryConst.STATE_FIGHT then
		if G_UserData:getBase():getPower() >= self._territoryCfg.fight_value  then
			if self:IsReady() then
				return true
			end
		end
	end
	return false
end
-- 获取领地配置信息
function TerritoryUnit:getTerritoryCfg( ... )
	return self._territoryCfg
end

-- 获取巡逻武将ID
function TerritoryUnit:getHeroId()
	return self._heroId or 0
end

-- 获取巡逻武将界限等级
function TerritoryUnit:getLimitLevel()
	return self._limitLevel or 0
end

-- 获取巡逻武将红升金界限等级
function TerritoryUnit:getLimitRedLevel()
	return self._limitRedLevel or 0
end

-- 获取事件列表
function TerritoryUnit:getEvents()
	return self._events
end

-- 获取至今为止的事件列表
function TerritoryUnit:getTerritoryEventsTillNow()
	local eventList = {}
	local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")

	for i,event in ipairs(self._events) do

		if event.time <= G_ServerTime:getTime() then
			table.insert(eventList, event)
		end

	end

	table.sort(eventList, function(event1, event2)
		return event1.time > event2.time
	end)

	return eventList
end

-- 获取下一事件触发时间
function TerritoryUnit:getNextEventTime()
	for i,event in ipairs(self._events) do
		if event.time > G_ServerTime:getTime() then
			return event.time
		end
	end

	return 0
end

-- 获取开始巡逻时间
function TerritoryUnit:getStartTime()
	return self._startTime
end

-- 获取巡逻结束时间
function TerritoryUnit:getEndTime()
	return self._remainTime + self._startTime
end

-- 获取武将掉落
function TerritoryUnit:getHeroDrop()
	return self._award
end

-- 获取是否已经开启
function TerritoryUnit:getIsOpen()
	return self._open
end

-- 设置是否可攻打
function TerritoryUnit:setCanFight(canFight)
	self._canFight = canFight or false
end

-- 获取是否可攻打
function TerritoryUnit:getCanFight()
	return self._canFight
end

-- 获取是否达到开启等级
function TerritoryUnit:IsReady()
	local openLv = self._territoryCfg.attack_lv
	local playerLevel = G_UserData:getBase():getLevel()
	return playerLevel >= openLv
end

-- 获取领地状态
function TerritoryUnit:getTerritoryState()
	-- 是否开启
	if self:getIsOpen() then
		-- 是否有巡山武将
		if self:getHeroId() > 0 then
			-- 如果超过巡逻结束时间，完成
			if self:getEndTime() < G_ServerTime:getTime() then
				return TerritoryConst.STATE_FINISH
			end
			-- 如果存在暴动事件，暴动状态
			local id = self:getFirstRiotId()
			if id > 0 then
				return TerritoryConst.STATE_RIOT
			end
			-- 其他就是普通巡逻状态
			return TerritoryConst.STATE_COUNTDOWN
		-- 没有则为可巡山状态
		else
			return TerritoryConst.STATE_ADD
		end
	-- 未开启的话，是否可以攻打
	elseif self:getCanFight() then
		return TerritoryConst.STATE_FIGHT
	end

	-- 未开启也不可攻打，锁定状态
	return TerritoryConst.STATE_LOCK
end

function TerritoryUnit:getRiotEvents()
	local riotEventList = {}
	for i,event in ipairs(self._events) do
		--获取所有暴动事件
		if event.event_type == TerritoryConst.RIOT_TYPE_OPEN then
			local tempEvent = clone(event)
			--暴动事件没到

			if event.time < G_ServerTime:getTime() then
				table.insert(riotEventList, event)
			end

		end
	end
	return riotEventList
end

--设置暴动状态，变成已求助
function TerritoryUnit:setRiotEventState(eventId, eventState)
	local function getIndex(eventId)
		for i,event in ipairs(self._events) do
			--获取所有暴动事件
			if event.id == eventId then
				return i
			end
		end
		return 0
	end
	local event = self._events[getIndex(eventId)]
	if event then
		if TerritoryConst.RIOT_HELPED == eventState then
			event.for_help = true
		end

		if TerritoryConst.RIOT_TAKEN == eventState then
			event.is_award = true
		end
		--可领取
		if TerritoryConst.RIOT_TAKE == eventState then
			event.is_repress = true
		end
	end
end

-- 获取领地目前第一个暴动事件
function TerritoryUnit:getFirstRiotId()
	local firstId = 0
	local riotEvent = nil
	local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
	for i,event in ipairs(self._events) do
		-- 大于目前时间，退出计算
		local riotNeedTime = tonumber(TerritoryHelper.getTerritoryParameter("riot_continue_time"))
   		local riotEndTime = event.time + riotNeedTime

		--暴动事件没到

		if event.time <= G_ServerTime:getTime() then
			local riotState = TerritoryHelper.getRiotEventState(event)
			--暴动超时
			if riotState ~= TerritoryConst.RIOT_OVERTIME then
				--超过暴动时间
				--if riotEndTime < G_ServerTime:getTime() then
				--	break
				--end

				-- 前后匹配暴动和镇压事件
				if firstId == 0 then
					local isRepress = rawget(event, "is_repress")
					if event.event_type == TerritoryConst.RIOT_TYPE_OPEN and isRepress == false then
						firstId = event.id
						riotEvent = event
						break
					end
				end
			end
		end
	end

	return firstId,riotEvent
end

-- 返回锁定条件
function TerritoryUnit:getLockMsg()
	-- 是否开启
	if self:IsReady() then
		local preName = G_UserData:getTerritory():getTerritoryName( self:getPreTerritoryId() )
		return Lang.get("lang_territory_pre_limit",{name = preName})
	-- 是否到达等级
	else
		return Lang.get("lang_territory_lv_limit",{level = self._territoryCfg.attack_lv})
	end

	return nil
end


function TerritoryUnit:getTerritoryRiotInfo()
	local riotId, eventData = self:getFirstRiotId()
	if riotId > 0 then
		local TerritoryRiotInfo = require("app.config.territory_riot")
		local riotInfo = TerritoryRiotInfo.get(eventData.info_id)
		assert(riotInfo,"eventInfo is nil with Id" .. eventData.info_id)
		return riotInfo, eventData
	end
	return nil
end

-- 重置领地状态，回归待开采
function TerritoryUnit:reset()
	self._heroId = nil
	self._events = {}
	self._startTime = 0
	self._remainTime = 0
	self._award = nil
	self._open = true
end

return TerritoryUnit
