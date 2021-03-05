-- Author: hedili
-- Date:2017-10-14 12:53:54
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HandBookOtherView = class("HandBookOtherView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HandBookViewCell = import(".HandBookViewCell")
local HandBookHelper = require("app.scene.view.handbook.HandBookHelper")

local START_COLOR = 6
local START_COLOR_SILKBAG = 7

function HandBookOtherView:ctor(owner, tabIndex, forceShowFunctionId)
	--csb bind var name
	self._listViewTab = nil --ScrollView
	self._commonFullScreen = nil --CommonFullScreen

	self._forceShowFunctionId = forceShowFunctionId
	self._itemInfos = {}
	self._itemOwnerCount = {}
	self._tabIndex = tabIndex
	local tabType = HandBookHelper.getHandBookTypeByIndex(self._tabIndex, self._forceShowFunctionId)
	self._title = title or Lang.get("handbook_tab" .. tabType)

	local resource = {
		file = Path.getCSB("HandBookOtherView", "handbook")
	}
	HandBookOtherView.super.ctor(self, resource)
end

-- Describle：
function HandBookOtherView:onCreate()
	self._commonFullScreen:setTitle(self._title)
end

-- Describle：
function HandBookOtherView:onEnter()
	self:_updateUI(self._tabIndex)
end

-- Describle：
function HandBookOtherView:onExit()
end

function HandBookOtherView:_updateUI(tabIndex)
	self:_updateListView()
end

function HandBookOtherView:_updateListView()
	local tabType = HandBookHelper.getHandBookTypeByIndex(self._tabIndex, self._forceShowFunctionId)
	local infos, counts = G_UserData:getHandBook():getInfosByType(tabType)
	self._itemInfos = infos
	self._itemOwnerCount = counts
	self._listViewTab:clearAll()

	local itemType = HandBookHelper.TAB_TYPE_TO_ITEM_TYPE[tabType]
	local begin = HandBookHelper.COLOR_GO_TO[tabType].begin
	local ended = HandBookHelper.COLOR_GO_TO[tabType].ended
	for color = begin, ended, -1 do
		local itemArray = self._itemInfos[color]
		local itemOwnerCount = self._itemOwnerCount[color]
		if itemArray and type(itemArray) == "table" then
			local cell = HandBookViewCell.new()
			cell:updateUI(itemType, color, itemArray, itemOwnerCount)
			self._listViewTab:pushBackCustomItem(cell)
		end
	end
	self._listViewTab:jumpToTop()

	self:_updateAllProcess()
end

function HandBookOtherView:_updateAllProcess()
	local totalTable = self._itemOwnerCount

	if totalTable.ownNum == totalTable.totalNum then
		self._textCountryNum1:setColor(Colors.DARK_BG_THREE)
		self._textCountryNum2:setColor(Colors.DARK_BG_THREE)
	else
		self._textCountryNum1:setColor(Colors.DARK_BG_RED)
		self._textCountryNum2:setColor(Colors.DARK_BG_THREE)
	end

	self._textCountryNum1:setString(totalTable.ownNum)

	local num2Pos = self._textCountryNum1:getPositionX() + self._textCountryNum1:getContentSize().width
	self._textCountryNum2:setString("/" .. totalTable.totalNum)
	self._textCountryNum2:setPositionX(num2Pos + 2)
	local tabType = HandBookHelper.getHandBookTypeByIndex(self._tabIndex, self._forceShowFunctionId)
	self._textCountryProcess:setString(Lang.get("handbook_process_tab" .. tabType))
end
return HandBookOtherView
