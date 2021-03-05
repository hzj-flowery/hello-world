--
-- Author: Liangxu
-- Date: 2017-11-1 15:28:05
-- 通用空置控件
local CommonEmptyTipNode = class("CommonEmptyTipNode")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local FunctionConst = require("app.const.FunctionConst")

--空置类型对应参数
local TYPE2PARAM = {
	[1] = {str = "common_empty_tip_1", funcId = FunctionConst.FUNC_HERO_SHOP}, 	--武将列表空置
	[2] = {str = "common_empty_tip_2", funcId = FunctionConst.FUNC_HERO_SHOP}, 	--武将碎片列表空置
	[3] = {str = "common_empty_tip_3", funcId = FunctionConst.FUNC_EQUIP_SHOP}, 	--装备列表空置
	[4] = {str = "common_empty_tip_4", funcId = FunctionConst.FUNC_EQUIP_SHOP}, 	--装备碎片列表空置
	[5] = {str = "common_empty_tip_5", funcId = FunctionConst.FUNC_INSTRUMENT_SHOP}, 	--宝物列表空置
	[6] = {str = "common_empty_tip_6", funcId = FunctionConst.FUNC_INSTRUMENT_SHOP}, 	--宝物碎片列表空置
	[7] = {str = "common_empty_tip_7", funcId = FunctionConst.FUNC_SIEGE_SHOP}, 	--神兵列表空置
	[8] = {str = "common_empty_tip_8", funcId = FunctionConst.FUNC_SIEGE_SHOP}, 	--神兵碎片列表空置
	[9] = {str = "common_empty_tip_9", funcId = FunctionConst.FUNC_SIEGE_SHOP}, 	--神兵碎片列表空置
	[10] = {str = "common_empty_tip_10", funcId = FunctionConst.FUNC_PET_SHOP}, 	--神兽碎片列表空置
	[11] = {str = "common_empty_tip_11", funcId = FunctionConst.FUNC_HORSE_SHOP}, 	--战马列表空置
	[12] = {str = "common_empty_tip_12", funcId = FunctionConst.FUNC_HORSE_SHOP}, 	--战马碎片列表空置
	[13] = {str = "common_empty_tip_13", funcId = FunctionConst.FUNC_ARMY_GROUP}, 	--战马碎片列表空置
	[14] = {str = "common_empty_tip_14", funcId = FunctionConst.FUNC_HISTORY_HERO}, 	--名将列表空置
	[15] = {str = "common_empty_tip_15", funcId = FunctionConst.FUNC_HISTORY_HERO}, 	--名将碎片列表空置
	[16] = {str = "common_empty_tip_16", funcId = FunctionConst.FUNC_HISTORY_WEAPONPIECE_LIST}, 	--武器列表空置
    [17] = {str = "common_empty_tip_17", funcId = FunctionConst.FUNC_HISTORY_HERO}, 	--武器碎片列表空置
    [18] = {str = "common_empty_tip_18", funcId = FunctionConst.FUNC_HORSE_SHOP},   --战马装备列表空置
	[19] = {str = "common_empty_tip_19", funcId = FunctionConst.FUNC_HORSE_SHOP},    --战马装备碎片列表空置
	[25] = {str = "common_empty_tip_20", funcId = FunctionConst.FUNC_TACTICS},    --战马装备碎片列表空置
}

local EXPORTED_METHODS = {
    "updateView",
	"setTipsString",
	"setButtonGetVisible",
	"setButtonString"
}

function CommonEmptyTipNode:setButtonString(str)
	self._buttonGet:setString(str)
end

function CommonEmptyTipNode:ctor()
	self._target = nil
	self._type = nil
end

function CommonEmptyTipNode:_init()
	self._image = ccui.Helper:seekNodeByName(self._target, "Image")
	-- if G_ConfigManager:isDalanVersion() then 
	-- 	self._image:setVisible(false)
	-- end
	self._image:setVisible(false)
	self._textTip = ccui.Helper:seekNodeByName(self._target, "TextTip")
	self._buttonGet = ccui.Helper:seekNodeByName(self._target, "ButtonGet")
	if self._buttonGet then
		cc.bind(self._buttonGet, "CommonButtonLevel0Normal")
		self._buttonGet:setString(Lang.get("common_to_get_btn"))
		self._buttonGet:addClickEventListenerEx(handler(self, self._onButtonClick))
	end	

end

function CommonEmptyTipNode:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonEmptyTipNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonEmptyTipNode:_onButtonClick()
	local param = TYPE2PARAM[self._type]
	WayFuncDataHelper.gotoModuleByFuncId(param.funcId)
end

function CommonEmptyTipNode:updateView(type)
	self._type = type
	local param = TYPE2PARAM[type]
	assert(param, string.format("CommonEmptyTipNode have not type = %d", type))
	self._textTip:setString(Lang.get(param.str))
end

function CommonEmptyTipNode:setTipsString(str)
	if str then
		self._textTip:setString(str)
	end
end

function CommonEmptyTipNode:setButtonGetVisible(isVisible)
	self._buttonGet:setVisible(isVisible)
end


return CommonEmptyTipNode
