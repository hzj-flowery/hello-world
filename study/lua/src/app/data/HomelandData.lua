--种树数据
local BaseData = require("app.data.BaseData")
local HomelandData = class("HomelandData", BaseData)
local TreeInfo = require("app.config.tree_info")
local HomelandConst = require("app.const.HomelandConst")
local HomelandBuffData = require("app.data.HomelandBuffData")

local MAX_TREE_TYPE = 6
local schema = {}

HomelandData.schema = schema


function HomelandData:ctor(properties)
	HomelandData.super.ctor(self, properties)


    self._subTreeInfo = {}
    self._mainTreeInfo = {}
    self._treeManager = {}
    self._friendTreeData = {}
    self._buffDatas = {}
    self._buffNotice = {}

    self._signalRecvUpdateHomeTreeManager = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateHomeTreeManager, handler(self, self._s2cUpdateHomeTreeManager))

	self._signalRecvHomeTreeUpLevel = G_NetworkManager:add(MessageIDConst.ID_S2C_HomeTreeUpLevel, handler(self, self._s2cHomeTreeUpLevel))

	self._signalRecvUpdateHomeTree = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateHomeTree, handler(self, self._s2cUpdateHomeTree))

	self._signalRecvGetHomeTree = G_NetworkManager:add(MessageIDConst.ID_S2C_GetHomeTree, handler(self, self._s2cGetHomeTree))

	self._signalRecvHomeTreeHarvest = G_NetworkManager:add(MessageIDConst.ID_S2C_HomeTreeHarvest, handler(self, self._s2cHomeTreeHarvest))


    self._signalRecvVisitFriendHome = G_NetworkManager:add(MessageIDConst.ID_S2C_VisitFriendHome, handler(self, self._s2cVisitFriendHome))
    self._signalRecvHomeTreeBless = G_NetworkManager:add(MessageIDConst.ID_S2C_HomeTreeBless, handler(self, self._s2cHomeTreeBless))
    self._signalRecvHomeTreeBuffNotice = G_NetworkManager:add(MessageIDConst.ID_S2C_HomeTreeBuffNotice, handler(self, self._s2cHomeTreeBuffNotice))

    self:_initTreeCfg()
end

function HomelandData:_initTreeCfg( ... )
    -- body
    for i = 1, MAX_TREE_TYPE do
        local treeTable = {}
        treeTable.treeId = i
        treeTable.treeLevel = 0
        treeTable.treeExp = 0
        treeTable.treeCfg = self:getSubTreeCfg(treeTable.treeId,1)
        self._subTreeInfo["k"..treeTable.treeId] = treeTable
    end

    local treeTable = {}
    treeTable.treeId = 0
    treeTable.treeLevel = 1
    treeTable.treeExp = 0
    treeTable.treeCfg = self:getMainTreeCfg(1)
    self._mainTreeInfo = treeTable
end
-- 清除
function HomelandData:clear()
    self._signalRecvUpdateHomeTreeManager:remove()
	self._signalRecvUpdateHomeTreeManager = nil

	self._signalRecvHomeTreeUpLevel:remove()
	self._signalRecvHomeTreeUpLevel = nil

	self._signalRecvUpdateHomeTree:remove()
	self._signalRecvUpdateHomeTree = nil

	self._signalRecvGetHomeTree:remove()
	self._signalRecvGetHomeTree = nil

	self._signalRecvHomeTreeHarvest:remove()
	self._signalRecvHomeTreeHarvest = nil

    self._signalRecvVisitFriendHome:remove()
    self._signalRecvVisitFriendHome = nil
    
    self._signalRecvHomeTreeBless:remove()
    self._signalRecvHomeTreeBless = nil
    
    self._signalRecvHomeTreeBuffNotice:remove()
	self._signalRecvHomeTreeBuffNotice = nil
end

-- 重置
function HomelandData:reset()

end

function HomelandData:getTreeManager( ... )
    -- body
    return self._treeManager
end


-- Describle：
function HomelandData:_s2cUpdateHomeTreeManager(id, message)

	--check data
	local home_tree_manager = rawget(message, "home_tree_manager")
	if home_tree_manager then
        self._treeManager.lastStartTime = home_tree_manager.last_start_time
        self._treeManager.lastHarvestTime = home_tree_manager.last_harvest_time
        self._treeManager.total = home_tree_manager.total
	end

	G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_HOME_TREE_MANAGER_SUCCESS)
end
-- Describle：
-- Param:
--	id
function HomelandData:c2sHomeTreeUpLevel( id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_HomeTreeUpLevel, {
		id = id,
	})
