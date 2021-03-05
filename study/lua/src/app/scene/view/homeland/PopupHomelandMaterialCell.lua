
-- Author: hedili
-- Date:2018-05-08 14:00:07
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupHomelandMaterialCell = class("PopupHomelandMaterialCell", ListViewCellBase)
local PopupHomelandMaterialCellLine = import(".PopupHomelandMaterialCellLine")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

function PopupHomelandMaterialCell:ctor(data)

	--csb bind var name
	self._scrollReward	 = nil  --
	self._imageBk = nil  --
	self._textTreeName = nil  --Text
	self._data = data

	local resource = {
		file = Path.getCSB("PopupHomelandMaterialCell", "homeland"),
		binding = {

		},
	}
	PopupHomelandMaterialCell.super.ctor(self, resource)
end

function PopupHomelandMaterialCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self:_updateData()


	self._imageTitle:setVisible(true)
	--self._imageTitle:setPositionY(182)
end



function PopupHomelandMaterialCell:_updateData( ... )
	-- body
	if  self._data == nil then
		return
	end
	self._lineList:removeAllChildren()
	local treeLevel = self._data.id
	if treeLevel == nil or treeLevel == 0 then
		treeLevel = 1
	end
	local mainTreeData = HomelandHelp.getMainTreeCfg({treeLevel = treeLevel})
	local treeName = mainTreeData.name..Lang.get("homeland_main_tree_level"..treeLevel)

	dump(treeName)
	self._textTreeName:setString(treeName)
	self._textTreeName:setColor(Colors.getHomelandColor(treeLevel))
	self._textTreeName:enableOutline(Colors.getHomelandOutline(treeLevel), 1)
	self._textTreeName:setVisible(true)

	local info = HomelandHelp.getTreeInfoConfig(treeLevel)
	local strPrayCount = ""
	local UserCheck = require("app.utils.logic.UserCheck")
	if UserCheck.enoughLevel(info.breaktext_level) then
		strPrayCount = info.breaktext
	end
	self._textPrayCount:setString(strPrayCount)

	for i, value in ipairs(self._data.list) do
		local itemLine = PopupHomelandMaterialCellLine.new(value) 
		self._lineList:pushBackCustomItem(itemLine)
	end

	self._lineList:doLayout()
	local containSize = self._lineList:getInnerContainerSize()
	self._lineList:setContentSize(containSize)

	local srcSize = self._resourceNode:getContentSize()
	local changeSize = cc.size(srcSize.width, containSize.height + 44	)


	self._resourceNode:setContentSize(changeSize)
	self._imageBk:setContentSize(changeSize)
	self._imageBk2:setContentSize(changeSize)
	self:setContentSize(changeSize)

	self._imageTitle:setVisible(true)
	self._imageTitle:setAnchorPoint(cc.p(0,0))
	self._imageTitle:setPositionY(changeSize.height - 46)
end

return PopupHomelandMaterialCell