--
-- Author: Liangxu
-- Date: 2017-07-07 11:21:23
-- 选择装备 通用界面2
local PopupBase = require("app.ui.PopupBase")
local PopupChooseJadeStone = class("PopupChooseJadeStone", PopupBase)
local PopupChooseJadeStoneCell = require("app.ui.PopupChooseJadeStoneCell")

function PopupChooseJadeStone:ctor(isChange, type)
    self._commonNodeBk = nil --弹框背景
    self._isChange = isChange or false
    self._dataList = {}
    self._pos = 1
    self._type = type and type or FunctionConst.FUNC_EQUIP_TRAIN_TYPE3

    local resource = {
        file = Path.getCSB("PopupChooseJadeStone", "common"),
        binding = {}
    }
    self:setName("PopupChooseJadeStone")
    PopupChooseJadeStone.super.ctor(self, resource)
end

function PopupChooseJadeStone:onCreate()
    self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
    self._checkBox:addEventListener(handler(self, self._onCheckBoxClicked))
    self._checkBox:setSelected(true)
    self._hideWear = self._checkBox:isSelected()
    self._listView:setTemplate(PopupChooseJadeStoneCell)
    self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
    self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupChooseJadeStone:onShowFinish()
end

function PopupChooseJadeStone:onEnter()
end

function PopupChooseJadeStone:onExit()
end

function PopupChooseJadeStone:setTitle(title)
    self._commonNodeBk:setTitle(title)
end

function PopupChooseJadeStone:updateUI(pos, jadeUnitData, equipUnitData, callBack)
    logWarn(" PopupChooseJadeStone:updateUI " .. pos)
    self._pos = pos
    self._jadeUnitData = jadeUnitData
    self._equipUnitData = equipUnitData
    self._callBack = callBack
    self:_updateListView()
end

function PopupChooseJadeStone:_updateListView()
    local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
    local hideWear = self._checkBox:isSelected()
    self._dataList =
        EquipJadeHelper.getEquipJadeListByWear(self._pos, self._jadeUnitData, self._equipUnitData, hideWear, self._type)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local heroBaseId = 0
    if self._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
        local _, baseId = UserDataHelper.getHeroBaseIdWithEquipId(self._equipUnitData:getId())
        heroBaseId = baseId
    elseif self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
        local _, baseId = UserDataHelper.getHeroBaseIdWithTreasureId(self._equipUnitData:getId())
        heroBaseId = baseId
    end
    table.sort(
        self._dataList,
        function(data1, data2)
            if data1:isInEquipment() and not data2:isInEquipment() then
                return false
            elseif not data1:isInEquipment() and data2:isInEquipment() then
                return true
            else
                if data1:isSuitableHero(heroBaseId) and not data2:isSuitableHero(heroBaseId) then
                    return true
                elseif not data1:isSuitableHero(heroBaseId) and data2:isSuitableHero(heroBaseId) then
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
        end
    )
    self:_refreshList()
end

function PopupChooseJadeStone:_refreshList()
    assert(self._dataList, "self._dataList can not be null")

    self._listView:clearAll()
    self._count = math.ceil(#self._dataList / 2)
    self._listView:resize(self._count)
end

function PopupChooseJadeStone:_onItemUpdate(item, index)
    local index = index * 2
    local data1, data2 = nil

    local UserDataHelper = require("app.utils.UserDataHelper")
    local _, heroBaseId = UserDataHelper.getHeroBaseIdWithEquipId(self._equipUnitData:getId())
    if self._dataList[index + 1] then
        local jadedata = self._dataList[index + 1]
        data1 = jadedata
        data1.showRP = false
    end

    if self._dataList[index + 2] then
        local jadedata = self._dataList[index + 2]
        data2 = jadedata
        data2.showRP = false
    end
    if self._jadeUnitData then
        local redPoint = false
        if not self._jadeUnitData:isSuitableHero(heroBaseId) then
            redPoint = true
        end
        if
            data1 and not data1:isInEquipment() and not self._equipUnitData:isHaveTwoSameJade(data1:getId()) and
                data1:isSuitableHero(heroBaseId)
         then
            data1.showRP = redPoint or data1:getConfig().color > self._jadeUnitData:getConfig().color
        end
        if
            data2 and not data2:isInEquipment() and not self._equipUnitData:isHaveTwoSameJade(data2:getId()) and
                data2:isSuitableHero(heroBaseId)
         then
            data2.showRP = redPoint or data2:getConfig().color > self._jadeUnitData:getConfig().color
        end
    end
    item:update(data1, data2, self._isChange)
end

function PopupChooseJadeStone:_onItemSelected(item, index)
end

function PopupChooseJadeStone:_onItemTouch(index, t)
    local unitData = self._dataList[index * 2 + t]
    local jadeId = unitData:getId()

    if self._callBack then
        self._callBack(self._pos, jadeId)
    end

    self:close()
end

function PopupChooseJadeStone:_onButtonClose()
    self:close()
end

function PopupChooseJadeStone:_onCheckBoxClicked(sender)
    self:_updateListView()
end

return PopupChooseJadeStone
