-- Author: JerryHe
-- Date: 2019-01-22
-- Desc: 战马装备数据
--

local BaseData = require("app.data.BaseData")
local HorseEquipmentData = class("HorseEquipmentData", BaseData)
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")
local HorseEquipmentUnitData = require("app.data.HorseEquipmentUnitData")

local schema = {}
schema["curEquipmentId"] = {"number", 0}    --当前选中的Id
schema["curEquipmentPos"] = {"number",0}    --当前选中的位置
HorseEquipmentData.schema = schema

function HorseEquipmentData:ctor(properties)
	HorseEquipmentData.super.ctor(self, properties)

    self._horseEquipmentList = {}
    
    self._recvGetHorseEquip = G_NetworkManager:add(MessageIDConst.ID_S2C_GetHorseEquip, handler(self, self._s2cGetHorseEquip))
    self._recvEquipWarHorseEquipment = G_NetworkManager:add(MessageIDConst.ID_S2C_EquipWarHorseEquipment, handler(self, self._s2cEquipWarHorseEquipment))
    self._recvWarHorseEquipmentRecovery = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseEquipmentRecovery, handler(self, self._s2cWarHorseEquipmentRecovery))
end

function HorseEquipmentData:clear()
    self._recvGetHorseEquip:remove()
    self._recvGetHorseEquip = nil

    self._recvEquipWarHorseEquipment:remove()
    self._recvEquipWarHorseEquipment = nil

    self._recvWarHorseEquipmentRecovery:remove()
    self._recvWarHorseEquipmentRecovery = nil
end

function HorseEquipmentData:reset()
	self._horseEquipmentList = {}
end

-- 更新战马装备信息
function HorseEquipmentData:updateData(data)
    if data == nil or type(data) ~= "table" then
		return 
	end
	if not self._horseEquipmentList then 
        return 
    end
    for i = 1, #data do
    	self:_setHorseEquipData(data[i])
    end
end

-- 插入战马装备信息，新增
function HorseEquipmentData:insertData(data)
    if data == nil or type(data) ~= "table" then 
		return 
    end
    
    if not self._horseEquipmentList then
        return
    end
    
    for i = 1, #data do
    	self:_setHorseEquipData(data[i])
    end
end

-- 删除战马装备信息
function HorseEquipmentData:deleteData(data)
    if data == nil or type(data) ~= "table" then 
		return 
	end
	if self._horseEquipmentList == nil then 
        return 
    end
    
    for i = 1, #data do
    	self._horseEquipmentList["k_"..data[i]] = nil
    end
end

-- 设置战马装备数据信息
function HorseEquipmentData:_setHorseEquipData(data)
    self._horseEquipmentList["k_"..data.id] = nil
	local unitData = HorseEquipmentUnitData.new()
	unitData:updateData(data)
	self._horseEquipmentList["k_"..data.id] = unitData
end

-- 获取战马装备个数
function HorseEquipmentData:getHorseEquipTotalCount()
	local count = 0
	for k, v in pairs(self._horseEquipmentList) do
		count = count + 1
	end
	return count
end

-- 获得所有战马装备列表
function HorseEquipmentData:getHorseEquipmentList()
    return self._horseEquipmentList
end

--获取排序后的战马装备列表数据
function HorseEquipmentData:getListDataBySort(horseId)
    local result = HorseEquipDataHelper.getAllHorseEquipList(self._horseEquipmentList)
    return result
end

--根据装备位置获取更换战马装备列表，未装备的放前，装备的放后
function HorseEquipmentData:getReplaceEquipmentListWithSlot(slot,horseId)
    local result,noWear,wear = HorseEquipDataHelper.getReplaceHorseEquipListWithSlot(self._horseEquipmentList,slot,horseId)
    return result,noWear,wear
end

-- 获取所有能回收的战马装备
-- 返回结果：所有未被装备到战马上的装备，按照颜色排序（小的放前），相同的按照id排序，保证低级别的先出现在回收列表
function HorseEquipmentData:getAllRecoveryHorseEquipments(lowLevel)
    local result = HorseEquipDataHelper.getAllRecoveryHorseEquipList(self._horseEquipmentList,lowLevel)
    return result
end

-- 获取某一战马装备的战马装备列表
function HorseEquipmentData:getEquipedEquipListWithHorseId(horseId)
    local equipList = HorseEquipDataHelper.getEquipedEquipListWithHorseId(horseId,self._horseEquipmentList)
    return equipList
end

-- 获得某已战马的某一孔位对应的装备信息
function HorseEquipmentData:getEquipedEquipinfoWithHorseIdAndSlot(horseId,slot)
    local equipInfo = HorseEquipDataHelper.getEquipedEquipinfoWithHorseIdAndSlot(horseId,slot,self._horseEquipmentList)
    return equipInfo
end

