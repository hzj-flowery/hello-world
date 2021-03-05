
--[===========[
    FragmentData
    碎片模块数据处理
    用于碎片模块数据的增删改查
]===========]
local BaseData = require("app.data.BaseData")


local FragmentInfo = require("app.config.fragment")
local UserDataHelper = require("app.utils.UserDataHelper")

------------------------------------------------------------------------
-- Fragment基础数据
local schema = {}
schema["id"] 			= {"number", 0}  --碎片ID
schema["num"] 			= {"number", 0}  --碎片数量
schema["type"]			= {"number", 0}  --数据类型
schema["config"]		= {"table", {}}  --碎片表格数据
schema["heroYokeCount"] = {"number", 0}  --武将将激活的羁绊数量（只有武将碎片有）

local FragmentBaseData = class("FragmentBaseData", BaseData)
FragmentBaseData.schema = schema

function FragmentBaseData:ctor(properties)
    FragmentBaseData.super.ctor(self, properties)



end

function FragmentBaseData:initData(data)
    self:setId(data.id)
    self:setNum(data.num)

	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	self:setType(TypeConvertHelper.TYPE_FRAGMENT)

	local info = FragmentInfo.get(data.id)
    assert(info,"FragmentInfo can't find id = "..tostring(data.id))
	self:setConfig(info)
end

function FragmentBaseData:isHeroFragment()
    local fType = self:getConfig().comp_type
    return fType == 1
end

function FragmentBaseData:calAndSetHeroYokeCount()
    local baseId = self:getConfig().comp_value
    local count = UserDataHelper.getWillActivateYokeCount(baseId)
    self:setHeroYokeCount(count)
end

---------------------------------------------------------------------------
-- Fragment数据集
local FragmentData=class("FragmentData",BaseData)

FragmentData.SORT_FUNC_COMMON = 1 --普通排序
FragmentData.SORT_FUNC_SELL = 2  --碎片出售排序
FragmentData.SORT_FUNC_HEROLIST = 3  --武将碎片列表排序
FragmentData.SORT_FUNC_HERO_FRAGMENT_SELL = 4  --武将列表碎片出售排序
FragmentData.SORT_FUNC_PETLIST = 5 --神兽谁骗列表
FragmentData.SORT_FUNC_HISTORYHEROLIST = 6 -- 历代名将碎片列表

function FragmentData:ctor(properties)
	FragmentData.super.ctor(self, properties)
    --碎片数据列表
    self._fragmentList = {}
    self._cacheHeroList = nil --武将碎片缓存

    self._sortFuncMap = nil --排序
	self._msgGetFragmentData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetFragment, handler(self, self._s2cGetFragment))
	self._msgSyntheticFragments = G_NetworkManager:add(MessageIDConst.ID_S2C_SyntheticFragments, handler(self, self._s2cSyntheticFragments))
end

function FragmentData:_s2cGetFragment(id, message)
    self._fragmentList= {}
    local fragmentsList = message.fragments or {}
	for i, value in ipairs(fragmentsList) do
        self:_setFragmentData(value)
	end

	self:_dispatchRedPointEvent()
end

function FragmentData:_s2cSyntheticFragments(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, message)
	self:_dispatchRedPointEvent()
end

function FragmentData:c2sSyntheticFragments(fragmentId, count)
	local merageItem = {
		id = fragmentId, --道具ID
		num = count or 1, --数量
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_SyntheticFragments, merageItem)
end
-- 清除
function FragmentData:clear()
	self._msgGetFragmentData:remove()
	self._msgGetFragmentData = nil
	self._msgSyntheticFragments:remove()
	self._msgSyntheticFragments = nil
end

-- 重置
function FragmentData:reset()
    self._fragmentList = {}
end

function FragmentData:_setFragmentData(fragData)
    local baseData = FragmentBaseData.new()
    baseData:initData(fragData)
    self._fragmentList["k_"..tostring(fragData.id)]= baseData

    self:_checkDirty(baseData:getConfig().comp_type)
end

