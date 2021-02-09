--玩家头衔系统
local BaseData = require("app.data.BaseData")
local JadeStoneData = class("JadeStoneData", BaseData)
local JadeStoneUnitData = require("app.data.JadeStoneUnitData")
local schema = {}

JadeStoneData.schema = schema
JadeStoneData.TYPE_EQUIP = 0
JadeStoneData.TYPE_TREASURE = 1
-- message S2C_GetJade {
-- 	repeated Jade jades = 1;
-- }
-- message Jade {
-- 	optional uint64 id = 1;
-- 	optional uint32 sys_id = 2;
-- 	optional uint64 equipment_id = 3;
-- }

function JadeStoneData:ctor(properties)
    JadeStoneData.super.ctor(self, properties)

    self._jadeList = {}
    self._recvGetJade = G_NetworkManager:add(MessageIDConst.ID_S2C_GetJade, handler(self, self._s2cGetJadeData))
    self._recvJadeEquip = G_NetworkManager:add(MessageIDConst.ID_S2C_JadeEquip, handler(self, self._s2cJadeEquip))
    self._recvJadeSell = G_NetworkManager:add(MessageIDConst.ID_S2C_JadeSell, handler(self, self._s2cJadeSell))

    --宝物玉石
    self._recvJadeTreasure = G_NetworkManager:add(MessageIDConst.ID_S2C_JadeTreasure, handler(self, self._s2cJadeTreasure))
end

function JadeStoneData:clear()
    self._recvGetJade:remove()
    self._recvGetJade = nil
    self._recvJadeEquip:remove()
    self._recvJadeEquip = nil
    self._recvJadeSell:remove()
    self._recvJadeSell = nil
    self._recvJadeTreasure:remove()
    self._recvJadeTreasure = nil
end

function JadeStoneData:reset()
end

-- 通过镶嵌界面获取玉石列表
function JadeStoneData:getJadeListByEquip(params, type)
    local list = {}
    for k, v in pairs(self._jadeList) do
        local suitable = nil
        if type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
            suitable = v:isSuitableEquipment(params.equipBaseId)
        elseif type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
            suitable = v:isSuitableTreasure(params.equipBaseId)
        end
        if
            v:getConfig().property == params.property and suitable and
                v:getId() ~= params.jadeId and
                v:getEquipment_id() ~= params.equipId
         then
            if params.hideWear then
                if not v:isInEquipment() then
                    table.insert(list, v)
                end
            else
                table.insert(list, v)
            end
        end
    end

    return list
end

-- 通过背包界面获取玉石列表
function JadeStoneData:getJadeListByPackage()
    local list = {}
    for k, v in pairs(self._jadeList) do
        table.insert(list, v)
    end
    table.sort(
        list,
        function(data1, data2)
            if data1:getEquipHeroBaseId() and not data2:getEquipHeroBaseId() then
                return true
            elseif not data1:getEquipHeroBaseId() and data2:getEquipHeroBaseId() then
                return false
            else
                if data1:getConfig().color == data2:getConfig().color then
                    if data1:getConfig().property == data2:getConfig().property then
                        return data1:getSys_id() < data2:getSys_id()
                    else
                        return data1:getConfig().property < data2:getConfig().property
                    end
                else
                    return data1:getConfig().color > data2:getConfig().color
                end
            end
        end
    )
    return list
end

-- 出售玉石列表
function JadeStoneData:getJadeListBySell()
    local list = {}
    for k, v in pairs(self._jadeList) do
        if not v:isInEquipment() then
            table.insert(list, v)
        end
    end
    table.sort(
        list,
        function(data1, data2)
            if data1:getConfig().color == data2:getConfig().color then
                if data1:getConfig().property == data2:getConfig().property then
                    return data1:getSys_id() < data2:getSys_id()
                else
                    return data1:getConfig().property < data2:getConfig().property
                end
            else
                return data1:getConfig().color < data2:getConfig().color
            end
        end
    )
    return list
end

function JadeStoneData:getJadeDataById(id)
    return self._jadeList["k_" .. id]
end

function JadeStoneData:insertData(data)
    if not data then
        return
    end
    self:_updateJadeDatas(data)
end

function JadeStoneData:updateData(data)
    if not data then
        return
    end
    self:_updateJadeDatas(data)
end

function JadeStoneData:deleteData(data)
    if not data then
        return
    end
    for k, id in pairs(data) do
        self._jadeList["k_" .. id] = nil
    end
end

function JadeStoneData:_updateJadeDatas(jadeDatas)
    dump(jadeDatas)
    for k, v in pairs(jadeDatas) do
        local unitData = self._jadeList["k_" .. v.id]
        if not unitData then
            unitData = JadeStoneUnitData.new()
            self._jadeList["k_" .. v.id] = unitData
        end
        unitData:updateData(v)
    end
end

-- //装卸玉石-装备
-- message C2S_JadeEquip {
-- 	required uint64 id = 1; //宝石id 如卸载宝石传0
-- 	required uint64 equipment_id = 2; //装备id
-- 	required uint32 pos = 3; //槽位 从0开始
-- }
function JadeStoneData:c2sJadeEquip(id, equipment_id, pos)
    G_NetworkManager:send(MessageIDConst.ID_C2S_JadeEquip, {id = id, equipment_id = equipment_id, pos = pos})
end

-- //装卸玉石-宝物
-- message C2S_JadeTreasure {
-- 	required uint64 id = 1; //宝石id 如卸载宝石传0
-- 	required uint64 t_id = 2; //宝物id
-- 	required uint32 pos = 3; //槽位 从0开始
-- }
function JadeStoneData:c2sJadeTreasure(id, treasure_id, pos)
    G_NetworkManager:send(MessageIDConst.ID_C2S_JadeTreasure, {id = id, t_id = treasure_id, pos = pos})
end

-- //玉石出售
-- message C2S_JadeSell {
-- 	repeated uint64 id = 1;
-- }
function JadeStoneData:c2sJadeSell(sellDatas)
    local ids = {}
    for k, v in pairs(sellDatas) do
        table.insert(ids, v.id)
    end
    G_NetworkManager:send(MessageIDConst.ID_C2S_JadeSell, {id = ids})
end

-- message S2C_JadeSell {
-- 	required uint32 ret = 1;
-- 	repeated Award materials = 2;
-- }
function JadeStoneData:_s2cJadeSell(id, message)
    if message.ret ~= 1 then
        return
    end
    local award = rawget(message, "materials")
    G_SignalManager:dispatch(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, award)
end

-- 得到玉石数据
function JadeStoneData:_s2cGetJadeData(id, message)
    local jades = rawget(message, "jades")
    if not jades then
        return
    end
    self:_updateJadeDatas(jades)
end

function JadeStoneData:_s2cJadeEquip(id, message)
    if message.ret ~= 1 then
        return
    end

    G_SignalManager:dispatch(SignalConst.EVENT_JADE_EQUIP_SUCCESS, message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE)
end

function JadeStoneData:_s2cJadeTreasure(id, message)
    if message.ret ~= 1 then
        return
    end

    G_SignalManager:dispatch(SignalConst.EVENT_JADE_TREASURE_SUCCESS, message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE)
end

return JadeStoneData
