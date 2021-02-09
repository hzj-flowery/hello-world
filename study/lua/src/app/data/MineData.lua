--矿数据
local BaseData = require("app.data.BaseData")
local MineData = class("MineData", BaseData)
local MineUserData = require("app.data.MineUserData")
local MineOutPut = require("app.config.mine_output")

local schema = {}
schema["id"] = {"number", 0}
schema["configData"] = {"table", {}}
schema["guildId"] = {"number", 0}
schema["guildName"] = {"string", ""} 
schema["userCnt"] = {"number", 0}       --矿区人数，用于一开始显示
schema["users"] = {"table", {}}
schema["own"] = {"boolean", false}
schema["requestData"] = {"boolean", false}
schema["guildIcon"] = {"number", 0}
schema["multiple"] = {"number", 0}
schema["startTime"] = {"number", 0}     -- 和平矿开始时间
schema["endTime"] = {"number", 0}       -- 和平矿结束时间
MineData.schema = schema

function MineData:ctor(config)
    MineData.super.ctor(self)
    self:setId(config.pit_id)
    self:setConfigData(config)
    self._otherGuildList = {}     --其他的工会
    self._mineGuildList = {}     --占有者的工会
    self._otherList = {}        --野人
    self._selfGuildList = {}     --我自己的工会
    self._selfData = nil            --我自己

    self._userList = {}
    self._userIdMap = {} 			-- id index 映射
    self._oldUsers = {} 			-- 获取新数据页时保存原有数据
    self._oldUserCount = {}         -- 老数据页计数，防止新增玩家时刷新所有数据
end

function MineData:clear()
end

function MineData:reset()
end

