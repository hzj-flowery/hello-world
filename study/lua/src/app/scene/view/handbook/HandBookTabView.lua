-- Author: hedili
-- Date:2017-10-14 12:53:45
-- Describle：有顶部tab的图鉴view

local ViewBase = require("app.ui.ViewBase")
local HandBookTabView = class("HandBookTabView", ViewBase)
local HandBookViewCell = import(".HandBookViewCell")
local HandBookHelper = import(".HandBookHelper")

local START_COLOR = 6

function HandBookTabView:ctor(owner, index, forceShowFunctionId)
	--csb bind var name
	self._listViewTab = nil --ScrollView
	self._commonFullScreen = nil --CommonFullScreen
	self._tabGroup2 = nil --CommonTabGroup
	self._callback = callback

	self._tabIndex = index or 1
	self._forceShowFunctionId = forceShowFunctionId
	local tabType = HandBookHelper.getHandBookTypeByIndex(self._tabIndex, self._forceShowFunctionId)
	self._title = title or Lang.get("handbook_tab" .. tabType)

	self._selectTabIndex = 0
	local resource = {
		file = Path.getCSB("HandBookTabView", "handbook")
	}
	HandBookTabView.super.ctor(self, resource)
end

-- Describle：
function HandBookTabView:onCreate()
	--self._commonFullScreen:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonFullScreen:setTitle(self._title)
	local tabType = HandBookHelper.getHandBookTypeByIndex(self._tabIndex, self._forceShowFunctionId)
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		textList = HandBookHelper.getHandBookTabViewTabs(tabType)
	}
	self._nodeTabRoot:recreateTabs(param)
	self._nodeTabRoot:setTabIndex(1)
end

--
function HandBookTabView:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index

	self:_updateListView(index)
end

function HandBookTabView:_updateListView(index)
	local tabType = HandBookHelper.getHandBookTypeByIndex(self._tabIndex, self._forceShowFunctionId)
	local infos, counts = G_UserData:getHandBook():getInfosByType(tabType)
	self._infos = infos
	self._ownerCount = counts

	if self._infos[index] == nil then
		return
	end
	self._listViewTab:clearAll()
	self:_updateSelectTab(index)
	local begin = HandBookHelper.COLOR_GO_TO[tabType].begin
	local ended = HandBookHelper.COLOR_GO_TO[tabType].ended
	for color = begin, ended, -1 do
		local array = self._infos[index][color]
		local ownerCount = self._ownerCount[index][color]
		if array and type(array) == "table" then
			local cell = HandBookViewCell.new()
			cell:updateUI(HandBookHelper.TAB_TYPE_TO_ITEM_TYPE[tabType], color, array, ownerCount)
			self._listViewTab:pushBackCustomItem(cell)
		end
	end
	self._listViewTab:jumpToTop()
end

function HandBookTabView:_updateSelectTab(index)
	local country = self._ownerCount[index]
	country.totalNum = country.totalNum or 0
	if country and country.ownNum and country.totalNum then
	--	local percent = math.floor(country.ownNum / country.totalNum * 100)
	--self._loadingBarExp:setPercent(percent)
	end

	if country.ownNum == country.totalNum then
		self._textCountryNum1:setColor(Colors.BRIGHT_BG_ONE)
		self._textCountryNum2:setColor(Colors.BRIGHT_BG_ONE)
	else
		self._textCountryNum1:setColor(Colors.DARK_BG_RED)
		self._textCountryNum2:setColor(Colors.BRIGHT_BG_ONE)
	end

	self._textCountryNum1:setString(country.ownNum)

	local num2Pos = self._textCountryNum1:getPositionX() + self._textCountryNum1:getContentSize().width
	self._textCountryNum2:setString("/" .. country.totalNum)
	self._textCountryNum2:setPositionX(num2Pos + 2)
	local tabType = HandBookHelper.getHandBookTypeByIndex(self._tabIndex, self._forceShowFunctionId)
	self._textCountryProcess:setString(Lang.get(HandBookHelper.TITLE_PREFIX[tabType] .. index))
end

function HandBookTabView:onEnter()
end

function HandBookTabView:onExit()
end

return HandBookTabView
