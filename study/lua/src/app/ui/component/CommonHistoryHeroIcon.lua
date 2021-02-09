
local CommonIconBase = import(".CommonIconBase")
local CommonHistoryHeroIcon = class("CommonHistoryHeroIcon",CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local EXPORTED_METHODS = {
	"setType",
	"updateUI",
	"setRoundType",
	"updateUIWithUnitData",
	"resetUI",
	"setRoundIconMask",
	"showEquipFrame",	--显示隐藏装备框
	"showRedPoint",
	"updateUIBreakThrough", --根据等级更新ui
	"showCloseBtn",			--显示隐藏关闭按钮
	"setCloseBtnHandler",	--设置关闭按钮回调
	"setTouchEnabled", 		--设置触摸
	"setTag",
	"getTag",
	"getParam",
}


function CommonHistoryHeroIcon:ctor()
	CommonHistoryHeroIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_HISTORY_HERO
	self._roundType = false
	self._effect1 = nil
	self._effect2 = nil
	self._closeHandler = nil
	self._unitData = nil
	self._tag = 0
end

function CommonHistoryHeroIcon:_init()
	CommonHistoryHeroIcon.super._init(self)

	self._imageIcon = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._nodeAwakenR = ccui.Helper:seekNodeByName(self._target, "_nodeAwakenR")
	self._equipFrameR = ccui.Helper:seekNodeByName(self._target, "_equipFrameR")
	self._equipIcon = ccui.Helper:seekNodeByName(self._target, "_equipIcon")
	self._mask = ccui.Helper:seekNodeByName(self._target, "_mask")
	self._redPoint = ccui.Helper:seekNodeByName(self._target, "_redPoint")
	self._nodeRound = ccui.Helper:seekNodeByName(self._target, "nodeRound")
	self._btnClose = ccui.Helper:seekNodeByName(self._target, "_btnClose")
	if self._btnClose then
		self._btnClose:addClickEventListenerEx(handler(self, self._onCloseBtnTouch))
	end

	self._nodeSquare = ccui.Helper:seekNodeByName(self._target, "nodeSquare")
	self._iconAwakenSquare = ccui.Helper:seekNodeByName(self._target, "_iconAwakenSquare")
	self._equipSlotSquare = ccui.Helper:seekNodeByName(self._target, "_equipSlotSquare")

	self:showCloseBtn(false)
end

function CommonHistoryHeroIcon:bind(target)
	CommonHistoryHeroIcon.super.bind(self, target)
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHistoryHeroIcon:unbind(target)
	CommonHistoryHeroIcon.super.unbind(self, target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHistoryHeroIcon:updateUI(value, size)
	local itemParams = CommonHistoryHeroIcon.super.updateUI(self, value, size)
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end
	self:showIconEffect()

	if self._equipFrameR and self._equipSlotSquare and self._equipIcon then
		self._equipFrameR:loadTexture(itemParams.icon_equip_frame_round)
		self._equipSlotSquare:loadTexture(Path.getHistoryHeroImg("img_historical_hero_equip_fram0" .. itemParams.color))
		self._equipIcon:loadTexture(itemParams.icon_equip)
	end
	
	if self._roundType then
		self._imageBg:loadTexture(itemParams.icon_bg_round)
		self._imageIcon:loadTexture(itemParams.icon_round)
	else
		self._imageBg:loadTexture(itemParams.icon_bg)
		self._imageIcon:loadTexture(itemParams.icon)
	end
end

function CommonHistoryHeroIcon:updateUIWithUnitData(unitData, size)
	local itemParams = CommonHistoryHeroIcon.super.updateUI(self, unitData:getConfig().id, 1)
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end
	self:showIconEffect()

	self._imageIcon:loadTexture(itemParams.icon_round)
	self._equipFrameR:loadTexture(itemParams.icon_equip_frame_round)
	self._equipIcon:loadTexture(itemParams.icon_equip)
	self._equipSlotSquare:loadTexture(Path.getHistoryHeroImg("img_historical_hero_equip_fram0" .. itemParams.color))

	if self._roundType then
		self._imageBg:loadTexture(itemParams.icon_bg_round)
		self._imageIcon:loadTexture(itemParams.icon_round)
	else
		self._imageBg:loadTexture(itemParams.icon_bg)
		self._imageIcon:loadTexture(itemParams.icon)
	end

	if unitData then
		self._unitData = unitData
		self:updateUIBreakThrough(unitData:getBreak_through())
	end
end

function CommonHistoryHeroIcon:updateUIBreakThrough(level)
	if level == 1 then
		self._nodeAwakenR:setVisible(false)
		self._iconAwakenSquare:setVisible(false)
		self._equipIcon:setVisible(false)
		self._equipFrameR:setVisible(true)
	elseif level == 2 then
		self._nodeAwakenR:setVisible(false)
		self._iconAwakenSquare:setVisible(false)
		self._equipIcon:setVisible(true)
		self._equipFrameR:setVisible(true)
	elseif level == 3 then
		self._nodeAwakenR:setVisible(true)
		self._iconAwakenSquare:setVisible(true)
		self._equipIcon:setVisible(true)
		self._equipFrameR:setVisible(true)
	end
end

function CommonHistoryHeroIcon:resetUI()
	self._imageBg:loadTexture(Path.getHistoryHeroImg("img_historical_hero_fram01"))
	self._nodeAwakenR:setVisible(false)
	self._iconAwakenSquare:setVisible(false)
	self._equipIcon:setVisible(false)
	self._equipFrameR:setVisible(false)
end

function CommonHistoryHeroIcon:setRoundIconMask(bShowMask)
	self._mask:setVisible(bShowMask)
end

function CommonHistoryHeroIcon:setType(type)
	self._type = type
end

function CommonHistoryHeroIcon:setRoundType(bRound)
	self._roundType = bRound
	self._nodeRound:setVisible(bRound)
	self._nodeSquare:setVisible(not bRound)
end

function CommonHistoryHeroIcon:showEquipFrame(bShow, unitData)
	self._equipIcon:setVisible(bShow)
	self._equipFrameR:setVisible(bShow)
	self._nodeAwakenR:setVisible(bShow)
	self._iconAwakenSquare:setVisible(bShow)
	if bShow then
		if unitData then
			self._unitData = unitData
			if unitData:getBreak_through() == 1 then
				self._nodeAwakenR:setVisible(false)
				self._iconAwakenSquare:setVisible(false)
				self._equipIcon:setVisible(false)
				self._equipFrameR:setVisible(true)
			elseif unitData:getBreak_through() == 2 then
				self._nodeAwakenR:setVisible(false)
				self._iconAwakenSquare:setVisible(false)
				self._equipIcon:setVisible(true)
				self._equipFrameR:setVisible(true)
			elseif unitData:getBreak_through() == 3 then
				self._nodeAwakenR:setVisible(true)
				self._iconAwakenSquare:setVisible(true)
				self._equipIcon:setVisible(true)
				self._equipFrameR:setVisible(true)
			end
		end
	end
end

function CommonHistoryHeroIcon:showRedPoint(bShow)
	self._redPoint:setVisible(bShow)
end

function CommonHistoryHeroIcon:setTouchEnabled(bEnable)
	CommonHistoryHeroIcon.super.setTouchEnabled(self, bEnable)
end

function CommonHistoryHeroIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				local isHave = G_UserData:getHistoryHero():isHaveHero(self._itemParams.cfg.id)
				local list = {}
				table.insert(list, {cfg = self._itemParams.cfg, isHave = isHave})
				local PopupHeroDetail = require("app.scene.view.historyhero.PopupHistoryHeroDetail").new(
				        self._type, nil, list, false, 1, self._itemParams.cfg.id)
    			PopupHeroDetail:openWithAction()
			end
		end
	end
end

function CommonHistoryHeroIcon:removeLightEffect()
    if self._effect1 then
		self._effect1:runAction(cc.RemoveSelf:create())
		self._effect1 = nil
	end
	if self._effect2 then
		self._effect2:runAction(cc.RemoveSelf:create())
		self._effect2 = nil
	end
end

function CommonHistoryHeroIcon:showIconEffect(scale)
	self:removeLightEffect()
	if self._itemParams == nil then
		return
	end

	local baseId = self._itemParams.cfg.id

	local effects = require("app.utils.data.HistoryHeroDataHelper").getHistoryHeroEffectWithBaseId(baseId)
	if effects == nil then
		return
	end
	--dump(effects)
	if self._nodeEffectUp == nil then
		self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")
	end
	if self._nodeEffectDown == nil then
		self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
	end

	if #effects == 1 then
		local effectName = effects[1]
		self._effect1 = EffectGfxNode.new(effectName)
		self._nodeEffectUp:addChild(self._effect1)
        self._effect1:play()
	end

	if #effects == 2 then
		local effectName1 = effects[1]
		self._effect1 = EffectGfxNode.new(effectName1)
		self._nodeEffectDown:addChild(self._effect1)
		self._effect1:play()
    	local effectName2 = effects[2]
		self._effect2 = EffectGfxNode.new(effectName2)
		self._nodeEffectUp:addChild(self._effect2)
		self._effect2:play()
	end
end

--显示隐藏关闭按钮
function CommonHistoryHeroIcon:showCloseBtn(bVisible)
	if self._btnClose then
		self._btnClose:setVisible(bVisible)
	end
end

--设置关闭按钮回调
function CommonHistoryHeroIcon:setCloseBtnHandler(handler)
	self._closeHandler = handler
end

--设置tag
function CommonHistoryHeroIcon:setTag(tag)
	self._tag = tag
end

--获取tag
function CommonHistoryHeroIcon:getTag(tag)
	return self._tag
end

--获取param
function CommonHistoryHeroIcon:getParam()
	return self._itemParams
end


function CommonHistoryHeroIcon:_onCloseBtnTouch()
	self._closeHandler(self)
end




return CommonHistoryHeroIcon