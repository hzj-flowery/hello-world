
-- Author: nieming
-- Date:2018-02-16 15:57:00
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local ResourceBackCell = class("ResourceBackCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
function ResourceBackCell:ctor()

	--csb bind var name
	self._btnBuy1 = nil  --CommonButtonHighLight
	self._btnBuy2 = nil  --CommonButtonHighLight
	self._iconParent1 = nil  --SingleNode
	self._iconParent2 = nil  --SingleNode
	self._item1 = nil  --Panel
	self._item2 = nil  --Panel
	self._resCount1 = nil  --Text
	self._resCount2 = nil  --Text
	self._resIcon1 = nil  --ImageView
	self._resIcon2 = nil  --ImageView
	self._richTipNode1 = nil  --SingleNode
	self._richTipNode2 = nil  --SingleNode
	self._title1 = nil  --Text
	self._title2 = nil  --Text

	local resource = {
		file = Path.getCSB("ResourceBackCell", "activity/resourceBack"),
		-- binding = {
		-- 	_btnBuy1 = {
		-- 		events = {{event = "touch", method = "_onBtnBuy1"}}
		-- 	},
		-- 	_btnBuy2 = {
		-- 		events = {{event = "touch", method = "_onBtnBuy2"}}
		-- 	},
		-- },
	}
	ResourceBackCell.super.ctor(self, resource)
end

function ResourceBackCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._btnBuy1:setString(Lang.get("common_btn_name_confirm"))
	self._btnBuy2:setString(Lang.get("common_btn_name_confirm"))
	self._btnBuy1:addClickEventListenerExDelay(handler(self,self._onBtnBuy1), 100)
	self._btnBuy2:addClickEventListenerExDelay(handler(self,self._onBtnBuy2), 100)
end

function ResourceBackCell:updateUI(data1, data2, isPerfect)
	-- body
	--type 1 =完美找回  2 普通找回
	self._data1 = data1
	self._data2 = data2
	self:_updateSingle(1, data1, isPerfect)
	self:_updateSingle(2, data2, isPerfect)
end

function ResourceBackCell:_updateSingle(index, data, isPerfect)
	if not data then
		self["_item"..index]:setVisible(false)
		return
	end

	local itemParams
	local percent = 1
	if isPerfect then
	 	itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND)
		self["_resCount"..index]:setString(data:getGold())
	else
		itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD)
		self["_resCount"..index]:setString(data:getCoin())
		percent = data:getPercent()
	end
	if itemParams.res_mini then
		self["_resIcon"..index]:loadTexture(itemParams.res_mini)
	end

	self["_item"..index]:setVisible(true)
	self:_updateAwards(self["_iconParent"..index], data:getAwards(), percent)
	local yesterdayValue = data:getValue()
	if yesterdayValue ~= 0 then
		self["_richTipNode"..index]:setVisible(true)
		self:_updateRichTip(self["_richTipNode"..index], yesterdayValue)
	else
		self["_richTipNode"..index]:setVisible(false)
	end
	self["_title"..index]:setString(data:getDescrible())

	if data:isAlreadyBuy() then
		self["_btnBuy"..index]:setString(Lang.get("lang_activity_resource_back_btn_buyed"))
		self["_btnBuy"..index]:setEnabled(false)
		self["_resCount"..index]:setVisible(false)
		self["_resIcon"..index]:setVisible(false)
	else
		self["_btnBuy"..index]:setEnabled(true)
		self["_btnBuy"..index]:setString("")
		self["_resCount"..index]:setVisible(true)
		self["_resIcon"..index]:setVisible(true)
	end
end
-- function ResourceBackCell:_sefResCountCenter(btn, resIcon, countText)
--
-- end
function ResourceBackCell:_updateAwards(parentNode, awards, present)
	parentNode:removeAllChildren()
	local iconWidth = 86
	local curWidth = 0
	for k, v in ipairs(awards) do
		local icon = ComponentIconHelper.createIcon(v.type,v.value,math.floor(present * v.size))
		icon:setTouchEnabled(true)
		icon:setScale(0.8)
		parentNode:addChild(icon)
		icon:setPositionX(curWidth)
		curWidth = curWidth + iconWidth
	end
end

function ResourceBackCell:_updateRichTip(parentNode, num)
	local tipStr = Lang.get("lang_activity_resource_back_not_finish", {num = num})
	local richtext = ccui.RichText:createRichTextByFormatString2(tipStr, Colors.BRIGHT_BG_TWO, 18)
	richtext:setAnchorPoint(0.5, 0.5)

	parentNode:removeAllChildren()
	parentNode:addChild(richtext)
end



-- Describle：
function ResourceBackCell:_onBtnBuy1()
	-- body
	self:dispatchCustomCallback(self._data1)
end
-- Describle：
function ResourceBackCell:_onBtnBuy2()
	-- body
	self:dispatchCustomCallback(self._data2)
end

return ResourceBackCell
