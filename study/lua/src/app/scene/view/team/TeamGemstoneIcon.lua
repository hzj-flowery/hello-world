--
-- Author: Liangxu
-- Date: 2017-10-18 15:06:45
--
local TeamGemstoneIcon = class("TeamGemstoneIcon")
local GemstoneConst = require("app.const.GemstoneConst")
local UIActionHelper = require("app.utils.UIActionHelper")
local PopupPropInfo = require("app.ui.PopupPropInfo")
local PopupComposeFragment = require("app.ui.PopupComposeFragment")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local STATE2COLOR = {
	[GemstoneConst.EQUIP_STATE_1] = {color = Colors.CLASS_GREEN, outline = Colors.CLASS_GREEN_OUTLINE},
	[GemstoneConst.EQUIP_STATE_3] = {color = Colors.CLASS_GREEN, outline = Colors.CLASS_GREEN_OUTLINE},
	[GemstoneConst.EQUIP_STATE_4] = {color = Colors.CLASS_WHITE, outline = Colors.CLASS_WHITE_OUTLINE},
}

function TeamGemstoneIcon:ctor(target, slot, callback)
	self._target = target
	self._slot = slot
	self._callback = callback
	self._baseId = nil
	self._state = nil

	self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
	self._textState = ccui.Helper:seekNodeByName(self._target, "TextState")
	self._imageLock = ccui.Helper:seekNodeByName(self._target, "ImageLock")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
	cc.bind(self._fileNodeCommon, "CommonGemstoneIcon")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
	self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
end

function TeamGemstoneIcon:_initUI()
	self._spriteAdd:setVisible(false)
	self._textState:setVisible(false)
	self._imageLock:setVisible(false)
	self._imageRedPoint:setVisible(false)
	self._fileNodeCommon:setVisible(false)
	-- self._fileNodeCommon:setPosition(cc.p(45.5, 45.5))
end

function TeamGemstoneIcon:updateIcon(state, baseId)
	self._state = state
	self._baseId = baseId
	self:_initUI()

	if state == GemstoneConst.EQUIP_STATE_2 then --已装备
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(baseId)
		self._fileNodeCommon:setIconMask(false)
	elseif state == GemstoneConst.EQUIP_STATE_5 then --锁住
		self._imageLock:setVisible(true)
	else
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(baseId)
		self._fileNodeCommon:setIconMask(true)
		self._spriteAdd:setVisible(true)
		self._textState:setVisible(true)
		UIActionHelper.playBlinkEffect(self._spriteAdd)
		
		self._textState:setColor(STATE2COLOR[state].color)
		self._textState:enableOutline(STATE2COLOR[state].outline, 2)
		if state == GemstoneConst.EQUIP_STATE_4 then
			local myNum, needNum = self:_getFragmentNum()
			self._textState:setString(myNum.."/"..needNum)
		else
			self._textState:setString(Lang.get("hero_awake_gemstone_state_"..state))
		end
	end
end

function TeamGemstoneIcon:_getFragmentNum()
	local gemstoneConfig = require("app.config.gemstone").get(self._baseId)
	assert(gemstoneConfig, string.format("gemstone config can not find id = %d", self._baseId))
	local fragmentId = gemstoneConfig.fragment_id
	local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local config = itemParam.cfg
	local myNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local needNum = config.fragment_num
	return myNum, needNum
end

function TeamGemstoneIcon:getState()
	return self._state
end

function TeamGemstoneIcon:_onPanelTouch()
	local func = self["_onClickCallback"..self._state]
	if func then
		func(self)
	end
end

--可装备
function TeamGemstoneIcon:_onClickCallback1()
	local popup = PopupPropInfo.new(self._baseId)
	local function callback()
		if self._callback then
			self._callback(self._slot)
		end
	end
	popup:setCallback(callback)
	popup:setBtnDes(Lang.get("hero_awake_equip_btn"))
	popup:openWithAction()
end

--已装备
function TeamGemstoneIcon:_onClickCallback2()
	local popup = PopupPropInfo.new(self._baseId)
	popup:openWithAction()
end

--可合成
function TeamGemstoneIcon:_onClickCallback3()
	local info = require("app.config.gemstone").get(self._baseId)
	assert(info, string.format("gemstone config can not find id = %d", self._baseId))
	local fragmentId = info.fragment_id
	local function callback()
		if self._callback then
			self._callback(self._slot, true)
		end
	end

	local popup = PopupComposeFragment.new(self, fragmentId, callback)
	popup:openWithAction()
end

--无道具
function TeamGemstoneIcon:_onClickCallback4()
	local gemstoneConfig = require("app.config.gemstone").get(self._baseId)
	assert(gemstoneConfig, string.format("gemstone config can not find id = %d", self._baseId))
	local fragmentId = gemstoneConfig.fragment_id
	local popup = require("app.ui.PopupItemGuider").new()
	popup:updateUI(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	popup:openWithAction()
end

function TeamGemstoneIcon:showRedPoint(show)
	self._imageRedPoint:setVisible(show)
end

function TeamGemstoneIcon:playEffect()
	local effect = EffectGfxNode.new("effect_juexing_xx")
	effect:setAutoRelease(true)
	self._nodeEffect:addChild(effect)
    effect:play()
end

function TeamGemstoneIcon:getCommonIcon()
	return self._fileNodeCommon
end

return TeamGemstoneIcon
