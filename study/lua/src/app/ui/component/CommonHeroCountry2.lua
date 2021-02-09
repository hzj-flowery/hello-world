--
-- Author: Panhoa
-- Date: 05.07.2019
-- 
local CommonHeroCountry2 = class("CommonHeroCountry2")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local heroResConfig = require("app.config.hero_res")

local EXPORTED_METHODS = {
    "updateCountry",
    "showSelected",
    "addClickEventListenerEx",
    "updateHero",
    "show",
}

function CommonHeroCountry2:ctor()
    self._target = nil
    self._panelTouch = nil
    self._heroId = 0
end

function CommonHeroCountry2:_init()
    self._imageCountryNormal  = ccui.Helper:seekNodeByName(self._target, "Image_115")
    self._imageCountrySelected = ccui.Helper:seekNodeByName(self._target, "Image_116")
    self._panelTouch = ccui.Helper:seekNodeByName(self._target, "Panel_Touch")
end

function CommonHeroCountry2:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHeroCountry2:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHeroCountry2:showSelected(heroId)
    self._imageCountryNormal:setVisible(self._heroId ~= heroId)
    self._imageCountrySelected:setVisible(self._heroId == heroId)
end

function CommonHeroCountry2:show(isShow)
    if self._target then
        self._target:setVisible(isShow)
    end
end

function CommonHeroCountry2:updateHero(index, heroId)
    local heroResConfigInfo = heroResConfig.get(heroId)
    local country2ImageResNormal = heroResConfigInfo.gold_hero_small .. "_nml"
    local country2ImageResSelected = heroResConfigInfo.gold_hero_small .. "_down"

    self._heroId = heroId

    self._panelTouch:setTag(heroId)
    self._imageCountryNormal:loadTexture(Path.getGoldHero(country2ImageResNormal))
    self._imageCountrySelected:loadTexture(Path.getGoldHero(country2ImageResSelected))
end

function CommonHeroCountry2:updateCountry(country)
    local country2ImageResNormal = {
        [1] = "img_hero_01_nml",
        [2] = "img_hero_02_nml",
        [3] = "img_hero_03_nml",
        [4] = "img_hero_04_nml",
    }
    local country2ImageResSelected = {
        [1] = "img_hero_01_down",
        [2] = "img_hero_02_down",
        [3] = "img_hero_03_down",
        [4] = "img_hero_04_down",
    }

    self._panelTouch:setTag(country)
    self._imageCountryNormal:loadTexture(Path.getGoldHero(country2ImageResNormal[country]))
    self._imageCountrySelected:loadTexture(Path.getGoldHero(country2ImageResSelected[country]))
end

function CommonHeroCountry2:addClickEventListenerEx(callback)
    self._panelTouch:addClickEventListenerEx(callback, true, nil, 0)
end


return CommonHeroCountry2