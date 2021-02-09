local HitTipParticle = require("app.fight.views.HitTip.HitTipParticle")
local HitTipFeature = class("HitTipFeature", HitTipParticle)

local BuffManager = require("app.fight.BuffManager")

function HitTipFeature:ctor(skillPath, callBack)
    HitTipFeature.super.ctor(self, "feature")
    self._picPath = Path.getTalent(skillPath)
    self._callBack = callBack
end

function HitTipFeature:popup()
	local function effectFunc(effect)
		if effect == "tianfu_id_r" or effect == "tianfu_id_l" then
            return display.newSprite(self._picPath)
		end
    end
    local function eventFunc(event)
        if event == "boom" then
           if self._callBack then
                self._callBack()
           end
        end
    end
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._node, "moving_tianfu_id", effectFunc, eventFunc, true )
end



return HitTipFeature