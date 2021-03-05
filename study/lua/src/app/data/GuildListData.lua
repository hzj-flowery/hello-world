
local BaseData = require("app.data.BaseData")
local GuildListData = class("GuildListData", BaseData)
local GuildUnitData = require("app.data.GuildUnitData")

local schema = {}

schema["total_cnt"] = {"number", 0}  
schema["num"] = {"number", 0}  

GuildListData.ITEM_NUM_PER_PAGE = 50 

GuildListData.schema = schema

function GuildListData:ctor()
	GuildListData.super.ctor(self)
    self._guildList = {} --军团列表
end

function GuildListData:clear()

end

function GuildListData:reset()
    self._guildList = {}
end

function GuildListData:addNewPage(message)
	--[[
        required uint32 ret = 1;
        optional uint32 num = 2;
        optional uint32 total_cnt = 3;
        repeated Guild guilds = 4;
	]]

    self:setProperties(message)

    local pageNun = message.num

    local guilds = rawget(message, "guilds") or {}
	for i, data in ipairs(guilds) do
		self:_setGuildUnitData( (pageNun -1 ) * GuildListData.ITEM_NUM_PER_PAGE + i ,data)
	end
end


function GuildListData:_setGuildUnitData(index,data)
    self._guildList["k_"..tostring(index)] = nil
    local unitData = GuildUnitData.new(data)
    self._guildList["k_"..tostring(index)] = unitData
end

--获取已经申请过的数量
function GuildListData:getHasAppliedCount()
	local count = 0
	for k, data in pairs(self._guildList) do
		if data:isHas_application() then
			count = count + 1
		end
	end
	return count
end


function GuildListData:getGuildListBySort()
	return self:getGuildListByPage(self:getTotalPage())
end

function GuildListData:getGuildListByPage(pageNum)
    local result = {}
	for index = 1, GuildListData.ITEM_NUM_PER_PAGE * pageNum, 1 do
        local unitData = self._guildList["k_"..tostring(index)] 
        if unitData then
            table.insert(result, unitData)
        end
	end
	return result
end

function GuildListData:getTotalPage()
   return math.ceil( self:getTotal_cnt()/ GuildListData.ITEM_NUM_PER_PAGE )
end

return GuildListData

