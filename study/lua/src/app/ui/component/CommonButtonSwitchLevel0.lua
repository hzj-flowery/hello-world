local CommonButtonSwitchLevel1 = import(".CommonButtonSwitchLevel1")
local CommonButtonSwitchLevel0 = class("CommonButtonSwitchLevel0", CommonButtonSwitchLevel1)


function CommonButtonSwitchLevel0:ctor()
	CommonButtonSwitchLevel0.super.ctor(self)
    self._highLight = true
    self._highLightImg = {normal = "img_btn_ctrl_large01_nml",down = nil,disable =  nil}
    self._normalImg = {normal = "img_btn_ctrl_large02_nml",down = nil,disable =  nil}
end

return CommonButtonSwitchLevel0
