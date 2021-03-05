local RecoveryHorseNode = class("RecoveryHorseNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AudioConst = require("app.const.AudioConst")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

function RecoveryHorseNode:ctor(target, index, onClickAdd, onClickDelete)
	self._target = target
	self._index = index
	self._onClickAdd = onClickAdd
	self._onClickDelete = onClickDelete
	
	self._fileNodeHorse = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	cc.bind(self._fileNodeHorse, "CommonHorseAvatar")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._buttonClose = ccui.Helper:seekNodeByName(self._target, "ButtonClose")
	self._buttonClose:addClickEventListenerEx(handler(self, self._onButtonCloseClicked))

	self._nodeEffect = ccui.Helper:seekNodeByName(self._target, "NodeEffect")
end

function RecoveryHorseNode:_initUI()
	self._fileNodeHorse:setVisible(false)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
end

function RecoveryHorseNode:updateInfo(horseData)
	self:_initUI()
	if horseData then
		self._fileNodeHorse:setVisible(true)
		self._fileNodeHorse:showShadow(true)
		self._textName:setVisible(true)
		self._buttonClose:setVisible(true)

		local horseId = horseData:getBase_id()
		local star = horseData:getStar()
		self._fileNodeHorse:updateUI(horseId)
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseId)
		local name = HorseDataHelper.getHorseName(horseId, star)
		self._textName:setString(name)
		self._textName:setColor(param.icon_color)
		self._textName:enableOutline(param.icon_color_outline, 2)
	else
		self._buttonAdd:setVisible(true)
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect2(self._buttonAdd)
	end
end

function RecoveryHorseNode:_onButtonAddClicked()
	if self._onClickAdd then
		self._onClickAdd()
	end
end

function RecoveryHorseNode:_onButtonCloseClicked()
	self:updateInfo(nil)
	if self._onClickDelete then
		self._onClickDelete(self._index)
	end
end

function RecoveryHorseNode:reset()
	local horseNode = self._fileNodeHorse:getNodeHorse()
	horseNode:setPosition(cc.p(0, 0))
	horseNode:setScale(1.0)
	horseNode:setVisible(true)
end

function RecoveryHorseNode:playFlyEffect(callback)
	self._textName:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._buttonClose:setVisible(false)
	self._fileNodeHorse:showShadow(false)
	local horseNode = self._fileNodeHorse:getNodeHorse()
	local scaleTo = cc.ScaleTo:create(0.15, 0.5)
	horseNode:runAction(cc.Sequence:create(
        scaleTo,
        cc.CallFunc:create(function()
        	horseNode:setVisible(false)
        	self:_playMoving(callback)
        end))
    )
    G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_RECOVERY) --播音效
end

function RecoveryHorseNode:_playMoving(callback)
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

return RecoveryHorseNode