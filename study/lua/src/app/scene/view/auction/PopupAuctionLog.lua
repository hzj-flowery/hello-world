
-- Author: hedili
-- Date:2017-10-11 20:47:41
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupAuctionLog = class("PopupAuctionLog", PopupBase)
local PopupAuctionLogCell = import(".PopupAuctionLogCell")

function PopupAuctionLog:ctor(title)

	--csb bind var name
	self._commonBk = nil  --CommonNormalSmallPop
	self._panelBase = nil  --Panel
	self._listView = nil  --ListView
	self._titleBG = nil  --ImageView

	self._title = title or Lang.get("auction_log_title1")
	local resource = {
		file = Path.getCSB("PopupAuctionLog", "auction"),
	}
	PopupAuctionLog.super.ctor(self, resource)
end


-- Describle：
function PopupAuctionLog:onCreate()
	self:_initListView()
	self._commonBk:setTitle(self._title)
	self._commonBk:addCloseEventListener(handler(self, self.onBtnCancel))
end

function PopupAuctionLog:updateUI(dataList)
	self._dataList = dataList
	if dataList and #dataList > 0 then
		self._listView:resize(#self._dataList)
		self._imageNoTimes:setVisible(false)
	else
		self._imageNoTimes:setVisible(true)
	end


end

-- Describle：
function PopupAuctionLog:onEnter()

end

-- Describle：
function PopupAuctionLog:onExit()

end

function PopupAuctionLog:onBtnCancel()
	self:close()
end


function PopupAuctionLog:_initListView()
	-- body
	self._listView:setTemplate(PopupAuctionLogCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))

	-- self._listView:resize()
end

-- Describle：
function PopupAuctionLog:_onListViewItemUpdate(item, index)
	local data = self._dataList[index+1]

	if data then
		item:updateUI(index,data)
	end
end

-- Describle：
function PopupAuctionLog:_onListViewItemSelected(item, index)

end

-- Describle：
function PopupAuctionLog:_onListViewItemTouch(item, index)

end

return PopupAuctionLog
