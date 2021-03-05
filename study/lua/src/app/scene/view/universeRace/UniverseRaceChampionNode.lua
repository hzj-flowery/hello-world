local UniverseRaceChampionNode = class("UniverseRaceChampionNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")

function UniverseRaceChampionNode:ctor(target)
    self._target = target

    self._textServer = ccui.Helper:seekNodeByName(self._target, "TextServer")
    self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._nodeAvatar = ccui.Helper:seekNodeByName(self._target, "NodeAvatar")
	cc.bind(self._nodeAvatar, "CommonHeroAvatar")
	self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
	G_EffectGfxMgr:createPlayGfx(self._nodeEffect, "effect_longtai_lizi")
end

function UniverseRaceChampionNode:updateUI(userData)
    if userData then
		self._target:setVisible(true)
        self._textServer:setString(userData:getServer_name())
        self._textName:setString(userData:getUser_name())
		local officialLevel = userData:getOfficer_level()
        self._textName:setColor(Colors.getOfficialColor(officialLevel))
		UIHelper.updateTextOfficialOutline(self._textName, officialLevel)
        local covertId, limitLevel, limitRedLevel = userData:getCovertIdAndLimitLevel()
        self._nodeAvatar:updateUI(covertId, nil, nil, limitLevel, nil, nil, limitRedLevel)
    else
		self._target:setVisible(false)
    end
end

return UniverseRaceChampionNode