--
-- Author: Liangxu
-- Date: 2017-02-20 17:47:24
--
local TeamTreasureIcon = class("TeamTreasureIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TreasureConst = require("app.const.TreasureConst")

local SKETCH_RES = {
	[1] = "img_frame_icon05",
	[2] = "img_frame_icon06",
}

function TeamTreasureIcon:ctor(target,formatName)
	self._target = target
	self._isOpen = false --是否开启
	self._pos = nil
	self._slot = nil
	self._treasureId = nil
	self._totalList = nil
    self._noWearList = nil
    self._formatName = formatName

	self._imageLock = ccui.Helper:seekNodeByName(self._target, "ImageLock")
	self._textOpenLevel = ccui.Helper:seekNodeByName(self._target, "TextOpenLevel")
	self._imageSketch = ccui.Helper:seekNodeByName(self._target, "ImageSketch")
	self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
	self._fileNodeName = ccui.Helper:seekNodeByName(self._target, "FileNodeName")
	cc.bind(self._fileNodeName, "CommonTreasureName")
	-- self._fileNodeName:setFontSize(28)
	self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
	cc.bind(self._fileNodeCommon, "CommonTreasureIcon")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end

function TeamTreasureIcon:_initUI()
	self._imageLock:setVisible(false)
	self._imageSketch:setVisible(false)
	self._spriteAdd:setVisible(false)
	self._fileNodeCommon:setVisible(false)
	self._fileNodeName:setVisible(false)
	self._imageRedPoint:setVisible(false)
	self._imageArrow:setVisible(false)
end

function TeamTreasureIcon:updateIcon(pos, slot)
	self._isOnlyShow = false
	self:_initUI()
	local isOpen, des, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TREASURE)
	self._isOpen = isOpen
	if not isOpen then
		self._imageLock:setVisible(true)
		self._textOpenLevel:setString(Lang.get("treasure_txt_open", {level = info.level}))
		return
	end 

	self._pos = pos
	self._slot = slot
	self._treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, slot)
	if self._treasureId then
		local data = G_UserData:getTreasure():getTreasureDataWithId(self._treasureId)
		local baseId = data:getBase_id()
		
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(baseId)
		self._fileNodeCommon:setLevel(data:getLevel())
		self._fileNodeCommon:setRlevel(data:getRefine_level())
		self._fileNodeName:setVisible(true)
		self._fileNodeName:setName(baseId,nil,self._formatName)
		local FunctionCheck = require("app.utils.logic.FunctionCheck")
		if FunctionCheck.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) then
			local UserDataHelper = require("app.utils.UserDataHelper")
			local _, convertHeroBaseId = UserDataHelper.getHeroBaseIdWithTreasureId(self._treasureId)
			self._fileNodeCommon:updateJadeSlot(data:getJadeSysIds(), convertHeroBaseId)
		end
	else
		self._imageSketch:loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]))
		self._imageSketch:setVisible(true)
		self._totalList, self._noWearList = G_UserData:getTreasure():getReplaceTreasureListWithSlot(self._pos, self._slot)
		if #self._noWearList > 0 then
			self._spriteAdd:setVisible(true)
			local UIActionHelper = require("app.utils.UIActionHelper")
			UIActionHelper.playBlinkEffect(self._spriteAdd)
		end
	end
end

function TeamTreasureIcon:_onPanelTouch()
	if self._isOnlyShow then
		self:_onlyShowTouchCallback()
	else
		self:_normalTouchCallback()
	end
end

function TeamTreasureIcon:_normalTouchCallback()
	if not self._isOpen then
		return
	end
	
	if self._treasureId then
		G_SceneManager:showScene("treasureDetail", self._treasureId, TreasureConst.TREASURE_RANGE_TYPE_2)
	else
		
		if #self._noWearList == 0 then
			local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_TREASURE, DataConst["SHORTCUT_TREASURE_ID_"..self._slot])
		    PopupItemGuider:openWithAction()
		else
			local PopupChooseTreasureHelper = require("app.ui.PopupChooseTreasureHelper")
			local popup = require("app.ui.PopupChooseTreasure2").new()
			local callBack = handler(self, self._onChooseTreasure)
			popup:setTitle(Lang.get("treasure_wear_title"))
			popup:updateUI(PopupChooseTreasureHelper.FROM_TYPE1, callBack, self._totalList, nil, nil, self._noWearList, self._pos)
			popup:openWithAction()
		end
	end
end

function TeamTreasureIcon:_onlyShowTouchCallback()
	if self._onlyShowCallback then
		self._onlyShowCallback()
	end
end

function TeamTreasureIcon:_onChooseTreasure(treasureId)
	G_UserData:getTreasure():c2sEquipTreasure(self._pos, self._slot, treasureId)
end

function TeamTreasureIcon:showRedPoint(visible)
	self._imageRedPoint:setVisible(visible)
end

function TeamTreasureIcon:showUpArrow(visible)
	local UIActionHelper = require("app.utils.UIActionHelper")
	self._imageArrow:setVisible(visible)
	if visible then
		UIActionHelper.playFloatEffect(self._imageArrow)
	end
end

function TeamTreasureIcon:onlyShow(slot, data, isShow, heroBaseId)
	self._isOnlyShow = true
	self:_initUI()
	if data then
		local baseId = data:getBase_id()
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(baseId)
		self._fileNodeCommon:setLevel(data:getLevel())
		self._fileNodeCommon:setRlevel(data:getRefine_level())
		self._fileNodeName:setVisible(true)
		self._fileNodeName:setName(baseId)
		if isShow then
			self._fileNodeCommon:updateJadeSlot(data:getUserDetailJades() or {}, heroBaseId)
			self:setOnlyShowCallback(
				function()
					local PopupUserJadeDes = require("app.ui.PopupUserJadeDes").new(self._target, data)
					PopupUserJadeDes:open()
				end
			)
		else
			self:setOnlyShowCallback(nil)
		end
	else
		self._imageSketch:loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]))
		self._imageSketch:setVisible(true)
	end
end

function TeamTreasureIcon:setOnlyShowCallback(callback)
	self._onlyShowCallback = callback
end

return TeamTreasureIcon