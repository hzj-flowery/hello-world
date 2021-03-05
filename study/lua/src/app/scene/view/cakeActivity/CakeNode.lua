--
-- Author: Liangxu
-- Date: 2019-5-10
-- 蛋糕形象

local CakeNode = class("CakeNode")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

function CakeNode:ctor(target)
	self._target = target
	self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
	self._curLevel = 0
end

function CakeNode:updateUI(info)
	if info.lv ~= self._curLevel then
		local movingName = info.cake_pic_effect
		self._nodeEffect:removeAllChildren()
		G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, movingName, nil, nil, false)
		self._curLevel = info.lv
	end
end

return CakeNode