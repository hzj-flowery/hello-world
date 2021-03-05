--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕奖励宝箱

local CakeAwardBox = class("CakeAwardBox")
local CakeActivityConst = require("app.const.CakeActivityConst")

local RES_INFO = {
	[CakeActivityConst.AWARD_STATE_1] = {image = "baoxiangjin_guan"},
	[CakeActivityConst.AWARD_STATE_2] = {image = "baoxiangjin_kai", effect = "effect_dangao_boxjump"},
	[CakeActivityConst.AWARD_STATE_3] = {image = "baoxiangjin_kong"},
}

function CakeAwardBox:ctor(target, callback)
	self._target = target
	self._callback = callback
	self._state = 0
	self._awardId = 0
	
	self._imageIcon = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
	self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onClick))
end

function CakeAwardBox:updateUI(state, awardId)
	self._state = state
	self._awardId = awardId
	local resName = RES_INFO[state].image
	self._imageIcon:loadTexture(Path.getChapterBox(resName))
	self._imageIcon:setVisible(true)

	local effectName = RES_INFO[state].effect
	self._nodeEffect:removeAllChildren()
	if effectName then
		self._imageIcon:setVisible(false)
		G_EffectGfxMgr:createPlayGfx(self._nodeEffect, effectName)
	end
end

function CakeAwardBox:_onClick()
	if self._callback then
		self._callback(self._state, self._awardId)
	end
end

return CakeAwardBox