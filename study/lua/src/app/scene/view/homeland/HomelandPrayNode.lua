
local ViewBase = require("app.ui.ViewBase")
local HomelandPrayNode = class("HomelandPrayNode", ViewBase)
local HomelandConst = require("app.const.HomelandConst")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local AudioConst = require("app.const.AudioConst")

function HomelandPrayNode:ctor(homelandType, callback)
	self._homelandType = homelandType
	self._callback = callback
	local resource = {
		file = Path.getCSB("HomelandPrayNode", "homeland"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onClick"}}
			},
		},
	}
	HomelandPrayNode.super.ctor(self, resource)
end

function HomelandPrayNode:onCreate()
	self:setPosition(cc.p(0, -220))
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, "moving_shenshu_lianhuadeng")
end

function HomelandPrayNode:_onClick()
    if self:isFriendTree() then
        return
    end
    local curLevel = G_UserData:getHomeland():getMainTreeLevel()
    local unlockLevel = HomelandConst.getUnlockPrayLevel()
    if curLevel < unlockLevel then
        G_Prompt:showTip(Lang.get("homeland_pray_level_not_reach_tip", {level = unlockLevel}))
        return
	end
	if self._callback then
		G_AudioManager:playSoundWithId(AudioConst.SOUND_QiFU)
		self._callback()
	end
end

function HomelandPrayNode:isFriendTree( ... )
	if self._homelandType == HomelandConst.FRIEND_TREE then
		return true
	end 

	return false
end

function HomelandPrayNode:updateRedPoint()
	if self:isFriendTree() == false then
		local show = G_UserData:getHomeland():getPrayRestCount() > 0
		self._redPoint:setVisible(show)
	else
		self._redPoint:setVisible(false)
	end
end

return HomelandPrayNode