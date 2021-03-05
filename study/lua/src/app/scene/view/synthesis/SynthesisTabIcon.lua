-- @Author: hyl
-- @Date:2019-6-20
-- @Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SynthesisTabIcon = class("SynthesisTabIcon", ListViewCellBase)
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function SynthesisTabIcon:ctor(clickCallBack)
	self._imageTop = nil
	self._imageBottom = nil
	self._resourcePanel = nil
	self._clickCallBack = clickCallBack

	local resource = {
		file = Path.getCSB("RecoveryTableItem", "recovery")
	}
	SynthesisTabIcon.super.ctor(self, resource)
end

function SynthesisTabIcon:onCreate()
	local size = self._resourcePanel:getContentSize()
	self:setContentSize(size.width, size.height)
end

function SynthesisTabIcon:onEnter()
end

function SynthesisTabIcon:onExit()
end

function SynthesisTabIcon:showRedPoint(bShow)
	self["_nodeTabIcon"]:showRedPoint(bShow)
end

function SynthesisTabIcon:setSelected(bSelect)
	self["_nodeTabIcon"]:setSelected(bSelect)
end

function SynthesisTabIcon:updateUI(index, value,lastIndex)
    --print("index "..index)
    --print("lastIndex "..lastIndex)
	self._imageTop:setVisible(index == 1)
	self._imageBottom:setVisible(index == lastIndex)
	self._imageLink:setVisible(not (index == lastIndex) )

	local size = self._resourcePanel:getContentSize()
	if index == 1 then
		size.height = self._imageTop:getPositionY()
	end

	if index == lastIndex  then
		self._resourcePanel:setPositionY(math.abs(self._imageBottom:getPositionY()))
		self:setContentSize(size.width, size.height + math.abs(self._imageBottom:getPositionY()))
	else
		self._resourcePanel:setPositionY(math.abs(self._imageLink:getPositionY())-6)
		self:setContentSize(size.width, size.height + math.abs(self._imageLink:getPositionY()) -6)
	end

	local function clickItem(value)
		if self._clickCallBack then
			self._clickCallBack(value)
		end
	end

	local txt = Lang.get("synthesis_type" .. value)
	local isOpen = true --LogicCheckHelper.funcIsOpened(FunctionConst[self._funcConstPre .. value])
	self["_nodeTabIcon"]:updateUI(txt, isOpen, value)
	self["_nodeTabIcon"]:setCallback(clickItem)
end

return SynthesisTabIcon
