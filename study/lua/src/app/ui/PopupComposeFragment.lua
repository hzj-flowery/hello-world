-- Author: liangxu
-- Date:2017-10-19 13:39:44
-- Describle：合成碎片弹框

local PopupBase = require("app.ui.PopupBase")
local PopupComposeFragment = class("PopupComposeFragment", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

function PopupComposeFragment:ctor(parentView, fragmentId, callback)
	self._nodeBg = nil
	self._itemIcon = nil
	self._textName = nil
	self._fileNodeFrag = nil
	self._fileNodeAttr1 = nil
	self._fileNodeAttr2 = nil
	self._fileNodeAttr3 = nil
	self._fileNodeAttr4 = nil

	self._parentView = parentView
	self._fragmentId = fragmentId
	self._callback = callback

	local resource = {
		file = Path.getCSB("PopupComposeFragment", "common"),
		binding = {
			_btnCompose = {
				events = {{event = "touch", method = "_onBtnCompose"}}
			},
		},
	}
	PopupComposeFragment.super.ctor(self, resource)
end

function PopupComposeFragment:onCreate()
	self._nodeBg:setTitle(Lang.get("common_compose_prop_title"))
	self._fileNodeFrag:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._fileNodeFrag:setFontSize(22)
	self._btnCompose:setString(Lang.get("common_compose_prop_btn"))
	for i = 1, 4 do
		self["_fileNodeAttr"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
		self["_fileNodeAttr"..i]:setFontSize(22)
	end

	self._nodeBg:addCloseEventListener( function () self:closeWithAction() end )
end

function PopupComposeFragment:_updateView()
	local fragmentInfo = require("app.config.fragment").get(self._fragmentId)
	assert(fragmentInfo, string.format("fragment config can not find id = %d", self._fragmentId))
	local compType = fragmentInfo.comp_type
	local compValue = fragmentInfo.comp_value
	self._itemIcon:initUI(compType, compValue)
	self._itemIcon:setTouchEnabled(false)
	self._itemIcon:setImageTemplateVisible(true)

	local itemParams = self._itemIcon:getItemParams()
	self._textName:setString(itemParams.name)
	self._textName:setColor(itemParams.icon_color)
	-- self._textName:enableOutline(itemParams.icon_color_outline, 2)
	local count = G_UserData:getFragments():getFragNumByID(self._fragmentId)
	self._fileNodeFrag:updateUI(Lang.get("common_compose_fragment"), count, fragmentInfo.fragment_num)

	local attrInfo = {}
	if compType == TypeConvertHelper.TYPE_GEMSTONE then
		attrInfo = UserDataHelper.getGemstoneAttr(compValue)
	end
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

function PopupComposeFragment:onEnter()
	self._signalMerageItemMsg = G_SignalManager:add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(self, self._onSyntheticFragments))
	self:_updateView()
end

function PopupComposeFragment:onExit()
	self._signalMerageItemMsg:remove()
	self._signalMerageItemMsg = nil
end

function PopupComposeFragment:_onBtnCompose()
	G_UserData:getFragments():c2sSyntheticFragments(self._fragmentId, 1) --合成1个
end

function PopupComposeFragment:_onSyntheticFragments()
	if self._callback then
		self._callback()
	end
	self:close()
end

return PopupComposeFragment
