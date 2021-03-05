
-- Author: conley
-- 通用武将立绘
local CommonHeroImage = class("CommonHeroImage")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonHeroImage:ctor()
	self._target = nil
end

function CommonHeroImage:_init()
	self._image = ccui.Helper:seekNodeByName(self._target, "Image")
	self._image:ignoreContentAdaptWithSize(true)
	self._image:setScale(0.8)
end

function CommonHeroImage:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeroImage:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHeroImage:updateUI(heroBaseId)
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
	local resCfg = heroParam.res_cfg
	if resCfg then
        local imgPath = Path.getChatRoleRes(resCfg.story_res)
		self._image:loadTexture(imgPath)
		self._image:setVisible(true)
	else
		self._image:setVisible(false)
	end
end

return CommonHeroImage