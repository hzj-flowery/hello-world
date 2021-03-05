-- @Author panhoa
-- @Date 8.17.2018
-- @Role 

local BaseData = import(".BaseData")
local SeasonSilkData = class("SeasonSilkData", BaseData)
local SeasonSilkConst = require("app.const.SeasonSilkConst")

local schema = {}


SeasonSilkData.schema = schema
function SeasonSilkData:ctor(properties)
	SeasonSilkData.super.ctor(self, properties)
	self._orangeSilkInfo = {} -- 橙色锦囊数据
    self._redSilkInfo 	 = {} -- 红色锦囊数据
    self._goldSilkInfo 	 = {} -- 金色锦囊数据
end

-- @Role
function SeasonSilkData:clear()
end

-- @Role
function SeasonSilkData:reset()
end

---------------------------------------------------------------------
-- @Role Useable orangesilk
function SeasonSilkData:getOrangeSilkInfo()
	return self._orangeSilkInfo
end 

-- @Role Useable redsilk
function SeasonSilkData:getRedSilkInfo()
	return self._redSilkInfo
end 

-- @Role Useable goldsilk
function SeasonSilkData:getGoldSilkInfo()
	return self._goldSilkInfo
end 

-- @Role Get current's silk
function SeasonSilkData:initOrangeSilkInfo(stage)
    self._orangeSilkInfo = {}
    if stage == nil then
        return
    end
    local itemInfo = require("app.config.silkbag")
	local openServerDay = G_UserData:getBase():getOpenServerDayNum()

	
    for loopi = 1, itemInfo.length()  do 
        local itemData = itemInfo.indexOf(loopi)
		local itemColor = itemData.color
		local figthType = tonumber(itemData.is_fight)
		if figthType ~= 0 and itemColor == SeasonSilkConst.SILK_SCOP_LOWERLIMIT and figthType <= stage then	-- 橙色
			self._orangeSilkInfo = self._orangeSilkInfo or {}

			if self._orangeSilkInfo== nil then
				self._orangeSilkInfo = {}
			end
			
			table.insert(self._orangeSilkInfo, {cfg = itemData})
			table.sort(self._orangeSilkInfo, function(item1, item2)
				if item1.cfg.order ~= item2.cfg.order then
					return item1.cfg.order < item2.cfg.order
				else
					return item1.cfg.id < item2.cfg.id
				end
			end)
		end
    end
end

-- @Role Get current's silk
function SeasonSilkData:initRedSilkInfo(stage)
    self._redSilkInfo = {}
    if stage == nil then
        return
    end
    local itemInfo = require("app.config.silkbag")
	local openServerDay = G_UserData:getBase():getOpenServerDayNum()

    for loopi = 1, itemInfo.length()  do 
        local itemData = itemInfo.indexOf(loopi)
		local itemColor = itemData.color
		local figthType = tonumber(itemData.is_fight)
		if figthType ~= 0 and itemColor == SeasonSilkConst.SILK_SCOP_REDLIMIT and figthType <= stage then	-- 红色
			self._redSilkInfo = self._redSilkInfo or {}

			if self._redSilkInfo == nil then
				self._redSilkInfo = {}
			end
			
			table.insert(self._redSilkInfo, {cfg = itemData})
			table.sort(self._redSilkInfo, function(item1, item2)
				if item1.cfg.order ~= item2.cfg.order then
					return item1.cfg.order < item2.cfg.order
				else
					return item1.cfg.id < item2.cfg.id
				end
			end)
		end
    end
end

-- @Role Get current's silk
function SeasonSilkData:initGoldSilkInfo(stage)
    self._goldSilkInfo = {}
    if stage == nil then
        return
    end
    local itemInfo = require("app.config.silkbag")
	
    for loopi = 1, itemInfo.length()  do 
        local itemData = itemInfo.indexOf(loopi)
		local itemColor = itemData.color
		local figthType = tonumber(itemData.is_fight)
		if figthType ~= 0 and itemColor == SeasonSilkConst.SILK_SCOP_GOLDLIMIT and figthType <= stage then	-- 金色
            self._goldSilkInfo = self._goldSilkInfo or {}
			
			table.insert(self._goldSilkInfo, {cfg = itemData})
			table.sort(self._goldSilkInfo, function(item1, item2)
				if item1.cfg.order ~= item2.cfg.order then
					return item1.cfg.order < item2.cfg.order
				else
					return item1.cfg.id < item2.cfg.id
				end
			end)
		end
    end
end


return SeasonSilkData