local GrainCarDataHelper = {}

local GrainCarParameter = require("app.config.graincar_parameter")
local GrainCarConst  = require("app.const.GrainCarConst")
local TimeConst  = require("app.const.TimeConst")

--获取一个矿里的军团列表
-- {
--     {id, name, data}
--     {id, name, data}
-- }
function GrainCarDataHelper.getGuildListWithMineId(mineId)
    local mineData = G_UserData:getMineCraftData():getMineDataById(mineId)
    local guildList = {}
    local tempGuildHash = {} -- 军团哈希
    for _, mineUser in pairs(mineData:getUsers()) do
        local guildId = mineUser:getGuild_id()
        if not tempGuildHash[guildId] then
            tempGuildHash[guildId] = 1

            table.insert(guildList, {
                id = guildId, 
                name = mineUser:getGuild_name(),
                data = {}
                })
        end
    end

     --有车没人的情况
     local carList = G_UserData:getGrainCar():getGrainCarList()
     for _, carUnit in pairs(carList) do
         local guildId = carUnit:getGuild_id()
         local isMine = GrainCarDataHelper.isMyGuild(guildId)
         if not tempGuildHash[guildId] then
            tempGuildHash[guildId] = 1

            table.insert(guildList, {
                id = guildId, 
                name = carUnit:getGuild_name(),
                data = {}
                })
        end
     end

    return guildList
end

--根据矿id获取用户列表 根据军团分割
-- {
--     {
--         id = 350001000378, --0:别人无工会 1：自己无工会
--         name = name,
--         data = {{id=1, mineUser=mineUser, pos=pos, avatar=avatar, isDirty=false},
--                  {id=2, mineUser=mineUser, pos=pos, avatar=avatar, isDirty=false},}, 
--         startOffset = 0,
--         endOffset = 0,
--         isMine = true,
--         car = carUnit,
--         haveCar = true,
--         isDirty = true,
--         pos = cc.p(0, 0)
--     },
--     ...
-- }
function GrainCarDataHelper.getUserListDividByGuildWithMineId(mineId)
    local mineData = G_UserData:getMineCraftData():getMineDataById(mineId)
    local guildList = {}
    local tempGuildHash = {} -- 哈希：guildId —— guildList序号
    if not mineData then
        return guildList
    end
    for _, mineUser in pairs(mineData:getUsers()) do
        local guildId = mineUser:getGuild_id()
        if not tempGuildHash[guildId] then
            local carUnit = G_UserData:getGrainCar():getGrainCarWithGuildId(guildId)
            local haveCar = false
            local isMine = GrainCarDataHelper.isMyGuild(guildId)
            if guildId == 0 then
                local isMe = mineUser:getUser_id() == G_UserData:getBase():getId()
                guildId = isMe and 1 or 0 --0:别人无工会 1：自己无工会
                isMine = isMe
            end
            if carUnit and carUnit:getStamina() > 0 then
                local isInMine = carUnit:isInMine(mineId)
                haveCar = isInMine and true or false
            end
            
            table.insert(guildList, {
                id = guildId, 
                name = mineUser:getGuild_name(),
                haveCar = haveCar,
                car = carUnit,
                startOffset = 0,
                endOffset = 0,
                pos = cc.p(0, 0),
                isMine = isMine,
                isDirty = false,
                data = {}
                })
            tempGuildHash[guildId] = #guildList
        end

        local guildIndex = tempGuildHash[guildId]
        local guild = guildList[guildIndex]
        table.insert(guild.data, {id = mineUser:getUser_id(), mineUser = mineUser, isDirty = false})
    end

    --有车没人的情况
    local carList = G_UserData:getGrainCar():getGrainCarList()
    for _, carUnit in pairs(carList) do
        if carUnit:getStamina() > 0 then
            local guildId = carUnit:getGuild_id()
            local isMine = GrainCarDataHelper.isMyGuild(guildId)
            if carUnit:isInMine(mineId) and not tempGuildHash[guildId] then
                table.insert(guildList, {
                            id = guildId, 
                            name = carUnit:getGuild_name(),
                            haveCar = true,
                            car = carUnit,
                            startOffset = 0,
                            endOffset = 0,
                            pos = cc.p(0, 0),
                            isMine = isMine,
                            isDirty = false,
                            data = {}
                            })
                tempGuildHash[guildId] = #guildList
            end
        end
    end
    return guildList
