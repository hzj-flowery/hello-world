-- Author: panhao
-- Date:2018-11-23 17:11:36
-- Describle：

local CommonRewardLogItem = class("CommonRewardLogItem")
local GachaGoldenHeroHelper = require("app.scene.view.gachaGoldHero.GachaGoldenHeroHelper")

local EXPORTED_METHODS = {
    "setUserName",
    "setUserNameColor",
    "setServerName",
    "setServerNameColor",
}

function CommonRewardLogItem:ctor()
	self._target = nil
end

function CommonRewardLogItem:_init()
    self._serverName = ccui.Helper:seekNodeByName(self._target, "Text_105")
    self._username = ccui.Helper:seekNodeByName(self._target, "Text_106")
end

function CommonRewardLogItem:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonRewardLogItem:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonRewardLogItem:setUserName(heroName, officialLevel)
    --local targetPosX = (self._serverName:getPositionX() + self._serverName:getContentSize().width + 10)
    --self._username:setPositionX(targetPosX)
    self._username:setString(heroName)
    
    officialLevel = officialLevel or 0
    self._username:setColor(Colors.getOfficialColor(officialLevel))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._username, officialLevel)
end

function CommonRewardLogItem:setUserNameColor(color)
	self._username:setColor(color)
end

function CommonRewardLogItem:setServerName(heroName)
    --[[if string.match(heroName, "(%a+%d+)") ~= nil then
        local nameStr = (string.match(heroName, "(%a+%d+)") .." ")
        local name = GachaGoldenHeroHelper.getFormatServerName(heroName, 5)
        self._serverName:setString(name)
    else
        self._serverName:setString(heroName)
    end]]

    local name = GachaGoldenHeroHelper.getFormatServerName(heroName, 6)
    self._serverName:setString(name)
end

function CommonRewardLogItem:setServerNameColor(color)
	self._serverName:setColor(color)
end


return CommonRewardLogItem