local PopupCommonLimitCost = require("app.ui.PopupCommonLimitCost")
local EquipLimitCostPanel = class("EquipLimitCostPanel", PopupCommonLimitCost)
local HeroConst = require("app.const.HeroConst")
local DataConst = require("app.const.DataConst")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LimitCostConst = require("app.const.LimitCostConst")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")

function EquipLimitCostPanel:ctor(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode, limitUpType)
    EquipLimitCostPanel.super.ctor(self, costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode, limitUpType)
end

function EquipLimitCostPanel:_initView()
    local info = EquipTrainHelper.getLimitUpCostInfo()
    if self._costKey == LimitCostConst.LIMIT_COST_KEY_1 then
        local tbPos = {
            [1] = {46, 148},
            [2] = {110, 56},
            [3] = {225, 56},
            [4] = {290, 148}
        }
        for i = 1, 4 do
            local item =
                self:_createMaterialIcon(
                DataConst["ITEM_REFINE_STONE_" .. i],
                info["consume_" .. self._costKey],
                TypeConvertHelper.TYPE_ITEM
            )
            item:setPosition(cc.p(tbPos[i][1], tbPos[i][2]))
        end
    else
        local itemType = TypeConvertHelper.TYPE_ITEM
        if self._costKey == LimitCostConst.LIMIT_COST_KEY_2 then
            itemType = TypeConvertHelper.TYPE_EQUIPMENT
        end
        local item =
            self:_createMaterialIcon(info["value_" .. self._costKey], info["consume_" .. self._costKey], itemType)
        if itemType == TypeConvertHelper.TYPE_EQUIPMENT then
            local Equipment = require("app.config.equipment")
            local config = Equipment.get(info["value_" .. self._costKey])
            item:setNameColor(Colors.getColor(config.color))
            item:showNameBg(true)
        end
    end
    self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
    -- self._panelTouch:setSwallowTouches(false)
    self._panelTouch:addClickEventListener(handler(self, self._onClickPanel)) --避免0.5秒间隔
end

return EquipLimitCostPanel