-- 获取某一战马装备回收的奖励列表
function HorseEquipmentData:getEquipRecoveryRewardList(equipList)
    local rewardList = HorseEquipDataHelper.getEquipRecoveryRewardList(equipList)
    return rewardList
end

-- 获取某一战马装备的信息
function HorseEquipmentData:getHorseEquipWithEquipId(equipId)
    return self._horseEquipmentList["k_"..equipId]
end

function HorseEquipmentData:createTempHorseEquipUnitData(baseId)
    local baseData = {}
	baseData.id = 0
	baseData.base_id = baseId or 1
	baseData.horse_id = 0 

	local unitData = HorseEquipmentUnitData.new()
	unitData:updateData(baseData)

	return unitData
end

--判断是否有更好的战马装备（红点机制）
function HorseEquipmentData:isHaveBetterHorseEquip(equipBaseId)
    local result = HorseEquipDataHelper.isHaveBetterHorseEquip(equipBaseId,self._horseEquipmentList)
    return result
end

-- 判断某个孔位是否有空闲装备（红点）
function HorseEquipmentData:isHaveFreeHorseEquip(slot)
    local result = HorseEquipDataHelper.isHaveFreeHorseEquip(slot,self._horseEquipmentList)
    return result
end

-- 判断战马上，是否有空闲或者更好的装备
function HorseEquipmentData:isHaveHorseEquipRP(horseId)
    local result = false
    for i = 1, 3 do      -- 3个孔位
        local equipInfo = self:getEquipedEquipinfoWithHorseIdAndSlot(horseId,i)
        if not equipInfo then
            if self:isHaveFreeHorseEquip(i) then
                result = true
                break
            end
        else
            local baseId = equipInfo:getBase_id()
            if self:isHaveBetterHorseEquip(baseId) then
                result = true
                break
            end
        end
    end

    return result
end

-- 马具红点
function HorseEquipmentData:isHorseEquipRP(param)
    local equipPos = param.equipPos
    local horseId = param.horseId
    if equipPos then
        -- 有装备位置，查看装备位置是否有更好的或者可穿上的
        local equipInfo = self:getEquipedEquipinfoWithHorseIdAndSlot(horseId,equipPos)
        if equipInfo then
            -- 当前孔位有装备，查看是否更好的
            local isBetter = self:isHaveBetterHorseEquip(equipInfo:getBase_id())
            return isBetter
        else
            -- 当前孔位没有装备，查看是否有空闲的
            local isFree = self:isHaveFreeHorseEquip(equipPos)
            return isFree
        end
    else
        -- 没有孔位，判断当前马所有装备是否有更好的，或者所有孔位能穿装备
        local checkResult = self:isHaveHorseEquipRP(horseId)
        return checkResult
    end
end

---------------------- 协议部分 ---------------------
-- 初始化，下发战马装备信息
function HorseEquipmentData:_s2cGetHorseEquip(id,message)
    local datas = rawget(message,"datas")
    if not datas then
        return
    end

    for i = 1, #datas do
        self:_setHorseEquipData(datas[i])
    end

    logWarn("下发的战马装备信息，解析后")
    dump(datas)
end

--战马配备装备
function HorseEquipmentData:c2sEquipWarHorseEquipment(horseId,horseEquipPos,equipId)
    -- 储存战马装备id和装备的位置
    self._horseEquipPos = horseEquipPos
    self._horseEquipId = equipId

	G_NetworkManager:send(MessageIDConst.ID_C2S_EquipWarHorseEquipment, {
		horse_id = horseId,              --马匹ID
        horse_equip_id = equipId,              --当前马匹装备id
        pos = horseEquipPos,  --当前马匹装备位置1-3
	})
end

function HorseEquipmentData:_s2cEquipWarHorseEquipment(id, message)
    logWarn("HorseEquipmentData:_s2cEquipWarHorseEquipment")
    dump(message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

    -- 刷新，通知战马详情页面，根据当前战马id，获取当前的战马装备列表，刷新显示
    logWarn("HorseEquipmentData:_s2cEquipWarHorseEquipment，equipPos "..tostring(self._horseEquipPos))
    G_SignalManager:dispatch(SignalConst.EVENT_HORSE_EQUIP_ADD_SUCCESS,self._horseEquipPos)
end

--战马装备回收
function HorseEquipmentData:c2sWarHorseEquipmentRecovery(equipIds)
    logWarn("战马装备回收列表")
    dump(equipIds)
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseEquipmentRecovery, {
		horse_equip_id = equipIds
	})
end

function HorseEquipmentData:_s2cWarHorseEquipmentRecovery(id, message)
    logWarn("HorseEquipmentData:_s2cWarHorseEquipmentRecovery， message")
    dump(message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

	local awards = rawget(message, "awards") or {}
    G_SignalManager:dispatch(SignalConst.EVENT_HORSE_EQUIP_RECOVERY_SUCCESS, awards)
end

return HorseEquipmentData