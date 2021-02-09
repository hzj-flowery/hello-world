-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local DailySigninItemCell = class("DailySigninItemCell", ListViewCellBase)
local DailySigninItemNode = import(".DailySigninItemNode")

DailySigninItemCell.LINE_ITEM_NUM = 7 

function DailySigninItemCell:ctor()
	self._resourceNode = nil--根节点
    self._itemNodeList = {}
	local resource = {
		file = Path.getCSB("DailySigninItemCell", "activity/dailysignin"),
	}
	DailySigninItemCell.super.ctor(self, resource)
end

function DailySigninItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
    local nodeList = self._resourceNode:getChildren()
    for k,v in ipairs(nodeList) do
        local dailySigninItemNode = DailySigninItemNode.new()
        dailySigninItemNode:setCallBack(handler(self,self._onItemClick))
        v:addChild(dailySigninItemNode)
        dailySigninItemNode:setVisible(false)
        self._itemNodeList[k] = dailySigninItemNode
    end
end

--@index:
function DailySigninItemCell:updateUI(index, itemLine)
    local startIndex = index * DailySigninItemCell.LINE_ITEM_NUM  + 1
    for k,v in ipairs(self._itemNodeList) do
        if itemLine[k] then
            v:setVisible(true)  
            v:updateInfo(itemLine[k])
            v:setTag(startIndex + k -1)
        else
            v:setVisible(false)  
        end
    end

end

function DailySigninItemCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("DailySigninItemCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end

function DailySigninItemCell:getItemNodeByIndex(index)
   return self._itemNodeList[index]
end

return DailySigninItemCell