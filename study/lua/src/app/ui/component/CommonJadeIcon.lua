--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
-- 装备Icon

local CommonIconBase = import(".CommonIconBase")
local CommonJadeIcon = class("CommonJadeIcon", CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local PopupJadeDetail = require("app.scene.view.equipmentJade.PopupJadeDetail")

local EXPORTED_METHODS = {
    "setSysId",
    "setIconScale"
}

function CommonJadeIcon:ctor()
    CommonJadeIcon.super.ctor(self)
    self._textItemTopNum = nil -- 顶部数字按钮
    self._equipId = nil
    self._sysId = 0
    self._type = TypeConvertHelper.TYPE_JADE_STONE
    self._effect1 = nil
    self._effect2 = nil
end

function CommonJadeIcon:_init()
    CommonJadeIcon.super._init(self)
    self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
    self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")
    self:setTouchEnabled(true)
end

function CommonJadeIcon:bind(target)
    CommonJadeIcon.super.bind(self, target)

    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonJadeIcon:unbind(target)
    CommonJadeIcon.super.unbind(self, target)

    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonJadeIcon:setSysId(sysId)
    self._sysId = sysId
end

--根据传入参数，创建并，更新UI
function CommonJadeIcon:updateUI(value, size)
    self._sysId = value
    local itemParams = CommonJadeIcon.super.updateUI(self, value, size)

    if itemParams.size ~= nil then
        self:setCount(itemParams.size)
    end
    self:showIconEffect()
end

function CommonJadeIcon:_onTouchCallBack(sender, state)
    -----------防止拖动的时候触发点击
    if (state == ccui.TouchEventType.ended) then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._callback then
                self._callback(self._target, self._itemParams)
            else
                local popupJadeDetail = PopupJadeDetail.new(TypeConvertHelper.TYPE_JADE_STONE, self._itemParams.cfg.id)
                popupJadeDetail:openWithAction()
            end
        end
    end
end

function CommonJadeIcon:setIconScale(scale)
    self._imageIcon:setScale(scale)
end

function CommonJadeIcon:removeLightEffect()
end

function CommonJadeIcon:showIconEffect(scale)
end

return CommonJadeIcon
