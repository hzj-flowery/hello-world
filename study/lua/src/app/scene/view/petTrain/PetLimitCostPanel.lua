local PopupCommonLimitCost = require("app.ui.PopupCommonLimitCost")
local PetLimitCostPanel = class("PetLimitCostPanel", PopupCommonLimitCost)
local LimitCostConst = require("app.const.LimitCostConst")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PetLimitCostPanel:ctor(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode)
    PetLimitCostPanel.super.ctor(self, costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode)
end

function PetLimitCostPanel:_initView()
    local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
    local info = PetTrainHelper.getCurLimitCostInfo()
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
				DataConst["ITEM_PET_LEVELUP_MATERIAL_" .. i],
				info["consume_" .. self._costKey],
				TypeConvertHelper.TYPE_ITEM
			)
			item:setPosition(cc.p(tbPos[i][1], tbPos[i][2]))
		end
	else
		self:_createMaterialIcon(
			info["value_" .. self._costKey],
			info["consume_" .. self._costKey],
			TypeConvertHelper.TYPE_ITEM
		)
    end
    self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
    self._panelTouch:addClickEventListener(handler(self, self._onClickPanel)) --避免0.5秒间隔
end

function PetLimitCostPanel:fitterItemCount(item)
    local type = item:getType()
    local value = item:getItemId()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
    if type == TypeConvertHelper.TYPE_PET then
        item:updateCount(PetTrainHelper.getCanConsumePetNums(value))
    else
        item:updateCount()
    end
end

return PetLimitCostPanel
