local CommonButtonSwitchLevel1 = import(".CommonButtonSwitchLevel1")
local CommonButtonSwitchLevel2 = class("CommonButtonSwitchLevel2", CommonButtonSwitchLevel1)

--这里的disable暂时没资源，后续要改掉
function CommonButtonSwitchLevel2:ctor()
	CommonButtonSwitchLevel2.super.ctor(self)
    self._highLight = true
    self._highLightImg = {normal = "img_btn_ctrl_small01_nml",down = "img_btn_ctrl_small01_nml",disable =  "img_btn_ctrl_first01_nml_hui"}
    self._normalImg = {normal = "img_btn_ctrl_small02_nml",down = "img_btn_ctrl_small02_nml",disable =  "img_btn_ctrl_first01_nml_hui"}
end

return CommonButtonSwitchLevel2