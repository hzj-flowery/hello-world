--排行榜
local CampRaceHeroIcon = class("CampRaceHeroIcon")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function CampRaceHeroIcon:ctor(target)
    self._target = target

    self._heroIcon = nil
    self._heroName = nil
    self._panelTouch = nil
    self._moveNode = nil

    self:_init()
end

function CampRaceHeroIcon:_init()
    self._heroName = ccui.Helper:seekNodeByName(self._target, "HeroName")
    self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
    self._heroIcon = ccui.Helper:seekNodeByName(self._target, "HeroIcon")
    cc.bind(self._heroIcon, "CommonHeroIcon")
    self._moveNode = ccui.Helper:seekNodeByName(self._target, "MoveNode")
end

function CampRaceHeroIcon:getBoundingBox()
    local rect = self._panelTouch:getBoundingBox()
    rect.x = rect.x + self._target:getPositionX()
    rect.y = rect.y + self._target:getPositionY()
    return rect
end

function CampRaceHeroIcon:setIconPosition(position)
    position.x = position.x - self._target:getPositionX()
    position.y = position.y - self._target:getPositionY()
    self._moveNode:setPosition(position)
end

function CampRaceHeroIcon:setLocalZOrder(z)
    self._target:setLocalZOrder(z)
end

function CampRaceHeroIcon:refreshIconPos()
    self._moveNode:setPosition(cc.p(0, 0))
end

function CampRaceHeroIcon:updateIcon(baseId, rank, limitLevel, limitRedLevel)
    if baseId > 0 then
        self._heroIcon:updateUI(baseId, nil, limitLevel, limitRedLevel)
        local info = HeroDataHelper.getHeroConfig(baseId)
        local name = info.name
        if rank > 0 then 
            name = name.."+"..rank
        end
        self._heroIcon:showHeroUnknow(false)
        self._heroName:setString(name)
        local params = self._heroIcon:getItemParams()
        self._heroName:setColor(params.icon_color)
    else 
        self._heroIcon:showHeroUnknow(true)
        self._heroName:setString("? ? ?")
    end
end

return CampRaceHeroIcon