local ViewBase = require("app.ui.ViewBase")
local MineMoveAvatar = class("MineMoveAvatar", ViewBase)

-- CampRacePreMatch.testTime = 60

function MineMoveAvatar:ctor()
	local resource = {
		file = Path.getCSB("MineMoveAvatar", "mineCraft"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {

		}
	}
    MineMoveAvatar.super.ctor(self, resource)
end

function MineMoveAvatar:onCreate()
end

function MineMoveAvatar:onEnter()
end

function MineMoveAvatar:onExit()
end

function MineMoveAvatar:updateUI(heroId, name, officel, limit,titleId)
    self._heroAvatar:updateUI(heroId, nil, nil, limit)
    self._textName:setString(name)
    self._textName:setColor(Colors.getOfficialColor(officel))
    self._textName:enableOutline(Colors.getOfficialColorOutline(officel), 2)
    local officalInfo, officalLevel = G_UserData:getBase():getOfficialInfo(officel)
    if officalLevel <= 0 then --无不显示
        self._textOfficial:setVisible(false)
		return
    end
	self._textOfficial:setColor(Colors.getOfficialColor(officalLevel))
	self._textOfficial:enableOutline(Colors.getOfficialColorOutline(officalLevel), 2)
	self._textOfficial:setVisible(true)
    self._textOfficial:setString("["..officalInfo.name.."]")
    self._heroAvatar:showTitle(titleId,self.__cname)
end

function MineMoveAvatar:setAction(action, loop)
    self._heroAvatar:setAction(action, loop)
end

function MineMoveAvatar:turnBack(needTurn)
    self._heroAvatar:turnBack(needTurn)
end

return MineMoveAvatar