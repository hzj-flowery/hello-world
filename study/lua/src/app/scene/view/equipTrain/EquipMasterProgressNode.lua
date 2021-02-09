--
-- Author: Liangxu
-- Date: 2017-04-24 17:18:23
-- 装备大师进度
local EquipMasterProgressNode = class("EquipMasterProgressNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local MasterConst = require("app.const.MasterConst")
local EquipConst = require("app.const.EquipConst")
local TreasureConst = require("app.const.TreasureConst")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")

function EquipMasterProgressNode:ctor(parentView, target)
	self._parentView = parentView
	self._target = target
	self._item = ccui.Helper:seekNodeByName(self._target, "Item")
	self._fileNodeIcon = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	cc.bind(self._fileNodeIcon, "CommonIconTemplate")
	self._fileNodeIcon:setImageTemplateVisible(true)
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._loadingBarProgress = ccui.Helper:seekNodeByName(self._target, "LoadingBarProgress")
	self._textProgress = ccui.Helper:seekNodeByName(self._target, "TextProgress")
	self._buttonStrengthen = ccui.Helper:seekNodeByName(self._target, "ButtonStrengthen")
	cc.bind(self._buttonStrengthen, "CommonButtonLevel2Highlight")
	self._buttonStrengthen:setString(Lang.get("equipment_master_btn_strengthen"))
	self._buttonStrengthen:addClickEventListenerEx(handler(self, self._onClickButton))
end

function EquipMasterProgressNode:updateView(info, totalLevel, type)
	self._equipId = nil
	if info then
		self._equipId = info.equipId
		self._target:setVisible(true)
		if self._equipId then
			local param = info.equipParam
			local curLevel = info.curLevel
			
			self._fileNodeIcon:unInitUI()
			self._fileNodeIcon:initUI(type, param.cfg.id)
			self._fileNodeIcon:setIconVisible(true)
			self._fileNodeIcon:setTouchEnabled(true)
			self._buttonStrengthen:setEnabled(true)
			self._textName:setString(param.name)
			self._textName:setColor(param.icon_color)

			if param.cfg.color == 7 then
				self._textName:enableOutline(param.icon_color_outline, 2)
			end

			local percent = curLevel / totalLevel * 100
			self._loadingBarProgress:setPercent(percent)
			self._textProgress:setString(curLevel.." / "..totalLevel)
		else
			self._fileNodeIcon:unInitUI()
			self._fileNodeIcon:initUI(TypeConvertHelper.TYPE_EQUIPMENT)
			self._fileNodeIcon:setIconVisible(false)
			self._fileNodeIcon:setImageTemplateVisible(true)
			self._buttonStrengthen:setEnabled(false)
			self._textName:setString(Lang.get("equipment_master_no_wear"))
			self._textName:setColor(Colors.COLOR_MAIN_TEXT)
			self._textName:disableEffect(cc.LabelEffect.OUTLINE)
			self._loadingBarProgress:setPercent(0)
			self._textProgress:setString("")
		end
	else
		self._target:setVisible(false)
	end
end

function EquipMasterProgressNode:_onClickButton()
	if self._equipId == nil then
		return
	end

	local masterType = self._parentView:getSelectTabIndex()
	if masterType == MasterConst.MASTER_TYPE_1 then
		if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1) == false then
			return
		end		
		G_SceneManager:showScene("equipTrain", self._equipId, EquipConst.EQUIP_TRAIN_STRENGTHEN, EquipConst.EQUIP_RANGE_TYPE_2)
	elseif masterType == MasterConst.MASTER_TYPE_2 then
		if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2) == false then
			return
		end	
		G_SceneManager:showScene("equipTrain", self._equipId, EquipConst.EQUIP_TRAIN_REFINE, EquipConst.EQUIP_RANGE_TYPE_2)
	elseif masterType == MasterConst.MASTER_TYPE_3 then
		if TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1) == false then
			return
		end
		G_SceneManager:showScene("treasureTrain", self._equipId, TreasureConst.TREASURE_TRAIN_STRENGTHEN, TreasureConst.TREASURE_RANGE_TYPE_2)
	elseif masterType == MasterConst.MASTER_TYPE_4 then
		if TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2) == false then
			return
		end
		G_SceneManager:showScene("treasureTrain", self._equipId, TreasureConst.TREASURE_TRAIN_REFINE, TreasureConst.TREASURE_RANGE_TYPE_2)
	end
end

return EquipMasterProgressNode