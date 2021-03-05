
local CommonFightRecordNode = class("CommonFightRecordNode")
local TextHelper = require("app.utils.TextHelper")


local EXPORTED_METHODS = {
    "updateView",
    "updateToEmptyRecordView",
}

function CommonFightRecordNode:ctor()
	self._target = nil
end

function CommonFightRecordNode:_init()
	self._imageWin = ccui.Helper:seekNodeByName(self._target, "ImageWin")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
    self._textNoChallenge = ccui.Helper:seekNodeByName(self._target, "TextNoChallenge")
end

function CommonFightRecordNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonFightRecordNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonFightRecordNode:updateView(isWin,name,nameColor, colorOutline)
    self._imageWin:setVisible(true)
    self._textName:setVisible(true)
    self._textNoChallenge:setVisible(false)

    self._imageWin:loadTexture(isWin and Path.getTextSignet("txt_battle01_win") or 
        Path.getTextSignet("txt_battle01_lose"))
    self._textName:setString(name)
    self._textName:setColor(nameColor)
    if colorOutline then
        self._textName:enableOutline(colorOutline, 2)
    else
        self._textName:disableEffect(cc.LabelEffect.OUTLINE)
    end
end

function CommonFightRecordNode:updateToEmptyRecordView()
    self._imageWin:setVisible(false)
    self._textName:setVisible(false)
    self._textNoChallenge:setVisible(true)
end

return CommonFightRecordNode