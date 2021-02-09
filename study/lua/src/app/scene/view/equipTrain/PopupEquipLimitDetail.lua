--
-- Author: Liangxu
-- Date: 2018-8-13
-- 武将界限详情弹框
local PopupBase = require("app.ui.PopupBase")
local PopupEquipLimitDetail = class("PopupEquipLimitDetail", PopupBase)
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local EquipDetailStrengthenNode = require("app.scene.view.equipmentDetail.EquipDetailStrengthenNode")
local EquipDetailSuitNode = require("app.scene.view.equipmentDetail.EquipDetailSuitNode")
local EquipDetailRefineNode = require("app.scene.view.equipmentDetail.EquipDetailRefineNode")
local EquipDetailBriefNode = require("app.scene.view.equipmentDetail.EquipDetailBriefNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")

function PopupEquipLimitDetail:ctor(equipUnitData)
    self._equipUnitData = equipUnitData

    local resource = {
        file = Path.getCSB("PopupEquipLimitDetail", "equipment"),
        binding = {
            _buttonClose = {
                events = {{event = "touch", method = "_onButtonClose"}}
            }
        }
    }
    PopupEquipLimitDetail.super.ctor(self, resource)
end

function PopupEquipLimitDetail:onCreate()
end

function PopupEquipLimitDetail:onEnter()
    local config = self._equipUnitData:getConfig()
    local configAfter = EquipTrainHelper.getConfigByBaseId(config.potential_after)
    local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, config.id)
    local paramAfter = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, configAfter.id)
    self._textName1:setString(config.name)
    self._textName2:setString(configAfter.name)
    self._textName1:setColor(Colors.getColor(config.color))
    self._textName2:setColor(Colors.getColor(configAfter.color))
    self._textTitle:setString(Lang.get("limit_break_title"))
    UIHelper.updateTextOutline(self._textName1, param)
    UIHelper.updateTextOutline(self._textName2, paramAfter)
    self:_updateList()
end

function PopupEquipLimitDetail:onExit()
end

function PopupEquipLimitDetail:_updateList()
    self._listView:removeAllChildren()
    local module1 = self:_buildAttrModule()
    local module2 = self:_buildSuitModule()
    local module3 = self:_buildRefineModule()
    local module4 = self:_buildDescribeModule()
    self._listView:pushBackCustomItem(module1)
    self._listView:pushBackCustomItem(module2)
    self._listView:pushBackCustomItem(module3)
    self._listView:pushBackCustomItem(module4)
    self._listView:doLayout()
end

function PopupEquipLimitDetail:_copyEquipData(object)
    local lookup_table = {}
    local function _copy(object)
        if type(object) ~= "table" then
            return object
        elseif lookup_table[object] then
            return lookup_table[object]
        end
        local new_table = {}
        lookup_table[object] = new_table
        for index, value in pairs(object) do
            new_table[_copy(index)] = _copy(value)
        end
        return setmetatable(new_table, getmetatable(object))
    end

    return _copy(object)
end

function PopupEquipLimitDetail:_buildAttrModule()
    local equipData = self._equipUnitData
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local equipDetailStrengthenNode = EquipDetailStrengthenNode.new(equipData, nil, true)
    equipDetailStrengthenNode:setAnchorPoint(cc.p(0, 0))
    equipDetailStrengthenNode:setPositionX(7)
    widget:addChild(equipDetailStrengthenNode)
    local equipDataAfter = EquipTrainHelper.copyEquipData(equipData)
    local after_id = equipData:getConfig().potential_after
    equipDataAfter:setBase_id(after_id)
    equipDataAfter:setConfig(EquipTrainHelper.getConfigByBaseId(after_id))
    local equipDetailStrengthenNode2 = EquipDetailStrengthenNode.new(equipDataAfter, nil, true)
    equipDetailStrengthenNode2:setAnchorPoint(cc.p(0, 0))
    widget:addChild(equipDetailStrengthenNode2)
    local size = equipDetailStrengthenNode:getContentSize()
    equipDetailStrengthenNode2:setPositionX(size.width + 123)
    widget:setContentSize(cc.size(940.00, size.height))
    return widget
