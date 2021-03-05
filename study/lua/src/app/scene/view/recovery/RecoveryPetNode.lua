--
-- Author: Liangxu
-- Date: 2017-05-02 14:53:31
--
local RecoveryPetNode = class("RecoveryPetNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RecoveryHelper = require("app.scene.view.recovery.RecoveryHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local AudioConst = require("app.const.AudioConst")

function RecoveryPetNode:ctor(target, index, onClickAdd, onClickDelete)
	self._target = target
	self._index = index
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete
	
	self._fileNodeHero = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	cc.bind(self._fileNodeHero, "CommonHeroAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))

	self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
end

function RecoveryPetNode:_initUI()
	self._fileNodeHero:setConvertType(TypeConvertHelper.TYPE_PET)
	self._fileNodeHero:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RecoveryPetNode:updateInfo(heroId)
	self:_initUI()
	if heroId then
		self._fileNodeHero:setVisible(true)
		self._fileNodeHero:showShadow(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		self._fileNodeHero:updateUI(heroId,"_small")
		self._fileNodeHero:setScale(1.6)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, heroId)
		self._textName:setString(heroParam.name)
		self._textName:setColor(heroParam.icon_color)
		self._textName:enableOutline(heroParam.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RecoveryPetNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RecoveryPetNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete(self._index)
	end
end

function RecoveryPetNode:reset()
	local heroNode = self._fileNodeHero:getNodeHero()
	heroNode:setPosition(cc.p(0, 0))
	heroNode:setScale(1.0)
	heroNode:setVisible(true)
end

function RecoveryPetNode:playFlyEffect(callback)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
	self._fileNodeHero:showShadow(false)
	local heroNode = self._fileNodeHero:getNodeHero()
	local scaleTo = cc.ScaleTo:create(0.15, 0.5)
	heroNode:runAction(cc.Sequence:create(
        scaleTo,
        cc.CallFunc:create(function()
        	heroNode:setVisible(false)
        	self:_playMoving(callback)
        end))
    )
    G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_RECOVERY) --播音效
end

function RecoveryPetNode:_playMoving(callback)
	local function effectFunction(effect)
        return cc.Node:create()
    end

    local function eventFunction(event)
    	if event == "finish" then
			if callback then
				callback()
			end
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_huishou", effectFunction, eventFunction , false)
end

return RecoveryPetNode