-- Author: panhao
-- Date:2018-11-23 17:11:36
-- Describle：

local CommonGoldenHeroName = class("CommonGoldenHeroName")

local EXPORTED_METHODS = {
	"setName",
    "setColor",
	"setCountryFlag",
	"setNamePositionY",
	"setCountryScaleY",
}

function CommonGoldenHeroName:ctor()
	self._target = nil
end

function CommonGoldenHeroName:_init()
	self._heroCountry = ccui.Helper:seekNodeByName(self._target, "Image_3")
	self._heroCountryImg = ccui.Helper:seekNodeByName(self._target, "Image_1")
    self._heroName = ccui.Helper:seekNodeByName(self._target, "Text_1")
end

function CommonGoldenHeroName:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonGoldenHeroName:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonGoldenHeroName:setName(heroName)
	self._heroName:setString(heroName)
end

function CommonGoldenHeroName:setColor(color)
	self._heroName:setColor(color)
end

function CommonGoldenHeroName:setCountryFlag(path)
    --local smallCamps = {4, 1, 3, 2}
    self._heroCountry:loadTexture(path)--Path.getTextSignet("img_com_camp0"..smallCamps[camp]))
end

function CommonGoldenHeroName:setNamePositionY(posY)
    self._heroName:setPositionY(posY)
end

function CommonGoldenHeroName:setCountryScaleY(value)
    self._heroCountryImg:setScaleY(value)
end


return CommonGoldenHeroName