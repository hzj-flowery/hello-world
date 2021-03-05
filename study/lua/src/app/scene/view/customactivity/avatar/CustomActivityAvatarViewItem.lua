
-- Author: nieming
-- Date:2018-04-12 15:55:04
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CustomActivityAvatarViewItem = class("CustomActivityAvatarViewItem", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local AudioConst = require("app.const.AudioConst")
function CustomActivityAvatarViewItem:ctor(index, award)

	--csb bind var name
	self._imageLight = nil  --ImageView
	-- self._imageNormalBg = nil  --ImageView
	-- self._imageRareBg = nil  --ImageView
	self._imageRareSign = nil  --ImageView
	self._item = nil  --CommonIconTemplate

	self._index = index
	self._award = award
	self._isRale = index == 1

	local resource = {
		file = Path.getCSB("CustomActivityAvatarViewItem", "customactivity/avatar"),

	}
	CustomActivityAvatarViewItem.super.ctor(self, resource)
end

-- Describle：
function CustomActivityAvatarViewItem:onCreate()
	self._item:unInitUI()
	self._item:initUI(self._award.type, self._award.value, self._award.size)
	self._imageRareSign:setVisible(self._isRale)
	-- self._imageRareBg:setVisible(self._isRale)
	self._imageLight:setVisible(false)
	self:_addEffect()
end

-- Describle：
function CustomActivityAvatarViewItem:onEnter()

end

-- Describle：
function CustomActivityAvatarViewItem:onExit()

end
-- -- 单次 或者 五连  设置默认背景透明度
-- function CustomActivityAvatarViewItem:setNormalBgOpacity(op)
-- 	if not self._isRale then
-- 		self._imageNormalBg:setOpacity(op)
-- 	end
-- end

function CustomActivityAvatarViewItem:stopAction()
	self._imageLight:stopAllActions()
end

function CustomActivityAvatarViewItem:setHighlight(trueOrFalse)
	self._imageLight:setVisible(trueOrFalse)
end

function CustomActivityAvatarViewItem:playRun(t, callback)
	self._imageLight:setVisible(true)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_AVATAR_ACTIVITY_RUN)

	local delayAction = cc.DelayTime:create(t)
	local callFuncAction = cc.CallFunc:create(function()
		self._imageLight:setVisible(false)
		if callback then
			callback()
		end
	end)
	local action = cc.Sequence:create(delayAction, callFuncAction)
	self._imageLight:runAction(action)
end

function CustomActivityAvatarViewItem:playSelect(callback)
	self._imageLight:setVisible(true)
	local blinkAction = cc.Blink:create(0.6, 3);
	G_AudioManager:playSoundWithId(AudioConst.SOUND_AVATAR_ACTIVITY_END)
	local callFuncAction = cc.CallFunc:create(function()
		self._imageLight:setVisible(false)
		if callback then
			callback()
		end
	end)
	local action = cc.Sequence:create(blinkAction, callFuncAction)
	self._imageLight:runAction(action)
end

function CustomActivityAvatarViewItem:_addStarEffect()
	self._effectNode:removeAllChildren()
	 G_EffectGfxMgr:createPlayGfx( self._effectNode, "effect_zhujiemian_xingxing" )
end

function CustomActivityAvatarViewItem:_addEffect()
	local cosRes = self._award
	if DataConst.ITEM_AVATAR_ACTIVITY_ITEM2 == cosRes.value then
		self._item:showLightEffect(1,"effect_icon_liuguang")
		self:_addStarEffect()
	elseif DataConst.ITEM_AVATAR_ACTIVITY_ITEM1 == cosRes.value then
		self._item:showLightEffect(1,"effect_icon_liuguang")
	end

end

return CustomActivityAvatarViewItem
