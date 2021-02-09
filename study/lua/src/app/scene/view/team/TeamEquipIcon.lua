--
-- Author: Liangxu
-- Date: 2017-02-20 17:35:20
--
local TeamEquipIcon = class("TeamEquipIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local EquipConst = require("app.const.EquipConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local SKETCH_RES = {
	[1] = "img_frame_icon01",
	[2] = "img_frame_icon04",
	[3] = "img_frame_icon02",
	[4] = "img_frame_icon03"
}

function TeamEquipIcon:ctor(target)
	self._target = target
	self._pos = nil --阵位
	self._slot = nil --装备位
	self._equipId = nil
	self._totalList = {} --总的更换列表
	self._noWearList = {} --未穿戴的更换列表
	self._effect1 = nil
	self._effect2 = nil

	self._imageSketch = ccui.Helper:seekNodeByName(self._target, "ImageSketch")
	self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
	self._fileNodeName = ccui.Helper:seekNodeByName(self._target, "FileNodeName")
	cc.bind(self._fileNodeName, "CommonEquipName")
	self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
	cc.bind(self._fileNodeCommon, "CommonEquipIcon")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))

	self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
	self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")
end

function TeamEquipIcon:_initUI()
	self._imageSketch:setVisible(false)
	self._spriteAdd:setVisible(false)
	self._fileNodeCommon:setVisible(false)
	self._fileNodeName:setVisible(false)
	self._imageRedPoint:setVisible(false)
	self._imageArrow:setVisible(false)
end

function TeamEquipIcon:updateIcon(pos, slot)
	self._isOnlyShow = false
	self._pos = pos
	self._slot = slot
	self._equipId = G_UserData:getBattleResource():getResourceId(pos, 1, slot)

	self:_initUI()

	if self._equipId then
		local equipData = G_UserData:getEquipment():getEquipmentDataWithId(self._equipId)
		local equipBaseId = equipData:getBase_id()
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(equipBaseId)
		self._fileNodeCommon:setLevel(equipData:getLevel())
		self._fileNodeCommon:setRlevel(equipData:getR_level())
		local FunctionCheck = require("app.utils.logic.FunctionCheck")
		if FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) then
			local UserDataHelper = require("app.utils.UserDataHelper")
			local _, convertHeroBaseId = UserDataHelper.getHeroBaseIdWithEquipId(self._equipId)
			self._fileNodeCommon:updateJadeSlot(equipData:getJadeSysIds(), convertHeroBaseId)
		end
		self._fileNodeName:setVisible(true)
		self._fileNodeName:setName(equipBaseId)
	else
		self._imageSketch:loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]))
		self._imageSketch:setVisible(true)
		self._totalList, self._noWearList = G_UserData:getEquipment():getReplaceEquipmentListWithSlot(pos, slot)
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP)
		if #self._noWearList > 0 and isOpen then
			self._spriteAdd:setVisible(true)
			local UIActionHelper = require("app.utils.UIActionHelper")
			UIActionHelper.playBlinkEffect(self._spriteAdd)
		end
	end
end

function TeamEquipIcon:_onPanelTouch()
	if self._isOnlyShow then
		self:_onlyShowTouchCallback()
	else
		self:_normalTouchCallback()
	end
end

function TeamEquipIcon:_onlyShowTouchCallback()
	if self._onlyShowCallback then
		self._onlyShowCallback()
	end
end

function TeamEquipIcon:_normalTouchCallback()
	local isOpen, des, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP)
	if not isOpen then
		G_Prompt:showTip(des)
		return
	end

	if self._equipId then
		G_SceneManager:showScene("equipmentDetail", self._equipId, EquipConst.EQUIP_RANGE_TYPE_2)
	else
		if #self._noWearList == 0 then
			local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
			PopupItemGuider:updateUI(TypeConvertHelper.TYPE_EQUIPMENT, DataConst["SHORTCUT_EQUIP_ID_" .. self._slot])
			PopupItemGuider:openWithAction()
		else
			local PopupChooseEquipHelper = require("app.ui.PopupChooseEquipHelper")
			local popup = require("app.ui.PopupChooseEquip2").new()
			local callBack = handler(self, self._onChooseEquip)
			popup:setTitle(Lang.get("equipment_wear_title"))
			popup:updateUI(PopupChooseEquipHelper.FROM_TYPE1, callBack, self._totalList, nil, nil, self._noWearList, self._pos)
			popup:openWithAction()
		end
	end
end

function TeamEquipIcon:_onChooseEquip(equipId)
	G_UserData:getEquipment():c2sAddFightEquipment(self._pos, self._slot, equipId)
end

function TeamEquipIcon:showRedPoint(visible)
	self._imageRedPoint:setVisible(visible)
end

function TeamEquipIcon:showUpArrow(visible)
	local UIActionHelper = require("app.utils.UIActionHelper")
	self._imageArrow:setVisible(visible)
	if visible then
		UIActionHelper.playFloatEffect(self._imageArrow)
	end
end

--只显示
function TeamEquipIcon:onlyShow(slot, data, isShow, heroBaseId)
	self._isOnlyShow = true
	self:_initUI()
	if data then
		local baseId = data:getBase_id()
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(baseId)
		self._fileNodeCommon:setLevel(data:getLevel())
		self._fileNodeCommon:setRlevel(data:getR_level())
		if isShow then
			self._fileNodeCommon:updateJadeSlot(data:getUserDetailJades() or {}, heroBaseId)
			self:setOnlyShowCallback(
				function()
					if data:getConfig().suit_id > 0 then
						local PopupUserJadeDes = require("app.ui.PopupUserJadeDes").new(self._target, data)
						PopupUserJadeDes:open()
					end
				end
			)
		else
			self:setOnlyShowCallback(nil)
		end
		self._fileNodeName:setVisible(true)
		self._fileNodeName:setName(baseId)
	else
		self._imageSketch:loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]))
		self._imageSketch:setVisible(true)
	end
end

function TeamEquipIcon:setOnlyShowCallback(callback)
	self._onlyShowCallback = callback
end

function TeamEquipIcon:showEffect()
	self:_clearEffect()
	self._fileNodeCommon:showIconEffect()
end

function TeamEquipIcon:_clearEffect()
	self._fileNodeCommon:removeLightEffect()
end

function TeamEquipIcon:setNameWidth(width)
	self._fileNodeName:setNameWidth(width)
end

return TeamEquipIcon
