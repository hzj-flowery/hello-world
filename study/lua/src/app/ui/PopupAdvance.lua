--弹出界面
--进阶界面
local PopupBase = require("app.ui.PopupBase")
local PopupAdvance = class("PopupAdvance", PopupBase)
local Path = require("app.utils.Path")
local UIHelper  = require("yoka.utils.UIHelper")
local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")



local LINE_ITEM_COUNT = 5 --一行5个ICON
local LINE_HEIGHT = 130
local LINE_ITEM_BLACK = 3 -- 物品横排间隔

function PopupAdvance:ctor()
	self._listView  = nil
	--
	local resource = {
		file = Path.getCSB("PopupAdvance", "common"),
	}
	PopupAdvance.super.ctor(self, resource, true)
end


function PopupAdvance:_createLineAttr()
	local rootWidget = ccui.Widget:create()
	local listSize = self._listView:getContentSize()
	
	local advanceAttr =  CSHelper.loadResourceNode(Path.getCSB("CommonAdvacneAttr", "common"))
	local advanceRoot = ccui.Helper:seekNodeByName(advanceAttr, "Panel_root")
	local advanceSize = advanceRoot:getContentSize()
	rootWidget:setContentSize(advanceSize)
	rootWidget:addChild(advanceAttr)
	UIHelper.setPosByPercent(advanceAttr,cc.p(0.5,0.5))

	return rootWidget
end


function PopupAdvance:setHeroName(oldName, newName)

end


function PopupAdvance:updateUI(params)

	for i, value in ipairs(params) do
		if checktable(value) then
			local widget = self:_createLineAttr()
			self._listView:pushBackCustomItem(widget)
			self:_setAttrLine(widget, value.desc, value.oldValue, value.newValue)
		end
	end

	self._listView:adaptWithContainerSize()
end



function PopupAdvance:addAttr( desc, oldValue, newValue)
	local widget = self:_createLineAttr()

	self._listView:pushBackCustomItem(widget)

	self:_setAttrLine(widget, desc, oldValue, newValue)

	self._listView:adaptWithContainerSize()
end



function PopupAdvance:updateAttr(index, desc, oldValue, newValue)
	local itemIndex = index - 1
	
	local widget = self._listView:getItem(itemIndex)
	assert(widget, "listview get wiget is nil itemIndex: "..itemIndex)

	self:_setAttrLine(widget, desc, oldValue, newValue)

	self._listView:adaptWithContainerSize()
end


function PopupAdvance:_setAttrLine(attrWidget, desc, oldValue, newValue)

	local addValue = newValue - oldValue

	attrWidget:updateLabel("Text_desc", desc..": ")

	attrWidget:updateLabel("Text_value", oldValue)

	attrWidget:updateLabel("Text_up_value", newValue)

	attrWidget:updateLabel("Text_add_value", addValue)


	local arrow = attrWidget:getSubNodeByName("Image_arrow")
	if arrow then
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playFloatEffect(arrow)
	end
end
--

function PopupAdvance:onCreate()
	-- button
	self._listView:setVisible(true)
end


function PopupAdvance:onEnter()
    
end

function PopupAdvance:onExit()
    
end

return PopupAdvance