end
-- Describle：
function HomelandData:_s2cHomeTreeUpLevel(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data


	G_SignalManager:dispatch(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, message)
end
-- Describle：
function HomelandData:_s2cUpdateHomeTree(id, message)

	--check data
	local home_tree = rawget(message, "home_tree")
	if home_tree then
        if home_tree.tree_id == 0 then
            self:_updateMainTree(home_tree)
        else
            self:_updateSubTree(home_tree)
        end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_HOME_TREE_SUCCESS)
end
-- Describle：
-- Param:

function HomelandData:c2sGetHomeTree()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetHomeTree, {

	})
end



-- Describle：
-- Param:
--	friend_id
function HomelandData:c2sVisitFriendHome( friend_id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_VisitFriendHome, {
		friend_id = friend_id,
	})
end

-- Describle：
function HomelandData:_s2cVisitFriendHome(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data

	local friend_id = rawget(message, "friend_id")
	if friend_id then
        self._friendTreeData.id = friend_id
	end
	local home_trees = rawget(message, "home_trees")
	if home_trees then
        
        local function getTreeData( treeId )
            -- body
            for i, value in ipairs(home_trees) do
                if treeId == value.tree_id then
                    return value
                end
            end
        end
        
        local homeTreeList = {}
        for i = 0, HomelandConst.MAX_SUB_TREE do
            local treeData = {}
            treeData.tree_id = i
            treeData.tree_level = 0
            treeData.tree_exp = 0
            
            local tempData = getTreeData(i)
            treeData = tempData or treeData
            table.insert( homeTreeList, treeData )
        end
        --dump(self._friendTreeData.homeTrees)
        self._friendTreeData.homeTrees = homeTreeList
	end

	G_SignalManager:dispatch(SignalConst.EVENT_VISIT_FRIEND_HOME_SUCCESS)
end

function HomelandData:c2sHomeTreeBless(pos)
	G_NetworkManager:send(MessageIDConst.ID_C2S_HomeTreeBless, {
		pos = pos,
	})
end

function HomelandData:_s2cHomeTreeBless(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end
    local buffId = rawget(message, "buff_id") or 0
    local pos = rawget(message, "pos") or 0
    G_SignalManager:dispatch(SignalConst.EVENT_HOME_TREE_BLESS_SUCCESS, buffId, pos)
end

function HomelandData:_s2cHomeTreeBuffNotice(id, message)
    local buffId = rawget(message, "buff_id")
    local buffData = self:getBuffDataWithId(buffId)
    if buffData then
        local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
        local buffBaseId = buffData:getBaseId()
        local tips = HomelandHelp.getBuffEffectTip(buffBaseId)
        local isDelay = HomelandConst.isDelayShowTip(buffBaseId)
        if isDelay then
            self._buffNotice[buffBaseId] = tips --延迟飘字,将飘字存起来
        else
            if tips ~= "" then
                G_Prompt:showTip(tips) --飘字
            end
        end
	end
end

function HomelandData:getBuffNoticeTip(buffBaseId)
    return self._buffNotice[buffBaseId]
end

function HomelandData:removeBuffNoticeTip(buffBaseId)
    self._buffNotice[buffBaseId] = nil
end

-- Describle：
--[[
    optional uint32 tree_id = 1;
	optional uint32 tree_level = 2;
	optional uint32 tree_exp = 3;
]]

function HomelandData:_makeTreeTable( treeInfo )
    -- body
    local treeTable = {}
    treeTable.treeId = treeInfo.tree_id
    treeTable.treeLevel = treeInfo.tree_level
    treeTable.treeExp = treeInfo.tree_exp
    if treeTable.treeId == 0 then
        treeTable.treeCfg = self:getMainTreeCfg(treeTable.treeLevel)

    elseif treeTable.treeId > 0 then
        treeTable.treeCfg = self:getSubTreeCfg(treeTable.treeId,treeTable.treeLevel)
        if treeTable.treeCfg == nil then
            treeTable.treeCfg = self:getSubTreeCfg(treeTable.treeId, 1)
        end
    end
    
    return treeTable
end
function HomelandData:_updateMainTree( treeInfo )
    local treeTable = self:_makeTreeTable(treeInfo)
    self._mainTreeInfo = treeTable
end

function HomelandData:_updateSubTree( treeInfo )
    -- body
    local treeTable = self:_makeTreeTable(treeInfo)
    self._subTreeInfo["k"..treeTable.treeId] = treeTable
end
function HomelandData:_s2cGetHomeTree(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local home_manager = rawget(message, "home_manager")
	if home_manager then
        self._treeManager.lastStartTime = home_manager.last_start_time
        self._treeManager.lastHarvestTime = home_manager.last_harvest_time
        self._treeManager.total = home_manager.total
	end


	local home_trees = rawget(message, "home_trees")
	if home_trees then
        for i , treeInfo in ipairs(home_trees) do
            if treeInfo.tree_id == 0 then
                self:_updateMainTree(treeInfo)
            else
                self:_updateSubTree(treeInfo)
            end
        end
    end
    
    self._buffDatas = {}
    local homeTreeBuffs = rawget(message, "home_tree_buffs")
    if homeTreeBuffs then
        for i, buff in ipairs(homeTreeBuffs) do
            local data = HomelandBuffData.new()
            data:updateData(buff)
            local id = data:getId()
            self._buffDatas[id] = data
        end
    end

	G_SignalManager:dispatch(SignalConst.EVENT_GET_HOME_TREE_SUCCESS)
end
-- Describle：
-- Param:

function HomelandData:c2sHomeTreeHarvest()
	G_NetworkManager:send(MessageIDConst.ID_C2S_HomeTreeHarvest, {

	})
end
-- Describle：
function HomelandData:_s2cHomeTreeHarvest(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local awards = rawget(message, "awards")
	if not awards then

	end

	G_SignalManager:dispatch(SignalConst.EVENT_HOME_TREE_HARVEST_SUCCESS,message)
end

function HomelandData:getSubTreeLevel( subTreeType )
    -- body
    local subTreeInfo = self._subTreeInfo["k"..subTreeType]
    --dump(subTreeInfo)
    return subTreeInfo.treeLevel
end



function HomelandData:isSubTreeLevelMax( subTreeType, inputLevel )
    local currLevel = inputLevel or self:getSubTreeLevel(subTreeType)
    local isMax = self:getSubTreeCfg(subTreeType, currLevel+1) == nil
    -- body
    return isMax
end

function HomelandData:isMainTreeLevelMax(inputLevel)
    local currLevel = inputLevel or self:getMainTreeLevel()
    local isMax = self:getMainTreeCfg(currLevel+1) == nil
    -- body
    return isMax
end


--获取主树信息
function HomelandData:getMainTreeLevel( ... )
    -- body
    local mainTree = self._mainTreeInfo
    return mainTree.treeLevel
end



function HomelandData:getMainTreeCfg( id )
    -- body
    if id > 0 then
        local mainTreeCfg = require("app.config.tree_info").get(id)
        return mainTreeCfg
        --assert(mainTreeCfg, string.format( "can not find tree_info by id[%d]", id ))
    end
    return nil
end


function HomelandData:getSubTreeCfg( type, level )
    -- body
    if type > 0 and level > 0 then
        local subTreeCfg = require("app.config.tree_decorate_add").get(type,level)
        --assert(subTreeCfg, string.format( "can not find tree_decorate_add by type[%d], level[%d]",type,level))
        return subTreeCfg
    end
    return nil
end


function HomelandData:getGuildMemberByFriendId( friendId )
    local dataList = self:getGuildMemberList()
    for i, data in ipairs(dataList) do
        if data:getUid() == friendId then
            return data
        end
    end
    return nil
end
--返回公会成员列表
function HomelandData:getGuildMemberList( ... )
    local isInGuild = G_UserData:getGuild():isInGuild()
    if isInGuild == false then
        return {}
    end
    local dataList = G_UserData:getGuild():getGuildMemberListBySort()


    local function fitlerSelfUser(dataList)
        local retList = {}
        for i , value in ipairs(dataList) do
            if value:getHome_tree_level() > 0 then
                table.insert(retList, value)
            end
        end
        return retList
    end
    local function sortFun(a, b)
        local selfA = a:isSelf() and 1 or 0
		local selfB = b:isSelf() and 1 or 0
		if selfA ~= selfB then
			return selfA > selfB
		end

        if a:getHome_tree_level() ~= b:getHome_tree_level() then
			return a:getHome_tree_level() > b:getHome_tree_level()
		end

    end

    local retList =  fitlerSelfUser(dataList)
    table.sort(retList, sortFun)

    return retList
end





function HomelandData:getMainTree( ... )
    -- body
    --self._mainTreeInfo.treeCfg = self:getMainTreeCfg(HomelandConst.HOMELAND_TREE_DEFAULT_LEVEL)
    return self._mainTreeInfo
end

function HomelandData:getSubTree( treeId )
    -- body
    if treeId and treeId > 0 then
        local treeData = self._subTreeInfo["k"..treeId]
       -- treeData.treeCfg = self:getSubTreeCfg(treeId,HomelandConst.HOMELAND_TREE_DEFAULT_LEVEL)
        return treeData
    end
    return nil
end

--获取其他人的家园数据
function HomelandData:getInviteFriendMainTree( friendId )
    -- body
    local homeTree = self._friendTreeData.homeTrees
    local function getMainTree( homeTree )
        -- body
        for i, treeInfo in ipairs(homeTree) do
            if treeInfo.tree_id == 0 then
                local treeTable = self:_makeTreeTable(treeInfo)
                return treeTable
            end
        end
        return nil
    end
    if friendId and friendId == self._friendTreeData.id then
        return getMainTree(homeTree)
    end
    if friendId == nil then
        return getMainTree(homeTree)
    end

    return nil
end


function HomelandData:getInviteFriendSubTreeTest( subTreeType )
    local homeTree = self._friendTreeData.homeTrees

    local function getSubTree( homeTree )
        -- body
        for i, treeInfo in ipairs(homeTree) do
            if treeInfo.tree_id == subTreeType then
                local treeTable = self:_makeTreeTable(treeInfo)
                return treeTable
            end
        end
        return nil
    end

   
    return getSubTree(homeTree)

end
function HomelandData:getInviteFriendSubTree( friendId, subTreeType )
    local homeTree = self._friendTreeData.homeTrees

    local function getSubTree( homeTree )
        -- body
        for i, treeInfo in ipairs(homeTree) do
            if treeInfo.tree_id == subTreeType then
                local treeTable = self:_makeTreeTable(treeInfo)
                return treeTable
            end
        end
        return nil
    end

    if friendId and friendId == self._friendTreeData.id then
        return getSubTree(homeTree)
    end

    if friendId == nil then
        return getSubTree(homeTree)
    end
    return nil
end

--神树奖励是否领取
function HomelandData:isTreeAwardTake( ... )
    local count = G_UserData:getDailyCount():getCountById(G_UserData:getDailyCount().DAILY_RECORD_HOME_TREE_AWARD)
    if count > 0 then
        return true
    end
    return false
end


--小红点判定
function HomelandData:hasRedPoint( ... )
    -- body


    local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
    --if HomelandHelp.isTreeProduceMax() then
    --    return true
    --end

    
	if G_UserData:getHomeland():isTreeAwardTake() == false then
        return true
    end
    
    local redValue1 = HomelandHelp.checkMainTreeUp(self._mainTreeInfo,false)
    if redValue1 == true then
        return true
    end

    for i =1, HomelandConst.MAX_SUB_TREE do
        local subTree = self:getSubTree(i)
        local redValue = HomelandHelp.checkSubTreeUp(subTree,false)
        if redValue == true then
            return true
        end
    end

    if self:getPrayRestCount() > 0 then
        return true
    end
    return false
end

function HomelandData:updateBuffData(datas)
    if datas == nil or type(datas) ~= "table" then
		return
	end
	for i, data in ipairs(datas) do
        self._buffDatas[data.id] = nil
        local buffData = HomelandBuffData.new()
        buffData:updateData(data)
        self._buffDatas[data.id] = buffData
    end
end

function HomelandData:insertBuffData(datas)
    if datas == nil or type(datas) ~= "table" then
		return
    end
    for i, data in ipairs(datas) do
        self._buffDatas[data.id] = nil
        local buffData = HomelandBuffData.new()
        buffData:updateData(data)
        self._buffDatas[data.id] = buffData
    end
end

function HomelandData:deleteBuffData(datas)
    if datas == nil or type(datas) ~= "table" then
		return
    end
    for i, id in ipairs(datas) do
        self._buffDatas[id] = nil
    end
    local count = 0
    for id, data in pairs(self._buffDatas) do
		count = count + 1
    end
    if count == 0 then
        G_SignalManager:dispatch(SignalConst.EVENT_HOME_LAND_BUFF_EMPTY)
    end
end

function HomelandData:getBuffDatasBySort()
    local result = {}
    for id, data in pairs(self._buffDatas) do
		table.insert(result, data)
	end
	table.sort(result, function(a, b)
		if a:isEffected() ~= b:isEffected() then
			return not a:isEffected()
		else
			return a:getStartTime() < b:getStartTime()
		end
    end)
    
    return result
end

--今天抽到的buff
function HomelandData:getBuffDatasToday()
    local TimeConst = require("app.const.TimeConst")
    local result = {}
    for id, data in pairs(self._buffDatas) do
        local startTime = data:getStartTime()
        local tempTime = G_ServerTime:secondsFromZero(nil, TimeConst.RESET_TIME_SECOND)
        if startTime >= tempTime then
            local pos = data:getPos()
            result[pos] = data
        end
    end
    
    return result
end

function HomelandData:getBuffDataWithId(id)
    return self._buffDatas[id]
end

function HomelandData:getBuffDatasWithBaseId(baseId)
    local result = {}
    for id, buffData in pairs(self._buffDatas) do --可能有多个相同的
        if buffData:getBaseId() == baseId then
            table.insert(result, buffData)
        end
    end
    return result
end

--神树祈福剩余次数
function HomelandData:getPrayRestCount()
    local count = G_UserData:getDailyCount():getCountById(G_UserData:getDailyCount().DAILY_RECORD_HOME_TREE_PRAY)
    local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
    local level = self:getMainTreeLevel()
    local info = HomelandHelp.getTreeInfoConfig(level)
    local totalCount = info.prayer_times
    return totalCount - count
end

return HomelandData