function FragmentData:_initSortFuncMap()
    --普通排序
    local function sortFunCommon(a, b)
        local qa,qb = a:getConfig().color,b:getConfig().color
        local idA,idB = a:getConfig().id,b:getConfig().id
        local fragmentNumA,fragmentNumB = a:getConfig().fragment_num,b:getConfig().fragment_num
        local numA, numB = a:getNum(), b:getNum()

        --判断是否可合成的
        local isMerageA = numA >= fragmentNumA and 1 or 0
        local isMerageB = numB >= fragmentNumB and 1 or 0
        if isMerageB ~= isMerageA then
             return isMerageA > isMerageB
        end

        if qa ~= qb then
            return qa > qb
        end

        --数量多的排前面
        if numA ~= numB then
            return numA > numB
        end

        return idA < idB
    end
    --售卖排序
    local function sortFunSell(a, b)
        local qa,qb = a:getConfig().color,b:getConfig().color
        local idA,idB = a:getConfig().id,b:getConfig().id
        local numA, numB = a:getNum(), b:getNum()
        if qa ~= qb then
            return qa < qb
        end

        if numA ~= numB then
            return numA > numB
        end
        return idA < idB
    end

    --神兽碎片排序规则
    local function sortFunPetList(a, b)
        local baseIdA = a:getConfig().comp_value
        local baseIdB = b:getConfig().comp_value
        local inBattleA = G_UserData:getTeam():isInBattleWithPetBaseId(baseIdA) and 1 or 0
        local inBattleB = G_UserData:getTeam():isInBattleWithPetBaseId(baseIdB) and 1 or 0
        local inBlessA = G_UserData:getTeam():isInHelpWithPetBaseId(baseIdA) and 1 or 0
        local inBlessB = G_UserData:getTeam():isInHelpWithPetBaseId(baseIdB) and 1 or 0

        local qa,qb = a:getConfig().color,b:getConfig().color
        local idA,idB = a:getConfig().id,b:getConfig().id
        local fragmentNumA,fragmentNumB = a:getConfig().fragment_num,b:getConfig().fragment_num
        local numA, numB = a:getNum(), b:getNum()

        --判断是否可合成的
        local isMerageA = numA >= fragmentNumA and 1 or 0
        local isMerageB = numB >= fragmentNumB and 1 or 0

        if isMerageB ~= isMerageA then
             return isMerageA > isMerageB
        end

        if inBattleA ~= inBattleB then
            return inBattleA > inBattleB
        end

        if inBlessA ~= inBlessB then
            return inBlessA > inBlessB
        end

        if qa ~= qb then
            return qa > qb
        end

        --数量多的排前面
        if numA ~= numB then
            return numA > numB
        end

        return idA < idB
    end

    --武将碎片排序规则
    local function sortFunHeroList(a, b)
        local heroIdA = a:getConfig().comp_value
        local heroIdB = b:getConfig().comp_value
        local inBattleA = G_UserData:getTeam():isInBattleWithBaseId(heroIdA) and 1 or 0
        local inBattleB = G_UserData:getTeam():isInBattleWithBaseId(heroIdB) and 1 or 0
        local isKarmaA = UserDataHelper.isHaveKarmaWithHeroBaseId(heroIdA) and 1 or 0
        local isKarmaB = UserDataHelper.isHaveKarmaWithHeroBaseId(heroIdB) and 1 or 0
        local yokeCountA = a:getHeroYokeCount()
        local yokeCountB = b:getHeroYokeCount()

        local qa,qb = a:getConfig().color,b:getConfig().color
        local idA,idB = a:getConfig().id,b:getConfig().id
        local fragmentNumA,fragmentNumB = a:getConfig().fragment_num,b:getConfig().fragment_num
        local numA, numB = a:getNum(), b:getNum()

        --判断是否可合成的
        local isMerageA = numA >= fragmentNumA and 1 or 0
        local isMerageB = numB >= fragmentNumB and 1 or 0

        if isMerageB ~= isMerageA then
             return isMerageA > isMerageB
        end

        if inBattleA ~= inBattleB then
            return inBattleA > inBattleB
        end

        if isKarmaA ~= isKarmaB then
            return isKarmaA > isKarmaB
        end

        if yokeCountA ~= yokeCountB then
            return yokeCountA > yokeCountB
        end

        if isMerageB ~= isMerageA then
             return isMerageA > isMerageB
        end

        if qa ~= qb then
            return qa > qb
        end

        --数量多的排前面
        if numA ~= numB then
            return numA > numB
        end

        return idA < idB
    end

	local function sortFunHeroFragmentSell(a, b)
        local qa,qb = a:getConfig().color,b:getConfig().color
        local idA,idB = a:getConfig().id,b:getConfig().id
        local numA, numB = a:getNum(), b:getNum()
		local isHaveA = G_UserData:getKarma():isHaveHero(a:getConfig().comp_value)
		local isHaveB = G_UserData:getKarma():isHaveHero(b:getConfig().comp_value)

		if isHaveA ~= isHaveB then
			if isHaveA then
				return true
			else
				return false
			end
		end

        if qa ~= qb then
            return qa < qb
        end

        if numA ~= numB then
            return numA > numB
        end
        return idA < idB
    end
    
    --历代名剑碎片排序规则
    local function sortFunHistoryHeroList(a, b)
        local idA,idB = a:getConfig().id,b:getConfig().id
        local fragmentNumA,fragmentNumB = a:getConfig().fragment_num,b:getConfig().fragment_num
        local numA, numB = a:getNum(), b:getNum()

        --判断是否可合成的
        local isMerageA = numA >= fragmentNumA and 1 or 0
        local isMerageB = numB >= fragmentNumB and 1 or 0

        if isMerageB ~= isMerageA then
            return isMerageA > isMerageB
        end

        -- --数量多的排前面
        -- if numA ~= numB then
        --     return numA > numB
        -- end

        return idA < idB
    end

    self._sortFuncMap = {}
    self._sortFuncMap[FragmentData.SORT_FUNC_COMMON] = sortFunCommon
    self._sortFuncMap[FragmentData.SORT_FUNC_SELL] = sortFunSell
    self._sortFuncMap[FragmentData.SORT_FUNC_HEROLIST] = sortFunHeroList
	self._sortFuncMap[FragmentData.SORT_FUNC_HERO_FRAGMENT_SELL] = sortFunHeroFragmentSell
    self._sortFuncMap[FragmentData.SORT_FUNC_PETLIST] = sortFunPetList
    self._sortFuncMap[FragmentData.SORT_FUNC_HISTORYHEROLIST] = sortFunHistoryHeroList
