local CommonButtonSwitchLevel1 = import(".CommonButtonSwitchLevel1")
local CommonButtonSwitchLevel5 = class("CommonButtonSwitchLevel5", CommonButtonSwitchLevel1)


function CommonButtonSwitchLevel5:ctor()
	CommonButtonSwitchLevel5.super.ctor(self)
    self._highLight = true
    self._highLightImg = {normal = "img_btn_ctrl_small02_nml",down = "img_btn_ctrl_small02_nml",disable =  "img_btn_ctrl_secondary03_dis"}
    self._normalImg = {normal = "img_btn_ctrl_small01_nml",down = "img_btn_ctrl_small01_nml",disable =  "img_btn_ctrl_secondary03_dis"}
end

return CommonButtonSwitchLevel5