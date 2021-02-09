--
-- Author: hedili
-- Date: 2018-02-06 17:16:01
-- 神兽名字
local CommonPetVName = class("CommonPetVName")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local EXPORTED_METHODS = {
	"updateUI",
	"setFontSize",
	"getWidth"
}

function CommonPetVName:ctor()
	self._target = nil
	self._textName = nil
	self._imageColor = nil
end

function CommonPetVName:_init()
	self._imageColor = ccui.Helper:seekNodeByName(self._target, "Image_color")
	self._textName = ccui.Helper:seekNodeByName(self._target,"Text_Name")
end

function CommonPetVName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPetVName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPetVName:updateUI(petBaseId)
	local params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET,petBaseId)

    local color = params.cfg.color
	self._imageColor:loadTexture(Path.getPet("img_shenshou_color"..color))
	self._textName:setString( params.name )
	self._textName:setColor(Colors.getPetColor(color) )
end

function CommonPetVName:disableOutline()
	self._textName:disableEffect(cc.LabelEffect.OUTLINE)
end

function CommonPetVName:setFontSize(size)
	self._textName:setFontSize(size)
end



return CommonPetVName
