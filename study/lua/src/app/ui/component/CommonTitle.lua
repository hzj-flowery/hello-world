local CommonIconBase = import(".CommonIconBase")
local CommonTitle = class("CommonTitle", CommonIconBase)
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")

local EXPORTED_METHODS = {
    "setCallback"
}

local WIDTH_CONST = 160

function CommonTitle:ctor()
    CommonTitle.super.ctor(self)
    self._type = TypeConvertHelper.TYPE_TITLE
end

function CommonTitle:_init()
    CommonTitle.super._init(self)
end

function CommonTitle:bind(target)
    CommonTitle.super.bind(self, target)
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTitle:unbind(target)
    CommonTitle.super.unbind(self, target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTitle:setCallback(callback)
    CommonTitle.super.setCallback(self, callback)
end

function CommonTitle:refreshToEmpty(useUnknow)
    -- if useUnknow then
    -- 	self:loadIcon(Path.getCommonIcon("hero","999"))
    -- 	self:loadColorBg(Path.getUICommon("img_frame_empty01"),255)
    -- else
    -- 	CommonTitle.super.refreshToEmpty(self)
    -- end
end

--根据传入参数，创建并，更新UI
function CommonTitle:updateUI(value, scale)
    local UserDataHelper = require("app.utils.UserDataHelper")
    UserDataHelper.appendNodeTitle(self._imageIcon, value, "CommonTitle")
    local itemParams = TypeConvertHelper.convert(self._type, value, nil, nil, nil)
    self._itemParams = itemParams
    scale = scale or 1
    self._imageIcon:setScale(scale)
    self._imageBg:setScale(scale)
end

function CommonTitle:_onTouchCallBack(sender, state)
    -----------防止拖动的时候触发点击
    if (state == ccui.TouchEventType.ended) then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._callback then
                self._callback(self._target, self._itemParams)
            end
            if self._itemParams then
                local PopupItemInfo = require("app.ui.PopupItemInfo").new()
                PopupItemInfo:updateUI(self._type, self._itemParams.cfg.id)
                PopupItemInfo:openWithAction()
            end
        end
    end
end

function CommonTitle:getPanelSize()
    local size = self._imageIcon:getContentSize()
    size.width = WIDTH_CONST
    return size
end

function CommonTitle:setIconMask()
end

return CommonTitle
