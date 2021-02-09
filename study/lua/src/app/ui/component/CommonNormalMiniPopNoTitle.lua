local CommonNormalMiniPopNoTitle = class("CommonNormalMiniPopNoTitle")


local EXPORTED_METHODS = {
    "addBtnEventListener",
    "setBtnString",
    "showCancelBtn"
}

function CommonNormalMiniPopNoTitle:ctor()
	self._target = nil
	self._btnOk = nil
	self._btnCancel = nil

    self._oldOkPosX = 0
    self._btnMidPosX = 0
end

function CommonNormalMiniPopNoTitle:_init()
	self._btnOk = ccui.Helper:seekNodeByName(self._target, "BtnOk")
    self._btnCancel = ccui.Helper:seekNodeByName(self._target, "BtnCancel")

    if self._btnOk then
        self._oldOkPosX =  self._btnOk:getPositionX()
    end

    if  self._btnOk and  self._btnCancel  then
        local x = self._btnOk:getPositionX() + self._btnCancel:getPositionX() 
        self._btnMidPosX = x * 0.5
    end


    
    cc.bind(self._btnOk, "CommonButtonHighLight")
    cc.bind(self._btnCancel, "CommonButtonNormal")
end

function CommonNormalMiniPopNoTitle:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonNormalMiniPopNoTitle:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonNormalMiniPopNoTitle:addBtnEventListener(okCallback,cancelCallback)
    if okCallback and self._btnOk then
        self._btnOk:addClickEventListenerEx(okCallback, true, nil, 0)
    end
    if cancelCallback and self._btnCancel then
        self._btnCancel:addClickEventListenerEx(cancelCallback, true, nil, 0)
    end
end

function CommonNormalMiniPopNoTitle:setBtnString(okStr,cancelStr)
    if okStr and self._btnOk then
        self._btnOk:setString(okStr)
    end
    if cancelStr and self._btnCancel then
        self._btnCancel:setString(cancelStr)
    end
end

function CommonNormalMiniPopNoTitle:showCancelBtn(show)
    if not self._btnOk or not self._btnCancel  then
        return 
    end
    if not show then
        self._btnCancel:setVisible(false)
        self._btnOk:setPositionX(self._btnMidPosX )
    else
        self._btnCancel:setVisible(true)
        self._btnOk:setPositionX(self._oldOkPosX )
    end
  
end

return CommonNormalMiniPopNoTitle