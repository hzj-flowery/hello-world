local CommonLimitCostNode = require("app.ui.component.CommonLimitCostNode")
local EquipLimitCostNode = class("EquipLimitCostNode", CommonLimitCostNode)
local LimitCostConst = require("app.const.LimitCostConst")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")

function EquipLimitCostNode:ctor(target, costKey, callback, limitUpType)
    EquipLimitCostNode.super.ctor(self, target, costKey, callback, limitUpType)
end

function EquipLimitCostNode:changeImageName()
    local resIds = EquipTrainHelper.getLimitUpCostNameResIds()
    self._imageName:loadTexture(Path.getTextLimit(resIds[self._costKey]))
end

function EquipLimitCostNode:_check()
    self._isShowCount = true
end

function EquipLimitCostNode:playSMoving()
    local smoving = LimitCostConst.RES_NAME[self._costKey].smoving[1]
    if self._costKey == LimitCostConst.LIMIT_COST_KEY_2 then
        smoving = "smoving_tujiehuansanjiao"
    end
    G_EffectGfxMgr:applySingleGfx(
        self._target,
        smoving,
        function()
            self._target:setVisible(false)
        end
    )
end

function EquipLimitCostNode:_calPercent(limitLevel, curCount)
    local info = EquipTrainHelper.getLimitUpCostInfo()
    local size = info["size_" .. self._costKey] or 0
    local percent = math.floor(curCount / size * 100)
    return math.min(percent, 100), size
end

function EquipLimitCostNode:setImageFront(id)
    self._imageFront:loadTexture(Path.getLimitImg(id))
end

function EquipLimitCostNode:setPositionY(y)
    self._initPos.y = y
end

return EquipLimitCostNode
