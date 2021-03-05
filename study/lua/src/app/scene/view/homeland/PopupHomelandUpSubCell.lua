
-- Author: hedili
-- Date:2018-05-02 15:59:47
-- Describle：子树cell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupHomelandUpSubCell = class("PopupHomelandUpSubCell", ListViewCellBase)
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

local OFFSET_MID = 120

function PopupHomelandUpSubCell:ctor()

	--csb bind var name
	local resource = {
		file = Path.getCSB("PopupHomelandUpSubCell", "homeland"),

	}
	PopupHomelandUpSubCell.super.ctor(self, resource)
	self._moveTimes = 0
end

function PopupHomelandUpSubCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	for i =1 , 5 do 
		local panelAttr = self:getSubNodeByName("FileNode_attr"..i)
		panelAttr:setVisible(false)
	end


end

function PopupHomelandUpSubCell:updateUI()
	-- body
end


function PopupHomelandUpSubCell:updateUI(cfgData, cfgDataNext)
	self._cfgData = cfgData


	--更新树名称
	local treeData = {
		treeLevel = cfgData.level,
		treeId = cfgData.type
	}
	local Node_treeTitle = self:getSubNodeByName("Node_treeTitle")
	HomelandHelp.updateNodeTreeTitle(self, treeData)


	self:updateImageView("Image_tree", {texture = Path.getHomelandUI(cfgData.detail_draw)})

	local color = Colors.LIST_TEXT
	if isCurrent == false then
		color = Colors.BRIGHT_BG_GREEN
	end

	--local levelStr = Lang.get("homeland_sub_tree_level"..cfgData.level)
	--local textLevel = self:updateLabel("Text_level", {
	--	text = "( "..levelStr.." )",
	--	color = color
	--})
	--textLevel:setPositionX(textName:getPositionX() + textName:getContentSize().width + 10 )
	
	local valueList = self:getValueList(cfgData)
	for index, value in ipairs(valueList) do
		self:_updateAttr(index, value.name, value.value )
	end
	
	if cfgDataNext then
		local nextValueList = HomelandHelp.getSubLevelAttrList(cfgDataNext.type, cfgDataNext.level)
		for index, value in ipairs(nextValueList) do
			self:_updateNodeNext(index, "+"..value.value )
		end
	else

	end

end

function PopupHomelandUpSubCell:getValueList( cfgData )
	-- body

	local retList = {}
	for i= 1, cfgData.level do
		local valueList = HomelandHelp.getSubLevelAttrList(cfgData.type, i)
		for i, value in ipairs(valueList) do
			local data = retList[i] or {name = "", value = 0}
			data.value = data.value + value.value
			data.name = value.name
			retList[i] = data
		end
	end

	return retList
end

function PopupHomelandUpSubCell:_updateAttr(index, name, value)
	local panelAttr = self:getSubNodeByName("FileNode_attr"..index)
	if panelAttr == nil then
		return
	end
	panelAttr:setVisible(true)
	panelAttr:updateLabel("Text_name",   {text =  name})
	panelAttr:updateLabel("Text_value",  {text =  value, color = Colors.NUMBER_WHITE})

	local Node_next = panelAttr:getSubNodeByName("Node_next")
	Node_next:setVisible(false)
end


function PopupHomelandUpSubCell:_updateNodeNext(index, diff )
	-- body
	local panelAttr = self:getSubNodeByName("FileNode_attr"..index)
	if panelAttr == nil then
		return
	end
	panelAttr:setVisible(true)
	local Text_value = panelAttr:getSubNodeByName("Text_value")
	local Node_next = panelAttr:getSubNodeByName("Node_next")
	Node_next:setVisible(true)
	local TextAddValue = Node_next:getSubNodeByName("TextAddValue")
	TextAddValue:setString(diff)
	TextAddValue:setColor(Colors.NUMBER_GREEN)
end


function PopupHomelandUpSubCell:moveAttrToMid( ... )
	-- body
	if self._moveTimes == 0 then
		for i =1 , 5 do 
			local panelAttr = self:getSubNodeByName("FileNode_attr"..i)
			panelAttr:setPositionX(panelAttr:getPositionX() + OFFSET_MID )
		end
		self._moveTimes = self._moveTimes  + 1 
	end
	
end

return PopupHomelandUpSubCell