function MineData:refreshUser()
    self._otherGuildList = {}    --其他的工会
    self._mineGuildList = {}     --占有者的工会
    self._otherList = {}         --野人
    self._selfGuildList = {}     --我自己的工会
    self._selfData = nil            --我自己
    if #self._oldUsers>0 then 	-- 将老数据剔除
        local list = {}
        self._userIdMap = {}
        for i=#self._oldUsers+1,#self._userList do
            table.insert(list, self._userList[i])
            self._userIdMap[self._userList[i]:getUser_id()] = #list
        end
        self._userList = list
    end
    local count = 0
    for i,v in ipairs(self._oldUserCount) do
        count = count + v
    end
    if count<#self._oldUsers+#self._userList then
        table.insert(self._oldUserCount, #self._oldUsers+#self._userList-count)
    end
    for _, user in pairs(self._userList) do 
        self:_pushGuildMap(user)
    end
    self:_sortUserList()
    self._userList = {}         --复制完成后，删除
    self._userIdMap = {}
    self._oldUsers = {}
end

function MineData:getUserCount()
    local users = self:getUsers()
    return #users
end

-- 保留原有数据，并保存顺序
function MineData:resetUserList()
    
    local list = self:getUsers()
    self._oldUsers = {}
    for i,v in ipairs(list) do
        self._oldUsers[i] = v
        table.insert(self._userList, v)
        self._userIdMap[v:getUser_id()] = #self._userList
    end
end

function MineData:_pushGuildMap(userData)
    local myGuild = G_UserData:getGuild():getMyGuild()
    local myGuildId = nil
	if myGuild then 
		myGuildId = myGuild:getId()
	end
    if userData:getUser_id() == G_UserData:getBase():getId() then
        self._selfData = userData
        return
    end
    if userData:getGuild_id() == 0 then     --野人
        table.insert(self._otherList, userData)
        return 
    end
    if myGuildId then 
        if userData:getGuild_id() == myGuildId and userData:getUser_id() ~= G_UserData:getBase():getId() then 
            table.insert(self._selfGuildList, userData)
            return
        end
    end
    if userData:getGuild_id() == self:getGuildId() then 
        table.insert(self._mineGuildList, userData)
        return 
    end
    for i, v in pairs(self._otherGuildList) do 
        if v.id == userData:getGuild_id() then 
            table.insert(v.users, userData)
            return 
        end
    end
    local singleGuild = 
    {
        id = userData:getGuild_id(),
        name = userData:getGuild_name(),
        level = userData:getGuild_level(),
        exp = userData:getGuild_exp(),
        users = {userData},
    }
    table.insert(self._otherGuildList, singleGuild)
end

function MineData:_sortUserList()

    local list = self._oldUsers

    table.sort( self._selfGuildList, function(a, b)
        return a:getPower() > b:getPower()
    end )

    table.sort(self._mineGuildList, function(a,b)
        return a:getPower() > b:getPower()
    end)

    table.sort(self._otherList, function(a, b)
        return a:getPower() > b:getPower()
    end)

    table.sort(self._otherGuildList, function(a, b)
        if a.level == b.level then 
            return a.exp > b.exp
        end
        return a.level > b.level
    end)

    for _, data in pairs(self._otherGuildList) do 
        table.sort(data.users, function(a, b)
            return a:getPower() > b:getPower()
        end) 
    end

    local count = #list+1
    if self._selfData then
        list[count] = self._selfData
        count = count + 1
    end

    for _, user in pairs(self._selfGuildList) do 
        list[count] = user
        count = count + 1
    end

    for _, user in pairs(self._mineGuildList) do 
        list[count] = user
        count = count + 1
    end

    for _, guild in pairs(self._otherGuildList) do 
        for _, user in pairs(guild.users) do 
            list[count] = user
            count = count + 1
        end
    end

    for _, user in pairs(self._otherList) do 
        list[count] = user
        count = count + 1
    end

    self:setUsers(list)
end

-- --刷新占领工会情况
-- function MineData:refreshGuild(guildId, guildName)
--     self:setGuildId(guildId)
--     self:setGuildName(guildName)
-- end

-- function MineData:refreshData(data)
--     print("1112233 refresh mine data")
--     self:refreshGuild(data.guild_id, data.guild_name)
--     self:refreshUser(data.mine_users)
-- end

-- function MineData:getUserCount()
--     return #self:getUsers()
-- end

function MineData:getMineStateConfig()
    local userCount = self:getUserCnt()
    if self:getConfigData().pit_type == 2 then      --如果是主城
        userCount = 0
    end
    local outputId = self:getConfigData().templet_id
    local outputConfig = nil
    local baseOutput = nil
    local min = -1
	for i = 1, MineOutPut.length() do 
        local config = MineOutPut.indexOf(i)
        if config.templet_id == outputId then 
            if not baseOutput then 
                baseOutput = config
            end
            if userCount > min and userCount <= config.population then 
                outputConfig = config
                return outputConfig, baseOutput
            else 
                min = config.population
            end
        end
    end
end

function MineData:getGuildMemberCount(guildId)
    local id = guildId or self:getGuildId()
    local userList = self:getUsers()
    local count = 0
    for _, user in pairs(userList) do 
        if user:getGuild_id() == id then 
            count = count + 1
        end
    end
    return count
end

function MineData:isSeniorDistrict()
    local districtId = self:getConfigData().district
    local data = G_UserData:getMineCraftData():getDistrictDataById(districtId)
    return data:isSeniorDistrict()
end

function MineData:isUserInList(userId)
    for _, user in pairs(self:getUsers()) do 
        if user:getUser_id() == userId then 
            return true
        end
    end
    return false
end

function MineData:getUserById(userId)
    for _, user in pairs(self:getUsers()) do 
        if user:getUser_id() == userId then 
            return user
        end
    end 
end

function MineData:pushUser(userData)
    local mineUserData = MineUserData.new(userData)  
    local userId = mineUserData:getUser_id()
    if self._userIdMap[userId] then     -- 防止重复
        local index = self._userIdMap[userId]
        self._userList[index] = mineUserData
    else
        table.insert(self._userList, mineUserData)
        self._userIdMap[userId] = #self._userList
    end
end

function MineData:clearUserList()
    self._userList = {}
    self._userIdMap = {}
    self._oldUsers = {}
    self._oldUserCount = {}
end

function MineData:getUserById(userId)
    for i, v in pairs(self:getUsers()) do 
        if v:getUser_id() == userId then 
            return v
        end
    end
end

function MineData:deleteUser(userId)
    if not self:hasUsers() then     --没有用户的时候，不操作
        return 
    end
    local configData = self:getConfigData()
    if configData.pit_type == 2 then    --主城
        return
    end
    local users = self:getUsers()
    local list = {}
    local indexList = {}
    for i, v in pairs(users) do 
        if v:getUser_id() ~= userId then
            table.insert(list, v)
        else
            table.insert(indexList, i)
        end
    end
    local count = 0
    local index = 1
    for i,v in ipairs(self._oldUserCount) do
        count = count+v
        while index<=#indexList do
            if indexList[index]<=count then
                self._oldUserCount[i] = v-1
                index = index+1
            else
                break
            end
        end
    end

    self:setUsers(list)
end

function MineData:updateUser(mineUser)
    local user = self:getUserById(mineUser.user_id)
    if user then 
        user:setProperties(mineUser)
    end
end

function MineData:newUser(user) 
    if not self:hasUsers() then     --没有用户的时候，不操作
        return 
    end
    local configData = self:getConfigData()
    if configData.pit_type == 2 then    --主城
        return
    end
    self._userList = {}
    self._userIdMap = {}

    -- 老数据顺序不变
    local count = 0
    for i=1,#self._oldUserCount-1 do
        count = count+ self._oldUserCount[i]
    end
    self._oldUsers = {}
    local userList = self:getUsers()
    for i=1,count do
        local item = userList[i]
        if not item then break end
        table.insert(self._oldUsers, item)
        table.insert(self._userList, item)
        self._userIdMap[item:getUser_id()] = #self._userList
    end
    -- 最近的数据重新排序
    for i=count+1,#userList do
        local item = userList[i]
        if not item then break end
        table.insert(self._userList, item)
        self._userIdMap[item:getUser_id()] = #self._userList
    end
    self:pushUser(user)
    self._oldUserCount[#self._oldUserCount] = self._oldUserCount[#self._oldUserCount]+1
    self:refreshUser()
end

function MineData:isMyGuildMine()
    local myGuildId = G_UserData:getGuild():getMyGuildId()
    if myGuildId ~= 0 and self:getGuildId() == myGuildId then 
        return true 
    end
end

function MineData:hasUsers()
    local userList = self:getUsers()
    -- return #userList == self:getUserCnt()       --人数不一样，则认为数据旧了，需要更新
    return #userList ~= 0
end

function MineData:clearUsers()
    self:setUsers({})   
end

function MineData:isPeace()
    local now = G_ServerTime:getTime()
    return now >= self:getStartTime() and now < self:getEndTime()
end

return MineData