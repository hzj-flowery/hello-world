--
-- Author: Liangxu
-- Date: 2017-04-17 17:22:09
-- 装备培养中的Icon
local EquipTrainIcon = class("EquipTrainIcon")
local UIHelper = require("yoka.utils.UIHelper")

function EquipTrainIcon:ctor(target, onClick)
	self._target = target
	self._onClick = onClick

	self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
	cc.bind(self._fileNodeCommon, "CommonEquipIcon")
	self._imageSelected = ccui.Helper:seekNodeByName(self._target, "ImageSelected")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end

function EquipTrainIcon:_initUI()
	self._fileNodeCommon:setVisible(false)
	self._imageSelected:setVisible(false)
	self._panelTouch:setVisible(false)
end

function EquipTrainIcon:updateIcon(equipData)
	self._equipId = nil
	self:_initUI()

	if equipData then
		self._equipId = equipData:getId()
		self._fileNodeCommon:setVisible(true)
		self._panelTouch:setVisible(true)

		local equipBaseId = equipData:getBase_id()
		self._fileNodeCommon:updateUI(equipBaseId)

		local level = equipData:getLevel()
		if level > 0 then
			self._fileNodeCommon:setLevel(level)
		end

		local rLevel = equipData:getR_level()
		if rLevel > 0 then
			self._fileNodeCommon:setRlevel(rLevel)
		end
	end
end

function EquipTrainIcon:_onPanelTouch()
	if self._onClick then
		self._onClick(self._equipId)
	end
end

function EquipTrainIcon:setSelected(selected)
	self._imageSelected:setVisible(selected)
end

return EquipTrainIcon