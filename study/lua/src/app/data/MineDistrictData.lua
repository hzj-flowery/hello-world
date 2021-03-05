--区域数据
local BaseData = require("app.data.BaseData")
local MineDistrictData = class("MineDistrictData", BaseData)
local MineEvent = require("app.config.mine_event")

MineDistrictData.DISTRICT_TYPE_SENIOR = 2

MineDistrictData.TYPE_REBOEN = 2

local schema = {}
schema["id"] = {"number", 0}
schema["configData"] = {"table", {}}
schema["mineIdList"] = {"table", {}}
schema["mineImageList"] = {"table", {}}
schema["guildId"] = {"number", 0}
schema["guildName"] = {"string", {}}
MineDistrictData.schema = schema

function MineDistrictData:ctor(config)
    MineDistrictData.super.ctor(self)
    self:setConfigData(config)
    self:setId(config.district_id)
end

function MineDistrictData:clear()
end

function MineDistrictData:reset()
end

--放入矿点id
function MineDistrictData:pushMineId(mineId)
    local list = self:getMineIdList()
    table.insert(list, mineId)
    self:setMineIdList(list)
end

--放入矿区镜像
function MineDistrictData:pushImage(imageId, imagePosX, imagePosY)
    local list = self:getMineImageList()
    local image = {
        id = imageId,
        position = cc.p(imagePosX, imagePosY),
    }
    table.insert(list, image)
    self:setMineImageList(list)
end

function MineDistrictData:getGuildData()
    if self:getConfigData().occupy_pit == 0 then 
        return nil
    end
    local guildList = {}
    local maxCount = 0
    local retGuildId = 0
    local retGuildName = ""
    for _, id in pairs(self:getMineIdList()) do 
        local mineData = G_UserData:getMineCraftData():getMineDataById(id) 
        local guildId = mineData:getGuildId()
        local guildName = mineData:getGuildName()
        if guildId ~= 0 then 
            if guildList[guildId] then 
                guildList[guildId].count = guildList[guildId].count + 1
            else
                guildList[guildId] = 
                {
                    count = 1,
                }
            end
            if guildList[guildId].count > maxCount then 
                retGuildId = guildId
                retGuildName = guildName
                maxCount = guildList[guildId].count
            end
        end
    end
    if maxCount >= self:getConfigData().occupy_pit then 
        local guildDetail = 
        {
            id = guildId, 
            name = guildName,
            count = maxCount,
        }
        return guildDetail
    end
end

function MineDistrictData:isSeniorDistrict()
    local config = self:getConfigData()
    return config.district_type <= MineDistrictData.DISTRICT_TYPE_SENIOR
end


function MineDistrictData:isDistrictCanReborn()
    if not self:isSeniorDistrict() then 
        return true
    end
    local myGuild = G_UserData:getGuild():getMyGuild()
    if not myGuild then 
        return false
    end
    local guildId = myGuild:getId()
    if self:getGuildId() == guildId then 
        return true
    end
	return false
end

function MineDistrictData:getRebornMine()
    local idList = self:getMineIdList()
    for _, id in pairs(idList) do 
        local mineData = G_UserData:getMineCraftData():getMineDataById(id)
        local pitType = mineData:getConfigData().pit_type
        if pitType == MineDistrictData.TYPE_REBOEN then 
            return mineData
        end
    end
end

function MineDistrictData:isOpen()
    local config = self:getConfigData()
    local unlockType = config.unlock_event
    local mineOpenTime = G_UserData:getMineCraftData():getOpenTime()
    local openTime = MineEvent.get(unlockType).start_time
    return  G_ServerTime:getTime() - mineOpenTime > openTime
end

return MineDistrictData