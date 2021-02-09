--成就数据
local BaseData = import(".BaseData")
local AchievementData = class("AchievementData",BaseData)

local AchievementInfo = require("app.config.achievement")
--local RequirementInfo = require("app.config.requirement")

local ACHI_SERVER_PREV = "achi_server_"
local ACHI_CONFIG_PREV = "achi_config_"
local ACHI_TYPE_PREV = "achi_type_"

AchievementData.TARGET_TYPE = 1
AchievementData.GAME_TYPE =2
AchievementData.FIRST_MEET_TYPE =3

function AchievementData:c2sGetAchievementInfo()
 
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetAchievementInfo, {})
end

function AchievementData:c2sGetAchievementReward(achId)
    --判断是否过期
    if self:isExpired() == true then
        self:c2sGetAchievementInfo()
        return
    end

	if achId then
		local message = {
			id = achId
		}
		G_NetworkManager:send(MessageIDConst.ID_C2S_GetAchievementReward, message)
	end
end

function AchievementData:ctor()
    AchievementData.super.ctor(self)
    self:_initData()
    self._getAchievementInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAchievementInfo, handler(self, self._s2cGetAchievementInfo))
    self._updateAchievementInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateAchievementInfo, handler(self, self._s2cUpdateAchievementInfo))
    self._getAchievementReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAchievementReward, handler(self, self._s2cGetAchievementReward))
end


-- 清除
function AchievementData:clear()
    self._getAchievementInfo:remove()
    self._getAchievementInfo = nil

    self._updateAchievementInfo:remove()
    self._updateAchievementInfo = nil

    self._getAchievementReward:remove()
    self._getAchievementReward = nil
end

-- 重置
function AchievementData:reset()

end

--初始化数据
function AchievementData:_initData()

    self._achiServerData = {}         --成就服务器数据缓存
    self._achiListData = {} 
    self._achiCfgData = {}
    self._dataIsDirty = false         --是否是脏数据
      

end


function AchievementData:_s2cUpdateAchievementInfo(id, message)

	self:_updateAchievementData(message)
    self:_setDataIsDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_ACHIEVEMENT_UPDATE, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACHIEVEMENT)
end


function AchievementData:_s2cGetAchievementReward(id, message)

    self:_setDataIsDirty(true)

    if message.ret == MessageErrorConst.RET_OK then
        G_SignalManager:dispatch(SignalConst.EVENT_GET_ACHIEVEMENT_AWARD, message)
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACHIEVEMENT)
    end
	
end


function AchievementData:_s2cGetAchievementInfo(id, message)
	if message.ret ~= 1 then
		return
	end

    self:resetTime()
	self:_setAchievementData(message)
    
    self:_setDataIsDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_ACHIEVEMENT_INFO, message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACHIEVEMENT)
end

--缓存服务器端成就数据
--data为服务器端数据
function AchievementData:_setAchievementData(datas)

    if type(datas)~="table" then 
        return 
    end
    self:_initData()
    local achs = datas.achs or {}

    for i=1,#achs do
        self:_setOneAchievementData(achs[i])
    end
  
end

