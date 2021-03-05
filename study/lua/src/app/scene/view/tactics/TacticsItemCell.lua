--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法界面-列表项
local ListViewCellBase = require("app.ui.ListViewCellBase")
local TacticsItemCell = class("TacticsItemCell", ListViewCellBase)
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local CommonTacticsIcon = require("app.ui.component.CommonTacticsIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local ShaderHalper = require("app.utils.ShaderHelper")
local TacticsItem = require("app.scene.view.tactics.TacticsItem")


function TacticsItemCell:ctor()
	self._resourceNode = nil 	-- 容器

	local resource = {
		file = Path.getCSB("TacticsItemCell", "tactics"),
	}

	TacticsItemCell.super.ctor(self, resource)
end


function TacticsItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)
    local colNum = TacticsConst.UI_LIST_COL_NUM
    for i=1,colNum do
        local node = self["_nodeItem"..i]
        self["_fileItem"..i] = TacticsItem.new(node)
        self["_fileItem"..i]:setCallback(handler(self, self._onItemClick))
    end
end

-- 更新图标和其他ui
function TacticsItemCell:updateUI(unitList, index, clickCallback)
    self._index = index
    self._clickCallback = clickCallback
    local colNum = TacticsConst.UI_LIST_COL_NUM
    for i=1,colNum do
        local t = index*colNum+i
        local unitData = unitList[t]
        local item = self["_fileItem"..i]
        if unitData then
            item:updateUI(unitData, index, i)
            item:setVisible(true)
        else
            item:setVisible(false)
        end
    end
end

function TacticsItemCell:_onItemClick(index)
    self._clickCallback(self._index, index)
end

function TacticsItemCell:updateSelectState(index)
    local colNum = TacticsConst.UI_LIST_COL_NUM
    local selItem = nil
    for i=1,colNum do
        local t = self._index*colNum+i
        local isSel = t==index
        local item = self["_fileItem"..i]
        item:setSelected(isSel)
        if isSel then
            selItem = item
        end
    end
    return selItem
end

return TacticsItemCell
