--
-- Author: Liangxu
-- Date: 2017-04-27 19:38:35
--
local RecoveryShopButton = class("RecoveryShopButton")
local DataConst = require("app.const.DataConst")
local RecoveryConst = require("app.const.RecoveryConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function RecoveryShopButton:ctor(target)
	self._target = target
	self._nodeShop = ccui.Helper:seekNodeByName(self._target, "NodeShop")
	cc.bind(self._nodeShop, "CommonMainMenu")
	self._nodeShop:addClickEventListenerEx(handler(self, self._onButtonShopClicked))
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._fileNodeResource = ccui.Helper:seekNodeByName(self._target, "FileNodeResource")
	cc.bind(self._fileNodeResource, "CommonResourceInfo")
end

function RecoveryShopButton:updateView(recoveryType)
	self._recoveryType = recoveryType

	self:_setVisible(true)
	local resType = 0
	local functionId = nil
	if recoveryType == RecoveryConst.RECOVERY_TYPE_1 or recoveryType == RecoveryConst.RECOVERY_TYPE_2 then
		resType = DataConst.RES_SOUL
		functionId = FunctionConst.FUNC_HERO_SHOP
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_3 or recoveryType == RecoveryConst.RECOVERY_TYPE_4 then
		resType = DataConst.RES_JADE
		functionId = FunctionConst.FUNC_EQUIP_SHOP
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_5 or recoveryType == RecoveryConst.RECOVERY_TYPE_6 then
		resType = DataConst.RES_BAOWUZHIHUN
		functionId = FunctionConst.FUNC_INSTRUMENT_SHOP
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_7 or recoveryType == RecoveryConst.RECOVERY_TYPE_8 then
		resType = DataConst.RES_HONOR
		functionId = FunctionConst.FUNC_SIEGE_SHOP
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_9 or recoveryType == RecoveryConst.RECOVERY_TYPE_10 then
		resType = DataConst.RES_PET
		functionId = FunctionConst.FUNC_PET_SHOP
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_11 or recoveryType == RecoveryConst.RECOVERY_TYPE_12 then
		resType = DataConst.RES_HORSE_SOUL
        functionId = FunctionConst.FUNC_HORSE_SHOP
    elseif recoveryType == RecoveryConst.RECOVERY_TYPE_14 then
        resType = DataConst.RES_HORSE_SOUL
        functionId = FunctionConst.FUNC_HORSE_SHOP
	end

	if functionId then
		self._nodeShop:updateUI(functionId)
	end
	
	local name = require("app.config.resource").get(resType).name
	self._textName:setString(name)
	local value = G_UserData:getBase():getResValue(resType)
	dump(value)
	self._fileNodeResource:updateUI(TypeConvertHelper.TYPE_RESOURCE, resType, value)
	self._fileNodeResource:setTextColor(Colors.DARK_BG_THREE)
	self:updateValue()
end

function RecoveryShopButton:updateValue()
	local recoveryType = self._recoveryType
	if recoveryType == RecoveryConst.RECOVERY_TYPE_1 or recoveryType == RecoveryConst.RECOVERY_TYPE_2 then
		self._fileNodeResource:setCount(G_UserData:getBase():getResValue(DataConst.RES_SOUL))
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_3 or recoveryType == RecoveryConst.RECOVERY_TYPE_4 then
		self._fileNodeResource:setCount(G_UserData:getBase():getResValue(DataConst.RES_JADE))
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_5 or recoveryType == RecoveryConst.RECOVERY_TYPE_6 then
		self._fileNodeResource:setCount(G_UserData:getBase():getResValue(DataConst.RES_BAOWUZHIHUN))
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_7 or recoveryType == RecoveryConst.RECOVERY_TYPE_8 then
		self._fileNodeResource:setCount(G_UserData:getBase():getResValue(DataConst.RES_HONOR))
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_9 or recoveryType == RecoveryConst.RECOVERY_TYPE_10 then
		self._fileNodeResource:setCount(G_UserData:getBase():getResValue(DataConst.RES_PET))
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_11 or recoveryType == RecoveryConst.RECOVERY_TYPE_12 then
        self._fileNodeResource:setCount(G_UserData:getBase():getResValue(DataConst.RES_HORSE_SOUL))
    elseif recoveryType == RecoveryConst.RECOVERY_TYPE_14 then
        self._fileNodeResource:setCount(G_UserData:getBase():getResValue(DataConst.RES_HORSE_SOUL))
	end
	self._fileNodeResource:setTextColor(Colors.DARK_BG_THREE)
end

function RecoveryShopButton:_onButtonShopClicked()
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	local recoveryType = self._recoveryType
	if recoveryType == RecoveryConst.RECOVERY_TYPE_1 or recoveryType == RecoveryConst.RECOVERY_TYPE_2 then
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HERO_SHOP)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_3 or recoveryType == RecoveryConst.RECOVERY_TYPE_4 then
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_EQUIP_SHOP)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_5 or recoveryType == RecoveryConst.RECOVERY_TYPE_6 then
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_INSTRUMENT_SHOP)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_7 or recoveryType == RecoveryConst.RECOVERY_TYPE_8 then
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_SIEGE_SHOP)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_9 or recoveryType == RecoveryConst.RECOVERY_TYPE_10 then
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_PET_SHOP)
	elseif recoveryType == RecoveryConst.RECOVERY_TYPE_11 or recoveryType == RecoveryConst.RECOVERY_TYPE_12 then
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HORSE_SHOP)
    elseif recoveryType == RecoveryConst.RECOVERY_TYPE_14 then
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HORSE_SHOP)
	end
end

function RecoveryShopButton:_setVisible(visible)
	if visible == nil then
		visible = false
	end
	self._target:setVisible(visible)
end

return RecoveryShopButton