function AchievementData:_getConfigData(type,value)
    
    local function condition(info)
        if info.type == type and info.value == value then
            return info
        end
    end

    local values = {}
    for i=1, AchievementInfo.length() do
        local info = AchievementInfo.indexOf(i)
        if condition(info) then
            values[#values+1] = info
        end
    end

    return values

end
--缓存一条服务器数据
function AchievementData:_setOneAchievementData( data )
    -- body
    if type(data)~="table" then 
        return 
    end
    
    local achi = {}

    achi.type = data.type   --服务器中的成就类型
    achi.value = data.value

    if rawget(data, "reward_ids") then
        achi.reward_ids = data.reward_ids
    else
        achi.reward_ids = {}
    end

    self._achiServerData[ACHI_SERVER_PREV..data.type] = achi
end


--只更新成就服务器数据 
function AchievementData:_updateAchievementData(datas)

    if type(datas)~="table" then 
        return 
    end

    local achs = datas.achs or {}
  
    --更新缓存成就数据
    for i=1, #achs do
        local achiData = achs[i]
        self:_setOneAchievementData(achiData)

        local achiType = achiData.type
        
        --更新服务器数据进度
        for j=1, AchievementData.FIRST_MEET_TYPE do
            if self._achiListData[j] and self._achiListData[j][ACHI_TYPE_PREV..achiType] then
                local hasGetReward = self:_hasGetAward(achiType,self._achiListData[j][ACHI_TYPE_PREV..achiType].cfgData.id)
                self._achiListData[j][ACHI_TYPE_PREV..achiType].serverData.now_value = achiData.value
                self._achiListData[j][ACHI_TYPE_PREV..achiType].serverData.getAward = hasGetReward
            end
        end 
    end
    achs = nil
end



--是否需要更新成就列表 可能需要修改
--function AchievementData:_setDataIsDirty(showArea, isDirty )
function AchievementData:_setDataIsDirty(isDirty )
    -- body
    self._dataIsDirty = isDirty or false
end

--获取成就列表需要显示的数据
function AchievementData:getAchievementListData( tabIndex, needSort)
    if needSort == nil then
        needSort = true
    end
    --需要重置下
    if self._dataIsDirty or self._achiListData[tabIndex] == nil then
        self._achiListData[tabIndex] = self:_getAchievementData(tabIndex)
        self._dataIsDirty = false
    end

    local list = {}

    for k, v in pairs(self._achiListData[tabIndex]) do
        table.insert(list,v)
    end
    if needSort == true then
        self:_sortAchievements(list)
    end
    return list
end


--是否有奖励可以领取 用于显示小红点
function AchievementData:getNewAward()

    if self:hasAnyAwardCanGet(AchievementData.TARGET_TYPE) > 0 then
        return true
    end
    if self:hasAnyAwardCanGet(AchievementData.GAME_TYPE) > 0 then
        return true
    end
    if self:hasAnyAwardCanGet(AchievementData.FIRST_MEET_TYPE) > 0 then
        return true
    end

    return false
end


--根据是否有奖励可以领取
function AchievementData:hasAnyAwardCanGet(achiType)
    local canGetAwardNum = 0

    local achiList = self:getAchievementListData(achiType, false)
    if not achiList then return canGetAwardNum end
   

    for k, v in pairs(achiList) do

        local nowValue = tonumber(v.serverData["now_value"])
        local maxValue = tonumber(v.serverData["max_value"])

        --达成条件并未领奖
        if not v.serverData.getAward and nowValue >= maxValue then
            canGetAwardNum = canGetAwardNum + 1
            break
        end
    end

    return canGetAwardNum

end

--获得成就当前进度和需要达成的目标
function AchievementData:_getAchievementProgress(achieveInfo)

    assert(type(achieveInfo) == "table", "_getAchievementProgress achieveInfo error")

    local nowValue = 0     --当前value
    local maxValue = 0     --需要达到的value

    maxValue = achieveInfo.require_value

    local achiData = self._achiServerData[ACHI_SERVER_PREV..achieveInfo.require_type]
    if achiData then
         nowValue = achiData.value
    end
   
    return  nowValue,  maxValue
end


--根据限制等级遍历AchievementInfo表 缓存起来 提高性能
function AchievementData:_getAchievementConfigData(tabIndex)
    tabIndex = tabIndex or 1
    if type(self._achiCfgData[tabIndex]) == "table" and table.nums(self._achiCfgData[tabIndex]) > 0 then
       
        return self._achiCfgData[tabIndex]
    end

    self._achiCfgData[tabIndex] = {}

    local function procCfgData(tabIndex, record)
        if tabIndex == 1 then -- 目标
            --获取对应模块并满足等级条件的成就记录
            local FunctionLevelInfo = require("app.config.function_level")
            local funcInfo = FunctionLevelInfo.get(record.level)
            if funcInfo and funcInfo.level <= G_UserData:getBase():getLevel() then
                self._achiCfgData[tabIndex][ACHI_CONFIG_PREV..record.id] = record
            end
        end
        
        if tabIndex == 2 then -- 趣味
            self._achiCfgData[tabIndex][ACHI_CONFIG_PREV..record.id] = record
        end

         if tabIndex == AchievementData.FIRST_MEET_TYPE then -- 金将初见
            self._achiCfgData[tabIndex][ACHI_CONFIG_PREV..record.id] = record
        end
    end

    for loopi = 1, AchievementInfo.length() do 
        local record = AchievementInfo.indexOf(loopi)
        if record.tab == tabIndex then
            procCfgData(tabIndex, record)
        end
    end

    return self._achiCfgData[tabIndex]
end


--根据模块ID获取成就奖励列表  
function AchievementData:_getAchievementData(tabIndex)

    --是否是该类型中最后一个
    local function isLastOneInThisType(aType, id )
        local achievement = AchievementInfo.get(id+1)
        --与配表id编号有关 
        if not achievement then
            return true
        else
            if achievement then
                return achievement.require_type ~= aType 
            end
        end

        return false
    end

    --读取配表数据
    local configDatas = self:_getAchievementConfigData(tabIndex)

    local achiList = {}  --需要返回的成就列表

    for k, cfgData in pairs (configDatas) do

        local info = cfgData
        local needShow = false      --是否需要加入到成就列表 
        local curGetAward = false   --当前成就是否领过奖
        --某类型第一个
        if info.pre_id == 0 then
            curGetAward = self:_hasGetAward(info.require_type,info.id)
            --没有领过或者是最后一个
            if not curGetAward or isLastOneInThisType(info.require_type,info.id) then
                needShow = true
            end

        else
            --检查前置id 是否领奖
            local perAchievement = AchievementInfo.get(info.pre_id)
            --前置成就是否领奖
            local preGetAward = self:_hasGetAward(perAchievement.require_type,info.pre_id)
            --当前成就是否领奖 
            curGetAward = self:_hasGetAward(info.require_type,info.id)
            --前置领过奖 并且（当前没领或者已是最后一个成就）
            if preGetAward and (not curGetAward or isLastOneInThisType(info.require_type,info.id)) then
                needShow = true
            end
        end

        if needShow then

            local nowValue, maxValue = self:_getAchievementProgress(info)

            --名字拼接
            local achieveName = info["content"]
            local textDesc = achieveName
            if string.find( achieveName, "d") then
                textDesc = string.format(achieveName, info["require_value"]) 
            end
            --local textDesc = string.format(achieveName, info["require_value"])

            achiList[ACHI_TYPE_PREV..info.require_type] = {
                cfgData = info,
                desc = textDesc,
                serverData = {
                    max_value = maxValue,
                    now_value = nowValue, 
                    getAward = curGetAward ,   --是否已领取
                    type = info.require_type
                }}
        end
    end

    return achiList

end

--检查Id是否领过奖
function AchievementData:_hasGetAward(aType,id)
    local achiData = self._achiServerData[ACHI_SERVER_PREV..aType]

    if achiData and rawget(achiData,"reward_ids") then
        for i = 1 , #(achiData.reward_ids) do
            if achiData.reward_ids[i] == id then
                return true
            end
        end
    end

    return false
end


--成就排序
function AchievementData:_sortAchievements(achiList)

	if type(achiList) ~= "table" then
		return
	end

	table.sort(achiList,function (a,b)

        local canGetAward_a = a.serverData.now_value >= a.serverData.max_value and not a.serverData.getAward
        local canGetAward_b = b.serverData.now_value >= b.serverData.max_value and not b.serverData.getAward

        if a.serverData.getAward ~= b.serverData.getAward then
            return not a.serverData.getAward
        elseif canGetAward_a ~= canGetAward_b then
            return canGetAward_a
        elseif a.cfgData.order ~= b.cfgData.order then
            return a.cfgData.order < b.cfgData.order
        else
            return a.cfgData.id < b.cfgData.id
        end

    end)

end



--商店购买成就条件是否达成
function AchievementData:isShopRequiredReach( requireId )
    -- body
    local bool = false
    local currValue,requireValue = 0,0
    if not requireId or requireId == 0 then return true,currValue,requireValue end 

    --print("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrequire id =".. requireId)

    --local requireData = self:_getRequirementDataById(requireId)

    local requrieInfo = RequirementInfo.get(requireId)
    assert(requrieInfo, "requirement_info can't find requireId =" .. requireId)

    local achiData = self._achiServerData[ACHI_SERVER_PREV..requrieInfo.type]
    --dump(achiData)

    local serverValue = 0
    if achiData then
        --是否离散 0-聚合 1-离散  
        if requrieInfo.is_discrete == 0 then
            serverValue = achiData.values[1]
            -- 计算类型 0-"=填写值满足要求" 1-"≥填写值满足要求" 2-"≤填写值满足要求"  
            if requrieInfo.count_type == 0 then
                bool = serverValue == requrieInfo.value
            elseif requrieInfo.count_type == 1 then
                bool = serverValue >= requrieInfo.value
            else
                bool = serverValue <= requrieInfo.value
            end
        else
            serverValue = achiData.values
            for i=1,#serverValue do
                local subServerValue = serverValue[i]
                if subServerValue == requrieInfo.value then
                    bool = true
                    break
                end
            end
        end
    end

    currValue = serverValue
    requireValue = requrieInfo.value

    return bool,currValue,requireValue

end

return AchievementData