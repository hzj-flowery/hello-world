local CampRaceVSNode = class("CampRaceVSNode")
local CampRaceConst = require("app.const.CampRaceConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")

function CampRaceVSNode:ctor(target, pos)
    self._target = target
    self._pos = pos

    self._heroIcon = ccui.Helper:seekNodeByName(self._target, "HeroIcon")
    cc.bind(self._heroIcon, "CommonHeroIcon")
    self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
end

function CampRaceVSNode:updateUI(userData, isLight)
    if userData then
        self._heroIcon:setVisible(true)
        local name = userData:getName()
        local officerLevel = userData:getOfficer_level()
        local nameColor = isLight and Colors.getOfficialColor(officerLevel) or Colors.getCampGray()
        self._heroIcon:updateUI(userData:getCoverId(), nil, userData:getLimitLevel(), userData:getLimitRedLevel())
        self._heroIcon:setIconMask(not isLight)
        self._textName:setFontName(Path.getCommonFont())
        self._textName:setString(name)
        self._textName:setColor(nameColor)
    else
        self._heroIcon:setVisible(false)
        self._textName:setFontName(Path.getFontW8())
        -- local round = CampRaceHelper.getRoundWithPos(self._pos)
        -- local posName = round > 0 and Lang.get("camp_race_map_round_des"..round) or ""
        self._textName:setString("")
        self._textName:setColor(Colors.OBVIOUS_YELLOW)
    end
end

function CampRaceVSNode:setDesc(desc)
    self._textName:setFontName(Path.getFontW8())
    self._textName:setString(desc)
    self._textName:setColor(Colors.OBVIOUS_YELLOW)
end

return CampRaceVSNode