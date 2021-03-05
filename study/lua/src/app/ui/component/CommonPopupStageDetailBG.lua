local CommonPopupStageDetailBG = class("CommonPopupStageDetailBG")


local EXPORTED_METHODS = {
    "addCloseEventListener",
    "setTitle",
    "setStaminaCost",
    "setTitleColor",
}

function CommonPopupStageDetailBG:ctor()
	self._target = nil
	self._textTitle = nil
	self._btnClose = nil
end

function CommonPopupStageDetailBG:_init()
	self._textTitle = ccui.Helper:seekNodeByName(self._target, "Text_title")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "BtnClose")
    self._textStaminaCost = ccui.Helper:seekNodeByName(self._target, "TextStaminaCost")
--下面是静态文字设置
    self._textStamina = ccui.Helper:seekNodeByName(self._target, "TextStamina")
    self._textStamina:setString(Lang.get("stage_text_staminacost"))
    self._textReward = ccui.Helper:seekNodeByName(self._target, "TextReward")
    self._textReward:setString(Lang.get("stage_text_passreward"))
    self._textDrop = ccui.Helper:seekNodeByName(self._target, "TextDrop")
    self._textDrop:setString(Lang.get("stage_text_drop"))
end

function CommonPopupStageDetailBG:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPopupStageDetailBG:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

--
function CommonPopupStageDetailBG:update(param)
	
end

--
function CommonPopupStageDetailBG:addCloseEventListener(callback)
	self._btnClose:addClickEventListenerEx(callback, true, nil, 0)
end

--
function CommonPopupStageDetailBG:setTitle(s)
	self._textTitle:setString(s)
end

function CommonPopupStageDetailBG:setStaminaCost(cost)
	self._textStaminaCost:setString(cost)
end

function CommonPopupStageDetailBG:setTitleColor(color, outline)
    self._textTitle:setColor(color)
    self._textTitle:enableOutline(outline, 2) 
end


return CommonPopupStageDetailBG