end

--获取有粮车的军团列表 数据结构同上
function GrainCarDataHelper.getGuildListDividByGuildWithMineId(mineId)
    local guildList = {}
    local tempGuildHash = {} -- 哈希：guildId —— guildList序号
    local carList = G_UserData:getGrainCar():getGrainCarList()
    for _, carUnit in pairs(carList) do
        if carUnit:getStamina() > 0 then
            local guildId = carUnit:getGuild_id()
            local isMine = GrainCarDataHelper.isMyGuild(guildId)
            if carUnit:isInMine(mineId) and not tempGuildHash[guildId] then
                table.insert(guildList, {
                            id = guildId, 
                            name = carUnit:getGuild_name(),
                            haveCar = true,
                            car = carUnit,
                            startOffset = 0,
                            endOffset = 0,
                            pos = cc.p(0, 0),
                            isMine = isMine,
                            isDirty = false,
                            data = {}
                            })
                tempGuildHash[guildId] = #guildList
            end
        end
    end
    return guildList
end

--排序军团
function GrainCarDataHelper.sortGuild(guildList)
    local sortFunc = function(a, b)
        if a.isMine ~= b.isMine then
            return a.isMine
        elseif GrainCarDataHelper.isMyGuild(a.id) ~= GrainCarDataHelper.isMyGuild(b.id) then
            return GrainCarDataHelper.isMyGuild(a.id)
        elseif a.haveCar ~= b.haveCar then
             --有车的排前面
             return a.haveCar
        elseif a.id ~= 0 and b.id ~= 0 and #a.data ~= #b.data then
            --人数多的排前面
            return #a.data > #b.data
        else
            --没工会的排后面
            return a.id > b.id
        end
        
		return GrainCarDataHelper.isMyGuild(a.id)
	end
	table.sort(guildList, sortFunc)
	return guildList
end

--获取某个矿里所有的车
function GrainCarDataHelper.getGuildCarInMineId(mineId)
    local carList = {}
    local list = G_UserData:getGrainCar():getGrainCarList()
    for i, carUnitData in pairs(list) do
        local pit1, pit2, percent = carUnitData:getCurCarPos()
        if mineId == pit1 and 
            carUnitData:isStop() then
            if carUnitData:getEnd_time() == 0 then 
                table.insert(carList, carUnitData)
            else
                if not carUnitData:hasComplete() then
                    table.insert(carList, carUnitData)
                end
            end
        end
    end

    local sortFunc = function(a, b)
        return a:getLeaveTime() < b:getLeaveTime()
    end
    table.sort(carList, sortFunc)
    return carList
end

--是否是自己军团
function GrainCarDataHelper.isMyGuild(guildId)
    local myGuildId = G_UserData:getGuild():getMyGuildId()
    if myGuildId ~= 0 and guildId == myGuildId then 
        return true 
    end
    return false
end

--某个矿里有没有车
function GrainCarDataHelper.haveCarInMineId(mineId)
    local list = G_UserData:getGrainCar():getGrainCarList()
    for _, carUnit in pairs(list) do
        if carUnit:getStamina() > 0 and carUnit:isInMine(mineId) then
            return true
        end
    end
    return false
end

--下次劫镖剩余时间
function GrainCarDataHelper.canAttackGrainCar()
    local lastAtkTime = G_UserData:getGrainCar():getAttack_time()
    local attackTime = lastAtkTime + GrainCarConst.ATTACK_CD - 1
    local curTime = G_ServerTime:getTime()
    if lastAtkTime == 0 or curTime > attackTime then
        return true, 0
    end
    return false, attackTime
end

--是否显示粮车尸体
function GrainCarDataHelper.canShowCarCorpse()
    local showTime = G_UserData:getGrainCar():getCorpseShowTime()
    local curTime = G_ServerTime:getTime()
    return showTime and curTime <= showTime
end


return GrainCarDataHelper