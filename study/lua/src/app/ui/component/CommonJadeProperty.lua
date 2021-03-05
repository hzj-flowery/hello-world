local CommonJadeProperty = class("CommonJadeProperty")
local JadeAttrNode = require("app.scene.view.equipmentJade.JadeAttrNode")
local JadeSuitEquipmentNode = require("app.scene.view.equipmentJade.JadeSuitEquipmentNode")

local EXPORTED_METHODS = {
    "updateUI"
}

function CommonJadeProperty:ctor()
    self._target = nil
    self._name2 = nil
end

function CommonJadeProperty:_init()
    self._name2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")
end

function CommonJadeProperty:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonJadeProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--玉石属性
function CommonJadeProperty:_buildAttrModule()
    local jadeConfig = self._jadeConfig
    local jadeAttrNode = JadeAttrNode.new(jadeConfig)
    self._listView:pushBackCustomItem(jadeAttrNode)
end

function CommonJadeProperty:_buildSuitEquipments()
    local jadeConfig = self._jadeConfig
    local jadeSuitEquipmentNode = JadeSuitEquipmentNode.new(jadeConfig)
    self._listView:pushBackCustomItem(jadeSuitEquipmentNode)
end

function CommonJadeProperty:_updateListView()
    --详情List开始
    self._listView:removeAllChildren()
    --属性
    self:_buildAttrModule()
    --适用装备
    self:_buildSuitEquipments()
end

function CommonJadeProperty:updateUI(jadeConfig)
    self._jadeConfig = jadeConfig
    self:_updateListView()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_JADE_STONE, jadeConfig.id)
    self._name2:setString(param.name)
    self._name2:setColor(param.icon_color)
    -- self._name2:enableOutline(param.icon_color_outline, 2)
end

return CommonJadeProperty
