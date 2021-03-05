--
-- Author: hyl
-- Date: 2019-6-20 14:05:17

local CommonSynthesisIcon = class("CommonSynthesisIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"updateUI",
    "updateCount",
    "getEffectNode",
}

function CommonSynthesisIcon:ctor()
	self._target = nil
    self._materialType = TypeConvertHelper.TYPE_ITEM    -- 合成所需材料类型
    self._materialValue = 0  -- 合成所需材料id
    self._richTextCount = nil
end

function CommonSynthesisIcon:_init()
	self._fileNodeIcon = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	cc.bind(self._fileNodeIcon, "CommonItemIcon")
    self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
    self._textCountParent = ccui.Helper:seekNodeByName(self._target, "TextCount")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:setTouchEnabled(true)
    self._panelTouch:addTouchEventListener(handler(self, self._onClickIcon))
    self._effectNode = ccui.Helper:seekNodeByName(self._target, "EffectNode")
end

function CommonSynthesisIcon:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonSynthesisIcon:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonSynthesisIcon:setType(type)
    cc.unbind(self._fileNodeIcon, TypeConvertHelper.CLASS_NAME[self._materialType])
	self._materialType = type or TypeConvertHelper.TYPE_ITEM
	cc.bind(self._fileNodeIcon, TypeConvertHelper.CLASS_NAME[self._materialType])
end

function CommonSynthesisIcon:getType()
	return self._materialValue
end

function CommonSynthesisIcon:updateUI(materialType, materialValue, needNum, ownNum)
    self._materialType = materialType
    self._materialValue = materialValue

    self:setType(self._materialType)
	self._fileNodeIcon:updateUI(self._materialValue)

    local param = TypeConvertHelper.convert(self._materialType, self._materialValue)

    self._textName:setString(param.name)
    self._textName:setColor(param.icon_color)
    self._textName:enableOutline(param.icon_color_outline, 2)

    self:updateCount(needNum, ownNum)
end


function CommonSynthesisIcon:updateCount(needNum, ownNum)
    if self._richTextCount then
        self._richTextCount:removeFromParent()
        self._richTextCount = nil
    end

    local value1Color = cc.c3b(0xff, 0x00, 0x00)

    if needNum <= ownNum then
        value1Color = cc.c3b(0xff, 0xff, 0xff)
    end
    
    local param = {
        value1 = ownNum,
        value2 = needNum,
        color = Colors.colorToNumber(value1Color)
    }


    self._richTextCount = ccui.RichText:createWithContent(Lang.get("synthesis_icon_count", param))
    self._textCountParent:addChild(self._richTextCount)
end

function CommonSynthesisIcon:_onClickIcon(sender, state)
	if state == ccui.TouchEventType.began then
		return true
	elseif state == ccui.TouchEventType.moved then
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
        local itemParam = self._fileNodeIcon:getItemParams()
        -- local PopupItemGuider = require("app.ui.PopupItemGuider").new()
        -- PopupItemGuider:updateUI(itemParam.item_type, itemParam.cfg.id)
        -- PopupItemGuider:openWithAction()

        local PopupItemInfo = require("app.ui.PopupItemInfo").new()
		PopupItemInfo:updateUI(itemParam.item_type, itemParam.cfg.id)
		PopupItemInfo:openWithAction()
	end
end

function CommonSynthesisIcon:getEffectNode()
    return self._effectNode
end

return CommonSynthesisIcon
