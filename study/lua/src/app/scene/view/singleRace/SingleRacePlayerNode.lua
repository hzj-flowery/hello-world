--
-- Author: Liangxu
-- Date: 2018-11-26
-- 跨服个人竞技战斗玩家Node

local SingleRacePlayerNode = class("SingleRacePlayerNode")
local SingleRaceConst = require("app.const.SingleRaceConst")

local COLOR_ELIMINATE = cc.c3b(0x7f, 0x7f, 0x7f) --淘汰显示的灰色

function SingleRacePlayerNode:ctor(target, pos, callback)
    self._target = target
    self._pos = pos
    self._callback = callback

    self._data = nil
    self._isSelf = false

    self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
    self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
    self._textServer = ccui.Helper:seekNodeByName(self._target, "TextServer")
    self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
    self._nodeIcon = ccui.Helper:seekNodeByName(self._target, "NodeIcon")
    cc.bind(self._nodeIcon, "CommonHeroIcon")
    self._nodeIcon:setTouchEnabled(true)
    self._nodeIcon:setCallBack(handler(self, self._onClickIcon))
end

function SingleRacePlayerNode:updateUI(data, state)
	self._data = data
	if data then
		self._textServer:setVisible(true)
		self._textName:setVisible(true)
		self._nodeIcon:showHeroUnknow(false)

		local serverName = data:getServer_name()
		local userName = data:getUser_name()
		local officerLevel = data:getOfficer_level()
		local covertId, limitLevel, limitRedLevel = data:getCovertIdAndLimitLevel()

		self._textServer:setString(serverName)
		self._textName:setString(userName)
		self._nodeIcon:updateUI(covertId, nil, limitLevel, limitRedLevel)
		if state == SingleRaceConst.RESULT_STATE_LOSE then
			self._textServer:setColor(COLOR_ELIMINATE)
			self._textName:setColor(COLOR_ELIMINATE)
			self._nodeIcon:setIconMask(true)
		else
			self._textServer:setColor(Colors.BRIGHT_BG_TWO)
			self._textName:setColor(Colors.getOfficialColor(officerLevel))
			self._nodeIcon:setIconMask(false)
		end
	else
		self._textServer:setVisible(false)
		self._textName:setVisible(false)
		self._nodeIcon:showHeroUnknow(true)
		self._nodeIcon:setIconMask(false)
	end
end

function SingleRacePlayerNode:fontSizeBigger()
	self._textServer:setFontSize(30)
	self._textName:setFontSize(30)
end

function SingleRacePlayerNode:fontSizeSmaller()
	self._textServer:setFontSize(20)
	self._textName:setFontSize(20)
end

function SingleRacePlayerNode:showEffect(effectName)
	self._nodeIcon:showLightEffect(nil, effectName)
end

function SingleRacePlayerNode:removeEffect()
	self._nodeIcon:removeLightEffect()
end

--设置自己的样式
function SingleRacePlayerNode:setSelfModule(isSelf)
	self._isSelf = isSelf
	if self._nodeEffect == nil then
		return
	end
	self._nodeEffect:removeAllChildren()
	if isSelf then
		self._imageBg:loadTexture(Path.getIndividualCompetitiveImg("img_individual-competitive_02b"))
		G_EffectGfxMgr:createPlayGfx(self._nodeEffect, "effect_liuxian_orange", nil, false)
	else
		self._imageBg:loadTexture(Path.getIndividualCompetitiveImg("img_individual-competitive_02"))
	end
end

function SingleRacePlayerNode:_onClickIcon(sender)
	if self._callback and self._data then
		local userId = self._data:getUser_id()
		local power = self._data:getPower()
		self._callback(userId, self._pos, power)
	end
end

return SingleRacePlayerNode