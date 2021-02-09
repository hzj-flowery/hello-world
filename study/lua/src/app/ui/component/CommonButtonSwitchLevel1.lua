local CommonButton = import(".CommonButton")
local CommonButtonSwitchLevel1 = class("CommonButtonSwitchLevel1", CommonButton)

CommonButtonSwitchLevel1.EXPORTED_METHODS = {
    "addClickEventListenerEx",
	"addTouchEventListenerEx",
    "setString",
    "showRedPoint",
    "setEnabled",
	"setButtonTag",
    "setWidth",
    "setSwallowTouches",
    "switchToHightLight",
    "switchToNormal",
    "reverseUI",
    "enableHighLightStyle",
	"addClickEventListenerExDelay",
}

function CommonButtonSwitchLevel1:ctor()
	CommonButtonSwitchLevel1.super.ctor(self)
    self._highLight = true
    self._highLightImg = {normal = "img_btn_ctrl_small01_nml",down = nil,disable =  nil}
    self._normalImg = {normal = "img_btn_ctrl_small02_nml",down = nil,disable =  nil}
end

function CommonButtonSwitchLevel1:_init()
	CommonButtonSwitchLevel1.super._init(self)
    self:switchToHightLight()
end

function CommonButtonSwitchLevel1:_switchBtnImg(highLight)
    if highLight then
        self:loadTexture(Path.getUICommon(self._highLightImg.normal),
           self._highLightImg.down and  Path.getUICommon(self._highLightImg.down) ,self._highLightImg.disable and Path.getUICommon(self._highLightImg.disable))

           self._desc:setColor(Colors.BUTTON_ONE_NOTE)
           --self._desc:enableOutline(Colors.BUTTON_ONE_NORMAL_OUTLINE, 2)   
    else
        self:loadTexture(Path.getUICommon(self._normalImg.normal),
            self._normalImg.down and Path.getUICommon(self._normalImg.down),self._normalImg.disable and Path.getUICommon(self._normalImg.disable))

        self._desc:setColor(Colors.BUTTON_ONE_NORMAL)
        --self._desc:enableOutline(Colors.BUTTON_ONE_NOTE_OUTLINE, 2)
    end
end

function CommonButtonSwitchLevel1:setEnabled(e)
    self._button:setEnabled(e)
    if self._highLight then
        self._desc:setColor(e and Colors.BUTTON_ONE_NOTE or Colors.BUTTON_ONE_DISABLE)
        --self._desc:enableOutline(e and Colors.BUTTON_ONE_NORMAL_OUTLINE or Colors.BUTTON_ONE_DISABLE_OUTLINE, 2)
    else
        self._desc:setColor(e and Colors.BUTTON_ONE_NORMAL or Colors.BUTTON_ONE_DISABLE)
        --self._desc:enableOutline(e and Colors.BUTTON_ONE_NOTE_OUTLINE or Colors.BUTTON_ONE_DISABLE_OUTLINE, 2)
    end
end

function CommonButtonSwitchLevel1:enableHighLightStyle(hightLight)
   self._highLight = hightLight
   self:_switchBtnImg(self._highLight)

   local enable = self._button:isEnabled()
   self:setEnabled(enable)
end

function CommonButtonSwitchLevel1:reverseUI()
    self:enableHighLightStyle(not self._highLight)
end

function CommonButtonSwitchLevel1:switchToHightLight()
    self:enableHighLightStyle(true)
end

function CommonButtonSwitchLevel1:switchToNormal()
    self:enableHighLightStyle(false)
end


return CommonButtonSwitchLevel1
