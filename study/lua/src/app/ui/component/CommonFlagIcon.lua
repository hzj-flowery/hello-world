-- Author: hyl
-- Date: 2019-11-20 18:02:15
-- 军团旗帜Icon

local CommonIconBase = import(".CommonIconBase")
local CommonFlagIcon = class("CommonFlagIcon", CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local PopupJadeDetail = require("app.scene.view.equipmentJade.PopupJadeDetail")

local EXPORTED_METHODS = {
    "setIconScale"
}

function CommonFlagIcon:ctor()
    CommonFlagIcon.super.ctor(self)

    self._type = TypeConvertHelper.TYPE_FLAG
end

function CommonFlagIcon:_init()
    CommonFlagIcon.super._init(self)
    self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
    self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")
    self:setTouchEnabled(true)
end

function CommonFlagIcon:bind(target)
    CommonFlagIcon.super.bind(self, target)

    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonFlagIcon:unbind(target)
    CommonFlagIcon.super.unbind(self, target)

    cc.unsetmethods(target, EXPORTED_METHODS)
end


--根据传入参数，创建并，更新UI
function CommonFlagIcon:updateUI(value, size)
    local itemParams = CommonFlagIcon.super.updateUI(self, value, size)

    if itemParams.size ~= nil then
        self:setCount(itemParams.size)
    end
    self:showIconEffect()

    self._imageIcon:setScale(0.8)
end

function CommonFlagIcon:_onTouchCallBack(sender, state)
    -----------防止拖动的时候触发点击
    if (state == ccui.TouchEventType.ended) then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._callback then
                self._callback(self._target, self._itemParams)
            else
                self:popupItemInfo()
            end
        end
    end
end

function CommonFlagIcon:setIconScale(scale)
    self._imageIcon:setScale(scale)
end

function CommonFlagIcon:removeLightEffect()
end

function CommonFlagIcon:showIconEffect(scale)
end

function CommonFlagIcon:popupItemInfo()
	local itemParam = self._itemParams
	local itemId = itemParam.cfg.id
	
    local PopupItemInfo = require("app.ui.PopupItemInfo").new()
    PopupItemInfo:updateUI(TypeConvertHelper.TYPE_FLAG, itemId)
    PopupItemInfo:openWithAction()
end

return CommonFlagIcon
