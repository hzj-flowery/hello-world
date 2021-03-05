-- @Author panhoa
-- @Date 4.3.2020

local BaseData = import(".BaseData")
local BoutData = class("BoutData", BaseData)
local BoutUnit = require("app.data.BoutUnit")
local BoutHelper = require("app.scene.view.bout.BoutHelper")

local schema = {}
schema["boutList"]    = {"table", {}}--阵法位列表（已解锁
schema["boutAcquire"] = {"table", {}}--习得阵法列表


BoutData.schema = schema
function BoutData:ctor(properties)
    BoutData.super.ctor(self, properties)
    self._boutInfo = BoutHelper.initBoutInfo()

    self._msgGetBoutInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetBoutInfo, handler(self, self._s2cGetBoutInfo))  --阵法解锁详情	
    self._msgUnlockBout  = G_NetworkManager:add(MessageIDConst.ID_S2C_UnlockBout, handler(self, self._s2cUnlockBout))    --激活阵法
end

function BoutData:clear( ... )
    -- body
    self._msgGetBoutInfo:remove()
    self._msgGetBoutInfo = nil
    self._msgUnlockBout:remove()
    self._msgUnlockBout = nil
end

function BoutData:reset( ... )
end

-----------------------------------------------------------------------------------------------------------
--@Role     Bout details
function BoutData:c2sGetBoutInfo( ... )
    -- body
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetBoutInfo, {})
end

--@Role     Bout details
function BoutData:_s2cGetBoutInfo(id, message)
    -- body
    if not rawget(message, "bout") then
        G_SignalManager:dispatch(SignalConst.EVENT_BOUT_ENTRY, message)
        return
    end

    self:_checkCreateBoutUnit(rawget(message, "bout"))
    G_SignalManager:dispatch(SignalConst.EVENT_BOUT_ENTRY, message)
end

-----------------------------------------------------------------------
--@Role     Unlock bout
function BoutData:c2sUnlockBout(id, pos, materials_id)
    -- body
    G_NetworkManager:send(MessageIDConst.ID_C2S_UnlockBout, {
        id = id, 
        pos = pos, 
        materials_id = materials_id})
end

--@Role     Unlock bout
function BoutData:_s2cUnlockBout(id, message)
    -- body
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end
    G_SignalManager:dispatch(SignalConst.EVENT_BOUT_UNLOCKSUCCESS)
end

-----------------------------------------------------------------------
--@Role     insert/delete/update
function BoutData:insertData(data)
    -- body
    if type(data) ~= "table" or not unpack(data) then
        return
    end
    self:_checkCreateBoutUnit(data)
end

--@Role     delete/insert/update
function BoutData:deleteData(data)
    -- body
    if type(data) ~= "table" or not unpack(data) then
        return
    end

    local boutList = self:getBoutList()
    for key, value in pairs(data) do
        boutList[bit.brshift(value, 32)][bit.band(value, 0xFFFFFFFF)] = nil
    end
end

--@Role     update/insert/delete
function BoutData:updateData(data)
    -- body
    if type(data) ~= "table" or not unpack(data) then
        return
    end
    self:_checkCreateBoutUnit(data)
end

----------------------------------------------------------------------
--@Role     boutInfo
function BoutData:getBoutInfo( ... )
    -- body
    return self._boutInfo
end

--@Role     Is exist RedP
function BoutData:isMainRed()
    local curBoutId = self:getCurBoutId()
    if not self._boutInfo or not self._boutInfo[curBoutId] then
        return false
    end
    for i,v in ipairs(self._boutInfo[curBoutId]) do
        if self:checkUnlocked(v.id, v.point) then
            if BoutHelper.isSpecialBoutPoint(v.id, v.point) then
                if BoutHelper.isCanUnlockSBoutPoint(v.point) then
                    return true
                end
            else
                local isRed,_ = BoutHelper.isEnoughConsume({id = v.id, pos = v.point})
                if isRed then
                    return true
                end
            end
        end
    end
    return false
end

-----------------------------------------------------------------------
--@Role     Cur's boutId
function BoutData:getCurBoutId( ... )
    -- body
    local boutAcquire = self:getBoutAcquire()
    local curBoutId = table.maxn(boutAcquire)
    curBoutId = curBoutId > 0 and (curBoutId + 1) or 1
    return cc.clampf(curBoutId, 1, table.maxn(self._boutInfo))
end

--@Role     Cur's Points
function BoutData:getCurBoutPoints( ... )
    -- body
    local curBoutId = self:getCurBoutId()
    if self._boutInfo and self._boutInfo[curBoutId] then
        return self._boutInfo[curBoutId]
    end
    return self._boutInfo[curBoutId-1]
end

--@Role     check Unlock
function BoutData:checkUnlocked(id, pos)
    -- body
    local boutList = self:getBoutList()
    if not boutList[id] then
        return true
    end

    if not boutList[id][pos] then
        return true
    end
    return false
end

--@Role     create/update boutList
function BoutData:_checkCreateBoutUnit(data)
    -- body
    local boutList = self:getBoutList()
    local boutAcquire = self:getBoutAcquire()
    for key, value in pairs(data) do
        if type(boutList[value.id]) ~= "table" then
            boutList[value.id] = {}
        end

        local boutUnit = BoutUnit.new(value)
        boutList[value.id][value.pos] = boutUnit
        if not self:getBoutAcquire()[value.id] 
            and boutUnit:isSpecialBoutPoint() then
            boutAcquire[value.id] = boutUnit:isSpecialBoutPoint()
        end
    end
end

-------------------------------------------------------------------
--@Role     Bout's attr add-on
function BoutData:getAttrSingleInfo(boutList)
    -- body
    local attrs = {}
    local boutList = boutList or self:getBoutList()
    for i, sigleBout in pairs(boutList) do
        for j, value in pairs(sigleBout) do
            local data = BoutHelper.getAttrbute(value:getId(), value:getPos())
            for k,v in pairs(data) do
                if not attrs[k] then
                    attrs[k] = 0
                end
                attrs[k] = (attrs[k] + v)
            end
        end
    end
    return attrs
end

--@Role     Bout's power
function BoutData:getPowerSingleInfo(boutList)
    -- body
    local result = {}
    local AttributeConst = require("app.const.AttributeConst")
    local AttrDataHelper = require("app.utils.data.AttrDataHelper")
    local boutList = boutList or self:getBoutList()
    for i, sigleBout in pairs(boutList) do
        for j, value in pairs(sigleBout) do
             AttrDataHelper.formatAttr(result, AttributeConst.BOUT_POWER, value:getConfig().all_combat)
        end
    end
    return result
end



return BoutData