-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildAllRedPacketItemCell = class("GuildAllRedPacketItemCell", ListViewCellBase)
local GuildAllRedPacketItemNode = import(".GuildAllRedPacketItemNode")

GuildAllRedPacketItemCell.LINE_ITEM_NUM = 3 

function GuildAllRedPacketItemCell:ctor()
	self._resourceNode = nil--根节点
    self._itemNodeList = {}
	local resource = {
		file = Path.getCSB("GuildAllRedPacketItemCell", "guild"),
	}
	GuildAllRedPacketItemCell.super.ctor(self, resource)
end

function GuildAllRedPacketItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
    local nodeList = self._resourceNode:getChildren()
    for k,v in ipairs(nodeList) do
        local node = GuildAllRedPacketItemNode.new()
        node:setCallBack(handler(self,self._onItemClick))
        v:addChild(node)
        node:setVisible(false)
        self._itemNodeList[k] = node
    end
end


function GuildAllRedPacketItemCell:update(index, dataList)
    local startIndex = index * GuildAllRedPacketItemCell.LINE_ITEM_NUM + 1
    for k,v in ipairs(self._itemNodeList) do
        local realIndex = startIndex + k -1
        if dataList[realIndex] then
            v:setVisible(true)  
            v:update(dataList[realIndex])
            v:setTag(realIndex)
        else
            v:setVisible(false)  
        end
    end

end

function GuildAllRedPacketItemCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("GuildAllRedPacketItemCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos-1)
end

function GuildAllRedPacketItemCell:getItemNodeByIndex(index)
   return self._itemNodeList[index]
end

return GuildAllRedPacketItemCell