end

function PopupEquipLimitDetail:_buildSuitModule()
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local config = self._equipUnitData:getConfig()
    local suitId = config.suit_id
    local equipDetailSuitNode = EquipDetailSuitNode.new(self._equipUnitData, false, true)
    equipDetailSuitNode:setIconMask(false)
    widget:addChild(equipDetailSuitNode)
    equipDetailSuitNode:setAnchorPoint(cc.p(0, 0))
    equipDetailSuitNode:setPositionX(7)
    local equipDataAfter = EquipTrainHelper.copyEquipData(self._equipUnitData)
    local after_id = self._equipUnitData:getConfig().potential_after
    equipDataAfter:setBase_id(after_id)
    equipDataAfter:setConfig(EquipTrainHelper.getConfigByBaseId(after_id))
    local equipDetailSuitNode2 = EquipDetailSuitNode.new(equipDataAfter, false, true)
    equipDetailSuitNode2:setIconMask(false)
    equipDetailSuitNode2:setAnchorPoint(cc.p(0, 0))
    widget:addChild(equipDetailSuitNode2)
    local size = equipDetailSuitNode:getContentSize()
    equipDetailSuitNode2:setPositionX(size.width + 123)
    widget:setContentSize(cc.size(858.00, size.height))
    return widget
end

function PopupEquipLimitDetail:_buildRefineModule()
    local equipData = self._equipUnitData
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local equipDetailRefineNode = EquipDetailRefineNode.new(equipData, nil, true)
    equipDetailRefineNode:setAnchorPoint(cc.p(0, 0))
    equipDetailRefineNode:setPositionX(7)
    widget:addChild(equipDetailRefineNode)
    local equipDataAfter = EquipTrainHelper.copyEquipData(equipData)
    local after_id = equipData:getConfig().potential_after
    equipDataAfter:setBase_id(after_id)
    equipDataAfter:setConfig(EquipTrainHelper.getConfigByBaseId(after_id))
    local equipDetailRefineNode2 = EquipDetailRefineNode.new(equipDataAfter, nil, true)
    equipDetailRefineNode2:setAnchorPoint(cc.p(0, 0))
    widget:addChild(equipDetailRefineNode2)
    local size = equipDetailRefineNode:getContentSize()
    equipDetailRefineNode2:setPositionX(size.width + 123)
    widget:setContentSize(cc.size(858.00, size.height))
    return widget
end

function PopupEquipLimitDetail:_buildDescribeModule()
    local equipData = self._equipUnitData
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local equipDetailBriefNode = EquipDetailBriefNode.new(equipData, nil, true)
    equipDetailBriefNode:setAnchorPoint(cc.p(0, 0))
    equipDetailBriefNode:setPositionX(7)
    widget:addChild(equipDetailBriefNode)
    local equipDataAfter = EquipTrainHelper.copyEquipData(equipData)
    local after_id = equipData:getConfig().potential_after
    equipDataAfter:setBase_id(after_id)
    equipDataAfter:setConfig(EquipTrainHelper.getConfigByBaseId(after_id))
    local equipDetailBriefNode2 = EquipDetailBriefNode.new(equipDataAfter, nil, true)
    equipDetailBriefNode2:setAnchorPoint(cc.p(0, 0))
    widget:addChild(equipDetailBriefNode2)
    local size = equipDetailBriefNode:getContentSize()
    local size1 = equipDetailBriefNode2:getContentSize()
    local height = 0
    if size.height > size1.height then
        height = size.height
        equipDetailBriefNode2:setPositionY(math.abs(size.height - size1.height))
    else
        height = size1.height
        equipDetailBriefNode:setPositionY(math.abs(size.height - size1.height))
    end
    equipDetailBriefNode2:setPositionX(size.width + 123)
    widget:setContentSize(cc.size(858.00, height))
    return widget
end

function PopupEquipLimitDetail:_onButtonClose()
    self:close()
end

return PopupEquipLimitDetail
