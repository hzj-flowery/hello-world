-- @Author: Panhoa
-- @Date:2019-1-22
-- @Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local RecoveryTableItem = class("RecoveryTableItem", ListViewCellBase)
local LogicCheckHelper = require("app.utils.LogicCheckHelper")


function RecoveryTableItem:ctor(clickCallBack)
	self._imageTop = nil
	self._imageBottom = nil
	self._resourcePanel = nil
	self._clickCallBack = clickCallBack

	local resource = {
		file = Path.getCSB("RecoveryTableItem", "recovery"),

	}
	RecoveryTableItem.super.ctor(self, resource)
end

function RecoveryTableItem:onCreate()
	local size = self._resourcePanel:getContentSize()
	self:setContentSize(size.width, size.height)
	self._resourcePanel:setVisible(false)
end

function RecoveryTableItem:onEnter()

end

function RecoveryTableItem:onExit()
end

function RecoveryTableItem:_updateState(bLast)
	self._resourcePanel:setVisible(true)
	self._nodeTabIcon:setVisible(not bLast)
	self._imageTop:setVisible(not bLast)
	self._imageBottom:setVisible(bLast)
end

function RecoveryTableItem:showRedPoint(bShow)
	self["_nodeTabIcon"]:showRedPoint(bShow)
end

function RecoveryTableItem:setSelected(bSelect)
	self["_nodeTabIcon"]:setSelected(bSelect)
end

function RecoveryTableItem:updateUI(bLast, index, value)
	self:_updateState(bLast)
	if bLast then return end

	local function clickItem(value)
		if self._clickCallBack then
			self._clickCallBack(value)
		end
	end

	local txt = Lang.get("recovery_tab_title_"..value)
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_RECOVERY_TYPE"..value])
	self["_nodeTabIcon"]:updateUI(txt, isOpen, value)
	self["_nodeTabIcon"]:setCallback(clickItem)
end


return RecoveryTableItem