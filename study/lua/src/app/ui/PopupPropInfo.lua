
-- Author: liangxu
-- Date:2017-10-19 13:40:48
-- Describle：道具信息弹框

local PopupBase = require("app.ui.PopupBase")
local PopupPropInfo = class("PopupPropInfo", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")
local UserDataHelper = require("app.utils.UserDataHelper")


function PopupPropInfo:ctor(id, isFragment)
	self._textName = nil  --Text
	self._itemIcon = nil  --CommonIconTemplate
	self._fileNodeOwn = nil  --CommonDesValue
	self._nodeBg = nil  --CommonNormalSmallPop
	self._fileNodeAttr2 = nil  --CommonDesValue
	self._fileNodeAttr3 = nil  --CommonDesValue
	self._fileNodeAttr1 = nil  --CommonDesValue
	self._btnOk = nil  --CommonButtonHighLight
	self._fileNodeAttr4 = nil  --CommonDesValue

	self._isFragment = isFragment -- 是否是碎片
	self._id = id



	local resource = {
		file = Path.getCSB("PopupPropInfo", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "_onBtnOk"}}
			},
		},
	}
	PopupPropInfo.super.ctor(self, resource)
end

-- Describle：
function PopupPropInfo:onCreate()
	self._callback = nil --点击按钮回调
	self._nodeBg:setTitle(Lang.get("hero_awake_prop_title"))
	self._btnOk:setString(Lang.get("common_btn_name_confirm"))
	self._fileNodeOwn:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._fileNodeOwn:setFontSize(22)
	for i = 1, 4 do
		self["_fileNodeAttr"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)

		self["_fileNodeAttr"..i]:setFontSize(22)
	end
    self:_initUI()
    self._nodeBg:setCloseVisible(false)
end

function PopupPropInfo:_initUI()
	local attrInfo,param
	if self._isFragment then
		local Fragment = require("app.config.fragment")
		local fragmentData = Fragment.get(self._id)
		attrInfo = UserDataHelper.getGemstoneAttr(fragmentData.comp_value)
		param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_GEMSTONE, fragmentData.comp_value)
		self._itemIcon:initUI(TypeConvertHelper.TYPE_FRAGMENT, self._id)
		local count = G_UserData:getFragments():getFragNumByID(self._id)
		self._fileNodeOwn:updateUI(Lang.get("hero_awake_prop_own_des"), count, fragmentData.fragment_num)
	else
		local unitData = G_UserData:getGemstone():getUnitDataWithId(self._id)
		local count = 0
		if unitData then
			count = unitData:getNum()
		end
		self._fileNodeOwn:updateUI(Lang.get("hero_awake_prop_own_des"), count)

		attrInfo = UserDataHelper.getGemstoneAttr(self._id)
		param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_GEMSTONE, self._id)
		self._itemIcon:initUI(TypeConvertHelper.TYPE_GEMSTONE, self._id)

	end
	self._itemIcon:setTouchEnabled(false)
	self._itemIcon:setImageTemplateVisible(true)

	local itemParams = self._itemIcon:getItemParams()
	self._textName:setString(itemParams.name)
	self._textName:setColor(itemParams.icon_color)
	-- self._textName:enableOutline(itemParams.icon_color_outline, 2)

	local desInfo = TextHelper.getAttrInfoBySort(attrInfo)
	for i = 1, 4 do
		local one = desInfo[i]
		if one then
			local attrName, attrValue = TextHelper.getAttrBasicText(one.id, one.value)
			self["_fileNodeAttr"..i]:updateUI(attrName, "+"..attrValue)
			self["_fileNodeAttr"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
			self["_fileNodeAttr"..i]:setVisible(true)
		else
			self["_fileNodeAttr"..i]:setVisible(false)
		end
	end
end

function PopupPropInfo:setCallback(callback)
	self._callback = callback
end

function PopupPropInfo:setBtnDes(btnDes)
	self._btnOk:setString(btnDes)
end

function PopupPropInfo:_onBtnOk()
	if self._callback then
		self._callback()
	end
	self:close()
end

return PopupPropInfo
