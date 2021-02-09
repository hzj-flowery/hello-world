--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
-- 英雄头像Icon

local CommonIconBase = import(".CommonIconBase")
local CommonGrainCarIcon = class("CommonGrainCarIcon",CommonIconBase)
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 


local EXPORTED_METHODS = {
	"updateUI",
}



function CommonGrainCarIcon:ctor()
	CommonGrainCarIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_HERO
end

function CommonGrainCarIcon:_init()
	CommonGrainCarIcon.super._init(self)
	self._imageIcon = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
end

function CommonGrainCarIcon:bind(target)
	CommonGrainCarIcon.super.bind(self, target)
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonGrainCarIcon:unbind(target)
	CommonGrainCarIcon.super.unbind(self, target)
	
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonGrainCarIcon:updateUI(carUnit)
    local config = GrainCarConfigHelper.getGrainCarConfig(carUnit:getLevel())
    self._imageIcon:loadTexture(Path.getCommonIcon("hero", config.icon))
    
    local iconBg = Path.getUICommon("frame/img_frame_0"..carUnit:getConfig().color)
	self:loadColorBg(iconBg)
end


return CommonGrainCarIcon