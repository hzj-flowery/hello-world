--
-- Author: Liangxu
-- Date: 2017-07-12 13:59:22
-- 通用武将国家控件
local CommonHeroCountry = class("CommonHeroCountry")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonHeroCountry:ctor()
	self._target = nil
end

function CommonHeroCountry:_init()
	self._imageCountry = ccui.Helper:seekNodeByName(self._target, "ImageCountry")
end

function CommonHeroCountry:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeroCountry:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHeroCountry:updateUI(heroBaseId)
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
	local countryText = heroParam.country_text
	if countryText then
		self._imageCountry:loadTexture(countryText)
		self._imageCountry:setVisible(true)
	else
		self._imageCountry:setVisible(false)
	end
end

return CommonHeroCountry