
--红包雨排行榜
local ViewBase = require("app.ui.ViewBase")
local RedPacketRainRankNode = class("RedPacketRainRankNode", ViewBase)
local RedPacketRainRankCell = require("app.scene.view.redPacketRain.RedPacketRainRankCell")

function RedPacketRainRankNode:ctor(callback)
	self._callback = callback
	local resource = {
		file = Path.getCSB("RedPacketRainRankNode", "redPacketRain"),
		binding = {
			
		}
	}
	RedPacketRainRankNode.super.ctor(self, resource)
end

function RedPacketRainRankNode:onCreate()
	self._listInfo = {}
	self._nodeBg:addCloseEventListener(handler(self, self._onCloseClick))
    self._nodeBg:setTitle(Lang.get("red_packet_rain_rank_title"))
    self._listView:setTemplate(RedPacketRainRankCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._myCell = RedPacketRainRankCell.new()
	self._nodeMyInfo:addChild(self._myCell)
	self._nodeBg:setVisible(false)
end

function RedPacketRainRankNode:onEnter()
    
end

function RedPacketRainRankNode:onExit()
    
end

function RedPacketRainRankNode:updateUI(listInfo, myInfo)
	self._nodeBg:setVisible(true)
	self._listInfo = listInfo
	self._listView:clearAll()
	self._listView:resize(#self._listInfo)
	self:_updateMyInfo(myInfo)
end

function RedPacketRainRankNode:_updateList()
    
end

function RedPacketRainRankNode:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._listInfo[index]
	if data then
		item:update(data, index)
	end
end

function RedPacketRainRankNode:_onItemSelected(item, index)
	
end

function RedPacketRainRankNode:_onItemTouch(index, t)
    
end

function RedPacketRainRankNode:_updateMyInfo(myInfo)
	local rank = 0
	local myUserId = G_UserData:getBase():getId()
	for i, info in ipairs(self._listInfo) do
		if info:getUser_id() == myUserId then
			rank = i
			break
		end
	end
    self._myCell:update(myInfo, rank, true)
end

function RedPacketRainRankNode:_onCloseClick()
	if self._callback then
		self._callback()
	end
end

function RedPacketRainRankNode:setBlackBgVisible(visible)
	self._panelBg:setVisible(visible)
end

return RedPacketRainRankNode