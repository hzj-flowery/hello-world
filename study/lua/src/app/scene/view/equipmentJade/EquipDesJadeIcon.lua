--
-- Author:liushiyin
-- Date: 2017-02-20 17:35:20
--
local EquipDesJadeIcon = class("EquipDesJadeIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")

function EquipDesJadeIcon:ctor(target, slot)
    self._target = target
    self._jadeIcon = ccui.Helper:seekNodeByName(self._target, "FileNode_1")
    cc.bind(self._jadeIcon, "CommonJadeIcon")
    self._jadeIcon:setTouchEnabled(false)
    self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
end

function EquipDesJadeIcon:updateIcon(jadeId)
    if jadeId > 0 then
        self._jadeIcon:updateUI(jadeId)
        local params = self._jadeIcon:getItemParams()
        self._textName:setString(params.name)
        self._textName:setColor(params.icon_color)
        local UIHelper = require("yoka.utils.UIHelper")
        UIHelper.updateTextOutline(self._textName, params.icon_color_outline)
    else
        self._textName:setString(Lang.get("not_inject_in_time"))
        self._textName:setColor(Colors.getColor(5))
    end
end

function EquipDesJadeIcon.instance()
    local file = Path.getCSB("EquipDesJadeIcon", "equipment")
    local nodes = cc.CSLoader:createNodeAndBind(file)
    local rootNode = nodes._resourceNode
    local object = EquipDesJadeIcon.new(rootNode)
    return object, rootNode
end

return EquipDesJadeIcon
