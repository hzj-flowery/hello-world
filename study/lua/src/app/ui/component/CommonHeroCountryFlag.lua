
local CommonHeroCountryFlag = class("CommonHeroCountryFlag")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonHeroCountryFlag:ctor()
	self._target = nil
end

function CommonHeroCountryFlag:_init()
	self._imageColor = ccui.Helper:seekNodeByName(self._target, "ImageColor")
end

function CommonHeroCountryFlag:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeroCountryFlag:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHeroCountryFlag:updateUI(type, value, limitLevel, limitRedLevel)
	local param = TypeConvertHelper.convert(type, value, nil, nil, limitLevel, limitRedLevel)
	local color = param.color
	self._imageColor:loadTexture(Path.getBackground("img_light_0"..color, ".png"))
end

return CommonHeroCountryFlag