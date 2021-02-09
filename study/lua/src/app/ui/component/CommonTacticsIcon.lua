--
-- Author: Wangyu
-- Date: 
-- 战法Icon

local CommonIconBase = import(".CommonIconBase")
local CommonTacticsIcon = class("CommonTacticsIcon", CommonIconBase)
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local PopupTacticsDetail = require("app.ui.PopupTacticsDetail")

local EXPORTED_METHODS = {
    "updateUI"
}

function CommonTacticsIcon:ctor()
    CommonTacticsIcon.super.ctor(self)
    self._type = TypeConvertHelper.TYPE_TACTICS
end

function CommonTacticsIcon:_init()
    CommonTacticsIcon.super._init(self)
end


function CommonTacticsIcon:bind(target)
    CommonTacticsIcon.super.bind(self, target)

    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTacticsIcon:unbind(target)
    CommonTacticsIcon.super.unbind(self, target)

    cc.unsetmethods(target, EXPORTED_METHODS)
end

--根据传入参数，创建并，更新UI
function CommonTacticsIcon:updateUI(value, size, rank, limitLevel, limitRedLevel)
    local itemParams = CommonTacticsIcon.super.updateUI(self, value, size, rank, limitLevel, limitRedLevel)
    return itemParams
end

function CommonTacticsIcon:_onTouchCallBack(sender, state)
    -----------防止拖动的时候触发点击
    if (state == ccui.TouchEventType.ended) then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._callback then
                self._callback(sender, self._itemParams)
            else
                local baseId = self._itemParams.cfg.id
                local popup = PopupTacticsDetail.new(sender, baseId)
                popup:open()
            end
        end
    end
end

return CommonTacticsIcon
