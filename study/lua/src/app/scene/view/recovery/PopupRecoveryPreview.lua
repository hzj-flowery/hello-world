--
-- Author: Liangxu
-- Date: 2017-04-28 14:53:30
-- 回收预览弹框
local PopupBase = require("app.ui.PopupBase")
local PopupRecoveryPreview = class("PopupRecoveryPreview", PopupBase)
local RecoveryPreviewCell = require("app.scene.view.recovery.RecoveryPreviewCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local RecoveryConst = require("app.const.RecoveryConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")

function PopupRecoveryPreview:ctor(datas, recoveryType, onClickOk)
	self._datas = datas
	self._recoveryType = recoveryType
	self._onClickOk = onClickOk

	local resource = {
		file = Path.getCSB("PopupRecoveryPreview", "recovery"),
		binding = {
			_buttonCancel = {
				events = {{event = "touch", method = "_onButtonCancel"}}
			},
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOk"}}
			},
		}
	}
	self:setName("PopupRecoveryPreview")
	PopupRecoveryPreview.super.ctor(self, resource)
end

function PopupRecoveryPreview:onCreate()
	self._panelBg:addCloseEventListener(handler(self, self._onButtonClose))

	local recoveryType = self._recoveryType
	self._panelBg:setTitle(Lang.get("recovery_preview_title_"..recoveryType))
	self._textTip:setString(Lang.get("recovery_preview_tip_"..recoveryType))

	self._buttonCancel:setString(Lang.get("recovery_btn_cancel"))
	self._buttonOk:setString(Lang.get("recovery_btn_ok"))

	self._previewData = {}
	local isShowCost = false
	if recoveryType == RecoveryConst.RECOVERY_TYPE_1 then
		self._previewData = UserDataHelper.getHeroRecoveryPreviewInfo(self._datas)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_2 then
		self._previewData = UserDataHelper.getHeroRebornPreviewInfo(self._datas)
		isShowCost = true
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_3 then
		self._previewData = UserDataHelper.getEquipRecoveryPreviewInfo(self._datas)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_4 then
		self._previewData = UserDataHelper.getEquipRebornPreviewInfo(self._datas)
		isShowCost = true
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_5 then
		self._previewData = UserDataHelper.getTreasureRecoveryPreviewInfo(self._datas)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_6 then
		self._previewData = UserDataHelper.getTreasureRebornPreviewInfo(self._datas)
		isShowCost = true
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_7 then
		self._previewData = UserDataHelper.getInstrumentRecoveryPreviewInfo(self._datas)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_8 then
		self._previewData = UserDataHelper.getInstrumentRebornPreviewInfo(self._datas)
		isShowCost = true
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_9 then
		self._previewData = UserDataHelper.getPetRecoveryPreviewInfo(self._datas)
		isShowCost = false
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_10 then
		self._previewData = UserDataHelper.getPetRebornPreviewInfo(self._datas)
		isShowCost = true
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_11 then
		self._previewData = HorseDataHelper.getHorseRecoveryPreviewInfo(self._datas)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_12 then
		self._previewData = HorseDataHelper.getHorseRebornPreviewInfo(self._datas)
		isShowCost = true
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_13 then
		self._previewData = UserDataHelper.getHistoricalHeroRebornPreviewInfo(self._datas)
		isShowCost = true
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_14 then
		self._previewData = HorseEquipDataHelper.getHorseEquipRecoveryPreviewInfo(self._datas)
		isShowCost = false
	end

	self._count = math.ceil(#self._previewData / 4)
	if self._count>2 then
		local offset = 60
		local sz = self._listView:getContentSize()
		self._listView:setContentSize(cc.size(sz.width, sz.height-offset))
		local pos = cc.p(self._listView:getPosition())
		self._listView:setPosition(cc.p(pos.x, pos.y+offset))
	end
	self._listView:setTemplate(RecoveryPreviewCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)

	if isShowCost then
		self._fileNodeCost:showResName(true, Lang.get("reborn_cost_title"))
		local costCount = RecoveryDataHelper.getRebornCostCount()
		self._fileNodeCost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount)
		self._fileNodeCost:setVisible(true)
	else
		self._fileNodeCost:setVisible(false)
	end
end

function PopupRecoveryPreview:onEnter()
	
    --抛出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PopupRecoveryPreview:onExit()
	
end

function PopupRecoveryPreview:_onItemUpdate(item, index)
	local index = index * 4
	local data1 = self._previewData[index + 1]
	local data2 = self._previewData[index + 2]
	local data3 = self._previewData[index + 3]
	local data4 = self._previewData[index + 4]

	item:update(data1, data2, data3, data4)
end

function PopupRecoveryPreview:_onItemSelected(item, index)
	
end

function PopupRecoveryPreview:_onItemTouch(index, t)
	
end

function PopupRecoveryPreview:_onButtonCancel()
	self:close()
end

function PopupRecoveryPreview:_onButtonOk()
	if self._onClickOk then
		self._onClickOk()
	end

	self:close()
end

function PopupRecoveryPreview:_onButtonClose()
	self:close()
end

return PopupRecoveryPreview