end
--获取排序函数
function FragmentData:_getSortFuncByType(sortFuncType)
    if not self._sortFuncMap then
        self:_initSortFuncMap()
    end

    local sortFunc = self._sortFuncMap[sortFuncType]
    assert(sortFunc ~= nil, "FragmentData:_getSortFuncByType return nil sortFuncType = "..(sortFuncType or "nil"))
    return sortFunc
end

--[===========[
	按类型获取对应的碎片信息
    参数
    frag_type 1 武将  2 装备  3 宝物 4 神兵  8觉醒 13名将 14武器
    sortFuncType FragmentData.SORT_FUNC_COMMON  FragmentData.SORT_FUNC_SELL FragmentData.SORT_FUNC_HEROLIST
]===========]
function FragmentData:getFragListByType(frag_type, sortFuncType)
	local tempList={}

	if self._fragmentList==nil then
        return tempList
    end

    for k, fragData in pairs(self._fragmentList) do
        if fragData:getConfig().comp_type == frag_type then
            if fragData:isHeroFragment() then
                fragData:calAndSetHeroYokeCount()
            end
            table.insert( tempList, fragData )
        end
    end
    if sortFuncType then
        if frag_type == 1 then
            local dirty = G_UserData:getHero():isFragmentDataDirty()
            if self._cacheHeroList == nil or dirty then
                local sortFunc = self:_getSortFuncByType(sortFuncType)
                table.sort( tempList, sortFunc)
                self._cacheHeroList = tempList
            else
                return self._cacheHeroList
            end
        else
            local sortFunc = self:_getSortFuncByType(sortFuncType)
            table.sort( tempList, sortFunc)
        end
    end
	return tempList
end

--[===========[
	通过id获取碎片信息
	参数
	id 碎片id
]===========]
function FragmentData:getFragDataByID( id )
	if self._fragmentList==nil then
		return nil
	end
	return self._fragmentList["k_"..tostring(id)]
end

--[===========[
	获取对应id的碎片数量
	参数
	id 碎片id
]===========]
function FragmentData:getFragNumByID( id )
	local num=0
	local data=self:getFragDataByID(id)
	if data~=nil then
		num=data:getNum()
	end
	return num
end

----------------------碎片 增 删 改
function FragmentData:insertData(value)
	if value==nil or type(value)~="table" then
		return
	end
	if self._fragmentList==nil then
		return
	end
	for i=1,#value do
		self:_setFragmentData(value[i])
	end
	self:_dispatchRedPointEvent()
end

function FragmentData:updateData(value)
	if value==nil or type(value)~="table" then
		return
	end
	if self._fragmentList==nil then
		return
	end
	for i=1,#value do
		self:_setFragmentData(value[i])
	end
	self:_dispatchRedPointEvent()
end

function FragmentData:deleteData(value)
	if value==nil or type(value)~="table" then
		return
	end
	if self._fragmentList==nil then
		return
	end
	for i=1,#value do
		local id =value[i]
		self._fragmentList["k_"..tostring(id)]=nil

        local info = FragmentInfo.get(id)
        assert(info,"FragmentInfo can't find id = "..tostring(id))
        self:_checkDirty(info.comp_type)
	end

	self:_dispatchRedPointEvent()
end

function FragmentData:_dispatchRedPointEvent()
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_HERO_LIST)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_EQUIP_LIST)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_TREASURE_LIST)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_INSTRUMENT_LIST)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_HERO_TRAIN_TYPE3)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_HORSE_LIST)
end

function FragmentData:hasRedPoint(param)
	if param.fragType then
		local fragType = param.fragType
		return self:_isCanMergeByFragType(fragType)
	end
	return false
end

function FragmentData:_isCanMergeByFragType(fragType)
	--TODO优化不需要排序
	local list = self:getFragListByType(fragType)
	for k,fragData in pairs(list) do
		local canMerge = fragData:getNum() >= fragData:getConfig().fragment_num
		if canMerge then
			return true
		end
	end
	return false
end

function FragmentData:_checkDirty(type)
    if type == 1 then
        G_UserData:getHero():setFragmentDataDirty(true)
    end
end

--获取“需要显示在道具列表中”的碎片数据
function FragmentData:getFragListOfItemList()
    local result = self:getFragListByType(6)

    return result
end

return FragmentData
