-- Author: hedili
-- Date:2017-10-14 12:53:58
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local HandBookView = class("HandBookView", ViewBase)
local HandBookTabView = import(".HandBookTabView")
local HandBookOtherView = import(".HandBookOtherView")
local HandBookHelper = require("app.scene.view.handbook.HandBookHelper")

HandBookView.SUB_VIEWS = {
	[HandBookHelper.SUB_TAB_VIEW] = HandBookTabView,
	[HandBookHelper.SUB_OTHER_VIEW] = HandBookOtherView
}

function HandBookView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	G_UserData:getHandBook():c2sGetResPhoto()
	local signal = G_SignalManager:add(SignalConst.EVENT_GET_RES_PHOTO_SUCCESS, onMsgCallBack)
	return signal
end

function HandBookView:ctor(forceShowFunctionId, selectedTab)
	--csb bind var name
	self._tabGroup1 = nil --CommonTabGroupScrollVertical
	self._panelRight = nil --Panel
	self._topbarBase = nil --CommonTopbarBase

	--
	self._forceShowFunctionId = forceShowFunctionId
	self._selectedTab = selectedTab or HandBookHelper.TBA_HERO
	self._handbookView = {}
	local resource = {
		file = Path.getCSB("HandBookView", "handbook"),
		size = G_ResolutionManager:getDesignSize()
	}
	HandBookView.super.ctor(self, resource)
end

-- Describle：
function HandBookView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_tujian")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_HANDBOOK)

	local tabNameList, funcList = HandBookHelper.getHandBookTabList(self._forceShowFunctionId)

	local param = {
		containerStyle = 2,
		callback = handler(self, self._onTabSelect1),
		textList = tabNameList
	}

	local index = 0
	for i, tabIndex in ipairs(funcList) do
		if self._selectedTab == tabIndex then
			index = i
		end
	end

	self._tabGroup1:recreateTabs(param)
	self._tabGroup1:setTabIndex(index)
end

function HandBookView:_onTabSelect1(index, sender)
	if self._selectTabIndex == index then
		return
	end
	for i, view in pairs(self._handbookView) do
		view:setVisible(false)
	end

	self._selectTabIndex = index

	local chooseView = self:getView(index)
	chooseView:setVisible(true)
end

function HandBookView:getView(index)
	local tabType = HandBookHelper.getHandBookTypeByIndex(index, self._forceShowFunctionId)
	local handbookView = self._handbookView[index]
	if handbookView == nil then
		local viewIndex = HandBookHelper.SUB_VIEW_MAPS[tabType]
		handbookView = HandBookView.SUB_VIEWS[viewIndex].new(self, index, self._forceShowFunctionId)
		self._panelRight:addChild(handbookView)
		self._handbookView[index] = handbookView
	end
	return handbookView
end

-- Describle：
function HandBookView:onEnter()
end

-- Describle：
function HandBookView:onExit()
end

return HandBookView
